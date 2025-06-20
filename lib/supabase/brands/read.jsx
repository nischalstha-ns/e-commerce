"use client";

import useSWRSubscription from "swr/subscription";
import { supabase } from "../client";

export function useBrands() {
  const { data, error } = useSWRSubscription(
    "brands", 
    (_, { next }) => {
      if (!supabase) {
        next(new Error("Supabase is not initialized"), null);
        return () => {}; // Return no-op function
      }

      try {
        const channel = supabase
          .channel('brands-changes')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'brands' },
            (payload) => {
              fetchBrands();
            }
          )
          .subscribe();

        const fetchBrands = async () => {
          try {
            const { data: brands, error } = await supabase
              .from('brands')
              .select('*')
              .order('created_at', { ascending: false });

            if (error) {
              next(error, null);
            } else {
              next(null, brands);
            }
          } catch (err) {
            next(err, null);
          }
        };

        fetchBrands();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error("Error setting up brands subscription:", error);
        next(error, null);
        return () => {}; // Return no-op function
      }
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}