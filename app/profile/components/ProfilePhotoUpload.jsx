"use client";

import { useState } from "react";
import { Button, Avatar } from "@heroui/react";
import { Camera, Upload, User } from "lucide-react";
import { updateUserPhoto } from "@/lib/firestore/users/write";
import toast from "react-hot-toast";

export default function ProfilePhotoUpload({ user, onPhotoUpdate }) {
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
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
        }
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

    return (
        <div className="relative group">
            <Avatar
                src={previewUrl || user.photoURL}
                name={user.displayName || user.email}
                className="w-24 h-24 mx-auto"
                fallback={<User size={32} />}
            />
            
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <label htmlFor="photo-upload" className="cursor-pointer">
                    <div className="text-white text-center">
                        {isUploading ? (
                            <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto"></div>
                        ) : (
                            <Camera size={24} className="mx-auto mb-1" />
                        )}
                        <span className="text-xs">
                            {isUploading ? "Uploading..." : "Change"}
                        </span>
                    </div>
                </label>
            </div>

            <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
            />

            <Button
                size="sm"
                variant="light"
                className="absolute -bottom-2 -right-2 min-w-0 w-8 h-8 p-0 rounded-full bg-white shadow-md"
                onClick={() => document.getElementById('photo-upload').click()}
                isDisabled={isUploading}
            >
                <Upload size={14} />
            </Button>
        </div>
    );
}