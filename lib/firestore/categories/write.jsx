import { db } from "@/lib/firestore/firebase";
import { collection, deleteDoc, doc, getDoc, setDoc, Timestamp } from "firebase/firestore";

export const createNewCategory = async ({ data, image }) => {
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

    // Upload image to Cloudinary
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET); // Using env variable
    formData.append("folder", "categories");

    const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
    });

    if (!cloudinaryResponse.ok) {
        throw new Error("Failed to upload image to Cloudinary");
    }

    const cloudinaryData = await cloudinaryResponse.json();
    const imageURL = cloudinaryData.secure_url; // Get the uploaded image URL

    // Store category data in Firestore
    await setDoc(doc(db, `categories/${newId}`), {
        ...data,
        id: newId,
        imageURL: imageURL, // Save Cloudinary image URL
        timestampCreate: Timestamp.now(),
    });

    return { id: newId, imageURL };
};

const deleteImageFromCloudinary = async (imageURL) => {
    if (!imageURL) return;

    // Extract public_id from the Cloudinary image URL
    const parts = imageURL.split("/");
    const publicIdWithExtension = parts[parts.length - 1]; // e.g., "image.jpg"
    const publicId = publicIdWithExtension.split(".")[0]; // Remove extension

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    try {
        await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
            method: "POST",
            body: JSON.stringify({
                public_id: `categories/${publicId}`, // Adjust path if needed
                api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("Cloudinary Deletion Error:", error);
    }
};

// Function to delete category
export const deleteCategories = async ({ id }) => {
    if (!id) {
        throw new Error("ID is required");
    }

    const categoryRef = doc(db, `categories/${id}`);
    const categorySnapshot = await getDoc(categoryRef);

    if (!categorySnapshot.exists()) {
        throw new Error("Category not found");
    }

    const categoryData = categorySnapshot.data();
    await deleteImageFromCloudinary(categoryData.imageURL); // Delete image first
    await deleteDoc(categoryRef); // Then delete category from Firestore
};