import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

async function listClients() {
  console.log("Fetching clients from Firestore...");
  const colRef = collection(db, 'clients');
  const snapshot = await getDocs(colRef);
  console.log(`Total clients in database: ${snapshot.size}`);
  snapshot.docs.forEach(docSnap => {
    const data = docSnap.data();
    console.log(`ID: ${docSnap.id} | Name: ${data.name}`);
  });
  process.exit(0);
}

listClients();
