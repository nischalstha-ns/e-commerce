"use client";

import { useState, useEffect } from "react";
import { Button, Avatar, CircularProgress, Progress, Card, CardBody, Chip } from "@heroui/react";
import { Camera, Upload, User, Image, CheckCircle, FileImage, Zap, TrendingDown, Layers } from "lucide-react";
import { updateUserPhoto } from "@/lib/firestore/users/write";
import { useProfileImageOptimization } from "@/lib/hooks/useImageOptimization";
import { testCloudinaryConfig } from "@/lib/utils/testCloudinary";
import toast from "react-hot-toast";

export default function ProfilePhotoUpload({ user, onPhotoUpdate }) {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [optimizationStats, setOptimizationStats] = useState(null);
    
    const {
        isProcessing,
        isUploading,
        progress,
        results,
        error,
        processImage,
        getOptimizationStats,
        reset
    } = useProfileImageOptimization({
        onProgress: (progress, message) => {
            console.log(`Progress: ${progress}% - ${message}`);
        },
        onComplete: (results) => {
            console.log('Optimization complete:', results);
            setOptimizationStats(getOptimizationStats());
            // Upload the optimized profile variant
            handleCloudinaryUpload(results.processed.variants.profile.file);
        },
        onError: (error) => {
            console.error('Optimization error:', error);
            toast.error(error.message);
        }
    });
    
    useEffect(() => {
        // Test Cloudinary configuration on component mount
        testCloudinaryConfig();
    }, []);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            processFile(file);
        }
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setDragActive(false);
        
        const file = event.dataTransfer.files[0];
        if (file) {
            processFile(file);
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        setDragActive(false);
    };

    const processFile = async (file) => {
        try {
            // Reset previous state
            reset();
            setOptimizationStats(null);
            
            // Create preview immediately
            const reader = new FileReader();
            reader.onload = (e) => setPreviewUrl(e.target.result);
            reader.readAsDataURL(file);
            
            // Show file info
            toast.success(`Processing image: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
            
            // Start optimization process
            await processImage(file);
        } catch (error) {
            console.error('Error processing file:', error);
            toast.error('Failed to process image');
        }
    };

    const handleCloudinaryUpload = async (optimizedFile) => {
        const uploadToast = toast.loading('Uploading optimized image to Cloudinary...');
        
        try {
            const result = await updateUserPhoto({
                uid: user.uid,
                photoFile: optimizedFile
            });
            
            toast.dismiss(uploadToast);
            
            // Show comprehensive results
            if (optimizationStats) {
                toast.success(
                    `Photo updated! Saved ${optimizationStats.spaceSaved} (${optimizationStats.compressionRatio} compression)`,
                    { duration: 6000 }
                );
            } else {
                toast.success("Profile photo updated successfully!");
            }
            
            if (onPhotoUpdate) {
                onPhotoUpdate(result.photoURL);
            }
            
            // Clear preview after successful upload
            setTimeout(() => {
                setPreviewUrl(null);
                reset();
                setOptimizationStats(null);
            }, 2000);
            
        } catch (error) {
            console.error('Upload error:', error);
            toast.dismiss(uploadToast);
            toast.error(error.message || "Failed to upload photo");
        }
    };

    const cancelPreview = () => {
        setPreviewUrl(null);
    };

    return (
        <div className="relative">
            {/* Main Avatar Display */}
            <div className="relative group">
                <Avatar
                    src={previewUrl || user.photoURL}
                    name={user.displayName || user.email}
                    className="w-24 h-24 mx-auto"
                    fallback={<User size={32} />}
                />
                
                {/* Upload Overlay */}
                <div 
                    className={`absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${
                        dragActive ? 'opacity-100 bg-blue-600 bg-opacity-70' : ''
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    <label htmlFor="photo-upload" className="cursor-pointer">
                        <div className="text-white text-center">
                            {(isProcessing || isUploading) ? (
                                <div className="flex flex-col items-center">
                                    <CircularProgress size="sm" color="white" />
                                    <span className="text-xs mt-1">
                                        {isProcessing ? 'Optimizing...' : 'Uploading...'}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <Camera size={24} className="mx-auto mb-1" />
                                    <span className="text-xs">
                                        {dragActive ? "Drop here" : "Change Photo"}
                                    </span>
                                </div>
                            )}
                        </div>
                    </label>
                </div>

                {/* Upload Button */}
                <Button
                    size="sm"
                    variant="solid"
                    color="primary"
                    className="absolute -bottom-2 -right-2 min-w-0 w-8 h-8 p-0 rounded-full shadow-md"
                    onClick={() => document.getElementById('photo-upload').click()}
                    isDisabled={isProcessing || isUploading}
                    isIconOnly
                >
                    <Upload size={14} />
                </Button>
            </div>

            {/* Hidden File Input */}
            <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isProcessing || isUploading}
            />



            {/* Upload Instructions */}
            <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                    <Image className="w-3 h-3 inline mr-1" />
                    Click or drag to upload
                </p>
                <p className="text-xs text-gray-400">
                    Any format • Any size • Auto-optimized
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="flex items-center gap-1 text-xs text-green-600">
                        <Zap className="w-3 h-3" />
                        <span>Smart Compression</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                        <FileImage className="w-3 h-3" />
                        <span>Multi-Format Support</span>
                    </div>
                </div>
            </div>

            {/* Processing Status */}
            {(isProcessing || isUploading) && (
                <Card className="mt-3">
                    <CardBody className="p-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <CircularProgress size="sm" color="primary" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">
                                        {isProcessing ? 'Optimizing Image...' : 'Uploading to Cloudinary...'}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        {isProcessing ? 'Creating optimized variants' : 'Saving to cloud storage'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-medium text-blue-600">{progress}%</p>
                                </div>
                            </div>
                            
                            <Progress 
                                value={progress} 
                                color="primary" 
                                size="sm" 
                                className="w-full"
                            />
                            
                            {isProcessing && (
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                        <span>WebP conversion</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <CheckCircle className="w-3 h-3 text-green-500" />
                                        <span>Smart compression</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Layers className="w-3 h-3 text-blue-500" />
                                        <span>Multiple variants</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <TrendingDown className="w-3 h-3 text-orange-500" />
                                        <span>Size optimization</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardBody>
                </Card>
            )}
            
            {/* Optimization Results */}
            {optimizationStats && !isProcessing && !isUploading && (
                <Card className="mt-3 border border-green-200 bg-green-50">
                    <CardBody className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <p className="text-sm font-medium text-green-800">Optimization Complete!</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Original:</span>
                                <Chip size="sm" variant="flat">{optimizationStats.originalSize}</Chip>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Optimized:</span>
                                <Chip size="sm" variant="flat" color="success">{optimizationStats.optimizedSize}</Chip>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Saved:</span>
                                <Chip size="sm" variant="flat" color="warning">{optimizationStats.spaceSaved}</Chip>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Compression:</span>
                                <Chip size="sm" variant="flat" color="primary">{optimizationStats.compressionRatio}</Chip>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}
            
            {/* Supported Formats Info */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-700 mb-2">Supported Formats:</p>
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                    <div>• JPEG/JPG</div>
                    <div>• PNG</div>
                    <div>• WebP</div>
                    <div>• GIF</div>
                    <div>• BMP</div>
                    <div>• TIFF</div>
                    <div>• SVG</div>
                    <div>• HEIC/HEIF</div>
                    <div>• AVIF</div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Max size: 50MB • Auto-optimized to WebP/AVIF for best performance
                </p>
            </div>
        </div>
    );
}