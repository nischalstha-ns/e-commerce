import { db } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { uploadProductImage } from "@/lib/utils/cloudinary";

export async function createNewProduct({ data, images = [] }) {
  if (!db) throw new Error("Firebase not initialized");
  if (!data?.name) throw new Error("Product name is required");
  if (!data?.price || isNaN(data.price)) throw new Error("Valid price is required");
  if (!data?.sku) throw new Error("SKU is required");

  let imageURLs = data.imageURLs || (data.imageURL ? [data.imageURL] : []);

  if (images && images.length > 0) {
    const tempId = `temp_${Date.now()}`;
    const uploadResults = await Promise.all(
      images.map((img) => uploadProductImage(img, tempId))
    );
    imageURLs = uploadResults.map((r) => r.url);
  }

  const productData = {
    name: data.name,
    sku: data.sku,
    description: data.description || "",
    price: Number(data.price),
    salePrice: data.salePrice ? Number(data.salePrice) : null,
    stock: Number(data.stock) || 0,
    categoryId: data.categoryId || null,
    brandId: data.brandId || null,
    imageURL: imageURLs[0] || null,
    imageURLs: imageURLs,
    status: data.status || "active",
    tags: data.tags || [],
    rating: 0,
    reviewCount: 0,
    timestampCreate: serverTimestamp(),
    timestampUpdate: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "products"), productData);
  return { id: docRef.id, ...productData };
}

export async function updateProduct({ id, data, newImages = [] }) {
  if (!db) throw new Error("Firebase not initialized");
  if (!id) throw new Error("Product ID is required");

  let imageURLs = data.imageURLs || (data.imageURL ? [data.imageURL] : undefined);

  if (newImages && newImages.length > 0) {
    const uploadResults = await Promise.all(
      newImages.map((img) => uploadProductImage(img, id))
    );
    imageURLs = uploadResults.map((r) => r.url);
  }

  const updateData = {
    ...(data.name !== undefined && { name: data.name }),
    ...(data.sku !== undefined && { sku: data.sku }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.price !== undefined && { price: Number(data.price) }),
    ...(data.salePrice !== undefined && { salePrice: data.salePrice ? Number(data.salePrice) : null }),
    ...(data.stock !== undefined && { stock: Number(data.stock) }),
    ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
    ...(data.brandId !== undefined && { brandId: data.brandId }),
    ...(data.status !== undefined && { status: data.status }),
    ...(data.tags !== undefined && { tags: data.tags }),
    ...(imageURLs && { imageURLs, imageURL: imageURLs[0] || null }),
    timestampUpdate: serverTimestamp(),
  };

  await updateDoc(doc(db, "products", id), updateData);
  return { id, ...updateData };
}

export async function deleteProduct({ id }) {
  if (!db) throw new Error("Firebase not initialized");
  if (!id) throw new Error("Product ID is required");
  await deleteDoc(doc(db, "products", id));
  return { success: true };
}
