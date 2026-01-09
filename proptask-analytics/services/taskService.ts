import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot 
} from "firebase/firestore";
import { db } from "./firebase";
import { MaintenanceTask, TaskStatus } from "../types";

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
  await addDoc(collection(db, COLLECTION_NAME), cleanedData);
};

// Oppdatere status
export const updateTaskStatus = async (id: string, status: TaskStatus) => {
  const taskRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(taskRef, { status });
};

// Slette oppgave
export const deleteTask = async (id: string) => {
  const taskRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(taskRef);
};