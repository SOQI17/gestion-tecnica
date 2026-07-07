import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

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

const collections = ['engineers', 'clients', 'workOrders', 'reports'];

async function clearCollections() {
  console.log("Starting database clearance for project: mtorimec...");
  for (const colName of collections) {
    try {
      const colRef = collection(db, colName);
      const snapshot = await getDocs(colRef);
      console.log(`Collection '${colName}' has ${snapshot.size} documents.`);
      for (const docSnap of snapshot.docs) {
        await deleteDoc(doc(db, colName, docSnap.id));
        console.log(`Deleted document '${docSnap.id}' from '${colName}'`);
      }
      console.log(`Finished clearing '${colName}'`);
    } catch (error) {
      console.error(`Error clearing collection '${colName}':`, error);
    }
  }
  console.log("Database clearance finished.");
  process.exit(0);
}

clearCollections();
