import { db } from "@/lib/firestore/firebase";
import { collection, deleteDoc, doc, getDoc, setDoc, Timestamp } from "firebase/firestore";

export const createNewCategory = async ({ data, image }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!image) {
        throw new Error("Image is required");
    }
    if (!data?.name) {
        throw new Error("Name is required");
    }
    if (!data?.slug) {
        throw new Error("Slug is required");
    }

    const newId = doc(collection(db, "ids")).id;

    try {
        // Upload image to Cloudinary
        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
        formData.append("folder", "categories");

        const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
            method: "POST",
            body: formData,
        });

        if (!cloudinaryResponse.ok) {
            const errorText = await cloudinaryResponse.text();
            throw new Error(`Failed to upload image to Cloudinary: ${errorText}`);
        }

        const cloudinaryData = await cloudinaryResponse.json();
        const imageURL = cloudinaryData.secure_url;

        // Store category data in Firestore
        await setDoc(doc(db, `categories/${newId}`), {
            ...data,
            id: newId,
            imageURL: imageURL,
            timestampCreate: Timestamp.now(),
        });

        return { id: newId, imageURL };
    } catch (error) {
        console.error("Error creating category:", error);
        throw error;
    }
};

const deleteImageFromCloudinary = async (imageURL) => {
    if (!imageURL) return;

    try {
        // Extract public_id from the Cloudinary image URL
        const parts = imageURL.split("/");
        const publicIdWithExtension = parts[parts.length - 1];
        const publicId = publicIdWithExtension.split(".")[0];

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

        if (!cloudName || !apiKey) {
            console.warn("Cloudinary configuration missing, skipping image deletion");
            return;
        }

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
            method: "POST",
            body: JSON.stringify({
                public_id: `categories/${publicId}`,
                api_key: apiKey,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            console.warn("Failed to delete image from Cloudinary:", await response.text());
        }
    } catch (error) {
        console.error("Cloudinary Deletion Error:", error);
    }
};

export const deleteCategories = async ({ id }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!id) {
        throw new Error("ID is required");
    }

    try {
        const categoryRef = doc(db, `categories/${id}`);
        const categorySnapshot = await getDoc(categoryRef);

        if (!categorySnapshot.exists()) {
            throw new Error("Category not found");
        }

        const categoryData = categorySnapshot.data();
        await deleteImageFromCloudinary(categoryData.imageURL);
        await deleteDoc(categoryRef);
    } catch (error) {
        console.error("Error deleting category:", error);
        throw error;
    }
};