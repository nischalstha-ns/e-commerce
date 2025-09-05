// React hook for advanced image optimization

import { useState, useCallback } from 'react';
import { validateImageFile, getImageDimensions } from '@/lib/utils/imageUtils';
import { processImageFile } from '@/lib/utils/advancedImageProcessor';
import { uploadToCloudinary } from '@/lib/utils/cloudinary';
import toast from 'react-hot-toast';

export const useImageOptimization = (options = {}) => {
    const {
        autoUpload = false,
        cloudinaryOptions = {},
        variants = [
            { name: 'thumbnail', width: 150, height: 150, quality: 0.95 },
            { name: 'small', width: 400, height: 400, quality: 0.9 },
            { name: 'medium', width: 800, height: 800, quality: 0.85 },
            { name: 'large', width: 1200, height: 1200, quality: 0.8 }
        ],
        onProgress = () => {},
        onComplete = () => {},
        onError = () => {}
    } = options;

    const [isProcessing, setIsProcessing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    const processImage = useCallback(async (file) => {
        if (!file) {
            const error = new Error('No file provided');
            setError(error);
            onError(error);
            return null;
        }

        setIsProcessing(true);
        setError(null);
        setProgress(0);

        try {
            // Step 1: Validate file (10%)
            const validation = validateImageFile(file);
            if (!validation.isValid) {
                throw new Error(validation.errors[0]);
            }
            setProgress(10);
            onProgress(10, 'Validating image...');

            // Step 2: Get image dimensions (20%)
            const dimensions = await getImageDimensions(file);
            setProgress(20);
            onProgress(20, 'Analyzing image...');

            // Step 3: Process image variants (30-80%)
            const processed = await processImageFile(file, {
                variants,
                outputFormat: 'webp',
                maintainAspectRatio: true
            });
            setProgress(80);
            onProgress(80, 'Creating optimized variants...');

            const result = {
                original: {
                    file,
                    size: file.size,
                    dimensions
                },
                processed,
                metadata: {
                    originalFormat: file.type,
                    originalSize: file.size,
                    totalOptimizedSize: Object.values(processed.variants).reduce((sum, variant) => sum + variant.size, 0),
                    compressionRatio: 0,
                    variantCount: Object.keys(processed.variants).length
                }
            };

            // Calculate overall compression ratio
            result.metadata.compressionRatio = (
                (result.metadata.originalSize - result.metadata.totalOptimizedSize) / 
                result.metadata.originalSize * 100
            ).toFixed(1);

            setProgress(90);
            onProgress(90, 'Finalizing...');

            // Step 4: Auto-upload if enabled
            if (autoUpload) {
                setIsUploading(true);
                const uploadResults = await uploadVariants(processed.variants, cloudinaryOptions);
                result.uploadResults = uploadResults;
            }

            setProgress(100);
            setResults(result);
            onProgress(100, 'Complete!');
            onComplete(result);

            return result;

        } catch (err) {
            console.error('Image processing error:', err);
            setError(err);
            onError(err);
            toast.error(err.message || 'Failed to process image');
            return null;
        } finally {
            setIsProcessing(false);
            setIsUploading(false);
        }
    }, [variants, autoUpload, cloudinaryOptions, onProgress, onComplete, onError]);

    const uploadVariants = useCallback(async (variants, uploadOptions = {}) => {
        const uploadResults = {};
        const variantNames = Object.keys(variants);
        
        for (let i = 0; i < variantNames.length; i++) {
            const variantName = variantNames[i];
            const variant = variants[variantName];
            
            try {
                const uploadResult = await uploadToCloudinary(variant.file, {
                    ...uploadOptions,
                    folder: `${uploadOptions.folder || 'uploads'}/${variantName}`
                });
                
                uploadResults[variantName] = {
                    ...uploadResult,
                    originalSize: variant.size,
                    dimensions: variant.dimensions
                };
                
                // Update progress
                const uploadProgress = ((i + 1) / variantNames.length) * 20; // 20% of total for upload
                setProgress(80 + uploadProgress);
                onProgress(80 + uploadProgress, `Uploading ${variantName}...`);
                
            } catch (error) {
                console.error(`Failed to upload ${variantName}:`, error);
                uploadResults[variantName] = { error: error.message };
            }
        }
        
        return uploadResults;
    }, [onProgress]);

    const reset = useCallback(() => {
        setIsProcessing(false);
        setIsUploading(false);
        setProgress(0);
        setResults(null);
        setError(null);
    }, []);

    const getOptimizationStats = useCallback(() => {
        if (!results) return null;

        const { metadata } = results;
        return {
            originalSize: `${(metadata.originalSize / 1024 / 1024).toFixed(2)}MB`,
            optimizedSize: `${(metadata.totalOptimizedSize / 1024 / 1024).toFixed(2)}MB`,
            compressionRatio: `${metadata.compressionRatio}%`,
            spaceSaved: `${((metadata.originalSize - metadata.totalOptimizedSize) / 1024 / 1024).toFixed(2)}MB`,
            variantCount: metadata.variantCount
        };
    }, [results]);

    return {
        // State
        isProcessing,
        isUploading,
        progress,
        results,
        error,
        
        // Actions
        processImage,
        uploadVariants,
        reset,
        
        // Utilities
        getOptimizationStats,
        
        // Computed
        isComplete: progress === 100 && !isProcessing,
        hasError: !!error,
        hasResults: !!results
    };
};

// Specialized hooks for different use cases
export const useProfileImageOptimization = (options = {}) => {
    return useImageOptimization({
        ...options,
        variants: [
            { name: 'thumbnail', width: 150, height: 150, quality: 0.95 },
            { name: 'profile', width: 400, height: 400, quality: 0.9 },
            { name: 'highres', width: 800, height: 800, quality: 0.85 }
        ]
    });
};

export const useProductImageOptimization = (options = {}) => {
    return useImageOptimization({
        ...options,
        variants: [
            { name: 'thumbnail', width: 200, height: 200, quality: 0.9 },
            { name: 'small', width: 400, height: 400, quality: 0.85 },
            { name: 'medium', width: 800, height: 800, quality: 0.8 },
            { name: 'large', width: 1200, height: 1200, quality: 0.75 }
        ]
    });
};

export const useCategoryImageOptimization = (options = {}) => {
    return useImageOptimization({
        ...options,
        variants: [
            { name: 'thumbnail', width: 300, height: 200, quality: 0.9 },
            { name: 'card', width: 600, height: 400, quality: 0.85 },
            { name: 'hero', width: 1200, height: 800, quality: 0.8 }
        ]
    });
};