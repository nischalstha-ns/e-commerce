import { db } from "@/lib/firestore/firebase";
import { collection, doc, setDoc, deleteDoc, query, where, getDocs, Timestamp } from "firebase/firestore";

export const addAdmin = async ({ email, name }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!email) {
        throw new Error("Email is required");
    }
    if (!name) {
        throw new Error("Name is required");
    }

    try {
        // Check if admin already exists
        const adminsRef = collection(db, "admins");
        const q = query(adminsRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            throw new Error("This email is already registered as an admin");
        }

        // Create new admin document
        const newId = doc(collection(db, "ids")).id;
        
        await setDoc(doc(db, `admins/${newId}`), {
            id: newId,
            email: email.toLowerCase(),
            name,
            timestampCreate: Timestamp.now(),
        });

        return { id: newId };
    } catch (error) {
        console.error("Error adding admin:", error);
        throw error;
    }
};

export const deleteAdmin = async ({ id }) => {
    if (!db) {
        throw new Error("Firebase is not initialized. Please check your configuration.");
    }
    
    if (!id) {
        throw new Error("Admin ID is required");
    }

    try {
        await deleteDoc(doc(db, `admins/${id}`));
    } catch (error) {
        console.error("Error deleting admin:", error);
        throw error;
    }
};