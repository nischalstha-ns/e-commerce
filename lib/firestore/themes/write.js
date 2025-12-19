"use client";

import { doc, setDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export const saveTheme = async (theme) => {
  try {
    await setDoc(doc(db, "themes", theme.id), {
      ...theme,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error("Error saving theme:", error);
    return { success: false, error: error.message };
  }
};

export const deleteTheme = async (themeId) => {
  try {
    await deleteDoc(doc(db, "themes", themeId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting theme:", error);
    return { success: false, error: error.message };
  }
};

export const setActiveTheme = async (theme) => {
  try {
    await setDoc(doc(db, "settings", "activeTheme"), {
      ...theme,
      activatedAt: new Date().toISOString()
    });
    
    const themesRef = collection(db, "themes");
    const snapshot = await getDocs(themesRef);
    
    const updatePromises = [];
    snapshot.forEach((doc) => {
      updatePromises.push(
        setDoc(doc.ref, {
          ...doc.data(),
          active: doc.id === theme.id
        })
      );
    });
    
    await Promise.all(updatePromises);
    return { success: true };
  } catch (error) {
    console.error("Error setting active theme:", error);
    return { success: false, error: error.message };
  }
};