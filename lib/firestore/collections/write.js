import { db } from "../firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

export const createNewCollection = async ({ data, image }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!data?.name) {
        throw new Error("Name is required");
    }
    if (!data?.slug) {
        throw new Error("Slug is required");
    }

    try {
        let imageURL = null;

        // Upload image if provided
        if (image) {
            const formData = new FormData();
            formData.append('file', image);
            formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
            formData.append('folder', 'collections');
            
            const cloudinaryResponse = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                { method: 'POST', body: formData }
            );
            
            const result = await cloudinaryResponse.json();
            if (!cloudinaryResponse.ok) throw new Error(result.error?.message || 'Image upload failed');
            imageURL = result.secure_url;
        }

        const collectionData = {
            ...data,
            imageURL,
            timestampCreate: serverTimestamp(),
            timestampUpdate: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, "collections"), collectionData);
        return { id: docRef.id, imageURL };
    } catch (error) {
        console.error("Error creating collection:", error);
        throw error;
    }
};

export const updateCollection = async ({ id, data, newImage = null }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!id) {
        throw new Error("Collection ID is required");
    }

    try {
        let imageURL = data.imageURL;

        // Upload new image if provided
        if (newImage) {
            const formData = new FormData();
            formData.append('file', newImage);
            formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
            formData.append('folder', 'collections');
            
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

        await updateDoc(doc(db, "collections", id), updateData);
        return { id, imageURL };
    } catch (error) {
        console.error("Error updating collection:", error);
        throw error;
    }
};

export const deleteCollection = async ({ id }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!id) {
        throw new Error("ID is required");
    }

    try {
        await deleteDoc(doc(db, "collections", id));
    } catch (error) {
        console.error("Error deleting collection:", error);
        throw error;
    }
};