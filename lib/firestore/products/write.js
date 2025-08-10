import { db } from "../firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

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
        // Upload images to Cloudinary
        const imageURLs = [];
        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            console.log(`Uploading image ${i + 1}:`, image.name, image.size);
            
            const formData = new FormData();
            formData.append('file', image);
            formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
            formData.append('folder', 'products');
            
            try {
                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                    {
                        method: 'POST',
                        body: formData
                    }
                );
                
                console.log(`Response status for image ${i + 1}:`, response.status);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`Upload error for image ${i + 1}:`, errorText);
                    throw new Error(`Failed to upload image ${i + 1}: ${response.status}`);
                }
                
                const result = await response.json();
                console.log(`Upload success for image ${i + 1}:`, result.secure_url);
                imageURLs.push(result.secure_url);
            } catch (uploadError) {
                console.error(`Error uploading image ${i + 1}:`, uploadError);
                throw new Error(`Failed to upload image ${i + 1}: ${uploadError.message}`);
            }
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

        // Upload new images to Cloudinary if provided
        if (newImages.length > 0) {
            for (let i = 0; i < newImages.length; i++) {
                const image = newImages[i];
                const formData = new FormData();
                formData.append('file', image);
                formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
                formData.append('folder', 'products');
                formData.append('transformation', 'c_fill,w_800,h_1000,q_auto,f_auto');
                
                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                    {
                        method: 'POST',
                        body: formData
                    }
                );
                
                if (!response.ok) {
                    throw new Error(`Failed to upload image ${i + 1}`);
                }
                
                const result = await response.json();
                imageURLs.push(result.secure_url);
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