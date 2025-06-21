import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

export const updateOrderStatus = async ({ id, status }) => {
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
        const orderRef = doc(db, "orders", id);
        await updateDoc(orderRef, {
            status,
            timestampUpdate: new Date()
        });

        return { success: true };
    } catch (error) {
        console.error("Error updating order status:", error);
        throw error;
    }
};