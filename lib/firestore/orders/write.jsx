import { db } from "@/lib/firestore/firebase";
import { collection, doc, setDoc, updateDoc, getDoc, Timestamp } from "firebase/firestore";

export const createNewOrder = async ({ userId, items, shippingAddress, paymentMethod, total }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!userId) {
        throw new Error("User ID is required");
    }
    if (!items || items.length === 0) {
        throw new Error("Order items are required");
    }
    if (!shippingAddress) {
        throw new Error("Shipping address is required");
    }

    try {
        const newId = doc(collection(db, "ids")).id;

        const orderData = {
            id: newId,
            userId,
            items,
            shippingAddress,
            paymentMethod,
            total: parseFloat(total),
            status: "pending",
            timestampCreate: Timestamp.now(),
            timestampUpdate: Timestamp.now(),
        };

        await setDoc(doc(db, `orders/${newId}`), orderData);
        return { id: newId };
    } catch (error) {
        console.error("Error creating order:", error);
        throw error;
    }
};

export const updateOrderStatus = async ({ id, status, trackingNumber = null }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!id) {
        throw new Error("Order ID is required");
    }
    if (!status) {
        throw new Error("Status is required");
    }

    try {
        const orderRef = doc(db, `orders/${id}`);
        const orderSnapshot = await getDoc(orderRef);

        if (!orderSnapshot.exists()) {
            throw new Error("Order not found");
        }

        const updateData = {
            status,
            timestampUpdate: Timestamp.now(),
        };

        if (trackingNumber) {
            updateData.trackingNumber = trackingNumber;
        }

        await updateDoc(orderRef, updateData);
        return { id, status };
    } catch (error) {
        console.error("Error updating order status:", error);
        throw error;
    }
};