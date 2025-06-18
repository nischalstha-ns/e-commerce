import { db } from "@/lib/firestore/firebase";
import { doc, setDoc, updateDoc, getDoc, deleteDoc, arrayUnion, arrayRemove, Timestamp } from "firebase/firestore";

export const addToCart = async ({ userId, productId, quantity = 1, selectedSize = null, selectedColor = null }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!userId) {
        throw new Error("User ID is required");
    }
    if (!productId) {
        throw new Error("Product ID is required");
    }

    try {
        const cartRef = doc(db, "carts", userId);
        const cartSnapshot = await getDoc(cartRef);

        const cartItem = {
            productId,
            quantity: parseInt(quantity),
            selectedSize,
            selectedColor,
            addedAt: Timestamp.now()
        };

        if (cartSnapshot.exists()) {
            const cartData = cartSnapshot.data();
            const existingItems = cartData.items || [];
            
            // Check if item already exists with same product, size, and color
            const existingItemIndex = existingItems.findIndex(item => 
                item.productId === productId && 
                item.selectedSize === selectedSize && 
                item.selectedColor === selectedColor
            );

            if (existingItemIndex >= 0) {
                // Update quantity of existing item
                existingItems[existingItemIndex].quantity += parseInt(quantity);
            } else {
                // Add new item
                existingItems.push(cartItem);
            }

            await updateDoc(cartRef, {
                items: existingItems,
                updatedAt: Timestamp.now()
            });
        } else {
            // Create new cart
            await setDoc(cartRef, {
                userId,
                items: [cartItem],
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Error adding to cart:", error);
        throw error;
    }
};

export const updateCartItem = async ({ userId, productId, quantity, selectedSize = null, selectedColor = null }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!userId) {
        throw new Error("User ID is required");
    }
    if (!productId) {
        throw new Error("Product ID is required");
    }

    try {
        const cartRef = doc(db, "carts", userId);
        const cartSnapshot = await getDoc(cartRef);

        if (!cartSnapshot.exists()) {
            throw new Error("Cart not found");
        }

        const cartData = cartSnapshot.data();
        const items = cartData.items || [];
        
        const itemIndex = items.findIndex(item => 
            item.productId === productId && 
            item.selectedSize === selectedSize && 
            item.selectedColor === selectedColor
        );

        if (itemIndex >= 0) {
            if (quantity <= 0) {
                // Remove item if quantity is 0 or less
                items.splice(itemIndex, 1);
            } else {
                // Update quantity
                items[itemIndex].quantity = parseInt(quantity);
            }

            await updateDoc(cartRef, {
                items,
                updatedAt: Timestamp.now()
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Error updating cart item:", error);
        throw error;
    }
};

export const removeFromCart = async ({ userId, productId, selectedSize = null, selectedColor = null }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!userId) {
        throw new Error("User ID is required");
    }
    if (!productId) {
        throw new Error("Product ID is required");
    }

    try {
        const cartRef = doc(db, "carts", userId);
        const cartSnapshot = await getDoc(cartRef);

        if (!cartSnapshot.exists()) {
            throw new Error("Cart not found");
        }

        const cartData = cartSnapshot.data();
        const items = cartData.items || [];
        
        const filteredItems = items.filter(item => 
            !(item.productId === productId && 
              item.selectedSize === selectedSize && 
              item.selectedColor === selectedColor)
        );

        await updateDoc(cartRef, {
            items: filteredItems,
            updatedAt: Timestamp.now()
        });

        return { success: true };
    } catch (error) {
        console.error("Error removing from cart:", error);
        throw error;
    }
};

export const clearCart = async ({ userId }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!userId) {
        throw new Error("User ID is required");
    }

    try {
        const cartRef = doc(db, "carts", userId);
        await updateDoc(cartRef, {
            items: [],
            updatedAt: Timestamp.now()
        });

        return { success: true };
    } catch (error) {
        console.error("Error clearing cart:", error);
        throw error;
    }
};