// Image utility functions for optimization

export const compressImage = (file, maxWidth = 400, maxHeight = 400, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            // Calculate new dimensions
            let { width, height } = img;
            
            if (width > height) {
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Draw and compress
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Failed to compress image'));
                }
            }, 'image/jpeg', quality);
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
};

export const validateImageFile = (file) => {
    const errors = [];
    
    // Check file type
    if (!file.type.startsWith('image/')) {
        errors.push('Please select an image file');
    }
    
    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
        errors.push('Image size should be less than 10MB');
    }
    
    // Check supported formats
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!supportedTypes.includes(file.type)) {
        errors.push('Supported formats: JPG, PNG, GIF, WebP');
    }
    
    return {
        isValid: errors.length === 0,
        errors
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