"use client";

import useSWRSubscription from "swr/subscription";
import { supabase } from "../client";

export function useAdmins() {
  const { data, error } = useSWRSubscription(
    "admins", 
    (_, { next }) => {
      if (!supabase) {
        next(new Error("Supabase is not initialized"), null);
        return () => {}; // Return no-op function
      }

      try {
        const channel = supabase
          .channel('admins-changes')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'admins' },
            (payload) => {
              // Refetch data when changes occur
              fetchAdmins();
            }
          )
          .subscribe();

        const fetchAdmins = async () => {
          try {
            const { data: admins, error } = await supabase
              .from('admins')
              .select('*')
              .order('created_at', { ascending: false });

            if (error) {
              next(error, null);
            } else {
              next(null, admins);
            }
          } catch (err) {
            next(err, null);
          }
        };

        fetchAdmins();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error("Error setting up admins subscription:", error);
        next(error, null);
        return () => {}; // Return no-op function
      }
    }
  );

  return { data, error: error?.message, isLoading: data === undefined };
}