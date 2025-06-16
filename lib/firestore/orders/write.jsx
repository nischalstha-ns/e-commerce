import { db } from "@/lib/firestore/firebase";
import { collection, doc, setDoc, updateDoc, getDoc, Timestamp } from "firebase/firestore";

export const createNewOrder = async ({ userId, items, shippingAddress, paymentMethod, total }) => {
    if (!userId) {
        throw new Error("User ID is required");
    }
    if (!items || items.length === 0) {
        throw new Error("Order items are required");
    }
    if (!shippingAddress) {
        throw new Error("Shipping address is required");
    }

    const newId = doc(collection(db, "ids")).id;

    const orderData = {
        id: newId,
        userId,
        items,
        shippingAddress,
        paymentMethod,
        total: parseFloat(total),
        status: "pending",
        timestampCreate: Timestamp.now(),
        timestampUpdate: Timestamp.now(),
    };

    await setDoc(doc(db, `orders/${newId}`), orderData);
    return { id: newId };
};

export const updateOrderStatus = async ({ id, status, trackingNumber = null }) => {
    if (!id) {
        throw new Error("Order ID is required");
    }
    if (!status) {
        throw new Error("Status is required");
    }

    const orderRef = doc(db, `orders/${id}`);
    const orderSnapshot = await getDoc(orderRef);

    if (!orderSnapshot.exists()) {
        throw new Error("Order not found");
    }

    const updateData = {
        status,
        timestampUpdate: Timestamp.now(),
    };

    if (trackingNumber) {
        updateData.trackingNumber = trackingNumber;
    }

    await updateDoc(orderRef, updateData);
    return { id, status };
};