"use client";

import useSWRSubscription from "swr/subscription";
import { supabase } from "../client";

export function useProducts(filters = {}) {
  const { data, error } = useSWRSubscription(
    ["products", JSON.stringify(filters)], 
    (_, { next }) => {
      if (!supabase) {
        next(new Error("Supabase is not initialized"), null);
        return () => {}; // Return no-op function
      }

      try {
        const channel = supabase
          .channel('products-changes')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'products' },
            (payload) => {
              fetchProducts();
            }
          )
          .subscribe();

        const fetchProducts = async () => {
          try {
            let query = supabase
              .from('products')
              .select('*');
            
            // Apply filters
            if (filters.category) {
              query = query.eq('category_id', filters.category);
            }
            if (filters.brand) {
              query = query.eq('brand_id', filters.brand);
            }
            if (filters.status) {
              query = query.eq('status', filters.status);
            }
            
            // Apply sorting
            query = query.order('created_at', { ascending: false });

            const { data: products, error } = await query;

            if (error) {
              next(error, null);
            } else {
              next(null, products);
            }
          } catch (err) {
            next(err, null);
          }
        };

        fetchProducts();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error("Error setting up products subscription:", error);
        next(error, null);
        return () => {}; // Return no-op function
      }
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}

export function useProductSearch(searchTerm) {
  const { data, error } = useSWRSubscription(
    ["products-search", searchTerm], 
    (_, { next }) => {
      if (!supabase) {
        next(new Error("Supabase is not initialized"), null);
        return () => {}; // Return no-op function
      }

      if (!searchTerm) {
        next(null, []);
        return () => {}; // Return no-op function for empty search
      }

      try {
        const fetchProducts = async () => {
          try {
            const { data: products, error } = await supabase
              .from('products')
              .select('*')
              .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
              .limit(20);

            if (error) {
              next(error, null);
            } else {
              next(null, products);
            }
          } catch (err) {
            next(err, null);
          }
        };

        fetchProducts();

        return () => {};
      } catch (error) {
        console.error("Error setting up product search subscription:", error);
        next(error, null);
        return () => {}; // Return no-op function
      }
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}