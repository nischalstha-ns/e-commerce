"use client";

import useSWRSubscription from "swr/subscription";
import { supabase } from "../client";

export function useCart(userId) {
  const { data, error } = useSWRSubscription(
    userId ? ["cart", userId] : null,
    (_, { next }) => {
      if (!supabase || !userId) {
        next(new Error("Supabase is not initialized or user ID missing"), null);
        return () => {};
      }

      try {
        const channel = supabase
          .channel(`cart-${userId}`)
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'cart_items', filter: `user_id=eq.${userId}` },
            (payload) => {
              fetchCart();
            }
          )
          .subscribe();

        const fetchCart = async () => {
          try {
            const { data: cartItems, error } = await supabase
              .from('cart_items')
              .select('*')
              .eq('user_id', userId);

            if (error) {
              next(error, null);
            } else {
              const cart = {
                id: userId,
                items: cartItems || [],
                total: cartItems?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0,
                itemCount: cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0
              };
              next(null, cart);
            }
          } catch (err) {
            next(err, null);
          }
        };

        fetchCart();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error("Error setting up cart subscription:", error);
        next(error, null);
        return () => {};
      }
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}