import React, { useState } from 'react';
import { Calendar as CalendarIcon, ClipboardList, CheckCircle2, RotateCcw, UserCheck, AlertCircle, Plus, FileText, Check, X, ShieldAlert, Filter, Send, CircleAlert, Database, Printer, FileSpreadsheet, BarChart3, TrendingUp, PieChart, Percent, Award, CalendarRange, Trash2, Search, Users, Cpu, Briefcase, Palmtree, AlertTriangle } from 'lucide-react';
import { WorkOrder, Engineer, Client, TechnicalReport, MaintenanceType, WorkOrderStatus, Specialty, Equipment, Contract, Vacation, EngineerPermission } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface AdminPortalProps {
  engineers: Engineer[];
  clients: Client[];
  workOrders: WorkOrder[];
  reports: TechnicalReport[];
  equipments: Equipment[];
  contracts: Contract[];
  vacations?: Vacation[];
  onAddWorkOrder: (wo: WorkOrder) => void;
  onUpdateWorkOrderStatus: (woId: string, status: any) => void;
  onUpdateWorkOrder: (wo: WorkOrder) => void;
  onSubmitTechnicalReport: (report: TechnicalReport) => void;
  onValidateReport: (woId: string, state: 'aprobado' | 'rechazado', notes: string) => void;
  onImportData: (newOrders: WorkOrder[], newReports: TechnicalReport[], newClients: Client[], newEngineers: Engineer[]) => void;
  onUpdateEngineer?: (updatedEng: Engineer) => void;
  onDeleteEngineer?: (engId: string) => void;
  onDeleteWorkOrders?: (woIds: string[]) => void;
  onMergeEngineers?: (sourceId: string, targetId: string) => void;
  onBatchReportWorkOrders?: (reports: TechnicalReport[], woUpdates: { id: string; status: WorkOrderStatus }[]) => void;
  onAddClient?: (client: Client) => void;
  onAddEquipment?: (eq: Equipment) => void;
  onUpdateEquipment?: (eq: Equipment) => void;
  onAddContract?: (con: Contract) => void;
  onUpdateContract?: (con: Contract) => void;
  onBulkUploadClients?: (clients: Client[]) => void;
  onBulkUploadEquipments?: (equipments: Equipment[]) => void;
  onBulkUploadContracts?: (contracts: Contract[]) => void;
  onClearEquipments?: () => void;
  onAddVacation?: (vac: Vacation) => void;
  onUpdateVacation?: (vac: Vacation) => void;
  onDeleteVacation?: (vacId: string) => void;
  permissions?: EngineerPermission[];
  onAddPermission?: (perm: EngineerPermission) => void;
  onDeletePermission?: (permId: string) => void;
  onSendPasswordReset?: (email: string) => void;
}

const getEndDateStr = (startDateStr: string, duration: number): string => {
  if (!startDateStr) return '';
  const date = new Date(startDateStr + 'T00:00:00');
  date.setDate(date.getDate() + (duration - 1));
  return date.toISOString().split('T')[0];
};

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

const detectServiceType = (equipmentName: string): MaintenanceType => {
  const q = equipmentName.toLowerCase();
  if (q.includes('instalaci')) return 'Instalación';
  if (q.includes('calibr')) return 'Calibración';
  if (q.includes('soporte')) return 'Soporte';
  if (q.includes('fmi')) return 'FMI';
  if (q.includes('capacitac')) return 'Capacitación';
  if (q.includes('inspecc')) return 'Inspección';
  if (q.includes('corr')) return 'Correctivo';
  return 'Preventivo';
};

const formatTime12h = (timeStr: string): string => {
  if (!timeStr) return '';
  const [hourStr, minStr] = timeStr.split(':');
  const hour = parseInt(hourStr);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour.toString().padStart(2, '0')}:${minStr} ${ampm}`;
};

const parseTimeRange = (timeStr: string): { start: string; end: string } => {
  const defaultVal = { start: '09:00', end: '11:00' };
  if (!timeStr) return defaultVal;
  
  const convert12hTo24h = (str: string): string => {
    const clean = str.trim().toUpperCase();
    const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
    if (!match) {
      const match24 = clean.match(/^(\d{1,2}):(\d{2})$/);
      if (match24) {
        return `${match24[1].padStart(2, '0')}:${match24[2]}`;
      }
      return '09:00';
    }
    let hour = parseInt(match[1]);
    const min = match[2];
    const ampm = match[3];
    if (ampm === 'PM' && hour < 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, '0')}:${min}`;
  };

  const parts = timeStr.split('-');
  if (parts.length === 2) {
    return {
      start: convert12hTo24h(parts[0]),
      end: convert12hTo24h(parts[1])
    };
  } else {
    const start24 = convert12hTo24h(timeStr);
    const [h, m] = start24.split(':').map(Number);
    const endH = (h + 2) % 24;
    const end24 = `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    return { start: start24, end: end24 };
  }
};

const getEngineerEmoji = (engineerId: string): string => {
  const emojis: Record<string, string> = {
    'ENG-001': '🔴',
    'ENG-002': '🟢',
    'ENG-003': '🔵',
    'ENG-004': '🟡',
    'ENG-005': '🟣',
    'ENG-006': '❇️',
    'ENG-007': '🌐',
    'ENG-008': '🟠',
    'ENG-009': '🌸',
    'ENG-010': '🔋',
    'ENG-011': '💎',
  };
  return emojis[engineerId] || '👤';
};

const getEngineerColorClasses = (engineerId: string) => {
  const colors: Record<string, { bg: string; text: string; border: string; borderL: string; ring: string; lightBg: string }> = {
    'ENG-001': { bg: 'bg-rose-500', text: 'text-rose-955', border: 'border-rose-200', borderL: 'border-l-rose-500', ring: 'ring-rose-500', lightBg: 'bg-rose-50/95' },
    'ENG-002': { bg: 'bg-teal-500', text: 'text-teal-955', border: 'border-teal-200', borderL: 'border-l-teal-600', ring: 'ring-teal-500', lightBg: 'bg-teal-50/95' },
    'ENG-003': { bg: 'bg-indigo-500', text: 'text-indigo-955', border: 'border-indigo-200', borderL: 'border-l-indigo-600', ring: 'ring-indigo-500', lightBg: 'bg-indigo-50/95' },
    'ENG-004': { bg: 'bg-amber-500', text: 'text-amber-955', border: 'border-amber-200', borderL: 'border-l-amber-500', ring: 'ring-amber-500', lightBg: 'bg-amber-50/95' },
    'ENG-005': { bg: 'bg-purple-500', text: 'text-purple-955', border: 'border-purple-200', borderL: 'border-l-purple-500', ring: 'ring-purple-500', lightBg: 'bg-purple-50/95' },
    'ENG-006': { bg: 'bg-emerald-500', text: 'text-emerald-955', border: 'border-emerald-200', borderL: 'border-l-emerald-600', ring: 'ring-emerald-500', lightBg: 'bg-emerald-50/95' },
    'ENG-007': { bg: 'bg-sky-500', text: 'text-sky-955', border: 'border-sky-200', borderL: 'border-l-sky-500', ring: 'ring-sky-500', lightBg: 'bg-sky-50/95' },
    'ENG-008': { bg: 'bg-orange-500', text: 'text-orange-955', border: 'border-orange-200', borderL: 'border-l-orange-500', ring: 'ring-orange-500', lightBg: 'bg-orange-50/95' },
    'ENG-009': { bg: 'bg-pink-500', text: 'text-pink-955', border: 'border-pink-200', borderL: 'border-l-pink-500', ring: 'ring-pink-500', lightBg: 'bg-pink-50/95' },
    'ENG-010': { bg: 'bg-lime-500', text: 'text-lime-955', border: 'border-lime-200', borderL: 'border-l-lime-600', ring: 'ring-lime-500', lightBg: 'bg-lime-50/95' },
    'ENG-011': { bg: 'bg-cyan-500', text: 'text-cyan-955', border: 'border-cyan-200', borderL: 'border-l-cyan-500', ring: 'ring-cyan-500', lightBg: 'bg-cyan-50/95' },
  };
  return colors[engineerId] || { bg: 'bg-slate-500', text: 'text-slate-955', border: 'border-slate-200', borderL: 'border-l-slate-500', ring: 'ring-slate-500', lightBg: 'bg-slate-50/95' };
};

export default function AdminPortal({
  engineers,
  clients,
  workOrders,
  reports,
  equipments = [],
  contracts = [],
  vacations = [],
  onAddWorkOrder,
  onUpdateWorkOrderStatus,
  onUpdateWorkOrder,
  onSubmitTechnicalReport,
  onValidateReport,
  onImportData,
  onUpdateEngineer,
  onDeleteEngineer,
  onDeleteWorkOrders,
  onMergeEngineers,
  onBatchReportWorkOrders,
  onAddClient,
  onAddEquipment,
  onUpdateEquipment,
  onAddContract,
  onUpdateContract,
  onBulkUploadClients,
  onBulkUploadEquipments,
  onBulkUploadContracts,
  onClearEquipments,
  onAddVacation,
  onUpdateVacation,
  onDeleteVacation,
  permissions = [],
  onAddPermission,
  onDeletePermission,
  onSendPasswordReset
}: AdminPortalProps) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // 1-indexed (1-12)
  const currentDay = today.getDate();
  const currentDateStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`;

  // Excel/CSV Field normalization helpers
  const getRowVal = (row: Record<string, string>, possibleKeys: string[]): string => {
    const normalizedPossible = possibleKeys.map(k => 
      k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "").trim()
    );
    for (const key of Object.keys(row)) {
      const normalizedRowKey = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "").trim();
      if (normalizedPossible.includes(normalizedRowKey)) {
        return (row[key] || '').trim();
      }
    }
    return '';
  };

  const cleanZoneCode = (code: string): string => {
    if (!code) return '';
    return code.replace(/-(c|p)$/i, '').trim(); // e.g. "Quito-C" -> "Quito"
  };

  const translateBrand = (brandVal: string): string => {
    const cleanVal = brandVal.trim();
    const BRAND_MAP: Record<string, string> = {
      '1': 'GENERAL ELECTRIC',
      '2': 'FUJIFILM',
      '3': 'CARESTREAM',
      '4': 'NEMOTO',
      '5': 'ECHOLIGHT',
      '6': 'SKANRAY',
      '7': 'MAMMOTOME'
    };
    return BRAND_MAP[cleanVal] || brandVal;
  };

  const translateFamily = (familyVal: string): string => {
    const cleanVal = familyVal.trim().toUpperCase();
    const FAMILY_MAP: Record<string, string> = {
      'CT': 'TOMOGRAFÍA',
      'MG': 'MAMOGRAFÍA',
      'MR': 'RESONANCIA',
      'PET': 'TOMOGRAFÍA POR EMISIÓN DE POSITRONES',
      'ANG': 'ANGIÓGRAFO',
      'ARC': 'ARCO EN C',
      'GAM': 'GAMMACAMARA',
      'DEN': 'DENSITOMETRÍA',
      'SIN': 'MÓDULOS DE SÍNTESIS',
      'RXVET': 'RAYOS X VET',
      'RXF': 'RAYOS X CONVENCIONAL',
      'RXP': 'RAYOS X PORTÁTIL',
      'DETRX': 'DETECTORES DE RAYOS X FUJI',
      'DIGVET': 'DIGITALIZADORES VETERINARIOS',
      'DIG': 'DIGITALIZADORES',
      'IMP': 'IMPRESORAS',
      'AW': 'ESTACIÓN DE TRABAJO',
      'INY': 'INYECTORES DE CONTRASTE'
    };
    return FAMILY_MAP[cleanVal] || familyVal;
  };

  const [activeSubTab, setActiveSubTab] = useState<'scheduler' | 'auditor' | 'ordersList' | 'dashboard'>('scheduler');
  const [selectedDay, setSelectedDay] = useState<number>(currentDay);
  
  // Dashboard filter states
  const [dashPeriod, setDashPeriod] = useState<'month' | 'semester' | 'year'>('month');
  const [dashMonth, setDashMonth] = useState<number>(currentMonth);
  const [dashSemester, setDashSemester] = useState<1 | 2>(currentMonth <= 6 ? 1 : 2);
  const [dashYear, setDashYear] = useState<number>(currentYear);
  
  // Details View state
  const [infoWO, setInfoWO] = useState<WorkOrder | null>(null);
  const [isEditingWOState, setIsEditingWOState] = useState(false);
  const [editedWO, setEditedWO] = useState<WorkOrder | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [draggedOverDay, setDraggedOverDay] = useState<string | null>(null);
  const [highlightedEngineerId, setHighlightedEngineerId] = useState<string | null>(null);

  // Main Admin Tab state
  const [activeAdminTab, setActiveAdminTab] = useState<'agendamiento' | 'clientes' | 'equipos' | 'contratos' | 'cronograma' | 'vacaciones'>('agendamiento');

  // Vacaciones Tab states
  const [vacFormEngId, setVacFormEngId] = useState('');
  const [vacFormStart, setVacFormStart] = useState('');
  const [vacFormEnd, setVacFormEnd] = useState('');
  const [vacFormNotes, setVacFormNotes] = useState('');
  const [editingQuotaEngId, setEditingQuotaEngId] = useState<string | null>(null);
  const [editingQuotaValue, setEditingQuotaValue] = useState<number>(15);
  const [historyEngId, setHistoryEngId] = useState<string | null>(null);
  const [vacFormSearchOpen, setVacFormSearchOpen] = useState(false);

  // States for inline editing of engineers
  const [editingEngId, setEditingEngId] = useState<string | null>(null);
  const [editEngName, setEditEngName] = useState('');
  const [editEngEmail, setEditEngEmail] = useState('');
  const [editEngSpecialty, setEditEngSpecialty] = useState<Specialty>('Ingeniería');
  const [vacFormSearchQuery, setVacFormSearchQuery] = useState('');
  const [vacFormIncludeWeekends, setVacFormIncludeWeekends] = useState(true);
  const [modalVacIncludeWeekends, setModalVacIncludeWeekends] = useState(true);
  const [permFormDate, setPermFormDate] = useState('');
  const [permFormHours, setPermFormHours] = useState(8);
  const [permFormReason, setPermFormReason] = useState('');
  const [permFormType, setPermFormType] = useState<'Permiso' | 'Compensación'>('Permiso');
  const [vacEngSearchQuery, setVacEngSearchQuery] = useState('');

  const getEngineerVacationConflict = (engId: string, startDate: string, duration: number) => {
    if (!engId || !startDate || !duration) return null;
    const end = getEndDateStr(startDate, duration);
    const conflict = (vacations || []).find(v => {
      if (v.engineerId !== engId || v.status !== 'Aprobado') return false;
      return (startDate <= v.endDate && end >= v.startDate);
    });
    return conflict || null;
  };

  const getCreationFormConflicts = () => {
    const conflicts: { engineer: Engineer; vacation: Vacation }[] = [];
    const leadEng = engineers.find(e => e.id === newWOEngineer);
    if (leadEng) {
      const conflict = getEngineerVacationConflict(leadEng.id, newWODate, newWODurationDays);
      if (conflict) {
        conflicts.push({ engineer: leadEng, vacation: conflict });
      }
    }
    newWOSupportEngineers.forEach(supId => {
      const supEng = engineers.find(e => e.id === supId);
      if (supEng) {
        const conflict = getEngineerVacationConflict(supEng.id, newWODate, newWODurationDays);
        if (conflict) {
          conflicts.push({ engineer: supEng, vacation: conflict });
        }
      }
    });
    return conflicts;
  };

  const getEditFormConflicts = () => {
    if (!editedWO) return [];
    const conflicts: { engineer: Engineer; vacation: Vacation }[] = [];
    const leadEng = engineers.find(e => e.id === editedWO.engineerId);
    if (leadEng) {
      const conflict = getEngineerVacationConflict(leadEng.id, editedWO.plannedDate, editedWO.durationDays || 1);
      if (conflict) {
        conflicts.push({ engineer: leadEng, vacation: conflict });
      }
    }
    const supportIds = editedWO.supportEngineerIds || (editedWO.supportEngineerId ? [editedWO.supportEngineerId] : []);
    supportIds.forEach(supId => {
      const supEng = engineers.find(e => e.id === supId);
      if (supEng) {
        const conflict = getEngineerVacationConflict(supEng.id, editedWO.plannedDate, editedWO.durationDays || 1);
        if (conflict) {
          conflicts.push({ engineer: supEng, vacation: conflict });
        }
      }
    });
    return conflicts;
  };

  // Clientes Tab states
  const [clientSearch, setClientSearch] = useState('');
  const [clientPage, setClientPage] = useState(1);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isClientImporterOpen, setIsClientImporterOpen] = useState(false);
  const [clientCsvError, setClientCsvError] = useState<string | null>(null);
  
  // Clientes Form states
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientFormId, setClientFormId] = useState('');
  const [clientFormName, setClientFormName] = useState('');
  const [clientFormAddress, setClientFormAddress] = useState('');
  const [clientFormCity, setClientFormCity] = useState('');
  const [clientFormContact, setClientFormContact] = useState('');
  const [clientFormPhone, setClientFormPhone] = useState('');

  // Equipos Tab states
  const [equipSearch, setEquipSearch] = useState('');
  const [equipPage, setEquipPage] = useState(1);
  const [isEquipModalOpen, setIsEquipModalOpen] = useState(false);
  const [isEquipImporterOpen, setIsEquipImporterOpen] = useState(false);
  const [equipCsvError, setEquipCsvError] = useState<string | null>(null);
  const [equipCsvSuccess, setEquipCsvSuccess] = useState<string | null>(null);
  const [modelsLookup, setModelsLookup] = useState<Record<string, { name: string; brand: string; family: string }>>({});

  // Equipos Form states
  const [editingEquip, setEditingEquip] = useState<Equipment | null>(null);
  const [equipFormId, setEquipFormId] = useState('');
  const [equipFormName, setEquipFormName] = useState('');
  const [equipFormClientId, setEquipFormClientId] = useState('');
  const [equipFormBrand, setEquipFormBrand] = useState('GENERAL ELECTRIC');
  const [equipFormModel, setEquipFormModel] = useState('');
  const [equipFormSerial, setEquipFormSerial] = useState('');
  const [equipFormSW, setEquipFormSW] = useState('');
  const [equipFormSucursal, setEquipFormSucursal] = useState('');
  const [equipFormStatus, setEquipFormStatus] = useState<'Operativo' | 'No Operativo'>('Operativo');

  // Contratos Tab states
  const [contractSearch, setContractSearch] = useState('');
  const [contractPage, setContractPage] = useState(1);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isContractImporterOpen, setIsContractImporterOpen] = useState(false);
  const [contractCsvError, setContractCsvError] = useState<string | null>(null);

  // Contratos Form states
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [contractFormId, setContractFormId] = useState('');
  const [contractFormClientId, setContractFormClientId] = useState('');
  const [contractFormType, setContractFormType] = useState<'Garantía extendida/Contrato' | 'Garantía de compra' | 'Facturable' | 'Otro'>('Garantía extendida/Contrato');
  const [contractFormStart, setContractFormStart] = useState('');
  const [contractFormEnd, setContractFormEnd] = useState('');
  const [contractFormStatus, setContractFormStatus] = useState<'Activo' | 'Vencido' | 'Pendiente'>('Activo');
  const [contractFormCoverage, setContractFormCoverage] = useState('');

  // Create New WO States
  const [isCreatingWO, setIsCreatingWO] = useState(false);
  const [newWOClient, setNewWOClient] = useState(clients[0]?.id || '');
  const [newWOClientSearch, setNewWOClientSearch] = useState('');
  const [newWOEngineer, setNewWOEngineer] = useState(engineers[0]?.id || '');
  const [woEngDropdownOpen, setWoEngDropdownOpen] = useState(false);
  const [woEngSearchQuery, setWoEngSearchQuery] = useState('');
  const [newWOSupportEngineer, setNewWOSupportEngineer] = useState('');
  const [newWOSupportEngineers, setNewWOSupportEngineers] = useState<string[]>([]);
  const [newWOType, setNewWOType] = useState<MaintenanceType>('Preventivo');
  const [newWOEquipment, setNewWOEquipment] = useState('');
  const [newWONotes, setNewWONotes] = useState('');
  const [newWODate, setNewWODate] = useState(currentDateStr);
  const [newWOTimeStart, setNewWOTimeStart] = useState('09:00');
  const [newWOTimeEnd, setNewWOTimeEnd] = useState('11:00');
  const [newWODurationDays, setNewWODurationDays] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const matchesSearch = (wo: WorkOrder) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase().trim();
    
    const eng = engineers.find(e => e.id === wo.engineerId);
    const engName = eng ? eng.name.toLowerCase() : '';
    
    const supportIds = wo.supportEngineerIds && wo.supportEngineerIds.length > 0
      ? wo.supportEngineerIds
      : (wo.supportEngineerId ? [wo.supportEngineerId] : []);
    const supportNames = supportIds
      .map(id => engineers.find(e => e.id === id)?.name.toLowerCase() || '')
      .join(' ');
    
    const client = clients.find(c => c.id === wo.clientId);
    const clientName = client ? client.name.toLowerCase() : '';
    
    const equipment = wo.equipmentName ? wo.equipmentName.toLowerCase() : '';
    const type = wo.type ? wo.type.toLowerCase() : '';
    const notes = wo.notes ? wo.notes.toLowerCase() : '';
    
    return (
      clientName.includes(q) ||
      engName.includes(q) ||
      supportNames.includes(q) ||
      equipment.includes(q) ||
      type.includes(q) ||
      notes.includes(q)
    );
  };

  // CSV Import states
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [csvFileName, setCsvFileName] = useState('');
  const [csvRawText, setCsvRawText] = useState<string>('');
  const [importYear, setImportYear] = useState('2026');
  const [importMonth, setImportMonth] = useState('03');
  const [parsedOrders, setParsedOrders] = useState<WorkOrder[]>([]);
  const [parsedReports, setParsedReports] = useState<TechnicalReport[]>([]);
  const [parsedClients, setParsedClients] = useState<Client[]>([]);
  const [parsedEngineers, setParsedEngineers] = useState<Engineer[]>([]);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);
  const [detectedFormatType, setDetectedFormatType] = useState<'planificacion' | 'reportes' | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // States for Engineers Management Modal
  const [isEngsModalOpen, setIsEngsModalOpen] = useState(false);
  const [engSearchQuery, setEngSearchQuery] = useState('');
  const [isAddingNewEng, setIsAddingNewEng] = useState(false);
  const [newEngName, setNewEngName] = useState('');
  const [newEngSpecialty, setNewEngSpecialty] = useState<Specialty>('Ingeniería');
  const [engToDelete, setEngToDelete] = useState<Engineer | null>(null);

  // States for resetting the selected month's schedule
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');

  // States for bulk reporting the selected month's schedule
  const [isReportMonthModalOpen, setIsReportMonthModalOpen] = useState(false);
  const [reportMonthConfirmText, setReportMonthConfirmText] = useState('');

  // States for merging dynamic duplicate technicians
  const [engToMerge, setEngToMerge] = useState<Engineer | null>(null);
  const [mergeTargetId, setMergeTargetId] = useState<string>('');

  // Active Calendar View states
  const [calendarYear, setCalendarYear] = useState<number>(currentYear);
  const [calendarMonth, setCalendarMonth] = useState<number>(currentMonth);

  const monthsList = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const calendarMonthName = monthsList[calendarMonth - 1] || 'Marzo';

  // Get all unique engineers active in the selected calendar month
  const monthEngineers = React.useMemo(() => {
    const activeIds = new Set<string>();
    
    // We can loop through each day of the selected month
    const daysInMonth = new Date(calendarYear, calendarMonth, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${calendarYear}-${calendarMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
      workOrders.forEach(wo => {
        let isMatch = false;
        if (!wo.durationDays || wo.durationDays <= 1) {
          isMatch = wo.plannedDate === dateStr;
        } else {
          const start = new Date(wo.plannedDate + 'T00:00:00');
          const target = new Date(dateStr + 'T00:00:00');
          const end = new Date(start);
          end.setDate(start.getDate() + (wo.durationDays - 1));
          isMatch = target >= start && target <= end;
        }
        
        if (isMatch) {
          if (wo.engineerId) activeIds.add(wo.engineerId);
          if (wo.supportEngineerId) activeIds.add(wo.supportEngineerId);
          if (wo.supportEngineerIds) {
            wo.supportEngineerIds.forEach(id => activeIds.add(id));
          }
        }
      });
    }
    
    if (activeIds.size === 0) {
      // Fallback: if no work orders scheduled in this month, show all unique engineers
      const seen = new Set<string>();
      return engineers.filter(e => {
        if (!seen.has(e.id)) {
          seen.add(e.id);
          return true;
        }
        return false;
      });
    }
    
    const seen = new Set<string>();
    return engineers.filter(e => {
      if (activeIds.has(e.id) && !seen.has(e.id)) {
        seen.add(e.id);
        return true;
      }
      return false;
    });
  }, [workOrders, engineers, calendarMonth, calendarYear]);

  const handleImportYearChange = (newYear: string) => {
    setImportYear(newYear);
    if (csvRawText) {
      handleParseAndAnalyze(csvRawText, csvFileName, newYear, importMonth);
    }
  };

  const handleImportMonthChange = (newMonth: string) => {
    setImportMonth(newMonth);
    if (csvRawText) {
      handleParseAndAnalyze(csvRawText, csvFileName, importYear, newMonth);
    }
  };

  // Reconciliation States
  const [selectedAuditWOId, setSelectedAuditWOId] = useState<string | null>(null);
  const [validationNotes, setValidationNotes] = useState('');
  const [isRechazando, setIsRechazando] = useState(false);
  const [isViewingRETE04, setIsViewingRETE04] = useState(false);
  const [selectedRETE04WOId, setSelectedRETE04WOId] = useState<string | null>(null);
  const [auditorStyle, setAuditorStyle] = useState<'excelTabs' | 'auditDesk'>('excelTabs');
  const [selectedEngTab, setSelectedEngTab] = useState<string>('ENG-001');
  const [auditorMonth, setAuditorMonth] = useState<number>(3); // Default to March (3)
  const [auditorYear, setAuditorYear] = useState<number>(2026);

  React.useEffect(() => {
    if (engineers.length > 0 && (!selectedEngTab || !engineers.some(e => e.id === selectedEngTab))) {
      setSelectedEngTab(engineers[0].id);
    }
  }, [engineers, selectedEngTab]);

  React.useEffect(() => {
    if (isCreatingWO) {
      const client = clients.find(c => c.id === newWOClient);
      setNewWOClientSearch(client ? client.name : '');
    }
  }, [isCreatingWO, clients, newWOClient]);

  // Search/Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Direct Reporting States from Calendar Details Modal
  const [isReportingWO, setIsReportingWO] = useState(false);
  const [reportFindings, setReportFindings] = useState('');
  const [reportActions, setReportActions] = useState('');
  const [reportHours, setReportHours] = useState(3.5);
  const [reportClientSignee, setReportClientSignee] = useState('');

  // Dynamic helper matching logic for engineers
  const matchEngineer = (nameStr: string): string => {
    if (!nameStr) return 'ENG-001';
    const lower = nameStr.toLowerCase();
    
    if (lower.includes('eduardo') || lower.includes('rivas')) return 'ENG-001';
    if (lower.includes('sixto') || lower.includes('ortega')) return 'ENG-002';
    if (lower.includes('andrés') || lower.includes('andres') || lower.includes('castro')) return 'ENG-003';
    if (lower.includes('francisco') || lower.includes('lopez') || lower.includes('lópez')) return 'ENG-004';
    if (lower.includes('daniel') || lower.includes('ortiz')) return 'ENG-005';
    
    // Attempt approximate matching
    const matched = engineers.find(e => {
      const eName = e.name.toLowerCase();
      return eName.includes(lower) || lower.includes(eName);
    });
    if (matched) return matched.id;
    return 'ENG-001'; // Default
  };

  // Dynamic helper matching logic for clients
  const matchClient = (nameStr: string): string => {
    if (!nameStr) return 'CLI-101';
    const lower = nameStr.toLowerCase();
    
    const matched = clients.find(c => {
      const cName = c.name.toLowerCase();
      return cName.includes(lower) || lower.includes(cName);
    });
    if (matched) return matched.id;
    
    if (lower.includes('arcos')) return 'CLI-101';
    if (lower.includes('ángeles') || lower.includes('angeles')) return 'CLI-102';
    if (lower.includes('indumetal') || lower.includes('vallejo')) return 'CLI-103';
    if (lower.includes('titanium') || lower.includes('santa fe')) return 'CLI-104';
    if (lower.includes('dhl') || lower.includes('naucalpan')) return 'CLI-105';
    
    return 'CLI-101'; // Fallback
  };

  // Date normalizer
  const normalizeDate = (dateStr: string, year: string = '2026', month: string = '03'): string => {
    if (!dateStr) return `${year}-${month}-02`;
    const trimmed = dateStr.trim();
    
    // Strict ISO check YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    
    // Slash formatted DD/MM/YYYY
    if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(trimmed)) {
      const parts = trimmed.split(/[\/\-]/);
      const d = parts[0].padStart(2, '0');
      const m = parts[1].padStart(2, '0');
      const y = parts[2];
      return `${y}-${m}-${d}`;
    }

    // Only Day Number Check
    if (/^\d{1,2}$/.test(trimmed)) {
      return `${year}-${month}-${trimmed.padStart(2, '0')}`;
    }
    
    return trimmed;
  };

  // Light standard CSV Parser supporting commas, semicolons and Quotes
  const parseCSV = (text: string) => {
    const cleanText = text.replace(/^\uFEFF/, '');
    const lines = cleanText.split(/\r?\n/);
    if (lines.length === 0) return [];
    
    // Detect delimiter
    let delimiter = ';';
    const commaCount = (lines[0].match(/,/g) || []).length;
    const semiCount = (lines[0].match(/;/g) || []).length;
    const tabCount = (lines[0].match(/\t/g) || []).length;
    if (commaCount > semiCount && commaCount > tabCount) {
      delimiter = ',';
    } else if (tabCount > semiCount && tabCount > commaCount) {
      delimiter = '\t';
    }

    // Analyze headers (row 0)
    const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
    
    const result: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          values.push(current.trim().replace(/^["']|["']$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim().replace(/^["']|["']$/g, ''));
      
      if (values.length > 0 && values.some(v => v !== '')) {
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        result.push(row);
      }
    }
    return result;
  };

  const handleParseAndAnalyze = (text: string, filename: string, targetYear?: string, targetMonth?: string) => {
    try {
      setCsvRawText(text);
      
      let year = targetYear;
      let month = targetMonth;

      if (!year || !month) {
        // Attempt to extract month and year from filename
        let detectedYear = '2026';
        let detectedMonth = '03'; // Default March

        const lowerFilename = filename.toLowerCase();
        const monthsMap: Record<string, string> = {
          enero: '01', febrero: '02', marzo: '03', abril: '04', mayo: '05', junio: '06',
          julio: '07', agosto: '08', septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12'
        };

        Object.keys(monthsMap).forEach(mName => {
          if (lowerFilename.includes(mName)) {
            detectedMonth = monthsMap[mName];
          }
        });

        const yearMatch = lowerFilename.match(/\b(202\d)\b/);
        if (yearMatch) {
          detectedYear = yearMatch[1];
        }

        year = detectedYear;
        month = detectedMonth;
        
        setImportYear(detectedYear);
        setImportMonth(detectedMonth);
      }

      const rows = parseCSV(text);
      if (rows.length === 0) {
        setImportFeedback('El archivo CSV está vacío o sus cabeceras no se pudieron procesar.');
        return;
      }

      const parseLine = (lineStr: string): string[] => {
        const separator = lineStr.includes(';') ? ';' : ',';
        const vals: string[] = [];
        let current = '';
        let inQuotes = false;
        for (let c = 0; c < lineStr.length; c++) {
          const char = lineStr[c];
          if (char === '"' || char === "'") {
            inQuotes = !inQuotes;
          } else if (char === separator && !inQuotes) {
            vals.push(current.trim().replace(/^["']|["']$/g, ''));
            current = '';
          } else {
            current += char;
          }
        }
        vals.push(current.trim().replace(/^["']|["']$/g, ''));
        return vals;
      };

      const parseClientCell = (cellText: string) => {
        const parts = cellText.split(/\s{3,}/).map(p => p.trim()).filter(p => p !== '');
        
        let clientName = '';
        let timeStr = '09:00 AM';
        let equipmentName = 'Equipo Clínico';
        
        parts.forEach(part => {
          const lower = part.toLowerCase();
          if (lower.includes('hora de entrada') || lower.includes('hora:') || lower.includes('horario:')) {
            timeStr = part.replace(/^(hora\s*de\s*entrada:?|hora:?|horario:?)\s*/i, '').trim();
          } else if (lower.includes('equipo:') || lower.includes('tarea:')) {
            equipmentName = part.replace(/^(equipo:?|tarea:?)\s*/i, '').trim();
          } else if (clientName === '') {
            clientName = part;
          } else {
            equipmentName = equipmentName === 'Equipo Clínico' ? part : `${equipmentName} - ${part}`;
          }
        });

        return { clientName, timeStr, equipmentName };
      };

      const parseTechCell = (cellText: string): string => {
        return cellText.replace(/^(t[eé]cnico(\s*asignado)?:?|ingeniero:?)\s*/i, '').trim();
      };
      
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

      const allRowKeysNormalized = Object.keys(rows[0]).map(key => 
        key.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      );

      const isReportesFormat = allRowKeysNormalized.some(k => 
        k.includes('reporte') || k.includes('comentario') || k.includes('semana') || k.includes('tarea')
      );

      // Detect if there are week headers in the CSV by checking raw lines
      const linesForDetection = text.replace(/^\uFEFF/, '').split(/\r?\n/);
      const hasWeekHeaders = linesForDetection.some(line => {
        const values = line.split(/[,;\t]/).map(v => v.trim().replace(/^["']|["']$/g, ''));
        const numericValues = values.filter(v => v !== '' && !isNaN(Number(v)));
        return numericValues.length >= 3 && numericValues.every(n => Number(n) >= 1 && Number(n) <= 31);
      });
      
      const newOrders: WorkOrder[] = [];
      const newReports: TechnicalReport[] = [];
      const newClients: Client[] = [];
      const newEngineers: Engineer[] = [];

      const tempClients = [...clients];
      const tempEngineers = [...engineers];

      const getOrRegisterClient = (rawCName: string, cleanEquip: string): string => {
        if (!rawCName) {
          const found = tempClients.find(c => c.id === 'CLI-101');
          if (!found) {
            const fallbackCli: Client = {
              id: 'CLI-101',
              name: 'Cliente General',
              address: 'Dirección General (Ingestor)',
              industry: 'General',
              contactName: 'Contacto General',
              contactPhone: '',
              installedEquipments: []
            };
            tempClients.push(fallbackCli);
            newClients.push(fallbackCli);
          }
          return 'CLI-101';
        }
        const cleanName = rawCName.replace(/^(cliente:?)\s*/i, '').trim();
        const normClean = cleanName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

        const alphaNumClean = normClean.replace(/[^a-z0-9]/g, '');
        if (!alphaNumClean) {
          const found = tempClients.find(c => c.id === 'CLI-101');
          if (!found) {
            const fallbackCli: Client = {
              id: 'CLI-101',
              name: 'Cliente General',
              address: 'Dirección General (Ingestor)',
              industry: 'General',
              contactName: 'Contacto General',
              contactPhone: '',
              installedEquipments: []
            };
            tempClients.push(fallbackCli);
            newClients.push(fallbackCli);
          }
          return 'CLI-101';
        }

        const foundExact = tempClients.find(c => {
          const normC = c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
          return normC === normClean;
        });
        if (foundExact) return foundExact.id;

        const foundSoft = tempClients.find(c => {
          const normC = c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
          const cleanNormC = normC.replace(/[^a-z0-9]/g, '');
          if (!cleanNormC) return false;
          return normC.includes(normClean) || normClean.includes(normC);
        });
        if (foundSoft) return foundSoft.id;

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

      const cleanSingleName = (nameStr: string): { id: string; name: string } | null => {
        const norm = nameStr.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/^ing\.\s+/i, '').replace(/\./g, '').trim();
        
        // Exact initials match
        if (norm === 'av') {
          const e = tempEngineers.find(x => x.id === 'ENG-001');
          if (e) return { id: e.id, name: e.name };
        }
        if (norm === 'dc') {
          const e = tempEngineers.find(x => x.id === 'ENG-002');
          if (e) return { id: e.id, name: e.name };
        }
        if (norm === 'eh') {
          const e = tempEngineers.find(x => x.id === 'ENG-003');
          if (e) return { id: e.id, name: e.name };
        }
        if (norm === 'fs') {
          const e = tempEngineers.find(x => x.id === 'ENG-004');
          if (e) return { id: e.id, name: e.name };
        }
        if (norm === 'sc') {
          const e = tempEngineers.find(x => x.id === 'ENG-005');
          if (e) return { id: e.id, name: e.name };
        }
        if (norm === 'dz') {
          const e = tempEngineers.find(x => x.id === 'ENG-006');
          if (e) return { id: e.id, name: e.name };
        }
        if (norm === 'db') {
          const e = tempEngineers.find(x => x.id === 'ENG-007');
          if (e) return { id: e.id, name: e.name };
        }
        if (norm === 'jc') {
          const e = tempEngineers.find(x => x.id === 'ENG-008');
          if (e) return { id: e.id, name: e.name };
        }
        if (norm === 'mn') {
          const e = tempEngineers.find(x => x.id === 'ENG-009');
          if (e) return { id: e.id, name: e.name };
        }
        if (norm === 'hm') {
          const e = tempEngineers.find(x => x.id === 'ENG-010');
          if (e) return { id: e.id, name: e.name };
        }
        if (norm === 'jq') {
          const e = tempEngineers.find(x => x.id === 'ENG-011');
          if (e) return { id: e.id, name: e.name };
        }

        // Substring matches
        if (norm.includes('andres') || norm.includes('vega')) {
          const e = tempEngineers.find(x => x.id === 'ENG-001');
          if (e) return { id: e.id, name: e.name };
        }
        if (norm.includes('changuan') || norm.includes('david')) {
          const e = tempEngineers.find(x => x.id === 'ENG-002');
          if (e) return { id: e.id, name: e.name };
        }
        if (norm.includes('hinojosa') || norm.includes('eduardo')) {
          const e = tempEngineers.find(x => x.id === 'ENG-003');
          if (e) return { id: e.id, name: e.name };
        }
        if (norm.includes('sotomayor') || norm.includes('francisco')) {
          const e = tempEngineers.find(x => x.id === 'ENG-004');
          if (e) return { id: e.id, name: e.name };
        }
        if (norm.includes('sixto') || norm.includes('soto')) {
          const e = tempEngineers.find(x => x.id === 'ENG-005');
          if (e) return { id: e.id, name: e.name };
        }
        if (norm.includes('zhunio') || norm.includes('daniel')) {
          const e = tempEngineers.find(x => x.id === 'ENG-006');
          if (e) return { id: e.id, name: e.name };
        }
        if (norm.includes('bosquez') || norm.includes('diego')) {
          const e = tempEngineers.find(x => x.id === 'ENG-007');
          if (e) return { id: e.id, name: e.name };
        }
        if (norm.includes('calderon')) {
          if (norm.includes('sixto') || norm.includes('soto')) {
            const e = tempEngineers.find(x => x.id === 'ENG-005');
            if (e) return { id: e.id, name: e.name };
          }
          const e = tempEngineers.find(x => x.id === 'ENG-008'); // Jose Calderon
          if (e) return { id: e.id, name: e.name };
        }
        if (norm.includes('niola') || norm.includes('miguel')) {
          const e = tempEngineers.find(x => x.id === 'ENG-009');
          if (e) return { id: e.id, name: e.name };
        }
        if (norm.includes('maldonado') || norm.includes('hernan')) {
          const e = tempEngineers.find(x => x.id === 'ENG-010');
          if (e) return { id: e.id, name: e.name };
        }
        if (norm.includes('quinde') || norm.includes('jose')) {
          if (norm.includes('calderon')) {
            const e = tempEngineers.find(x => x.id === 'ENG-008');
            if (e) return { id: e.id, name: e.name };
          }
          const e = tempEngineers.find(x => x.id === 'ENG-011'); // Jose Quinde
          if (e) return { id: e.id, name: e.name };
        }

        return null;
      };

      const getOrRegisterSingleEngineer = (nameStr: string): string => {
        if (!nameStr) {
          const found = tempEngineers.find(e => e.id === 'ENG-001');
          if (!found) {
            const fallbackEng: Engineer = {
              id: 'ENG-001',
              name: 'Ing. Andrés Vega',
              specialty: 'Ingeniería',
              email: 'andres.vega@soporte.com',
              phone: '',
              avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
              availability: 'Disponible',
              skills: []
            };
            tempEngineers.push(fallbackEng);
            newEngineers.push(fallbackEng);
          }
          return 'ENG-001';
        }

        const matched = cleanSingleName(nameStr);
        if (matched) return matched.id;

        // Fallback: Register new single engineer if unrecognized
        const cleanName = nameStr.replace(/^(t[eé]cnico(\s*asignado)?:?|ingeniero:?)\s*/i, '').trim();
        const cleanNameWithTitle = cleanName.toLowerCase().startsWith('ing.') ? cleanName : `Ing. ${cleanName}`;
        
        // Prevent duplicate dynamic engineer documents by checking name matching (case insensitive)
        const existingDynamic = tempEngineers.find(e => 
          e.name.toLowerCase().replace(/^(ing\.|lic\.)\s*/i, '').trim() === 
          cleanName.toLowerCase().replace(/^(ing\.|lic\.)\s*/i, '').trim()
        );
        if (existingDynamic) {
          return existingDynamic.id;
        }

        const newId = `ENG-DYN-${100 + tempEngineers.length}-${Math.floor(Math.random()*100)}`;
        const newEng: Engineer = {
          id: newId,
          name: cleanNameWithTitle,
          specialty: 'Ingeniería',
          email: `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@soporte.com`,
          phone: '',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
          availability: 'Disponible',
          skills: []
        };
        tempEngineers.push(newEng);
        newEngineers.push(newEng);
        return newId;
      };

      const resolveEngineerIds = (rawEName: string): { engineerId: string; supportEngineerId?: string } => {
        if (!rawEName) {
          return { engineerId: getOrRegisterSingleEngineer('') };
        }

        const cleanName = rawEName.replace(/^(t[eé]cnico(\s*asignado)?:?|ingeniero:?)\s*/i, '').trim();
        const splitPattern = /\s*(?:\+|\by\b|\band\b)\s*/i; // matches +, "y", or "and"

        if (splitPattern.test(cleanName)) {
          const parts = cleanName.split(splitPattern).map(p => p.trim()).filter(Boolean);
          if (parts.length > 0) {
            const primaryId = getOrRegisterSingleEngineer(parts[0]);
            let supportId: string | undefined = undefined;
            if (parts.length > 1) {
              supportId = getOrRegisterSingleEngineer(parts[1]);
            }
            return {
              engineerId: primaryId,
              supportEngineerId: supportId
            };
          }
        }

        return {
          engineerId: getOrRegisterSingleEngineer(cleanName)
        };
      };
      
      if (isReportesFormat) {
        setDetectedFormatType('reportes');
        
        rows.forEach((row, idx) => {
          const rawCliente = getRowValue(row, ['Cliente', 'Hospital', 'Ubicacion', 'Sede', 'Clinica', 'Empresa', 'Nombre']);
          const rawReporteCode = getRowValue(row, ['Reportes', 'Reporte', 'Folio', 'Codigo', 'ID']) || `REP-CSV-${idx + 301}`;
          const rawEquipo = getRowValue(row, ['Equipo/Tarea', 'equipo_tarea', 'Equipo', 'Activo', 'Tarea', 'Dispositivo']) || 'FDR Smart';
          const rawFecha = getRowValue(row, ['Fecha', 'Date', 'Dia']);
          const rawEntregado = (getRowValue(row, ['Reporte Entregado', 'Entregado', 'Estado', 'Estatus', 'Completado', 'Entregado?']) || 'NO').trim().toUpperCase();
          const rawComentarios = getRowValue(row, ['Comentarios', 'Comentario', 'Observaciones', 'Observacion', 'Notas', 'Nota']);
          const rawTecnico = getRowValue(row, ['Técnico asignado', 'Tecnico asignado', 'Tecnico', 'Ingeniero', 'Responsable']);

          const cleanEquipo = rawEquipo.replace(/^(equipo:?|activo:?)\s*/i, '').trim();
          const cleanCliente = rawCliente.replace(/^(cliente:?)\s*/i, '').trim();
          const cleanTecnico = rawTecnico.replace(/^(t[eé]cnico(\s*asignado)?:?|ingeniero:?)\s*/i, '').trim();
          
          const isSI = rawEntregado === 'SI' || rawEntregado === 'SÍ' || rawEntregado === 'YES' || rawEntregado === 'TRUE' || rawEntregado === 'COMPLETADO';
          
           const formattedDate = normalizeDate(rawFecha, year, month);
          const woId = `WO-REP-${formattedDate}-${idx}-${Math.floor(Math.random()*1000)}`;
          const engs = resolveEngineerIds(cleanTecnico || rawComentarios || cleanEquipo);
          const clientId = getOrRegisterClient(cleanCliente, cleanEquipo);

          const supportEngName = engs.supportEngineerId ? tempEngineers.find(e => e.id === engs.supportEngineerId)?.name : null;
          const notesText = supportEngName 
            ? `Mantenimiento histórico importado. Apoyo: ${supportEngName.replace('Ing. ', '')}. Comentarios cargados: ${rawComentarios}`
            : `Mantenimiento histórico importado. Comentarios cargados: ${rawComentarios}`;

          const wo: WorkOrder = {
            id: woId,
            clientId,
            engineerId: engs.engineerId,
            supportEngineerId: engs.supportEngineerId,
            plannedDate: formattedDate,
            type: detectServiceType(cleanEquipo),
            status: isSI ? 'Conciliado' : 'Pendiente',
            equipmentName: cleanEquipo,
            notes: notesText
          };
          newOrders.push(wo);

          if (isSI) {
            const eng = tempEngineers.find(e => e.id === engs.engineerId);
            const supportEng = engs.supportEngineerId ? tempEngineers.find(e => e.id === engs.supportEngineerId) : null;
            const rep: TechnicalReport = {
              id: rawReporteCode,
              workOrderId: woId,
              executionDate: formattedDate,
              hoursSpent: 3.5,
              technicalFindings: `Mantenimiento preventivo de equipo ${cleanEquipo} concluido para ${cleanCliente}. Estabilidad de presiones nominales del sistema constatado.`,
              actionsTaken: rawComentarios || 'Acondicionamiento de filtros de polímero y soplado del tablero de control.',
              materialsUsed: [
                { item: 'Insumos de calibración y limpieza', qty: 1 }
              ],
              nextRecommendations: 'Siguiente monitoreo rutinario recomendado para el siguiente semestre.',
              technicianSignature: supportEng ? `${eng?.name || 'Ingeniero de Soporte'} (Apoyo: ${supportEng.name.replace('Ing. ', '')})` : (eng?.name || 'Ingeniero de Soporte'),
              clientSignatureName: 'Firma y Sello Autorizado',
              validationState: 'aprobado',
              validationNotes: 'Importación de CSV por lotes.',
              validatedAt: formattedDate
            };
            newReports.push(rep);
          }
        });
        
        setParsedOrders(newOrders);
        setParsedReports(newReports);
        setParsedClients(newClients);
        setParsedEngineers(newEngineers);
        setImportFeedback(`Análisis exitoso: Formato "Reportes Ingenieros (Historial)" reconocido. Encontramos ${newOrders.length} registros, ${newReports.length} reportes, ${newClients.length} clientes nuevos y ${newEngineers.length} técnicos nuevos.`);
      } else if (hasWeekHeaders) {
        setDetectedFormatType('planificacion');
        
        let currentWeekDays: (number | null)[] = [];
        let previousClientRowValues: string[] = [];
        let orderCount = 0;

        const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/);
        
        lines.forEach((line) => {
          const values = parseLine(line);
          if (values.length === 0) return;

          const numericValues = values.filter(v => v !== '' && !isNaN(Number(v)));
          if (numericValues.length >= 3 && numericValues.every(n => Number(n) >= 1 && Number(n) <= 31)) {
            currentWeekDays = values.map(v => (v !== '' && !isNaN(Number(v))) ? Number(v) : null);
            previousClientRowValues = [];
            return;
          }

          if (currentWeekDays.length === 0) return;

          const isTechRow = values.some(v => {
            const normalized = v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return normalized.includes('tecnico') || normalized.includes('ingeniero');
          });

          if (isTechRow) {
            for (let j = 0; j < Math.min(values.length, currentWeekDays.length); j++) {
              const day = currentWeekDays[j];
              if (!day) continue;

              const rawClientCell = previousClientRowValues[j] || '';
              const rawTechCell = values[j] || '';

              if (rawClientCell.trim() === '' || rawClientCell.trim() === ';;') continue;

              const { clientName, timeStr, equipmentName } = parseClientCell(rawClientCell);
              if (!clientName) continue;

              const techName = parseTechCell(rawTechCell);

              const formattedDate = `${year}-${month}-${day.toString().padStart(2, '0')}`;
              const woId = `WO-${formattedDate}-${orderCount}-${Math.floor(Math.random()*1000)}`;
              orderCount++;

              const engs = resolveEngineerIds(techName);
              const clientId = getOrRegisterClient(clientName, equipmentName);

              const supportEngName = engs.supportEngineerId ? tempEngineers.find(e => e.id === engs.supportEngineerId)?.name : null;
              const notesText = supportEngName 
                ? `Mantenimiento programado en horario ${timeStr}. Apoyo: ${supportEngName.replace('Ing. ', '')}`
                : `Mantenimiento programado en horario ${timeStr}.`;

              const wo: WorkOrder = {
                id: woId,
                clientId,
                engineerId: engs.engineerId,
                supportEngineerId: engs.supportEngineerId,
                plannedDate: formattedDate,
                plannedTime: timeStr,
                type: detectServiceType(equipmentName),
                status: 'Pendiente',
                equipmentName: equipmentName,
                notes: notesText
              };
              newOrders.push(wo);
            }
            previousClientRowValues = [];
          } else {
            // Only assign if the line has actual content to avoid overwriting with empty rows
            if (values.some(v => v.trim() !== '')) {
              previousClientRowValues = values;
            }
          }
        });

        setParsedOrders(newOrders);
        setParsedReports([]);
        setParsedClients(newClients);
        setParsedEngineers(newEngineers);
        setImportFeedback(`Análisis exitoso: Formato "Planificación Semanal (Matriz)" reconocido. Encontramos ${newOrders.length} agendas planificadas con ${newClients.length} clientes nuevos y ${newEngineers.length} técnicos nuevos.`);
      } else {
        setDetectedFormatType('planificacion');
        
        rows.forEach((row, idx) => {
          const rawCliente = getRowValue(row, ['Cliente', 'Hospital', 'Ubicacion', 'Sede', 'Clinica', 'Empresa', 'Nombre']);
          const rawEquipo = getRowValue(row, ['Equipo', 'Activo', 'Tarea', 'Equipo/Tarea', 'Dispositivo', 'Maquina']) || 'Equipo Clínico';
          const rawTecnico = getRowValue(row, ['Técnico asignado', 'Tecnico asignado', 'Tecnico', 'Ingeniero', 'Responsable']);
          const rawFecha = getRowValue(row, ['Fecha', 'Date', 'Dia', 'Día']) || `${year}-${month}-02`;
          const rawHora = getRowValue(row, ['Hora de entrada', 'Hora_de_entrada', 'Hora', 'Horario', 'Entrada']) || '09:00 AM';

          const cleanEquipo = rawEquipo.replace(/^(equipo:?|activo:?)\s*/i, '').trim();
          const cleanCliente = rawCliente.replace(/^(cliente:?)\s*/i, '').trim();
          const cleanTecnico = rawTecnico.replace(/^(t[eé]cnico(\s*asignado)?:?|ingeniero:?)\s*/i, '').trim();
          const cleanHora = rawHora.replace(/^(hora\s*de\s*entrada:?|hora:?)\s*/i, '').trim();

          const formattedDate = normalizeDate(rawFecha, year, month);
          const woId = `WO-${formattedDate}-${idx}-${Math.floor(Math.random()*1000)}`;
          const engs = resolveEngineerIds(cleanTecnico);
          const clientId = getOrRegisterClient(cleanCliente, cleanEquipo);

          const supportEngName = engs.supportEngineerId ? tempEngineers.find(e => e.id === engs.supportEngineerId)?.name : null;
          const notesText = supportEngName 
            ? `Mantenimiento programado en horario ${cleanHora}. Apoyo: ${supportEngName.replace('Ing. ', '')}`
            : `Mantenimiento programado en horario ${cleanHora}.`;

          const wo: WorkOrder = {
            id: woId,
            clientId,
            engineerId: engs.engineerId,
            supportEngineerId: engs.supportEngineerId,
            plannedDate: formattedDate,
            plannedTime: cleanHora,
            type: detectServiceType(cleanEquipo),
            status: 'Pendiente',
            equipmentName: cleanEquipo,
            notes: notesText
          };
          newOrders.push(wo);
        });

        setParsedOrders(newOrders);
        setParsedReports([]);
        setParsedClients(newClients);
        setParsedEngineers(newEngineers);
        setImportFeedback(`Análisis exitoso: Formato "Planificación (Calendario)" reconocido. Encontramos ${newOrders.length} agendas planificadas con ${newClients.length} clientes nuevos y ${newEngineers.length} técnicos nuevos.`);
      }
      setCsvFileName(filename);
    } catch (error: any) {
      setImportFeedback(`Error al procesar el archivo CSV: ${error?.message || error}`);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        // Detect Latin1 / Windows-1252 if it contains the unicode replacement character \uFFFD
        if (text.includes('\uFFFD')) {
          const reader2 = new FileReader();
          reader2.onload = (event2) => {
            const text2 = event2.target?.result as string;
            handleParseAndAnalyze(text2, file.name);
          };
          reader2.readAsText(file, 'ISO-8859-1');
        } else {
          handleParseAndAnalyze(text, file.name);
        }
      };
      reader.readAsText(file, 'utf-8');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        // Detect Latin1 / Windows-1252 if it contains the unicode replacement character \uFFFD
        if (text.includes('\uFFFD')) {
          const reader2 = new FileReader();
          reader2.onload = (event2) => {
            const text2 = event2.target?.result as string;
            handleParseAndAnalyze(text2, file.name);
          };
          reader2.readAsText(file, 'ISO-8859-1');
        } else {
          handleParseAndAnalyze(text, file.name);
        }
      };
      reader.readAsText(file, 'utf-8');
    }
  };

  const handleLoadSamplePlanificacion = () => {
    const csv = `Cliente,Hora de entrada,Equipo,Técnico asignado,Fecha
Hospital General Ángeles,09:00 AM,FDR Smart RX,Sixto Ortega,2026-03-12
Corporativo Arcos,11:30 AM,Chiller York 355,Andrés Castro,2026-03-12
CLINICA TRAUMATOLOGIA - MACH,hora de entrada: 14:00 aM,Equipo: MR355,Técnico asignado: Miguel Niola,2026-03-02
Fábrica Indumetal S.A.,02:15 PM,Prensa Hidráulica 500,Francisco López,2026-03-15
Torre Titanium,08:45 AM,VRF Confort York,Eduardo Rivas,2026-03-18
Centro Logístico DHL Express,10:30 AM,UPS Emerson 80KVA,Andrés Castro,2026-03-24`;
    handleParseAndAnalyze(csv, 'planificacion_marzo_demo.csv');
  };

  const handleLoadSampleReportes = () => {
    const csv = `Cliente,Reportes,Equipo/Tarea,Fecha,Mes,Semana,Reporte Entregado,Comentarios,Técnico asignado
Corporativo Arcos,REP-CSV-050,Chiller York 355,2026-03-05,Marzo,Semana 10,SI,Control de presiones r410a estable. Limpieza completada.,Eduardo Rivas
Hospital General Ángeles,REP-CSV-051,FDR Smart RX,2026-03-08,Marzo,Semana 10,NO,Cancelado a medio diagnóstico por cirugía urgente.,Sixto Ortega
Fábrica Indumetal S.A.,REP-CSV-052,Prensa Hidráulica 500,2026-03-10,Marzo,Semana 10,SI,Fuga reparada. Empaques ajustados y sellado RTV aplicado.,Francisco López
Torre Titanium,REP-CSV-053,CCTV Bosch 48 Cams,2026-03-15,Marzo,Semana 11,SI,Limpieza óptica de domos exteriores y calibración de feeds.,Andrés Castro`;
    handleParseAndAnalyze(csv, 'reportes_historicos_demo.csv');
  };

  const handleCommitImport = () => {
    if (parsedOrders.length === 0) return;
    onImportData(parsedOrders, parsedReports, parsedClients, parsedEngineers);
    
    // Automatically switch calendar view to the imported month/year
    setCalendarYear(Number(importYear));
    setCalendarMonth(Number(importMonth));
    setSelectedDay(1); // Reset selected day to the 1st of the imported month
    setNewWODate(`${importYear}-${importMonth}-01`);

    // Reset Importer
    setParsedOrders([]);
    setParsedReports([]);
    setParsedClients([]);
    setParsedEngineers([]);
    setImportFeedback(null);
    setCsvFileName('');
    setIsImporterOpen(false);
  };

  // Metrics computing
  const totalPlanned = workOrders.length;
  const pendingValidation = workOrders.filter(wo => wo.status === 'Reportado').length;
  const completedConciliado = workOrders.filter(wo => wo.status === 'Conciliado').length;
  const activeFieldCount = engineers.filter(e => e.availability === 'En Campo').length;

  const handleCreateWO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWOEquipment) return;

    let finalClientId = '';
    const matchedClient = clients.find(c => c.name.trim().toLowerCase() === newWOClientSearch.trim().toLowerCase());

    if (matchedClient) {
      finalClientId = matchedClient.id;
    } else if (newWOClientSearch.trim()) {
      // Create new client in database
      const newClientId = `CLI-${Date.now()}`;
      const newClientObj: Client = {
        id: newClientId,
        name: newWOClientSearch.trim(),
        address: 'Dirección por registrar (Creado al programar)',
        industry: 'Industrial',
        contactName: 'Contacto por registrar',
        contactPhone: '',
        installedEquipments: [newWOEquipment]
      };
      if (onAddClient) {
        onAddClient(newClientObj);
      }
      finalClientId = newClientId;
    } else {
      finalClientId = clients[0]?.id || '';
    }

    const newWO: WorkOrder = {
      id: `WO-2026-0${workOrders.length + 100}`,
      clientId: finalClientId,
      engineerId: newWOEngineer,
      supportEngineerId: newWOSupportEngineers[0] || undefined,
      supportEngineerIds: newWOSupportEngineers,
      plannedDate: newWODate,
      plannedTime: `${formatTime12h(newWOTimeStart)} - ${formatTime12h(newWOTimeEnd)}`,
      type: newWOType,
      status: 'Pendiente',
      equipmentName: newWOEquipment,
      notes: newWONotes,
      durationDays: newWODurationDays
    };

    onAddWorkOrder(newWO);
    setIsCreatingWO(false);
    // Reset form
    setNewWOEquipment('');
    setNewWONotes('');
    setNewWOTimeStart('09:00');
    setNewWOTimeEnd('11:00');
    setNewWODurationDays(1);
    setNewWOSupportEngineer('');
    setNewWOSupportEngineers([]);
  };

  const handleQuickReport = (wo: WorkOrder) => {
    const reportId = `REP-${wo.id}`;
    const matchedReport = reports.find(r => r.workOrderId === wo.id);
    if (matchedReport) return;

    const newReport: TechnicalReport = {
      id: reportId,
      workOrderId: wo.id,
      executionDate: wo.plannedDate,
      hoursSpent: 2,
      technicalFindings: 'Mantenimiento preventivo realizado según protocolo. Todos los subsistemas operando en condiciones nominales. Limpieza física ejecutada.',
      actionsTaken: 'Calibración de sensores, limpieza de filtros y pruebas operativas de ciclo de arranque.',
      materialsUsed: [
        { item: 'Filtro de aire estándar', qty: 1 },
        { item: 'Lubricante sintético industrial', qty: 1 }
      ],
      nextRecommendations: 'Programar próxima revisión preventiva rutinaria en 30 días calendario.',
      technicianSignature: 'Firma Digital Autorizada',
      clientSignatureName: 'Supervisor de Guardia',
      validationState: 'pendiente',
      validationNotes: 'Pendiente revisión de auditoría del administrador.'
    };

    onSubmitTechnicalReport(newReport);
    onUpdateWorkOrderStatus(wo.id, 'Conciliado');
  };

  const handleExportCalendarExcel = () => {
    const selectedMonthStr = `${calendarYear}-${calendarMonth.toString().padStart(2, '0')}`;
    const monthOrders = workOrders.filter(wo => wo.plannedDate.startsWith(selectedMonthStr));

    if (monthOrders.length === 0) {
      alert(`No hay órdenes programadas para ${calendarMonthName} de ${calendarYear} para exportar.`);
      return;
    }

    // CSV header in Spanish with semicolon separation
    const headers = [
      'ID Orden',
      'Cliente',
      'Equipo / Activo',
      'Tipo de Servicio',
      'Fecha Programada',
      'Hora',
      'Técnico Principal',
      'Técnico de Apoyo',
      'Estado',
      'Notas'
    ];

    const rows = monthOrders.map(wo => {
      const client = clients.find(c => c.id === wo.clientId);
      const eng = engineers.find(e => e.id === wo.engineerId);
      const supportEng = wo.supportEngineerId ? engineers.find(e => e.id === wo.supportEngineerId) : null;
      
      const sanitize = (val: string | undefined | null) => {
        if (!val) return '';
        // Escape quotes
        return `"${val.replace(/"/g, '""')}"`;
      };

      return [
        sanitize(wo.id),
        sanitize(client?.name),
        sanitize(wo.equipmentName),
        sanitize(wo.type),
        sanitize(wo.plannedDate),
        sanitize(wo.plannedTime),
        sanitize(eng?.name),
        sanitize(supportEng?.name),
        sanitize(wo.status),
        sanitize(wo.notes)
      ].join(';');
    });

    const csvContent = "\uFEFF" + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `calendario_MTORIMEC_${calendarMonthName}_${calendarYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintCalendar = () => {
    const activeSelector = activeSubTab === 'scheduler' ? 'printable-calendar' : 'auditor-reconciliation-room';
    const sourceEl = document.getElementById(activeSelector);
    if (!sourceEl) return;

    // Clone the calendar and place it as a direct child of body
    // This avoids overflow/position clipping from ancestor containers
    const clone = sourceEl.cloneNode(true) as HTMLElement;
    clone.id = 'print-clone-root';
    clone.style.cssText = 'display:block;width:100%;position:static;margin:0;padding:0;background:white;';

    // Remove interactive / non-print elements from the clone
    clone.querySelectorAll('.no-print, button, select, input').forEach(n => (n as HTMLElement).style.display = 'none');

    const printWrap = document.createElement('div');
    printWrap.id = 'print-isolation-wrap';
    printWrap.appendChild(clone);
    document.body.appendChild(printWrap);
    document.body.classList.add('is-printing-calendar');

    const style = document.createElement('style');
    style.id = 'print-calendar-style';
    style.innerHTML = `
      @media print {
        @page {
          size: landscape;
          margin: 6mm 8mm;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        /* Hide EVERYTHING on the page */
        body.is-printing-calendar > *:not(#print-isolation-wrap) {
          display: none !important;
        }

        /* Show only the clone container */
        body.is-printing-calendar > #print-isolation-wrap {
          display: block !important;
          width: 100% !important;
          padding: 3mm !important;
          box-sizing: border-box !important;
          background: white !important;
        }

        /* Compact each week block — don't allow internal page break */
        .calendar-week-container {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
          margin-bottom: 4mm !important;
          border: 1px solid #cbd5e1 !important;
          border-radius: 4px !important;
          overflow: visible !important;
          display: block !important;
        }

        /* Week header (hidden on screen, shown on print) */
        .calendar-week-container > div:first-child {
          display: flex !important;
        }

        /* Day-of-week header row */
        .calendar-week-container > div:nth-child(2) {
          display: grid !important;
          grid-template-columns: repeat(7, 1fr) !important;
        }

        /* Calendar day grid */
        .calendar-days-grid {
          display: grid !important;
          grid-template-columns: repeat(7, 1fr) !important;
        }

        /* Compact day cells (override the 115px Tailwind class) */
        .cal-day-cell {
          min-height: 55px !important;
          height: auto !important;
          max-height: none !important;
          padding: 3px 4px !important;
          overflow: hidden !important;
          box-sizing: border-box !important;
        }

        /* Compact all text inside cells */
        .cal-day-cell * {
          font-size: 6.5px !important;
          line-height: 1.2 !important;
        }

        /* Multi-day event pill bars */
        .calendar-week-container .h-7 {
          height: 16px !important;
          min-height: 0 !important;
        }
        .calendar-week-container .h-7 * {
          font-size: 6px !important;
          line-height: 1 !important;
        }

        /* Force space-y gap to be minimal */
        .cal-day-cell .space-y-1 > * + * {
          margin-top: 1px !important;
        }

        /* Hide interactive elements inside clone */
        .no-print, button, select, input {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    window.print();

    const cleanup = () => {
      document.getElementById('print-calendar-style')?.remove();
      document.getElementById('print-isolation-wrap')?.remove();
      document.body.classList.remove('is-printing-calendar');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    setTimeout(cleanup, 4000);
  };

  const handleCloseInfoModal = () => {
    setInfoWO(null);
    setIsEditingWOState(false);
    setEditedWO(null);
    setIsReportingWO(false);
    setReportFindings('');
    setReportActions('');
    setReportHours(3.5);
    setReportClientSignee('');
    setIsConfirmingDelete(false);
  };

  const handleMoveWorkOrder = (woId: string, targetDateStr: string) => {
    const wo = workOrders.find(w => w.id === woId);
    if (!wo) return;
    if (wo.plannedDate === targetDateStr) return; // No change
    
    const updatedWO: WorkOrder = {
      ...wo,
      plannedDate: targetDateStr
    };
    onUpdateWorkOrder(updatedWO);
  };

  // Marzo 2026 starts on a Sunday. With standard columns: Lunes, Martes... Domingo:
  // We insert 6 blank placeholders to slide day 1 into Sunday (column 7).
  const renderCalendarDays = () => {
    const calendarDays = [];

    // Days in current month
    const daysInMonth = new Date(calendarYear, calendarMonth, 0).getDate();

    // Day of the week of the 1st (Sunday=0, Monday=1 ... Saturday=6)
    const firstDayIndex = new Date(calendarYear, calendarMonth - 1, 1).getDay();

    // Monday-start offset: Sunday(0)->6, Monday(1)->0, Tuesday(2)->1, etc.
    const placeholdersCount = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    // --- Previous month overflow days ---
    if (placeholdersCount > 0) {
      const prevMonthYear = calendarMonth === 1 ? calendarYear - 1 : calendarYear;
      const prevMonth = calendarMonth === 1 ? 12 : calendarMonth - 1;
      const daysInPrevMonth = new Date(prevMonthYear, prevMonth, 0).getDate();

      for (let p = 0; p < placeholdersCount; p++) {
        const prevDay = daysInPrevMonth - (placeholdersCount - 1 - p);
        const prevDateStr = `${prevMonthYear}-${prevMonth.toString().padStart(2, '0')}-${prevDay.toString().padStart(2, '0')}`;
        const prevDayOrders = workOrders.filter(wo =>
          (!wo.durationDays || wo.durationDays <= 1) && wo.plannedDate === prevDateStr
        );
        const prevDayVacations = (vacations || []).filter(v =>
          v.status === 'Aprobado' && prevDateStr >= v.startDate && prevDateStr <= v.endDate
        );

        calendarDays.push(
          <div
            key={`prev-${prevDay}`}
            onClick={() => {
              // Navigate to the previous month, then scroll to that specific day
              setCalendarMonth(prevMonth);
              setCalendarYear(prevMonthYear);
              setSelectedDay(prevDay);
              // Wait for React to re-render the new month, then scroll to the day cell
              setTimeout(() => {
                const dayEl = document.getElementById(`cal-day-${prevDay}`);
                if (dayEl) {
                  dayEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  // Briefly highlight the cell so the user sees where they landed
                  dayEl.style.transition = 'box-shadow 0.3s ease';
                  dayEl.style.boxShadow = '0 0 0 3px #6366f1, 0 0 12px rgba(99,102,241,0.4)';
                  setTimeout(() => { dayEl.style.boxShadow = ''; }, 1200);
                }
              }, 120);
            }}
            className="cal-day-cell min-h-[115px] p-2 bg-slate-50/60 flex flex-col justify-between cursor-pointer hover:bg-indigo-50/20 transition-colors"
          >
            <div className="flex justify-between items-center w-full">
              <span className="font-mono text-xs font-black text-slate-400">{prevDay}</span>
              {prevDayOrders.length > 0 && (
                <span className="bg-slate-200 text-slate-500 font-bold text-[8px] px-1 rounded-full">
                  {prevDayOrders.length}
                </span>
              )}
            </div>
            <div className="space-y-1 w-full mt-1.5 flex-1 overflow-y-auto">
              {prevDayVacations.map(v => {
                const eng = engineers.find(e => e.id === v.engineerId);
                return (
                  <div key={`pv-vac-${v.id}`} className="text-[8.5px] leading-tight p-1 rounded bg-teal-50 border border-teal-150 border-l-4 border-l-teal-500 text-teal-900 font-bold truncate flex items-center gap-1 select-none">
                    <span>🌴</span>
                    <span className="truncate">Vac: {eng?.name.replace('Ing. ', '').split(' ')[0]}</span>
                  </div>
                );
              })}
              {prevDayOrders.map(wo => {
                const eng = engineers.find(e => e.id === wo.engineerId);
                const client = clients.find(c => c.id === wo.clientId);
                const supportIds = wo.supportEngineerIds && wo.supportEngineerIds.length > 0
                  ? wo.supportEngineerIds
                  : (wo.supportEngineerId ? [wo.supportEngineerId] : []);
                const engColor = eng ? getEngineerColorClasses(eng.id) : null;
                const borderLClass = wo.isEquipmentDown
                  ? 'border-l-4 border-l-red-500'
                  : (engColor ? `border-l-4 ${engColor.borderL}` : '');
                let badgeBg = 'bg-amber-50 text-amber-955 border border-amber-150';
                if (wo.isEquipmentDown) badgeBg = 'bg-red-50 text-red-955 border border-red-150';
                else if (wo.status === 'Conciliado') badgeBg = 'bg-emerald-50 text-emerald-955 border border-emerald-150';
                else if (wo.status === 'Reportado') badgeBg = 'bg-indigo-50 text-indigo-955 border border-indigo-150';
                else if (wo.status === 'Realizado') badgeBg = 'bg-blue-50 text-blue-955 border border-blue-150';
                else if (wo.status === 'En Proceso') badgeBg = 'bg-sky-50 text-sky-955 border border-sky-150';
                else if (wo.status === 'Pendiente') badgeBg = 'bg-yellow-50 text-yellow-955 border border-yellow-150';
                return (
                  <div
                    key={`pv-wo-${wo.id}`}
                    className={`text-[9.5px] leading-tight p-1.5 rounded mb-1 text-left transition-all font-medium cursor-pointer hover:shadow-sm select-none ${badgeBg} ${borderLClass}`}
                    onClick={e => { e.stopPropagation(); setInfoWO(wo); }}
                    title={`${client?.name || ''} - ${wo.equipmentName}`}
                  >
                    <p className="font-black truncate text-slate-900 leading-none mb-0.5">{client?.name || 'Cliente'}</p>
                    {wo.plannedTime && (
                      <p className="text-indigo-700 text-[8px] font-bold mt-0.5 leading-none">⏰ {wo.plannedTime}</p>
                    )}
                    <p className="truncate text-slate-700 text-[8.5px] font-normal mt-0.5">{wo.equipmentName}</p>
                    <p className="truncate text-indigo-900 text-[7.5px] font-bold mt-0.5 flex items-center gap-0.5">
                      <span className="mr-0.5">{eng ? getEngineerEmoji(eng.id) : '👤'}</span>
                      {eng?.name.replace('Ing. ', '').split(' ')[0]}
                      {supportIds.length > 0 && (
                        <span className="flex items-center gap-1 ml-1">
                          {supportIds.map(id => {
                            const sEng = engineers.find(e => e.id === id);
                            if (!sEng) return null;
                            return <span key={id}>+ {getEngineerEmoji(sEng.id)} {sEng.name.replace('Ing. ', '').split(' ')[0]}</span>;
                          })}
                        </span>
                      )}
                    </p>
                    <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-200/40">
                      <span className="text-[7.5px] text-slate-450 font-bold tracking-tight select-none no-print">Detalles / Editar</span>
                      <span className={`text-[7.5px] font-extrabold px-1.5 py-0.5 rounded border ml-auto ${
                        wo.isEquipmentDown ? 'bg-red-100 text-red-800 border-red-200'
                        : wo.status === 'Conciliado' ? 'bg-emerald-100/50 text-emerald-805 border-emerald-200'
                        : wo.status === 'Reportado' ? 'bg-indigo-100/50 text-indigo-805 border-indigo-200'
                        : wo.status === 'Realizado' ? 'bg-blue-100/50 text-blue-805 border-blue-200'
                        : wo.status === 'En Proceso' ? 'bg-sky-100/50 text-sky-850 border-sky-200'
                        : 'bg-yellow-100/50 text-yellow-850 border-yellow-200'
                      }`}>{wo.isEquipmentDown ? 'Parado ⚠️' : wo.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
    }

    // --- Current month days ---
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${calendarYear}-${calendarMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const dayOrders = workOrders.filter(wo => {
        return (!wo.durationDays || wo.durationDays <= 1) && wo.plannedDate === dateStr;
      });
      const dayVacations = (vacations || []).filter(v => {
        return v.status === 'Aprobado' && dateStr >= v.startDate && dateStr <= v.endDate;
      });
      const isSelected = selectedDay === day;

      calendarDays.push(
        <div
          key={day}
          id={`cal-day-${day}`}
          onClick={() => {
            // Reset all form fields so a fresh form is shown every time
            setSelectedDay(day);
            setNewWODate(dateStr);
            setNewWOClient('');
            setNewWOClientSearch('');
            setNewWOEquipment('');
            setNewWONotes('');
            setNewWOSupportEngineers([]);
            setNewWOSupportEngineer('');
            setNewWOType('Preventivo');
            setNewWOTimeStart('09:00');
            setNewWOTimeEnd('11:00');
            setNewWODurationDays(1);
            setWoEngDropdownOpen(false);
            setWoEngSearchQuery('');
            setIsCreatingWO(true);
          }}
          onDragOver={(e) => {
            e.preventDefault(); // Required to allow drop
          }}
          onDragEnter={() => {
            setDraggedOverDay(dateStr);
          }}
          onDragLeave={() => {
            setDraggedOverDay(prev => prev === dateStr ? null : prev);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDraggedOverDay(null);
            const woId = e.dataTransfer.getData("text/plain");
            if (woId) {
              handleMoveWorkOrder(woId, dateStr);
            }
          }}
          className={`cal-day-cell min-h-[115px] p-2 text-left transition-all flex flex-col justify-between cursor-pointer focus:outline-none ${
            isSelected
              ? 'bg-indigo-50/70 text-slate-900'
              : draggedOverDay === dateStr
              ? 'bg-indigo-50/40 text-slate-900 scale-[1.01]'
              : 'bg-white hover:bg-slate-50/60 text-slate-800'
          }`}
        >
          <div className="flex justify-between items-center w-full">
            <span className="font-mono text-xs font-black">{day}</span>
            {dayOrders.length > 0 && (
              <span className="bg-indigo-100 text-indigo-805 font-bold text-[8px] px-1 rounded-full">
                {dayOrders.length}
              </span>
            )}
          </div>
          <div className="space-y-1 w-full mt-1.5 flex-1 overflow-y-auto">
            {dayVacations.map(v => {
              const eng = engineers.find(e => e.id === v.engineerId);
              return (
                <div
                  key={`vac-${v.id}`}
                  className="text-[8.5px] leading-tight p-1 rounded bg-teal-50 border border-teal-150 border-l-4 border-l-teal-500 text-teal-900 font-bold truncate flex items-center gap-1 select-none"
                  title={`Vacaciones: ${eng?.name || 'Técnico'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <span>🌴</span>
                  <span className="truncate">Vac: {eng?.name.replace('Ing. ', '').split(' ')[0]}</span>
                </div>
              );
            })}
            {dayOrders.map(wo => {
              const eng = engineers.find(e => e.id === wo.engineerId);
              const supportEng = wo.supportEngineerId ? engineers.find(e => e.id === wo.supportEngineerId) : null;
              const client = clients.find(c => c.id === wo.clientId);
              let badgeBg = 'bg-amber-50 hover:bg-amber-100 text-amber-955 border border-amber-150';
              if (wo.isEquipmentDown) {
                badgeBg = 'bg-red-50 hover:bg-red-100 text-red-955 border border-red-150';
              } else if (wo.status === 'Conciliado') {
                badgeBg = 'bg-emerald-50 hover:bg-emerald-100 text-emerald-955 border border-emerald-150';
              } else if (wo.status === 'Reportado') {
                badgeBg = 'bg-indigo-50 hover:bg-indigo-100 text-indigo-955 border border-indigo-150';
              } else if (wo.status === 'Realizado') {
                badgeBg = 'bg-blue-50 hover:bg-blue-100 text-blue-955 border border-blue-150';
              } else if (wo.status === 'En Proceso') {
                badgeBg = 'bg-sky-50 hover:bg-sky-100 text-sky-955 border border-sky-150';
              } else if (wo.status === 'Pendiente') {
                badgeBg = 'bg-yellow-50 hover:bg-yellow-100 text-yellow-955 border border-yellow-150';
              }

              const matchesQuery = searchQuery ? matchesSearch(wo) : true;
              const matchesEng = highlightedEngineerId
                ? (wo.engineerId === highlightedEngineerId || wo.supportEngineerId === highlightedEngineerId || wo.supportEngineerIds?.includes(highlightedEngineerId))
                : true;
              const isHighlighted = matchesQuery && matchesEng;
              const hasHighlightActive = !!highlightedEngineerId || !!searchQuery;

              const engColor = eng ? getEngineerColorClasses(eng.id) : null;
              const borderLClass = wo.isEquipmentDown
                ? 'border-l-4 border-l-red-500'
                : (engColor ? `border-l-4 ${engColor.borderL}` : '');
              let cardStyle = `${badgeBg} ${borderLClass}`;
              let ringStyle = '';

              if (hasHighlightActive) {
                if (isHighlighted) {
                  if (highlightedEngineerId) {
                    const engColorActive = getEngineerColorClasses(highlightedEngineerId);
                    cardStyle = `${engColorActive.lightBg} ${engColorActive.text} border ${engColorActive.border} border-l-4 ${engColorActive.borderL}`;
                    ringStyle = `ring-2 ${engColorActive.ring} font-bold scale-[1.03] shadow-lg z-10`;
                  } else {
                    cardStyle = `${badgeBg} ${borderLClass}`;
                    ringStyle = `ring-2 ring-indigo-500 scale-[1.03] shadow-lg z-10 font-bold`;
                  }
                } else {
                  cardStyle = `${badgeBg} ${borderLClass} opacity-15 filter blur-[1.5px] grayscale-[40%] scale-[0.96] pointer-events-none transition-all duration-300`;
                }
              }

              const supportIds = wo.supportEngineerIds && wo.supportEngineerIds.length > 0
                ? wo.supportEngineerIds
                : (wo.supportEngineerId ? [wo.supportEngineerId] : []);
              const supportNamesStr = supportIds
                .map(id => engineers.find(e => e.id === id)?.name || id)
                .join(', ');
              return (
                <div
                  key={wo.id}
                  draggable="true"
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", wo.id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  className={`text-[9.5px] leading-tight p-1.5 rounded mb-1 text-left transition-all font-medium leading-normal cursor-pointer hover:shadow-sm select-none ${cardStyle} ${ringStyle}`}
                  title={`${client?.name || ''} - ${wo.equipmentName} ${wo.plannedTime ? `(${wo.plannedTime})` : ''} (${eng?.name || ''}${supportNamesStr ? ` [Apoyo: ${supportNamesStr}]` : ''})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setInfoWO(wo);
                  }}
                >
                  <p className="font-black truncate text-slate-900 leading-none mb-0.5">
                    {client?.name || 'Cliente'}
                  </p>
                  {wo.plannedTime && (
                    <p className="text-indigo-700 text-[8px] font-bold mt-0.5 leading-none">
                      ⏰ {wo.plannedTime}
                    </p>
                  )}
                  <p className="truncate text-slate-700 text-[8.5px] font-normal mt-0.5">{wo.equipmentName}</p>
                  <p className="truncate text-indigo-900 text-[7.5px] font-bold mt-0.5 flex items-center gap-0.5">
                    <span className="mr-0.5">{eng ? getEngineerEmoji(eng.id) : '👤'}</span>
                    {eng?.name.replace('Ing. ', '').split(' ')[0]}
                    {supportIds.length > 0 && (
                      <span className="flex items-center gap-1 ml-1 flex-wrap">
                        {supportIds.map(id => {
                          const sEng = engineers.find(e => e.id === id);
                          if (!sEng) return null;
                          return (
                            <span key={id} className="flex items-center gap-0.5">
                              <span>+ {getEngineerEmoji(sEng.id)}</span>
                              <span>{sEng.name.replace('Ing. ', '').split(' ')[0]}</span>
                            </span>
                          );
                        })}
                      </span>
                    )}
                  </p>

                  {/* Status Indicator */}
                  <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-200/40">
                    <span className="text-[7.5px] text-slate-450 font-bold tracking-tight select-none no-print">Detalles / Editar</span>
                    <span className={`text-[7.5px] font-extrabold px-1.5 py-0.5 rounded border ml-auto print:ml-auto ${
                      wo.isEquipmentDown
                        ? 'bg-red-100 text-red-800 border-red-200'
                        : wo.status === 'Conciliado'
                        ? 'bg-emerald-100/50 text-emerald-805 border-emerald-200'
                        : wo.status === 'Reportado'
                        ? 'bg-indigo-100/50 text-indigo-805 border-indigo-200'
                        : wo.status === 'Realizado'
                        ? 'bg-blue-100/50 text-blue-805 border-blue-200'
                        : wo.status === 'En Proceso'
                        ? 'bg-sky-100/50 text-sky-850 border-sky-200'
                        : 'bg-yellow-100/50 text-yellow-850 border-yellow-200'
                    }`}>
                      {wo.isEquipmentDown ? 'Parado ⚠️' : wo.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // --- Next month overflow days to complete the last week ---
    const totalCells = placeholdersCount + daysInMonth;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

    if (remainingCells > 0) {
      const nextMonthYear = calendarMonth === 12 ? calendarYear + 1 : calendarYear;
      const nextMonth = calendarMonth === 12 ? 1 : calendarMonth + 1;

      for (let n = 1; n <= remainingCells; n++) {
        const nextDateStr = `${nextMonthYear}-${nextMonth.toString().padStart(2, '0')}-${n.toString().padStart(2, '0')}`;
        const nextDayOrders = workOrders.filter(wo =>
          (!wo.durationDays || wo.durationDays <= 1) && wo.plannedDate === nextDateStr
        );
        const nextDayVacations = (vacations || []).filter(v =>
          v.status === 'Aprobado' && nextDateStr >= v.startDate && nextDateStr <= v.endDate
        );

        calendarDays.push(
          <div
            key={`next-${n}`}
            onClick={() => {
              // Navigate to the next month, then scroll to top (that day will be at the top of the new month)
              setCalendarMonth(nextMonth);
              setCalendarYear(nextMonthYear);
              setSelectedDay(n);
              // Scroll to top smoothly, then highlight the day cell
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setTimeout(() => {
                const dayEl = document.getElementById(`cal-day-${n}`);
                if (dayEl) {
                  dayEl.style.transition = 'box-shadow 0.3s ease';
                  dayEl.style.boxShadow = '0 0 0 3px #6366f1, 0 0 12px rgba(99,102,241,0.4)';
                  setTimeout(() => { dayEl.style.boxShadow = ''; }, 1200);
                }
              }, 200);
            }}
            className="cal-day-cell min-h-[115px] p-2 bg-slate-50/60 flex flex-col justify-between cursor-pointer hover:bg-indigo-50/20 transition-colors"
          >
            <div className="flex justify-between items-center w-full">
              <span className="font-mono text-xs font-black text-slate-400">{n}</span>
              {nextDayOrders.length > 0 && (
                <span className="bg-slate-200 text-slate-500 font-bold text-[8px] px-1 rounded-full">
                  {nextDayOrders.length}
                </span>
              )}
            </div>
            <div className="space-y-1 w-full mt-1.5 flex-1 overflow-y-auto">
              {nextDayVacations.map(v => {
                const eng = engineers.find(e => e.id === v.engineerId);
                return (
                  <div key={`nv-vac-${v.id}`} className="text-[8.5px] leading-tight p-1 rounded bg-teal-50 border border-teal-150 border-l-4 border-l-teal-500 text-teal-900 font-bold truncate flex items-center gap-1 select-none">
                    <span>🌴</span>
                    <span className="truncate">Vac: {eng?.name.replace('Ing. ', '').split(' ')[0]}</span>
                  </div>
                );
              })}
              {nextDayOrders.map(wo => {
                const eng = engineers.find(e => e.id === wo.engineerId);
                const client = clients.find(c => c.id === wo.clientId);
                const supportIds = wo.supportEngineerIds && wo.supportEngineerIds.length > 0
                  ? wo.supportEngineerIds
                  : (wo.supportEngineerId ? [wo.supportEngineerId] : []);
                const engColor = eng ? getEngineerColorClasses(eng.id) : null;
                const borderLClass = wo.isEquipmentDown
                  ? 'border-l-4 border-l-red-500'
                  : (engColor ? `border-l-4 ${engColor.borderL}` : '');
                let badgeBg = 'bg-amber-50 text-amber-955 border border-amber-150';
                if (wo.isEquipmentDown) badgeBg = 'bg-red-50 text-red-955 border border-red-150';
                else if (wo.status === 'Conciliado') badgeBg = 'bg-emerald-50 text-emerald-955 border border-emerald-150';
                else if (wo.status === 'Reportado') badgeBg = 'bg-indigo-50 text-indigo-955 border border-indigo-150';
                else if (wo.status === 'Realizado') badgeBg = 'bg-blue-50 text-blue-955 border border-blue-150';
                else if (wo.status === 'En Proceso') badgeBg = 'bg-sky-50 text-sky-955 border border-sky-150';
                else if (wo.status === 'Pendiente') badgeBg = 'bg-yellow-50 text-yellow-955 border border-yellow-150';
                return (
                  <div
                    key={`nv-wo-${wo.id}`}
                    className={`text-[9.5px] leading-tight p-1.5 rounded mb-1 text-left transition-all font-medium cursor-pointer hover:shadow-sm select-none ${badgeBg} ${borderLClass}`}
                    onClick={e => { e.stopPropagation(); setInfoWO(wo); }}
                    title={`${client?.name || ''} - ${wo.equipmentName}`}
                  >
                    <p className="font-black truncate text-slate-900 leading-none mb-0.5">{client?.name || 'Cliente'}</p>
                    {wo.plannedTime && (
                      <p className="text-indigo-700 text-[8px] font-bold mt-0.5 leading-none">⏰ {wo.plannedTime}</p>
                    )}
                    <p className="truncate text-slate-700 text-[8.5px] font-normal mt-0.5">{wo.equipmentName}</p>
                    <p className="truncate text-indigo-900 text-[7.5px] font-bold mt-0.5 flex items-center gap-0.5">
                      <span className="mr-0.5">{eng ? getEngineerEmoji(eng.id) : '👤'}</span>
                      {eng?.name.replace('Ing. ', '').split(' ')[0]}
                      {supportIds.length > 0 && (
                        <span className="flex items-center gap-1 ml-1">
                          {supportIds.map(id => {
                            const sEng = engineers.find(e => e.id === id);
                            if (!sEng) return null;
                            return <span key={id}>+ {getEngineerEmoji(sEng.id)} {sEng.name.replace('Ing. ', '').split(' ')[0]}</span>;
                          })}
                        </span>
                      )}
                    </p>
                    <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-200/40">
                      <span className="text-[7.5px] text-slate-450 font-bold tracking-tight select-none no-print">Detalles / Editar</span>
                      <span className={`text-[7.5px] font-extrabold px-1.5 py-0.5 rounded border ml-auto ${
                        wo.isEquipmentDown ? 'bg-red-100 text-red-800 border-red-200'
                        : wo.status === 'Conciliado' ? 'bg-emerald-100/50 text-emerald-805 border-emerald-200'
                        : wo.status === 'Reportado' ? 'bg-indigo-100/50 text-indigo-805 border-indigo-200'
                        : wo.status === 'Realizado' ? 'bg-blue-100/50 text-blue-805 border-blue-200'
                        : wo.status === 'En Proceso' ? 'bg-sky-100/50 text-sky-850 border-sky-200'
                        : 'bg-yellow-100/50 text-yellow-850 border-yellow-200'
                      }`}>{wo.isEquipmentDown ? 'Parado ⚠️' : wo.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
    }

    return calendarDays;
  };

  // Filtered orders for the lists
  const filteredOrders = workOrders.filter(wo => {
    const client = clients.find(c => c.id === wo.clientId);
    const eng = engineers.find(e => e.id === wo.engineerId);
    
    const matchesSearch = 
      wo.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eng?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'todos' || wo.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Get all work orders that overlap with the selected dashboard period
  const filteredDashOrders = React.useMemo(() => {
    return workOrders.filter(wo => {
      const start = new Date(wo.plannedDate + 'T00:00:00');
      const duration = wo.durationDays || 1;
      const end = new Date(start);
      end.setDate(start.getDate() + (duration - 1));

      let periodStart: Date;
      let periodEnd: Date;

      if (dashPeriod === 'month') {
        periodStart = new Date(dashYear, dashMonth - 1, 1);
        periodEnd = new Date(dashYear, dashMonth, 0, 23, 59, 59);
      } else if (dashPeriod === 'semester') {
        if (dashSemester === 1) {
          periodStart = new Date(dashYear, 0, 1);
          periodEnd = new Date(dashYear, 5, 30, 23, 59, 59);
        } else {
          periodStart = new Date(dashYear, 6, 1);
          periodEnd = new Date(dashYear, 11, 31, 23, 59, 59);
        }
      } else {
        periodStart = new Date(dashYear, 0, 1);
        periodEnd = new Date(dashYear, 11, 31, 23, 59, 59);
      }

      return start <= periodEnd && end >= periodStart;
    });
  }, [workOrders, dashPeriod, dashMonth, dashSemester, dashYear]);

  // Compute workload metrics and status breakdowns per engineer for the selected period
  const engineerStats = React.useMemo(() => {
    const statsMap: Record<string, {
      engineer: Engineer;
      total: number;
      asPrimary: number;
      asSupport: number;
      statusCounts: Record<WorkOrderStatus, number>;
    }> = {};

    engineers.forEach(e => {
      statsMap[e.id] = {
        engineer: e,
        total: 0,
        asPrimary: 0,
        asSupport: 0,
        statusCounts: {
          Pendiente: 0,
          'En Proceso': 0,
          Realizado: 0,
          Reportado: 0,
          Conciliado: 0
        }
      };
    });

    filteredDashOrders.forEach(wo => {
      if (statsMap[wo.engineerId]) {
        statsMap[wo.engineerId].total++;
        statsMap[wo.engineerId].asPrimary++;
        statsMap[wo.engineerId].statusCounts[wo.status]++;
      }
      const supportIds = wo.supportEngineerIds && wo.supportEngineerIds.length > 0
        ? wo.supportEngineerIds
        : (wo.supportEngineerId ? [wo.supportEngineerId] : []);
      supportIds.forEach(id => {
        if (statsMap[id]) {
          statsMap[id].total++;
          statsMap[id].asSupport++;
          statsMap[id].statusCounts[wo.status]++;
        }
      });
    });

    return Object.values(statsMap).sort((a, b) => b.total - a.total);
  }, [filteredDashOrders, engineers]);

  // Calculate overall summary metrics
  const dashboardKPIs = React.useMemo(() => {
    const totalOrders = filteredDashOrders.length;
    const activeEngineersCount = engineers.length;
    const averageJobs = activeEngineersCount > 0 ? Number((totalOrders / activeEngineersCount).toFixed(1)) : 0;
    
    let topEngineerName = 'Ninguno';
    let maxJobs = 0;
    engineerStats.forEach(st => {
      if (st.total > maxJobs) {
        maxJobs = st.total;
        topEngineerName = st.engineer.name;
      }
    });

    let completedCount = 0;
    filteredDashOrders.forEach(wo => {
      if (wo.status === 'Realizado' || wo.status === 'Reportado' || wo.status === 'Conciliado') {
        completedCount++;
      }
    });
    const complianceRate = totalOrders > 0 ? Math.round((completedCount / totalOrders) * 100) : 0;

    return {
      totalOrders,
      averageJobs,
      topEngineerName: maxJobs > 0 ? `${topEngineerName.replace('Ing. ', '')} (${maxJobs})` : 'Ninguno',
      complianceRate
    };
  }, [filteredDashOrders, engineerStats, engineers]);

  // Helper handlers for managing engineers list and status
  const handleCreateNewEngineer = () => {
    if (!newEngName.trim()) {
      alert("Por favor ingrese el nombre del técnico.");
      return;
    }
    const newId = `ENG-DYN-${100 + engineers.length}-${Math.floor(Math.random() * 105)}`;
    const newEng: Engineer = {
      id: newId,
      name: newEngName.trim(),
      specialty: newEngSpecialty,
      email: `${newEngName.toLowerCase().replace(/[^a-z0-9]/g, '')}@orimec.com`,
      phone: '+593 999 999 999',
      avatar: '',
      availability: 'Disponible',
      skills: [newEngSpecialty]
    };
    if (onUpdateEngineer) {
      onUpdateEngineer(newEng);
    }
    setNewEngName('');
    setIsAddingNewEng(false);
  };

  const handleUpdateEngAvailability = (eng: Engineer, availability: 'Disponible' | 'En Campo' | 'Inactivo') => {
    const updatedEng = { ...eng, availability };
    if (onUpdateEngineer) {
      onUpdateEngineer(updatedEng);
    }
  };

  const handleDeleteEngClick = (eng: Engineer) => {
    setEngToDelete(eng);
  };

  const handleConfirmDeleteEng = () => {
    if (engToDelete && onDeleteEngineer) {
      onDeleteEngineer(engToDelete.id);
    }
    setEngToDelete(null);
  };

  const filteredEngineersForList = React.useMemo(() => {
    return engineers.filter(eng => {
      const query = engSearchQuery.toLowerCase();
      return eng.name.toLowerCase().includes(query) || eng.specialty.toLowerCase().includes(query);
    });
  }, [engineers, engSearchQuery]);

  // Get all work orders scheduled in the current selected month/year
  const currentMonthWOs = React.useMemo(() => {
    return workOrders.filter(wo => {
      const dateObj = new Date(wo.plannedDate + 'T00:00:00');
      return dateObj.getMonth() + 1 === calendarMonth && dateObj.getFullYear() === calendarYear;
    });
  }, [workOrders, calendarMonth, calendarYear]);

  const handleConfirmResetMonth = () => {
    if (resetConfirmText.toUpperCase() === `REINICIAR ${calendarMonthName.toUpperCase()}`) {
      const idsToDelete = currentMonthWOs.map(wo => wo.id);
      if (onDeleteWorkOrders) {
        onDeleteWorkOrders(idsToDelete);
      }
      setIsResetModalOpen(false);
      setResetConfirmText('');
    }
  };

  const handleConfirmReportMonth = () => {
    if (reportMonthConfirmText.toUpperCase() === `REPORTAR ${calendarMonthName.toUpperCase()}`) {
      const wosToReport = currentMonthWOs.filter(wo => wo.status !== 'Reportado' && wo.status !== 'Conciliado');
      
      if (wosToReport.length > 0) {
        const newReports: TechnicalReport[] = [];
        const woUpdates: { id: string; status: WorkOrderStatus }[] = [];
        
        wosToReport.forEach(wo => {
          const reportId = `REP-${wo.id}-${Math.floor(Math.random() * 1000)}`;
          const eng = engineers.find(e => e.id === wo.engineerId);
          const client = clients.find(c => c.id === wo.clientId);
          
          const rep: TechnicalReport = {
            id: reportId,
            workOrderId: wo.id,
            executionDate: wo.plannedDate,
            hoursSpent: 3.5,
            technicalFindings: "Mantenimiento preventivo rutinario concluido satisfactoriamente. Parámetros de funcionamiento estables.",
            actionsTaken: "Acondicionamiento y limpieza de filtros, verificación de conexiones eléctricas y control de temperatura.",
            materialsUsed: [],
            nextRecommendations: 'Siguiente monitoreo rutinario recomendado para el siguiente período.',
            technicianSignature: eng?.name || 'Administrador / Gestión Técnica',
            clientSignatureName: client?.contactName || 'Firma Cliente',
            validationState: 'aprobado',
            validationNotes: 'Registrado masivamente por el administrador desde el cronograma.',
            validatedAt: wo.plannedDate
          };

          newReports.push(rep);
          woUpdates.push({ id: wo.id, status: 'Reportado' });
        });

        if (onBatchReportWorkOrders) {
          onBatchReportWorkOrders(newReports, woUpdates);
        } else {
          newReports.forEach(r => onSubmitTechnicalReport(r));
          woUpdates.forEach(u => onUpdateWorkOrderStatus(u.id, u.status));
        }
      }
      
      setIsReportMonthModalOpen(false);
      setReportMonthConfirmText('');
    }
  };

  const handleConfirmMerge = () => {
    if (engToMerge && mergeTargetId && onMergeEngineers) {
      onMergeEngineers(engToMerge.id, mergeTargetId);
    }
    setEngToMerge(null);
    setMergeTargetId('');
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
          .no-print, header, footer, button, nav, #root > :not(.printable-report-card), #admin-portal-root > :not(#rete04-printable-area) {
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
                className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-1.5 px-3 rounded-lg text-3xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              >
                Imprimir / PDF
              </button>
              <button
                type="button"
                onClick={() => setIsViewingRETE04(false)}
                className="bg-slate-200 hover:bg-slate-350 text-slate-700 font-bold py-1.5 px-3 rounded-lg text-3xs cursor-pointer transition-colors"
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

  const handleClientCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          setClientCsvError("El archivo CSV está vacío o sin formato válido.");
          return;
        }
        const formatted: Client[] = parsed.map(row => {
          // Detect if it is a SUCURSAL sheet or TERCERO sheet by checking key substring
          const isSucursalSheet = Object.keys(row).some(k => k.toLowerCase().includes('sucursal'));
          
          let id = '';
          let name = '';
          let address = '';
          let zone = '';
          let contact = '';
          let phone = '';
          
          if (isSucursalSheet) {
            id = getRowVal(row, ['codigo sucursal', 'codigosucursal', 'id', 'nit', 'ruc', 'ruc cli', 'ruccli', 'ruc cliente', 'ruc_cliente']);
            name = getRowVal(row, ['nombre sucursal', 'nombresucursal', 'name']);
            address = getRowVal(row, ['direccion', 'address']);
            zone = getRowVal(row, ['codigo zona', 'codigozona', 'zona']);
            contact = getRowVal(row, ['contacto', 'contact']);
            phone = getRowVal(row, ['telefono', 'phone']);
          } else {
            id = getRowVal(row, ['ruc cli', 'ruccli', 'ruc_cli', 'ruc cliente', 'ruc_cliente', 'ruc', 'id', 'nit', 'cedula']);
            name = getRowVal(row, ['razon social', 'razonsocial', 'name', 'nombre']);
            address = getRowVal(row, ['direccion', 'address']);
            zone = getRowVal(row, ['codigo zona', 'codigozona', 'zona', 'sucursal', 'ciudad']);
            contact = getRowVal(row, ['contacto', 'contact']);
            phone = getRowVal(row, ['telefono', 'phone']);
          }

          if (!id) {
            id = `CLI-${Math.floor(Math.random() * 100000)}`;
          }
          if (!name) {
            name = isSucursalSheet ? 'Sucursal Sin Nombre' : 'Tercero Sin Nombre';
          }

          return {
            id: id,
            name: name,
            address: address,
            industry: cleanZoneCode(zone),
            contactName: contact,
            contactPhone: phone,
            installedEquipments: []
          };
        });

        if (onBulkUploadClients) {
          onBulkUploadClients(formatted);
          setIsClientImporterOpen(false);
          setClientCsvError(null);
        }
      } catch (err) {
        setClientCsvError("Error al procesar el archivo CSV: " + String(err));
      }
    };
    reader.readAsText(file);
  };

  const handleEquipCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEquipCsvError(null);
    setEquipCsvSuccess(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          setEquipCsvError("El archivo CSV está vacío o sin formato válido.");
          return;
        }

        const firstRow = parsed[0];
        const firstRowKeys = Object.keys(firstRow || {});
        const hasKeyNormalized = (keysToSearch: string[]) => {
          return firstRowKeys.some(k => {
            const norm = k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "").trim();
            return keysToSearch.some(target => {
              const targetNorm = target.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "").trim();
              return norm === targetNorm;
            });
          });
        };

        const isModelSheet = hasKeyNormalized(['codigo modelo', 'codigomodelo', 'codigo_modelo', 'val marca', 'valmarca', 'val_marca']) && 
                             !hasKeyNormalized(['numero se', 'numerose', 'numero_se', 'sidge', 'sid ge', 'ruc cli', 'ruccli', 'ruc_cli', 'serialnumber', 'serial number']);

        if (isModelSheet) {
          const newLookup: Record<string, { name: string; brand: string; family: string }> = { ...modelsLookup };
          let loadedCount = 0;
          parsed.forEach(row => {
            const modelCode = getRowVal(row, ['codigo modelo', 'codigomodelo', 'codigo_modelo', 'codigo modelo']);
            const modelName = getRowVal(row, ['nombre', 'name', 'nombre modelo']);
            const brandVal = getRowVal(row, ['val marca', 'valmarca', 'val_marca', 'marca']) || 
                             translateBrand(getRowVal(row, ['codigo marca', 'codigomarca', 'codigo_marca']));
            const familyVal = getRowVal(row, ['codigo familia', 'codigofamilia', 'codigo_familia', 'familia']);
            
            if (modelCode) {
              newLookup[modelCode.toUpperCase().trim()] = {
                name: modelName || modelCode,
                brand: brandVal || 'GENERAL ELECTRIC',
                family: familyVal
              };
              loadedCount++;
            }
          });
          setModelsLookup(newLookup);
          setEquipCsvSuccess(`Se cargaron con éxito ${loadedCount} modelos de referencia en el diccionario temporal (Total en cache: ${Object.keys(newLookup).length} modelos).`);
          setEquipCsvError(null);
          e.target.value = '';
          return;
        }

        // It is an EQUIPO sheet
        const newClientsToRegister: Client[] = [];
        const currentClients = [...clients];

        const formatted: Equipment[] = parsed.map((row, idx) => {
          const sidge = getRowVal(row, ['sid ge', 'sidge', 'sid', 'id', 'codigo', 'codigo_equipo']);
          const serialVal = getRowVal(row, ['numero se', 'numerose', 'numero_se', 'serialNumber', 'serial', 'serie']);
          const modelCode = getRowVal(row, ['codigo_mo', 'codigomo', 'codigo modelo', 'cod_modelo']);
          const modelText = getRowVal(row, ['modelo', 'model']);
          const rucCli = getRowVal(row, ['ruc cli', 'ruccli', 'ruc_cli', 'ruc cliente', 'ruc_cliente', 'ruc', 'cliente', 'clientId', 'nit', 'nit cliente', 'nit_cliente', 'nit_cli', 'nitcli']);
          const sucurs = getRowVal(row, ['sucurs', 'sucursal', 'area', 'área']);
          const statusVal = getRowVal(row, ['status', 'estado', 'estado equipo']);
          const desc = getRowVal(row, ['descripcio', 'descripcion', 'description']);

          let id = sidge || serialVal;
          if (!id) {
            id = `EQ-${Math.floor(Math.random() * 100050)}-${idx}`;
          }

          let serial = serialVal;
          if (!serial) {
            serial = id;
          }

          // Try to resolve client ID by RUC first, then fallback to name matching
          let resolvedClientId = rucCli;
          const clientNameVal = getRowVal(row, ['nombre cliente', 'nombrecliente', 'nombre_cliente', 'cliente', 'clientName', 'client_name', 'razon social', 'razonsocial']);

          // Check if client RUC/ID is already in currentClients
          let foundClient = resolvedClientId ? currentClients.find(c => c.id === resolvedClientId) : undefined;
          if (!foundClient && clientNameVal) {
            // Check if there is a soft-match by name in currentClients
            const cleanClientName = (str: string): string => {
              return str.toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/\b(s\.?a\.?|c\.?a\.?|cia\.?|ltda\.?|limitada|corp\.?|corporation|inc\.?|incorporated|s\.?a\.?s\.?|de|el|la|los|las)\b/g, '')
                .replace(/-?\s*\b(cue|uio|gye|quito|guayaquil|cuenca|ambato|loja|manta|portoviejo|riobamba)\b/gi, '')
                .replace(/[^a-z0-9]/g, '')
                .trim();
            };
            const cleanTarget = cleanClientName(clientNameVal);
            if (cleanTarget) {
              foundClient = currentClients.find(c => {
                const cleanDbName = cleanClientName(c.name);
                if (!cleanDbName) return false;
                return cleanDbName.includes(cleanTarget) || cleanTarget.includes(cleanDbName);
              });
            }
          }

          if (foundClient) {
            resolvedClientId = foundClient.id;
          } else {
            // Client does NOT exist. Create a new client dynamically!
            const newClientName = clientNameVal || (rucCli ? `Cliente RUC ${rucCli}` : 'Cliente Nuevo Ingestor');
            const cleanNewName = newClientName.replace(/^(cliente:?)\s*/i, '').trim();
            const normClean = cleanNewName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
            const alphaNumClean = normClean.replace(/[^a-z0-9]/g, '');

            if (alphaNumClean) {
              const newId = rucCli || `CLI-DYN-${100 + currentClients.length}-${Math.floor(Math.random()*100)}`;
              const newCli: Client = {
                id: newId,
                name: cleanNewName,
                address: sucurs ? `Sucursal: ${sucurs}` : 'Dirección por registrar (Ingestor)',
                industry: 'General / Salud',
                contactName: 'Contacto por registrar',
                contactPhone: '',
                installedEquipments: [id]
              };
              currentClients.push(newCli);
              newClientsToRegister.push(newCli);
              resolvedClientId = newId;
            } else {
              resolvedClientId = 'CLI-101'; // Fallback
            }
          }

          // Case-insensitive lookup in modelsLookup
          const lookupKey = modelCode.toUpperCase().trim();
          const lookup = modelsLookup[lookupKey];

          // Determine Model Name
          const modelName = lookup?.name || modelText || lookupKey || 'Modelo Desconocido';

          // Helper brand detector
          const detectBrandFromModelText = (txt: string): string => {
            const utxt = txt.toUpperCase();
            if (utxt.includes('REVOLUTION') || utxt.includes('OPTIMA') || utxt.includes('BRIGHTSPEED') || utxt.includes('BGS') || utxt.includes('HIGHSPEED') || utxt.includes('LIGHTSPEED') || utxt.includes('AMX') || utxt.includes('SIGNA') || utxt.includes('LOGIQ') || utxt.includes('VIVID')) {
              return 'GENERAL ELECTRIC';
            }
            if (utxt.includes('DRYPIX') || utxt.includes('D-EVO') || utxt.includes('FUJI')) {
              return 'FUJIFILM';
            }
            if (utxt.includes('TRIMAX') || utxt.includes('CARESTREAM') || utxt.includes('DIRECTVIEW')) {
              return 'CARESTREAM';
            }
            if (utxt.includes('NEMOTO')) {
              return 'NEMOTO';
            }
            if (utxt.includes('ECHOLIGHT')) {
              return 'ECHOLIGHT';
            }
            if (utxt.includes('SKANRAY')) {
              return 'SKANRAY';
            }
            if (utxt.includes('MAMMOTOME')) {
              return 'MAMMOTOME';
            }
            return 'GENERAL ELECTRIC';
          };

          // Determine Brand
          let brandName = lookup?.brand;
          if (!brandName) {
            const csvBrand = getRowVal(row, ['brand', 'marca', 'codigo marca', 'val marca']);
            brandName = translateBrand(csvBrand) || detectBrandFromModelText(modelName);
          }

          // Helper family detector
          const detectFamilyFromModelText = (txt: string): string => {
            const utxt = txt.toUpperCase();
            if (utxt.includes('CT') || utxt.includes('TOMO') || utxt.includes('OPTIMA') || utxt.includes('BRIGHTSPEED') || utxt.includes('LIGHTSPEED') || utxt.includes('SPEED')) {
              return 'TOMOGRAFÍA';
            }
            if (utxt.includes('MR') || utxt.includes('RESONA') || utxt.includes('SIGNA')) {
              return 'RESONANCIA';
            }
            if (utxt.includes('MG') || utxt.includes('MAMO') || utxt.includes('SENOGRAPHE')) {
              return 'MAMOGRAFÍA';
            }
            if (utxt.includes('TRIMAX') || utxt.includes('DRYPIX') || utxt.includes('IMP') || utxt.includes('PRINT')) {
              return 'IMPRESORAS';
            }
            if (utxt.includes('NEMOTO') || utxt.includes('INY') || utxt.includes('CX-100') || utxt.includes('MR-200') || utxt.includes('AG-300') || utxt.includes('CT400') || utxt.includes('MR500')) {
              return 'INYECTORAS';
            }
            return '';
          };

          // Determine name
          const familyCode = lookup?.family || getRowVal(row, ['family', 'familia', 'codigo familia']);
          const familyName = translateFamily(familyCode) || detectFamilyFromModelText(modelName);
          const name = familyName ? `${familyName} - ${modelName}` : (desc || modelName || 'Equipo biomédico');

          // Determine status
          const status = statusVal.toLowerCase().includes('no') ? 'No Operativo' : 'Operativo';

          return {
            id: id,
            name: name,
            clientId: resolvedClientId,
            brand: brandName,
            model: modelName,
            serialNumber: serial,
            softwareVersion: desc || '', // Use desc as sw version or description helper
            sucursal: sucurs,
            status: status as any
          };
        });

        if (newClientsToRegister.length > 0 && onBulkUploadClients) {
          onBulkUploadClients(newClientsToRegister);
        }

        if (onBulkUploadEquipments) {
          onBulkUploadEquipments(formatted);
          setIsEquipImporterOpen(false);
          setEquipCsvError(null);
          setEquipCsvSuccess(`Se cargaron con éxito ${formatted.length} equipos y ${newClientsToRegister.length} clientes nuevos en la base de datos.`);
          e.target.value = '';
        }
      } catch (err) {
        setEquipCsvError("Error al procesar el archivo CSV: " + String(err));
      }
    };
    reader.readAsText(file);
  };

  const handleContractCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          setContractCsvError("El archivo CSV está vacío o sin formato válido.");
          return;
        }
        const formatted: Contract[] = parsed.map(row => {
          let id = getRowVal(row, ['id', 'contrato', 'número', 'numero', 'id contrato']);
          let clientId = getRowVal(row, ['clientId', 'cliente', 'nit', 'nit cliente', 'ruc']);
          let typeVal = getRowVal(row, ['type', 'tipo']);
          let start = getRowVal(row, ['startDate', 'inicio', 'fecha inicio', 'fechainicio']);
          let end = getRowVal(row, ['endDate', 'fin', 'fecha fin', 'fechafin', 'vencimiento']);
          let statusVal = getRowVal(row, ['status', 'estado']);
          let coverage = getRowVal(row, ['coverage', 'cobertura', 'detalle']);

          if (!id) {
            id = `CON-${Math.floor(Math.random() * 100000)}`;
          }

          // Normalizations
          let type: any = 'Facturable';
          if (typeVal.toLowerCase().includes('garantia') || typeVal.toLowerCase().includes('contrato')) {
            type = 'Garantía extendida/Contrato';
          } else if (typeVal.toLowerCase().includes('compra')) {
            type = 'Garantía de compra';
          } else if (typeVal.toLowerCase().includes('otro')) {
            type = 'Otro';
          }

          let status: any = 'Activo';
          if (statusVal.toLowerCase().includes('venc') || statusVal.toLowerCase().includes('exp')) {
            status = 'Vencido';
          } else if (statusVal.toLowerCase().includes('pend')) {
            status = 'Pendiente';
          }

          return {
            id: id,
            clientId: clientId,
            type: type,
            startDate: start || currentDateStr,
            endDate: end || currentDateStr,
            status: status,
            coverage: coverage
          };
        });

        if (onBulkUploadContracts) {
          onBulkUploadContracts(formatted);
          setIsContractImporterOpen(false);
          setContractCsvError(null);
        }
      } catch (err) {
        setContractCsvError("Error al procesar el archivo CSV: " + String(err));
      }
    };
    reader.readAsText(file);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientFormId || !clientFormName) return;
    const cli: Client = {
      id: clientFormId.trim(),
      name: clientFormName.trim(),
      address: clientFormAddress.trim(),
      industry: clientFormCity.trim(),
      contactName: clientFormContact.trim(),
      contactPhone: clientFormPhone.trim(),
      installedEquipments: editingClient?.installedEquipments || []
    };
    if (onAddClient) {
      onAddClient(cli);
      setIsClientModalOpen(false);
      setEditingClient(null);
    }
  };

  const handleSaveEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipFormId || !equipFormName || !equipFormClientId) return;
    const eq: Equipment = {
      id: equipFormId.trim(),
      name: equipFormName.trim(),
      clientId: equipFormClientId.trim(),
      brand: equipFormBrand.trim(),
      model: equipFormModel.trim(),
      serialNumber: equipFormSerial.trim(),
      softwareVersion: equipFormSW.trim(),
      sucursal: equipFormSucursal.trim(),
      status: equipFormStatus
    };
    if (editingEquip) {
      if (onUpdateEquipment) onUpdateEquipment(eq);
    } else {
      if (onAddEquipment) onAddEquipment(eq);
    }
    setIsEquipModalOpen(false);
    setEditingEquip(null);
  };

  const handleSaveContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractFormId || !contractFormClientId) return;
    const con: Contract = {
      id: contractFormId.trim(),
      clientId: contractFormClientId.trim(),
      type: contractFormType,
      startDate: contractFormStart,
      endDate: contractFormEnd,
      status: contractFormStatus,
      coverage: contractFormCoverage.trim()
    };
    if (editingContract) {
      if (onUpdateContract) onUpdateContract(con);
    } else {
      if (onAddContract) onAddContract(con);
    }
    setIsContractModalOpen(false);
    setEditingContract(null);
  };

  const renderClientesTab = () => {
    const query = clientSearch.toLowerCase().trim();
    const filtered = clients.filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.id.toLowerCase().includes(query) ||
      c.address.toLowerCase().includes(query) ||
      (c.contactName || '').toLowerCase().includes(query)
    );

    const itemsPerPage = 10;
    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
    const paginated = filtered.slice((clientPage - 1) * itemsPerPage, clientPage * itemsPerPage);

    return (
      <div className="space-y-6 font-sans">
        {/* Header Block */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
          <div>
            <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-650" />
              Gestión de Terceros y Clientes
            </h4>
            <p className="text-3xs text-slate-500 mt-0.5 font-medium">Administra la información de clientes, RUC/cédula, sucursales y datos de contacto.</p>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => setIsClientImporterOpen(!isClientImporterOpen)}
              className={`font-semibold text-3xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 border transition-all cursor-pointer ${
                isClientImporterOpen 
                  ? 'bg-amber-600 border-amber-600 text-white' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isClientImporterOpen ? 'Ocultar Ingestor' : '📥 Importar CSV'}</span>
            </button>
            <button
              onClick={() => {
                setEditingClient(null);
                setClientFormId('');
                setClientFormName('');
                setClientFormAddress('');
                setClientFormCity('');
                setClientFormContact('');
                setClientFormPhone('');
                setIsClientModalOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-3xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs border border-indigo-600 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Cliente</span>
            </button>
          </div>
        </div>

        {/* CSV Importer Panel */}
        {isClientImporterOpen && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
              <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider font-mono">📥 Ingestor de Clientes (CSV)</h5>
              <button 
                onClick={() => {
                  const headers = ['id', 'name', 'address', 'sucursal', 'contactName', 'contactPhone', 'contactEmail'];
                  const sample = ['1792040001001', 'HOSPITAL METROPOLITANO', 'Av. Mariana de Jesús', 'Quito', 'Dra. María Elena', '099123456', 'contacto@hospital.com'];
                  const csv = "\uFEFF" + [headers.join(';'), sample.join(';')].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'formato_clientes_mtorimec.csv';
                  a.click();
                }}
                className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                📥 Descargar Plantilla Ejemplo
              </button>
            </div>
            <p className="text-3xs text-slate-505 font-medium leading-relaxed">
              El archivo debe ser un CSV separado por comas o punto y coma. Las cabeceras requeridas son: **id** (RUC/cédula), **name** (Nombre), **address** (Dirección) y **sucursal** (Ciudad).
            </p>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept=".csv"
                onChange={handleClientCsvUpload}
                className="block w-full text-3xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-3xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 file:cursor-pointer hover:file:bg-indigo-100 transition-all"
              />
              {clientCsvError && (
                <div className="text-3xs text-red-650 font-bold bg-red-50 p-2 rounded-lg border border-red-100 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  <span>{clientCsvError}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filter and Search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Buscar por RUC/cédula, nombre, dirección o contacto..."
              value={clientSearch}
              onChange={(e) => {
                setClientSearch(e.target.value);
                setClientPage(1);
              }}
              className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-4 py-1.5 text-xs font-semibold text-slate-700 outline-hidden focus:ring-1 focus:ring-indigo-500 placeholder-slate-400"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider">{filtered.length} Clientes encontrados</span>
        </div>

        {/* Clients Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left border-collapse text-[11px] font-sans">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-655 font-extrabold uppercase text-[9px] tracking-wider">
                <th className="p-3.5">Cédula / RUC</th>
                <th className="p-3.5">Nombre de Cliente</th>
                <th className="p-3.5">Dirección</th>
                <th className="p-3.5">Ciudad / Sucursal</th>
                <th className="p-3.5">Contacto Principal</th>
                <th className="p-3.5">Teléfono</th>
                <th className="p-3.5 text-right no-print">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-750 font-medium">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-slate-400 font-semibold italic">
                    No se encontraron clientes.
                  </td>
                </tr>
              ) : (
                paginated.map(cli => (
                  <tr key={cli.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-900">{cli.id}</td>
                    <td className="p-3.5 font-extrabold text-slate-900">{cli.name}</td>
                    <td className="p-3.5">{cli.address}</td>
                    <td className="p-3.5 font-bold text-indigo-700">{cli.industry || '-'}</td>
                    <td className="p-3.5">{cli.contactName || '-'}</td>
                    <td className="p-3.5 font-mono">{cli.contactPhone || '-'}</td>
                    <td className="p-3.5 text-right no-print">
                      <button
                        onClick={() => {
                          setEditingClient(cli);
                          setClientFormId(cli.id);
                          setClientFormName(cli.name);
                          setClientFormAddress(cli.address);
                          setClientFormCity(cli.industry || '');
                          setClientFormContact(cli.contactName || '');
                          setClientFormPhone(cli.contactPhone || '');
                          setIsClientModalOpen(true);
                        }}
                        className="text-indigo-650 hover:text-indigo-900 hover:bg-indigo-50 font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between font-sans">
              <span className="text-3xs text-slate-500 font-medium">Pág. {clientPage} de {totalPages}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setClientPage(prev => Math.max(prev - 1, 1))}
                  disabled={clientPage === 1}
                  className="px-2.5 py-1 text-3xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setClientPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={clientPage === totalPages}
                  className="px-2.5 py-1 text-3xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEquiposTab = () => {
    const query = equipSearch.toLowerCase().trim();
    const filtered = equipments.filter(eq => {
      const client = clients.find(c => c.id === eq.clientId);
      return (
        eq.name.toLowerCase().includes(query) ||
        eq.id.toLowerCase().includes(query) ||
        eq.brand.toLowerCase().includes(query) ||
        eq.model.toLowerCase().includes(query) ||
        eq.serialNumber.toLowerCase().includes(query) ||
        (eq.sucursal || '').toLowerCase().includes(query) ||
        (client?.name || '').toLowerCase().includes(query)
      );
    });

    const itemsPerPage = 10;
    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
    const paginated = filtered.slice((equipPage - 1) * itemsPerPage, equipPage * itemsPerPage);

    return (
      <div className="space-y-6 font-sans">
        {/* Header Block */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
          <div>
            <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-655" />
              Gestión de Equipos y Activos
            </h4>
            <p className="text-3xs text-slate-500 mt-0.5 font-medium">Administra los equipos biomédicos, marcas, modelos, series y versiones de software instaladas.</p>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => setIsEquipImporterOpen(!isEquipImporterOpen)}
              className={`font-semibold text-3xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 border transition-all cursor-pointer ${
                isEquipImporterOpen 
                  ? 'bg-amber-600 border-amber-600 text-white' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isEquipImporterOpen ? 'Ocultar Ingestor' : '📥 Importar CSV'}</span>
            </button>
            <button
              onClick={() => {
                setEditingEquip(null);
                setEquipFormId('');
                setEquipFormName('');
                setEquipFormClientId(clients[0]?.id || '');
                setEquipFormBrand('GENERAL ELECTRIC');
                setEquipFormModel('');
                setEquipFormSerial('');
                setEquipFormSW('');
                setEquipFormSucursal('');
                setEquipFormStatus('Operativo');
                setIsEquipModalOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-3xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs border border-indigo-600 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Equipo</span>
            </button>
          </div>
        </div>

        {/* CSV Importer Panel */}
        {isEquipImporterOpen && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="border-b border-slate-100 pb-2 flex flex-wrap justify-between items-center gap-2">
              <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Database className="w-4 h-4 text-indigo-500" />
                <span>Ingestor de Equipos / Catálogo (CSV)</span>
              </h5>
              <div className="flex gap-3 text-[10px] font-bold">
                <button 
                  onClick={() => {
                    const headers = ['CODIGO MODELO', 'NOMBRE', 'IDENTIFICADOR', 'CODIGO FAMILIA', 'CODIGO MARCA', 'id_subtipoCatalo', 'Val Repetidos', 'Val Marca'];
                    const sample = ['DEVOC43', 'D-EVO2 C43', 'Detector de rayos X, diseño ergonómico', 'DETRX', '2', '', 'OK', 'FUJIFILM'];
                    const csv = "\uFEFF" + [headers.join(';'), sample.join(';')].join('\n');
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'plantilla_modelos_mtorimec.csv';
                    a.click();
                  }}
                  className="text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
                >
                  📥 Plantilla Modelos
                </button>
                <span className="text-slate-300">|</span>
                <button 
                  onClick={() => {
                    const headers = ['MODELO', 'DESCRIPCIO', 'NUMERO SE', 'CODIGO_MO', 'SID GE', 'GON GE', 'Nombre Cliente', 'RUC CLI', 'Nombre Sucursal', 'SUCURS', 'DIRECCION DE UBICACION', 'PERSONA CONTACTO', 'INFORMACION ADICION', 'FECHA INSTALACION', 'FECHA VENCIMIENTO GARANTIA FABRICA'];
                    const sample = ['D-EVO2 C43', '', '1827391', 'DEVOC43', 'FUJI-1001', '', 'HOSPITAL DE ESPECIALIDADES', '1792040001001', '', 'SUCURSAL MALL 1792110491001 - 2', '', '', '', '15/3/2013', '14/3/2014'];
                    const csv = "\uFEFF" + [headers.join(';'), sample.join(';')].join('\n');
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'plantilla_equipos_mtorimec.csv';
                    a.click();
                  }}
                  className="text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
                >
                  📥 Plantilla Equipos
                </button>
              </div>
            </div>
            <div className="text-3xs text-slate-500 font-medium leading-relaxed space-y-1">
              <p>El archivo debe ser un CSV separado por comas o punto y coma.</p>
              <p>
                <strong className="text-indigo-600">💡 Instrucciones de Carga:</strong>
              </p>
              <ul className="list-disc list-inside ml-1 space-y-0.5">
                <li><strong>Paso 1:</strong> Cargue primero el archivo de Modelos (e.g. <code>MODELO_EQUIPO.csv</code>). Esto registrará en caché las referencias de modelo, marca y familia de forma temporal.</li>
                <li><strong>Paso 2:</strong> Cargue luego el archivo de Equipos (e.g. <code>EQUIPO.csv</code>). El ingestor cruzará la columna <code>CODIGO_MO</code> contra la caché para autocompletar la marca, familia y descripción del equipo.</li>
              </ul>
            </div>

            {Object.keys(modelsLookup).length > 0 && (
              <div className="bg-emerald-50/70 border border-emerald-100/80 text-emerald-800 text-[10px] font-bold px-3 py-2 rounded-lg flex items-center gap-2 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Maestro de Modelos activo en caché: <strong className="bg-emerald-100 text-emerald-950 px-1.5 py-0.5 rounded font-mono text-[11px]">{Object.keys(modelsLookup).length}</strong> modelos listos para autocompletado de Marcas y Familias.
                </span>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleEquipCsvUpload}
                  className="block text-3xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-3xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 file:cursor-pointer hover:file:bg-indigo-100 transition-all"
                />
                {onClearEquipments && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("¿Está seguro de que desea eliminar todos los equipos registrados en la base de datos? Esta acción eliminará los registros de Firestore de forma permanente.")) {
                        onClearEquipments();
                        setEquipCsvSuccess(null);
                        setEquipCsvError(null);
                      }
                    }}
                    className="text-[10px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar todos los Equipos</span>
                  </button>
                )}
              </div>
              {equipCsvError && (
                <div className="text-3xs text-red-650 font-bold bg-red-50 p-2 rounded-lg border border-red-100 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  <span>{equipCsvError}</span>
                </div>
              )}
              {equipCsvSuccess && (
                <div className="text-3xs text-emerald-800 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-100 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{equipCsvSuccess}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filter and Search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Buscar por ID, descripción, marca, serie, cliente..."
              value={equipSearch}
              onChange={(e) => {
                setEquipSearch(e.target.value);
                setEquipPage(1);
              }}
              className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-4 py-1.5 text-xs font-semibold text-slate-700 outline-hidden focus:ring-1 focus:ring-indigo-500 placeholder-slate-400"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider">{filtered.length} Equipos encontrados</span>
        </div>

        {/* Equipments Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left border-collapse text-[11px] font-sans">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-655 font-extrabold uppercase text-[9px] tracking-wider">
                <th className="p-3.5">Código / ID</th>
                <th className="p-3.5">Nombre / Descripción</th>
                <th className="p-3.5">Cliente</th>
                <th className="p-3.5">Marca / Modelo</th>
                <th className="p-3.5">Número de Serie</th>
                <th className="p-3.5">Versión SW / Sucursal</th>
                <th className="p-3.5">Estado</th>
                <th className="p-3.5 text-right no-print">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-750 font-medium">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-8 text-slate-400 font-semibold italic">
                    No se encontraron equipos registrados.
                  </td>
                </tr>
              ) : (
                paginated.map(eq => {
                  const client = clients.find(c => c.id === eq.clientId);
                  return (
                    <tr key={eq.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-900">{eq.id}</td>
                      <td className="p-3.5 font-extrabold text-slate-900">{eq.name}</td>
                      <td className="p-3.5 font-extrabold text-indigo-950">{client?.name || `ID: ${eq.clientId}`}</td>
                      <td className="p-3.5">
                        <span className="font-bold">{eq.brand}</span>
                        <div className="text-[10px] text-slate-500 font-medium">{eq.model}</div>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-700">{eq.serialNumber}</td>
                      <td className="p-3.5">
                        {eq.softwareVersion && <span className="bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-mono text-[9px] font-semibold">SW: {eq.softwareVersion}</span>}
                        <div className="text-[9px] text-slate-500 font-semibold mt-0.5">{eq.sucursal || '-'}</div>
                      </td>
                      <td className="p-3.5">
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                          eq.status === 'Operativo' 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : 'bg-red-50 text-red-800 border-red-200'
                        }`}>
                          {eq.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right no-print">
                        <button
                          onClick={() => {
                            setEditingEquip(eq);
                            setEquipFormId(eq.id);
                            setEquipFormName(eq.name);
                            setEquipFormClientId(eq.clientId);
                            setEquipFormBrand(eq.brand);
                            setEquipFormModel(eq.model);
                            setEquipFormSerial(eq.serialNumber);
                            setEquipFormSW(eq.softwareVersion || '');
                            setEquipFormSucursal(eq.sucursal || '');
                            setEquipFormStatus(eq.status);
                            setIsEquipModalOpen(true);
                          }}
                          className="text-indigo-655 hover:text-indigo-900 hover:bg-indigo-50 font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between font-sans">
              <span className="text-3xs text-slate-500 font-medium">Pág. {equipPage} de {totalPages}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setEquipPage(prev => Math.max(prev - 1, 1))}
                  disabled={equipPage === 1}
                  className="px-2.5 py-1 text-3xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setEquipPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={equipPage === totalPages}
                  className="px-2.5 py-1 text-3xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContratosTab = () => {
    const query = contractSearch.toLowerCase().trim();
    const filtered = contracts.filter(con => {
      const client = clients.find(c => c.id === con.clientId);
      return (
        con.id.toLowerCase().includes(query) ||
        con.type.toLowerCase().includes(query) ||
        (con.coverage || '').toLowerCase().includes(query) ||
        (client?.name || '').toLowerCase().includes(query)
      );
    });

    const itemsPerPage = 10;
    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
    const paginated = filtered.slice((contractPage - 1) * itemsPerPage, contractPage * itemsPerPage);

    return (
      <div className="space-y-6 font-sans">
        {/* Header Block */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
          <div>
            <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-650" />
              Gestión de Contratos y Garantías
            </h4>
            <p className="text-3xs text-slate-500 mt-0.5 font-medium">Administra los contratos de servicio, garantías comerciales y coberturas de mantenimiento.</p>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => setIsContractImporterOpen(!isContractImporterOpen)}
              className={`font-semibold text-3xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 border transition-all cursor-pointer ${
                isContractImporterOpen 
                  ? 'bg-amber-600 border-amber-600 text-white' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isContractImporterOpen ? 'Ocultar Ingestor' : '📥 Importar CSV'}</span>
            </button>
            <button
              onClick={() => {
                setEditingContract(null);
                setContractFormId('');
                setContractFormClientId(clients[0]?.id || '');
                setContractFormType('Garantía extendida/Contrato');
                setContractFormStart(currentDateStr);
                setContractFormEnd(currentDateStr);
                setContractFormStatus('Activo');
                setContractFormCoverage('');
                setIsContractModalOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-3xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs border border-indigo-600 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Contrato</span>
            </button>
          </div>
        </div>

        {/* CSV Importer Panel */}
        {isContractImporterOpen && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
              <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider font-mono font-bold">📥 Ingestor de Contratos (CSV)</h5>
              <button 
                onClick={() => {
                  const headers = ['id', 'clientId', 'type', 'startDate', 'endDate', 'status', 'coverage'];
                  const sample = ['CONTRATO-2026-004', '1792040001001', 'Garantía extendida/Contrato', '2026-01-01', '2026-12-31', 'Activo', 'Mantenimientos preventivos ilimitados y correctivos con 10% descuento'];
                  const csv = "\uFEFF" + [headers.join(';'), sample.join(';')].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'formato_contratos_mtorimec.csv';
                  a.click();
                }}
                className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                📥 Descargar Plantilla Ejemplo
              </button>
            </div>
            <p className="text-3xs text-slate-505 font-medium leading-relaxed">
              El archivo debe ser un CSV separado por comas o punto y coma. Las cabeceras requeridas son: **id** (Código/Nº Contrato), **clientId** (RUC de cliente registrado), **type** (Tipo de cobertura), **startDate** (Inicio en formato YYYY-MM-DD), **endDate** (Fin) y **status** (Activo/Vencido).
            </p>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept=".csv"
                onChange={handleContractCsvUpload}
                className="block w-full text-3xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-3xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 file:cursor-pointer hover:file:bg-indigo-100 transition-all"
              />
              {contractCsvError && (
                <div className="text-3xs text-red-650 font-bold bg-red-50 p-2 rounded-lg border border-red-100 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  <span>{contractCsvError}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filter and Search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Buscar por Nº Contrato, tipo, cobertura, cliente..."
              value={contractSearch}
              onChange={(e) => {
                setContractSearch(e.target.value);
                setContractPage(1);
              }}
              className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-4 py-1.5 text-xs font-semibold text-slate-700 outline-hidden focus:ring-1 focus:ring-indigo-500 placeholder-slate-400"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider">{filtered.length} Contratos encontrados</span>
        </div>

        {/* Contracts Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left border-collapse text-[11px] font-sans">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-655 font-extrabold uppercase text-[9px] tracking-wider">
                <th className="p-3.5">Nº Contrato</th>
                <th className="p-3.5">Cliente</th>
                <th className="p-3.5">Tipo de Contrato</th>
                <th className="p-3.5">Fecha Inicio</th>
                <th className="p-3.5">Fecha Vencimiento</th>
                <th className="p-3.5">Estado</th>
                <th className="p-3.5 font-bold">Detalle de Cobertura</th>
                <th className="p-3.5 text-right no-print">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-750 font-medium">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-8 text-slate-400 font-semibold italic">
                    No se encontraron contratos vigentes o vencidos.
                  </td>
                </tr>
              ) : (
                paginated.map(con => {
                  const client = clients.find(c => c.id === con.clientId);
                  return (
                    <tr key={con.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-900">{con.id}</td>
                      <td className="p-3.5 font-extrabold text-slate-900">{client?.name || `ID: ${con.clientId}`}</td>
                      <td className="p-3.5 font-bold text-indigo-700">{con.type}</td>
                      <td className="p-3.5 font-mono">{con.startDate}</td>
                      <td className="p-3.5 font-mono font-bold text-slate-700">{con.endDate}</td>
                      <td className="p-3.5">
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                          con.status === 'Activo' 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : con.status === 'Pendiente'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-red-50 text-red-800 border-red-200'
                        }`}>
                          {con.status}
                        </span>
                      </td>
                      <td className="p-3.5 max-w-[200px] truncate" title={con.coverage}>{con.coverage || '-'}</td>
                      <td className="p-3.5 text-right no-print">
                        <button
                          onClick={() => {
                            setEditingContract(con);
                            setContractFormId(con.id);
                            setContractFormClientId(con.clientId);
                            setContractFormType(con.type);
                            setContractFormStart(con.startDate);
                            setContractFormEnd(con.endDate);
                            setContractFormStatus(con.status);
                            setContractFormCoverage(con.coverage || '');
                            setIsContractModalOpen(true);
                          }}
                          className="text-indigo-655 hover:text-indigo-900 hover:bg-indigo-50 font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between font-sans">
              <span className="text-3xs text-slate-500 font-medium">Pág. {contractPage} de {totalPages}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setContractPage(prev => Math.max(prev - 1, 1))}
                  disabled={contractPage === 1}
                  className="px-2.5 py-1 text-3xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setContractPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={contractPage === totalPages}
                  className="px-2.5 py-1 text-3xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCronogramaTab = () => {
    return (
      <div className="space-y-4 font-sans relative" id="cronograma-standalone-view">
        {renderCalendarSectionStandalone()}
      </div>
    );
  };

  const renderCalendarSectionStandalone = () => {
    return (
      <div id="printable-calendar" className="space-y-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        {/* Standalone Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-indigo-50 border border-indigo-100 p-4 rounded-xl gap-4 no-print">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600" />
            <div>
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2 flex-wrap">
                <span>Cronograma Mensual Oficial -</span>
                <div className="flex gap-2 flex-wrap items-center">
                  <select
                    value={calendarMonth}
                    onChange={(e) => setCalendarMonth(Number(e.target.value))}
                    className="bg-white border border-indigo-255 rounded px-2 py-0.5 text-xs font-extrabold text-indigo-900 cursor-pointer outline-hidden"
                  >
                    {[
                      { val: 1, name: 'Enero' },
                      { val: 2, name: 'Febrero' },
                      { val: 3, name: 'Marzo' },
                      { val: 4, name: 'Abril' },
                      { val: 5, name: 'Mayo' },
                      { val: 6, name: 'Junio' },
                      { val: 7, name: 'Julio' },
                      { val: 8, name: 'Agosto' },
                      { val: 9, name: 'Septiembre' },
                      { val: 10, name: 'Octubre' },
                      { val: 11, name: 'Noviembre' },
                      { val: 12, name: 'Diciembre' }
                    ].map(m => (
                      <option key={m.val} value={m.val}>{m.name}</option>
                    ))}
                  </select>
                  <select
                    value={calendarYear}
                    onChange={(e) => setCalendarYear(Number(e.target.value))}
                    className="bg-white border border-indigo-255 rounded px-2 py-0.5 text-xs font-extrabold text-indigo-900 cursor-pointer outline-hidden"
                  >
                    {[2025, 2026, 2027, 2028].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1.5 ml-2 no-print">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Ingeniero:</span>
                    <select
                      value={highlightedEngineerId || ''}
                      onChange={(e) => setHighlightedEngineerId(e.target.value || null)}
                      className="bg-white border border-indigo-200 rounded px-2 py-0.5 text-xs font-extrabold text-indigo-900 cursor-pointer outline-hidden focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">Todos 👥</option>
                      {engineers.map(e => (
                        <option key={e.id} value={e.id}>
                          {getEngineerEmoji(e.id)} {e.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </h4>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end no-print">
            <button
              type="button"
              onClick={handlePrintCalendar}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              title="Imprimir calendario a PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Imprimir PDF</span>
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar en calendario..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-indigo-200 rounded-lg pl-8 pr-7 py-1 text-xs font-semibold text-slate-700 outline-hidden focus:ring-1 focus:ring-indigo-500 placeholder-slate-400 w-48 transition-all"
              />
              <Search className="w-3.5 h-3.5 text-indigo-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Standalone Calendar Grid split by weeks */}
        {(() => {
          // renderCalendarDays already includes prev/next month overflow days
          const paddedDays = renderCalendarDays();
          const weeks = [];
          for (let i = 0; i < paddedDays.length; i += 7) {
            weeks.push(paddedDays.slice(i, i + 7));
          }

          return (
            <div className="space-y-2 print:space-y-0 calendar-weeks-wrapper">
              <div className="grid grid-cols-7 gap-0 print:hidden text-center mb-1">
                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(dayName => (
                  <div key={dayName} className="font-bold text-3xs text-slate-400 uppercase py-1.5">
                    {dayName}
                  </div>
                ))}
              </div>

              {weeks.map((weekDays, wIndex) => {
                const weekDaysData = weekDays.map((cell) => {
                  const keyStr = cell.key ? cell.key.toString() : '';
                  // Blank placeholder (old style)
                  if (keyStr.startsWith('blank-')) {
                    return { type: 'placeholder' as const };
                  }
                  // Previous month overflow: key = 'prev-DD'
                  if (keyStr.startsWith('prev-')) {
                    const prevDay = parseInt(keyStr.replace('prev-', ''), 10);
                    const prevMonthYear = calendarMonth === 1 ? calendarYear - 1 : calendarYear;
                    const prevMonth = calendarMonth === 1 ? 12 : calendarMonth - 1;
                    const dateStr = `${prevMonthYear}-${prevMonth.toString().padStart(2, '0')}-${prevDay.toString().padStart(2, '0')}`;
                    return { type: 'day' as const, dayNum: prevDay, dateStr };
                  }
                  // Next month overflow: key = 'next-N'
                  if (keyStr.startsWith('next-')) {
                    const nextDay = parseInt(keyStr.replace('next-', ''), 10);
                    const nextMonthYear = calendarMonth === 12 ? calendarYear + 1 : calendarYear;
                    const nextMonth = calendarMonth === 12 ? 1 : calendarMonth + 1;
                    const dateStr = `${nextMonthYear}-${nextMonth.toString().padStart(2, '0')}-${nextDay.toString().padStart(2, '0')}`;
                    return { type: 'day' as const, dayNum: nextDay, dateStr };
                  }
                  // Current month day: key = day number as string
                  const dayNum = parseInt(keyStr, 10);
                  if (isNaN(dayNum)) {
                    return { type: 'placeholder' as const };
                  }
                  const dateStr = `${calendarYear}-${calendarMonth.toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
                  return {
                    type: 'day' as const,
                    dayNum,
                    dateStr
                  };
                });

                const isWorkOrderActiveOnDate = (wo: WorkOrder, dateStr: string) => {
                  if (!wo.durationDays || wo.durationDays <= 1) return wo.plannedDate === dateStr;
                  const start = new Date(wo.plannedDate + 'T00:00:00');
                  const target = new Date(dateStr + 'T00:00:00');
                  const end = new Date(start);
                  end.setDate(start.getDate() + (wo.durationDays - 1));
                  return target >= start && target <= end;
                };

                const weekMultiDayWOs = workOrders.filter(wo => {
                  if (!wo.durationDays || wo.durationDays <= 1) return false;
                  return weekDaysData.some(day => day.type === 'day' && isWorkOrderActiveOnDate(wo, day.dateStr));
                });

                const tracks: WorkOrder[][] = [];
                weekMultiDayWOs.forEach(wo => {
                  let colStart = -1;
                  let colSpan = 0;
                  for (let i = 0; i < 7; i++) {
                    const day = weekDaysData[i];
                    if (day.type === 'day' && isWorkOrderActiveOnDate(wo, day.dateStr)) {
                      if (colStart === -1) colStart = i + 1;
                      colSpan++;
                    }
                  }

                  if (colStart === -1) return;

                  let trackIndex = 0;
                  while (trackIndex < tracks.length) {
                    const overlaps = tracks[trackIndex].some(existingWO => {
                      let eStart = -1;
                      let eSpan = 0;
                      for (let i = 0; i < 7; i++) {
                        const day = weekDaysData[i];
                        if (day.type === 'day' && isWorkOrderActiveOnDate(existingWO, day.dateStr)) {
                          if (eStart === -1) eStart = i + 1;
                          eSpan++;
                        }
                      }
                      return eStart < colStart + colSpan && colStart < eStart + eSpan;
                    });

                    if (!overlaps) break;
                    trackIndex++;
                  }

                  if (trackIndex === tracks.length) {
                    tracks.push([]);
                  }
                  tracks[trackIndex].push(wo);
                });

                const shouldBreakAfter = false; // No forzar saltos de página entre semanas
                return (
                  <div key={wIndex} className={`calendar-week-container bg-white rounded-xl border border-slate-200 mb-4 overflow-hidden shadow-2xs print:mb-6 print:border-slate-200 ${shouldBreakAfter ? 'print-break-after' : ''}`}>
                    <div className="hidden print:flex justify-between items-center p-2.5 pb-1 border-b border-slate-200 bg-indigo-50/20">
                      <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                        Cronograma Mensual - {calendarMonthName} {calendarYear}
                      </span>
                      <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider">
                        Semana {wIndex + 1}
                      </span>
                    </div>

                    <div className="hidden print:grid grid-cols-7 gap-0 border-b border-slate-200 text-center font-bold text-[8px] uppercase py-0.5 bg-slate-50">
                      {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(dayName => (
                        <div key={dayName} className="text-slate-500 py-1">
                          {dayName}
                        </div>
                      ))}
                    </div>

                    {tracks.length > 0 && (
                      <div className="bg-slate-50/40 py-2 border-b border-slate-250 space-y-1">
                        {tracks.map((track, tIdx) => (
                          <div key={tIdx} className="grid grid-cols-7 relative h-7 items-center">
                            {track.map(wo => {
                              let colStart = -1;
                              let colSpan = 0;
                              for (let i = 0; i < 7; i++) {
                                const day = weekDaysData[i];
                                if (day.type === 'day' && isWorkOrderActiveOnDate(wo, day.dateStr)) {
                                  if (colStart === -1) colStart = i + 1;
                                  colSpan++;
                                }
                              }

                              const eng = engineers.find(e => e.id === wo.engineerId);
                              const supportIds = wo.supportEngineerIds && wo.supportEngineerIds.length > 0
                                ? wo.supportEngineerIds
                                : (wo.supportEngineerId ? [wo.supportEngineerId] : []);
                              const client = clients.find(c => c.id === wo.clientId);
                              const engColor = eng ? getEngineerColorClasses(eng.id) : null;

                              const matchesQuery = searchQuery ? matchesSearch(wo) : true;
                              const matchesEng = highlightedEngineerId 
                                ? (wo.engineerId === highlightedEngineerId || wo.supportEngineerId === highlightedEngineerId || wo.supportEngineerIds?.includes(highlightedEngineerId))
                                : true;
                              const isHighlighted = matchesQuery && matchesEng;
                              const hasHighlightActive = !!highlightedEngineerId || !!searchQuery;

                              let pillStyle = "";
                              if (hasHighlightActive) {
                                if (isHighlighted) {
                                  const basePill = wo.isEquipmentDown
                                    ? 'bg-red-50 text-red-955 border border-red-205 border-l-4 border-l-red-500'
                                    : (engColor 
                                      ? `${engColor.lightBg} ${engColor.text} border ${engColor.border} border-l-4 ${engColor.borderL}`
                                      : `bg-slate-100 border-slate-200 text-slate-700 border-l-4 border-l-slate-400`);
                                  const ringClass = highlightedEngineerId ? `ring-1 ${engColor?.ring}` : 'ring-2 ring-indigo-500';
                                  pillStyle = `${basePill} ${ringClass} scale-[1.02] shadow-md z-10`;
                                } else {
                                  pillStyle = `bg-slate-50 border-slate-100 text-slate-300 opacity-15 filter blur-[1.5px] grayscale-[40%] scale-[0.96] pointer-events-none transition-all duration-300`;
                                }
                              } else {
                                pillStyle = wo.isEquipmentDown
                                  ? 'bg-red-50 text-red-955 border border-red-150 border-l-4 border-l-red-500'
                                  : (engColor 
                                    ? `${engColor.lightBg} ${engColor.text} border ${engColor.border} border-l-4 ${engColor.borderL}`
                                    : `bg-slate-100 border-slate-200 text-slate-700 border-l-4 border-l-slate-400`);
                              }

                              const firstActiveDay = weekDaysData.find(d => d.type === 'day');
                              const lastActiveDay = weekDaysData.filter(d => d.type === 'day').pop();
                              
                              const isStartsBefore = firstActiveDay && new Date(wo.plannedDate + 'T00:00:00') < new Date(firstActiveDay.dateStr + 'T00:00:00');
                              const endOfEvent = new Date(wo.plannedDate + 'T00:00:00');
                              endOfEvent.setDate(endOfEvent.getDate() + (wo.durationDays! - 1));
                              const isEndsAfter = lastActiveDay && endOfEvent > new Date(lastActiveDay.dateStr + 'T00:00:00');

                              const roundedClass = `${isStartsBefore ? 'rounded-l-none border-l-0' : 'rounded-l-lg'} ${isEndsAfter ? 'rounded-r-none border-r-0' : 'rounded-r-lg'}`;

                              return (
                                <div
                                  key={wo.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setInfoWO(wo);
                                  }}
                                  style={{ gridColumn: `${colStart} / span ${colSpan}` }}
                                  className={`h-7 px-2 mx-1 flex items-center justify-between text-[9px] font-bold select-none cursor-pointer transition-all shadow-3xs ${pillStyle} ${roundedClass}`}
                                >
                                  <div className="flex items-center gap-1.5 truncate flex-1 mr-1">
                                    <span className="shrink-0">{eng ? getEngineerEmoji(eng.id) : '👤'}</span>
                                    <span className="truncate text-slate-800 uppercase tracking-wide">
                                      {client?.name || 'Cliente'} - {wo.equipmentName}
                                    </span>
                                  </div>
                                  <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-full border shrink-0 ${
                                    wo.isEquipmentDown ? 'bg-red-100 text-red-800 border-red-255' :
                                    wo.status === 'Conciliado' ? 'bg-emerald-100/60 text-emerald-800 border-emerald-250' :
                                    wo.status === 'Reportado' ? 'bg-indigo-100/60 text-indigo-800 border-indigo-255' :
                                    wo.status === 'Realizado' ? 'bg-blue-100/60 text-blue-800 border-blue-250' :
                                    wo.status === 'En Proceso' ? 'bg-sky-100/60 text-sky-800 border-sky-250' :
                                    'bg-yellow-100/60 text-yellow-800 border-yellow-250'
                                  }`}>
                                    {wo.isEquipmentDown ? 'Parado ⚠️' : wo.status}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-7 calendar-days-grid divide-x divide-slate-200">
                      {weekDays}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    );
  };

  const renderVacacionesTab = () => {
    // Calculate metrics
    const totalEngineers = engineers.length;
    const totalApprovedVacationDays = (vacations || []).filter(v => v.status === 'Aprobado').reduce((sum, v) => {
      return sum + getVacationDuration(v.startDate, v.endDate, v.includeWeekends);
    }, 0);
    const pendingRequestsCount = (vacations || []).filter(v => v.status === 'Solicitado').length;

    // Helper for manual form conflicts
    const schedulingConflicts = (() => {
      const targetEngId = vacFormEngId || (engineers[0]?.id || '');
      if (!targetEngId || !vacFormStart || !vacFormEnd) return [];
      return workOrders.filter(wo => {
        const isAssigned = wo.engineerId === targetEngId || (wo.supportEngineerIds || (wo.supportEngineerId ? [wo.supportEngineerId] : [])).includes(targetEngId);
        if (!isAssigned) return false;
        const woEnd = getEndDateStr(wo.plannedDate, wo.durationDays || 1);
        return (wo.plannedDate <= vacFormEnd && woEnd >= vacFormStart);
      });
    })();

    const handleCreateManualVacation = async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      const targetEngId = vacFormEngId;
      if (!targetEngId) {
        alert("Por favor, seleccione un técnico de la lista.");
        return;
      }
      if (!vacFormStart || !vacFormEnd) {
        alert("Por favor, seleccione la fecha de inicio y fin.");
        return;
      }
      if (vacFormEnd < vacFormStart) {
        alert("La fecha de fin no puede ser anterior a la de inicio.");
        return;
      }

      const eng = engineers.find(e => e.id === targetEngId);

      const newVac: Vacation = {
        id: 'VAC-' + Date.now(),
        engineerId: targetEngId,
        startDate: vacFormStart,
        endDate: vacFormEnd,
        status: 'Aprobado',
        notes: vacFormNotes || 'Programado por el Administrador',
        createdAt: new Date().toISOString(),
        includeWeekends: vacFormIncludeWeekends
      };

      try {
        if (onAddVacation) {
          await onAddVacation(newVac);
          alert(`¡Éxito! Se han registrado las vacaciones para ${eng?.name || 'el técnico'} del ${vacFormStart} al ${vacFormEnd}.`);
          setVacFormStart('');
          setVacFormEnd('');
          setVacFormNotes('');
          setVacFormEngId('');
          setVacFormIncludeWeekends(true);
        } else {
          alert("Error de conexión: la función de registro de vacaciones no está lista en este momento.");
        }
      } catch (err: any) {
        console.error("Error registrando vacaciones:", err);
        alert("Error al guardar en la base de datos: " + (err.message || String(err)));
      }
    };

    return (
      <div className="space-y-8 no-print" id="vacaciones-tab-root">
        {/* Summary Metrics Row */}
        {(() => {
          // 1. Fuera de servicio hoy (Vacaciones activas hoy, sistema en 2026-07-07)
          const todayDateStr = "2026-07-07";
          const activeTodayVacations = (vacations || []).filter(v => v.status === 'Aprobado' && v.startDate <= todayDateStr && v.endDate >= todayDateStr);
          const activeTodayCount = activeTodayVacations.length;
          
          // 2. Bolsa de Horas Global
          const totalComp = (permissions || []).filter(p => p.type === 'Compensación').reduce((sum, p) => sum + Number(p.hours || 0), 0);
          const totalPerm = (permissions || []).filter(p => p.type === 'Permiso').reduce((sum, p) => sum + Number(p.hours || 0), 0);
          const netGlobalHours = totalComp - totalPerm;

          // 3. Técnicos con saldo negativo
          const negativeBalancesCount = engineers.filter(eng => {
            const engVacations = (vacations || []).filter(v => v.engineerId === eng.id && v.status === 'Aprobado');
            const taken = engVacations.reduce((sum, v) => sum + getVacationDuration(v.startDate, v.endDate, v.includeWeekends), 0);
            const quota = eng.annualVacationDays ?? 15;
            const pending = eng.pendingVacationsLastYear ?? 0;
            const standby = eng.standbyVacationsLastYear ?? 0;
            const initialHours = (quota + pending + standby) * 8;
            const vacationTakenHours = taken * 8;
            const compHours = (permissions || []).filter(p => p.engineerId === eng.id && p.type === 'Compensación').reduce((sum, p) => sum + Number(p.hours || 0), 0);
            const permHours = (permissions || []).filter(p => p.engineerId === eng.id && p.type === 'Permiso').reduce((sum, p) => sum + Number(p.hours || 0), 0);
            const netAvailableHours = initialHours + compHours - vacationTakenHours - permHours;
            return netAvailableHours < 0;
          }).length;

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Fuera hoy */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Fuera Hoy (Vacaciones)</span>
                  <h3 className="text-2xl font-bold text-slate-800 mt-1">{activeTodayCount}</h3>
                  <p className="text-3xs text-slate-500 mt-1">
                    {activeTodayCount === 0 
                      ? "Todo el personal disponible" 
                      : `${activeTodayCount} ${activeTodayCount === 1 ? 'técnico gozando' : 'técnicos gozando'} hoy`
                    }
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${activeTodayCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'}`}>
                  <Palmtree className="w-5 h-5" />
                </div>
              </div>

              {/* Card 2: Solicitudes Pendientes */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Solicitudes Pendientes</span>
                  <h3 className="text-2xl font-bold text-indigo-700 mt-1">{pendingRequestsCount}</h3>
                  <p className="text-3xs text-slate-500 mt-1">Esperando revisión y aprobación</p>
                </div>
                <div className={`p-3 rounded-lg ${pendingRequestsCount > 0 ? 'bg-indigo-50 text-indigo-650' : 'bg-slate-50 text-slate-500'}`}>
                  <ClipboardList className="w-5 h-5" />
                </div>
              </div>

              {/* Card 3: Bolsa de Horas Global */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Bolsa Global de Horas</span>
                  <h3 className={`text-2xl font-bold mt-1 ${netGlobalHours < 0 ? 'text-rose-650' : 'text-emerald-750'}`}>
                    {netGlobalHours >= 0 ? `+${netGlobalHours}h` : `${netGlobalHours}h`}
                  </h3>
                  <p className="text-3xs text-slate-500 mt-1">Acumulado neto de toda la plantilla</p>
                </div>
                <div className={`p-3 rounded-lg ${netGlobalHours < 0 ? 'bg-rose-50 text-rose-650' : 'bg-emerald-50 text-emerald-650'}`}>
                  <Briefcase className="w-5 h-5" />
                </div>
              </div>

              {/* Card 4: Alerta de Saldos Negativos */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Saldos en Exceso / Negativos</span>
                  <h3 className={`text-2xl font-bold mt-1 ${negativeBalancesCount > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-800'}`}>
                    {negativeBalancesCount}
                  </h3>
                  <p className="text-3xs text-slate-500 mt-1">Técnicos que excedieron su cupo</p>
                </div>
                <div className={`p-3 rounded-lg ${negativeBalancesCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-450'}`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })()}

        {/* Main Workspace Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left / Quotas Column (Spans 2 on XL screens) */}
          <div className="xl:col-span-2 space-y-8">
            {/* Quotas Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">Control de Cupos de Vacaciones</h3>
                  <p className="text-3xs text-slate-455 mt-0.5">Defina los días anuales y vea el balance acumulado de cada ingeniero</p>
                </div>
                
                {/* Search Bar for Engineers */}
                <div className="relative shrink-0 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Buscar técnico o especialidad..."
                    value={vacEngSearchQuery}
                    onChange={(e) => setVacEngSearchQuery(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg pl-8 pr-7 py-1.5 text-xs font-semibold text-slate-700 outline-hidden focus:ring-1 focus:ring-indigo-500 placeholder-slate-400 w-full sm:w-56 transition-all"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  {vacEngSearchQuery && (
                    <button
                      onClick={() => setVacEngSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/60 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                      <th className="px-6 py-3">Ingeniero / Especialidad</th>
                      <th className="px-6 py-3 text-center">Cupo Anual</th>
                      <th className="px-6 py-3 text-center">Días Tomados</th>
                      <th className="px-6 py-3 text-center">Saldo Neto Disponible</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {(() => {
                      const filteredEngs = engineers.filter(eng => {
                        if (!vacEngSearchQuery) return true;
                        const query = vacEngSearchQuery.toLowerCase();
                        return (
                          eng.name.toLowerCase().includes(query) ||
                          eng.specialty.toLowerCase().includes(query) ||
                          eng.id.toLowerCase().includes(query)
                        );
                      });

                      if (filteredEngs.length === 0) {
                        return (
                          <tr>
                            <td colSpan={4} className="text-center p-8 text-slate-400 font-semibold italic">
                              No se encontraron técnicos para "{vacEngSearchQuery}".
                            </td>
                          </tr>
                        );
                      }

                      return filteredEngs.map(eng => {
                        const engVacations = (vacations || []).filter(v => v.engineerId === eng.id && v.status === 'Aprobado');
                        const taken = engVacations.reduce((sum, v) => sum + getVacationDuration(v.startDate, v.endDate, v.includeWeekends), 0);
                        const quota = eng.annualVacationDays ?? 15;
                        const pending = eng.pendingVacationsLastYear ?? 0;
                        const standby = eng.standbyVacationsLastYear ?? 0;
                        const initialHours = (quota + pending + standby) * 8;
                        const vacationTakenHours = taken * 8;
                        const compHours = (permissions || []).filter(p => p.engineerId === eng.id && p.type === 'Compensación').reduce((sum, p) => sum + Number(p.hours || 0), 0);
                        const permHours = (permissions || []).filter(p => p.engineerId === eng.id && p.type === 'Permiso').reduce((sum, p) => sum + Number(p.hours || 0), 0);
                        const netAvailableHours = initialHours + compHours - vacationTakenHours - permHours;
                        
                        const netDays = Math.floor(netAvailableHours / 8);
                        const netRemHours = netAvailableHours % 8;
                        const isEditing = editingQuotaEngId === eng.id;

                        return (
                          <tr key={eng.id} className="hover:bg-slate-50/40 transition-all">
                            <td 
                              className="px-6 py-4 cursor-pointer hover:bg-indigo-50/30 transition-colors group/row"
                              onClick={() => setHistoryEngId(eng.id)}
                              title="Haga clic para ver el historial completo de vacaciones"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-base shrink-0 group-hover/row:scale-110 transition-transform">{getEngineerEmoji(eng.id)}</span>
                                <div>
                                  <p className="font-extrabold text-slate-900 group-hover/row:text-indigo-650 transition-colors flex items-center gap-1.5">
                                    <span>{eng.name}</span>
                                    <span className="text-[8px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1 py-0.2 rounded-md opacity-0 group-hover/row:opacity-100 transition-opacity">Ver Historial 🌴</span>
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-semibold">{eng.specialty}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {isEditing ? (
                                <div className="flex items-center justify-center gap-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    max={365}
                                    value={editingQuotaValue}
                                    onChange={e => setEditingQuotaValue(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-16 p-1 border border-indigo-300 rounded text-center font-mono font-bold text-xs focus:ring-1 focus:ring-indigo-500"
                                    autoFocus
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') {
                                        if (onUpdateEngineer) {
                                          onUpdateEngineer({ ...eng, annualVacationDays: editingQuotaValue });
                                        }
                                        setEditingQuotaEngId(null);
                                      } else if (e.key === 'Escape') {
                                        setEditingQuotaEngId(null);
                                      }
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (onUpdateEngineer) {
                                        onUpdateEngineer({ ...eng, annualVacationDays: editingQuotaValue });
                                      }
                                      setEditingQuotaEngId(null);
                                    }}
                                    className="p-1 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 border border-emerald-200 cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingQuotaEngId(null)}
                                    className="p-1 bg-slate-50 text-slate-600 rounded hover:bg-slate-100 border border-slate-200 cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-2">
                                  <span className="font-mono font-bold text-slate-800">{quota} días</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingQuotaEngId(eng.id);
                                      setEditingQuotaValue(quota);
                                    }}
                                    className="text-slate-400 hover:text-indigo-650 p-1 rounded hover:bg-slate-100 cursor-pointer transition-colors"
                                    title="Editar cupo"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center font-mono font-bold text-slate-600">
                              {taken} días
                            </td>
                            <td className="px-6 py-4 text-center font-mono">
                              <span className={`font-bold px-2 py-0.5 rounded-full text-3xs border ${
                                netAvailableHours < 0 
                                  ? 'bg-red-50 text-red-855 border-red-200' 
                                  : netAvailableHours === 0
                                  ? 'bg-amber-50 text-amber-855 border-amber-200'
                                  : 'bg-teal-50 text-teal-855 border-teal-200'
                              }`}>
                                {netDays}d {netRemHours}h
                              </span>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Manual Scheduling Form */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6">
              <h3 className="font-extrabold text-sm text-slate-900 tracking-tight mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Programar Vacaciones Manualmente</span>
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1 relative">
                    <label className="block text-3xs font-bold text-slate-500 uppercase">Técnico</label>
                    
                    {/* Trigger Button */}
                    <button
                      type="button"
                      onClick={() => setVacFormSearchOpen(!vacFormSearchOpen)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold flex items-center justify-between text-slate-800 focus:ring-1 focus:ring-indigo-500 cursor-pointer text-left h-[38px] transition-all"
                    >
                      {vacFormEngId ? (
                        (() => {
                          const eng = engineers.find(e => e.id === vacFormEngId);
                          return (
                            <span className="flex items-center gap-2">
                              <span className="text-sm">{eng ? getEngineerEmoji(eng.id) : '👤'}</span>
                              <span className="truncate">{eng?.name || 'Seleccionar Técnico'}</span>
                            </span>
                          );
                        })()
                      ) : (
                        <span className="text-slate-400 font-normal">-- Seleccionar Técnico --</span>
                      )}
                      <span className="text-slate-400 text-[9px] ml-1 select-none">▼</span>
                    </button>

                    {/* Floating Dropdown Panel */}
                    {vacFormSearchOpen && (
                      <>
                        {/* Overlay to close when clicking outside */}
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => {
                            setVacFormSearchOpen(false);
                            setVacFormSearchQuery('');
                          }} 
                        />
                        
                        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-60 animate-in fade-in slide-in-from-top-1 duration-150">
                          {/* Search Input inside dropdown */}
                          <div className="p-2 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <input
                              type="text"
                              placeholder="Buscar técnico..."
                              value={vacFormSearchQuery}
                              onChange={e => setVacFormSearchQuery(e.target.value)}
                              className="w-full bg-transparent text-xs p-1 focus:outline-hidden text-slate-800 font-semibold"
                              autoFocus
                            />
                          </div>

                          {/* Options List */}
                          <div className="overflow-y-auto divide-y divide-slate-50 max-h-44">
                            {(() => {
                              const filteredEngs = engineers.filter(e => 
                                e.name.toLowerCase().includes(vacFormSearchQuery.toLowerCase()) ||
                                e.specialty.toLowerCase().includes(vacFormSearchQuery.toLowerCase())
                              );

                              if (filteredEngs.length === 0) {
                                return (
                                  <div className="p-4 text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                    No se encontraron técnicos
                                  </div>
                                );
                              }

                              return filteredEngs.map(e => {
                                const isSelected = vacFormEngId === e.id;
                                return (
                                  <button
                                    key={e.id}
                                    type="button"
                                    onClick={() => {
                                      setVacFormEngId(e.id);
                                      setVacFormSearchOpen(false);
                                      setVacFormSearchQuery('');
                                    }}
                                    className={`w-full p-2.5 text-left text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer ${
                                      isSelected ? 'bg-indigo-50/50 text-indigo-750 font-black' : 'text-slate-850'
                                    }`}
                                  >
                                    <span className="flex items-center gap-2">
                                      <span className="text-sm">{getEngineerEmoji(e.id)}</span>
                                      <div>
                                        <p className="leading-none">{e.name}</p>
                                        <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{e.specialty}</p>
                                      </div>
                                    </span>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                                  </button>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-3xs font-bold text-slate-500 uppercase">Fecha Inicio</label>
                    <input
                      type="date"
                      required
                      value={vacFormStart}
                      onChange={e => setVacFormStart(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-3xs font-bold text-slate-500 uppercase">Fecha Fin</label>
                    <input
                      type="date"
                      required
                      value={vacFormEnd}
                      onChange={e => setVacFormEnd(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    id="vacFormIncludeWeekends"
                    checked={vacFormIncludeWeekends}
                    onChange={e => setVacFormIncludeWeekends(e.target.checked)}
                    className="w-4 h-4 text-indigo-650 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="vacFormIncludeWeekends" className="text-3xs font-bold text-slate-655 uppercase tracking-wide cursor-pointer select-none">
                    ¿Incluir fines de semana en el conteo de días?
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="block text-3xs font-bold text-slate-500 uppercase">Notas / Observaciones</label>
                  <input
                    type="text"
                    value={vacFormNotes}
                    onChange={e => setVacFormNotes(e.target.value)}
                    placeholder="Ej. Vacaciones anuales correspondientes al periodo 2025"
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs"
                  />
                </div>

                {/* Display scheduling conflicts */}
                {schedulingConflicts.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-850 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                      <span className="font-extrabold text-2xs">⚠️ Alerta: Conflicto de Órdenes de Trabajo</span>
                    </div>
                    <p className="text-3xs font-semibold leading-normal">
                      Este técnico tiene <strong>{schedulingConflicts.length} orden(es) de trabajo</strong> asignadas en las fechas seleccionadas.
                      Las vacaciones se registrarán, pero se generará un aviso de conflicto en las órdenes.
                    </p>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => handleCreateManualVacation()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-2xs px-5 py-2.5 rounded-lg cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Registrar Vacaciones</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Requests & History */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">Historial y Solicitudes</h3>
                <p className="text-3xs text-slate-450 mt-0.5">Revise las solicitudes de técnicos e historial general</p>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {vacations.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Palmtree className="w-8 h-8 mx-auto opacity-30 mb-2" />
                    <p className="text-3xs font-bold uppercase">Sin registros de vacaciones</p>
                  </div>
                ) : (
                  [...vacations]
                    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
                    .map(vac => {
                      const eng = engineers.find(e => e.id === vac.engineerId);
                      const duration = getVacationDuration(vac.startDate, vac.endDate, vac.includeWeekends);
                      
                      return (
                        <div
                          key={vac.id}
                          className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 hover:shadow-xs transition-all"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-base shrink-0">{eng ? getEngineerEmoji(eng.id) : '👤'}</span>
                              <div>
                                <h4 className="font-bold text-slate-900 text-2xs leading-snug">{eng?.name || 'Técnico'}</h4>
                                <p className="text-[10px] text-slate-500 font-semibold">{duration} {duration === 1 ? 'día' : 'días'}{vac.includeWeekends === false ? ' (hab.)' : ''} ({vac.startDate} al {vac.endDate})</p>
                              </div>
                            </div>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${
                              vac.status === 'Aprobado'
                                ? 'bg-emerald-50 text-emerald-805 border-emerald-200'
                                : vac.status === 'Rechazado'
                                ? 'bg-red-50 text-red-850 border-red-200'
                                : 'bg-amber-50 text-amber-805 border-amber-200'
                            }`}>
                              {vac.status}
                            </span>
                          </div>

                          {vac.notes && vac.notes !== 'Programado por el Administrador' && vac.notes !== 'Solicitado por el Ingeniero' && (
                            <p className="text-3xs text-slate-600 bg-white border border-slate-150 p-2 rounded-md font-medium leading-relaxed italic">
                              "{vac.notes}"
                            </p>
                          )}

                          {vac.status === 'Solicitado' && (
                            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/50">
                              <button
                                type="button"
                                onClick={() => {
                                  if (onUpdateVacation) {
                                    onUpdateVacation({ ...vac, status: 'Aprobado' });
                                  }
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] px-2.5 py-1 rounded cursor-pointer transition-colors flex items-center gap-0.5 shadow-3xs"
                              >
                                <Check className="w-2.5 h-2.5" />
                                <span>Aprobar</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (onUpdateVacation) {
                                    onUpdateVacation({ ...vac, status: 'Rechazado' });
                                  }
                                }}
                                className="bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[9px] px-2.5 py-1 rounded border border-red-200 cursor-pointer transition-colors flex items-center gap-0.5"
                              >
                                <X className="w-2.5 h-2.5" />
                                <span>Rechazar</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Vacation History Modal */}
        <AnimatePresence>
          {historyEngId && (
            (() => {
              const eng = engineers.find(e => e.id === historyEngId);
              if (!eng) return null;
              const engVacations = (vacations || []).filter(v => v.engineerId === historyEngId);
              const approvedVacations = engVacations.filter(v => v.status === 'Aprobado');
              const taken = approvedVacations.reduce((sum, v) => sum + getVacationDuration(v.startDate, v.endDate, v.includeWeekends), 0);
              const quota = eng.annualVacationDays ?? 15;
              const pending = eng.pendingVacationsLastYear ?? 0;
              const standby = eng.standbyVacationsLastYear ?? 0;
              
              const initialHours = (quota + pending + standby) * 8;
              const vacationTakenHours = taken * 8;
              
              const engPermissions = (permissions || []).filter(p => p.engineerId === historyEngId);
              const compHours = engPermissions.filter(p => p.type === 'Compensación').reduce((sum, p) => sum + Number(p.hours || 0), 0);
              const permHours = engPermissions.filter(p => p.type === 'Permiso').reduce((sum, p) => sum + Number(p.hours || 0), 0);
              
              const netAvailableHours = initialHours + compHours - vacationTakenHours - permHours;
              const netDays = Math.floor(netAvailableHours / 8);
              const netRemHours = netAvailableHours % 8;

              return (
                <div className="fixed inset-0 bg-black/55 z-55 flex items-center justify-center p-4 no-print animate-in fade-in duration-200" id="vacation-history-modal-overlay">
                  {/* Backdrop close */}
                  <div className="absolute inset-0 cursor-pointer bg-slate-900/40" onClick={() => setHistoryEngId(null)} />

                  <motion.div
                    initial={{ scale: 0.96, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.96, opacity: 0 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden z-50 border border-slate-200 flex flex-col max-h-[90vh]"
                  >
                    {/* Modal Header */}
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getEngineerEmoji(eng.id)}</span>
                        <div>
                          <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                            Historial de Vacaciones — {eng.name}
                          </h3>
                          <p className="text-3xs text-slate-455 mt-0.5 font-semibold">
                            {eng.specialty} • Visualizando balance e historial completo de descansos
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setHistoryEngId(null)}
                        className="text-slate-400 hover:text-slate-655 font-bold text-xs p-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
                      {/* Información de Antigüedad y Saldos Anteriores (No editable) */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-2xs">
                        <div>
                          <span className="block font-bold text-slate-400 uppercase text-[8px]">F. Ingreso (Antigüedad)</span>
                          <input
                            type="date"
                            value={eng.entryDate || ''}
                            onChange={async (e) => {
                              const newDate = e.target.value;
                              if (onUpdateEngineer) {
                                await onUpdateEngineer({ ...eng, entryDate: newDate });
                              }
                            }}
                            className="font-bold text-slate-800 font-mono bg-white border border-slate-200 rounded px-1 py-0.5 text-[10px] w-full focus:ring-1 focus:ring-indigo-500 focus:outline-hidden mt-0.5"
                          />
                          <span className="block text-[8px] text-slate-450 mt-0.5 font-semibold">({calculateYearsInCompany(eng.entryDate)} de ant.)</span>
                        </div>
                        <div>
                          <span className="block font-bold text-slate-400 uppercase text-[8px]">Gozadas Vigente</span>
                          <span className="font-extrabold text-slate-800 font-mono">{taken} días</span>
                        </div>
                        <div>
                          <span className="block font-bold text-slate-400 uppercase text-[8px]">Pendientes Año Pasado</span>
                          <span className="font-extrabold text-slate-800 font-mono">{pending} días</span>
                        </div>
                        <div>
                          <span className="block font-bold text-slate-400 uppercase text-[8px]">Standby Año Pasado</span>
                          <span className="font-extrabold text-slate-800 font-mono">{standby} días</span>
                        </div>
                      </div>

                      {/* Balance Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Cupo Anual</span>
                          <span className="text-sm font-black text-slate-800 font-mono mt-1 block">{quota} días</span>
                          <span className="text-4xs text-slate-450 leading-none block mt-1 font-semibold">Días asignados</span>
                        </div>
                        <div className="bg-teal-50/50 border border-teal-150 p-3 rounded-xl">
                          <span className="text-[9px] font-bold text-teal-600 uppercase tracking-wider block">Días Tomados</span>
                          <span className="text-sm font-black text-teal-700 font-mono mt-1 block">{taken} días</span>
                          <span className="text-4xs text-teal-550 leading-none block mt-1 font-semibold">Aprobados y gozados</span>
                        </div>
                        <div className="bg-amber-50/50 border border-amber-150 p-3 rounded-xl">
                          <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider block">Bolsa de Horas</span>
                          <span className={`text-sm font-black font-mono mt-1 block ${compHours - permHours < 0 ? 'text-rose-650 animate-pulse' : 'text-emerald-700'}`}>
                            {compHours - permHours >= 0 ? `+${compHours - permHours}h` : `${compHours - permHours}h`}
                          </span>
                          <span className="text-4xs text-amber-500 leading-none block mt-1 font-semibold">Horas a favor / contra</span>
                        </div>
                        <div className="bg-indigo-50/50 border border-indigo-150 p-3 rounded-xl">
                          <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider block">Saldo Neto</span>
                          <span className={`text-sm font-black font-mono mt-1 block ${netAvailableHours < 0 ? 'text-rose-600' : 'text-indigo-705'}`}>
                            {netDays}d y {netRemHours}h
                          </span>
                          <span className="text-4xs text-indigo-500 leading-none block mt-1 font-semibold">Disponible final</span>
                        </div>
                      </div>

                      {/* Registrar Nuevas Vacaciones directamente */}
                      <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-3 shadow-3xs">
                        <h4 className="font-extrabold text-2xs text-indigo-750 uppercase tracking-wider flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Programar Vacaciones para {eng.name}</span>
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="block text-3xs font-bold text-slate-500 uppercase">Fecha Inicio</label>
                            <input
                              type="date"
                              id="modal-vac-start"
                              className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-3xs font-bold text-slate-500 uppercase">Fecha Fin</label>
                            <input
                              type="date"
                              id="modal-vac-end"
                              className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 py-0.5">
                          <input
                            type="checkbox"
                            id="modal-vac-weekends"
                            checked={modalVacIncludeWeekends}
                            onChange={e => setModalVacIncludeWeekends(e.target.checked)}
                            className="w-3.5 h-3.5 text-indigo-650 border-slate-355 rounded focus:ring-indigo-500 cursor-pointer"
                          />
                          <label htmlFor="modal-vac-weekends" className="text-4xs font-bold text-slate-655 uppercase tracking-wide cursor-pointer select-none">
                            ¿Incluir fines de semana en el conteo de días?
                          </label>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="block text-3xs font-bold text-slate-500 uppercase">Notas / Observaciones</label>
                          <input
                            type="text"
                            id="modal-vac-notes"
                            placeholder="Ej. Vacaciones correspondientes al periodo actual"
                            className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                          />
                        </div>
                        
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={async () => {
                              const startEl = document.getElementById('modal-vac-start') as HTMLInputElement;
                              const endEl = document.getElementById('modal-vac-end') as HTMLInputElement;
                              const notesEl = document.getElementById('modal-vac-notes') as HTMLInputElement;
                              
                              const start = startEl?.value;
                              const end = endEl?.value;
                              const notes = notesEl?.value || '';
                              
                              if (!start || !end) {
                                alert("Por favor, seleccione la fecha de inicio y fin.");
                                return;
                              }
                              if (end < start) {
                                alert("La fecha de fin no puede ser anterior a la de inicio.");
                                return;
                              }
                              
                              const newVac: Vacation = {
                                id: 'VAC-' + Date.now(),
                                engineerId: eng.id,
                                startDate: start,
                                endDate: end,
                                status: 'Aprobado',
                                notes: notes || 'Programado por el Administrador',
                                createdAt: new Date().toISOString(),
                                includeWeekends: modalVacIncludeWeekends
                              };
                              
                              try {
                                if (onAddVacation) {
                                  await onAddVacation(newVac);
                                  alert(`¡Éxito! Se han registrado las vacaciones para ${eng.name} del ${start} al ${end}.`);
                                  if (startEl) startEl.value = '';
                                  if (endEl) endEl.value = '';
                                  if (notesEl) notesEl.value = '';
                                  setModalVacIncludeWeekends(true);
                                } else {
                                  alert("Error: La función de registro no está disponible.");
                                }
                              } catch (err: any) {
                                console.error("Error al guardar vacaciones desde el modal:", err);
                                alert("Error al guardar en la base de datos: " + (err.message || String(err)));
                              }
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Registrar Vacaciones</span>
                          </button>
                        </div>
                      </div>

                      {/* Bolsa de Horas de Trabajo y Permisos */}
                      <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-4 shadow-3xs">
                        <h4 className="font-extrabold text-2xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Bolsa de Horas de Trabajo y Permisos (Compensaciones)</span>
                        </h4>

                        {/* Formulario de registro */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end bg-white p-3 rounded-lg border border-slate-150">
                          <div className="space-y-1">
                            <label className="block text-4xs font-bold text-slate-450 uppercase">Tipo</label>
                            <select
                              value={permFormType}
                              onChange={e => setPermFormType(e.target.value as any)}
                              className="w-full p-1.5 rounded border border-slate-200 bg-slate-50 text-[10px] font-semibold text-slate-700 focus:outline-hidden"
                            >
                              <option value="Permiso">Permiso (Resta Horas)</option>
                              <option value="Compensación">Trabajo (Compensa/Suma Horas)</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="block text-4xs font-bold text-slate-450 uppercase">Fecha</label>
                            <input
                              type="date"
                              value={permFormDate}
                              onChange={e => setPermFormDate(e.target.value)}
                              className="w-full p-1.5 rounded border border-slate-200 text-[10px] font-mono"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-4xs font-bold text-slate-450 uppercase">Horas</label>
                            <input
                              type="number"
                              min={1}
                              max={24}
                              value={permFormHours}
                              onChange={e => setPermFormHours(Math.max(1, parseInt(e.target.value) || 0))}
                              className="w-full p-1.5 rounded border border-slate-200 text-[10px] font-mono font-bold"
                            />
                          </div>
                          <div className="space-y-1 sm:col-span-4">
                            <label className="block text-4xs font-bold text-slate-450 uppercase">Motivo / Descripción</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={permFormReason}
                                onChange={e => setPermFormReason(e.target.value)}
                                placeholder="Ej: Cita médica, Horas extra soporte sábado..."
                                className="w-full p-1.5 rounded border border-slate-200 text-[10px] flex-1 focus:outline-hidden"
                              />
                              <button
                                type="button"
                                onClick={async () => {
                                  if (!permFormDate) {
                                    alert("Por favor seleccione la fecha.");
                                    return;
                                  }
                                  if (!permFormReason) {
                                    alert("Por favor ingrese el motivo.");
                                    return;
                                  }
                                  const newPerm: EngineerPermission = {
                                    id: 'PERM-' + Date.now(),
                                    engineerId: eng.id,
                                    date: permFormDate,
                                    hours: permFormHours,
                                    reason: permFormReason,
                                    type: permFormType,
                                    createdAt: new Date().toISOString()
                                  };
                                  if (onAddPermission) {
                                    await onAddPermission(newPerm);
                                    setPermFormReason('');
                                    setPermFormDate('');
                                    setPermFormHours(8);
                                  }
                                }}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] px-4 py-1.5 rounded-lg cursor-pointer transition-colors shadow-2xs shrink-0"
                              >
                                Registrar
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Listado de transacciones */}
                        <div className="space-y-2">
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Historial de Horas y Permisos</span>
                          {engPermissions.length === 0 ? (
                            <p className="text-4xs text-slate-400 italic text-center py-2">Sin registros de permisos o compensaciones.</p>
                          ) : (
                            <div className="max-h-40 overflow-y-auto space-y-1.5 divide-y divide-slate-100 pr-1">
                              {[...engPermissions]
                                .sort((a, b) => b.date.localeCompare(a.date))
                                .map(p => (
                                  <div key={p.id} className="flex items-center justify-between text-[10px] py-1.5 bg-white px-2.5 rounded-md border border-slate-150 hover:shadow-3xs transition-shadow">
                                    <div className="flex items-center gap-2">
                                      <span className={`font-mono font-bold px-1.5 py-0.2 rounded text-[9px] ${
                                        p.type === 'Compensación' 
                                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-250' 
                                          : 'bg-rose-50 text-rose-800 border border-rose-250'
                                      }`}>
                                        {p.type === 'Compensación' ? `+${p.hours}h` : `-${p.hours}h`}
                                      </span>
                                      <span className="font-mono text-slate-400">{p.date}</span>
                                      <span className="font-semibold text-slate-700 truncate max-w-xs">{p.reason}</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        if (window.confirm("¿Está seguro de que desea eliminar este registro?")) {
                                          if (onDeletePermission) {
                                            await onDeletePermission(p.id);
                                          }
                                        }
                                      }}
                                      className="text-red-500 hover:text-red-750 font-bold text-[9px] cursor-pointer"
                                    >
                                      Eliminar
                                    </button>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Timeline / History List */}
                      <div className="space-y-3">
                        <h4 className="font-extrabold text-2xs text-slate-800 uppercase tracking-wider block">
                          Detalle del Historial
                        </h4>

                        {engVacations.length === 0 ? (
                          <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl text-slate-400 bg-slate-50/30">
                            <Palmtree className="w-10 h-10 mx-auto opacity-20 mb-2" />
                            <p className="text-3xs font-extrabold uppercase">Sin registros de vacaciones</p>
                            <p className="text-4xs text-slate-450 mt-1">Use el formulario para programar unas vacaciones para este ingeniero</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white overflow-hidden shadow-3xs max-h-80 overflow-y-auto">
                            {engVacations
                              .sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''))
                              .map((vac, idx) => {
                                const duration = getVacationDuration(vac.startDate, vac.endDate, vac.includeWeekends);
                                const fmtDate = (d: string) => {
                                  if (!d) return '—';
                                  const [y, m, day] = d.split('-');
                                  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
                                  return `${parseInt(day)} ${months[parseInt(m)-1]} ${y}`;
                                };
                                return (
                                  <div key={vac.id} className={`p-4 hover:bg-slate-50/40 transition-colors flex items-start justify-between gap-4 ${idx > 0 ? 'border-t border-slate-100' : ''}`}>
                                    <div className="flex items-start gap-3 min-w-0 flex-1">
                                      <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                                        vac.status === 'Aprobado' ? 'bg-emerald-500' :
                                        vac.status === 'Rechazado' ? 'bg-red-500' : 'bg-amber-400'
                                      }`} />
                                      <div className="space-y-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="font-extrabold text-slate-800 text-xs">
                                            {fmtDate(vac.startDate)}
                                          </span>
                                          <span className="text-slate-400 text-3xs font-bold">→</span>
                                          <span className="font-extrabold text-slate-800 text-xs">
                                            {fmtDate(vac.endDate)}
                                          </span>
                                          <span className="bg-slate-100 text-slate-600 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                                            {duration} {duration === 1 ? 'día' : 'días'}{vac.includeWeekends === false ? ' (hab.)' : ''}
                                          </span>
                                        </div>
                                        {vac.notes && vac.notes !== 'Programado por el Administrador' && vac.notes !== 'Solicitado por el Ingeniero' && (
                                          <p className="text-3xs text-slate-500 italic leading-relaxed">
                                            {vac.notes}
                                          </p>
                                        )}
                                        <p className="text-[9px] text-slate-400 font-medium">
                                          Registrado el {vac.createdAt ? new Date(vac.createdAt).toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'numeric' }) : '—'}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${
                                        vac.status === 'Aprobado'
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                          : vac.status === 'Rechazado'
                                          ? 'bg-red-50 text-red-700 border-red-200'
                                          : 'bg-amber-50 text-amber-700 border-amber-200'
                                      }`}>
                                        {vac.status}
                                      </span>
                                      
                                      {vac.status === 'Solicitado' && (
                                        <div className="flex items-center gap-1.5">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (onUpdateVacation) {
                                                onUpdateVacation({ ...vac, status: 'Aprobado' });
                                              }
                                            }}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] px-2 py-0.5 rounded cursor-pointer transition-colors flex items-center gap-0.5 shadow-3xs"
                                          >
                                            <Check className="w-2.5 h-2.5" />
                                            <span>Aprobar</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (onUpdateVacation) {
                                                onUpdateVacation({ ...vac, status: 'Rechazado' });
                                              }
                                            }}
                                            className="bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[9px] px-2 py-0.5 rounded border border-red-200 cursor-pointer transition-colors flex items-center gap-0.5"
                                          >
                                            <X className="w-2.5 h-2.5" />
                                            <span>Rechazar</span>
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setHistoryEngId(null)}
                        className="bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-2xs px-5 py-2.5 rounded-lg cursor-pointer transition-colors shadow-xs"
                      >
                        Cerrar Historial
                      </button>
                    </div>
                  </motion.div>
                </div>
              );
            })()
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="space-y-8" id="admin-portal-root">
      {/* Top Global Admin Navigation Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-2.5 shadow-md no-print mb-6">
        <div className="flex flex-wrap gap-1 md:gap-2">
          {[
            { id: 'agendamiento', label: 'Agendamiento', icon: CalendarRange, color: 'text-indigo-400' },
            { id: 'clientes', label: 'Clientes (Terceros)', icon: Users, color: 'text-sky-400' },
            { id: 'equipos', label: 'Equipos (Activos)', icon: Cpu, color: 'text-emerald-400' },
            { id: 'contratos', label: 'Contratos', icon: Briefcase, color: 'text-amber-400' },
            { id: 'cronograma', label: 'Cronograma', icon: CalendarIcon, color: 'text-rose-400' },
            { id: 'vacaciones', label: 'Vacaciones', icon: Palmtree, color: 'text-teal-400' }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeAdminTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`btn-admin-tab-${tab.id}`}
                onClick={() => setActiveAdminTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-white text-slate-900 shadow-md font-extrabold scale-[1.02]' 
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-650' : tab.color}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeAdminTab === 'agendamiento' && (
        <>
          {/* KPI Overview Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Total Agendados</span>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalPlanned}</h3>
            <p className="text-3xs text-slate-500 mt-1">Órdenes planificadas totales</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <CalendarIcon className="w-5 h-5" />
          </div>
        </div>
        
        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Por Conciliar</span>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{pendingValidation}</h3>
            <p className="text-3xs text-amber-600 font-semibold mt-1 animate-pulse">Reportes subidos esperando auditoría</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <ClipboardList className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Conciliados (Saldados)</span>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{completedConciliado}</h3>
            <p className="text-3xs text-emerald-600 font-semibold mt-1">Verificados al 100% vs Excel</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4 - Clickable to open technicians list & management modal */}
        <div 
          onClick={() => setIsEngsModalOpen(true)}
          title="Haga clic para ver y gestionar la lista de técnicos registrados"
          className="bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-5 flex items-center justify-between shadow-xs cursor-pointer hover:bg-slate-50/80 transition-all select-none group"
        >
          <div>
            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-indigo-500 transition-colors">Ingenieros Activos</span>
            <h3 className="text-2xl font-bold text-sky-600 mt-1 group-hover:text-sky-700">{activeFieldCount}/{engineers.length}</h3>
            <p className="text-3xs text-slate-500 mt-1">Efectivo técnico operando en campo</p>
          </div>
          <div className="p-3 bg-sky-50 text-sky-600 rounded-lg group-hover:bg-indigo-55 group-hover:text-indigo-600 transition-colors">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="border-b border-slate-200 no-print mb-6">
        <div className="flex gap-6 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'scheduler', label: 'Calendario y Planificador', icon: CalendarIcon },
            { id: 'auditor', label: 'Conciliación de Reportes', count: pendingValidation, icon: ClipboardList },
            { id: 'ordersList', label: 'Bitácora General', icon: FileText },
            { id: 'dashboard', label: 'Métricas de Ingenieros', icon: BarChart3 }
          ].map(sb => {
            const Icon = sb.icon;
            const isActive = activeSubTab === sb.id;
            return (
              <button
                key={sb.id}
                id={`btn-admin-subtab-${sb.id}`}
                onClick={() => setActiveSubTab(sb.id as any)}
                className={`flex items-center gap-2 pb-3 text-xs font-bold relative transition-colors whitespace-nowrap ${
                  isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{sb.label}</span>
                {sb.count !== undefined && sb.count > 0 && (
                  <span className="bg-amber-500 text-white font-bold text-[9px] leading-none px-1.5 py-0.5 rounded-full">
                    {sb.count}
                  </span>
                )}
                {isActive && (
                  <motion.div 
                    layoutId="adminSubTabBorder"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Rendering Block */}
      <div className="min-h-[400px]">
        {/* Tab A: Scheduler */}
        {activeSubTab === 'scheduler' && (
          <div className="space-y-4">
            {/* Scheduler Action Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs no-print">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  id="btn-toggle-importer"
                  onClick={() => setIsImporterOpen(!isImporterOpen)}
                  className={`font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border ${
                    isImporterOpen 
                      ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600' 
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>{isImporterOpen ? 'Ocultar Ingestor CSV' : '📥 Alimentar Historial (CSV)'}</span>
                </button>
                <button
                  id="btn-create-order"
                  onClick={() => {
                    setNewWOClient('');
                    setNewWOClientSearch('');
                    setNewWOEquipment('');
                    setNewWONotes('');
                    setNewWOSupportEngineers([]);
                    setNewWOSupportEngineer('');
                    setNewWOType('Preventivo');
                    setNewWOTimeStart('09:00');
                    setNewWOTimeEnd('11:00');
                    setNewWODurationDays(1);
                    setNewWODate(currentDateStr);
                    setWoEngDropdownOpen(false);
                    setWoEngSearchQuery('');
                    setIsCreatingWO(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer border border-indigo-600"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Asignar Mantenimiento</span>
                </button>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintCalendar}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  title="Imprimir calendario a PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Imprimir PDF</span>
                </button>
                
                <button
                  type="button"
                  onClick={handleExportCalendarExcel}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  title="Exportar calendario a Excel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Descargar Excel</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsReportMonthModalOpen(true)}
                  disabled={currentMonthWOs.filter(wo => wo.status !== 'Reportado' && wo.status !== 'Conciliado').length === 0}
                  className={`font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border ${
                    currentMonthWOs.filter(wo => wo.status !== 'Reportado' && wo.status !== 'Conciliado').length === 0
                      ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 hover:border-emerald-300'
                  }`}
                  title="Reportar todas las órdenes de este mes que no tengan reporte"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Reportar Mes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(true)}
                  disabled={currentMonthWOs.length === 0}
                  className={`font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border ${
                    currentMonthWOs.length === 0
                      ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                      : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200 hover:border-red-300'
                  }`}
                  title="Eliminar todas las agendas de este mes con confirmación"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Vaciar Mes</span>
                </button>
              </div>
            </div>

            {/* Collapsible Importer Panel */}
            {isImporterOpen && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 no-print" id="csv-import-panel">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h5 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                      📥 Ingestor de Histórico y Planificación CSV
                    </h5>
                    <p className="text-3xs text-slate-500 mt-0.5 font-medium">Sube tus archivos CSV de origen para alimentar el sistema. Soporta formato Planificación y Reportes Cruzados.</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      id="btn-demo-planificacion"
                      onClick={handleLoadSamplePlanificacion}
                      className="bg-indigo-50 hover:bg-indigo-150 text-indigo-700 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
                    >
                      🧪 Demo Planificación
                    </button>
                    <button
                      type="button"
                      id="btn-demo-reportes"
                      onClick={handleLoadSampleReportes}
                      className="bg-emerald-50 hover:bg-emerald-150 text-emerald-700 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-emerald-250 transition-colors cursor-pointer"
                    >
                      🧪 Demo Reportes
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  {/* Dropzone field (Col-5) */}
                  <div className="md:col-span-5 space-y-2">
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 transition-all text-center relative ${
                        dragActive 
                          ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]' 
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100/50'
                      }`}
                    >
                      <input 
                        type="file" 
                        id="csv-file-input"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="space-y-2 pointer-events-none">
                        <div className="mx-auto w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                          <Database className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-2xs font-extrabold text-slate-700">Arrastra tu archivo CSV aquí</p>
                          <p className="text-3xs text-slate-400 mt-1">O haz clic para seleccionar desde tu disco duro</p>
                        </div>
                        <span className="inline-block bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[8px] font-mono font-bold text-slate-500">
                          Soporta: UTF-8, Comas, Semicolones
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Parse Results Preview & Summary (Col-7) */}
                  <div className="md:col-span-7 bg-slate-50/60 rounded-xl border border-slate-150 p-4 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                        <h6 className="font-bold text-2xs text-slate-700 uppercase tracking-wide">Estado de Interpretación</h6>
                      </div>

                      <div className="mt-2.5 text-3xs space-y-2.5 leading-normal">
                        {csvFileName ? (
                          <div>
                            <p className="font-bold text-indigo-950 flex items-center gap-1.5">
                              📄 Archivo: <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-xs font-serif font-semibold">{csvFileName}</span>
                            </p>
                            
                            <div className="flex items-center gap-4 mt-2.5 mb-2 bg-white/60 p-2 rounded-lg border border-slate-150">
                              <div>
                                <label className="block text-[8px] font-bold text-slate-450 uppercase mb-0.5">Año Planificación</label>
                                <select
                                  value={importYear}
                                  onChange={(e) => handleImportYearChange(e.target.value)}
                                  className="bg-white border border-slate-250 rounded px-2 py-0.5 text-3xs font-extrabold text-slate-700 outline-hidden"
                                >
                                  {['2025', '2026', '2027', '2028'].map(y => (
                                    <option key={y} value={y}>{y} Año</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[8px] font-bold text-slate-450 uppercase mb-0.5">Mes Planificación</label>
                                <select
                                  value={importMonth}
                                  onChange={(e) => handleImportMonthChange(e.target.value)}
                                  className="bg-white border border-slate-250 rounded px-2 py-0.5 text-3xs font-extrabold text-slate-700 outline-hidden"
                                >
                                  {[
                                    { val: '01', name: 'Enero' },
                                    { val: '02', name: 'Febrero' },
                                    { val: '03', name: 'Marzo' },
                                    { val: '04', name: 'Abril' },
                                    { val: '05', name: 'Mayo' },
                                    { val: '06', name: 'Junio' },
                                    { val: '07', name: 'Julio' },
                                    { val: '08', name: 'Agosto' },
                                    { val: '09', name: 'Septiembre' },
                                    { val: '10', name: 'Octubre' },
                                    { val: '11', name: 'Noviembre' },
                                    { val: '12', name: 'Diciembre' }
                                  ].map(m => (
                                    <option key={m.val} value={m.val}>{m.name}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {detectedFormatType && (
                              <p className="mt-1.5 font-semibold">
                                Esquema Identificado: {' '}
                                <span className={`px-2 py-0.5 rounded font-extrabold text-[9px] uppercase ${
                                  detectedFormatType === 'reportes' ? 'bg-emerald-100 text-emerald-800 border border-emerald-250' : 'bg-indigo-100 text-indigo-800 border border-indigo-250'
                                }`}>
                                  {detectedFormatType === 'reportes' ? 'Reportes Históricos por Ingeniero' : 'Planificación Mensual (Calendario)'}
                                </span>
                              </p>
                            )}
                            <p className="text-slate-600 mt-1.5 italic font-semibold">"{importFeedback}"</p>
                          </div>
                        ) : (
                          <div className="text-slate-400 py-6 text-center italic font-semibold">
                            Sin datos cargados. Carga un archivo CSV o selecciona cualquiera de nuestros dos accesos demo rápidos para simular la importación en tiempo real.
                          </div>
                        )}
                      </div>
                    </div>

                    {parsedOrders.length > 0 && (
                      <div className="border-t border-slate-150 pt-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xs font-bold text-slate-650">
                            Previsualizar: <strong className="text-slate-900 bg-white px-2 py-0.5 rounded border font-mono">{parsedOrders.length} registros</strong>
                          </span>
                        </div>
                        <button
                          type="button"
                          id="btn-commit-csv"
                          onClick={handleCommitImport}
                          className="bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-2xs px-4 py-2 rounded-lg transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-xs flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Confirmar e Integrar en Sistema</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Previsualización en mini-tabla opcional si hay datos parsedOrders */}
                {parsedOrders.length > 0 && (
                  <div className="border border-slate-150 rounded-xl overflow-hidden text-3xs max-h-48 overflow-y-auto">
                    <table className="w-full text-left font-sans">
                      <thead className="bg-slate-100 border-b border-slate-200 text-slate-500 font-extrabold sticky top-0 uppercase">
                        <tr>
                          <th className="p-2">Ubicación Cliente</th>
                          <th className="p-2">Equipo / Activo</th>
                          <th className="p-2">Técnico Mapeado</th>
                          <th className="p-2">Fecha Normalizada</th>
                          <th className="p-2">Horario</th>
                          {detectedFormatType === 'reportes' && <th className="p-2">Reporte Entregado (Estado)</th>}
                          <th className="p-2">Observaciones / Tipo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-650 bg-white">
                        {parsedOrders.map((wo, i) => {
                          const cli = clients.find(c => c.id === wo.clientId) || parsedClients.find(c => c.id === wo.clientId);
                          const eng = engineers.find(e => e.id === wo.engineerId) || parsedEngineers.find(e => e.id === wo.engineerId);
                          const supportEng = wo.supportEngineerId
                            ? (engineers.find(e => e.id === wo.supportEngineerId) || parsedEngineers.find(e => e.id === wo.supportEngineerId))
                            : null;
                          const repMatched = parsedReports.find(r => r.workOrderId === wo.id);
                          
                          return (
                            <tr key={i} className="hover:bg-slate-50/50">
                              <td className="p-2 font-bold text-slate-800">{cli?.name || 'Cliente Nuevo'}</td>
                              <td className="p-2 font-mono text-slate-900">{wo.equipmentName}</td>
                              <td className="p-2 text-indigo-900 font-bold">
                                👤 {eng?.name.replace('Ing. ', '') || 'Por Asignar'}
                                {supportEng && <span className="text-[10px] font-normal text-slate-500 ml-1">(Apoyo: {supportEng.name.replace('Ing. ', '')})</span>}
                              </td>
                              <td className="p-2 font-mono">{wo.plannedDate}</td>
                              <td className="p-2 font-mono text-indigo-700">{wo.plannedTime || '09:00 AM'}</td>
                              {detectedFormatType === 'reportes' && (
                                <td className="p-2">
                                  <span className={`px-1.5 py-0.2 rounded font-extrabold uppercase text-[8px] ${
                                    repMatched ? 'bg-emerald-50 text-emerald-800 border border-emerald-150' : 'bg-amber-50 text-amber-800 border border-amber-150'
                                  }`}>
                                    {repMatched ? 'SÍ (Entregado)' : 'NO (Pendiente)'}
                                  </span>
                                </td>
                              )}
                              <td className="p-2 truncate max-w-[150px] font-sans font-medium text-slate-500">{wo.notes}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            <div id="printable-calendar" className="space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-indigo-50 border border-indigo-100 p-4 rounded-xl gap-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2 flex-wrap">
                      <span>Cronograma Mensual -</span>
                      <div className="flex gap-2 flex-wrap items-center">
                        <select
                          value={calendarMonth}
                          onChange={(e) => setCalendarMonth(Number(e.target.value))}
                          className="bg-white border border-indigo-255 rounded px-2 py-0.5 text-xs font-extrabold text-indigo-900 cursor-pointer outline-hidden"
                        >
                          {[
                            { val: 1, name: 'Enero' },
                            { val: 2, name: 'Febrero' },
                            { val: 3, name: 'Marzo' },
                            { val: 4, name: 'Abril' },
                            { val: 5, name: 'Mayo' },
                            { val: 6, name: 'Junio' },
                            { val: 7, name: 'Julio' },
                            { val: 8, name: 'Agosto' },
                            { val: 9, name: 'Septiembre' },
                            { val: 10, name: 'Octubre' },
                            { val: 11, name: 'Noviembre' },
                            { val: 12, name: 'Diciembre' }
                          ].map(m => (
                            <option key={m.val} value={m.val}>{m.name}</option>
                          ))}
                        </select>
                        <select
                          value={calendarYear}
                          onChange={(e) => setCalendarYear(Number(e.target.value))}
                          className="bg-white border border-indigo-255 rounded px-2 py-0.5 text-xs font-extrabold text-indigo-900 cursor-pointer outline-hidden"
                        >
                          {[2025, 2026, 2027, 2028].map(y => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>

                        {/* Engineer Highlight Selector */}
                        <div className="flex items-center gap-1.5 ml-2 no-print">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Ingeniero:</span>
                          <select
                            value={highlightedEngineerId || ''}
                            onChange={(e) => setHighlightedEngineerId(e.target.value || null)}
                            className="bg-white border border-indigo-200 rounded px-2 py-0.5 text-xs font-extrabold text-indigo-900 cursor-pointer outline-hidden focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="">Todos 👥</option>
                            {monthEngineers.map(e => (
                              <option key={e.id} value={e.id}>
                                {getEngineerEmoji(e.id)} {e.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </h4>
                    <p className="text-3xs text-slate-500 mt-0.5 font-medium">Haz clic sobre un día del calendario para seleccionarlo y programar agendas directas.</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end no-print">
                  {/* Buscador interactivo */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar cliente, técnico, equipo..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-white border border-indigo-200 rounded-lg pl-8 pr-7 py-1 text-xs font-semibold text-slate-700 outline-hidden focus:ring-1 focus:ring-indigo-500 placeholder-slate-400 w-48 md:w-64 transition-all"
                    />
                    <Search className="w-3.5 h-3.5 text-indigo-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs font-mono font-bold text-indigo-700 bg-white border border-indigo-200 px-3 py-1 rounded-lg">
                    Día seleccionado: {calendarMonthName} {selectedDay}, {calendarYear}
                  </p>
                </div>
              </div>

              {/* Calendar grid split by weeks to allow horizontal 1-page-per-week print layout */}
              {(() => {
                const flatDays = renderCalendarDays();
                const totalItems = flatDays.length;
                const remainder = totalItems % 7;
                const paddingCount = remainder === 0 ? 0 : 7 - remainder;
                const paddedDays = [...flatDays];
                
                for (let i = 1; i <= paddingCount; i++) {
                  paddedDays.push(
                    <div
                      key={`blank-end-${i}`}
                      className="min-h-[115px] p-2 bg-slate-50/20 flex flex-col justify-between opacity-45 text-slate-300"
                    >
                      <span className="font-mono text-2xs font-semibold"></span>
                      <span className="text-4xs text-center font-mono select-none"></span>
                    </div>
                  );
                }

                // Chunk into arrays of 7
                const weeks = [];
                for (let i = 0; i < paddedDays.length; i += 7) {
                  weeks.push(paddedDays.slice(i, i + 7));
                }

                return (
                  <div className="space-y-2 print:space-y-0 calendar-weeks-wrapper">
                    {/* Screen-only Header Row */}
                    <div className="grid grid-cols-7 gap-0 print:hidden text-center mb-1">
                      {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(dayName => (
                        <div key={dayName} className="font-bold text-3xs text-slate-400 uppercase py-1.5">
                          {dayName}
                        </div>
                      ))}
                    </div>

                    {/* Weeks */}
                    {weeks.map((weekDays, wIndex) => {
                      const weekDaysData = weekDays.map((cell) => {
                        const keyStr = cell.key ? cell.key.toString() : '';
                        if (keyStr.startsWith('blank-') || keyStr.startsWith('blank-end-')) {
                          return { type: 'placeholder' as const };
                        }
                        const dayNum = parseInt(keyStr, 10);
                        if (isNaN(dayNum)) {
                          return { type: 'placeholder' as const };
                        }
                        const dateStr = `${calendarYear}-${calendarMonth.toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
                        return {
                          type: 'day' as const,
                          dayNum,
                          dateStr
                        };
                      });

                      const isWorkOrderActiveOnDate = (wo: WorkOrder, dateStr: string) => {
                        if (!wo.durationDays || wo.durationDays <= 1) return wo.plannedDate === dateStr;
                        const start = new Date(wo.plannedDate + 'T00:00:00');
                        const target = new Date(dateStr + 'T00:00:00');
                        const end = new Date(start);
                        end.setDate(start.getDate() + (wo.durationDays - 1));
                        return target >= start && target <= end;
                      };

                      const weekMultiDayWOs = workOrders.filter(wo => {
                        if (!wo.durationDays || wo.durationDays <= 1) return false;
                        return weekDaysData.some(day => day.type === 'day' && isWorkOrderActiveOnDate(wo, day.dateStr));
                      });

                      const tracks: WorkOrder[][] = [];
                      weekMultiDayWOs.forEach(wo => {
                        let colStart = -1;
                        let colSpan = 0;
                        for (let i = 0; i < 7; i++) {
                          const day = weekDaysData[i];
                          if (day.type === 'day' && isWorkOrderActiveOnDate(wo, day.dateStr)) {
                            if (colStart === -1) colStart = i + 1;
                            colSpan++;
                          }
                        }

                        if (colStart === -1) return;

                        let trackIndex = 0;
                        while (trackIndex < tracks.length) {
                          const overlaps = tracks[trackIndex].some(existingWO => {
                            let eStart = -1;
                            let eSpan = 0;
                            for (let i = 0; i < 7; i++) {
                              const day = weekDaysData[i];
                              if (day.type === 'day' && isWorkOrderActiveOnDate(existingWO, day.dateStr)) {
                                if (eStart === -1) eStart = i + 1;
                                eSpan++;
                              }
                            }
                            return eStart < colStart + colSpan && colStart < eStart + eSpan;
                          });

                          if (!overlaps) break;
                          trackIndex++;
                        }

                        if (trackIndex === tracks.length) {
                          tracks.push([]);
                        }
                        tracks[trackIndex].push(wo);
                      });

                      const shouldBreakAfter = wIndex % 2 === 1 && wIndex < weeks.length - 1;
                      return (
                        <div key={wIndex} className={`calendar-week-container bg-white rounded-xl border border-slate-200 mb-4 overflow-hidden shadow-2xs print:mb-6 print:border-slate-200 ${shouldBreakAfter ? 'print-break-after' : ''}`}>
                          {/* Print-only week header metadata */}
                          <div className="hidden print:flex justify-between items-center p-2.5 pb-1 border-b border-slate-200">
                            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                              Cronograma Mensual - {calendarMonthName} {calendarYear}
                            </span>
                            <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider">
                              Semana {wIndex + 1}
                            </span>
                          </div>

                          {/* Print-only weekday column headers */}
                          <div className="hidden print:grid grid-cols-7 gap-0 border-b border-slate-200">
                            {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(dayName => (
                              <div key={dayName} className="text-center font-bold text-[9px] text-slate-500 uppercase py-1">
                                {dayName}
                              </div>
                            ))}
                          </div>

                          {/* Multi-day events tracks (if any) */}
                          {tracks.length > 0 && (
                            <div className="bg-slate-50/40 py-2 border-b border-slate-250 space-y-1">
                              {tracks.map((track, tIdx) => (
                                <div key={tIdx} className="grid grid-cols-7 relative h-7 items-center">
                                  {track.map(wo => {
                                    let colStart = -1;
                                    let colSpan = 0;
                                    for (let i = 0; i < 7; i++) {
                                      const day = weekDaysData[i];
                                      if (day.type === 'day' && isWorkOrderActiveOnDate(wo, day.dateStr)) {
                                        if (colStart === -1) colStart = i + 1;
                                        colSpan++;
                                      }
                                    }

                                    const eng = engineers.find(e => e.id === wo.engineerId);
                                    const supportIds = wo.supportEngineerIds && wo.supportEngineerIds.length > 0
                                      ? wo.supportEngineerIds
                                      : (wo.supportEngineerId ? [wo.supportEngineerId] : []);
                                    const client = clients.find(c => c.id === wo.clientId);
                                    const engColor = eng ? getEngineerColorClasses(eng.id) : null;

                                    const matchesQuery = searchQuery ? matchesSearch(wo) : true;
                                    const matchesEng = highlightedEngineerId 
                                      ? (wo.engineerId === highlightedEngineerId || wo.supportEngineerId === highlightedEngineerId || wo.supportEngineerIds?.includes(highlightedEngineerId))
                                      : true;
                                    const isHighlighted = matchesQuery && matchesEng;
                                    const hasHighlightActive = !!highlightedEngineerId || !!searchQuery;

                                    let pillStyle = "";
                                    if (hasHighlightActive) {
                                      if (isHighlighted) {
                                        const basePill = wo.isEquipmentDown
                                          ? 'bg-red-50 text-red-955 border border-red-200 border-l-4 border-l-red-500'
                                          : (engColor 
                                            ? `${engColor.lightBg} ${engColor.text} border ${engColor.border} border-l-4 ${engColor.borderL}`
                                            : `bg-slate-100 border-slate-200 text-slate-700 border-l-4 border-l-slate-400`);
                                        const ringClass = highlightedEngineerId ? `ring-1 ${engColor?.ring}` : 'ring-2 ring-indigo-500';
                                        pillStyle = `${basePill} ${ringClass} scale-[1.02] shadow-md z-10`;
                                      } else {
                                        pillStyle = `bg-slate-50 border-slate-100 text-slate-300 opacity-15 filter blur-[1.5px] grayscale-[40%] scale-[0.96] pointer-events-none transition-all duration-300`;
                                      }
                                    } else {
                                      pillStyle = wo.isEquipmentDown
                                        ? 'bg-red-50 text-red-955 border border-red-150 border-l-4 border-l-red-500'
                                        : (engColor 
                                          ? `${engColor.lightBg} ${engColor.text} border ${engColor.border} border-l-4 ${engColor.borderL}`
                                          : `bg-slate-100 border-slate-200 text-slate-700 border-l-4 border-l-slate-400`);
                                    }

                                    const firstActiveDay = weekDaysData.find(d => d.type === 'day');
                                    const lastActiveDay = weekDaysData.filter(d => d.type === 'day').pop();
                                    
                                    const isStartsBefore = firstActiveDay && new Date(wo.plannedDate + 'T00:00:00') < new Date(firstActiveDay.dateStr + 'T00:00:00');
                                    
                                    const endOfEvent = new Date(wo.plannedDate + 'T00:00:00');
                                    endOfEvent.setDate(endOfEvent.getDate() + (wo.durationDays! - 1));
                                    const isEndsAfter = lastActiveDay && endOfEvent > new Date(lastActiveDay.dateStr + 'T00:00:00');

                                    const roundedClass = `${isStartsBefore ? 'rounded-l-none border-l-0' : 'rounded-l-lg'} ${isEndsAfter ? 'rounded-r-none border-r-0' : 'rounded-r-lg'}`;

                                    return (
                                      <div
                                        key={wo.id}
                                        draggable="true"
                                        onDragStart={(e) => {
                                          e.dataTransfer.setData("text/plain", wo.id);
                                          e.dataTransfer.effectAllowed = "move";
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setInfoWO(wo);
                                        }}
                                        style={{ gridColumn: `${colStart} / span ${colSpan}` }}
                                        className={`h-7 px-2 mx-1 flex items-center justify-between text-[9px] font-bold select-none cursor-pointer transition-all shadow-3xs ${pillStyle} ${roundedClass}`}
                                        title={`${client?.name || ''} - ${wo.equipmentName} - ${eng?.name || ''}${supportIds.length > 0 ? ` [Apoyo: ${supportIds.map(id => engineers.find(e => e.id === id)?.name || id).join(', ')}]` : ''}`}
                                      >
                                        <div className="flex items-center gap-1.5 truncate flex-1 mr-1">
                                          <span className="shrink-0">{eng ? getEngineerEmoji(eng.id) : '👤'}</span>
                                          <span className="truncate text-slate-800 uppercase tracking-wide">
                                            {client?.name || 'Cliente'} - {wo.equipmentName}
                                          </span>
                                          {supportIds.length > 0 && (
                                            <span className="text-[7.5px] font-medium text-slate-500 shrink-0 flex items-center gap-1">
                                              {supportIds.map(id => {
                                                const sEng = engineers.find(e => e.id === id);
                                                if (!sEng) return null;
                                                return (
                                                  <span key={id} className="flex items-center gap-0.5">
                                                    + {getEngineerEmoji(sEng.id)} {sEng.name.replace('Ing. ', '').split(' ')[0]}
                                                  </span>
                                                );
                                              })}
                                            </span>
                                          )}
                                        </div>
                                        
                                        <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-full border shrink-0 ${
                                          wo.isEquipmentDown ? 'bg-red-100 text-red-800 border-red-250' :
                                          wo.status === 'Conciliado' ? 'bg-emerald-100/60 text-emerald-800 border-emerald-250' :
                                          wo.status === 'Reportado' ? 'bg-indigo-100/60 text-indigo-800 border-indigo-250' :
                                          wo.status === 'Realizado' ? 'bg-blue-100/60 text-blue-800 border-blue-250' :
                                          wo.status === 'En Proceso' ? 'bg-sky-100/60 text-sky-800 border-sky-250' :
                                          'bg-yellow-100/60 text-yellow-800 border-yellow-250'
                                        }`}>
                                          {wo.isEquipmentDown ? 'Parado ⚠️' : wo.status}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Week days grid */}
                          <div className="grid grid-cols-7 calendar-days-grid divide-x divide-slate-200">
                            {weekDays}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Tab B: Auditor Room (Modern App Reconciliation Module) */}
        {activeSubTab === 'auditor' && (
          <div className="space-y-6" id="auditor-reconciliation-room">
            
            {/* View Selector & Header */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
              <div>
                <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-indigo-650" />
                  Módulo de Conciliación y Auditoría Cruzada
                </h4>
                <p className="text-3xs text-slate-500 mt-0.5">Concilia los reportes e informes técnicos cargados desde campo con las asignaciones planificadas del sistema.</p>
              </div>

              {/* PDF & Layout Controls */}
              <div className="flex flex-wrap gap-2 items-center no-print">
                <button
                  onClick={handlePrintCalendar}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-3xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-red-500" />
                  <span>Imprimir PDF</span>
                </button>

                {/* Toggle layout styles */}
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <button
                    id="btn-auditor-style-excel"
                    onClick={() => setAuditorStyle('excelTabs')}
                    className={`px-3 py-1.5 text-3xs font-bold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                      auditorStyle === 'excelTabs'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Consolidado por Técnico</span>
                  </button>
                  <button
                    id="btn-auditor-style-desk"
                    onClick={() => {
                      setAuditorStyle('auditDesk');
                      // Pick the first reported order to review if none selected
                      const firstReported = workOrders.filter(wo => {
                        const dateObj = new Date(wo.plannedDate + 'T00:00:00');
                        return dateObj.getMonth() + 1 === auditorMonth && dateObj.getFullYear() === auditorYear;
                      }).find(wo => wo.status === 'Reportado');
                      if (firstReported) setSelectedAuditWOId(firstReported.id);
                    }}
                    className={`px-3 py-1.5 text-3xs font-bold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                      auditorStyle === 'auditDesk'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Mesa de Auditoría Lado-a-Lado</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sub-view A: CONSOLIDATED APP CHIPS AND TABLE VIEW */}
            {auditorStyle === 'excelTabs' && (
              <div className="space-y-4" id="excel-tabs-view">
                
                {/* Modern App Header Banner */}
                <div className="bg-slate-900 text-white px-5 py-4 rounded-t-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400 border border-emerald-500/20">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black tracking-tight uppercase">Buzón de Conciliación Consolidado</p>
                      <p className="text-3xs text-slate-400 font-medium">Contraste y validación de reportes de servicio vs órdenes programadas</p>
                    </div>
                  </div>
                  
                  {/* Month / Year filter in header */}
                  <div className="flex flex-wrap items-center gap-3 no-print">
                    {/* Month Filter */}
                    <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 shadow-2xs">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Mes</span>
                      <select
                        value={auditorMonth}
                        onChange={(e) => setAuditorMonth(Number(e.target.value))}
                        className="bg-transparent text-xs font-bold text-white cursor-pointer border-none outline-hidden p-0 focus:ring-0"
                      >
                        {monthsList.map((m, idx) => (
                          <option key={idx + 1} value={idx + 1} className="text-slate-900">{m}</option>
                        ))}
                      </select>
                    </div>

                    {/* Year Filter */}
                    <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 shadow-2xs">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Año</span>
                      <select
                        value={auditorYear}
                        onChange={(e) => setAuditorYear(Number(e.target.value))}
                        className="bg-transparent text-xs font-bold text-white cursor-pointer border-none outline-hidden p-0 focus:ring-0"
                      >
                        {[2025, 2026, 2027, 2028].map(y => (
                          <option key={y} value={y} className="text-slate-900">{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Sheets / Engineers Tab Bar */}
                <div className="bg-slate-50 border-x border-b border-slate-200 flex items-center px-4 overflow-x-auto gap-2 py-2.5 no-scrollbar">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-2">Técnico:</span>
                  {engineers.map(e => {
                    const isSelected = selectedEngTab === e.id;
                    const engOrders = workOrders.filter(wo => {
                      if (wo.engineerId !== e.id && wo.supportEngineerId !== e.id && !wo.supportEngineerIds?.includes(e.id)) return false;
                      const dateObj = new Date(wo.plannedDate + 'T00:00:00');
                      return dateObj.getMonth() + 1 === auditorMonth && dateObj.getFullYear() === auditorYear;
                    });
                    const engPendingReports = engOrders.filter(wo => wo.status === 'Reportado').length;

                    return (
                      <button
                        key={e.id}
                        id={`excel-sheet-tab-${e.id}`}
                        onClick={() => setSelectedEngTab(e.id)}
                        className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm font-extrabold'
                            : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600'
                        }`}
                      >
                        <span className="truncate">{e.name.replace('Ing. ', '')}</span>
                        {engPendingReports > 0 && (
                          <span className={`${isSelected ? 'bg-white text-indigo-700' : 'bg-amber-500 text-white'} text-[9px] leading-none font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center animate-pulse`}>
                            {engPendingReports}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Table Sheet body */}
                <div className="bg-white border-x border-b border-slate-200 rounded-b-xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-3xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wide">
                          <th className="p-3 border-r border-slate-200 text-center w-12 text-slate-350">#</th>
                          <th className="p-3 border-r border-slate-200">Cliente / Hospital</th>
                          <th className="p-3 border-r border-slate-200">Reporte Técnico</th>
                          <th className="p-3 border-r border-slate-200">Equipo / Tarea Asignada</th>
                          <th className="p-3 border-r border-slate-200">Fecha</th>
                          <th className="p-3 border-r border-slate-200 text-center w-40">Reporte Entregado (SI/NO)</th>
                          <th className="p-3">Comentarios / Observaciones de Conciliación</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150 font-medium font-sans text-slate-700">
                        {(() => {
                          const engOrders = workOrders.filter(wo => {
                            if (wo.engineerId !== selectedEngTab && wo.supportEngineerId !== selectedEngTab && !wo.supportEngineerIds?.includes(selectedEngTab)) return false;
                            const dateObj = new Date(wo.plannedDate + 'T00:00:00');
                            return dateObj.getMonth() + 1 === auditorMonth && dateObj.getFullYear() === auditorYear;
                          });

                          if (engOrders.length === 0) {
                            const monthName = monthsList[auditorMonth - 1] || 'Marzo';
                            return (
                              <tr>
                                <td colSpan={7} className="p-12 text-center text-slate-400 font-medium italic">
                                  No hay órdenes de servicio agendadas para este técnico en {monthName} de {auditorYear}.
                                </td>
                              </tr>
                            );
                          }

                          return engOrders.map((wo, index) => {
                            const client = clients.find(c => c.id === wo.clientId);
                            const matchedReport = reports.find(rep => rep.workOrderId === wo.id);
                            const isDelivered = wo.status === 'Conciliado';
                            const isPendingApproval = wo.status === 'Reportado';

                            return (
                              <tr key={wo.id} className="hover:bg-slate-50/75 transition-colors">
                                <td className="p-2.5 border-r border-slate-150 text-center font-mono text-slate-400 bg-slate-50/50">{index + 1}</td>
                                
                                {/* Cliente */}
                                <td className="p-2.5 border-r border-slate-150">
                                  <p className="font-bold text-slate-900">{client?.name}</p>
                                  <p className="text-[9px] text-slate-400 mt-0.5 truncate max-w-[180px]">{client?.address}</p>
                                </td>

                                {/* Reportes Code */}
                                <td className="p-2.5 border-r border-slate-150 font-mono font-bold">
                                  {matchedReport ? (
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded text-[10px]">
                                        {matchedReport.id}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 text-4xs italic">Falta Enviar (Técnico)</span>
                                  )}
                                </td>

                                {/* Equipo/Tarea */}
                                <td className="p-2.5 border-r border-slate-150">
                                  <p className="font-bold text-slate-800">{wo.equipmentName}</p>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                    <span className={`text-[8.5px] font-bold inline-block px-1.5 py-0.2 rounded uppercase ${
                                      wo.type === 'Correctivo' ? 'bg-red-50 text-red-650' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                      {wo.type}
                                    </span>
                                    {(() => {
                                      const supportIds = wo.supportEngineerIds && wo.supportEngineerIds.length > 0
                                        ? wo.supportEngineerIds
                                        : (wo.supportEngineerId ? [wo.supportEngineerId] : []);
                                      
                                      if (supportIds.includes(selectedEngTab)) {
                                        return (
                                          <span className="text-[8.5px] font-bold inline-block px-1.5 py-0.2 rounded uppercase bg-indigo-50 text-indigo-700">
                                            Apoyo
                                          </span>
                                        );
                                      } else if (supportIds.length > 0) {
                                        const supportNamesStr = supportIds
                                          .map(id => engineers.find(e => e.id === id)?.name.replace('Ing. ', '') || '?')
                                          .join(' + ');
                                        return (
                                          <span className="text-[8.5px] font-medium inline-block px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                            Titular (Apoyo: {supportNamesStr})
                                          </span>
                                        );
                                      } else {
                                        return (
                                          <span className="text-[8.5px] font-medium inline-block px-1.5 py-0.2 rounded bg-slate-50 text-slate-400">
                                            Titular Único
                                          </span>
                                        );
                                      }
                                    })()}
                                  </div>
                                </td>

                                {/* Fecha */}
                                <td className="p-2.5 border-r border-slate-150 font-mono font-bold text-slate-600">
                                   {wo.plannedDate}
                                   {wo.plannedTime && <span className="block text-4xs font-sans text-indigo-700 font-extrabold mt-0.5">🕒 {wo.plannedTime}</span>}
                                 </td>

                                {/* Reporte Entregado (SI / NO Switch Toggle) */}
                                <td className="p-2.5 border-r border-slate-150 text-center">
                                  <div className="flex flex-col items-center justify-center gap-1">
                                    <div className="flex items-center gap-2">
                                      <span className={`text-[9px] font-bold ${isDelivered ? 'text-emerald-600' : 'text-slate-400'}`}>NO</span>
                                      
                                      {/* Custom Toggle switch */}
                                      <button
                                        type="button"
                                        id={`toggle-deliver-state-${wo.id}`}
                                        disabled={!matchedReport && !isDelivered}
                                        onClick={() => {
                                          if (isDelivered) {
                                            onValidateReport(wo.id, 'rechazado', 'Se cambia estatus manualmente a Reportado desde tabla de conciliación.');
                                          } else {
                                            onValidateReport(wo.id, 'aprobado', 'Reporte validado y conciliado desde el portal de administración.');
                                          }
                                        }}
                                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-205 focus:outline-hidden ${
                                          isDelivered ? 'bg-emerald-600' : 'bg-slate-200'
                                        } ${!matchedReport && !isDelivered ? 'opacity-40 cursor-not-allowed' : ''}`}
                                        title={!matchedReport ? "El ingeniero de soporte debe subir el reporte primero para habilitar conciliación" : "Cambiar estatus de conciliación"}
                                      >
                                        <span
                                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-205 ${
                                            isDelivered ? 'translate-x-5' : 'translate-x-0'
                                          }`}
                                        />
                                      </button>
                                      
                                      <span className={`text-[9px] font-bold ${isDelivered ? 'text-emerald-600 font-extrabold' : 'text-slate-400'}`}>SI</span>
                                    </div>

                                    {/* Status Helper */}
                                    {isDelivered && (
                                      <span className="bg-emerald-50 text-emerald-700 text-[8px] px-1.5 py-0.2 rounded font-bold uppercase border border-emerald-150">
                                        CONCILIADO OK
                                      </span>
                                    )}
                                    {isPendingApproval && (
                                      <span className="bg-amber-50 text-amber-600 text-[8px] px-1.5 py-0.2 rounded font-bold uppercase border border-amber-100 animate-pulse">
                                        PND AUDITORÍA
                                      </span>
                                    )}
                                    {!matchedReport && (
                                      <span className="text-[8px] text-slate-400 font-semibold italic">
                                        Falta Informe Campo
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* Comentarios */}
                                <td className="p-2.5">
                                  {matchedReport ? (
                                    <div className="space-y-1">
                                      <input
                                        id={`excel-comment-input-${wo.id}`}
                                        type="text"
                                        placeholder="Agregar nota administrativa..."
                                        defaultValue={matchedReport.validationNotes || "Revisado y validado en sistema."}
                                        onBlur={(e) => {
                                          // Silently update notes
                                          matchedReport.validationNotes = e.target.value;
                                        }}
                                        className="w-full text-3xs p-1.5 rounded border border-slate-200 bg-white font-sans text-slate-600 focus:ring-1 focus:ring-indigo-500"
                                      />
                                      <p className="text-[8px] text-slate-400">Presiona fuera o pulsa Enter para guardar observaciones directas.</p>
                                    </div>
                                  ) : (
                                    <p className="text-slate-400 text-4xs italic">Registro bloqueado, esperando firma de técnico...</p>
                                  )}
                                </td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Help tip card */}
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex gap-3 text-3xs text-slate-700">
                  <span className="text-indigo-650 font-bold text-xs shrink-0 font-mono">📢 GUÍA DE CONCILIACIÓN DE REPORTES:</span>
                  <div className="leading-relaxed">
                    <p className="font-bold">¿Cómo conciliar reportes técnicos en el sistema?</p>
                    <p className="mt-0.5">En la tabla superior, cada fila representa una orden de mantenimiento planificada para el mes seleccionado. Cuando un técnico de soporte carga su informe digital desde campo, la orden pasa al estado <strong>PND AUDITORÍA</strong>. Al verificar los datos y pulsar el interruptor <strong>SI</strong> (Conciliado), la orden se marcará como validada y cerrada definitivamente en el sistema cloud.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-view B: HIGH VISUAL SYSTEM SPLIT AUDITOR DECK */}
            {auditorStyle === 'auditDesk' && (
              <div id="split-auditor-deck-view">
                {(() => {
                  const monthPendingValidation = workOrders.filter(wo => {
                    if (wo.status !== 'Reportado') return false;
                    const dateObj = new Date(wo.plannedDate + 'T00:00:00');
                    return dateObj.getMonth() + 1 === auditorMonth && dateObj.getFullYear() === auditorYear;
                  }).length;
                  
                  if (monthPendingValidation === 0) {
                    const monthName = monthsList[auditorMonth - 1] || 'Marzo';
                    return (
                      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-3">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto animate-bounce" />
                        <h4 className="font-bold text-slate-800">¡Bandeja de Conciliación Limpia!</h4>
                        <p className="text-xs text-slate-500">
                          Todos los reportes cargados para {monthName} de {auditorYear} han sido conciliados exitosamente contra la agenda física. No hay auditorías pendientes.
                        </p>
                        <p className="text-3xs font-semibold text-indigo-600 bg-white border border-slate-200 mx-auto w-fit px-3 py-1 rounded-full">
                          Tip: Ve a la pestaña de "App del Ingeniero" para enviar un reporte nuevo y auditarlo aquí.
                        </p>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Left side list of orders pending report review */}
                      <div className="lg:col-span-4 space-y-3">
                        <h4 className="font-bold text-xs text-slate-400 uppercase tracking-tight">Reportes por Validar</h4>
                        {workOrders
                          .filter(wo => {
                            if (wo.status !== 'Reportado') return false;
                            const dateObj = new Date(wo.plannedDate + 'T00:00:00');
                            return dateObj.getMonth() + 1 === auditorMonth && dateObj.getFullYear() === auditorYear;
                          })
                          .map(wo => {
                            const client = clients.find(c => c.id === wo.clientId);
                            const isSelected = selectedAuditWOId === wo.id;

                            return (
                              <button
                                key={wo.id}
                                id={`audit-row-${wo.id}`}
                                onClick={() => {
                                  setSelectedAuditWOId(wo.id);
                                  setIsRechazando(false);
                                  setValidationNotes('');
                                }}
                                className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs flex gap-3 cursor-pointer ${
                                  isSelected 
                                    ? 'bg-indigo-600 border-indigo-700 text-white shadow-md scale-[1.02]' 
                                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                                }`}
                              >
                                <div className={`p-2 rounded-lg shrink-0 w-fit ${isSelected ? 'bg-indigo-800 text-indigo-200' : 'bg-indigo-50 text-indigo-600'}`}>
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="font-mono text-3xs font-bold tracking-tight opacity-80">{wo.id}</span>
                                  <p className={`font-bold truncate mt-1 leading-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>{wo.equipmentName}</p>
                                  <p className="text-3xs truncate mt-1 opacity-70">{client?.name}</p>
                                  <div className="flex items-center gap-1.5 mt-2">
                                    <span className="text-[8px] font-bold uppercase rounded px-1.5 py-0.5 bg-red-50 text-red-655 border border-red-100 animate-pulse">
                                      PENDIENTE FIRMA ADMIN
                                    </span>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                      </div>

                      {/* Right side detailed comparison view */}
                      <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
                        {selectedAuditWOId ? (
                          (() => {
                            const selectedWO = workOrders.find(w => w.id === selectedAuditWOId);
                            const client = clients.find(c => c.id === selectedWO?.clientId);
                            const eng = engineers.find(e => e.id === selectedWO?.engineerId);
                            const supportIds = selectedWO?.supportEngineerIds && selectedWO.supportEngineerIds.length > 0
                               ? selectedWO.supportEngineerIds
                               : (selectedWO?.supportEngineerId ? [selectedWO.supportEngineerId] : []);
                            const matchedReport = reports.find(rep => rep.workOrderId === selectedAuditWOId);

                            if (!selectedWO || !matchedReport) return <p className="p-6 text-xs text-slate-400">Cargando reporte correspondiente...</p>;

                            return (
                              <div className="flex flex-col h-full justify-between">
                                {/* Split comparisons */}
                                <div className="p-6 space-y-6">
                                  <div className="border-b border-slate-150 pb-3 flex items-center justify-between">
                                    <div>
                                      <h3 className="font-extrabold text-sm text-slate-900">Mesa de Auditoría y Conciliación Directa</h3>
                                      <p className="text-3xs text-slate-500 mt-0.5">Control cruzado de la Orden Planificada v.s. Reporte de Trabajo Entregado en Campo.</p>
                                    </div>
                                    <span className="font-mono font-bold text-xs bg-slate-100 px-3 py-1 rounded-md text-slate-700 border border-slate-200">{selectedWO.id}</span>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
                                    {/* Divider vertical line to highlight side-by-side verification */}
                                    <div className="hidden sm:block absolute left-1/2 top-0 bottom-0 border-l border-dashed border-slate-200"></div>

                                    {/* Target planned WO */}
                                    <div className="space-y-4">
                                      <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                        1. Bloque de Planificación Programada
                                      </h4>
                                      
                                      <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                                        <div>
                                          <p className="text-xs text-slate-400">Cliente / Entidad del Lugar</p>
                                          <p className="font-bold text-slate-800 mt-0.5">{client?.name}</p>
                                          <p className="text-xs text-slate-500 mt-0.5">{client?.address}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-slate-400">Ingeniero Técnico Asignado</p>
                                          <p className="font-bold text-slate-800 mt-0.5">
                                            {eng?.name}
                                            {supportIds.length > 0 && (
                                              <span className="text-[10px] text-slate-500 font-normal ml-1">
                                                (Apoyo: {supportIds.map(id => engineers.find(e => e.id === id)?.name.replace('Ing. ', '') || '?').join(' + ')})
                                              </span>
                                            )}
                                          </p>
                                          <p className="text-xs text-slate-500 mt-0.5">{eng?.specialty}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-slate-400">Equipo a Intervenir</p>
                                          <p className="font-semibold text-slate-700 font-mono">{selectedWO.equipmentName}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-slate-400">Tipo de Mantenimiento programado</p>
                                          <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{selectedWO.type}</span>
                                        </div>
                                        <div>
                                          <p className="text-xs text-slate-400">Notas de Agenda</p>
                                          <p className="text-slate-600 mt-0.5 italic text-xs leading-relaxed font-serif">"{selectedWO.notes}"</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Report uploaded from field */}
                                    <div className="space-y-4">
                                      <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                        2. Reporte capturado por Ingeniero
                                      </h4>

                                      <div className="space-y-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 text-xs">
                                        <div>
                                          <p className="text-xs text-indigo-600 font-bold">Técnico que firma el cierre</p>
                                          <p className="font-bold text-slate-850 mt-0.5">{matchedReport.technicianSignature}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-slate-400 font-semibold">Hallazgos y Diagnóstico Técnico en Sitio</p>
                                          <p className="text-slate-700 mt-0.5 font-sans leading-relaxed text-xs">{matchedReport.technicalFindings}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-slate-400 font-semibold">Acciones Ejecutadas por Soporte</p>
                                          <p className="text-slate-700 mt-0.5 font-sans leading-relaxed text-xs">{matchedReport.actionsTaken}</p>
                                        </div>
                                        
                                        {matchedReport.materialsUsed.length > 0 && (
                                          <div>
                                            <p className="text-xs text-slate-400 mb-1">Repuestos y Consumibles Utilizados</p>
                                            <div className="space-y-1">
                                              {matchedReport.materialsUsed.map((m, i) => (
                                                <div key={i} className="flex justify-between items-center text-xs font-mono bg-white/70 px-2 py-0.5 rounded border border-slate-200">
                                                  <span className="truncate text-slate-600 font-semibold">{m.item}</span>
                                                  <span className="font-bold text-slate-800 shrink-0">x{m.qty}</span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        <div className="pt-2 border-t border-slate-200/50 flex justify-between items-center text-xs text-slate-505 font-medium flex-wrap gap-2">
                                          <span>Horas: <span className="font-mono font-bold text-slate-850 bg-white/80 px-1.5 py-0.5 rounded border border-slate-100">{matchedReport.hoursSpent} hrs</span></span>
                                          <span>Firma Cliente: <span className="font-bold text-emerald-650 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 inline-block">{matchedReport.clientSignatureName}</span></span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setSelectedRETE04WOId(selectedAuditWOId);
                                              setIsViewingRETE04(true);
                                            }}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-1 px-2.5 rounded-lg text-[10px] cursor-pointer flex items-center gap-1 uppercase tracking-wider transition-colors shadow-2xs"
                                          >
                                            <FileText className="w-3.5 h-3.5" />
                                            <span>Ver RE-TE-04 / Imprimir</span>
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Action footer */}
                                <div className="bg-slate-50 border-t border-slate-200 p-4 md:p-6 space-y-4">
                                  {isRechazando ? (
                                    <div className="space-y-3">
                                      <label className="block text-xs font-bold text-red-600 uppercase">Motivo del rechazo técnico</label>
                                      <textarea
                                        id="report-rejection-notes"
                                        rows={2}
                                        value={validationNotes}
                                        onChange={e => setValidationNotes(e.target.value)}
                                        placeholder="Ej: El técnico no reportó las refacciones completas o falta firma del cliente Gerardo..."
                                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-white"
                                      />
                                      <div className="flex gap-2 justify-end">
                                        <button
                                          type="button"
                                          id="btn-cancel-revert"
                                          onClick={() => {
                                            setIsRechazando(false);
                                            setValidationNotes('');
                                          }}
                                          className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                        >
                                          Cancelar
                                        </button>
                                        <button
                                          type="button"
                                          id="btn-confirm-revert"
                                          onClick={() => {
                                            if (!validationNotes) return;
                                            onValidateReport(selectedAuditWOId, 'rechazado', validationNotes);
                                            setSelectedAuditWOId(null);
                                            setIsRechazando(false);
                                          }}
                                          className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                                        >
                                          <Send className="w-3.5 h-3.5" />
                                          <span>Enviar Observaciones al Técnico</span>
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex gap-3 justify-end items-center">
                                      <button
                                        type="button"
                                        id="btn-auditor-reject"
                                        onClick={() => setIsRechazando(true)}
                                        className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-bold px-4 py-2 rounded-xl transition-colors shrink-0 cursor-pointer"
                                      >
                                        Rechazar Reporte
                                      </button>
                                      <button
                                        type="button"
                                        id="btn-auditor-approve"
                                        onClick={() => {
                                          onValidateReport(selectedAuditWOId, 'aprobado', 'Mantenimiento conciliado exitosamente. Todo correcto.');
                                          setSelectedAuditWOId(null);
                                        }}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                                      >
                                        <Check className="w-4 h-4" />
                                        <span>Aprobar y Conciliar Orden</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })()
                        ) : (
                          <div className="p-12 text-center text-slate-400 space-y-2 flex-1 flex flex-col justify-center items-center h-80">
                            <ShieldAlert className="w-8 h-8 text-indigo-200 animate-pulse" />
                            <p className="text-xs font-bold text-slate-700">Sin elementos seleccionados para verificar</p>
                            <p className="text-xs text-slate-500 max-w-xs">Selecciona un folio de la barra lateral para iniciar la conciliación interactiva.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* Tab C: Full Workorders Log */}
        {activeSubTab === 'ordersList' && (
          <div className="space-y-4">
            {/* Filters panel */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-72">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="search-orders"
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Buscar equipo, cliente o técnico..."
                  className="w-full text-xs pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                {['todos', 'Pendiente', 'En Proceso', 'Realizado', 'Reportado', 'Conciliado'].map(st => (
                  <button
                    key={st}
                    id={`btn-order-filter-${st}`}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                      statusFilter === st 
                        ? 'bg-indigo-600 text-white border-indigo-600' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {st === 'todos' ? 'Mostrar Todos' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* List Table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 text-xs uppercase">
                    <th className="p-3">Folio</th>
                    <th className="p-3">Cliente</th>
                    <th className="p-3">Equipo / Ubicación</th>
                    <th className="p-3">Ingeniero Asignado</th>
                    <th className="p-3">Fecha Planificada</th>
                    <th className="p-3">Estatus de Conciliación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400">No se encontraron órdenes de trabajo para los criterios seleccionados.</td>
                    </tr>
                  ) : (
                    filteredOrders.map(wo => {
                      const client = clients.find(c => c.id === wo.clientId);
                      const eng = engineers.find(e => e.id === wo.engineerId);
                      const supportIds = wo.supportEngineerIds && wo.supportEngineerIds.length > 0
                        ? wo.supportEngineerIds
                        : (wo.supportEngineerId ? [wo.supportEngineerId] : []);
                      
                      let badgeColor = 'bg-slate-100 text-slate-700';
                      if (wo.status === 'Pendiente') badgeColor = 'bg-yellow-50 text-yellow-700 border border-yellow-100';
                      if (wo.status === 'En Proceso') badgeColor = 'bg-sky-50 text-sky-700 border border-sky-100';
                      if (wo.status === 'Realizado') badgeColor = 'bg-blue-50 text-blue-700 border border-blue-100';
                      if (wo.status === 'Reportado') badgeColor = 'bg-red-50 text-red-700 border border-red-100 animate-pulse';
                      if (wo.status === 'Conciliado') badgeColor = 'bg-emerald-50 text-emerald-700 border border-emerald-100';

                      return (
                        <tr key={wo.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-mono font-bold text-slate-800">{wo.id}</td>
                          <td className="p-3">
                            <p className="font-bold text-slate-800">{client?.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{client?.industry}</p>
                          </td>
                          <td className="p-3 text-slate-600">
                            <span className="font-bold">{wo.equipmentName}</span>
                            <p className="text-[10px] text-slate-400 mt-0.5">{wo.type}</p>
                          </td>
                          <td className="p-3 flex items-center gap-2">
                            {eng?.avatar ? (
                              <img src={eng.avatar} className="w-6 h-6 rounded-full object-cover border border-slate-200" alt={eng.name} />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-650 flex items-center justify-center font-bold text-[10px] border border-slate-300 uppercase shrink-0">
                                {eng?.name ? eng.name.replace('Ing. ', '').substring(0, 2) : 'U'}
                              </div>
                            )}
                            <div>
                              <p className="text-slate-800 font-bold">
                                {eng?.name}
                                {supportIds.length > 0 && (
                                  <span className="text-[10px] text-slate-500 font-normal ml-1">
                                    (Apoyo: {supportIds.map(id => engineers.find(e => e.id === id)?.name.replace('Ing. ', '') || '?').join(' + ')})
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{eng?.specialty}</p>
                            </div>
                          </td>
                          <td className="p-3 font-mono font-semibold text-slate-600">
                            {wo.plannedDate}
                            {wo.plannedTime && <span className="block text-[10px] font-sans text-indigo-700 font-extrabold mt-0.5">🕒 {wo.plannedTime}</span>}
                          </td>
                          <td className="p-3">
                            <span className={`text-[10px] font-bold uppercase rounded-md px-2 py-0.5 ${badgeColor}`}>
                              {wo.status === 'Reportado' ? 'Pendiente Validar' : wo.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab D: Metrics & Performance Dashboard */}
        {activeSubTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Filter banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between no-print">
              <div>
                <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  <span>Dashboard de Rendimiento y Carga de Trabajo</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Analiza el volumen de asignaciones y el avance por ingeniero para el periodo seleccionado.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Year Selector */}
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 shadow-sm">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Año</span>
                  <select
                    value={dashYear}
                    onChange={(e) => setDashYear(Number(e.target.value))}
                    className="bg-transparent text-xs font-bold text-slate-800 cursor-pointer border-none outline-none p-0 focus:ring-0"
                  >
                    {[2025, 2026, 2027, 2028].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                {/* Period Selector */}
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
                  {(['month', 'semester', 'year'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setDashPeriod(p)}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        dashPeriod === p
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'text-slate-550 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      {p === 'month' ? 'Mensual' : p === 'semester' ? 'Semestral' : 'Anual'}
                    </button>
                  ))}
                </div>

                {/* Sub-period select details */}
                {dashPeriod === 'month' && (
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 shadow-2xs animate-fade-in">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Mes</span>
                    <select
                      value={dashMonth}
                      onChange={(e) => setDashMonth(Number(e.target.value))}
                      className="bg-transparent text-xs font-bold text-slate-800 cursor-pointer border-none outline-hidden p-0 focus:ring-0"
                    >
                      {monthsList.map((m, idx) => (
                        <option key={idx + 1} value={idx + 1}>{m}</option>
                      ))}
                    </select>
                  </div>
                )}

                {dashPeriod === 'semester' && (
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 shadow-2xs animate-fade-in">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Semestre</span>
                    <select
                      value={dashSemester}
                      onChange={(e) => setDashSemester(Number(e.target.value) as 1 | 2)}
                      className="bg-transparent text-xs font-bold text-slate-800 cursor-pointer border-none outline-hidden p-0 focus:ring-0"
                    >
                      <option value={1}>1º Semestre (Ene - Jun)</option>
                      <option value={2}>2º Semestre (Jul - Dic)</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* KPI 1: Total Orders */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute top-0 left-0 h-1 bg-indigo-500 w-full" />
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Mantenimientos Totales</span>
                    <h3 className="text-2xl font-bold text-indigo-750 mt-1">{dashboardKPIs.totalOrders}</h3>
                    <p className="text-3xs text-slate-500 mt-1">Órdenes del periodo</p>
                  </div>
                  <div className="p-3 bg-indigo-50 text-indigo-655 rounded-lg">
                    <CalendarRange className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* KPI 2: Average Workload */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute top-0 left-0 h-1 bg-teal-500 w-full" />
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Promedio de Carga</span>
                    <h3 className="text-2xl font-bold text-teal-700 mt-1">{dashboardKPIs.averageJobs}</h3>
                    <p className="text-3xs text-slate-500 mt-1">Tareas por ingeniero</p>
                  </div>
                  <div className="p-3 bg-teal-50 text-teal-650 rounded-lg">
                    <Percent className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* KPI 3: Top Performer */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute top-0 left-0 h-1 bg-amber-500 w-full" />
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Mayor Asignación</span>
                    <h3 className="text-base font-bold text-amber-700 mt-2.5 truncate max-w-[150px]">{dashboardKPIs.topEngineerName}</h3>
                    <p className="text-3xs text-slate-500 mt-1.5">Técnico con más tareas</p>
                  </div>
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                    <Award className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* KPI 4: Completion rate */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute top-0 left-0 h-1 bg-emerald-500 w-full" />
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Tasa de Cierre</span>
                    <h3 className="text-2xl font-bold text-emerald-700 mt-1">{dashboardKPIs.complianceRate}%</h3>
                    <p className="text-3xs text-slate-500 mt-1">Órdenes cerradas/ejecutadas</p>
                  </div>
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Chart and Table grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* SVG Bar Chart (Col-5) */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <h5 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <PieChart className="w-4 h-4 text-indigo-505" />
                    <span>Carga Comparativa por Técnico</span>
                  </h5>
                  <p className="text-3xs text-slate-500 mt-0.5">Distribución del número total de órdenes (incluye apoyo).</p>
                </div>

                <div className="h-64 mt-6 flex items-end justify-between px-2 pb-6 border-b border-slate-100 relative">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[8px] font-mono text-slate-350 select-none pb-6">
                    <div className="border-b border-dashed border-slate-100 w-full text-right pr-1 pt-1">Max</div>
                    <div className="border-b border-dashed border-slate-100 w-full text-right pr-1 pt-1">50%</div>
                    <div className="w-full text-right pr-1 pt-1">0</div>
                  </div>

                  {/* SVG/HTML Bars */}
                  {engineerStats.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-3xs text-slate-400 font-bold">
                      Sin datos en este periodo
                    </div>
                  ) : (
                    engineerStats.map(st => {
                      const maxTotal = Math.max(...engineerStats.map(s => s.total), 1);
                      const heightPercent = Math.max((st.total / maxTotal) * 100, 4); // minimum height to show a bar
                      const engColor = getEngineerColorClasses(st.engineer.id);
                      const barColor = engColor.bg;
                      
                      return (
                        <div 
                          key={st.engineer.id} 
                          className="flex flex-col items-center flex-1 mx-1 group relative z-10 animate-fade-in"
                        >
                          {/* Tooltip */}
                          <div className="absolute bottom-full mb-2 bg-slate-900/95 text-white p-2.5 rounded-lg text-[8.5px] leading-normal shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 w-36 z-50 text-left border border-slate-750">
                            <p className="font-bold text-[9.5px] border-b border-slate-700 pb-0.5 mb-1 text-indigo-300">
                              {st.engineer.name}
                            </p>
                            <p className="flex justify-between"><span>Total Agendadas:</span> <span className="font-bold text-white">{st.total}</span></p>
                            <p className="flex justify-between text-slate-300"><span>Principal:</span> <span>{st.asPrimary}</span></p>
                            <p className="flex justify-between text-slate-300"><span>De Apoyo:</span> <span>{st.asSupport}</span></p>
                            <div className="border-t border-slate-700/60 mt-1 pt-1 space-y-0.5 text-[8px] text-slate-400">
                              <p className="flex justify-between"><span>Conciliado:</span> <span>{st.statusCounts.Conciliado}</span></p>
                              <p className="flex justify-between"><span>Realizado:</span> <span>{st.statusCounts.Realizado}</span></p>
                              <p className="flex justify-between"><span>Reportado:</span> <span>{st.statusCounts.Reportado}</span></p>
                              <p className="flex justify-between"><span>En Proceso:</span> <span>{st.statusCounts['En Proceso']}</span></p>
                              <p className="flex justify-between"><span>Pendiente:</span> <span>{st.statusCounts.Pendiente}</span></p>
                            </div>
                          </div>

                          {/* Bar block */}
                          <div 
                            style={{ height: `${heightPercent}%` }}
                            className={`w-full max-w-[20px] rounded-t-md transition-all duration-300 ${barColor} group-hover:brightness-95 shadow-sm group-hover:shadow-md flex flex-col justify-end`}
                          >
                            {st.total > 0 && (
                              <span className="text-[8px] font-black text-white text-center pb-0.5 select-none drop-shadow-xs">
                                {st.total}
                              </span>
                            )}
                          </div>

                          {/* X Label */}
                          <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-tighter mt-1.5 truncate max-w-[30px] select-none" title={st.engineer.name}>
                            {getEngineerEmoji(st.engineer.id)} {st.engineer.name.replace('Ing. ', '').split(' ')[0]}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Breakdown Table (Col-7) */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div>
                  <h5 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-indigo-500" />
                    <span>Desglose de Productividad de Ingenieros</span>
                  </h5>
                  <p className="text-3xs text-slate-500 mt-0.5">Avance y proporción de estados por cada técnico asignado.</p>
                </div>

                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-left border-collapse text-[10px] font-semibold text-slate-600">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 text-3xs uppercase">
                        <th className="p-2.5">Ingeniero</th>
                        <th className="p-2.5 text-center">Tareas</th>
                        <th className="p-2.5 text-center">Como Principal / Apoyo</th>
                        <th className="p-2.5">Estado / Avance Proporcional</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white font-medium">
                      {engineerStats.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-slate-400 font-bold text-3xs">
                            No se encontraron registros de ingenieros para este periodo
                          </td>
                        </tr>
                      ) : (
                        engineerStats.map(st => {
                          const total = st.total;
                          const conciliadoPct = total > 0 ? (st.statusCounts.Conciliado / total) * 100 : 0;
                          const realizadoPct = total > 0 ? (st.statusCounts.Realizado / total) * 100 : 0;
                          const reportadoPct = total > 0 ? (st.statusCounts.Reportado / total) * 100 : 0;
                          const enProcesoPct = total > 0 ? (st.statusCounts['En Proceso'] / total) * 100 : 0;
                          const pendientePct = total > 0 ? (st.statusCounts.Pendiente / total) * 100 : 0;

                          return (
                            <tr key={st.engineer.id} className="hover:bg-slate-50/50">
                              <td className="p-2.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs shrink-0">{getEngineerEmoji(st.engineer.id)}</span>
                                  <div>
                                    <p className="font-bold text-slate-800 text-2xs leading-tight">{st.engineer.name}</p>
                                    <p className="text-[8px] text-slate-450 leading-none mt-0.5">{st.engineer.specialty}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-2.5 text-center font-bold text-slate-900 text-xs">{total}</td>
                              <td className="p-2.5 text-center text-[9px] text-slate-500">
                                <span className="font-bold text-indigo-700">{st.asPrimary}</span> <span className="text-[8px] text-slate-350">Pr.</span>
                                <span className="mx-1">/</span>
                                <span className="font-bold text-emerald-700">{st.asSupport}</span> <span className="text-[8px] text-slate-350">Ap.</span>
                              </td>
                              <td className="p-2.5">
                                {total === 0 ? (
                                  <span className="text-[8px] font-bold text-slate-400">Sin tareas programadas</span>
                                ) : (
                                  <div className="space-y-1 w-full max-w-[200px]">
                                    {/* Stacked Progress Bar */}
                                    <div className="h-2 rounded-full overflow-hidden flex bg-slate-100 border border-slate-200/50">
                                      {conciliadoPct > 0 && (
                                        <div 
                                          style={{ width: `${conciliadoPct}%` }}
                                          className="bg-emerald-500 h-full hover:brightness-95 transition-all"
                                          title={`Conciliado: ${st.statusCounts.Conciliado} (${Math.round(conciliadoPct)}%)`}
                                        />
                                      )}
                                      {realizadoPct > 0 && (
                                        <div 
                                          style={{ width: `${realizadoPct}%` }}
                                          className="bg-blue-500 h-full hover:brightness-95 transition-all"
                                          title={`Realizado: ${st.statusCounts.Realizado} (${Math.round(realizadoPct)}%)`}
                                        />
                                      )}
                                      {reportadoPct > 0 && (
                                        <div 
                                          style={{ width: `${reportadoPct}%` }}
                                          className="bg-indigo-500 h-full hover:brightness-95 transition-all"
                                          title={`Reportado: ${st.statusCounts.Reportado} (${Math.round(reportadoPct)}%)`}
                                        />
                                      )}
                                      {enProcesoPct > 0 && (
                                        <div 
                                          style={{ width: `${enProcesoPct}%` }}
                                          className="bg-sky-500 h-full hover:brightness-95 transition-all"
                                          title={`En Proceso: ${st.statusCounts['En Proceso']} (${Math.round(enProcesoPct)}%)`}
                                        />
                                      )}
                                      {pendientePct > 0 && (
                                        <div 
                                          style={{ width: `${pendientePct}%` }}
                                          className="bg-yellow-500 h-full hover:brightness-95 transition-all"
                                          title={`Pendiente: ${st.statusCounts.Pendiente} (${Math.round(pendientePct)}%)`}
                                        />
                                      )}
                                    </div>
                                    {/* Numeric breakdown indicators below bar */}
                                    <div className="flex gap-1.5 flex-wrap text-[7px] font-black text-slate-450 uppercase">
                                      {st.statusCounts.Conciliado > 0 && <span className="text-emerald-700">Con: {st.statusCounts.Conciliado}</span>}
                                      {st.statusCounts.Realizado > 0 && <span className="text-blue-700">Re: {st.statusCounts.Realizado}</span>}
                                      {st.statusCounts.Reportado > 0 && <span className="text-indigo-750">Rep: {st.statusCounts.Reportado}</span>}
                                      {st.statusCounts['En Proceso'] > 0 && <span className="text-sky-700">Proc: {st.statusCounts['En Proceso']}</span>}
                                      {st.statusCounts.Pendiente > 0 && <span className="text-yellow-700">Pend: {st.statusCounts.Pendiente}</span>}
                                    </div>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </>
      )}

      {activeAdminTab === 'clientes' && renderClientesTab()}
      {activeAdminTab === 'equipos' && renderEquiposTab()}
      {activeAdminTab === 'contratos' && renderContratosTab()}
      {activeAdminTab === 'cronograma' && renderCronogramaTab()}
      {activeAdminTab === 'vacaciones' && renderVacacionesTab()}

      {/* Slide-over Overlay for creating / assigning new workorder */}
      <AnimatePresence>
        {isCreatingWO && (
          <div className="fixed inset-0 bg-black/40 h-full w-full z-50 flex justify-end" id="overlay-creation-container">
            {/* Backdrop close */}
            <div className="absolute inset-0 cursor-crosshair" onClick={() => setIsCreatingWO(false)} />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white h-full z-50 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                  <div>
                    <h3 className="font-bold text-md text-slate-900">Programar Agenda</h3>
                    <p className="text-3xs text-slate-500 mt-0.5">Crear una agenda relacional para Ingenieros y Clientes.</p>
                  </div>
                  <button
                    id="btn-close-wo-slide"
                    onClick={() => setIsCreatingWO(false)}
                    className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateWO} className="space-y-4 text-xs">
                  {/* Client Select */}
                  <div className="space-y-1.5">
                    <label className="block text-2xs font-bold text-slate-500 uppercase">1. Ubicación / Sede de Cliente</label>
                    <input
                      type="text"
                      id="wo-client-input"
                      list="wo-clients-datalist"
                      value={newWOClientSearch}
                      onChange={e => {
                        const val = e.target.value;
                        setNewWOClientSearch(val);
                        
                        const matchedClient = clients.find(c => c.name.trim().toLowerCase() === val.trim().toLowerCase());
                        if (matchedClient) {
                          setNewWOClient(matchedClient.id);
                          if (matchedClient.installedEquipments.length > 0) {
                            setNewWOEquipment(matchedClient.installedEquipments[0]);
                          }
                        }
                      }}
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                      placeholder="Escribe el nombre del cliente o selecciónalo..."
                      required
                    />
                    <datalist id="wo-clients-datalist">
                      {clients.map(c => (
                        <option key={c.id} value={c.name} />
                      ))}
                    </datalist>
                  </div>

                  {/* Engineer Select — Professional searchable dropdown */}
                  <div className="space-y-1.5">
                    <label className="block text-2xs font-bold text-slate-500 uppercase">2. Ingeniero Especialista Asignado</label>

                    <div className="relative">
                      {/* Trigger button */}
                      <button
                        type="button"
                        onClick={() => setWoEngDropdownOpen(!woEngDropdownOpen)}
                        className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold flex items-center justify-between text-slate-800 focus:ring-1 focus:ring-indigo-500 cursor-pointer text-left h-[42px] transition-all hover:border-indigo-300"
                      >
                        {newWOEngineer ? (() => {
                          const eng = engineers.find(e => e.id === newWOEngineer);
                          return (
                            <span className="flex items-center gap-2.5">
                              <span className="text-lg leading-none">{eng ? getEngineerEmoji(eng.id) : '👤'}</span>
                              <span className="truncate font-bold text-slate-800">{eng?.name || 'Seleccionar Ingeniero'}</span>
                            </span>
                          );
                        })() : (
                          <span className="text-slate-400 font-normal">— Seleccionar Ingeniero —</span>
                        )}
                        <svg className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${woEngDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </button>

                      {/* Dropdown panel */}
                      {woEngDropdownOpen && (
                        <>
                          {/* Overlay to close on outside click */}
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => { setWoEngDropdownOpen(false); setWoEngSearchQuery(''); }}
                          />

                          <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-72 animate-in fade-in slide-in-from-top-1 duration-150">
                            {/* Search input */}
                            <div className="p-2.5 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
                              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <input
                                type="text"
                                placeholder="Buscar ingeniero..."
                                value={woEngSearchQuery}
                                onChange={e => setWoEngSearchQuery(e.target.value)}
                                className="w-full bg-transparent text-xs p-1 focus:outline-hidden text-slate-800 font-semibold"
                                autoFocus
                              />
                            </div>

                            {/* Options list */}
                            <div className="overflow-y-auto divide-y divide-slate-50">
                              {(() => {
                                const filtered = engineers.filter(e =>
                                  e.name.toLowerCase().includes(woEngSearchQuery.toLowerCase())
                                );
                                if (filtered.length === 0) {
                                  return (
                                    <div className="p-4 text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                      No se encontraron ingenieros
                                    </div>
                                  );
                                }
                                return filtered.map(e => {
                                  const isSelected = newWOEngineer === e.id;
                                  return (
                                    <button
                                      key={e.id}
                                      type="button"
                                      onClick={() => {
                                        setNewWOEngineer(e.id);
                                        setWoEngDropdownOpen(false);
                                        setWoEngSearchQuery('');
                                      }}
                                      className={`w-full p-3 text-left text-xs font-semibold hover:bg-indigo-50/60 transition-colors flex items-center justify-between cursor-pointer ${
                                        isSelected ? 'bg-indigo-50 text-indigo-750 font-black' : 'text-slate-800'
                                      }`}
                                    >
                                      <span className="flex items-center gap-3">
                                        <span className="text-lg leading-none w-7 text-center">{getEngineerEmoji(e.id)}</span>
                                        <span className="font-bold">{e.name}</span>
                                      </span>
                                      {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
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

                  {/* Support Engineer Checkboxes */}
                  <div className="space-y-1.5">
                    <label className="block text-2xs font-bold text-slate-500 uppercase">2.1. Técnico(s) de Apoyo (Opcional)</label>
                    <div className="flex flex-wrap gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg max-h-36 overflow-y-auto">
                      {engineers.filter(e => e.id !== newWOEngineer).map(e => {
                        const isChecked = newWOSupportEngineers.includes(e.id);
                        return (
                          <label key={e.id} className="flex items-center gap-1.5 px-2 py-1 bg-white hover:bg-slate-100 rounded-md border border-slate-200 cursor-pointer text-3xs font-medium">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(evt) => {
                                if (evt.target.checked) {
                                  setNewWOSupportEngineers([...newWOSupportEngineers, e.id]);
                                } else {
                                  setNewWOSupportEngineers(newWOSupportEngineers.filter(id => id !== e.id));
                                }
                              }}
                              className="rounded border-slate-300 text-indigo-650 focus:ring-indigo-500 w-3 h-3"
                            />
                            <span>{getEngineerEmoji(e.id)} {e.name.replace('Ing. ', '')}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Date Input */}
                  <div className="space-y-1.5">
                    <label className="block text-2xs font-bold text-slate-500 uppercase">3. Fecha Planificada ({calendarMonthName} {calendarYear})</label>
                    <input
                      id="wo-date-input"
                      type="date"
                      min={`${calendarYear}-${calendarMonth.toString().padStart(2, '0')}-01`}
                      max={`${calendarYear}-${calendarMonth.toString().padStart(2, '0')}-${new Date(calendarYear, calendarMonth, 0).getDate().toString().padStart(2, '0')}`}
                      value={newWODate}
                      onChange={e => setNewWODate(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>

                  {/* End Date Input (Fecha Hasta) */}
                  <div className="space-y-1.5">
                    <label className="block text-2xs font-bold text-slate-500 uppercase">3.1. Fecha Hasta</label>
                    <input
                      id="wo-end-date-input"
                      type="date"
                      value={getEndDateStr(newWODate, newWODurationDays)}
                      onChange={e => {
                        if (e.target.value) {
                          const newDuration = getDurationFromDates(newWODate, e.target.value);
                          setNewWODurationDays(newDuration);
                        }
                      }}
                      min={newWODate}
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
                    />
                  </div>

                  {/* Time Input */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-2xs font-bold text-slate-500 uppercase">3.2. Hora Desde</label>
                      <input
                        id="wo-time-start-input"
                        type="time"
                        required
                        value={newWOTimeStart}
                        onChange={e => setNewWOTimeStart(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-2xs font-bold text-slate-500 uppercase">3.3. Hora Hasta</label>
                      <input
                        id="wo-time-end-input"
                        type="time"
                        required
                        value={newWOTimeEnd}
                        onChange={e => setNewWOTimeEnd(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
                      />
                    </div>
                  </div>

                  {(() => {
                    const conflicts = getCreationFormConflicts();
                    if (conflicts.length === 0) return null;
                    return (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 space-y-2 mt-2">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-650 shrink-0 animate-bounce" />
                          <h4 className="font-extrabold text-xs">⚠️ Conflicto: Técnico(s) en Vacaciones</h4>
                        </div>
                        <div className="text-3xs space-y-1 font-semibold leading-normal">
                          {conflicts.map(({ engineer, vacation }) => (
                            <p key={engineer.id}>
                              • <strong>{engineer.name}</strong> tiene vacaciones aprobadas del <strong>{vacation.startDate}</strong> al <strong>{vacation.endDate}</strong>.
                            </p>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Maintenance Type */}
                  <div className="space-y-1.5">
                    <label className="block text-2xs font-bold text-slate-500 uppercase">4. Tipo de Servicio</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['Preventivo', 'Correctivo', 'Instalación', 'Calibración', 'Soporte', 'FMI', 'Capacitación', 'Inspección'] as MaintenanceType[]).map(t => (
                        <button
                          key={t}
                          type="button"
                          id={`btn-new-wo-type-${t}`}
                          onClick={() => setNewWOType(t)}
                          className={`py-1.5 rounded font-bold text-3xs border text-center transition-all ${
                            newWOType === t 
                              ? 'bg-slate-900 text-white border-slate-900' 
                              : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Equipment Name */}
                  <div className="space-y-1.5">
                    <label className="block text-2xs font-bold text-slate-500 uppercase">5. Equipo, Activo o Descripción del Trabajo</label>
                    <input
                      id="wo-equipment-input"
                      type="text"
                      required
                      value={newWOEquipment}
                      onChange={e => setNewWOEquipment(e.target.value)}
                      placeholder="Ej: Instalación, capacitación o detalle del equipo..."
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-1 focus:ring-indigo-500"
                    />
                    {equipments.filter(eq => eq.clientId === newWOClient).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className="text-[9px] font-bold text-slate-400 self-center uppercase mr-1">Rápido:</span>
                        {equipments.filter(eq => eq.clientId === newWOClient).map(eq => (
                          <button
                            key={eq.id}
                            type="button"
                            onClick={() => setNewWOEquipment(`${eq.brand} ${eq.model} (S/N: ${eq.serialNumber})`)}
                            className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-700 text-[9px] font-bold px-2 py-0.5 rounded border border-slate-200 transition-all cursor-pointer"
                          >
                            {eq.name} ({eq.model})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Duration Days */}
                  <div className="space-y-1.5">
                    <label className="block text-2xs font-bold text-slate-500 uppercase">6. Duración (Días)</label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      required
                      value={newWODurationDays}
                      onChange={e => setNewWODurationDays(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
                    />
                  </div>

                  {/* Notes / Action instructions */}
                  <div className="space-y-1.5">
                    <label className="block text-2xs font-bold text-slate-500 uppercase">7. Instrucciones o Notas técnicas</label>
                    <textarea
                      id="wo-notes-input"
                      rows={3}
                      value={newWONotes}
                      onChange={e => setNewWONotes(e.target.value)}
                      placeholder="Instrucciones específicas de seguridad, herramientas a llevar..."
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex gap-3">
                    <button
                      type="button"
                      id="btn-new-wo-cancel"
                      onClick={() => setIsCreatingWO(false)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      id="btn-new-wo-submit"
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-xs"
                    >
                      Asignar Orden
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail view Modal for workorder info */}
      <AnimatePresence>
        {infoWO && (() => {
          const client = clients.find(c => c.id === infoWO.clientId);
          const eng = engineers.find(e => e.id === infoWO.engineerId);
          const supportEng = infoWO.supportEngineerId ? engineers.find(e => e.id === infoWO.supportEngineerId) : null;
          const matchedReport = reports.find(r => r.workOrderId === infoWO.id);

          return (
            <div className="fixed inset-0 bg-black/40 h-full w-full z-50 flex items-center justify-center p-4" id="overlay-info-modal">
              {/* Backdrop close */}
              <div className="absolute inset-0 cursor-pointer" onClick={handleCloseInfoModal} />

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh] z-50 border border-slate-150 font-sans"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                  <div>
                    <span className="text-4xs font-bold font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 uppercase tracking-widest">
                      {isEditingWOState ? 'Editar Datos de la Orden' : 'Detalle de la Orden'}
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900 mt-1 flex items-center gap-1.5">
                      <span>{infoWO.id}</span>
                      <span className={`text-[9.5px] px-2 py-0.5 rounded-full uppercase font-black border ${
                        infoWO.status === 'Conciliado'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-150'
                          : infoWO.status === 'Reportado'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-150 animate-pulse'
                          : infoWO.status === 'Realizado'
                          ? 'bg-blue-50 text-blue-700 border-blue-150'
                          : infoWO.status === 'En Proceso'
                          ? 'bg-sky-50 text-sky-700 border-sky-150 animate-pulse'
                          : 'bg-yellow-50 text-yellow-700 border-yellow-150'
                      }`}>
                        {infoWO.status}
                      </span>
                    </h3>
                  </div>
                  <button
                    onClick={handleCloseInfoModal}
                    className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-650 cursor-pointer transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {isEditingWOState ? (
                  /* Form Content when editing */
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Cliente Select */}
                      <div className="space-y-1 col-span-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">1. Cliente / Sede</label>
                        <select
                          value={editedWO?.clientId || ''}
                          onChange={e => setEditedWO(prev => prev ? { ...prev, clientId: e.target.value } : null)}
                          className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs"
                        >
                          {clients.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Servicio Type */}
                      <div className="space-y-1 col-span-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">2. Tipo de Servicio</label>
                        <select
                          value={editedWO?.type || 'Preventivo'}
                          onChange={e => setEditedWO(prev => prev ? { ...prev, type: e.target.value as any } : null)}
                          className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs"
                        >
                          {(['Preventivo', 'Correctivo', 'Instalación', 'Calibración', 'Soporte', 'FMI', 'Capacitación', 'Inspección']).map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      {/* Equipo input */}
                      <div className="space-y-1 col-span-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">3. Equipo / Activo</label>
                        <input
                          type="text"
                          value={editedWO?.equipmentName || ''}
                          onChange={e => setEditedWO(prev => prev ? { ...prev, equipmentName: e.target.value } : null)}
                          className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs"
                        />
                      </div>

                      {/* Fecha input */}
                      <div className="space-y-1 col-span-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">4. Fecha Planificada</label>
                        <input
                          type="date"
                          value={editedWO?.plannedDate || ''}
                          onChange={e => setEditedWO(prev => prev ? { ...prev, plannedDate: e.target.value } : null)}
                          className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-mono text-xs"
                        />
                      </div>

                      {/* Hora Desde */}
                      <div className="space-y-1 col-span-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">5. Hora Desde</label>
                        <input
                          type="time"
                          value={parseTimeRange(editedWO?.plannedTime || '').start}
                          onChange={e => {
                            const range = parseTimeRange(editedWO?.plannedTime || '');
                            const newTime = `${formatTime12h(e.target.value)} - ${formatTime12h(range.end)}`;
                            setEditedWO(prev => prev ? { ...prev, plannedTime: newTime } : null);
                          }}
                          className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-mono text-xs"
                        />
                      </div>

                      {/* Hora Hasta */}
                      <div className="space-y-1 col-span-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">5.1. Hora Hasta</label>
                        <input
                          type="time"
                          value={parseTimeRange(editedWO?.plannedTime || '').end}
                          onChange={e => {
                            const range = parseTimeRange(editedWO?.plannedTime || '');
                            const newTime = `${formatTime12h(range.start)} - ${formatTime12h(e.target.value)}`;
                            setEditedWO(prev => prev ? { ...prev, plannedTime: newTime } : null);
                          }}
                          className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-mono text-xs"
                        />
                      </div>

                      {/* Fecha Hasta */}
                      <div className="space-y-1 col-span-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">4.1. Fecha Hasta</label>
                        <input
                          type="date"
                          value={getEndDateStr(editedWO?.plannedDate || '', editedWO?.durationDays || 1)}
                          onChange={e => {
                            if (editedWO && e.target.value) {
                              const newDuration = getDurationFromDates(editedWO.plannedDate, e.target.value);
                              setEditedWO(prev => prev ? { ...prev, durationDays: newDuration } : null);
                            }
                          }}
                          min={editedWO?.plannedDate || ''}
                          className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-mono text-xs"
                        />
                      </div>

                      {/* Ingeniero Apoyo */}
                      <div className="space-y-1 col-span-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">7. Técnico(s) de Apoyo (Opcional)</label>
                        <div className="flex flex-wrap gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg max-h-36 overflow-y-auto">
                          {engineers.filter(e => e.id !== editedWO?.engineerId).map(e => {
                            const selectedSupport = editedWO?.supportEngineerIds || (editedWO?.supportEngineerId ? [editedWO.supportEngineerId] : []);
                            const isChecked = selectedSupport.includes(e.id);
                            return (
                              <label key={e.id} className="flex items-center gap-1.5 px-2 py-1 bg-white hover:bg-slate-100 rounded-md border border-slate-200 cursor-pointer text-[10px] font-medium">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(evt) => {
                                    if (editedWO) {
                                      const nextSupport = evt.target.checked
                                        ? [...selectedSupport, e.id]
                                        : selectedSupport.filter(id => id !== e.id);
                                      setEditedWO({
                                        ...editedWO,
                                        supportEngineerIds: nextSupport,
                                        supportEngineerId: nextSupport[0] || undefined
                                      });
                                    }
                                  }}
                                  className="rounded border-slate-300 text-indigo-650 focus:ring-indigo-500 w-3 h-3"
                                />
                                <span>{getEngineerEmoji(e.id)} {e.name.replace('Ing. ', '')}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Ingeniero Principal */}
                      <div className="space-y-1 col-span-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">6. Técnico Principal</label>
                        <select
                          value={editedWO?.engineerId || ''}
                          onChange={e => setEditedWO(prev => prev ? { ...prev, engineerId: e.target.value } : null)}
                          className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs"
                        >
                          {engineers.map(eng => (
                            <option key={eng.id} value={eng.id}>
                              {getEngineerEmoji(eng.id)} {eng.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Duración en Días */}
                      <div className="space-y-1 col-span-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">9. Duración (en Días)</label>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={editedWO?.durationDays || 1}
                          onChange={e => setEditedWO(prev => prev ? { ...prev, durationDays: Math.max(1, parseInt(e.target.value) || 1) } : null)}
                          className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold"
                        />
                      </div>

                      {/* Estado de la Orden */}
                      <div className="space-y-1 col-span-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">8. Estado de la Orden</label>
                        <select
                          value={editedWO?.status || 'Pendiente'}
                          onChange={e => setEditedWO(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                          className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold"
                        >
                          {(['Pendiente', 'En Proceso', 'Realizado', 'Reportado', 'Conciliado'] as WorkOrderStatus[]).map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      {/* Estado del Equipo */}
                      <div className="space-y-1 col-span-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">¿Equipo Parado? ⚠️</label>
                        <select
                          value={editedWO?.isEquipmentDown ? 'yes' : 'no'}
                          onChange={e => setEditedWO(prev => prev ? { ...prev, isEquipmentDown: e.target.value === 'yes' } : null)}
                          className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold"
                        >
                          <option value="no">No, Operando Normal 🟢</option>
                          <option value="yes">Sí, Equipo Parado 🔴</option>
                        </select>
                      </div>

                      {/* Notas text */}
                      <div className="space-y-1 md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">10. Instrucciones / Notas del Administrador</label>
                        <textarea
                          value={editedWO?.notes || ''}
                          onChange={e => setEditedWO(prev => prev ? { ...prev, notes: e.target.value } : null)}
                          rows={3}
                          className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-serif italic text-slate-700 text-xs"
                        />
                      </div>

                      {(() => {
                        const conflicts = getEditFormConflicts();
                        if (conflicts.length === 0) return null;
                        return (
                          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 space-y-2 mt-2 md:col-span-2">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-5 h-5 text-red-650 shrink-0 animate-bounce" />
                              <h4 className="font-extrabold text-xs">⚠️ Conflicto: Técnico(s) en Vacaciones</h4>
                            </div>
                            <div className="text-3xs space-y-1 font-semibold leading-normal">
                              {conflicts.map(({ engineer, vacation }) => (
                                <p key={engineer.id}>
                                  • <strong>{engineer.name}</strong> tiene vacaciones aprobadas del <strong>{vacation.startDate}</strong> al <strong>{vacation.endDate}</strong>.
                                </p>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Form Buttons */}
                    <div className="pt-4 border-t border-slate-100 flex gap-3 justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingWOState(false);
                          setEditedWO(null);
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-2xs px-4 py-2.5 rounded-lg cursor-pointer transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (editedWO) {
                            onUpdateWorkOrder(editedWO);
                            setInfoWO(editedWO);
                            setIsEditingWOState(false);
                            setEditedWO(null);
                          }
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-2xs px-5 py-2.5 rounded-lg cursor-pointer transition-colors shadow-xs"
                      >
                        Guardar Cambios
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Standard Details Content when not editing */
                  <>
                    {/* Grid Content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Left Column - Work Order Specs */}
                      <div className="space-y-4">
                        <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cliente / Ubicación</p>
                          <h4 className="font-extrabold text-slate-800 mt-0.5">{client?.name || 'Cliente Desconocido'}</h4>
                          <p className="text-3xs text-slate-500 font-medium mt-0.5">{client?.address}</p>
                        </div>

                        <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Equipo / Activo</p>
                          <h4 className="font-extrabold text-slate-800 mt-0.5 flex items-center gap-1.5">
                            <span>{infoWO.equipmentName}</span>
                            {infoWO.isEquipmentDown && (
                              <span className="bg-red-100 text-red-800 text-[8px] px-1.5 py-0.5 rounded-full font-black border border-red-200 uppercase tracking-tight shrink-0 animate-pulse">
                                Parado ⚠️
                              </span>
                            )}
                          </h4>
                          <p className="text-3xs text-slate-500 mt-0.5"><span className="font-bold">Servicio:</span> {infoWO.type}</p>
                        </div>

                        <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Programación</p>
                          <h4 className="font-bold text-slate-800 mt-0.5">📅 {infoWO.plannedDate}</h4>
                          {infoWO.plannedTime && <p className="text-3xs text-slate-500 font-bold mt-0.5">⏰ {infoWO.plannedTime}</p>}
                          {infoWO.durationDays && infoWO.durationDays > 1 && (
                            <p className="text-3xs text-indigo-600 font-bold mt-1.5 flex items-center gap-1">
                              🔁 Duración: {infoWO.durationDays} días
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Column - Engineers & Notes */}
                      <div className="space-y-4">
                        <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Técnicos Asignados</p>
                          <div className="mt-1 space-y-1">
                            <p className="font-extrabold text-indigo-950 flex items-center gap-1 text-[11px]">
                              👤 Principal: {eng?.name || 'Sin asignar'}
                            </p>
                            {supportEng && (
                              <p className="font-semibold text-slate-600 flex items-center gap-1 text-[10.5px]">
                                👤 Apoyo: {supportEng.name}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notas del Administrador</p>
                          <p className="text-3xs text-slate-600 leading-relaxed font-medium italic mt-1 bg-white p-2 rounded border border-slate-100">
                            {infoWO.notes ? `"${infoWO.notes}"` : 'Sin observaciones adicionales.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Technical Report Section */}
                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1 mb-3">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <span>Informe de Campo</span>
                      </h4>

                      {matchedReport ? (
                        <div className="space-y-3 bg-indigo-50/40 p-4 rounded-xl border border-indigo-100/50 text-xs">
                          <div className="grid grid-cols-2 gap-3 border-b border-indigo-100/40 pb-3 font-medium">
                            <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">Código del Reporte</p>
                              <p className="font-mono font-bold text-slate-700 mt-0.5">{matchedReport.id}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">Horas Invertidas</p>
                              <p className="font-bold text-slate-700 mt-0.5">{matchedReport.hoursSpent} hrs</p>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Hallazgos Técnicos</p>
                            <p className="text-2xs text-slate-700 leading-normal font-medium">{matchedReport.technicalFindings}</p>
                          </div>

                          <div className="space-y-1">
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Acciones Realizadas</p>
                            <p className="text-2xs text-slate-700 leading-normal font-medium">{matchedReport.actionsTaken}</p>
                          </div>

                          {matchedReport.materialsUsed.length > 0 && (
                            <div className="space-y-1.5">
                              <p className="text-[9px] font-bold text-slate-400 uppercase">Materiales / Repuestos Utilizados</p>
                              <div className="flex flex-wrap gap-1">
                                {matchedReport.materialsUsed.map((m, idx) => (
                                  <span key={idx} className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                    {m.item} ({m.qty})
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-3 border-t border-indigo-100/40 pt-3 text-[10.5px] items-center">
                            <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">Firma del Técnico</p>
                              <p className="font-serif italic font-extrabold text-indigo-850 mt-0.5">{matchedReport.technicianSignature}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">Firma del Cliente</p>
                              <p className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-150 w-fit mt-0.5">
                                ✍️ {matchedReport.clientSignatureName}
                              </p>
                            </div>
                            <div className="col-span-2 mt-2 pt-2 border-t border-dashed border-indigo-100/30">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedRETE04WOId(infoWO.id);
                                  setIsViewingRETE04(true);
                                }}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-2 rounded-lg text-[10px] cursor-pointer flex items-center justify-center gap-1 uppercase tracking-wider transition-colors shadow-2xs"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Ver Ficha Oficial RE-TE-04 / Imprimir PDF</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-3">
                          <div>
                            <AlertCircle className="w-5 h-5 text-slate-500 mx-auto mb-1.5" />
                            <p className="text-2xs font-extrabold text-slate-800">Sin Reporte de Campo Sincronizado</p>
                            <p className="text-[10px] text-slate-600 mt-0.5">
                              Esta orden está pendiente de ejecución en campo por el ingeniero asignado. Como administrador, puede registrar la entrega o marcarla como realizada directamente:
                            </p>
                          </div>
                          {infoWO.status !== 'Reportado' && infoWO.status !== 'Conciliado' && (
                            <div className="flex justify-center gap-2 pt-1">
                              {infoWO.status !== 'Realizado' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onUpdateWorkOrderStatus(infoWO.id, 'Realizado');
                                    setInfoWO({ ...infoWO, status: 'Realizado' });
                                  }}
                                  className="bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-lg cursor-pointer transition-colors flex items-center gap-1 shadow-xs"
                                  title="Marcar orden como Realizada en campo"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Marcar Realizado</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  const reportId = `REP-${infoWO.id}-${Math.floor(Math.random()*1000)}`;
                                  const newReport: TechnicalReport = {
                                    id: reportId,
                                    workOrderId: infoWO.id,
                                    executionDate: infoWO.plannedDate,
                                    hoursSpent: 3.5,
                                    technicalFindings: 'Mantenimiento ejecutado. Documentación y reporte entregado en físico por administración.',
                                    actionsTaken: 'Reporte técnico registrado directamente por la administración (Entrega de documento).',
                                    materialsUsed: [],
                                    nextRecommendations: 'Siguiente monitoreo rutinario recomendado según programación.',
                                    technicianSignature: eng?.name || 'Administrador',
                                    clientSignatureName: client?.contactName || 'Firma Cliente',
                                    validationState: 'aprobado',
                                    validationNotes: 'Entrega de reporte registrada directamente por el administrador.',
                                    validatedAt: infoWO.plannedDate
                                  };
                                  onSubmitTechnicalReport(newReport);
                                  onUpdateWorkOrderStatus(infoWO.id, 'Reportado');
                                  setInfoWO({ ...infoWO, status: 'Reportado' });
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-lg cursor-pointer transition-colors flex items-center gap-1 shadow-xs"
                                title="Registrar la entrega de reporte y marcar como Reportado"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Reportar Entrega</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer buttons */}
                    <div className="mt-6 border-t border-slate-100 pt-4 flex justify-end gap-3">
                      {isConfirmingDelete ? (
                        <div className="flex items-center gap-1.5 border border-rose-250 bg-rose-50/70 p-1 rounded-lg mr-auto">
                          <span className="text-3xs font-extrabold text-rose-800 px-1">¿Eliminar orden?</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (onDeleteWorkOrders && infoWO) {
                                onDeleteWorkOrders([infoWO.id]);
                                handleCloseInfoModal();
                              }
                            }}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-black text-3xs px-2.5 py-1 rounded-md cursor-pointer transition-colors"
                          >
                            Sí, Eliminar 🗑️
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsConfirmingDelete(false)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-3xs px-2.5 py-1 rounded-md cursor-pointer transition-colors"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsConfirmingDelete(true)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-650 font-extrabold text-2xs px-3.5 py-2 rounded-lg border border-rose-200 cursor-pointer transition-colors flex items-center gap-1.5 shadow-2xs mr-auto"
                          title="Eliminar esta orden de trabajo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditedWO({ ...infoWO });
                          setIsEditingWOState(true);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-2xs px-4 py-2 rounded-lg cursor-pointer transition-colors"
                      >
                        Editar Datos
                      </button>
                      <button
                        onClick={handleCloseInfoModal}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-2xs px-4 py-2 rounded-lg cursor-pointer transition-colors"
                      >
                        Cerrar Detalles
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Engineers List & Management Modal */}
      {isEngsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 no-print" id="engineers-list-modal">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in duration-200 relative">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">Gestión de Ingenieros y Técnicos</h3>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Administra los técnicos activos, estados de disponibilidad y elimina duplicados.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEngsModalOpen(false);
                  setIsAddingNewEng(false);
                }}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-650 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search and Quick Filters */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 bg-white">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Buscar técnico por nombre o especialidad..."
                  value={engSearchQuery}
                  onChange={(e) => setEngSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 pl-8 text-xs font-semibold text-slate-755 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <span className="absolute left-3 top-2.5 text-slate-400 text-3xs">🔍</span>
              </div>
              
              {/* Quick Add Form button */}
              <button
                onClick={() => setIsAddingNewEng(!isAddingNewEng)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar Técnico</span>
              </button>
            </div>

            {/* Add New Engineer Inline Panel */}
            {isAddingNewEng && (
              <div className="bg-slate-50 p-4 border-b border-slate-100 space-y-3">
                <h4 className="text-2xs font-extrabold text-slate-700 uppercase tracking-wider">Nuevo Registro de Técnico</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      placeholder="Ej. Ing. Juan Pérez"
                      value={newEngName}
                      onChange={(e) => setNewEngName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1 text-xs font-semibold outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Especialidad</label>
                    <select
                      value={newEngSpecialty}
                      onChange={(e) => setNewEngSpecialty(e.target.value as Specialty)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1 text-xs font-semibold outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="Ingeniería">Ingeniería</option>
                      <option value="Aplicaciones">Aplicaciones</option>
                      <option value="Ventas">Ventas</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => setIsAddingNewEng(false)}
                    className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateNewEngineer}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Guardar Registro
                  </button>
                </div>
              </div>
            )}

            {/* Engineer List Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-slate-50/50">
              {filteredEngineersForList.length === 0 ? (
                <div className="text-center py-8 text-slate-400 font-semibold text-xs">
                  No se encontraron técnicos registrados.
                </div>
              ) : (
                filteredEngineersForList.map(eng => {
                  const isMaster = eng.id.startsWith('ENG-0');
                  const engActiveOrders = workOrders.filter(wo => {
                    const dateObj = new Date(wo.plannedDate + 'T00:00:00');
                    const isMonthMatch = dateObj.getMonth() + 1 === calendarMonth && dateObj.getFullYear() === calendarYear;
                    return isMonthMatch && (wo.engineerId === eng.id || wo.supportEngineerId === eng.id);
                  }).length;

                  if (editingEngId === eng.id) {
                    return (
                      <div key={eng.id} className="bg-slate-50 border border-indigo-150 rounded-lg p-4 flex flex-col gap-3 shadow-xs animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                          <span className="font-extrabold text-[10px] text-indigo-950 uppercase tracking-wider">✏️ Editar Detalles del Técnico</span>
                          <span className="bg-indigo-100 text-indigo-800 text-[8px] font-extrabold px-1.5 py-0.5 rounded border border-indigo-150 font-mono">
                            {eng.id}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* Nombre */}
                          <div className="space-y-1">
                            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Nombre Completo</label>
                            <input 
                              type="text"
                              value={editEngName}
                              onChange={e => setEditEngName(e.target.value)}
                              className="w-full text-3xs p-2 rounded-lg border border-slate-200 bg-white font-semibold"
                            />
                          </div>

                          {/* Especialidad */}
                          <div className="space-y-1">
                            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Especialidad</label>
                            <select
                              value={editEngSpecialty}
                              onChange={e => setEditEngSpecialty(e.target.value as Specialty)}
                              className="w-full text-3xs p-2 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 outline-hidden"
                            >
                              <option value="Ingeniería">Ingeniería</option>
                              <option value="Aplicaciones">Aplicaciones</option>
                              <option value="Ventas">Ventas</option>
                              <option value="Aire Acondicionado / HVAC">Aire Acondicionado / HVAC</option>
                              <option value="Electricidad Potencia">Electricidad Potencia</option>
                              <option value="Redes y Telecomunicaciones">Redes y Telecomunicaciones</option>
                              <option value="Sistemas Hidráulicos">Sistemas Hidráulicos</option>
                              <option value="Equipos de Elevación">Equipos de Elevación</option>
                              <option value="Seguridad y Control de Acceso">Seguridad y Control de Acceso</option>
                            </select>
                          </div>

                          {/* Correo */}
                          <div className="space-y-1">
                            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Correo Electrónico</label>
                            <input 
                              type="email"
                              value={editEngEmail}
                              onChange={e => setEditEngEmail(e.target.value)}
                              className="w-full text-3xs p-2 rounded-lg border border-slate-200 bg-white font-semibold"
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 mt-1.5 pt-2 border-t border-slate-200/60">
                          {/* Password Reset Action */}
                          <button
                            onClick={() => {
                              if (onSendPasswordReset) {
                                onSendPasswordReset(eng.email);
                              } else {
                                alert("Acción no disponible.");
                              }
                            }}
                            type="button"
                            className="text-[9px] font-bold text-indigo-650 hover:text-indigo-850 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            🔑 Enviar correo para restablecer contraseña
                          </button>

                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingEngId(null)}
                              className="px-3 py-1.5 text-3xs font-bold text-slate-500 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => {
                                if (onUpdateEngineer) {
                                  onUpdateEngineer({
                                    ...eng,
                                    name: editEngName,
                                    specialty: editEngSpecialty,
                                    email: editEngEmail
                                  });
                                }
                                setEditingEngId(null);
                              }}
                              style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}
                              className="hover:bg-[#4338ca] text-white font-extrabold text-[11px] px-4 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm border border-transparent"
                            >
                              Aceptar
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={eng.id} className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs hover:border-slate-300 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{getEngineerEmoji(eng.id)}</div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-xs text-slate-800">{eng.name}</span>
                            {isMaster && (
                              <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[8px] font-extrabold px-1 py-0.2 rounded uppercase">
                                Base
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wide text-left">
                            {eng.specialty}
                          </div>
                          <div className="text-[10px] text-indigo-650 font-extrabold mt-0.5">
                            📅 {engActiveOrders} asignaciones este mes
                          </div>
                          {eng.email && (
                            <div className="text-[8px] text-slate-400 font-semibold font-mono mt-0.5 text-left">
                              ✉️ {eng.email}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
                        {/* Availability Dropdown */}
                        <div>
                          <select
                            value={eng.availability}
                            onChange={(e) => handleUpdateEngAvailability(eng, e.target.value as any)}
                            className={`text-2xs font-bold px-2 py-1 rounded border outline-hidden cursor-pointer ${
                              eng.availability === 'En Campo'
                                ? 'bg-sky-50 text-sky-850 border-sky-200 font-black'
                                : eng.availability === 'Disponible'
                                ? 'bg-emerald-50 text-emerald-805 border-emerald-250'
                                : 'bg-slate-50 text-slate-500 border-slate-200'
                            }`}
                          >
                            <option value="Disponible">🟢 Disponible</option>
                            <option value="En Campo">🔵 En Campo</option>
                            <option value="Inactivo">Inactivo</option>
                          </select>
                        </div>

                        {/* Edit Button */}
                        <button
                          onClick={() => {
                            setEditingEngId(eng.id);
                            setEditEngName(eng.name);
                            setEditEngEmail(eng.email || '');
                            setEditEngSpecialty(eng.specialty || 'Ingeniería');
                          }}
                          title="Editar detalles de este técnico"
                          className="p-1.5 rounded-lg border bg-white border-slate-200 text-slate-400 hover:text-indigo-650 hover:border-indigo-200 hover:bg-indigo-50 transition-colors cursor-pointer text-xs"
                        >
                          ✏️
                        </button>

                        {/* Merge / Fusion Button */}
                        <button
                          onClick={() => {
                            setEngToMerge(eng);
                            setMergeTargetId('');
                          }}
                          title={isMaster ? "Los ingenieros base del sistema no pueden ser fusionados como origen" : "Fusionar y reasignar agendas a otro técnico"}
                          disabled={isMaster}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer text-xs ${
                            isMaster
                              ? 'bg-slate-50 border-slate-100 text-slate-350 cursor-not-allowed opacity-50'
                              : 'bg-white border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50'
                          }`}
                        >
                          🔗
                        </button>

                        {/* Delete Button (Only allow delete if not a master engineer to protect default system data) */}
                        <button
                          onClick={() => handleDeleteEngClick(eng)}
                          title={isMaster ? "Los ingenieros base del sistema no pueden ser eliminados" : "Eliminar técnico duplicado"}
                          disabled={isMaster}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer text-xs ${
                            isMaster
                              ? 'bg-slate-50 border-slate-100 text-slate-350 cursor-not-allowed opacity-50'
                              : 'bg-white border-slate-200 text-slate-400 hover:text-red-655 hover:border-red-200 hover:bg-red-50'
                          }`}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Delete Confirmation Overlay inside modal */}
            {engToDelete && (
              <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-3xs flex items-center justify-center p-6 z-30">
                <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-sm w-full p-4 space-y-4 animate-in zoom-in-95 duration-150">
                  <h4 className="font-extrabold text-xs text-red-700 uppercase tracking-wider flex items-center gap-1.5">
                    ⚠ Confirmar Eliminación
                  </h4>
                  <p className="text-3xs text-slate-650 font-semibold leading-normal">
                    ¿Estás seguro de que deseas eliminar a **{engToDelete.name}**?
                    <br />
                    <span className="text-red-500 font-bold">Esta acción no se puede deshacer.</span> Si tiene mantenimientos asignados, aparecerán con un técnico no asignado.
                  </p>
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setEngToDelete(null)}
                      className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmDeleteEng}
                      className="bg-red-600 hover:bg-red-750 text-white font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer shadow-xs"
                    >
                      Eliminar Registro
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Merge / Fusion Confirmation Overlay inside modal */}
            {engToMerge && (
              <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-3xs flex items-center justify-center p-6 z-30">
                <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-sm w-full p-4 space-y-4 animate-in zoom-in-95 duration-150">
                  <h4 className="font-extrabold text-xs text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                    🔗 Fusionar Técnicos Duplicados
                  </h4>
                  <p className="text-[10px] text-slate-650 font-semibold leading-normal">
                    Vas a fusionar al técnico <span className="font-bold text-slate-900">{engToMerge.name}</span>.
                    <br />
                    Todas sus agendas se reasignarán al técnico destino seleccionado y este registro duplicado será eliminado.
                  </p>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Selecciona el técnico destino (Correcto):</label>
                    <select
                      value={mergeTargetId}
                      onChange={(e) => setMergeTargetId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    >
                      <option value="">Seleccionar técnico...</option>
                      {engineers
                        .filter(e => e.id !== engToMerge.id)
                        .map(e => (
                          <option key={e.id} value={e.id}>
                            {getEngineerEmoji(e.id)} {e.name} ({e.specialty})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 font-sans">
                    <button
                      onClick={() => {
                        setEngToMerge(null);
                        setMergeTargetId('');
                      }}
                      className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirmMerge}
                      disabled={!mergeTargetId}
                      className={`font-bold text-xs px-3 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer ${
                        mergeTargetId
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                      }`}
                    >
                      Confirmar Fusión
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reset Month Schedule Modal (2-Step Confirmation) */}
      {isResetModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 no-print" id="reset-month-modal">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150 relative">
            <div className="flex items-center gap-2 text-red-750">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h3 className="font-extrabold text-xs uppercase tracking-wider">¿Reiniciar agenda del mes?</h3>
            </div>
            
            <p className="text-[10px] text-slate-650 font-semibold leading-normal">
              Estás a punto de eliminar permanentemente **{currentMonthWOs.length}** agendas del mes de <span className="font-bold text-slate-800">{calendarMonthName} de {calendarYear}</span> en Firestore.
              <br />
              <span className="text-red-500 font-extrabold">Esta acción no se puede deshacer.</span>
            </p>

            <div className="space-y-2">
              <label className="block text-[9px] font-bold text-slate-500 uppercase leading-tight">
                Para confirmar, escribe <span className="font-mono font-black text-red-700 select-all">REINICIAR {calendarMonthName.toUpperCase()}</span> abajo:
              </label>
              <input
                type="text"
                value={resetConfirmText}
                onChange={(e) => setResetConfirmText(e.target.value)}
                placeholder={`REINICIAR ${calendarMonthName.toUpperCase()}`}
                className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 outline-hidden focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all uppercase"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 font-sans">
              <button
                onClick={() => {
                  setIsResetModalOpen(false);
                  setResetConfirmText('');
                }}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmResetMonth}
                disabled={resetConfirmText.toUpperCase() !== `REINICIAR ${calendarMonthName.toUpperCase()}`}
                className={`font-bold text-xs px-3 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer ${
                  resetConfirmText.toUpperCase() === `REINICIAR ${calendarMonthName.toUpperCase()}`
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                }`}
              >
                Eliminar Todo (2/2)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Month Modal (2-Step Confirmation) */}
      {isReportMonthModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 no-print" id="report-month-modal">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150 relative">
            <div className="flex items-center gap-2 text-emerald-750">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-extrabold text-xs uppercase tracking-wider">¿Reportar todo el mes?</h3>
            </div>
            
            <p className="text-[10px] text-slate-650 font-semibold leading-normal">
              Estás a punto de marcar como ejecutados y reportados **{currentMonthWOs.filter(wo => wo.status !== 'Reportado' && wo.status !== 'Conciliado').length}** trabajos del mes de <span className="font-bold text-slate-800">{calendarMonthName} de {calendarYear}</span> en Firestore.
              <br />
              Se generará un reporte de campo automático para cada una de las órdenes pendientes.
            </p>

            <div className="space-y-2">
              <label className="block text-[9px] font-bold text-slate-500 uppercase leading-tight">
                Para confirmar, escribe <span className="font-mono font-black text-emerald-700 select-all">REPORTAR {calendarMonthName.toUpperCase()}</span> abajo:
              </label>
              <input
                type="text"
                value={reportMonthConfirmText}
                onChange={(e) => setReportMonthConfirmText(e.target.value)}
                placeholder={`REPORTAR ${calendarMonthName.toUpperCase()}`}
                className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 outline-hidden focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all uppercase"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 font-sans">
              <button
                onClick={() => {
                  setIsReportMonthModalOpen(false);
                  setReportMonthConfirmText('');
                }}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmReportMonth}
                disabled={reportMonthConfirmText.toUpperCase() !== `REPORTAR ${calendarMonthName.toUpperCase()}`}
                className={`font-bold text-xs px-3 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer ${
                  reportMonthConfirmText.toUpperCase() === `REPORTAR ${calendarMonthName.toUpperCase()}`
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                }`}
              >
                Confirmar (2/2)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Visor de Reporte Técnico Oficial RE-TE-04 */}
      {isViewingRETE04 && selectedRETE04WOId && (() => {
        const task = workOrders.find(w => w.id === selectedRETE04WOId);
        const report = reports.find(r => r.workOrderId === selectedRETE04WOId);
        if (!task || !report) return null;
        return renderRETE04Report(report, task);
      })()}

      {/* Modal Creación / Edición de Cliente */}
      {isClientModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 no-print" id="client-form-modal">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-5 space-y-4 animate-in zoom-in-95 duration-150 relative font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-5 h-5 text-indigo-650" />
                <span>{editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsClientModalOpen(false);
                  setEditingClient(null);
                }}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-650 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">RUC / Cédula</label>
                <input
                  type="text"
                  required
                  disabled={!!editingClient}
                  value={clientFormId}
                  onChange={(e) => setClientFormId(e.target.value)}
                  placeholder="Ej. 1792040001001"
                  className="w-full bg-slate-50 disabled:bg-slate-100/80 border border-slate-250 rounded-lg px-3 py-2 text-xs font-semibold text-slate-705 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Nombre o Razón Social</label>
                <input
                  type="text"
                  required
                  value={clientFormName}
                  onChange={(e) => setClientFormName(e.target.value)}
                  placeholder="Ej. Hospital Metropolitano"
                  className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 text-xs font-semibold text-slate-705 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Dirección</label>
                <input
                  type="text"
                  required
                  value={clientFormAddress}
                  onChange={(e) => setClientFormAddress(e.target.value)}
                  placeholder="Ej. Av. Mariana de Jesús s/n"
                  className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 text-xs font-semibold text-slate-705 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Ciudad / Sucursal</label>
                <input
                  type="text"
                  value={clientFormCity}
                  onChange={(e) => setClientFormCity(e.target.value)}
                  placeholder="Ej. Quito / Matriz"
                  className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 text-xs font-semibold text-slate-705 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Contacto Principal</label>
                  <input
                    type="text"
                    value={clientFormContact}
                    onChange={(e) => setClientFormContact(e.target.value)}
                    placeholder="Ej. Dra. María Elena"
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 text-xs font-semibold text-slate-705 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Teléfono</label>
                  <input
                    type="text"
                    value={clientFormPhone}
                    onChange={(e) => setClientFormPhone(e.target.value)}
                    placeholder="Ej. 099123456"
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 text-xs font-semibold text-slate-705 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 font-sans">
                <button
                  type="button"
                  onClick={() => {
                    setIsClientModalOpen(false);
                    setEditingClient(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-xs"
                >
                  {editingClient ? 'Guardar Cambios' : 'Crear Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Creación / Edición de Equipo */}
      {isEquipModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 no-print" id="equipment-form-modal">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-5 space-y-4 animate-in zoom-in-95 duration-150 relative font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-5 h-5 text-emerald-655" />
                <span>{editingEquip ? 'Editar Equipo Biomédico' : 'Nuevo Equipo Biomédico'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsEquipModalOpen(false);
                  setEditingEquip(null);
                }}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEquipment} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Código / ID Único</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingEquip}
                    value={equipFormId}
                    onChange={(e) => setEquipFormId(e.target.value)}
                    placeholder="Ej. EQ-1002"
                    className="w-full bg-slate-50 disabled:bg-slate-100/80 border border-slate-250 rounded-lg px-3 py-2 text-xs font-semibold text-slate-705 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Cliente Propietario</label>
                  <select
                    required
                    value={equipFormClientId}
                    onChange={(e) => setEquipFormClientId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 text-xs font-semibold text-slate-705 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                  >
                    <option value="">Seleccione cliente...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Nombre / Descripción del Activo</label>
                <input
                  type="text"
                  required
                  value={equipFormName}
                  onChange={(e) => setEquipFormName(e.target.value)}
                  placeholder="Ej. Ecógrafo Voluson E10"
                  className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 text-xs font-semibold text-slate-705 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Marca</label>
                  <input
                    type="text"
                    required
                    value={equipFormBrand}
                    onChange={(e) => setEquipFormBrand(e.target.value)}
                    placeholder="Ej. GENERAL ELECTRIC"
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 text-xs font-semibold text-slate-705 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Modelo</label>
                  <input
                    type="text"
                    required
                    value={equipFormModel}
                    onChange={(e) => setEquipFormModel(e.target.value)}
                    placeholder="Ej. Voluson E10"
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 text-xs font-semibold text-slate-705 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Número de Serie</label>
                  <input
                    type="text"
                    required
                    value={equipFormSerial}
                    onChange={(e) => setEquipFormSerial(e.target.value)}
                    placeholder="Ej. SN89283712"
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 text-xs font-semibold text-slate-705 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Versión Software</label>
                  <input
                    type="text"
                    value={equipFormSW}
                    onChange={(e) => setEquipFormSW(e.target.value)}
                    placeholder="Ej. v6.2.1 (Opcional)"
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 text-xs font-semibold text-slate-705 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Área / Sucursal Interna</label>
                  <input
                    type="text"
                    value={equipFormSucursal}
                    onChange={(e) => setEquipFormSucursal(e.target.value)}
                    placeholder="Ej. Ginecología - Piso 3"
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 text-xs font-semibold text-slate-705 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Estado Operativo</label>
                  <select
                    value={equipFormStatus}
                    onChange={(e) => setEquipFormStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 text-xs font-semibold text-slate-705 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer font-bold"
                  >
                    <option value="Operativo">🟢 Operativo</option>
                    <option value="No Operativo">🔴 No Operativo</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 font-sans">
                <button
                  type="button"
                  onClick={() => {
                    setIsEquipModalOpen(false);
                    setEditingEquip(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-xs"
                >
                  {editingEquip ? 'Guardar Cambios' : 'Crear Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Creación / Edición de Contrato */}
      {isContractModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 no-print" id="contract-form-modal">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-5 space-y-4 animate-in zoom-in-95 duration-150 relative font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-5 h-5 text-indigo-655" />
                <span>{editingContract ? 'Editar Contrato / Garantía' : 'Nuevo Contrato / Garantía'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsContractModalOpen(false);
                  setEditingContract(null);
                }}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-650 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContract} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Código / Nº Contrato</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingContract}
                    value={contractFormId}
                    onChange={(e) => setContractFormId(e.target.value)}
                    placeholder="Ej. CONTRATO-2026-004"
                    className="w-full bg-slate-50 disabled:bg-slate-100/80 border border-slate-250 rounded-lg px-3 py-2 text-xs font-semibold text-slate-705 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Cliente Cobertura</label>
                  <select
                    required
                    value={contractFormClientId}
                    onChange={(e) => setContractFormClientId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 text-xs font-semibold text-slate-705 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                  >
                    <option value="">Seleccione cliente...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Tipo de Cobertura</label>
                  <select
                    value={contractFormType}
                    onChange={(e) => setContractFormType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 text-xs font-semibold text-slate-705 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer font-bold"
                  >
                    <option value="Garantía extendida/Contrato">Garantía extendida / Contrato</option>
                    <option value="Garantía de compra">Garantía de compra</option>
                    <option value="Facturable">Facturable</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Estado Contrato</label>
                  <select
                    value={contractFormStatus}
                    onChange={(e) => setContractFormStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 text-xs font-semibold text-slate-705 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer font-bold"
                  >
                    <option value="Activo">🟢 Activo</option>
                    <option value="Pendiente">🟡 Pendiente</option>
                    <option value="Vencido">🔴 Vencido</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Fecha Inicio</label>
                  <input
                    type="date"
                    required
                    value={contractFormStart}
                    onChange={(e) => setContractFormStart(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 text-xs font-semibold text-slate-705 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Fecha Vencimiento</label>
                  <input
                    type="date"
                    required
                    value={contractFormEnd}
                    onChange={(e) => setContractFormEnd(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 text-xs font-semibold text-slate-705 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Especificaciones y Coberturas</label>
                <textarea
                  value={contractFormCoverage}
                  onChange={(e) => setContractFormCoverage(e.target.value)}
                  rows={3}
                  placeholder="Detalles sobre límites de mantenimiento, descuentos en repuestos..."
                  className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 text-xs font-semibold text-slate-705 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 font-sans">
                <button
                  type="button"
                  onClick={() => {
                    setIsContractModalOpen(false);
                    setEditingContract(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-xs"
                >
                  {editingContract ? 'Guardar Cambios' : 'Crear Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
