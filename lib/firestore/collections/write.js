import { db, storage } from "../firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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
            const imageRef = ref(storage, `collections/${Date.now()}_${image.name}`);
            const snapshot = await uploadBytes(imageRef, image);
            imageURL = await getDownloadURL(snapshot.ref);
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
            const imageRef = ref(storage, `collections/${Date.now()}_${newImage.name}`);
            const snapshot = await uploadBytes(imageRef, newImage);
            imageURL = await getDownloadURL(snapshot.ref);
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