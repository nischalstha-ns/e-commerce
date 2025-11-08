import { db } from "../firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { validateProduct, sanitizeInput, validateFileUpload, checkRateLimit } from "../../validation";

export const createNewProduct = async ({ data, images }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    // Rate limiting check
    if (!checkRateLimit('product-creation', 5, 300000)) { // 5 requests per 5 minutes
        throw new Error("Too many product creation attempts. Please try again later.");
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
        // Upload images in parallel for better performance
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
        
        const imageURLs = await Promise.all(uploadPromises);

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

export const updateProduct = async ({ id, data, newImages = [] }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!id || typeof id !== 'string') {
        throw new Error("Valid product ID is required");
    }
    
    // Rate limiting check
    if (!checkRateLimit(`product-update-${id}`, 10, 300000)) {
        throw new Error("Too many update attempts. Please try again later.");
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
            
            const newImageURLs = await Promise.all(uploadPromises);
            imageURLs = [...imageURLs, ...newImageURLs];
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
    
    // Rate limiting check
    if (!checkRateLimit(`product-delete-${id}`, 3, 300000)) {
        throw new Error("Too many delete attempts. Please try again later.");
    }

    try {
        await deleteDoc(doc(db, "products", id));
    } catch (error) {
        throw error;
    }
};