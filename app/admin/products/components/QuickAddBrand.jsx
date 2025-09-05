"use client";

import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@heroui/react";
import { uploadToCloudinary } from "@/lib/utils/cloudinary";
import { db } from "@/lib/firestore/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";

export default function QuickAddBrand({ isOpen, onClose, onSuccess }) {
    const [name, setName] = useState("");
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.error("Brand name is required");
            return;
        }
        if (!image) {
            toast.error("Brand image is required");
            return;
        }

        // Check Cloudinary config
        if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
            toast.error("Cloudinary configuration missing");
            return;
        }

        setIsLoading(true);
        try {
            console.log('Uploading image to Cloudinary...');
            
            const formData = new FormData();
            formData.append('file', image);
            formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
            formData.append('folder', 'brands');
            
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            );
            
            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status}`);
            }
            
            const uploadResult = await response.json();
            console.log('Upload result:', uploadResult);
            
            console.log('Creating brand in Firestore...');
            const docRef = await addDoc(collection(db, "brands"), {
                name: name.trim(),
                imageURL: uploadResult.secure_url,
                timestampCreate: serverTimestamp(),
                timestampUpdate: serverTimestamp()
            });
            
            toast.success("Brand created successfully");
            onSuccess({ id: docRef.id, imageURL: uploadResult.secure_url });
            handleClose();
        } catch (error) {
            console.error('Brand creation error:', error);
            toast.error(error.message || "Failed to create brand");
        }
        setIsLoading(false);
    };

    const handleClose = () => {
        setName("");
        setImage(null);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="md">
            <ModalContent>
                <ModalHeader>Add New Brand</ModalHeader>
                <ModalBody className="space-y-4">
                    <Input
                        label="Brand Name"
                        placeholder="Enter brand name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        isRequired
                    />
                    
                    <div>
                        <label className="block text-sm font-medium mb-2">Brand Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImage(e.target.files[0])}
                            className="w-full border rounded-lg p-2"
                            required
                        />
                        {image && (
                            <div className="mt-2">
                                <img 
                                    src={URL.createObjectURL(image)} 
                                    alt="Preview" 
                                    className="w-20 h-20 object-cover rounded-lg"
                                />
                            </div>
                        )}
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={handleClose}>
                        Cancel
                    </Button>
                    <Button 
                        color="primary" 
                        onPress={handleSubmit}
                        isLoading={isLoading}
                    >
                        Create Brand
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}