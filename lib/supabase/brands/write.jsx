import { supabase } from "../client";

export const createNewBrand = async ({ data, image }) => {
    if (!supabase) {
        throw new Error("Supabase is not initialized. Please check your configuration.");
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

        const { data: brand, error } = await supabase
            .from('brands')
            .insert({
                ...data,
                image_url: imageURL,
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return { id: brand.id, imageURL };
    } catch (error) {
        console.error("Error creating brand:", error);
        throw error;
    }
};

export const updateBrand = async ({ id, data, newImage = null }) => {
    if (!supabase) {
        throw new Error("Supabase is not initialized. Please check your configuration.");
    }
    
    if (!id) {
        throw new Error("Brand ID is required");
    }

    try {
        let imageURL = null;

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

        const updateData = { ...data };
        if (imageURL) {
            updateData.image_url = imageURL;
        }

        const { data: brand, error } = await supabase
            .from('brands')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return { id, imageURL: imageURL || brand.image_url };
    } catch (error) {
        console.error("Error updating brand:", error);
        throw error;
    }
};

export const deleteBrand = async ({ id }) => {
    if (!supabase) {
        throw new Error("Supabase is not initialized. Please check your configuration.");
    }
    
    if (!id) {
        throw new Error("ID is required");
    }

    try {
        const { error } = await supabase
            .from('brands')
            .delete()
            .eq('id', id);

        if (error) {
            throw error;
        }
    } catch (error) {
        console.error("Error deleting brand:", error);
        throw error;
    }
};