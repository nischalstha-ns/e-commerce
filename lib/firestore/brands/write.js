import { db } from "../firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

export const createNewBrand = async ({ data, image }) => {
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
        formData.append('folder', 'brands');
        
        const cloudinaryResponse = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
            { method: 'POST', body: formData }
        );
        
        const result = await cloudinaryResponse.json();
        if (!cloudinaryResponse.ok) throw new Error(result.error?.message || 'Image upload failed');
        const imageURL = result.secure_url;

        const brandData = {
            ...data,
            imageURL,
            timestampCreate: serverTimestamp(),
            timestampUpdate: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, "brands"), brandData);
        return { id: docRef.id, imageURL };
    } catch (error) {
        console.error("Error creating brand:", error);
        throw error;
    }
};

export const updateBrand = async ({ id, data, newImage = null }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!id) {
        throw new Error("Brand ID is required");
    }

    try {
        let imageURL = data.imageURL;

        // Upload new image if provided
        if (newImage) {
            const formData = new FormData();
            formData.append('file', newImage);
            formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
            formData.append('folder', 'brands');
            
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

        await updateDoc(doc(db, "brands", id), updateData);
        return { id, imageURL };
    } catch (error) {
        console.error("Error updating brand:", error);
        throw error;
    }
};

export const deleteBrand = async ({ id }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!id) {
        throw new Error("ID is required");
    }

    try {
        await deleteDoc(doc(db, "brands", id));
    } catch (error) {
        console.error("Error deleting brand:", error);
        throw error;
    }
};