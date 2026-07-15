import { Engineer, Curso, HistorialEntrenamiento } from '../types';

// Helper to sanitize database IDs
export function sanitizeId(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Parses a horizontal matrix CSV string like the one provided for ORIMEC C.A.
 * Column 0: CÓDIGO
 * Column 1: TÍTULO
 * Column 2: MODALIDAD
 * Column 3+ : Engineers names
 * Cells: Date of completion (e.g. "11/14/2011") or blank
 */
export interface UnpivotResult {
  ingenieros: Engineer[];
  cursos: Curso[];
  historial: HistorialEntrenamiento[];
}

export function parseAndUnpivotCSV(csvContent: string): UnpivotResult {
  const result: UnpivotResult = {
    ingenieros: [],
    cursos: [],
    historial: []
  };

  if (!csvContent || !csvContent.trim()) {
    return result;
  }

  // Parse lines, taking care of quoted text (e.g., titles with commas)
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return result;

  // ── Auto-detect delimiter: semicolon or comma ──────────────────────────────
  const firstLine = lines[0];
  const delimiter = (firstLine.split(';').length >= firstLine.split(',').length) ? ';' : ',';

  // CSV line splitter that respects quotes and uses the detected delimiter
  const parseCSVLine = (text: string): string[] => {
    const result: string[] = [];
    let cell = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(cell.trim());
        cell = '';
      } else {
        cell += char;
      }
    }
    result.push(cell.trim());
    return result;
  };

  // ── Strip cedula/phone numbers appended to engineer names ─────────────────
  // e.g. "MIGUEL NIOLA 503213068" → "MIGUEL NIOLA"
  const cleanEngineerName = (raw: string): string => {
    return raw
      .trim()
      .toUpperCase()
      .replace(/\s+\d{6,12}(\s|$)/g, ' ')   // remove trailing numeric IDs (6-12 digits)
      .replace(/\s+\d+$/, '')                 // remove any remaining trailing number
      .trim();
  };

  // Header parsing
  const headers = parseCSVLine(lines[0]);
  if (headers.length < 4) {
    throw new Error('El archivo CSV debe tener al menos 4 columnas: CÓDIGO, TÍTULO, MODALIDAD e Ingenieros.');
  }

  // Extract engineer names from column index 3 onwards
  const engNames = headers.slice(3).map(name => cleanEngineerName(name));
  
  // Construct engineer records
  const tempIngenieros: { [id: string]: Engineer } = {};
  
  // Hardcoded mapping of cities based on corporate files
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

  engNames.forEach(name => {
    if (!name || name === 'CÓDIGO' || name === 'TITULO' || name === 'TÍTULO' || name === 'MODALIDAD') return;
    // Strip "Ing. " prefix if present to match internal sanitization
    const nameWithoutPrefix = name.replace(/^ING\.\s+/i, '');
    const id = sanitizeId(nameWithoutPrefix);
    
    // Determine city from mapping, or by keywords
    let sede: 'Quito' | 'Guayaquil' | 'Cuenca' = 'Quito';
    if (cityMapping[nameWithoutPrefix]) {
      sede = cityMapping[nameWithoutPrefix];
    } else if (nameWithoutPrefix.includes('NIOLA') || nameWithoutPrefix.includes('CUENCA') || nameWithoutPrefix.includes('FIGUEROA') || nameWithoutPrefix.includes('ZHUNIO')) {
      sede = 'Cuenca';
    } else if (nameWithoutPrefix.includes('GUERRA') || nameWithoutPrefix.includes('SANCHEZ') || nameWithoutPrefix.includes('GUAYAQUIL') || nameWithoutPrefix.includes('SOTOMAYOR') || nameWithoutPrefix.includes('QUINDE') || nameWithoutPrefix.includes('LEIME') || nameWithoutPrefix.includes('CHANGUAN') || nameWithoutPrefix.includes('AGUILAR')) {
      sede = 'Guayaquil';
    }

    if (!tempIngenieros[id]) {
      tempIngenieros[id] = {
        id,
        name: nameWithoutPrefix,
        sede,
        specialty: 'Ingeniería',
        email: `${nameWithoutPrefix.toLowerCase().replace(/[^a-z0-9]/g, '')}@orimec.com`,
        phone: '+593 999 999 999',
        avatar: '',
        availability: 'Disponible',
        skills: ['Ingeniería']
      };
    }
  });

  // Parse course rows and their corresponding completion columns
  for (let idx = 1; idx < lines.length; idx++) {
    const cells = parseCSVLine(lines[idx]);
    if (cells.length < 3) continue;

    const codigo = cells[0].trim().toUpperCase();
    const titulo = cells[1].trim();
    const modalidad = cells[2].trim().toUpperCase();

    if (!codigo || !titulo) continue;

    // Default cost is 0 for all courses
    const costo = 0;

    const curso: Curso = {
      id: codigo,
      codigo,
      titulo,
      modalidad,
      costo
    };
    result.cursos.push(curso);

    // Unpivot the engineer completion dates
    for (let cIdx = 3; cIdx < cells.length; cIdx++) {
      const pDate = cells[cIdx].trim();
      const engineerRawName = headers[cIdx];
      if (!engineerRawName || !pDate) continue; // Skip empty dates

      const cleanName = cleanEngineerName(engineerRawName).replace(/^ING\.\s+/i, '');
      const engineerId = sanitizeId(cleanName);

      if (tempIngenieros[engineerId]) {
        const hRecord: HistorialEntrenamiento = {
          id: `${engineerId}_${codigo}`,
          id_ingeniero: engineerId,
          codigo_curso: codigo,
          fecha_completado: pDate
        };
        result.historial.push(hRecord);
      }
    }
  }

  result.ingenieros = Object.values(tempIngenieros);
  return result;
}

// ── Modality Definitions and Helper Functions ──────────────────────────
export const ALL_MODALITIES_LIST = [
  { key: 'MR',                label: 'MR',                  dot: 'bg-violet-500',  text: 'text-violet-700',  border: 'border-violet-200',  bg: 'bg-violet-50/50' },
  { key: 'CT',                label: 'CT',                  dot: 'bg-sky-500',     text: 'text-sky-700',     border: 'border-sky-200',     bg: 'bg-sky-50/50' },
  { key: 'ANGIOGRAFOS',       label: 'ANGIOGRAFOS',         dot: 'bg-indigo-500',  text: 'text-indigo-700',  border: 'border-indigo-200',  bg: 'bg-indigo-50/50' },
  { key: 'MAMOGRAFIA',        label: 'MAMOGRAFÍA',          dot: 'bg-pink-500',    text: 'text-pink-700',    border: 'border-pink-200',    bg: 'bg-pink-50/50' },
  { key: 'DXA',               label: 'DXA',                 dot: 'bg-teal-500',    text: 'text-teal-705',    border: 'border-teal-200',    bg: 'bg-teal-50/50' },
  { key: 'ARCOS_EN_C',        label: 'ARCOS EN C',          dot: 'bg-amber-600',   text: 'text-amber-700',   border: 'border-amber-200',   bg: 'bg-amber-50/50' },
  { key: 'RX_FIJOS',          label: 'RX FIJOS',            dot: 'bg-blue-500',    text: 'text-blue-700',    border: 'border-blue-200',    bg: 'bg-blue-50/50' },
  { key: 'RX_MOVILES',        label: 'RX MOVILES',          dot: 'bg-cyan-500',    text: 'text-cyan-700',    border: 'border-cyan-200',    bg: 'bg-cyan-50/50' },
  { key: 'FLUOROSCOPIO',      label: 'FLUOROSCOPIO',        dot: 'bg-orange-500',  text: 'text-orange-700',  border: 'border-orange-200',  bg: 'bg-orange-50/50' },
  { key: 'GAMMACAMARAS',      label: 'GAMMACAMARAS',        dot: 'bg-purple-500',  text: 'text-purple-700',  border: 'border-purple-200',  bg: 'bg-purple-50/50' },
  { key: 'PET_CT',            label: 'PET CT',              dot: 'bg-rose-500',    text: 'text-rose-700',    border: 'border-rose-200',    bg: 'bg-rose-50/50' },
  { key: 'CYCLOTRON',         label: 'CYCLOTRON',           dot: 'bg-emerald-600', text: 'text-emerald-700', border: 'border-emerald-200', bg: 'bg-emerald-50/50' },
  { key: 'FASTLAB_TRACELAB',  label: 'FASTLAB / TRACELAB',  dot: 'bg-lime-600',    text: 'text-lime-700',    border: 'border-lime-200',    bg: 'bg-lime-50/50' },
  { key: 'AW_XELERIS',        label: 'AW / XELERIS',        dot: 'bg-slate-600',   text: 'text-slate-700',   border: 'border-slate-200',   bg: 'bg-slate-50/50' }
];

// Helper to check if a word is in a text as a standalone word (boundary is any non-A-Z character)
function hasWord(text: string, word: string): boolean {
  const regex = new RegExp(`(?:^|[^A-Z])${word}(?:$|[^A-Z])`);
  return regex.test(text);
}

export const getModKey = (cur: Curso): string => {
  const m = (cur.modalidad || '').toUpperCase();
  const c = (cur.codigo || '').toUpperCase();
  const t = (cur.titulo || '').toUpperCase();
  
  if (m === 'IIS' || hasWord(t, 'AW') || t.includes('WORKSTATION') || t.includes('XELERIS') || c.includes('AW') || c.includes('XELERIS') || c.includes('IIS')) {
    return 'AW_XELERIS';
  }
  if (t.includes('CYCLOTRON') || t.includes('PETTRACE') || c.includes('CYCLOTRON') || c.includes('PETTRACE')) {
    return 'CYCLOTRON';
  }
  if (t.includes('FASTLAB') || t.includes('TRACERLAB') || t.includes('TRACERCENTER') || c.includes('FASTLAB') || c.includes('TRACERLAB')) {
    return 'FASTLAB_TRACELAB';
  }
  if (m === 'PET' || m === 'PET/CT' || t.includes('PET-CT') || t.includes('PET/CT') || (hasWord(t, 'PET') && !t.includes('PETTRACE')) || c.includes('PET')) {
    return 'PET_CT';
  }
  if (t.includes('INFINIA') || t.includes('NUCLEAR') || t.includes('GAMMACAMARA') || t.includes('HAWKEYE') || t.includes('SPECT') || c.includes('INFINIA')) {
    return 'GAMMACAMARAS';
  }
  if (m === 'XV' || m === 'NM' || t.includes('VASCULAR') || t.includes('INNOVA') || t.includes('ANGIO') || t.includes('IGS') || c.includes('IGS') || c.includes('INNOVA') || c.includes('NM')) {
    return 'ANGIOGRAFOS';
  }
  if (m === 'MG' || t.includes('MAMMO') || t.includes('SENO') || t.includes('MAMOGRAF') || c.includes('MAMMO') || c.includes('SENO')) {
    return 'MAMOGRAFIA';
  }
  if (m === 'BMD' || t.includes('BMD') || t.includes('LUNAR') || t.includes('PRODIGY') || t.includes('IDXA') || t.includes('DXA') || c.includes('BMD') || c.includes('LUNAR')) {
    return 'DXA';
  }
  if (t.includes('OEC') || t.includes('SURGERY') || t.includes('ARCO EN C') || t.includes('C-ARM') || c.includes('OEC') || c.includes('SURG')) {
    return 'ARCOS_EN_C';
  }
  if (t.includes('FLUORO') || t.includes('CONNEXITY') || t.includes('RXI') || t.includes('THUNIS') || c.includes('FLUORO') || c.includes('RXI')) {
    return 'FLUOROSCOPIO';
  }
  // Mobile X-ray: exclude CT modality to prevent false matches
  if ((t.includes('AMX') || t.includes('MOBILE') || t.includes('MÓVIL') || t.includes('MOVIL') || t.includes('XR120') || t.includes('DRX') || t.includes('CARESTREAM') || c.includes('AMX') || c.includes('MOBILE') || c.includes('DRX')) && m !== 'CT') {
    return 'RX_MOVILES';
  }
  // Fixed X-ray: exclude CT modality to prevent false matches (like CT X-ray tube)
  if ((m === 'XR' || m === 'RX' || hasWord(t, 'XR') || t.includes('X-RAY') || hasWord(t, 'RAD') || t.includes('RAD/') || t.includes('DEFINIUM') || t.includes('PROTEUS') || t.includes('BRIVO XR') || c.includes('XR') || c.includes('RAD')) && m !== 'CT') {
    return 'RX_FIJOS';
  }
  if (m === 'MR' || hasWord(t, 'MR') || t.includes('RESONANC') || t.includes('SIGNA') || t.includes('MAGNET') || c.includes('-MR') || c.startsWith('MR')) {
    return 'MR';
  }
  if (m === 'CT' || hasWord(t, 'CT') || t.includes('TOMOGRAF') || t.includes('REVOLUTION') || t.includes('LIGHTSPEED') || c.includes('-CT') || c.startsWith('CT')) {
    return 'CT';
  }
  if (c.includes('QUAL') || c.includes('QMS') || m.includes('QUAL')) {
    return 'QUAL';
  }
  return 'OTHER';
};

export const getLevelNum = (cur: Curso): number => {
  const t = (cur.titulo + ' ' + cur.codigo).toUpperCase();
  if (t.includes('ADVANCED') || t.includes('EXPERT') || t.includes('NIVEL 3') || t.includes('LEVEL 3') || t.includes('LVL3') || t.includes('L3-') || t.includes('-L3') || t.includes('SVCT3') || t.includes('CTU3') || t.includes('LEVEL3')) return 3;
  if (t.includes('PROFICIENT') || t.includes('INTERMEDIO') || t.includes('NIVEL 2') || t.includes('LEVEL 2') || t.includes('LVL2') || t.includes('L2-') || t.includes('-L2') || t.includes('SVCT2') || t.includes('CTU2') || t.includes('LEVEL2')) return 2;
  return 1;
};

/**
 * Calculates the next course on the training route for an engineer based on progress levels (X, XX, XXX).
 * ONLY includes courses of modalities the engineer has actually started (completed at least 1 course in).
 */
export interface RutaRecomendacion {
  siguienteCurso: Curso | null;
  completados: Curso[];
  pendientes: Curso[];
  totalCursos: number;
  porcentajeCompletitud: number;
  costoPendienteTotal: number;
  modalityLevels: Record<string, number>;
}

export function obtenerProximoCursoIngeniero(
  ingeniero: Engineer,
  cursos: Curso[],
  historial: HistorialEntrenamiento[]
): RutaRecomendacion {
  // 1. Get all completed course codes for this engineer
  const codigosCompletados = new Set(
    historial
      .filter(h => h.id_ingeniero === ingeniero.id && h.fecha_completado)
      .map(h => h.codigo_curso)
  );

  // 2. Identify all completed courses
  const completados = cursos.filter(c => codigosCompletados.has(c.codigo));

  // 3. Compute the engineer's current level in each modality.
  const modalityLevels: Record<string, number> = {};
  ALL_MODALITIES_LIST.forEach(m => {
    const completedInMod = completados.filter(c => getModKey(c) === m.key);
    const maxCourseLvl = completedInMod.reduce((max, c) => Math.max(max, getLevelNum(c)), 0);
    modalityLevels[m.key] = Math.min(Math.max(completedInMod.length, maxCourseLvl), 3);
  });

  // 4. Identify the modalities the engineer has actually started (completed at least one course in)
  const startedModalities = new Set<string>();
  completados.forEach(cur => {
    const modKey = getModKey(cur);
    if (ALL_MODALITIES_LIST.some(m => m.key === modKey)) {
      startedModalities.add(modKey);
    }
  });

  // 5. Build list of representative pending courses for started modalities
  const pendientes: Curso[] = [];
  
  startedModalities.forEach(modKey => {
    const currentLvl = modalityLevels[modKey] || 0;
    if (currentLvl < 3) {
      for (let targetLvl = currentLvl + 1; targetLvl <= 3; targetLvl++) {
        // Find the first course of this level in this modality that the engineer hasn't completed yet
        const neededCourse = cursos.find(c => 
          getModKey(c) === modKey && 
          getLevelNum(c) === targetLvl && 
          !codigosCompletados.has(c.codigo)
        );
        if (neededCourse) {
          pendientes.push(neededCourse);
        }
      }
    }
  });

  // 6. Sort completados logically by level, then code
  completados.sort((a, b) => {
    const lvlA = getLevelNum(a);
    const lvlB = getLevelNum(b);
    if (lvlA !== lvlB) return lvlA - lvlB;
    return a.codigo.localeCompare(b.codigo, undefined, { numeric: true, sensitivity: 'base' });
  });

  // 7. Sort pending courses by score (immediate next levels first, then future levels), then by modality
  const getCourseScore = (c: Curso): number => {
    const modKey = getModKey(c);
    const courseLvl = getLevelNum(c);
    const currentLvl = modalityLevels[modKey] || 0;

    if (courseLvl === currentLvl + 1) {
      return 10; // Immediate next level
    }
    return 20; // Future level
  };

  pendientes.sort((a, b) => {
    const scoreA = getCourseScore(a);
    const scoreB = getCourseScore(b);
    if (scoreA !== scoreB) return scoreA - scoreB;

    const modA = getModKey(a);
    const modB = getModKey(b);
    if (modA !== modB) return modA.localeCompare(modB);

    const lvlA = getLevelNum(a);
    const lvlB = getLevelNum(b);
    if (lvlA !== lvlB) return lvlA - lvlB;

    return a.codigo.localeCompare(b.codigo, undefined, { numeric: true, sensitivity: 'base' });
  });

  // 8. Next course recommended is the first pending course in prioritized order
  const siguienteCurso = pendientes.length > 0 ? pendientes[0] : null;

  const totalCursos = completados.length + pendientes.length;
  const porcentajeCompletitud = totalCursos > 0 
    ? Math.round((completados.length / totalCursos) * 100) 
    : 0;

  const costoPendienteTotal = pendientes.reduce((acc, cur) => acc + cur.costo, 0);

  return {
    siguienteCurso,
    completados,
    pendientes,
    totalCursos,
    porcentajeCompletitud,
    costoPendienteTotal,
    modalityLevels
  };
}

/**
 * Calculates string similarity between two strings using Sørensen-Dice coefficient.
 * It removes common prefixes, non-alphanumeric characters, and compares character bigrams.
 */
export function getSimilarity(str1: string, str2: string): number {
  const clean = (s: string) => {
    if (!s) return '';
    return s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/^(online course|read & acknowledge|exam|course|webinar|curriculum|curriculum:)\s*:\s*/i, '')
      .replace(/[^a-z0-9]/g, '');
  };
  const s1 = clean(str1);
  const s2 = clean(str2);
  
  if (s1 === s2) return 1.0;
  if (s1.length < 2 || s2.length < 2) return 0.0;

  const getBigrams = (str: string) => {
    const bigrams = new Set<string>();
    for (let i = 0; i < str.length - 1; i++) {
      bigrams.add(str.substring(i, i + 2));
    }
    return bigrams;
  };

  const bigrams1 = getBigrams(s1);
  const bigrams2 = getBigrams(s2);
  
  let intersection = 0;
  bigrams1.forEach(b => {
    if (bigrams2.has(b)) {
      intersection++;
    }
  });

  return (2 * intersection) / (bigrams1.size + bigrams2.size);
}

/**
 * Resolves an engineer name from a PDF/CSV to a registered engineer ID if they are close matches.
 */
export function resolveEngineerId(parsedName: string, engineersList: Engineer[]): string {
  const cleanString = (s: string) => {
    if (!s) return '';
    return s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/^ing\.\s+/i, '') // Remove "Ing. " prefix
      .replace(/[^a-z0-9]/g, '');
  };

  const cleanParsed = cleanString(parsedName);
  if (!cleanParsed) return sanitizeId(parsedName || '');
  
  // 1. Exact or substring match in sanitized names
  let bestMatch: Engineer | null = null;
  let longestMatchLength = 0;
  
  const list = engineersList || [];
  for (const ing of list) {
    const ingName = ing.name || (ing as any).nombre;
    const cleanIng = cleanString(ingName);
    if (!cleanIng) continue;
    
    // Check if one contains the other (e.g. "sixtocalderon" in "sixtocalderonrodriguez...")
    if (cleanParsed.includes(cleanIng) || cleanIng.includes(cleanParsed)) {
      if (cleanIng.length > longestMatchLength) {
        longestMatchLength = cleanIng.length;
        bestMatch = ing;
      }
    }
  }
  
  if (bestMatch) {
    return bestMatch.id;
  }
  
  // 2. Similarity fallback using Dice coefficient
  let bestSim = 0;
  let bestSimIng: Engineer | null = null;
  for (const ing of list) {
    const ingName = ing.name || (ing as any).nombre;
    const sim = getSimilarity(parsedName || '', ingName || '');
    if (sim > bestSim && sim > 0.4) {
      bestSim = sim;
      bestSimIng = ing;
    }
  }
  
  if (bestSimIng) {
    return bestSimIng.id;
  }
  
  // Fallback to default sanitization
  return sanitizeId(parsedName || '');
}
