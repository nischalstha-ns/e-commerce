import { db } from "../firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

export const markCODPaid = async ({ id, paidAmount, collectedBy }) => {
    if (!db) throw new Error("Firebase not initialized");
    if (!id) throw new Error("Order ID required");

    try {
        await updateDoc(doc(db, "orders", id), {
            paymentStatus: "paid",
            status: "delivered",
            codPaidAmount: paidAmount,
            codCollectedBy: collectedBy,
            codPaidAt: serverTimestamp(),
            timestampUpdate: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        throw error;
    }
};

export const markCODFailed = async ({ id, reason }) => {
    if (!db) throw new Error("Firebase not initialized");
    if (!id) throw new Error("Order ID required");

    try {
        await updateDoc(doc(db, "orders", id), {
            status: "failed",
            paymentStatus: "failed",
            codFailReason: reason,
            codFailedAt: serverTimestamp(),
            timestampUpdate: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        throw error;
    }
};
