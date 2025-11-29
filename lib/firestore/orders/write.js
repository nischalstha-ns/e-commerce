import { db } from "../firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

export const updateOrderStatus = async ({ id, status }) => {
    if (!db) throw new Error("Firebase not initialized");
    if (!id) throw new Error("Order ID required");
    if (!status) throw new Error("Status required");

    try {
        const updates = { status, timestampUpdate: serverTimestamp() };
        
        if (status === "shipped") {
            updates.shippingStatus = "shipped";
            updates.shippedAt = serverTimestamp();
        } else if (status === "delivered") {
            updates.shippingStatus = "delivered";
            updates.deliveredAt = serverTimestamp();
        } else if (status === "cancelled") {
            updates.cancelledAt = serverTimestamp();
        }
        
        await updateDoc(doc(db, "orders", id), updates);
        return { success: true };
    } catch (error) {
        throw error;
    }
};

export const updateShippingInfo = async ({ id, trackingNumber, carrier, estimatedDelivery }) => {
    if (!db) throw new Error("Firebase not initialized");
    if (!id) throw new Error("Order ID required");

    try {
        const updates = { timestampUpdate: serverTimestamp() };
        
        if (trackingNumber) updates.trackingNumber = trackingNumber;
        if (carrier) updates.carrier = carrier;
        if (estimatedDelivery) updates.estimatedDelivery = estimatedDelivery;
        
        updates.shippingStatus = "shipped";
        updates.status = "shipped";
        updates.shippedAt = serverTimestamp();
        
        await updateDoc(doc(db, "orders", id), updates);
        return { success: true };
    } catch (error) {
        throw error;
    }
};

export const updatePaymentStatus = async ({ id, paymentStatus, transactionId }) => {
    if (!db) throw new Error("Firebase not initialized");
    if (!id) throw new Error("Order ID required");

    try {
        const updates = {
            paymentStatus,
            timestampUpdate: serverTimestamp()
        };
        
        if (transactionId) updates.transactionId = transactionId;
        if (paymentStatus === "paid") {
            updates.paidAt = serverTimestamp();
            updates.status = "processing";
        }
        
        await updateDoc(doc(db, "orders", id), updates);
        return { success: true };
    } catch (error) {
        throw error;
    }
};

export const cancelOrder = async ({ id, reason }) => {
    if (!db) throw new Error("Firebase not initialized");
    if (!id) throw new Error("Order ID required");

    try {
        await updateDoc(doc(db, "orders", id), {
            status: "cancelled",
            cancelReason: reason,
            cancelledAt: serverTimestamp(),
            timestampUpdate: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        throw error;
    }
};

export const refundOrder = async ({ id, amount, reason }) => {
    if (!db) throw new Error("Firebase not initialized");
    if (!id) throw new Error("Order ID required");

    try {
        await updateDoc(doc(db, "orders", id), {
            status: "refunded",
            refundAmount: amount,
            refundReason: reason,
            refundedAt: serverTimestamp(),
            timestampUpdate: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        throw error;
    }
};