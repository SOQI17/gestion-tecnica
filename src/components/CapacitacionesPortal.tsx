import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch, getDocs } from 'firebase/firestore';
import { 
  Users, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ShieldAlert,
  Plus, 
  Trash2, 
  Edit,
  RefreshCw, 
  FileSpreadsheet, 
  Search,
  BookMarked,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Briefcase,
  Layers,
  MapPin,
  Calendar,
  AlertCircle,
  PiggyBank,
  Sparkles,
  Database,
  FileText,
  Upload
} from 'lucide-react';
import { Engineer, Curso, HistorialEntrenamiento } from '../types';
import { 
  MOCK_CURSOS_GE_FE_CSV, 
  INGENIEROS_NORM_SEMILLA, 
  CURSOS_NORM_SEMILLA,
  HISTORIAL_NORM_SEMILLA 
} from '../utils/capacitacionInitialData';
import { 
  parseAndUnpivotCSV, 
  obtenerProximoCursoIngeniero, 
  sanitizeId,
  ALL_MODALITIES_LIST,
  getModKey,
  getLevelNum,
  getSimilarity,
  resolveEngineerId
} from '../utils/capacitacionUtils';
interface CapacitacionesPortalProps {
  engineers: Engineer[];
}

export default function CapacitacionesPortal({ engineers }: CapacitacionesPortalProps) {
  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'importer' | 'rutas' | 'ingenieros' | 'cursos' | 'historial'>('dashboard');

  // Firestore & Application State
  const ingenieros = useMemo(() => {
    return engineers.map(eng => ({
      id: eng.id,
      nombre: eng.name,
      sede: eng.sede || 'Quito'
    }));
  }, [engineers]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [historialList, setHistorialList] = useState<HistorialEntrenamiento[]>([]);
  
  // App UI Loading, Alerts & Sync status
  const [loading, setLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'error'>('synced');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [dbEmpty, setDbEmpty] = useState<boolean>(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sedeFilter, setSedeFilter] = useState<string>('TODOS');
  const [modalityFilter, setModalityFilter] = useState<string>('ALL');
  const [selectedRouteIngenieroId, setSelectedRouteIngenieroId] = useState<string>('');
  const [selectedRouteModalityFilter, setSelectedRouteModalityFilter] = useState<string>('ALL');
  const [selectedRouteModalityForModal, setSelectedRouteModalityForModal] = useState<string | null>(null);
  const [isRouteEngDropdownOpen, setIsRouteEngDropdownOpen] = useState<boolean>(false);
  const [routeEngSearchQuery, setRouteEngSearchQuery] = useState<string>('');
  // Engineer detail panel
  const [selectedIngId, setSelectedIngId] = useState<string>('');
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('TODOS');
  const [selectedRouteYearFilter, setSelectedRouteYearFilter] = useState<string>('TODOS');
  const [selectedHistoryModalityFilter, setSelectedHistoryModalityFilter] = useState<string>('TODAS');
  const [importerSubTab, setImporterSubTab] = useState<'csv' | 'pdf'>('csv');
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);
  const [pdfParsedEngineerName, setPdfParsedEngineerName] = useState<string>('');
  const [pdfParsedEngineerSede, setPdfParsedEngineerSede] = useState<'Quito' | 'Guayaquil' | 'Cuenca'>('Quito');
  const [pdfParsedCourses, setPdfParsedCourses] = useState<{ codigo: string; titulo: string; fecha: string }[]>([]);
  const [editingHistRecord, setEditingHistRecord] = useState<HistorialEntrenamiento | null>(null);
  const [editHistFecha, setEditHistFecha] = useState<string>('');
  const [selectedCourseForCompletions, setSelectedCourseForCompletions] = useState<Curso | null>(null);
  const [editCurModalidad, setEditCurModalidad] = useState<string>('');
  const [editCurCosto, setEditCurCosto] = useState<number>(0);
  const [isEditingCourseMeta, setIsEditingCourseMeta] = useState<boolean>(false);

  // CSV Ingestion Text Area State
  const [rawCsvText, setRawCsvText] = useState<string>(MOCK_CURSOS_GE_FE_CSV);
  const [parsedPreview, setParsedPreview] = useState<{
    ingenieros: Engineer[];
    cursos: Curso[];
    historial: HistorialEntrenamiento[];
  } | null>(null);
  const [importStatusMsg, setImportStatusMsg] = useState<string>('');

  // Manual Creation Forms
  // 1. Ingeniero Form
  const [formIngNombre, setFormIngNombre] = useState('');
  const [formIngSede, setFormIngSede] = useState<'Quito' | 'Guayaquil' | 'Cuenca' | 'Sede Central'>('Quito');
  
  // 2. Curso Form
  const [formCurCodigo, setFormCurCodigo] = useState('');
  const [formCurTitulo, setFormCurTitulo] = useState('');
  const [formCurModalidad, setFormCurModalidad] = useState('GE');
  const [formCurCosto, setFormCurCosto] = useState<number>(0);

  // 3. Complete Course Form
  const [formHistIngId, setFormHistIngId] = useState('');
  const [formHistCurId, setFormHistCurId] = useState('');
  const [formHistFecha, setFormHistFecha] = useState(new Date().toISOString().substring(0, 10));

  // Initial Data Fetch
  const fetchAllCollections = async () => {
    setLoading(true);
    setSyncStatus('saving');
    setErrorMessage('');
    try {
      // 1. Fetch Ingenieros (Mapeados desde props)
      const ingList = engineers.map(eng => ({
        id: eng.id,
        nombre: eng.name,
        sede: eng.sede || 'Quito'
      }));

      // 2. Fetch Cursos
      const curSnap = await getDocs(collection(db, 'cursos'));
      let curList: Curso[] = [];
      curSnap.forEach((d) => {
        curList.push({ id: d.id, ...d.data() } as Curso);
      });

      // 3. Fetch Historial de Entrenamiento
      const histSnap = await getDocs(collection(db, 'historial_entrenamiento'));
      const histList: HistorialEntrenamiento[] = [];
      histSnap.forEach((d) => {
        histList.push({ id: d.id, ...d.data() } as HistorialEntrenamiento);
      });

      // setIngenieros(ingList);
      setCursos(curList);
      setHistorialList(histList);

      if (ingList.length === 0 && curList.length === 0) {
        setDbEmpty(true);
      } else {
        setDbEmpty(false);
      }

      // Automatically select first engineer for route planner if none selected
      if (engineers.length > 0 && !selectedRouteIngenieroId) {
        setSelectedRouteIngenieroId(engineers[0].id);
      }

      setSyncStatus('synced');
    } catch (error: any) {
      console.error("Error al sincronizar con Firestore:", error);
      setSyncStatus('error');
      setErrorMessage(error?.message || String(error));
    } finally {
      setLoading(false);
    }
  };

  // Setup real-time listeners for cursos and training history
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
  }, [engineers]);

  // Update CSV parsed preview whenever input text is customized
  useEffect(() => {
    try {
      const parsed = parseAndUnpivotCSV(rawCsvText);
      setParsedPreview(parsed);
      setImportStatusMsg('');
    } catch (e: any) {
      setParsedPreview(null);
      setImportStatusMsg('Error al parsear matriz: ' + e.message);
    }
  }, [rawCsvText]);

  // Bulk Seed Populate (Inyección masiva inicial)
  const handleLoadSeedToFirestore = async () => {
    setLoading(true);
    setSyncStatus('saving');
    setErrorMessage('');
    try {
      // Create batch or setDoc consecutively
      for (const ing of INGENIEROS_NORM_SEMILLA) {
        const cleanName = ing.name.replace(/^ing\.\s+/i, '');
        await setDoc(doc(db, 'engineers', ing.id), {
          id: ing.id,
          name: ing.name,
          sede: ing.sede,
          specialty: 'Ingeniería',
          email: `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}@orimec.com`,
          phone: '+593 999 999 999',
          avatar: '',
          availability: 'Disponible',
          skills: ['Ingeniería']
        }, { merge: true });
      }

      for (const cur of CURSOS_NORM_SEMILLA) {
        await setDoc(doc(db, 'cursos', cur.id), {
          codigo: cur.codigo,
          titulo: cur.titulo,
          modalidad: cur.modalidad,
          costo: cur.costo
        });
      }

      for (const hist of HISTORIAL_NORM_SEMILLA) {
        await setDoc(doc(db, 'historial_entrenamiento', hist.id), {
          id_ingeniero: hist.id_ingeniero,
          codigo_curso: hist.codigo_curso,
          fecha_completado: hist.fecha_completado
        });
      }

      setDbEmpty(false);
      await fetchAllCollections();
      setSyncStatus('synced');
    } catch (error: any) {
      setSyncStatus('error');
      setErrorMessage("No se pudo iniciar carga. Asegúrate de configurar reglas de lectura/escritura en Firestore. Detalle: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Import parsed CSV into Firestore live — wipes existing collections first to avoid duplicates
  const handleImportCSVToFirestore = async () => {
    if (!parsedPreview) return;
    setLoading(true);
    setSyncStatus('saving');
    setImportStatusMsg('');
    try {
      // ── STEP 1: Eliminar todos los documentos existentes (evita duplicados) ──
      const collectionsToWipe = ['cursos', 'historial_entrenamiento'];
      for (const col of collectionsToWipe) {
        const snap = await getDocs(collection(db, col));
        // Firestore batch supports up to 500 ops; chunk if needed
        const ids = snap.docs.map(d => d.id);
        for (let i = 0; i < ids.length; i += 400) {
          const batch = writeBatch(db);
          ids.slice(i, i + 400).forEach(id => batch.delete(doc(db, col, id)));
          await batch.commit();
        }
      }

      // ── STEP 2: Escribir los nuevos datos del CSV ──
      let countIng = 0;
      let countCur = 0;
      let countHist = 0;

      // Upsert to engineers collection
      for (const ing of parsedPreview.ingenieros) {
        const existing = engineers.find(e => e.id === ing.id);
        const nameVal = ing.nombre || '';
        const cleanNameVal = nameVal.replace(/^ing\.\s+/i, '');
        const newEngData = {
          id: ing.id,
          name: existing?.name || cleanNameVal,
          sede: ing.sede,
          specialty: existing?.specialty || 'Ingeniería',
          email: existing?.email || `${cleanNameVal.toLowerCase().replace(/[^a-z0-9]/g, '')}@orimec.com`,
          phone: existing?.phone || '+593 999 999 999',
          avatar: existing?.avatar || '',
          availability: existing?.availability || 'Disponible',
          skills: existing?.skills || ['Ingeniería']
        };
        await setDoc(doc(db, 'engineers', ing.id), newEngData, { merge: true });
        countIng++;
      }

      // Cursos in chunks of 400
      for (let i = 0; i < parsedPreview.cursos.length; i += 400) {
        const batch = writeBatch(db);
        parsedPreview.cursos.slice(i, i + 400).forEach(cur => {
          batch.set(doc(db, 'cursos', cur.id), {
            codigo: cur.codigo, titulo: cur.titulo,
            modalidad: cur.modalidad, costo: cur.costo
          });
          countCur++;
        });
        await batch.commit();
      }

      // Historial in chunks of 400
      for (let i = 0; i < parsedPreview.historial.length; i += 400) {
        const batch = writeBatch(db);
        parsedPreview.historial.slice(i, i + 400).forEach(hist => {
          batch.set(doc(db, 'historial_entrenamiento', hist.id), {
            id_ingeniero: hist.id_ingeniero,
            codigo_curso: hist.codigo_curso,
            fecha_completado: hist.fecha_completado
          });
          countHist++;
        });
        await batch.commit();
      }

      setImportStatusMsg(`✅ ¡Importación exitosa! ${countIng} Ingenieros, ${countCur} Cursos y ${countHist} registros de historial guardados sin duplicados.`);
      setDbEmpty(false);
      await fetchAllCollections();
    } catch (e: any) {
      setSyncStatus('error');
      setErrorMessage('Fallo al escribir matriz en Firestore: ' + e.message);
      setImportStatusMsg('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Load PDF.js dynamically from CDN to avoid worker bundle issues in Vite
  const loadPdfJs = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any)['pdfjs-dist/build/pdf']) {
        resolve((window as any)['pdfjs-dist/build/pdf']);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
      script.onload = () => {
        const pdfjsLib = (window as any)['pdfjs-dist/build/pdf'];
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
        resolve(pdfjsLib);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const pdfjsLib = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let textContent = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join('\n');
      textContent += pageText + '\n';
    }
    
    return textContent;
  };

  const handleIndividualFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setPdfLoading(true);
    setImportStatusMsg('');
    try {
      if (file.name.toLowerCase().endsWith('.pdf')) {
        const text = await extractTextFromPdf(file);
        
        // 1. Detect Engineer Name
        let detectedName = '';
        const nameMatch = text.match(/(?:TRAINING\s+TRANSCRIPT\s+FOR|EXPEDIENTE\s+DE\s+FORMACI[ÓO]N\s+PARA)\s+([A-Z\sÁÉÍÓÚÑ]+)/i);
        if (nameMatch) {
          detectedName = nameMatch[1].replace(/[\r\n]/g, '').trim().toUpperCase();
        } else {
          const fallbackMatch = text.match(/(?:completed\s+activities\s+for|actividades\s+completadas\s+para)\s+(.+)/i);
          if (fallbackMatch) {
            detectedName = fallbackMatch[1].replace(/[\r\n]/g, '').trim().toUpperCase();
          }
        }
        
        if (!detectedName) {
          detectedName = 'INGENIERO DETECTADO';
        } else {
          // Clean up common PDF boilerplate lines glued to the name
          detectedName = detectedName
            .replace(/\bLIST\s+OF\s+COMPLET.*$/i, '')
            .replace(/\bLIST\s+OF\s+COMPLE.*$/i, '')
            .replace(/\bLIST\s+OF.*$/i, '')
            .replace(/\bCOMPLETED\s+ACTIVITIES.*$/i, '')
            .replace(/\bACTIVITIES\s+FROM.*$/i, '')
            .replace(/\bLISTA\s+DE\s+ACTIVIDADES.*$/i, '')
            .replace(/\bACTIVIDADES\s+COMPLETADAS.*$/i, '')
            .replace(/\bACTIVIDADES\s+DESDE.*$/i, '')
            .trim();
        }

        // Try to resolve engineer in database to auto-fill exact name and city
        const resolvedId = resolveEngineerId(detectedName, ingenieros);
        const dbEng = ingenieros.find(i => i.id === resolvedId);
        
        // Auto-detect Sede from name if not matched in DB
        let detectedSede: 'Quito' | 'Guayaquil' | 'Cuenca' = 'Quito';
        const cityMapping: { [name: string]: 'Quito' | 'Guayaquil' | 'Cuenca' } = {
          "ADRIAN BENAVIDES": "Quito",
          "MIGUEL NIOLA": "Cuenca",
          "ALEXIS GUERRA": "Guayaquil",
          "LAURA BLANCO": "Quito",
          "ROBERTO SANCHEZ": "Guayaquil",
          "CARLA FIGUEROA": "Cuenca",
          "ROBERTO GUERRA": "Quito",
          "LAURA VITERI": "Guayaquil",
          "HERNAN MALDONADO": "Quito",
          "HERNÁN MALDONADO": "Quito",
          "FRANCISCO SOTOMAYOR": "Guayaquil",
          "SIXTO CALDERON": "Quito",
          "SIXTO CALDERÓN": "Quito",
          "ANDRES VEGA": "Quito",
          "ANDRÉS VEGA": "Quito",
          "DAVID CHANGUAN": "Guayaquil",
          "DANIEL ZHUNIO": "Cuenca",
          "JOSE QUINDE": "Guayaquil",
          "JOSE CALDERON": "Quito",
          "JOSE CALDERÓN": "Quito",
          "JOHANA RUALES": "Quito",
          "PATRICIO LEIME": "Guayaquil",
          "SEBASTIAN MULLO": "Quito",
          "ESTEFANIA VALDEZ": "Quito",
          "JORGE AGUILAR": "Guayaquil",
          "FABRICIO ESTACIO": "Quito",
        };

        if (dbEng) {
          setPdfParsedEngineerName(dbEng.nombre);
          setPdfParsedEngineerSede(dbEng.sede as 'Quito' | 'Guayaquil' | 'Cuenca');
        } else {
          setPdfParsedEngineerName(detectedName);
          if (cityMapping[detectedName]) {
            detectedSede = cityMapping[detectedName];
          } else if (detectedName.includes('NIOLA') || detectedName.includes('FIGUEROA') || detectedName.includes('ZHUNIO')) {
            detectedSede = 'Cuenca';
          } else if (detectedName.includes('GUERRA') || detectedName.includes('SANCHEZ') || detectedName.includes('SOTOMAYOR') || detectedName.includes('QUINDE') || detectedName.includes('LEIME') || detectedName.includes('CHANGUAN') || detectedName.includes('AGUILAR')) {
            detectedSede = 'Guayaquil';
          }
          setPdfParsedEngineerSede(detectedSede);
        }
        
        // 2. Parse Courses
        const rawLines = text.split('\n').map(l => l.trim());
        const lines: string[] = [];
        for (let i = 0; i < rawLines.length; i++) {
          let currentLine = rawLines[i];
          if (currentLine.endsWith('-') && i < rawLines.length - 1) {
            const nextLine = rawLines[i + 1];
            if (nextLine.length < 15 && nextLine.match(/^[a-z0-9_]+$/i)) {
              currentLine = currentLine + nextLine;
              i++;
            }
          }
          if (currentLine.length > 0) {
            lines.push(currentLine);
          }
        }
        const coursesMap = new Map<string, { codigo: string; titulo: string; fecha: string }>();
        
        const parseDateToMs = (dStr: string): number => {
          const parts = dStr.split('/');
          if (parts.length === 3) {
            const m = parseInt(parts[0], 10) - 1;
            const d = parseInt(parts[1], 10);
            const y = parseInt(parts[2], 10);
            const date = new Date(y, m, d);
            return isNaN(date.getTime()) ? 0 : date.getTime();
          }
          const parsed = Date.parse(dStr);
          return isNaN(parsed) ? 0 : parsed;
        };
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const codeMatch = line.match(/(?:Code|C[óo]digo)\s*:\s*(\S+)/i);
          if (codeMatch) {
            const codigo = codeMatch[1].trim().toUpperCase();
            
            let titleParts: string[] = [];
            let foundDate = '';
            
            for (let j = 4; j >= 1; j--) {
              const prevIdx = i - j;
              if (prevIdx < 0) continue;
              const prevLine = lines[prevIdx];
              
              if (prevLine.match(/(?:Code|C[óo]digo)\s*:/i)) {
                titleParts = [];
                foundDate = '';
                continue;
              }
              
              const dateMatch = prevLine.match(/\b\d{1,2}\/\d{1,2}\/20\d{2}\b/);
              if (dateMatch && !foundDate) {
                foundDate = dateMatch[0];
              }
              
              titleParts.push(prevLine);
            }
            
            if (!foundDate) {
              for (let j = 1; j <= 2; j++) {
                const nextIdx = i + j;
                if (nextIdx >= lines.length) break;
                const nextLine = lines[nextIdx];
                const dateMatch = nextLine.match(/\b\d{1,2}\/\d{1,2}\/20\d{2}\b/);
                if (dateMatch) {
                  foundDate = dateMatch[0];
                  break;
                }
              }
            }
            
            let fullTitle = titleParts.join(' ');
            fullTitle = fullTitle.replace(/^(Online Course|Read & Acknowledge|Exam|Course|Webinar)\s*:\s*/i, '');
            fullTitle = fullTitle.replace(/\b\d{1,2}\/\d{1,2}\/20\d{2}\b/g, '');
            fullTitle = fullTitle.replace(/\b(Attended|Completed|In Progress|Passed|Failed)\b/i, '');
            fullTitle = fullTitle.replace(/\b\d{1,3}(?:\.\d{1,2})?\b/g, '');
            fullTitle = fullTitle.replace(/\s+/g, ' ').trim();
            
            if (!fullTitle) {
              fullTitle = 'Curso sin título';
            }
            
            if (!foundDate) {
              const today = new Date();
              foundDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
            }
            
            const newCourse = {
              codigo,
              titulo: fullTitle,
              fecha: foundDate
            };
            
            const existing = coursesMap.get(codigo);
            if (existing) {
              const existingTime = parseDateToMs(existing.fecha);
              const newTime = parseDateToMs(foundDate);
              if (newTime > existingTime) {
                coursesMap.set(codigo, newCourse);
              }
            } else {
              coursesMap.set(codigo, newCourse);
            }
          }
        }

        if (coursesMap.size === 0) {
          // Fallback parsing for custom list/tables (like Jose Quinde's PDF table)
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Match any token containing GE or GEHC code
            const codeMatch = line.match(/\b((?:GEHC|GE)[-\s][A-Z0-9_\-\/]+)\b/i);
            if (codeMatch) {
              const codigo = codeMatch[1].trim().toUpperCase();
              
              let foundDate = '';
              let title = '';
              
              // 1. Same line date match
              const sameLineDateMatch = line.match(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/);
              if (sameLineDateMatch) {
                foundDate = sameLineDateMatch[0];
              }
              
              // 2. Title from same line (before the code)
              const codeIdx = line.indexOf(codeMatch[0]);
              if (codeIdx > 5) {
                title = line.substring(0, codeIdx).trim();
              }
              
              // 3. Title from previous line if same line title is missing
              if (!title && i > 0) {
                const prevLine = lines[i - 1];
                if (!prevLine.match(/\b(?:GEHC|GE)[-\s]/i) && !prevLine.match(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/)) {
                  title = prevLine;
                }
              }
              
              // 4. Date from next line or wrapped next lines
              if (!foundDate && i < lines.length - 1) {
                const nextLine = lines[i + 1];
                const dateMatch = nextLine.match(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/);
                if (dateMatch) {
                  foundDate = dateMatch[0];
                } else {
                  // Check for wrapped dates (e.g. "11/10/202" followed by "3")
                  const wrappedDateMatch = nextLine.match(/\b\d{1,2}\/\d{1,2}\/20\d\b/);
                  if (wrappedDateMatch && i < lines.length - 2) {
                    const nextNextLine = lines[i + 2];
                    if (nextNextLine.match(/^\d$/)) {
                      foundDate = wrappedDateMatch[0] + nextNextLine;
                    }
                  }
                }
              }
              
              if (title) {
                title = title
                  .replace(/^[–—\-|]\s*/, '')
                  .replace(/\s+/g, ' ')
                  .trim();
              } else {
                title = 'Curso sin título';
              }
              
              if (!foundDate) {
                const today = new Date();
                foundDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
              }
              
              coursesMap.set(codigo, {
                codigo,
                titulo: title,
                fecha: foundDate
              });
            }
          }
        }
        
        setPdfParsedCourses(Array.from(coursesMap.values()));
        setImportStatusMsg(`Éxito: Se procesaron ${coursesMap.size} cursos del archivo PDF.`);
        setPdfLoading(false);
      } else if (file.name.toLowerCase().endsWith('.csv')) {
        const reader = new FileReader();
        reader.onload = async (ev) => {
          try {
            const buffer = ev.target?.result as ArrayBuffer;
            const utf8Text = new TextDecoder('utf-8', { fatal: false }).decode(buffer);
            const text = utf8Text.includes('\uFFFD')
              ? new TextDecoder('windows-1252').decode(buffer)
              : utf8Text;
              
            const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
            if (lines.length < 2) {
              throw new Error("El archivo CSV está vacío o no contiene suficientes filas.");
            }
            
            const firstLine = lines[0];
            const delimiter = (firstLine.split(';').length >= firstLine.split(',').length) ? ';' : ',';
            
            const parseCSVLine = (tLine: string): string[] => {
              const cells: string[] = [];
              let cell = '';
              let inQuotes = false;
              for (let idx = 0; idx < tLine.length; idx++) {
                const char = tLine[idx];
                if (char === '"') {
                  inQuotes = !inQuotes;
                } else if (char === delimiter && !inQuotes) {
                  cells.push(cell.trim());
                  cell = '';
                } else {
                  cell += char;
                }
              }
              cells.push(cell.trim());
              return cells;
            };
            
            const headers = parseCSVLine(lines[0]).map(h => h.toUpperCase().trim());
            
            let codeIdx = headers.findIndex(h => h.includes('COD') || h.includes('CÓD') || h.includes('CODE'));
            let titleIdx = headers.findIndex(h => h.includes('TIT') || h.includes('TÍT') || h.includes('TITLE') || h.includes('CURSO') || h.includes('COURSE'));
            let modIdx = headers.findIndex(h => h.includes('MOD') || h.includes('MODALIDAD') || h.includes('MODALITY'));
            let dateIdx = headers.findIndex(h => h.includes('FEC') || h.includes('FECHA') || h.includes('DATE') || h.includes('COMPLETADO'));
            
            if (codeIdx === -1) codeIdx = 0;
            if (titleIdx === -1) titleIdx = 1;
            if (modIdx === -1) modIdx = 2;
            if (dateIdx === -1) dateIdx = 3;
            
            let rawFileName = file.name;
            const extIdx = rawFileName.lastIndexOf('.');
            if (extIdx !== -1) {
              rawFileName = rawFileName.substring(0, extIdx);
            }
            
            const detectedName = rawFileName
              .trim()
              .toUpperCase()
              .replace(/[\-_]/g, ' ')
              .replace(/\s+/g, ' ');
              
            const resolvedId = resolveEngineerId(detectedName, ingenieros);
            const dbEng = ingenieros.find(i => i.id === resolvedId);
            
            if (dbEng) {
              setPdfParsedEngineerName(dbEng.nombre);
              setPdfParsedEngineerSede(dbEng.sede as 'Quito' | 'Guayaquil' | 'Cuenca');
            } else {
              setPdfParsedEngineerName(detectedName);
              setPdfParsedEngineerSede('Quito');
            }
            
            const coursesMap = new Map<string, { codigo: string; titulo: string; fecha: string }>();
            
            for (let i = 1; i < lines.length; i++) {
              const cells = parseCSVLine(lines[i]);
              if (cells.length < 2) continue;
              
              const rawCode = cells[codeIdx] || '';
              const rawTitle = cells[titleIdx] || '';
              let rawDate = cells[dateIdx] || '';
              
              const cleanCode = rawCode.trim().toUpperCase();
              const cleanTitle = rawTitle.trim();
              
              if (!cleanCode || !cleanTitle) continue;
              
              if (!rawDate) {
                const today = new Date();
                rawDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
              }
              
              const newCourse = {
                codigo: cleanCode,
                titulo: cleanTitle,
                fecha: rawDate.trim()
              };
              
              const existing = coursesMap.get(cleanCode);
              if (existing) {
                const existingTime = Date.parse(existing.fecha) || 0;
                const newTime = Date.parse(rawDate) || 0;
                if (newTime > existingTime) {
                  coursesMap.set(cleanCode, newCourse);
                }
              } else {
                coursesMap.set(cleanCode, newCourse);
              }
            }
            
            setPdfParsedCourses(Array.from(coursesMap.values()));
            setImportStatusMsg(`Éxito: Se procesaron ${coursesMap.size} cursos del archivo CSV.`);
          } catch (csvErr: any) {
            console.error("Error al parsear CSV:", csvErr);
            setImportStatusMsg(`Error al procesar el archivo CSV: ${csvErr.message || String(csvErr)}`);
          } finally {
            setPdfLoading(false);
          }
        };
        reader.onerror = () => {
          setImportStatusMsg(`Error al leer el archivo CSV.`);
          setPdfLoading(false);
        };
        reader.readAsArrayBuffer(file);
      } else {
        throw new Error("Formato de archivo no soportado. Por favor sube un archivo .pdf o .csv");
      }
    } catch (error: any) {
      console.error("Error al procesar archivo:", error);
      setImportStatusMsg(`Error al procesar el archivo: ${error.message || String(error)}`);
      setPdfLoading(false);
    } finally {
      e.target.value = '';
    }
  };

  const handleImportPDFToFirestore = async () => {
    if (!pdfParsedEngineerName || pdfParsedCourses.length === 0) return;
    
    setSyncStatus('saving');
    try {
      const engineerId = resolveEngineerId(pdfParsedEngineerName, ingenieros);
      const dbEng = ingenieros.find(i => i.id === engineerId);
      const nameToSave = dbEng ? dbEng.nombre : pdfParsedEngineerName;
      
      // Ensure engineer exists in DB
      const engRef = doc(db, 'engineers', engineerId);
      const existing = engineers.find(e => e.id === engineerId);
      const nameToSaveClean = nameToSave.replace(/^ing\.\s+/i, '');
      await setDoc(engRef, {
        id: engineerId,
        name: existing?.name || nameToSaveClean,
        sede: pdfParsedEngineerSede,
        specialty: existing?.specialty || 'Ingeniería',
        email: existing?.email || `${nameToSaveClean.toLowerCase().replace(/[^a-z0-9]/g, '')}@orimec.com`,
        phone: existing?.phone || '+593 999 999 999',
        avatar: existing?.avatar || '',
        availability: existing?.availability || 'Disponible',
        skills: existing?.skills || ['Ingeniería']
      }, { merge: true });
      
      // Deduplicate courses to be saved in Firestore to prevent composite ID collisions in the batch,
      // and match catalog courses by title similarity to avoid duplicate catalog codes.
      const uniqueCourses: { codigo: string; titulo: string; fecha: string }[] = [];
      const seenCodes = new Set<string>();
      for (const item of pdfParsedCourses) {
        let code = item.codigo.trim().toUpperCase();
        if (!code || !item.titulo) continue;
        
        let catalogMatch: Curso | null = null;
        let maxCatalogSim = 0;
        
        // Search catalog for a course with a highly similar title
        for (const c of cursos) {
          const sim = getSimilarity(item.titulo, c.titulo);
          if (sim >= 0.8 && sim > maxCatalogSim) {
            maxCatalogSim = sim;
            catalogMatch = c;
          }
        }
        
        if (catalogMatch) {
          code = catalogMatch.codigo;
        }
        
        if (seenCodes.has(code)) continue;
        seenCodes.add(code);
        uniqueCourses.push({
          codigo: code,
          titulo: catalogMatch ? catalogMatch.titulo : item.titulo.trim(),
          fecha: item.fecha
        });
      }
      
      // Loop through all parsed courses and add to general catalog if new,
      // and add approval to history.
      const batch = writeBatch(db);
      
      // Filter out courses that are already registered in the database for this engineer (by code or similarity)
      const coursesToSave: { codigo: string; titulo: string; fecha: string }[] = [];
      for (const item of uniqueCourses) {
        const isAlreadyReg = historialList.some(h => {
          if (h.id_ingeniero !== engineerId) return false;
          if (h.codigo_curso === item.codigo) return true;
          const dbCourse = cursos.find(c => c.codigo === h.codigo_curso);
          if (dbCourse && item.titulo && getSimilarity(item.titulo, dbCourse.titulo) >= 0.8) {
            return true;
          }
          return false;
        });
        if (!isAlreadyReg) {
          coursesToSave.push(item);
        }
      }
      
      if (coursesToSave.length > 0) {
        for (const item of coursesToSave) {
          const courseId = item.codigo.trim().toUpperCase();
          const courseRef = doc(db, 'cursos', courseId);
          
          const existingCourse = cursos.find(c => c.codigo === courseId);
          if (!existingCourse) {
            const tempCourse: Curso = {
              id: courseId,
              codigo: courseId,
              titulo: item.titulo.trim(),
              modalidad: '', // getModKey will resolve it
              costo: 0
            };
            const calculatedMod = getModKey(tempCourse);
            batch.set(courseRef, {
              codigo: courseId,
              titulo: item.titulo.trim(),
              modalidad: calculatedMod,
              costo: 0
            });
          }
          
          // Save training record
          const compositeId = `${engineerId}_${courseId}`;
          const histRef = doc(db, 'historial_entrenamiento', compositeId);
          batch.set(histRef, {
            id_ingeniero: engineerId,
            codigo_curso: courseId,
            fecha_completado: item.fecha
          });
        }
        await batch.commit();
      }
      
      setImportStatusMsg(`✅ ¡Éxito! Se procesaron y registraron ${coursesToSave.length} nuevas aprobaciones para ${pdfParsedEngineerName}.`);
      
      // Clear PDF states
      setPdfParsedCourses([]);
      setPdfParsedEngineerName('');
      
      await fetchAllCollections();
    } catch (error: any) {
      console.error("Error al guardar transcripción PDF:", error);
      setImportStatusMsg(`Error al guardar: ${error.message || String(error)}`);
    } finally {
      setSyncStatus('synced');
    }
  };

  const handleRemoveDuplicatesFromList = () => {
    const uniqueList: { codigo: string; titulo: string; fecha: string }[] = [];
    
    const parseDateToMs = (dStr: string): number => {
      const parts = dStr.split('/');
      if (parts.length === 3) {
        const m = parseInt(parts[0], 10) - 1;
        const d = parseInt(parts[1], 10);
        const y = parseInt(parts[2], 10);
        const date = new Date(y, m, d);
        return isNaN(date.getTime()) ? 0 : date.getTime();
      }
      const parsed = Date.parse(dStr);
      return isNaN(parsed) ? 0 : parsed;
    };

    for (const item of pdfParsedCourses) {
      const cleanCode = item.codigo.trim().toUpperCase();
      
      let catalogMatch: Curso | null = null;
      let maxCatalogSim = 0;
      if (item.titulo) {
        const exactCatalog = cleanCode ? cursos.find(c => c.codigo === cleanCode) : null;
        if (exactCatalog) {
          catalogMatch = exactCatalog;
          maxCatalogSim = 1.0;
        } else {
          for (const c of cursos) {
            const sim = getSimilarity(item.titulo, c.titulo);
            if (sim >= 0.8 && sim > maxCatalogSim) {
              maxCatalogSim = sim;
              catalogMatch = c;
            }
          }
        }
      }
      
      const resolvedCode = catalogMatch ? catalogMatch.codigo : cleanCode;
      
      let duplicateIdx = -1;
      for (let j = 0; j < uniqueList.length; j++) {
        const existing = uniqueList[j];
        const exClean = existing.codigo.trim().toUpperCase();
        
        let exCatalog: Curso | null = null;
        let exMaxSim = 0;
        if (existing.titulo) {
          const exExact = exClean ? cursos.find(c => c.codigo === exClean) : null;
          if (exExact) {
            exCatalog = exExact;
            exMaxSim = 1.0;
          } else {
            for (const c of cursos) {
              const sim = getSimilarity(existing.titulo, c.titulo);
              if (sim >= 0.8 && sim > exMaxSim) {
                exMaxSim = sim;
                exCatalog = c;
              }
            }
          }
        }
        const exResolved = exCatalog ? exCatalog.codigo : exClean;
        
        const codeMatches = resolvedCode && exResolved && resolvedCode === exResolved;
        const titleSimilar = item.titulo && existing.titulo && getSimilarity(item.titulo, existing.titulo) >= 0.8;
        
        if (codeMatches || titleSimilar) {
          duplicateIdx = j;
          break;
        }
      }
      
      if (duplicateIdx !== -1) {
        const existing = uniqueList[duplicateIdx];
        const existingTime = parseDateToMs(existing.fecha);
        const newTime = parseDateToMs(item.fecha);
        if (newTime > existingTime) {
          uniqueList[duplicateIdx] = item;
        }
      } else {
        uniqueList.push(item);
      }
    }
    
    setPdfParsedCourses(uniqueList);
  };

  const handleRemoveRegisteredFromList = () => {
    const engineerId = resolveEngineerId(pdfParsedEngineerName, ingenieros);
    
    const filtered = pdfParsedCourses.filter(item => {
      const cleanCode = item.codigo.trim().toUpperCase();
      
      let catalogMatch: Curso | null = null;
      let maxCatalogSim = 0;
      if (item.titulo) {
        const exactCatalog = cleanCode ? cursos.find(c => c.codigo === cleanCode) : null;
        if (exactCatalog) {
          catalogMatch = exactCatalog;
          maxCatalogSim = 1.0;
        } else {
          for (const c of cursos) {
            const sim = getSimilarity(item.titulo, c.titulo);
            if (sim >= 0.8 && sim > maxCatalogSim) {
              maxCatalogSim = sim;
              catalogMatch = c;
            }
          }
        }
      }
      
      const resolvedCode = catalogMatch ? catalogMatch.codigo : cleanCode;
      if (!resolvedCode) return true;
      
      const matchInDb = historialList.find(h => {
        if (h.id_ingeniero !== engineerId) return false;
        if (h.codigo_curso === resolvedCode) return true;
        const dbCourse = cursos.find(c => c.codigo === h.codigo_curso);
        if (dbCourse && item.titulo && getSimilarity(item.titulo, dbCourse.titulo) >= 0.8) {
          return true;
        }
        return false;
      });
      return !matchInDb;
    });
    
    setPdfParsedCourses(filtered);
  };

  // Create single Engineer directly in Firestore
  const handleAddIngeniero = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formIngNombre.trim()) {
      alert("Por favor ingresa el nombre.");
      return;
    }
    setSyncStatus('saving');
    const id = sanitizeId(formIngNombre);
    const cleanName = formIngNombre.trim().replace(/^ing\.\s+/i, '');
    const newIng = {
      id,
      name: cleanName,
      sede: formIngSede,
      specialty: 'Ingeniería',
      email: `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}@orimec.com`,
      phone: '+593 999 999 999',
      avatar: '',
      availability: 'Disponible',
      skills: ['Ingeniería']
    };

    try {
      await setDoc(doc(db, 'engineers', id), newIng);
      setFormIngNombre('');
      await fetchAllCollections();
      setSelectedIngId('');
    } catch (err: any) {
      setSyncStatus('error');
      setErrorMessage('Error al agregar ingeniero: ' + err.message);
    }
  };

  // Update engineer city/sede in Firestore
  const handleUpdateIngSede = async (ingId: string, newSede: string) => {
    setSyncStatus('saving');
    try {
      await setDoc(doc(db, 'engineers', ingId), { sede: newSede }, { merge: true });
      // Sede will be updated in real time via props snapshot
      setSyncStatus('synced');
    } catch (err: any) {
      setSyncStatus('error');
      setErrorMessage('Error al actualizar sede: ' + err.message);
    }
  };

  // Delete single Engineer and cascade clean their training log
  const handleDeleteIngeniero = async (id: string, name: string) => {
    if (!confirm(`¿Está seguro de eliminar a ${name}? Se removerá también su historial de capacitación.`)) return;
    setSyncStatus('saving');
    try {
      await deleteDoc(doc(db, 'engineers', id));
      
      // Clear associated training history records
      const associatedHist = historialList.filter(h => h.id_ingeniero === id);
      for (const record of associatedHist) {
        await deleteDoc(doc(db, 'historial_entrenamiento', record.id));
      }

      await fetchAllCollections();
    } catch (err: any) {
      setSyncStatus('error');
      setErrorMessage("Fallo al eliminar: " + err.message);
    }
  };

  // Create single course
  const handleAddCurso = async (e: React.FormEvent) => {
    e.preventDefault();
    const codigo = formCurCodigo.trim().toUpperCase();
    const titulo = formCurTitulo.trim();

    if (!codigo || !titulo) {
      alert("Por favor completa el código y título del curso.");
      return;
    }

    setSyncStatus('saving');
    const newCourse = {
      codigo,
      titulo,
      modalidad: formCurModalidad.toUpperCase(),
      costo: Number(formCurCosto) || 0
    };

    try {
      await setDoc(doc(db, 'cursos', codigo), newCourse);
      setFormCurCodigo('');
      setFormCurTitulo('');
      setFormCurCosto(0);
      await fetchAllCollections();
    } catch (err: any) {
      setSyncStatus('error');
      setErrorMessage("Error al guardar curso: " + err.message);
    }
  };

  // Delete single Course
  const handleDeleteCurso = async (codigo: string) => {
    if (!confirm(`¿Eliminar curso ${codigo}? Se eliminarán todas las aprobaciones asociadas.`)) return;
    setSyncStatus('saving');
    try {
      await deleteDoc(doc(db, 'cursos', codigo));
      
      const associatedHist = historialList.filter(h => h.codigo_curso === codigo);
      for (const h of associatedHist) {
        await deleteDoc(doc(db, 'historial_entrenamiento', h.id));
      }

      await fetchAllCollections();
    } catch (err: any) {
      setSyncStatus('error');
      setErrorMessage("No se pudo eliminar el curso: " + err.message);
    }
  };

  // Mark course completion manually of an engineer
  const handleLogCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formHistIngId || !formHistCurId || !formHistFecha) {
      alert("Por favor selecciona un Ingeniero, un Curso y ingresa la Fecha.");
      return;
    }

    setSyncStatus('saving');
    const compositeId = `${formHistIngId}_${formHistCurId}`;
    const logRecord = {
      id_ingeniero: formHistIngId,
      codigo_curso: formHistCurId,
      fecha_completado: formHistFecha
    };

    try {
      await setDoc(doc(db, 'historial_entrenamiento', compositeId), logRecord);
      setFormHistCurId('');
      await fetchAllCollections();
    } catch (err: any) {
      setSyncStatus('error');
      setErrorMessage("Error al guardar historial de capacitación: " + err.message);
    }
  };

  // Mark next course as completed directly in training router UI
  const handleQuickComplete = async (ingenieroId: string, cursoCodigo: string) => {
    setSyncStatus('saving');
    const compositeId = `${ingenieroId}_${cursoCodigo}`;
    const today = new Date().toLocaleDateString('en-US'); // MM/DD/YYYY to match input csv style
    const logRecord = {
      id_ingeniero: ingenieroId,
      codigo_curso: cursoCodigo,
      fecha_completado: today
    };

    try {
      await setDoc(doc(db, 'historial_entrenamiento', compositeId), logRecord);
      await fetchAllCollections();
    } catch (err: any) {
      setSyncStatus('error');
      setErrorMessage("Error al actualizar estado rápido: " + err.message);
    }
  };

  // Revoke completion history item
  const handleDeleteHistoryItem = async (histId: string) => {
    if (!confirm("¿Desea revocar la certificación aprobada para este ingeniero?")) return;
    setSyncStatus('saving');
    try {
      await deleteDoc(doc(db, 'historial_entrenamiento', histId));
      await fetchAllCollections();
    } catch (err: any) {
      setSyncStatus('error');
      setErrorMessage("No se pudo revocar el historial: " + err.message);
    }
  };

  // Update completion date of training history item
  const handleUpdateHistoryItemDate = async (histId: string, newDate: string) => {
    if (!newDate.trim()) {
      alert("La fecha no puede estar vacía.");
      return;
    }
    setSyncStatus('saving');
    try {
      const docRef = doc(db, 'historial_entrenamiento', histId);
      await setDoc(docRef, { fecha_completado: newDate }, { merge: true });
      await fetchAllCollections();
      setEditingHistRecord(null);
    } catch (err: any) {
      setSyncStatus('error');
      setErrorMessage("No se pudo actualizar la fecha: " + err.message);
    }
  };

  // Update completion date of training history item and course metadata
  const handleUpdateHistoryItemAndCourse = async (
    histId: string, 
    newDate: string, 
    courseCode: string, 
    newModality: string, 
    newCost: number
  ) => {
    if (!newDate.trim()) {
      alert("La fecha no puede estar vacía.");
      return;
    }
    setSyncStatus('saving');
    try {
      // 1. Update completion date
      const docRef = doc(db, 'historial_entrenamiento', histId);
      await setDoc(docRef, { fecha_completado: newDate }, { merge: true });

      // 2. Update course metadata
      const courseRef = doc(db, 'cursos', courseCode);
      await setDoc(courseRef, { 
        modalidad: newModality.trim().toUpperCase(),
        costo: Number(newCost) || 0
      }, { merge: true });

      await fetchAllCollections();
      setEditingHistRecord(null);
    } catch (err: any) {
      setSyncStatus('error');
      setErrorMessage("No se pudieron guardar los cambios: " + err.message);
    }
  };

  // Update course metadata directly
  const handleUpdateCourseOnly = async (
    courseCode: string, 
    newModality: string, 
    newCost: number
  ) => {
    setSyncStatus('saving');
    try {
      const courseRef = doc(db, 'cursos', courseCode);
      await setDoc(courseRef, { 
        modalidad: newModality.trim().toUpperCase(),
        costo: Number(newCost) || 0
      }, { merge: true });

      await fetchAllCollections();
      // Update selected course reference in state to reflect new data
      setSelectedCourseForCompletions(prev => prev ? { ...prev, modalidad: newModality.toUpperCase(), costo: newCost } : null);
      setIsEditingCourseMeta(false);
    } catch (err: any) {
      setSyncStatus('error');
      setErrorMessage("No se pudo actualizar el curso: " + err.message);
    }
  };

  // Helper to open edit modal and prefill course metadata
  const openEditModal = (h: HistorialEntrenamiento) => {
    setEditingHistRecord(h);
    setEditHistFecha(h.fecha_completado);
    const matchC = cursos.find(c => c.codigo === h.codigo_curso);
    setEditCurModalidad(matchC ? (matchC.modalidad || '') : '');
    setEditCurCosto(matchC ? (matchC.costo || 0) : 0);
  };

  // Calculate Headquarters metrics for dashboard
  const calculaSedeStats = (sede: 'Quito' | 'Guayaquil' | 'Cuenca') => {
    const ingSede = ingenieros.filter(i => i.sede === sede);
    if (ingSede.length === 0) return { count: 0, completedCount: 0, rate: 0 };
    
    let totalCursosSede = 0;
    let completedCursosSede = 0;

    ingSede.forEach(ing => {
      // Find recommendation routes to see completion
      const route = obtenerProximoCursoIngeniero(ing, cursos, historialList);
      totalCursosSede += route.totalCursos;
      completedCursosSede += route.completados.length;
    });

    const rate = totalCursosSede > 0 ? Math.round((completedCursosSede / totalCursosSede) * 100) : 0;
    return {
      count: ingSede.length,
      completedCount: completedCursosSede,
      rate
    };
  };

  const sedeQuito = calculaSedeStats('Quito');
  const sedeGuayaquil = calculaSedeStats('Guayaquil');
  const sedeCuenca = calculaSedeStats('Cuenca');

  // Overall Global metrics
  const totalInvolucrados = ingenieros.length;
  const catalogoCount = cursos.length;
  const historialCount = historialList.length;
  
  // Total cost spent
  const inversionTotalRealizada = historialList.reduce((acc, h) => {
    const match = cursos.find(c => c.codigo === h.codigo_curso);
    return acc + (match ? match.costo : 0);
  }, 0);

  // Selected route data for the route recommender tab
  const activeRouteIngeniero = ingenieros.find(i => i.id === selectedRouteIngenieroId);
  const activeRouteRecommendation = activeRouteIngeniero 
    ? obtenerProximoCursoIngeniero(activeRouteIngeniero, cursos, historialList)
    : null;

  // Pre-resolve catalog matches for all parsed courses using useMemo.
  // This avoids repeating costly getSimilarity matches on every single render.
  const resolvedPdfCourses = useMemo(() => {
    return pdfParsedCourses.map(item => {
      const cleanCode = item.codigo.trim().toUpperCase();
      let catalogMatch: Curso | null = null;
      let maxCatalogSim = 0;
      if (item.titulo) {
        const exactCatalog = cleanCode ? cursos.find(c => c.codigo === cleanCode) : null;
        if (exactCatalog) {
          catalogMatch = exactCatalog;
          maxCatalogSim = 1.0;
        } else {
          for (const c of cursos) {
            const sim = getSimilarity(item.titulo, c.titulo);
            if (sim >= 0.8 && sim > maxCatalogSim) {
              maxCatalogSim = sim;
              catalogMatch = c;
            }
          }
        }
      }
      return {
        item,
        cleanCode,
        catalogMatch,
        maxCatalogSim,
        resolvedCode: catalogMatch ? catalogMatch.codigo : cleanCode
      };
    });
  }, [pdfParsedCourses, cursos]);

  // Compute duplicate and registered existence flags for pdfParsedCourses using useMemo.
  // This prevents freezing when editing the collaborator's name since name changes won't trigger re-resolving courses.
  const { hasDuplicatesInList, hasRegisteredCursos } = useMemo(() => {
    const engineerIdForPdfFlags = resolveEngineerId(pdfParsedEngineerName, ingenieros);
    let hasDup = false;
    let hasReg = false;

    if (resolvedPdfCourses.length > 0) {
      for (let i = 0; i < resolvedPdfCourses.length; i++) {
        const entry = resolvedPdfCourses[i];
        const resolvedCode = entry.resolvedCode;
        
        // Calculate occurrences within the pre-resolved list
        let occurrences = 0;
        for (let j = 0; j < resolvedPdfCourses.length; j++) {
          const other = resolvedPdfCourses[j];
          const codeMatches = resolvedCode && other.resolvedCode && resolvedCode === other.resolvedCode;
          const titleSimilar = entry.item.titulo && other.item.titulo && getSimilarity(entry.item.titulo, other.item.titulo) >= 0.8;
          if (codeMatches || titleSimilar) {
            occurrences++;
          }
        }
        
        if (occurrences > 1) {
          hasDup = true;
        }
        
        const isReg = resolvedCode 
          ? historialList.some(h => {
              if (h.id_ingeniero !== engineerIdForPdfFlags) return false;
              if (h.codigo_curso === resolvedCode) return true;
              const dbCourse = cursos.find(c => c.codigo === h.codigo_curso);
              if (dbCourse && entry.item.titulo && getSimilarity(entry.item.titulo, dbCourse.titulo) >= 0.8) {
                return true;
              }
              return false;
            })
          : false;
        if (isReg) {
          hasReg = true;
        }
        
        if (hasDup && hasReg) break;
      }
    }
    return { hasDuplicatesInList: hasDup, hasRegisteredCursos: hasReg };
  }, [resolvedPdfCourses, pdfParsedEngineerName, ingenieros, historialList]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased" id="orimec-app-root">
      
      {/* Top Professional Header */}
      <nav className="sticky top-0 z-50 bg-[#001f3f] text-white border-b border-sky-950 shadow-md" id="orimec-header-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            
            {/* Branding logo and text */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-500 flex items-center justify-center text-slate-950 font-black shadow-inner">
                <Layers className="w-5.5 h-5.5 text-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-sky-300 tracking-widest font-mono">ORIMEC C.A.</span>
                  <span className="text-[8px] font-extrabold uppercase bg-teal-400 text-slate-950 px-1.5 py-0.2 rounded font-mono">
                    PRO
                  </span>
                </div>
                <h1 className="text-sm sm:text-base font-bold tracking-tight text-white font-display">Planificador de Capacitaciones Especializadas</h1>
              </div>
            </div>

            {/* Cloud Real-time connectivity label & Refresh */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 bg-[#001124] border border-sky-900 rounded-full px-3 py-1 text-xs">
                {syncStatus === 'synced' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                    <span className="text-slate-300 text-[10px] font-mono leading-none">Firestore Conectado</span>
                  </>
                ) : syncStatus === 'saving' ? (
                  <>
                    <RefreshCw className="w-3 h-3 text-teal-400 animate-spin" />
                    <span className="text-slate-300 text-[10px] leading-none">Guardando en Firebase...</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
                    <span className="text-rose-400 text-[10px] font-bold leading-none">Rechazado (Revisar Reglas)</span>
                  </>
                )}
              </div>

              <button
                id="btn-sync-database"
                onClick={fetchAllCollections}
                className="p-2 rounded-md bg-sky-950 hover:bg-sky-900 text-sky-200 hover:text-white transition cursor-pointer"
                title="Actualizar datos de Firestore"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Main Subheader Navigation Rail */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-none space-x-1 py-1">
            <button
              id="tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-3 text-xs font-semibold tracking-tight transition whitespace-nowrap rounded-md flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-slate-100 text-[#001f3f]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-sky-600" />
              Resumen Corporativo
            </button>

            <button
              id="tab-rutas"
              onClick={() => setActiveTab('rutas')}
              className={`px-4 py-3 text-xs font-semibold tracking-tight transition whitespace-nowrap rounded-md flex items-center gap-1.5 ${
                activeTab === 'rutas'
                  ? 'bg-slate-100 text-[#001f3f]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Award className="w-4 h-4 text-amber-600" />
              Ruta (Siguiente Curso)
            </button>

            <button
              id="tab-ingenieros"
              onClick={() => setActiveTab('ingenieros')}
              className={`px-4 py-3 text-xs font-semibold tracking-tight transition whitespace-nowrap rounded-md flex items-center gap-1.5 ${
                activeTab === 'ingenieros'
                  ? 'bg-slate-100 text-[#001f3f]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4 text-purple-600" />
              Nómina de Ingenieros
            </button>

            <button
              id="tab-cursos"
              onClick={() => setActiveTab('cursos')}
              className={`px-4 py-3 text-xs font-semibold tracking-tight transition whitespace-nowrap rounded-md flex items-center gap-1.5 ${
                activeTab === 'cursos'
                  ? 'bg-slate-100 text-[#001f3f]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Catálogo de Cursos
            </button>

            <button
              id="tab-historial"
              onClick={() => setActiveTab('historial')}
              className={`px-4 py-3 text-xs font-semibold tracking-tight transition whitespace-nowrap rounded-md flex items-center gap-1.5 ${
                activeTab === 'historial'
                  ? 'bg-slate-100 text-[#001f3f]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-rose-500" />
              Historial de Aprobaciones
            </button>

            <button
              id="tab-importer"
              onClick={() => setActiveTab('importer')}
              className={`px-4 py-3 text-xs font-semibold tracking-tight transition whitespace-nowrap rounded-md flex items-center gap-1.5 ${
                activeTab === 'importer'
                  ? 'bg-slate-100 text-[#001f3f]'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Importar Matriz Unpivot
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="orimec-app-container">
        
        {/* Firestore Connection Permissions Instruction Panel (Only shows on error status) */}
        {syncStatus === 'error' && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3 shadow-xs animate-fadeIn" id="warning-rules-panel">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-orange-900">
              <h3 className="font-bold flex items-center gap-2">
                Instrucción de Reglas de Firestore requerida:
              </h3>
              <p className="mt-1 text-orange-700 leading-relaxed">
                El motor de Firebase devolvió un error de permisos o reglas. Para permitir que la aplicación realice lectura, escritura y unpivoteo de tus datos de la matriz de cursos de ORIMEC C.A., asegúrate de que tus reglas de Cloud Firestore se vean así:
              </p>
              <pre className="mt-2 font-mono text-[11px] bg-slate-900 text-slate-100 p-3.5 rounded-lg overflow-x-auto leading-relaxed">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
              </pre>
              <p className="mt-2 text-orange-850 font-medium">
                Detalle técnico detectado: <code className="bg-orange-100 px-1 py-0.5 rounded text-orange-950 font-mono">{errorMessage}</code>
              </p>
            </div>
          </div>
        )}

        {/* Seed banner removed — use Importar Matriz tab to load data via CSV */}

        {/* LOADING INDICATOR STATE */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200" id="loading-spinner-box">
            <RefreshCw className="w-8 h-8 text-sky-600 animate-spin mb-4" />
            <p className="text-sm font-semibold text-slate-800">Cargando base de datos Firestore en caliente...</p>
            <p className="text-xs text-slate-400 mt-1">Sincronizando ingenieros, cursos e historial de entrenamiento</p>
          </div>
        )}

        {/* MAIN BODY CONTENTS */}
        {!loading && (
          <>
            
            {/* VIEW 1: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-fadeIn" id="view-dashboard">
                
                {/* Bento Statistics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="bg-white rounded-xl p-5 border border-slate-200 flex items-center gap-4 hover:shadow-xs transition" id="stat-ingenieros">
                    <div className="w-11 h-11 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                      <Users className="w-5.5 h-5.5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Ingenieros</p>
                      <h4 className="text-xl font-bold text-slate-900 mt-0.5">{totalInvolucrados}</h4>
                      <p className="text-[9px] text-slate-400">Total en Quito/Gye/Cuenca</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-5 border border-slate-200 flex items-center gap-4 hover:shadow-xs transition" id="stat-cursos">
                    <div className="w-11 h-11 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <BookOpen className="w-5.5 h-5.5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Catálogo General</p>
                      <h4 className="text-xl font-bold text-slate-900 mt-0.5">{catalogoCount}</h4>
                      <p className="text-[9px] text-slate-400">Módulos especializados</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-5 border border-slate-200 flex items-center gap-4 hover:shadow-xs transition" id="stat-historial">
                    <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-5.5 h-5.5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Certificados Registrados</p>
                      <h4 className="text-xl font-bold text-slate-900 mt-0.5">{historialCount}</h4>
                      <p className="text-[9px] text-slate-400">Cursos completados</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-5 border border-slate-200 flex items-center gap-4 hover:shadow-xs transition" id="stat-inversion">
                    <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <PiggyBank className="w-5.5 h-5.5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Inversión Realizada</p>
                      <h4 className="text-xl font-bold text-slate-900 mt-0.5">${inversionTotalRealizada.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">USD</span></h4>
                      <p className="text-[9px] text-slate-400">Costo acumulado de fábrica</p>
                    </div>
                  </div>
                </div>

                {/* Sede Completion Cards (Quito vs Guayaquil vs Cuenca as demanded by perception layout) */}
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-450 tracking-wider mb-4 block">Distribución de Capacitaciones por Sede</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="sedes-completion-grid">
                    
                    {/* QUITO CARD */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-sky-300 transition" id="seat-quito">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-sky-600" />
                          <h4 className="text-xs font-bold text-slate-800">Sede Quito</h4>
                        </div>
                        <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
                          {sedeQuito.count} {sedeQuito.count === 1 ? 'Ingeniero' : 'Ingenieros'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Porcentaje de Completitud</span>
                          <span className="font-bold text-slate-900">{sedeQuito.rate}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-sky-500 h-full rounded-full transition-all duration-500" style={{ width: `${sedeQuito.rate}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 pt-1 font-mono">
                          <span>Histórico Aprobado</span>
                          <span>{sedeQuito.completedCount} cursos</span>
                        </div>
                      </div>
                    </div>

                    {/* GUAYAQUIL CARD */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-emerald-300 transition" id="seat-guayaquil">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-emerald-600" />
                          <h4 className="text-xs font-bold text-slate-800">Sede Guayaquil</h4>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {sedeGuayaquil.count} {sedeGuayaquil.count === 1 ? 'Ingeniero' : 'Ingenieros'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Porcentaje de Completitud</span>
                          <span className="font-bold text-slate-900">{sedeGuayaquil.rate}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${sedeGuayaquil.rate}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 pt-1 font-mono">
                          <span>Histórico Aprobado</span>
                          <span>{sedeGuayaquil.completedCount} cursos</span>
                        </div>
                      </div>
                    </div>

                    {/* CUENCA CARD */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-purple-300 transition" id="seat-cuenca">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-purple-600" />
                          <h4 className="text-xs font-bold text-slate-800">Sede Cuenca</h4>
                        </div>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                          {sedeCuenca.count} {sedeCuenca.count === 1 ? 'Ingeniero' : 'Ingenieros'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Porcentaje de Completitud</span>
                          <span className="font-bold text-slate-900">{sedeCuenca.rate}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${sedeCuenca.rate}%` }}></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 pt-1 font-mono">
                          <span>Histórico Aprobado</span>
                          <span>{sedeCuenca.completedCount} cursos</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Training Actions Quick Module */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Left component: Quick Assignment form */}
                  <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6" id="box-assign-form">
                    <div className="flex items-center gap-2 mb-4">
                      <BookMarked className="w-4.5 h-4.5 text-[#001f3f]" />
                      <h4 className="text-sm font-bold text-slate-900">Registrar Aprobación de Estudio Manual</h4>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                      Agrega un récord de entrenamiento de forma directa al historial para certificar que un ingeniero completó exitosamente un curso en una fecha determinada.
                    </p>

                    <form onSubmit={handleLogCompletion} className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Ingeniero Técnico</label>
                        <select
                          id="select-assign-engineer"
                          value={formHistIngId}
                          onChange={(e) => setFormHistIngId(e.target.value)}
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-sky-500 outline-none"
                          required
                        >
                          <option value="">-- Selecciona un Ingeniero --</option>
                          {ingenieros.map(ing => (
                            <option key={ing.id} value={ing.id}>{ing.nombre} [Sede {ing.sede}]</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Curso Especializado</label>
                        <select
                          id="select-assign-course"
                          value={formHistCurId}
                          onChange={(e) => setFormHistCurId(e.target.value)}
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-sky-500 outline-none"
                          required
                        >
                          <option value="">-- Selecciona el Curso --</option>
                          {(() => {
                            const MODALITY_META: Record<string, { label: string }> = {
                              CT:    { label: 'Tomógrafo CT' },
                              MR:    { label: 'Resonancia Magnética' },
                              FE:    { label: 'Fluoroscopía / Rayos X' },
                              NM:    { label: 'Medicina Nuclear' },
                              US:    { label: 'Ultrasonido' },
                              GE:    { label: 'General / Polivalente' },
                              QUAL:  { label: 'Calidad y Regulatorio' },
                              OTHER: { label: 'Otros' },
                            };
                            const getKey = (cur: typeof cursos[0]) => {
                              const m = (cur.modalidad || '').toUpperCase();
                              const c = (cur.codigo || '').toUpperCase();
                              if (m === 'CT' || c.includes('-CT') || c.startsWith('CT')) return 'CT';
                              if (m === 'MR' || c.includes('-MR') || c.startsWith('MR')) return 'MR';
                              if (m === 'NM' || c.includes('-NM') || c.startsWith('NM')) return 'NM';
                              if (m === 'US' || c.includes('-US') || c.startsWith('US')) return 'US';
                              if (m === 'FE' || c.includes('-FE') || c.startsWith('FE')) return 'FE';
                              if (m === 'GE' || c.includes('-GE') || c.startsWith('GE')) return 'GE';
                              if (c.includes('QUAL') || c.includes('QMS') || m.includes('QUAL')) return 'QUAL';
                              return 'OTHER';
                            };
                            const ORDER = ['CT','MR','FE','NM','US','GE','QUAL','OTHER'];
                            const grouped: Record<string, typeof cursos> = {};
                            cursos.forEach(cur => {
                              const key = getKey(cur);
                              if (!grouped[key]) grouped[key] = [];
                              grouped[key].push(cur);
                            });
                            return ORDER.filter(k => grouped[k]).map(key => (
                              <optgroup key={key} label={`── ${MODALITY_META[key].label}`}>
                                {grouped[key].map(cur => (
                                  <option key={cur.codigo} value={cur.codigo}>
                                    [{cur.codigo}] {cur.titulo}
                                  </option>
                                ))}
                              </optgroup>
                            ));
                          })()}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Fecha de Finalización</label>
                        <input
                          id="input-assign-date"
                          type="text"
                          value={formHistFecha}
                          onChange={(e) => setFormHistFecha(e.target.value)}
                          placeholder="MM/DD/YYYY"
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-sky-500 outline-none"
                          required
                        />
                      </div>

                      <button
                        id="btn-submit-completion"
                        type="submit"
                        className="w-full text-xs font-bold leading-none bg-slate-900 hover:bg-slate-800 text-white rounded-lg py-3 cursor-pointer transition flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4 text-emerald-400" />
                        Grabar en la Nube Firestore
                      </button>
                    </form>
                  </div>

                  {/* Right component: Recent completions list */}
                  <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6" id="box-recent-completions">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4.5 h-4.5 text-sky-600" />
                        <h4 className="text-sm font-bold text-slate-800">Cursos Registrados Recientemente</h4>
                      </div>
                      <button
                        id="btn-goto-historial"
                        onClick={() => setActiveTab('historial')}
                        className="text-[11px] font-bold text-sky-600 hover:underline cursor-pointer flex items-center gap-0.5"
                      >
                        Ver todo el historial <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                      {historialList.slice(-5).reverse().map((h) => {
                        const matchingIng = ingenieros.find(i => i.id === h.id_ingeniero);
                        const matchingCur = cursos.find(c => c.codigo === h.codigo_curso);
                        return (
                          <div key={h.id} className="p-3 bg-slate-50 rounded-lg border border-slate-150 flex justify-between items-center" id={`hist-item-${h.id}`}>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-950">{matchingIng ? matchingIng.nombre : h.id_ingeniero}</span>
                                {matchingIng && <span className="text-[8px] bg-slate-200 text-slate-600 px-1 py-0.2 rounded font-mono">{matchingIng.sede}</span>}
                              </div>
                              <button
                                onClick={() => openEditModal(h)}
                                className="block text-left text-[11px] text-slate-700 hover:text-sky-600 font-semibold hover:underline transition cursor-pointer"
                                title="Ver detalles y editar fecha"
                              >
                                {matchingCur ? matchingCur.titulo : `Curso: ${h.codigo_curso}`}
                              </button>
                              <p className="text-[9px] text-slate-400 font-mono">Código: {h.codigo_curso} • Completado: {h.fecha_completado}</p>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                id={`btn-edit-recent-${h.id}`}
                                onClick={() => openEditModal(h)}
                                className="text-slate-400 hover:text-sky-600 p-1 rounded hover:bg-sky-50 transition cursor-pointer"
                                title="Editar fecha de finalización"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                id={`btn-revoke-${h.id}`}
                                onClick={() => handleDeleteHistoryItem(h.id)}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition cursor-pointer"
                                title="Revocar Aprobación"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {historialList.length === 0 && (
                        <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-slate-450 text-xs">
                          No se han ingresado capacitaciones aún. Importa la matriz horizontal de fábrica para poblar de inmediato.
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* VIEW 2: CSV MATRIX UNPIVOT IMPORTER */}
            {activeTab === 'importer' && (
              <div className="space-y-8 animate-fadeIn" id="view-importer">
                
                {/* Toggle sub-tabs inside Importer View */}
                <div className="flex border-b border-slate-200 mb-2 bg-slate-200/50 p-1 rounded-xl gap-1 w-max">
                  <button
                    onClick={() => {
                      setImporterSubTab('csv');
                      setImportStatusMsg('');
                    }}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                      importerSubTab === 'csv'
                        ? 'bg-[#001f3f] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    📊 Matriz General CSV
                  </button>
                  <button
                    onClick={() => {
                      setImporterSubTab('pdf');
                      setImportStatusMsg('');
                    }}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                      importerSubTab === 'pdf'
                        ? 'bg-[#001f3f] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    📄 Acreditaciones (PDF / CSV)
                  </button>
                </div>

                {importerSubTab === 'csv' && (
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4 flex-col sm:flex-row gap-3">
                      <div>
                        <h3 className="text-base font-bold text-[#001f3f] font-display">Unpivoteador y Normalizador de Matriz de Cursos</h3>
                        <p className="text-xs text-slate-500">
                          La hoja de cálculo original de fábrica unifica en filas los códigos y nombres de cursos, agregando columnas por cada Ingeniero. Nuestro sistema "des-pivotea" (unpivot) automáticamente esta matriz bidimensional para guardarla de forma limpia en colecciones verticales de Firestore: <code className="bg-slate-100 text-slate-800 font-mono text-[10px] px-1">ingenieros</code>, <code className="bg-slate-100 text-slate-800 font-mono text-[10px] px-1">cursos</code> y <code className="bg-slate-100 text-slate-800 font-mono text-[10px] px-1">historial_entrenamiento</code>.
                        </p>
                      </div>

                      <button
                        id="btn-reset-csv"
                        onClick={() => setRawCsvText(MOCK_CURSOS_GE_FE_CSV)}
                        className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded border border-slate-300 cursor-pointer self-end sm:self-auto transition"
                        title="Volver a poner ejemplo predeterminado"
                      >
                        Cargar Ejemplo de Fábrica
                      </button>
                    </div>

                    {/* Ingestion Console Screen split */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Raw Text box area + File Upload */}
                      <div className="space-y-3">
                        {/* ── Botón de carga de archivo CSV ── */}
                        <div className="flex items-center gap-3">
                          <label
                            htmlFor="input-csv-file"
                            className="flex items-center gap-2 cursor-pointer bg-[#001f3f] hover:bg-sky-900 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition shadow-sm select-none"
                          >
                            <FileSpreadsheet className="w-4 h-4 text-teal-400" />
                            Cargar archivo .CSV
                          </label>
                          <input
                            id="input-csv-file"
                            type="file"
                            accept=".csv,text/csv"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              // Auto-detect encoding: UTF-8 vs Windows-1252 (Excel Spanish export)
                              const arrayReader = new FileReader();
                              arrayReader.onload = (ev) => {
                                const buffer = ev.target?.result as ArrayBuffer;
                                // Try UTF-8 first
                                const utf8Text = new TextDecoder('utf-8', { fatal: false }).decode(buffer);
                                // If replacement char (U+FFFD) found, the file is NOT utf-8 → use windows-1252
                                const text = utf8Text.includes('\uFFFD')
                                  ? new TextDecoder('windows-1252').decode(buffer)
                                  : utf8Text;
                                setRawCsvText(text);
                              };
                              arrayReader.readAsArrayBuffer(file);
                              // reset so same file can be re-selected
                              e.target.value = '';
                            }}
                          />
                          <span className="text-[10px] text-slate-400 font-mono">o pega el texto abajo</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-bold text-slate-600 block uppercase tracking-wider">Contenido CSV:</label>
                          <span className="text-[10px] text-slate-400 font-mono">Formato Matriz Horizontal</span>
                        </div>
                        
                        <textarea
                          id="textarea-csv-data"
                          rows={12}
                          value={rawCsvText}
                          onChange={(e) => setRawCsvText(e.target.value)}
                          placeholder="CÓDIGO,TÍTULO,MODALIDAD,INGENIERO 1,INGENIERO 2..."
                          className="w-full text-xs font-mono bg-slate-900 text-emerald-400 p-4 rounded-xl border border-slate-955 focus:ring-1 focus:ring-teal-400 focus:outline-none shadow-inner"
                        />
                        
                        <p className="text-[10px] text-slate-450 leading-relaxed font-medium">
                          * Carga tu archivo CSV directamente desde el botón de arriba, o pega el contenido copiado desde Excel / Google Sheets. Las columnas desde la posición 3 en adelante se interpretan como ingenieros.
                        </p>
                      </div>

                      {/* Live Unpivot Parser Screen */}
                      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <SlidersHorizontal className="w-4 h-4 text-emerald-650" />
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Previsualización de Normalización en Caliente:</h4>
                          </div>

                          {parsedPreview ? (
                            <div className="space-y-4">
                              {/* Counters */}
                              <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="p-3 bg-white border border-slate-150 rounded-lg">
                                  <h5 className="text-[9px] text-slate-400 uppercase font-bold font-mono">Ingenieros</h5>
                                  <p className="text-lg font-bold text-teal-600 mt-1">{parsedPreview.ingenieros.length}</p>
                                </div>
                                <div className="p-3 bg-white border border-slate-150 rounded-lg">
                                  <h5 className="text-[9px] text-slate-400 uppercase font-bold font-mono">Cursos</h5>
                                  <p className="text-lg font-bold text-indigo-600 mt-1">{parsedPreview.cursos.length}</p>
                                </div>
                                <div className="p-3 bg-white border border-slate-150 rounded-lg">
                                  <h5 className="text-[9px] text-slate-400 uppercase font-bold font-mono">Registros</h5>
                                  <p className="text-lg font-bold text-rose-500 mt-1">{parsedPreview.historial.length}</p>
                                </div>
                              </div>

                              {/* Engineers list */}
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-slate-500 block uppercase">Ingenieros a Registrar:</span>
                                <div className="flex flex-wrap gap-1 max-h-[80px] overflow-y-auto border border-slate-200 p-2 rounded bg-white">
                                  {parsedPreview.ingenieros.map(ing => (
                                    <span key={ing.id} className="text-[9px] font-mono font-medium bg-slate-100 text-[#001f3f] px-2 py-0.5 rounded border border-slate-150">
                                      {ing.nombre} ({ing.sede})
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Sample unpivot rows */}
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-slate-500 block uppercase font-mono">Muestra de registros de-pivot:</span>
                                <div className="max-h-[90px] overflow-y-auto border border-slate-200 rounded text-[10px] text-slate-600 font-mono bg-white divide-y divide-slate-100">
                                  {parsedPreview.historial.slice(0, 3).map((h, i) => {
                                    const matchingC = parsedPreview.cursos.find(c => c.codigo === h.codigo_curso);
                                    return (
                                      <div key={i} className="p-2 flex justify-between">
                                        <span>{h.id_ingeniero} → <strong className="text-slate-900">{h.codigo_curso}</strong></span>
                                        <span className="text-emerald-600 font-bold">{h.fecha_completado}</span>
                                      </div>
                                    );
                                  })}
                                  {parsedPreview.historial.length > 3 && (
                                    <div className="p-1 px-2 text-[9px] text-slate-400 text-center uppercase font-bold">
                                      + {parsedPreview.historial.length - 3} registros más
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* ── CONFIRMATION IMPORT BUTTON ── */}
                              <div className="pt-3 border-t border-slate-200">
                                <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3 leading-relaxed">
                                  ⚠️ Esto <strong>reemplazará</strong> todos los datos actuales en Firestore con los del CSV. Los duplicados serán eliminados automáticamente.
                                </p>
                                <button
                                  id="btn-import-unpivot-db"
                                  onClick={handleImportCSVToFirestore}
                                  className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md text-sm transition-all"
                                >
                                  <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                                  Sí, importar a Firestore
                                </button>

                                {importStatusMsg && (
                                  <div
                                    id="import-msg-panel"
                                    className={`p-3 mt-3 rounded-lg text-xs font-semibold ${
                                      importStatusMsg.startsWith('Error')
                                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    }`}
                                  >
                                    {importStatusMsg}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="p-8 text-center text-rose-600 text-xs bg-rose-50 border border-rose-200 rounded-lg font-bold">
                              CSV Inválido. Por favor, revisa que tenga los encabezados CÓDIGO, TÍTULO, MODALIDAD.
                            </div>
                          )}
                        </div>

                      </div>

                    </div>

                  </div>
                )}

                {importerSubTab === 'pdf' && (
                  <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-[#001f3f] font-display">Importar Transcripción de Acreditaciones desde PDF / CSV</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Sube el documento PDF o archivo CSV de la transcripción de capacitaciones de un colaborador (como la lista oficial de cursos realizados). El sistema extraerá automáticamente el nombre del ingeniero y el historial de aprobaciones con sus respectivos códigos y fechas. Podrás previsualizar y corregir los datos antes de guardarlos.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Upload area */}
                      <div className="lg:col-span-5 space-y-4">
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50/50 hover:bg-slate-50 hover:border-sky-300 transition duration-150 flex flex-col items-center justify-center min-h-[220px] relative">
                          <input
                            id="input-pdf-file"
                            type="file"
                            accept=".pdf,.csv"
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            onChange={handleIndividualFileUpload}
                            disabled={pdfLoading}
                          />
                          <div className="space-y-3">
                            <div className="w-12 h-12 bg-sky-50 rounded-full flex items-center justify-center mx-auto border border-sky-100 text-sky-600">
                              <Upload className="w-6 h-6 animate-pulse" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-700">Arrastra tu PDF o CSV aquí o haz clic para buscar</p>
                              <p className="text-[10px] text-slate-450 mt-1">Formatos admitidos: Transcripción en PDF (.pdf) o CSV (.csv)</p>
                            </div>
                          </div>
                        </div>

                        {pdfLoading && (
                          <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl flex items-center gap-3 justify-center text-xs font-bold text-sky-800">
                            <RefreshCw className="w-4 h-4 animate-spin text-sky-600" />
                            Analizando y procesando archivo...
                          </div>
                        )}

                        {importStatusMsg && (
                          <div className={`p-4 rounded-xl text-xs font-semibold border ${
                            importStatusMsg.startsWith('Error')
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}>
                            {importStatusMsg}
                          </div>
                        )}
                      </div>

                      {/* Preview & Edit Area */}
                      <div className="lg:col-span-7 space-y-5">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 min-h-[220px] flex flex-col justify-between">
                          {pdfParsedCourses.length > 0 ? (
                            <div className="space-y-4">
                              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                                <SlidersHorizontal className="w-4 h-4 text-sky-600" />
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Previsualización de Transcripción Parseada:</h4>
                              </div>

                              {/* Engineer Profile Edit */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-slate-150 shadow-xs">
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider font-mono">Nombre del Colaborador:</span>
                                  <input
                                    type="text"
                                    value={pdfParsedEngineerName}
                                    onChange={(e) => setPdfParsedEngineerName(e.target.value.toUpperCase())}
                                    className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2 py-1 outline-none text-[#001f3f] font-bold uppercase"
                                  />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider font-mono">Sede / Ciudad:</span>
                                  <select
                                    value={pdfParsedEngineerSede}
                                    onChange={(e) => setPdfParsedEngineerSede(e.target.value as 'Quito' | 'Guayaquil' | 'Cuenca')}
                                    className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2 py-1 outline-none text-[#001f3f] font-bold cursor-pointer"
                                  >
                                    <option value="Quito">📍 Quito</option>
                                    <option value="Guayaquil">📍 Guayaquil</option>
                                    <option value="Cuenca">📍 Cuenca</option>
                                  </select>
                                </div>
                              </div>

                              {/* Resolved Engineer Preview Info Card */}
                              {(() => {
                                const engineerId = resolveEngineerId(pdfParsedEngineerName, ingenieros);
                                const dbEng = ingenieros.find(i => i.id === engineerId);
                                if (pdfParsedEngineerName) {
                                  if (dbEng) {
                                    return (
                                      <div className="p-3.5 bg-emerald-50/60 border border-emerald-250 rounded-xl text-xs flex items-center justify-between shadow-xs animate-fadeIn">
                                        <div className="flex items-center gap-3">
                                          <div className="w-9 h-9 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-bold text-sm">
                                            {dbEng.nombre.charAt(0)}
                                          </div>
                                          <div>
                                            <div className="font-bold text-[#001f3f] text-[13px]">{dbEng.nombre}</div>
                                            <div className="text-[10px] text-[#137333] font-bold flex items-center gap-1 mt-0.5">
                                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Vinculando al perfil registrado ({dbEng.sede})
                                            </div>
                                          </div>
                                        </div>
                                        <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-1 rounded-lg uppercase shrink-0">
                                          ID: {dbEng.id}
                                        </span>
                                      </div>
                                    );
                                  } else {
                                    return (
                                      <div className="p-3.5 bg-amber-50/60 border border-amber-250 rounded-xl text-xs flex flex-col gap-2.5 shadow-xs animate-fadeIn">
                                        <div className="flex items-center justify-between w-full">
                                          <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center font-bold text-sm">
                                              ?
                                            </div>
                                            <div>
                                              <div className="font-bold text-[#001f3f] text-[13px]">{pdfParsedEngineerName}</div>
                                              <div className="text-[10px] text-amber-800 font-bold flex items-center gap-1 mt-0.5">
                                                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" /> Perfil No Registrado en Base de Datos
                                              </div>
                                            </div>
                                          </div>
                                          <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-1 rounded-lg uppercase shrink-0 animate-pulse">
                                            NUEVO COLABORADOR
                                          </span>
                                        </div>
                                        <p className="text-[10.5px] text-slate-500 leading-relaxed pl-2 border-l-2 border-amber-400">
                                          Este nombre no coincide con ningún ingeniero registrado. Al confirmar, <strong>se creará un colaborador nuevo</strong>. Si deseas asociarlo a un perfil existente, edita el cuadro de texto superior (ej. "ADRIAN BENAVIDES").
                                        </p>
                                      </div>
                                    );
                                  }
                                }
                                return null;
                              })()}

                              {/* Courses list table */}
                              <div className="space-y-1.5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Cursos Detectados ({pdfParsedCourses.length}):</span>
                                  <div className="flex flex-wrap items-center gap-2">
                                    {/* Borrar Duplicados button */}
                                    {hasDuplicatesInList && (
                                      <button
                                        onClick={handleRemoveDuplicatesFromList}
                                        className="text-[9px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 bg-rose-50 px-2 py-1 rounded border border-rose-100 hover:bg-rose-100 transition cursor-pointer"
                                        title="Eliminar cursos repetidos dentro de esta lista (conservando el más reciente)"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" /> Borrar Duplicados
                                      </button>
                                    )}

                                    {/* Borrar Similitud button */}
                                    {hasRegisteredCursos && (
                                      <button
                                        onClick={handleRemoveRegisteredFromList}
                                        className="text-[9px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 bg-amber-50 px-2 py-1 rounded border border-amber-150 hover:bg-amber-100 transition cursor-pointer"
                                        title="Eliminar cursos que ya están registrados en el historial de este colaborador"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" /> Borrar Similitud
                                      </button>
                                    )}
                                    <button
                                      onClick={() => {
                                        setPdfParsedCourses([...pdfParsedCourses, { codigo: '', titulo: 'Nuevo Curso Manual', fecha: '1/1/2026' }]);
                                      }}
                                      className="text-[9px] font-bold text-sky-600 hover:text-sky-850 flex items-center gap-1 bg-sky-50 px-2 py-1 rounded border border-sky-100 hover:bg-sky-100 transition cursor-pointer"
                                    >
                                      <Plus className="w-3.5 h-3.5" /> Añadir Curso
                                    </button>
                                  </div>
                                </div>

                                <div className="max-h-[220px] overflow-y-auto border border-slate-200 rounded bg-white shadow-xs divide-y divide-slate-100">
                                  {resolvedPdfCourses.map((entry, idx) => {
                                    const { item, cleanCode, catalogMatch, maxCatalogSim, resolvedCode } = entry;
                                    const engineerId = resolveEngineerId(pdfParsedEngineerName, ingenieros);
                                    
                                    // Check if this resolved course is already registered in Firestore history (by code or title similarity)
                                    const matchInDb = resolvedCode 
                                      ? historialList.find(h => {
                                          if (h.id_ingeniero !== engineerId) return false;
                                          if (h.codigo_curso === resolvedCode) return true;
                                          const dbCourse = cursos.find(c => c.codigo === h.codigo_curso);
                                          if (dbCourse && item.titulo && getSimilarity(item.titulo, dbCourse.titulo) >= 0.8) {
                                            return true;
                                          }
                                          return false;
                                        })
                                      : null;
                                    
                                    // Check for duplicates within the current pre-resolved list
                                    let occurrences = 0;
                                    for (let j = 0; j < resolvedPdfCourses.length; j++) {
                                      const other = resolvedPdfCourses[j];
                                      const codeMatches = resolvedCode && other.resolvedCode && resolvedCode === other.resolvedCode;
                                      const titleSimilar = item.titulo && other.item.titulo && getSimilarity(item.titulo, other.item.titulo) >= 0.8;
                                      if (codeMatches || titleSimilar) {
                                        occurrences++;
                                      }
                                    }
                                    const isDuplicateInList = occurrences > 1;
                                    
                                    let badge = null;
                                    if (!cleanCode && !catalogMatch) {
                                      badge = (
                                        <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[8.5px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 font-sans">
                                          <AlertCircle className="w-2.5 h-2.5 text-rose-500" /> Sin Código
                                        </span>
                                      );
                                    } else if (matchInDb) {
                                      const simText = maxCatalogSim < 1.0 ? ` (~${Math.round(maxCatalogSim * 100)}% título)` : '';
                                      badge = (
                                        <span className="bg-amber-50 text-[#8a6d1c] border border-amber-200 text-[8.5px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 font-sans" title={`Registrado en DB. Código DB: ${resolvedCode}. Título: ${catalogMatch?.titulo || ''}`}>
                                          <CheckCircle2 className="w-2.5 h-2.5 text-amber-500" /> Registrado ({matchInDb.fecha_completado}){simText}
                                        </span>
                                      );
                                    } else if (isDuplicateInList) {
                                      badge = (
                                        <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[8.5px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 font-sans">
                                          <AlertCircle className="w-2.5 h-2.5 text-rose-500" /> Duplicado en Lista
                                        </span>
                                      );
                                    } else if (catalogMatch) {
                                      const simText = (maxCatalogSim > 0.8 && maxCatalogSim < 1.0) ? ` (~${Math.round(maxCatalogSim * 100)}% título)` : '';
                                      badge = (
                                        <span className="bg-sky-50 text-sky-850 border border-sky-200 text-[8.5px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 font-sans" title={`Existe en catálogo como: ${catalogMatch.codigo}`}>
                                          <Database className="w-2.5 h-2.5 text-sky-550" /> En Catálogo{simText}
                                        </span>
                                      );
                                    } else {
                                      badge = (
                                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-250 text-[8.5px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 font-sans" title="Este código/curso es nuevo para el catálogo de ORIMEC C.A. Se creará automáticamente.">
                                          <Sparkles className="w-2.5 h-2.5 text-emerald-500" /> Nuevo Curso (Catálogo)
                                        </span>
                                      );
                                    }

                                    return (
                                      <div key={idx} className="p-3 flex flex-col gap-2 hover:bg-slate-50/50 transition">
                                        {/* Item header with status badge */}
                                        <div className="flex items-center justify-between w-full border-b border-slate-100 pb-1">
                                          <span className="text-[9px] font-bold text-slate-400 font-mono">CURSO #{idx + 1}</span>
                                          {badge}
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between text-xs w-full">
                                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                                            <div className="flex flex-col gap-0.5">
                                              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider font-mono">Código</span>
                                              <input
                                                type="text"
                                                value={item.codigo}
                                                onChange={(e) => {
                                                  const copy = [...pdfParsedCourses];
                                                  copy[idx].codigo = e.target.value.toUpperCase();
                                                  setPdfParsedCourses(copy);
                                                }}
                                                className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-mono font-bold w-full uppercase"
                                              />
                                            </div>
                                            <div className="flex flex-col gap-0.5 sm:col-span-2">
                                              <span className="text-[8px] text-slate-405 font-bold uppercase tracking-wider font-mono">Nombre del Curso</span>
                                              <input
                                                type="text"
                                                value={item.titulo}
                                                onChange={(e) => {
                                                  const copy = [...pdfParsedCourses];
                                                  copy[idx].titulo = e.target.value;
                                                  setPdfParsedCourses(copy);
                                                }}
                                                className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-bold w-full"
                                              />
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                                            <div className="flex flex-col gap-0.5">
                                              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider font-mono">Fecha</span>
                                              <input
                                                type="text"
                                                value={item.fecha}
                                                onChange={(e) => {
                                                  const copy = [...pdfParsedCourses];
                                                  copy[idx].fecha = e.target.value;
                                                  setPdfParsedCourses(copy);
                                                }}
                                                className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-mono text-center w-20"
                                              />
                                            </div>
                                            <button
                                              onClick={() => {
                                                setPdfParsedCourses(pdfParsedCourses.filter((_, i) => i !== idx));
                                              }}
                                              className="text-rose-500 hover:text-rose-700 transition cursor-pointer p-1 rounded hover:bg-rose-50 mt-3"
                                              title="Eliminar curso"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                          </div>
                                        </div>

                                        {/* Suggestion notice if there's a title similarity match but code differs */}
                                        {catalogMatch && catalogMatch.codigo !== cleanCode && (
                                          <div className="text-[9px] text-[#8a6d1c] bg-amber-50/40 px-2 py-1 rounded border border-dashed border-amber-200 mt-1 font-medium leading-relaxed">
                                            💡 El código ingresado ({cleanCode || 'vacío'}) difiere del catálogo de ORIMEC. Se registrará automáticamente bajo el código existente: <strong>{catalogMatch.codigo}</strong> ({catalogMatch.titulo}).
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Confirm buttons */}
                              <div className="pt-3 border-t border-slate-200 font-sans">
                                <div className="text-[10px] text-slate-550 mb-3 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed space-y-1.5 shadow-2xs font-medium">
                                  <div className="font-bold text-[#001f3f] flex items-center gap-1">
                                    🛡️ Garantía de No Duplicación:
                                  </div>
                                  <p className="text-[9.5px]">
                                    • Los cursos en estado <span className="bg-sky-50 text-sky-800 px-1 py-0.2 rounded font-bold">En Catálogo</span> ya existen en el sistema. <strong>No se duplicarán</strong> en el catálogo general al confirmar.
                                  </p>
                                  <p className="text-[9.5px]">
                                    • Los cursos en estado <span className="bg-amber-50 text-amber-800 px-1 py-0.2 rounded font-bold">Registrado</span> ya existen en el historial de este colaborador. <strong>Se omitirán automáticamente</strong> al confirmar para no duplicar su ficha.
                                  </p>
                                  <p className="text-[9.5px]">
                                    • Solo se registrarán en Firestore las aprobaciones del colaborador <strong>{pdfParsedEngineerName}</strong> que no existían previamente en su historial.
                                  </p>
                                </div>
                                <button
                                  onClick={handleImportPDFToFirestore}
                                  className="w-full bg-[#001f3f] hover:bg-sky-900 active:scale-[0.98] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md text-sm transition-all"
                                >
                                  <CheckCircle2 className="w-5 h-5 text-teal-300" />
                                  Confirmar y Registrar en Historial
                                </button>
                              </div>

                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-center text-slate-405 gap-3">
                              <FileText className="w-10 h-10 opacity-30" />
                              <p className="text-xs font-semibold max-w-xs leading-relaxed text-slate-400">
                                No hay transcripción cargada todavía. Sube el PDF a la izquierda para cargar y previsualizar los registros.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* VIEW 3: DISCOVER PATH RECOMMENDATION ROUTE (Siguiente Curso) */}
            {activeTab === 'rutas' && (
              <div className="space-y-8 animate-fadeIn" id="view-rutas">
                
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  
                  {/* Select Engineer & Description */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-zinc-100">
                    <div>
                      <h3 className="text-base font-bold text-[#001f3f] font-display">Algoritmo de Planificación del "Siguiente Curso Pendiente"</h3>
                      <p className="text-xs text-slate-500">
                        Selecciona un ingeniero especializado. El planificador computa en tiempo real sus acreditaciones logradas y recomienda el siguiente elemento formativo prioritario que debe estudiar dentro de su especialización de fábrica, identificando la brecha técnica restante y el costo del programa.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto relative" id="route-engineer-dropdown-container">
                      <label className="text-xs font-bold text-slate-600 uppercase font-mono whitespace-nowrap">Ingeniero Analizado:</label>
                      <div className="relative w-full md:w-64">
                        {/* Dropdown trigger button */}
                        <button
                          id="btn-route-engineer-dropdown"
                          onClick={() => {
                            setIsRouteEngDropdownOpen(!isRouteEngDropdownOpen);
                            setRouteEngSearchQuery('');
                          }}
                          className="w-full flex items-center justify-between gap-2.5 text-xs bg-white hover:bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:border-sky-500 outline-none font-bold text-slate-800 transition cursor-pointer shadow-sm text-left"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-5 h-5 rounded-full bg-[#001f3f] text-white flex items-center justify-center text-[10px] font-extrabold shrink-0">
                              {activeRouteIngeniero?.nombre.charAt(0)}
                            </span>
                            <span className="truncate uppercase">
                              {activeRouteIngeniero?.nombre}
                            </span>
                            <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded font-mono shrink-0">
                              {activeRouteIngeniero?.sede}
                            </span>
                          </div>
                          <ChevronRight className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isRouteEngDropdownOpen ? 'rotate-90' : ''}`} />
                        </button>

                        {/* Dropdown options popover */}
                        {isRouteEngDropdownOpen && (
                          <>
                            {/* Backdrop overlay */}
                            <div className="fixed inset-0 z-40" onClick={() => setIsRouteEngDropdownOpen(false)} />
                            
                            <div className="absolute right-0 left-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col animate-fadeIn">
                              {/* Search inside dropdown */}
                              <div className="p-2 border-b border-slate-100">
                                <input
                                  type="text"
                                  placeholder="Buscar ingeniero..."
                                  value={routeEngSearchQuery}
                                  onChange={(e) => setRouteEngSearchQuery(e.target.value)}
                                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none font-semibold"
                                  onClick={(e) => e.stopPropagation()} // Prevent closing dropdown when clicking input
                                />
                              </div>

                              {/* List of engineers */}
                              <div className="max-h-60 overflow-y-auto divide-y divide-slate-50 py-1">
                                {(() => {
                                  const filtered = ingenieros.filter(ing => 
                                    ing.nombre.toLowerCase().includes(routeEngSearchQuery.toLowerCase())
                                  );

                                  if (filtered.length === 0) {
                                    return (
                                      <div className="p-3 text-center text-slate-400 text-[11px]">
                                        No se encontraron ingenieros
                                      </div>
                                    );
                                  }

                                  return filtered.map(ing => {
                                    const isSelected = ing.id === selectedRouteIngenieroId;
                                    return (
                                      <button
                                        key={ing.id}
                                        onClick={() => {
                                          setSelectedRouteIngenieroId(ing.id);
                                          setSelectedRouteModalityFilter('ALL');
                                          setSelectedRouteYearFilter('TODOS');
                                          setIsRouteEngDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs transition cursor-pointer hover:bg-slate-50 ${
                                          isSelected ? 'bg-sky-50 text-sky-700 font-extrabold' : 'text-slate-700'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2 truncate">
                                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-extrabold shrink-0 ${
                                            isSelected ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-500'
                                          }`}>
                                            {ing.nombre.charAt(0)}
                                          </span>
                                          <span className="truncate uppercase">{ing.nombre}</span>
                                        </div>
                                        <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded font-mono shrink-0">
                                          {ing.sede}
                                        </span>
                                      </button>
                                    );
                                  });
                                })()}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Active recommendations outputs */}
                  {activeRouteIngeniero && activeRouteRecommendation ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="path-recommendation-details">
                      
                      {/* Left Block - Recommendation Summary card */}
                      <div className="lg:col-span-4 bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-6">
                        
                        {/* Profile header */}
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-[#001f3f] text-white font-extrabold flex items-center justify-center text-sm shadow">
                            {activeRouteIngeniero.nombre.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{activeRouteIngeniero.nombre}</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-[#001f3f]" />
                              Sede {activeRouteIngeniero.sede}
                            </p>
                          </div>
                        </div>

                        {/* Complete Percentage Gauge Widget */}
                        <div className="space-y-2 bg-white rounded-lg p-4 border border-slate-150">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Tasa de Aprobación Global</span>
                          <div className="flex items-baseline justify-between">
                            <span className="text-3xl font-black text-slate-900 font-display">{activeRouteRecommendation.porcentajeCompletitud}%</span>
                            <span className="text-xs text-slate-500 font-bold font-mono">
                              {activeRouteRecommendation.completados.length} / {activeRouteRecommendation.totalCursos} cursos
                            </span>
                          </div>
                          
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                            <div className="bg-sky-500 h-full rounded-full transition-all duration-500" style={{ width: `${activeRouteRecommendation.porcentajeCompletitud}%` }}></div>
                          </div>
                        </div>

                        {/* Estimate Completed Cost widget */}
                        <div className="space-y-2 bg-white rounded-lg p-4 border border-slate-150">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Inversión Financiera Realizada</span>
                          <h4 className="text-2xl font-bold text-[#001f3f] font-mono">
                            ${activeRouteRecommendation.completados.reduce((acc, cur) => acc + (cur.costo || 0), 0).toLocaleString()} USD
                          </h4>
                          <p className="text-[9.5px] text-slate-500 leading-tight">
                            Este valor corresponde al costo acumulado de los {activeRouteRecommendation.completados.filter(c => (c.costo || 0) > 0).length} cursos acreditados que tienen un valor registrado.
                          </p>
                        </div>

                      </div>

                      {/* Right Block - Recommended Course output & entire timeline */}
                      <div className="lg:col-span-8 space-y-6">
                        
                        {/* ESPECIALIZACIONES Y ACREDITACIONES CON X */}
                        <div className="bg-gradient-to-br from-slate-900 to-sky-950 text-white rounded-xl p-6 border border-slate-800 shadow relative overflow-hidden animate-fadeIn" id="box-recommended-hero">
                          
                          {/* Top Tag banner */}
                          <div className="flex justify-between items-center mb-5 pb-3 border-b border-white/10">
                            <span className="inline-flex items-center gap-1.5 text-[8px] bg-teal-400/20 text-teal-300 font-extrabold tracking-widest uppercase px-2 py-1 rounded-full border border-teal-500/10 font-mono">
                              <Award className="w-2.5 h-2.5 text-teal-400" /> Acreditaciones y Niveles por Modalidad
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono uppercase">Resumen de Especialización</span>
                          </div>

                          {(() => {
                            const startedMods = ALL_MODALITIES_LIST.filter(m => (activeRouteRecommendation.modalityLevels[m.key] || 0) > 0);
                            if (startedMods.length === 0) {
                              return (
                                <div className="text-center py-8 text-slate-400 text-xs">
                                  <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50 animate-pulse" />
                                  <p className="font-semibold text-slate-350">Sin especialidades iniciadas todavía</p>
                                  <p className="text-[10px] text-slate-550 mt-1 max-w-xs mx-auto">
                                    Para comenzar el plan de estudio, registre al menos una acreditación de curso para este ingeniero en el catálogo.
                                  </p>
                                </div>
                              );
                            }

                            return (
                              <div className="space-y-4">
                                <p className="text-[11px] text-slate-300 leading-relaxed mb-1">
                                  Especialidades de fábrica iniciadas por el colaborador técnico y su nivel de acreditación actual basado en el esquema de niveles: Básico (<strong>X</strong>), Intermedio (<strong>XX</strong>) y Avanzado (<strong>XXX</strong>).
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {startedMods.map(mod => {
                                    const lvl = activeRouteRecommendation.modalityLevels[mod.key] || 0;
                                    
                                    // Visual Level representations (X) and colors
                                    let levelStr = '';
                                    let levelDesc = '';
                                    let levelColor = '';
                                    let badgeColor = '';
                                    
                                    if (lvl === 1) {
                                      levelStr = 'X';
                                      levelDesc = 'Falta Intermedio y Avanzado';
                                      levelColor = 'text-amber-300';
                                      badgeColor = 'bg-amber-400/10 border-amber-400/20';
                                    } else if (lvl === 2) {
                                      levelStr = 'XX';
                                      levelDesc = 'Falta Avanzado';
                                      levelColor = 'text-sky-300';
                                      badgeColor = 'bg-sky-400/10 border-sky-400/20';
                                    } else if (lvl === 3) {
                                      levelStr = 'XXX';
                                      levelDesc = 'Especialización al máximo';
                                      levelColor = 'text-emerald-450';
                                      badgeColor = 'bg-emerald-450/15 border-emerald-400/30';
                                    }

                                    return (
                                      <button
                                        key={mod.key}
                                        onClick={() => {
                                          setSelectedRouteModalityForModal(mod.key);
                                        }}
                                        className="w-full text-left bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:bg-white/10 active:scale-[0.99] transition cursor-pointer"
                                        title={`Haga clic para ver los cursos de la modalidad ${mod.label}`}
                                      >
                                        <div className="flex justify-between items-start gap-2 w-full">
                                          <div className="flex items-center gap-1.5 min-w-0">
                                            <span className={`w-2 h-2 rounded-full ${mod.dot} flex-shrink-0`} />
                                            <h5 className="text-xs font-bold font-display truncate text-white">{mod.label}</h5>
                                          </div>
                                          
                                          <span className={`text-xs font-black font-mono px-2 py-0.5 rounded border leading-none shrink-0 ${levelColor} ${badgeColor}`}>
                                            {levelStr}
                                          </span>
                                        </div>

                                        <div className="space-y-1.5 w-full">
                                          <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                                            <span>Progreso: {lvl}/3 niveles</span>
                                            <span className={`font-semibold ${levelColor}`}>{levelDesc}</span>
                                          </div>
                                          {/* Visual progress bar */}
                                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex gap-0.5">
                                            <div className={`h-full rounded-l-full transition-all duration-300 ${lvl >= 1 ? 'bg-teal-400' : 'bg-slate-700'}`} style={{ width: '33.3%' }}></div>
                                            <div className={`h-full transition-all duration-300 ${lvl >= 2 ? 'bg-teal-400' : 'bg-slate-700'}`} style={{ width: '33.3%' }}></div>
                                            <div className={`h-full rounded-r-full transition-all duration-300 ${lvl >= 3 ? 'bg-teal-400' : 'bg-slate-700'}`} style={{ width: '33.3%' }}></div>
                                          </div>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}

                        </div>

                        {/* List representing full Training Timeline of the specialized path */}
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">
                              Línea de Progreso Detallada:
                            </h4>
                          </div>

                          {(() => {
                            const ingHistForRoute = activeRouteIngeniero ? historialList.filter(h => h.id_ingeniero === activeRouteIngeniero.id) : [];
                            const routeYears = Array.from(new Set<string>(ingHistForRoute.map(h => {
                              const raw = h.fecha_completado || '';
                              const match = raw.match(/(20\d{2})/);
                              return match ? match[1] : 'Sin fecha';
                            }))).sort((a, b) => b.localeCompare(a));

                            const filteredCompletados = activeRouteRecommendation.completados.filter(curso => {
                              if (selectedRouteYearFilter === 'TODOS') return true;
                              const matchHist = historialList.find(h => h.id_ingeniero === activeRouteIngeniero.id && h.codigo_curso === curso.codigo);
                              if (!matchHist) return false;
                              const raw = matchHist.fecha_completado || '';
                              const match = raw.match(/(20\d{2})/);
                              const courseYear = match ? match[1] : 'Sin fecha';
                              return courseYear === selectedRouteYearFilter;
                            });

                            const showPending = selectedRouteYearFilter === 'TODOS';

                            return (
                              <div className="space-y-4">
                                {/* Year pills for route timeline */}
                                <div className="flex flex-wrap gap-1.5 items-center bg-slate-900/40 p-2 rounded-xl border border-white/5">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-2 font-mono pl-1">Filtrar Año:</span>
                                  <button
                                    onClick={() => setSelectedRouteYearFilter('TODOS')}
                                    className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                                      selectedRouteYearFilter === 'TODOS'
                                        ? 'bg-white text-slate-950 border-white'
                                        : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                                    }`}
                                  >
                                    Todos
                                  </button>
                                  {routeYears.map(year => (
                                    <button
                                      key={year}
                                      onClick={() => setSelectedRouteYearFilter(year)}
                                      className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                                        selectedRouteYearFilter === year
                                          ? 'bg-sky-500 text-white border-sky-500'
                                          : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                                      }`}
                                    >
                                      {year}
                                      <span className="ml-1 text-[8.5px] opacity-75">
                                        ({ingHistForRoute.filter(h => {
                                          const m = (h.fecha_completado || '').match(/(20\d{2})/);
                                          return m ? m[1] === year : year === 'Sin fecha';
                                        }).length})
                                      </span>
                                    </button>
                                  ))}
                                </div>

                                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                                  {/* Render Completed courses first */}
                                  {filteredCompletados.map(curso => {
                                    const matchHist = historialList.find(h => h.id_ingeniero === activeRouteIngeniero.id && h.codigo_curso === curso.codigo);
                                    return (
                                      <button
                                        key={curso.codigo}
                                        onClick={() => {
                                          if (matchHist) openEditModal(matchHist);
                                        }}
                                        className="w-full text-left p-3.5 bg-emerald-50/50 border border-emerald-150 rounded-lg flex items-center justify-between hover:bg-emerald-100/50 hover:border-emerald-250 transition cursor-pointer hover:shadow-xs animate-fadeIn"
                                        title="Haga clic para ver detalles y editar fecha"
                                      >
                                        <div className="flex items-start gap-3">
                                          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center mt-0.5 shadow-sm">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                          </div>
                                          <div>
                                            <span className="text-[10px] font-mono font-bold text-emerald-800">[{curso.codigo}] • Completado</span>
                                            <h5 className="text-xs font-bold text-slate-900">{curso.titulo}</h5>
                                            <p className="text-[9.5px] text-slate-450">Acreditación: {matchHist?.fecha_completado || 'Fábrica'}</p>
                                          </div>
                                        </div>
                                        <span className="text-xs font-mono font-medium text-slate-500">${curso.costo} USD</span>
                                      </button>
                                    );
                                  })}

                                  {/* Render pending courses */}
                                  {showPending && activeRouteRecommendation.pendientes.map((curso, idx) => {
                                    const isNext = idx === 0;
                                    return (
                                      <div key={curso.codigo} className={`p-3.5 rounded-lg border flex items-center justify-between ${
                                        isNext 
                                          ? 'bg-amber-50/50 border-amber-250 ring-1 ring-amber-200' 
                                          : 'bg-white border-slate-200'
                                      }`}>
                                        <div className="flex items-start gap-3">
                                          <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 shadow-sm text-white ${
                                            isNext ? 'bg-amber-500' : 'bg-slate-300'
                                          }`}>
                                            <Clock className="w-3.5 h-3.5" />
                                          </div>
                                          <div>
                                            <span className={`text-[10px] font-mono font-bold ${
                                              isNext ? 'text-amber-805' : 'text-slate-500'
                                            }`}>
                                              [{curso.codigo}] • {isNext ? 'Siguiente por Tomar' : 'Pendiente'}
                                            </span>
                                            <h5 className="text-xs font-bold text-slate-900">{curso.titulo}</h5>
                                            <p className="text-[9.5px] text-slate-450">Especialidad: {curso.modalidad}</p>
                                          </div>
                                        </div>
                                        <span className="text-xs font-mono font-medium text-slate-500">${curso.costo} USD</span>
                                      </div>
                                    );
                                  })}

                                  {/* Empty state for year filters */}
                                  {filteredCompletados.length === 0 && (!showPending || activeRouteRecommendation.pendientes.length === 0) && (
                                    <div className="text-center py-10 bg-slate-100/50 border border-slate-200 rounded text-xs text-slate-400">
                                      No se encontraron capacitaciones finalizadas {selectedRouteYearFilter !== 'TODOS' ? `en el año ${selectedRouteYearFilter}` : ''}.
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                      </div>

                    </div>
                  ) : (
                    <div className="text-center py-20 bg-slate-50 rounded-xl text-slate-400 text-xs">
                      No hay ingenieros en la plantilla para planificar rutas formativas. Agrega personal primero para iniciar el motor de inteligencia.
                    </div>
                  )}

                </div>

              </div>
            )}

            {/* VIEW 4: NÓMINA DE INGENIEROS — Master/Detail */}
            {activeTab === 'ingenieros' && (
              <div className="animate-fadeIn" id="view-ingenieros">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                  {/* ── LEFT: Engineer list + Add form ── */}
                  <div className="lg:col-span-4 flex flex-col gap-4">

                    {/* Search + filters */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="w-4 h-4 text-[#001f3f]" />
                        <h4 className="text-sm font-bold text-slate-900">Nómina de Ingenieros</h4>
                        <span className="ml-auto text-[10px] bg-slate-100 border font-bold px-2 py-0.5 rounded text-slate-500">
                          {ingenieros.length}
                        </span>
                      </div>

                      {/* Search */}
                      <div className="relative mb-2">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="search-engineer"
                          type="text"
                          placeholder="Buscar por nombre..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 focus:border-sky-400 outline-none"
                        />
                      </div>

                      {/* City filter */}
                      <select
                        id="filter-sede"
                        value={sedeFilter}
                        onChange={(e) => setSedeFilter(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 outline-none font-semibold"
                      >
                        <option value="TODOS">Todas las Sedes</option>
                        <option value="Quito">Sede Quito</option>
                        <option value="Guayaquil">Sede Guayaquil</option>
                        <option value="Cuenca">Sede Cuenca</option>
                        <option value="Sede Central">Sede Central</option>
                      </select>
                    </div>

                    {/* Engineer list */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                      <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100">
                        {ingenieros
                          .filter(ing => {
                            const matchSede = sedeFilter === 'TODOS' || ing.sede === sedeFilter;
                            const matchQ = ing.nombre.toLowerCase().includes(searchQuery.toLowerCase());
                            return matchSede && matchQ;
                          })
                          .map(ing => {
                            const hist = historialList.filter(h => h.id_ingeniero === ing.id);
                            const isSelected = selectedIngId === ing.id;
                            return (
                              <button
                                key={ing.id}
                                id={`btn-select-eng-${ing.id}`}
                                onClick={() => { 
                                  setSelectedIngId(ing.id); 
                                  setSelectedYearFilter('TODOS'); 
                                  setSelectedHistoryModalityFilter('TODAS');
                                }}
                                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#001f3f] text-white'
                                    : 'hover:bg-slate-50 text-slate-800'
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 ${
                                  isSelected ? 'bg-white text-[#001f3f]' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {ing.nombre.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <p className={`text-[11px] font-bold truncate uppercase ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                    {ing.nombre}
                                  </p>
                                  <p className={`text-[9px] font-mono ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                                    {ing.sede} &bull; {hist.length} cert.
                                  </p>
                                </div>
                                {isSelected && <span className="ml-auto text-white opacity-60 text-xs">›</span>}
                              </button>
                            );
                          })}
                        {ingenieros.filter(i => (
                          (sedeFilter === 'TODOS' || i.sede === sedeFilter) &&
                          i.nombre.toLowerCase().includes(searchQuery.toLowerCase())
                        )).length === 0 && (
                          <div className="py-10 text-center text-xs text-slate-400">Sin ingenieros que coincidan.</div>
                        )}
                      </div>
                    </div>

                    {/* Add new engineer form */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Plus className="w-4 h-4 text-purple-600" />
                        <h5 className="text-xs font-bold text-slate-800">Registrar Nuevo Ingeniero</h5>
                      </div>
                      <form onSubmit={handleAddIngeniero} className="space-y-2">
                        <input
                          id="input-eng-name"
                          type="text"
                          value={formIngNombre}
                          onChange={(e) => setFormIngNombre(e.target.value)}
                          placeholder="Nombre completo"
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-sky-500 outline-none uppercase font-semibold"
                          required
                        />
                        <select
                          id="select-eng-sede"
                          value={formIngSede}
                          onChange={(e) => setFormIngSede(e.target.value as any)}
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-sky-500 outline-none"
                        >
                          <option value="Quito">Sede Quito</option>
                          <option value="Guayaquil">Sede Guayaquil</option>
                          <option value="Cuenca">Sede Cuenca</option>
                          <option value="Sede Central">Sede Central</option>
                        </select>
                        <button
                          id="btn-save-engineer"
                          type="submit"
                          className="w-full text-xs font-bold bg-slate-900 hover:bg-slate-700 text-white rounded-lg py-2.5 cursor-pointer transition flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5 text-emerald-400" />
                          Guardar en Firestore
                        </button>
                      </form>
                    </div>

                  </div>

                  {/* ── RIGHT: Engineer detail panel ── */}
                  <div className="lg:col-span-8">
                    {(() => {
                      const ing = ingenieros.find(i => i.id === selectedIngId);
                      if (!ing) {
                        return (
                          <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white border border-dashed border-slate-200 rounded-xl text-slate-400 gap-3">
                            <Users className="w-10 h-10 opacity-30" />
                            <p className="text-xs font-medium">Selecciona un ingeniero de la lista para ver su perfil y cursos</p>
                          </div>
                        );
                      }

                      // Courses of this engineer
                      const ingHist = historialList.filter(h => h.id_ingeniero === ing.id);

                      // Extract years as string[]
                      const allYearLabels = ingHist.map(h => {
                        const raw = h.fecha_completado || '';
                        const match = raw.match(/(20\d{2})/);
                        return match ? match[1] : 'Sin fecha';
                      });
                      const years: string[] = Array.from(new Set<string>(allYearLabels)).sort((a, b) => b.localeCompare(a));

                      // Filter by year and modality
                      const filteredHist = ingHist.filter(h => {
                        // 1. Year filter
                        if (selectedYearFilter !== 'TODOS') {
                          const match = (h.fecha_completado || '').match(/(20\d{2})/);
                          const yearMatch = match ? match[1] === selectedYearFilter : selectedYearFilter === 'Sin fecha';
                          if (!yearMatch) return false;
                        }
                        
                        // 2. Modality filter
                        if (selectedHistoryModalityFilter !== 'TODAS') {
                          const cur = cursos.find(c => c.codigo === h.codigo_curso);
                          if (!cur) return false;
                          const modKey = getModKey(cur);
                          if (modKey !== selectedHistoryModalityFilter) return false;
                        }
                        
                        return true;
                      });

                      // Completion %


                      // For each modality, find the level achieved based on completed courses (capped at 3)
                      const modalityLevels: Record<string, number> = {};
                      ALL_MODALITIES_LIST.forEach(m => {
                        const completedInMod = ingHist.filter(h => {
                          const cur = cursos.find(c => c.codigo === h.codigo_curso);
                          return cur && getModKey(cur) === m.key;
                        });
                        const maxCourseLvl = completedInMod.reduce((max, h) => {
                          const cur = cursos.find(c => c.codigo === h.codigo_curso);
                          return cur ? Math.max(max, getLevelNum(cur)) : max;
                        }, 0);
                        modalityLevels[m.key] = Math.min(Math.max(completedInMod.length, maxCourseLvl), 3);
                      });

                      const pct = cursos.length > 0 ? Math.round((ingHist.length / cursos.length) * 100) : 0;

                      return (
                        <div className="space-y-5">

                          {/* Profile card */}
                          <div className="bg-white border border-slate-200 rounded-xl p-5">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[#001f3f] text-white flex items-center justify-center text-lg font-extrabold shrink-0">
                                  {ing.nombre.charAt(0)}
                                </div>
                                <div>
                                  <h3 className="text-base font-extrabold text-slate-900 uppercase">{ing.nombre}</h3>
                                  <p className="text-[10px] font-mono text-slate-400">ID: {ing.id}</p>
                                </div>
                              </div>

                              {/* Editable city */}
                              <div className="flex flex-col gap-1 min-w-[180px]">
                                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Ciudad / Sede</label>
                                <select
                                  id={`select-sede-${ing.id}`}
                                  value={ing.sede}
                                  onChange={(e) => handleUpdateIngSede(ing.id, e.target.value)}
                                  className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:border-sky-500 outline-none text-[#001f3f] cursor-pointer"
                                >
                                  <option value="Quito">📍 Quito</option>
                                  <option value="Guayaquil">📍 Guayaquil</option>
                                  <option value="Cuenca">📍 Cuenca</option>
                                  <option value="Sede Central">📍 Sede Central</option>
                                </select>
                              </div>

                              {/* Delete */}
                              <button
                                id={`btn-del-eng-detail-${ing.id}`}
                                onClick={() => handleDeleteIngeniero(ing.id, ing.nombre)}
                                className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                                title="Dar de baja"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* ── Modality level grid (x / xx / xxx) ── */}
                            <div className="mt-5 pt-4 border-t border-slate-100">
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                                  Matriz de Nivel por Modalidad ({ingHist.length} capacitaciones)
                                </p>
                                {selectedHistoryModalityFilter !== 'TODAS' && (
                                  <button
                                    onClick={() => setSelectedHistoryModalityFilter('TODAS')}
                                    className="text-[9px] font-bold text-sky-600 hover:text-sky-800 transition cursor-pointer"
                                  >
                                    Limpiar filtro [x]
                                  </button>
                                )}
                              </div>
                              
                              {(() => {
                                const trainedModalities = ALL_MODALITIES_LIST.filter(mod => (modalityLevels[mod.key] || 0) > 0);
                                if (trainedModalities.length === 0) {
                                  return (
                                    <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                                      Sin capacitaciones registradas.
                                    </div>
                                  );
                                }
                                return (
                                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                                    {trainedModalities.map(mod => {
                                      const lvl = modalityLevels[mod.key] || 0;
                                      const isActiveFilter = selectedHistoryModalityFilter === mod.key;
                                      
                                      // Style depending on level
                                      let badgeBg = 'bg-slate-50 text-slate-400 border-slate-200';
                                      let levelStr = 'no';
                                      let levelDesc = 'Sin capacitar';
                                      let dotBg = 'bg-slate-300';

                                      if (lvl === 1) {
                                        badgeBg = 'bg-slate-50 border-slate-200';
                                        levelStr = 'x';
                                        levelDesc = 'Básico';
                                        dotBg = 'bg-slate-500';
                                      } else if (lvl === 2) {
                                        badgeBg = 'bg-sky-50 border-sky-200';
                                        levelStr = 'xx';
                                        levelDesc = 'Intermedio';
                                        dotBg = 'bg-sky-500';
                                      } else if (lvl === 3) {
                                        badgeBg = 'bg-emerald-50 border-emerald-200';
                                        levelStr = 'xxx';
                                        levelDesc = 'Experto';
                                        dotBg = 'bg-emerald-500';
                                      }

                                      return (
                                        <button
                                          key={mod.key}
                                          id={`btn-mod-filter-${mod.key}`}
                                          onClick={() => {
                                            if (isActiveFilter) {
                                              setSelectedHistoryModalityFilter('TODAS');
                                            } else {
                                              setSelectedHistoryModalityFilter(mod.key);
                                            }
                                          }}
                                          className={`flex flex-col justify-between p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${badgeBg} ${
                                            isActiveFilter
                                              ? 'ring-2 ring-sky-500 ring-offset-1 shadow-sm border-transparent'
                                              : 'hover:shadow-xs hover:border-slate-300'
                                          }`}
                                          title={`Haga clic para filtrar cursos de ${mod.label} (${levelDesc})`}
                                        >
                                          <div className="flex items-center gap-1.5 min-w-0 w-full">
                                            <span className={`w-1.5 h-1.5 rounded-full ${dotBg} shrink-0`} />
                                            <span className={`text-[10px] font-extrabold truncate ${lvl === 0 ? 'text-slate-400' : 'text-slate-800'}`}>
                                              {mod.label}
                                            </span>
                                          </div>
                                          
                                          <div className="flex items-center justify-between w-full mt-1.5 pt-1.5 border-t border-slate-100/50">
                                            <span className={`text-[9px] font-black font-mono px-1 py-0.5 rounded ${
                                              lvl === 0 
                                                ? 'bg-slate-200/50 text-slate-400' 
                                                : lvl === 1 
                                                  ? 'bg-slate-200 text-slate-600' 
                                                  : lvl === 2 
                                                    ? 'bg-sky-100 text-sky-700' 
                                                    : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                              {levelStr}
                                            </span>
                                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">
                                              {lvl === 1 ? 'Basic' : lvl === 2 ? 'Profic' : lvl === 3 ? 'Adv' : 'None'}
                                            </span>
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>

                          {/* Year filter tabs */}
                          <div className="bg-white border border-slate-200 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-xs font-bold text-slate-700">Cursos completados por año</h4>
                              <span className="text-[10px] text-slate-400 font-mono">{filteredHist.length} registros</span>
                            </div>

                            {/* Filter active banner */}
                            {(selectedYearFilter !== 'TODOS' || selectedHistoryModalityFilter !== 'TODAS') && (
                              <div className="mb-4 px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase">
                                  <span>Filtros activos:</span>
                                  {selectedYearFilter !== 'TODOS' && (
                                    <span className="px-1.5 py-0.5 bg-sky-100 text-sky-800 rounded font-mono">Año: {selectedYearFilter}</span>
                                  )}
                                  {selectedHistoryModalityFilter !== 'TODAS' && (
                                    <span className="px-1.5 py-0.5 bg-violet-100 text-violet-800 rounded font-mono">Modalidad: {selectedHistoryModalityFilter}</span>
                                  )}
                                </div>
                                <button
                                  onClick={() => {
                                    setSelectedYearFilter('TODOS');
                                    setSelectedHistoryModalityFilter('TODAS');
                                  }}
                                  className="text-[9px] font-extrabold text-rose-600 hover:text-rose-800 transition cursor-pointer"
                                >
                                  Limpiar todos
                                </button>
                              </div>
                            )}

                            {/* Year pills */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              <button
                                onClick={() => setSelectedYearFilter('TODOS')}
                                className={`px-3 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                                  selectedYearFilter === 'TODOS'
                                    ? 'bg-[#001f3f] text-white border-[#001f3f]'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                Todos
                              </button>
                              {years.map(year => (
                                <button
                                  key={year}
                                  id={`pill-year-${year}`}
                                  onClick={() => setSelectedYearFilter(year)}
                                  className={`px-3 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                                    selectedYearFilter === year
                                      ? 'bg-sky-600 text-white border-sky-600'
                                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                  }`}
                                >
                                  {year}
                                  <span className="ml-1 text-[9px] opacity-70">
                                    ({ingHist.filter(h => {
                                      const m = (h.fecha_completado || '').match(/(20\d{2})/);
                                      return m ? m[1] === year : year === 'Sin fecha';
                                    }).length})
                                  </span>
                                </button>
                              ))}
                            </div>

                            {/* Course rows */}
                            {filteredHist.length === 0 ? (
                              <div className="py-10 text-center text-xs text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                                Sin cursos registrados {selectedYearFilter !== 'TODOS' ? `en ${selectedYearFilter}` : ''}.
                              </div>
                            ) : (
                              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                                {filteredHist.map((h, idx) => {
                                  const curso = cursos.find(c => c.codigo === h.codigo_curso);
                                  const rawYear = (h.fecha_completado || '').match(/(20\d{2})/);
                                  const yearLabel = rawYear ? rawYear[1] : '?';
                                  return (
                                    <button
                                      key={idx}
                                      onClick={() => openEditModal(h)}
                                      className="w-full flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/70 hover:border-slate-300 transition text-left cursor-pointer hover:shadow-xs"
                                      title="Haga clic para ver detalles y editar fecha"
                                    >
                                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-bold text-slate-900 truncate">
                                          {curso?.titulo ?? h.codigo_curso}
                                        </p>
                                        <p className="text-[9px] font-mono text-slate-400">
                                          [{h.codigo_curso}] &bull; {curso?.modalidad ?? '—'}
                                        </p>
                                      </div>
                                      <div className="text-right shrink-0">
                                        <span className="text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-100 rounded px-2 py-0.5">
                                          {h.fecha_completado}
                                        </span>
                                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">{yearLabel}</p>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                        </div>
                      );
                    })()}
                  </div>

                </div>

              </div>
            )}

            {/* VIEW 5: CATALOGUE OF COURSES */}
            {activeTab === 'cursos' && (
              <div className="space-y-8 animate-fadeIn" id="view-cursos">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Course creation panel */}
                  <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 h-fit" id="box-course-create">
                    <div className="flex items-center gap-2 mb-4">
                      <Plus className="w-4.5 h-4.5 text-indigo-500" />
                      <h4 className="text-sm font-bold text-slate-900">Agregar Curso Especializado</h4>
                    </div>

                    <form onSubmit={handleAddCurso} className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Código del Curso *</label>
                        <input
                          id="input-course-code"
                          type="text"
                          value={formCurCodigo}
                          onChange={(e) => setFormCurCodigo(e.target.value)}
                          placeholder="Ej. GE-04 o FE-04"
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-sky-500 outline-none uppercase font-bold font-mono"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Título del Curso *</label>
                        <input
                          id="input-course-title"
                          type="text"
                          value={formCurTitulo}
                          onChange={(e) => setFormCurTitulo(e.target.value)}
                          placeholder="Ej. Procedimientos de Resonancia Magnética"
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-sky-500 outline-none font-semibold text-slate-800"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Modalidad / Prefijo</label>
                          <input
                            id="input-course-mod"
                            type="text"
                            value={formCurModalidad}
                            onChange={(e) => setFormCurModalidad(e.target.value)}
                            placeholder="GE, FE..."
                            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-sky-500 outline-none uppercase font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Costo Estimado ($)</label>
                          <input
                            id="input-course-cost"
                            type="number"
                            value={formCurCosto}
                            onChange={(e) => setFormCurCosto(Number(e.target.value) || 0)}
                            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:border-sky-500 outline-none font-mono"
                          />
                        </div>
                      </div>

                      <button
                        id="btn-save-course"
                        type="submit"
                        className="w-full text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg py-3 cursor-pointer transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Plus className="w-4 h-4 text-emerald-400" />
                        Guardar Módulo formativo
                      </button>
                    </form>
                  </div>

                  {/* Course list grid panel */}
                  <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6" id="box-course-list">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-zinc-100">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Catálogo de Cursos Estructurados</h4>
                        <p className="text-xs text-slate-500">Selecciona una modalidad para ver sus cursos.</p>
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded border">
                        {cursos.length} Módulos Totales
                      </span>
                    </div>

                    {(() => {
                      const MODALITY_META: Record<string, { label: string; short: string; color: string; activeColor: string; bg: string; activeBg: string; border: string; activeBorder: string; dot: string }> = {
                        MR:                { label: 'Resonancia Magnética',   short: 'MR',          color: 'text-violet-600', activeColor: 'text-white', bg: 'bg-white', activeBg: 'bg-violet-600',  border: 'border-violet-200', activeBorder: 'border-violet-600', dot: 'bg-violet-500' },
                        CT:                { label: 'Tomógrafo CT',           short: 'CT',          color: 'text-sky-600',    activeColor: 'text-white', bg: 'bg-white', activeBg: 'bg-sky-600',     border: 'border-sky-200',    activeBorder: 'border-sky-600',    dot: 'bg-sky-500'    },
                        ANGIOGRAFOS:       { label: 'Angiógrafos / Vascular', short: 'ANGIO',       color: 'text-indigo-600', activeColor: 'text-white', bg: 'bg-white', activeBg: 'bg-indigo-600',  border: 'border-indigo-200', activeBorder: 'border-indigo-600', dot: 'bg-indigo-500' },
                        MAMOGRAFIA:        { label: 'Mamografía',             short: 'MAMMO',       color: 'text-pink-600',   activeColor: 'text-white', bg: 'bg-white', activeBg: 'bg-pink-600',    border: 'border-pink-200',    activeBorder: 'border-pink-600',    dot: 'bg-pink-500'    },
                        DXA:               { label: 'DXA / BMD',              short: 'DXA',         color: 'text-teal-600',   activeColor: 'text-white', bg: 'bg-white', activeBg: 'bg-teal-600',    border: 'border-teal-200',    activeBorder: 'border-teal-600',    dot: 'bg-teal-500'    },
                        ARCOS_EN_C:        { label: 'Arcos en C',             short: 'ARCO C',      color: 'text-amber-600',  activeColor: 'text-white', bg: 'bg-white', activeBg: 'bg-amber-600',   border: 'border-amber-200',  activeBorder: 'border-amber-600',  dot: 'bg-amber-500'  },
                        RX_FIJOS:          { label: 'Rayos X Fijos',          short: 'RX FIJO',     color: 'text-blue-600',   activeColor: 'text-white', bg: 'bg-white', activeBg: 'bg-blue-600',     border: 'border-blue-200',    activeBorder: 'border-blue-600',    dot: 'bg-blue-500'    },
                        RX_MOVILES:        { label: 'Rayos X Móviles',        short: 'RX MOVIL',    color: 'text-cyan-600',   activeColor: 'text-white', bg: 'bg-white', activeBg: 'bg-cyan-600',     border: 'border-cyan-200',    activeBorder: 'border-cyan-600',    dot: 'bg-cyan-500'    },
                        FLUOROSCOPIO:      { label: 'Fluoroscopio',           short: 'FLUORO',      color: 'text-orange-600', activeColor: 'text-white', bg: 'bg-white', activeBg: 'bg-orange-600',  border: 'border-orange-200', activeBorder: 'border-orange-600', dot: 'bg-orange-500' },
                        GAMMACAMARAS:      { label: 'Gammacámaras / NM',      short: 'GAMMA',       color: 'text-purple-600', activeColor: 'text-white', bg: 'bg-white', activeBg: 'bg-purple-600',  border: 'border-purple-200', activeBorder: 'border-purple-600', dot: 'bg-purple-500' },
                        PET_CT:            { label: 'PET CT',                 short: 'PET CT',      color: 'text-rose-600',   activeColor: 'text-white', bg: 'bg-white', activeBg: 'bg-rose-600',    border: 'border-rose-200',    activeBorder: 'border-rose-600',    dot: 'bg-rose-500'    },
                        CYCLOTRON:         { label: 'Ciclotrón',              short: 'CYCLO',       color: 'text-emerald-600',activeColor: 'text-white', bg: 'bg-white', activeBg: 'bg-emerald-600', border: 'border-emerald-200',activeBorder: 'border-emerald-600',dot: 'bg-emerald-500'},
                        FASTLAB_TRACELAB:  { label: 'FASTlab / TRACERlab',    short: 'FAST/TRAC',   color: 'text-lime-600',   activeColor: 'text-white', bg: 'bg-white', activeBg: 'bg-lime-600',    border: 'border-lime-200',    activeBorder: 'border-lime-600',    dot: 'bg-lime-500'    },
                        AW_XELERIS:        { label: 'AW / Xeleris',           short: 'AW/XEL',      color: 'text-slate-600',  activeColor: 'text-white', bg: 'bg-white', activeBg: 'bg-slate-600',   border: 'border-slate-200',  activeBorder: 'border-slate-600',  dot: 'bg-slate-500'  },
                        QUAL:              { label: 'Calidad y Regulatorio',  short: 'QUAL',        color: 'text-indigo-600', activeColor: 'text-white', bg: 'bg-white', activeBg: 'bg-indigo-600',  border: 'border-indigo-200', activeBorder: 'border-indigo-600', dot: 'bg-indigo-500' },
                        OTHER:             { label: 'Otros',                  short: '···',         color: 'text-slate-500',  activeColor: 'text-white', bg: 'bg-white', activeBg: 'bg-slate-500',   border: 'border-slate-200',  activeBorder: 'border-slate-500',  dot: 'bg-slate-400'  },
                      };

                      const getModalityKey = (cur: Curso): string => {
                        return getModKey(cur);
                      };

                      // Build groups from all courses
                      const grouped: Record<string, Curso[]> = {};
                      cursos.forEach(cur => {
                        const key = getModalityKey(cur);
                        if (!grouped[key]) grouped[key] = [];
                        grouped[key].push(cur);
                      });
                      const ORDER = [
                        'MR', 'CT', 'ANGIOGRAFOS', 'MAMOGRAFIA', 'DXA', 'ARCOS_EN_C', 
                        'RX_FIJOS', 'RX_MOVILES', 'FLUOROSCOPIO', 'GAMMACAMARAS', 
                        'PET_CT', 'CYCLOTRON', 'FASTLAB_TRACELAB', 'AW_XELERIS', 
                        'QUAL', 'OTHER'
                      ];
                      const availableKeys = ORDER.filter(k => grouped[k] && grouped[k].length > 0);

                      // Active modality courses (filtered + searched)
                      const activeCursos = (modalityFilter === 'ALL' ? cursos : (grouped[modalityFilter] || []))
                        .filter(c =>
                          !searchQuery ||
                          c.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.codigo.toLowerCase().includes(searchQuery.toLowerCase())
                        );

                      const activeMeta = modalityFilter !== 'ALL' ? MODALITY_META[modalityFilter] : null;

                      return (
                        <>
                          {/* ── Modality pill tabs ── */}
                          <div className="flex flex-wrap gap-2 mb-5">
                            {availableKeys.map(key => {
                              const meta = MODALITY_META[key];
                              const isActive = modalityFilter === key;
                              return (
                                <button
                                  key={key}
                                  id={`pill-modality-${key}`}
                                  onClick={() => {
                                    setModalityFilter(isActive ? 'ALL' : key);
                                    setSearchQuery('');
                                  }}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer shadow-sm ${
                                    isActive
                                      ? `${meta.activeBg} ${meta.activeColor} ${meta.activeBorder}`
                                      : `${meta.bg} ${meta.color} ${meta.border} hover:${meta.activeBg} hover:${meta.activeColor}`
                                  }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white opacity-80' : meta.dot}`} />
                                  {meta.short}
                                  <span className={`text-[9px] font-mono ml-0.5 ${isActive ? 'opacity-75' : 'opacity-60'}`}>
                                    {grouped[key].length}
                                  </span>
                                </button>
                              );
                            })}
                            {modalityFilter !== 'ALL' && (
                              <button
                                onClick={() => { setModalityFilter('ALL'); setSearchQuery(''); }}
                                className="px-3 py-1.5 rounded-full text-[11px] font-bold border border-slate-200 text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                              >
                                ✕ Ver todas
                              </button>
                            )}
                          </div>

                          {/* ── Section label when a modality is active ── */}
                          {activeMeta && (
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${activeMeta.activeBg} mb-4`}>
                              <span className="w-2 h-2 rounded-full bg-white opacity-70" />
                              <span className="text-[11px] font-extrabold uppercase tracking-wider text-white">
                                {activeMeta.label}
                              </span>
                              <span className="ml-auto text-[10px] font-bold text-white opacity-75">
                                {activeCursos.length} curso{activeCursos.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}

                          {/* ── Search bar ── */}
                          <div className="relative mb-4">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              id="search-courses"
                              type="text"
                              placeholder={modalityFilter === 'ALL' ? 'Buscar en todo el catálogo...' : `Buscar en ${activeMeta?.label ?? ''}...`}
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 focus:border-sky-400 outline-none"
                            />
                          </div>

                          {/* ── Course cards ── */}
                          <div className="max-h-[420px] overflow-y-auto pr-1">
                            {activeCursos.length === 0 ? (
                              <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 text-slate-400 rounded-xl text-xs">
                                {searchQuery ? `Sin resultados para "${searchQuery}"` : 'No hay cursos en esta modalidad.'}
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {activeCursos.map(curso => {
                                  const meta = MODALITY_META[getModalityKey(curso)];

                                  // Engineers who completed this course
                                  const completados = historialList
                                    .filter(h => h.codigo_curso === curso.codigo)
                                    .map(h => ingenieros.find(i => i.id === h.id_ingeniero))
                                    .filter(Boolean);

                                  // Detect duplicate titles (same title, different codes)
                                  const variantCount = cursos.filter(c => c.titulo === curso.titulo).length;

                                  return (
                                    <div
                                      key={curso.codigo}
                                      className="bg-white border border-slate-200 p-3.5 rounded-xl flex flex-col gap-2 hover:border-slate-300 hover:shadow-sm transition"
                                      id={`course-card-${curso.codigo}`}
                                    >
                                      {/* Header: code + cost */}
                                      <div className="flex justify-between items-start gap-2">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${meta.bg} ${meta.color} ${meta.border} shrink-0`}>
                                            {curso.codigo}
                                          </span>
                                          {variantCount > 1 && (
                                            <span className="text-[8px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full">
                                              {variantCount} variantes
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500 font-mono shrink-0">${curso.costo}</span>
                                      </div>

                                      {/* Title */}
                                      <button
                                        onClick={() => setSelectedCourseForCompletions(curso)}
                                        className="text-left text-[11px] font-semibold text-[#001f3f] hover:text-sky-600 hover:underline transition cursor-pointer"
                                        title="Haga clic para ver detalles del curso y su fecha de acreditación"
                                      >
                                        {curso.titulo}
                                      </button>

                                      {/* Engineers who completed it */}
                                      <div className="pt-2 border-t border-slate-100">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                          Certificados ({completados.length})
                                        </p>
                                        {completados.length === 0 ? (
                                          <span className="text-[9px] text-slate-300 font-mono italic">Sin aprobaciones registradas</span>
                                        ) : (
                                          <div className="flex flex-wrap gap-1">
                                            {completados.slice(0, 5).map((ing, i) => (
                                              <span
                                                key={i}
                                                title={ing!.nombre}
                                                className="text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded truncate max-w-[90px]"
                                              >
                                                {ing!.nombre.split(' ')[0]}
                                              </span>
                                            ))}
                                            {completados.length > 5 && (
                                              <span className="text-[9px] font-bold text-slate-400 px-1.5 py-0.5">
                                                +{completados.length - 5}
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </div>

                                      {/* Footer: id + delete */}
                                      <div className="flex justify-between items-center pt-1">
                                        <span className="text-[8px] text-slate-300 font-mono truncate max-w-[130px]">{curso.id}</span>
                                        <button
                                          id={`btn-del-course-${curso.codigo}`}
                                          onClick={() => handleDeleteCurso(curso.codigo)}
                                          className="text-slate-300 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition cursor-pointer"
                                          title="Eliminar curso"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>


                </div>

              </div>
            )}

            {/* VIEW 6: HISTORIAL DE ENTRENAMIENTO */}
            {activeTab === 'historial' && (
              <div className="space-y-8 animate-fadeIn" id="view-historial">
                
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-zinc-100">
                    <div>
                      <h3 className="text-base font-bold text-[#001f3f] font-display">Historial de Certificaciones Aprobadas</h3>
                      <p className="text-xs text-slate-500">Mapeo unpivot de los registros de exámenes y entrenamientos aprobados por los ingenieros con su fecha respectiva.</p>
                    </div>

                    <button
                      id="btn-refresh-historial"
                      onClick={fetchAllCollections}
                      className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border px-3 py-1.5 rounded cursor-pointer transition flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Refrescar historial
                    </button>
                  </div>

                  {/* Complete Historical table view */}
                  <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white" id="table-history-container">
                    <table className="min-w-full divide-y divide-slate-200 text-xs">
                      <thead className="bg-[#001124] text-slate-300 font-sans font-semibold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="px-6 py-3.5 text-left font-mono">ID Ingeniero / Nombre</th>
                          <th className="px-6 py-3.5 text-left font-mono">Código Curso</th>
                          <th className="px-6 py-3.5 text-left">Título del Plan Formativo</th>
                          <th className="px-6 py-3.5 text-left font-mono">Modalidad</th>
                          <th className="px-6 py-3.5 text-left">Fecha Aprobado</th>
                          <th className="px-6 py-3.5 text-center font-mono">Valor</th>
                          <th className="px-6 py-3.5 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-medium text-slate-700 bg-white">
                        {historialList.map((h) => {
                          const matchingIng = ingenieros.find(i => i.id === h.id_ingeniero);
                          const matchingC = cursos.find(c => c.codigo === h.codigo_curso);
                          return (
                            <tr key={h.id} className="hover:bg-slate-50 transition" id={`tr-row-${h.id}`}>
                              <td className="px-6 py-4">
                                <div className="font-bold text-slate-900">{matchingIng ? matchingIng.nombre : h.id_ingeniero}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{h.id_ingeniero}</div>
                              </td>
                              <td className="px-6 py-4 font-mono font-bold text-indigo-700">
                                {h.codigo_curso}
                              </td>
                              <td className="px-6 py-4">
                                {matchingC ? matchingC.titulo : 'Plan de Aprendizaje General'}
                              </td>
                              <td className="px-6 py-4 font-mono">
                                {matchingC ? matchingC.modalidad : 'N/A'}
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-150 px-2.5 py-0.5 rounded font-bold font-mono">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  {h.fecha_completado}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center font-mono font-bold text-slate-805">
                                ${matchingC ? matchingC.costo : 0} USD
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex justify-center items-center gap-1.5">
                                  <button
                                    id={`btn-edit-tr-${h.id}`}
                                    onClick={() => openEditModal(h)}
                                    className="text-slate-400 hover:text-sky-600 p-1.5 rounded hover:bg-sky-50 transition cursor-pointer"
                                    title="Editar fecha de finalización"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    id={`btn-del-tr-${h.id}`}
                                    onClick={() => handleDeleteHistoryItem(h.id)}
                                    className="text-slate-405 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50 transition cursor-pointer"
                                    title="Revocar certificación aprobada"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                        {historialList.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-6 py-20 text-center text-slate-450 text-xs">
                              No hay registros de entrenamiento archivados en Firebase Firestore. Ingresa a la sección "Importar Matriz Unpivot" para cargarlos.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>

              </div>
            )}

          </>
        )}

        {/* Humbler Footer block strictly descriptive and functional */}
        <footer className="mt-16 pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-450 gap-4" id="orimec-app-footer">
          <div>
            <span className="font-bold">ORIMEC C.A.</span> — Soluciones Médicas Integrales de Imagenología.
          </div>
          <div className="font-mono text-slate-400">
            Base de datos Firestore: capacitaciones-a4e0f
          </div>
        </footer>

      </div>

      {/* Edit Modal Overlay */}
      {editingHistRecord && (() => {
        const modalIngeniero = ingenieros.find(i => i.id === editingHistRecord.id_ingeniero);
        const modalCurso = cursos.find(c => c.codigo === editingHistRecord.codigo_curso);
        const modalModalityMeta = ALL_MODALITIES_LIST.find(m => m.key === (modalCurso ? getModKey(modalCurso) : 'OTHER'));

        return (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn"
            id="edit-modal-backdrop"
            onClick={(e) => {
              if (e.target === e.currentTarget) setEditingHistRecord(null);
            }}
          >
            <div 
              className="relative w-full max-w-lg bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden transform animate-scaleIn flex flex-col"
              id="edit-modal-card"
            >
              {/* Header */}
              <div className="bg-[#001f3f] text-white px-6 py-4 flex justify-between items-center border-b border-sky-950">
                <div>
                  <span className="text-[10px] font-bold text-sky-300 tracking-wider uppercase font-mono">Detalle de Acreditación</span>
                  <h3 className="text-sm sm:text-base font-bold text-white font-display">Información y Edición del Curso</h3>
                </div>
                <button
                  onClick={() => setEditingHistRecord(null)}
                  className="text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-lg hover:bg-sky-900"
                  aria-label="Cerrar modal"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
                {/* Details Section */}
                <div className="space-y-4">
                  {/* Engineer profile */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#001f3f] text-white font-extrabold flex items-center justify-center text-sm shadow">
                      {modalIngeniero ? modalIngeniero.nombre.charAt(0) : '?'}
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Colaborador</span>
                      <h4 className="text-xs font-bold text-slate-900 uppercase">{modalIngeniero ? modalIngeniero.nombre : editingHistRecord.id_ingeniero}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">Sede: {modalIngeniero ? modalIngeniero.sede : '—'}</p>
                    </div>
                  </div>

                  {/* Course Details card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Curso</span>
                        <h4 className="text-xs font-bold text-slate-900">{modalCurso ? modalCurso.titulo : editingHistRecord.codigo_curso}</h4>
                      </div>
                      {modalCurso && (
                        <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 border border-sky-100 rounded px-2 py-0.5 whitespace-nowrap">
                          {modalCurso.codigo}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100/80 text-[11px]">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Modalidad *</label>
                        <input
                          type="text"
                          value={editCurModalidad}
                          onChange={(e) => setEditCurModalidad(e.target.value)}
                          className="mt-1 w-full text-xs bg-white border border-slate-300 rounded-md px-2 py-1 focus:border-sky-500 outline-none font-bold"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Costo ($ USD) *</label>
                        <input
                          type="number"
                          value={editCurCosto}
                          onChange={(e) => setEditCurCosto(Number(e.target.value) || 0)}
                          className="mt-1 w-full text-xs bg-white border border-slate-300 rounded-md px-2 py-1 focus:border-sky-500 outline-none font-bold font-mono"
                          required
                        />
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-400 font-medium pt-1">
                      * Nota: Modificar la modalidad o costo afectará de forma global a este curso en todo el catálogo.
                    </p>
                  </div>
                </div>

                {/* Edit Form Section */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Fecha de Finalización *</label>
                    <span className="text-[9.5px] text-slate-400 italic font-mono">Formato: MM/DD/YYYY</span>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      id="input-modal-date"
                      type="text"
                      value={editHistFecha}
                      onChange={(e) => setEditHistFecha(e.target.value)}
                      placeholder="MM/DD/YYYY"
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 focus:border-sky-500 focus:bg-white outline-none font-semibold text-slate-800 shadow-inner"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Footer / Actions */}
              <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                <button
                  id="btn-modal-delete"
                  onClick={async () => {
                    if (confirm(`¿Desea revocar la certificación aprobada para este ingeniero?`)) {
                      setSyncStatus('saving');
                      try {
                        await deleteDoc(doc(db, 'historial_entrenamiento', editingHistRecord.id));
                        await fetchAllCollections();
                        setEditingHistRecord(null);
                      } catch (err: any) {
                        setSyncStatus('error');
                        setErrorMessage("No se pudo revocar el historial: " + err.message);
                      }
                    }
                  }}
                  className="w-full sm:w-auto text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 rounded-lg px-4 py-2.5 transition flex items-center justify-center gap-1.5 cursor-pointer order-2 sm:order-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Revocar Certificación
                </button>

                <div className="flex w-full sm:w-auto gap-2 order-1 sm:order-2">
                  <button
                    id="btn-modal-cancel"
                    onClick={() => setEditingHistRecord(null)}
                    className="w-1/2 sm:w-auto text-xs font-bold text-slate-600 hover:text-slate-805 bg-white border border-slate-305 hover:bg-slate-50 rounded-lg px-4 py-2.5 transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    id="btn-modal-save"
                    onClick={() => handleUpdateHistoryItemAndCourse(editingHistRecord.id, editHistFecha, editingHistRecord.codigo_curso, editCurModalidad, editCurCosto)}
                    className="w-1/2 sm:w-auto text-xs font-bold bg-[#001f3f] hover:bg-sky-950 text-white rounded-lg px-4 py-2.5 transition cursor-pointer flex items-center justify-center gap-1.5 shadow"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Course Completions List Modal */}
      {selectedCourseForCompletions && (() => {
        const courseCompletions = historialList.filter(h => h.codigo_curso === selectedCourseForCompletions.codigo);
        const modalModalityMeta = ALL_MODALITIES_LIST.find(m => m.key === getModKey(selectedCourseForCompletions));

        return (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn"
            id="course-completions-modal-backdrop"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedCourseForCompletions(null);
            }}
          >
            <div 
              className="relative w-full max-w-lg bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden transform animate-scaleIn flex flex-col"
              id="course-completions-modal-card"
            >
              {/* Header */}
              <div className="bg-[#001f3f] text-white px-6 py-4 flex justify-between items-center border-b border-sky-955">
                <div>
                  <span className="text-[10px] font-bold text-sky-300 tracking-wider uppercase font-mono">Detalle del Curso</span>
                  <h3 className="text-sm sm:text-base font-bold text-white font-display">Acreditaciones de Capacitación</h3>
                </div>
                <button
                  onClick={() => setSelectedCourseForCompletions(null)}
                  className="text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-lg hover:bg-sky-900"
                  aria-label="Cerrar modal"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
                {/* Course info */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Curso Seleccionado</span>
                      <h4 className="text-sm font-bold text-[#001f3f]">{selectedCourseForCompletions.titulo}</h4>
                    </div>
                    {!isEditingCourseMeta && (
                      <button
                        onClick={() => {
                          setEditCurModalidad(selectedCourseForCompletions.modalidad || '');
                          setEditCurCosto(selectedCourseForCompletions.costo || 0);
                          setIsEditingCourseMeta(true);
                        }}
                        className="text-[10px] font-bold text-sky-600 hover:text-sky-800 hover:underline flex items-center gap-0.5 transition cursor-pointer"
                      >
                        <Edit className="w-3 h-3" />
                        Editar Curso
                      </button>
                    )}
                  </div>

                  {isEditingCourseMeta ? (
                    <div className="pt-2.5 border-t border-slate-100/80 space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-[11px]">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Modalidad *</label>
                          <input
                            type="text"
                            value={editCurModalidad}
                            onChange={(e) => setEditCurModalidad(e.target.value)}
                            className="mt-1 w-full text-xs bg-white border border-slate-300 rounded-md px-2 py-1.5 focus:border-sky-500 outline-none font-bold"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Costo ($ USD) *</label>
                          <input
                            type="number"
                            value={editCurCosto}
                            onChange={(e) => setEditCurCosto(Number(e.target.value) || 0)}
                            className="mt-1 w-full text-xs bg-white border border-slate-300 rounded-md px-2 py-1.5 focus:border-sky-500 outline-none font-bold font-mono"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => setIsEditingCourseMeta(false)}
                          className="text-[10px] font-bold text-slate-500 bg-white border rounded px-2.5 py-1 hover:bg-slate-50 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleUpdateCourseOnly(selectedCourseForCompletions.codigo, editCurModalidad, editCurCosto)}
                          className="text-[10px] font-bold text-white bg-sky-600 rounded px-2.5 py-1 hover:bg-sky-700 cursor-pointer"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-slate-100/80 text-[11px] text-slate-650">
                      <div>
                        <span className="text-slate-400 font-medium">Código:</span>
                        <p className="mt-0.5"><strong className="text-slate-805 font-mono">{selectedCourseForCompletions.codigo}</strong></p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Modalidad:</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          {modalModalityMeta && <span className={`w-1.5 h-1.5 rounded-full ${modalModalityMeta.dot}`} />}
                          <strong className="text-slate-805">{selectedCourseForCompletions.modalidad}</strong>
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Costo de fábrica:</span>
                        <p className="mt-0.5"><strong className="text-slate-808 font-mono">${selectedCourseForCompletions.costo} USD</strong></p>
                      </div>
                    </div>
                  )}
                </div>

                {/* List of completions */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-550 uppercase tracking-widest block font-mono">
                    Ingenieros Certificados ({courseCompletions.length})
                  </span>
                  
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {courseCompletions.map((h) => {
                      const ing = ingenieros.find(i => i.id === h.id_ingeniero);
                      return (
                        <div key={h.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center hover:bg-slate-100/50 transition">
                          <div>
                            <h5 className="text-xs font-bold text-slate-900 uppercase">{ing ? ing.nombre : h.id_ingeniero}</h5>
                            <div className="flex gap-2 items-center text-[10px] text-slate-400 font-mono mt-0.5">
                              <span>Sede: {ing ? ing.sede : '—'}</span>
                              <span>•</span>
                              <span className="text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded font-bold font-mono">Aprobación: {h.fecha_completado}</span>
                            </div>
                          </div>
                          
                          <button
                            id={`btn-edit-completion-${h.id}`}
                            onClick={() => {
                              openEditModal(h);
                              setSelectedCourseForCompletions(null);
                            }}
                            className="text-xs font-bold bg-white text-slate-600 hover:text-sky-600 border border-slate-300 hover:bg-slate-50 rounded-lg px-3 py-1.5 transition flex items-center gap-1 cursor-pointer"
                            title="Editar fecha de esta aprobación"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Editar
                          </button>
                        </div>
                      );
                    })}

                    {courseCompletions.length === 0 && (
                      <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 text-slate-400 rounded-xl text-xs">
                        Nadie ha completado este curso de capacitación todavía.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end">
                <button
                  id="btn-completions-close"
                  onClick={() => setSelectedCourseForCompletions(null)}
                  className="text-xs font-bold text-slate-655 hover:text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg px-4 py-2 transition cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modality Courses Modal Window */}
      {selectedRouteModalityForModal && (() => {
        const activeModKey = selectedRouteModalityForModal;
        const modMeta = ALL_MODALITIES_LIST.find(m => m.key === activeModKey);
        
        // Filter courses for this modality
        const completedInMod = activeRouteRecommendation ? activeRouteRecommendation.completados.filter(c => getModKey(c) === activeModKey) : [];
        const pendingInMod = activeRouteRecommendation ? activeRouteRecommendation.pendientes.filter(c => getModKey(c) === activeModKey) : [];
        
        return (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn"
            id="modality-courses-modal-backdrop"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedRouteModalityForModal(null);
            }}
          >
            <div 
              className="relative w-full max-w-xl bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden transform animate-scaleIn flex flex-col"
              id="modality-courses-modal-card"
            >
              {/* Header */}
              <div className="bg-[#001f3f] text-white px-6 py-4 flex justify-between items-center border-b border-sky-955">
                <div>
                  <span className="text-[10px] font-bold text-sky-300 tracking-wider uppercase font-mono">Plan de Capacitación</span>
                  <h3 className="text-sm sm:text-base font-bold text-white font-display">
                    Cursos de Modalidad: {modMeta ? modMeta.label : activeModKey}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedRouteModalityForModal(null)}
                  className="text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-lg hover:bg-sky-900"
                  aria-label="Cerrar modal"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                
                {/* Info and Engineer Details */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#001f3f] text-white font-extrabold flex items-center justify-center text-sm shadow">
                    {activeRouteIngeniero ? activeRouteIngeniero.nombre.charAt(0) : '?'}
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Ingeniero Analizado</span>
                    <h4 className="text-xs font-bold text-slate-900 uppercase">
                      {activeRouteIngeniero ? activeRouteIngeniero.nombre : '—'}
                    </h4>
                    <p className="text-[10px] text-slate-550 font-medium">Sede: {activeRouteIngeniero ? activeRouteIngeniero.sede : '—'}</p>
                  </div>
                </div>

                {/* Completed Courses list */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-150/80 px-2 py-0.5 rounded uppercase tracking-widest inline-block font-mono">
                    Aprobados y Certificados ({completedInMod.length})
                  </span>
                  
                  <div className="space-y-2">
                    {completedInMod.map(curso => {
                      const matchHist = historialList.find(h => h.id_ingeniero === activeRouteIngeniero?.id && h.codigo_curso === curso.codigo);
                      return (
                        <div 
                          key={curso.codigo}
                          className="p-3 bg-emerald-50/30 border border-emerald-100 rounded-xl flex items-center justify-between"
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="w-4.5 h-4.5 rounded-full bg-emerald-500 text-white flex items-center justify-center mt-0.5 shadow-sm">
                              <CheckCircle2 className="w-3 h-3" />
                            </div>
                            <div>
                              <span className="text-[9px] font-mono font-bold text-emerald-800">[{curso.codigo}] • Completado</span>
                              <h5 className="text-[11px] font-bold text-slate-900">{curso.titulo}</h5>
                              <p className="text-[9px] text-slate-400">Acreditación: {matchHist?.fecha_completado || 'Fábrica'}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono font-semibold text-slate-500">${curso.costo} USD</span>
                        </div>
                      );
                    })}
                    {completedInMod.length === 0 && (
                      <p className="text-slate-400 text-xs italic py-2 pl-2">Sin cursos completados registrados en esta modalidad.</p>
                    )}
                  </div>
                </div>

                {/* Pending Courses list */}
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-150/80 px-2 py-0.5 rounded uppercase tracking-widest inline-block font-mono">
                    Pendientes / Brecha Técnica ({pendingInMod.length})
                  </span>
                  
                  <div className="space-y-2">
                    {pendingInMod.map((curso, idx) => (
                      <div 
                        key={curso.codigo}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="w-4.5 h-4.5 rounded-full bg-slate-350 text-white flex items-center justify-center mt-0.5 shadow-sm">
                            <Clock className="w-3 h-3" />
                          </div>
                          <div>
                            <span className="text-[9px] font-mono font-bold text-slate-500">[{curso.codigo}] • Nivel {getLevelNum(curso)}</span>
                            <h5 className="text-[11px] font-bold text-slate-900">{curso.titulo}</h5>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-semibold text-slate-500">${curso.costo} USD</span>
                      </div>
                    ))}
                    {pendingInMod.length === 0 && (
                      <div className="p-3.5 bg-emerald-50/20 border border-dashed border-emerald-250 rounded-xl text-center text-emerald-800 text-xs font-semibold">
                        🎉 ¡Especialización satisfecha al 100%! No hay brechas pendientes.
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end">
                <button
                  id="btn-modality-courses-close"
                  onClick={() => setSelectedRouteModalityForModal(null)}
                  className="text-xs font-bold text-slate-655 hover:text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg px-4 py-2 transition cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
