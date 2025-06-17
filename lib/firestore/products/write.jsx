import { db } from "@/lib/firestore/firebase";
import { collection, deleteDoc, doc, getDoc, setDoc, updateDoc, Timestamp } from "firebase/firestore";

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

    const newId = doc(collection(db, "ids")).id;

    try {
        // Upload images to Cloudinary
        const imageURLs = [];
        for (const image of images) {
            const formData = new FormData();
            formData.append("file", image);
            formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
            formData.append("folder", "products");

            const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: "POST",
                body: formData,
            });

            if (!cloudinaryResponse.ok) {
                const errorText = await cloudinaryResponse.text();
                throw new Error(`Failed to upload image to Cloudinary: ${errorText}`);
            }

            const cloudinaryData = await cloudinaryResponse.json();
            imageURLs.push(cloudinaryData.secure_url);
        }

        // Store product data in Firestore
        await setDoc(doc(db, `products/${newId}`), {
            ...data,
            id: newId,
            imageURLs: imageURLs,
            price: parseFloat(data.price),
            salePrice: data.salePrice ? parseFloat(data.salePrice) : null,
            stock: parseInt(data.stock) || 0,
            status: data.status || "active",
            timestampCreate: Timestamp.now(),
            timestampUpdate: Timestamp.now(),
        });

        return { id: newId, imageURLs };
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
        const productRef = doc(db, `products/${id}`);
        const productSnapshot = await getDoc(productRef);

        if (!productSnapshot.exists()) {
            throw new Error("Product not found");
        }

        let imageURLs = productSnapshot.data().imageURLs || [];

        // Upload new images if provided
        if (newImages.length > 0) {
            for (const image of newImages) {
                const formData = new FormData();
                formData.append("file", image);
                formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
                formData.append("folder", "products");

                const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
                    method: "POST",
                    body: formData,
                });

                if (!cloudinaryResponse.ok) {
                    const errorText = await cloudinaryResponse.text();
                    throw new Error(`Failed to upload image to Cloudinary: ${errorText}`);
                }

                const cloudinaryData = await cloudinaryResponse.json();
                imageURLs.push(cloudinaryData.secure_url);
            }
        }

        const updateData = {
            ...data,
            imageURLs,
            timestampUpdate: Timestamp.now(),
        };

        if (data.price) updateData.price = parseFloat(data.price);
        if (data.salePrice) updateData.salePrice = parseFloat(data.salePrice);
        if (data.stock !== undefined) updateData.stock = parseInt(data.stock);

        await updateDoc(productRef, updateData);
        return { id, imageURLs };
    } catch (error) {
        console.error("Error updating product:", error);
        throw error;
    }
};

const deleteImagesFromCloudinary = async (imageURLs) => {
    if (!imageURLs || imageURLs.length === 0) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

    if (!cloudName || !apiKey) {
        console.warn("Cloudinary configuration missing, skipping image deletion");
        return;
    }

    for (const imageURL of imageURLs) {
        try {
            const parts = imageURL.split("/");
            const publicIdWithExtension = parts[parts.length - 1];
            const publicId = publicIdWithExtension.split(".")[0];

            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
                method: "POST",
                body: JSON.stringify({
                    public_id: `products/${publicId}`,
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
        const productRef = doc(db, `products/${id}`);
        const productSnapshot = await getDoc(productRef);

        if (!productSnapshot.exists()) {
            throw new Error("Product not found");
        }

        const productData = productSnapshot.data();
        await deleteImagesFromCloudinary(productData.imageURLs);
        await deleteDoc(productRef);
    } catch (error) {
        console.error("Error deleting product:", error);
        throw error;
    }
};