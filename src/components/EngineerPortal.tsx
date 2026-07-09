import React, { useState, useRef, useEffect } from 'react';
import { Smartphone, User, ArrowLeft, CheckCircle, Navigation, Play, FileText, Check, Plus, Minus, AlertTriangle, ShieldCheck, RefreshCw, Palmtree } from 'lucide-react';
import { WorkOrder, Engineer, Client, TechnicalReport, MaterialUsed, Specialty, Vacation, EngineerPermission } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface EngineerPortalProps {
  engineers: Engineer[];
  clients: Client[];
  workOrders: WorkOrder[];
  reports: TechnicalReport[];
  vacations?: Vacation[];
  onUpdateWorkOrderStatus: (woId: string, status: any) => void;
  onSubmitTechnicalReport: (report: TechnicalReport) => void;
  onImportData: (newOrders: WorkOrder[], newReports: TechnicalReport[], newClients: Client[], newEngineers: Engineer[]) => void;
  onUpdateEngineer: (updatedEng: Engineer) => void;
  onAddVacation?: (vac: Vacation) => void;
  permissions?: EngineerPermission[];
  onAddPermission?: (perm: EngineerPermission) => void;
  lockedEngineerId?: string;
}

const COMMON_SPARES: Record<string, string[]> = {
  'Ingeniería': ['Multímetro Digital de Precisión', 'Juego de Destornilladores Dieléctricos', 'Empaque Sellador Silicón RTV', 'Kit de Conectores Mecánicos Zapata', 'Cinta Aislante Eléctrica 3M'],
  'Aplicaciones': ['Cable de Diagnóstico Serial-USB', 'Multímetro Digital Fluke', 'Líquido Limpiador Dieléctrico Spray', 'Cinchos plásticos de amarre (paq x50)', 'Trapo Microfibra Industrial'],
  'Ventas': ['Tableta de Diagnóstico Demo', 'Catálogo FSM Impreso Pro', 'Muestra de Sensores Inteligentes', 'Termómetro Infrarrojo de Bolsillo', 'Bolígrafo Ejecutivo y Block MTO'],
  default: ['Arandela y Tornillería de Acoplamiento', 'Trapo microfibra industrial (unidad)', 'Empaque sellador Silicón RTV', 'Cinchos plásticos de amarre (paq x50)', 'WD-40 lubricante penetrante spray']
};

export default function EngineerPortal({
  engineers,
  clients,
  workOrders,
  reports,
  vacations = [],
  onUpdateWorkOrderStatus,
  onSubmitTechnicalReport,
  onImportData,
  onUpdateEngineer,
  onAddVacation,
  permissions = [],
  onAddPermission,
  lockedEngineerId
}: EngineerPortalProps) {
  // Simulator configuration
  const [activeEngineerId, setActiveEngineerId] = useState<string>(lockedEngineerId || engineers[0]?.id || '');

  useEffect(() => {
    if (lockedEngineerId) {
      setActiveEngineerId(lockedEngineerId);
    }
  }, [lockedEngineerId]);
  const [selectedWOId, setSelectedWOId] = useState<string | null>(null);
  const [isCompilingReport, setIsCompilingReport] = useState(false);
  
  // Dynamic Date States (Initializes to local system time, 2026-06-10)
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());
  
  // View mode switcher: 'day' for Daily, 'week' for Weekly
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');
  
  // Sync states
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotification, setSyncNotification] = useState<string | null>(null);
  
  // Engineer Vacation Request Form states
  const [engVacStart, setEngVacStart] = useState('');
  const [engVacEnd, setEngVacEnd] = useState('');
  const [engVacNotes, setEngVacNotes] = useState('');
  const [engVacIncludeWeekends, setEngVacIncludeWeekends] = useState(true);

  const getDurationFromDates = (startDateStr: string, endDateStr: string): number => {
    if (!startDateStr || !endDateStr) return 1;
    const start = new Date(startDateStr + 'T00:00:00');
    const end = new Date(endDateStr + 'T00:00:00');
    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 0) return 1;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const getVacationDuration = (startDateStr: string, endDateStr: string, includeWeekends: boolean = true): number => {
    if (!startDateStr || !endDateStr) return 1;
    const start = new Date(startDateStr + 'T00:00:00');
    const end = new Date(endDateStr + 'T00:00:00');
    if (start > end) return 1;
    if (includeWeekends) {
      const diffTime = end.getTime() - start.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    } else {
      let count = 0;
      const cur = new Date(start);
      while (cur <= end) {
        const dayOfWeek = cur.getDay(); // 0 = Sunday, 6 = Saturday
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          count++;
        }
        cur.setDate(cur.getDate() + 1);
      }
      return count;
    }
  };

  const calculateYearsInCompany = (entryDate?: string): string => {
    if (!entryDate) return 'N/D';
    const entry = new Date(entryDate + 'T00:00:00');
    const now = new Date();
    const diffTime = now.getTime() - entry.getTime();
    if (diffTime < 0) return '0 años';
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    return `${diffYears.toFixed(1)} años`;
  };

  const getYearsInCompanyNum = (entryDate?: string): number => {
    if (!entryDate) return 0;
    const entry = new Date(entryDate + 'T00:00:00');
    const now = new Date();
    const diffTime = now.getTime() - entry.getTime();
    if (diffTime < 0) return 0;
    return diffTime / (1000 * 60 * 60 * 24 * 365.25);
  };

  // Profile Drawer States
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [editEngName, setEditEngName] = useState('');
  const [editEngSpecialty, setEditEngSpecialty] = useState<Specialty>('Ingeniería');
  const [editEngEmail, setEditEngEmail] = useState('');
  const [editEngPhone, setEditEngPhone] = useState('');
  const [editEngAvatar, setEditEngAvatar] = useState('');
  const [mobileTheme, setMobileTheme] = useState<'indigo' | 'emerald' | 'crimson' | 'dark'>('indigo');

  const monthsList = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const themeClasses = {
    indigo: {
      bg: 'bg-indigo-600 hover:bg-indigo-700',
      bgLight: 'bg-indigo-50/50',
      bgText: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      text: 'text-indigo-600 hover:text-indigo-700',
      textColor: 'text-indigo-700',
      border: 'border-indigo-200',
      borderL: 'border-l-indigo-600',
      ring: 'ring-indigo-500',
      activeTab: 'bg-white text-indigo-950 shadow-2xs font-extrabold',
      pill: 'bg-indigo-100 text-indigo-700',
      dot: 'bg-indigo-600',
      ringLight: 'sm:ring-indigo-500/10'
    },
    emerald: {
      bg: 'bg-emerald-600 hover:bg-emerald-700',
      bgLight: 'bg-emerald-50/50',
      bgText: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      text: 'text-emerald-600 hover:text-emerald-700',
      textColor: 'text-emerald-700',
      border: 'border-emerald-200',
      borderL: 'border-l-emerald-600',
      ring: 'ring-emerald-500',
      activeTab: 'bg-white text-emerald-950 shadow-2xs font-extrabold',
      pill: 'bg-emerald-100 text-emerald-700',
      dot: 'bg-emerald-600',
      ringLight: 'sm:ring-emerald-500/10'
    },
    crimson: {
      bg: 'bg-rose-600 hover:bg-rose-700',
      bgLight: 'bg-rose-50/50',
      bgText: 'bg-rose-50 text-rose-700 border-rose-100',
      text: 'text-rose-600 hover:text-rose-700',
      textColor: 'text-rose-750',
      border: 'border-rose-200',
      borderL: 'border-l-rose-600',
      ring: 'ring-rose-500',
      activeTab: 'bg-white text-rose-950 shadow-2xs font-extrabold',
      pill: 'bg-rose-100 text-rose-700',
      dot: 'bg-rose-600',
      ringLight: 'sm:ring-rose-500/10'
    },
    dark: {
      bg: 'bg-slate-800 hover:bg-slate-900',
      bgLight: 'bg-slate-100',
      bgText: 'bg-slate-900 text-white border-slate-950',
      text: 'text-slate-800 hover:text-slate-950',
      textColor: 'text-slate-950',
      border: 'border-slate-800',
      borderL: 'border-l-slate-800',
      ring: 'ring-slate-800',
      activeTab: 'bg-white text-slate-950 shadow-2xs font-extrabold',
      pill: 'bg-slate-900 text-white',
      dot: 'bg-slate-850',
      ringLight: 'sm:ring-slate-800/10'
    }
  }[mobileTheme];

  // CSV Importer States for Engineer
  const [showImporter, setShowImporter] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [csvFileName, setCsvFileName] = useState('');
  const [parsedOrders, setParsedOrders] = useState<WorkOrder[]>([]);
  const [parsedReports, setParsedReports] = useState<TechnicalReport[]>([]);
  const [parsedClients, setParsedClients] = useState<Client[]>([]);
  const [parsedEngineers, setParsedEngineers] = useState<Engineer[]>([]);
  const [importFeedback, setImportFeedback] = useState<{
    ordersCount: number;
    reportsCount: number;
    duplicateCount: number;
    engineerMatched: string;
  } | null>(null);

  // Form states
  const [findings, setFindings] = useState('');
  const [actions, setActions] = useState('');
  const [hours, setHours] = useState<number>(2);
  const [clientSignee, setClientSignee] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialUsed[]>([]);

  // Canvas signature refs
  const clientCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const techCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const supportCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Drawing states
  const [isDrawingClient, setIsDrawingClient] = useState(false);
  const [isDrawingTech, setIsDrawingTech] = useState(false);
  const [isDrawingSupport, setIsDrawingSupport] = useState(false);
  const [hasSignedClient, setHasSignedClient] = useState(false);
  const [hasSignedTech, setHasSignedTech] = useState(false);
  const [hasSignedSupport, setHasSignedSupport] = useState(false);

  // New RE-TE-04 fields states
  const [numRegistro, setNumRegistro] = useState('');
  const [correoCliente, setCorreoCliente] = useState('');
  const [telefonoCliente, setTelefonoCliente] = useState('');
  const [atencionArea, setAtencionArea] = useState<'Garantía extendida/Contrato' | 'Garantía de compra' | 'Facturable' | 'Otro'>('Garantía extendida/Contrato');
  const [horaInicio, setHoraInicio] = useState('08:00:00');
  const [horaFin, setHoraFin] = useState('16:00:00');
  const [estadoInicio, setEstadoInicio] = useState<'Operativo' | 'No Operativo'>('Operativo');
  const [estadoFin, setEstadoFin] = useState<'Operativo' | 'No Operativo'>('Operativo');

  const [equipoMarca, setEquipoMarca] = useState('GENERAL ELECTRIC');
  const [equipoModelo, setEquipoModelo] = useState('');
  const [equipoSerie, setEquipoSerie] = useState('');
  const [equipoSoftware, setEquipoSoftware] = useState('');

  const [motivoVisita, setMotivoVisita] = useState('');
  const [trabajoRealizado, setTrabajoRealizado] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const [requiredSpares, setRequiredSpares] = useState<MaterialUsed[]>([]);
  const [photoGallery, setPhotoGallery] = useState<string[]>([]); // Array of Base64 images
  const [technicianCedula, setTechnicianCedula] = useState('');
  const [clientCedula, setClientCedula] = useState('');

  const [supportCedula, setSupportCedula] = useState('');
  const [supportSignee, setSupportSignee] = useState('');
  const [isViewingRETE04, setIsViewingRETE04] = useState(false);

  // Helpers
  const normalizeDate = (rawDate: string): string => {
    const defaultDate = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${selectedDay.toString().padStart(2, '0')}`;
    if (!rawDate) return defaultDate;
    const cleaned = rawDate.replace(/['"]/g, '').trim();
    const parts = cleaned.split(/[\/\-]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      }
      if (parts[2].length === 4) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    return cleaned.includes('2026') ? cleaned : defaultDate;
  };

  const parseCSV = (text: string) => {
    const cleanText = text.replace(/^\uFEFF/, '');
    const lines = cleanText.split(/\r?\n/);
    if (lines.length < 2) return [];
    const headers = lines[0].split(/[,;\t]/).map(h => h.trim().replace(/^["']|["']$/g, ''));
    const results: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const row: string[] = [];
      let inQuotes = false;
      let currentVal = '';
      for (let cIdx = 0; cIdx < line.length; cIdx++) {
        const char = line[cIdx];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if ((char === ',' || char === ';' || char === '\t') && !inQuotes) {
          row.push(currentVal.trim().replace(/^["']|["']$/g, ''));
          currentVal = '';
        } else {
          currentVal += char;
        }
      }
      row.push(currentVal.trim().replace(/^["']|["']$/g, ''));
      const obj: Record<string, string> = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      results.push(obj);
    }
    return results;
  };

  const handleParseCSV = (fileContent: string, fileName: string) => {
    try {
      const rows = parseCSV(fileContent);
      if (rows.length === 0) {
        alert("El archivo CSV o Excel parece estar vacío o con formato incorrecto.");
        return;
      }
      
      const getRowValue = (row: Record<string, string>, possibleNames: string[]): string => {
        const normalizedRow: Record<string, string> = {};
        Object.keys(row).forEach(key => {
          const normKey = key.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          normalizedRow[normKey] = row[key];
        });

        for (const name of possibleNames) {
          const normName = name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          if (normalizedRow[normName] !== undefined) {
            return normalizedRow[normName];
          }
        }
        return '';
      };

      const newOrders: WorkOrder[] = [];
      const newReports: TechnicalReport[] = [];
      const newClients: Client[] = [];
      const tempClients = [...clients];
      const eng = engineers.find(e => e.id === activeEngineerId) || engineers[0];

      const getOrRegisterClient = (rawCName: string, cleanEquip: string): string => {
        if (!rawCName) return 'CLI-101';
        const cleanName = rawCName.replace(/^(cliente:?)\s*/i, '').trim();
        const lower = cleanName.toLowerCase();

        const alphaNumClean = lower.replace(/[^a-z0-9]/g, '');
        if (!alphaNumClean) return 'CLI-101';

        const found = tempClients.find(c => {
          const cNameLower = c.name.toLowerCase();
          const cleanCName = cNameLower.replace(/[^a-z0-9]/g, '');
          if (!cleanCName) return false;
          return cNameLower === lower || cNameLower.includes(lower) || lower.includes(cNameLower);
        });
        if (found) return found.id;

        if (lower.includes('arcos')) return 'CLI-101';
        if (lower.includes('ángeles') || lower.includes('angeles')) return 'CLI-102';
        if (lower.includes('indumetal') || lower.includes('vallejo')) return 'CLI-103';
        if (lower.includes('titanium') || lower.includes('santa fe')) return 'CLI-104';
        if (lower.includes('dhl') || lower.includes('naucalpan')) return 'CLI-105';

        const newId = `CLI-DYN-${100 + tempClients.length}-${Math.floor(Math.random()*100)}`;
        const newCli: Client = {
          id: newId,
          name: cleanName,
          address: 'Dirección por registrar (Ingestor)',
          industry: 'General / Salud',
          contactName: 'Contacto por registrar',
          contactPhone: '',
          installedEquipments: [cleanEquip]
        };
        tempClients.push(newCli);
        newClients.push(newCli);
        return newId;
      };

      rows.forEach((row, idx) => {
        const clientName = getRowValue(row, ['Cliente', 'Hospital', 'Ubicacion', 'Sede', 'Clinica', 'Empresa', 'Nombre']);
        const reportNo = getRowValue(row, ['Reportes', 'Reporte', 'Folio', 'Codigo', 'ID']) || `REP-CSV-${idx + 1}`;
        const equipName = getRowValue(row, ['Equipo/Tarea', 'equipo_tarea', 'Equipo', 'Activo', 'Tarea', 'Dispositivo']) || 'Equipo Soporte';
        const rawDate = getRowValue(row, ['Fecha', 'Date', 'Dia', 'Día']) || '';
        const comments = getRowValue(row, ['Comentarios', 'Comentario', 'Observaciones', 'Observacion', 'Notas', 'Nota']) || 'Mantenimiento preventivo efectuado.';
        const deliveredStr = (getRowValue(row, ['Reporte Entregado', 'Entregado', 'Estado', 'Estatus', 'Completado', 'Entregado?']) || 'SI').trim().toUpperCase();

        if (!clientName) return;

        const cleanEquipo = equipName.replace(/^(equipo:?|activo:?)\s*/i, '').trim();
        const cleanCliente = clientName.replace(/^(cliente:?)\s*/i, '').trim();
        const cId = getOrRegisterClient(cleanCliente, cleanEquipo);

        const plannedDateStr = normalizeDate(rawDate);
        const woId = `OT-CSV-${eng.name.substring(0,3).toUpperCase()}-${idx + 401}`;
        const isDelivered = deliveredStr === 'SI' || deliveredStr === 'YES' || deliveredStr === 'SÍ';

        const wo: WorkOrder = {
          id: woId,
          clientId: cId,
          engineerId: eng.id,
          equipmentName: cleanEquipo,
          plannedDate: plannedDateStr,
          status: isDelivered ? 'Conciliado' : 'Pendiente',
          type: 'Preventivo',
          notes: comments
        };
        newOrders.push(wo);

        if (isDelivered) {
          const rep: TechnicalReport = {
            id: `REP-[CSV]${woId.split('-').pop()}`,
            workOrderId: woId,
            executionDate: plannedDateStr,
            hoursSpent: 2,
            technicalFindings: `Carga automática de mantenimiento preventivo. Notas de Ingeniero: ${comments}`,
            actionsTaken: 'Acondicionamiento básico, soplado de filtros y verificación estática.',
            materialsUsed: [{ item: 'Insumos de calibración y limpieza', qty: 1 }],
            nextRecommendations: 'Monitoreo preventivo periódico.',
            technicianSignature: eng.name,
            clientSignatureName: 'Firmado en Excel de Conciliación',
            clientSignatureData: '',
            validationState: 'aprobado',
            validatedAt: plannedDateStr,
            validationNotes: 'Cargado mediante reporte histórico CSV'
          };
          newReports.push(rep);
        }
      });

      setParsedOrders(newOrders);
      setParsedReports(newReports);
      setParsedClients(newClients);
      setParsedEngineers([]);
      setCsvFileName(fileName);
      setImportFeedback({
        ordersCount: newOrders.length,
        reportsCount: newReports.length,
        duplicateCount: 0,
        engineerMatched: eng.name
      });
    } catch (e: any) {
      console.error(e);
      alert("Error al analizar el CSV: " + e.message);
    }
  };

  const loadDemoCSVforEngineer = () => {
    const csvContent = `Cliente,Reportes,Equipo/Tarea,Fecha,Mes,Semana,Reporte Entregado,Comentarios
HOSPITAL DE JALAPA,REP-992,RX Fijo,2026-03-12,Marzo,Semana 11,SI,Calibración de cabezal satisfactoria y filtros sanitizados.
CLÍNICA AMIGOS DEL REY,REP-129,FDR Smart,2026-03-12,Marzo,Semana 11,NO,Demorado por rotura de engranaje exterior.
IMSS CENTRO MEDICO,REP-404,MR355,2026-03-12,Marzo,Semana 11,SI,Aislantes térmicos ajustados, helio estable al 84%.`;
    handleParseCSV(csvContent, 'reportes_historicos_demo_ingeniero.csv');
  };

  const handleCommitImport = () => {
    if (parsedOrders.length === 0) return;
    onImportData(parsedOrders, parsedReports, parsedClients, parsedEngineers);
    
    // Automatically switch calendar view to the imported month/year/day
    const firstOrder = parsedOrders[0];
    if (firstOrder && firstOrder.plannedDate) {
      const parts = firstOrder.plannedDate.split('-');
      if (parts.length === 3) {
        setSelectedYear(Number(parts[0]));
        setSelectedMonth(Number(parts[1]));
        setSelectedDay(Number(parts[2]));
      }
    }

    setParsedOrders([]);
    setParsedReports([]);
    setParsedClients([]);
    setParsedEngineers([]);
    setImportFeedback(null);
    setCsvFileName('');
  };
  // Retrieve current active entities
  const activeEngineer = engineers.find(e => e.id === activeEngineerId);

  // Keep activeEngineerId synchronized with loaded engineers list from Firestore
  useEffect(() => {
    if (lockedEngineerId) {
      setActiveEngineerId(lockedEngineerId);
      return;
    }
    if (engineers.length > 0) {
      const exists = engineers.some(e => e.id === activeEngineerId);
      if (!exists) {
        setActiveEngineerId(engineers[0].id);
      }
    }
  }, [engineers, activeEngineerId, lockedEngineerId]);

  useEffect(() => {
    if (activeEngineer) {
      setEditEngName(activeEngineer.name);
      
      // Fallback old specialties to "Ingeniería" if they don't match the new ones
      const spec = activeEngineer.specialty;
      if (spec === 'Ingeniería' || spec === 'Aplicaciones' || spec === 'Ventas') {
        setEditEngSpecialty(spec);
      } else {
        setEditEngSpecialty('Ingeniería');
      }
      
      setEditEngEmail(activeEngineer.email || '');
      setEditEngPhone(activeEngineer.phone || '');
      setEditEngAvatar(activeEngineer.avatar || '');
      setMobileTheme(activeEngineer.theme || 'indigo');
    }
  }, [activeEngineerId, activeEngineer]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEngineer) return;
    const updatedEng: Engineer = {
      ...activeEngineer,
      name: editEngName,
      specialty: editEngSpecialty,
      email: editEngEmail,
      phone: editEngPhone,
      avatar: editEngAvatar,
      theme: mobileTheme
    };
    onUpdateEngineer(updatedEng);
    setIsProfileOpen(false);
  };
  
  const targetDateStr = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${selectedDay.toString().padStart(2, '0')}`;
  
  // Daily assigned orders
  const assignedOrders = workOrders.filter(wo => {
    if (
      wo.engineerId !== activeEngineerId && 
      wo.supportEngineerId !== activeEngineerId && 
      !wo.supportEngineerIds?.includes(activeEngineerId)
    ) return false;
    if (!wo.durationDays || wo.durationDays <= 1) {
      return wo.plannedDate === targetDateStr;
    }
    const start = new Date(wo.plannedDate + 'T00:00:00');
    const target = new Date(targetDateStr + 'T00:00:00');
    const end = new Date(start);
    end.setDate(start.getDate() + (wo.durationDays - 1));
    return target >= start && target <= end;
  });

  // Helper to get week dates (Monday to Sunday) for the selected day
  const getWeekDates = () => {
    const date = new Date(selectedYear, selectedMonth - 1, selectedDay);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(date);
    monday.setDate(date.getDate() + diffToMonday);
    
    const weekDates: { dateStr: string; label: string; dayName: string; dayNum: number; monthNum: number; yearNum: number }[] = [];
    const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const yStr = d.getFullYear();
      const mStr = (d.getMonth() + 1).toString().padStart(2, '0');
      const dStr = d.getDate().toString().padStart(2, '0');
      weekDates.push({
        dateStr: `${yStr}-${mStr}-${dStr}`,
        label: `${dayNames[i]} ${d.getDate()}`,
        dayName: dayNames[i],
        dayNum: d.getDate(),
        monthNum: d.getMonth() + 1,
        yearNum: d.getFullYear()
      });
    }
    return weekDates;
  };

  const weekDates = getWeekDates();
  const weekDateStrings = weekDates.map(w => w.dateStr);

  // Weekly assigned orders
  const assignedOrdersForWeek = workOrders.filter(wo => {
    if (
      wo.engineerId !== activeEngineerId && 
      wo.supportEngineerId !== activeEngineerId && 
      !wo.supportEngineerIds?.includes(activeEngineerId)
    ) return false;
    if (!wo.durationDays || wo.durationDays <= 1) {
      return weekDateStrings.includes(wo.plannedDate);
    }
    const start = new Date(wo.plannedDate + 'T00:00:00');
    return weekDates.some(wd => {
      const target = new Date(wd.dateStr + 'T00:00:00');
      const end = new Date(start);
      end.setDate(start.getDate() + (wo.durationDays! - 1));
      return target >= start && target <= end;
    });
  });

  // Function to automatically generate 3 demo orders for the current week in Firestore
  const handleGenerateWeeklyDemoData = () => {
    if (!activeEngineer) return;
    
    const newWOs: WorkOrder[] = [
      {
        id: `OT-SEM-${activeEngineer.id}-${weekDates[1].dayNum}${weekDates[1].monthNum}`,
        clientId: 'CLI-102', // Hospital General Ángeles
        engineerId: activeEngineer.id,
        equipmentName: activeEngineer.specialty === 'Ingeniería' ? 'Chiller York 355' : activeEngineer.specialty === 'Aplicaciones' ? 'Servidor Rack 42U' : 'Equipo Demo Ventas',
        plannedDate: weekDates[1].dateStr, // Martes
        plannedTime: '09:00 AM',
        status: 'Pendiente',
        type: 'Preventivo',
        notes: 'Mantenimiento Preventivo de compresores y calibración de presiones.'
      },
      {
        id: `OT-SEM-${activeEngineer.id}-${weekDates[3].dayNum}${weekDates[3].monthNum}`,
        clientId: 'CLI-101', // Corporativo Arcos
        engineerId: activeEngineer.id,
        equipmentName: activeEngineer.specialty === 'Ingeniería' ? 'Manejadora de Aire (FMI)' : activeEngineer.specialty === 'Aplicaciones' ? 'Switch Core Cisco' : 'Lector Biométrico Ventas',
        plannedDate: weekDates[3].dateStr, // Jueves
        plannedTime: '11:30 AM',
        status: 'En Proceso',
        type: 'Correctivo',
        notes: 'Filtros saturados y ventilador con ruidos extraños. Equipo parado.',
        isEquipmentDown: true
      },
      {
        id: `OT-SEM-${activeEngineer.id}-${weekDates[4].dayNum}${weekDates[4].monthNum}`,
        clientId: 'CLI-104', // Torre Titanium
        engineerId: activeEngineer.id,
        equipmentName: activeEngineer.specialty === 'Ingeniería' ? 'Aire de Precisión Vertiv' : activeEngineer.specialty === 'Aplicaciones' ? 'Access Point Ruckus' : 'Sistema CCTV Ventas',
        plannedDate: weekDates[4].dateStr, // Viernes
        plannedTime: '03:00 PM',
        status: 'Pendiente',
        type: 'Inspección',
        notes: 'Verificación estática y soplado del serpentín de condensación.'
      }
    ];

    onImportData(newWOs, [], [], []);
    setSyncNotification('¡Agenda semanal generada y sincronizada con éxito en Firestore!');
    setTimeout(() => setSyncNotification(null), 5000);
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      
      const currentWeekOrders = workOrders.filter(wo => {
        if (
          wo.engineerId !== activeEngineerId && 
          wo.supportEngineerId !== activeEngineerId && 
          !wo.supportEngineerIds?.includes(activeEngineerId)
        ) return false;
        if (!wo.durationDays || wo.durationDays <= 1) {
          return weekDateStrings.includes(wo.plannedDate);
        }
        const start = new Date(wo.plannedDate + 'T00:00:00');
        return weekDates.some(wd => {
          const target = new Date(wd.dateStr + 'T00:00:00');
          const end = new Date(start);
          end.setDate(start.getDate() + (wo.durationDays! - 1));
          return target >= start && target <= end;
        });
      });

      if (currentWeekOrders.length === 0) {
        const confirmSeed = window.confirm(
          `No se encontraron órdenes de trabajo para esta semana (${weekDates[0].dateStr} al ${weekDates[6].dateStr}).\n\n` +
          `¿Deseas generar y sincronizar 3 órdenes de trabajo demo para el ${activeEngineer?.name || 'técnico'} en esta semana?`
        );
        if (confirmSeed) {
          handleGenerateWeeklyDemoData();
        }
      } else {
        setSyncNotification(`Sincronización completa: ${currentWeekOrders.length} órdenes de trabajo cargadas.`);
        setTimeout(() => setSyncNotification(null), 4000);
      }
    }, 1200);
  };

  const handleQuickConciliation = (woId: string) => {
    const targetWo = workOrders.find(wo => wo.id === woId);
    if (!targetWo) return;
    
    // Auto-create a high-quality fast Technical Report for this Work Order
    const rep: TechnicalReport = {
      id: `REP-[CSV]${targetWo.id.split('-').pop()}`,
      workOrderId: targetWo.id,
      executionDate: targetWo.plannedDate,
      hoursSpent: 2.5,
      technicalFindings: `Mantenimiento preventivo rápido completado para el equipo ${targetWo.equipmentName}.`,
      actionsTaken: 'Inspección de calibración básica, soplado de filtros e inspección de presiones de línea nominales.',
      materialsUsed: [{ item: 'Insumos de calibración y limpieza', qty: 1 }],
      nextRecommendations: 'Monitoreo periódico conforme al plan semestral.',
      technicianSignature: activeEngineer?.name || 'Ingeniero de Campo',
      clientSignatureName: 'Firmado digitalmente rápida en campo',
      clientSignatureData: '',
      validationState: 'aprobado',
      validatedAt: targetWo.plannedDate,
      validationNotes: 'Auto-Conciliado y aprobado vía sincronización.'
    };
    
    onSubmitTechnicalReport(rep);
    onUpdateWorkOrderStatus(targetWo.id, 'Conciliado');
  };

  // Initialize report defaults on open
  useEffect(() => {
    if (selectedWOId) {
      const task = workOrders.find(w => w.id === selectedWOId);
      const client = clients.find(c => c.id === task?.clientId);
      const existingReport = reports.find(r => r.workOrderId === selectedWOId);
      
      if (existingReport) {
        setFindings(existingReport.technicalFindings || '');
        setActions(existingReport.actionsTaken || '');
        setHours(existingReport.hoursSpent || 2);
        setClientSignee(existingReport.clientSignatureName || '');
        setSelectedMaterials(existingReport.materialsUsed || []);
        
        // Load RE-TE-04 fields
        setNumRegistro(existingReport.numRegistro || `ORI - OTC - ${selectedWOId.replace('OT-', '').replace('OT-SEM-', '')}`);
        setCorreoCliente(existingReport.correoCliente || '');
        setTelefonoCliente(existingReport.telefonoCliente || client?.contactPhone || '');
        setAtencionArea(existingReport.atencionArea || 'Garantía extendida/Contrato');
        setHoraInicio(existingReport.horaInicio || '08:00');
        setHoraFin(existingReport.horaFin || '16:00');
        setEstadoInicio(existingReport.estadoInicio || 'Operativo');
        setEstadoFin(existingReport.estadoFin || 'Operativo');
        
        setEquipoMarca(existingReport.equipoMarca || 'GENERAL ELECTRIC');
        setEquipoModelo(existingReport.equipoModelo || '');
        setEquipoSerie(existingReport.equipoSerie || '');
        setEquipoSoftware(existingReport.equipoSoftware || '');
        
        setMotivoVisita(existingReport.motivoVisita || task?.notes || 'Mantenimiento Correctivo');
        setTrabajoRealizado(existingReport.trabajoRealizado || existingReport.actionsTaken || '');
        setObservaciones(existingReport.observaciones || existingReport.nextRecommendations || '');
        
        setRequiredSpares(existingReport.repuestosRequeridos || []);
        setPhotoGallery(existingReport.registroFotografico || []);
        setTechnicianCedula(existingReport.technicianCedula || '');
        setClientCedula(existingReport.clientCedula || '');
        
        setSupportCedula(existingReport.supportTechnicianCedula || '');
        setSupportSignee(existingReport.supportTechnicianName || '');
        
        setHasSignedClient(!!existingReport.clientSignatureData);
        setHasSignedTech(!!existingReport.technicianSignatureData);
        setHasSignedSupport(!!existingReport.supportTechnicianSignature);
      } else {
        // Clear for brand new report
        setFindings('');
        setActions('');
        setHours(2);
        setClientSignee(client?.contactName || '');
        setSelectedMaterials([]);
        
        // Defaults
        setNumRegistro(`ORI - OTC - ${selectedWOId.replace('OT-', '').replace('OT-SEM-', '')}`);
        setCorreoCliente('');
        setTelefonoCliente(client?.contactPhone || '');
        setAtencionArea('Garantía extendida/Contrato');
        setHoraInicio('08:00');
        setHoraFin('16:00');
        setEstadoInicio('Operativo');
        setEstadoFin('Operativo');
        
        setEquipoMarca('GENERAL ELECTRIC');
        setEquipoModelo('');
        setEquipoSerie('');
        setEquipoSoftware('');
        
        setMotivoVisita(task?.notes || (task?.type === 'Correctivo' ? 'Mantenimiento Correctivo' : 'Mantenimiento Preventivo'));
        setTrabajoRealizado('');
        setObservaciones('');
        
        setRequiredSpares([]);
        setPhotoGallery([]);
        setTechnicianCedula('');
        setClientCedula('');
        
        setSupportCedula('');
        
        // Find support technical name if any
        if (task) {
          const supportIds = task.supportEngineerIds && task.supportEngineerIds.length > 0
            ? task.supportEngineerIds
            : (task.supportEngineerId ? [task.supportEngineerId] : []);
          if (supportIds.length > 0) {
            const supportNames = supportIds.map(id => engineers.find(e => e.id === id)?.name || '').filter(Boolean);
            setSupportSignee(supportNames.join(', '));
          } else {
            setSupportSignee('');
          }
        } else {
          setSupportSignee('');
        }
        
        setHasSignedClient(false);
        setHasSignedTech(false);
        setHasSignedSupport(false);
      }
    }
  }, [selectedWOId, isCompilingReport]);

  // Client signature drawing handlers
  const startClientDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!clientCanvasRef.current) return;
    const canvas = clientCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawingClient(true);
    setHasSignedClient(true);
  };
  const drawClient = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingClient || !clientCanvasRef.current) return;
    const canvas = clientCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };
  const stopClientDrawing = () => setIsDrawingClient(false);
  const clearClientSignature = () => {
    if (clientCanvasRef.current) {
      const ctx = clientCanvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, clientCanvasRef.current.width, clientCanvasRef.current.height);
      setHasSignedClient(false);
    }
  };

  // Technician signature drawing handlers
  const startTechDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!techCanvasRef.current) return;
    const canvas = techCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawingTech(true);
    setHasSignedTech(true);
  };
  const drawTech = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingTech || !techCanvasRef.current) return;
    const canvas = techCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };
  const stopTechDrawing = () => setIsDrawingTech(false);
  const clearTechSignature = () => {
    if (techCanvasRef.current) {
      const ctx = techCanvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, techCanvasRef.current.width, techCanvasRef.current.height);
      setHasSignedTech(false);
    }
  };

  // Support signature drawing handlers
  const startSupportDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!supportCanvasRef.current) return;
    const canvas = supportCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawingSupport(true);
    setHasSignedSupport(true);
  };
  const drawSupport = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingSupport || !supportCanvasRef.current) return;
    const canvas = supportCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };
  const stopSupportDrawing = () => setIsDrawingSupport(false);
  const clearSupportSignature = () => {
    if (supportCanvasRef.current) {
      const ctx = supportCanvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, supportCanvasRef.current.width, supportCanvasRef.current.height);
      setHasSignedSupport(false);
    }
  };

  // Photo handlers
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files) as File[];
    const remainingSlots = 5 - photoGallery.length;
    const filesToProcess = files.slice(0, remainingSlots);
    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoGallery(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };
  const handleRemovePhoto = (idx: number) => {
    setPhotoGallery(prev => prev.filter((_, i) => i !== idx));
  };

  // Required spares handlers
  const handleAddRequiredSpare = (item: string, qty: number) => {
    if (!item.trim() || qty <= 0) return;
    const existing = requiredSpares.find(s => s.item.toLowerCase() === item.trim().toLowerCase());
    if (existing) {
      setRequiredSpares(requiredSpares.map(s => s.item.toLowerCase() === item.trim().toLowerCase() ? { ...s, qty: s.qty + qty } : s));
    } else {
      setRequiredSpares([...requiredSpares, { item: item.trim(), qty }]);
    }
  };
  const handleRemoveRequiredSpare = (item: string) => {
    setRequiredSpares(requiredSpares.filter(s => s.item !== item));
  };

  const handleAddMaterial = (item: string) => {
    const existing = selectedMaterials.find(m => m.item === item);
    if (existing) {
      setSelectedMaterials(selectedMaterials.map(m => m.item === item ? { ...m, qty: m.qty + 1 } : m));
    } else {
      setSelectedMaterials([...selectedMaterials, { item, qty: 1 }]);
    }
  };

  const handleRemoveMaterial = (item: string) => {
    const existing = selectedMaterials.find(m => m.item === item);
    if (existing) {
      if (existing.qty === 1) {
        setSelectedMaterials(selectedMaterials.filter(m => m.item !== item));
      } else {
        setSelectedMaterials(selectedMaterials.map(m => m.item === item ? { ...m, qty: m.qty - 1 } : m));
      }
    }
  };

  const getSparesForEngineer = (): string[] => {
    if (!activeEngineer) return COMMON_SPARES.default;
    return COMMON_SPARES[activeEngineer.specialty] || COMMON_SPARES.default;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWOId || !findings || !actions || !clientSignee) return;

    let clientSig = '';
    if (clientCanvasRef.current && hasSignedClient) {
      clientSig = clientCanvasRef.current.toDataURL();
    } else {
      const existingReport = reports.find(r => r.workOrderId === selectedWOId);
      clientSig = existingReport?.clientSignatureData || '';
    }

    let techSig = '';
    if (techCanvasRef.current && hasSignedTech) {
      techSig = techCanvasRef.current.toDataURL();
    } else {
      const existingReport = reports.find(r => r.workOrderId === selectedWOId);
      techSig = existingReport?.technicianSignatureData || '';
    }

    let supportSig = '';
    if (supportCanvasRef.current && hasSignedSupport) {
      supportSig = supportCanvasRef.current.toDataURL();
    } else {
      const existingReport = reports.find(r => r.workOrderId === selectedWOId);
      supportSig = existingReport?.supportTechnicianSignature || '';
    }

    const report: TechnicalReport = {
      id: `REP-${selectedWOId}`,
      workOrderId: selectedWOId,
      executionDate: new Date().toISOString().split('T')[0],
      hoursSpent: hours,
      technicalFindings: findings,
      actionsTaken: actions,
      materialsUsed: selectedMaterials,
      nextRecommendations: observaciones || 'Mantenimiento preventivo completado con éxito.',
      technicianSignature: activeEngineer?.name || 'Ingeniero Soporte',
      clientSignatureName: clientSignee,
      clientSignatureData: clientSig,
      validationState: 'pendiente',

      // RE-TE-04 fields
      numRegistro,
      correoCliente,
      telefonoCliente,
      atencionArea,
      horaInicio,
      horaFin,
      estadoInicio,
      estadoFin,
      equipoMarca,
      equipoModelo,
      equipoSerie,
      equipoSoftware,
      motivoVisita,
      trabajoRealizado: actions,
      observaciones,
      repuestosRequeridos: requiredSpares,
      registroFotografico: photoGallery,
      technicianCedula,
      clientCedula,
      supportTechnicianName: supportSignee,
      supportTechnicianCedula: supportCedula,
      supportTechnicianSignature: supportSig
    };

    onSubmitTechnicalReport(report);
    onUpdateWorkOrderStatus(selectedWOId, 'Reportado');
    setIsCompilingReport(false);
    setSelectedWOId(null);
  };

  const renderRETE04Report = (report: TechnicalReport, task: WorkOrder) => {
    const client = clients.find(c => c.id === task.clientId);
    const eng = engineers.find(e => e.id === task.engineerId);
    
    const handlePrintReport = () => {
      const style = document.createElement('style');
      style.innerHTML = `
        @media print {
          @page {
            size: portrait !important;
            margin: 6mm 8mm !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .no-print, header, footer, button, nav, #root > :not(.printable-report-card), #engineer-portal-root > :not(#rete04-printable-area) {
            display: none !important;
          }
          #rete04-printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }
          .printable-report-card {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
          }
        }
      `;
      document.head.appendChild(style);
      window.print();
      document.head.removeChild(style);
    };

    return (
      <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh]">
          {/* Modal Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl font-sans shrink-0">
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Reporte Técnico Oficial de Asistencia (RE-TE-04)</h4>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePrintReport}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-3 rounded-lg text-3xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              >
                Imprimir / PDF
              </button>
              <button
                type="button"
                onClick={() => setIsViewingRETE04(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-1.5 px-3 rounded-lg text-3xs cursor-pointer transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto flex-1 bg-slate-100" id="rete04-printable-area">
            <div className="printable-report-card bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm font-sans text-slate-800 max-w-[800px] mx-auto text-[10px] leading-relaxed">
              
              {/* 1. Header Table */}
              <div className="border border-slate-400 grid grid-cols-12 text-center items-center mb-4">
                <div className="col-span-4 border-r border-slate-400 p-2 flex flex-col items-center justify-center min-h-[55px]">
                  <span className="font-extrabold text-blue-900 text-sm tracking-tight">ORIMEC</span>
                  <span className="text-[6px] text-slate-500 uppercase tracking-widest -mt-1 font-bold">Oriental Medical del Ecuador C.A.</span>
                </div>
                <div className="col-span-5 border-r border-slate-400 p-1 flex flex-col justify-center min-h-[55px]">
                  <span className="font-extrabold uppercase text-[8px] text-slate-500">Soporte y Servicio Técnico</span>
                  <span className="font-extrabold uppercase text-[9px] text-slate-800 border-t border-slate-350 pt-0.5 mt-0.5">Reporte de Asistencia Técnica</span>
                </div>
                <div className="col-span-3 p-2 flex flex-col justify-center min-h-[55px] font-mono">
                  <span className="font-bold text-[8.5px] text-slate-700">Código: RE-TE-04</span>
                </div>
              </div>

              {/* 2. Client & Equipment Tables */}
              <div className="grid grid-cols-12 border border-slate-400 mb-4">
                {/* Header Bar */}
                <div className="col-span-6 bg-[#002060] text-white font-extrabold text-center uppercase tracking-wide py-1 border-r border-slate-400 text-[8.5px]">
                  Datos Cliente
                </div>
                <div className="col-span-6 bg-[#002060] text-white font-extrabold text-center uppercase tracking-wide py-1 text-[8.5px]">
                  Datos Equipo
                </div>

                {/* Row 1 */}
                <div className="col-span-3 border-r border-b border-slate-400 p-1 font-bold bg-slate-50">Número Registro</div>
                <div className="col-span-3 border-r border-b border-slate-400 p-1 font-mono font-semibold">{report.numRegistro || `ORI-OTC-${task.id}`}</div>
                <div className="col-span-3 border-r border-b border-slate-400 p-1 font-bold bg-slate-50">Tipo</div>
                <div className="col-span-3 border-b border-slate-400 p-1 font-semibold">Mantenimiento {task.type}</div>

                {/* Row 2 */}
                <div className="col-span-3 border-r border-b border-slate-400 p-1 font-bold bg-slate-50">Cliente</div>
                <div className="col-span-3 border-r border-b border-slate-400 p-1 font-semibold">{client?.name}</div>
                <div className="col-span-3 border-r border-b border-slate-400 p-1 font-bold bg-slate-50">Marca</div>
                <div className="col-span-3 border-b border-slate-400 p-1 font-semibold">{report.equipoMarca || 'GENERAL ELECTRIC'}</div>

                {/* Row 3 */}
                <div className="col-span-3 border-r border-b border-slate-400 p-1 font-bold bg-slate-50">Dirección/ciudad</div>
                <div className="col-span-3 border-r border-b border-slate-400 p-1 truncate" title={client?.address}>{client?.address}</div>
                <div className="col-span-3 border-r border-b border-slate-400 p-1 font-bold bg-slate-50">Modelo</div>
                <div className="col-span-3 border-b border-slate-400 p-1 font-semibold">{report.equipoModelo || '-'}</div>

                {/* Row 4 */}
                <div className="col-span-3 border-r border-b border-slate-400 p-1 font-bold bg-slate-50">Correo Electrónico</div>
                <div className="col-span-3 border-r border-b border-slate-400 p-1 truncate" title={report.correoCliente}>{report.correoCliente || '-'}</div>
                <div className="col-span-3 border-r border-b border-slate-400 p-1 font-bold bg-slate-50">No. serie</div>
                <div className="col-span-3 border-b border-slate-400 p-1 font-mono font-semibold">{report.equipoSerie || '-'}</div>

                {/* Row 5 */}
                <div className="col-span-3 border-r border-b border-slate-400 p-1 font-bold bg-slate-50">Teléfono</div>
                <div className="col-span-3 border-r border-b border-slate-400 p-1">{report.telefonoCliente || client?.contactPhone || '-'}</div>
                <div className="col-span-3 border-r border-b border-slate-400 p-1 font-bold bg-slate-50">Versión SW</div>
                <div className="col-span-3 border-b border-slate-400 p-1 font-mono">{report.equipoSoftware || '-'}</div>

                {/* Row 6: Area / Date / Time */}
                <div className="col-span-2 border-r border-b border-slate-400 p-1 font-bold bg-slate-50">Atención por:</div>
                <div className="col-span-3 border-r border-b border-slate-400 p-1 text-[8px]">{report.atencionArea || 'Garantía extendida/Contrato'}</div>
                <div className="col-span-1 border-r border-b border-slate-400 p-1 font-bold bg-slate-50">Fecha</div>
                <div className="col-span-2 border-r border-b border-slate-400 p-1 font-mono">{report.executionDate ? report.executionDate.split('-').reverse().join('/') : ''}</div>
                <div className="col-span-1 border-r border-b border-slate-400 p-1 font-bold bg-slate-50">H. Inicio</div>
                <div className="col-span-1 border-r border-b border-slate-400 p-1 font-mono">{report.horaInicio || '08:00'}</div>
                <div className="col-span-1 border-r border-b border-slate-400 p-1 font-bold bg-slate-50">H. fin</div>
                <div className="col-span-1 border-b border-slate-400 p-1 font-mono">{report.horaFin || '16:00'}</div>

                {/* Row 7: Equipment Status & service area */}
                <div className="col-span-3 border-r border-slate-400 p-1 font-bold bg-slate-50">Estado al inicio</div>
                <div className="col-span-2 border-r border-slate-400 p-1 font-semibold text-center">{report.estadoInicio || 'Operativo'}</div>
                <div className="col-span-3 border-r border-slate-400 p-1 font-bold bg-slate-50">Estado al final</div>
                <div className="col-span-2 border-r border-slate-400 p-1 font-semibold text-center">{report.estadoFin || 'Operativo'}</div>
                <div className="col-span-1 border-r border-slate-400 p-1 font-bold bg-slate-50">Área</div>
                <div className="col-span-1 p-1 text-center font-bold text-[8.5px] truncate">{eng?.specialty?.split(' ')[0] || 'Ingeniería'}</div>
              </div>

              {/* 3. Motivo de la visita */}
              <div className="border border-slate-400 mb-4 overflow-hidden rounded-xs">
                <div className="bg-[#002060] text-white font-extrabold text-center uppercase tracking-wide py-1 text-[8.5px]">
                  Motivo de la visita
                </div>
                <div className="p-2.5 min-h-[35px] text-slate-700 whitespace-pre-wrap">
                  {report.motivoVisita || 'Mantenimiento Correctivo'}
                </div>
              </div>

              {/* 4. Trabajo Realizado */}
              <div className="border border-slate-400 mb-4 overflow-hidden rounded-xs">
                <div className="bg-[#002060] text-white font-extrabold text-center uppercase tracking-wide py-1 text-[8.5px]">
                  Trabajo Realizado
                </div>
                <div className="p-2.5 min-h-[80px] text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {report.trabajoRealizado || report.actionsTaken || '-'}
                </div>
              </div>

              {/* 5. Observaciones */}
              <div className="border border-slate-400 mb-4 overflow-hidden rounded-xs">
                <div className="bg-[#002060] text-white font-extrabold text-center uppercase tracking-wide py-1 text-[8.5px]">
                  Observaciones / Recomendaciones
                </div>
                <div className="p-2.5 min-h-[40px] text-slate-700 whitespace-pre-wrap">
                  {report.observaciones || report.nextRecommendations || '-'}
                </div>
              </div>

              {/* 6. Repuestos Utilizados */}
              <div className="border border-slate-400 mb-4 overflow-hidden rounded-xs">
                <div className="bg-[#002060] text-white font-extrabold text-center uppercase tracking-wide py-1 text-[8.5px]">
                  Repuestos Utilizados
                </div>
                <div className="grid grid-cols-12 font-bold text-center border-b border-slate-400 bg-slate-50 py-0.5 text-[8.5px]">
                  <div className="col-span-5 border-r border-slate-400">Detalle</div>
                  <div className="col-span-1 border-r border-slate-400">Cantidad</div>
                  <div className="col-span-5 border-r border-slate-400">Detalle</div>
                  <div className="col-span-1">Cantidad</div>
                </div>
                {/* Render split list */}
                {(() => {
                  const materials = report.materialsUsed || [];
                  const rowsCount = Math.max(3, Math.ceil(materials.length / 2));
                  const items: any[] = [];

                  for (let i = 0; i < rowsCount; i++) {
                    const leftItem = materials[i] || { item: '', qty: '' };
                    const rightItem = materials[i + rowsCount] || { item: '', qty: '' };
                    
                    items.push(
                      <div key={i} className="grid grid-cols-12 border-b border-slate-400 last:border-b-0 py-1 font-mono text-[8px] items-center">
                        <div className="col-span-5 px-2 truncate font-semibold text-slate-700">{leftItem.item || ' '}</div>
                        <div className="col-span-1 text-center border-r border-slate-400 font-bold">{leftItem.qty || ' '}</div>
                        <div className="col-span-5 px-2 truncate font-semibold text-slate-700">{rightItem.item || ' '}</div>
                        <div className="col-span-1 text-center font-bold">{rightItem.qty || ' '}</div>
                      </div>
                    );
                  }
                  return items;
                })()}
              </div>

              {/* 7. Repuestos Requeridos */}
              <div className="border border-slate-400 mb-4 overflow-hidden rounded-xs">
                <div className="bg-[#002060] text-white font-extrabold text-center uppercase tracking-wide py-1 text-[8.5px]">
                  Repuestos Requeridos
                </div>
                <div className="grid grid-cols-12 font-bold text-center border-b border-slate-400 bg-slate-50 py-0.5 text-[8.5px]">
                  <div className="col-span-5 border-r border-slate-400">Detalle</div>
                  <div className="col-span-1 border-r border-slate-400">Cantidad</div>
                  <div className="col-span-5 border-r border-slate-400">Detalle</div>
                  <div className="col-span-1">Cantidad</div>
                </div>
                {/* Render split list */}
                {(() => {
                  const reqs = report.repuestosRequeridos || [];
                  const rowsCount = Math.max(3, Math.ceil(reqs.length / 2));
                  const items: any[] = [];

                  for (let i = 0; i < rowsCount; i++) {
                    const leftItem = reqs[i] || { item: '', qty: '' };
                    const rightItem = reqs[i + rowsCount] || { item: '', qty: '' };
                    
                    items.push(
                      <div key={i} className="grid grid-cols-12 border-b border-slate-400 last:border-b-0 py-1 font-mono text-[8px] items-center">
                        <div className="col-span-5 px-2 truncate font-semibold text-slate-700">{leftItem.item || ' '}</div>
                        <div className="col-span-1 text-center border-r border-slate-400 font-bold">{leftItem.qty || ' '}</div>
                        <div className="col-span-5 px-2 truncate font-semibold text-slate-700">{rightItem.item || ' '}</div>
                        <div className="col-span-1 text-center font-bold">{rightItem.qty || ' '}</div>
                      </div>
                    );
                  }
                  return items;
                })()}
              </div>

              {/* 8. Registro Fotográfico */}
              <div className="border border-slate-400 mb-4 overflow-hidden rounded-xs page-break-inside-avoid break-inside-avoid">
                <div className="bg-[#002060] text-white font-extrabold text-center uppercase tracking-wide py-1 text-[8.5px]">
                  Registro Fotográfico
                </div>
                {report.registroFotografico && report.registroFotografico.length > 0 ? (
                  <div className="p-3 grid grid-cols-3 gap-3">
                    {report.registroFotografico.map((img, idx) => (
                      <div key={idx} className="border border-slate-300 rounded-lg overflow-hidden bg-slate-50 flex flex-col items-center">
                        <div className="bg-slate-200 text-slate-700 text-center font-bold text-[8px] w-full border-b border-slate-300 py-0.5">
                          Imagen Adjunta {idx+1}
                        </div>
                        <div className="aspect-video w-full flex items-center justify-center overflow-hidden">
                          <img src={img} className="w-full h-full object-cover" alt={`adjunto-${idx+1}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-slate-400 font-medium italic">
                    No se registraron imágenes fotográficas para este servicio.
                  </div>
                )}
              </div>

              {/* 9. Signatures Block */}
              <div className="border border-slate-400 grid grid-cols-12 text-center rounded-xs page-break-inside-avoid break-inside-avoid">
                <div className="col-span-6 bg-[#002060] text-white font-extrabold py-0.5 uppercase border-r border-slate-400 text-[8px]">
                  ORIMEC
                </div>
                <div className="col-span-6 bg-[#002060] text-white font-extrabold py-0.5 uppercase text-[8px]">
                  CLIENTE
                </div>

                {/* Signature Areas */}
                <div className="col-span-6 border-r border-slate-400 p-2 flex flex-col justify-between items-center min-h-[140px]">
                  <div className="w-full space-y-4">
                    {/* Técnico principal */}
                    <div className="flex flex-col items-center">
                      <div className="w-[180px] h-[55px] border-b border-slate-300 flex items-center justify-center mb-1 bg-slate-50/50">
                        {report.technicianSignatureData ? (
                          <img src={report.technicianSignatureData} className="max-h-full object-contain" alt="firma-tech" />
                        ) : (
                          <span className="font-serif italic text-slate-400 font-extrabold text-[12px]">{report.technicianSignature}</span>
                        )}
                      </div>
                      <span className="font-extrabold text-slate-800 uppercase tracking-tight text-[8px]">Nombre: {report.technicianSignature}</span>
                      <span className="text-slate-550 text-[8px] font-mono">Cédula: {report.technicianCedula || '-'}</span>
                    </div>

                    {/* Técnico de apoyo si aplica */}
                    {report.supportTechnicianName && (
                      <div className="flex flex-col items-center border-t border-dashed border-slate-200 pt-2 w-full">
                        <div className="w-[180px] h-[55px] border-b border-slate-300 flex items-center justify-center mb-1 bg-slate-50/50">
                          {report.supportTechnicianSignature ? (
                            <img src={report.supportTechnicianSignature} className="max-h-full object-contain" alt="firma-support" />
                          ) : (
                            <span className="text-slate-400 text-4xs italic">Firma en físico o sin registro digital</span>
                          )}
                        </div>
                        <span className="font-extrabold text-slate-800 uppercase tracking-tight text-[8px]">Nombre: {report.supportTechnicianName}</span>
                        <span className="text-slate-550 text-[8px] font-mono">Cédula: {report.supportTechnicianCedula || '-'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-span-6 p-2 flex flex-col justify-between items-center min-h-[140px]">
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-[180px] h-[75px] border-b border-slate-300 flex items-center justify-center mb-1 bg-slate-50/50">
                      {report.clientSignatureData ? (
                        <img src={report.clientSignatureData} className="max-h-full object-contain" alt="firma-cliente" />
                      ) : (
                        <span className="text-slate-400 text-4xs italic font-medium">Sin firma registrada</span>
                      )}
                    </div>
                    <span className="font-extrabold text-slate-800 uppercase tracking-tight text-[8px]">Nombre: {report.clientSignatureName}</span>
                    <span className="text-slate-550 text-[8px] font-mono">Cédula: {report.clientCedula || '-'}</span>
                    <span className="text-slate-450 text-[8px] uppercase tracking-wider font-extrabold mt-1">Firma del Cliente</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto" id="engineer-portal-root">
      <div className="bg-slate-100 rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[70vh] relative">
        {/* Core app body */}
        <div className="flex-1 flex flex-col justify-between text-xs leading-normal pt-2">
          {/* Top view manager */}
          <div className="flex-1 flex flex-col justify-between p-4 md:p-6 pb-12">
              <AnimatePresence mode="wait">
                
                {/* 1. Main schedule list view */}
                {!selectedWOId && (
                  <motion.div
                    key="task-list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {/* App Bar / Header inside card */}
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3 mt-2 flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div 
                          onClick={() => setIsProfileOpen(true)}
                          className="relative cursor-pointer hover:opacity-85 transition-opacity"
                          title="Ver Perfil y Cambiar Configuración/Tema"
                        >
                          {activeEngineer?.avatar ? (
                            <img src={activeEngineer.avatar} className="w-8 h-8 rounded-full object-cover border border-slate-300" alt={activeEngineer.name} />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-650 flex items-center justify-center font-bold text-xs border border-slate-300 uppercase">
                              {activeEngineer?.name ? activeEngineer.name.replace('Ing. ', '').substring(0, 2) : 'U'}
                            </div>
                          )}
                          {!lockedEngineerId && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white animate-pulse"></span>}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Técnico:</span>
                            {lockedEngineerId ? (
                              <span className="font-bold text-slate-800 text-xs pl-1">
                                {activeEngineer?.name}
                              </span>
                            ) : (
                              <select
                                value={activeEngineerId}
                                onChange={(e) => {
                                  setActiveEngineerId(e.target.value);
                                  setSelectedWOId(null);
                                  setIsCompilingReport(false);
                                }}
                                className="font-bold text-slate-800 text-xs bg-transparent border-none py-0 pl-1 pr-6 focus:ring-0 focus:outline-hidden cursor-pointer"
                              >
                                {engineers.map(e => (
                                  <option key={e.id} value={e.id}>{e.name}</option>
                                ))}
                              </select>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleManualSync(); }}
                            disabled={isSyncing}
                            className="flex items-center gap-1 text-[8px] text-emerald-600 hover:text-emerald-700 font-bold uppercase tracking-wider cursor-pointer mt-0.5"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${isSyncing ? 'animate-ping' : ''}`}></span>
                            <span>{isSyncing ? 'Sincronizando...' : 'En Línea • Sincronizar'}</span>
                            <RefreshCw className={`w-2.5 h-2.5 text-emerald-600 shrink-0 ml-0.5 ${isSyncing ? 'animate-spin' : ''}`} />
                          </button>
                        </div>
                      </div>
                      <span className={`font-bold text-4xs px-2 py-0.5 rounded-full uppercase truncate max-w-[120px] ${themeClasses.pill} ${themeClasses.border} border`}>
                        {activeEngineer?.specialty?.split(' ')[0] || 'Soporte'}
                      </span>
                    </div>

                    {/* View Switcher: Día / Semana */}
                    <div className="flex p-0.5 bg-slate-200/60 rounded-lg border border-slate-300/40 text-[9px] font-bold">
                      <button
                        type="button"
                        onClick={() => setViewMode('day')}
                        className={`flex-1 py-1 rounded-md text-center cursor-pointer transition-all ${
                          viewMode === 'day' 
                            ? themeClasses.activeTab 
                            : 'text-slate-500 hover:text-slate-805'
                        }`}
                      >
                        Vista Diaria
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('week')}
                        className={`flex-1 py-1 rounded-md text-center cursor-pointer transition-all ${
                          viewMode === 'week' 
                            ? themeClasses.activeTab 
                            : 'text-slate-500 hover:text-slate-805'
                        }`}
                      >
                        Vista Semanal
                      </button>
                    </div>

                    {/* Toast notification inline in phone */}
                    {syncNotification && (
                      <div className={`${themeClasses.bg} text-white p-2 rounded-lg text-[9px] font-bold text-center shadow-md animate-bounce`}>
                        {syncNotification}
                      </div>
                    )}

                    {/* Horizontal Day Selector Carousel inside Phone */}
                    {viewMode === 'day' && (
                      <div className="space-y-1.5 bg-slate-50 border border-slate-205 rounded-xl p-2.5 mx-0.5 shadow-3xs animate-fadeIn">
                        <div className="flex justify-between items-center px-0.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (selectedMonth === 1) {
                                  setSelectedMonth(12);
                                  setSelectedYear(selectedYear - 1);
                                } else {
                                  setSelectedMonth(selectedMonth - 1);
                                }
                              }}
                              className="w-4 h-4 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-[8px] cursor-pointer"
                              title="Mes Anterior"
                            >
                              ◀
                            </button>
                            <span className={`text-[9px] font-extrabold ${themeClasses.textColor} uppercase tracking-wide min-w-[75px] text-center`}>
                              {monthsList[selectedMonth - 1] || 'Mes'} {selectedYear}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (selectedMonth === 12) {
                                  setSelectedMonth(1);
                                  setSelectedYear(selectedYear + 1);
                                } else {
                                  setSelectedMonth(selectedMonth + 1);
                                }
                              }}
                              className="w-4 h-4 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-[8px] cursor-pointer"
                              title="Mes Siguiente"
                            >
                              ▶
                            </button>
                          </div>
                          
                          {/* Quick Date Picker Button */}
                          <div className="relative flex items-center">
                            <label className="cursor-pointer bg-white border border-slate-200 hover:bg-slate-50 p-1 rounded-md text-[8px] font-bold text-slate-600 flex items-center gap-1 shadow-3xs" title="Seleccionar Fecha Rápida">
                              📅 <span className="text-[7.5px] uppercase">Selector</span>
                              <input
                                type="date"
                                value={`${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${selectedDay.toString().padStart(2, '0')}`}
                                onChange={(e) => {
                                  if (e.target.value) {
                                    const parts = e.target.value.split('-');
                                    if (parts.length === 3) {
                                      setSelectedYear(Number(parts[0]));
                                      setSelectedMonth(Number(parts[1]));
                                      setSelectedDay(Number(parts[2]));
                                    }
                                  }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                            </label>
                          </div>
                        </div>
                        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x" style={{ scrollbarWidth: 'none' }}>
                          {Array.from({ length: new Date(selectedYear, selectedMonth, 0).getDate() }, (_, i) => i + 1).map(dayNum => {
                            const isSel = selectedDay === dayNum;
                            const dStr = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
                            const hasTasks = workOrders.some(wo => {
                               if (
                                 wo.engineerId !== activeEngineerId && 
                                 wo.supportEngineerId !== activeEngineerId && 
                                 !wo.supportEngineerIds?.includes(activeEngineerId)
                               ) return false;
                               if (!wo.durationDays || wo.durationDays <= 1) {
                                 return wo.plannedDate === dStr;
                               }
                               const start = new Date(wo.plannedDate + 'T00:00:00');
                               const target = new Date(dStr + 'T00:00:00');
                               const end = new Date(start);
                               end.setDate(start.getDate() + (wo.durationDays - 1));
                               return target >= start && target <= end;
                             });
                            return (
                              <button
                                key={dayNum}
                                type="button"
                                onClick={() => {
                                  setSelectedDay(dayNum);
                                  setSelectedWOId(null);
                                  setIsCompilingReport(false);
                                }}
                                className={`flex-none w-8 h-8 rounded-lg flex flex-col justify-center items-center font-bold tracking-tight text-3xs transition-all relative snap-start cursor-pointer border focus:outline-hidden ${
                                  isSel 
                                    ? `${themeClasses.bg} border-slate-800 text-white shadow-xs scale-[1.02] focus:ring-2 ${themeClasses.ring}` 
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-105 focus:ring-2 focus:ring-slate-350/20'
                                }`}
                              >
                                <span className="text-[9px]">{dayNum}</span>
                                {hasTasks && (
                                  <span className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full ${isSel ? 'bg-amber-400' : themeClasses.dot}`}></span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {viewMode === 'day' ? (
                      <>
                        <div className="flex justify-between items-center pl-1 mt-2 border-b border-slate-100 pb-1">
                          <h3 className="font-extrabold text-slate-750 text-[10px] uppercase tracking-wider">
                            📋 Agenda: {targetDateStr.split('-').reverse().join('/')}
                          </h3>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const d = new Date(selectedYear, selectedMonth - 1, selectedDay);
                                d.setDate(d.getDate() - 1);
                                setSelectedYear(d.getFullYear());
                                setSelectedMonth(d.getMonth() + 1);
                                setSelectedDay(d.getDate());
                              }}
                              className="w-4.5 h-4.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-750 flex items-center justify-center font-bold text-[8.5px] cursor-pointer"
                              title="Día Anterior"
                            >
                              ◀
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const d = new Date(selectedYear, selectedMonth - 1, selectedDay);
                                d.setDate(d.getDate() + 1);
                                setSelectedYear(d.getFullYear());
                                setSelectedMonth(d.getMonth() + 1);
                                setSelectedDay(d.getDate());
                              }}
                              className="w-4.5 h-4.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-750 flex items-center justify-center font-bold text-[8.5px] cursor-pointer"
                              title="Día Siguiente"
                            >
                              ▶
                            </button>
                          </div>
                        </div>

                        {assignedOrders.length === 0 ? (
                          <div className="bg-white rounded-2xl border border-slate-150 p-7 text-center space-y-2">
                            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                            <h4 className="font-extrabold text-slate-700 text-xs">Día Despejado</h4>
                            <p className="text-[10px] text-slate-400 font-medium leading-normal">
                              No tienes servicios programados para esta fecha. Selecciona otro día en el carrusel de arriba.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {assignedOrders.map(wo => {
                              const client = clients.find(c => c.id === wo.clientId);
                              
                              let cardStatusColor = 'border-l-yellow-400 bg-white';
                              let badgeStyle = 'bg-yellow-50 text-yellow-700';
                              if (wo.isEquipmentDown) {
                                cardStatusColor = 'border-l-red-500 bg-red-50/20';
                                badgeStyle = 'bg-red-500 text-white';
                              } else if (wo.status === 'En Proceso') {
                                cardStatusColor = 'border-l-sky-505 bg-sky-50/20';
                                badgeStyle = 'bg-sky-500 text-white';
                              }
                              if (!wo.isEquipmentDown && wo.status === 'Realizado') {
                                cardStatusColor = 'border-l-blue-550 bg-blue-50/10';
                                badgeStyle = 'bg-blue-100 text-blue-700';
                              }
                              if (!wo.isEquipmentDown && wo.status === 'Reportado') {
                                cardStatusColor = 'border-l-indigo-605 bg-indigo-50/10';
                                badgeStyle = 'bg-indigo-100 text-indigo-700';
                              }
                              if (!wo.isEquipmentDown && wo.status === 'Conciliado') {
                                cardStatusColor = 'border-l-emerald-500 bg-emerald-50/10';
                                badgeStyle = 'bg-emerald-100 text-emerald-700';
                              }

                              return (
                                <div
                                  key={wo.id}
                                  id={`mobile-task-card-${wo.id}`}
                                  onClick={() => {
                                    setSelectedWOId(wo.id);
                                    setIsCompilingReport(false);
                                  }}
                                  className={`w-full text-left p-3.5 rounded-xl border border-slate-200 border-l-4 shadow-2xs transition-all hover:scale-[1.01] ${cardStatusColor} cursor-pointer`}
                                >
                                  <div className="flex justify-between items-center mb-1.5">
                                    <span className="font-mono font-bold text-slate-405 text-3xs">{wo.id}</span>
                                    <div className="flex items-center gap-1.5">
                                      {(wo.supportEngineerId === activeEngineerId || wo.supportEngineerIds?.includes(activeEngineerId)) && (
                                        <span className="bg-sky-100 text-sky-800 border border-sky-200 text-[8px] font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                                          Apoyo 👥
                                        </span>
                                      )}
                                      <span className={`text-4xs font-bold uppercase rounded px-1.5 py-0.5 ${badgeStyle}`}>
                                        {wo.isEquipmentDown ? 'Parado ⚠️' : wo.status}
                                      </span>
                                    </div>
                                  </div>
                                  <h4 className="font-bold text-slate-800 text-[11px] leading-snug">
                                    {wo.plannedTime && <span className={`${themeClasses.textColor} mr-1`}>[{wo.plannedTime}]</span>}
                                    {client?.name}
                                  </h4>
                                  <p className="text-slate-600 text-3xs mt-1 truncate font-medium">{wo.equipmentName}</p>
                                  
                                  <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100 text-4xs text-slate-405 justify-between">
                                    <div className="flex items-center gap-1 truncate max-w-[140px]">
                                      <Navigation className={`w-3 h-3 ${themeClasses.text} shrink-0`} />
                                      <span className="truncate">{client?.address}</span>
                                    </div>
                                    {(wo.status === 'Pendiente' || wo.status === 'En Proceso') && (
                                      <button
                                        type="button"
                                        id={`btn-express-sync-${wo.id}`}
                                        onClick={(e) => {
                                          e.stopPropagation(); // Prevents loading card details
                                          handleQuickConciliation(wo.id);
                                        }}
                                        className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold px-2 py-1 rounded-[4px] uppercase text-[7.5px] tracking-wide flex items-center gap-0.5 cursor-pointer shadow-3xs shrink-0"
                                        title="Auto-Conciliar con Reporte Técnico Express"
                                      >
                                        <Check className="w-2 h-2 text-white" />
                                        <span>Entrega Rápida</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-center pl-1 mt-2 border-b border-slate-200 pb-1.5 animate-fadeIn">
                          <h3 className="font-extrabold text-slate-750 text-[10px] uppercase tracking-wider">
                            📋 Agenda Semanal
                          </h3>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const currentDate = new Date(selectedYear, selectedMonth - 1, selectedDay);
                                currentDate.setDate(currentDate.getDate() - 7);
                                setSelectedYear(currentDate.getFullYear());
                                setSelectedMonth(currentDate.getMonth() + 1);
                                setSelectedDay(currentDate.getDate());
                              }}
                              className="w-4 h-4 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-[8px] cursor-pointer"
                              title="Semana Anterior"
                            >
                              ◀
                            </button>
                            <span className="text-slate-700 font-mono text-[8px] font-bold bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-3xs min-w-[70px] text-center">
                              {weekDates[0].dayNum} {monthsList[weekDates[0].monthNum - 1]?.substring(0,3)} - {weekDates[6].dayNum} {monthsList[weekDates[6].monthNum - 1]?.substring(0,3)}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const currentDate = new Date(selectedYear, selectedMonth - 1, selectedDay);
                                currentDate.setDate(currentDate.getDate() + 7);
                                setSelectedYear(currentDate.getFullYear());
                                setSelectedMonth(currentDate.getMonth() + 1);
                                setSelectedDay(currentDate.getDate());
                              }}
                              className="w-4 h-4 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-[8px] cursor-pointer"
                              title="Semana Siguiente"
                            >
                              ▶
                            </button>
                            
                            {/* Quick Date Picker for Weekly View */}
                            <div className="relative flex items-center ml-0.5">
                              <label className="cursor-pointer bg-white border border-slate-200 hover:bg-slate-50 p-1 rounded-md text-[8px] font-bold text-slate-600 flex items-center gap-0.5 shadow-3xs" title="Seleccionar Fecha Rápida">
                                📅
                                <input
                                  type="date"
                                  value={`${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${selectedDay.toString().padStart(2, '0')}`}
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      const parts = e.target.value.split('-');
                                      if (parts.length === 3) {
                                        setSelectedYear(Number(parts[0]));
                                        setSelectedMonth(Number(parts[1]));
                                        setSelectedDay(Number(parts[2]));
                                      }
                                    }
                                  }}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                              </label>
                            </div>
                          </div>
                        </div>

                        {assignedOrdersForWeek.length === 0 ? (
                          <div className="bg-white rounded-2xl border border-slate-150 p-6 text-center space-y-2 animate-fadeIn">
                            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                            <h4 className="font-extrabold text-slate-700 text-xs">Semana Despejada</h4>
                            <p className="text-[10px] text-slate-450 font-medium leading-normal">
                              No tienes servicios programados para esta semana. Presiona el botón de **Sincronizar** arriba para autogenerar tu agenda.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4 animate-fadeIn">
                            {weekDates.map(wd => {
                              const dayOrders = assignedOrdersForWeek.filter(wo => {
                                if (!wo.durationDays || wo.durationDays <= 1) {
                                  return wo.plannedDate === wd.dateStr;
                                }
                                const start = new Date(wo.plannedDate + 'T00:00:00');
                                const target = new Date(wd.dateStr + 'T00:00:00');
                                const end = new Date(start);
                                end.setDate(start.getDate() + (wo.durationDays - 1));
                                return target >= start && target <= end;
                              });

                              if (dayOrders.length === 0) return null;

                              return (
                                <div key={wd.dateStr} className="space-y-1.5">
                                  <h4 className={`text-[9px] font-extrabold ${themeClasses.textColor} uppercase tracking-wide border-b border-slate-200 pb-0.5 flex justify-between px-1`}>
                                    <span>{wd.dayName}</span>
                                    <span className={`${themeClasses.bgText} font-mono text-[8px] px-1 rounded-sm`}>{wd.dayNum}</span>
                                  </h4>
                                  <div className="space-y-2">
                                    {dayOrders.map(wo => {
                                      const client = clients.find(c => c.id === wo.clientId);
                                      let cardStatusColor = 'border-l-yellow-400 bg-white';
                                      let badgeStyle = 'bg-yellow-50 text-yellow-700';
                                      if (wo.isEquipmentDown) {
                                        cardStatusColor = 'border-l-red-500 bg-red-50/20';
                                        badgeStyle = 'bg-red-500 text-white';
                                      } else if (wo.status === 'En Proceso') {
                                        cardStatusColor = 'border-l-sky-505 bg-sky-50/20';
                                        badgeStyle = 'bg-sky-500 text-white';
                                      }
                                      if (!wo.isEquipmentDown && wo.status === 'Realizado') {
                                        cardStatusColor = 'border-l-blue-550 bg-blue-50/10';
                                        badgeStyle = 'bg-blue-100 text-blue-700';
                                      }
                                      if (!wo.isEquipmentDown && wo.status === 'Reportado') {
                                        cardStatusColor = 'border-l-indigo-605 bg-indigo-50/10';
                                        badgeStyle = 'bg-indigo-100 text-indigo-700';
                                      }
                                      if (!wo.isEquipmentDown && wo.status === 'Conciliado') {
                                        cardStatusColor = 'border-l-emerald-500 bg-emerald-50/10';
                                        badgeStyle = 'bg-emerald-100 text-emerald-700';
                                      }

                                      return (
                                        <div
                                          key={wo.id}
                                          id={`mobile-task-card-${wo.id}`}
                                          onClick={() => {
                                            setSelectedWOId(wo.id);
                                            setIsCompilingReport(false);
                                          }}
                                          className={`w-full text-left p-3.5 rounded-xl border border-slate-200 border-l-4 shadow-3xs transition-all hover:scale-[1.01] ${cardStatusColor} cursor-pointer`}
                                        >
                                          <div className="flex justify-between items-center mb-1.5">
                                            <span className="font-mono font-bold text-slate-400 text-3xs">{wo.id}</span>
                                            <div className="flex items-center gap-1.5">
                                              {(wo.supportEngineerId === activeEngineerId || wo.supportEngineerIds?.includes(activeEngineerId)) && (
                                                <span className="bg-sky-100 text-sky-850 border border-sky-200 text-[7.5px] font-extrabold px-1.5 py-0.2 rounded-sm uppercase tracking-wide">
                                                  Apoyo 👥
                                                </span>
                                              )}
                                              <span className={`text-[7.5px] font-bold uppercase rounded px-1.5 py-0.2 ${badgeStyle}`}>
                                                {wo.isEquipmentDown ? 'Parado ⚠️' : wo.status}
                                              </span>
                                            </div>
                                          </div>
                                          <h4 className="font-bold text-slate-800 text-[10px] leading-snug">
                                            {wo.plannedTime && <span className={`${themeClasses.textColor} mr-1`}>[{wo.plannedTime}]</span>}
                                            {client?.name}
                                          </h4>
                                          <p className="text-slate-605 text-[9px] mt-0.5 truncate font-medium">{wo.equipmentName}</p>
                                          
                                          <div className="flex items-center gap-1 mt-1.5 pt-1.5 border-t border-slate-100 text-[8px] text-slate-450 justify-between">
                                            <div className="flex items-center gap-1 truncate max-w-[130px]">
                                              <Navigation className={`w-2.5 h-2.5 ${themeClasses.text} shrink-0`} />
                                              <span className="truncate">{client?.address}</span>
                                            </div>
                                            {(wo.status === 'Pendiente' || wo.status === 'En Proceso') && (
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleQuickConciliation(wo.id);
                                                }}
                                                className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold px-1.5 py-0.5 rounded-[3px] uppercase text-[7px] tracking-wide flex items-center gap-0.5 cursor-pointer shadow-3xs shrink-0"
                                                title="Auto-Conciliar con Reporte Técnico Express"
                                              >
                                                <Check className="w-2 h-2 text-white" />
                                                <span>Entrega Rápida</span>
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                )}
 
                {/* 2. Task Details view inside phone */}
                {selectedWOId && !isCompilingReport && (
                  (() => {
                    const task = workOrders.find(w => w.id === selectedWOId);
                    const client = clients.find(c => c.id === task?.clientId);
                    if (!task) return null;
 
                    return (
                      <motion.div
                        key="task-detail"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <button
                          id="btn-back-phone-list"
                          onClick={() => setSelectedWOId(null)}
                          className={`flex items-center gap-1 ${themeClasses.text} font-bold text-2xs mt-2`}
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Volver a la Agenda</span>
                        </button>
 
                        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-sm text-3xs">
                          {/* Banner */}
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="font-mono text-slate-400 font-bold">{task.id}</span>
                            <span className={`font-bold uppercase py-0.5 px-2 rounded-sm text-4xs ${
                              task.isEquipmentDown ? 'bg-red-500 text-white' : themeClasses.pill
                            }`}>
                              {task.isEquipmentDown ? 'Parado ⚠️' : task.status}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <p className="text-slate-400 font-bold uppercase 4xs">Cliente / Locación</p>
                            <h4 className="font-bold text-[11px] text-slate-800 leading-tight">{client?.name}</h4>
                            <p className="text-slate-500 leading-normal">{client?.address}</p>
                          </div>

                          <div className="space-y-1">
                            <p className="text-slate-400 font-bold uppercase 4xs">Equipo a Intervenir</p>
                            <p className={`font-bold ${themeClasses.textColor} font-mono text-2xs`}>{task.equipmentName}</p>
                            <span className="inline-block bg-slate-100 text-slate-700 font-bold rounded px-1.5 py-0.5 text-4xs uppercase mt-0.5 border border-slate-200">
                              Mantenimiento {task.type} {task.plannedTime ? `| Horario: ${task.plannedTime}` : ''}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <p className="text-slate-400 font-bold uppercase text-[8px]">Técnico Titular</p>
                            <p className="font-bold text-slate-700">
                              👤 {engineers.find(e => e.id === task.engineerId)?.name || 'Ingeniero Titular'}
                            </p>
                          </div>

                          {((task.supportEngineerId) || (task.supportEngineerIds && task.supportEngineerIds.length > 0)) && (
                            <div className="space-y-1">
                              <p className="text-slate-400 font-bold uppercase text-[8px]">Técnico(s) de Apoyo</p>
                              <div className="space-y-1">
                                {task.supportEngineerIds && task.supportEngineerIds.length > 0 ? (
                                  task.supportEngineerIds.map(id => {
                                    const eng = engineers.find(e => e.id === id);
                                    return eng ? (
                                      <p key={id} className="font-bold text-slate-750 flex items-center gap-1 pl-1">
                                        <span>👥</span>
                                        <span>{eng.name}</span>
                                      </p>
                                    ) : null;
                                  })
                                ) : (
                                  <p className="font-bold text-slate-750 flex items-center gap-1 pl-1">
                                    <span>👥</span>
                                    <span>{engineers.find(e => e.id === task.supportEngineerId)?.name}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            <p className="text-slate-400 font-bold uppercase 4xs">Notas Administrativas</p>
                            <p className="text-slate-600 font-medium italic">"{task.notes}"</p>
                          </div>

                          {/* Contact */}
                          <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                            <div>
                              <p className="text-slate-400">Contacto local:</p>
                              <p className="font-bold text-slate-700">{client?.contactName}</p>
                            </div>
                            <span className={`font-mono ${themeClasses.bgText} px-2 py-0.5 rounded-md`}>{client?.contactPhone.split(' ')[2]}</span>
                          </div>
                        </div>

                        {/* Interactive flow buttons */}
                        <div className="space-y-2 pt-2">
                          {task.status === 'Pendiente' && (
                            <button
                              id="btn-phone-start"
                              onClick={() => onUpdateWorkOrderStatus(task.id, 'En Proceso')}
                              className={`w-full ${themeClasses.bg} text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-xs cursor-pointer`}
                            >
                              <Play className="w-4 h-4 fill-current" />
                              <span>Iniciar Mantenimiento</span>
                            </button>
                          )}

                          {task.status === 'En Proceso' && (
                            <button
                              id="btn-phone-compile"
                              onClick={() => setIsCompilingReport(true)}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
                            >
                              <FileText className="w-4 h-4" />
                              <span>Levantar Reporte Técnico</span>
                            </button>
                          )}

                          {(task.status === 'Reportado' || task.status === 'Conciliado') && (
                            <div className="bg-emerald-50 border border-emerald-150 p-3.5 rounded-xl text-center space-y-1">
                              <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto" />
                              <h5 className="font-bold text-emerald-800 text-2xs">Reporte Enviado con Éxito</h5>
                              <p className="text-[10px] text-emerald-600">Este folio ya se encuentra en fase de validación administrativa.</p>
                              <button
                                type="button"
                                onClick={() => setIsViewingRETE04(true)}
                                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer text-3xs uppercase tracking-wide"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Ver Ficha RE-TE-04 / Imprimir</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })()
                )}

                {/* 3. Compilation Form inside phone */}
                {selectedWOId && isCompilingReport && (
                  (() => {
                    const task = workOrders.find(w => w.id === selectedWOId);
                    if (!task) return null;

                    return (
                      <motion.div
                        key="compile-form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4 text-3xs"
                      >
                        <button
                          id="btn-phone-back-to-details"
                          onClick={() => setIsCompilingReport(false)}
                          className="flex items-center gap-1 text-slate-500 font-bold text-2xs mt-2"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Volver a Detalles</span>
                        </button>

                        <div className="bg-slate-900 text-white p-3.5 rounded-xl flex items-center gap-2 border border-slate-800">
                          <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div>
                            <p className="font-bold text-[10px]">REPORTE DE CIERRE: {task.id}</p>
                            <p className="text-slate-400 text-4xs uppercase">Ficha técnica electrónica</p>
                          </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 text-[10px]">
                          {/* SECCIÓN 1: DATOS CLIENTE */}
                          <div className="space-y-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                            <h5 className="font-extrabold text-slate-800 border-b border-slate-200 pb-1 uppercase tracking-wider text-[8.5px]">
                              1. Datos del Cliente
                            </h5>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div className="space-y-0.5">
                                <label className="block text-4xs text-slate-400 uppercase font-bold">Número Registro</label>
                                <input
                                  type="text"
                                  required
                                  value={numRegistro}
                                  onChange={e => setNumRegistro(e.target.value)}
                                  className="w-full text-3xs p-1.5 rounded border border-slate-200 bg-white"
                                />
                              </div>
                              <div className="space-y-0.5">
                                <label className="block text-4xs text-slate-400 uppercase font-bold">Cliente</label>
                                <input
                                  type="text"
                                  disabled
                                  value={clients.find(c => c.id === task.clientId)?.name || 'Cliente'}
                                  className="w-full text-3xs p-1.5 rounded border border-slate-200 bg-slate-100 text-slate-500 font-semibold"
                                />
                              </div>
                              <div className="space-y-0.5">
                                <label className="block text-4xs text-slate-400 uppercase font-bold">Dirección / Ciudad</label>
                                <input
                                  type="text"
                                  disabled
                                  value={clients.find(c => c.id === task.clientId)?.address || ''}
                                  className="w-full text-3xs p-1.5 rounded border border-slate-200 bg-slate-100 text-slate-500"
                                />
                              </div>
                              <div className="space-y-0.5">
                                <label className="block text-4xs text-slate-400 uppercase font-bold">Correo Electrónico</label>
                                <input
                                  type="email"
                                  required
                                  value={correoCliente}
                                  onChange={e => setCorreoCliente(e.target.value)}
                                  placeholder="ejemplo@cliente.com"
                                  className="w-full text-3xs p-1.5 rounded border border-slate-200 bg-white"
                                />
                              </div>
                              <div className="space-y-0.5">
                                <label className="block text-4xs text-slate-400 uppercase font-bold">Teléfono de Contacto</label>
                                <input
                                  type="text"
                                  required
                                  value={telefonoCliente}
                                  onChange={e => setTelefonoCliente(e.target.value)}
                                  className="w-full text-3xs p-1.5 rounded border border-slate-200 bg-white"
                                />
                              </div>
                              <div className="space-y-0.5">
                                <label className="block text-4xs text-slate-400 uppercase font-bold">Atención por área de</label>
                                <select
                                  value={atencionArea}
                                  onChange={e => setAtencionArea(e.target.value as any)}
                                  className="w-full text-3xs p-1.5 rounded border border-slate-200 bg-white"
                                >
                                  <option value="Garantía extendida/Contrato">Garantía extendida/Contrato</option>
                                  <option value="Garantía de compra">Garantía de compra</option>
                                  <option value="Facturable">Facturable</option>
                                  <option value="Otro">Otro</option>
                                </select>
                              </div>
                              <div className="space-y-0.5">
                                <label className="block text-4xs text-slate-400 uppercase font-bold">Hora Inicio</label>
                                <input
                                  type="time"
                                  required
                                  value={horaInicio}
                                  onChange={e => setHoraInicio(e.target.value)}
                                  className="w-full text-3xs p-1.5 rounded border border-slate-200 bg-white font-mono"
                                />
                              </div>
                              <div className="space-y-0.5">
                                <label className="block text-4xs text-slate-400 uppercase font-bold">Hora Fin</label>
                                <input
                                  type="time"
                                  required
                                  value={horaFin}
                                  onChange={e => setHoraFin(e.target.value)}
                                  className="w-full text-3xs p-1.5 rounded border border-slate-200 bg-white font-mono"
                                />
                              </div>
                              <div className="space-y-0.5">
                                <label className="block text-4xs text-slate-400 uppercase font-bold">Equipo al inicio</label>
                                <div className="flex gap-2.5 mt-1">
                                  <label className="flex items-center gap-1 cursor-pointer">
                                    <input
                                      type="radio"
                                      name="estadoInicio"
                                      checked={estadoInicio === 'Operativo'}
                                      onChange={() => setEstadoInicio('Operativo')}
                                      className="cursor-pointer"
                                    />
                                    <span>Operativo</span>
                                  </label>
                                  <label className="flex items-center gap-1 cursor-pointer">
                                    <input
                                      type="radio"
                                      name="estadoInicio"
                                      checked={estadoInicio === 'No Operativo'}
                                      onChange={() => setEstadoInicio('No Operativo')}
                                      className="cursor-pointer"
                                    />
                                    <span>No Operativo</span>
                                  </label>
                                </div>
                              </div>
                              <div className="space-y-0.5">
                                <label className="block text-4xs text-slate-400 uppercase font-bold">Equipo al final</label>
                                <div className="flex gap-2.5 mt-1">
                                  <label className="flex items-center gap-1 cursor-pointer">
                                    <input
                                      type="radio"
                                      name="estadoFin"
                                      checked={estadoFin === 'Operativo'}
                                      onChange={() => setEstadoFin('Operativo')}
                                      className="cursor-pointer"
                                    />
                                    <span>Operativo</span>
                                  </label>
                                  <label className="flex items-center gap-1 cursor-pointer">
                                    <input
                                      type="radio"
                                      name="estadoFin"
                                      checked={estadoFin === 'No Operativo'}
                                      onChange={() => setEstadoFin('No Operativo')}
                                      className="cursor-pointer"
                                    />
                                    <span>No Operativo</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* SECCIÓN 2: DATOS EQUIPO */}
                          <div className="space-y-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                            <h5 className="font-extrabold text-slate-800 border-b border-slate-200 pb-1 uppercase tracking-wider text-[8.5px]">
                              2. Datos del Equipo
                            </h5>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-0.5">
                                <label className="block text-4xs text-slate-400 uppercase font-bold">Tipo de Equipo</label>
                                <input
                                  type="text"
                                  disabled
                                  value={task.equipmentName}
                                  className="w-full text-3xs p-1.5 rounded border border-slate-200 bg-slate-100 text-slate-500 font-semibold"
                                />
                              </div>
                              <div className="space-y-0.5">
                                <label className="block text-4xs text-slate-400 uppercase font-bold">Tipo Servicio</label>
                                <input
                                  type="text"
                                  disabled
                                  value={`Mantenimiento ${task.type}`}
                                  className="w-full text-3xs p-1.5 rounded border border-slate-200 bg-slate-100 text-slate-500"
                                />
                              </div>
                              <div className="space-y-0.5">
                                <label className="block text-4xs text-slate-400 uppercase font-bold">Marca</label>
                                <input
                                  type="text"
                                  required
                                  value={equipoMarca}
                                  onChange={e => setEquipoMarca(e.target.value)}
                                  className="w-full text-3xs p-1.5 rounded border border-slate-200 bg-white"
                                />
                              </div>
                              <div className="space-y-0.5">
                                <label className="block text-4xs text-slate-400 uppercase font-bold">Modelo</label>
                                <input
                                  type="text"
                                  required
                                  value={equipoModelo}
                                  onChange={e => setEquipoModelo(e.target.value)}
                                  className="w-full text-3xs p-1.5 rounded border border-slate-200 bg-white font-mono"
                                />
                              </div>
                              <div className="space-y-0.5">
                                <label className="block text-4xs text-slate-400 uppercase font-bold">Número de Serie</label>
                                <input
                                  type="text"
                                  required
                                  value={equipoSerie}
                                  onChange={e => setEquipoSerie(e.target.value)}
                                  placeholder="Ej: CZC14566G2"
                                  className="w-full text-3xs p-1.5 rounded border border-slate-200 bg-white font-mono"
                                />
                              </div>
                              <div className="space-y-0.5">
                                <label className="block text-4xs text-slate-400 uppercase font-bold">Versión Software</label>
                                <input
                                  type="text"
                                  value={equipoSoftware}
                                  onChange={e => setEquipoSoftware(e.target.value)}
                                  placeholder="Opcional"
                                  className="w-full text-3xs p-1.5 rounded border border-slate-200 bg-white font-mono"
                                />
                              </div>
                            </div>
                          </div>

                          {/* SECCIÓN 3: TEXTOS DE INFORME */}
                          <div className="space-y-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                            <h5 className="font-extrabold text-slate-800 border-b border-slate-200 pb-1 uppercase tracking-wider text-[8.5px]">
                              3. Reporte de Actividades
                            </h5>
                            
                            <div className="space-y-1">
                              <label className="block font-bold text-slate-500 uppercase tracking-wide">Motivo de la Visita</label>
                              <textarea
                                required
                                rows={2}
                                value={motivoVisita}
                                onChange={e => setMotivoVisita(e.target.value)}
                                className="w-full text-3xs p-2 rounded-lg border border-slate-200 bg-white"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block font-bold text-slate-500 uppercase tracking-wide">Hallazgos Técnicos Iniciales</label>
                              <textarea
                                required
                                rows={2}
                                value={findings}
                                onChange={e => setFindings(e.target.value)}
                                placeholder="Ej: Se observa polea desgastada, presión de succión por debajo del rango nominal..."
                                className="w-full text-3xs p-2 rounded-lg border border-slate-200 bg-white"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block font-bold text-slate-500 uppercase tracking-wide">Trabajo Realizado / Acciones Ejecutadas</label>
                              <textarea
                                required
                                rows={3}
                                value={actions}
                                onChange={e => setActions(e.target.value)}
                                placeholder="Ej: Se reapretaron bornes, limpieza de condensadoras y recarga de 1.5kg de Gas R410a"
                                className="w-full text-3xs p-2 rounded-lg border border-slate-200 bg-white"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="block font-bold text-slate-500 uppercase tracking-wide">Observaciones / Próximos Pasos</label>
                              <textarea
                                required
                                rows={2}
                                value={observaciones}
                                onChange={e => setObservaciones(e.target.value)}
                                placeholder="Ej: Se requiere trabajo adicional para evaluar falla de cristal. Próxima revisión programada..."
                                className="w-full text-3xs p-2 rounded-lg border border-slate-200 bg-white"
                              />
                            </div>
                          </div>

                          {/* SECCIÓN 4: REPUESTOS UTILIZADOS */}
                          <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                            <label className="block font-bold text-slate-500 uppercase tracking-wide">Repuestos Utilizados</label>
                            <p className="text-slate-400 text-4xs mb-2">Haz clic para agregar consumibles del kit:</p>
                            
                            <div className="flex flex-wrap gap-1 mb-2">
                              {getSparesForEngineer().map(sp => {
                                const isAdded = selectedMaterials.some(m => m.item === sp);
                                return (
                                  <button
                                    key={sp}
                                    type="button"
                                    id={`spare-pill-${sp}`}
                                    onClick={() => handleAddMaterial(sp)}
                                    className={`py-1 px-2 rounded-md font-medium text-4xs transition-colors cursor-pointer border ${
                                      isAdded 
                                        ? `${themeClasses.bg} text-white border-transparent` 
                                        : 'bg-white hover:bg-slate-105 text-slate-700 border-slate-200'
                                    }`}
                                  >
                                    + {sp.length > 25 ? sp.slice(0, 25) + '...' : sp}
                                  </button>
                                );
                              })}
                            </div>

                            {selectedMaterials.length > 0 && (
                              <div className="space-y-1 border-t border-slate-200 pt-2">
                                <p className="font-bold text-slate-400 text-4xs">Repuestos Declarados Hoy:</p>
                                {selectedMaterials.map(m => (
                                  <div key={m.item} className="flex items-center justify-between bg-white px-2.5 py-1 rounded-md border border-slate-200">
                                    <span className="truncate text-slate-700 text-4xs font-medium">{m.item}</span>
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        id={`btn-dec-mat-${m.item}`}
                                        onClick={() => handleRemoveMaterial(m.item)}
                                        className="p-0.5 rounded hover:bg-slate-150 text-slate-500"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className="font-bold text-slate-800 font-mono text-3xs">{m.qty}</span>
                                      <button
                                        type="button"
                                        id={`btn-inc-mat-${m.item}`}
                                        onClick={() => handleAddMaterial(m.item)}
                                        className={`p-0.5 rounded hover:bg-slate-150 ${themeClasses.text}`}
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* SECCIÓN 5: REPUESTOS REQUERIDOS */}
                          <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                            <label className="block font-bold text-slate-500 uppercase tracking-wide">Repuestos Requeridos</label>
                            <p className="text-slate-400 text-4xs mb-2">Declara repuestos necesarios para visitas futuras:</p>
                            
                            <div className="flex gap-1.5 items-end">
                              <div className="flex-1 space-y-0.5">
                                <span className="text-4xs text-slate-400 uppercase">Detalle</span>
                                <input
                                  type="text"
                                  id="input-req-spare-name"
                                  placeholder="Ej: Empacadura de sellado"
                                  className="w-full text-3xs p-1.5 rounded border border-slate-200 bg-white"
                                />
                              </div>
                              <div className="w-16 space-y-0.5">
                                <span className="text-4xs text-slate-400 uppercase">Cant</span>
                                <input
                                  type="number"
                                  id="input-req-spare-qty"
                                  min={1}
                                  defaultValue={1}
                                  className="w-full text-3xs p-1.5 rounded border border-slate-200 bg-white font-mono"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const nameEl = document.getElementById('input-req-spare-name') as HTMLInputElement;
                                  const qtyEl = document.getElementById('input-req-spare-qty') as HTMLInputElement;
                                  if (nameEl && qtyEl) {
                                    handleAddRequiredSpare(nameEl.value, Number(qtyEl.value));
                                    nameEl.value = '';
                                    qtyEl.value = '1';
                                  }
                                }}
                                className={`py-1.5 px-3 rounded text-white font-bold text-3xs shrink-0 cursor-pointer ${themeClasses.bg}`}
                              >
                                Agregar
                              </button>
                            </div>
                            
                            {requiredSpares.length > 0 && (
                              <div className="space-y-1 border-t border-slate-200 pt-2 mt-2">
                                {requiredSpares.map(s => (
                                  <div key={s.item} className="flex items-center justify-between bg-white px-2.5 py-1 rounded-md border border-slate-200">
                                    <span className="truncate text-slate-700 text-4xs font-medium">{s.item}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-800 font-mono text-3xs font-semibold">x{s.qty}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveRequiredSpare(s.item)}
                                        className="text-red-500 font-bold text-4xs hover:underline cursor-pointer"
                                      >
                                        Quitar
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* SECCIÓN 6: REGISTRO FOTOGRÁFICO */}
                          <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                            <label className="block font-bold text-slate-500 uppercase tracking-wide">Registro Fotográfico (Máx 5 fotos)</label>
                            <p className="text-slate-400 text-4xs mb-2">Sube imágenes o fotos del equipo intervenido:</p>
                            
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              disabled={photoGallery.length >= 5}
                              onChange={handlePhotoUpload}
                              className="w-full text-3xs p-1 text-slate-600 bg-white border border-slate-200 rounded cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
                            />
                            
                            {photoGallery.length > 0 && (
                              <div className="grid grid-cols-5 gap-1.5 mt-2">
                                {photoGallery.map((img, idx) => (
                                  <div key={idx} className="relative aspect-square rounded-lg border border-slate-200 overflow-hidden bg-slate-100">
                                    <img src={img} className="w-full h-full object-cover" alt={`foto-${idx+1}`} />
                                    <button
                                      type="button"
                                      onClick={() => handleRemovePhoto(idx)}
                                      className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center font-bold text-[8px] cursor-pointer shadow-md"
                                      title="Eliminar Foto"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            <p className="text-4xs text-slate-400 text-right">{photoGallery.length}/5 fotos cargadas</p>
                          </div>

                          {/* Hours Spent */}
                          <div className="flex items-center justify-between border-t border-b border-slate-200 py-2.5">
                            <span className="font-bold text-slate-500 uppercase">Horas totales invertidas:</span>
                            <div className="flex items-center gap-2.5">
                              <button
                                type="button"
                                id="btn-dec-hours"
                                onClick={() => setHours(Math.max(1, hours - 1))}
                                className="p-1 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="font-bold font-mono text-sm">{hours} hrs</span>
                              <button
                                type="button"
                                id="btn-inc-hours"
                                onClick={() => setHours(hours + 1)}
                                className={`p-1 rounded-full bg-slate-200 hover:bg-slate-300 ${themeClasses.text}`}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* SECCIÓN 7: PANEL DE FIRMAS Y CÉDULAS */}
                          <div className="space-y-4 bg-slate-55 p-2.5 rounded-xl border border-slate-200">
                            <h5 className="font-extrabold text-slate-800 border-b border-slate-200 pb-1 uppercase tracking-wider text-[8.5px]">
                              4. Registro de Firmas y Cédulas
                            </h5>

                            {/* 1. Firma Técnico Titular */}
                            <div className="space-y-1.5">
                              <p className="font-bold text-slate-650 uppercase text-[8px]">Técnico Titular ({activeEngineer?.name})</p>
                              
                              <div className="space-y-1">
                                <label className="block text-4xs text-slate-400 uppercase">Cédula del Técnico</label>
                                <input
                                  type="text"
                                  required
                                  value={technicianCedula}
                                  onChange={e => setTechnicianCedula(e.target.value)}
                                  placeholder="Ej: 1791271750"
                                  className="w-full text-3xs p-2 rounded-lg border border-slate-200 bg-white font-mono font-semibold"
                                />
                              </div>

                              <div className="space-y-1 mt-2">
                                <div className="flex justify-between items-center">
                                  <label className="block text-4xs text-slate-450 uppercase">Trazado de Firma Digital</label>
                                  {hasSignedTech && (
                                    <button
                                      type="button"
                                      onClick={clearTechSignature}
                                      className="text-4xs text-red-500 font-bold hover:underline cursor-pointer"
                                    >
                                      Borrar Firma
                                    </button>
                                  )}
                                </div>
                                <div className="bg-slate-100 border border-slate-200 rounded-lg overflow-hidden flex flex-col items-center">
                                  <canvas
                                    ref={techCanvasRef}
                                    width={320}
                                    height={80}
                                    onMouseDown={startTechDrawing}
                                    onMouseMove={drawTech}
                                    onMouseUp={stopTechDrawing}
                                    onMouseLeave={stopTechDrawing}
                                    onTouchStart={startTechDrawing}
                                    onTouchMove={drawTech}
                                    onTouchEnd={stopTechDrawing}
                                    className="bg-white block w-full touch-none"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* 2. Firma Técnico de Apoyo (si aplica) */}
                            {supportSignee && (
                              <div className="space-y-1.5 border-t border-slate-200 pt-3">
                                <p className="font-bold text-slate-650 uppercase text-[8px]">Técnico de Apoyo ({supportSignee})</p>
                                
                                <div className="space-y-1">
                                  <label className="block text-4xs text-slate-400 uppercase">Cédula de Técnico Apoyo</label>
                                  <input
                                    type="text"
                                    value={supportCedula}
                                    onChange={e => setSupportCedula(e.target.value)}
                                    placeholder="Ej: 1003720511"
                                    className="w-full text-3xs p-2 rounded-lg border border-slate-200 bg-white font-mono font-semibold"
                                  />
                                </div>

                                <div className="space-y-1 mt-2">
                                  <div className="flex justify-between items-center">
                                    <label className="block text-4xs text-slate-450 uppercase">Trazado de Firma de Apoyo</label>
                                    {hasSignedSupport && (
                                      <button
                                        type="button"
                                        onClick={clearSupportSignature}
                                        className="text-4xs text-red-500 font-bold hover:underline cursor-pointer"
                                      >
                                        Borrar Firma
                                      </button>
                                    )}
                                  </div>
                                  <div className="bg-slate-100 border border-slate-200 rounded-lg overflow-hidden flex flex-col items-center">
                                    <canvas
                                      ref={supportCanvasRef}
                                      width={320}
                                      height={80}
                                      onMouseDown={startSupportDrawing}
                                      onMouseMove={drawSupport}
                                      onMouseUp={stopSupportDrawing}
                                      onMouseLeave={stopSupportDrawing}
                                      onTouchStart={startSupportDrawing}
                                      onTouchMove={drawSupport}
                                      onTouchEnd={stopSupportDrawing}
                                      className="bg-white block w-full touch-none"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* 3. Firma del Cliente */}
                            <div className="space-y-1.5 border-t border-slate-200 pt-3">
                              <p className="font-bold text-slate-650 uppercase text-[8px]">Representante del Cliente</p>
                              
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label className="block text-4xs text-slate-400 uppercase font-bold">Nombre Completo</label>
                                  <input
                                    type="text"
                                    required
                                    value={clientSignee}
                                    onChange={e => setClientSignee(e.target.value)}
                                    placeholder="Ej: Ing. Iván Canchignia"
                                    className="w-full text-3xs p-2 rounded-lg border border-slate-200 bg-white font-semibold"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="block text-4xs text-slate-400 uppercase font-bold">Cédula / RUC</label>
                                  <input
                                    type="text"
                                    required
                                    value={clientCedula}
                                    onChange={e => setClientCedula(e.target.value)}
                                    placeholder="Ej: 0502051980"
                                    className="w-full text-3xs p-2 rounded-lg border border-slate-200 bg-white font-mono font-semibold"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1 mt-2">
                                <div className="flex justify-between items-center">
                                  <label className="block text-4xs text-slate-450 uppercase">Trazado de Firma Cliente</label>
                                  {hasSignedClient && (
                                    <button
                                      type="button"
                                      onClick={clearClientSignature}
                                      className="text-4xs text-red-500 font-bold hover:underline cursor-pointer"
                                    >
                                      Borrar Firma
                                    </button>
                                  )}
                                </div>
                                <div className="bg-slate-100 border border-slate-200 rounded-lg overflow-hidden flex flex-col items-center">
                                  <canvas
                                    ref={clientCanvasRef}
                                    width={320}
                                    height={80}
                                    onMouseDown={startClientDrawing}
                                    onMouseMove={drawClient}
                                    onMouseUp={stopClientDrawing}
                                    onMouseLeave={stopClientDrawing}
                                    onTouchStart={startClientDrawing}
                                    onTouchMove={drawClient}
                                    onTouchEnd={stopClientDrawing}
                                    className="bg-white block w-full touch-none"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <button
                            type="submit"
                            id="btn-phone-submit-report"
                            disabled={!hasSignedClient || !hasSignedTech}
                            className={`w-full py-3.5 rounded-xl font-extrabold text-white transition shadow-sm cursor-pointer ${
                              hasSignedClient && hasSignedTech 
                                ? 'bg-emerald-600 hover:bg-emerald-700' 
                                : 'bg-slate-350 cursor-not-allowed'
                            }`}
                          >
                            Enviar Reporte Técnico RE-TE-04
                          </button>
                        </form>
                      </motion.div>
                    );
                  })()
                )}

              </AnimatePresence>
            </div>

            {/* Simulated handle removed */}

            {/* Profile Drawer */}
            <AnimatePresence>
              {isProfileOpen && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => {
                      setIsProfileOpen(false);
                      if (activeEngineer) {
                        setEditEngName(activeEngineer.name);
                        setEditEngSpecialty(activeEngineer.specialty);
                        setEditEngEmail(activeEngineer.email || '');
                        setEditEngPhone(activeEngineer.phone || '');
                        setEditEngAvatar(activeEngineer.avatar || '');
                        setMobileTheme(activeEngineer.theme || 'indigo');
                      }
                    }}
                    className="absolute inset-0 bg-slate-900/60 z-40 cursor-pointer"
                  />
                  
                  {/* Drawer body */}
                  <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="absolute bottom-0 inset-x-0 bg-white rounded-t-2xl shadow-xl z-50 p-4 border-t border-slate-200 font-sans text-xs flex flex-col space-y-4 max-h-[90%] overflow-y-auto"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <User className={`w-4 h-4 ${themeClasses.textColor}`} />
                        <h4 className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wide">Editar Perfil Técnico</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false);
                          if (activeEngineer) {
                            setEditEngName(activeEngineer.name);
                            setEditEngSpecialty(activeEngineer.specialty);
                            setEditEngEmail(activeEngineer.email || '');
                            setEditEngPhone(activeEngineer.phone || '');
                            setEditEngAvatar(activeEngineer.avatar || '');
                            setMobileTheme(activeEngineer.theme || 'indigo');
                          }
                        }}
                        className="text-slate-400 hover:text-slate-600 font-bold text-xs p-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-3">
                      {/* Name */}
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Nombre del Ingeniero</label>
                        <input
                          type="text"
                          required
                          disabled={!!lockedEngineerId}
                          value={editEngName}
                          onChange={e => setEditEngName(e.target.value)}
                          className={`w-full text-3xs p-2 rounded-lg border border-slate-200 bg-white font-semibold ${lockedEngineerId ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
                        />
                      </div>

                      {/* Specialty */}
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Especialidad</label>
                        <select
                          value={editEngSpecialty}
                          disabled={!!lockedEngineerId}
                          onChange={e => setEditEngSpecialty(e.target.value as Specialty)}
                          className={`w-full text-3xs p-2 rounded-lg border border-slate-200 bg-white font-semibold text-slate-750 ${lockedEngineerId ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
                        >
                          <option value="Ingeniería">Ingeniería</option>
                          <option value="Aplicaciones">Aplicaciones</option>
                          <option value="Ventas">Ventas</option>
                        </select>
                      </div>

                      {/* Email */}
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Correo Electrónico</label>
                        <input
                          type="email"
                          required
                          disabled={!!lockedEngineerId}
                          value={editEngEmail}
                          onChange={e => setEditEngEmail(e.target.value)}
                          className={`w-full text-3xs p-2 rounded-lg border border-slate-205 bg-white font-semibold ${lockedEngineerId ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
                        />
                      </div>

                      {/* Phone */}
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Teléfono de Contacto</label>
                        <input
                          type="text"
                          required
                          value={editEngPhone}
                          onChange={e => setEditEngPhone(e.target.value)}
                          className="w-full text-3xs p-2 rounded-lg border border-slate-205 bg-white font-semibold"
                        />
                      </div>

                      {/* Avatar Image URL */}
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">URL de Foto de Perfil (Avatar)</label>
                        <input
                          type="text"
                          value={editEngAvatar}
                          onChange={e => setEditEngAvatar(e.target.value)}
                          placeholder="Ej: https://images.unsplash.com/photo-..."
                          className="w-full text-3xs p-2 rounded-lg border border-slate-205 bg-white font-semibold"
                        />
                      </div>

                      {/* Account/Technician Switcher */}
                      {!lockedEngineerId && (
                        <div className="space-y-1 border-t border-slate-105 pt-2">
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Cambiar de Técnico Activo</label>
                          <select
                            value={activeEngineerId}
                            onChange={e => {
                              setActiveEngineerId(e.target.value);
                              setSelectedWOId(null);
                              setIsCompilingReport(false);
                              setIsProfileOpen(false); // Close profile drawer after switching
                            }}
                            className="w-full text-3xs p-2 rounded-lg border border-slate-200 bg-white font-semibold text-slate-705 outline-hidden"
                          >
                            {engineers.map(e => (
                              <option key={e.id} value={e.id}>{e.name}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Theme Picker */}
                      <div className="space-y-1.5 border-t border-slate-100 pt-2">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tema de Interfaz (Perfil)</label>
                        <div className="flex gap-2.5 justify-around mt-1">
                          {[
                            { id: 'indigo', label: 'Indigo', color: 'bg-indigo-600 ring-indigo-500/30' },
                            { id: 'emerald', label: 'Esmeralda', color: 'bg-emerald-600 ring-emerald-500/30' },
                            { id: 'crimson', label: 'Carmesí', color: 'bg-rose-600 ring-rose-500/30' },
                            { id: 'dark', label: 'Oscuro', color: 'bg-slate-800 ring-slate-800/30' }
                          ].map(t => {
                            const isSelTheme = mobileTheme === t.id;
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => setMobileTheme(t.id as any)}
                                className="flex flex-col items-center gap-1 cursor-pointer group"
                              >
                                <span className={`w-6 h-6 rounded-full ${t.color} flex items-center justify-center border border-white shadow-sm transition-all group-hover:scale-105 ${
                                  isSelTheme ? 'ring-4 ring-offset-1 ring-slate-400 scale-105' : ''
                                }`}>
                                  {isSelTheme && <span className="text-[10px] text-white font-bold">✓</span>}
                                </span>
                                <span className={`text-[8px] font-bold ${isSelTheme ? 'text-slate-855' : 'text-slate-400 group-hover:text-slate-600'}`}>{t.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Submit */}
                      <div className="pt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileOpen(false);
                            if (activeEngineer) {
                              setEditEngName(activeEngineer.name);
                              setEditEngSpecialty(activeEngineer.specialty);
                              setEditEngEmail(activeEngineer.email || '');
                              setEditEngPhone(activeEngineer.phone || '');
                              setEditEngAvatar(activeEngineer.avatar || '');
                              setMobileTheme(activeEngineer.theme || 'indigo');
                            }
                          }}
                          className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold tracking-tight text-center transition cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className={`flex-1 py-2 rounded-xl text-white font-extrabold tracking-tight text-center transition cursor-pointer ${themeClasses.bg}`}
                        >
                          Guardar Cambios
                        </button>
                      </div>
                    </form>

                    {/* Vacaciones y Descansos Section */}
                    {activeEngineer && (
                      <div className="border-t border-slate-100 pt-4 space-y-4 text-left">
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wide flex items-center gap-1">
                            <Palmtree className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
                            <span>Vacaciones y Descanso</span>
                          </h4>
                          <p className="text-[9px] text-slate-400 font-semibold leading-normal">
                            Monitoree su cupo anual y solicite días de vacaciones
                          </p>
                        </div>

                        {/* Balance Summary Cards */}
                        {(() => {
                          const engVacations = (vacations || []).filter(v => v.engineerId === activeEngineer.id && v.status === 'Aprobado');
                          const taken = engVacations.reduce((sum, v) => sum + getVacationDuration(v.startDate, v.endDate, v.includeWeekends), 0);
                          const quota = activeEngineer.annualVacationDays ?? 15;
                          const pending = activeEngineer.pendingVacationsLastYear ?? 0;
                          const standby = activeEngineer.standbyVacationsLastYear ?? 0;
                          const seniorityBonus = Math.min(Math.max(Math.floor(getYearsInCompanyNum(activeEngineer.entryDate)) - 5, 0), 15);
                          const birthdayDay = activeEngineer.birthdayVacationDay !== undefined ? activeEngineer.birthdayVacationDay : 1;
                          
                          const initialHours = (quota + pending + standby + seniorityBonus + birthdayDay) * 8;
                          const vacationTakenHours = taken * 8;
                          
                          const engPermissions = (permissions || []).filter(p => p.engineerId === activeEngineer.id);
                          const compHours = engPermissions.filter(p => p.type === 'Compensación').reduce((sum, p) => sum + Number(p.hours || 0), 0);
                          const permHours = engPermissions.filter(p => p.type === 'Permiso').reduce((sum, p) => sum + Number(p.hours || 0), 0);
                          
                          const netAvailableHours = initialHours + compHours - vacationTakenHours - permHours;
                          const netDays = Math.floor(netAvailableHours / 8);
                          const netRemHours = netAvailableHours % 8;

                          return (
                            <div className="space-y-2">
                              {/* Detalles de contratación / antigüedad */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-155 text-[9px]">
                                <div>
                                  <span className="block font-bold text-slate-400 uppercase text-[7px]">Antigüedad</span>
                                  <span className="font-extrabold text-slate-700 font-mono">{calculateYearsInCompany(activeEngineer.entryDate)}</span>
                                  <span className="block text-[7px] text-slate-400 font-mono mt-0.5">Ingreso: {activeEngineer.entryDate || '—'}</span>
                                </div>
                                <div>
                                  <span className="block font-bold text-slate-400 uppercase text-[7px]">Adic. Antigüedad</span>
                                  <span className="font-extrabold text-slate-700 font-mono">{seniorityBonus} días</span>
                                  <span className="block text-[7px] text-slate-400 font-mono mt-0.5">(+5 años)</span>
                                </div>
                                <div>
                                  <span className="block font-bold text-slate-400 uppercase text-[7px]">Día Cumpleaños</span>
                                  <span className="font-extrabold text-slate-700 font-mono">{birthdayDay} día</span>
                                  <span className="block text-[7px] text-slate-400 font-mono mt-0.5">(Extra anual)</span>
                                </div>
                                <div>
                                  <span className="block font-bold text-slate-400 uppercase text-[7px]">Historial anterior</span>
                                  <span className="font-extrabold text-slate-700 font-mono">{pending}d Pend.</span>
                                  <span className="block text-[7px] text-slate-400 font-mono mt-0.5">({standby}d Standby)</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-center">
                                <div className="bg-slate-50 border border-slate-150 p-2 rounded-xl">
                                  <span className="text-[8px] font-bold text-slate-400 uppercase leading-none block">Cupo</span>
                                  <span className="text-sm font-black text-slate-800 font-mono mt-1 block">{quota}</span>
                                  <span className="text-[7px] font-semibold text-slate-505 leading-none block mt-0.5">días/año</span>
                                </div>
                                <div className="bg-teal-50/45 border border-teal-100 p-2 rounded-xl">
                                  <span className="text-[8px] font-bold text-teal-600 uppercase leading-none block">Tomados</span>
                                  <span className="text-sm font-black text-teal-700 font-mono mt-1 block">{taken}</span>
                                  <span className="text-[7px] font-semibold text-teal-500 leading-none block mt-0.5">días gozados</span>
                                </div>
                                <div className="bg-amber-50/45 border border-amber-100 p-2 rounded-xl">
                                  <span className="text-[8px] font-bold text-amber-600 uppercase leading-none block">Bolsa de Horas</span>
                                  <span className={`text-sm font-black font-mono mt-1 block ${compHours - permHours < 0 ? 'text-rose-650 animate-pulse' : 'text-emerald-700'}`}>
                                    {compHours - permHours >= 0 ? `+${compHours - permHours}h` : `${compHours - permHours}h`}
                                  </span>
                                  <span className="text-[7px] font-semibold text-amber-500 leading-none block mt-0.5">horas a favor/contra</span>
                                </div>
                                <div className="bg-indigo-50/45 border border-indigo-100 p-2 rounded-xl">
                                  <span className="text-[8px] font-bold text-indigo-600 uppercase leading-none block">Saldo Neto</span>
                                  <span className={`text-sm font-black font-mono mt-1 block ${netAvailableHours < 0 ? 'text-rose-650 animate-pulse' : 'text-indigo-755'}`}>
                                    {netDays}d {netRemHours}h
                                  </span>
                                  <span className="text-[7px] font-semibold text-indigo-500 leading-none block mt-0.5">disponible final</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Request Vacation Form */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-3">
                          <span className="text-[9px] font-extrabold text-slate-800 uppercase tracking-wider block">
                            Nueva Solicitud de Vacaciones
                          </span>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-0.5">
                              <label className="text-[8px] font-bold text-slate-400 uppercase">Inicio</label>
                              <input
                                type="date"
                                required
                                value={engVacStart}
                                onChange={e => setEngVacStart(e.target.value)}
                                className="w-full text-[10px] p-1.5 rounded border border-slate-200 bg-white font-mono focus:outline-hidden focus:ring-1 focus:ring-slate-300"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <label className="text-[8px] font-bold text-slate-400 uppercase">Fin</label>
                              <input
                                type="date"
                                required
                                value={engVacEnd}
                                onChange={e => setEngVacEnd(e.target.value)}
                                className="w-full text-[10px] p-1.5 rounded border border-slate-200 bg-white font-mono focus:outline-hidden focus:ring-1 focus:ring-slate-300"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 py-0.5">
                            <input
                              type="checkbox"
                              id="engVacIncludeWeekends"
                              checked={engVacIncludeWeekends}
                              onChange={e => setEngVacIncludeWeekends(e.target.checked)}
                              className="w-3.5 h-3.5 text-indigo-650 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                            />
                            <label htmlFor="engVacIncludeWeekends" className="text-[9px] font-bold text-slate-600 uppercase tracking-wide cursor-pointer select-none">
                              ¿Incluir fines de semana en el conteo?
                            </label>
                          </div>

                          <div className="space-y-0.5">
                            <label className="text-[8px] font-bold text-slate-400 uppercase block">Motivo / Notas</label>
                            <input
                              type="text"
                              value={engVacNotes}
                              onChange={e => setEngVacNotes(e.target.value)}
                              placeholder="Ej. Vacaciones pendientes del año anterior"
                              className="w-full text-[10px] p-1.5 rounded border border-slate-200 bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-300"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={async () => {
                              if (!engVacStart || !engVacEnd) {
                                alert("Por favor seleccione fecha de inicio y fin.");
                                return;
                              }
                              if (engVacEnd < engVacStart) {
                                alert("La fecha de fin no puede ser anterior a la de inicio.");
                                return;
                              }
                              
                              const newRequest: Vacation = {
                                id: 'VAC-' + Date.now(),
                                engineerId: activeEngineer.id,
                                startDate: engVacStart,
                                endDate: engVacEnd,
                                status: 'Solicitado',
                                notes: engVacNotes || 'Solicitado por el Ingeniero',
                                createdAt: new Date().toISOString(),
                                includeWeekends: engVacIncludeWeekends
                              };

                              if (onAddVacation) {
                                try {
                                  await onAddVacation(newRequest);
                                  alert("¡Solicitud de vacaciones registrada con éxito! Su estado inicial es 'Solicitado' y está pendiente de aprobación por el administrador.");
                                  setEngVacStart('');
                                  setEngVacEnd('');
                                  setEngVacNotes('');
                                  setEngVacIncludeWeekends(true);
                                } catch (err: any) {
                                  console.error("Error al enviar solicitud de vacaciones:", err);
                                  alert("Error al enviar la solicitud a la base de datos: " + (err.message || String(err)));
                                }
                              }
                            }}
                            className={`w-full py-1.5 rounded-lg text-white font-bold text-[10px] tracking-wide transition shadow-3xs cursor-pointer text-center ${themeClasses.bg}`}
                          >
                            Enviar Solicitud
                          </button>
                        </div>

                        {/* My Vacation Requests History */}
                        <div className="space-y-2">
                          <span className="text-[9px] font-extrabold text-slate-800 uppercase tracking-wider block">
                            Mis Solicitudes
                          </span>

                          {(() => {
                            const myRequests = (vacations || []).filter(v => v.engineerId === activeEngineer.id);
                            if (myRequests.length === 0) {
                              return <p className="text-[8px] font-semibold text-slate-400 italic">No tiene solicitudes registradas.</p>;
                            }
                            return (
                              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                {myRequests
                                  .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
                                  .map(r => {
                                    const days = getVacationDuration(r.startDate, r.endDate, r.includeWeekends);
                                    return (
                                      <div
                                        key={r.id}
                                        className="bg-slate-50 border border-slate-150 p-2 rounded-lg flex items-center justify-between text-[9px]"
                                      >
                                        <div className="flex-1 min-w-0 pr-2">
                                          <p className="font-bold text-slate-800 leading-none">
                                            {days} {days === 1 ? 'día' : 'días'}{r.includeWeekends === false ? ' (hab.)' : ''} ({r.startDate} al {r.endDate})
                                          </p>
                                          {r.notes && r.notes !== 'Programado por el Administrador' && r.notes !== 'Solicitado por el Ingeniero' && (
                                            <p className="text-[8.5px] text-slate-555 truncate italic mt-0.5">
                                              "{r.notes}"
                                            </p>
                                          )}
                                        </div>
                                        <span className={`text-[8px] font-extrabold px-1.5 py-0.2 border rounded-full shrink-0 ${
                                          r.status === 'Aprobado'
                                            ? 'bg-emerald-50 text-emerald-805 border-emerald-250'
                                            : r.status === 'Rechazado'
                                            ? 'bg-rose-50 text-rose-805 border-rose-250'
                                            : 'bg-amber-50 text-amber-805 border-amber-250'
                                        }`}>
                                          {r.status}
                                        </span>
                                      </div>
                                    );
                                  })}
                              </div>
                            );
                          })()}
                        </div>

                        {/* My Permissions & Compensations History */}
                        <div className="space-y-2 border-t border-slate-100 pt-3">
                          <span className="text-[9px] font-extrabold text-slate-800 uppercase tracking-wider block">
                            Mis Permisos y Compensaciones
                          </span>
                          {(() => {
                            const engPermissions = (permissions || []).filter(p => p.engineerId === activeEngineer.id);
                            if (engPermissions.length === 0) {
                              return <p className="text-[8px] font-semibold text-slate-400 italic">No tiene permisos o compensaciones registradas.</p>;
                            }
                            return (
                              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                {engPermissions
                                  .sort((a, b) => b.date.localeCompare(a.date))
                                  .map(p => (
                                    <div
                                      key={p.id}
                                      className="bg-slate-50 border border-slate-150 p-2 rounded-lg flex items-center justify-between text-[9px]"
                                    >
                                      <div className="flex-1 min-w-0 pr-2">
                                        <p className="font-bold text-slate-850 leading-none flex items-center gap-1.5">
                                          <span className={`font-mono font-bold px-1 rounded-[3px] text-[8px] ${
                                            p.type === 'Compensación' 
                                              ? 'bg-emerald-50 text-emerald-805 border border-emerald-250' 
                                              : 'bg-rose-50 text-rose-805 border border-rose-250'
                                          }`}>
                                            {p.type === 'Compensación' ? `+${p.hours}h` : `-${p.hours}h`}
                                          </span>
                                          <span className="font-mono text-slate-400">{p.date}</span>
                                        </p>
                                        <p className="text-[8.5px] text-slate-550 truncate mt-1">
                                          {p.reason}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>

        </div>
      </div>

      {/* Modal Visor de Reporte Técnico Oficial RE-TE-04 */}
      {isViewingRETE04 && selectedWOId && (() => {
        const task = workOrders.find(w => w.id === selectedWOId);
        const report = reports.find(r => r.workOrderId === selectedWOId);
        if (!task || !report) return null;
        return renderRETE04Report(report, task);
      })()}
    </div>
  );
}
