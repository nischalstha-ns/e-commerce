import { db } from "../firebase";
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { clearCart } from "../cart/write";

export const createOrderFromCart = async ({ userId, shippingAddress, paymentMethod, tenantId = null }) => {
    if (!db) throw new Error("Firebase not initialized");
    if (!userId) throw new Error("User ID required");
    if (!shippingAddress) throw new Error("Shipping address required");
    if (!tenantId) throw new Error("Tenant ID required");

    try {
        const cartRef = doc(db, "carts", userId);
        const cartDoc = await getDoc(cartRef);
        
        if (!cartDoc.exists() || !cartDoc.data().items?.length) {
            throw new Error("Cart is empty");
        }

        const cartItems = cartDoc.data().items;
        const orderItems = [];
        let subtotal = 0;

        for (const item of cartItems) {
            const productRef = doc(db, "products", item.productId);
            const productDoc = await getDoc(productRef);
            
            if (!productDoc.exists()) continue;
            
            const product = productDoc.data();
            const price = product.salePrice || product.price;
            const itemTotal = price * item.quantity;
            
            orderItems.push({
                productId: item.productId,
                name: product.name,
                price,
                quantity: item.quantity,
                size: item.selectedSize || null,
                color: item.selectedColor || null,
                image: product.imageURLs?.[0] || product.imageURL || null,
                total: itemTotal
            });
            
            subtotal += itemTotal;
        }

        const shipping = calculateShipping(shippingAddress.country, subtotal);
        const tax = calculateTax(shippingAddress.state, subtotal);
        const total = subtotal + shipping + tax;
        const isCOD = paymentMethod === 'cod';

        const orderData = {
            tenantId,
            userId,
            orderNumber: `ORD-${Date.now()}`,
            items: orderItems,
            subtotal,
            shipping,
            tax,
            total,
            shippingAddress,
            paymentMethod,
            status: isCOD ? "processing" : "pending",
            paymentStatus: isCOD ? "cod" : "pending",
            shippingStatus: "not_shipped",
            estimatedDelivery: calculateDeliveryDate(shippingAddress.country),
            trackingNumber: null,
            codAmount: isCOD ? total : null,
            timestampCreate: serverTimestamp(),
            timestampUpdate: serverTimestamp()
        };

        const orderRef = await addDoc(collection(db, "orders"), orderData);
        await clearCart({ userId });

        return { id: orderRef.id, ...orderData };
    } catch (error) {
        throw error;
    }
};

export const createOrder = async ({ userId, items, shippingAddress, paymentMethod, tenantId = null }) => {
    if (!db) throw new Error("Firebase not initialized");
    if (!userId) throw new Error("User ID required");
    if (!items?.length) throw new Error("Order items required");
    if (!tenantId) throw new Error("Tenant ID required");

    try {
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const productRef = doc(db, "products", item.productId);
            const productDoc = await getDoc(productRef);
            
            if (!productDoc.exists()) continue;
            
            const product = productDoc.data();
            const price = item.price || product.salePrice || product.price;
            const itemTotal = price * item.quantity;
            
            orderItems.push({
                productId: item.productId,
                name: product.name,
                price,
                quantity: item.quantity,
                size: item.size || null,
                color: item.color || null,
                image: product.imageURLs?.[0] || product.imageURL || null,
                total: itemTotal
            });
            
            subtotal += itemTotal;
        }

        const shipping = calculateShipping(shippingAddress.country, subtotal);
        const tax = calculateTax(shippingAddress.state, subtotal);
        const total = subtotal + shipping + tax;
        const isCOD = paymentMethod === 'cod';

        const orderData = {
            tenantId,
            userId,
            orderNumber: `ORD-${Date.now()}`,
            items: orderItems,
            subtotal,
            shipping,
            tax,
            total,
            shippingAddress,
            paymentMethod,
            status: isCOD ? "processing" : "pending",
            paymentStatus: isCOD ? "cod" : "pending",
            shippingStatus: "not_shipped",
            estimatedDelivery: calculateDeliveryDate(shippingAddress.country),
            trackingNumber: null,
            codAmount: isCOD ? total : null,
            timestampCreate: serverTimestamp(),
            timestampUpdate: serverTimestamp()
        };

        const orderRef = await addDoc(collection(db, "orders"), orderData);
        return { id: orderRef.id, ...orderData };
    } catch (error) {
        throw error;
    }
};

function calculateShipping(country, subtotal) {
    if (subtotal >= 100) return 0;
    if (country === "US") return 9.99;
    if (country === "CA") return 14.99;
    return 24.99;
}

function calculateTax(state, subtotal) {
    const taxRates = {
        CA: 0.0725, NY: 0.08, TX: 0.0625, FL: 0.06, WA: 0.065
    };
    return subtotal * (taxRates[state] || 0);
}

function calculateDeliveryDate(country) {
    const daysToAdd = country === "US" ? 5 : country === "CA" ? 7 : 14;
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + daysToAdd);
    return deliveryDate;
}
