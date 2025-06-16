"use client";

import { createNewBrand } from "@/lib/firestore/brands/write";
import { Button } from "@heroui/react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function BrandForm() {
    const [data, setData] = useState(null);
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleData = (key, value) => {
        setData((preData) => ({
            ...(preData ?? {}),
            [key]: value,
        }));
    };

    const handleCreate = async () => {
        setIsLoading(true);
        try {
            await createNewBrand({ data: data, image: image });
            toast.success("Brand created successfully");

            setData(null);
            setImage(null);
            document.getElementById("brand-image").value = null;
        } catch (error) {
            toast.error(error?.message || "An error occurred");
        }
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col gap-3 bg-white rounded-xl p-5 w-full md:w-[400px]">
            <h1 className="font-semibold">Create Brand</h1>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleCreate();
                }}
                className="flex flex-col gap-3"
            >
                <div className="flex flex-col gap-1">
                    <label htmlFor="brand-image" className="text-gray-500 text-sm">
                        Image <span className="text-red-500">*</span>
                    </label>
                    {image && (
                        <div className="flex justify-center items-center p-3">
                            <img className="h-20" src={URL.createObjectURL(image)} alt="Brand Preview" />
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
                        className="border px-4 rounded-lg w-full focus:outline"
                    />
                </div>

                <div className="flex flex-col gap-1">
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
                        className="border px-4 rounded-lg w-full focus:outline"
                    />
                </div>

                <div className="flex flex-col gap-1">
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
                        className="border px-4 rounded-lg w-full focus:outline"
                    />
                </div>

                <Button isLoading={isLoading} isDisabled={isLoading} type="submit">
                    Create
                </Button>
            </form>
        </div>
    );
}