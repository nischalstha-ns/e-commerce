"use client";

import useSWRSubscription from "swr/subscription";
import { supabase } from "../client";

export function useCategories() {
  const { data, error } = useSWRSubscription(
    "categories", 
    (_, { next }) => {
      if (!supabase) {
        next(new Error("Supabase is not initialized"), null);
        return () => {}; // Return no-op function
      }

      try {
        const channel = supabase
          .channel('categories-changes')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'categories' },
            (payload) => {
              fetchCategories();
            }
          )
          .subscribe();

        const fetchCategories = async () => {
          try {
            const { data: categories, error } = await supabase
              .from('categories')
              .select('*')
              .order('created_at', { ascending: false });

            if (error) {
              next(error, null);
            } else {
              next(null, categories);
            }
          } catch (err) {
            next(err, null);
          }
        };

        fetchCategories();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error("Error setting up categories subscription:", error);
        next(error, null);
        return () => {}; // Return no-op function
      }
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}