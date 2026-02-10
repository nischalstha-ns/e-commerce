import { db } from "../firebase";
import { collection, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";

export async function createNewCollection(data) {
  try {
    if (!db) {
      throw new Error("Firebase not initialized");
    }
    
    const docRef = await addDoc(collection(db, "collections"), {
      ...data,
      createdAt: new Date().toISOString()
    });
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Create collection error:", error);
    throw error;
  }
}

export async function updateCollection(collectionId, data) {
  try {
    if (!db) {
      throw new Error("Firebase not initialized");
    }
    
    await updateDoc(doc(db, "collections", collectionId), {
      ...data,
      updatedAt: new Date().toISOString()
    });
    
    return { success: true };
  } catch (error) {
    console.error("Update collection error:", error);
    throw error;
  }
}

export async function deleteCollection(collectionId) {
  try {
    if (!db) {
      throw new Error("Firebase not initialized");
    }
    
    await deleteDoc(doc(db, "collections", collectionId));
    
    return { success: true };
  } catch (error) {
    console.error("Delete collection error:", error);
    throw error;
  }
}
