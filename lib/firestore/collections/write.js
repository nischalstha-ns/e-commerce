import { db } from "../firebase";
import { collection, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { uploadProductImage } from "@/lib/utils/cloudinary";

export async function createNewCollection({ data, image = null }) {
  try {
    if (!db) {
      throw new Error("Firebase not initialized");
    }
    if (!data?.name) {
      throw new Error("Collection name is required");
    }

    let imageURL = data.imageURL || null;
    if (image) {
      const upload = await uploadProductImage(image, `collection_${Date.now()}`);
      imageURL = upload.url;
    }

    const docRef = await addDoc(collection(db, "collections"), {
      ...data,
      imageURL,
      createdAt: new Date().toISOString()
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Create collection error:", error);
    throw error;
  }
}

export async function updateCollection({ id, data, newImage = null }) {
  try {
    if (!db) {
      throw new Error("Firebase not initialized");
    }
    if (!id) {
      throw new Error("Collection ID is required");
    }

    const updates = { ...data };
    if (newImage) {
      const upload = await uploadProductImage(newImage, `collection_${id}`);
      updates.imageURL = upload.url;
    }

    await updateDoc(doc(db, "collections", id), {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    console.error("Update collection error:", error);
    throw error;
  }
}

export async function deleteCollection({ id }) {
  try {
    if (!db) {
      throw new Error("Firebase not initialized");
    }
    if (!id) {
      throw new Error("Collection ID is required");
    }

    await deleteDoc(doc(db, "collections", id));

    return { success: true };
  } catch (error) {
    console.error("Delete collection error:", error);
    throw error;
  }
}
