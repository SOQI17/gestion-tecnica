const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'temp_capacitacion', 'src', 'App.tsx');
const destPath = path.join(__dirname, '..', 'src', 'components', 'CapacitacionesPortal.tsx');

let content = fs.readFileSync(srcPath, 'utf8');

// Replace imports
content = content.replace(
  "import { db } from './firebase-cfg';",
  "import { db } from '../firebase';\nimport { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch, getDocs } from 'firebase/firestore';"
);
content = content.replace(
  "import { Ingeniero, Curso, HistorialEntrenamiento } from './types';",
  "import { Engineer, Curso, HistorialEntrenamiento } from '../types';"
);
content = content.replace(
  "import {\n  collection,\n  getDocs,\n  setDoc,\n  doc,\n  deleteDoc,\n  writeBatch\n} from 'firebase/firestore';",
  ""
);
content = content.replace(
  "import { \n  MOCK_CURSOS_GE_FE_CSV, \n  INGENIEROS_NORM_SEMILLA, \n  CURSOS_NORM_SEMILLA,\n  HISTORIAL_NORM_SEMILLA \n} from './initial-data';",
  "import { MOCK_CURSOS_GE_FE_CSV, INGENIEROS_NORM_SEMILLA, CURSOS_NORM_SEMILLA, HISTORIAL_NORM_SEMILLA } from '../utils/capacitacionInitialData';"
);
content = content.replace(
  "import { \n  parseAndUnpivotCSV, \n  obtenerProximoCursoIngeniero, \n  sanitizeId,\n  ALL_MODALITIES_LIST,\n  getModKey,\n  getLevelNum,\n  getSimilarity,\n  resolveEngineerId\n} from './utils';",
  "import { parseAndUnpivotCSV, obtenerProximoCursoIngeniero, sanitizeId, ALL_MODALITIES_LIST, getModKey, getLevelNum, getSimilarity, resolveEngineerId } from '../utils/capacitacionUtils';"
);

// Replace component declaration
content = content.replace(
  "export default function App() {",
  "interface CapacitacionesPortalProps {\n  engineers: Engineer[];\n}\n\nexport default function CapacitacionesPortal({ engineers }: CapacitacionesPortalProps) {"
);

// Replace ingenieros state declaration and initialize with mapped engineers
content = content.replace(
  "  const [ingenieros, setIngenieros] = useState<Ingeniero[]>([]);",
  "  const ingenieros = useMemo(() => {\n    return engineers.map(eng => ({\n      id: eng.id,\n      nombre: eng.name,\n      sede: eng.sede || 'Quito'\n    }));\n  }, [engineers]);"
);

// Adjust parsedPreview type in state
content = content.replace(
  `  const [parsedPreview, setParsedPreview] = useState<{
    ingenieros: Ingeniero[];
    cursos: Curso[];
    historial: HistorialEntrenamiento[];
  } | null>(null);`,
  `  const [parsedPreview, setParsedPreview] = useState<{
    ingenieros: Engineer[];
    cursos: Curso[];
    historial: HistorialEntrenamiento[];
  } | null>(null);`
);

// Adjust fetchAllCollections to not fetch ingenieros and to use real-time listeners or load them
content = content.replace(
  `      // 1. Fetch Ingenieros
      const ingSnap = await getDocs(collection(db, 'ingenieros'));
      const ingList: Ingeniero[] = [];
      ingSnap.forEach((d) => {
        ingList.push({ id: d.id, ...d.data() } as Ingeniero);
      });`,
  `      // 1. Fetch Ingenieros (Mapeados desde props)
      const ingList = engineers.map(eng => ({
        id: eng.id,
        nombre: eng.name,
        sede: eng.sede || 'Quito'
      }));`
);

// Update fetchAllCollections sets
content = content.replace(
  "      setIngenieros(ingList);",
  "      // setIngenieros(ingList);"
);

// Replace default selection in fetchAllCollections
content = content.replace(
  "      if (ingList.length > 0 && !selectedRouteIngenieroId) {\n        setSelectedRouteIngenieroId(ingList[0].id);\n      }",
  "      if (engineers.length > 0 && !selectedRouteIngenieroId) {\n        setSelectedRouteIngenieroId(engineers[0].id);\n      }"
);

// Modify handleLoadSeedToFirestore
content = content.replace(
  `      // Create batch or setDoc consecutively
      for (const ing of INGENIEROS_NORM_SEMILLA) {
        await setDoc(doc(db, 'ingenieros', ing.id), {
          nombre: ing.nombre,
          sede: ing.sede
        });
      }`,
  `      // Create batch or setDoc consecutively (Linked to engineers)
      for (const ing of INGENIEROS_NORM_SEMILLA) {
        const cleanName = ing.name.replace(/^ing\\.\\s+/i, '');
        await setDoc(doc(db, 'engineers', ing.id), {
          id: ing.id,
          name: ing.name,
          sede: ing.sede,
          specialty: 'Ingeniería',
          email: \`\${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}@orimec.com\`,
          phone: '+593 999 999 999',
          avatar: '',
          availability: 'Disponible',
          skills: ['Ingeniería']
        }, { merge: true });
      }`
);

// Modify handleImportCSVToFirestore
content = content.replace(
  `      // ── STEP 1: Eliminar todos los documentos existentes (evita duplicados) ──
      const collectionsToWipe = ['ingenieros', 'cursos', 'historial_entrenamiento'];
      for (const col of collectionsToWipe) {
        const snap = await getDocs(collection(db, col));
        // Firestore batch supports up to 500 ops; chunk if needed
        const ids = snap.docs.map(d => d.id);
        for (let i = 0; i < ids.length; i += 400) {
          const batch = writeBatch(db);
          ids.slice(i, i + 400).forEach(id => batch.delete(doc(db, col, id)));
          await batch.commit();
        }
      }`,
  `      // ── STEP 1: Eliminar cursos e historial de entrenamiento (evita duplicados, ingenieros se preservan) ──
      const collectionsToWipe = ['cursos', 'historial_entrenamiento'];
      for (const col of collectionsToWipe) {
        const snap = await getDocs(collection(db, col));
        const ids = snap.docs.map(d => d.id);
        for (let i = 0; i < ids.length; i += 400) {
          const batch = writeBatch(db);
          ids.slice(i, i + 400).forEach(id => batch.delete(doc(db, col, id)));
          await batch.commit();
        }
      }`
);

content = content.replace(
  `      const batchIng = writeBatch(db);
      for (const ing of parsedPreview.ingenieros) {
        batchIng.set(doc(db, 'ingenieros', ing.id), { nombre: ing.nombre, sede: ing.sede });
        countIng++;
      }
      await batchIng.commit();`,
  `      // Upsert to engineers collection
      for (const ing of parsedPreview.ingenieros) {
        const existing = engineers.find(e => e.id === ing.id);
        const nameVal = ing.name || '';
        const cleanNameVal = nameVal.replace(/^ing\\.\\s+/i, '');
        const newEngData = {
          id: ing.id,
          name: existing?.name || cleanNameVal,
          sede: ing.sede,
          specialty: existing?.specialty || 'Ingeniería',
          email: existing?.email || \`\${cleanNameVal.toLowerCase().replace(/[^a-z0-9]/g, '')}@orimec.com\`,
          phone: existing?.phone || '+593 999 999 999',
          avatar: existing?.avatar || '',
          availability: existing?.availability || 'Disponible',
          skills: existing?.skills || ['Ingeniería']
        };
        await setDoc(doc(db, 'engineers', ing.id), newEngData, { merge: true });
        countIng++;
      }`
);

// Modify handleIndividualFileUpload engineer resolving / writing
content = content.replace(
  `      // Ensure engineer exists in DB
      const engRef = doc(db, 'ingenieros', engineerId);
      await setDoc(engRef, {
        nombre: nameToSave,
        sede: pdfParsedEngineerSede
      }, { merge: true });`,
  `      // Ensure engineer exists in DB (engineers collection)
      const engRef = doc(db, 'engineers', engineerId);
      const existing = engineers.find(e => e.id === engineerId);
      const nameToSaveClean = nameToSave.replace(/^ing\\.\\s+/i, '');
      await setDoc(engRef, {
        id: engineerId,
        name: existing?.name || nameToSaveClean,
        sede: pdfParsedEngineerSede,
        specialty: existing?.specialty || 'Ingeniería',
        email: existing?.email || \`\${nameToSaveClean.toLowerCase().replace(/[^a-z0-9]/g, '')}@orimec.com\`,
        phone: existing?.phone || '+593 999 999 999',
        avatar: existing?.avatar || '',
        availability: existing?.availability || 'Disponible',
        skills: existing?.skills || ['Ingeniería']
      }, { merge: true });`
);

// Modify handleAddIngeniero
content = content.replace(
  `  const handleAddIngeniero = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formIngNombre.trim()) {
      alert("Por favor ingresa el nombre.");
      return;
    }
    setSyncStatus('saving');
    const id = sanitizeId(formIngNombre);
    const newIng = {
      nombre: formIngNombre.trim().toUpperCase(),
      sede: formIngSede
    };

    try {
      await setDoc(doc(db, 'ingenieros', id), newIng);
      setFormIngNombre('');
      await fetchAllCollections();
      setSelectedIngId('');`,
  `  const handleAddIngeniero = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formIngNombre.trim()) {
      alert("Por favor ingresa el nombre.");
      return;
    }
    setSyncStatus('saving');
    const id = sanitizeId(formIngNombre);
    const cleanName = formIngNombre.trim().replace(/^ing\\.\\s+/i, '');
    const newIng = {
      id,
      name: cleanName,
      sede: formIngSede,
      specialty: 'Ingeniería',
      email: \`\${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}@orimec.com\`,
      phone: '+593 999 999 999',
      avatar: '',
      availability: 'Disponible',
      skills: ['Ingeniería']
    };

    try {
      await setDoc(doc(db, 'engineers', id), newIng);
      setFormIngNombre('');
      await fetchAllCollections();
      setSelectedIngId('');`
);

// Modify handleUpdateIngSede
content = content.replace(
  `  const handleUpdateIngSede = async (ingId: string, newSede: string) => {
    setSyncStatus('saving');
    try {
      await setDoc(doc(db, 'ingenieros', ingId), { sede: newSede }, { merge: true });
      setIngenieros(prev => prev.map(i => i.id === ingId ? { ...i, sede: newSede as any } : i));
      setSyncStatus('synced');`,
  `  const handleUpdateIngSede = async (ingId: string, newSede: string) => {
    setSyncStatus('saving');
    try {
      await setDoc(doc(db, 'engineers', ingId), { sede: newSede }, { merge: true });
      setSyncStatus('synced');`
);

// Modify handleDeleteIngeniero
content = content.replace(
  `      await deleteDoc(doc(db, 'ingenieros', id));`,
  `      await deleteDoc(doc(db, 'engineers', id));`
);

// Add real-time listener hooks inside useEffect or component body
// We can modify the initial fetch to set up subscriptions!
content = content.replace(
  `  useEffect(() => {
    fetchAllCollections();
  }, []);`,
  `  // Setup real-time listeners for cursos and training history
  useEffect(() => {
    const unsubCursos = onSnapshot(collection(db, 'cursos'), (snap) => {
      const list: Curso[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as Curso));
      setCursos(list);
    });

    const unsubHist = onSnapshot(collection(db, 'historial_entrenamiento'), (snap) => {
      const list: HistorialEntrenamiento[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as HistorialEntrenamiento));
      setHistorialList(list);
    });

    return () => {
      unsubCursos();
      unsubHist();
    };
  }, []);

  useEffect(() => {
    fetchAllCollections();
  }, [engineers]);`
);

fs.writeFileSync(destPath, content, 'utf8');
console.log('Final migration completed successfully!');
