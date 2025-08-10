import useSWRSubscription from "swr/subscription";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

export function useHomepageSettings() {
    const { data, error } = useSWRSubscription(
        "homepage-settings",
        (_, { next }) => {
            if (!db) {
                next(null, {});
                return () => {};
            }

            try {
                const homepageRef = doc(db, "settings", "homepage");
                
                const unsubscribe = onSnapshot(homepageRef, (doc) => {
                    if (doc.exists()) {
                        next(null, doc.data());
                    } else {
                        next(null, {});
                    }
                }, (error) => {
                    next(null, {});
                });

                return unsubscribe;
            } catch (error) {
                next(null, {});
                return () => {};
            }
        },
        { fallbackData: {} }
    );

    return { data: data || {}, error, isLoading: data === undefined };
}