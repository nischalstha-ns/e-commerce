import { db } from "../firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

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

    try {
        // Upload image to Cloudinary
        const formData = new FormData();
        formData.append('file', image);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', 'categories');
        
        const cloudinaryResponse = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
            { method: 'POST', body: formData }
        );
        
        const result = await cloudinaryResponse.json();
        if (!cloudinaryResponse.ok) throw new Error(result.error?.message || 'Image upload failed');
        const imageURL = result.secure_url;

        const categoryData = {
            ...data,
            imageURL,
            timestampCreate: serverTimestamp(),
            timestampUpdate: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, "categories"), categoryData);
        return { id: docRef.id, imageURL };
    } catch (error) {
        console.error("Error creating category:", error);
        throw error;
    }
};

export const updateCategory = async ({ id, data, newImage = null }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!id) {
        throw new Error("Category ID is required");
    }

    try {
        let imageURL = data.imageURL;

        // Upload new image if provided
        if (newImage) {
            const formData = new FormData();
            formData.append('file', newImage);
            formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
            formData.append('folder', 'categories');
            
            const cloudinaryResponse = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                { method: 'POST', body: formData }
            );
            
            const result = await cloudinaryResponse.json();
            if (!cloudinaryResponse.ok) throw new Error(result.error?.message || 'Image upload failed');
            imageURL = result.secure_url;
        }

        const updateData = {
            ...data,
            imageURL,
            timestampUpdate: serverTimestamp()
        };

        await updateDoc(doc(db, "categories", id), updateData);
        return { id, imageURL };
    } catch (error) {
        console.error("Error updating category:", error);
        throw error;
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
        await deleteDoc(doc(db, "categories", id));
    } catch (error) {
        console.error("Error deleting category:", error);
        throw error;
    }
};