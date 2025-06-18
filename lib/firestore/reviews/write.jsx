import { db } from "@/lib/firestore/firebase";
import { collection, doc, setDoc, updateDoc, deleteDoc, getDoc, Timestamp } from "firebase/firestore";

export const createNewReview = async ({ productId, userId, rating, comment, userName, userEmail }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!productId) {
        throw new Error("Product ID is required");
    }
    if (!userId) {
        throw new Error("User ID is required");
    }
    if (!rating || rating < 1 || rating > 5) {
        throw new Error("Rating must be between 1 and 5");
    }
    if (!comment || comment.trim().length === 0) {
        throw new Error("Comment is required");
    }

    try {
        const newId = doc(collection(db, "ids")).id;

        const reviewData = {
            id: newId,
            productId,
            userId,
            rating: parseInt(rating),
            comment: comment.trim(),
            userName: userName || "Anonymous",
            userEmail: userEmail || "",
            status: "pending", // Default to pending for moderation
            timestampCreate: Timestamp.now(),
            timestampUpdate: Timestamp.now(),
        };

        await setDoc(doc(db, `reviews/${newId}`), reviewData);
        return { id: newId };
    } catch (error) {
        console.error("Error creating review:", error);
        throw error;
    }
};

export const updateReviewStatus = async ({ id, status, adminNote = null }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!id) {
        throw new Error("Review ID is required");
    }
    if (!status || !["approved", "pending", "rejected"].includes(status)) {
        throw new Error("Status must be approved, pending, or rejected");
    }

    try {
        const reviewRef = doc(db, `reviews/${id}`);
        const reviewSnapshot = await getDoc(reviewRef);

        if (!reviewSnapshot.exists()) {
            throw new Error("Review not found");
        }

        const updateData = {
            status,
            timestampUpdate: Timestamp.now(),
        };

        if (adminNote) {
            updateData.adminNote = adminNote;
        }

        await updateDoc(reviewRef, updateData);
        return { id, status };
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
        const reviewRef = doc(db, `reviews/${id}`);
        const reviewSnapshot = await getDoc(reviewRef);

        if (!reviewSnapshot.exists()) {
            throw new Error("Review not found");
        }

        await deleteDoc(reviewRef);
    } catch (error) {
        console.error("Error deleting review:", error);
        throw error;
    }
};

export const updateReview = async ({ id, comment, rating }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!id) {
        throw new Error("Review ID is required");
    }

    try {
        const reviewRef = doc(db, `reviews/${id}`);
        const reviewSnapshot = await getDoc(reviewRef);

        if (!reviewSnapshot.exists()) {
            throw new Error("Review not found");
        }

        const updateData = {
            timestampUpdate: Timestamp.now(),
        };

        if (comment !== undefined) {
            updateData.comment = comment.trim();
        }
        if (rating !== undefined) {
            updateData.rating = parseInt(rating);
        }

        await updateDoc(reviewRef, updateData);
        return { id };
    } catch (error) {
        console.error("Error updating review:", error);
        throw error;
    }
};