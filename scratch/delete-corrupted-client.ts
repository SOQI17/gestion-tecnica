import { initializeApp } from "firebase/app";
import { getFirestore, doc, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD8dazEcOdDSyyzRmlMu2O46jsObsAuZjo",
  authDomain: "mtorimec.firebaseapp.com",
  projectId: "mtorimec",
  storageBucket: "mtorimec.firebasestorage.app",
  messagingSenderId: "927102023453",
  appId: "1:927102023453:web:5af9acce750582a25b13f4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteCorruptedClient() {
  const docId = "CLI-DYN-255-17";
  console.log(`Deleting client with ID: ${docId} from Firestore...`);
  try {
    const docRef = doc(db, 'clients', docId);
    await deleteDoc(docRef);
    console.log(`Successfully deleted client ${docId}`);
  } catch (error) {
    console.error("Error deleting client:", error);
  }
  process.exit(0);
}

deleteCorruptedClient();
