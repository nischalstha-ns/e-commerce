// Cloudinary upload utilities

export const uploadToCloudinary = async (file, options = {}) => {
    const {
        folder = 'uploads',
        transformation = 'c_fill,w_400,h_400,q_auto,f_auto',
        timeout = 15000
    } = options;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);
    
    if (transformation) {
        formData.append('transformation', transformation);
    }

    const uploadPromise = fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
            method: 'POST',
            body: formData
        }
    );

    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Upload timeout')), timeout)
    );

    const response = await Promise.race([uploadPromise, timeoutPromise]);

    if (!response.ok) {
        throw new Error('Upload failed');
    }

    const data = await response.json();
    return {
        url: data.secure_url,
        publicId: data.public_id,
        width: data.width,
        height: data.height,
        format: data.format
    };
};

export const uploadProfilePhoto = async (file, uid) => {
    return uploadToCloudinary(file, {
        folder: `users/${uid}`,
        transformation: 'c_fill,w_400,h_400,q_auto,f_auto,r_max'
    });
};