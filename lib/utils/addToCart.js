import { addToCart as addToCartDB } from "@/lib/firestore/cart/write";
import toast from "react-hot-toast";

export async function addToCart(user, product, quantity = 1, options = {}, router = null) {
  if (!user) {
    toast.error("Please login to add items to cart");
    if (router) {
      router.push("/login");
    }
    return false;
  }

  try {
    await addToCartDB(user.uid, product.id, quantity, {
      selectedSize: options.size || null,
      selectedColor: options.color || null
    });
    
    toast.success("Added to cart! Redirecting...", {
      duration: 1500,
      icon: "🛒"
    });

    // Redirect to cart after 800ms
    if (router) {
      setTimeout(() => {
        router.push("/cart");
      }, 800);
    }

    return true;
  } catch (error) {
    toast.error("Failed to add to cart");
    console.error(error);
    return false;
  }
}
