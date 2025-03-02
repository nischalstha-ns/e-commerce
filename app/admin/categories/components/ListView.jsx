"use client";
import { deleteCategories } from "@/lib/firestore/categories/write";
import { useCategories } from "@/lib/firestore/categories/read";
import { Button, CircularProgress } from "@heroui/react";
import { Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ListView() {
    const { data: categories, error, isLoading } = useCategories();

    if (isLoading) {
        return (
            <div>
                <CircularProgress />
            </div>
        );
    }
    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="flex-1 flex flex-col gap-3 px-5 rounded-xl">
            <h1 className="text-xl">Categories</h1>
            <table className="font-semibold border-y border-separate border-spacing-y-3">
                <thead>
                    <tr>
                        <th className="font-semibold border-y bg-white px-3 py-2 border-r rounded-l-lg">SN</th>
                        <th className="font-semibold border-y bg-white px-3 py-2">Item</th>
                        <th className="font-semibold border-y bg-white px-3 py-2 text-left">Name</th>
                        <th className="font-semibold border-y bg-white px-3 py-2 border-r rounded-r-lg">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {categories?.map((item, index) => (
                        <Row index={index} item={item} key={item.id} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function Row({ item, index }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter(); // Corrected useRouter import

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

    const handleUpdate = () => {
        router.push(`/admin/categories?id=${item?.id}`); // Fixed template string
    };

    return (
        <tr>
            <td className="border-y bg-white px-3 py-2 border-r rounded-r-lg text-center">
                {index + 1}
            </td>
            <td className="border-y bg-white px-3 py-2">
                <div className="flex justify-center">
                    <img className="h-10 w-10 object-cover" src={item?.imageURL} alt="" />
                </div>
            </td>
            <td className="border-y bg-white px-3 py-2">{item?.name}</td>
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

                    <Button onClick={handleUpdate} isIconOnly size="sm">
                        <Edit2 size={13} />
                    </Button>
                </div>
            </td>
        </tr>
    );
}
