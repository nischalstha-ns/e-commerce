"use client";

import { useState } from "react";
import { Button, Avatar, CircularProgress } from "@heroui/react";
import { Camera, Upload, User, Image, Check, X } from "lucide-react";
import { updateUserPhoto } from "@/lib/firestore/users/write";
import toast from "react-hot-toast";

export default function ProfilePhotoUpload({ user, onPhotoUpdate }) {
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [dragActive, setDragActive] = useState(false);

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

    const processFile = (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error("Please select an image file");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size should be less than 5MB");
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewUrl(e.target.result);
        };
        reader.readAsDataURL(file);

        // Upload file
        handleUpload(file);
    };

    const handleUpload = async (file) => {
        setIsUploading(true);
        try {
            const result = await updateUserPhoto({
                uid: user.uid,
                photoFile: file
            });
            
            toast.success("Profile photo updated successfully!");
            if (onPhotoUpdate) {
                onPhotoUpdate(result.photoURL);
            }
            setPreviewUrl(null);
        } catch (error) {
            toast.error(error.message || "Failed to upload photo");
            setPreviewUrl(null);
        }
        setIsUploading(false);
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
                            {isUploading ? (
                                <div className="flex flex-col items-center">
                                    <CircularProgress size="sm" color="white" />
                                    <span className="text-xs mt-1">Uploading...</span>
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
                    isDisabled={isUploading}
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
                disabled={isUploading}
            />

            {/* Preview Actions */}
            {previewUrl && !isUploading && (
                <div className="mt-4 flex justify-center gap-2">
                    <Button
                        size="sm"
                        color="success"
                        variant="flat"
                        startContent={<Check size={14} />}
                        onClick={() => {
                            // The upload is already in progress
                            toast.info("Upload in progress...");
                        }}
                    >
                        Uploading
                    </Button>
                    <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        startContent={<X size={14} />}
                        onClick={cancelPreview}
                    >
                        Cancel
                    </Button>
                </div>
            )}

            {/* Upload Instructions */}
            <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                    <Image className="w-3 h-3 inline mr-1" />
                    Click or drag to upload
                </p>
                <p className="text-xs text-gray-400">
                    Max 5MB • JPG, PNG, GIF
                </p>
            </div>

            {/* Upload Status */}
            {isUploading && (
                <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-700">
                        <CircularProgress size="sm" color="primary" />
                        <span className="text-sm">Uploading your photo...</span>
                    </div>
                </div>
            )}
        </div>
    );
}