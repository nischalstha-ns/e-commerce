import { db } from "@/lib/firestore/firebase";
import { collection, deleteDoc, doc, getDoc, setDoc, Timestamp } from "firebase/firestore";

export const createNewBrand = async ({ data, image }) => {
    if (!image) {
        throw new Error("Image is required");
    }
    if (!data?.name) {
        throw new Error("Name is required");
    }
    if (!data?.slug) {
        throw new Error("Slug is required");
    }

    const newId = doc(collection(db, "ids")).id;

    // Upload image to Cloudinary
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", "brands");

    const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
    });

    if (!cloudinaryResponse.ok) {
        throw new Error("Failed to upload image to Cloudinary");
    }

    const cloudinaryData = await cloudinaryResponse.json();
    const imageURL = cloudinaryData.secure_url;

    await setDoc(doc(db, `brands/${newId}`), {
        ...data,
        id: newId,
        imageURL: imageURL,
        timestampCreate: Timestamp.now(),
    });

    return { id: newId, imageURL };
};

const deleteImageFromCloudinary = async (imageURL) => {
    if (!imageURL) return;

    const parts = imageURL.split("/");
    const publicIdWithExtension = parts[parts.length - 1];
    const publicId = publicIdWithExtension.split(".")[0];

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    try {
        await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
            method: "POST",
            body: JSON.stringify({
                public_id: `brands/${publicId}`,
                api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("Cloudinary Deletion Error:", error);
    }
};

export const deleteBrand = async ({ id }) => {
    if (!id) {
        throw new Error("ID is required");
    }

    const brandRef = doc(db, `brands/${id}`);
    const brandSnapshot = await getDoc(brandRef);

    if (!brandSnapshot.exists()) {
        throw new Error("Brand not found");
    }

    const brandData = brandSnapshot.data();
    await deleteImageFromCloudinary(brandData.imageURL);
    await deleteDoc(brandRef);
};