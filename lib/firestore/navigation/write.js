import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export async function updateNavigation(data) {
  const navRef = doc(db, "settings", "navigation");
  await setDoc(navRef, { ...data, lastUpdated: new Date().toISOString() }, { merge: true });
}
