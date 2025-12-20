import { db } from "../firebase";
import { collection, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

export const createRole = async (roleData) => {
  if (!db) throw new Error("Database not initialized");
  
  const rolesRef = collection(db, "roles");
  const docRef = await addDoc(rolesRef, {
    ...roleData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  return docRef.id;
};

export const updateRole = async (roleId, roleData) => {
  if (!db) throw new Error("Database not initialized");
  
  const roleRef = doc(db, "roles", roleId);
  await updateDoc(roleRef, {
    ...roleData,
    updatedAt: serverTimestamp()
  });
};

export const deleteRole = async (roleId) => {
  if (!db) throw new Error("Database not initialized");
  
  const roleRef = doc(db, "roles", roleId);
  await deleteDoc(roleRef);
};