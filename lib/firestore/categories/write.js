import { db, storage } from "../firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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

    try {
        // Upload image to Firebase Storage
        const imageRef = ref(storage, `categories/${Date.now()}_${image.name}`);
        const snapshot = await uploadBytes(imageRef, image);
        const imageURL = await getDownloadURL(snapshot.ref);

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
            const imageRef = ref(storage, `categories/${Date.now()}_${newImage.name}`);
            const snapshot = await uploadBytes(imageRef, newImage);
            imageURL = await getDownloadURL(snapshot.ref);
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