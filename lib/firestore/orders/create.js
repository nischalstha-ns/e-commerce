import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const createCODOrder = async ({ userId, items, total, customerInfo }) => {
    if (!db) {
        throw new Error("Firebase is not initialized");
    }

    if (!userId || !items || items.length === 0) {
        throw new Error("User ID and items are required");
    }

    if (!customerInfo?.name || !customerInfo?.phone || !customerInfo?.address) {
        throw new Error("Customer name, phone, and address are required");
    }

    try {
        const orderData = {
            userId,
            items,
            total,
            customerInfo: {
                name: customerInfo.name,
                email: customerInfo.email || "",
                phone: customerInfo.phone,
                address: customerInfo.address
            },
            status: "pending",
            paymentMethod: "cod",
            paymentStatus: "unpaid",
            type: "online",
            timestampCreate: serverTimestamp(),
            timestampUpdate: serverTimestamp()
        };

        const orderRef = await addDoc(collection(db, "orders"), orderData);
        
        return { 
            success: true, 
            orderId: orderRef.id 
        };
    } catch (error) {
        console.error("Error creating COD order:", error);
        throw error;
    }
};

export const createOrder = createCODOrder;
