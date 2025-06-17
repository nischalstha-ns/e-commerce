"use client";
import { deleteCategories } from "@/lib/firestore/categories/write";
import { useCategories } from "@/lib/firestore/categories/read";
import { Button, CircularProgress, Chip } from "@heroui/react";
import { Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ListView({ onEdit }) {
    const { data: categories, error, isLoading } = useCategories();

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <CircularProgress />
            </div>
        );
    }
    if (error) {
        return <div className="text-red-500 p-4">Error: {error}</div>;
    }

    return (
        <div className="flex-1 flex flex-col gap-3 px-5 rounded-xl">
            <h1 className="text-xl">Categories</h1>
            <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-3">
                    <thead>
                        <tr>
                            <th className="font-semibold border-y bg-white px-3 py-2 border-r rounded-l-lg">SN</th>
                            <th className="font-semibold border-y bg-white px-3 py-2">Image</th>
                            <th className="font-semibold border-y bg-white px-3 py-2 text-left">Name</th>
                            <th className="font-semibold border-y bg-white px-3 py-2 text-left">Slug</th>
                            <th className="font-semibold border-y bg-white px-3 py-2 text-left">Color</th>
                            <th className="font-semibold border-y bg-white px-3 py-2 text-left">Size</th>
                            <th className="font-semibold border-y bg-white px-3 py-2 border-r rounded-r-lg">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories?.map((item, index) => (
                            <Row index={index} item={item} key={item.id} onEdit={onEdit} />
                        ))}
                    </tbody>
                </table>
            </div>
            
            {categories?.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No categories found
                </div>
            )}
        </div>
    );
}

function Row({ item, index, onEdit }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this category?")) return;
        setIsDeleting(true);

        try {
            await deleteCategories({ id: item?.id });
            toast.success("Category deleted successfully");
        } catch (error) {
            toast.error(error?.message || "Error deleting category");
        }

        setIsDeleting(false);
    };

    return (
        <tr>
            <td className="border-y bg-white px-3 py-2 border-r rounded-l-lg text-center">
                {index + 1}
            </td>
            <td className="border-y bg-white px-3 py-2">
                <div className="flex justify-center">
                    <img className="h-10 w-10 object-cover rounded-lg" src={item?.imageURL} alt="" />
                </div>
            </td>
            <td className="border-y bg-white px-3 py-2">{item?.name}</td>
            <td className="border-y bg-white px-3 py-2">
                <Chip size="sm" variant="flat">{item?.slug}</Chip>
            </td>
            <td className="border-y bg-white px-3 py-2">
                {item?.color && (
                    <div className="flex items-center gap-2">
                        <div 
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-xs">{item.color}</span>
                    </div>
                )}
            </td>
            <td className="border-y bg-white px-3 py-2">
                {item?.size && (
                    <Chip size="sm" color="secondary" className="capitalize">
                        {item.size}
                    </Chip>
                )}
            </td>
            <td className="border-y bg-white px-3 py-2 border-r rounded-r-lg">
                <div className="flex gap-2 items-center">
                    <Button
                        onClick={handleDelete}
                        isLoading={isDeleting}
                        isDisabled={isDeleting}
                        isIconOnly
                        size="sm"
                        color="danger"
                    >
                        <Trash2 size={13} />
                    </Button>

                    <Button 
                        onClick={() => onEdit(item)}
                        isIconOnly 
                        size="sm"
                        color="primary"
                    >
                        <Edit2 size={13} />
                    </Button>
                </div>
            </td>
        </tr>
    );
}