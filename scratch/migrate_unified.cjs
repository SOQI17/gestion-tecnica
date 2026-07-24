const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'temp_capacitacion', 'src', 'App.tsx');
const destPath = path.join(__dirname, '..', 'src', 'components', 'CapacitacionesPortal.tsx');

let fileContent = fs.readFileSync(srcPath, 'utf8');
let lines = fileContent.split(/\r?\n/);

// Helper to find a line index containing a substring
function findLineIndex(sub, startIndex = 0) {
  for (let i = startIndex; i < lines.length; i++) {
    if (lines[i].includes(sub)) return i;
  }
  return -1;
}

// 1. Replace imports at the top
// Find the index where types.ts is imported or where import block ends
const typesImportIdx = findLineIndex("import { Ingeniero, Curso, HistorialEntrenamiento } from './types';");
if (typesImportIdx !== -1) {
  // Replace the first few lines with our clean imports
  const newImports = [
    `import React, { useState, useEffect, useMemo } from 'react';`,
    `import { db } from '../firebase';`,
    `import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch, getDocs } from 'firebase/firestore';`,
    `import { `,
    `  Users, `,
    `  BookOpen, `,
    `  Award, `,
    `  CheckCircle2, `,
    `  Clock, `,
    `  ShieldCheck, `,
    `  ShieldAlert,`,
    `  Plus, `,
    `  Trash2, `,
    `  Edit,`,
    `  RefreshCw, `,
    `  FileSpreadsheet, `,
    `  Search,`,
    `  BookMarked,`,
    `  SlidersHorizontal,`,
    `  ChevronRight,`,
    `  TrendingUp,`,
    `  Briefcase,`,
    `  Layers,`,
    `  MapPin,`,
    `  Calendar,`,
    `  AlertCircle,`,
    `  PiggyBank,`,
    `  Sparkles,`,
    `  Database,`,
    `  FileText,`,
    `  Upload`,
    `} from 'lucide-react';`,
    `import { Engineer, Curso, HistorialEntrenamiento } from '../types';`,
    `import { `,
    `  MOCK_CURSOS_GE_FE_CSV, `,
    `  INGENIEROS_NORM_SEMILLA, `,
    `  CURSOS_NORM_SEMILLA,`,
    `  HISTORIAL_NORM_SEMILLA `,
    `} from '../utils/capacitacionInitialData';`,
    `import { `,
    `  parseAndUnpivotCSV, `,
    `  obtenerProximoCursoIngeniero, `,
    `  sanitizeId,`,
    `  ALL_MODALITIES_LIST,`,
    `  getModKey,`,
    `  getLevelNum,`,
    `  getSimilarity,`,
    `  resolveEngineerId`,
    `} from '../utils/capacitacionUtils';`
  ];
  
  // Find where imports end (usually at 'export default function App()')
  const appDeclIdx = findLineIndex("export default function App()");
  if (appDeclIdx !== -1) {
    lines.splice(0, appDeclIdx, ...newImports);
  }
}

// Re-find indices because array length changed
let appDeclIdx = findLineIndex("export default function App()");
if (appDeclIdx !== -1) {
  lines[appDeclIdx] = `interface CapacitacionesPortalProps {\n  engineers: Engineer[];\n}\n\nexport default function CapacitacionesPortal({ engineers }: CapacitacionesPortalProps) {`;
}

// Replace ingenieros state with useMemo mapping from engineers prop
let ingStateIdx = findLineIndex("const [ingenieros, setIngenieros] = useState<Ingeniero[]>([]);");
if (ingStateIdx !== -1) {
  lines[ingStateIdx] = `  const ingenieros = useMemo(() => {
    return engineers.map(eng => ({
      id: eng.id,
      nombre: eng.name,
      sede: eng.sede || 'Quito'
    }));
  }, [engineers]);`;
}

// Replace parsedPreview state type definition from Ingeniero[] to Engineer[]
let parsedPreviewIdx = findLineIndex("const [parsedPreview, setParsedPreview] = useState<{");
if (parsedPreviewIdx !== -1) {
  // Replace the next few lines
  lines[parsedPreviewIdx + 1] = "    ingenieros: Engineer[];";
}

// In fetchAllCollections, replace fetching from 'ingenieros' collection with mapping from props
let fetchIngenierosIdx = findLineIndex("// 1. Fetch Ingenieros");
if (fetchIngenierosIdx !== -1) {
  lines.splice(fetchIngenierosIdx, 6, 
    `      // 1. Fetch Ingenieros (Mapeados desde props)`,
    `      const ingList = engineers.map(eng => ({`,
    `        id: eng.id,`,
    `        nombre: eng.name,`,
    `        sede: eng.sede || 'Quito'`,
    `      }));`
  );
}

// Find and comment out setIngenieros(ingList) in fetchAllCollections
let setIngListIdx = findLineIndex("setIngenieros(ingList);");
if (setIngListIdx !== -1) {
  lines[setIngListIdx] = "      // setIngenieros(ingList);";
}

// Adjust selection of first engineer in fetchAllCollections
let selectedRouteIngIdx = findLineIndex("if (ingList.length > 0 && !selectedRouteIngenieroId) {");
if (selectedRouteIngIdx !== -1) {
  lines[selectedRouteIngIdx] = "      if (engineers.length > 0 && !selectedRouteIngenieroId) {";
  lines[selectedRouteIngIdx + 1] = "        setSelectedRouteIngenieroId(engineers[0].id);";
}

// Setup real-time listeners inside useEffect
let mountEffectIdx = findLineIndex("useEffect(() => {");
if (mountEffectIdx !== -1 && lines[mountEffectIdx + 1].includes("fetchAllCollections();")) {
  lines.splice(mountEffectIdx, 3,
    `  // Setup real-time listeners for cursos and training history`,
    `  useEffect(() => {`,
    `    const unsubCursos = onSnapshot(collection(db, 'cursos'), (snap) => {`,
    `      const list: Curso[] = [];`,
    `      snap.forEach(d => list.push({ id: d.id, ...d.data() } as Curso));`,
    `      setCursos(list);`,
    `    });`,
    ``,
    `    const unsubHist = onSnapshot(collection(db, 'historial_entrenamiento'), (snap) => {`,
    `      const list: HistorialEntrenamiento[] = [];`,
    `      snap.forEach(d => list.push({ id: d.id, ...d.data() } as HistorialEntrenamiento));`,
    `      setHistorialList(list);`,
    `    });`,
    ``,
    `    return () => {`,
    `      unsubCursos();`,
    `      unsubHist();`,
    `    };`,
    `  }, []);`,
    ``,
    `  useEffect(() => {`,
    `    fetchAllCollections();`,
    `  }, [engineers]);`
  );
}

// Modify seed loading for engineers to target engineers collection
let seedIngenierosIdx = findLineIndex("for (const ing of INGENIEROS_NORM_SEMILLA) {");
if (seedIngenierosIdx !== -1 && lines[seedIngenierosIdx + 1].includes("setDoc(doc(db, 'ingenieros'")) {
  lines.splice(seedIngenierosIdx, 6,
    `      for (const ing of INGENIEROS_NORM_SEMILLA) {`,
    `        const cleanName = ing.name.replace(/^ing\\.\\s+/i, '');`,
    `        await setDoc(doc(db, 'engineers', ing.id), {`,
    `          id: ing.id,`,
    `          name: ing.name,`,
    `          sede: ing.sede,`,
    `          specialty: 'Ingeniería',`,
    `          email: \`\${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}@orimec.com\`,`,
    `          phone: '+593 999 999 999',`,
    `          avatar: '',`,
    `          availability: 'Disponible',`,
    `          skills: ['Ingeniería']`,
    `        }, { merge: true });`,
    `      }`
  );
}

// Modify handleImportCSVToFirestore: wipe courses and training history, but NOT engineers
let wipeCollectionsIdx = findLineIndex("const collectionsToWipe = ['ingenieros', 'cursos', 'historial_entrenamiento'];");
if (wipeCollectionsIdx !== -1) {
  lines[wipeCollectionsIdx] = "      const collectionsToWipe = ['cursos', 'historial_entrenamiento'];";
}

// Modify handleImportCSVToFirestore's write section for engineers
let batchIngIdx = findLineIndex("const batchIng = writeBatch(db);");
if (batchIngIdx !== -1) {
  lines.splice(batchIngIdx, 6,
    `      // Upsert to engineers collection`,
    `      for (const ing of parsedPreview.ingenieros) {`,
    `        const existing = engineers.find(e => e.id === ing.id);`,
    `        const nameVal = ing.nombre || '';`,
    `        const cleanNameVal = nameVal.replace(/^ing\\.\\s+/i, '');`,
    `        const newEngData = {`,
    `          id: ing.id,`,
    `          name: existing?.name || cleanNameVal,`,
    `          sede: ing.sede,`,
    `          specialty: existing?.specialty || 'Ingeniería',`,
    `          email: existing?.email || \`\${cleanNameVal.toLowerCase().replace(/[^a-z0-9]/g, '')}@orimec.com\`,`,
    `          phone: existing?.phone || '+593 999 999 999',`,
    `          avatar: existing?.avatar || '',`,
    `          availability: existing?.availability || 'Disponible',`,
    `          skills: existing?.skills || ['Ingeniería']`,
    `        };`,
    `        await setDoc(doc(db, 'engineers', ing.id), newEngData, { merge: true });`,
    `        countIng++;`,
    `      }`
  );
}

// Modify handleIndividualFileUpload (pdf upload) to write to engineers
let pdfWriteIngIdx = findLineIndex("const engRef = doc(db, 'ingenieros', engineerId);");
if (pdfWriteIngIdx !== -1) {
  lines.splice(pdfWriteIngIdx, 5,
    `      const engRef = doc(db, 'engineers', engineerId);`,
    `      const existing = engineers.find(e => e.id === engineerId);`,
    `      const nameToSaveClean = nameToSave.replace(/^ing\\.\\s+/i, '');`,
    `      await setDoc(engRef, {`,
    `        id: engineerId,`,
    `        name: existing?.name || nameToSaveClean,`,
    `        sede: pdfParsedEngineerSede,`,
    `        specialty: existing?.specialty || 'Ingeniería',`,
    `        email: existing?.email || \`\${nameToSaveClean.toLowerCase().replace(/[^a-z0-9]/g, '')}@orimec.com\`,`,
    `        phone: existing?.phone || '+593 999 999 999',`,
    `        avatar: existing?.avatar || '',`,
    `        availability: existing?.availability || 'Disponible',`,
    `        skills: existing?.skills || ['Ingeniería']`,
    `      }, { merge: true });`
  );
}

// Modify handleAddIngeniero to write to engineers
let handleAddIngIdx = findLineIndex("const handleAddIngeniero = async (e: React.FormEvent) => {");
if (handleAddIngIdx !== -1) {
  // Find where it sets doc
  let setDocIdx = findLineIndex("await setDoc(doc(db, 'ingenieros', id), newIng);", handleAddIngIdx);
  if (setDocIdx !== -1) {
    // Replace the object creation and setDoc
    lines.splice(setDocIdx - 5, 6,
      `    const cleanName = formIngNombre.trim().replace(/^ing\\.\\s+/i, '');`,
      `    const newIng = {`,
      `      id,`,
      `      name: cleanName,`,
      `      sede: formIngSede,`,
      `      specialty: 'Ingeniería',`,
      `      email: \`\${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}@orimec.com\`,`,
      `      phone: '+593 999 999 999',`,
      `      avatar: '',`,
      `      availability: 'Disponible',`,
      `      skills: ['Ingeniería']`,
      `    };`,
      `    await setDoc(doc(db, 'engineers', id), newIng);`
    );
  }
}

// Modify handleUpdateIngSede to write to engineers and remove setIngenieros
let handleUpdateSedeIdx = findLineIndex("const handleUpdateIngSede = async (ingId: string, newSede: string) => {");
if (handleUpdateSedeIdx !== -1) {
  let setDocIdx = findLineIndex("await setDoc(doc(db, 'ingenieros', ingId)", handleUpdateSedeIdx);
  if (setDocIdx !== -1) {
    lines[setDocIdx] = "      await setDoc(doc(db, 'engineers', ingId), { sede: newSede }, { merge: true });";
    lines[setDocIdx + 1] = "      // Sede will be updated in real time via props snapshot";
  }
}

// Modify handleDeleteIngeniero to delete from engineers
let handleDeleteIngIdx = findLineIndex("await deleteDoc(doc(db, 'ingenieros', id));");
if (handleDeleteIngIdx !== -1) {
  lines[handleDeleteIngIdx] = "      await deleteDoc(doc(db, 'engineers', id));";
}

fs.writeFileSync(destPath, lines.join('\n'), 'utf8');
console.log('Unified migration completed successfully!');
