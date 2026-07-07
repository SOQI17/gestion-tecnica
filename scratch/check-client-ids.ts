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

async function checkClients() {
  const colRef = collection(db, 'clients');
  const snapshot = await getDocs(colRef);
  console.log(`Total clients in database: ${snapshot.size}`);
  
  // Search for anything with "hospital" or RUC "1760048450001" or similar
  let foundCount = 0;
  snapshot.docs.forEach(docSnap => {
    const data = docSnap.data();
    const name = (data.name || '').toLowerCase();
    const id = docSnap.id;
    
    // Check if ID is a RUC or if name contains hospital
    const isRuc = /^\d+$/.test(id);
    const hasHospital = name.includes('hospital');
    const hasEspecialidades = name.includes('especialidades');
    
    if (isRuc || hasHospital || hasEspecialidades || id === '1760048450001') {
      console.log(`Match - ID: ${id} | Name: ${data.name} | RUC Field: ${data.ruc || 'N/A'}`);
      foundCount++;
    }
  });
  
  console.log(`Found ${foundCount} matches.`);
  process.exit(0);
}

checkClients();
