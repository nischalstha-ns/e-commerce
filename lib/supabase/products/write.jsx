import { supabase } from "../client";

export const createNewProduct = async ({ data, images }) => {
    if (!supabase) {
        throw new Error("Supabase is not initialized. Please check your configuration.");
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

        const { data: product, error } = await supabase
            .from('products')
            .insert({
                ...data,
                category_id: data.categoryId,
                brand_id: data.brandId,
                image_urls: imageURLs,
                price: parseFloat(data.price),
                sale_price: data.salePrice ? parseFloat(data.salePrice) : null,
                stock: parseInt(data.stock) || 0,
                status: data.status || "active",
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return { id: product.id, imageURLs };
    } catch (error) {
        console.error("Error creating product:", error);
        throw error;
    }
};

export const updateProduct = async ({ id, data, newImages = [] }) => {
    if (!supabase) {
        throw new Error("Supabase is not initialized. Please check your configuration.");
    }
    
    if (!id) {
        throw new Error("Product ID is required");
    }

    try {
        let imageURLs = [];

        // Get existing product to preserve current images
        const { data: existingProduct, error: fetchError } = await supabase
            .from('products')
            .select('image_urls')
            .eq('id', id)
            .single();

        if (fetchError) {
            throw fetchError;
        }

        imageURLs = existingProduct.image_urls || [];

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
            image_urls: imageURLs,
        };

        if (data.categoryId) updateData.category_id = data.categoryId;
        if (data.brandId) updateData.brand_id = data.brandId;
        if (data.price) updateData.price = parseFloat(data.price);
        if (data.salePrice) updateData.sale_price = parseFloat(data.salePrice);
        if (data.stock !== undefined) updateData.stock = parseInt(data.stock);

        const { data: product, error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return { id, imageURLs };
    } catch (error) {
        console.error("Error updating product:", error);
        throw error;
    }
};

export const deleteProduct = async ({ id }) => {
    if (!supabase) {
        throw new Error("Supabase is not initialized. Please check your configuration.");
    }
    
    if (!id) {
        throw new Error("ID is required");
    }

    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }
    } catch (error) {
        console.error("Error deleting product:", error);
        throw error;
    }
};