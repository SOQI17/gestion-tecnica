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

async function checkEquipmentClients() {
  const colRef = collection(db, 'equipments');
  const snapshot = await getDocs(colRef);
  console.log(`Total equipments in database: ${snapshot.size}`);
  
  const targetIds = ["2612588INF2H", "2612588XEL1", "2670328SILVR", "2670356ALPHRT", "2671754SILVR"];
  
  snapshot.docs.forEach(docSnap => {
    const data = docSnap.data();
    const id = docSnap.id;
    if (targetIds.includes(id) || targetIds.includes(data.serialNumber)) {
      console.log(`Equipment - ID: ${id} | Name: ${data.name} | Serial: ${data.serialNumber} | ClientId: "${data.clientId}"`);
    }
  });
  process.exit(0);
}

checkEquipmentClients();
