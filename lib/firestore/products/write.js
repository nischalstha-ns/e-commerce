import { db, storage } from "../firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const createNewProduct = async ({ data, images }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!images || images.length === 0) {
        throw new Error("At least one image is required");
    }
    if (!data?.name) {
        throw new Error("Name is required");
    }
    if (!data?.price) {
        throw new Error("Price is required");
    }
    if (!data?.categoryId) {
        throw new Error("Category is required");
    }

    try {
        // Upload images to Firebase Storage
        const imageURLs = [];
        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            const imageRef = ref(storage, `products/${Date.now()}_${i}_${image.name}`);
            const snapshot = await uploadBytes(imageRef, image);
            const downloadURL = await getDownloadURL(snapshot.ref);
            imageURLs.push(downloadURL);
        }

        const productData = {
            ...data,
            imageURLs,
            price: parseFloat(data.price),
            salePrice: data.salePrice ? parseFloat(data.salePrice) : null,
            stock: parseInt(data.stock) || 0,
            status: data.status || "active",
            timestampCreate: serverTimestamp(),
            timestampUpdate: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, "products"), productData);
        return { id: docRef.id, imageURLs };
    } catch (error) {
        console.error("Error creating product:", error);
        throw error;
    }
};

export const updateProduct = async ({ id, data, newImages = [] }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!id) {
        throw new Error("Product ID is required");
    }

    try {
        let imageURLs = data.imageURLs || [];

        // Upload new images if provided
        if (newImages.length > 0) {
            for (let i = 0; i < newImages.length; i++) {
                const image = newImages[i];
                const imageRef = ref(storage, `products/${Date.now()}_${i}_${image.name}`);
                const snapshot = await uploadBytes(imageRef, image);
                const downloadURL = await getDownloadURL(snapshot.ref);
                imageURLs.push(downloadURL);
            }
        }

        const updateData = {
            ...data,
            imageURLs,
            timestampUpdate: serverTimestamp()
        };

        if (data.price) updateData.price = parseFloat(data.price);
        if (data.salePrice) updateData.salePrice = parseFloat(data.salePrice);
        if (data.stock !== undefined) updateData.stock = parseInt(data.stock);

        await updateDoc(doc(db, "products", id), updateData);
        return { id, imageURLs };
    } catch (error) {
        console.error("Error updating product:", error);
        throw error;
    }
};

export const deleteProduct = async ({ id }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!id) {
        throw new Error("ID is required");
    }

    try {
        await deleteDoc(doc(db, "products", id));
    } catch (error) {
        console.error("Error deleting product:", error);
        throw error;
    }
};