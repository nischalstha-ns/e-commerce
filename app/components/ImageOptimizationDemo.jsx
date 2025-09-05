"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, Button, Progress, Chip, Divider } from "@heroui/react";
import { Upload, Image as ImageIcon, Zap, TrendingDown, Layers, CheckCircle, FileImage } from "lucide-react";
import { useImageOptimization } from "@/lib/hooks/useImageOptimization";

export default function ImageOptimizationDemo() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const {
        isProcessing,
        progress,
        results,
        error,
        processImage,
        getOptimizationStats,
        reset,
        hasResults
    } = useImageOptimization({
        variants: [
            { name: 'thumbnail', width: 150, height: 150, quality: 0.95 },
            { name: 'small', width: 400, height: 400, quality: 0.9 },
            { name: 'medium', width: 800, height: 800, quality: 0.85 },
            { name: 'large', width: 1200, height: 1200, quality: 0.8 }
        ],
        onComplete: (results) => {
            console.log('Demo optimization complete:', results);
        }
    });

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => setPreviewUrl(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleOptimize = async () => {
        if (selectedFile) {
            await processImage(selectedFile);
        }
    };

    const handleReset = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        reset();
    };

    const stats = getOptimizationStats();

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">Advanced Image Optimization Demo</h1>
                <p className="text-gray-600">
                    Upload any image format and size - see how our system optimizes it automatically
                </p>
            </div>

            {/* Upload Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Upload className="w-5 h-5" />
                        <h2 className="text-lg font-semibold">Upload Image</h2>
                    </div>
                </CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                                id="demo-file-input"
                            />
                            <label htmlFor="demo-file-input" className="cursor-pointer">
                                <div className="space-y-2">
                                    <ImageIcon className="w-12 h-12 mx-auto text-gray-400" />
                                    <p className="text-lg font-medium">Choose an image file</p>
                                    <p className="text-sm text-gray-500">
                                        Any format • Any size • Up to 50MB
                                    </p>
                                </div>
                            </label>
                        </div>

                        {selectedFile && (
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <FileImage className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <p className="font-medium">{selectedFile.name}</p>
                                        <p className="text-sm text-gray-600">
                                            {(selectedFile.size / 1024 / 1024).toFixed(2)}MB • {selectedFile.type}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        color="primary"
                                        onClick={handleOptimize}
                                        isDisabled={isProcessing}
                                        startContent={<Zap size={16} />}
                                    >
                                        Optimize
                                    </Button>
                                    <Button
                                        variant="light"
                                        onClick={handleReset}
                                        isDisabled={isProcessing}
                                    >
                                        Reset
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </CardBody>
            </Card>

            {/* Preview Section */}
            {previewUrl && (
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold">Original Image</h2>
                    </CardHeader>
                    <CardBody>
                        <div className="flex justify-center">
                            <img
                                src={previewUrl}
                                alt="Original"
                                className="max-w-md max-h-64 object-contain rounded-lg border"
                            />
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Processing Status */}
            {isProcessing && (
                <Card className="border-blue-200 bg-blue-50">
                    <CardBody className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <div className="flex-1">
                                    <p className="font-medium text-blue-800">Processing Image...</p>
                                    <p className="text-sm text-blue-600">Creating optimized variants</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-blue-800">{progress}%</p>
                                </div>
                            </div>
                            
                            <Progress value={progress} color="primary" className="w-full" />
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div className="flex items-center gap-2 text-blue-700">
                                    <CheckCircle className="w-3 h-3" />
                                    <span>Format Detection</span>
                                </div>
                                <div className="flex items-center gap-2 text-blue-700">
                                    <CheckCircle className="w-3 h-3" />
                                    <span>WebP Conversion</span>
                                </div>
                                <div className="flex items-center gap-2 text-blue-700">
                                    <Layers className="w-3 h-3" />
                                    <span>Multi-Size Variants</span>
                                </div>
                                <div className="flex items-center gap-2 text-blue-700">
                                    <TrendingDown className="w-3 h-3" />
                                    <span>Smart Compression</span>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Results Section */}
            {hasResults && stats && (
                <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <h2 className="text-lg font-semibold text-green-800">Optimization Complete!</h2>
                        </div>
                    </CardHeader>
                    <CardBody className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-1">Original Size</p>
                                <Chip color="default" variant="flat">{stats.originalSize}</Chip>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-1">Optimized Size</p>
                                <Chip color="success" variant="flat">{stats.optimizedSize}</Chip>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-1">Space Saved</p>
                                <Chip color="warning" variant="flat">{stats.spaceSaved}</Chip>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-1">Compression</p>
                                <Chip color="primary" variant="flat">{stats.compressionRatio}</Chip>
                            </div>
                        </div>

                        <Divider />

                        {/* Variants Preview */}
                        <div>
                            <h3 className="text-md font-semibold mb-4">Generated Variants</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {results && Object.entries(results.processed.variants).map(([name, variant]) => (
                                    <div key={name} className="text-center space-y-2">
                                        <div className="aspect-square bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                                            <img
                                                src={URL.createObjectURL(variant.file)}
                                                alt={`${name} variant`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium capitalize">{name}</p>
                                            <p className="text-xs text-gray-600">
                                                {variant.dimensions.width}×{variant.dimensions.height}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {(variant.size / 1024).toFixed(1)}KB
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Error Display */}
            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardBody>
                        <div className="flex items-center gap-2 text-red-700">
                            <div className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center">
                                <span className="text-xs">!</span>
                            </div>
                            <p className="font-medium">Error: {error.message}</p>
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Features Info */}
            <Card>
                <CardHeader>
                    <h2 className="text-lg font-semibold">Optimization Features</h2>
                </CardHeader>
                <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h3 className="font-medium text-gray-800">Format Support</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>JPEG, PNG, WebP, GIF</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>BMP, TIFF, SVG</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>HEIC, HEIF, AVIF</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <h3 className="font-medium text-gray-800">Optimization Features</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-blue-500" />
                                    <span>Smart compression algorithms</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-purple-500" />
                                    <span>Multiple size variants</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <TrendingDown className="w-4 h-4 text-orange-500" />
                                    <span>Automatic format conversion</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}