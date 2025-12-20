import useSWR from "swr";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

export const useActivity = () => {
  return useSWR("activity", () => {
    if (!db) return [];
    
    return new Promise((resolve, reject) => {
      const activityRef = collection(db, "activity");
      const q = query(activityRef, orderBy("timestamp", "desc"), limit(100));
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const activities = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          resolve(activities);
        },
        (error) => reject(error)
      );
      
      return () => unsubscribe();
    });
  });
};