"use client"

import { auth } from "@/lib/firestore/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Children, createContext, useContext, useEffect, useState } from "react";

const AuthContext=createContext();

export default function AuthContextProvider({children}){
    const [user, setUser]=useState(undefined);
    
    useEffect(()=>{
        const unsub= onAuthStateChanged(auth, (user)=>{
            if(user){
                setUser(user);

            }else {
                setUser(null);
            }
        });
        return()=>unsub();

    },[]);
    return<AuthContext.Provider value={{
        user, 
        isloading: user === undefined,

    }}
    >
        {children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);