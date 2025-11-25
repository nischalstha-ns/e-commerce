import { db } from "../firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { validateProduct, sanitizeInput, validateFileUpload } from "../../validation";

export const createNewProduct = async ({ data, images, useLocalStorage = false }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    // Validate product data
    const validation = validateProduct(data);
    if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    if (!images || images.length === 0) {
        throw new Error("At least one image is required");
    }
    
    // Validate all images before upload
    for (const image of images) {
        const fileValidation = validateFileUpload(image);
        if (!fileValidation.isValid) {
            throw new Error(`File validation failed: ${fileValidation.errors.join(', ')}`);
        }
    }

    try {
        let imageURLs = [];
        
        if (useLocalStorage) {
            // Convert images to base64 for local storage
            const base64Promises = images.map(async (image) => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(image);
                });
            });
            imageURLs = await Promise.all(base64Promises);
        } else {
            // Upload images to Cloudinary
            const uploadPromises = images.map(async (image) => {
                const formData = new FormData();
                formData.append('file', image);
                formData.append('folder', 'products');
                
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to upload image: ${errorText}`);
                }
                
                const result = await response.json();
                return result.url;
            });
            
            imageURLs = await Promise.all(uploadPromises);
        }

        const productData = {
            name: sanitizeInput(data.name?.trim()),
            description: sanitizeInput(data.description?.trim() || ''),
            categoryId: sanitizeInput(data.categoryId),
            brandId: data.brandId ? sanitizeInput(data.brandId) : null,
            imageURLs,
            price: parseFloat(data.price),
            salePrice: data.salePrice ? parseFloat(data.salePrice) : null,
            stock: parseInt(data.stock) || 0,
            status: data.status || "active",
            sizes: Array.isArray(data.sizes) ? data.sizes.map(s => sanitizeInput(s)) : [],
            colors: Array.isArray(data.colors) ? data.colors.map(c => sanitizeInput(c)) : [],
            timestampCreate: serverTimestamp(),
            timestampUpdate: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, "products"), productData);
        
        return { id: docRef.id, imageURLs };
    } catch (error) {
        throw error;
    }
};

export const updateProduct = async ({ id, data, newImages = [], useLocalStorage = false }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!id || typeof id !== 'string') {
        throw new Error("Valid product ID is required");
    }

    try {
        let imageURLs = data.imageURLs || [];

        // Validate and upload new images in parallel
        if (newImages.length > 0) {
            // Validate all images first
            for (const image of newImages) {
                const fileValidation = validateFileUpload(image);
                if (!fileValidation.isValid) {
                    throw new Error(`File validation failed: ${fileValidation.errors.join(', ')}`);
                }
            }
            
            let newImageURLs = [];
            
            if (useLocalStorage) {
                // Convert to base64
                const base64Promises = newImages.map(async (image) => {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(image);
                    });
                });
                newImageURLs = await Promise.all(base64Promises);
            } else {
                // Upload to Cloudinary
                const uploadPromises = newImages.map(async (image) => {
                    const formData = new FormData();
                    formData.append('file', image);
                    formData.append('folder', 'products');
                    
                    const response = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                    });
                    
                    if (!response.ok) {
                        throw new Error('Failed to upload image');
                    }
                    
                    const result = await response.json();
                    return result.url;
                });
                
                newImageURLs = await Promise.all(uploadPromises);
            }
            
            imageURLs = newImages.length > 0 ? newImageURLs : [...imageURLs, ...newImageURLs];
        }

        const updateData = {
            imageURLs,
            timestampUpdate: serverTimestamp()
        };

        if (data.name) updateData.name = sanitizeInput(data.name);
        if (data.description) updateData.description = sanitizeInput(data.description);
        if (data.price) {
            const price = parseFloat(data.price);
            if (price > 0 && price <= 1000000) updateData.price = price;
        }
        if (data.salePrice) {
            const salePrice = parseFloat(data.salePrice);
            if (salePrice > 0 && salePrice < updateData.price) updateData.salePrice = salePrice;
        }
        if (data.stock !== undefined) {
            const stock = parseInt(data.stock);
            if (stock >= 0 && stock <= 100000) updateData.stock = stock;
        }
        if (data.categoryId) updateData.categoryId = sanitizeInput(data.categoryId);
        if (data.brandId) updateData.brandId = sanitizeInput(data.brandId);
        if (data.status && ['active', 'inactive', 'draft'].includes(data.status)) {
            updateData.status = data.status;
        }

        await updateDoc(doc(db, "products", id), updateData);
        return { id, imageURLs };
    } catch (error) {
        throw error;
    }
};

export const deleteProduct = async ({ id }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!id || typeof id !== 'string') {
        throw new Error("Valid product ID is required");
    }

    try {
        await deleteDoc(doc(db, "products", id));
    } catch (error) {
        throw error;
    }
};