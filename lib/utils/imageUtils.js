// Advanced image optimization with multiple size variants

export const createImageVariants = async (file, variants = []) => {
    const defaultVariants = [
        { name: 'thumbnail', width: 150, height: 150, quality: 0.9 },
        { name: 'small', width: 400, height: 400, quality: 0.9 },
        { name: 'medium', width: 800, height: 800, quality: 0.85 },
        { name: 'large', width: 1200, height: 1200, quality: 0.8 }
    ];
    
    const targetVariants = variants.length > 0 ? variants : defaultVariants;
    const results = {};
    
    for (const variant of targetVariants) {
        try {
            const optimizedFile = await optimizeImage(file, variant);
            results[variant.name] = optimizedFile;
        } catch (error) {
            console.warn(`Failed to create ${variant.name} variant:`, error);
        }
    }
    
    return results;
};

export const optimizeImage = (file, options = {}) => {
    const {
        width = 400,
        height = 400,
        quality = 0.9,
        format = 'webp',
        maintainAspectRatio = true
    } = options;
    
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            let { width: imgWidth, height: imgHeight } = img;
            let targetWidth = width;
            let targetHeight = height;
            
            if (maintainAspectRatio) {
                const aspectRatio = imgWidth / imgHeight;
                
                if (aspectRatio > 1) {
                    // Landscape
                    targetHeight = width / aspectRatio;
                    if (targetHeight > height) {
                        targetHeight = height;
                        targetWidth = height * aspectRatio;
                    }
                } else {
                    // Portrait or square
                    targetWidth = height * aspectRatio;
                    if (targetWidth > width) {
                        targetWidth = width;
                        targetHeight = width / aspectRatio;
                    }
                }
            }
            
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            
            // Enable image smoothing for better quality
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // Draw image with high quality scaling
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
            
            // Convert to blob with specified format and quality
            const mimeType = format === 'webp' ? 'image/webp' : 
                           format === 'png' ? 'image/png' : 'image/jpeg';
            
            canvas.toBlob((blob) => {
                if (blob) {
                    // Create a new File object with original name
                    const optimizedFile = new File([blob], file.name, {
                        type: mimeType,
                        lastModified: Date.now()
                    });
                    resolve(optimizedFile);
                } else {
                    reject(new Error('Failed to optimize image'));
                }
            }, mimeType, quality);
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
};

// Legacy function for backward compatibility
export const compressImage = (file, maxWidth = 400, maxHeight = 400, quality = 0.8) => {
    return optimizeImage(file, {
        width: maxWidth,
        height: maxHeight,
        quality,
        format: 'jpeg'
    });
};

export const validateImageFile = (file) => {
    const errors = [];
    
    // Check file type
    if (!file.type.startsWith('image/')) {
        errors.push('Please select an image file');
    }
    
    // Check file size (50MB max for any format)
    if (file.size > 50 * 1024 * 1024) {
        errors.push('Image size should be less than 50MB');
    }
    
    // Support all common image formats
    const supportedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
        'image/webp', 'image/bmp', 'image/tiff', 'image/svg+xml',
        'image/heic', 'image/heif', 'image/avif'
    ];
    
    if (file.type && !supportedTypes.includes(file.type)) {
        // Still allow if browser doesn't detect type correctly
        const extension = file.name.split('.').pop()?.toLowerCase();
        const supportedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'svg', 'heic', 'heif', 'avif'];
        
        if (!supportedExtensions.includes(extension)) {
            errors.push('Supported formats: JPG, PNG, GIF, WebP, BMP, TIFF, SVG, HEIC, HEIF, AVIF');
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

export const getImageDimensions = (file) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({
                width: img.naturalWidth,
                height: img.naturalHeight,
                aspectRatio: img.naturalWidth / img.naturalHeight
            });
        };
        img.onerror = () => reject(new Error('Failed to get image dimensions'));
        img.src = URL.createObjectURL(file);
    });
};

export const calculateOptimalSize = (originalWidth, originalHeight, maxWidth = 400, maxHeight = 400) => {
    const aspectRatio = originalWidth / originalHeight;
    
    let targetWidth = maxWidth;
    let targetHeight = maxHeight;
    
    if (aspectRatio > 1) {
        // Landscape
        targetHeight = maxWidth / aspectRatio;
        if (targetHeight > maxHeight) {
            targetHeight = maxHeight;
            targetWidth = maxHeight * aspectRatio;
        }
    } else {
        // Portrait or square
        targetWidth = maxHeight * aspectRatio;
        if (targetWidth > maxWidth) {
            targetWidth = maxWidth;
            targetHeight = maxWidth / aspectRatio;
        }
    }
    
    return {
        width: Math.round(targetWidth),
        height: Math.round(targetHeight),
        aspectRatio
    };
};

export const createImagePreview = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Failed to create preview'));
        reader.readAsDataURL(file);
    });
};

export const convertToWebP = (file, quality = 0.9) => {
    return optimizeImage(file, {
        format: 'webp',
        quality,
        maintainAspectRatio: true
    });
};

export const createResponsiveImages = async (file) => {
    const variants = [
        { name: 'thumbnail', width: 150, height: 150, quality: 0.95 },
        { name: 'small', width: 400, height: 400, quality: 0.9 },
        { name: 'medium', width: 800, height: 800, quality: 0.85 },
        { name: 'large', width: 1200, height: 1200, quality: 0.8 }
    ];
    
    return createImageVariants(file, variants);
};