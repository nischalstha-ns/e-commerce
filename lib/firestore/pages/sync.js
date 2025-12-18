import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export const syncGlobalComponents = async (component, data) => {
  await setDoc(doc(db, "global", component), {
    ...data,
    lastUpdated: new Date().toISOString()
  }, { merge: true });
};

export const subscribeToGlobalChanges = (component, callback) => {
  return onSnapshot(doc(db, "global", component), (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  });
};

export const trackActiveUsers = async (pageId, userId) => {
  await setDoc(doc(db, "pages", pageId), {
    activeUsers: { [userId]: Date.now() }
  }, { merge: true });
};

export const savePageVersion = async (pageId, data) => {
  const versionId = Date.now().toString();
  await setDoc(doc(db, "pages", pageId, "versions", versionId), {
    ...data,
    timestamp: new Date().toISOString()
  });
  return versionId;
};
