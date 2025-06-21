import { db } from "../firebase";
import { doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

export const updateReviewStatus = async ({ id, status, adminNote = null }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!id) {
        throw new Error("Review ID is required");
    }
    if (!status) {
        throw new Error("Status is required");
    }

    try {
        const reviewRef = doc(db, "reviews", id);
        const updateData = {
            status,
            timestampUpdate: serverTimestamp()
        };

        if (adminNote) {
            updateData.adminNote = adminNote;
        }

        await updateDoc(reviewRef, updateData);

        return { success: true };
    } catch (error) {
        console.error("Error updating review status:", error);
        throw error;
    }
};

export const deleteReview = async ({ id }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!id) {
        throw new Error("Review ID is required");
    }

    try {
        await deleteDoc(doc(db, "reviews", id));
        return { success: true };
    } catch (error) {
        console.error("Error deleting review:", error);
        throw error;
    }
};