"use client";

import { createNewCategory, updateCategory } from "@/lib/firestore/categories/write";
import { Button } from "@heroui/react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function Form({ categoryToEdit = null, onSuccess }) {
    const [data, setData] = useState(null);
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (categoryToEdit) {
            setData(categoryToEdit);
        }
    }, [categoryToEdit]);

    const handleData = (key, value) => {
        setData((preData) => ({
            ...(preData ?? {}),
            [key]: value,
        }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            if (categoryToEdit) {
                await updateCategory({ 
                    id: categoryToEdit.id, 
                    data: data, 
                    newImage: image 
                });
                toast.success("Category updated successfully");
            } else {
                await createNewCategory({ data: data, image: image });
                toast.success("Category created successfully");
            }

            // Reset the form fields
            setData(null);
            setImage(null);

            // Reset the file input field
            document.getElementById("category-image").value = null;
            
            if (onSuccess) onSuccess();
        } catch (error) {
            toast.error(error?.message || "An error occurred");
        }
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col gap-3 bg-white rounded-xl p-5 w-full max-w-md">
            <h1 className="font-semibold text-xl">
                {categoryToEdit ? "Update Category" : "Create Category"}
            </h1>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
                className="flex flex-col gap-3"
            >
                {/* Image */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="category-image" className="text-gray-500 text-sm">
                        Image <span className="text-red-500">*</span>
                    </label>
                    {image && (
                        <div className="flex justify-center items-center p-3">
                            <img className="h-20" src={URL.createObjectURL(image)} alt="Category Preview" />
                        </div>
                    )}
                    {categoryToEdit?.imageURL && !image && (
                        <div className="flex justify-center items-center p-3">
                            <img className="h-20" src={categoryToEdit.imageURL} alt="Current Category" />
                        </div>
                    )}
                    <input
                        onChange={(e) => {
                            if (e.target.files.length > 0) {
                                setImage(e.target.files[0]);
                            }
                        }}
                        id="category-image"
                        name="category-image"
                        type="file"
                        accept="image/*"
                        className="border px-4 py-2 rounded-lg w-full focus:outline-none"
                    />
                </div>

                {/* Name */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="category-name" className="text-gray-500 text-sm">
                        Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="category-name"
                        name="category-name"
                        type="text"
                        placeholder="Enter Name"
                        value={data?.name ?? ""}
                        onChange={(e) => handleData("name", e.target.value)}
                        className="border px-4 py-2 rounded-lg w-full focus:outline-none"
                        required
                    />
                </div>

                {/* Slug */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="category-slug" className="text-gray-500 text-sm">
                        Slug <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="category-slug"
                        name="category-slug"
                        type="text"
                        placeholder="Enter Slug"
                        value={data?.slug ?? ""}
                        onChange={(e) => handleData("slug", e.target.value)}
                        className="border px-4 py-2 rounded-lg w-full focus:outline-none"
                        required
                    />
                </div>

                {/* Color */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="category-color" className="text-gray-500 text-sm">
                        Color
                    </label>
                    <div className="flex gap-2 items-center">
                        <input
                            id="category-color"
                            name="category-color"
                            type="color"
                            value={data?.color ?? "#000000"}
                            onChange={(e) => handleData("color", e.target.value)}
                            className="w-12 h-10 border rounded-lg cursor-pointer"
                        />
                        <input
                            type="text"
                            placeholder="Color hex code"
                            value={data?.color ?? ""}
                            onChange={(e) => handleData("color", e.target.value)}
                            className="border px-4 py-2 rounded-lg flex-1 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Size */}
                <div className="flex flex-col gap-1">
                    <label htmlFor="category-size" className="text-gray-500 text-sm">
                        Size
                    </label>
                    <select
                        id="category-size"
                        name="category-size"
                        value={data?.size ?? ""}
                        onChange={(e) => handleData("size", e.target.value)}
                        className="border px-4 py-2 rounded-lg w-full focus:outline-none"
                    >
                        <option value="">Select Size</option>
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                        <option value="extra-large">Extra Large</option>
                    </select>
                </div>

                {/* ID Display (for updates only) */}
                {categoryToEdit && (
                    <div className="flex flex-col gap-1">
                        <label className="text-gray-500 text-sm">ID</label>
                        <input
                            type="text"
                            value={categoryToEdit.id}
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
                    className="w-full"
                >
                    {categoryToEdit ? "Update Category" : "Create Category"}
                </Button>
            </form>
        </div>
    );
}