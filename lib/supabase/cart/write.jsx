import { supabase } from "../client";

export const addToCart = async ({ userId, productId, quantity = 1, selectedSize = null, selectedColor = null }) => {
    if (!supabase) {
        throw new Error("Supabase is not initialized. Please check your configuration.");
    }
    
    if (!userId) {
        throw new Error("User ID is required");
    }
    if (!productId) {
        throw new Error("Product ID is required");
    }

    try {
        // Check if item already exists with same product, size, and color
        const { data: existingItem, error: checkError } = await supabase
            .from('cart_items')
            .select('*')
            .eq('user_id', userId)
            .eq('product_id', productId)
            .eq('selected_size', selectedSize)
            .eq('selected_color', selectedColor)
            .single();

        if (existingItem) {
            // Update quantity of existing item
            const { error: updateError } = await supabase
                .from('cart_items')
                .update({ 
                    quantity: existingItem.quantity + parseInt(quantity),
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingItem.id);

            if (updateError) {
                throw updateError;
            }
        } else {
            // Add new item
            const { error: insertError } = await supabase
                .from('cart_items')
                .insert({
                    user_id: userId,
                    product_id: productId,
                    quantity: parseInt(quantity),
                    selected_size: selectedSize,
                    selected_color: selectedColor
                });

            if (insertError) {
                throw insertError;
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Error adding to cart:", error);
        throw error;
    }
};

export const updateCartItem = async ({ userId, productId, quantity, selectedSize = null, selectedColor = null }) => {
    if (!supabase) {
        throw new Error("Supabase is not initialized. Please check your configuration.");
    }
    
    if (!userId) {
        throw new Error("User ID is required");
    }
    if (!productId) {
        throw new Error("Product ID is required");
    }

    try {
        if (quantity <= 0) {
            // Remove item if quantity is 0 or less
            const { error } = await supabase
                .from('cart_items')
                .delete()
                .eq('user_id', userId)
                .eq('product_id', productId)
                .eq('selected_size', selectedSize)
                .eq('selected_color', selectedColor);

            if (error) {
                throw error;
            }
        } else {
            // Update quantity
            const { error } = await supabase
                .from('cart_items')
                .update({ 
                    quantity: parseInt(quantity),
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId)
                .eq('product_id', productId)
                .eq('selected_size', selectedSize)
                .eq('selected_color', selectedColor);

            if (error) {
                throw error;
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Error updating cart item:", error);
        throw error;
    }
};

export const removeFromCart = async ({ userId, productId, selectedSize = null, selectedColor = null }) => {
    if (!supabase) {
        throw new Error("Supabase is not initialized. Please check your configuration.");
    }
    
    if (!userId) {
        throw new Error("User ID is required");
    }
    if (!productId) {
        throw new Error("Product ID is required");
    }

    try {
        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', userId)
            .eq('product_id', productId)
            .eq('selected_size', selectedSize)
            .eq('selected_color', selectedColor);

        if (error) {
            throw error;
        }

        return { success: true };
    } catch (error) {
        console.error("Error removing from cart:", error);
        throw error;
    }
};

export const clearCart = async ({ userId }) => {
    if (!supabase) {
        throw new Error("Supabase is not initialized. Please check your configuration.");
    }
    
    if (!userId) {
        throw new Error("User ID is required");
    }

    try {
        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', userId);

        if (error) {
            throw error;
        }

        return { success: true };
    } catch (error) {
        console.error("Error clearing cart:", error);
        throw error;
    }
};