import { db } from "@/lib/firestore/firebase";
import { collection, deleteDoc, doc, getDoc, setDoc, updateDoc, Timestamp } from "firebase/firestore";

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

    const newId = doc(collection(db, "ids")).id;

    try {
        let imageURL = null;

        // Upload image to Cloudinary if provided
        if (image) {
            const formData = new FormData();
            formData.append("file", image);
            formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
            formData.append("folder", "collections");

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

        // Store collection data in Firestore
        await setDoc(doc(db, `collections/${newId}`), {
            ...data,
            id: newId,
            imageURL: imageURL,
            productIds: data.productIds || [],
            status: data.status || "active",
            featured: data.featured || false,
            timestampCreate: Timestamp.now(),
            timestampUpdate: Timestamp.now(),
        });

        return { id: newId, imageURL };
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
        const collectionRef = doc(db, `collections/${id}`);
        const collectionSnapshot = await getDoc(collectionRef);

        if (!collectionSnapshot.exists()) {
            throw new Error("Collection not found");
        }

        let imageURL = collectionSnapshot.data().imageURL;

        // Upload new image if provided
        if (newImage) {
            const formData = new FormData();
            formData.append("file", newImage);
            formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
            formData.append("folder", "collections");

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

        await updateDoc(collectionRef, updateData);
        return { id, imageURL };
    } catch (error) {
        console.error("Error updating collection:", error);
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
                public_id: `collections/${publicId}`,
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

export const deleteCollection = async ({ id }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!id) {
        throw new Error("ID is required");
    }

    try {
        const collectionRef = doc(db, `collections/${id}`);
        const collectionSnapshot = await getDoc(collectionRef);

        if (!collectionSnapshot.exists()) {
            throw new Error("Collection not found");
        }

        const collectionData = collectionSnapshot.data();
        await deleteImageFromCloudinary(collectionData.imageURL);
        await deleteDoc(collectionRef);
    } catch (error) {
        console.error("Error deleting collection:", error);
        throw error;
    }
};