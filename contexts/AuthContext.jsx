"use client"

import { auth, db } from "@/lib/firestore/firebase";
import { createOrUpdateUser } from "@/lib/firestore/users/write";
import { getUserRole } from "@/lib/firestore/users/read";
import { onAuthStateChanged } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export default function AuthContextProvider({ children }) {
    const [user, setUser] = useState(undefined);
    const [userRole, setUserRole] = useState(null);
    
    useEffect(() => {
        if (!auth || !db) {
            setUser(null);
            setUserRole(null);
            return;
        }

        const unsub = onAuthStateChanged(auth, async (user) => {
            try {
                if (user) {
                    try {
                        // Get user role from users collection
                        const role = await getUserRole(user.uid) || "user";

                        await createOrUpdateUser({
                            uid: user.uid,
                            email: user.email,
                            displayName: user.displayName,
                            photoURL: user.photoURL,
                            role: role,
                        });
                        
                        setUser(user);
                        setUserRole(role);
                    } catch (error) {
                        console.error("Error syncing user:", error);
                        setUser(user);
                        setUserRole("user");
                    }
                } else {
                    setUser(null);
                    setUserRole(null);
                }
            } catch (error) {
                console.error("Auth error:", error);
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