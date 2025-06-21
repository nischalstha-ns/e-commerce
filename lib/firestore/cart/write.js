import { db } from "../firebase";
import { doc, setDoc, updateDoc, getDoc, serverTimestamp, arrayUnion, arrayRemove } from "firebase/firestore";

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
        const cartDoc = await getDoc(cartRef);

        const newItem = {
            productId,
            quantity: parseInt(quantity),
            selectedSize,
            selectedColor,
            addedAt: new Date()
        };

        if (cartDoc.exists()) {
            const cartData = cartDoc.data();
            const existingItems = cartData.items || [];
            
            // Check if item with same product, size, and color already exists
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
                existingItems.push(newItem);
            }

            await updateDoc(cartRef, {
                items: existingItems,
                timestampUpdate: serverTimestamp()
            });
        } else {
            // Create new cart
            await setDoc(cartRef, {
                items: [newItem],
                timestampCreate: serverTimestamp(),
                timestampUpdate: serverTimestamp()
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
        const cartDoc = await getDoc(cartRef);

        if (cartDoc.exists()) {
            const cartData = cartDoc.data();
            const existingItems = cartData.items || [];
            
            if (quantity <= 0) {
                // Remove item if quantity is 0 or less
                const updatedItems = existingItems.filter(item => 
                    !(item.productId === productId && 
                      item.selectedSize === selectedSize && 
                      item.selectedColor === selectedColor)
                );
                
                await updateDoc(cartRef, {
                    items: updatedItems,
                    timestampUpdate: serverTimestamp()
                });
            } else {
                // Update quantity
                const updatedItems = existingItems.map(item => {
                    if (item.productId === productId && 
                        item.selectedSize === selectedSize && 
                        item.selectedColor === selectedColor) {
                        return { ...item, quantity: parseInt(quantity) };
                    }
                    return item;
                });
                
                await updateDoc(cartRef, {
                    items: updatedItems,
                    timestampUpdate: serverTimestamp()
                });
            }
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
        const cartDoc = await getDoc(cartRef);

        if (cartDoc.exists()) {
            const cartData = cartDoc.data();
            const existingItems = cartData.items || [];
            
            const updatedItems = existingItems.filter(item => 
                !(item.productId === productId && 
                  item.selectedSize === selectedSize && 
                  item.selectedColor === selectedColor)
            );
            
            await updateDoc(cartRef, {
                items: updatedItems,
                timestampUpdate: serverTimestamp()
            });
        }

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
            timestampUpdate: serverTimestamp()
        });

        return { success: true };
    } catch (error) {
        console.error("Error clearing cart:", error);
        throw error;
    }
};