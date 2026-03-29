import { db } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { uploadCategoryImage } from "@/lib/utils/cloudinary";

export async function createNewCategory({ data, image }) {
  if (!db) throw new Error("Firebase not initialized");
  if (!data?.name) throw new Error("Category name is required");
  if (!data?.slug) throw new Error("Category slug is required");

  let imageURL = data.imageURL || null;

  if (image) {
    const tempId = `temp_${Date.now()}`;
    const result = await uploadCategoryImage(image, tempId);
    imageURL = result.url;
  }

  const categoryData = {
    name: data.name,
    slug: data.slug,
    description: data.description || "",
    imageURL,
    status: data.status || "active",
    timestampCreate: serverTimestamp(),
    timestampUpdate: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "categories"), categoryData);
  return { id: docRef.id, ...categoryData };
}

export async function updateCategory({ id, data, newImage }) {
  if (!db) throw new Error("Firebase not initialized");
  if (!id) throw new Error("Category ID is required");

  let imageURL = data.imageURL;

  if (newImage) {
    const result = await uploadCategoryImage(newImage, id);
    imageURL = result.url;
  }

  const updateData = {
    ...(data.name !== undefined && { name: data.name }),
    ...(data.slug !== undefined && { slug: data.slug }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.status !== undefined && { status: data.status }),
    ...(imageURL !== undefined && { imageURL }),
    timestampUpdate: serverTimestamp(),
  };

  await updateDoc(doc(db, "categories", id), updateData);
  return { id, ...updateData };
}

export async function deleteCategory({ id }) {
  if (!db) throw new Error("Firebase not initialized");
  if (!id) throw new Error("Category ID is required");
  await deleteDoc(doc(db, "categories", id));
  return { success: true };
}
