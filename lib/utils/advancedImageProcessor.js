// Advanced image processing utilities for any format/size optimization

export class ImageProcessor {
    constructor() {
        this.canvas = null;
        this.ctx = null;
    }

    // Initialize canvas and context
    initCanvas() {
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            
            // Enable high-quality image smoothing
            this.ctx.imageSmoothingEnabled = true;
            this.ctx.imageSmoothingQuality = 'high';
        }
        return { canvas: this.canvas, ctx: this.ctx };
    }

    // Process any image format to optimized variants
    async processImage(file, options = {}) {
        const {
            variants = [
                { name: 'thumbnail', width: 150, height: 150, quality: 0.95 },
                { name: 'small', width: 400, height: 400, quality: 0.9 },
                { name: 'medium', width: 800, height: 800, quality: 0.85 },
                { name: 'large', width: 1200, height: 1200, quality: 0.8 }
            ],
            outputFormat = 'webp',
            maintainAspectRatio = true,
            progressive = true
        } = options;

        try {
            // Load and analyze the image
            const imageData = await this.loadImage(file);
            const results = {};

            // Process each variant
            for (const variant of variants) {
                const processed = await this.createVariant(imageData, variant, {
                    outputFormat,
                    maintainAspectRatio,
                    progressive
                });
                results[variant.name] = processed;
            }

            return {
                success: true,
                variants: results,
                originalSize: file.size,
                originalDimensions: {
                    width: imageData.width,
                    height: imageData.height
                }
            };
        } catch (error) {
            console.error('Image processing error:', error);
            throw new Error(`Failed to process image: ${error.message}`);
        }
    }

    // Load image from file
    loadImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                resolve({
                    element: img,
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                    aspectRatio: img.naturalWidth / img.naturalHeight
                });
            };
            
            img.onerror = () => reject(new Error('Failed to load image'));
            
            // Handle different file types
            if (file.type.startsWith('image/svg')) {
                // For SVG, create a blob URL
                img.src = URL.createObjectURL(file);
            } else {
                // For other formats, use FileReader for better compatibility
                const reader = new FileReader();
                reader.onload = (e) => {
                    img.src = e.target.result;
                };
                reader.onerror = () => reject(new Error('Failed to read image file'));
                reader.readAsDataURL(file);
            }
        });
    }

    // Create a single variant
    async createVariant(imageData, variant, options = {}) {
        const {
            outputFormat = 'webp',
            maintainAspectRatio = true,
            progressive = true
        } = options;

        const { canvas, ctx } = this.initCanvas();
        const { element: img, width: originalWidth, height: originalHeight } = imageData;

        // Calculate target dimensions
        const dimensions = this.calculateDimensions(
            originalWidth,
            originalHeight,
            variant.width,
            variant.height,
            maintainAspectRatio
        );

        // Set canvas size
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;

        // Clear canvas
        ctx.clearRect(0, 0, dimensions.width, dimensions.height);

        // Apply advanced rendering settings
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw image with high-quality scaling
        ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);

        // Convert to blob with specified format and quality
        const blob = await this.canvasToBlob(canvas, outputFormat, variant.quality, progressive);
        
        return {
            file: new File([blob], `${variant.name}.${this.getFileExtension(outputFormat)}`, {
                type: blob.type,
                lastModified: Date.now()
            }),
            blob,
            dimensions,
            size: blob.size,
            compressionRatio: ((imageData.originalSize - blob.size) / imageData.originalSize * 100).toFixed(1)
        };
    }

    // Calculate optimal dimensions maintaining aspect ratio
    calculateDimensions(originalWidth, originalHeight, targetWidth, targetHeight, maintainAspectRatio = true) {
        if (!maintainAspectRatio) {
            return { width: targetWidth, height: targetHeight };
        }

        const aspectRatio = originalWidth / originalHeight;
        let width = targetWidth;
        let height = targetHeight;

        if (aspectRatio > 1) {
            // Landscape
            height = targetWidth / aspectRatio;
            if (height > targetHeight) {
                height = targetHeight;
                width = targetHeight * aspectRatio;
            }
        } else {
            // Portrait or square
            width = targetHeight * aspectRatio;
            if (width > targetWidth) {
                width = targetWidth;
                height = targetWidth / aspectRatio;
            }
        }

        return {
            width: Math.round(width),
            height: Math.round(height)
        };
    }

    // Convert canvas to blob with format-specific optimizations
    canvasToBlob(canvas, format, quality, progressive = true) {
        return new Promise((resolve, reject) => {
            const mimeType = this.getMimeType(format);
            
            // Apply format-specific optimizations
            if (format === 'jpeg' && progressive) {
                // For JPEG, we can't directly control progressive encoding in canvas
                // but we can ensure high quality
                quality = Math.max(quality, 0.8);
            }

            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error(`Failed to create ${format} blob`));
                }
            }, mimeType, quality);
        });
    }

    // Get MIME type for format
    getMimeType(format) {
        const mimeTypes = {
            'webp': 'image/webp',
            'jpeg': 'image/jpeg',
            'jpg': 'image/jpeg',
            'png': 'image/png',
            'avif': 'image/avif'
        };
        return mimeTypes[format.toLowerCase()] || 'image/webp';
    }

    // Get file extension for format
    getFileExtension(format) {
        const extensions = {
            'webp': 'webp',
            'jpeg': 'jpg',
            'jpg': 'jpg',
            'png': 'png',
            'avif': 'avif'
        };
        return extensions[format.toLowerCase()] || 'webp';
    }

    // Cleanup resources
    cleanup() {
        if (this.canvas) {
            this.canvas.width = 0;
            this.canvas.height = 0;
            this.canvas = null;
            this.ctx = null;
        }
    }
}

// Utility functions for easy use
export const processImageFile = async (file, options = {}) => {
    const processor = new ImageProcessor();
    try {
        const result = await processor.processImage(file, options);
        processor.cleanup();
        return result;
    } catch (error) {
        processor.cleanup();
        throw error;
    }
};

export const createProfileImageVariants = async (file) => {
    return processImageFile(file, {
        variants: [
            { name: 'thumbnail', width: 150, height: 150, quality: 0.95 },
            { name: 'profile', width: 400, height: 400, quality: 0.9 },
            { name: 'highres', width: 800, height: 800, quality: 0.85 }
        ],
        outputFormat: 'webp',
        maintainAspectRatio: true
    });
};

export const createProductImageVariants = async (file) => {
    return processImageFile(file, {
        variants: [
            { name: 'thumbnail', width: 200, height: 200, quality: 0.9 },
            { name: 'small', width: 400, height: 400, quality: 0.85 },
            { name: 'medium', width: 800, height: 800, quality: 0.8 },
            { name: 'large', width: 1200, height: 1200, quality: 0.75 }
        ],
        outputFormat: 'webp',
        maintainAspectRatio: true
    });
};

// Format detection and conversion utilities
export const detectImageFormat = (file) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type;
    
    const formats = {
        'jpg': 'jpeg',
        'jpeg': 'jpeg',
        'png': 'png',
        'webp': 'webp',
        'gif': 'gif',
        'bmp': 'bmp',
        'tiff': 'tiff',
        'tif': 'tiff',
        'svg': 'svg',
        'heic': 'heic',
        'heif': 'heif',
        'avif': 'avif'
    };
    
    return {
        extension,
        mimeType,
        detectedFormat: formats[extension] || 'unknown',
        isSupported: Object.keys(formats).includes(extension) || mimeType.startsWith('image/')
    };
};

export const getBestOutputFormat = (inputFormat, supportWebP = true, supportAVIF = false) => {
    // Prioritize modern formats for better compression
    if (supportAVIF) return 'avif';
    if (supportWebP) return 'webp';
    
    // Fallback based on input format
    if (['png', 'gif'].includes(inputFormat)) return 'png';
    return 'jpeg';
};