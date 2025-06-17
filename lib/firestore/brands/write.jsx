import { db } from "@/lib/firestore/firebase";
import { collection, deleteDoc, doc, getDoc, setDoc, updateDoc, Timestamp } from "firebase/firestore";

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
    if (!data?.slug) {
        throw new Error("Slug is required");
    }

    const newId = doc(collection(db, "ids")).id;

    try {
        // Upload image to Cloudinary
        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
        formData.append("folder", "brands");

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

        await setDoc(doc(db, `brands/${newId}`), {
            ...data,
            id: newId,
            imageURL: imageURL,
            timestampCreate: Timestamp.now(),
            timestampUpdate: Timestamp.now(),
        });

        return { id: newId, imageURL };
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
        const brandRef = doc(db, `brands/${id}`);
        const brandSnapshot = await getDoc(brandRef);

        if (!brandSnapshot.exists()) {
            throw new Error("Brand not found");
        }

        let imageURL = brandSnapshot.data().imageURL;

        // Upload new image if provided
        if (newImage) {
            const formData = new FormData();
            formData.append("file", newImage);
            formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
            formData.append("folder", "brands");

            const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: "POST",
                body: formData,
            });

            if (!cloudinaryResponse.ok) {
                const errorText = await cloudinaryResponse.text();
                throw new Error(`Failed to upload image to Cloudinary: ${errorText}`);
            }

            const cloudinaryData = await cloudinaryResponse.json();
            imageURL = cloudinaryData.secure_url;
        }

        const updateData = {
            ...data,
            imageURL,
            timestampUpdate: Timestamp.now(),
        };

        await updateDoc(brandRef, updateData);
        return { id, imageURL };
    } catch (error) {
        console.error("Error updating brand:", error);
        throw error;
    }
};

const deleteImageFromCloudinary = async (imageURL) => {
    if (!imageURL) return;

    try {
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
                public_id: `brands/${publicId}`,
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

export const deleteBrand = async ({ id }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!id) {
        throw new Error("ID is required");
    }

    try {
        const brandRef = doc(db, `brands/${id}`);
        const brandSnapshot = await getDoc(brandRef);

        if (!brandSnapshot.exists()) {
            throw new Error("Brand not found");
        }

        const brandData = brandSnapshot.data();
        await deleteImageFromCloudinary(brandData.imageURL);
        await deleteDoc(brandRef);
    } catch (error) {
        console.error("Error deleting brand:", error);
        throw error;
    }
};