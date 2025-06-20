"use client";

import { addAdmin } from "@/lib/supabase/admins/write";
import { Button, Input } from "@heroui/react";
import { useState } from "react";
import { Mail, User } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminForm() {
    const [formData, setFormData] = useState({
        email: "",
        name: ""
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.email || !formData.name) {
            toast.error("Please fill in all fields");
            return;
        }

        if (!formData.email.includes("@")) {
            toast.error("Please enter a valid email address");
            return;
        }

        setIsLoading(true);
        try {
            await addAdmin({
                email: formData.email.trim(),
                name: formData.name.trim()
            });
            
            toast.success("Admin added successfully");
            setFormData({ email: "", name: "" });
        } catch (error) {
            toast.error(error?.message || "Error adding admin");
        }
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col gap-4 bg-white rounded-xl p-6 w-full max-w-md">
            <h1 className="font-semibold text-xl">Add New Admin</h1>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                    type="text"
                    label="Full Name"
                    placeholder="Enter admin's full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    startContent={<User className="w-4 h-4 text-gray-400" />}
                    variant="bordered"
                    isRequired
                />

                <Input
                    type="email"
                    label="Email Address"
                    placeholder="Enter admin's email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    startContent={<Mail className="w-4 h-4 text-gray-400" />}
                    variant="bordered"
                    isRequired
                />

                <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <strong>Note:</strong> The user must first create an account with this email address. 
                        Once they sign up, they will automatically have admin access.
                    </p>
                </div>

                <Button
                    type="submit"
                    color="primary"
                    className="w-full font-bold"
                    isLoading={isLoading}
                    isDisabled={isLoading}
                >
                    Add Admin
                </Button>
            </form>
        </div>
    );
}