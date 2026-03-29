import { db } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { uploadToCloudinary } from "@/lib/utils/cloudinary";

export async function createNewBrand({ data, image }) {
  if (!db) throw new Error("Firebase not initialized");
  if (!data?.name) throw new Error("Brand name is required");
  if (!data?.slug) throw new Error("Brand slug is required");

  let imageURL = data.imageURL || null;

  if (image) {
    const result = await uploadToCloudinary(image, { folder: "brands" });
    imageURL = result.url;
  }

  const brandData = {
    name: data.name,
    slug: data.slug,
    description: data.description || "",
    imageURL,
    status: data.status || "active",
    timestampCreate: serverTimestamp(),
    timestampUpdate: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "brands"), brandData);
  return { id: docRef.id, ...brandData };
}

export async function updateBrand({ id, data, newImage }) {
  if (!db) throw new Error("Firebase not initialized");
  if (!id) throw new Error("Brand ID is required");

  let imageURL = data.imageURL;

  if (newImage) {
    const result = await uploadToCloudinary(newImage, { folder: "brands" });
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

  await updateDoc(doc(db, "brands", id), updateData);
  return { id, ...updateData };
}

export async function deleteBrand({ id }) {
  if (!db) throw new Error("Firebase not initialized");
  if (!id) throw new Error("Brand ID is required");
  await deleteDoc(doc(db, "brands", id));
  return { success: true };
}
