import { NextRequest } from "next/server";

let adminApp: any = null;

async function getAdminApp() {
  if (adminApp) return adminApp;
  const { getApps, initializeApp, cert } = await import("firebase-admin/app");

  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!privateKey || !clientEmail || !projectId) {
    throw new Error(
      "Firebase Admin not configured. Set FIREBASE_ADMIN_PRIVATE_KEY, " +
        "FIREBASE_ADMIN_CLIENT_EMAIL and NEXT_PUBLIC_FIREBASE_PROJECT_ID."
    );
  }

  const apps = getApps();
  adminApp =
    apps.find((a) => a.name === "admin") ||
    initializeApp(
      { credential: cert({ projectId, clientEmail, privateKey }) },
      "admin"
    );
  return adminApp;
}

/** Firestore with admin privileges — bypasses security rules. Server only. */
export async function getAdminDb() {
  const app = await getAdminApp();
  const { getFirestore } = await import("firebase-admin/firestore");
  return getFirestore(app);
}

/** Verify a Firebase ID token from the Authorization header. Returns the uid or null. */
export async function verifyRequestToken(
  request: NextRequest
): Promise<string | null> {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.substring(7);
  if (!token) return null;
  try {
    const app = await getAdminApp();
    const { getAuth } = await import("firebase-admin/auth");
    const decoded = await getAuth(app).verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

/** Look up the role stored for a uid. Returns 'customer' when unknown. */
export async function getUserRole(uid: string): Promise<string> {
  try {
    const db = await getAdminDb();
    const snap = await db.collection("users").doc(uid).get();
    const role = snap.data()?.role;
    return ["admin", "shop", "customer"].includes(role) ? role : "customer";
  } catch {
    return "customer";
  }
}
