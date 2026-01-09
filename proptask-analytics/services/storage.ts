import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Uses the default app initialized in services/firebase.ts.
// getStorage() without args uses the default app instance.

export async function uploadTaskImage(file: File): Promise<string> {
  const storage = getStorage();
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const objectRef = ref(storage, `tasks/${id}`);
  await uploadBytes(objectRef, file);
  return await getDownloadURL(objectRef);
}
