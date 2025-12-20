import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const logActivity = async (activityData) => {
  if (!db) return;
  
  try {
    const activityRef = collection(db, "activity");
    await addDoc(activityRef, {
      ...activityData,
      timestamp: serverTimestamp(),
      ipAddress: await getClientIP(),
      device: getDeviceInfo()
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

const getClientIP = async () => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch {
    return "unknown";
  }
};

const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  if (/mobile/i.test(ua)) return "Mobile";
  if (/tablet/i.test(ua)) return "Tablet";
  return "Desktop";
};