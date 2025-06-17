"use client";

import { createNewBrand, updateBrand } from "@/lib/firestore/brands/write";
import { Button } from "@heroui/react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function BrandForm({ brandToEdit = null, onSuccess }) {
    const [data, setData] = useState(null);
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (brandToEdit) {
            setData(brandToEdit);
        }
    }, [brandToEdit]);

    const handleData = (key, value) => {
        setData((preData) => ({
            ...(preData ?? {}),
            [key]: value,
        }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            if (brandToEdit) {
                await updateBrand({ 
                    id: brandToEdit.id, 
                    data: data, 
                    newImage: image 
                });
                toast.success("Brand updated successfully");
            } else {
                await createNewBrand({ data: data, image: image });
                toast.success("Brand created successfully");
            }

            setData(null);
            setImage(null);
            document.getElementById("brand-image").value = null;
            
            if (onSuccess) onSuccess();
        } catch (error) {
            toast.error(error?.message || "An error occurred");
        }
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col gap-4 bg-white rounded-xl p-6 w-full max-w-md">
            <h1 className="font-semibold text-xl">
                {brandToEdit ? "Update Brand" : "Create Brand"}
            </h1>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
                className="flex flex-col gap-4"
            >
                {/* Image */}
                <div className="flex flex-col gap-2">
                    <label htmlFor="brand-image" className="text-gray-500 text-sm">
                        Image <span className="text-red-500">*</span>
                    </label>
                    {image && (
                        <div className="flex justify-center items-center p-3">
                            <img className="h-20" src={URL.createObjectURL(image)} alt="Brand Preview" />
                        </div>
                    )}
                    {brandToEdit?.imageURL && !image && (
                        <div className="flex justify-center items-center p-3">
                            <img className="h-20" src={brandToEdit.imageURL} alt="Current Brand" />
                        </div>
                    )}
                    <input
                        onChange={(e) => {
                            if (e.target.files.length > 0) {
                                setImage(e.target.files[0]);
                            }
                        }}
                        id="brand-image"
                        name="brand-image"
                        type="file"
                        accept="image/*"
                        className="border px-4 py-2 rounded-lg w-full focus:outline-none"
                    />
                </div>

                {/* Name */}
                <div className="flex flex-col gap-2">
                    <label htmlFor="brand-name" className="text-gray-500 text-sm">
                        Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="brand-name"
                        name="brand-name"
                        type="text"
                        placeholder="Enter Name"
                        value={data?.name ?? ""}
                        onChange={(e) => handleData("name", e.target.value)}
                        className="border px-4 py-2 rounded-lg w-full focus:outline-none"
                        required
                    />
                </div>

                {/* Slug */}
                <div className="flex flex-col gap-2">
                    <label htmlFor="brand-slug" className="text-gray-500 text-sm">
                        Slug <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="brand-slug"
                        name="brand-slug"
                        type="text"
                        placeholder="Enter Slug"
                        value={data?.slug ?? ""}
                        onChange={(e) => handleData("slug", e.target.value)}
                        className="border px-4 py-2 rounded-lg w-full focus:outline-none"
                        required
                    />
                </div>

                {/* ID Display (for updates only) */}
                {brandToEdit && (
                    <div className="flex flex-col gap-2">
                        <label className="text-gray-500 text-sm">ID</label>
                        <input
                            type="text"
                            value={brandToEdit.id}
                            disabled
                            className="border px-4 py-2 rounded-lg w-full bg-gray-100 text-gray-500"
                        />
                    </div>
                )}

                <Button 
                    isLoading={isLoading} 
                    isDisabled={isLoading} 
                    type="submit"
                    color="primary"
                    className="w-full font-bold"
                >
                    {brandToEdit ? "Update Brand" : "Create Brand"}
                </Button>
            </form>
        </div>
    );
}