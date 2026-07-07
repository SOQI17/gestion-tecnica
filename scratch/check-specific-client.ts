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

async function checkSpecificClient() {
  const colRef = collection(db, 'clients');
  const snapshot = await getDocs(colRef);
  
  console.log("Checking for 1760048450001 or especialidades...");
  snapshot.docs.forEach(docSnap => {
    const data = docSnap.data();
    const name = data.name || '';
    const id = docSnap.id;
    
    if (id.includes("176004845000") || name.toLowerCase().includes("especialidades") || id.startsWith("17600")) {
      console.log(`FOUND: ID: ${id} | Name: ${name}`);
    }
  });
  process.exit(0);
}

checkSpecificClient();
