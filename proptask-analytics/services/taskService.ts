import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  arrayUnion
} from "firebase/firestore";
import { db } from "./firebase";
import { MaintenanceTask, TaskStatus, StatusComment } from "../types";

const COLLECTION_NAME = "tasks";

// Lytte på oppgaver i sanntid
export const subscribeToTasks = (callback: (tasks: MaintenanceTask[]) => void) => {
  const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
  
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MaintenanceTask[];
    callback(tasks);
  });
};

// Legge til ny oppgave
export const addTask = async (task: MaintenanceTask) => {
  // Vi fjerner ID fordi Firestore lager sin egen
  const { id, ...taskData } = task;
  // Fjern undefined-verdier (Firestore godtar ikke undefined)
  const cleanedData = Object.fromEntries(
    Object.entries(taskData).filter(([_, v]) => v !== undefined)
  );
  console.log('addTask: Skriver til Firestore...', { dataSize: JSON.stringify(cleanedData).length });
  const docRef = await addDoc(collection(db, COLLECTION_NAME), cleanedData);
  console.log('addTask: Dokument lagret med ID:', docRef.id);
};

// Oppdatere status med valgfri kommentar
export const updateTaskStatus = async (id: string, status: TaskStatus, comment?: string) => {
  const taskRef = doc(db, COLLECTION_NAME, id);

  if (comment && comment.trim()) {
    const statusComment: StatusComment = {
      id: crypto.randomUUID(),
      status,
      comment: comment.trim(),
      createdAt: Date.now()
    };
    await updateDoc(taskRef, {
      status,
      statusComments: arrayUnion(statusComment)
    });
  } else {
    await updateDoc(taskRef, { status });
  }
};

// Slette oppgave
export const deleteTask = async (id: string) => {
  const taskRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(taskRef);
};