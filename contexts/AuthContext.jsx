"use client"

import { auth, db } from "@/lib/firestore/firebase";
import { createOrUpdateUser, getUserRole } from "@/lib/firestore/users/write";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export default function AuthContextProvider({ children }) {
    const [user, setUser] = useState(undefined);
    const [userRole, setUserRole] = useState(null);
    
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Create or update user in Firestore
                try {
                    await createOrUpdateUser({
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                    });

                    // Get user role
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    const role = userDoc.exists() ? userDoc.data().role || "user" : "user";
                    
                    setUser(user);
                    setUserRole(role);
                } catch (error) {
                    console.error("Error creating/updating user:", error);
                    setUser(user);
                    setUserRole("user");
                }
            } else {
                setUser(null);
                setUserRole(null);
            }
        });
        return () => unsub();
    }, []);

    return (
        <AuthContext.Provider value={{
            user, 
            userRole,
            isLoading: user === undefined,
            isAdmin: userRole === "admin",
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);