import useSWR from "swr";
import { db } from "../firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export const useRoles = () => {
  return useSWR("roles", () => {
    if (!db) return [];
    
    return new Promise((resolve, reject) => {
      const rolesRef = collection(db, "roles");
      const q = query(rolesRef, orderBy("createdAt", "desc"));
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const roles = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          resolve(roles);
        },
        (error) => reject(error)
      );
      
      return () => unsubscribe();
    });
  });
};