// Advanced Cloudinary upload utilities with auto-optimization

export const uploadMediaToCloudinary = async (file) => {
  if (!file) throw new Error('No file provided');
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'media-library');

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );

    if (!response.ok) throw new Error('Upload failed');
    
    const data = await response.json();
    return {
      id: data.public_id,
      url: data.secure_url,
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const uploadToCloudinary = async (file, options = {}) => {
    const {
        folder = 'uploads',
        transformation = null,
        timeout = 30000,
        eager = true,
        autoOptimize = true
    } = options;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);
    
    // Auto-optimization settings
    if (autoOptimize) {
        formData.append('quality', 'auto:good');
        formData.append('fetch_format', 'auto');
        formData.append('flags', 'progressive');
    }
    
    // Custom transformation or auto-responsive
    if (transformation) {
        formData.append('transformation', transformation);
    } else if (autoOptimize) {
        // Create responsive variants automatically
        formData.append('responsive_breakpoints', JSON.stringify({
            create_derived: true,
            bytes_step: 20000,
            min_width: 200,
            max_width: 1200,
            transformation: {
                quality: 'auto:good',
                fetch_format: 'auto'
            }
        }));
    }
    
    // Eager transformations for immediate availability
    if (eager) {
        const eagerTransforms = [
            'c_fill,w_150,h_150,q_auto:good,f_auto', // thumbnail
            'c_fill,w_400,h_400,q_auto:good,f_auto', // small
            'c_limit,w_800,h_800,q_auto:good,f_auto', // medium
            'c_limit,w_1200,h_1200,q_auto:best,f_auto' // large
        ];
        formData.append('eager', eagerTransforms.join('|'));
    }

    const uploadPromise = fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
            method: 'POST',
            body: formData
        }
    );

    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Upload timeout - please try again')), timeout)
    );

    const response = await Promise.race([uploadPromise, timeoutPromise]);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Upload failed with status ${response.status}`);
    }

    const data = await response.json();
    
    return {
        url: data.secure_url,
        publicId: data.public_id,
        width: data.width,
        height: data.height,
        format: data.format,
        bytes: data.bytes,
        eager: data.eager || [],
        responsive_breakpoints: data.responsive_breakpoints || []
    };
};

export const uploadProfilePhoto = async (file, uid) => {
    return uploadToCloudinary(file, {
        folder: `users/${uid}`,
        autoOptimize: true,
        eager: true,
        transformation: 'c_fill,w_400,h_400,q_auto:best,f_auto,r_max'
    });
};

export const uploadProductImage = async (file, productId) => {
    return uploadToCloudinary(file, {
        folder: `products/${productId}`,
        autoOptimize: true,
        eager: true
    });
};

export const uploadCategoryImage = async (file, categoryId) => {
    return uploadToCloudinary(file, {
        folder: `categories/${categoryId}`,
        autoOptimize: true,
        eager: true,
        transformation: 'c_fill,w_600,h_400,q_auto:good,f_auto'
    });
};

// Generate Cloudinary URLs with transformations
export const generateImageUrl = (publicId, transformation = '') => {
    const baseUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
    return transformation ? `${baseUrl}/${transformation}/${publicId}` : `${baseUrl}/${publicId}`;
};

// Get optimized image variants
export const getImageVariants = (publicId) => {
    const baseUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
    
    return {
        thumbnail: `${baseUrl}/c_fill,w_150,h_150,q_auto:good,f_auto/${publicId}`,
        small: `${baseUrl}/c_fill,w_400,h_400,q_auto:good,f_auto/${publicId}`,
        medium: `${baseUrl}/c_limit,w_800,h_800,q_auto:good,f_auto/${publicId}`,
        large: `${baseUrl}/c_limit,w_1200,h_1200,q_auto:best,f_auto/${publicId}`,
        original: `${baseUrl}/${publicId}`
    };
};