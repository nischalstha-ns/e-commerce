"use client"

import { Children, createContext, useContext, useState } from "react";

const AuthContext=createContext();

export default function AuthContextProvider({children}){
    const [user, setUser]=useState(undefined);
    
    return<AuthContext.Provider>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);