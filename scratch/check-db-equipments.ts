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

async function checkDb() {
  const colRef = collection(db, 'equipments');
  const snapshot = await getDocs(colRef);
  console.log(`Total equipments in database: ${snapshot.size}`);
  
  const stats: Record<string, number> = {};
  const sampleEmpty: any[] = [];
  const sampleNonEmpty: any[] = [];
  
  snapshot.docs.forEach(docSnap => {
    const data = docSnap.data();
    const cId = data.clientId || "";
    let type = "Empty";
    if (cId) {
      if (cId.startsWith("CLI-DYN")) type = "CLI-DYN";
      else if (cId.startsWith("CLI-")) type = "CLI";
      else if (/^\d+$/.test(cId)) type = "RUC";
      else type = "Other (" + cId + ")";
    }
    
    stats[type] = (stats[type] || 0) + 1;
    
    if (cId === "") {
      if (sampleEmpty.length < 5) {
        sampleEmpty.push({ id: docSnap.id, name: data.name, model: data.model, serial: data.serialNumber });
      }
    } else {
      if (sampleNonEmpty.length < 5) {
        sampleNonEmpty.push({ id: docSnap.id, name: data.name, clientId: cId, model: data.model, serial: data.serialNumber });
      }
    }
  });
  
  console.log("Stats:", stats);
  console.log("Sample Empty Client Equipments:", sampleEmpty);
  console.log("Sample Non-Empty Client Equipments:", sampleNonEmpty);
  process.exit(0);
}

checkDb();
