import { db } from "@/lib/firestore/firebase";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";

export const createNewCategory = async ({ data, image }) => {
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
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET); // Using env variable
    formData.append("folder", "categories");

    const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
    });

    if (!cloudinaryResponse.ok) {
        throw new Error("Failed to upload image to Cloudinary");
    }

    const cloudinaryData = await cloudinaryResponse.json();
    const imageURL = cloudinaryData.secure_url; // Get the uploaded image URL

    // Store category data in Firestore
    await setDoc(doc(db, `categories/${newId}`), {
        ...data,
        id: newId,
        imageURL: imageURL, // Save Cloudinary image URL
        timestampCreate: Timestamp.now(),
    });

    return { id: newId, imageURL };
};
