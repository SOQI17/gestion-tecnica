import React, { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ClipboardList, CheckCircle2, RotateCcw, UserCheck, AlertCircle, Plus, FileText, Check, X, ShieldAlert, Filter, Send, CircleAlert, Database, Printer, FileSpreadsheet, BarChart3, TrendingUp, PieChart, Percent, Award, CalendarRange, Trash2, Search, Users, Cpu, Briefcase, Palmtree, AlertTriangle, BookOpen, ExternalLink, Sparkles, Download, Upload, Tag, UserPlus, Mail, Lock, Shield, Phone, MapPin, KeyRound, Pencil, Clock, DollarSign, Eye } from 'lucide-react';

export const OFFICIAL_MODALITIES = [
  { code: 'MR', label: 'MR: Resonancia Magnética' },
  { code: 'MG', label: 'MG: Mamografía' },
  { code: 'CT', label: 'CT: Tomografía' },
  { code: 'BMD', label: 'BMD: Densitometría' },
  { code: 'Surgery', label: 'Surgery: Arcos en C' },
  { code: 'RX', label: 'RX: Rayos X (todo tipo)' },
  { code: 'PETCT', label: 'PETCT: PETCT' },
  { code: 'Cyclotron', label: 'Cyclotron: Cyclotron' },
  { code: 'MS', label: 'MS: Módulos de síntesis (Fastlab Tracerlab)' },
  { code: 'IGM', label: 'IGM: Angiografía' },
  { code: 'NM', label: 'NM: Medicina Nuclear (gammacámara)' },
  { code: 'AW', label: 'AW: Estaciones' },
  { code: 'IMP', label: 'IMP: Impresoras' },
  { code: 'DIG', label: 'DIG: Digitalizadores' },
  { code: 'US', label: 'US: Ultrasonido / Ecografía' },
  { code: 'Aplicaciones', label: 'Aplicaciones Clínicas' },
  { code: 'IT', label: 'IT: Tecnologías de la Información' }
];

const EQUIPMENT_MODALITIES = [
  'MR',
  'MG',
  'CT',
  'BMD',
  'Surgery',
  'RX',
  'PETCT',
  'Cyclotron',
  'MS',
  'IGM',
  'NM',
  'AW',
  'IMP',
  'DIG',
  'US',
  'Otros'
];
import { WorkOrder, Engineer, Client, TechnicalReport, MaintenanceType, WorkOrderStatus, Specialty, Equipment, Contract, ContractEquipmentItem, Vacation, ECUADOR_HOLIDAYS, EngineerPermission, MaintenanceRegistry, ScheduledTraining, ContractGE, UserPermissions, RoleTemplates, AppUser } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import CapacitacionesPortal from './CapacitacionesPortal';
import { ProyeccionTab } from './admin/ProyeccionTab';
import { ClientesTab } from './admin/ClientesTab';
import { RETE04ReportModal } from './admin/RETE04ReportModal';
import { RegistroTab } from './admin/RegistroTab';
import { EquiposTab } from './admin/EquiposTab';
import { ContratosTab } from './admin/ContratosTab';
import { CronogramaTab } from './admin/CronogramaTab';
import { VacacionesTab } from './admin/VacacionesTab';
import { uploadFileToCloudinary, getCleanCloudinaryUrl } from '../utils/cloudinary';

const cleanStr = (s: string) => (s || '')
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]/g, " ")
  .replace(/\s+/g, " ")
  .trim();

export const DEFAULT_GLOBAL_ROLE_TEMPLATES: RoleTemplates = {
  Ventas: {
    canViewWorkOrders: true,
    canCreateWorkOrders: true,
    canEditWorkOrders: true,
    canDeleteWorkOrders: false,
    canChangeWorkOrderStatus: false,

    canViewContracts: true,
    canCreateContracts: true,
    canEditContracts: true,
    canDeleteContracts: false,
    canViewContractValues: true,

    canViewReports: true,
    canCreateReports: false,
    canApproveReports: false,
    canExportReportsPdf: true,

    canViewClients: true,
    canEditClients: true,
    canViewEquipments: true,
    canEditEquipments: true,

    canViewRegistry: true,
    canEditRegistry: false,

    canViewVacations: false,
    canManageVacations: false,

    canViewTrainings: false,
    canManageTrainings: false,

    canManageUsers: false,
    canViewAuditLogs: false,
    canExportData: true
  },
  Ingeniería: {
    canViewWorkOrders: true,
    canCreateWorkOrders: true,
    canEditWorkOrders: true,
    canDeleteWorkOrders: false,
    canChangeWorkOrderStatus: true,

    canViewContracts: true,
    canCreateContracts: true,
    canEditContracts: true,
    canDeleteContracts: false,
    canViewContractValues: false,

    canViewReports: true,
    canCreateReports: true,
    canApproveReports: true,
    canExportReportsPdf: true,

    canViewClients: true,
    canEditClients: true,
    canViewEquipments: true,
    canEditEquipments: true,

    canViewRegistry: true,
    canEditRegistry: true,

    canViewVacations: true,
    canManageVacations: true,

    canViewTrainings: true,
    canManageTrainings: true,

    canManageUsers: false,
    canViewAuditLogs: true,
    canExportData: true
  },
  Admin: {
    canViewWorkOrders: true,
    canCreateWorkOrders: true,
    canEditWorkOrders: true,
    canDeleteWorkOrders: true,
    canChangeWorkOrderStatus: true,

    canViewContracts: true,
    canCreateContracts: true,
    canEditContracts: true,
    canDeleteContracts: true,
    canViewContractValues: true,

    canViewReports: true,
    canCreateReports: true,
    canApproveReports: true,
    canExportReportsPdf: true,

    canViewClients: true,
    canEditClients: true,
    canViewEquipments: true,
    canEditEquipments: true,

    canViewRegistry: true,
    canEditRegistry: true,

    canViewVacations: true,
    canManageVacations: true,

    canViewTrainings: true,
    canManageTrainings: true,

    canManageUsers: true,
    canViewAuditLogs: true,
    canExportData: true
  }
};

export const getDefaultPermissionsForSpecialty = (specialty: Specialty | 'Admin', customTemplates?: RoleTemplates): UserPermissions => {
  const templates = customTemplates || DEFAULT_GLOBAL_ROLE_TEMPLATES;
  if (specialty === 'Ventas') {
    return templates.Ventas;
  } else if (specialty === 'Ingeniería' || specialty === 'Aplicaciones' || specialty === 'IT') {
    return templates.Ingeniería;
  }
  return templates.Admin;
};

interface AdminPortalProps {
  userRole?: 'admin' | 'engineer' | 'sales';
  currentUserEmail?: string;
  currentUserPermissions?: UserPermissions;
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
  onDeleteContract?: (contractId: string) => void;
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
  maintenanceRegistries?: MaintenanceRegistry[];
  onAddMaintenanceRegistry?: (reg: MaintenanceRegistry) => void;
  onDeleteMaintenanceRegistry?: (id: string) => void;
  onBulkUploadMaintenanceRegistries?: (registries: MaintenanceRegistry[]) => Promise<void>;
  onClearMaintenanceRegistries?: () => void;
  evaluations360?: EngineerEvaluation360[];
  onSaveEvaluation360?: (evalItem: EngineerEvaluation360) => void;
  scheduledTrainings?: ScheduledTraining[];
  onAddScheduledTraining?: (st: ScheduledTraining) => void;
  onUpdateScheduledTraining?: (st: ScheduledTraining) => void;
  onDeleteScheduledTraining?: (stId: string) => void;
  contractsGE?: ContractGE[];
  onAddContractGE?: (cGE: ContractGE) => void;
  onUpdateContractGE?: (cGE: ContractGE) => void;
  onDeleteContractGE?: (id: string) => void;
  onBulkUploadContractsGE?: (cGEs: ContractGE[]) => void;
  allRegisteredUsers?: AppUser[];
  onUpdateUserRole?: (uid: string, role: 'admin' | 'engineer' | 'sales', engineerId?: string) => void;
  onRegisterNewUser?: (data: {
    name: string;
    email: string;
    password?: string;
    role: 'admin' | 'engineer' | 'sales';
    specialty?: Specialty;
    sede?: string;
    phone?: string;
  }) => Promise<void> | void;
  onToggleClientConfirmed?: (woId: string, confirmed: boolean) => void;
}

const getEndDateStr = (startDateStr: string, duration: number): string => {
  if (!startDateStr || typeof startDateStr !== 'string') return '';
  try {
    const cleanStr = startDateStr.split('T')[0].trim();
    if (!cleanStr) return '';
    const date = new Date(cleanStr + 'T00:00:00');
    if (isNaN(date.getTime())) return '';
    date.setDate(date.getDate() + (Math.max(1, duration) - 1));
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch (e) {
    return startDateStr;
  }
};

const getDurationFromDates = (startDateStr: string, endDateStr: string): number => {
  if (!startDateStr || !endDateStr || typeof startDateStr !== 'string' || typeof endDateStr !== 'string') return 1;
  try {
    const start = new Date(startDateStr.split('T')[0] + 'T00:00:00');
    const end = new Date(endDateStr.split('T')[0] + 'T00:00:00');
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;
    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 0) return 1;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return isNaN(diffDays) ? 1 : diffDays;
  } catch (e) {
    return 1;
  }
};

const getVacationDuration = (startDateStr: string, endDateStr: string, includeWeekends: boolean = true): number => {
  if (!startDateStr || !endDateStr || typeof startDateStr !== 'string' || typeof endDateStr !== 'string') return 1;
  try {
    const start = new Date(startDateStr.split('T')[0] + 'T00:00:00');
    const end = new Date(endDateStr.split('T')[0] + 'T00:00:00');
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 1;
    if (includeWeekends) {
      const diffTime = end.getTime() - start.getTime();
      const res = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return isNaN(res) ? 1 : res;
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
  } catch (e) {
    return 1;
  }
};

const generateMaintenanceDates = (
  startDateStr: string, 
  endDateStr: string, 
  frequency: string, 
  contractType: string,
  preferredDay?: number,
  targetEquipment?: string,
  preferredMonth?: number
): string[] => {
  if (!startDateStr || !endDateStr || !frequency || frequency === 'Ninguno' || frequency === 'Personalizado') {
    return [];
  }
  const start = new Date(startDateStr + 'T00:00:00');
  const end = new Date(endDateStr + 'T00:00:00');
  if (start > end) return [];

  const dates: string[] = [];

  let incrementMonths = 1;
  if (frequency === 'Mensual') incrementMonths = 1;
  else if (frequency === 'Bimestral') incrementMonths = 2;
  else if (frequency === 'Trimestral') incrementMonths = 3;
  else if (frequency === 'Cuatrimestral') incrementMonths = 4;
  else if (frequency === 'Semestral') incrementMonths = 6;
  else if (frequency === 'Anual') incrementMonths = 12;

  const isPurchaseWarranty = contractType === 'Garantía de compra';

  const targetDay = (preferredDay && preferredDay >= 1 && preferredDay <= 31) 
    ? preferredDay 
    : start.getDate();

  let year = start.getFullYear();
  let month = start.getMonth();

  if (preferredMonth && preferredMonth >= 1 && preferredMonth <= 12) {
    month = preferredMonth - 1; // 0-indexed (e.g. Feb = 1)
    
    // Find the first year on or after start where candidate date >= start
    let daysInM = new Date(year, month + 1, 0).getDate();
    let cDay = Math.min(targetDay, daysInM);
    let candidate = new Date(year, month, cDay);

    while (candidate < start) {
      year++;
      daysInM = new Date(year, month + 1, 0).getDate();
      cDay = Math.min(targetDay, daysInM);
      candidate = new Date(year, month, cDay);
    }
  } else if (isPurchaseWarranty) {
    month += incrementMonths;
    if (month > 11) {
      year += Math.floor(month / 12);
      month = month % 12;
    }
  }

  let daysInMonth = new Date(year, month + 1, 0).getDate();
  let candidateDay = Math.min(targetDay, daysInMonth);
  let current = new Date(year, month, candidateDay);

  if (!preferredMonth && !isPurchaseWarranty && current < start) {
    month += incrementMonths;
    if (month > 11) {
      year += Math.floor(month / 12);
      month = month % 12;
    }
    daysInMonth = new Date(year, month + 1, 0).getDate();
    candidateDay = Math.min(targetDay, daysInMonth);
    current = new Date(year, month, candidateDay);
  }

  let safety = 0;
  while ((isPurchaseWarranty ? (current <= end) : (current <= end)) && safety < 120) {
    safety++;
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    const dateOnly = `${yyyy}-${mm}-${dd}`;
    const entry = (targetEquipment && targetEquipment !== 'all')
      ? `${dateOnly}|${targetEquipment}`
      : dateOnly;
    dates.push(entry);

    month += incrementMonths;
    if (month > 11) {
      year += Math.floor(month / 12);
      month = month % 12;
    }
    daysInMonth = new Date(year, month + 1, 0).getDate();
    candidateDay = Math.min(targetDay, daysInMonth);
    current = new Date(year, month, candidateDay);
  }
  return dates;
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

interface EditableNumberInputProps {
  value: number;
  onSave: (val: number) => void;
}

const EditableNumberInput = ({ value, onSave }: EditableNumberInputProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  if (isEditing) {
    return (
      <div className="flex items-center justify-center gap-1">
        <input
          type="number"
          min={0}
          max={365}
          value={tempValue}
          onChange={(e) => setTempValue(Math.max(0, parseInt(e.target.value) || 0))}
          className="w-12 p-0.5 border border-indigo-300 rounded text-center font-mono font-bold text-2xs focus:ring-1 focus:ring-indigo-500 bg-white"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSave(tempValue);
              setIsEditing(false);
            } else if (e.key === 'Escape') {
              setTempValue(value);
              setIsEditing(false);
            }
          }}
        />
        <button
          type="button"
          onClick={() => {
            onSave(tempValue);
            setIsEditing(false);
          }}
          className="p-0.5 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 border border-emerald-200 cursor-pointer"
        >
          ✓
        </button>
        <button
          type="button"
          onClick={() => {
            setTempValue(value);
            setIsEditing(false);
          }}
          className="p-0.5 bg-slate-50 text-slate-600 rounded hover:bg-slate-100 border border-slate-200 cursor-pointer"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-1 group">
      <span className="font-mono font-bold text-slate-800">{value}</span>
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 p-0.5 rounded hover:bg-slate-100 cursor-pointer transition-all"
        title="Editar valor"
      >
        ✏️
      </button>
    </div>
  );
};

const getYearsInCompanyNum = (entryDate?: string): number => {
  if (!entryDate) return 0;
  const entry = new Date(entryDate + 'T00:00:00');
  const now = new Date();
  const diffTime = now.getTime() - entry.getTime();
  if (diffTime < 0) return 0;
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
  return diffYears;
};

const formatHoursToDays = (hours: number): string => {
  const isNegative = hours < 0;
  const absHours = Math.abs(hours);
  const days = Math.floor(absHours / 8);
  const remainingHours = absHours % 8;
  const sign = isNegative ? '-' : '+';
  
  if (days === 0 && remainingHours === 0) return '0d';
  if (days > 0 && remainingHours > 0) {
    return `${sign}${days}d y ${remainingHours}h`;
  }
  if (days > 0) {
    return `${sign}${days} ${days === 1 ? 'día' : 'días'} lab.`;
  }
  return `${sign}${remainingHours}h`;
};

const isVacationTaken = (endDateStr?: string): boolean => {
  if (!endDateStr) return false;
  const todayStr = '2026-07-07';
  return endDateStr < todayStr;
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

const getEngineerFullNameNoTitle = (name?: string): string => {
  if (!name) return '';
  return name.replace(/^Ing\.\s*/i, '').trim();
};



const checkTimeOverlap = (timeStr1: string, timeStr2: string): boolean => {
  if (!timeStr1 || !timeStr2) return false;
  const clean1 = timeStr1.trim();
  const clean2 = timeStr2.trim();
  if (clean1 === clean2) return true;

  const timeToMinutes = (t24: string): number => {
    const [h, m] = t24.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };
  const range1 = parseTimeRange(clean1);
  const range2 = parseTimeRange(clean2);
  const start1 = timeToMinutes(range1.start);
  const end1 = timeToMinutes(range1.end);
  const start2 = timeToMinutes(range2.start);
  const end2 = timeToMinutes(range2.end);

  return start1 < end2 && start2 < end1;
};

const getContractExpirationAlert = (endDateStr: string, status?: string, linkedContractId?: string) => {
  if (linkedContractId && linkedContractId.trim() !== '') {
    return {
      level: 'renewed',
      days: 0,
      text: '🔄 Renovado (Sucesor Vinculado)',
      badgeText: 'RENOVADO',
      colorClass: 'bg-blue-50 text-blue-800 border-blue-200 font-extrabold'
    };
  }

  if (!endDateStr) return null;
  if (status === 'Vencido' || status === 'Cancelado') {
    return {
      level: 'expired',
      days: 0,
      text: '🔴 Vencido',
      badgeText: 'VENCIDO',
      colorClass: 'bg-red-100 text-red-800 border-red-200 font-bold'
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parts = endDateStr.split('-');
  if (parts.length < 3) return null;
  const endDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  endDate.setHours(0, 0, 0, 0);

  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      level: 'expired',
      days: Math.abs(diffDays),
      text: `🔴 Vencido hace ${Math.abs(diffDays)}d`,
      badgeText: `VENCIDO (${Math.abs(diffDays)}d)`,
      colorClass: 'bg-red-100 text-red-800 border-red-300 font-extrabold'
    };
  }

  if (diffDays <= 30) {
    // 🚨 1 Month Alert (<= 30 days)
    return {
      level: 'urgent_1m',
      days: diffDays,
      text: `🚨 Vence en ${diffDays} días (1 mes)`,
      badgeText: `🚨 1 MES (${diffDays}d)`,
      colorClass: 'bg-red-50 text-red-850 border-red-300 font-black animate-pulse'
    };
  }

  if (diffDays <= 90) {
    // ⚠️ 3 Months Alert (31 to 90 days)
    return {
      level: 'warning_3m',
      days: diffDays,
      text: `⚠️ Vence en ${diffDays} días (3 meses)`,
      badgeText: `⚠️ 3 MESES (${diffDays}d)`,
      colorClass: 'bg-amber-50 text-amber-900 border-amber-300 font-extrabold'
    };
  }

  return {
    level: 'ok',
    days: diffDays,
    text: `Vigente (${diffDays}d restantes)`,
    badgeText: 'VIGENTE',
    colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold'
  };
};

const isClientMatch = (woClientId: string | undefined, conClientId: string | undefined, clientsList: Client[] = []) => {
  if (!woClientId || !conClientId) return false;
  const c1 = woClientId.trim().toLowerCase();
  const c2 = conClientId.trim().toLowerCase();
  if (c1 === c2) return true;
  const client1 = clientsList.find(c => c.id === woClientId || c.name.trim().toLowerCase() === c1);
  const client2 = clientsList.find(c => c.id === conClientId || c.name.trim().toLowerCase() === c2);
  if (client1 && client2 && client1.id === client2.id) return true;
  if (client1 && (client1.name.trim().toLowerCase().includes(c2) || c2.includes(client1.name.trim().toLowerCase()))) return true;
  if (client2 && (client2.name.trim().toLowerCase().includes(c1) || c1.includes(client2.name.trim().toLowerCase()))) return true;
  return false;
};

const isWoMatchingContractDate = (wo: WorkOrder, con: Contract, rawContractDate: string, allContracts: Contract[] = []) => {
  if (!wo || !con || !rawContractDate) return false;
  const cleanTargetDate = rawContractDate.split('|')[0].trim();
  const eqNameInEntry = rawContractDate.split('|')[1]?.trim();

  // 1. Check client match: either wo.clientId equals con.clientId, OR wo.clientId equals client name, OR con.clientId equals client name
  const isSameClient = 
    wo.clientId === con.clientId ||
    (wo.clientId && con.clientId && wo.clientId.trim().toLowerCase() === con.clientId.trim().toLowerCase());

  if (!isSameClient) return false;

  // 2. Equipment validation:
  if (wo.equipmentName) {
    const wEq = wo.equipmentName.trim().toLowerCase();

    if (eqNameInEntry) {
      const eEq = eqNameInEntry.trim().toLowerCase();
      const matchesEntryEq = wEq.includes(eEq) || eEq.includes(wEq);
      if (!matchesEntryEq) return false;
    } else if (con.equipmentItems && con.equipmentItems.length > 0) {
      const matchesAnyContractEq = con.equipmentItems.some(item => {
        if (!item.name) return false;
        const cEq = item.name.trim().toLowerCase();
        return wEq.includes(cEq) || cEq.includes(wEq);
      });
      if (!matchesAnyContractEq) return false;
    } else if (allContracts.length > 0) {
      // If con has NO equipmentItems specified, check if wo.equipmentName explicitly belongs to ANOTHER contract of the same client
      const otherContractsOfClient = allContracts.filter(c => 
        c.id !== con.id && 
        (c.clientId === con.clientId || (c.clientId && con.clientId && c.clientId.trim().toLowerCase() === con.clientId.trim().toLowerCase()))
      );
      const belongsToAnotherContract = otherContractsOfClient.some(otherCon => {
        return otherCon.equipmentItems && otherCon.equipmentItems.some(item => {
          if (!item.name) return false;
          const cEq = item.name.trim().toLowerCase();
          return wEq.includes(cEq) || cEq.includes(wEq);
        });
      });
      if (belongsToAnotherContract) return false;
    }
  }

  // 2.5 Explicit contract ID or Notes match check
  const isExplicitlyForContract = (wo.id && wo.id.includes(con.id)) || (wo.notes && wo.notes.includes(con.id));

  // 3. Exact plannedDate match
  if (wo.plannedDate === cleanTargetDate || (wo.plannedDate && wo.plannedDate.startsWith(cleanTargetDate))) {
    return true;
  }

  // 4. Tight Fuzzy plannedDate match (+/- 14 days max, and must be closest target date for the SAME equipment)
  if (wo.plannedDate) {
    const cleanWoDate = wo.plannedDate.split('T')[0].trim();
    const woParts = cleanWoDate.split('-');
    const conParts = cleanTargetDate.split('-');
    if (woParts.length === 3 && conParts.length === 3) {
      const woTime = new Date(Number(woParts[0]), Number(woParts[1]) - 1, Number(woParts[2])).getTime();
      const conTime = new Date(Number(conParts[0]), Number(conParts[1]) - 1, Number(conParts[2])).getTime();
      if (!isNaN(woTime) && !isNaN(conTime)) {
        const diffDays = Math.abs(woTime - conTime) / 86400000;
        const maxAllowedDiff = isExplicitlyForContract ? 30 : 14;
        if (diffDays <= maxAllowedDiff) {
          // Verify cleanTargetDate is the CLOSEST date in con.maintenanceDates for this specific equipment
          if (con.maintenanceDates && con.maintenanceDates.length > 1) {
            const wEqClean = wo.equipmentName ? wo.equipmentName.trim().toLowerCase() : '';
            const isClosest = con.maintenanceDates.every(otherRaw => {
              const [otherClean, otherEq] = otherRaw.split('|');
              const targetEqStr = eqNameInEntry || wEqClean;
              const otherEqStr = otherEq ? otherEq.trim().toLowerCase() : '';

              // If both entries specify an equipment, do not compare dates across DIFFERENT equipment!
              if (targetEqStr && otherEqStr) {
                const tEq = targetEqStr.trim().toLowerCase();
                if (!tEq.includes(otherEqStr) && !otherEqStr.includes(tEq)) {
                  return true; // Skip entries for other equipment!
                }
              }

              const oParts = otherClean.trim().split('-');
              if (oParts.length !== 3) return true;
              const oTime = new Date(Number(oParts[0]), Number(oParts[1]) - 1, Number(oParts[2])).getTime();
              if (isNaN(oTime)) return true;
              const oDiff = Math.abs(woTime - oTime) / 86400000;
              return diffDays <= oDiff;
            });
            if (!isClosest) return false;
          }
          return true;
        }
      }
    }
  }

  return false;
};

const isWorkOrderQc = (wo: WorkOrder, contractsList: Contract[] = []) => {
  if (!wo) return false;
  
  // 1. Explicit QC phrase in notes only (not just "qc" substring to avoid false positives)
  const notesClean = (wo.notes || '').toLowerCase();
  if (
    notesClean.includes('control de calidad') || 
    notesClean.includes('control calidad') || 
    notesClean.includes('visita de control') || 
    notesClean.includes('visita qc') ||
    notesClean.includes('(visita de control de calidad)')
  ) {
    return true;
  }
  // NOTE: wo.type === 'Inspección' is NOT a QC indicator — Inspección is a separate service type

  // 2. Matching QC date of a contract for this client
  if (contractsList && contractsList.length > 0) {
    const clientContracts = contractsList.filter(c => 
      c.clientId === wo.clientId || 
      (c.clientId && wo.clientId && c.clientId.trim().toLowerCase() === wo.clientId.trim().toLowerCase())
    );

    for (const con of clientContracts) {
      if (!con.maintenanceDates || con.maintenanceDates.length === 0) continue;

      const isMatchingQc = con.maintenanceDates.some((rawDate, idx) => {
        const [cleanDate, specificEq] = rawDate.split('|');
        if (!isWoMatchingContractDate(wo, con, rawDate, contractsList)) return false;

        if (con.qcDates && con.qcDates.length > 0) {
          return con.qcDates.some(qd => {
            const [qDate, qEq] = qd.split('|');
            if (specificEq && qEq) return qDate === cleanDate && qEq === specificEq;
            return qd === rawDate || qd === cleanDate || qDate === cleanDate;
          });
        }
        if (con.qcDate) {
          return con.qcDate === cleanDate || con.qcDate === rawDate;
        }
        // Fallback default: last date of contract
        return idx === con.maintenanceDates.length - 1;
      });

      if (isMatchingQc) return true;
    }
  }

  return false;
};

const getContractMaintenanceStatus = (con: Contract, workOrders: WorkOrder[], allContracts: Contract[] = []) => {
  if (!con.maintenanceDates || con.maintenanceDates.length === 0) {
    return { 
      isCompleted: false, 
      total: 0, 
      done: 0, 
      remaining: 0, 
      hasNoPending: false,
      eqBreakdown: [],
      modalityBreakdown: [],
      pendingByModalityText: '',
      pendingByEquipmentText: ''
    };
  }

  const clientWOs = workOrders.filter(wo => 
    wo.clientId === con.clientId || 
    (wo.clientId && con.clientId && wo.clientId.trim().toLowerCase() === con.clientId.trim().toLowerCase())
  );

  let doneCount = 0;
  const usedWoIds = new Set<string>();

  const eqMap: Record<string, { name: string; modality?: string; total: number; done: number; remaining: number }> = {};
  const modalityMap: Record<string, { modality: string; total: number; done: number; remaining: number }> = {};

  con.maintenanceDates.forEach((rawEntry, idx) => {
    const [cleanDate, specificEquipInDate] = rawEntry.split('|');

    // 1. Try matching using isWoMatchingContractDate (excluding already claimed WOs)
    let matchingWO = clientWOs.find(wo => !usedWoIds.has(wo.id) && isWoMatchingContractDate(wo, con, rawEntry, allContracts));

    // 2. Fallback: match by plannedDate directly among clientWOs for matching equipment
    if (!matchingWO) {
      matchingWO = clientWOs.find(wo => {
        if (usedWoIds.has(wo.id)) return false;
        if (wo.plannedDate !== cleanDate) return false;
        if (wo.equipmentName && con.equipmentItems && con.equipmentItems.length > 0) {
          const wEq = wo.equipmentName.trim().toLowerCase();
          return con.equipmentItems.some(item => item.name && (wEq.includes(item.name.trim().toLowerCase()) || item.name.trim().toLowerCase().includes(wEq)));
        }
        return true;
      });
    }

    // Determine target equipment name
    let targetEqName = specificEquipInDate?.trim() || matchingWO?.equipmentName;
    if (!targetEqName && con.equipmentItems && con.equipmentItems.length > 0) {
      if (con.equipmentItems.length === 1) {
        targetEqName = con.equipmentItems[0].name;
      } else {
        targetEqName = con.equipmentItems[idx % con.equipmentItems.length]?.name;
      }
    }

    // Determine modality (explicit or auto-inferred from equipment name e.g. VCT, CTE, RX, MG, CT)
    const eqItem = con.equipmentItems?.find(item => item.name && targetEqName && (item.name.trim().toLowerCase().includes(targetEqName.trim().toLowerCase()) || targetEqName.trim().toLowerCase().includes(item.name.trim().toLowerCase())));
    
    let modality = eqItem?.modality?.trim();
    if (!modality && targetEqName) {
      const cleanEq = targetEqName.trim();
      if (cleanEq.length <= 6) {
        modality = cleanEq.toUpperCase();
      } else {
        const match = cleanEq.match(/\b(VCT|CTE|CT|MG|RX|US|MRI|RM|ECG|RF|FL|OT)\b/i);
        if (match) {
          modality = match[1].toUpperCase();
        } else {
          const firstWord = cleanEq.split(' ')[0].toUpperCase();
          if (firstWord.length <= 5) modality = firstWord;
        }
      }
    }

    const eqKey = targetEqName || 'Equipo General';

    if (!eqMap[eqKey]) {
      eqMap[eqKey] = { name: eqKey, modality, total: 0, done: 0, remaining: 0 };
    }
    eqMap[eqKey].total++;

    const modKey = modality || eqKey;
    if (!modalityMap[modKey]) {
      modalityMap[modKey] = { modality: modKey, total: 0, done: 0, remaining: 0 };
    }
    modalityMap[modKey].total++;

    let isDone = false;
    if (matchingWO) {
      usedWoIds.add(matchingWO.id);
      if (matchingWO.status === 'Realizado' || matchingWO.status === 'Conciliado' || matchingWO.status === 'Reportado') {
        doneCount++;
        isDone = true;
      }
    }

    if (isDone) {
      eqMap[eqKey].done++;
      modalityMap[modKey].done++;
    } else {
      eqMap[eqKey].remaining++;
      modalityMap[modKey].remaining++;
    }
  });

  const total = con.maintenanceDates.length;
  const isAllCompleted = total > 0 && doneCount >= total;
  const remaining = Math.max(0, total - doneCount);

  const eqBreakdown = Object.values(eqMap);
  const modalityBreakdown = Object.values(modalityMap);

  const pendingByModalityText = modalityBreakdown
    .filter(m => m.remaining > 0)
    .map(m => `${m.remaining} ${m.modality}`)
    .join(' · ');

  const pendingByEquipmentText = eqBreakdown
    .filter(e => e.remaining > 0)
    .map(e => `${e.remaining} ${e.name}${e.modality && e.modality !== e.name ? ` (${e.modality})` : ''}`)
    .join(' · ');

  return {
    isCompleted: isAllCompleted,
    total,
    done: doneCount,
    remaining,
    hasNoPending: isAllCompleted,
    eqBreakdown,
    modalityBreakdown,
    pendingByModalityText,
    pendingByEquipmentText
  };
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

const getEngineerHexColor = (engineerId: string): string => {
  const colors: Record<string, string> = {
    'ENG-001': '#f43f5e', // rose-500
    'ENG-002': '#14b8a6', // teal-500
    'ENG-003': '#6366f1', // indigo-500
    'ENG-004': '#f59e0b', // amber-500
    'ENG-005': '#a855f7', // purple-500
    'ENG-006': '#10b981', // emerald-500
    'ENG-007': '#0ea5e9', // sky-500
    'ENG-008': '#f97316', // orange-500
    'ENG-009': '#ec4899', // pink-500
    'ENG-010': '#84cc16', // lime-500
    'ENG-011': '#06b6d4', // cyan-500
  };
  return colors[engineerId] || '#64748b'; // slate-500
};

export default function AdminPortal({
  userRole = 'admin',
  currentUserEmail,
  currentUserPermissions,
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
  onDeleteContract,
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
  onSendPasswordReset,
  maintenanceRegistries = [],
  onAddMaintenanceRegistry,
  onDeleteMaintenanceRegistry,
  onBulkUploadMaintenanceRegistries,
  onClearMaintenanceRegistries,
  evaluations360 = [],
  onSaveEvaluation360,
  scheduledTrainings = [],
  onAddScheduledTraining,
  onUpdateScheduledTraining,
  onDeleteScheduledTraining,
  contractsGE = [],
  onAddContractGE,
  onUpdateContractGE,
  onDeleteContractGE,
  onBulkUploadContractsGE,
  allRegisteredUsers,
  onUpdateUserRole,
  onRegisterNewUser,
  onToggleClientConfirmed
}: AdminPortalProps) {
  const effectivePermissions: UserPermissions = useMemo(() => {
    if (userRole === 'admin' && !currentUserPermissions) {
      return DEFAULT_GLOBAL_ROLE_TEMPLATES.Admin;
    }
    const matchedEng = currentUserPermissions 
      ? undefined 
      : engineers.find(e => currentUserEmail && e.email && e.email.trim().toLowerCase() === currentUserEmail.trim().toLowerCase());

    const perms = currentUserPermissions || matchedEng?.customPermissions || getDefaultPermissionsForSpecialty(matchedEng?.specialty || (userRole === 'sales' ? 'Ventas' : 'Ingeniería'));
    return perms;
  }, [userRole, currentUserEmail, currentUserPermissions, engineers]);

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
  // Pending user assignment states (keyed by uid)
  const [pendingUserRoles, setPendingUserRoles] = useState<Record<string, 'engineer' | 'sales' | 'admin'>>({});
  const [pendingUserEngIds, setPendingUserEngIds] = useState<Record<string, string>>();

  // Main Admin Tab state
  const [activeAdminTab, setActiveAdminTab] = useState<'agendamiento' | 'clientes' | 'equipos' | 'registro' | 'contratos' | 'cronograma' | 'vacaciones' | 'capacitaciones'>(
    userRole === 'sales' ? 'clientes' : 'agendamiento'
  );

  // Vacaciones Tab states
  const [vacFormEngId, setVacFormEngId] = useState('');
  const [vacFormStart, setVacFormStart] = useState('');
  const [vacFormEnd, setVacFormEnd] = useState('');
  const [vacFormNotes, setVacFormNotes] = useState('');
  const [editingQuotaEngId, setEditingQuotaEngId] = useState<string | null>(null);
  const [editingQuotaValue, setEditingQuotaValue] = useState<number>(15);
  const [historyEngId, setHistoryEngId] = useState<string | null>(null);
  const [vacFormSearchOpen, setVacFormSearchOpen] = useState(false);
  const [vacationSubTab, setVacationSubTab] = useState<'saldos' | 'historial'>('saldos');
  const [auditEngId, setAuditEngId] = useState('');

  // Auto-seed Ecuador national holidays if not loaded
  useEffect(() => {
    if (activeAdminTab === 'vacaciones' && onAddVacation && vacations) {
      const hasEcuadorHolidays = vacations.some(v => v.id.startsWith('FERIADO-EC-') || v.notes?.includes('Feriado Nacional'));
      if (!hasEcuadorHolidays) {
        ECUADOR_HOLIDAYS.forEach(async (h) => {
          await onAddVacation({
            id: h.id,
            engineerId: 'FERIADO',
            startDate: h.startDate,
            endDate: h.endDate,
            status: 'Aprobado',
            notes: h.notes,
            createdAt: new Date().toISOString(),
            includeWeekends: true
          });
        });
      }
    }
  }, [activeAdminTab, vacations, onAddVacation]);

  // States for inline editing of engineers
  const [editingEngId, setEditingEngId] = useState<string | null>(null);
  const [editEngName, setEditEngName] = useState('');
  const [editEngEmail, setEditEngEmail] = useState('');
  const [editEngSpecialty, setEditEngSpecialty] = useState<Specialty>('Ingeniería');
  const [editEngSede, setEditEngSede] = useState<'Quito' | 'Guayaquil' | 'Cuenca' | 'Sede Central'>('Quito');
  const [newEngSede, setNewEngSede] = useState<'Quito' | 'Guayaquil' | 'Cuenca' | 'Sede Central'>('Quito');
  const [editEngSkills, setEditEngSkills] = useState<string[]>([]);
  const [editEngPermissions, setEditEngPermissions] = useState<UserPermissions>(getDefaultPermissionsForSpecialty('Ingeniería'));
  
  // Global Role Templates state (persisted to localStorage)
  const [globalRoleTemplates, setGlobalRoleTemplates] = useState<RoleTemplates>(() => {
    try {
      const saved = localStorage.getItem('orimec_global_role_templates');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error loading role templates", e);
    }
    return DEFAULT_GLOBAL_ROLE_TEMPLATES;
  });

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [activeTemplateTab, setActiveTemplateTab] = useState<'Ingeniería' | 'Ventas' | 'Admin'>('Ventas');
  const [tempTemplatePermissions, setTempTemplatePermissions] = useState<UserPermissions>(DEFAULT_GLOBAL_ROLE_TEMPLATES.Ventas);
  const [vacFormSearchQuery, setVacFormSearchQuery] = useState('');
  const [vacFormIncludeWeekends, setVacFormIncludeWeekends] = useState(true);
  const [modalVacIncludeWeekends, setModalVacIncludeWeekends] = useState(true);
  const [permFormDate, setPermFormDate] = useState('');
  const [permFormHours, setPermFormHours] = useState(8);
  const [permFormReason, setPermFormReason] = useState('');
  const [permFormType, setPermFormType] = useState<'Permiso' | 'Compensación'>('Permiso');
  const [vacEngSearchQuery, setVacEngSearchQuery] = useState('');

  // Registry Tab states
  const [isRegistryImporterOpen, setIsRegistryImporterOpen] = useState(false);
  const [isRegistryModalOpen, setIsRegistryModalOpen] = useState(false);
  const [editingRegistry, setEditingRegistry] = useState<MaintenanceRegistry | null>(null);
  const [regFormInstitutionName, setRegFormInstitutionName] = useState('');
  const [regFormEqBrand, setRegFormEqBrand] = useState('FUJIFILM');
  const [regFormEqModel, setRegFormEqModel] = useState('');
  const [regFormEqSerial, setRegFormEqSerial] = useState('');
  const [regFormTuboBrand, setRegFormTuboBrand] = useState('FUJIFILM');
  const [regFormTuboModel, setRegFormTuboModel] = useState('');
  const [regFormTuboSerial, setRegFormTuboSerial] = useState('');
  const [regFormFecha, setRegFormFecha] = useState('');
  const [regFormResponsable, setRegFormResponsable] = useState('');
  const [registryCsvSuccess, setRegistryCsvSuccess] = useState<string | null>(null);
  const [registryCsvError, setRegistryCsvError] = useState<string | null>(null);
  const [infoScheduledTraining, setInfoScheduledTraining] = useState<ScheduledTraining | null>(null);
  const [eval360ModalTab, setEval360ModalTab] = useState<'metrics' | 'evaluation'>('metrics');
  const [editingEval360, setEditingEval360] = useState<EngineerEvaluation360 | null>(null);
  const [engMetricsSelectedStatus, setEngMetricsSelectedStatus] = useState<WorkOrderStatus | 'TODAS'>('Pendiente');
  const [engMetricsSelectedType, setEngMetricsSelectedType] = useState<WorkOrderType | null>(null);
  const [showEngHoursDetail, setShowEngHoursDetail] = useState<boolean>(false);
  const [expandedMainKPICard, setExpandedMainKPICard] = useState<'mantenimientos' | 'horas' | 'instalaciones' | 'carga' | 'topPerformer' | 'cierre' | null>(null);
  const [excludedEngIds, setExcludedEngIds] = useState<string[]>([]);
  const [showEngFilterModal, setShowEngFilterModal] = useState<boolean>(false);

  // Memoized equipment auto-fill suggestions for Registry Modal (combines maintenanceRegistries & contract equipmentItems)
  const suggestedRegistryEquipments = useMemo(() => {
    const normInput = cleanStr(regFormInstitutionName);
    if (!normInput || normInput.length < 2) return [];

    const stopWords = new Set(['hosp', 'hospital', 'clinica', 'clínica', 'centro', 'basico', 'básico', 'general', 'salud', 'subcentro', 'unidad', 'medica', 'médica', 'instituto', 'san', 'santa', 'de', 'del', 'la', 'el', 'los', 'las']);
    const tokens = normInput.split(' ').map(t => t.toLowerCase().trim()).filter(t => t.length > 2 && !stopWords.has(t));

    const uniqueEquips: {
      institutionName: string;
      eqBrand: string;
      eqModel: string;
      eqSerial: string;
      tuboBrand: string;
      tuboModel: string;
      tuboSerial: string;
    }[] = [];

    const seenKeys = new Set<string>();

    // A) From maintenanceRegistries
    (maintenanceRegistries || []).forEach(reg => {
      const regInst = cleanStr(reg.institutionName);
      const matches = regInst === normInput || normInput.includes(regInst) || regInst.includes(normInput) || (tokens.length > 0 && tokens.some(t => regInst.includes(t)));
      if (matches && reg.eqBrand && reg.eqBrand !== '-') {
        const k = `${reg.institutionName.trim()}|${reg.eqBrand.trim()}|${reg.eqModel.trim()}|${reg.eqSerial.trim()}`;
        if (!seenKeys.has(k)) {
          seenKeys.add(k);
          uniqueEquips.push({
            institutionName: reg.institutionName,
            eqBrand: reg.eqBrand,
            eqModel: reg.eqModel,
            eqSerial: reg.eqSerial,
            tuboBrand: reg.tuboBrand || '-',
            tuboModel: reg.tuboModel || '-',
            tuboSerial: reg.tuboSerial || '-'
          });
        }
      }
    });

    // B) ALSO from Contracts equipmentItems
    (contracts || []).forEach(con => {
      const client = clients.find(c => c.id === con.clientId);
      const clientName = client ? client.name : (con.clientId || '');
      const conInst = cleanStr(clientName);
      const matches = conInst === normInput || normInput.includes(conInst) || conInst.includes(normInput) || (tokens.length > 0 && tokens.some(t => conInst.includes(t)));
      if (matches && con.equipmentItems && con.equipmentItems.length > 0) {
        con.equipmentItems.forEach(item => {
          if (!item.name) return;
          const brand = item.brand || 'GE';
          const serial = item.serialNumber || '-';
          const k = `${clientName.trim()}|${brand.trim()}|${item.name.trim()}|${serial.trim()}`;
          if (!seenKeys.has(k)) {
            seenKeys.add(k);
            uniqueEquips.push({
              institutionName: clientName,
              eqBrand: brand,
              eqModel: item.name,
              eqSerial: serial,
              tuboBrand: '-',
              tuboModel: '-',
              tuboSerial: '-'
            });
          }
        });
      }
    });

    return uniqueEquips;
  }, [regFormInstitutionName, maintenanceRegistries, contracts, clients]);

  const getEngineerVacationConflict = (engId: string, startDate: string, duration: number) => {
    if (!engId || !startDate || !duration) return null;
    const end = getEndDateStr(startDate, duration);
    const conflict = (vacations || []).find(v => {
      if (v.status !== 'Aprobado') return false;
      if (v.engineerId !== engId && v.engineerId !== 'FERIADO' && v.engineerId !== 'ALL') return false;
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
  const [contractsSubTab, setContractsSubTab] = useState<'garantias' | 'ge' | 'proyeccion'>('garantias');
  const [contractSearch, setContractSearch] = useState('');
  const [contractPage, setContractPage] = useState(1);
  const [contractFilterExpiration, setContractFilterExpiration] = useState<'1m' | '3m' | 'expired' | 'pending_admin' | 'inactivo' | null>(null);
  const [contractFilterBrand, setContractFilterBrand] = useState<string>('all');
  const [contractDateSort, setContractDateSort] = useState<'none' | 'start_asc' | 'start_desc' | 'end_asc' | 'end_desc'>('none');
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isContractImporterOpen, setIsContractImporterOpen] = useState(false);
  const [contractCsvError, setContractCsvError] = useState<string | null>(null);

  // Contratos con GE states & Dashboard
  const [contractGeSearch, setContractGeSearch] = useState('');
  const [contractGePage, setContractGePage] = useState(1);
  const [isContractGeImporterOpen, setIsContractGeImporterOpen] = useState(false);
  const [isGeDashboardExpanded, setIsGeDashboardExpanded] = useState(true);
  const [contractGeCsvError, setContractGeCsvError] = useState<string | null>(null);
  const [isContractGeModalOpen, setIsContractGeModalOpen] = useState(false);
  const [editingContractGe, setEditingContractGe] = useState<ContractGE | null>(null);
  const [geFormMode, setGeFormMode] = useState<'existing' | 'new'>('existing');
  const [geClientSearchQuery, setGeClientSearchQuery] = useState('');
  const [isGeClientDropdownOpen, setIsGeClientDropdownOpen] = useState(false);
  const [geFormCliente, setGeFormCliente] = useState('');
  const [geFormSid, setGeFormSid] = useState('');
  const [geFormModalidad, setGeFormModalidad] = useState('');
  const [geFormEquipo, setGeFormEquipo] = useState('');
  const [geFormEquipmentNum, setGeFormEquipmentNum] = useState('');
  const [geFormInvoice, setGeFormInvoice] = useState('');
  const [geFormAmount, setGeFormAmount] = useState('');
  const [geFormMonths, setGeFormMonths] = useState('');
  const [geFormInvoiceDate, setGeFormInvoiceDate] = useState('');
  const [geFormDueDate, setGeFormDueDate] = useState('');
  const [geFormPaymentPeriod, setGeFormPaymentPeriod] = useState('');
  const [geFormMonthNum, setGeFormMonthNum] = useState('');
  const [geFormContractNum, setGeFormContractNum] = useState('');
  const [geFormObs, setGeFormObs] = useState('');

  // Contratos Form states
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [contractFormId, setContractFormId] = useState('');
  const [contractFormClientId, setContractFormClientId] = useState('');
  const [contractFormType, setContractFormType] = useState<'Garantía extendida/Contrato' | 'Garantía de compra' | 'Facturable' | 'Otro'>('Garantía extendida/Contrato');
  const [contractFormStart, setContractFormStart] = useState('');
  const [contractFormEnd, setContractFormEnd] = useState('');
  const [contractFormStatus, setContractFormStatus] = useState<'Activo' | 'Vencido' | 'Pendiente' | 'Inactivo'>('Activo');
  const [contractFormCity, setContractFormCity] = useState('');
  const [contractFormValue, setContractFormValue] = useState<string>('');
  const [contractFormCoverage, setContractFormCoverage] = useState('');
  const [contractClientSearchQuery, setContractClientSearchQuery] = useState('');
  const [isContractClientDropdownOpen, setIsContractClientDropdownOpen] = useState(false);
  const [isCreatingNewClientForContract, setIsCreatingNewClientForContract] = useState(false);
  
  // New client inline form fields
  const [newContractClientName, setNewContractClientName] = useState('');
  const [newContractClientIndustry, setNewContractClientIndustry] = useState('');
  const [newContractClientAddress, setNewContractClientAddress] = useState('');
  const [newContractClientContactName, setNewContractClientContactName] = useState('');
  const [newContractClientContactPhone, setNewContractClientContactPhone] = useState('');

  // Equipment list in contract
  const [contractFormEquipmentItems, setContractFormEquipmentItems] = useState<ContractEquipmentItem[]>([]);
  const [tempEquipName, setTempEquipName] = useState('');
  const [tempEquipBrand, setTempEquipBrand] = useState('');
  const [tempEquipModality, setTempEquipModality] = useState('');
  const [tempEquipSerial, setTempEquipSerial] = useState('');
  const [tempEquipGon, setTempEquipGon] = useState('');

  // Maintenance scheduling states
  const [contractFormFrequency, setContractFormFrequency] = useState<'Mensual' | 'Bimestral' | 'Trimestral' | 'Cuatrimestral' | 'Semestral' | 'Anual' | 'Personalizado' | 'Ninguno'>('Ninguno');
  const [contractFormPreferredDay, setContractFormPreferredDay] = useState<number | ''>('');
  const [contractFormPreferredMonth, setContractFormPreferredMonth] = useState<number | ''>('');
  const [contractFormSelectedEquipForFreq, setContractFormSelectedEquipForFreq] = useState<string>('all');
  const [contractFormMaintenanceDates, setContractFormMaintenanceDates] = useState<string[]>([]);
  const [tempMaintenanceDate, setTempMaintenanceDate] = useState('');
  const [tempManualEquipTarget, setTempManualEquipTarget] = useState<string>('');
  const [contractFormQcDate, setContractFormQcDate] = useState('');
  const [contractFormQcDates, setContractFormQcDates] = useState<string[]>([]);
  const [contractFormPendingAdmin, setContractFormPendingAdmin] = useState<boolean>(false);

  // Helper to compute default QC dates (1 QC date per equipment)
  const computeDefaultQcDates = (allDates: string[]): string[] => {
    const byEq: Record<string, string[]> = {};
    allDates.forEach(d => {
      const eq = d.split('|')[1] || 'general';
      if (!byEq[eq]) byEq[eq] = [];
      byEq[eq].push(d);
    });
    const qcs: string[] = [];
    Object.values(byEq).forEach(dateList => {
      if (dateList.length > 0) {
        qcs.push(dateList[dateList.length - 1]);
      }
    });
    return qcs;
  };

  const formatCronogramaDateMonthYear = (dateEntry: string): string => {
    if (!dateEntry) return 'Fecha por coordinar';
    const cleanDate = dateEntry.split('|')[0].trim();
    const parts = cleanDate.split('-');
    if (parts.length === 3) {
      const y = parts[0];
      const mIdx = parseInt(parts[1], 10) - 1;
      const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      if (mIdx >= 0 && mIdx < 12) {
        return `${months[mIdx]} de ${y}`;
      }
    }
    return cleanDate;
  };

  // Cloudinary Contract Attachments States
  const [contractFormPdfUrl, setContractFormPdfUrl] = useState('');
  const [contractFormSchedulePdfUrl, setContractFormSchedulePdfUrl] = useState('');
  const [contractFormIsNewEquipment, setContractFormIsNewEquipment] = useState(false);
  const [contractFormSrPdfUrl, setContractFormSrPdfUrl] = useState('');
  const [contractFormCaPdfUrl, setContractFormCaPdfUrl] = useState('');
  const [contractFormPodPdfUrl, setContractFormPodPdfUrl] = useState('');

  const [isUploadingContractPdf, setIsUploadingContractPdf] = useState(false);
  const [uploadContractPdfProgress, setUploadContractPdfProgress] = useState(0);
  const [isUploadingSchedulePdf, setIsUploadingSchedulePdf] = useState(false);
  const [uploadSchedulePdfProgress, setUploadSchedulePdfProgress] = useState(0);
  const [isUploadingSrPdf, setIsUploadingSrPdf] = useState(false);
  const [uploadSrPdfProgress, setUploadSrPdfProgress] = useState(0);
  const [isUploadingCaPdf, setIsUploadingCaPdf] = useState(false);
  const [uploadCaPdfProgress, setUploadCaPdfProgress] = useState(0);
  const [isUploadingPodPdf, setIsUploadingPodPdf] = useState(false);
  const [uploadPodPdfProgress, setUploadPodPdfProgress] = useState(0);

  const [isDraggingContractPdf, setIsDraggingContractPdf] = useState(false);
  const [isDraggingSchedulePdf, setIsDraggingSchedulePdf] = useState(false);
  const [isDraggingSrPdf, setIsDraggingSrPdf] = useState(false);
  const [isDraggingCaPdf, setIsDraggingCaPdf] = useState(false);
  const [isDraggingPodPdf, setIsDraggingPodPdf] = useState(false);
  const [draggingEqAttachKey, setDraggingEqAttachKey] = useState<string | null>(null);

  const [contractFormLinkedId, setContractFormLinkedId] = useState(''); // ID del contrato sucesor vinculado

  const handleUploadContractFile = async (file: File) => {
    if (!file) return;
    try {
      setIsUploadingContractPdf(true);
      setUploadContractPdfProgress(0);
      const url = await uploadFileToCloudinary(file, (p) => setUploadContractPdfProgress(p));
      setContractFormPdfUrl(url);
    } catch (err: any) {
      alert(err.message || 'Error al subir el archivo del contrato a Cloudinary');
    } finally {
      setIsUploadingContractPdf(false);
    }
  };

  const handleUploadScheduleFile = async (file: File) => {
    if (!file) return;
    try {
      setIsUploadingSchedulePdf(true);
      setUploadSchedulePdfProgress(0);
      const url = await uploadFileToCloudinary(file, (p) => setUploadSchedulePdfProgress(p));
      setContractFormSchedulePdfUrl(url);
      setContractFormPendingAdmin(false);
      if (contractFormStatus === 'Pendiente') {
        const todayStr = new Date().toISOString().split('T')[0];
        const isExpired = contractFormEnd && contractFormEnd < todayStr;
        setContractFormStatus(isExpired ? 'Vencido' : 'Activo');
      }
    } catch (err: any) {
      alert(err.message || 'Error al subir el cronograma a Cloudinary');
    } finally {
      setIsUploadingSchedulePdf(false);
    }
  };

  const handleUploadSrFile = async (file: File) => {
    if (!file) return;
    try {
      setIsUploadingSrPdf(true);
      setUploadSrPdfProgress(0);
      const url = await uploadFileToCloudinary(file, (p) => setUploadSrPdfProgress(p));
      setContractFormSrPdfUrl(url);
    } catch (err: any) {
      alert(err.message || 'Error al subir el Service Record (SR) a Cloudinary');
    } finally {
      setIsUploadingSrPdf(false);
    }
  };

  const handleUploadCaFile = async (file: File) => {
    if (!file) return;
    try {
      setIsUploadingCaPdf(true);
      setUploadCaPdfProgress(0);
      const url = await uploadFileToCloudinary(file, (p) => setUploadCaPdfProgress(p));
      setContractFormCaPdfUrl(url);
    } catch (err: any) {
      alert(err.message || 'Error al subir el Certificate of Acceptance (CA) a Cloudinary');
    } finally {
      setIsUploadingCaPdf(false);
    }
  };

  const handleUploadPodFile = async (file: File) => {
    if (!file) return;
    try {
      setIsUploadingPodPdf(true);
      setUploadPodPdfProgress(0);
      const url = await uploadFileToCloudinary(file, (p) => setUploadPodPdfProgress(p));
      setContractFormPodPdfUrl(url);
    } catch (err: any) {
      alert(err.message || 'Error al subir el Proof of Delivery (POD) a Cloudinary');
    } finally {
      setIsUploadingPodPdf(false);
    }
  };

  const [selectedContractForDetails, setSelectedContractForDetails] = useState<Contract | null>(null);
  const [isContractDetailsModalOpen, setIsContractDetailsModalOpen] = useState(false);
  const [selectedContractForSchedulePdf, setSelectedContractForSchedulePdf] = useState<Contract | null>(null);
  const [selectedEquipmentForSchedulePdf, setSelectedEquipmentForSchedulePdf] = useState<ContractEquipmentItem | null>(null);
  const [isContractSchedulePdfOpen, setIsContractSchedulePdfOpen] = useState(false);
  const [selectedEngForMetrics, setSelectedEngForMetrics] = useState<Engineer | null>(null);
  const [isEngMetricsModalOpen, setIsEngMetricsModalOpen] = useState(false);

  // Create New WO States
  const [isCreatingWO, setIsCreatingWO] = useState(false);
  const [newWOClient, setNewWOClient] = useState(clients[0]?.id || '');
  const [newWOClientSearch, setNewWOClientSearch] = useState('');
  const [newWOCity, setNewWOCity] = useState<string>('Quito');
  const [newWOEngineer, setNewWOEngineer] = useState(engineers[0]?.id || '');
  const [woEngDropdownOpen, setWoEngDropdownOpen] = useState(false);
  const [woEngSearchQuery, setWoEngSearchQuery] = useState('');
  const [woSupportEngDropdownOpen, setWoSupportEngDropdownOpen] = useState(false);
  const [woSupportEngSearchQuery, setWoSupportEngSearchQuery] = useState('');
  const [editWoEngDropdownOpen, setEditWoEngDropdownOpen] = useState(false);
  const [editWoEngSearchQuery, setEditWoEngSearchQuery] = useState('');
  const [editWoSupportEngDropdownOpen, setEditWoSupportEngDropdownOpen] = useState(false);
  const [editWoSupportEngSearchQuery, setEditWoSupportEngSearchQuery] = useState('');
  const [newWOSupportEngineer, setNewWOSupportEngineer] = useState('');
  const [newWOSupportEngineers, setNewWOSupportEngineers] = useState<string[]>([]);
  const [newWOType, setNewWOType] = useState<MaintenanceType>('Preventivo');
  const [newWOEquipment, setNewWOEquipment] = useState('');
  const [showEquipSuggestions, setShowEquipSuggestions] = useState(false);
  const [selectedWOTags, setSelectedWOTags] = useState<string[]>([]);
  const [newWONotes, setNewWONotes] = useState('');
  const [newWODate, setNewWODate] = useState(currentDateStr);
  const [newWOTimeStart, setNewWOTimeStart] = useState('09:00');
  const [newWOTimeEnd, setNewWOTimeEnd] = useState('11:00');
  const [newWODurationDays, setNewWODurationDays] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const matchesSearch = React.useCallback((wo: WorkOrder) => {
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
  }, [searchQuery, engineers, clients]);

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
  const [engModalTab, setEngModalTab] = useState<'engineers' | 'users'>('engineers');
  const [engSearchQuery, setEngSearchQuery] = useState('');
  const [isAddingNewEng, setIsAddingNewEng] = useState(false);
  const [newEngName, setNewEngName] = useState('');
  const [newEngEmail, setNewEngEmail] = useState('');
  const [newEngPassword, setNewEngPassword] = useState('');
  const [newEngRole, setNewEngRole] = useState<'engineer' | 'admin' | 'sales'>('engineer');
  const [newEngSpecialty, setNewEngSpecialty] = useState<Specialty>('Ingeniería');
  const [newEngPhone, setNewEngPhone] = useState('');
  const [isRegisteringUser, setIsRegisteringUser] = useState(false);
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

  // Reorganization & Schedule Conflict States
  const [isReorganizePreviewMode, setIsReorganizePreviewMode] = useState(false);
  const [previewWorkOrders, setPreviewWorkOrders] = useState<WorkOrder[] | null>(null);
  const [reassignedWOIds, setReassignedWOIds] = useState<Set<string>>(new Set());
  const [filterOnlyConflicting, setFilterOnlyConflicting] = useState(false);

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

  // Lock body scroll whenever ANY modal or overlay is active
  const isAnyModalActive = 
    isContractModalOpen || 
    isContractDetailsModalOpen ||
    !!selectedContractForDetails || 
    isClientModalOpen ||
    isEquipModalOpen || 
    isContractGeModalOpen ||
    isEngMetricsModalOpen ||
    isCreatingWO;

  useEffect(() => {
    if (isAnyModalActive) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow || '';
      };
    }
  }, [isAnyModalActive]);

  // Active work orders list (switches dynamically during reorganization preview mode)
  const activeWorkOrdersList = React.useMemo(() => {
    return isReorganizePreviewMode && previewWorkOrders ? previewWorkOrders : workOrders;
  }, [isReorganizePreviewMode, previewWorkOrders, workOrders]);

  // Schedule Conflict Detection (scoped to the currently selected calendar month & year)
  const { conflictingWOIds, conflictingDates } = React.useMemo(() => {
    const confWOs = new Set<string>();
    const confDates = new Set<string>();

    const mapByDate = new Map<string, WorkOrder[]>();
    activeWorkOrdersList.forEach(wo => {
      if (wo.status === 'Conciliado') return;
      const d = wo.plannedDate;
      if (!d) return;

      // Filter work orders to the selected month & year
      const dateObj = new Date(d + 'T00:00:00');
      if (dateObj.getMonth() + 1 !== calendarMonth || dateObj.getFullYear() !== calendarYear) return;

      if (!mapByDate.has(d)) mapByDate.set(d, []);
      mapByDate.get(d)!.push(wo);
    });

    // 1. Time overlap between 2 work orders for the same engineer on the same day
    mapByDate.forEach((dayWOs, date) => {
      const mapEng = new Map<string, WorkOrder[]>();
      dayWOs.forEach(wo => {
        const engs = [wo.engineerId, ...(wo.supportEngineerIds || (wo.supportEngineerId ? [wo.supportEngineerId] : []))];
        engs.forEach(eId => {
          if (!eId) return;
          if (!mapEng.has(eId)) mapEng.set(eId, []);
          mapEng.get(eId)!.push(wo);
        });
      });

      mapEng.forEach(engWOs => {
        if (engWOs.length < 2) return;
        for (let i = 0; i < engWOs.length; i++) {
          for (let j = i + 1; j < engWOs.length; j++) {
            if (checkTimeOverlap(engWOs[i].plannedTime || '', engWOs[j].plannedTime || '')) {
              confWOs.add(engWOs[i].id);
              confWOs.add(engWOs[j].id);
              confDates.add(date);
            }
          }
        }
      });
    });

    // 2. Overlap between work order and engineer vacation or feriado
    activeWorkOrdersList.forEach(wo => {
      if (wo.status === 'Conciliado') return;
      const date = wo.plannedDate;
      if (!date) return;

      // Filter work orders to the selected month & year
      const dateObj = new Date(date + 'T00:00:00');
      if (dateObj.getMonth() + 1 !== calendarMonth || dateObj.getFullYear() !== calendarYear) return;

      const assignedEngs = [wo.engineerId, ...(wo.supportEngineerIds || (wo.supportEngineerId ? [wo.supportEngineerId] : []))].filter(Boolean);

      (vacations || []).forEach(v => {
        if (v.status !== 'Aprobado') return;
        if (date >= v.startDate && date <= v.endDate) {
          const isFeriado = v.engineerId === 'FERIADO' || v.notes?.toLowerCase().includes('feriado');
          if (isFeriado || assignedEngs.includes(v.engineerId)) {
            confWOs.add(wo.id);
            confDates.add(date);
          }
        }
      });
    });

    return { conflictingWOIds: confWOs, conflictingDates: confDates };
  }, [activeWorkOrdersList, engineers, vacations, calendarMonth, calendarYear]);

  const getWoConflictDetails = (wo: Partial<WorkOrder>) => {
    if (!wo.plannedDate || wo.status === 'Conciliado') return null;
    const date = wo.plannedDate;
    const woDuration = wo.durationDays || 1;
    const woEndDate = getEndDateStr(date, woDuration);
    const assignedEngs = [wo.engineerId, ...(wo.supportEngineerIds || (wo.supportEngineerId ? [wo.supportEngineerId] : []))].filter(Boolean) as string[];

    // 1. Check Feriado & Vacation Overlaps
    const matchingVacations = (vacations || []).filter(v => 
      v.status === 'Aprobado' && date <= v.endDate && woEndDate >= v.startDate
    );

    const feriadoVac = matchingVacations.find(v => v.engineerId === 'FERIADO' || v.notes?.toLowerCase().includes('feriado'));
    if (feriadoVac) {
      return { type: 'feriado', label: `Feriado Nacional: ${feriadoVac.notes?.replace('Feriado Nacional: ', '') || 'Día Festivo'}` };
    }

    const engVac = matchingVacations.find(v => assignedEngs.includes(v.engineerId));
    if (engVac) {
      const eng = engineers.find(e => e.id === engVac.engineerId);
      return { type: 'vacation', label: `Técnico en Vacaciones (${getEngineerFullNameNoTitle(eng?.name)})` };
    }

    // 2. Check Work Order Schedule Overlap
    const sameDaySameEngWOs = activeWorkOrdersList.filter(otherWo => {
      if (otherWo.id === wo.id || otherWo.status === 'Conciliado' || otherWo.plannedDate !== date) return false;
      const otherEngs = [otherWo.engineerId, ...(otherWo.supportEngineerIds || (otherWo.supportEngineerId ? [otherWo.supportEngineerId] : []))].filter(Boolean);
      const sharesEng = assignedEngs.some(eId => otherEngs.includes(eId));
      if (!sharesEng) return false;
      return checkTimeOverlap(wo.plannedTime || '', otherWo.plannedTime || '');
    });

    if (sameDaySameEngWOs.length > 0) {
      return { type: 'schedule', label: 'Cruce de Horarios (Mismo Técnico/Horario)' };
    }

    return null;
  };

  // High-precision City and Sector detector for Clients, Contracts, and Work Orders
  const getCityForClientOrWO = (clientIdOrSearch: string, clientList: Client[], contractList: Contract[], woNotes?: string): string => {
    if (!clientIdOrSearch) return 'Quito';
    
    const matchedClient = clientList.find(cl => 
      cl.id === clientIdOrSearch || 
      cl.name.trim().toLowerCase() === clientIdOrSearch.trim().toLowerCase()
    );

    if (matchedClient?.city) {
      const cLower = matchedClient.city.toLowerCase();
      if (cLower.includes('guayaquil') || cLower.includes('duran') || cLower.includes('samborondon') || cLower.includes('manta') || cLower.includes('machala') || cLower.includes('costa')) return 'Guayaquil';
      if (cLower.includes('cuenca') || cLower.includes('azuay') || cLower.includes('loja') || cLower.includes('sur')) return 'Cuenca';
      if (cLower.includes('quito') || cLower.includes('pichincha') || cLower.includes('sierra') || cLower.includes('ambato')) return 'Quito';
      return matchedClient.city;
    }

    if (matchedClient) {
      const clientContracts = contractList.filter(con => con.clientId === matchedClient.id);
      for (const con of clientContracts) {
        if (con.city) {
          const cLower = con.city.toLowerCase();
          if (cLower.includes('guayaquil') || cLower.includes('duran') || cLower.includes('samborondon') || cLower.includes('manta') || cLower.includes('machala') || cLower.includes('costa')) return 'Guayaquil';
          if (cLower.includes('cuenca') || cLower.includes('azuay') || cLower.includes('loja') || cLower.includes('sur')) return 'Cuenca';
          if (cLower.includes('quito') || cLower.includes('pichincha') || cLower.includes('sierra') || cLower.includes('ambato')) return 'Quito';
          return con.city;
        }
      }
    }

    const txt = `${matchedClient ? matchedClient.name + ' ' + matchedClient.address + ' ' + matchedClient.industry : clientIdOrSearch} ${woNotes || ''}`.toLowerCase();

    if (
      txt.includes('guayaquil') || txt.includes('gye') || txt.includes('samborondón') || txt.includes('samborondon') || 
      txt.includes('daule') || txt.includes('durán') || txt.includes('duran') || txt.includes('manta') || 
      txt.includes('portoviejo') || txt.includes('machala') || txt.includes('babahoyo') || txt.includes('milagro') || 
      txt.includes('quevedo') || txt.includes('esmeraldas') || txt.includes('salinas') || txt.includes('santa elena') || 
      txt.includes('el oro') || txt.includes('manabi') || txt.includes('manabí') || txt.includes('guayas') || txt.includes('costa')
    ) {
      return 'Guayaquil';
    }

    if (
      txt.includes('cuenca') || txt.includes('cue') || txt.includes('azuay') || txt.includes('loja') || 
      txt.includes('cañar') || txt.includes('canar') || txt.includes('macas') || txt.includes('zamora') || txt.includes('sur')
    ) {
      return 'Cuenca';
    }

    if (
      txt.includes('quito') || txt.includes('uio') || txt.includes('pichincha') || txt.includes('ambato') || 
      txt.includes('ibarra') || txt.includes('latacunga') || txt.includes('riobamba') || txt.includes('tulcan') || 
      txt.includes('tulcán') || txt.includes('santo domingo') || txt.includes('tumbaco') || txt.includes('cumbaya') || 
      txt.includes('cumbayá') || txt.includes('sierra')
    ) {
      return 'Quito';
    }

    return 'Quito';
  };

  // Professional Reorganize Agenda Handler (by Specialization, accredited Modalities & Sede)
  const handleSmartReorganize = () => {
    const currentMonthPrefix = `${calendarYear}-${calendarMonth.toString().padStart(2, '0')}`;
    const clonedList = workOrders.map(wo => ({ ...wo }));
    const pendingMonthWOs = clonedList.filter(wo => 
      wo.plannedDate?.startsWith(currentMonthPrefix) && wo.status !== 'Conciliado'
    );

    if (pendingMonthWOs.length === 0) {
      alert(`No hay órdenes de trabajo pendientes en ${calendarMonthName} de ${calendarYear} para reorganizar.`);
      return;
    }

    const engWorkload = new Map<string, number>();
    engineers.forEach(e => engWorkload.set(e.id, 0));
    pendingMonthWOs.forEach(wo => {
      if (wo.engineerId) engWorkload.set(wo.engineerId, (engWorkload.get(wo.engineerId) || 0) + 1);
    });

    const getCity = (clientId: string, woNotes?: string): string => {
      return getCityForClientOrWO(clientId, clients, contracts, woNotes);
    };

    // Helper to determine required modality/skills for a work order
    const getRequiredModalities = (wo: WorkOrder): string[] => {
      const txt = `${wo.equipmentName} ${wo.notes || ''} ${wo.clientId || ''}`.toLowerCase();
      const mods: string[] = [];
      if (txt.includes('ge') || txt.includes('general electric') || txt.includes('brivo') || txt.includes('optima') || txt.includes('revolution') || txt.includes('oec') || txt.includes('arco en c') || txt.includes('logiq') || txt.includes('discovery')) {
        mods.push('GE');
      }
      if (txt.includes('fuji') || txt.includes('fujifilm') || txt.includes('fdr') || txt.includes('amulet') || txt.includes('primus') || txt.includes('drypix')) {
        mods.push('FE');
      }
      if (txt.includes('tomografo') || txt.includes('tomografía') || txt.includes('tomografia') || txt.includes('ct') || txt.includes('somatom')) {
        mods.push('CT');
      }
      if (txt.includes('resonancia') || txt.includes('rm') || txt.includes('mr') || txt.includes('signa')) {
        mods.push('MR');
      }
      if (txt.includes('mamografia') || txt.includes('mamógrafo') || txt.includes('mamografo')) {
        mods.push('MAMO');
      }
      if (txt.includes('ecografo') || txt.includes('ultrasonido') || txt.includes('eco')) {
        mods.push('US');
      }
      if (mods.length === 0) mods.push('GE', 'FE');
      return mods;
    };

    const newReassigned = new Set<string>();
    let reCount = 0;

    pendingMonthWOs.forEach(wo => {
      const clientCity = getCity(wo.clientId, wo.notes);
      const reqMods = getRequiredModalities(wo);

      let bestEngId = wo.engineerId;
      let bestScore = -999;

      engineers.forEach(eng => {
        if (eng.availability === 'Inactivo') return;
        const isOnVac = (vacations || []).some(v => 
          v.engineerId === eng.id && v.status === 'Aprobado' && wo.plannedDate >= v.startDate && wo.plannedDate <= v.endDate
        );
        if (isOnVac) return;

        // Check engineer accredited skills/modalities
        const engSkills = eng.skills && eng.skills.length > 0 ? eng.skills : ['GE', 'FE', 'CT', 'MR'];
        const hasMatchingModality = reqMods.some(m => engSkills.includes(m) || engSkills.some(s => s.toLowerCase().includes(m.toLowerCase())));
        const hasScheduledTraining = (scheduledTrainings || []).some(st => 
          (st.engineerId === eng.id || st.supportEngineerIds?.includes(eng.id)) &&
          reqMods.some(m => st.title.toLowerCase().includes(m.toLowerCase()) || (st.courseCode && st.courseCode.toLowerCase().includes(m.toLowerCase())))
        );

        // Scoring algorithm:
        // +100 for matching modality/training
        // +40 for matching city/sede/sector (Quito/Guayaquil/Cuenca & surroundings)
        // -15 per current work order load to balance workload
        let score = 0;
        if (hasMatchingModality || hasScheduledTraining) score += 100;
        else score += 10;

        const engSede = (eng.sede || 'Quito').toLowerCase();
        const clientCityLower = clientCity.toLowerCase();
        
        // Exact or regional match for Sede/Sector
        if (
          engSede === clientCityLower ||
          (engSede === 'quito' && (clientCityLower.includes('quito') || clientCityLower.includes('sierra') || clientCityLower.includes('pichincha') || clientCityLower.includes('ambato') || clientCityLower.includes('ibarra') || clientCityLower.includes('latacunga'))) ||
          (engSede === 'guayaquil' && (clientCityLower.includes('guayaquil') || clientCityLower.includes('costa') || clientCityLower.includes('guayas') || clientCityLower.includes('samborondon') || clientCityLower.includes('daule') || clientCityLower.includes('duran') || clientCityLower.includes('manta') || clientCityLower.includes('machala'))) ||
          (engSede === 'cuenca' && (clientCityLower.includes('cuenca') || clientCityLower.includes('sur') || clientCityLower.includes('azuay') || clientCityLower.includes('loja'))) ||
          engSede === 'sede central'
        ) {
          score += 40; // High priority score for matching geographical sector/sede
        }

        const currentLoad = engWorkload.get(eng.id) || 0;
        score -= (currentLoad * 15);

        if (score > bestScore) {
          bestScore = score;
          bestEngId = eng.id;
        }
      });

      if (bestEngId && bestEngId !== wo.engineerId) {
        engWorkload.set(wo.engineerId, Math.max(0, (engWorkload.get(wo.engineerId) || 0) - 1));
        engWorkload.set(bestEngId, (engWorkload.get(bestEngId) || 0) + 1);
        wo.engineerId = bestEngId;
        newReassigned.add(wo.id);
        reCount++;
      }
    });

    if (reCount === 0) {
      alert("La agenda actual ya se encuentra perfectamente optimizada por especialización, capacitaciones y sedes de ingenieros.");
      return;
    }

    setReassignedWOIds(newReassigned);
    setPreviewWorkOrders(clonedList);
    setIsReorganizePreviewMode(true);
  };

  const handleApplyReorganization = async () => {
    if (!previewWorkOrders) return;
    const changedWOs = previewWorkOrders.filter(pWo => {
      const orig = workOrders.find(w => w.id === pWo.id);
      return orig && orig.engineerId !== pWo.engineerId;
    });

    for (const wo of changedWOs) {
      if (onUpdateWorkOrder) {
        await onUpdateWorkOrder(wo);
      }
    }

    setIsReorganizePreviewMode(false);
    setPreviewWorkOrders(null);
    setReassignedWOIds(new Set());
    alert(`¡Éxito! Se han aplicado los cambios de reorganización en ${changedWOs.length} órdenes de trabajo.`);
  };

  const handleCancelReorganizationPreview = () => {
    setIsReorganizePreviewMode(false);
    setPreviewWorkOrders(null);
    setReassignedWOIds(new Set());
  };

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

  React.useEffect(() => {
    const isAnyModalOpen = isCreatingWO || isReportingWO || isContractDetailsModalOpen || isContractSchedulePdfOpen || isEngMetricsModalOpen;
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCreatingWO, isReportingWO, isContractDetailsModalOpen, isContractSchedulePdfOpen, isEngMetricsModalOpen]);

  // ── Auto-scroll and Wheel Scroll while dragging agenda cards ─────────────────
  React.useEffect(() => {
    const ZONE = 140;   // px from top/bottom edge to trigger scroll
    const SPEED = 20;   // max px per animation frame
    let rafId: number | null = null;
    let clientY = 0;
    let clientX = 0;
    let dragging = false;

    const scroll = () => {
      if (!dragging) return;
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const distFromTop    = clientY;
      const distFromBottom = vh - clientY;
      const distFromLeft   = clientX;
      const distFromRight  = vw - clientX;

      let deltaY = 0;
      if (distFromTop < ZONE) {
        deltaY = -Math.round(SPEED * (1 - Math.max(0, distFromTop) / ZONE));
      } else if (distFromBottom < ZONE) {
        deltaY = Math.round(SPEED * (1 - Math.max(0, distFromBottom) / ZONE));
      }

      let deltaX = 0;
      if (distFromLeft < ZONE) {
        deltaX = -Math.round(SPEED * (1 - Math.max(0, distFromLeft) / ZONE));
      } else if (distFromRight < ZONE) {
        deltaX = Math.round(SPEED * (1 - Math.max(0, distFromRight) / ZONE));
      }

      if (deltaY !== 0 || deltaX !== 0) {
        window.scrollBy({ top: deltaY, left: deltaX, behavior: 'instant' as ScrollBehavior });
      }
      rafId = requestAnimationFrame(scroll);
    };

    const onDragOver = (e: DragEvent) => {
      clientY = e.clientY;
      clientX = e.clientX;
      if (!dragging) {
        dragging = true;
        rafId = requestAnimationFrame(scroll);
      }
    };

    // Enables mouse wheel scrolling while dragging an item or holding click
    const onWheel = (e: WheelEvent) => {
      if (dragging || e.buttons > 0) {
        const target = e.target as HTMLElement | null;
        const scrollable = target?.closest?.('.overflow-y-auto, .overflow-x-auto, .overflow-auto') as HTMLElement | null;
        if (scrollable) {
          scrollable.scrollTop += e.deltaY;
          if (e.deltaX) scrollable.scrollLeft += e.deltaX;
        } else {
          window.scrollBy({ top: e.deltaY, left: e.deltaX, behavior: 'instant' as ScrollBehavior });
        }
      }
    };

    const onDragEnd = () => {
      dragging = false;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    document.addEventListener('dragover', onDragOver);
    document.addEventListener('dragend',  onDragEnd);
    document.addEventListener('drop',     onDragEnd);
    window.addEventListener('wheel',      onWheel, { passive: true });

    return () => {
      document.removeEventListener('dragover', onDragOver);
      document.removeEventListener('dragend',  onDragEnd);
      document.removeEventListener('drop',     onDragEnd);
      window.removeEventListener('wheel',      onWheel);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

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
      if (e.currentTarget.contains(e.relatedTarget as Node)) return;
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
    if (!newWOEquipment && selectedWOTags.length === 0) return;

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
        installedEquipments: selectedWOTags.length > 0 ? selectedWOTags : [newWOEquipment],
        city: newWOCity
      };
      if (onAddClient) {
        onAddClient(newClientObj);
      }
      finalClientId = newClientId;
    } else {
      finalClientId = clients[0]?.id || '';
    }

    let nextNum = workOrders.length + 100;
    while (workOrders.some(wo => wo.id === `WO-2026-0${nextNum}`)) {
      nextNum++;
    }
    const newWOId = `WO-2026-0${nextNum}`;

    const conflicts = getCreationFormConflicts();
    if (conflicts.length > 0) {
      const conflictList = conflicts.map(c => `• ${c.engineer.name}: Vacaciones / Feriado del ${c.vacation.startDate} al ${c.vacation.endDate}`).join('\n');
      const confirmSave = window.confirm(
        `⚠️ ALERTA DE CONFLICTO - TÉCNICO EN VACACIONES / FERIADO:\n\n${conflictList}\n\n¿Está seguro de registrar esta Orden de Trabajo en las fechas seleccionadas?`
      );
      if (!confirmSave) return;
    }

    const finalNotes = newWONotes
      ? (newWONotes.includes('[Ciudad:') ? newWONotes : `[Ciudad: ${newWOCity}] ${newWONotes}`)
      : `[Ciudad: ${newWOCity}]`;

    const newWO: WorkOrder = {
      id: newWOId,
      clientId: finalClientId,
      engineerId: newWOEngineer,
      supportEngineerId: newWOSupportEngineers[0] || undefined,
      supportEngineerIds: newWOSupportEngineers,
      plannedDate: newWODate,
      plannedTime: `${formatTime12h(newWOTimeStart)} - ${formatTime12h(newWOTimeEnd)}`,
      type: newWOType,
      status: 'Pendiente',
      equipmentName: selectedWOTags.length > 0 ? selectedWOTags.join(', ') : newWOEquipment,
      notes: finalNotes,
      durationDays: newWODurationDays
    };

    onAddWorkOrder(newWO);
    setIsCreatingWO(false);

    // Alert notice if client contract is Inactivo
    const targetClient = matchedClient || clients.find(c => c.id === finalClientId);
    const inactiveContract = targetClient ? contracts.find(con => con.clientId === targetClient.id && con.status === 'Inactivo') : null;
    if (inactiveContract) {
      alert(`⚠️ AVISO DE CONTRATO INACTIVO (NO RENOVADO):\n\nEl cliente "${targetClient?.name || newWOClientSearch}" tiene su contrato marcado como INACTIVO.\n\nLa Orden de Trabajo ${newWOId} ha sido registrada, pero recuerde que este cliente no cuenta con soporte bajo garantía ni contrato de mantenimiento.`);
    }
    // Reset form
    setNewWOEquipment('');
    setSelectedWOTags([]);
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

        /* Force 100% opacity and clear dark text for all items (including days of other months) */
        #print-isolation-wrap *,
        .calendar-week-container * {
          opacity: 1 !important;
          filter: none !important;
          -webkit-filter: none !important;
        }

        /* Hide EVERYTHING on the page except the cloned print container */
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
          min-height: 60px !important;
          height: auto !important;
          max-height: none !important;
          padding: 3px 4px !important;
          overflow: hidden !important;
          box-sizing: border-box !important;
        }

        /* Clear dark high-contrast text for readability (including days from other months) */
        .cal-day-cell p,
        .cal-day-cell span,
        .cal-day-cell div {
          color: #0f172a !important;
        }

        .cal-day-cell .font-black,
        .cal-day-cell .font-bold,
        .cal-day-cell .font-extrabold {
          color: #020617 !important;
          font-weight: 800 !important;
        }

        /* Compact all text inside cells */
        .cal-day-cell * {
          font-size: 7.5px !important;
          line-height: 1.2 !important;
        }

        /* Multi-day event pill bars */
        .calendar-week-container .h-7 {
          height: 17px !important;
          min-height: 0 !important;
        }
        .calendar-week-container .h-7 * {
          font-size: 7px !important;
          line-height: 1 !important;
          color: #0f172a !important;
          font-weight: 700 !important;
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

  const syncContractDatesForMovedWorkOrder = (clientId: string, oldDateStr: string, newDateStr: string, equipmentName?: string) => {
    if (!oldDateStr || !newDateStr || oldDateStr === newDateStr) return;
    if (!onUpdateContract) return;

    // Find contract for this client that contains oldDateStr
    const targetContract = contracts.find(con => {
      if (con.clientId !== clientId) return false;
      if (!con.maintenanceDates || con.maintenanceDates.length === 0) return false;
      return con.maintenanceDates.some(d => d.split('|')[0] === oldDateStr);
    });

    if (!targetContract || !targetContract.maintenanceDates) return;

    // Replace oldDateStr with newDateStr in maintenanceDates array
    let foundMatch = false;
    const updatedDates = targetContract.maintenanceDates.map(entry => {
      const parts = entry.split('|');
      const dStr = parts[0];
      const eqName = parts[1];

      if (!foundMatch && dStr === oldDateStr) {
        foundMatch = true;
        return eqName ? `${newDateStr}|${eqName}` : (equipmentName ? `${newDateStr}|${equipmentName}` : newDateStr);
      }
      return entry;
    });

    if (!foundMatch) return;

    // Sort updatedDates chronologically
    updatedDates.sort((a, b) => a.split('|')[0].localeCompare(b.split('|')[0]));

    // Update qcDate if oldDateStr was the qcDate
    let updatedQcDate = targetContract.qcDate;
    if (targetContract.qcDate === oldDateStr) {
      updatedQcDate = newDateStr;
    }

    const updatedContract: Contract = {
      ...targetContract,
      maintenanceDates: updatedDates,
      qcDate: updatedQcDate
    };

    onUpdateContract(updatedContract);
  };

  const handleMoveWorkOrder = (woId: string, targetDateStr: string) => {
    const wo = workOrders.find(w => w.id === woId);
    if (!wo) return;
    if (wo.plannedDate === targetDateStr) return; // No change
    
    // Check for conflicts (Vacation, Feriado or Schedule overlap)
    const conflictDetail = getWoConflictDetails({ ...wo, plannedDate: targetDateStr });
    if (conflictDetail) {
      const confirmMove = window.confirm(
        `⚠️ ALERTA DE CONFLICTO:\n\n${conflictDetail.label}\nFecha destino: ${targetDateStr}.\n\n¿Está seguro de que desea mover esta Orden de Trabajo a esta fecha con conflicto?`
      );
      if (!confirmMove) return;
    }

    const oldDateStr = wo.plannedDate;

    const updatedWO: WorkOrder = {
      ...wo,
      plannedDate: targetDateStr
    };
    onUpdateWorkOrder(updatedWO);

    syncContractDatesForMovedWorkOrder(wo.clientId, oldDateStr, targetDateStr, wo.equipmentName);
  };

  // Memoized calendar day cells — only recomputes when month/orders/contracts etc. change
  const calendarDays = useMemo(() => {
    const days = [];

    const getContractCommitmentsForDate = (dateStr: string) => {
      const dayCommitments: { contract: Contract; client: Client | undefined; isQc: boolean; isDone: boolean; woStatus: string | null }[] = [];
      
      contracts.forEach(con => {
        if (!con.maintenanceDates || con.maintenanceDates.length === 0) return;

        // Find work orders for this contract's client
        const clientWOs = workOrders.filter(wo => wo.clientId === con.clientId);

        con.maintenanceDates.forEach((entry, idx) => {
          const parts = entry.split('|');
          const contractDate = parts[0];
          const eqName = parts[1];

          // Check if a work order corresponds to this contract date entry
          let matchingWO = clientWOs.find(wo => {
            if (eqName) {
              return wo.equipmentName.trim().toLowerCase() === eqName.trim().toLowerCase() && 
                     (wo.plannedDate === contractDate || Math.abs(new Date(wo.plannedDate + 'T00:00:00').getTime() - new Date(contractDate + 'T00:00:00').getTime()) <= 45 * 86400000);
            }
            return wo.plannedDate === contractDate;
          });

          // Fallback: match by index if work orders list matches maintenanceDates length
          if (!matchingWO && clientWOs.length === con.maintenanceDates.length) {
            matchingWO = clientWOs[idx];
          }

          // Determine the effective date where this commitment badge should be displayed
          const effectiveDate = matchingWO ? matchingWO.plannedDate : contractDate;

          if (effectiveDate === dateStr) {
            // Unify: If there is already a Work Order agendated on dateStr for this contract/client,
            // skip rendering a separate top blue badge since contract details are integrated inside the Work Order card.
            const hasAgendatedWO = activeWorkOrdersList.some(wo => 
              wo.plannedDate === dateStr && (
                (wo.clientId && con.clientId && wo.clientId === con.clientId) ||
                (con.equipmentItems && con.equipmentItems.some(eq => {
                  const eqName = (eq?.name || eq?.equipmentName || '').trim().toLowerCase();
                  const woEqName = (wo?.equipmentName || '').trim().toLowerCase();
                  return eqName !== '' && woEqName !== '' && (eqName === woEqName || eqName.includes(woEqName) || woEqName.includes(eqName));
                }))
              )
            );

            if (hasAgendatedWO) return;

            const client = clients.find(c => c.id === con.clientId);
            const isDone = matchingWO ? (matchingWO.status === 'Realizado' || matchingWO.status === 'Conciliado') : false;
            
            // Is it QC date?
            const isQc = (con.qcDates && con.qcDates.some(qd => qd === contractDate || qd === effectiveDate || qd.startsWith(contractDate) || qd.startsWith(effectiveDate))) ||
              con.qcDate === contractDate || con.qcDate === effectiveDate ||
              (!con.qcDate && (!con.qcDates || con.qcDates.length === 0) && idx === con.maintenanceDates.length - 1);

            // Avoid duplicate badges for the same contract on the same day
            const alreadyAdded = dayCommitments.some(item => item.contract.id === con.id && item.isQc === isQc);
            if (!alreadyAdded) {
              dayCommitments.push({
                contract: con,
                client,
                isQc,
                isDone,
                woStatus: matchingWO ? matchingWO.status : null
              });
            }
          }
        });
      });

      return dayCommitments;
    };

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
        const prevDayOrders = activeWorkOrdersList.filter(wo =>
          (!wo.durationDays || wo.durationDays <= 1) && wo.plannedDate === prevDateStr
        );
        const prevDayVacations = (vacations || []).filter(v =>
          v.status === 'Aprobado' && prevDateStr >= v.startDate && prevDateStr <= v.endDate
        );

        days.push(
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
            className="cal-day-cell min-h-[115px] p-2 bg-slate-100/70 border border-dashed border-slate-200/80 flex flex-col justify-between cursor-pointer hover:bg-indigo-50/30 transition-colors opacity-75 hover:opacity-100"
          >
            <div className="flex justify-between items-center w-full">
              <span className="font-mono text-xs font-black text-slate-400 opacity-60">{prevDay}</span>
              {prevDayOrders.length > 0 && (
                <span className="bg-slate-200 text-slate-500 font-bold text-[8px] px-1 rounded-full opacity-60">
                  {prevDayOrders.length}
                </span>
              )}
            </div>
            <div className="space-y-1 w-full mt-1.5 flex-1 overflow-y-auto">
              {prevDayVacations.map(v => {
                const eng = engineers.find(e => e.id === v.engineerId);
                const isFeriado = v.engineerId === 'FERIADO' || v.notes?.toLowerCase().includes('feriado');
                return (
                  <div
                    key={`pv-vac-${v.id}`}
                    className={`text-[8.5px] leading-tight p-1 rounded font-bold truncate flex items-center gap-1 select-none opacity-50 hover:opacity-100 transition-opacity ${
                      isFeriado
                        ? 'bg-red-600 text-white border border-red-700 font-black'
                        : 'bg-teal-50 border-teal-200 border-l-4 border-l-teal-500 text-teal-900'
                    }`}
                    title={isFeriado ? `Feriado Ecuador: ${v.notes}` : `Vacaciones: ${eng?.name || 'Técnico'}`}
                  >
                    <span>{isFeriado ? '🇪🇨' : '🌴'}</span>
                    <span className="truncate">{isFeriado ? (v.notes?.replace('Feriado Nacional: ', '').replace('Feriado Nacional', 'Feriado EC') || 'Feriado EC') : `Vac: ${getEngineerFullNameNoTitle(eng?.name)}`}</span>
                  </div>
                );
              })}

              {(scheduledTrainings || []).filter(st => prevDateStr >= st.startDate && prevDateStr <= st.endDate).map(st => {
                const eng = engineers.find(e => e.id === st.engineerId);
                return (
                  <div
                    key={`pv-st-${st.id}`}
                    onClick={(e) => { e.stopPropagation(); setInfoScheduledTraining(st); }}
                    className="text-[8.5px] leading-tight p-1 rounded bg-purple-50 hover:bg-purple-100 border border-purple-200 border-l-4 border-l-purple-600 text-purple-950 font-bold truncate flex items-center gap-1 select-none cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
                    title={`Capacitación: ${st.title} (${st.location}) - ${eng?.name || 'Técnico'}`}
                  >
                    <span>🎓</span>
                    <span className="truncate">Cap: {getEngineerFullNameNoTitle(eng?.name)}</span>
                  </div>
                );
              })}

              {/* Contract commitments for prev overflow day */}
              {getContractCommitmentsForDate(prevDateStr).map((commitment, index) => {
                const badgeBg = commitment.isDone 
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 border-l-4 border-l-emerald-600'
                  : commitment.isQc
                  ? 'bg-violet-50/70 border-violet-200 text-violet-955 border-l-4 border-l-violet-600'
                  : 'bg-indigo-50/70 border-indigo-200 text-indigo-950 border-l-4 border-l-indigo-600';
                return (
                  <div
                    key={`pv-con-maint-${commitment.contract.id}-${index}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedContractForDetails(commitment.contract);
                      setIsContractDetailsModalOpen(true);
                    }}
                    className={`text-[8.5px] leading-tight p-1.5 rounded mb-1 text-left border transition-all cursor-pointer font-bold flex flex-col hover:shadow-xs select-none opacity-50 hover:opacity-100 ${badgeBg}`}
                    title={`Contrato: ${commitment.contract.id} - ${commitment.client?.name || ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate max-w-[80px] font-black">{commitment.client?.name || 'Cliente'}</span>
                      <span className="text-[7.5px] scale-95 font-extrabold select-none">
                        {commitment.isDone ? '✅ Hecho' : commitment.isQc ? '📋 QC' : '🛠️ MTO'}
                      </span>
                    </div>
                  </div>
                );
              })}
              {prevDayOrders.map(wo => {
                const eng = engineers.find(e => e.id === wo.engineerId);
                const client = clients.find(c => c.id === wo.clientId || c.name.trim().toLowerCase() === (wo.clientId || '').trim().toLowerCase());
                const clientDisplayName = client ? client.name : (wo.clientId && wo.clientId !== 'fsm_placeholder' ? wo.clientId : 'Cliente');
                const matchedContract = contracts.find(c => 
                  (c.clientId && wo.clientId && c.clientId === wo.clientId) || 
                  (client && c.clientId && c.clientId === client.id) || 
                  (c.equipmentItems && c.equipmentItems.some(eq => {
                    const eqName = (eq?.name || eq?.equipmentName || '').trim().toLowerCase();
                    const woEqName = (wo?.equipmentName || '').trim().toLowerCase();
                    return eqName !== '' && woEqName !== '' && (eqName === woEqName || eqName.includes(woEqName) || woEqName.includes(eqName));
                  }))
                );
                const supportIds = wo.supportEngineerIds && wo.supportEngineerIds.length > 0
                  ? wo.supportEngineerIds
                  : (wo.supportEngineerId ? [wo.supportEngineerId] : []);
                const engColor = eng ? getEngineerColorClasses(eng.id) : null;
                const isWoQc = isWorkOrderQc(wo, contracts);
                const borderLClass = wo.isEquipmentDown
                  ? 'border-l-4 border-l-red-500'
                  : isWoQc
                  ? 'border-l-4 border-l-purple-600'
                  : (engColor ? `border-l-4 ${engColor.borderL}` : '');
                let badgeBg = isWoQc ? 'bg-purple-50 text-purple-955 border border-purple-200' : (wo.type === 'Preventivo' ? 'bg-orange-100/80 text-orange-955 border border-orange-200' : 'bg-yellow-50 text-yellow-955 border border-yellow-150');
                if (wo.isEquipmentDown) badgeBg = 'bg-red-50 text-red-955 border border-red-150';
                else if (wo.status === 'Conciliado') badgeBg = 'bg-emerald-50 text-emerald-955 border border-emerald-150';
                else if (wo.status === 'Reportado') badgeBg = 'bg-indigo-50 text-indigo-955 border border-indigo-150';
                else if (wo.status === 'Realizado') badgeBg = 'bg-blue-50 text-blue-955 border border-blue-150';
                else if (wo.status === 'En Proceso') badgeBg = 'bg-sky-50 text-sky-955 border border-sky-150';
                else if (wo.status === 'Pendiente') badgeBg = isWoQc ? 'bg-purple-50 text-purple-955 border border-purple-200' : (wo.type === 'Preventivo' ? 'bg-orange-100/80 text-orange-955 border border-orange-200' : 'bg-yellow-50 text-yellow-955 border border-yellow-150');
                return (
                  <div
                    key={`pv-wo-${wo.id}`}
                    className={`text-[9.5px] leading-tight p-1.5 rounded mb-1 text-left transition-all font-medium cursor-pointer hover:shadow-sm select-none opacity-45 saturate-50 hover:opacity-100 hover:saturate-100 ${badgeBg} ${borderLClass}`}
                    onClick={e => { e.stopPropagation(); setInfoWO(wo); }}
                    title={`${clientDisplayName} - ${wo.equipmentName}${isWoQc ? ' [Control de Calidad]' : ''}`}
                  >
                    <div className="flex items-center justify-between font-black truncate text-slate-900 leading-none mb-0.5">
                      <span className="truncate">{clientDisplayName}</span>
                      {isWoQc && (
                        <span className="bg-purple-700 text-white font-extrabold text-[7.5px] px-1 py-0.5 rounded shrink-0 ml-1 shadow-2xs border border-purple-800 flex items-center gap-0.5 animate-pulse" title="Visita de Control de Calidad">
                          📋 QC
                        </span>
                      )}
                    </div>
                    {matchedContract && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedContractForDetails(matchedContract);
                          setIsContractDetailsModalOpen(true);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[7.5px] px-1.5 py-0.5 rounded cursor-pointer transition-colors shadow-2xs inline-flex items-center gap-1 my-0.5 no-print"
                        title={`Ver Detalle del Contrato ${matchedContract.id}`}
                      >
                        <span>📜 Contrato: {matchedContract.id}</span>
                      </div>
                    )}
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
                      {userRole === 'admin' && wo.status === 'Pendiente' && !wo.isEquipmentDown ? (
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); onToggleClientConfirmed && onToggleClientConfirmed(wo.id, !wo.clientConfirmed); }}
                          className={`text-[7.5px] font-extrabold px-1.5 py-0.5 rounded border ml-auto cursor-pointer transition-all duration-200 no-print ${
                            wo.clientConfirmed
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                              : wo.type === 'Preventivo'
                              ? 'bg-orange-100 text-orange-800 border-orange-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
                          }`}
                          title={wo.clientConfirmed ? 'Click para marcar como Pendiente' : 'Click para confirmar visita con cliente'}
                        >
                          {wo.clientConfirmed ? '✓ Confirmado' : 'Pendiente'}
                        </button>
                      ) : (
                        <span className={`text-[7.5px] font-extrabold px-1.5 py-0.5 rounded border ml-auto ${
                          wo.isEquipmentDown ? 'bg-red-100 text-red-800 border-red-200'
                          : wo.status === 'Conciliado' ? 'bg-emerald-100/50 text-emerald-805 border-emerald-200'
                          : wo.status === 'Reportado' ? 'bg-indigo-100/50 text-indigo-805 border-indigo-200'
                          : wo.status === 'Realizado' ? 'bg-blue-100/50 text-blue-805 border-blue-200'
                          : wo.status === 'En Proceso' ? 'bg-sky-100/50 text-sky-850 border-sky-200'
                          : wo.type === 'Preventivo' ? 'bg-orange-200/70 text-orange-900 border-orange-300'
                          : 'bg-yellow-100/50 text-yellow-850 border-yellow-200'
                        }`}>{wo.isEquipmentDown ? 'Parado ⚠️' : wo.status}</span>
                      )}
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
      const dayOrders = activeWorkOrdersList.filter(wo => {
        if (filterOnlyConflicting && !conflictingWOIds.has(wo.id)) return false;
        return (!wo.durationDays || wo.durationDays <= 1) && wo.plannedDate === dateStr;
      });
      const dayVacations = (vacations || []).filter(v => {
        return v.status === 'Aprobado' && dateStr >= v.startDate && dateStr <= v.endDate;
      });
      const hasFeriado = dayVacations.some(v => v.engineerId === 'FERIADO' || v.notes?.toLowerCase().includes('feriado'));
      const hasEngineerVacation = dayVacations.some(v => v.engineerId !== 'FERIADO' && !v.notes?.toLowerCase().includes('feriado'));
      const isSelected = selectedDay === day;

      days.push(
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
          onDragEnter={(e) => {
            e.preventDefault();
            (e.currentTarget as HTMLElement).classList.add('bg-indigo-100/70', 'ring-2', 'ring-indigo-400');
          }}
          onDragLeave={(e) => {
            (e.currentTarget as HTMLElement).classList.remove('bg-indigo-100/70', 'ring-2', 'ring-indigo-400');
          }}
          onDrop={(e) => {
            e.preventDefault();
            (e.currentTarget as HTMLElement).classList.remove('bg-indigo-100/70', 'ring-2', 'ring-indigo-400');
            const woId = e.dataTransfer.getData("text/plain");
            if (woId) {
              handleMoveWorkOrder(woId, dateStr);
            }
          }}
          className={`cal-day-cell min-h-[115px] p-2 text-left transition-all flex flex-col justify-between cursor-pointer focus:outline-none ${
            isSelected
              ? 'bg-indigo-50/70 text-slate-900 ring-2 ring-indigo-500'
              : hasFeriado
              ? 'bg-red-50/60 hover:bg-red-50/90 text-slate-900 border-red-200/80'
              : hasEngineerVacation
              ? 'bg-teal-50/40 hover:bg-teal-50/70 text-slate-900 border-teal-200/60'
              : 'bg-white hover:bg-slate-50/60 text-slate-800'
          }`}
        >
          <div className="flex justify-between items-center w-full">
            <span className={`font-mono text-xs font-black transition-all ${
              hasFeriado
                ? 'bg-red-600 text-white font-mono font-black px-1.5 py-0.5 rounded-md text-[11px] shadow-2xs'
                : hasEngineerVacation
                ? 'bg-teal-600 text-white font-mono font-black px-1.5 py-0.5 rounded-md text-[11px] shadow-2xs'
                : 'text-slate-800'
            }`}>{day}</span>
            {dayOrders.length > 0 && (
              <span className="bg-indigo-100 text-indigo-805 font-bold text-[8px] px-1 rounded-full">
                {dayOrders.length}
              </span>
            )}
          </div>
          <div className="space-y-1 w-full mt-1.5 flex-1 overflow-y-auto">
            {dayVacations.map(v => {
              const eng = engineers.find(e => e.id === v.engineerId);
              const isFeriado = v.engineerId === 'FERIADO' || v.notes?.toLowerCase().includes('feriado');
              return (
                <div
                  key={`vac-${v.id}`}
                  className={`text-[9px] leading-tight p-1.5 rounded-md border font-bold truncate flex items-center gap-1.5 select-none transition-transform hover:scale-[1.01] ${
                    isFeriado
                      ? 'bg-red-600 text-white border-red-700 font-black tracking-tight shadow-2xs'
                      : 'bg-teal-50 border-teal-200 border-l-4 border-l-teal-500 text-teal-900 font-bold'
                  }`}
                  title={isFeriado ? `Feriado Ecuador: ${v.notes}` : `Vacaciones: ${eng?.name || 'Técnico'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <span className="text-xs">{isFeriado ? '🇪🇨' : '🌴'}</span>
                  <span className="truncate">{isFeriado ? (v.notes?.replace('Feriado Nacional: ', '').replace('Feriado Nacional', 'Feriado EC') || 'Feriado EC') : `Vac: ${getEngineerFullNameNoTitle(eng?.name)}`}</span>
                </div>
              );
            })}

            {(scheduledTrainings || []).filter(st => dateStr >= st.startDate && dateStr <= st.endDate).map(st => {
              const eng = engineers.find(e => e.id === st.engineerId);
              return (
                <div
                  key={`st-${st.id}`}
                  className="text-[8.5px] leading-tight p-1 rounded bg-purple-50 hover:bg-purple-100 border border-purple-200 border-l-4 border-l-purple-600 text-purple-950 font-bold truncate flex items-center gap-1 select-none cursor-pointer transition-colors"
                  title={`Capacitación: ${st.title} (${st.location}) - ${eng?.name || 'Técnico'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setInfoScheduledTraining(st);
                  }}
                >
                  <span>🎓</span>
                  <span className="truncate">Cap: {getEngineerFullNameNoTitle(eng?.name)}</span>
                </div>
              );
            })}

            {/* Contract commitments for current day */}
            {getContractCommitmentsForDate(dateStr).map((commitment, index) => {
              const badgeBg = commitment.isDone 
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-955 border-l-4 border-l-emerald-600'
                : commitment.isQc
                ? 'bg-violet-50/70 border-violet-200 text-violet-955 border-l-4 border-l-violet-600'
                : 'bg-indigo-50/70 border-indigo-200 text-indigo-950 border-l-4 border-l-indigo-600';
              return (
                <div
                  key={`con-maint-${commitment.contract.id}-${index}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedContractForDetails(commitment.contract);
                    setIsContractDetailsModalOpen(true);
                  }}
                  className={`text-[8.5px] leading-tight p-1.5 rounded mb-1 text-left border transition-all cursor-pointer font-bold flex flex-col hover:shadow-xs select-none ${badgeBg}`}
                  title={`Contrato: ${commitment.contract.id} - ${commitment.client?.name || ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate max-w-[80px] font-black">{commitment.client?.name || 'Cliente'}</span>
                    <span className="text-[7.5px] scale-95 font-extrabold select-none">
                      {commitment.isDone ? '✅ Hecho' : commitment.isQc ? '📋 QC' : '🛠️ MTO'}
                    </span>
                  </div>
                </div>
              );
            })}
            {dayOrders.map(wo => {
              const eng = engineers.find(e => e.id === wo.engineerId);
              const supportEng = wo.supportEngineerId ? engineers.find(e => e.id === wo.supportEngineerId) : null;
              const client = clients.find(c => c.id === wo.clientId || c.name.trim().toLowerCase() === (wo.clientId || '').trim().toLowerCase());
              const clientDisplayName = client ? client.name : (wo.clientId && wo.clientId !== 'fsm_placeholder' ? wo.clientId : 'Cliente');
              const matchedContract = contracts.find(c => 
                (c.clientId && wo.clientId && c.clientId === wo.clientId) || 
                (client && c.clientId && c.clientId === client.id) || 
                (c.equipmentItems && c.equipmentItems.some(eq => {
                  const eqName = (eq?.name || eq?.equipmentName || '').trim().toLowerCase();
                  const woEqName = (wo?.equipmentName || '').trim().toLowerCase();
                  return eqName !== '' && woEqName !== '' && (eqName === woEqName || eqName.includes(woEqName) || woEqName.includes(eqName));
                }))
              );
              const isWoQc = isWorkOrderQc(wo, contracts);
              let badgeBg = isWoQc
                ? 'bg-purple-50/90 hover:bg-purple-100 text-purple-955 border border-purple-200'
                : (wo.type === 'Preventivo'
                ? 'bg-orange-100/80 hover:bg-orange-100 text-orange-955 border border-orange-200'
                : 'bg-yellow-50 hover:bg-yellow-100 text-yellow-955 border border-yellow-150');
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
                badgeBg = isWoQc
                  ? 'bg-purple-50/90 hover:bg-purple-100 text-purple-955 border border-purple-200'
                  : (wo.type === 'Preventivo'
                  ? 'bg-orange-100/80 hover:bg-orange-100 text-orange-955 border border-orange-200'
                  : 'bg-yellow-50 hover:bg-yellow-100 text-yellow-955 border border-yellow-150');
              }

              const matchesQuery = searchQuery ? matchesSearch(wo) : true;
              const matchesEng = highlightedEngineerId
                ? (wo.engineerId === highlightedEngineerId || wo.supportEngineerId === highlightedEngineerId || wo.supportEngineerIds?.includes(highlightedEngineerId))
                : true;
              const matchesConflict = filterOnlyConflicting ? conflictingWOIds.has(wo.id) : true;

              const isHighlighted = matchesQuery && matchesEng && matchesConflict;
              const hasHighlightActive = !!highlightedEngineerId || !!searchQuery || filterOnlyConflicting;

              const conflictDetail = getWoConflictDetails(wo);
              const isConflicting = conflictingWOIds.has(wo.id) || !!conflictDetail;
              const isReassigned = reassignedWOIds.has(wo.id);

              const engColor = eng ? getEngineerColorClasses(eng.id) : null;
              const borderLClass = wo.isEquipmentDown
                ? 'border-l-4 border-l-red-500'
                : isWoQc
                ? 'border-l-4 border-l-purple-600'
                : (engColor ? `border-l-4 ${engColor.borderL}` : '');
              let cardStyle = `${badgeBg} ${borderLClass}`;
              let ringStyle = '';

              if (isConflicting) {
                if (conflictDetail?.type === 'vacation' || conflictDetail?.type === 'feriado') {
                  cardStyle += ' border-2 border-red-600 bg-red-50/95';
                  ringStyle += ' ring-2 ring-red-500 shadow-md animate-pulse z-10';
                } else {
                  cardStyle += ' border-2 border-amber-500 bg-amber-50/95';
                  ringStyle += ' ring-2 ring-amber-500 shadow-md animate-pulse z-10';
                }
              }

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
                  title={`${clientDisplayName} - ${wo.equipmentName} ${wo.plannedTime ? `(${wo.plannedTime})` : ''} (${eng?.name || ''}${supportNamesStr ? ` [Apoyo: ${supportNamesStr}]` : ''})${isWoQc ? ' [Control de Calidad]' : ''}${conflictDetail ? ` - ⚠️ ${conflictDetail.label}` : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setInfoWO(wo);
                  }}
                >
                  <div className="flex items-center justify-between font-black truncate text-slate-900 leading-none mb-0.5">
                    <span className="truncate">{clientDisplayName}</span>
                    {isWoQc && (
                      <span className="bg-purple-700 text-white font-extrabold text-[7.5px] px-1 py-0.5 rounded shrink-0 ml-1 shadow-2xs border border-purple-800 flex items-center gap-0.5 animate-pulse" title="Visita de Control de Calidad">
                        📋 QC
                      </span>
                    )}
                    {conflictDetail && (
                      <span className={`font-extrabold text-[7.5px] px-1 py-0.5 rounded animate-pulse shrink-0 ml-1 ${
                        conflictDetail.type === 'vacation' || conflictDetail.type === 'feriado'
                          ? 'bg-red-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}>
                        ⚠️ {conflictDetail.type === 'vacation' ? 'VACACIONES' : conflictDetail.type === 'feriado' ? 'FERIADO' : 'CRUZADO'}
                      </span>
                    )}
                    {isReassigned && !conflictDetail && (
                      <span className="bg-purple-600 text-white font-extrabold text-[7.5px] px-1 py-0.5 rounded shrink-0 ml-1">
                        ✨ REASIGNADO
                      </span>
                    )}
                  </div>
                  {matchedContract && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedContractForDetails(matchedContract);
                        setIsContractDetailsModalOpen(true);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[7.5px] px-1.5 py-0.5 rounded cursor-pointer transition-colors shadow-2xs inline-flex items-center gap-1 my-0.5 no-print"
                      title={`Ver Detalle del Contrato ${matchedContract.id}`}
                    >
                      <span>📜 Contrato: {matchedContract.id}</span>
                    </div>
                  )}
                  {wo.plannedTime && (
                    <p className="text-indigo-700 text-[8px] font-bold mt-0.5 leading-none">
                      ⏰ {wo.plannedTime}
                    </p>
                  )}
                  <p className="truncate text-slate-700 text-[8.5px] font-normal mt-0.5">{wo.equipmentName}</p>
                  <p className="truncate text-indigo-900 text-[7.5px] font-bold mt-0.5 flex items-center gap-0.5">
                    <span className="mr-0.5">{eng ? getEngineerEmoji(eng.id) : '👤'}</span>
                    <span>{getEngineerFullNameNoTitle(eng?.name) || 'Sin Asignar'}</span>
                    {supportIds.length > 0 && (
                      <span className="flex items-center gap-1 ml-1 flex-wrap">
                        {supportIds.map(id => {
                          const sEng = engineers.find(e => e.id === id);
                          if (!sEng) return null;
                          return (
                            <span key={id} className="flex items-center gap-0.5">
                              <span>+ {getEngineerEmoji(sEng.id)}</span>
                              <span>{getEngineerFullNameNoTitle(sEng.name)}</span>
                            </span>
                          );
                        })}
                      </span>
                    )}
                  </p>

                  {/* Status Indicator */}
                  <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-200/40">
                    <span className="text-[7.5px] text-slate-450 font-bold tracking-tight select-none no-print">Detalles / Editar</span>
                    {userRole === 'admin' && wo.status === 'Pendiente' && !wo.isEquipmentDown ? (
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); onToggleClientConfirmed && onToggleClientConfirmed(wo.id, !wo.clientConfirmed); }}
                        className={`text-[7.5px] font-extrabold px-1.5 py-0.5 rounded border ml-auto cursor-pointer transition-all duration-200 no-print print:ml-auto ${
                          wo.clientConfirmed
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                            : wo.type === 'Preventivo'
                            ? 'bg-orange-100 text-orange-800 border-orange-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
                        }`}
                        title={wo.clientConfirmed ? 'Click para marcar como Pendiente' : 'Click para confirmar visita con cliente'}
                      >
                        {wo.clientConfirmed ? '✓ Confirmado' : 'Pendiente'}
                      </button>
                    ) : (
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
                          : wo.type === 'Preventivo'
                          ? 'bg-orange-200/70 text-orange-900 border-orange-300'
                          : 'bg-yellow-100/50 text-yellow-850 border-yellow-200'
                      }`}>
                        {wo.isEquipmentDown ? 'Parado ⚠️' : wo.status}
                      </span>
                    )}
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
        const nextDayOrders = activeWorkOrdersList.filter(wo =>
          (!wo.durationDays || wo.durationDays <= 1) && wo.plannedDate === nextDateStr
        );
        const nextDayVacations = (vacations || []).filter(v =>
          v.status === 'Aprobado' && nextDateStr >= v.startDate && nextDateStr <= v.endDate
        );

        days.push(
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
            className="cal-day-cell min-h-[115px] p-2 bg-slate-100/70 border border-dashed border-slate-200/80 flex flex-col justify-between cursor-pointer hover:bg-indigo-50/30 transition-colors opacity-75 hover:opacity-100"
          >
            <div className="flex justify-between items-center w-full">
              <span className="font-mono text-xs font-black text-slate-400 opacity-60">{n}</span>
              {nextDayOrders.length > 0 && (
                <span className="bg-slate-200 text-slate-500 font-bold text-[8px] px-1 rounded-full opacity-60">
                  {nextDayOrders.length}
                </span>
              )}
            </div>
            <div className="space-y-1 w-full mt-1.5 flex-1 overflow-y-auto">
              {nextDayVacations.map(v => {
                const eng = engineers.find(e => e.id === v.engineerId);
                const isFeriado = v.engineerId === 'FERIADO' || v.notes?.toLowerCase().includes('feriado');
                return (
                  <div
                    key={`nv-vac-${v.id}`}
                    className={`text-[8.5px] leading-tight p-1 rounded font-bold truncate flex items-center gap-1 select-none opacity-50 hover:opacity-100 transition-opacity ${
                      isFeriado
                        ? 'bg-red-600 text-white border border-red-700 font-black'
                        : 'bg-teal-50 border-teal-200 border-l-4 border-l-teal-500 text-teal-900'
                    }`}
                    title={isFeriado ? `Feriado Ecuador: ${v.notes}` : `Vacaciones: ${eng?.name || 'Técnico'}`}
                  >
                    <span>{isFeriado ? '🇪🇨' : '🌴'}</span>
                    <span className="truncate">{isFeriado ? (v.notes?.replace('Feriado Nacional: ', '').replace('Feriado Nacional', 'Feriado EC') || 'Feriado EC') : `Vac: ${eng?.name?.replace('Ing. ', '').split(' ')[0]}`}</span>
                  </div>
                );
              })}

              {/* Contract commitments for next overflow day */}
              {getContractCommitmentsForDate(nextDateStr).map((commitment, index) => {
                const badgeBg = commitment.isDone 
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-955 border-l-4 border-l-emerald-600'
                  : commitment.isQc
                  ? 'bg-violet-50/70 border-violet-200 text-violet-955 border-l-4 border-l-violet-600'
                  : 'bg-indigo-50/70 border-indigo-200 text-indigo-950 border-l-4 border-l-indigo-600';
                return (
                  <div
                    key={`nv-con-maint-${commitment.contract.id}-${index}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedContractForDetails(commitment.contract);
                      setIsContractDetailsModalOpen(true);
                    }}
                    className={`text-[8.5px] leading-tight p-1.5 rounded mb-1 text-left border transition-all cursor-pointer font-bold flex flex-col hover:shadow-xs select-none opacity-50 hover:opacity-100 ${badgeBg}`}
                    title={`Contrato: ${commitment.contract.id} - ${commitment.client?.name || ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate max-w-[80px] font-black">{commitment.client?.name || 'Cliente'}</span>
                      <span className="text-[7.5px] scale-95 font-extrabold select-none">
                        {commitment.isDone ? '✅ Hecho' : commitment.isQc ? '📋 QC' : '🛠️ MTO'}
                      </span>
                    </div>
                  </div>
                );
              })}
              {nextDayOrders.map(wo => {
                const eng = engineers.find(e => e.id === wo.engineerId);
                const client = clients.find(c => c.id === wo.clientId || c.name.trim().toLowerCase() === (wo.clientId || '').trim().toLowerCase());
                const clientDisplayName = client ? client.name : (wo.clientId && wo.clientId !== 'fsm_placeholder' ? wo.clientId : 'Cliente');
                const matchedContract = contracts.find(c => 
                  (c.clientId && wo.clientId && c.clientId === wo.clientId) || 
                  (client && c.clientId && c.clientId === client.id) || 
                  (c.equipmentItems && c.equipmentItems.some(eq => {
                    const eqName = (eq?.name || eq?.equipmentName || '').trim().toLowerCase();
                    const woEqName = (wo?.equipmentName || '').trim().toLowerCase();
                    return eqName !== '' && woEqName !== '' && (eqName === woEqName || eqName.includes(woEqName) || woEqName.includes(eqName));
                  }))
                );
                const supportIds = wo.supportEngineerIds && wo.supportEngineerIds.length > 0
                  ? wo.supportEngineerIds
                  : (wo.supportEngineerId ? [wo.supportEngineerId] : []);
                const engColor = eng ? getEngineerColorClasses(eng.id) : null;
                const isWoQc = isWorkOrderQc(wo, contracts);
                const borderLClass = wo.isEquipmentDown
                  ? 'border-l-4 border-l-red-500'
                  : isWoQc
                  ? 'border-l-4 border-l-purple-600'
                  : (engColor ? `border-l-4 ${engColor.borderL}` : '');
                let badgeBg = isWoQc ? 'bg-purple-50 text-purple-955 border border-purple-200' : (wo.type === 'Preventivo' ? 'bg-orange-100/80 text-orange-955 border border-orange-200' : 'bg-yellow-50 text-yellow-955 border border-yellow-150');
                if (wo.isEquipmentDown) badgeBg = 'bg-red-50 text-red-955 border border-red-150';
                else if (wo.status === 'Conciliado') badgeBg = 'bg-emerald-50 text-emerald-955 border border-emerald-150';
                else if (wo.status === 'Reportado') badgeBg = 'bg-indigo-50 text-indigo-955 border border-indigo-150';
                else if (wo.status === 'Realizado') badgeBg = 'bg-blue-50 text-blue-955 border border-blue-150';
                else if (wo.status === 'En Proceso') badgeBg = 'bg-sky-50 text-sky-955 border border-sky-150';
                else if (wo.status === 'Pendiente') badgeBg = isWoQc ? 'bg-purple-50 text-purple-955 border border-purple-200' : (wo.type === 'Preventivo' ? 'bg-orange-100/80 text-orange-955 border border-orange-200' : 'bg-yellow-50 text-yellow-955 border border-yellow-150');
                return (
                  <div
                    key={`nv-wo-${wo.id}`}
                    className={`text-[9.5px] leading-tight p-1.5 rounded mb-1 text-left transition-all font-medium cursor-pointer hover:shadow-sm select-none opacity-45 saturate-50 hover:opacity-100 hover:saturate-100 ${badgeBg} ${borderLClass}`}
                    onClick={e => { e.stopPropagation(); setInfoWO(wo); }}
                    title={`${clientDisplayName} - ${wo.equipmentName}${isWoQc ? ' [Control de Calidad]' : ''}`}
                  >
                    <div className="flex items-center justify-between font-black truncate text-slate-900 leading-none mb-0.5">
                      <span className="truncate">{clientDisplayName}</span>
                      {isWoQc && (
                        <span className="bg-purple-700 text-white font-extrabold text-[7.5px] px-1 py-0.5 rounded shrink-0 ml-1 shadow-2xs border border-purple-800 flex items-center gap-0.5 animate-pulse" title="Visita de Control de Calidad">
                          📋 QC
                        </span>
                      )}
                    </div>
                    {matchedContract && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedContractForDetails(matchedContract);
                          setIsContractDetailsModalOpen(true);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[7.5px] px-1.5 py-0.5 rounded cursor-pointer transition-colors shadow-2xs inline-flex items-center gap-1 my-0.5 no-print"
                        title={`Ver Detalle del Contrato ${matchedContract.id}`}
                      >
                        <span>📜 Contrato: {matchedContract.id}</span>
                      </div>
                    )}
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
                      {userRole === 'admin' && wo.status === 'Pendiente' && !wo.isEquipmentDown ? (
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); onToggleClientConfirmed && onToggleClientConfirmed(wo.id, !wo.clientConfirmed); }}
                          className={`text-[7.5px] font-extrabold px-1.5 py-0.5 rounded border ml-auto cursor-pointer transition-all duration-200 no-print ${
                            wo.clientConfirmed
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                              : wo.type === 'Preventivo'
                              ? 'bg-orange-100 text-orange-800 border-orange-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
                          }`}
                          title={wo.clientConfirmed ? 'Click para marcar como Pendiente' : 'Click para confirmar visita con cliente'}
                        >
                          {wo.clientConfirmed ? '✓ Confirmado' : 'Pendiente'}
                        </button>
                      ) : (
                        <span className={`text-[7.5px] font-extrabold px-1.5 py-0.5 rounded border ml-auto ${
                          wo.isEquipmentDown ? 'bg-red-100 text-red-800 border-red-200'
                          : wo.status === 'Conciliado' ? 'bg-emerald-100/50 text-emerald-805 border-emerald-200'
                          : wo.status === 'Reportado' ? 'bg-indigo-100/50 text-indigo-805 border-indigo-200'
                          : wo.status === 'Realizado' ? 'bg-blue-100/50 text-blue-805 border-blue-200'
                          : wo.status === 'En Proceso' ? 'bg-sky-100/50 text-sky-850 border-sky-200'
                          : wo.type === 'Preventivo' ? 'bg-orange-200/70 text-orange-900 border-orange-300'
                          : 'bg-yellow-100/50 text-yellow-850 border-yellow-200'
                        }`}>{wo.isEquipmentDown ? 'Parado ⚠️' : wo.status}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
    }

    return days;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkOrdersList, calendarMonth, calendarYear, contracts, clients, engineers, workOrders, vacations, scheduledTrainings, conflictingWOIds, reassignedWOIds, highlightedEngineerId, searchQuery, filterOnlyConflicting, userRole, onToggleClientConfirmed]);

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

  // Helper to determine true effective status for a Work Order considering reports and registries
  const getWOEffectiveStatus = React.useCallback((wo: WorkOrder): WorkOrderStatus => {
    if (wo.status === 'Realizado' || wo.status === 'Conciliado' || wo.status === 'Reportado' || wo.status === 'En Proceso') {
      return wo.status;
    }
    const hasReport = (reports || []).some(r => r.workOrderId === wo.id);
    const hasRegistry = (maintenanceRegistries || []).some(reg => reg.workOrderId === wo.id);
    if (hasReport) return 'Reportado';
    if (hasRegistry) return 'Realizado';
    return wo.status;
  }, [reports, maintenanceRegistries]);

  // Utility helpers for time range parsing and hours calculation
  const parseSingleTimeMinutes = (str: string): number | null => {
    if (!str) return null;
    const clean = str.trim().toUpperCase();
    const isPM = clean.includes('PM');
    const isAM = clean.includes('AM');
    const timeOnly = clean.replace(/(AM|PM)/g, '').trim();
    const parts = timeOnly.split(':').map(p => parseInt(p.trim(), 10));

    if (parts.length < 1 || isNaN(parts[0])) return null;

    let hours = parts[0];
    const minutes = parts.length > 1 && !isNaN(parts[1]) ? parts[1] : 0;

    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  const parseTimeRangeToHours = (plannedTimeStr?: string): number | null => {
    if (!plannedTimeStr || !plannedTimeStr.includes('-')) return null;

    const parts = plannedTimeStr.split('-');
    if (parts.length !== 2) return null;

    const startMins = parseSingleTimeMinutes(parts[0]);
    const endMins = parseSingleTimeMinutes(parts[1]);

    if (startMins === null || endMins === null) return null;

    let diffMins = endMins - startMins;
    if (diffMins <= 0) {
      diffMins += 12 * 60;
    }

    if (diffMins > 0 && diffMins <= 16 * 60) {
      return Number((diffMins / 60).toFixed(1));
    }

    return null;
  };

  const isInstallationWO = (wo: WorkOrder): boolean => {
    const typeLower = (wo.type || '').toLowerCase().trim();
    return typeLower === 'instalación' || typeLower === 'instalacion' || typeLower.startsWith('instal');
  };

  const getWOScheduledHours = (wo: WorkOrder, matchedReport?: TechnicalReport): number => {
    if (matchedReport && matchedReport.hoursSpent) {
      const parsed = parseFloat(String(matchedReport.hoursSpent).replace(/[^0-9.]/g, ''));
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    
    const agendaHours = parseTimeRangeToHours(wo.plannedTime);
    if (agendaHours !== null && agendaHours > 0) {
      return agendaHours;
    }

    if (isInstallationWO(wo) || (wo.durationDays && wo.durationDays > 1)) {
      return (wo.durationDays && wo.durationDays > 0 ? wo.durationDays : 1) * 8;
    }

    return 3;
  };

  const getWOClientDisplayName = React.useCallback((wo: WorkOrder): string => {
    if (!wo) return 'Cliente';
    const found = (clients || []).find(c => c.id === wo.clientId);
    if (found && found.name) return found.name;
    if (wo.clientName && wo.clientName.trim() && !wo.clientName.startsWith('cli-')) return wo.clientName;
    if (wo.location && wo.location.trim()) return wo.location;
    if (wo.siteName && wo.siteName.trim()) return wo.siteName;
    return wo.clientName || wo.clientId || 'Cliente';
  }, [clients]);

  // Compute workload metrics and status breakdowns per engineer for the selected period
  const engineerStats = React.useMemo(() => {
    const statsMap: Record<string, {
      engineer: Engineer;
      total: number;
      asPrimary: number;
      asSupport: number;
      hoursSpent: number;
      installationsCount: number;
      installationDays: number;
      preventiveCount: number;
      correctiveCount: number;
      statusCounts: Record<WorkOrderStatus, number>;
    }> = {};

    const activeEngineers = engineers.filter(e => !excludedEngIds.includes(e.id));

    activeEngineers.forEach(e => {
      statsMap[e.id] = {
        engineer: e,
        total: 0,
        asPrimary: 0,
        asSupport: 0,
        hoursSpent: 0,
        installationsCount: 0,
        installationDays: 0,
        preventiveCount: 0,
        correctiveCount: 0,
        statusCounts: {
          Pendiente: 0,
          'En Proceso': 0,
          Realizado: 0,
          Reportado: 0,
          Conciliado: 0
        }
      };
    });

    const reportsList = reports || [];

    filteredDashOrders.forEach(wo => {
      const effStatus = getWOEffectiveStatus(wo);
      const matchedReport = reportsList.find(r => r.workOrderId === wo.id);
      const scheduledHours = getWOScheduledHours(wo, matchedReport);
      const isInstallation = isInstallationWO(wo);
      const duration = wo.durationDays && wo.durationDays > 0 ? wo.durationDays : 1;

      if (statsMap[wo.engineerId]) {
        statsMap[wo.engineerId].total++;
        statsMap[wo.engineerId].asPrimary++;
        statsMap[wo.engineerId].statusCounts[effStatus]++;
        statsMap[wo.engineerId].hoursSpent += scheduledHours;
        if (wo.type === 'Preventivo') statsMap[wo.engineerId].preventiveCount++;
        if (wo.type === 'Correctivo') statsMap[wo.engineerId].correctiveCount++;
      }
      const supportIds = wo.supportEngineerIds && wo.supportEngineerIds.length > 0
        ? wo.supportEngineerIds
        : (wo.supportEngineerId ? [wo.supportEngineerId] : []);
      supportIds.forEach(id => {
        if (statsMap[id]) {
          statsMap[id].total++;
          statsMap[id].asSupport++;
          statsMap[id].statusCounts[effStatus]++;
          statsMap[id].hoursSpent += scheduledHours;
          if (wo.type === 'Preventivo') statsMap[id].preventiveCount++;
          if (wo.type === 'Correctivo') statsMap[id].correctiveCount++;
        }
      });
    });

    // Deduplicate unique installation projects per engineer
    activeEngineers.forEach(e => {
      const engInstWOs = filteredDashOrders.filter(wo => 
        isInstallationWO(wo) && (wo.engineerId === e.id || wo.supportEngineerId === e.id || wo.supportEngineerIds?.includes(e.id))
      );

      const engInstGroups: Record<string, WorkOrder[]> = {};
      engInstWOs.forEach(wo => {
        const cleanId = (wo.id || '').split('_')[0].split('-').slice(0, 3).join('-').trim().toLowerCase();
        const clientNameResolved = getWOClientDisplayName(wo);
        const clientKey = clientNameResolved.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        const equipKey = (wo.equipmentName || '').trim().toLowerCase().replace(/- día \d+/gi, '').replace(/[^a-z0-9]/g, '');
        const key = cleanId && cleanId.length > 5 ? cleanId : `${clientKey}___${equipKey}`;

        if (!engInstGroups[key]) engInstGroups[key] = [];
        engInstGroups[key].push(wo);
      });

      if (statsMap[e.id]) {
        statsMap[e.id].installationsCount = Object.keys(engInstGroups).length;
        let days = 0;
        Object.values(engInstGroups).forEach(group => {
          const maxDur = Math.max(...group.map(w => w.durationDays || 1));
          const distinctDates = new Set(group.map(w => w.plannedDate)).size;
          days += Math.max(maxDur, distinctDates);
        });
        statsMap[e.id].installationDays = days;
      }
    });

    return Object.values(statsMap).sort((a, b) => b.total - a.total);
  }, [filteredDashOrders, engineers, reports, getWOEffectiveStatus, excludedEngIds]);

  // Calculate overall summary metrics with detailed hours & installation project days
  const dashboardKPIs = React.useMemo(() => {
    const totalOrders = filteredDashOrders.length;
    const activeEngineersCount = engineers.length - excludedEngIds.length;
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
    let totalReportHours = 0;
    let totalInstallationCount = 0;
    let totalInstallationDays = 0;
    let totalPreventiveCount = 0;
    let totalCorrectiveCount = 0;
    let totalInspectionCount = 0;

    const installationGroups: Record<string, WorkOrder[]> = {};

    filteredDashOrders.forEach(wo => {
      const effStatus = getWOEffectiveStatus(wo);
      if (effStatus === 'Realizado' || effStatus === 'Reportado' || effStatus === 'Conciliado') {
        completedCount++;
      }

      const matchedReport = (reports || []).find(r => r.workOrderId === wo.id);
      const scheduledHours = getWOScheduledHours(wo, matchedReport);
      totalReportHours += scheduledHours;

      if (isInstallationWO(wo)) {
        const cleanId = (wo.id || '').split('_')[0].split('-').slice(0, 3).join('-').trim().toLowerCase();
        const clientNameResolved = getWOClientDisplayName(wo);
        const clientKey = clientNameResolved.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        const equipKey = (wo.equipmentName || '').trim().toLowerCase().replace(/- día \d+/gi, '').replace(/[^a-z0-9]/g, '');
        const key = cleanId && cleanId.length > 5 ? cleanId : `${clientKey}___${equipKey}`;

        if (!installationGroups[key]) installationGroups[key] = [];
        installationGroups[key].push(wo);
      } else if (wo.type === 'Preventivo') {
        totalPreventiveCount++;
      } else if (wo.type === 'Correctivo') {
        totalCorrectiveCount++;
      } else if (wo.type === 'Inspección') {
        totalInspectionCount++;
      }
    });

    totalInstallationCount = Object.keys(installationGroups).length;
    totalInstallationDays = 0;
    Object.values(installationGroups).forEach(groupWOs => {
      const maxDur = Math.max(...groupWOs.map(w => w.durationDays || 1));
      const distinctDates = new Set(groupWOs.map(w => w.plannedDate)).size;
      totalInstallationDays += Math.max(maxDur, distinctDates);
    });

    const complianceRate = totalOrders > 0 ? Math.round((completedCount / totalOrders) * 100) : 0;
    const avgHoursPerEngineer = activeEngineersCount > 0 ? Number((totalReportHours / activeEngineersCount).toFixed(1)) : 0;

    return {
      totalOrders,
      averageJobs,
      topEngineerName: maxJobs > 0 ? `${topEngineerName.replace('Ing. ', '')} (${maxJobs})` : 'Ninguno',
      complianceRate,
      totalReportHours: Number(totalReportHours.toFixed(1)),
      totalInstallationCount,
      totalInstallationDays,
      totalPreventiveCount,
      totalCorrectiveCount,
      totalInspectionCount,
      avgHoursPerEngineer
    };
  }, [filteredDashOrders, engineerStats, engineers, reports, getWOEffectiveStatus, excludedEngIds]);

  const handlePrintMainDashboard = () => {
    const periodTitle = dashPeriod === 'month' 
      ? `Mes: ${monthsList[dashMonth - 1]} ${dashYear}`
      : dashPeriod === 'semester'
        ? `${dashSemester}º Semestre ${dashYear}`
        : `Año ${dashYear}`;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Informe Ejecutivo de Rendimiento y Carga de Trabajo - ORIMEC</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #0f172a; font-size: 11px; line-height: 1.4; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px; }
            .logo { font-size: 20px; font-weight: 900; color: #2563eb; letter-spacing: 0.5px; }
            .subtitle { font-size: 10px; color: #64748b; font-weight: bold; }
            .title { font-size: 14px; font-weight: bold; text-transform: uppercase; color: #0f172a; margin-top: 4px; }
            .section-title { font-size: 12px; font-weight: bold; background: #f1f5f9; padding: 6px 10px; border-left: 4px solid #2563eb; margin: 18px 0 10px 0; text-transform: uppercase; border-radius: 0 4px 4px 0; }
            .kpi-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-bottom: 15px; }
            .kpi-card { border: 1px solid #cbd5e1; padding: 10px 6px; border-radius: 8px; text-align: center; background: #f8fafc; }
            .kpi-val { font-size: 16px; font-weight: 900; color: #1e293b; margin-top: 4px; }
            .kpi-label { font-size: 8.5px; color: #64748b; font-weight: bold; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 10px; }
            th { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 7px; text-align: left; font-weight: bold; }
            td { border: 1px solid #cbd5e1; padding: 7px; }
            .badge-pending { background: #fef3c7; color: #92400e; font-weight: bold; padding: 2px 6px; border-radius: 4px; }
            .badge-ok { background: #dcfce7; color: #166534; font-weight: bold; padding: 2px 6px; border-radius: 4px; }
            .signatures { display: flex; justify-content: space-between; margin-top: 45px; }
            .sig-box { width: 42%; text-align: center; border-top: 1.5px solid #64748b; padding-top: 8px; font-weight: bold; font-size: 11px; }
            @media print { body { padding: 15px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">ORIMEC - GESTIÓN TÉCNICA</div>
              <div class="subtitle">SISTEMA INTEGRAL DE MANTENIMIENTO Y BIOMÉDICA</div>
              <div class="title">Informe Ejecutivo de Rendimiento y Carga de Trabajo</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 12px; font-weight: 900; color: #2563eb;">PERIODO: ${periodTitle}</div>
              <div style="margin-top: 5px; font-size: 9px; color: #64748b; font-weight: bold;">Fecha: ${new Date().toLocaleDateString('es-EC')}</div>
            </div>
          </div>

          <div class="section-title">1. Resumen Ejecutivo de Métricas Globales</div>
          <div class="kpi-grid">
            <div class="kpi-card"><div class="kpi-label">Total Órdenes</div><div class="kpi-val">${dashboardKPIs.totalOrders}</div></div>
            <div class="kpi-card"><div class="kpi-label">Horas Campo</div><div class="kpi-val" style="color: #2563eb;">${dashboardKPIs.totalReportHours} hrs</div></div>
            <div class="kpi-card"><div class="kpi-label">Instalaciones</div><div class="kpi-val" style="color: #059669;">${dashboardKPIs.totalInstallationCount} (${dashboardKPIs.totalInstallationDays} días)</div></div>
            <div class="kpi-card"><div class="kpi-label">Prom. Tareas/Técnico</div><div class="kpi-val">${dashboardKPIs.averageJobs}</div></div>
            <div class="kpi-card"><div class="kpi-label">Tasa de Cierre</div><div class="kpi-val" style="color: #16a34a;">${dashboardKPIs.complianceRate}%</div></div>
            <div class="kpi-card"><div class="kpi-label">Técnico Destacado</div><div class="kpi-val" style="font-size: 10px;">${dashboardKPIs.topEngineerName}</div></div>
          </div>

          <div class="section-title">2. Desglose Minucioso de Productividad y Horas por Ingeniero</div>
          <table>
            <thead>
              <tr>
                <th>Ingeniero</th>
                <th>Especialidad / Sede</th>
                <th>Total Tareas</th>
                <th>Principal / Apoyo</th>
                <th>Horas Campo</th>
                <th>Instalaciones (Días)</th>
                <th>Preventivos / Correctivos</th>
                <th>Tasa Cierre</th>
              </tr>
            </thead>
            <tbody>
              ${engineerStats.map(st => {
                const totalCompleted = st.statusCounts.Conciliado + st.statusCounts.Realizado + st.statusCounts.Reportado;
                const rate = st.total > 0 ? Math.round((totalCompleted / st.total) * 100) : 0;
                return `
                  <tr>
                    <td><strong>${st.engineer.name}</strong></td>
                    <td>${st.engineer.specialty} • ${st.engineer.sede || 'Quito'}</td>
                    <td><strong>${st.total}</strong></td>
                    <td>${st.asPrimary} Pr. / ${st.asSupport} Ap.</td>
                    <td><strong>${st.hoursSpent} hrs</strong></td>
                    <td>${st.installationDays} días (${st.installationDays * 8}h laborables)</td>
                    <td>${st.preventiveCount} Prev / ${st.correctiveCount} Corr</td>
                    <td><span class="${rate >= 80 ? 'badge-ok' : 'badge-pending'}">${rate}%</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="signatures">
            <div class="sig-box">Jefatura de Operaciones y Servicios Biomédicos<br/><span style="font-size: 9px; color: #64748b; font-weight: normal;">Supervisión Técnica</span></div>
            <div class="sig-box">Gerencia Técnica de ORIMEC<br/><span style="font-size: 9px; color: #64748b; font-weight: normal;">Aprobación y Certificación</span></div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 600);
  };

  const handleExportDashboardCSV = () => {
    const headers = [
      'Nombre',
      'Especialidad',
      'Sede',
      'Mantenimientos Totales',
      'Como Principal',
      'Como Apoyo',
      'Conciliados',
      'Realizados',
      'Reportados',
      'En Proceso',
      'Pendientes'
    ];

    const rows = engineerStats.map(st => [
      st.engineer.name,
      st.engineer.specialty,
      st.engineer.sede || 'N/D',
      st.total,
      st.asPrimary,
      st.asSupport,
      st.statusCounts.Conciliado,
      st.statusCounts.Realizado,
      st.statusCounts.Reportado,
      st.statusCounts['En Proceso'],
      st.statusCounts.Pendiente
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(';'))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const periodName = dashPeriod === 'month' 
      ? monthsList[dashMonth - 1] 
      : dashPeriod === 'semester' 
      ? `Semestre_${dashSemester}` 
      : 'Anual';
      
    link.setAttribute('download', `Metricas_Ingenieros_${periodName}_${dashYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintEngineerMetricsOnly = (eng: Engineer) => {
    const stats = engineerStats.find(s => s.engineer.id === eng.id);
    const engOrders = filteredDashOrders.filter(wo => 
      wo.engineerId === eng.id || 
      (wo.supportEngineerIds && wo.supportEngineerIds.includes(eng.id)) ||
      wo.supportEngineerId === eng.id
    );
    const pendingOrders = engOrders.filter(wo => getWOEffectiveStatus(wo) === 'Pendiente');

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Informe de Métricas y Productividad - ${eng.name}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #0f172a; font-size: 11px; line-height: 1.4; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px; }
            .logo { font-size: 20px; font-weight: 900; color: #2563eb; letter-spacing: 0.5px; }
            .subtitle { font-size: 10px; color: #64748b; font-weight: bold; }
            .title { font-size: 14px; font-weight: bold; text-transform: uppercase; color: #0f172a; margin-top: 4px; }
            .section-title { font-size: 12px; font-weight: bold; background: #f1f5f9; padding: 6px 10px; border-left: 4px solid #2563eb; margin: 18px 0 10px 0; text-transform: uppercase; border-radius: 0 4px 4px 0; }
            .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 15px; }
            .kpi-card { border: 1px solid #cbd5e1; padding: 10px; border-radius: 8px; text-align: center; background: #f8fafc; }
            .kpi-val { font-size: 18px; font-weight: 900; color: #1e293b; margin-top: 4px; }
            .kpi-label { font-size: 9px; color: #64748b; font-weight: bold; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 10px; }
            th { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 7px; text-align: left; font-weight: bold; }
            td { border: 1px solid #cbd5e1; padding: 7px; }
            .badge-pending { background: #fef3c7; color: #92400e; font-weight: bold; padding: 2px 6px; border-radius: 4px; border: 1px solid #fcd34d; }
            .badge-ok { background: #dcfce7; color: #166534; font-weight: bold; padding: 2px 6px; border-radius: 4px; border: 1px solid #86efac; }
            .signatures { display: flex; justify-content: space-between; margin-top: 45px; }
            .sig-box { width: 42%; text-align: center; border-top: 1.5px solid #64748b; padding-top: 8px; font-weight: bold; font-size: 11px; }
            @media print { body { padding: 15px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">ORIMEC - GESTIÓN TÉCNICA</div>
              <div class="subtitle">SISTEMA INTEGRAL DE MANTENIMIENTO BIOMÉDICO</div>
              <div class="title">Informe de Métricas y Productividad</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 12px; font-weight: 900; color: #1e293b;">PERIODO ${dashYear}</div>
              <div style="margin-top: 5px; font-size: 9px; color: #64748b; font-weight: bold;">Fecha: ${new Date().toLocaleDateString('es-EC')}</div>
            </div>
          </div>

          <div style="margin-bottom: 15px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px;">
            <div><strong>Ingeniero:</strong> ${eng.name}</div>
            <div><strong>Especialidad:</strong> ${eng.specialty}</div>
            <div><strong>Sede:</strong> ${eng.sede || 'Quito'}</div>
            <div><strong>Email:</strong> ${eng.email}</div>
          </div>

          <div class="section-title">1. Resumen KPI de Productividad</div>
          <div class="kpi-grid">
            <div class="kpi-card"><div class="kpi-label">Total Tareas</div><div class="kpi-val">${stats?.total || 0}</div></div>
            <div class="kpi-card"><div class="kpi-label">Tasa Cierre</div><div class="kpi-val" style="color: #16a34a;">${stats && stats.total > 0 ? Math.round(((stats.statusCounts.Conciliado + stats.statusCounts.Realizado + stats.statusCounts.Reportado) / stats.total) * 100) : 0}%</div></div>
            <div class="kpi-card"><div class="kpi-label">Realizadas/Conciliadas</div><div class="kpi-val" style="color: #2563eb;">${(stats?.statusCounts.Realizado || 0) + (stats?.statusCounts.Conciliado || 0) + (stats?.statusCounts.Reportado || 0)}</div></div>
            <div class="kpi-card"><div class="kpi-label">Pendientes</div><div class="kpi-val" style="color: #d97706;">${stats?.statusCounts.Pendiente || 0}</div></div>
          </div>

          <div class="section-title">2. Órdenes Pendientes de Ejecución (${pendingOrders.length} Tareas)</div>
          ${pendingOrders.length === 0 ? '<p style="color: #64748b; padding: 8px;">No registra órdenes pendientes de ejecución en este periodo.</p>' : `
            <table>
              <thead>
                <tr>
                  <th>Nº Orden</th>
                  <th>Cliente / Institución</th>
                  <th>Equipo / Modelo</th>
                  <th>Fecha Programada</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                ${pendingOrders.map(wo => {
                  const client = clients.find(c => c.id === wo.clientId);
                  return `
                    <tr>
                      <td><strong>${wo.id}</strong></td>
                      <td>${client ? client.name : (wo.clientId || 'Sin cliente')}</td>
                      <td>${wo.equipmentName}</td>
                      <td>${wo.plannedDate}</td>
                      <td><span class="badge-pending">PENDIENTE</span></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          `}

          <div class="section-title">3. Detalle Completo de Trabajos Asignados en el Periodo (${engOrders.length} Tareas)</div>
          <table>
            <thead>
              <tr>
                <th>Nº Orden</th>
                <th>Cliente</th>
                <th>Equipo</th>
                <th>Fecha</th>
                <th>Rol</th>
                <th>Estado Real</th>
              </tr>
            </thead>
            <tbody>
              ${engOrders.map(wo => {
                const client = clients.find(c => c.id === wo.clientId);
                const isPrimary = wo.engineerId === eng.id;
                const effStatus = getWOEffectiveStatus(wo);
                return `
                  <tr>
                    <td><strong>${wo.id}</strong></td>
                    <td>${client ? client.name : 'Cliente Desconocido'}</td>
                    <td>${wo.equipmentName}</td>
                    <td>${wo.plannedDate}</td>
                    <td>${isPrimary ? 'Principal' : 'Apoyo'}</td>
                    <td><span class="${effStatus === 'Pendiente' ? 'badge-pending' : 'badge-ok'}">${effStatus.toUpperCase()}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="signatures">
            <div class="sig-box">Jefatura Técnica<br/><span style="font-size: 9px; color: #64748b; font-weight: normal;">Supervisión Biomédica</span></div>
            <div class="sig-box">${eng.name}<br/><span style="font-size: 9px; color: #64748b; font-weight: normal;">Ingeniero Responsable</span></div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 600);
  };

  const handlePrintEngineerEvaluation360Only = (eng: Engineer) => {
    const existingEval = (evaluations360 || []).find(e => e.engineerId === eng.id);
    const currentEval = editingEval360 && editingEval360.engineerId === eng.id ? editingEval360 : (existingEval || {
      id: `EVAL360-${eng.id}`,
      engineerId: eng.id,
      evaluatorName: 'Jefatura Técnica',
      period: '2026',
      scoreGeneral: 4.5,
      competencies: {
        technicalDiagnostic: 4.5,
        equipmentMastery: 4.5,
        radiologicalSafety: 5.0,
        reportAccuracy: 4.5,
        communication: 4.0,
        teamwork: 4.5,
        problemSolving: 4.5,
        punctuality: 4.5,
        toolCare: 5.0
      },
      feedbackStrengths: 'Excelente manejo técnico, amplio conocimiento de la modalidad y alto compromiso con el cliente.',
      feedbackImprovements: 'Mantener la puntualidad en el registro inmediato de informes digitales.',
      actionPlan: 'Continuar con capacitaciones avanzadas de diagnóstico de fábrica GE.',
      updatedAt: new Date().toISOString()
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const compDefs = [
      { key: 'technicalDiagnostic', label: '🛠️ Diagnóstico Técnico de Fallas', desc: 'Capacidad para detectar, aislar y resolver averías complejas en componentes biomédicos.' },
      { key: 'equipmentMastery', label: '⚙️ Dominio Modalidades GE', desc: 'Conocimiento técnico avanzado en hardware y software de equipos GE (CT, MR, RX, etc.).' },
      { key: 'radiologicalSafety', label: '☢️ Seguridad Radiológica', desc: 'Cumplimiento estricto de normas de bioseguridad, blindaje y protección radiológica.' },
      { key: 'reportAccuracy', label: '📄 Informes Digitales', desc: 'Precisión, claridad y oportunidad en la elaboración y entrega de reportes de mantenimiento.' },
      { key: 'communication', label: '🗣️ Comunicación Cliente', desc: 'Relación profesional, empatía y atención clara a las solicitudes del personal hospitalario.' },
      { key: 'teamwork', label: '🤝 Trabajo en Equipo', desc: 'Colaboración activa, disposición de apoyo a compañeros e intercambio de conocimientos.' },
      { key: 'problemSolving', label: '⚡ Resolución bajo Presión', desc: 'Mantener la calma, eficiencia y buen criterio ante emergencias técnicas críticas.' },
      { key: 'punctuality', label: '⏰ Puntualidad de Servicio', desc: 'Respeto riguroso a los horarios programados de visita e inspección a clientes.' },
      { key: 'toolCare', label: '🧰 Cuidado de Herramientas', desc: 'Uso adecuado, calibración y conservación de maletines y herramientas de medición.' }
    ];

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Informe Oficial de Evaluación 360° - ${eng.name}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #0f172a; font-size: 11px; line-height: 1.4; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #9333ea; padding-bottom: 12px; margin-bottom: 20px; }
            .logo { font-size: 20px; font-weight: 900; color: #9333ea; letter-spacing: 0.5px; }
            .subtitle { font-size: 10px; color: #64748b; font-weight: bold; }
            .title { font-size: 14px; font-weight: bold; text-transform: uppercase; color: #0f172a; margin-top: 4px; }
            .section-title { font-size: 12px; font-weight: bold; background: #f3e8ff; padding: 6px 10px; border-left: 4px solid #9333ea; margin: 18px 0 10px 0; text-transform: uppercase; border-radius: 0 4px 4px 0; color: #581c87; }
            .badge-score { background: #faf5ff; color: #6b21a8; font-weight: 900; padding: 8px 16px; border-radius: 10px; font-size: 15px; border: 1.5px solid #d8b4fe; text-align: center; }
            .comp-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
            .comp-card { border: 1px solid #e9d5ff; padding: 10px 12px; border-radius: 8px; background: #fff; }
            .comp-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
            .comp-title { font-weight: bold; color: #4c1d95; font-size: 11px; }
            .comp-desc { font-size: 9px; color: #64748b; margin-top: 2px; }
            .comp-val { font-size: 12px; font-weight: 900; color: #7e22ce; }
            .signatures { display: flex; justify-content: space-between; margin-top: 45px; }
            .sig-box { width: 42%; text-align: center; border-top: 1.5px solid #64748b; padding-top: 8px; font-weight: bold; font-size: 11px; }
            @media print { body { padding: 15px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">ORIMEC - GESTIÓN TÉCNICA</div>
              <div class="subtitle">SISTEMA INTEGRAL DE MANTENIMIENTO BIOMÉDICO</div>
              <div class="title">Evaluación 360° por Competencias</div>
            </div>
            <div style="text-align: right;">
              <div class="badge-score">
                <div>Score 360°: ⭐ ${currentEval.scoreGeneral} / 5.0</div>
                <div style="font-size: 9px; text-transform: uppercase; color: #7e22ce; margin-top: 2px;">
                  ${currentEval.scoreGeneral >= 4.5 ? '🌟 Excelente' : currentEval.scoreGeneral >= 3.8 ? '👍 Sobresaliente' : currentEval.scoreGeneral >= 3.0 ? '⚠️ Satisfactorio' : '🚨 Requiere Plan de Mejora'}
                </div>
              </div>
            </div>
          </div>

          <div style="margin-bottom: 15px; background: #faf5ff; border: 1px solid #e9d5ff; padding: 12px; border-radius: 8px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px;">
            <div><strong>Ingeniero Evaluado:</strong> ${eng.name}</div>
            <div><strong>Especialidad:</strong> ${eng.specialty}</div>
            <div><strong>Sede:</strong> ${eng.sede || 'Quito'}</div>
            <div><strong>Email:</strong> ${eng.email}</div>
            <div><strong>Evaluado por:</strong> ${currentEval.evaluatorName}</div>
            <div><strong>Periodo de Evaluación:</strong> ${currentEval.period}</div>
          </div>

          <div class="section-title">1. Calificación por Competencias Técnicas, Conductuales y Operativas</div>
          <div class="comp-grid">
            ${compDefs.map(c => {
              const val = (currentEval.competencies as any)[c.key] || 4.0;
              return `
                <div class="comp-card">
                  <div class="comp-head">
                    <span class="comp-title">${c.label}</span>
                    <span class="comp-val">${val} ⭐</span>
                  </div>
                  <div class="comp-desc">${c.desc}</div>
                </div>
              `;
            }).join('')}
          </div>

          <div class="section-title">2. Retroalimentación Cualitativa y Plan de Desarrollo</div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px;">
            <p style="margin: 6px 0;"><strong>💪 Fortalezas Destacadas:</strong> ${currentEval.feedbackStrengths || 'N/A'}</p>
            <p style="margin: 6px 0;"><strong>🔍 Oportunidades de Mejora:</strong> ${currentEval.feedbackImprovements || 'N/A'}</p>
            <p style="margin: 6px 0;"><strong>🎯 Plan de Acción y Capacitación:</strong> ${currentEval.actionPlan || 'N/A'}</p>
          </div>

          <div class="signatures">
            <div class="sig-box">${currentEval.evaluatorName}<br/><span style="font-size: 9px; color: #64748b; font-weight: normal;">Jefatura / Evaluador</span></div>
            <div class="sig-box">${eng.name}<br/><span style="font-size: 9px; color: #64748b; font-weight: normal;">Ingeniero Evaluado</span></div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 600);
  };

  const handleExportSingleEngineerCSV = (eng: Engineer) => {
    const engOrders = filteredDashOrders.filter(wo => 
      wo.engineerId === eng.id || 
      (wo.supportEngineerIds && wo.supportEngineerIds.includes(eng.id)) ||
      wo.supportEngineerId === eng.id
    );

    const headers = [
      'ID Orden',
      'Cliente',
      'Fecha Programada',
      'Horario',
      'Tipo de Servicio',
      'Estado',
      'Equipo(s)',
      'Rol del Ingeniero',
      'Instrucciones/Notas'
    ];

    const rows = engOrders.map(wo => {
      const client = clients.find(c => c.id === wo.clientId);
      const isPrimary = wo.engineerId === eng.id;
      const role = isPrimary ? 'Principal' : 'Apoyo';
      return [
        wo.id,
        client ? client.name : 'Cliente Desconocido',
        wo.plannedDate,
        wo.plannedTime || 'N/D',
        wo.type,
        wo.status,
        wo.equipmentName,
        role,
        wo.notes || ''
      ];
    });

    const csvContent = [
      headers.join(';'),
      ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(';'))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const periodName = dashPeriod === 'month' 
      ? monthsList[dashMonth - 1] 
      : dashPeriod === 'semester' 
      ? `Semestre_${dashSemester}` 
      : 'Anual';
      
    const cleanEngName = eng.name.replace(/[^a-zA-Z0-9]/g, '_');
    link.setAttribute('download', `Ordenes_${cleanEngName}_${periodName}_${dashYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper handlers for managing engineers list and status
  const handleCreateNewEngineer = async () => {
    if (!newEngName.trim() && !newEngEmail.trim()) {
      alert("Por favor ingrese al menos el nombre o correo electrónico del usuario/técnico.");
      return;
    }

    setIsRegisteringUser(true);
    try {
      const email = newEngEmail.trim().toLowerCase() || `${newEngName.toLowerCase().replace(/[^a-z0-9]/g, '')}@orimec.com.ec`;
      const name = newEngName.trim() || email.split('@')[0].toUpperCase().replace(/[._]/g, ' ');

      if (onRegisterNewUser) {
        await onRegisterNewUser({
          name,
          email,
          password: newEngPassword.trim() || undefined,
          role: newEngRole,
          specialty: newEngRole === 'engineer' ? newEngSpecialty : undefined,
          sede: newEngSede,
          phone: newEngPhone.trim() || '+593 999 999 999'
        });
      } else {
        const newId = `ENG-DYN-${100 + engineers.length}-${Math.floor(Math.random() * 105)}`;
        const newEng: Engineer = {
          id: newId,
          name,
          specialty: newEngSpecialty,
          email,
          phone: newEngPhone.trim() || '+593 999 999 999',
          avatar: '',
          availability: 'Disponible',
          skills: [newEngSpecialty],
          sede: newEngSede,
          customPermissions: getDefaultPermissionsForSpecialty(newEngSpecialty)
        };
        if (onUpdateEngineer) {
          onUpdateEngineer(newEng);
        }
      }

      if (newEngRole === 'engineer') {
        setEngModalTab('engineers');
      } else {
        setEngModalTab('users');
      }

      setNewEngName('');
      setNewEngEmail('');
      setNewEngPassword('');
      setNewEngPhone('');
      setIsAddingNewEng(false);
    } catch (e: any) {
      console.error("Error registrando nuevo usuario:", e);
      alert(`Error al registrar: ${e?.message || 'Ocurrió un problema'}`);
    } finally {
      setIsRegisteringUser(false);
    }
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
    return (
      <RETE04ReportModal
        report={report}
        task={task}
        clients={clients}
        engineers={engineers}
        setIsViewingRETE04={setIsViewingRETE04}
      />
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


  const findBestEquipmentMatch = (
    instNameInput: string,
    eqNameInput: string
  ) => {
    const normInst = cleanStr(instNameInput);
    const normEq = cleanStr(eqNameInput);

    if (!normInst && !normEq) return null;

    const stopWords = new Set(['hosp', 'hospital', 'clinica', 'clínica', 'centro', 'basico', 'básico', 'general', 'salud', 'subcentro', 'unidad', 'medica', 'médica', 'instituto', 'san', 'santa', 'de', 'del', 'la', 'el', 'los', 'las']);
    const instTokens = normInst.split(' ').map(t => t.toLowerCase().trim()).filter(t => t.length > 2 && !stopWords.has(t));

    // 1. Buscar en registros existentes de mantenimiento
    const matchedRegistries = (maintenanceRegistries || []).filter(reg => {
      const regInst = cleanStr(reg.institutionName);
      if (!regInst) return false;
      if (regInst === normInst) return true;
      if (instTokens.length > 0) {
        const matches = instTokens.filter(tok => regInst.includes(tok));
        if (matches.length === instTokens.length) return true;
      }
      return false;
    });

    if (matchedRegistries.length > 0) {
      const eqTokens = normEq.split(' ').filter(t => t.length > 1);

      let bestReg = matchedRegistries.find(reg => {
        const combined = cleanStr(`${reg.eqBrand} ${reg.eqModel} ${reg.eqSerial}`);
        if (normEq && combined.includes(normEq)) return true;
        if (eqTokens.length > 0) {
          const matches = eqTokens.filter(tok => combined.includes(tok));
          if (matches.length >= Math.min(eqTokens.length, 1)) return true;
        }
        return false;
      });

      if (!bestReg && matchedRegistries.length > 0) {
        bestReg = matchedRegistries[0];
      }

      if (bestReg) {
        return {
          institutionName: instNameInput,
          eqBrand: bestReg.eqBrand,
          eqModel: bestReg.eqModel,
          eqSerial: bestReg.eqSerial,
          tuboBrand: bestReg.tuboBrand || '-',
          tuboModel: bestReg.tuboModel || '-',
          tuboSerial: bestReg.tuboSerial || '-',
          source: 'registro'
        };
      }
    }

    // 2. Buscar en colecciones de clientes / equipos del sistema
    const matchedClient = (clients || []).find(c => {
      const cName = cleanStr(c.name);
      return cName === normInst;
    });

    if (matchedClient) {
      const clientEquips = (equipments || []).filter(e => e.clientId === matchedClient.id);
      if (clientEquips.length > 0) {
        const eqTokens = normEq.split(' ').filter(t => t.length > 1);
        const bestEq = clientEquips.find(e => {
          const combined = cleanStr(`${e.brand} ${e.model} ${e.name} ${e.serialNumber}`);
          if (normEq && combined.includes(normEq)) return true;
          if (eqTokens.length > 0) {
            const matches = eqTokens.filter(tok => combined.includes(tok));
            if (matches.length >= Math.min(eqTokens.length, 1)) return true;
          }
          return false;
        }) || clientEquips[0];

        if (bestEq) {
          return {
            institutionName: instNameInput,
            eqBrand: bestEq.brand || '-',
            eqModel: bestEq.model || bestEq.name || '-',
            eqSerial: bestEq.serialNumber || '-',
            tuboBrand: '-',
            tuboModel: '-',
            tuboSerial: '-',
            source: 'equipo'
          };
        }
      }
    }

    return null;
  };

  const handleRegistryCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRegistryCsvError(null);
    setRegistryCsvSuccess(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const raw = (event.target?.result as string || '').replace(/^\uFEFF/, '');
        const allLines = raw.split(/\r?\n/);

        // ── Detect delimiter ──────────────────────────────────────────────────
        const firstLine = allLines[0] || '';
        const commaCount = (firstLine.match(/,/g)  || []).length;
        const semiCount  = (firstLine.match(/;/g)  || []).length;
        const tabCount   = (firstLine.match(/\t/g) || []).length;
        const delim = tabCount > semiCount && tabCount > commaCount ? '\t'
                    : commaCount > semiCount                        ? ','
                    : ';';

        // ── Split a line respecting quoted fields ────────────────────────────
        const splitLine = (line: string): string[] => {
          const cols: string[] = [];
          let cur = '';
          let inQ = false;
          for (const ch of line) {
            if (ch === '"') { inQ = !inQ; }
            else if (ch === delim && !inQ) { cols.push(cur.trim()); cur = ''; }
            else { cur += ch; }
          }
          cols.push(cur.trim());
          return cols;
        };

        // ── Detect header count ────────────────────────────────────────────────
        // Check if row 1 is a second header row (contains 'Marca', 'Modelo', 'Serie') or data
        const secondLine = allLines[1] || '';
        const isSecondHeader = /marca|modelo|serie/i.test(secondLine);
        const headerRowsCount = isSecondHeader ? 2 : 1;

        const dataLines = allLines.slice(headerRowsCount).filter(l => l.trim() !== '');

        if (dataLines.length === 0) {
          setRegistryCsvError(`El archivo no tiene datos después de las ${headerRowsCount} fila(s) de encabezados.`);
          return;
        }

        const base = Date.now();
        const formatted: MaintenanceRegistry[] = dataLines.map((line, idx) => {
          let cols = splitLine(line);

          // If cols[0] contains semicolons, split it further
          if (cols.length === 1 && cols[0].includes(';')) {
            cols = cols[0].split(';').map(c => c.trim());
          }

          const col = (i: number) => (cols[i] || '').trim().replace(/^["']|["']$/g, '');

          let inst = col(0) || '-';
          let eqB = col(1) || '-';
          let eqM = col(2) || '-';
          let eqS = col(3) || '-';
          let tubB = col(4) || '-';
          let tubM = col(5) || '-';
          let tubS = col(6) || '-';
          let fec = col(7) || '-';
          let resp = col(8) || '-';

          // Auto-fix if inst string has inline semicolons
          if (inst.includes(';')) {
            const parts = inst.split(';').map(p => p.trim()).filter(Boolean);
            if (parts.length >= 3) {
              const isPart1Date = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|ene|abr|ago|dic|\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})\b/i.test(parts[1]);
              if (isPart1Date) {
                eqS = parts[0];
                fec = parts[1];
                inst = parts[2];
                if (parts[3]) resp = parts[3];
              } else {
                inst = parts[parts.length - 1] || parts[0];
              }
            }
          }

          return {
            id: `REG-${base}-${idx}`,
            institutionName: inst,
            eqBrand:         eqB,
            eqModel:         eqM,
            eqSerial:        eqS,
            tuboBrand:       tubB,
            tuboModel:       tubM,
            tuboSerial:      tubS,
            fecha:           fec,
            responsable:     resp,
            createdAt: new Date().toISOString()
          };
        });

        console.log(`[Registry CSV] ${formatted.length} filas de datos. Delimitador: "${delim}". Primera fila:`, formatted[0]);

        if (onBulkUploadMaintenanceRegistries) {
          setRegistryCsvSuccess(`Subiendo ${formatted.length} registros a Firestore en ${Math.ceil(formatted.length / 400)} lote(s)… por favor espere.`);
          try {
            await onBulkUploadMaintenanceRegistries(formatted);
            setRegistryCsvSuccess(`✅ ¡Éxito! Se cargaron ${formatted.length} registros de mantenimiento correctamente.`);
          } catch (uploadErr: any) {
            setRegistryCsvError(`Error al subir a Firestore: ${uploadErr?.message || String(uploadErr)}`);
          }
        } else {
          setRegistryCsvError("No hay un handler configurado para subir los registros.");
        }
        e.target.value = '';
      } catch (err: any) {
        console.error("[Registry CSV] Error:", err);
        setRegistryCsvError(`Error al procesar CSV: ${err.message || String(err)}`);
      }
    };
    reader.readAsText(file, 'utf-8');
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
      city: clientFormCity.trim() || undefined,
      installedEquipments: editingClient?.installedEquipments || []
    };
    if (onAddClient) {
      onAddClient(cli);
      setIsClientModalOpen(false);
      setEditingClient(null);
    }
  };

  const handleSaveRegistry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddMaintenanceRegistry) return;

    const regId = editingRegistry ? editingRegistry.id : `REG-${Date.now()}`;

    const newReg: MaintenanceRegistry = {
      id: regId,
      institutionName: regFormInstitutionName.trim() || 'S/N Institución',
      eqBrand: regFormEqBrand.trim(),
      eqModel: regFormEqModel.trim(),
      eqSerial: regFormEqSerial.trim(),
      tuboBrand: regFormTuboBrand.trim(),
      tuboModel: regFormTuboModel.trim(),
      tuboSerial: regFormTuboSerial.trim(),
      fecha: regFormFecha.trim() || new Date().toISOString().split('T')[0],
      responsable: regFormResponsable.trim() || 'S/N Responsable',
      createdAt: editingRegistry?.createdAt || new Date().toISOString(),
      workOrderId: editingRegistry?.workOrderId
    };

    onAddMaintenanceRegistry(newReg);
    setIsRegistryModalOpen(false);
    setEditingRegistry(null);
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

  const handleSaveContract = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetContractId = contractFormId.trim();
    if (!targetContractId) return;

    let finalContractId = targetContractId;
    const isIdDuplicate = contracts.some(c => c.id.toLowerCase() === targetContractId.toLowerCase() && c.id !== editingContract?.id);
    if (isIdDuplicate) {
      let counter = 2;
      let candidate = `${targetContractId} (${counter})`;
      while (contracts.some(c => c.id.toLowerCase() === candidate.toLowerCase() && c.id !== editingContract?.id)) {
        counter++;
        candidate = `${targetContractId} (${counter})`;
      }
      finalContractId = candidate;
    }

    let targetClientId = contractFormClientId.trim();

    if (isCreatingNewClientForContract) {
      if (!newContractClientName.trim()) {
        alert("Por favor ingrese el nombre del nuevo cliente");
        return;
      }
      const newId = `CLI-${Date.now()}`;
      const newClientObj: Client = {
        id: newId,
        name: newContractClientName.trim(),
        industry: newContractClientIndustry.trim() || 'Servicios',
        address: newContractClientAddress.trim() || 'No especificada',
        contactName: newContractClientContactName.trim() || 'No especificado',
        contactPhone: newContractClientContactPhone.trim() || '',
        installedEquipments: contractFormEquipmentItems.map(item => `${item.name} (${item.brand})`)
      };
      
      if (onAddClient) {
        await onAddClient(newClientObj);
      }
      targetClientId = newId;
    }

    if (!targetClientId) {
      alert("Por favor seleccione o cree un cliente para el contrato");
      return;
    }

    const hasSchedule = (contractFormMaintenanceDates && contractFormMaintenanceDates.length > 0) || !!contractFormSchedulePdfUrl.trim();
    const isPendingSchedule = !hasSchedule && (contractFormPendingAdmin || (userRole === 'sales' && contractFormMaintenanceDates.length === 0) || (contractFormFrequency === 'Ninguno' && contractFormMaintenanceDates.length === 0));

    const todayStr = new Date().toISOString().split('T')[0];
    const isExpiredDate = contractFormEnd && contractFormEnd < todayStr;

    let finalStatus = contractFormStatus;
    if (contractFormStatus === 'Pendiente' && (hasSchedule || !contractFormPendingAdmin)) {
      finalStatus = isExpiredDate ? 'Vencido' : 'Activo';
    } else if (contractFormStatus !== 'Vencido' && contractFormStatus !== 'Inactivo') {
      if (isPendingSchedule) {
        finalStatus = 'Pendiente';
      } else if (isExpiredDate) {
        finalStatus = 'Vencido';
      }
    }

    const isSalesReadOnly = !!editingContract && userRole === 'sales';

    const con: Contract = {
      id: finalContractId,
      clientId: isSalesReadOnly && editingContract ? editingContract.clientId : targetClientId,
      type: isSalesReadOnly && editingContract ? editingContract.type : contractFormType,
      startDate: isSalesReadOnly && editingContract ? editingContract.startDate : contractFormStart,
      endDate: isSalesReadOnly && editingContract ? editingContract.endDate : contractFormEnd,
      status: isSalesReadOnly && editingContract ? editingContract.status : finalStatus,
      city: isSalesReadOnly && editingContract ? editingContract.city : contractFormCity.trim() || undefined,
      contractValue: isSalesReadOnly && editingContract ? editingContract.contractValue : (contractFormValue.trim() ? parseFloat(contractFormValue) : undefined),
      coverage: isSalesReadOnly && editingContract ? editingContract.coverage : contractFormCoverage.trim(),
      equipmentItems: isSalesReadOnly && editingContract ? editingContract.equipmentItems : contractFormEquipmentItems,
      maintenanceFrequency: isSalesReadOnly && editingContract ? editingContract.maintenanceFrequency : (isPendingSchedule ? 'Ninguno' : contractFormFrequency),
      maintenanceDates: isSalesReadOnly && editingContract ? editingContract.maintenanceDates : (isPendingSchedule ? [] : contractFormMaintenanceDates),
      qcDate: isSalesReadOnly && editingContract ? editingContract.qcDate : (isPendingSchedule ? undefined : (contractFormQcDate || (contractFormQcDates[0] || (contractFormMaintenanceDates.length > 0 ? contractFormMaintenanceDates[contractFormMaintenanceDates.length - 1] : '')))),
      qcDates: isSalesReadOnly && editingContract ? editingContract.qcDates : (isPendingSchedule ? [] : (contractFormQcDates.length > 0 ? contractFormQcDates : computeDefaultQcDates(contractFormMaintenanceDates))),
      contractPdfUrl: contractFormPdfUrl.trim() || undefined,
      schedulePdfUrl: contractFormSchedulePdfUrl.trim() || undefined,
      isNewEquipment: contractFormIsNewEquipment,
      serviceRecordPdfUrl: contractFormIsNewEquipment ? (contractFormSrPdfUrl.trim() || undefined) : undefined,
      caPdfUrl: contractFormIsNewEquipment ? (contractFormCaPdfUrl.trim() || undefined) : undefined,
      podPdfUrl: contractFormIsNewEquipment ? (contractFormPodPdfUrl.trim() || undefined) : undefined,
      pendingAdminSchedule: isSalesReadOnly && editingContract ? editingContract.pendingAdminSchedule : (hasSchedule ? false : isPendingSchedule),
      linkedContractId: contractFormLinkedId.trim() || undefined,
    };

    // Auto-register new custom equipments under the selected client
    if (onAddEquipment) {
      for (const item of contractFormEquipmentItems) {
        const exists = equipments.some(eq => eq.clientId === targetClientId && eq.name.toLowerCase() === item.name.toLowerCase());
        if (!exists) {
          const newEq: Equipment = {
            id: `EQP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            name: item.name,
            brand: item.brand,
            model: 'N/D',
            serialNumber: item.serial || 'CONTRATO-TEMP',
            clientId: targetClientId,
            status: 'Operativo'
          };
          await onAddEquipment(newEq);
        }
      }
    }

    // Auto-schedule work orders for each of the maintenance dates
    if (onAddWorkOrder && con.maintenanceDates && con.maintenanceDates.length > 0) {
      const activeQcDates = (con.qcDates && con.qcDates.length > 0) ? con.qcDates : (con.qcDate ? [con.qcDate] : computeDefaultQcDates(con.maintenanceDates));

      for (const rawDate of con.maintenanceDates) {
        const cleanDate = rawDate.split('|')[0].trim();
        const eqNameInEntry = rawDate.split('|')[1]?.trim();

        const alreadyScheduled = workOrders.some(
          wo => isWoMatchingContractDate(wo, con, rawDate, contracts)
        );

        if (!alreadyScheduled) {
          const isQc = activeQcDates.some(qd => {
            const [qDate, qEq] = qd.split('|');
            if (eqNameInEntry && qEq) {
              return qDate === cleanDate && qEq === eqNameInEntry;
            }
            return qd === rawDate || qd === cleanDate || qDate === cleanDate;
          });
          
          const eqName = eqNameInEntry || (con.equipmentItems && con.equipmentItems.length > 0
            ? (con.equipmentItems.length === 1 ? con.equipmentItems[0].name : con.equipmentItems[idx % con.equipmentItems.length]?.name || con.equipmentItems[0].name)
            : 'Equipos según contrato');

          const newWO: WorkOrder = {
            id: `WO-MTO-${con.id}-${cleanDate}-${Math.floor(Math.random() * 1000)}`,
            clientId: targetClientId,
            engineerId: engineers[0]?.id || 'ENG-001',
            plannedDate: cleanDate,
            plannedTime: '09:00 AM - 11:00 AM',
            durationDays: 1,
            type: isQc ? 'Inspección' : 'Preventivo',
            status: 'Pendiente',
            equipmentName: eqName,
            notes: `Mantenimiento preventivo autogenerado bajo Contrato: ${con.id}${isQc ? ' (Visita de Control de Calidad)' : ''}`
          };
          
          await onAddWorkOrder(newWO);
        }
      }
    }

    if (editingContract) {
      // Admin rename: if the contract ID was changed, delete old doc and create new one
      const idChanged = userRole === 'admin' && editingContract.id !== con.id;
      if (idChanged && onDeleteContract && onAddContract) {
        onDeleteContract(editingContract.id);
        onAddContract(con);
      } else if (onUpdateContract) {
        onUpdateContract(con);
      }
    } else {
      if (onAddContract) onAddContract(con);
      setContractPage(1); // Reset to page 1 so the new contract is visible
    }
    setContractFormLinkedId('');
    setIsContractModalOpen(false);
    setEditingContract(null);
  };

  const renderClientesTab = () => {
    return (
      <ClientesTab
        clients={clients}
        userRole={userRole}
        isClientImporterOpen={isClientImporterOpen}
        setIsClientImporterOpen={setIsClientImporterOpen}
        clientCsvError={clientCsvError}
        handleClientCsvUpload={handleClientCsvUpload}
        setEditingClient={setEditingClient}
        setClientFormId={setClientFormId}
        setClientFormName={setClientFormName}
        setClientFormAddress={setClientFormAddress}
        setClientFormCity={setClientFormCity}
        setClientFormContact={setClientFormContact}
        setClientFormPhone={setClientFormPhone}
        setIsClientModalOpen={setIsClientModalOpen}
      />
    );
  };

  const renderRegistroTab = () => {
    return (
      <RegistroTab
        maintenanceRegistries={maintenanceRegistries}
        workOrders={workOrders}
        clients={clients}
        engineers={engineers}
        userRole={userRole}
        isRegistryImporterOpen={isRegistryImporterOpen}
        setIsRegistryImporterOpen={setIsRegistryImporterOpen}
        handleRegistryCsvUpload={handleRegistryCsvUpload}
        registryCsvSuccess={registryCsvSuccess}
        setRegistryCsvSuccess={setRegistryCsvSuccess}
        registryCsvError={registryCsvError}
        setRegistryCsvError={setRegistryCsvError}
        onClearMaintenanceRegistries={onClearMaintenanceRegistries}
        onDeleteMaintenanceRegistry={onDeleteMaintenanceRegistry}
        setEditingRegistry={setEditingRegistry}
        setRegFormInstitutionName={setRegFormInstitutionName}
        setRegFormEqBrand={setRegFormEqBrand}
        setRegFormEqModel={setRegFormEqModel}
        setRegFormEqSerial={setRegFormEqSerial}
        setRegFormTuboBrand={setRegFormTuboBrand}
        setRegFormTuboModel={setRegFormTuboModel}
        setRegFormTuboSerial={setRegFormTuboSerial}
        setRegFormFecha={setRegFormFecha}
        setRegFormResponsable={setRegFormResponsable}
        setIsRegistryModalOpen={setIsRegistryModalOpen}
        findBestEquipmentMatch={findBestEquipmentMatch}
      />
    );
  };

  const renderEquiposTab = () => {
    return (
      <EquiposTab
        equipments={equipments}
        clients={clients}
        userRole={userRole}
        isEquipImporterOpen={isEquipImporterOpen}
        setIsEquipImporterOpen={setIsEquipImporterOpen}
        handleEquipCsvUpload={handleEquipCsvUpload}
        equipCsvSuccess={equipCsvSuccess}
        equipCsvError={equipCsvError}
        setEditingEquip={setEditingEquip}
        setEquipFormId={setEquipFormId}
        setEquipFormName={setEquipFormName}
        setEquipFormClientId={setEquipFormClientId}
        setEquipFormBrand={setEquipFormBrand}
        setEquipFormModel={setEquipFormModel}
        setEquipFormSerial={setEquipFormSerial}
        setEquipFormSW={setEquipFormSW}
        setEquipFormSucursal={setEquipFormSucursal}
        setEquipFormStatus={setEquipFormStatus}
        setIsEquipModalOpen={setIsEquipModalOpen}
      />
    );
  };

  const handleContractGeCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const content = evt.target?.result as string;
        if (!content) return;

        const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length < 2) {
          setContractGeCsvError("El archivo CSV debe contener al menos la cabecera y una fila de datos.");
          return;
        }

        const firstLine = lines[0];
        const delimiter = firstLine.includes(';') ? ';' : firstLine.includes('\t') ? '\t' : ',';
        const headers = firstLine.split(delimiter).map(h => h.trim().replace(/^[\uFEFF\s"']+|[\s"']+$/g, '').toUpperCase());

        const findCol = (keys: string[]) => {
          return headers.findIndex(h => keys.some(k => h.includes(k.toUpperCase())));
        };

        const idxCliente = findCol(['CLIENTE', 'CUSTOMER']);
        const idxSid = findCol(['SID', 'SYSTEM ID', 'SERIAL']);
        const idxModalidad = findCol(['MODALIDAD', 'MODALITY']);
        const idxEquipo = findCol(['EQUIPO', 'EQUIPMENT NAME', 'MODELO']);
        const idxEqNum = findCol(['EQUIPMENT #', 'EQUIPMENT', 'CUOTA']);
        const idxInvoice = findCol(['INVOICE', 'FACTURA']);
        const idxAmount = findCol(['INVOICE AMOUNT', 'AMOUNT', 'MONTO', 'VALOR']);
        const idxMonths = findCol(['MONTHS', 'MESES', 'DURACION']);
        const idxDate = findCol(['INVOICE DATE', 'CONTRACT DATE', 'FECHA FACTURA', 'FECHA EMISION']);
        const idxDueDate = findCol(['DUE DATE', 'VENCIMIENTO', 'FECHA VENCIMIENTO']);
        const idxPeriod = findCol(['FECHA/AÑO PAGO', 'PAGO', 'PERIODO', 'YEAR PAGO']);
        const idxMonth = findCol(['#MES', 'MES']);
        const idxContract = findCol(['CONTRATO', 'CONTRACT']);
        const idxObs = findCol(['OBSERVACIONES', 'COMMENTS', 'OBSERVACION', 'NOTES', 'REMARKS']);

        const parsedItems: ContractGE[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const cols = line.split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
          if (cols.length < 2) continue;

          const rawCliente = idxCliente !== -1 ? cols[idxCliente] : cols[0];
          const rawSid = idxSid !== -1 ? cols[idxSid] : '';
          const rawModalidad = idxModalidad !== -1 ? cols[idxModalidad] : '';
          const rawEquipo = idxEquipo !== -1 ? cols[idxEquipo] : '';
          const rawEqNum = idxEqNum !== -1 ? cols[idxEqNum] : '';
          const rawInvoice = idxInvoice !== -1 ? cols[idxInvoice] : `INV-${i}`;
          const rawAmount = idxAmount !== -1 ? cols[idxAmount] : '0';
          const rawMonths = idxMonths !== -1 ? cols[idxMonths] : '';
          const rawDate = idxDate !== -1 ? cols[idxDate] : '';
          const rawDueDate = idxDueDate !== -1 ? cols[idxDueDate] : '';
          const rawPeriod = idxPeriod !== -1 ? cols[idxPeriod] : '';
          const rawMonth = idxMonth !== -1 ? cols[idxMonth] : '';
          const rawContract = idxContract !== -1 ? cols[idxContract] : '';
          const rawObs = idxObs !== -1 ? cols[idxObs] : '';

          if (!rawCliente && !rawInvoice && !rawEquipo) continue;

          const cleanAmount = parseGeCsvAmount(rawAmount);

          const newItem: ContractGE = {
            id: `GE-${rawInvoice || Date.now()}-${i}`,
            cliente: rawCliente || 'Cliente Desconocido',
            sid: rawSid,
            modalidad: rawModalidad,
            equipo: rawEquipo,
            equipmentNum: rawEqNum,
            invoice: rawInvoice || `INV-${i}`,
            invoiceAmount: cleanAmount,
            months: rawMonths,
            invoiceDate: rawDate,
            dueDate: rawDueDate,
            paymentPeriod: rawPeriod,
            monthNum: rawMonth,
            contractNum: rawContract,
            observaciones: rawObs,
            createdAt: new Date().toISOString()
          };

          parsedItems.push(newItem);
        }

        if (parsedItems.length === 0) {
          setContractGeCsvError("No se pudieron parsear registros válidos. Verifique el formato del CSV.");
          return;
        }

        if (onBulkUploadContractsGE) {
          await onBulkUploadContractsGE(parsedItems);
        }
        setContractGeCsvError(null);
        setIsContractGeImporterOpen(false);
      } catch (err: any) {
        console.error("Error procesando CSV GE:", err);
        setContractGeCsvError("Error procesando archivo CSV: " + (err.message || String(err)));
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const parseGeCsvAmount = (rawStr: string | number): number => {
    if (typeof rawStr === 'number') return rawStr;
    if (!rawStr) return 0;
    let str = String(rawStr).trim().replace(/[\$\s]/g, '');
    if (!str) return 0;

    if (str.includes(',') && str.includes('.')) {
      const lastComma = str.lastIndexOf(',');
      const lastDot = str.lastIndexOf('.');
      if (lastComma > lastDot) {
        // e.g. 3.557,25 -> 3557.25
        str = str.replace(/\./g, '').replace(',', '.');
      } else {
        // e.g. 3,557.25 -> 3557.25
        str = str.replace(/,/g, '');
      }
    } else if (str.includes(',')) {
      // Comma is decimal separator! e.g. "400,83" -> "400.83", "362,04" -> "362.04"
      str = str.replace(',', '.');
    }

    const val = parseFloat(str);
    return isNaN(val) ? 0 : val;
  };

  const autoCalculateGeNextMonth = (clientName: string) => {
    if (!clientName) return '1';
    const clientRecords = contractsGE.filter(c => 
      c.cliente && c.cliente.trim().toLowerCase() === clientName.trim().toLowerCase()
    );
    if (clientRecords.length === 0) return '1';
    let maxMonth = 0;
    clientRecords.forEach(c => {
      const num = parseInt(String(c.monthNum || 0), 10);
      if (!isNaN(num) && num > maxMonth) {
        maxMonth = num;
      }
    });
    return String(maxMonth > 0 ? maxMonth + 1 : 1);
  };

  const exportContractsToExcel = () => {
    if (contracts.length === 0) {
      alert("No hay contratos registrados para exportar.");
      return;
    }

    const headers = [
      'N° CONTRATO',
      'CLIENTE',
      'TIPO DE CONTRATO',
      'FECHA INICIO',
      'FECHA VENCIMIENTO',
      'ESTADO',
      'DETALLE DE COBERTURA',
      'FRECUENCIA MANTENIMIENTO',
      'EQUIPOS CUBIERTOS'
    ];

    const rows = contracts.map(con => {
      const client = clients.find(c => c.id === con.clientId);
      const equipNames = (con.equipmentItems || []).map(e => `${e.name || ''} ${e.brand || ''}`.trim()).filter(Boolean).join(', ');
      return [
        `"${(con.id || '').replace(/"/g, '""')}"`,
        `"${(client?.name || con.clientId || '').replace(/"/g, '""')}"`,
        `"${(con.type || '').replace(/"/g, '""')}"`,
        `"${(con.startDate || '').replace(/"/g, '""')}"`,
        `"${(con.endDate || '').replace(/"/g, '""')}"`,
        `"${(con.status || '').replace(/"/g, '""')}"`,
        `"${(con.coverage || '').replace(/"/g, '""')}"`,
        `"${(con.maintenanceFrequency || '').replace(/"/g, '""')}"`,
        `"${(equipNames || '').replace(/"/g, '""')}"`
      ].join(';');
    });

    const csvContent = "\uFEFF" + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `contratos_y_garantias_MTO_${today}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportContractsGeToExcel = () => {
    if (contractsGE.length === 0) {
      alert("No hay contratos GE registrados para exportar.");
      return;
    }

    const headers = [
      'CLIENTE',
      'SID',
      'MODALIDAD',
      'EQUIPO',
      'EQUIPMENT #',
      'INVOICE (FACTURA)',
      'INVOICE AMOUNT ($)',
      'MONTHS (MESES)',
      'INVOICE DATE',
      'DUE DATE',
      'FECHA/AÑO PAGO',
      '#MES',
      'CONTRATO',
      'OBSERVACIONES / COMMENTS'
    ];

    const rows = contractsGE.map(c => {
      let cleanName = (c.cliente || '').trim();
      cleanName = cleanName.replace(/\uFFFD/g, 'í').replace(/Mara/g, 'María').trim();

      return [
        `"${cleanName.replace(/"/g, '""')}"`,
        `"${(c.sid || '').replace(/"/g, '""')}"`,
        `"${(c.modalidad || '').replace(/"/g, '""')}"`,
        `"${(c.equipo || '').replace(/"/g, '""')}"`,
        `"${String(c.equipmentNum ?? '').replace(/"/g, '""')}"`,
        `"${(c.invoice || '').replace(/"/g, '""')}"`,
        c.invoiceAmount || 0,
        `"${String(c.months ?? '').replace(/"/g, '""')}"`,
        `"${(c.invoiceDate || '').replace(/"/g, '""')}"`,
        `"${(c.dueDate || '').replace(/"/g, '""')}"`,
        `"${(c.paymentPeriod || '').replace(/"/g, '""')}"`,
        `"${String(c.monthNum ?? '').replace(/"/g, '""')}"`,
        `"${String(c.contractNum ?? '').replace(/"/g, '""')}"`,
        `"${(c.observaciones || '').replace(/"/g, '""')}"`
      ].join(';');
    });

    const csvContent = "\uFEFF" + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `contratos_GE_MTO_${today}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const handlePrintContractProjectionPdf = (projectionsList: any[], totals: any) => {
    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert('Por favor permita ventanas emergentes para generar el informe PDF de proyecciones.');
      return;
    }

    const todayStr = new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Informe Ejecutivo de Proyección y Solicitud de Contratos - ORIMEC FSM</title>
          <style>
            @page { size: A4 portrait; margin: 12mm 15mm; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #0f172a; margin: 0; padding: 0; font-size: 11px; background: #fff; }
            .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2.5px solid #4338ca; padding-bottom: 12px; margin-bottom: 16px; }
            .title { font-size: 15px; font-weight: 900; color: #1e1b4b; text-transform: uppercase; letter-spacing: -0.3px; margin: 0; }
            .subtitle { font-size: 9.5px; color: #475569; margin-top: 3px; font-weight: 600; }
            .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
            .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center; }
            .kpi-val { font-size: 15px; font-weight: 900; color: #312e81; }
            .kpi-lbl { font-size: 8px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-top: 3px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th { background: #312e81; color: white; padding: 8px; font-size: 8.5px; font-weight: 800; text-align: left; text-transform: uppercase; letter-spacing: 0.5px; }
            td { padding: 7px 8px; border-bottom: 1px solid #e2e8f0; font-size: 9px; vertical-align: middle; }
            tr:nth-child(even) { background: #f8fafc; }
            .badge-vencido { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; font-weight: 800; padding: 2px 6px; border-radius: 4px; font-size: 8px; }
            .badge-critico { background: #fff7ed; color: #c2410c; border: 1px solid #ffedd5; font-weight: 800; padding: 2px 6px; border-radius: 4px; font-size: 8px; }
            .badge-proximo { background: #fefce8; color: #854d0e; border: 1px solid #fef08a; font-weight: 800; padding: 2px 6px; border-radius: 4px; font-size: 8px; }
            .badge-futuro { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; font-weight: 800; padding: 2px 6px; border-radius: 4px; font-size: 8px; }
            .signatures { margin-top: 45px; display: flex; justify-content: space-around; page-break-inside: avoid; }
            .sig-box { text-align: center; width: 220px; }
            .sig-line { border-top: 1.5px solid #0f172a; margin-bottom: 4px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">ORIMEC FSM — PROYECCIÓN Y RENOVACIÓN DE CONTRATOS</div>
              <div class="subtitle">Informe Ejecutivo de Cartera Comercial, Oportunidades y Clientes Objetivos para Solicitud de Servicios</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 9px; font-weight: 800; color: #4338ca;">ORIMEC ECUADOR</div>
              <div style="font-size: 8.5px; color: #64748b; margin-top: 2px;">${todayStr}</div>
            </div>
          </div>

          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-val">$${totals.totalRiskValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div class="kpi-lbl">Valor Cartera en Riesgo (&le;90d / Vencidos)</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-val">${totals.uniqueTargetClients}</div>
              <div class="kpi-lbl">Clientes Potenciales Objetivo</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-val">${totals.criticosCount + totals.proximosCount}</div>
              <div class="kpi-lbl">Contratos por Vencer (1-90 Días)</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-val">${totals.vencidosCount}</div>
              <div class="kpi-lbl">Contratos Vencidos Sin Renovar</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Nº Contrato</th>
                <th>Cliente / Sede</th>
                <th>Equipos Coberturados</th>
                <th>Valor ($ USD)</th>
                <th>Prioridad</th>
                <th>% Cierre</th>
                <th>Fecha Vencimiento</th>
                <th>Días Restantes</th>
                <th>Estado de Gestión</th>
              </tr>
            </thead>
            <tbody>
              ${projectionsList.map(p => `
                <tr>
                  <td style="font-weight: 800; color: #312e81;">${p.contract.id}</td>
                  <td style="font-weight: 700;">${p.clientName}</td>
                  <td style="font-size: 8.5px; color: #475569;">${(p.contract.equipmentItems || []).map((e: any) => e.name || e.equipmentName).join(', ') || 'Equipos Biomédicos varios'}</td>
                  <td style="font-weight: 900; color: #047857;">$${p.valUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style="font-weight: 700;">${p.priority}</td>
                  <td style="font-weight: 900; color: #0284c7; text-align: center;">${p.closingProbability}%</td>
                  <td style="font-weight: 700;">${p.contract.endDate}</td>
                  <td>
                    <span class="${
                      p.urgencyCategory === 'vencidos' ? 'badge-vencido' :
                      p.urgencyCategory === 'criticos' ? 'badge-critico' :
                      p.urgencyCategory === 'proximos' ? 'badge-proximo' : 'badge-futuro'
                    }">
                      ${p.diffDays < 0 ? `Vencido hace ${Math.abs(p.diffDays)}d` : `${p.diffDays} días restantes`}
                    </span>
                  </td>
                  <td style="font-weight: 800; color: #4338ca;">${p.proposalStatus}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="signatures">
            <div class="sig-box">
              <div class="sig-line"></div>
              <div style="font-weight: 800; font-size: 10px; color: #1e1b4b;">Gerencia Técnica Biomédica</div>
              <div style="font-size: 8.5px; color: #64748b;">ORIMEC Ecuador</div>
            </div>
            <div class="sig-box">
              <div class="sig-line"></div>
              <div style="font-weight: 800; font-size: 10px; color: #1e1b4b;">Gerencia Comercial & Ventas</div>
              <div style="font-size: 8.5px; color: #64748b;">Renovaciones y Solicitud de Contratos</div>
            </div>
          </div>

          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `;

    printWin.document.open();
    printWin.document.write(htmlContent);
    printWin.document.close();
  };

  const handleExportCrmExcelCsv = (projectionsList: any[]) => {
    if (!projectionsList || projectionsList.length === 0) {
      alert("No hay registros en la proyección comercial para exportar.");
      return;
    }

    const headers = [
      'Nº CONTRATO',
      'CLIENTE',
      'CIUDAD / SEDE',
      'TIPO DE CONTRATO',
      'EQUIPOS COBERTURADOS',
      'VALOR CONTRATO (USD)',
      'PRIORIDAD COMERCIAL',
      '% DE CIERRE (PROBABILIDAD)',
      'VALOR PONDERADO (USD)',
      'FECHA INICIO',
      'FECHA VENCIMIENTO',
      'DÍAS RESTANTES',
      'CATEGORÍA URGENCIA',
      'ETAPA CRM (EMBUDO)',
      'NOTAS Y GESTIÓN COMERCIAL'
    ];

    const rows = projectionsList.map(p => {
      const con = p.contract;
      const eqList = (con.equipmentItems || []).map((e: any) => `${e.name || ''}${e.brand ? ` (${e.brand})` : ''}`.trim()).filter(Boolean).join(' | ') || 'Sin especificar';
      const valPonderado = (p.valUSD * p.closingProbability) / 100;

      return [
        `"${(con.id || '').replace(/"/g, '""')}"`,
        `"${(p.clientName || '').replace(/"/g, '""')}"`,
        `"${(con.city || 'N/A').replace(/"/g, '""')}"`,
        `"${(con.type || '').replace(/"/g, '""')}"`,
        `"${eqList.replace(/"/g, '""')}"`,
        p.valUSD ? p.valUSD.toFixed(2) : '0.00',
        `"${p.priority}"`,
        `${p.closingProbability}%`,
        valPonderado.toFixed(2),
        `"${con.startDate || 'N/A'}"`,
        `"${con.endDate || 'N/A'}"`,
        `"${p.urgencyCategory.toUpperCase()}"`,
        `"${(p.stage || '').replace(/"/g, '""')}"`,
        `"${(p.notes || '').replace(/"/g, '""')}"`
      ].join(';');
    });

    const csvContent = "\uFEFF" + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    link.href = URL.createObjectURL(blob);
    link.download = `Proyeccion_CRM_Clientes_ORIMEC_${today}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification(`Exportado exitosamente a Excel (${projectionsList.length} registros)`, 'success');
  };

  const renderContratosSubView = () => {
    return (
      <ContratosTab
        contractsSubTab={contractsSubTab}
        contracts={contracts}
        clients={clients}
        userRole={userRole}
        contractsGE={contractsGE}
        contractSearch={contractSearch}
        setContractSearch={setContractSearch}
        contractValueFilter={contractValueFilter}
        setContractValueFilter={setContractValueFilter}
        contractFilterBrand={contractFilterBrand}
        setContractFilterBrand={setContractFilterBrand}
        contractFilterExpiration={contractFilterExpiration}
        setContractFilterExpiration={setContractFilterExpiration}
        contractDateSort={contractDateSort}
        setContractDateSort={setContractDateSort}
        contractPage={contractPage}
        setContractPage={setContractPage}
        isContractImporterOpen={isContractImporterOpen}
        setIsContractImporterOpen={setIsContractImporterOpen}
        handleContractCsvUpload={handleContractCsvUpload}
        contractCsvError={contractCsvError}
        exportContractsToExcel={exportContractsToExcel}
        getContractExpirationAlert={getContractExpirationAlert}
        setEditingContract={setEditingContract}
        setIsContractModalOpen={setIsContractModalOpen}
        onDeleteContract={onDeleteContract}
        onRenewContract={onRenewContract}
        contractGeSearch={contractGeSearch}
        setContractGeSearch={setContractGeSearch}
        exportContractsGeToExcel={exportContractsGeToExcel}
        isContractGeImporterOpen={isContractGeImporterOpen}
        setIsContractGeImporterOpen={setIsContractGeImporterOpen}
        handleContractGeCsvUpload={handleContractGeCsvUpload}
        contractGeCsvError={contractGeCsvError}
        onClearContractsGE={onClearContractsGE}
        onDeleteContractGE={onDeleteContractGE}
        setEditingContractGE={setEditingContractGE}
        setIsContractGeModalOpen={setIsContractGeModalOpen}
        resetContractForm={() => {
          const today = new Date();
          const currentDateStr = today.toISOString().split('T')[0];
          const nextYear = new Date(today);
          nextYear.setFullYear(nextYear.getFullYear() + 1);
          const nextYearStr = nextYear.toISOString().split('T')[0];

          setEditingContract(null);
          setContractFormId('');
          setContractFormClientId('');
          setContractFormType('Garantía extendida/Contrato');
          setContractFormStart(currentDateStr);
          setContractFormEnd(nextYearStr);
          setContractFormStatus('Activo');
          setContractFormCity('');
          setContractFormValue('');
          setContractFormCoverage('');
          setContractClientSearchQuery('');
          setIsContractClientDropdownOpen(false);
          setIsCreatingNewClientForContract(false);
          setNewContractClientName('');
          setNewContractClientIndustry('');
          setNewContractClientAddress('');
          setNewContractClientContactName('');
          setNewContractClientContactPhone('');
          setContractFormEquipmentItems([]);
          setTempEquipName('');
          setTempEquipBrand('');
          setTempEquipModality('');
          setTempEquipSerial('');
          setTempEquipGon('');
          setContractFormFrequency('Ninguno');
          setContractFormPreferredDay('');
          setContractFormSelectedEquipForFreq('all');
          setContractFormMaintenanceDates([]);
          setTempMaintenanceDate('');
          setContractFormQcDate('');
          setContractFormQcDates([]);
          setContractFormPdfUrl('');
          setContractFormSchedulePdfUrl('');
          setContractFormIsNewEquipment(false);
          setContractFormSrPdfUrl('');
          setContractFormCaPdfUrl('');
          setContractFormPodPdfUrl('');
          setContractFormPendingAdmin(userRole === 'sales');
          setIsContractModalOpen(true);
        }}
        resetContractGeForm={(clientName?: string) => {
          setEditingContractGE(null);
          setGeFormCliente(clientName || '');
          setGeFormSid('');
          setGeFormModalidad('');
          setGeFormEquipo('');
          setGeFormEquipmentNum('');
          setGeFormInvoice('');
          setGeFormInvoiceAmount('');
          setGeFormMonths('');
          setGeFormInvoiceDate('');
          setGeFormDueDate('');
          setGeFormPaymentPeriod('');
          setGeFormMonthNum('');
          setGeFormContractNum('');
          setGeFormObservaciones('');
          setIsContractGeModalOpen(true);
        }}
      />
    );
  };

  const renderProyeccionSubView = () => {
    return (
      <ProyeccionTab
        contracts={contracts}
        clients={clients}
        onUpdateContract={onUpdateContract}
        showNotification={showNotification}
        handleExportCrmExcelCsv={handleExportCrmExcelCsv}
        handlePrintContractProjectionPdf={handlePrintContractProjectionPdf}
        setSelectedContractForDetails={setSelectedContractForDetails}
        setIsContractDetailsModalOpen={setIsContractDetailsModalOpen}
      />
    );
  };

  const renderContratosTab = () => {
    return (
      <div className="space-y-6 font-sans">
        {/* Top Sub-Tab Switcher Capsule */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 max-w-max no-print">
          <button
            onClick={() => setContractsSubTab('garantias')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
              contractsSubTab === 'garantias'
                ? 'bg-white text-indigo-900 shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <span>Gestión de Contratos y Garantías</span>
          </button>

          <button
            onClick={() => setContractsSubTab('ge')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
              contractsSubTab === 'ge'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Contratos con GE</span>
          </button>

          <button
            onClick={() => setContractsSubTab('proyeccion')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
              contractsSubTab === 'proyeccion'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-300" />
            <span>📈 Proyección & Oportunidades (Clientes Potenciales)</span>
          </button>
        </div>

        {contractsSubTab === 'proyeccion' ? (
          renderProyeccionSubView()
        ) : (
          renderContratosSubView()
        )}
      </div>
    );
  };

  const renderCronogramaTab = () => {
    return (
      <CronogramaTab
        calendarMonth={calendarMonth}
        setCalendarMonth={setCalendarMonth}
        calendarYear={calendarYear}
        setCalendarYear={setCalendarYear}
        highlightedEngineerId={highlightedEngineerId}
        setHighlightedEngineerId={setHighlightedEngineerId}
        engineers={engineers}
        getEngineerEmoji={getEngineerEmoji}
        handlePrintCalendar={handlePrintCalendar}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        calendarDays={calendarDays}
        calendarMonthName={calendarMonthName}
        workOrders={workOrders}
        clients={clients}
        getEngineerColorClasses={getEngineerColorClasses}
        matchesSearch={matchesSearch}
        setInfoWO={setInfoWO}
      />
    );
  };

  const renderVacacionesTab = () => {
    return (
      <VacacionesTab
        engineers={engineers}
        vacations={vacations}
        workOrders={workOrders}
        permissions={permissions}
        getEngineerEmoji={getEngineerEmoji}
        getVacationDuration={getVacationDuration}
        getEndDateStr={getEndDateStr}
        isVacationTaken={isVacationTaken}
        formatHoursToDays={formatHoursToDays}
        getYearsInCompanyNum={getYearsInCompanyNum}
        calculateYearsInCompany={calculateYearsInCompany}
        ECUADOR_HOLIDAYS={ECUADOR_HOLIDAYS}
        onAddVacation={onAddVacation}
        onUpdateVacation={onUpdateVacation}
        onDeleteVacation={onDeleteVacation}
        onUpdateEngineer={onUpdateEngineer}
        onAddPermission={onAddPermission}
        onDeletePermission={onDeletePermission}
        vacFormEngId={vacFormEngId}
        setVacFormEngId={setVacFormEngId}
        vacFormStart={vacFormStart}
        setVacFormStart={setVacFormStart}
        vacFormEnd={vacFormEnd}
        setVacFormEnd={setVacFormEnd}
        vacFormNotes={vacFormNotes}
        setVacFormNotes={setVacFormNotes}
        vacFormIncludeWeekends={vacFormIncludeWeekends}
        setVacFormIncludeWeekends={setVacFormIncludeWeekends}
        vacationSubTab={vacationSubTab}
        setVacationSubTab={setVacationSubTab}
        vacEngSearchQuery={vacEngSearchQuery}
        setVacEngSearchQuery={setVacEngSearchQuery}
        vacFormSearchOpen={vacFormSearchOpen}
        setVacFormSearchOpen={setVacFormSearchOpen}
        vacFormSearchQuery={vacFormSearchQuery}
        setVacFormSearchQuery={setVacFormSearchQuery}
        auditEngId={auditEngId}
        setAuditEngId={setAuditEngId}
        permFormType={permFormType}
        setPermFormType={setPermFormType}
        permFormDate={permFormDate}
        setPermFormDate={setPermFormDate}
        permFormHours={permFormHours}
        setPermFormHours={setPermFormHours}
        permFormReason={permFormReason}
        setPermFormReason={setPermFormReason}
        historyEngId={historyEngId}
        setHistoryEngId={setHistoryEngId}
        modalVacIncludeWeekends={modalVacIncludeWeekends}
        setModalVacIncludeWeekends={setModalVacIncludeWeekends}
        EditableNumberInput={EditableNumberInput}
      />
    );
  };

  return (
    <div className="space-y-8" id="admin-portal-root">
      {/* Top Global Admin Navigation Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-2.5 shadow-md no-print mb-6">
        <div className="flex flex-wrap gap-1 md:gap-2">
          {(() => {
            const allAdminTabs = [
              { id: 'agendamiento', label: 'Agendamiento', icon: CalendarRange, color: 'text-indigo-400' },
              { id: 'clientes', label: 'Clientes (Terceros)', icon: Users, color: 'text-sky-400' },
              { id: 'equipos', label: 'Equipos (Activos)', icon: Cpu, color: 'text-emerald-400' },
              { id: 'registro', label: 'Registro MTO', icon: FileSpreadsheet, color: 'text-pink-400' },
              { id: 'contratos', label: 'Contratos', icon: Briefcase, color: 'text-amber-400' },
              { id: 'cronograma', label: 'Cronograma', icon: CalendarIcon, color: 'text-rose-400' },
              { id: 'vacaciones', label: 'Vacaciones', icon: Palmtree, color: 'text-teal-400' },
              { id: 'capacitaciones', label: 'Capacitaciones', icon: BookOpen, color: 'text-purple-400' }
            ];

            const visibleAdminTabs = userRole === 'sales'
              ? allAdminTabs.filter(t => t.id === 'clientes' || t.id === 'contratos')
              : allAdminTabs.filter(t => {
                  if (t.id === 'agendamiento' || t.id === 'cronograma') return effectivePermissions.canViewWorkOrders !== false;
                  if (t.id === 'clientes') return effectivePermissions.canViewClients !== false;
                  if (t.id === 'equipos') return effectivePermissions.canViewEquipments !== false;
                  if (t.id === 'registro') return effectivePermissions.canViewRegistry !== false;
                  if (t.id === 'contratos') return effectivePermissions.canViewContracts !== false;
                  if (t.id === 'vacaciones') return effectivePermissions.canViewVacations !== false;
                  if (t.id === 'capacitaciones') return effectivePermissions.canViewTrainings !== false;
                  return true;
                });

            return visibleAdminTabs.map(tab => {
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
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : tab.color}`} />
                  <span>{tab.label}</span>
                </button>
              );
            });
          })()}
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
                {effectivePermissions.canCreateWorkOrders !== false && (
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
                )}
                {effectivePermissions.canCreateWorkOrders !== false && (
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
                )}
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

                {effectivePermissions.canEditWorkOrders !== false && (
                  <button
                    type="button"
                    onClick={handleSmartReorganize}
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    title="Reorganizar agenda inteligentemente según carga horaria e ingenieros por ciudad"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Reorganizar Agenda</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setFilterOnlyConflicting(!filterOnlyConflicting)}
                  className={`font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border ${
                    filterOnlyConflicting
                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 font-bold'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                  title="Filtrar u ocultar mantenimientos con cruce de horario"
                >
                  <AlertTriangle className={`w-3.5 h-3.5 ${filterOnlyConflicting ? 'text-amber-600' : 'text-amber-500'}`} />
                  <span>{filterOnlyConflicting ? 'Ver Todos' : 'Horarios Cruzados'}</span>
                  {conflictingWOIds.size > 0 && (
                    <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.2 rounded-full border border-amber-200">
                      {conflictingWOIds.size}
                    </span>
                  )}
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

                {effectivePermissions.canDeleteWorkOrders !== false && (
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
                )}
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
                      className="bg-emerald-50 hover:bg-emerald-150 text-emerald-700 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
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
                                  className="bg-white border border-slate-200 rounded px-2 py-0.5 text-3xs font-extrabold text-slate-700 outline-hidden"
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
                                  className="bg-white border border-slate-200 rounded px-2 py-0.5 text-3xs font-extrabold text-slate-700 outline-hidden"
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
                                  detectedFormatType === 'reportes' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
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
                          className="bg-white border border-indigo-200 rounded px-2 py-0.5 text-xs font-extrabold text-indigo-900 cursor-pointer outline-hidden"
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
                          className="bg-white border border-indigo-200 rounded px-2 py-0.5 text-xs font-extrabold text-indigo-900 cursor-pointer outline-hidden"
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
                      className="bg-white border border-indigo-200 rounded-lg pl-8 pr-7 py-1 text-xs font-semibold text-slate-700 outline-hidden focus:ring-1 focus:ring-indigo-500 placeholder-slate-400 w-44 md:w-56 transition-all"
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

                </div>
              </div>

              {/* Top Banners for Reorganization Preview */}
              {isReorganizePreviewMode && (
                <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-amber-600 text-white p-3.5 rounded-xl shadow-md flex flex-col md:flex-row items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-amber-300 shrink-0 animate-pulse" />
                    <div>
                      <h5 className="font-extrabold text-xs uppercase tracking-wider text-amber-200">Vista Previa: Agenda Reorganizada por Especialización y Capacitaciones</h5>
                      <p className="text-[11px] text-slate-100 font-medium mt-0.5">Se redistribuyeron {reassignedWOIds.size} órdenes emparejando la especialidad y modalidades acreditadas de cada técnico (GE, FE, CT, MR, RX, US, MAMO) con la carga horaria y sedes.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                    <button
                      type="button"
                      onClick={handleApplyReorganization}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Aplicar Cambios</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelReorganizationPreview}
                      className="bg-white/20 hover:bg-white/30 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 border border-white/30"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Volver al Original</span>
                    </button>
                  </div>
                </div>
              )}



              {/* Calendar grid split by weeks to allow horizontal 1-page-per-week print layout */}
              {(() => {
                const flatDays = calendarDays;
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
                        const keyStr = cell && cell.key ? cell.key.toString() : '';
                        if (!keyStr || keyStr.includes('blank')) {
                          return { type: 'placeholder' as const };
                        }
                        if (keyStr.includes('prev-')) {
                          const prevDay = parseInt(keyStr.split('prev-')[1], 10);
                          if (!isNaN(prevDay)) {
                            const prevMonthYear = calendarMonth === 1 ? calendarYear - 1 : calendarYear;
                            const prevMonth = calendarMonth === 1 ? 12 : calendarMonth - 1;
                            const dateStr = `${prevMonthYear}-${prevMonth.toString().padStart(2, '0')}-${prevDay.toString().padStart(2, '0')}`;
                            return { type: 'day' as const, dayNum: prevDay, dateStr };
                          }
                        }
                        if (keyStr.includes('next-')) {
                          const nextDay = parseInt(keyStr.split('next-')[1], 10);
                          if (!isNaN(nextDay)) {
                            const nextMonthYear = calendarMonth === 12 ? calendarYear + 1 : calendarYear;
                            const nextMonth = calendarMonth === 12 ? 1 : calendarMonth + 1;
                            const dateStr = `${nextMonthYear}-${nextMonth.toString().padStart(2, '0')}-${nextDay.toString().padStart(2, '0')}`;
                            return { type: 'day' as const, dayNum: nextDay, dateStr };
                          }
                        }
                        const dayNum = parseInt(keyStr.replace(/[^0-9]/g, ''), 10);
                        if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 31) {
                          const dateStr = `${calendarYear}-${calendarMonth.toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
                          return { type: 'day' as const, dayNum, dateStr };
                        }
                        return { type: 'placeholder' as const };
                      });

                      const isWorkOrderActiveOnDate = (wo: WorkOrder, dateStr: string) => {
                        if (!wo.durationDays || wo.durationDays <= 1) return wo.plannedDate === dateStr;
                        const start = new Date(wo.plannedDate + 'T00:00:00');
                        const target = new Date(dateStr + 'T00:00:00');
                        const end = new Date(start);
                        end.setDate(start.getDate() + (wo.durationDays - 1));
                        return target >= start && target <= end;
                      };

                      const weekMultiDayWOs = workOrders
                        .filter(wo => {
                          if (!wo.durationDays || wo.durationDays <= 1) return false;
                          return weekDaysData.some(day => day.type === 'day' && isWorkOrderActiveOnDate(wo, day.dateStr));
                        })
                        .sort((a, b) => {
                          if (a.plannedDate !== b.plannedDate) return a.plannedDate.localeCompare(b.plannedDate);
                          return (b.durationDays || 1) - (a.durationDays || 1);
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
                            return eStart !== -1 && eStart < colStart + colSpan && colStart < eStart + eSpan;
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
                        <div key={wIndex} style={{ display: 'flex', flexDirection: 'column' }} className={`calendar-week-container bg-white rounded-xl border border-slate-200 mb-4 overflow-hidden shadow-2xs print:mb-6 print:border-slate-200 ${shouldBreakAfter ? 'print-break-after' : ''}`}>
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
                            <div className="bg-slate-50 py-1.5 border-b border-slate-200 space-y-1">

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
                                            {client?.name || 'Cliente'} - {wo.equipmentName} {eng ? `(${getEngineerFullNameNoTitle(eng.name)})` : ''}
                                          </span>
                                          {supportIds.length > 0 && (
                                            <span className="text-[7.5px] font-medium text-slate-500 shrink-0 flex items-center gap-1">
                                              {supportIds.map(id => {
                                                const sEng = engineers.find(e => e.id === id);
                                                if (!sEng) return null;
                                                return (
                                                  <span key={id} className="flex items-center gap-0.5">
                                                    + {getEngineerEmoji(sEng.id)} {getEngineerFullNameNoTitle(sEng.name)}
                                                  </span>
                                                );
                                              })}
                                            </span>
                                          )}
                                        </div>
                                        
                                        <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-full border shrink-0 ${
                                          wo.isEquipmentDown ? 'bg-red-100 text-red-800 border-red-200' :
                                          wo.status === 'Conciliado' ? 'bg-emerald-100/60 text-emerald-800 border-emerald-200' :
                                          wo.status === 'Reportado' ? 'bg-indigo-100/60 text-indigo-800 border-indigo-200' :
                                          wo.status === 'Realizado' ? 'bg-blue-100/60 text-blue-800 border-blue-200' :
                                          wo.status === 'En Proceso' ? 'bg-sky-100/60 text-sky-800 border-sky-200' :
                                          'bg-yellow-100/60 text-yellow-800 border-yellow-200'
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
                  <ClipboardList className="w-4 h-4 text-indigo-600" />
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
                  <span className="text-indigo-600 font-bold text-xs shrink-0 font-mono">📢 GUÍA DE CONCILIACIÓN DE REPORTES:</span>
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
                      const client = clients.find(c => c.id === wo.clientId || c.name.trim().toLowerCase() === (wo.clientId || '').trim().toLowerCase());
                      const clientDisplayName = client ? client.name : (wo.clientId && wo.clientId !== 'fsm_placeholder' ? wo.clientId : 'Cliente');
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
                            <p className="font-bold text-slate-800">{clientDisplayName}</p>
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
            {/* Engineer Filter & Exclusion Modal */}
            {showEngFilterModal && (
              <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150 no-print">
                <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">Selección y Filtrado de Técnicos</h4>
                        <p className="text-3xs text-slate-500 font-medium">Excluye técnicos inactivos o de otras áreas del Dashboard e Informe PDF</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowEngFilterModal(false)}
                      className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer p-1"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-1 pb-1">
                    <button
                      type="button"
                      onClick={() => {
                        const zeroTaskEngIds = engineers.filter(e => {
                          const engOrders = filteredDashOrders.filter(wo => wo.engineerId === e.id || wo.supportEngineerId === e.id || wo.supportEngineerIds?.includes(e.id));
                          return engOrders.length === 0;
                        }).map(e => e.id);
                        setExcludedEngIds(zeroTaskEngIds);
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <span>⚡ Ocultar Técnicos sin Tareas (0)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setExcludedEngIds([])}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <span>✅ Incluir Todos ({engineers.length})</span>
                    </button>
                  </div>

                  {/* Engineers Checklist List */}
                  <div className="max-h-72 overflow-y-auto custom-scrollbar border border-slate-200 rounded-xl divide-y divide-slate-100">
                    {engineers.map(eng => {
                      const engOrdersCount = filteredDashOrders.filter(wo => wo.engineerId === eng.id || wo.supportEngineerId === eng.id || wo.supportEngineerIds?.includes(eng.id)).length;
                      const isIncluded = !excludedEngIds.includes(eng.id);

                      return (
                        <label
                          key={eng.id}
                          className={`flex items-center justify-between p-2.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                            !isIncluded ? 'opacity-50 bg-slate-50/50' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isIncluded}
                              onChange={() => {
                                if (isIncluded) {
                                  setExcludedEngIds(prev => [...prev, eng.id]);
                                } else {
                                  setExcludedEngIds(prev => prev.filter(id => id !== eng.id));
                                }
                              }}
                              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                            />
                            <div>
                              <span className="font-bold text-xs text-slate-800 block">{eng.name}</span>
                              <span className="text-3xs text-slate-400">{eng.specialty || 'Ingeniero Biomédico'} • {eng.location || 'Sede'}</span>
                            </div>
                          </div>

                          <span className={`text-2xs font-extrabold px-2.5 py-0.5 rounded-full ${
                            engOrdersCount > 0 ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {engOrdersCount} tareas
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  {/* Modal Footer */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-xs font-bold text-slate-600">
                      Incluidos: <strong className="text-indigo-600">{engineers.length - excludedEngIds.length}</strong> de {engineers.length} técnicos
                    </span>

                    <button
                      type="button"
                      onClick={() => setShowEngFilterModal(false)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-sm"
                    >
                      Aplicar Filtro al Informe
                    </button>
                  </div>
                </div>
              </div>
            )}
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

                <button
                  type="button"
                  onClick={() => setShowEngFilterModal(true)}
                  className={`font-bold text-2xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs hover:shadow-md border ${
                    excludedEngIds.length > 0
                      ? 'bg-amber-500 text-slate-950 border-amber-600 hover:bg-amber-400 font-extrabold animate-pulse'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                  title="Filtrar o Excluir Técnicos del Informe"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>
                    {excludedEngIds.length > 0
                      ? `Técnicos (${engineers.length - excludedEngIds.length}/${engineers.length})`
                      : 'Filtrar Técnicos'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleExportDashboardCSV}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-2xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm hover:shadow-md ml-1"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Exportar Excel</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintMainDashboard}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-2xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm hover:shadow-md"
                  title="Imprimir o Guardar en PDF Dashboard Principal de Rendimiento"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Dashboard</span>
                </button>
              </div>
            </div>

            {/* KPI Cards Row (Expanded 6 Interactive Cards Minucioso) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {/* KPI 1: Total Orders */}
              <button
                type="button"
                onClick={() => setExpandedMainKPICard(prev => prev === 'mantenimientos' ? null : 'mantenimientos')}
                className={`bg-white border rounded-xl p-3.5 text-left shadow-xs relative overflow-hidden group hover:shadow-md transition-all cursor-pointer ${
                  expandedMainKPICard === 'mantenimientos' ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/20' : 'border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div className="absolute top-0 left-0 h-1 bg-indigo-500 w-full" />
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Mantenimientos</span>
                    <h3 className="text-xl font-black text-indigo-900 mt-1">{dashboardKPIs.totalOrders}</h3>
                    <p className="text-[8.5px] text-indigo-700 mt-0.5 font-semibold flex items-center gap-1">
                      <span>Órdenes del periodo</span>
                      <span className="text-[7.5px] bg-indigo-100 text-indigo-800 px-1 rounded font-bold">🔍 Ver</span>
                    </p>
                  </div>
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0 group-hover:scale-110 transition-transform">
                    <CalendarRange className="w-4 h-4" />
                  </div>
                </div>
              </button>

              {/* KPI 2: Total Worked Field Hours */}
              <button
                type="button"
                onClick={() => setExpandedMainKPICard(prev => prev === 'horas' ? null : 'horas')}
                className={`bg-white border rounded-xl p-3.5 text-left shadow-xs relative overflow-hidden group hover:shadow-md transition-all cursor-pointer ${
                  expandedMainKPICard === 'horas' ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/20' : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="absolute top-0 left-0 h-1 bg-blue-600 w-full" />
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Horas Campo</span>
                    <h3 className="text-xl font-black text-blue-700 mt-1">{dashboardKPIs.totalReportHours} hrs</h3>
                    <p className="text-[8.5px] text-blue-800 mt-0.5 font-semibold flex items-center gap-1">
                      <span>Prom. {dashboardKPIs.avgHoursPerEngineer} h/téc</span>
                      <span className="text-[7.5px] bg-blue-100 text-blue-800 px-1 rounded font-bold">🔍 Ver</span>
                    </p>
                  </div>
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0 group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                </div>
              </button>

              {/* KPI 3: Installation & Project Days */}
              <button
                type="button"
                onClick={() => setExpandedMainKPICard(prev => prev === 'instalaciones' ? null : 'instalaciones')}
                className={`bg-white border rounded-xl p-3.5 text-left shadow-xs relative overflow-hidden group hover:shadow-md transition-all cursor-pointer ${
                  expandedMainKPICard === 'instalaciones' ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/20' : 'border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div className="absolute top-0 left-0 h-1 bg-emerald-600 w-full" />
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Instalaciones</span>
                    <h3 className="text-xl font-black text-emerald-700 mt-1">{dashboardKPIs.totalInstallationCount} {dashboardKPIs.totalInstallationCount === 1 ? 'Proyecto' : 'Proyectos'}</h3>
                    <p className="text-[8.5px] text-emerald-800 mt-0.5 font-extrabold flex items-center gap-1">
                      <span>{dashboardKPIs.totalInstallationDays} Días ({dashboardKPIs.totalInstallationDays * 8}h)</span>
                      <span className="text-[7.5px] bg-emerald-100 text-emerald-800 px-1 rounded font-bold">🔍 Ver</span>
                    </p>
                  </div>
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 group-hover:scale-110 transition-transform">
                    <Briefcase className="w-4 h-4" />
                  </div>
                </div>
              </button>

              {/* KPI 4: Average Workload */}
              <button
                type="button"
                onClick={() => setExpandedMainKPICard(prev => prev === 'carga' ? null : 'carga')}
                className={`bg-white border rounded-xl p-3.5 text-left shadow-xs relative overflow-hidden group hover:shadow-md transition-all cursor-pointer ${
                  expandedMainKPICard === 'carga' ? 'ring-2 ring-teal-500 border-teal-500 bg-teal-50/20' : 'border-slate-200 hover:border-teal-300'
                }`}
              >
                <div className="absolute top-0 left-0 h-1 bg-teal-500 w-full" />
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Promedio Carga</span>
                    <h3 className="text-xl font-black text-teal-700 mt-1">{dashboardKPIs.averageJobs}</h3>
                    <p className="text-[8.5px] text-teal-800 mt-0.5 font-semibold flex items-center gap-1">
                      <span>Tareas por técnico</span>
                      <span className="text-[7.5px] bg-teal-100 text-teal-800 px-1 rounded font-bold">🔍 Ver</span>
                    </p>
                  </div>
                  <div className="p-2.5 bg-teal-50 text-teal-650 rounded-lg shrink-0 group-hover:scale-110 transition-transform">
                    <Percent className="w-4 h-4" />
                  </div>
                </div>
              </button>

              {/* KPI 5: Top Performer */}
              <button
                type="button"
                onClick={() => setExpandedMainKPICard(prev => prev === 'topPerformer' ? null : 'topPerformer')}
                className={`bg-white border rounded-xl p-3.5 text-left shadow-xs relative overflow-hidden group hover:shadow-md transition-all cursor-pointer ${
                  expandedMainKPICard === 'topPerformer' ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/20' : 'border-slate-200 hover:border-amber-300'
                }`}
              >
                <div className="absolute top-0 left-0 h-1 bg-amber-500 w-full" />
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Mayor Carga</span>
                    <h3 className="text-xs font-black text-amber-800 mt-1.5 truncate max-w-[110px]">{dashboardKPIs.topEngineerName}</h3>
                    <p className="text-[8.5px] text-amber-800 mt-0.5 font-semibold flex items-center gap-1">
                      <span>Técnico líder</span>
                      <span className="text-[7.5px] bg-amber-100 text-amber-800 px-1 rounded font-bold">🔍 Ver</span>
                    </p>
                  </div>
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg shrink-0 group-hover:scale-110 transition-transform">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
              </button>

              {/* KPI 6: Completion rate */}
              <button
                type="button"
                onClick={() => setExpandedMainKPICard(prev => prev === 'cierre' ? null : 'cierre')}
                className={`bg-white border rounded-xl p-3.5 text-left shadow-xs relative overflow-hidden group hover:shadow-md transition-all cursor-pointer ${
                  expandedMainKPICard === 'cierre' ? 'ring-2 ring-indigo-600 border-indigo-600 bg-indigo-50/20' : 'border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div className="absolute top-0 left-0 h-1 bg-indigo-600 w-full" />
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Tasa de Cierre</span>
                    <h3 className="text-xl font-black text-emerald-700 mt-1">{dashboardKPIs.complianceRate}%</h3>
                    <p className="text-[8.5px] text-emerald-800 mt-0.5 font-semibold flex items-center gap-1">
                      <span>Avance general</span>
                      <span className="text-[7.5px] bg-emerald-100 text-emerald-800 px-1 rounded font-bold">🔍 Ver</span>
                    </p>
                  </div>
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
              </button>
            </div>

            {/* Specialized Expanded Drawer for Clicked KPI Card */}
            {expandedMainKPICard && (
              <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl border border-slate-800 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    {expandedMainKPICard === 'mantenimientos' && <CalendarRange className="w-5 h-5 text-indigo-400" />}
                    {expandedMainKPICard === 'horas' && <BarChart3 className="w-5 h-5 text-blue-400" />}
                    {expandedMainKPICard === 'instalaciones' && <Briefcase className="w-5 h-5 text-emerald-400" />}
                    {expandedMainKPICard === 'carga' && <Percent className="w-5 h-5 text-teal-400" />}
                    {expandedMainKPICard === 'topPerformer' && <Award className="w-5 h-5 text-amber-400" />}
                    {expandedMainKPICard === 'cierre' && <TrendingUp className="w-5 h-5 text-emerald-400" />}
                    
                    <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-100">
                      {expandedMainKPICard === 'mantenimientos' && `Desglose Especializado de Mantenimientos (${dashboardKPIs.totalOrders} Órdenes totales)`}
                      {expandedMainKPICard === 'horas' && `Análisis Especializado de Horas Campo (${dashboardKPIs.totalReportHours} hrs en periodo)`}
                      {expandedMainKPICard === 'instalaciones' && `Proyectos Especiales de Instalación (${dashboardKPIs.totalInstallationCount} Proyectos / ${dashboardKPIs.totalInstallationDays} Días)`}
                      {expandedMainKPICard === 'carga' && `Análisis de Capacidad y Distribución de Carga (${dashboardKPIs.averageJobs} tareas/téc)`}
                      {expandedMainKPICard === 'topPerformer' && `Clasificación y Liderazgo Operativo de Ingenieros`}
                      {expandedMainKPICard === 'cierre' && `Tasa de Cierre y Gestión de Cumplimiento (${dashboardKPIs.complianceRate}%)`}
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedMainKPICard(null)}
                    className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1 rounded-lg cursor-pointer transition-colors"
                  >
                    ✕ Ocultar Desglose
                  </button>
                </div>

                {/* Specialized Content per Card */}
                {expandedMainKPICard === 'mantenimientos' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-center">
                        <span className="text-3xs text-indigo-400 font-bold uppercase block">Preventivos</span>
                        <span className="text-lg font-black text-indigo-300">{dashboardKPIs.totalPreventiveCount}</span>
                      </div>
                      <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-center">
                        <span className="text-3xs text-amber-400 font-bold uppercase block">Correctivos</span>
                        <span className="text-lg font-black text-amber-300">{dashboardKPIs.totalCorrectiveCount}</span>
                      </div>
                      <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-center">
                        <span className="text-3xs text-emerald-400 font-bold uppercase block">Instalaciones</span>
                        <span className="text-lg font-black text-emerald-300">{dashboardKPIs.totalInstallationCount}</span>
                      </div>
                      <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-center">
                        <span className="text-3xs text-purple-400 font-bold uppercase block">Inspecciones</span>
                        <span className="text-lg font-black text-purple-300">{dashboardKPIs.totalInspectionCount}</span>
                      </div>
                      <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-center">
                        <span className="text-3xs text-teal-400 font-bold uppercase block">Tasa de Cierre</span>
                        <span className="text-lg font-black text-teal-300">{dashboardKPIs.complianceRate}%</span>
                      </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto custom-scrollbar border border-slate-800 rounded-xl">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-800 text-slate-400 uppercase text-[9px] sticky top-0">
                          <tr>
                            <th className="p-2.5">Código WO</th>
                            <th className="p-2.5">Cliente / Institución</th>
                            <th className="p-2.5">Equipo</th>
                            <th className="p-2.5">Técnico Principal</th>
                            <th className="p-2.5">Fecha</th>
                            <th className="p-2.5 text-center">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {filteredDashOrders.map(wo => {
                            const eng = engineers.find(e => e.id === wo.engineerId);
                            const effStatus = getWOEffectiveStatus(wo);
                            return (
                              <tr key={wo.id} className="hover:bg-slate-800/50">
                                <td className="p-2 font-mono font-bold text-indigo-300 text-[10px]">{wo.id}</td>
                                <td className="p-2 font-medium">{getWOClientDisplayName(wo)}</td>
                                <td className="p-2 text-slate-400">{wo.equipmentName}</td>
                                <td className="p-2 text-slate-300">{eng ? eng.name : 'No asignado'}</td>
                                <td className="p-2 text-slate-400 font-mono text-[10px]">{wo.plannedDate}</td>
                                <td className="p-2 text-center">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                    effStatus === 'Conciliado' || effStatus === 'Reportado' || effStatus === 'Realizado'
                                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                                  }`}>
                                    {effStatus}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {expandedMainKPICard === 'horas' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400">
                      Horas estimadas y ejecutadas por los ingenieros según la agenda de trabajo y reportes técnicos digitales (RE-TE-04):
                    </p>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar border border-slate-800 rounded-xl">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-800 text-slate-400 uppercase text-[9px] sticky top-0">
                          <tr>
                            <th className="p-2.5">Ingeniero</th>
                            <th className="p-2.5 text-center">Asignaciones</th>
                            <th className="p-2.5 text-right">Horas Campo</th>
                            <th className="p-2.5 text-right">Promedio / Tarea</th>
                            <th className="p-2.5 text-right">% del Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {engineerStats.map(st => {
                            const pct = dashboardKPIs.totalReportHours > 0 
                              ? Math.round((st.hoursSpent / dashboardKPIs.totalReportHours) * 100) 
                              : 0;
                            const avgTask = st.total > 0 ? (st.hoursSpent / st.total).toFixed(1) : '0';
                            return (
                              <tr key={st.engineer.id} className="hover:bg-slate-800/50">
                                <td className="p-2.5 font-bold text-white flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                                  <span>{st.engineer.name}</span>
                                </td>
                                <td className="p-2.5 text-center font-semibold text-slate-300">{st.total} tareas</td>
                                <td className="p-2.5 text-right font-black text-blue-400 text-sm">{st.hoursSpent} hrs</td>
                                <td className="p-2.5 text-right font-mono text-slate-400">{avgTask} h/tarea</td>
                                <td className="p-2.5 text-right font-bold text-indigo-300">{pct}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {expandedMainKPICard === 'instalaciones' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400">
                      Listado deduplicado de proyectos especiales de instalación y montaje técnico con su duración en días y horas laborables asociadas (8h/día):
                    </p>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar border border-slate-800 rounded-xl">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-800 text-slate-400 uppercase text-[9px] sticky top-0">
                          <tr>
                            <th className="p-2.5">Código WO</th>
                            <th className="p-2.5">Cliente / Clínica</th>
                            <th className="p-2.5">Equipo a Instalar</th>
                            <th className="p-2.5">Técnico Asignado</th>
                            <th className="p-2.5 text-center">Duración</th>
                            <th className="p-2.5 text-center">Horas Lab.</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {filteredDashOrders.filter(isInstallationWO).map(wo => {
                            const eng = engineers.find(e => e.id === wo.engineerId);
                            const days = wo.durationDays && wo.durationDays > 0 ? wo.durationDays : 1;
                            return (
                              <tr key={wo.id} className="hover:bg-slate-800/50">
                                <td className="p-2.5 font-mono font-bold text-emerald-400 text-[10px]">{wo.id}</td>
                                <td className="p-2.5 font-semibold text-white">{getWOClientDisplayName(wo)}</td>
                                <td className="p-2.5 text-slate-300">{wo.equipmentName}</td>
                                <td className="p-2.5 text-slate-400">{eng ? eng.name : 'No asignado'}</td>
                                <td className="p-2.5 text-center font-bold text-emerald-300">{days} {days === 1 ? 'Día' : 'Días'}</td>
                                <td className="p-2.5 text-center font-bold text-slate-200">{days * 8} hrs</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {expandedMainKPICard === 'carga' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400">
                      Balance de carga de trabajo entre el equipo técnico (Promedio esperado: <strong className="text-teal-300">{dashboardKPIs.averageJobs} tareas</strong>):
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {engineerStats.map(st => {
                        const diff = (st.total - dashboardKPIs.averageJobs).toFixed(1);
                        const isHigh = st.total > dashboardKPIs.averageJobs * 1.2;
                        const isLow = st.total < dashboardKPIs.averageJobs * 0.7;
                        return (
                          <div key={st.engineer.id} className="bg-slate-800/90 p-3 rounded-xl border border-slate-700 flex items-center justify-between">
                            <div>
                              <h5 className="font-bold text-sm text-white">{st.engineer.name}</h5>
                              <p className="text-3xs text-slate-400 mt-0.5">
                                {st.asPrimary} Principal / {st.asSupport} Apoyo ({st.hoursSpent} hrs)
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-black text-white">{st.total} tareas</span>
                              <span className={`block text-[9px] font-bold ${
                                isHigh ? 'text-amber-400' : isLow ? 'text-blue-400' : 'text-emerald-400'
                              }`}>
                                {isHigh ? '🔴 Carga Alta' : isLow ? '🟡 Carga Baja' : '🟢 Carga Óptima'} ({diff > '0' ? `+${diff}` : diff})
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {expandedMainKPICard === 'topPerformer' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400">
                      Ranking del personal técnico con mayor volumen de asignaciones operativas en el periodo:
                    </p>
                    <div className="space-y-2">
                      {engineerStats.slice(0, 5).map((st, idx) => (
                        <div key={st.engineer.id} className="bg-slate-800/90 p-3 rounded-xl border border-slate-700 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                              idx === 0 ? 'bg-amber-500 text-slate-950' : idx === 1 ? 'bg-slate-300 text-slate-950' : 'bg-slate-700 text-slate-200'
                            }`}>
                              #{idx + 1}
                            </span>
                            <div>
                              <h5 className="font-bold text-sm text-white">{st.engineer.name}</h5>
                              <p className="text-3xs text-slate-400">{st.engineer.specialty || 'Ingeniero Biomédico'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-base font-black text-amber-400">{st.total} Asignaciones</span>
                            <p className="text-[9px] text-slate-400 font-medium">{st.hoursSpent} hrs en campo</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {expandedMainKPICard === 'cierre' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400">
                      Tasa de finalización y conciliación global de trabajos en el periodo. Muestra el estado del avance operacional:
                    </p>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar border border-slate-800 rounded-xl">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-800 text-slate-400 uppercase text-[9px] sticky top-0">
                          <tr>
                            <th className="p-2.5">Ingeniero</th>
                            <th className="p-2.5 text-center">Completadas</th>
                            <th className="p-2.5 text-center">Pendientes</th>
                            <th className="p-2.5 text-right">Tasa de Cierre</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {engineerStats.map(st => {
                            const done = (st.statusCounts.Realizado || 0) + (st.statusCounts.Reportado || 0) + (st.statusCounts.Conciliado || 0);
                            const pending = (st.statusCounts.Pendiente || 0) + (st.statusCounts.EnProceso || 0);
                            const rate = st.total > 0 ? Math.round((done / st.total) * 100) : 0;
                            return (
                              <tr key={st.engineer.id} className="hover:bg-slate-800/50">
                                <td className="p-2.5 font-bold text-white">{st.engineer.name}</td>
                                <td className="p-2.5 text-center font-bold text-emerald-400">{done}</td>
                                <td className="p-2.5 text-center font-bold text-amber-400">{pending}</td>
                                <td className="p-2.5 text-right">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                    rate >= 80 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                                  }`}>
                                    {rate}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Chart and Table grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* SVG Donut Chart (Col-5) */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col">
                <div>
                  <h5 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <PieChart className="w-4 h-4 text-indigo-650" />
                    <span>Distribución de Carga por Técnico</span>
                  </h5>
                  <p className="text-3xs text-slate-500 mt-0.5">Distribución porcentual del número total de órdenes (incluye apoyo).</p>
                </div>

                {(() => {
                  const totalWorkload = engineerStats.reduce((acc, st) => acc + st.total, 0);
                  
                  if (totalWorkload === 0) {
                    return (
                      <div className="flex-1 flex flex-col items-center justify-center text-3xs text-slate-400 font-bold gap-2 py-8 mt-6">
                        <div className="w-24 h-24 rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center text-[10px] text-slate-350">
                          0%
                        </div>
                        <span>Sin datos de asignaciones en este periodo</span>
                      </div>
                    );
                  }

                  let accumulatedPercentage = 0;
                  const slices = engineerStats
                    .filter(st => st.total > 0)
                    .map(st => {
                      const pct = st.total / totalWorkload;
                      const strokeDasharray = `${pct * 188.5} 188.5`;
                      const strokeDashoffset = 188.5 - (accumulatedPercentage * 188.5);
                      accumulatedPercentage += pct;
                      return {
                        ...st,
                        percentage: pct,
                        strokeDasharray,
                        strokeDashoffset,
                        hexColor: getEngineerHexColor(st.engineer.id)
                      };
                    });

                  return (
                    <div className="flex-1 flex flex-col items-center gap-6 mt-4 w-full">
                      {/* Donut circle - Large */}
                      <div className="relative w-64 h-64 sm:w-72 sm:h-72 shrink-0 animate-fade-in">
                        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                          {/* Background base circle */}
                          <circle cx="50" cy="50" r="30" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                          
                          {slices.map((slice) => (
                            <circle
                              key={slice.engineer.id}
                              cx="50"
                              cy="50"
                              r="30"
                              fill="transparent"
                              stroke={slice.hexColor}
                              strokeWidth="12"
                              strokeDasharray={slice.strokeDasharray}
                              strokeDashoffset={slice.strokeDashoffset}
                              className="transition-all hover:stroke-[14] cursor-pointer"
                              title={`${slice.engineer.name}: ${slice.total} (${Math.round(slice.percentage * 100)}%)`}
                              onClick={() => {
                                setSelectedEngForMetrics(slice.engineer);
                                setIsEngMetricsModalOpen(true);
                              }}
                            />
                          ))}
                        </svg>
                        
                        {/* Center text inside the Donut hole */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                          <span className="text-3xl sm:text-4xl font-black text-slate-800 leading-none">{totalWorkload}</span>
                          <span className="text-[9px] sm:text-[10px] font-bold text-slate-450 uppercase tracking-widest mt-2">Total</span>
                          <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">Órdenes</span>
                        </div>
                      </div>

                      {/* Donut Legend - Grid format below the chart */}
                      <div className="w-full grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2 max-h-[180px] overflow-y-auto no-scrollbar border-t border-slate-100 pt-4">
                        {slices.map(slice => (
                          <div 
                            key={slice.engineer.id}
                            onClick={() => {
                              setSelectedEngForMetrics(slice.engineer);
                              setIsEngMetricsModalOpen(true);
                            }}
                            className="flex items-center justify-between text-3xs font-semibold hover:bg-slate-50 p-1.5 rounded-lg cursor-pointer transition-colors border border-slate-100 bg-slate-50/30"
                          >
                            <div className="flex items-center gap-1.5 truncate max-w-[120px]">
                              <span 
                                className="w-2 h-2 rounded-full shrink-0" 
                                style={{ backgroundColor: slice.hexColor }} 
                              />
                              <span className="text-[9.5px] text-slate-700 truncate leading-tight">
                                {getEngineerEmoji(slice.engineer.id)} {slice.engineer.name.replace('Ing. ', '').split(' ')[0]}
                              </span>
                            </div>
                            <span className="text-[9.5px] font-black text-slate-800 shrink-0 ml-1">
                              {slice.total} ({Math.round(slice.percentage * 100)}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
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
                        <th className="p-2.5 text-center font-bold text-blue-700">Horas Campo</th>
                        <th className="p-2.5 text-center font-bold text-emerald-700">Instalaciones (Días)</th>
                        <th className="p-2.5 text-center">Como Principal / Apoyo</th>
                        <th className="p-2.5">Estado / Avance Proporcional</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white font-medium">
                      {engineerStats.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-4 text-center text-slate-400 font-bold text-3xs">
                            No se encontraron registros de ingenieros para este periodo
                          </td>
                        </tr>
                      ) : (
                        engineerStats.map(st => {
                          const total = st.total;
                          const completed = st.statusCounts.Conciliado + st.statusCounts.Realizado + st.statusCounts.Reportado;
                          const pending = st.statusCounts.Pendiente;
                          const inProgress = st.statusCounts['En Proceso'];

                          const conciliadoPct = total > 0 ? (st.statusCounts.Conciliado / total) * 100 : 0;
                          const realizadoPct = total > 0 ? (st.statusCounts.Realizado / total) * 100 : 0;
                          const reportadoPct = total > 0 ? (st.statusCounts.Reportado / total) * 100 : 0;
                          const enProcesoPct = total > 0 ? (st.statusCounts['En Proceso'] / total) * 100 : 0;
                          const pendientePct = total > 0 ? (st.statusCounts.Pendiente / total) * 100 : 0;

                          return (
                            <tr 
                              key={st.engineer.id} 
                              onClick={() => {
                                setSelectedEngForMetrics(st.engineer);
                                setIsEngMetricsModalOpen(true);
                              }}
                              className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                            >
                              <td className="p-2.5 flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-slate-100 text-sm flex items-center justify-center border border-slate-200 shrink-0">
                                  {getEngineerEmoji(st.engineer.id)}
                                </div>
                                <div className="truncate">
                                  <h6 className="font-extrabold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors flex items-center gap-1">
                                    <span>{st.engineer.name}</span>
                                    <ExternalLink className="w-2.5 h-2.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </h6>
                                  <p className="text-[9px] text-slate-400 font-medium">
                                    {st.engineer.specialty} • <span className="text-slate-600 font-bold">{st.engineer.sede || 'Quito'}</span>
                                  </p>
                                </div>
                              </td>
                              <td className="p-2.5 text-center font-black text-slate-900 text-xs">
                                {st.total}
                              </td>
                              <td className="p-2.5 text-center font-black text-blue-700 text-xs">
                                {st.hoursSpent} hrs
                              </td>
                              <td className="p-2.5 text-center">
                                <span className={`font-bold px-2 py-0.5 rounded-full text-[9px] ${
                                  st.installationsCount > 0 
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                    : 'text-slate-400 font-normal'
                                }`}>
                                  {st.installationsCount > 0 ? `${st.installationsCount} proj. (${st.installationDays}d / ${st.installationDays * 8}h)` : '0'}
                                </span>
                              </td>
                              <td className="p-2.5 text-center text-3xs font-semibold text-slate-500">
                                <span className="font-bold text-indigo-700">{st.asPrimary} Pr.</span> / <span className="text-slate-600">{st.asSupport} Ap.</span>
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
      {activeAdminTab === 'registro' && renderRegistroTab()}
      {activeAdminTab === 'contratos' && renderContratosTab()}
      {activeAdminTab === 'cronograma' && renderCronogramaTab()}
      {activeAdminTab === 'vacaciones' && renderVacacionesTab()}
      {activeAdminTab === 'capacitaciones' && (
        <CapacitacionesPortal
          engineers={engineers}
          scheduledTrainings={scheduledTrainings}
          onAddScheduledTraining={onAddScheduledTraining}
          onUpdateScheduledTraining={onUpdateScheduledTraining}
          onDeleteScheduledTraining={onDeleteScheduledTraining}
        />
      )}

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
                        const autoCity = getCityForClientOrWO(val, clients, contracts);
                        setNewWOCity(autoCity);
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

                    {/* 1.1 Ciudad / Sede de Atención */}
                    <div className="mt-2 space-y-1">
                      <label className="block text-2xs font-bold text-slate-500 uppercase flex items-center justify-between">
                        <span>1.1 Ciudad / Sede de Atención (Sector)</span>
                        <span className="text-[10px] text-indigo-600 font-semibold lowercase">
                          (Se usa para reagendamiento inteligente)
                        </span>
                      </label>
                      <select
                        value={newWOCity}
                        onChange={e => setNewWOCity(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-indigo-200 bg-indigo-50/40 font-extrabold text-xs text-indigo-950 outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                      >
                        <option value="Quito">📍 Quito (Sierra / Alrededores)</option>
                        <option value="Guayaquil">📍 Guayaquil (Costa / Alrededores)</option>
                        <option value="Cuenca">📍 Cuenca (Sur / Alrededores)</option>
                        <option value="Sede Central">🏢 Sede Central (Nacional)</option>
                      </select>
                    </div>

                    {/* Warning banner if selected client has an Inactive contract */}
                    {(() => {
                      const matchedClient = clients.find(c => c.name.trim().toLowerCase() === newWOClientSearch.trim().toLowerCase() || c.id === newWOClient);
                      const inactiveContract = matchedClient ? contracts.find(con => con.clientId === matchedClient.id && con.status === 'Inactivo') : null;
                      if (!inactiveContract) return null;
                      return (
                        <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-3 flex items-start gap-2.5 shadow-2xs animate-in fade-in zoom-in-95 duration-150 my-2">
                          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="font-black text-xs text-rose-950 block uppercase tracking-wide">
                              🚨 AVISO: CONTRATO INACTIVO (NO RENOVADO)
                            </span>
                            <p className="text-[11px] text-rose-900 font-bold leading-snug">
                              El cliente <u>{matchedClient?.name}</u> tiene su contrato registrado como <strong>INACTIVO (No Renovado)</strong>.
                            </p>
                            <p className="text-[10px] text-rose-700 font-medium">
                              ⚠️ Este trabajo o visita no cuenta con soporte ni garantía bajo contrato vigente.
                            </p>
                          </div>
                        </div>
                      );
                    })()}
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

                  {/* Support Engineer Select — Professional searchable multi-select dropdown */}
                  <div className="space-y-1.5">
                    <label className="block text-2xs font-bold text-slate-500 uppercase">2.1. Técnico(s) de Apoyo (Opcional)</label>

                    <div className="relative">
                      {/* Trigger button */}
                      <button
                        type="button"
                        onClick={() => setWoSupportEngDropdownOpen(!woSupportEngDropdownOpen)}
                        className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold flex items-center justify-between text-slate-800 focus:ring-1 focus:ring-indigo-500 cursor-pointer text-left min-h-[42px] transition-all hover:border-indigo-300"
                      >
                        {newWOSupportEngineers.length === 0 ? (
                          <span className="text-slate-400 font-normal flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>— Seleccionar Técnico(s) de Apoyo —</span>
                          </span>
                        ) : (
                          <div className="flex flex-wrap items-center gap-1.5 py-0.5">
                            {newWOSupportEngineers.map(id => {
                              const eng = engineers.find(e => e.id === id);
                              if (!eng) return null;
                              return (
                                <span
                                  key={id}
                                  className="inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold text-3xs px-2 py-0.5 rounded-md transition-colors"
                                >
                                  <span>{getEngineerEmoji(eng.id)}</span>
                                  <span>{eng.name.replace('Ing. ', '')}</span>
                                  <span
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setNewWOSupportEngineers(newWOSupportEngineers.filter(x => x !== id));
                                    }}
                                    className="ml-0.5 text-indigo-400 hover:text-indigo-700 font-black cursor-pointer"
                                    title="Quitar"
                                  >
                                    ×
                                  </span>
                                </span>
                              );
                            })}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 shrink-0 ml-1">
                          {newWOSupportEngineers.length > 0 && (
                            <span className="bg-indigo-600 text-white font-extrabold text-[9px] px-1.5 py-0.2 rounded-full">
                              {newWOSupportEngineers.length}
                            </span>
                          )}
                          <svg className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${woSupportEngDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </button>

                      {/* Dropdown panel */}
                      {woSupportEngDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => { setWoSupportEngDropdownOpen(false); setWoSupportEngSearchQuery(''); }}
                          />

                          <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-72 animate-in fade-in slide-in-from-top-1 duration-150">
                            {/* Search input */}
                            <div className="p-2.5 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
                              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <input
                                type="text"
                                placeholder="Buscar técnico por nombre o especialidad..."
                                value={woSupportEngSearchQuery}
                                onChange={e => setWoSupportEngSearchQuery(e.target.value)}
                                className="w-full bg-transparent text-xs p-1 focus:outline-hidden text-slate-800 font-semibold"
                                autoFocus
                              />
                              {woSupportEngSearchQuery && (
                                <button
                                  type="button"
                                  onClick={() => setWoSupportEngSearchQuery('')}
                                  className="text-slate-400 hover:text-slate-600 p-0.5"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            {/* Options list */}
                            <div className="overflow-y-auto divide-y divide-slate-50 p-1">
                              {(() => {
                                const filtered = engineers.filter(e =>
                                  e.id !== newWOEngineer &&
                                  (e.name.toLowerCase().includes(woSupportEngSearchQuery.toLowerCase()) ||
                                   e.specialty.toLowerCase().includes(woSupportEngSearchQuery.toLowerCase()))
                                );
                                if (filtered.length === 0) {
                                  return (
                                    <div className="p-4 text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                      No se encontraron ingenieros
                                    </div>
                                  );
                                }
                                return filtered.map(e => {
                                  const isChecked = newWOSupportEngineers.includes(e.id);
                                  return (
                                    <button
                                      key={e.id}
                                      type="button"
                                      onClick={() => {
                                        if (isChecked) {
                                          setNewWOSupportEngineers(newWOSupportEngineers.filter(id => id !== e.id));
                                        } else {
                                          setNewWOSupportEngineers([...newWOSupportEngineers, e.id]);
                                        }
                                      }}
                                      className={`w-full p-2.5 rounded-lg text-left text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                                        isChecked ? 'bg-indigo-50/80 text-indigo-900 font-bold' : 'hover:bg-slate-50 text-slate-800'
                                      }`}
                                    >
                                      <span className="flex items-center gap-2.5 min-w-0">
                                        <span className="text-base leading-none shrink-0">{getEngineerEmoji(e.id)}</span>
                                        <span className="truncate">
                                          <span className="font-bold text-slate-900 block truncate">{e.name}</span>
                                          <span className="text-[9px] text-slate-400 font-medium block leading-tight">{e.specialty} {e.sede ? `• 📍 ${e.sede}` : ''}</span>
                                        </span>
                                      </span>
                                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                                        isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                                      }`}>
                                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                      </div>
                                    </button>
                                  );
                                });
                              })()}
                            </div>

                            {/* Footer */}
                            <div className="p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-3xs font-semibold text-slate-500">
                              <span>{newWOSupportEngineers.length} seleccionado(s)</span>
                              <div className="flex items-center gap-2">
                                {newWOSupportEngineers.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => setNewWOSupportEngineers([])}
                                    className="text-indigo-600 hover:underline font-bold"
                                  >
                                    Limpiar
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => { setWoSupportEngDropdownOpen(false); setWoSupportEngSearchQuery(''); }}
                                  className="bg-indigo-600 text-white font-bold px-2.5 py-1 rounded-md hover:bg-indigo-700 transition cursor-pointer"
                                >
                                  Listo ✓
                                </button>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
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
                    <div className="flex gap-2">
                      <input
                        id="wo-equipment-input"
                        type="text"
                        required={selectedWOTags.length === 0}
                        value={newWOEquipment}
                        onChange={e => {
                          setNewWOEquipment(e.target.value);
                          setShowEquipSuggestions(true);
                        }}
                        onFocus={() => setShowEquipSuggestions(true)}
                        placeholder="Ej: Buscar o escribir equipo a añadir..."
                        className="w-full p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-1 focus:ring-indigo-500 text-xs"
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newWOEquipment.trim()) {
                            if (!selectedWOTags.includes(newWOEquipment.trim())) {
                              setSelectedWOTags(prev => [...prev, newWOEquipment.trim()]);
                            }
                            setNewWOEquipment('');
                            setShowEquipSuggestions(false);
                          }
                        }}
                        className="px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shrink-0"
                      >
                        + Añadir
                      </button>
                    </div>

                    {/* Selected tags list */}
                    {selectedWOTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {selectedWOTags.map((tag, idx) => (
                          <span key={idx} className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5">
                            {tag}
                            <button
                              type="button"
                              onClick={() => setSelectedWOTags(prev => prev.filter((_, i) => i !== idx))}
                              className="text-indigo-400 hover:text-indigo-600 font-bold focus:outline-none cursor-pointer text-xs"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {(() => {
                      const clientEquips = equipments.filter(eq => eq.clientId === newWOClient);
                      if (clientEquips.length === 0) return null;
                      
                      const uniqueEquips: typeof equipments = [];
                      const seen = new Set<string>();
                      
                      for (const eq of clientEquips) {
                        const serial = (eq.serialNumber || '').trim().toLowerCase();
                        const brand = (eq.brand || '').trim().toLowerCase();
                        const model = (eq.model || '').trim().toLowerCase();
                        const key = serial ? serial : `${brand}|${model}|${eq.id}`;
                        
                        if (!seen.has(key)) {
                          seen.add(key);
                          uniqueEquips.push(eq);
                        }
                      }
                      
                      uniqueEquips.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

                      const query = (newWOEquipment || '').toLowerCase().trim();
                      const filteredEquips = uniqueEquips.filter(eq => {
                        if (!query) return true;
                        
                        const exactMatchVal = `${eq.brand} ${eq.model} (S/N: ${eq.serialNumber})`.toLowerCase();
                        if (query === exactMatchVal) return true;
                        
                        return (
                          (eq.name || '').toLowerCase().includes(query) ||
                          (eq.brand || '').toLowerCase().includes(query) ||
                          (eq.model || '').toLowerCase().includes(query) ||
                          (eq.serialNumber || '').toLowerCase().includes(query)
                        );
                      });

                      return (
                        <div className="relative">
                          {showEquipSuggestions && filteredEquips.length > 0 && (
                            <>
                              {/* Overlay to handle click outside */}
                              <div 
                                className="fixed inset-0 z-40 cursor-default" 
                                onClick={() => setShowEquipSuggestions(false)}
                              />
                              <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-250 rounded-lg shadow-lg py-1 divide-y divide-slate-100 text-left">
                                <div className="px-3 py-1.5 text-[9px] font-bold text-slate-400 uppercase bg-slate-50/50">
                                  Equipos sugeridos para este cliente ({filteredEquips.length})
                                </div>
                                {filteredEquips.map(eq => {
                                  const nameClean = (eq.name || '').replace(/[\uFFFD]/g, 'Á').replace(/cÁpsula/gi, 'Cápsula');
                                  const modelClean = (eq.model || '').replace(/[\uFFFD]/g, 'Á').replace(/cÁpsula/gi, 'Cápsula');
                                  const brandClean = (eq.brand || '').replace(/[\uFFFD]/g, 'Á');
                                  
                                  const val = `${brandClean} ${modelClean} (S/N: ${eq.serialNumber})`;
                                  
                                  return (
                                    <button
                                      key={eq.id}
                                      type="button"
                                      onClick={() => {
                                        if (!selectedWOTags.includes(val)) {
                                          setSelectedWOTags(prev => [...prev, val]);
                                        }
                                        setNewWOEquipment('');
                                        setShowEquipSuggestions(false);
                                      }}
                                      className="w-full text-left px-3 py-2.5 hover:bg-indigo-50/70 flex justify-between items-center gap-3 transition-colors cursor-pointer text-xs"
                                    >
                                      <div className="space-y-0.5">
                                        <div className="font-bold text-slate-800 text-xs">
                                          {brandClean} {modelClean}
                                        </div>
                                        <div className="text-[10px] text-slate-500 font-medium">
                                          {nameClean}
                                        </div>
                                      </div>
                                      {eq.serialNumber && (
                                        <span className="font-mono text-[9.5px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200/60 shrink-0">
                                          S/N: {eq.serialNumber}
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })()}
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
          const client = clients.find(c => c.id === infoWO.clientId || c.name.trim().toLowerCase() === (infoWO.clientId || '').trim().toLowerCase());
          const clientDisplayName = client ? client.name : (infoWO.clientId && infoWO.clientId !== 'fsm_placeholder' ? infoWO.clientId : 'Cliente Desconocido');
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
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
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

                {/* Notice if Client has an Inactive Contract */}
                {(() => {
                  const clientContract = client ? contracts.find(con => con.clientId === client.id) : null;
                  if (clientContract?.status !== 'Inactivo') return null;
                  return (
                    <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-3 mb-4 flex items-start gap-2.5 shadow-2xs animate-in fade-in duration-150">
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-black text-xs text-rose-950 block uppercase tracking-wide">
                          🚨 AVISO: CLIENTE CON CONTRATO INACTIVO (NO RENOVADO)
                        </span>
                        <p className="text-[11px] text-rose-900 font-bold leading-snug mt-0.5">
                          El contrato de <u>{clientDisplayName}</u> está marcado como <strong>INACTIVO (No renovado)</strong>. Los trabajos agendados no cuentan con amparo ni cobertura de garantía.
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {isEditingWOState ? (
                  /* Form Content when editing */
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Cliente Select / Edit Input */}
                      {(() => {
                        const matchedClient = clients.find(c => c.id === editedWO?.clientId || c.name.trim().toLowerCase() === (editedWO?.clientId || '').trim().toLowerCase());
                        const displayClientName = matchedClient ? matchedClient.name : (editedWO?.clientId || '');
                        return (
                          <div className="space-y-1 col-span-1">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase">1. Cliente / Sede</label>
                            <input
                              type="text"
                              list="edit-wo-clients-datalist"
                              value={displayClientName}
                              onChange={e => {
                                const val = e.target.value;
                                const found = clients.find(c => c.name.trim().toLowerCase() === val.trim().toLowerCase() || c.id === val);
                                const nextClientId = found ? found.id : val;
                                setEditedWO(prev => prev ? { ...prev, clientId: nextClientId } : null);
                              }}
                              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                              placeholder="Escriba el nombre del cliente o selecciónalo..."
                            />
                            <datalist id="edit-wo-clients-datalist">
                              {clients.map(c => (
                                <option key={c.id} value={c.name} />
                              ))}
                            </datalist>
                          </div>
                        );
                      })()}

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

                      {/* Ingeniero Apoyo — Professional searchable multi-select dropdown */}
                      <div className="space-y-1 col-span-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">7. Técnico(s) de Apoyo (Opcional)</label>

                        {(() => {
                          const selectedSupport = editedWO?.supportEngineerIds || (editedWO?.supportEngineerId ? [editedWO.supportEngineerId] : []);
                          return (
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setEditWoSupportEngDropdownOpen(!editWoSupportEngDropdownOpen)}
                                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold flex items-center justify-between text-slate-800 focus:ring-1 focus:ring-indigo-500 cursor-pointer text-left min-h-[42px] transition-all hover:border-indigo-300"
                              >
                                {selectedSupport.length === 0 ? (
                                  <span className="text-slate-400 font-normal flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span>— Sin técnicos de apoyo —</span>
                                  </span>
                                ) : (
                                  <div className="flex flex-wrap items-center gap-1.5 py-0.5">
                                    {selectedSupport.map(id => {
                                      const eng = engineers.find(e => e.id === id);
                                      if (!eng) return null;
                                      return (
                                        <span
                                          key={id}
                                          className="inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold text-3xs px-2 py-0.5 rounded-md transition-colors"
                                        >
                                          <span>{getEngineerEmoji(eng.id)}</span>
                                          <span>{eng.name.replace('Ing. ', '')}</span>
                                          <span
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (editedWO) {
                                                const nextSupport = selectedSupport.filter(x => x !== id);
                                                setEditedWO({
                                                  ...editedWO,
                                                  supportEngineerIds: nextSupport,
                                                  supportEngineerId: nextSupport[0] || undefined
                                                });
                                              }
                                            }}
                                            className="ml-0.5 text-indigo-400 hover:text-indigo-700 font-black cursor-pointer"
                                            title="Quitar"
                                          >
                                            ×
                                          </span>
                                        </span>
                                      );
                                    })}
                                  </div>
                                )}
                                <div className="flex items-center gap-1.5 shrink-0 ml-1">
                                  {selectedSupport.length > 0 && (
                                    <span className="bg-indigo-600 text-white font-extrabold text-[9px] px-1.5 py-0.2 rounded-full">
                                      {selectedSupport.length}
                                    </span>
                                  )}
                                  <svg className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${editWoSupportEngDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                              </button>

                              {editWoSupportEngDropdownOpen && (
                                <>
                                  <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => { setEditWoSupportEngDropdownOpen(false); setEditWoSupportEngSearchQuery(''); }}
                                  />

                                  <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-72 animate-in fade-in slide-in-from-top-1 duration-150 font-sans">
                                    <div className="p-2.5 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
                                      <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      <input
                                        type="text"
                                        placeholder="Buscar técnico por nombre o especialidad..."
                                        value={editWoSupportEngSearchQuery}
                                        onChange={e => setEditWoSupportEngSearchQuery(e.target.value)}
                                        className="w-full bg-transparent text-xs p-1 focus:outline-hidden text-slate-800 font-semibold"
                                        autoFocus
                                      />
                                      {editWoSupportEngSearchQuery && (
                                        <button
                                          type="button"
                                          onClick={() => setEditWoSupportEngSearchQuery('')}
                                          className="text-slate-400 hover:text-slate-600 p-0.5"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>

                                    <div className="overflow-y-auto divide-y divide-slate-50 p-1">
                                      {(() => {
                                        const filtered = engineers.filter(e =>
                                          e.id !== editedWO?.engineerId &&
                                          (e.name.toLowerCase().includes(editWoSupportEngSearchQuery.toLowerCase()) ||
                                           e.specialty.toLowerCase().includes(editWoSupportEngSearchQuery.toLowerCase()))
                                        );
                                        if (filtered.length === 0) {
                                          return (
                                            <div className="p-4 text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                              No se encontraron ingenieros
                                            </div>
                                          );
                                        }
                                        return filtered.map(e => {
                                          const isChecked = selectedSupport.includes(e.id);
                                          return (
                                            <button
                                              key={e.id}
                                              type="button"
                                              onClick={() => {
                                                if (editedWO) {
                                                  const nextSupport = isChecked
                                                    ? selectedSupport.filter(id => id !== e.id)
                                                    : [...selectedSupport, e.id];
                                                  setEditedWO({
                                                    ...editedWO,
                                                    supportEngineerIds: nextSupport,
                                                    supportEngineerId: nextSupport[0] || undefined
                                                  });
                                                }
                                              }}
                                              className={`w-full p-2.5 rounded-lg text-left text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                                                isChecked ? 'bg-indigo-50/80 text-indigo-900 font-bold' : 'hover:bg-slate-50 text-slate-800'
                                              }`}
                                            >
                                              <span className="flex items-center gap-2.5 min-w-0">
                                                <span className="text-base leading-none shrink-0">{getEngineerEmoji(e.id)}</span>
                                                <span className="truncate">
                                                  <span className="font-bold text-slate-900 block truncate">{e.name}</span>
                                                  <span className="text-[9px] text-slate-400 font-medium block leading-tight">{e.specialty} {e.sede ? `• 📍 ${e.sede}` : ''}</span>
                                                </span>
                                              </span>
                                              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                                                isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                                              }`}>
                                                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                              </div>
                                            </button>
                                          );
                                        });
                                      })()}
                                    </div>

                                    <div className="p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-3xs font-semibold text-slate-500">
                                      <span>{selectedSupport.length} seleccionado(s)</span>
                                      <div className="flex items-center gap-2">
                                        {selectedSupport.length > 0 && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (editedWO) {
                                                setEditedWO({
                                                  ...editedWO,
                                                  supportEngineerIds: [],
                                                  supportEngineerId: undefined
                                                });
                                              }
                                            }}
                                            className="text-indigo-600 hover:underline font-bold"
                                          >
                                            Limpiar
                                          </button>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => { setEditWoSupportEngDropdownOpen(false); setEditWoSupportEngSearchQuery(''); }}
                                          className="bg-indigo-600 text-white font-bold px-2.5 py-1 rounded-md hover:bg-indigo-700 transition cursor-pointer"
                                        >
                                          Listo ✓
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Ingeniero Principal — Professional searchable dropdown */}
                      <div className="space-y-1 col-span-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">6. Técnico Principal</label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setEditWoEngDropdownOpen(!editWoEngDropdownOpen)}
                            className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold flex items-center justify-between text-slate-800 focus:ring-1 focus:ring-indigo-500 cursor-pointer text-left h-[42px] transition-all hover:border-indigo-300"
                          >
                            {editedWO?.engineerId ? (() => {
                              const eng = engineers.find(e => e.id === editedWO.engineerId);
                              return (
                                <span className="flex items-center gap-2.5">
                                  <span className="text-lg leading-none">{eng ? getEngineerEmoji(eng.id) : '👤'}</span>
                                  <span className="truncate font-bold text-slate-800">{eng?.name || 'Seleccionar Técnico'}</span>
                                </span>
                              );
                            })() : (
                              <span className="text-slate-400 font-normal">— Seleccionar Técnico —</span>
                            )}
                            <svg className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${editWoEngDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </button>

                          {editWoEngDropdownOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => { setEditWoEngDropdownOpen(false); setEditWoEngSearchQuery(''); }}
                              />

                              <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-72 animate-in fade-in slide-in-from-top-1 duration-150">
                                <div className="p-2.5 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
                                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <input
                                    type="text"
                                    placeholder="Buscar ingeniero..."
                                    value={editWoEngSearchQuery}
                                    onChange={e => setEditWoEngSearchQuery(e.target.value)}
                                    className="w-full bg-transparent text-xs p-1 focus:outline-hidden text-slate-800 font-semibold"
                                    autoFocus
                                  />
                                </div>

                                <div className="overflow-y-auto divide-y divide-slate-50">
                                  {(() => {
                                    const filtered = engineers.filter(e =>
                                      e.name.toLowerCase().includes(editWoEngSearchQuery.toLowerCase())
                                    );
                                    if (filtered.length === 0) {
                                      return (
                                        <div className="p-4 text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                          No se encontraron ingenieros
                                        </div>
                                      );
                                    }
                                    return filtered.map(e => {
                                      const isSelected = editedWO?.engineerId === e.id;
                                      return (
                                        <button
                                          key={e.id}
                                          type="button"
                                          onClick={() => {
                                            if (editedWO) {
                                              setEditedWO({ ...editedWO, engineerId: e.id });
                                            }
                                            setEditWoEngDropdownOpen(false);
                                            setEditWoEngSearchQuery('');
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
                            let finalWO = { ...editedWO };
                            const rawClientVal = (editedWO.clientId || '').trim();
                            if (rawClientVal) {
                              const matched = clients.find(c => c.id === rawClientVal || c.name.trim().toLowerCase() === rawClientVal.toLowerCase());
                              if (matched) {
                                finalWO.clientId = matched.id;
                              } else {
                                const newClientObj: Client = {
                                  id: `CLI-${Date.now()}`,
                                  name: rawClientVal,
                                  address: 'Registrado desde Edición de Orden',
                                  industry: 'Hospital / Clínica',
                                  contactName: 'Administración',
                                  contactPhone: '',
                                  installedEquipments: editedWO.equipmentName ? [editedWO.equipmentName] : []
                                };
                                if (onAddClient) {
                                  onAddClient(newClientObj);
                                }
                                finalWO.clientId = newClientObj.id;
                              }
                            }
                            if (infoWO && editedWO && editedWO.plannedDate && infoWO.plannedDate !== editedWO.plannedDate) {
                              syncContractDatesForMovedWorkOrder(infoWO.clientId, infoWO.plannedDate, editedWO.plannedDate, infoWO.equipmentName);
                            }
                            if (onAddMaintenanceRegistry && (finalWO.status === 'Realizado' || finalWO.status === 'Conciliado')) {
                              const existingReg = (maintenanceRegistries || []).find(r => r.workOrderId === finalWO.id);
                              if (!existingReg) {
                                const regId = `REG-WO-${finalWO.id}-${Date.now()}`;
                                const clientObj = clients.find(c => c.id === finalWO.clientId);
                                const clientInstName = clientObj?.name || 'S/N Institución';
                                const eqName = finalWO.equipmentName || '';
                                const eng = engineers.find(e => e.id === finalWO.engineerId);

                                const matchedEq = findBestEquipmentMatch(clientInstName, eqName);

                                let instName = clientInstName;
                                let brand = matchedEq?.eqBrand || '-';
                                let model = matchedEq?.eqModel || eqName || '-';
                                let serial = matchedEq?.eqSerial || '-';
                                let tBrand = matchedEq?.tuboBrand || '-';
                                let tModel = matchedEq?.tuboModel || '-';
                                let tSerial = matchedEq?.tuboSerial || '-';

                                onAddMaintenanceRegistry({
                                  id: regId,
                                  institutionName: instName,
                                  eqBrand: brand,
                                  eqModel: model,
                                  eqSerial: serial,
                                  tuboBrand: tBrand,
                                  tuboModel: tModel,
                                  tuboSerial: tSerial,
                                  fecha: finalWO.plannedDate || new Date().toISOString().split('T')[0],
                                  responsable: eng?.name || 'S/N Responsable',
                                  createdAt: new Date().toISOString(),
                                  workOrderId: finalWO.id,
                                });
                              }
                            }
                            onUpdateWorkOrder(finalWO);
                            setInfoWO(finalWO);
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
                          <h4 className="font-extrabold text-slate-800 mt-0.5">{clientDisplayName}</h4>
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
                                    // 1. Actualizar estado de la orden (registra que se entregó)
                                    onUpdateWorkOrderStatus(infoWO.id, 'Realizado');
                                    setInfoWO({ ...infoWO, status: 'Realizado' });

                                    // 2. Crear registro de mantenimiento automáticamente SOLO si la orden es de tipo Preventivo
                                    if (onAddMaintenanceRegistry && infoWO.type === 'Preventivo') {
                                      const regId = `REG-WO-${infoWO.id}-${Date.now()}`;
                                      const clientInstName = client?.name || 'S/N Institución';
                                      const eqName = infoWO.equipmentName || '';

                                      // Buscar coincidencia inteligente en registros/equipos previos
                                      const matchedEq = findBestEquipmentMatch(clientInstName, eqName);

                                      let instName = clientInstName;
                                      let brand    = matchedEq?.eqBrand;
                                      let model    = matchedEq?.eqModel;
                                      let serial   = matchedEq?.eqSerial;
                                      let tBrand   = matchedEq?.tuboBrand || '-';
                                      let tModel   = matchedEq?.tuboModel || '-';
                                      let tSerial  = matchedEq?.tuboSerial || '-';

                                      if (!brand || !model || !serial) {
                                        const eqParts = eqName.split(' ');
                                        brand  = brand || eqParts[0] || '-';
                                        model  = model || eqParts.slice(1).join(' ').split('(')[0].trim() || eqName || '-';
                                        const serialMatch = eqName.match(/\(([^)]+)\)/);
                                        serial = serial || (serialMatch ? serialMatch[1] : '-');
                                      }

                                      onAddMaintenanceRegistry({
                                        id: regId,
                                        institutionName: instName,
                                        eqBrand: brand,
                                        eqModel: model,
                                        eqSerial: serial,
                                        tuboBrand: tBrand,
                                        tuboModel: tModel,
                                        tuboSerial: tSerial,
                                        fecha: infoWO.plannedDate || new Date().toISOString().split('T')[0],
                                        responsable: eng?.name || 'S/N Responsable',
                                        createdAt: new Date().toISOString(),
                                        workOrderId: infoWO.id,
                                      });
                                    }
                                  }}
                                  className="bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-lg cursor-pointer transition-colors flex items-center gap-1 shadow-xs"
                                  title={infoWO.type === 'Preventivo' ? "Marcar orden como Realizada y guardar en Registro MTO" : "Marcar orden como Realizada / Entregada"}
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
                      {effectivePermissions.canDeleteWorkOrders !== false && (
                        isConfirmingDelete ? (
                          <div className="flex items-center gap-1.5 border border-rose-200 bg-rose-50/70 p-1 rounded-lg mr-auto">
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
                        )
                      )}
                      {effectivePermissions.canEditWorkOrders !== false && (
                        <button
                          onClick={() => {
                            setEditedWO({ ...infoWO });
                            setIsEditingWOState(true);
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-2xs px-4 py-2 rounded-lg cursor-pointer transition-colors"
                        >
                          Editar Datos
                        </button>
                      )}
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

      {/* Modal / Slide-over for detailed Engineer Metrics */}
      <AnimatePresence>
        {isEngMetricsModalOpen && selectedEngForMetrics && (() => {
          const eng = selectedEngForMetrics;
          const stats = engineerStats.find(s => s.engineer.id === eng.id);
          
          const engOrders = filteredDashOrders.filter(wo => 
            wo.engineerId === eng.id || 
            (wo.supportEngineerIds && wo.supportEngineerIds.includes(eng.id)) ||
            wo.supportEngineerId === eng.id
          );
          
          const totalHours = reports
            .filter(rep => {
              const wo = workOrders.find(w => w.id === rep.workOrderId);
              if (!wo) return false;
              const isPeriodMatch = filteredDashOrders.some(f => f.id === wo.id);
              const isEngMatch = wo.engineerId === eng.id || wo.supportEngineerId === eng.id || wo.supportEngineerIds?.includes(eng.id);
              return isPeriodMatch && isEngMatch;
            })
            .reduce((acc, rep) => acc + (rep.hoursSpent || 0), 0);

          const typeBreakdown: Record<MaintenanceType, number> = {
            Preventivo: 0,
            Correctivo: 0,
            Instalación: 0,
            Calibración: 0,
            Soporte: 0,
            FMI: 0,
            Capacitación: 0,
            Inspección: 0
          };
          engOrders.forEach(wo => {
            if (typeBreakdown[wo.type] !== undefined) {
              typeBreakdown[wo.type]++;
            }
          });

          const complianceRate = stats && stats.total > 0 
            ? Math.round(((stats.statusCounts.Conciliado + stats.statusCounts.Realizado + stats.statusCounts.Reportado) / stats.total) * 100) 
            : 0;

          const existingEval = (evaluations360 || []).find(e => e.engineerId === eng.id);
          const currentEval: EngineerEvaluation360 = editingEval360 && editingEval360.engineerId === eng.id ? editingEval360 : (existingEval || {
            id: `EVAL360-${eng.id}`,
            engineerId: eng.id,
            evaluatorName: 'Jefatura Técnica',
            period: '2026',
            scoreGeneral: 4.5,
            competencies: {
              technicalDiagnostic: 4.5,
              equipmentMastery: 4.5,
              radiologicalSafety: 5.0,
              reportAccuracy: 4.5,
              communication: 4.0,
              teamwork: 4.5,
              problemSolving: 4.5,
              punctuality: 4.5,
              toolCare: 5.0
            },
            feedbackStrengths: 'Excelente manejo técnico, amplio conocimiento de la modalidad y alto compromiso con el cliente.',
            feedbackImprovements: 'Mantener la puntualidad en el registro inmediato de informes digitales.',
            actionPlan: 'Continuar con capacitaciones avanzadas de diagnóstico de fábrica GE.',
            updatedAt: new Date().toISOString()
          });

          const updateEvalCompetency = (key: keyof EngineerEvaluation360['competencies'], val: number) => {
            const nextComp = { ...currentEval.competencies, [key]: val };
            const sum = Object.values(nextComp).reduce((a, b) => a + b, 0);
            const avg = Number((sum / Object.keys(nextComp).length).toFixed(1));
            setEditingEval360({
              ...currentEval,
              competencies: nextComp,
              scoreGeneral: avg
            });
          };

          return (
            <div className="fixed inset-0 bg-slate-900/60 h-full w-full z-50 flex items-center justify-center p-4 no-print" id="eng-metrics-modal-overlay">
              <div className="absolute inset-0 cursor-default" onClick={() => setIsEngMetricsModalOpen(false)} />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[92vh] z-50 flex flex-col justify-between"
              >
                {/* Header Section */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
                  <div className="flex gap-4 items-center">
                    <div className="w-14 h-14 rounded-full bg-slate-100 text-3xl flex items-center justify-center border border-slate-200 shrink-0">
                      {getEngineerEmoji(eng.id)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 leading-tight flex items-center gap-2">
                        <span>{eng.name}</span>
                        <span className="text-[10px] bg-indigo-100 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-mono font-bold">
                          Score 360°: ⭐ {currentEval.scoreGeneral} / 5.0
                        </span>
                      </h3>
                      <p className="text-2xs text-slate-500 font-bold mt-1 uppercase tracking-wide">
                        {eng.specialty} • <span className="text-indigo-650 font-black">{eng.sede || 'Quito'}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{eng.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEngMetricsModalOpen(false)}
                    className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-650 cursor-pointer transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Sub-Tabs: Metrics vs Evaluation 360 */}
                <div className="flex gap-2 border-b border-slate-200 mb-5 pb-2">
                  <button
                    type="button"
                    onClick={() => setEval360ModalTab('metrics')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      eval360ModalTab === 'metrics'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Métricas y Productividad</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEval360ModalTab('evaluation')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      eval360ModalTab === 'evaluation'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Evaluación 360° Competencias KPI</span>
                  </button>
                </div>

                {eval360ModalTab === 'metrics' ? (
                  /* Content Grid */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mb-6">
                    {/* Left Column: Job & Productivity Metrics */}
                    <div className="space-y-5">
                      <h4 className="font-bold text-slate-850 text-xs border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                        <BarChart3 className="w-4 h-4 text-indigo-550" />
                        <span>Productividad del Periodo</span>
                      </h4>

                      {/* KPI summaries */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl text-center">
                          <span className="text-[9px] font-bold text-slate-450 uppercase block">Total Asignaciones</span>
                          <span className="text-xl font-extrabold text-slate-855 mt-1 block">{stats?.total || 0}</span>
                          <span className="text-[8px] text-slate-400 font-medium">
                            {stats?.asPrimary || 0} Principal / {stats?.asSupport || 0} Apoyo
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowEngHoursDetail(!showEngHoursDetail)}
                          className={`p-3 rounded-xl text-center border transition-all cursor-pointer ${
                            showEngHoursDetail
                              ? 'bg-indigo-100/90 border-indigo-500 ring-2 ring-indigo-500 shadow-xs'
                              : 'bg-slate-50 border-slate-200/60 hover:bg-slate-100/80'
                          }`}
                          title="Haz clic para ver el desglose profesional minucioso de horas por orden de trabajo"
                        >
                          <span className="text-[9px] font-bold text-slate-500 uppercase block">Horas en Campo (Ver detalle)</span>
                          <span className="text-xl font-extrabold text-indigo-700 mt-1 block">{totalHours} hrs</span>
                          <span className="text-[8px] text-indigo-800 font-extrabold bg-indigo-100 px-1.5 py-0.5 rounded-full inline-block mt-0.5">
                            🔍 Haz clic para ver desglose
                          </span>
                        </button>
                      </div>

                      {/* Interactive Executive Field Hours Detail Drawer */}
                      {showEngHoursDetail && (() => {
                        const engWOs = filteredDashOrders.filter(wo => 
                          wo.engineerId === eng.id || wo.supportEngineerId === eng.id || wo.supportEngineerIds?.includes(eng.id)
                        );

                        let prevHours = 0, prevCount = 0;
                        let instHours = 0, instCount = 0, instDaysTotal = 0;
                        let corrHours = 0, corrCount = 0;
                        let inspHours = 0, inspCount = 0;

                        const woDetailedList = engWOs.map(wo => {
                          const matchedReport = (reports || []).find(r => r.workOrderId === wo.id);
                          const hrs = getWOScheduledHours(wo, matchedReport);
                          let sourceLabel = '📅 Agenda (3.0h std)';

                          if (matchedReport && matchedReport.hoursSpent) {
                            sourceLabel = '📄 Reporte RE-TE-04';
                          } else if (wo.plannedTime && parseTimeRangeToHours(wo.plannedTime)) {
                            sourceLabel = `⏰ Agenda (${wo.plannedTime})`;
                          } else if (isInstallationWO(wo) || (wo.durationDays && wo.durationDays > 0)) {
                            sourceLabel = `📅 Proyecto (${wo.durationDays || 1}d - 8h/día)`;
                          }

                          const typeLower = (wo.type || '').toLowerCase();
                          const isInst = isInstallationWO(wo);

                          if (isInst) {
                            // Accumulate counts, deduplicated below
                          } else if (typeLower.includes('preventiv')) {
                            prevHours += hrs;
                            prevCount++;
                          } else if (typeLower.includes('correctiv')) {
                            corrHours += hrs;
                            corrCount++;
                          } else {
                            inspHours += hrs;
                            inspCount++;
                          }

                          return { wo, matchedReport, hrs, sourceLabel, isInst };
                        });

                        const instGroups: Record<string, WorkOrder[]> = {};
                        woDetailedList.filter(item => item.isInst).forEach(item => {
                          const cleanId = (item.wo.id || '').split('_')[0].split('-').slice(0, 3).join('-').trim().toLowerCase();
                          const clientKey = (item.wo.clientId || item.wo.clientName || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                          const equipKey = (item.wo.equipmentName || '').trim().toLowerCase().replace(/- día \d+/gi, '').replace(/[^a-z0-9]/g, '');
                          const key = cleanId && cleanId.length > 5 ? cleanId : `${clientKey}___${equipKey}`;

                          if (!instGroups[key]) instGroups[key] = [];
                          instGroups[key].push(item.wo);
                        });

                        instCount = Object.keys(instGroups).length;
                        instDaysTotal = 0;
                        Object.values(instGroups).forEach(group => {
                          const maxDur = Math.max(...group.map(w => w.durationDays || 1));
                          const distinctDates = new Set(group.map(w => w.plannedDate)).size;
                          instDaysTotal += Math.max(maxDur, distinctDates);
                        });
                        instHours = instDaysTotal * 8;

                        return (
                          <div className="bg-indigo-50/90 border border-indigo-300 rounded-xl p-4 shadow-sm space-y-3 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between border-b border-indigo-200 pb-2">
                              <h5 className="font-black text-xs text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-indigo-600 animate-pulse" />
                                <span>Desglose Profesional de Horas en Campo ({totalHours} hrs totales)</span>
                              </h5>
                              <button
                                type="button"
                                onClick={() => setShowEngHoursDetail(false)}
                                className="text-[9px] font-extrabold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded-md cursor-pointer"
                              >
                                ✕ Cerrar
                              </button>
                            </div>

                            {/* Category Summary Cards */}
                            <div className="grid grid-cols-4 gap-2 text-[9.5px]">
                              <div className="bg-white p-2 rounded-lg border border-slate-200 text-center shadow-2xs">
                                <span className="text-slate-400 font-bold uppercase block text-[8px]">Preventivos</span>
                                <span className="font-black text-indigo-700 text-xs mt-0.5 block">{prevHours} hrs</span>
                                <span className="text-[8px] text-slate-500 font-semibold">{prevCount} Órdenes</span>
                              </div>
                              <div className="bg-white p-2 rounded-lg border border-emerald-200 text-center shadow-2xs">
                                <span className="text-emerald-700 font-bold uppercase block text-[8px]">Instalaciones</span>
                                <span className="font-black text-emerald-800 text-xs mt-0.5 block">{instHours} hrs</span>
                                <span className="text-[8px] text-emerald-600 font-semibold">{instDaysTotal} días ({instCount} proyect.)</span>
                              </div>
                              <div className="bg-white p-2 rounded-lg border border-amber-200 text-center shadow-2xs">
                                <span className="text-amber-700 font-bold uppercase block text-[8px]">Correctivos</span>
                                <span className="font-black text-amber-800 text-xs mt-0.5 block">{corrHours} hrs</span>
                                <span className="text-[8px] text-amber-600 font-semibold">{corrCount} Órdenes</span>
                              </div>
                              <div className="bg-white p-2 rounded-lg border border-sky-200 text-center shadow-2xs">
                                <span className="text-sky-700 font-bold uppercase block text-[8px]">Otros / QC</span>
                                <span className="font-black text-sky-800 text-xs mt-0.5 block">{inspHours} hrs</span>
                                <span className="text-[8px] text-sky-600 font-semibold">{inspCount} Órdenes</span>
                              </div>
                            </div>

                            {/* Structured Detailed Work Order List */}
                            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                              <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">Detalle Orden por Orden:</p>
                              {woDetailedList.length === 0 ? (
                                <p className="text-[10px] text-slate-400 font-bold text-center py-3">Sin mantenimientos ni horas registradas en este periodo.</p>
                              ) : (
                                woDetailedList.map(({ wo, hrs, sourceLabel, isInst }) => {
                                  const client = clients.find(c => c.id === wo.clientId);
                                  const effStatus = getWOEffectiveStatus(wo);

                                  return (
                                    <div key={wo.id} className="bg-white border border-slate-200/90 rounded-lg p-2 flex justify-between items-center text-[10px] hover:border-indigo-300 transition-all shadow-2xs">
                                      <div className="truncate pr-2 space-y-0.5">
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-mono font-extrabold text-slate-800 text-[10.5px]">{wo.id}</span>
                                          <span className={`text-[8px] font-black px-1.5 py-0.2 rounded uppercase ${
                                            isInst ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                            wo.type === 'Preventivo' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                                            'bg-amber-100 text-amber-800 border border-amber-200'
                                          }`}>
                                            {wo.type}
                                          </span>
                                        </div>
                                        <p className="font-bold text-slate-900 truncate text-[10px]">{client ? client.name : (wo.clientId || 'Sin cliente')}</p>
                                        <p className="text-slate-500 font-medium truncate text-[9px]">{wo.equipmentName} • 📅 {wo.plannedDate}</p>
                                      </div>

                                      <div className="text-right shrink-0 space-y-1">
                                        <span className="font-mono font-black text-indigo-900 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md text-xs block">
                                          ⏱️ {hrs.toFixed(1)} hrs
                                        </span>
                                        <span className="text-[8px] font-bold text-slate-400 block">{sourceLabel}</span>
                                        <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded inline-block ${
                                          effStatus === 'Conciliado' ? 'bg-emerald-100 text-emerald-800' :
                                          effStatus === 'Realizado' ? 'bg-blue-100 text-blue-800' :
                                          effStatus === 'Reportado' ? 'bg-indigo-100 text-indigo-800' :
                                          'bg-amber-100 text-amber-800'
                                        }`}>
                                          {effStatus.toUpperCase()}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Completion rate bar */}
                      <div className="space-y-1.5 bg-slate-50/50 border border-slate-200/45 p-3.5 rounded-xl">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-slate-600">Tasa de Cierre del Periodo</span>
                          <span className="font-black text-emerald-700">{complianceRate}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all duration-550" 
                            style={{ width: `${complianceRate}%` }}
                          />
                        </div>
                      </div>

                      {/* Status counters breakdown list with clickable pending view */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Estados de Tarea (Reales) - Haz clic para ver detalle:</span>
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <button
                            type="button"
                            onClick={() => setEngMetricsSelectedStatus('Conciliado')}
                            className={`flex justify-between items-center p-2 rounded-lg transition-all cursor-pointer border text-left ${
                              engMetricsSelectedStatus === 'Conciliado'
                                ? 'bg-emerald-100/80 border-emerald-400 ring-1 ring-emerald-400'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <span className="font-semibold text-emerald-800">Conciliadas</span>
                            <span className="font-black text-slate-900 bg-slate-100 px-1.5 py-0.2 rounded">{stats?.statusCounts.Conciliado || 0}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEngMetricsSelectedStatus('Realizado')}
                            className={`flex justify-between items-center p-2 rounded-lg transition-all cursor-pointer border text-left ${
                              engMetricsSelectedStatus === 'Realizado'
                                ? 'bg-blue-100/80 border-blue-400 ring-1 ring-blue-400'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <span className="font-semibold text-blue-800">Realizadas</span>
                            <span className="font-black text-slate-900 bg-slate-100 px-1.5 py-0.2 rounded">{stats?.statusCounts.Realizado || 0}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEngMetricsSelectedStatus('Reportado')}
                            className={`flex justify-between items-center p-2 rounded-lg transition-all cursor-pointer border text-left ${
                              engMetricsSelectedStatus === 'Reportado'
                                ? 'bg-indigo-100/80 border-indigo-400 ring-1 ring-indigo-400'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <span className="font-semibold text-indigo-800">Reportadas</span>
                            <span className="font-black text-slate-900 bg-slate-100 px-1.5 py-0.2 rounded">{stats?.statusCounts.Reportado || 0}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEngMetricsSelectedStatus('En Proceso')}
                            className={`flex justify-between items-center p-2 rounded-lg transition-all cursor-pointer border text-left ${
                              engMetricsSelectedStatus === 'En Proceso'
                                ? 'bg-sky-100/80 border-sky-400 ring-1 ring-sky-400'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <span className="font-semibold text-sky-800">En Proceso</span>
                            <span className="font-black text-slate-900 bg-slate-100 px-1.5 py-0.2 rounded">{stats?.statusCounts['En Proceso'] || 0}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEngMetricsSelectedStatus('Pendiente')}
                            className={`flex justify-between items-center p-2 rounded-lg col-span-2 transition-all cursor-pointer border text-left ${
                              engMetricsSelectedStatus === 'Pendiente'
                                ? 'bg-amber-100/90 border-amber-400 ring-1 ring-amber-400 shadow-xs'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <span className="font-bold text-amber-800 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Pendientes (Clic para ver lista de tareas)</span>
                            </span>
                            <span className="font-black text-amber-900 bg-amber-200 px-2 py-0.5 rounded text-xs">
                              {stats?.statusCounts.Pendiente || 0}
                            </span>
                          </button>
                        </div>

                        {/* Interactive Task List Drawer for Selected Status */}
                        {(() => {
                          const selectedStatusOrders = engOrders.filter(wo => {
                            if (engMetricsSelectedStatus === 'TODAS') return true;
                            return getWOEffectiveStatus(wo) === engMetricsSelectedStatus;
                          });

                          return (
                            <div className="space-y-2 bg-amber-50/70 border border-amber-200 rounded-xl p-3 mt-2 shadow-2xs">
                              <div className="flex items-center justify-between">
                                <p className="text-[10px] font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                                  <ClipboardList className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Órdenes {engMetricsSelectedStatus === 'TODAS' ? 'Totales' : engMetricsSelectedStatus.toUpperCase()} ({selectedStatusOrders.length}):</span>
                                </p>
                                {engMetricsSelectedStatus !== 'TODAS' && (
                                  <button
                                    type="button"
                                    onClick={() => setEngMetricsSelectedStatus('TODAS')}
                                    className="text-[9px] font-bold text-indigo-600 hover:underline cursor-pointer"
                                  >
                                    Ver todas
                                  </button>
                                )}
                              </div>

                              {selectedStatusOrders.length === 0 ? (
                                <p className="text-[10px] text-slate-400 font-bold p-2 text-center">No hay órdenes en estado {engMetricsSelectedStatus}</p>
                              ) : (
                                <div className="max-h-[160px] overflow-y-auto space-y-1.5 pr-1">
                                  {selectedStatusOrders.map(wo => {
                                    const client = clients.find(c => c.id === wo.clientId);
                                    const effStatus = getWOEffectiveStatus(wo);
                                    return (
                                      <div key={wo.id} className="bg-white border border-slate-200 rounded-lg p-2 flex justify-between items-center text-[10px] hover:border-amber-300 transition-colors shadow-2xs">
                                        <div className="truncate pr-2">
                                          <span className="font-mono font-bold text-slate-800 block truncate">{wo.id}</span>
                                          <span className="font-bold text-indigo-950 block truncate">{client ? client.name : (wo.clientId || 'Sin cliente')}</span>
                                          <span className="text-slate-500 font-medium truncate block text-[9px]">{wo.equipmentName}</span>
                                        </div>
                                        <div className="text-right shrink-0">
                                          <span className="font-mono font-bold text-slate-600 block text-[9px]">📅 {wo.plannedDate}</span>
                                          <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded inline-block mt-0.5 ${
                                            effStatus === 'Pendiente' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                            effStatus === 'Realizado' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                            effStatus === 'Conciliado' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                            'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                          }`}>
                                            {effStatus.toUpperCase()}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Right Column: Maintenance types & Vacation Status */}
                    <div className="space-y-5">
                      <h4 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-emerald-600" />
                        <span>Distribución de Trabajos y Ausencias</span>
                      </h4>

                      {/* Maintenance types distribution with clickable detail */}
                      <div className="space-y-2 bg-slate-50/50 border border-slate-200/40 p-3.5 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Tipos de Servicio Ejecutados - Haz clic para ver lista:</span>
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          {Object.entries(typeBreakdown).map(([type, count]) => {
                            if (count === 0) return null;
                            const isSelected = engMetricsSelectedType === type;
                            return (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setEngMetricsSelectedType(isSelected ? null : (type as WorkOrderType))}
                                className={`flex justify-between items-center px-2 py-1.5 rounded-lg border transition-all cursor-pointer text-left ${
                                  isSelected
                                    ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold ring-1 ring-emerald-400 shadow-2xs'
                                    : 'bg-white border-slate-200 hover:bg-slate-100/70 text-slate-700 font-semibold'
                                }`}
                              >
                                <span className="truncate pr-1">{type}</span>
                                <span className="font-extrabold text-slate-900 bg-slate-100 px-1.5 py-0.2 rounded-md shrink-0 text-2xs">{count}</span>
                              </button>
                            );
                          })}
                          {Object.values(typeBreakdown).every(c => c === 0) && (
                            <div className="col-span-2 text-center text-slate-400 py-4 font-bold">
                              Sin servicios registrados en este periodo
                            </div>
                          )}
                        </div>

                        {/* Interactive Drawer for Selected Service Type */}
                        {engMetricsSelectedType && (() => {
                          const typeOrders = engOrders.filter(wo => wo.type === engMetricsSelectedType);
                          return (
                            <div className="space-y-2 bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 mt-3 shadow-2xs animate-in fade-in duration-150">
                              <div className="flex items-center justify-between">
                                <p className="text-[10px] font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                                  <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Órdenes de {engMetricsSelectedType} ({typeOrders.length}):</span>
                                </p>
                                <button
                                  type="button"
                                  onClick={() => setEngMetricsSelectedType(null)}
                                  className="text-[9px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                                >
                                  Cerrar
                                </button>
                              </div>

                              {typeOrders.length === 0 ? (
                                <p className="text-[10px] text-slate-400 font-bold p-2 text-center">Sin órdenes registradas para {engMetricsSelectedType}</p>
                              ) : (
                                <div className="max-h-[160px] overflow-y-auto space-y-1.5 pr-1">
                                  {typeOrders.map(wo => {
                                    const client = clients.find(c => c.id === wo.clientId);
                                    const effStatus = getWOEffectiveStatus(wo);
                                    return (
                                      <div key={wo.id} className="bg-white border border-slate-200 rounded-lg p-2 flex justify-between items-center text-[10px] hover:border-emerald-300 transition-colors shadow-2xs">
                                        <div className="truncate pr-2">
                                          <span className="font-mono font-bold text-slate-800 block truncate">{wo.id}</span>
                                          <span className="font-bold text-emerald-950 block truncate">{client ? client.name : (wo.clientId || 'Sin cliente')}</span>
                                          <span className="text-slate-500 font-medium truncate block text-[9px]">{wo.equipmentName}</span>
                                        </div>
                                        <div className="text-right shrink-0">
                                          <span className="font-mono font-bold text-slate-600 block text-[9px]">📅 {wo.plannedDate}</span>
                                          <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded inline-block mt-0.5 ${
                                            effStatus === 'Pendiente' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                            effStatus === 'Realizado' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                            effStatus === 'Conciliado' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                            'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                          }`}>
                                            {effStatus.toUpperCase()}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Vacations details */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-555 uppercase block flex items-center gap-1">
                          <Palmtree className="w-3.5 h-3.5 text-teal-650" />
                          <span>Resumen de Vacaciones Anuales</span>
                        </span>
                        <div className="bg-white border border-slate-200 rounded-xl p-3.5 divide-y divide-slate-100 text-[10px] space-y-1.5">
                          <div className="flex justify-between items-center pb-1.5">
                            <span className="font-medium text-slate-600">Días Anuales Permitidos</span>
                            <span className="font-black text-slate-800">{eng.annualVacationDays || 15} días</span>
                          </div>
                          <div className="flex justify-between items-center py-1.5">
                            <span className="font-medium text-slate-600">Vacaciones Pendientes</span>
                            <span className="font-black text-amber-600">{eng.pendingVacationsLastYear || 0} días</span>
                          </div>
                          <div className="flex justify-between items-center py-1.5">
                            <span className="font-medium text-slate-600">Vacaciones en Reserva (Standby)</span>
                            <span className="font-black text-slate-700">{eng.standbyVacationsLastYear || 0} días</span>
                          </div>
                          <div className="flex justify-between items-center pt-1.5 border-t border-slate-100">
                            <span className="font-medium text-slate-600">Día de Cumpleaños Libre</span>
                            <span className={`font-bold px-1.5 py-0.5 rounded-full text-[8.5px] ${
                              eng.birthdayVacationDay === 0 
                                ? 'bg-red-50 text-red-700 border border-red-100' 
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            }`}>
                              {eng.birthdayVacationDay === 0 ? '❌ Ya Usado' : '✅ Disponible'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Tab 2: Evaluación 360° por Competencias */
                  <div className="space-y-4 text-xs mb-6">
                    {/* Score summary banner */}
                    <div className="bg-gradient-to-r from-purple-900 to-indigo-800 text-white p-4 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-purple-200 tracking-wider">Calificación Global de Desempeño 360°</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-3xl font-black text-amber-300">⭐ {currentEval.scoreGeneral}</span>
                          <span className="text-xs text-purple-100 font-bold">/ 5.0 Puntos</span>
                        </div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-xs border border-white/20 px-3.5 py-2 rounded-xl text-right">
                        <span className="text-[9px] font-extrabold uppercase text-amber-300 block">Clasificación</span>
                        <span className="text-xs font-bold text-white">
                          {currentEval.scoreGeneral >= 4.5 ? '🌟 Excelente' : currentEval.scoreGeneral >= 3.8 ? '👍 Sobresaliente' : currentEval.scoreGeneral >= 3.0 ? '⚠️ Satisfactorio' : '🚨 Requiere Plan de Mejora'}
                        </span>
                      </div>
                    </div>

                    {/* Evaluador & Periodo */}
                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Evaluado por</label>
                        <input
                          type="text"
                          value={currentEval.evaluatorName}
                          onChange={(e) => setEditingEval360({ ...currentEval, evaluatorName: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-hidden"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Periodo de Evaluación</label>
                        <input
                          type="text"
                          value={currentEval.period}
                          onChange={(e) => setEditingEval360({ ...currentEval, period: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-hidden"
                        />
                      </div>
                    </div>

                    {/* Grid de 9 Competencias 360° con explicaciones */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-purple-600" />
                        <span>Evaluación por Competencias (1.0 a 5.0 ⭐)</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                          { key: 'technicalDiagnostic', label: '🛠️ Diagnóstico Técnico', description: 'Detección, aislamiento y resolución de averías biomédicas.' },
                          { key: 'equipmentMastery', label: '⚙️ Dominio Modalidades GE', description: 'Conocimiento técnico avanzado en hardware y software GE.' },
                          { key: 'radiologicalSafety', label: '☢️ Seguridad Radiológica', description: 'Cumplimiento de normas de bioseguridad y protección.' },
                          { key: 'reportAccuracy', label: '📄 Informes Digitales', description: 'Calidad, precisión y entrega oportuna de reportes.' },
                          { key: 'communication', label: '🗣️ Comunicación Cliente', description: 'Relación profesional y atención al personal hospitalario.' },
                          { key: 'teamwork', label: '🤝 Trabajo en Equipo', description: 'Colaboración activa y apoyo mutuo entre técnicos.' },
                          { key: 'problemSolving', label: '⚡ Resolución bajo Presión', description: 'Eficiencia y serenidad en emergencias técnicas.' },
                          { key: 'punctuality', label: '⏰ Puntualidad de Servicio', description: 'Respeto puntual a horarios de visita programados.' },
                          { key: 'toolCare', label: '🧰 Cuidado de Herramientas', description: 'Uso adecuado y conservación de maletines e instrumentos.' }
                        ].map(comp => {
                          const val = (currentEval.competencies as any)[comp.key] || 4.0;
                          return (
                            <div key={comp.key} className="bg-white border border-slate-200 rounded-xl p-3 space-y-1.5 hover:border-purple-300 transition-colors shadow-2xs">
                              <div className="flex justify-between items-start text-[10px] font-bold gap-1">
                                <div>
                                  <span className="text-slate-800 font-bold block">{comp.label}</span>
                                  <span className="text-slate-400 font-normal text-[8.5px] leading-tight block mt-0.5">{comp.description}</span>
                                </div>
                                <span className="text-purple-700 font-mono text-xs shrink-0">{val} ⭐</span>
                              </div>
                              <input
                                type="range"
                                min="1"
                                max="5"
                                step="0.5"
                                value={val}
                                onChange={(e) => updateEvalCompetency(comp.key as any, parseFloat(e.target.value))}
                                className="w-full accent-purple-600 cursor-pointer"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Feedback y Plan de Acción */}
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-emerald-700 uppercase">💪 Fortalezas Destacadas</label>
                          <textarea
                            rows={2}
                            value={currentEval.feedbackStrengths || ''}
                            onChange={(e) => setEditingEval360({ ...currentEval, feedbackStrengths: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 outline-hidden"
                            placeholder="Manejo impecable del cliente..."
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-amber-700 uppercase">🔍 Oportunidades de Mejora</label>
                          <textarea
                            rows={2}
                            value={currentEval.feedbackImprovements || ''}
                            onChange={(e) => setEditingEval360({ ...currentEval, feedbackImprovements: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 outline-hidden"
                            placeholder="Optimizar tiempos en cierre de informes..."
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-indigo-700 uppercase">🎯 Plan de Acción y Capacitación</label>
                        <textarea
                          rows={2}
                          value={currentEval.actionPlan || ''}
                          onChange={(e) => setEditingEval360({ ...currentEval, actionPlan: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 outline-hidden"
                          placeholder="Curso avanzado de Tomografía GE..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer buttons with separate print actions */}
                <div className="flex flex-wrap justify-between items-center border-t border-slate-100 pt-4 mt-2 gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleExportSingleEngineerCSV(eng)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm hover:shadow-md"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Excel</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePrintEngineerMetricsOnly(eng)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm hover:shadow-md"
                      title="Imprimir solo el reporte de Métricas y Productividad"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Imprimir Métricas</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePrintEngineerEvaluation360Only(eng)}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm hover:shadow-md"
                      title="Imprimir solo la Evaluación 360° por Competencias"
                    >
                      <Award className="w-4 h-4" />
                      <span>Imprimir Evaluaciones 360°</span>
                    </button>
                  </div>

                  {eval360ModalTab === 'evaluation' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (onSaveEvaluation360) {
                          onSaveEvaluation360(currentEval);
                          setEditingEval360(null);
                        }
                      }}
                      className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm hover:shadow-md"
                    >
                      <Check className="w-4 h-4" />
                      <span>Guardar Evaluación 360°</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsEngMetricsModalOpen(false);
                      setEditingEval360(null);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
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
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">Gestión de Técnicos y Usuarios del Sistema</h3>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Administra técnicos, disponibilidad, roles de acceso y credenciales de usuarios.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEngsModalOpen(false);
                  setIsAddingNewEng(false);
                }}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-650 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-100/75 px-4 pt-2 gap-2">
              <button
                onClick={() => setEngModalTab('engineers')}
                className={`px-4 py-2 text-xs font-extrabold rounded-t-lg transition-all flex items-center gap-2 cursor-pointer border-t border-x ${
                  engModalTab === 'engineers'
                    ? 'bg-white text-indigo-700 border-slate-200 -mb-px shadow-2xs font-black'
                    : 'bg-transparent text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                <span>🛠️ Técnicos & Cuadrilla</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  engModalTab === 'engineers' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {engineers.length}
                </span>
              </button>

              <button
                onClick={() => setEngModalTab('users')}
                className={`px-4 py-2 text-xs font-extrabold rounded-t-lg transition-all flex items-center gap-2 cursor-pointer border-t border-x ${
                  engModalTab === 'users'
                    ? 'bg-white text-amber-700 border-slate-200 -mb-px shadow-2xs font-black'
                    : 'bg-transparent text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                <span>👥 Todos los Usuarios Registrados</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  engModalTab === 'users' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {(allRegisteredUsers || []).length}
                </span>
              </button>
            </div>

            {/* Search and Quick Filters */}
            <div className="p-3.5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 bg-white">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={engModalTab === 'engineers' ? "Buscar técnico por nombre o especialidad..." : "Buscar usuario por correo, nombre o rol..."}
                  value={engSearchQuery}
                  onChange={(e) => setEngSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 pl-8 text-xs font-semibold text-slate-755 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <span className="absolute left-3 top-2 text-slate-400 text-3xs">🔍</span>
              </div>
              
              {/* Quick Add Form button */}
              <button
                onClick={() => setIsAddingNewEng(!isAddingNewEng)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Registrar Usuario / Técnico</span>
              </button>
            </div>

            {/* Add New User / Engineer Inline Panel */}
            {isAddingNewEng && (
              <div className="bg-gradient-to-br from-indigo-50/70 via-slate-50 to-indigo-50/40 p-4 border-b border-indigo-100/80 space-y-3.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
                      <UserPlus className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                        Registrar Nuevo Usuario & Asignar Rol
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Crea la cuenta en el sistema, asígnale su rol (Admin, Técnico o Ventas) y sincronízala con Firebase.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/80 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    Nuevo Perfil
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Nombre Completo <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Ing. Juan Pérez o Gerencia Técnica"
                      value={newEngName}
                      onChange={(e) => setNewEngName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Correo Electrónico (Login) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="ej: usuario@orimec.com.ec"
                      value={newEngEmail}
                      onChange={(e) => setNewEngEmail(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Contraseña Inicial (opcional)
                    </label>
                    <input
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={newEngPassword}
                      onChange={(e) => setNewEngPassword(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Rol en el Sistema
                    </label>
                    <select
                      value={newEngRole}
                      onChange={(e) => setNewEngRole(e.target.value as 'engineer' | 'admin' | 'sales')}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
                    >
                      <option value="engineer">🛠️ Ingeniero / Técnico (FSM & Órdenes)</option>
                      <option value="admin">👑 Administrador (Acceso Total)</option>
                      <option value="sales">💼 Ventas / Comercial (Cotizaciones & Clientes)</option>
                    </select>
                  </div>

                  {newEngRole === 'engineer' && (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                          Especialidad
                        </label>
                        <select
                          value={newEngSpecialty}
                          onChange={(e) => setNewEngSpecialty(e.target.value as Specialty)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
                        >
                          <option value="Mecánica">Mecánica</option>
                          <option value="Electricidad">Electricidad</option>
                          <option value="Electrónica">Electrónica</option>
                          <option value="Control y Automatización">Control y Automatización</option>
                          <option value="Ingeniería">Ingeniería General</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                          Sede Asignada
                        </label>
                        <select
                          value={newEngSede}
                          onChange={(e) => setNewEngSede(e.target.value as any)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
                        >
                          <option value="Quito">Quito</option>
                          <option value="Guayaquil">Guayaquil</option>
                          <option value="Cuenca">Cuenca</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                          Teléfono de Contacto
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: +593 99 999 9999"
                          value={newEngPhone}
                          onChange={(e) => setNewEngPhone(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <span className="text-[10px] text-slate-500 font-semibold italic">
                    {newEngPassword ? '🔑 Se creará cuenta con correo y contraseña.' : 'ℹ️ Si el usuario ya se registró, se sincronizará su perfil.'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingNewEng(false)}
                      disabled={isRegisteringUser}
                      className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateNewEngineer}
                      disabled={isRegisteringUser}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-1.5 rounded-lg transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isRegisteringUser ? 'Registrando...' : '✓ Guardar y Registrar Usuario'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Body depending on Tab */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-slate-50/50">
              {engModalTab === 'engineers' ? (
                filteredEngineersForList.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 font-semibold text-xs">
                    No se encontraron técnicos registrados con ese criterio de búsqueda.
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
                        <div className="flex flex-wrap justify-between items-center border-b border-slate-200 pb-2.5 gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-[11px] text-indigo-950 uppercase tracking-wider">✏️ Editar Detalles del Técnico</span>
                            <span className="bg-indigo-100 text-indigo-800 text-[8px] font-extrabold px-1.5 py-0.5 rounded border border-indigo-150 font-mono">
                              {eng.id}
                            </span>
                          </div>

                          {/* Plantillas Rápida de Permisos (AHÍ ARRIBA BIEN VISIBLE) */}
                          <div className="flex flex-wrap items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
                            <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider px-1">Plantilla Permisos:</span>
                            <button
                              type="button"
                              onClick={() => setEditEngPermissions(getDefaultPermissionsForSpecialty('Ingeniería', globalRoleTemplates))}
                              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-extrabold text-[8.5px] px-2.5 py-1 rounded cursor-pointer transition-all hover:scale-102 flex items-center gap-1"
                              title="Cargar permisos predeterminados de Ingeniería"
                            >
                              🛠️ Ingeniería
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditEngPermissions(getDefaultPermissionsForSpecialty('Ventas', globalRoleTemplates))}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-extrabold text-[8.5px] px-2.5 py-1 rounded cursor-pointer transition-all hover:scale-102 flex items-center gap-1"
                              title="Cargar permisos predeterminados de Ventas"
                            >
                              ⚡ Ventas
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditEngPermissions(getDefaultPermissionsForSpecialty('Admin' as any, globalRoleTemplates))}
                              className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-extrabold text-[8.5px] px-2.5 py-1 rounded cursor-pointer transition-all hover:scale-102 flex items-center gap-1"
                              title="Cargar todos los permisos de Administrador Total"
                            >
                              👑 Admin Total
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setTempTemplatePermissions(globalRoleTemplates.Ventas);
                                setActiveTemplateTab('Ventas');
                                setIsTemplateModalOpen(true);
                              }}
                              className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[8.5px] px-2.5 py-1 rounded cursor-pointer transition-all hover:scale-102 flex items-center gap-1 shadow-2xs ml-1"
                              title="Editar las plantillas globales y aplicarlas masivamente a todos los usuarios"
                            >
                              ⚙️ Configurar Plantillas
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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
                              <option value="IT">IT</option>
                            </select>
                          </div>

                          {/* Sede / Sector */}
                          <div className="space-y-1">
                            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Sede / Sector (Cobertura)</label>
                            <select
                              value={editEngSede}
                              onChange={e => setEditEngSede(e.target.value as any)}
                              className="w-full text-3xs p-2 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 outline-hidden"
                            >
                              <option value="Quito">📍 Quito (Sierra / Alrededores)</option>
                              <option value="Guayaquil">📍 Guayaquil (Costa / Alrededores)</option>
                              <option value="Cuenca">📍 Cuenca (Sur / Alrededores)</option>
                              <option value="Sede Central">🏢 Sede Central (Nacional)</option>
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

                          {/* Modalidades y Capacitaciones Acreditadas */}
                          <div className="space-y-1 sm:col-span-4">
                            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                              🎓 Modalidades y Capacitaciones Acreditadas
                            </label>
                            <div className="flex flex-wrap gap-1.5 p-2.5 bg-white border border-slate-200 rounded-xl">
                              {OFFICIAL_MODALITIES.map(mod => {
                                const isSelected = editEngSkills.includes(mod.code);
                                return (
                                  <button
                                    key={mod.code}
                                    type="button"
                                    onClick={() => {
                                      if (isSelected) {
                                        setEditEngSkills(editEngSkills.filter(s => s !== mod.code));
                                      } else {
                                        setEditEngSkills([...editEngSkills, mod.code]);
                                      }
                                    }}
                                    title={mod.label}
                                    className={`px-2.5 py-1 rounded-lg text-3xs font-extrabold transition-all cursor-pointer border flex items-center gap-1 ${
                                      isSelected
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                                    }`}
                                  >
                                    <span>{isSelected ? '✓ ' : '+ '}{mod.code}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* 🔒 PERMISOS Y ACCESOS DEL SISTEMA */}
                          <div className="space-y-2 sm:col-span-3 mt-2 pt-3 border-t border-slate-200">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <span className="font-extrabold text-[10.5px] text-slate-800 flex items-center gap-1.5">
                                  <span>🔒 Permisos y Accesos del Sistema</span>
                                </span>
                                <p className="text-[8.5px] text-slate-500 font-medium">Personaliza qué módulos y acciones puede realizar este usuario.</p>
                              </div>
                              
                              {/* Plantillas Rápida */}
                              <div className="flex flex-wrap gap-1">
                                <button
                                  type="button"
                                  onClick={() => setEditEngPermissions(getDefaultPermissionsForSpecialty('Ventas'))}
                                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-extrabold text-[8px] px-2 py-0.5 rounded cursor-pointer transition-colors"
                                  title="Aplicar permisos por defecto del departamento de Ventas"
                                >
                                  ⚡ Plantilla Ventas
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditEngPermissions(getDefaultPermissionsForSpecialty('Ingeniería'))}
                                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-extrabold text-[8px] px-2 py-0.5 rounded cursor-pointer transition-colors"
                                  title="Aplicar permisos por defecto de Ingeniería"
                                >
                                  🛠️ Plantilla Ingeniería
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditEngPermissions(getDefaultPermissionsForSpecialty('Admin' as any))}
                                  className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-extrabold text-[8px] px-2 py-0.5 rounded cursor-pointer transition-colors"
                                  title="Habilitar todos los permisos de administrador"
                                >
                                  👑 Admin Total
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 p-3 bg-white border border-slate-200 rounded-xl">
                              {/* 📅 AGENDAMIENTO Y ÓRDENES */}
                              <div className="space-y-1.5 p-2 bg-slate-50/70 border border-slate-100 rounded-lg">
                                <span className="font-extrabold text-[9px] text-indigo-900 uppercase tracking-wider block border-b border-slate-200 pb-1">📅 Agendamiento y Órdenes</span>
                                {[
                                  { key: 'canViewWorkOrders', label: 'Ver mapa y calendario de agenda' },
                                  { key: 'canCreateWorkOrders', label: 'Crear / agendar órdenes' },
                                  { key: 'canEditWorkOrders', label: 'Editar / reprogramar órdenes' },
                                  { key: 'canDeleteWorkOrders', label: 'Eliminar órdenes de trabajo' },
                                  { key: 'canChangeWorkOrderStatus', label: 'Marcar estado (Realizado/Pendiente)' },
                                ].map(perm => (
                                  <label key={perm.key} className="flex items-center gap-1.5 text-[8.5px] font-bold text-slate-700 cursor-pointer hover:text-indigo-600 transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={!!(editEngPermissions as any)[perm.key]}
                                      onChange={e => setEditEngPermissions(prev => ({ ...prev, [perm.key]: e.target.checked }))}
                                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3 h-3 cursor-pointer"
                                    />
                                    <span>{perm.label}</span>
                                  </label>
                                ))}
                              </div>

                              {/* 📜 CONTRATOS DE MANTENIMIENTO */}
                              <div className="space-y-1.5 p-2 bg-slate-50/70 border border-slate-100 rounded-lg">
                                <span className="font-extrabold text-[9px] text-amber-900 uppercase tracking-wider block border-b border-slate-200 pb-1">📜 Contratos de Mantenimiento</span>
                                {[
                                  { key: 'canViewContracts', label: 'Ver contratos y cronogramas' },
                                  { key: 'canCreateContracts', label: 'Crear nuevos contratos' },
                                  { key: 'canEditContracts', label: 'Editar contratos y fechas' },
                                  { key: 'canDeleteContracts', label: 'Eliminar contratos' },
                                  { key: 'canViewContractValues', label: '💰 Ver Valores $ USD del Contrato', highlight: true },
                                ].map(perm => (
                                  <label key={perm.key} className={`flex items-center gap-1.5 text-[8.5px] font-bold cursor-pointer transition-colors ${perm.highlight ? 'text-emerald-700 font-extrabold' : 'text-slate-700 hover:text-indigo-600'}`}>
                                    <input
                                      type="checkbox"
                                      checked={!!(editEngPermissions as any)[perm.key]}
                                      onChange={e => setEditEngPermissions(prev => ({ ...prev, [perm.key]: e.target.checked }))}
                                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3 h-3 cursor-pointer"
                                    />
                                    <span>{perm.label}</span>
                                  </label>
                                ))}
                              </div>

                              {/* 📑 INFORMES TÉCNICOS */}
                              <div className="space-y-1.5 p-2 bg-slate-50/70 border border-slate-100 rounded-lg">
                                <span className="font-extrabold text-[9px] text-sky-900 uppercase tracking-wider block border-b border-slate-200 pb-1">📑 Informes Técnicos</span>
                                {[
                                  { key: 'canViewReports', label: 'Ver informes técnicos' },
                                  { key: 'canCreateReports', label: 'Crear nuevos informes (RE-TE-04)' },
                                  { key: 'canApproveReports', label: 'Aprobar / Validar informes' },
                                  { key: 'canExportReportsPdf', label: 'Descargar e imprimir PDF' },
                                ].map(perm => (
                                  <label key={perm.key} className="flex items-center gap-1.5 text-[8.5px] font-bold text-slate-700 cursor-pointer hover:text-indigo-600 transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={!!(editEngPermissions as any)[perm.key]}
                                      onChange={e => setEditEngPermissions(prev => ({ ...prev, [perm.key]: e.target.checked }))}
                                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3 h-3 cursor-pointer"
                                    />
                                    <span>{perm.label}</span>
                                  </label>
                                ))}
                              </div>

                              {/* 🏢 CLIENTES Y EQUIPOS */}
                              <div className="space-y-1.5 p-2 bg-slate-50/70 border border-slate-100 rounded-lg">
                                <span className="font-extrabold text-[9px] text-emerald-900 uppercase tracking-wider block border-b border-slate-200 pb-1">🏢 Clientes y Equipos</span>
                                {[
                                  { key: 'canViewClients', label: 'Ver directorio de clientes' },
                                  { key: 'canEditClients', label: 'Crear / Editar clientes' },
                                  { key: 'canViewEquipments', label: 'Ver inventario de equipos' },
                                  { key: 'canEditEquipments', label: 'Crear / Editar equipos' },
                                ].map(perm => (
                                  <label key={perm.key} className="flex items-center gap-1.5 text-[8.5px] font-bold text-slate-700 cursor-pointer hover:text-indigo-600 transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={!!(editEngPermissions as any)[perm.key]}
                                      onChange={e => setEditEngPermissions(prev => ({ ...prev, [perm.key]: e.target.checked }))}
                                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3 h-3 cursor-pointer"
                                    />
                                    <span>{perm.label}</span>
                                  </label>
                                ))}
                              </div>

                              {/* 📂 REGISTRO MTO */}
                              <div className="space-y-1.5 p-2 bg-slate-50/70 border border-slate-100 rounded-lg">
                                <span className="font-extrabold text-[9px] text-pink-900 uppercase tracking-wider block border-b border-slate-200 pb-1">📂 Registro de Mantenimiento</span>
                                {[
                                  { key: 'canViewRegistry', label: 'Ver Registro de Equipos (Hoja Vida)' },
                                  { key: 'canEditRegistry', label: 'Crear / Importar CSV de Registro' },
                                ].map(perm => (
                                  <label key={perm.key} className="flex items-center gap-1.5 text-[8.5px] font-bold text-slate-700 cursor-pointer hover:text-indigo-600 transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={!!(editEngPermissions as any)[perm.key]}
                                      onChange={e => setEditEngPermissions(prev => ({ ...prev, [perm.key]: e.target.checked }))}
                                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3 h-3 cursor-pointer"
                                    />
                                    <span>{perm.label}</span>
                                  </label>
                                ))}
                              </div>

                              {/* 🌴 VACACIONES Y PERMISOS */}
                              <div className="space-y-1.5 p-2 bg-slate-50/70 border border-slate-100 rounded-lg">
                                <span className="font-extrabold text-[9px] text-teal-900 uppercase tracking-wider block border-b border-slate-200 pb-1">🌴 Vacaciones y Permisos</span>
                                {[
                                  { key: 'canViewVacations', label: 'Ver módulo de vacaciones del personal' },
                                  { key: 'canManageVacations', label: 'Solicitar / Aprobar / Editar vacaciones' },
                                ].map(perm => (
                                  <label key={perm.key} className="flex items-center gap-1.5 text-[8.5px] font-bold text-slate-700 cursor-pointer hover:text-indigo-600 transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={!!(editEngPermissions as any)[perm.key]}
                                      onChange={e => setEditEngPermissions(prev => ({ ...prev, [perm.key]: e.target.checked }))}
                                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3 h-3 cursor-pointer"
                                    />
                                    <span>{perm.label}</span>
                                  </label>
                                ))}
                              </div>

                              {/* 📚 CAPACITACIONES Y ENTRENAMIENTOS */}
                              <div className="space-y-1.5 p-2 bg-slate-50/70 border border-slate-100 rounded-lg">
                                <span className="font-extrabold text-[9px] text-purple-900 uppercase tracking-wider block border-b border-slate-200 pb-1">📚 Capacitaciones y Cursos</span>
                                {[
                                  { key: 'canViewTrainings', label: 'Ver módulo de capacitaciones y cursos' },
                                  { key: 'canManageTrainings', label: 'Programar / Editar / Eliminar cursos' },
                                ].map(perm => (
                                  <label key={perm.key} className="flex items-center gap-1.5 text-[8.5px] font-bold text-slate-700 cursor-pointer hover:text-indigo-600 transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={!!(editEngPermissions as any)[perm.key]}
                                      onChange={e => setEditEngPermissions(prev => ({ ...prev, [perm.key]: e.target.checked }))}
                                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3 h-3 cursor-pointer"
                                    />
                                    <span>{perm.label}</span>
                                  </label>
                                ))}
                              </div>

                              {/* ⚙️ ADMINISTRACIÓN Y REPORTES */}
                              <div className="space-y-1.5 p-2 bg-slate-50/70 border border-slate-100 rounded-lg">
                                <span className="font-extrabold text-[9px] text-slate-900 uppercase tracking-wider block border-b border-slate-200 pb-1">⚙️ Administración del Sistema</span>
                                {[
                                  { key: 'canManageUsers', label: 'Gestionar usuarios y otorgar permisos' },
                                  { key: 'canViewAuditLogs', label: 'Ver registros de auditoría y cambios' },
                                  { key: 'canExportData', label: 'Exportar reportes a Excel / CSV' },
                                ].map(perm => (
                                  <label key={perm.key} className="flex items-center gap-1.5 text-[8.5px] font-bold text-slate-700 cursor-pointer hover:text-indigo-600 transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={!!(editEngPermissions as any)[perm.key]}
                                      onChange={e => setEditEngPermissions(prev => ({ ...prev, [perm.key]: e.target.checked }))}
                                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3 h-3 cursor-pointer"
                                    />
                                    <span>{perm.label}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
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
                            className="text-[9px] font-bold text-indigo-600 hover:text-indigo-850 hover:underline flex items-center gap-1 cursor-pointer"
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
                                    email: editEngEmail,
                                    sede: editEngSede,
                                    skills: editEngSkills,
                                    customPermissions: editEngPermissions
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
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold text-xs text-slate-800">{eng.name}</span>
                            <span className="bg-sky-50 text-sky-800 border border-sky-200 text-[8px] font-extrabold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                              📍 Sede: {eng.sede || 'Quito'}
                            </span>
                            {isMaster && (
                              <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[8px] font-extrabold px-1 py-0.2 rounded uppercase">
                                Base
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wide text-left">
                            {eng.specialty}
                          </div>
                          <div className="text-[10px] text-indigo-600 font-extrabold mt-0.5">
                            📅 {engActiveOrders} asignaciones este mes
                          </div>
                          {/* Modalidades y Capacitaciones Acreditadas */}
                          <div className="flex flex-wrap items-center gap-1 mt-1 font-sans">
                            <span className="text-[8.5px] font-bold text-slate-400 uppercase">🎓 Capacitaciones:</span>
                            {(eng.skills && eng.skills.length > 0 ? eng.skills : ['GE', 'FE']).map(s => (
                              <span key={s} className="bg-indigo-50 text-indigo-700 border border-indigo-150 text-[8.5px] font-extrabold px-1.5 py-0.2 rounded">
                                {s}
                              </span>
                            ))}
                            {((scheduledTrainings || []).filter(st => st.engineerId === eng.id || st.supportEngineerIds?.includes(eng.id)).length > 0) && (
                              <span className="bg-purple-50 text-purple-700 border border-purple-150 text-[8.5px] font-extrabold px-1.5 py-0.2 rounded">
                                📜 {(scheduledTrainings || []).filter(st => st.engineerId === eng.id || st.supportEngineerIds?.includes(eng.id)).length} Registradas
                              </span>
                            )}
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
                                ? 'bg-emerald-50 text-emerald-805 border-emerald-200'
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
                            setEditEngSede(eng.sede || 'Quito');
                            setEditEngSkills(eng.skills || ['GE', 'FE']);
                            setEditEngPermissions(eng.customPermissions || getDefaultPermissionsForSpecialty(eng.specialty || 'Ingeniería'));
                          }}
                          title="Editar detalles, capacitaciones y permisos de este usuario"
                          className="p-1.5 rounded-lg border bg-white border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-colors cursor-pointer text-xs"
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
              )) : (
                /* TAB 2: TODOS LOS USUARIOS REGISTRADOS EN FIREBASE */
                (() => {
                  const q = engSearchQuery.trim().toLowerCase();
                  const filteredUsers = (allRegisteredUsers || []).filter(u => {
                    if (!q) return true;
                    return (
                      (u.name && u.name.toLowerCase().includes(q)) ||
                      (u.email && u.email.toLowerCase().includes(q)) ||
                      (u.role && u.role.toLowerCase().includes(q)) ||
                      (u.uid && u.uid.toLowerCase().includes(q))
                    );
                  });

                  if (filteredUsers.length === 0) {
                    return (
                      <div className="space-y-3 py-6">
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center space-y-2">
                          <p className="text-xs font-extrabold text-amber-800">
                            {engSearchQuery ? 'No se encontraron usuarios con ese filtro de búsqueda.' : 'No hay usuarios registrados actualmente en Firestore.'}
                          </p>
                          <p className="text-[10px] text-slate-600 font-medium max-w-md mx-auto">
                            Puedes registrar un nuevo usuario haciendo clic en el botón superior <span className="font-bold text-indigo-700">"Registrar Usuario / Técnico"</span>.
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between px-1 text-[11px] text-slate-600 font-bold">
                        <span>Listado de Cuentas y Accesos en Firebase ({filteredUsers.length})</span>
                        <span className="text-[9px] text-slate-400">Sincronizado en tiempo real</span>
                      </div>

                      {filteredUsers.map(user => {
                        const isSelf = user.email && currentUserEmail && user.email.toLowerCase() === currentUserEmail.toLowerCase();
                        const linkedEng = engineers.find(e =>
                          (e.email && user.email && e.email.toLowerCase() === user.email.toLowerCase()) ||
                          (user.engineerId && e.id === user.engineerId)
                        );
                        const curRole = pendingUserRoles[user.uid] || (user.role as any) || 'engineer';
                        const curEngId = (pendingUserEngIds || {})[user.uid] || user.engineerId || '';

                        return (
                          <div
                            key={user.uid}
                            className={`border rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                              isSelf
                                ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-200 shadow-xs'
                                : linkedEng
                                ? 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                                : 'bg-amber-50/50 border-amber-200 shadow-2xs'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-xs text-slate-800 flex items-center gap-1">
                                  ✉️ {user.email || '(sin email)'}
                                </span>
                                {user.name && (
                                  <span className="text-slate-600 font-semibold text-xs">
                                    • {user.name}
                                  </span>
                                )}
                                {isSelf && (
                                  <span className="bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-2xs">
                                    (Tu cuenta actual)
                                  </span>
                                )}
                                <span className="bg-slate-100 text-slate-500 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded">
                                  {user.uid.slice(0, 10)}...
                                </span>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap text-[10px]">
                                <span className="text-slate-500 font-semibold">Rol Asignado:</span>
                                <span className={`font-black uppercase px-2 py-0.5 rounded text-[9px] border ${
                                  user.role === 'admin'
                                    ? 'bg-purple-100 text-purple-800 border-purple-200'
                                    : user.role === 'engineer'
                                    ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                                    : user.role === 'sales'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                    : 'bg-amber-100 text-amber-800 border-amber-200'
                                }`}>
                                  {user.role === 'admin' ? '👑 Administrador' : user.role === 'engineer' ? '🛠️ Ingeniero/Técnico' : user.role === 'sales' ? '💼 Ventas/Comercial' : '⚠️ Sin Asignar'}
                                </span>

                                {linkedEng ? (
                                  <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                                    ✓ Técnico Vinculado: <span className="font-black">{linkedEng.name}</span> ({linkedEng.id})
                                  </span>
                                ) : (
                                  user.role === 'engineer' && (
                                    <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded border border-amber-300">
                                      ⚠ Sin perfil de técnico vinculado
                                    </span>
                                  )
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                              <select
                                value={curRole}
                                onChange={e => setPendingUserRoles(prev => ({ ...prev, [user.uid]: e.target.value as any }))}
                                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold outline-hidden focus:border-indigo-400 shadow-2xs"
                              >
                                <option value="engineer">🛠️ Ingeniero/Técnico</option>
                                <option value="sales">💼 Vendedor / Comercial</option>
                                <option value="admin">👑 Administrador</option>
                              </select>

                              {curRole === 'engineer' && (
                                <select
                                  value={curEngId}
                                  onChange={e => setPendingUserEngIds(prev => ({ ...(prev || {}), [user.uid]: e.target.value }))}
                                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold outline-hidden focus:border-indigo-400 shadow-2xs max-w-[180px]"
                                >
                                  <option value="">-- Vincular Técnico --</option>
                                  {engineers.map(e => (
                                    <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
                                  ))}
                                </select>
                              )}

                              <button
                                onClick={() => {
                                  if (onUpdateUserRole) {
                                    onUpdateUserRole(user.uid, curRole, curEngId || undefined);
                                  }
                                }}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-xs hover:shadow whitespace-nowrap flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                <span>Guardar Rol</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
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
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 outline-hidden focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all uppercase"
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
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 outline-hidden focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all uppercase"
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
                <Users className="w-5 h-5 text-indigo-600" />
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
                  className="w-full bg-slate-50 disabled:bg-slate-100/80 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Ciudad / Sucursal</label>
                <input
                  type="text"
                  value={clientFormCity}
                  onChange={(e) => setClientFormCity(e.target.value)}
                  placeholder="Ej. Quito / Matriz"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Teléfono</label>
                  <input
                    type="text"
                    value={clientFormPhone}
                    onChange={(e) => setClientFormPhone(e.target.value)}
                    placeholder="Ej. 099123456"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
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
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-xs"
                >
                  {editingClient ? 'Guardar Cambios' : 'Crear Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Creación / Edición de Registro de Mantenimiento */}
      {isRegistryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 no-print" id="registry-form-modal">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg p-5 space-y-4 animate-in zoom-in-95 duration-150 relative font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileSpreadsheet className="w-5 h-5 text-pink-500" />
                <span>{editingRegistry ? 'Editar Registro de Mantenimiento' : 'Nuevo Registro de Mantenimiento'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsRegistryModalOpen(false);
                  setEditingRegistry(null);
                }}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRegistry} className="space-y-3.5 text-xs">
              {/* Institución */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Nombre de Persona o Institución</label>
                <input
                  type="text"
                  required
                  value={regFormInstitutionName}
                  onChange={(e) => setRegFormInstitutionName(e.target.value)}
                  placeholder="Ej. HOSP. ENRIQUE GARCÉS"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all uppercase"
                />
                {suggestedRegistryEquipments.length > 0 && (
                  <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-2.5 space-y-1.5 mt-1.5 animate-in fade-in duration-150">
                    <p className="text-[10px] font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Equipos registrados y de cobertura para este cliente (Clic para autorrellenar):</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-0.5 max-h-[140px] overflow-y-auto pr-1">
                      {suggestedRegistryEquipments.map((sug, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setRegFormInstitutionName(sug.institutionName);
                            setRegFormEqBrand(sug.eqBrand);
                            setRegFormEqModel(sug.eqModel);
                            setRegFormEqSerial(sug.eqSerial);
                            setRegFormTuboBrand(sug.tuboBrand);
                            setRegFormTuboModel(sug.tuboModel);
                            setRegFormTuboSerial(sug.tuboSerial);
                          }}
                          className="text-[10px] bg-white hover:bg-amber-100/80 border border-amber-300 text-amber-950 px-2.5 py-1 rounded-lg font-bold transition-all text-left shadow-2xs cursor-pointer flex items-center gap-1.5 group"
                          title="Usar estos datos de marca, modelo y serie"
                        >
                          <span className="font-mono text-amber-700 bg-amber-100 group-hover:bg-amber-200 px-1 py-0.2 rounded text-[9px]">{sug.eqBrand}</span>
                          <span>{sug.eqModel}</span>
                          {sug.eqSerial && sug.eqSerial !== '-' && (
                            <span className="text-slate-500 font-mono text-[9px]">({sug.eqSerial})</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Equipo section */}
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3.5 space-y-3">
                <p className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  Equipo
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Marca</label>
                    <input
                      type="text"
                      value={regFormEqBrand}
                      onChange={(e) => setRegFormEqBrand(e.target.value)}
                      placeholder="FUJIFILM"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all uppercase"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Modelo</label>
                    <input
                      type="text"
                      value={regFormEqModel}
                      onChange={(e) => setRegFormEqModel(e.target.value)}
                      placeholder="FCR GO"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Nº Serie</label>
                    <input
                      type="text"
                      value={regFormEqSerial}
                      onChange={(e) => setRegFormEqSerial(e.target.value)}
                      placeholder="26830304"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold font-mono text-slate-700 outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Tubo Rayos X section */}
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3.5 space-y-3">
                <p className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Tubo de Rayos X
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Marca</label>
                    <input
                      type="text"
                      value={regFormTuboBrand}
                      onChange={(e) => setRegFormTuboBrand(e.target.value)}
                      placeholder="FUJIFILM"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all uppercase"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Modelo</label>
                    <input
                      type="text"
                      value={regFormTuboModel}
                      onChange={(e) => setRegFormTuboModel(e.target.value)}
                      placeholder="M-5CE-31"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Nº Serie</label>
                    <input
                      type="text"
                      value={regFormTuboSerial}
                      onChange={(e) => setRegFormTuboSerial(e.target.value)}
                      placeholder="KC 11834201"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold font-mono text-slate-700 outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Fecha & Responsable */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Fecha de Mantenimiento</label>
                  <input
                    type="date"
                    value={regFormFecha}
                    onChange={(e) => setRegFormFecha(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Responsable (Ingeniero)</label>
                  <select
                    required
                    value={regFormResponsable}
                    onChange={(e) => setRegFormResponsable(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                  >
                    <option value="">-- Seleccionar Responsable --</option>
                    {engineers.map((eng) => (
                      <option key={eng.id} value={eng.name}>
                        {eng.name}
                      </option>
                    ))}
                    {regFormResponsable && !engineers.some(e => e.name.trim().toLowerCase() === regFormResponsable.trim().toLowerCase()) && (
                      <option value={regFormResponsable}>
                        {regFormResponsable} (Responsable Registrado)
                      </option>
                    )}
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistryModalOpen(false);
                    setEditingRegistry(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-150 rounded-lg cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer shadow-xs transition-colors"
                >
                  {editingRegistry ? 'Guardar Cambios' : 'Guardar Registro'}
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
                    className="w-full bg-slate-50 disabled:bg-slate-100/80 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Cliente Propietario</label>
                  <select
                    required
                    value={equipFormClientId}
                    onChange={(e) => setEquipFormClientId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all uppercase"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Versión Software</label>
                  <input
                    type="text"
                    value={equipFormSW}
                    onChange={(e) => setEquipFormSW(e.target.value)}
                    placeholder="Ej. v6.2.1 (Opcional)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Estado Operativo</label>
                  <select
                    value={equipFormStatus}
                    onChange={(e) => setEquipFormStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer font-bold"
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
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-xs"
                >
                  {editingEquip ? 'Guardar Cambios' : 'Crear Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Creación / Edición de Contrato */}
      {isContractModalOpen && (() => {
        const isSalesReadOnly = !!editingContract && userRole === 'sales';

        return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 no-print" id="contract-form-modal">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl p-6 space-y-4 animate-in zoom-in-95 duration-150 relative font-sans">
            {isSalesReadOnly && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between text-amber-900">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-bold">
                    Modo Solo Lectura (Vendedor): Los datos del contrato no se pueden editar una vez creados. Solo puedes adjuntar o re-subir archivos PDF / Imagen.
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveContract} className="flex flex-col max-h-[85vh] text-xs">
              <div className="flex-1 overflow-y-auto overscroll-contain pr-3 space-y-4 max-h-[62vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Left Side: General Contract details and Client search */}
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Código / Nº Contrato</label>
                        <input
                          type="text"
                          required
                          disabled={isSalesReadOnly}
                          value={contractFormId}
                          onChange={(e) => setContractFormId(e.target.value)}
                          placeholder="Ej. CONTRATO-2026-004"
                          title={editingContract && userRole === 'admin' ? 'Admin: puedes cambiar el Nº Contrato. Se eliminará el registro anterior y se creará uno nuevo con el nuevo código.' : undefined}
                          className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden transition-all font-mono ${
                            isSalesReadOnly ? 'bg-slate-100 cursor-not-allowed opacity-80' : editingContract && userRole === 'admin' ? 'bg-amber-50 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-400' : 'bg-slate-55 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                          }`}
                        />
                        {(() => {
                          if (editingContract && userRole === 'admin') {
                            return (
                              <p className="text-[8px] text-amber-700 font-semibold leading-tight mt-0.5">⚠ Cambiar el código creará un nuevo registro y eliminará el actual.</p>
                            );
                          }
                          return null;
                        })()}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Tipo de Cobertura</label>
                        <select
                          value={contractFormType}
                          disabled={isSalesReadOnly}
                          onChange={(e) => {
                            const newType = e.target.value as any;
                            setContractFormType(newType);
                            if (contractFormFrequency !== 'Ninguno' && contractFormFrequency !== 'Personalizado') {
                              const generated = generateMaintenanceDates(contractFormStart, contractFormEnd, contractFormFrequency, newType);
                              setContractFormMaintenanceDates(generated);
                              if (generated.length > 0) {
                                setContractFormQcDate(generated[generated.length - 1]);
                              }
                            }
                          }}
                          className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden transition-all font-bold ${
                            isSalesReadOnly ? 'bg-slate-100 cursor-not-allowed opacity-80' : 'bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer'
                          }`}
                        >
                          <option value="Garantía extendida/Contrato">Garantía extendida / Contrato</option>
                          <option value="Garantía de compra">Garantía de compra</option>
                          <option value="Facturable">Facturable</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>
                    </div>

                    {/* Client Search and Select */}
                    <div className="space-y-1.5 relative">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Cliente Cobertura</label>
                      {!isCreatingNewClientForContract ? (
                        <div>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <input
                                type="text"
                                placeholder="Buscar cliente por nombre..."
                                disabled={isSalesReadOnly}
                                value={contractClientSearchQuery}
                                onChange={(e) => {
                                  setContractClientSearchQuery(e.target.value);
                                  setIsContractClientDropdownOpen(true);
                                  const found = clients.find(c => c.name.toLowerCase() === e.target.value.toLowerCase());
                                  if (found) {
                                    setContractFormClientId(found.id);
                                  } else {
                                    setContractFormClientId('');
                                  }
                                }}
                                onFocus={() => !isSalesReadOnly && setIsContractClientDropdownOpen(true)}
                                className={`w-full border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-xs font-semibold text-slate-700 outline-hidden transition-all ${
                                  isSalesReadOnly ? 'bg-slate-100 cursor-not-allowed opacity-80' : 'bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                                }`}
                              />
                              {contractClientSearchQuery && !isSalesReadOnly && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setContractClientSearchQuery('');
                                    setContractFormClientId('');
                                    setIsContractClientDropdownOpen(true);
                                  }}
                                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                            {!isSalesReadOnly && (
                              <button
                                type="button"
                                onClick={() => {
                                    setIsCreatingNewClientForContract(true);
                                    setContractFormClientId('');
                                }}
                                className="bg-amber-50 hover:bg-amber-100 text-amber-755 border border-amber-200 px-3 py-2 rounded-lg font-bold text-3xs transition-colors shrink-0 cursor-pointer"
                              >
                                + Nuevo Cliente
                              </button>
                            )}
                          </div>

                          {/* Search Dropdown list */}
                          {isContractClientDropdownOpen && !isSalesReadOnly && (
                            <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-30 max-h-40 overflow-y-auto divide-y divide-slate-100">
                              {clients
                                .filter(c => c.name.toLowerCase().includes(contractClientSearchQuery.toLowerCase()))
                                .map(c => (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => {
                                      setContractFormClientId(c.id);
                                      setContractClientSearchQuery(c.name);
                                      setIsContractClientDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 font-medium transition-colors flex items-center justify-between cursor-pointer"
                                  >
                                    <span>{c.name}</span>
                                    <span className="text-[9px] text-slate-400 font-bold font-mono">{c.id}</span>
                                  </button>
                                ))}
                              {clients.filter(c => c.name.toLowerCase().includes(contractClientSearchQuery.toLowerCase())).length === 0 && (
                                <div className="p-3 text-slate-400 italic text-center">
                                  No se encontraron clientes.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-amber-50/40 border border-amber-200 rounded-xl p-3 space-y-2.5 animate-in fade-in-50 duration-150">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-[9px] text-amber-800 tracking-wider">NUEVO CLIENTE</span>
                            <button
                              type="button"
                              onClick={() => {
                                setIsCreatingNewClientForContract(false);
                                setContractFormClientId(clients[0]?.id || '');
                                setContractClientSearchQuery(clients[0]?.name || '');
                              }}
                              className="text-slate-400 hover:text-slate-650 text-3xs font-bold cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </div>
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Nombre / Razón Social"
                              required={isCreatingNewClientForContract}
                              value={newContractClientName}
                              onChange={(e) => setNewContractClientName(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-hidden focus:border-indigo-500 font-semibold"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="Sector / Industria"
                                value={newContractClientIndustry}
                                onChange={(e) => setNewContractClientIndustry(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-hidden focus:border-indigo-500 font-semibold"
                              />
                              <input
                                type="text"
                                placeholder="Teléfono Contacto"
                                value={newContractClientContactPhone}
                                onChange={(e) => setNewContractClientContactPhone(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-hidden focus:border-indigo-500 font-semibold"
                              />
                            </div>
                            <input
                              type="text"
                              placeholder="Dirección Completa"
                              value={newContractClientAddress}
                              onChange={(e) => setNewContractClientAddress(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-hidden focus:border-indigo-500 font-semibold"
                            />
                            <input
                              type="text"
                              placeholder="Nombre de Contacto"
                              value={newContractClientContactName}
                              onChange={(e) => setNewContractClientContactName(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-hidden focus:border-indigo-500 font-semibold"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Estado Contrato</label>
                        <select
                          value={contractFormStatus}
                          disabled={isSalesReadOnly}
                          onChange={(e) => setContractFormStatus(e.target.value as any)}
                          className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden transition-all font-bold ${
                            isSalesReadOnly ? 'bg-slate-100 cursor-not-allowed opacity-80' : 'bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer'
                          }`}
                        >
                          <option value="Activo">🟢 Activo</option>
                          <option value="Pendiente">🟡 Pendiente (Sin Cronograma)</option>
                          <option value="Inactivo">🚫 Inactivo (No Renovado)</option>
                          <option value="Vencido">🔴 Vencido</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Fecha Inicio</label>
                        <input
                          type="date"
                          required
                          disabled={isSalesReadOnly}
                          value={contractFormStart}
                          onChange={(e) => {
                            const newStart = e.target.value;
                            setContractFormStart(newStart);
                            if (contractFormFrequency !== 'Ninguno' && contractFormFrequency !== 'Personalizado') {
                              const prefDay = typeof contractFormPreferredDay === 'number' ? contractFormPreferredDay : undefined;
                              const prefMonth = typeof contractFormPreferredMonth === 'number' ? contractFormPreferredMonth : undefined;
                              const generated = generateMaintenanceDates(newStart, contractFormEnd, contractFormFrequency, contractFormType, prefDay, contractFormSelectedEquipForFreq, prefMonth);
                              if (contractFormSelectedEquipForFreq === 'all') {
                                setContractFormMaintenanceDates(generated);
                                const autoQcs = computeDefaultQcDates(generated);
                                setContractFormQcDates(autoQcs);
                                if (autoQcs.length > 0) setContractFormQcDate(autoQcs[0].split('|')[0]);
                              } else {
                                const other = contractFormMaintenanceDates.filter(d => d.split('|')[1] !== contractFormSelectedEquipForFreq);
                                const merged = [...other, ...generated].sort((a, b) => a.split('|')[0].localeCompare(b.split('|')[0]));
                                setContractFormMaintenanceDates(merged);
                                const autoQcs = computeDefaultQcDates(merged);
                                setContractFormQcDates(autoQcs);
                                if (autoQcs.length > 0) setContractFormQcDate(autoQcs[0].split('|')[0]);
                              }
                            }
                          }}
                          className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden transition-all font-mono ${
                            isSalesReadOnly ? 'bg-slate-100 cursor-not-allowed opacity-80' : 'bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Fecha Vencimiento</label>
                        <input
                          type="date"
                          required
                          disabled={isSalesReadOnly}
                          value={contractFormEnd}
                          onChange={(e) => {
                            const newEndDate = e.target.value;
                            setContractFormEnd(newEndDate);

                            const todayStr = new Date().toISOString().split('T')[0];
                            if (newEndDate && newEndDate < todayStr && contractFormStatus !== 'Inactivo') {
                              setContractFormStatus('Vencido');
                            } else if (newEndDate && newEndDate >= todayStr && contractFormStatus === 'Vencido') {
                              setContractFormStatus('Activo');
                            }

                            if (contractFormFrequency !== 'Ninguno' && contractFormFrequency !== 'Personalizado') {
                              const prefDay = typeof contractFormPreferredDay === 'number' ? contractFormPreferredDay : undefined;
                              const prefMonth = typeof contractFormPreferredMonth === 'number' ? contractFormPreferredMonth : undefined;
                              const generated = generateMaintenanceDates(contractFormStart, newEndDate, contractFormFrequency, contractFormType, prefDay, contractFormSelectedEquipForFreq, prefMonth);
                              if (contractFormSelectedEquipForFreq === 'all') {
                                setContractFormMaintenanceDates(generated);
                                const autoQcs = computeDefaultQcDates(generated);
                                setContractFormQcDates(autoQcs);
                                if (autoQcs.length > 0) setContractFormQcDate(autoQcs[0].split('|')[0]);
                              } else {
                                const other = contractFormMaintenanceDates.filter(d => d.split('|')[1] !== contractFormSelectedEquipForFreq);
                                const merged = [...other, ...generated].sort((a, b) => a.split('|')[0].localeCompare(b.split('|')[0]));
                                setContractFormMaintenanceDates(merged);
                                const autoQcs = computeDefaultQcDates(merged);
                                setContractFormQcDates(autoQcs);
                                if (autoQcs.length > 0) setContractFormQcDate(autoQcs[0].split('|')[0]);
                              }
                            }
                          }}
                          className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden transition-all font-mono ${
                            isSalesReadOnly ? 'bg-slate-100 cursor-not-allowed opacity-80' : 'bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">📍 Ciudad / Ubicación</label>
                        <input
                          type="text"
                          disabled={isSalesReadOnly}
                          value={contractFormCity}
                          onChange={(e) => setContractFormCity(e.target.value)}
                          placeholder="Ej. Quito, Guayaquil, Cuenca..."
                          list="cities-list"
                          className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden transition-all ${
                            isSalesReadOnly ? 'bg-slate-100 cursor-not-allowed opacity-80' : 'bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                          }`}
                        />
                        <datalist id="cities-list">
                          <option value="Quito" />
                          <option value="Guayaquil" />
                          <option value="Cuenca" />
                          <option value="Ambato" />
                          <option value="Santo Domingo" />
                          <option value="Machala" />
                          <option value="Manta" />
                          <option value="Portoviejo" />
                          <option value="Loja" />
                          <option value="Riobamba" />
                        </datalist>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">💵 Valor Contrato ($ USD)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          disabled={isSalesReadOnly}
                          value={contractFormValue}
                          onChange={(e) => setContractFormValue(e.target.value)}
                          placeholder="Ej. 15000.00 (Opcional)"
                          className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden transition-all font-mono ${
                            isSalesReadOnly ? 'bg-slate-100 cursor-not-allowed opacity-80' : 'bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Especificaciones</label>
                        <textarea
                          value={contractFormCoverage}
                          disabled={isSalesReadOnly}
                          onChange={(e) => setContractFormCoverage(e.target.value)}
                          rows={1}
                          placeholder="Límites de repuestos o coberturas..."
                          className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden transition-all ${
                            isSalesReadOnly ? 'bg-slate-100 cursor-not-allowed opacity-80' : 'bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Casilla de Selección: Equipo Nuevo */}
                    <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-2.5 flex items-center justify-between shadow-2xs">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="contract-is-new-equipment-check"
                          checked={contractFormIsNewEquipment}
                          onChange={(e) => setContractFormIsNewEquipment(e.target.checked)}
                          className="w-4 h-4 text-amber-600 rounded border-amber-300 focus:ring-amber-500 cursor-pointer"
                        />
                        <label htmlFor="contract-is-new-equipment-check" className="text-xs font-extrabold text-amber-950 cursor-pointer select-none flex items-center gap-1.5">
                          <span>✨ Equipo Nuevo</span>
                          <span className="bg-amber-200 text-amber-900 text-[8px] font-black px-1.5 py-0.2 rounded uppercase">Garantía / Entrega</span>
                        </label>
                      </div>
                      <span className="text-[9px] text-amber-800/80 font-semibold">Adjuntos opcionales (SR, CA, POD)</span>
                    </div>

                      {/* Linked Contract (Successor) - Admin only when editing */}
                      {editingContract && userRole === 'admin' && (
                        <div className="space-y-1 bg-indigo-50/60 border border-indigo-200 rounded-xl p-2.5">
                          <label className="block text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                            🔗 Contrato Sucesor Vinculado
                          </label>
                          <p className="text-[9px] text-indigo-600/80 font-medium leading-tight mb-1.5">
                            Vincula este contrato (ej. vencido) al nuevo contrato que lo reemplaza para mantener el historial del cliente.
                          </p>
                          <select
                            value={contractFormLinkedId}
                            onChange={(e) => setContractFormLinkedId(e.target.value)}
                            className="w-full bg-white border border-indigo-200 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-slate-700 outline-hidden focus:border-indigo-500 cursor-pointer"
                          >
                            <option value="">— Sin vínculo —</option>
                            {contracts
                              .filter(c => c.clientId === contractFormClientId && c.id !== editingContract.id)
                              .sort((a, b) => b.startDate.localeCompare(a.startDate))
                              .map(c => (
                                <option key={c.id} value={c.id}>
                                  {c.id} ({c.status} · {c.startDate?.slice(0,4) ?? '?'}–{c.endDate?.slice(0,4) ?? '?'})
                                </option>
                              ))
                            }
                          </select>
                          {contractFormLinkedId && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[9px] text-indigo-700 font-bold">→ Sucesor:</span>
                              <span className="text-[9px] font-mono text-indigo-900 bg-indigo-100 px-1.5 py-0.5 rounded">{contractFormLinkedId}</span>
                              <button type="button" onClick={() => setContractFormLinkedId('')} className="text-rose-500 text-[9px] font-black ml-1 cursor-pointer hover:text-rose-700">✕</button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Cloudinary PDF / Image Attachments Section */}
                      <div className="space-y-2.5 border-t border-slate-150 pt-3">
                        <h4 className="font-extrabold text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Adjuntos de Contrato y Cronograma (PDF / Imagen)</span>
                        </h4>

                        <div className="flex flex-col gap-2.5">
                          {/* Contrato PDF Upload Card */}
                          <div 
                            onDragEnter={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsDraggingContractPdf(true);
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              e.dataTransfer.dropEffect = 'copy';
                              if (!isDraggingContractPdf) setIsDraggingContractPdf(true);
                            }}
                            onDragLeave={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                              setIsDraggingContractPdf(false);
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsDraggingContractPdf(false);
                              const file = e.dataTransfer.files?.[0];
                              if (file) handleUploadContractFile(file);
                            }}
                            className={`bg-slate-50 border rounded-xl p-2.5 space-y-1.5 transition-all ${
                              isDraggingContractPdf ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-400/50 scale-[1.01]' : 'border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between pointer-events-none">
                              <span className="block text-[9.5px] font-extrabold text-slate-700 uppercase tracking-wide">📄 Documento del Contrato</span>
                              {isDraggingContractPdf && (
                                <span className="text-[8px] font-extrabold text-indigo-700 uppercase tracking-wider animate-pulse">¡Suelta el archivo!</span>
                              )}
                            </div>
                            
                            {contractFormPdfUrl ? (
                              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2 rounded-lg text-xs gap-2">
                                <a href={getCleanCloudinaryUrl(contractFormPdfUrl)} target="_blank" rel="noreferrer" className="text-emerald-900 font-extrabold hover:underline truncate flex items-center gap-1.5 min-w-0">
                                  <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span className="truncate">Ver Documento Adjunto</span>
                                  <ExternalLink className="w-3 h-3 text-emerald-600 shrink-0" />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => setContractFormPdfUrl('')}
                                  className="text-rose-600 hover:text-rose-800 hover:bg-rose-100/60 font-bold text-3xs px-2 py-1 rounded transition-colors shrink-0 cursor-pointer border border-rose-200/60"
                                >
                                  Eliminar
                                </button>
                              </div>
                            ) : (
                              <div>
                                <input
                                  type="file"
                                  id="contract-pdf-input"
                                  accept="application/pdf,image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleUploadContractFile(file);
                                  }}
                                  className="hidden"
                                />
                                <label
                                  htmlFor="contract-pdf-input"
                                  className={`w-full text-slate-700 font-extrabold text-xs py-2.5 px-3 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-all shadow-2xs select-none ${
                                    isDraggingContractPdf
                                      ? 'border-indigo-500 bg-white text-indigo-900 shadow-md'
                                      : 'border-indigo-300/80 bg-white hover:bg-slate-100/80 hover:border-indigo-400'
                                  }`}
                                >
                                  {isUploadingContractPdf ? (
                                    <span className="text-amber-600 font-bold animate-pulse py-1">Subiendo Contrato... ({uploadContractPdfProgress}%)</span>
                                  ) : (
                                    <>
                                      <div className="flex items-center gap-1.5 pointer-events-none">
                                        <Upload className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                        <span>{isDraggingContractPdf ? '¡Suelte el archivo del contrato aquí!' : 'Adjuntar Contrato PDF'}</span>
                                      </div>
                                      <span className="text-[9px] font-normal text-slate-400 pointer-events-none">
                                        Arrastra y suelta el archivo aquí o haz clic para buscar
                                      </span>
                                    </>
                                  )}
                                </label>
                              </div>
                            )}
                          </div>

                          {/* Adjuntos Opcionales para Equipo Nuevo: SR, CA, POD (General y Por Equipo) */}
                          {contractFormIsNewEquipment && (
                            <div className="space-y-3 pt-2 border-t border-amber-200/60 bg-amber-50/40 p-2.5 rounded-xl">
                              <div className="flex items-center justify-between">
                                <span className="block text-[9px] font-extrabold text-amber-900 uppercase tracking-wider">
                                  ✨ Adjuntos de Equipo Nuevo (SR, CA, POD)
                                </span>
                                <span className="text-[8px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                                  {contractFormEquipmentItems.length > 0 ? `Por Equipo (${contractFormEquipmentItems.length})` : 'General del Contrato'}
                                </span>
                              </div>

                              {/* PER-EQUIPMENT ATTACHMENTS IF EQUIPMENTS ARE ADDED TO CONTRACT */}
                              {contractFormEquipmentItems.length > 0 ? (
                                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                                  {contractFormEquipmentItems.map((item, eqIdx) => (
                                    <div key={eqIdx} className="bg-white border border-amber-200 rounded-xl p-2.5 space-y-2 shadow-2xs">
                                      <div className="flex items-center justify-between border-b border-amber-100 pb-1">
                                        <span className="text-[10px] font-extrabold text-amber-950 flex flex-wrap items-center gap-1.5 truncate">
                                          <span>🖥️ {item.name}</span>
                                          <span className="text-[8px] font-semibold text-slate-500">({item.brand})</span>
                                          {item.modality && <span className="bg-indigo-100 text-indigo-800 text-[7.5px] font-black px-1 rounded">{item.modality}</span>}
                                          {item.serial && <span className="bg-slate-100 text-slate-700 font-mono text-[7.5px] px-1 rounded">S/N: {item.serial}</span>}
                                          {item.gon && <span className="bg-purple-100 text-purple-800 font-mono text-[7.5px] px-1 rounded">GON: {item.gon}</span>}
                                        </span>
                                      </div>

                                      <div className="grid grid-cols-1 gap-2">
                                        {/* SR per equipment */}
                                        <div 
                                          onDragEnter={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setDraggingEqAttachKey(`${eqIdx}-sr`);
                                          }}
                                          onDragOver={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            e.dataTransfer.dropEffect = 'copy';
                                            if (draggingEqAttachKey !== `${eqIdx}-sr`) setDraggingEqAttachKey(`${eqIdx}-sr`);
                                          }}
                                          onDragLeave={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                                            setDraggingEqAttachKey(null);
                                          }}
                                          onDrop={async (e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setDraggingEqAttachKey(null);
                                            const file = e.dataTransfer.files?.[0];
                                            if (file) {
                                              try {
                                                const url = await uploadFileToCloudinary(file);
                                                const updated = [...contractFormEquipmentItems];
                                                updated[eqIdx] = { ...updated[eqIdx], serviceRecordPdfUrl: url };
                                                setContractFormEquipmentItems(updated);
                                              } catch (err: any) {
                                                alert(err.message || 'Error al subir el SR');
                                              }
                                            }
                                          }}
                                          className="space-y-1"
                                        >
                                          {item.serviceRecordPdfUrl ? (
                                            <div className="flex items-center justify-between bg-amber-50 border border-amber-200 p-2 rounded-xl text-3xs gap-2">
                                              <a href={getCleanCloudinaryUrl(item.serviceRecordPdfUrl)} target="_blank" rel="noreferrer" className="text-amber-950 font-extrabold hover:underline truncate flex items-center gap-1.5 min-w-0">
                                                <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                                <span className="truncate">🛠️ Service Record (SR) — {item.name}</span>
                                                <ExternalLink className="w-3 h-3 text-amber-600 shrink-0" />
                                              </a>
                                              <button type="button" onClick={() => {
                                                const updated = [...contractFormEquipmentItems];
                                                updated[eqIdx] = { ...updated[eqIdx], serviceRecordPdfUrl: undefined };
                                                setContractFormEquipmentItems(updated);
                                              }} className="text-rose-600 hover:text-rose-800 font-bold text-3xs px-2 py-0.5 rounded border border-rose-200 shrink-0">Eliminar</button>
                                            </div>
                                          ) : (
                                            <div>
                                              <input
                                                type="file"
                                                id={`sr-file-${eqIdx}`}
                                                accept="application/pdf,image/*"
                                                className="hidden"
                                                onChange={async (e) => {
                                                  const file = e.target.files?.[0];
                                                  if (file) {
                                                    try {
                                                      const url = await uploadFileToCloudinary(file);
                                                      const updated = [...contractFormEquipmentItems];
                                                      updated[eqIdx] = { ...updated[eqIdx], serviceRecordPdfUrl: url };
                                                      setContractFormEquipmentItems(updated);
                                                    } catch (err: any) {
                                                      alert(err.message || 'Error al subir el SR');
                                                    }
                                                  }
                                                }}
                                              />
                                              <label
                                                htmlFor={`sr-file-${eqIdx}`}
                                                className={`w-full text-slate-700 font-extrabold text-[9.5px] py-2 px-3 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-all shadow-2xs select-none ${
                                                  draggingEqAttachKey === `${eqIdx}-sr`
                                                    ? 'border-amber-500 bg-amber-100/90 text-amber-950 shadow-md scale-[1.01]'
                                                    : 'border-amber-300/80 bg-amber-50/30 hover:bg-amber-50 hover:border-amber-400'
                                                }`}
                                              >
                                                <div className="flex items-center justify-between w-full pointer-events-none">
                                                  <span className="flex items-center gap-1.5 truncate font-extrabold text-amber-950">
                                                    <Upload className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                                    <span className="truncate">🛠️ Service Record (SR) — {item.name}</span>
                                                  </span>
                                                  <span className="text-[7.5px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded shrink-0">
                                                    {draggingEqAttachKey === `${eqIdx}-sr` ? '¡Suelta el SR aquí!' : 'Subir SR / Arrastrar'}
                                                  </span>
                                                </div>
                                                <span className="text-[8.5px] font-normal text-slate-400 pointer-events-none">
                                                  Arrastra y suelta el archivo aquí o haz clic para buscar
                                                </span>
                                              </label>
                                            </div>
                                          )}
                                        </div>

                                        {/* CA per equipment */}
                                        <div 
                                          onDragEnter={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setDraggingEqAttachKey(`${eqIdx}-ca`);
                                          }}
                                          onDragOver={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            e.dataTransfer.dropEffect = 'copy';
                                            if (draggingEqAttachKey !== `${eqIdx}-ca`) setDraggingEqAttachKey(`${eqIdx}-ca`);
                                          }}
                                          onDragLeave={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                                            setDraggingEqAttachKey(null);
                                          }}
                                          onDrop={async (e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setDraggingEqAttachKey(null);
                                            const file = e.dataTransfer.files?.[0];
                                            if (file) {
                                              try {
                                                const url = await uploadFileToCloudinary(file);
                                                const updated = [...contractFormEquipmentItems];
                                                updated[eqIdx] = { ...updated[eqIdx], caPdfUrl: url };
                                                setContractFormEquipmentItems(updated);
                                              } catch (err: any) {
                                                alert(err.message || 'Error al subir el CA');
                                              }
                                            }
                                          }}
                                          className="space-y-1"
                                        >
                                          {item.caPdfUrl ? (
                                            <div className="flex items-center justify-between bg-teal-50 border border-teal-200 p-2 rounded-xl text-3xs gap-2">
                                              <a href={getCleanCloudinaryUrl(item.caPdfUrl)} target="_blank" rel="noreferrer" className="text-teal-950 font-extrabold hover:underline truncate flex items-center gap-1.5 min-w-0">
                                                <FileText className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                                                <span className="truncate">📜 Certificate of Acceptance (CA) — {item.name}</span>
                                                <ExternalLink className="w-3 h-3 text-teal-600 shrink-0" />
                                              </a>
                                              <button type="button" onClick={() => {
                                                const updated = [...contractFormEquipmentItems];
                                                updated[eqIdx] = { ...updated[eqIdx], caPdfUrl: undefined };
                                                setContractFormEquipmentItems(updated);
                                              }} className="text-rose-600 hover:text-rose-800 font-bold text-3xs px-2 py-0.5 rounded border border-rose-200 shrink-0">Eliminar</button>
                                            </div>
                                          ) : (
                                            <div>
                                              <input
                                                type="file"
                                                id={`ca-file-${eqIdx}`}
                                                accept="application/pdf,image/*"
                                                className="hidden"
                                                onChange={async (e) => {
                                                  const file = e.target.files?.[0];
                                                  if (file) {
                                                    try {
                                                      const url = await uploadFileToCloudinary(file);
                                                      const updated = [...contractFormEquipmentItems];
                                                      updated[eqIdx] = { ...updated[eqIdx], caPdfUrl: url };
                                                      setContractFormEquipmentItems(updated);
                                                    } catch (err: any) {
                                                      alert(err.message || 'Error al subir el CA');
                                                    }
                                                  }
                                                }}
                                              />
                                              <label
                                                htmlFor={`ca-file-${eqIdx}`}
                                                className={`w-full text-slate-700 font-extrabold text-[9.5px] py-2 px-3 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-all shadow-2xs select-none ${
                                                  draggingEqAttachKey === `${eqIdx}-ca`
                                                    ? 'border-teal-500 bg-teal-100/90 text-teal-950 shadow-md scale-[1.01]'
                                                    : 'border-teal-300/80 bg-teal-50/30 hover:bg-teal-50 hover:border-teal-400'
                                                }`}
                                              >
                                                <div className="flex items-center justify-between w-full pointer-events-none">
                                                  <span className="flex items-center gap-1.5 truncate font-extrabold text-teal-950">
                                                    <Upload className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                                                    <span className="truncate">📜 Certificate of Acceptance (CA) — {item.name}</span>
                                                  </span>
                                                  <span className="text-[7.5px] font-bold text-teal-800 bg-teal-100 px-1.5 py-0.2 rounded shrink-0">
                                                    {draggingEqAttachKey === `${eqIdx}-ca` ? '¡Suelta el CA aquí!' : 'Subir CA / Arrastrar'}
                                                  </span>
                                                </div>
                                                <span className="text-[8.5px] font-normal text-slate-400 pointer-events-none">
                                                  Arrastra y suelta el archivo aquí o haz clic para buscar
                                                </span>
                                              </label>
                                            </div>
                                          )}
                                        </div>

                                        {/* POD per equipment */}
                                        <div 
                                          onDragEnter={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setDraggingEqAttachKey(`${eqIdx}-pod`);
                                          }}
                                          onDragOver={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            e.dataTransfer.dropEffect = 'copy';
                                            if (draggingEqAttachKey !== `${eqIdx}-pod`) setDraggingEqAttachKey(`${eqIdx}-pod`);
                                          }}
                                          onDragLeave={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                                            setDraggingEqAttachKey(null);
                                          }}
                                          onDrop={async (e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setDraggingEqAttachKey(null);
                                            const file = e.dataTransfer.files?.[0];
                                            if (file) {
                                              try {
                                                const url = await uploadFileToCloudinary(file);
                                                const updated = [...contractFormEquipmentItems];
                                                updated[eqIdx] = { ...updated[eqIdx], podPdfUrl: url };
                                                setContractFormEquipmentItems(updated);
                                              } catch (err: any) {
                                                alert(err.message || 'Error al subir el POD');
                                              }
                                            }
                                          }}
                                          className="space-y-1"
                                        >
                                          {item.podPdfUrl ? (
                                            <div className="flex items-center justify-between bg-sky-50 border border-sky-200 p-2 rounded-xl text-3xs gap-2">
                                              <a href={getCleanCloudinaryUrl(item.podPdfUrl)} target="_blank" rel="noreferrer" className="text-sky-950 font-extrabold hover:underline truncate flex items-center gap-1.5 min-w-0">
                                                <FileText className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                                <span className="truncate">📦 Proof of Delivery (POD) — {item.name}</span>
                                                <ExternalLink className="w-3 h-3 text-sky-600 shrink-0" />
                                              </a>
                                              <button type="button" onClick={() => {
                                                const updated = [...contractFormEquipmentItems];
                                                updated[eqIdx] = { ...updated[eqIdx], podPdfUrl: undefined };
                                                setContractFormEquipmentItems(updated);
                                              }} className="text-rose-600 hover:text-rose-800 font-bold text-3xs px-2 py-0.5 rounded border border-rose-200 shrink-0">Eliminar</button>
                                            </div>
                                          ) : (
                                            <div>
                                              <input
                                                type="file"
                                                id={`pod-file-${eqIdx}`}
                                                accept="application/pdf,image/*"
                                                className="hidden"
                                                onChange={async (e) => {
                                                  const file = e.target.files?.[0];
                                                  if (file) {
                                                    try {
                                                      const url = await uploadFileToCloudinary(file);
                                                      const updated = [...contractFormEquipmentItems];
                                                      updated[eqIdx] = { ...updated[eqIdx], podPdfUrl: url };
                                                      setContractFormEquipmentItems(updated);
                                                    } catch (err: any) {
                                                      alert(err.message || 'Error al subir el POD');
                                                    }
                                                  }
                                                }}
                                              />
                                              <label
                                                htmlFor={`pod-file-${eqIdx}`}
                                                className={`w-full text-slate-700 font-extrabold text-[9.5px] py-2 px-3 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-all shadow-2xs select-none ${
                                                  draggingEqAttachKey === `${eqIdx}-pod`
                                                    ? 'border-sky-500 bg-sky-100/90 text-sky-950 shadow-md scale-[1.01]'
                                                    : 'border-sky-300/80 bg-sky-50/30 hover:bg-sky-50 hover:border-sky-400'
                                                }`}
                                              >
                                                <div className="flex items-center justify-between w-full pointer-events-none">
                                                  <span className="flex items-center gap-1.5 truncate font-extrabold text-sky-950">
                                                    <Upload className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                                    <span className="truncate">📦 Proof of Delivery (POD) — {item.name}</span>
                                                  </span>
                                                  <span className="text-[7.5px] font-bold text-sky-800 bg-sky-100 px-1.5 py-0.2 rounded shrink-0">
                                                    {draggingEqAttachKey === `${eqIdx}-pod` ? '¡Suelta el POD aquí!' : 'Subir POD / Arrastrar'}
                                                  </span>
                                                </div>
                                                <span className="text-[8.5px] font-normal text-slate-400 pointer-events-none">
                                                  Arrastra y suelta el archivo aquí o haz clic para buscar
                                                </span>
                                              </label>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                /* GENERAL CONTRACT ATTACHMENTS IF NO EQUIPMENTS LISTED YET */
                                <div className="space-y-2">
                                  {/* Service Record (SR) Upload Card */}
                                  <div 
                                    onDragEnter={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setIsDraggingSrPdf(true);
                                    }}
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      e.dataTransfer.dropEffect = 'copy';
                                      if (!isDraggingSrPdf) setIsDraggingSrPdf(true);
                                    }}
                                    onDragLeave={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                                      setIsDraggingSrPdf(false);
                                    }}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setIsDraggingSrPdf(false);
                                      const file = e.dataTransfer.files?.[0];
                                      if (file) handleUploadSrFile(file);
                                    }}
                                    className={`bg-white border rounded-xl p-2.5 space-y-1.5 transition-all ${
                                      isDraggingSrPdf ? 'bg-amber-100/90 border-amber-500 ring-2 ring-amber-400/50 scale-[1.01]' : 'border-amber-200'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between pointer-events-none">
                                      <span className="block text-[9.5px] font-extrabold text-amber-950 uppercase tracking-wide">🛠️ Service Record (SR General)</span>
                                      {isDraggingSrPdf ? (
                                        <span className="text-[8px] font-extrabold text-amber-800 uppercase tracking-wider animate-pulse">¡Suelta el SR aquí!</span>
                                      ) : (
                                        <span className="text-[8px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">Opcional</span>
                                      )}
                                    </div>
                                    {contractFormSrPdfUrl ? (
                                      <div className="flex items-center justify-between bg-amber-50 border border-amber-200 p-2 rounded-lg text-xs gap-2">
                                        <a href={getCleanCloudinaryUrl(contractFormSrPdfUrl)} target="_blank" rel="noreferrer" className="text-amber-950 font-extrabold hover:underline truncate flex items-center gap-1.5 min-w-0">
                                          <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                          <span className="truncate">Ver Service Record (SR)</span>
                                          <ExternalLink className="w-3 h-3 text-amber-600 shrink-0" />
                                        </a>
                                        <button type="button" onClick={() => setContractFormSrPdfUrl('')} className="text-rose-600 hover:text-rose-800 font-bold text-3xs px-2 py-1 rounded border border-rose-200 shrink-0">Eliminar</button>
                                      </div>
                                    ) : (
                                      <div>
                                        <input type="file" id="sr-pdf-input" accept="application/pdf,image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUploadSrFile(file); }} className="hidden" />
                                        <label
                                          htmlFor="sr-pdf-input"
                                          className={`w-full text-slate-700 font-extrabold text-xs py-2 px-3 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all shadow-2xs select-none ${
                                            isDraggingSrPdf
                                              ? 'border-amber-500 bg-amber-50 text-amber-950 shadow-md'
                                              : 'border-amber-300 bg-amber-50/30 hover:bg-amber-50 hover:border-amber-400'
                                          }`}
                                        >
                                          {isUploadingSrPdf ? (
                                            <span className="text-amber-600 font-bold animate-pulse">Subiendo SR... ({uploadSrPdfProgress}%)</span>
                                          ) : (
                                            <>
                                              <div className="flex items-center gap-1.5 pointer-events-none">
                                                <Upload className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                                <span>{isDraggingSrPdf ? '¡Suelte el Service Record aquí!' : 'Adjuntar Service Record (SR)'}</span>
                                              </div>
                                              <span className="text-[9px] font-normal text-slate-400 pointer-events-none">
                                                Arrastra y suelta el archivo aquí o haz clic para buscar
                                              </span>
                                            </>
                                          )}
                                        </label>
                                      </div>
                                    )}
                                  </div>

                                  {/* Certificate of Acceptance (CA) Upload Card */}
                                  <div 
                                    onDragEnter={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setIsDraggingCaPdf(true);
                                    }}
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      e.dataTransfer.dropEffect = 'copy';
                                      if (!isDraggingCaPdf) setIsDraggingCaPdf(true);
                                    }}
                                    onDragLeave={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                                      setIsDraggingCaPdf(false);
                                    }}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setIsDraggingCaPdf(false);
                                      const file = e.dataTransfer.files?.[0];
                                      if (file) handleUploadCaFile(file);
                                    }}
                                    className={`bg-white border rounded-xl p-2.5 space-y-1.5 transition-all ${
                                      isDraggingCaPdf ? 'bg-teal-100/90 border-teal-500 ring-2 ring-teal-400/50 scale-[1.01]' : 'border-teal-200'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between pointer-events-none">
                                      <span className="block text-[9.5px] font-extrabold text-teal-950 uppercase tracking-wide">📜 Certificate of Acceptance (CA General)</span>
                                      {isDraggingCaPdf ? (
                                        <span className="text-[8px] font-extrabold text-teal-800 uppercase tracking-wider animate-pulse">¡Suelta el CA aquí!</span>
                                      ) : (
                                        <span className="text-[8px] font-bold text-teal-700 bg-teal-100 px-1.5 py-0.2 rounded">Opcional</span>
                                      )}
                                    </div>
                                    {contractFormCaPdfUrl ? (
                                      <div className="flex items-center justify-between bg-teal-50 border border-teal-200 p-2 rounded-lg text-xs gap-2">
                                        <a href={getCleanCloudinaryUrl(contractFormCaPdfUrl)} target="_blank" rel="noreferrer" className="text-teal-950 font-extrabold hover:underline truncate flex items-center gap-1.5 min-w-0">
                                          <FileText className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                                          <span className="truncate">Ver Certificate of Acceptance (CA)</span>
                                          <ExternalLink className="w-3 h-3 text-teal-600 shrink-0" />
                                        </a>
                                        <button type="button" onClick={() => setContractFormCaPdfUrl('')} className="text-rose-600 hover:text-rose-800 font-bold text-3xs px-2 py-1 rounded border border-rose-200 shrink-0">Eliminar</button>
                                      </div>
                                    ) : (
                                      <div>
                                        <input type="file" id="ca-pdf-input" accept="application/pdf,image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUploadCaFile(file); }} className="hidden" />
                                        <label
                                          htmlFor="ca-pdf-input"
                                          className={`w-full text-slate-700 font-extrabold text-xs py-2 px-3 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all shadow-2xs select-none ${
                                            isDraggingCaPdf
                                              ? 'border-teal-500 bg-teal-50 text-teal-950 shadow-md'
                                              : 'border-teal-300 bg-teal-50/30 hover:bg-teal-50 hover:border-teal-400'
                                          }`}
                                        >
                                          {isUploadingCaPdf ? (
                                            <span className="text-teal-600 font-bold animate-pulse">Subiendo CA... ({uploadCaPdfProgress}%)</span>
                                          ) : (
                                            <>
                                              <div className="flex items-center gap-1.5 pointer-events-none">
                                                <Upload className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                                                <span>{isDraggingCaPdf ? '¡Suelte el CA aquí!' : 'Adjuntar Certificate of Acceptance (CA)'}</span>
                                              </div>
                                              <span className="text-[9px] font-normal text-slate-400 pointer-events-none">
                                                Arrastra y suelta el archivo aquí o haz clic para buscar
                                              </span>
                                            </>
                                          )}
                                        </label>
                                      </div>
                                    )}
                                  </div>

                                  {/* Proof of Delivery (POD) Upload Card */}
                                  <div 
                                    onDragEnter={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setIsDraggingPodPdf(true);
                                    }}
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      e.dataTransfer.dropEffect = 'copy';
                                      if (!isDraggingPodPdf) setIsDraggingPodPdf(true);
                                    }}
                                    onDragLeave={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                                      setIsDraggingPodPdf(false);
                                    }}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setIsDraggingPodPdf(false);
                                      const file = e.dataTransfer.files?.[0];
                                      if (file) handleUploadPodFile(file);
                                    }}
                                    className={`bg-white border rounded-xl p-2.5 space-y-1.5 transition-all ${
                                      isDraggingPodPdf ? 'bg-sky-100/90 border-sky-500 ring-2 ring-sky-400/50 scale-[1.01]' : 'border-sky-200'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between pointer-events-none">
                                      <span className="block text-[9.5px] font-extrabold text-sky-950 uppercase tracking-wide">📦 Proof of Delivery (POD General)</span>
                                      {isDraggingPodPdf ? (
                                        <span className="text-[8px] font-extrabold text-sky-800 uppercase tracking-wider animate-pulse">¡Suelta el POD aquí!</span>
                                      ) : (
                                        <span className="text-[8px] font-bold text-sky-700 bg-sky-100 px-1.5 py-0.2 rounded">Opcional</span>
                                      )}
                                    </div>
                                    {contractFormPodPdfUrl ? (
                                      <div className="flex items-center justify-between bg-sky-50 border border-sky-200 p-2 rounded-lg text-xs gap-2">
                                        <a href={getCleanCloudinaryUrl(contractFormPodPdfUrl)} target="_blank" rel="noreferrer" className="text-sky-950 font-extrabold hover:underline truncate flex items-center gap-1.5 min-w-0">
                                          <FileText className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                          <span className="truncate">Ver Proof of Delivery (POD)</span>
                                          <ExternalLink className="w-3 h-3 text-sky-600 shrink-0" />
                                        </a>
                                        <button type="button" onClick={() => setContractFormPodPdfUrl('')} className="text-rose-600 hover:text-rose-800 font-bold text-3xs px-2 py-1 rounded border border-rose-200 shrink-0">Eliminar</button>
                                      </div>
                                    ) : (
                                      <div>
                                        <input type="file" id="pod-pdf-input" accept="application/pdf,image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUploadPodFile(file); }} className="hidden" />
                                        <label
                                          htmlFor="pod-pdf-input"
                                          className={`w-full text-slate-700 font-extrabold text-xs py-2 px-3 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all shadow-2xs select-none ${
                                            isDraggingPodPdf
                                              ? 'border-sky-500 bg-sky-50 text-sky-950 shadow-md'
                                              : 'border-sky-300 bg-sky-50/30 hover:bg-sky-50 hover:border-sky-400'
                                          }`}
                                        >
                                          {isUploadingPodPdf ? (
                                            <span className="text-sky-600 font-bold animate-pulse">Subiendo POD... ({uploadPodPdfProgress}%)</span>
                                          ) : (
                                            <>
                                              <div className="flex items-center gap-1.5 pointer-events-none">
                                                <Upload className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                                <span>{isDraggingPodPdf ? '¡Suelte el POD aquí!' : 'Adjuntar Proof of Delivery (POD)'}</span>
                                              </div>
                                              <span className="text-[9px] font-normal text-slate-400 pointer-events-none">
                                                Arrastra y suelta el archivo aquí o haz clic para buscar
                                              </span>
                                            </>
                                          )}
                                        </label>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Cronograma Firmado Upload Card */}
                          <div 
                            onDragEnter={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsDraggingSchedulePdf(true);
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              e.dataTransfer.dropEffect = 'copy';
                              if (!isDraggingSchedulePdf) setIsDraggingSchedulePdf(true);
                            }}
                            onDragLeave={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                              setIsDraggingSchedulePdf(false);
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsDraggingSchedulePdf(false);
                              const file = e.dataTransfer.files?.[0];
                              if (file) handleUploadScheduleFile(file);
                            }}
                            className={`bg-slate-50 border rounded-xl p-2.5 space-y-1.5 transition-all ${
                              isDraggingSchedulePdf ? 'bg-purple-50/80 border-purple-500 ring-2 ring-purple-400/50 scale-[1.01]' : 'border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between pointer-events-none">
                              <span className="block text-[9.5px] font-extrabold text-slate-700 uppercase tracking-wide">📅 Cronograma Firmado</span>
                              {isDraggingSchedulePdf && (
                                <span className="text-[8px] font-extrabold text-purple-700 uppercase tracking-wider animate-pulse">¡Suelta el archivo!</span>
                              )}
                            </div>
                            
                            {contractFormSchedulePdfUrl ? (
                              <div className="flex items-center justify-between bg-purple-50 border border-purple-200 p-2 rounded-lg text-xs gap-2">
                                <a href={getCleanCloudinaryUrl(contractFormSchedulePdfUrl)} target="_blank" rel="noreferrer" className="text-purple-950 font-extrabold hover:underline truncate flex items-center gap-1.5 min-w-0">
                                  <FileText className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                  <span className="truncate">Ver Cronograma Adjunto</span>
                                  <ExternalLink className="w-3 h-3 text-purple-600 shrink-0" />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => setContractFormSchedulePdfUrl('')}
                                  className="text-rose-600 hover:text-rose-800 hover:bg-rose-100/60 font-bold text-3xs px-2 py-1 rounded transition-colors shrink-0 cursor-pointer border border-rose-200/60"
                                >
                                  Eliminar
                                </button>
                              </div>
                            ) : (
                              <div>
                                <input
                                  type="file"
                                  id="schedule-pdf-input"
                                  accept="application/pdf,image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleUploadScheduleFile(file);
                                  }}
                                  className="hidden"
                                />
                                <label
                                  htmlFor="schedule-pdf-input"
                                  className={`w-full text-slate-700 font-extrabold text-xs py-2.5 px-3 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-all shadow-2xs select-none ${
                                    isDraggingSchedulePdf
                                      ? 'border-purple-500 bg-white text-purple-900 shadow-md'
                                      : 'border-purple-300/80 bg-white hover:bg-slate-100/80 hover:border-purple-400'
                                  }`}
                                >
                                  {isUploadingSchedulePdf ? (
                                    <span className="text-amber-600 font-bold animate-pulse py-1">Subiendo Cronograma... ({uploadSchedulePdfProgress}%)</span>
                                  ) : (
                                    <>
                                      <div className="flex items-center gap-1.5 pointer-events-none">
                                        <Upload className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                        <span>{isDraggingSchedulePdf ? '¡Suelte el archivo del cronograma aquí!' : 'Adjuntar Cronograma PDF'}</span>
                                      </div>
                                      <span className="text-[9px] font-normal text-slate-400 pointer-events-none">
                                        Arrastra y suelta el archivo aquí o haz clic para buscar
                                      </span>
                                    </>
                                  )}
                                </label>
                               </div>
                             )}
                           </div>
                         </div>
                       </div>
                     </div>

                  {/* Right Side: Equipment and Maintenance scheduling */}
                  <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-5">
                    {/* Equipments Panel */}
                    <div className="space-y-2">
                      <h4 className="font-extrabold text-[10px] text-slate-500 uppercase tracking-wider">Equipos en Contrato</h4>
                      
                      {/* Load existing Client Equipment */}
                      {contractFormClientId && !isCreatingNewClientForContract && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1.5 max-h-[110px] overflow-y-auto">
                          <span className="font-bold text-[9px] text-indigo-750 block">Equipos Registrados de este Cliente</span>
                          {(() => {
                            const clientEquips = equipments.filter(eq => eq.clientId === contractFormClientId);
                            if (clientEquips.length === 0) {
                              return <span className="text-[9px] text-slate-400 italic">No hay equipos registrados.</span>;
                            }
                            return (
                              <div className="space-y-1">
                                {clientEquips.map(eq => {
                                  const alreadyAdded = contractFormEquipmentItems.some(item => item.name.toLowerCase() === eq.name.toLowerCase());
                                  return (
                                    <div key={eq.id} className="flex items-center justify-between text-[10px] bg-white border border-slate-150 p-1 rounded-md shadow-3xs">
                                      <div className="truncate">
                                        <span className="font-bold text-slate-800">{eq.name}</span>
                                        <span className="text-[8px] text-slate-400 font-medium block">Marca: {eq.brand || 'N/D'}</span>
                                      </div>
                                      {!alreadyAdded && !isSalesReadOnly ? (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setContractFormEquipmentItems([...contractFormEquipmentItems, { name: eq.name, brand: eq.brand || 'N/D', serial: eq.serialNumber || undefined }]);
                                          }}
                                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold px-1 py-0.5 rounded text-[8px] cursor-pointer"
                                        >
                                          + Agregar
                                        </button>
                                      ) : alreadyAdded ? (
                                        <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-100">Agregado</span>
                                      ) : null}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* Add Custom / New Equipment to contract */}
                      {!isSalesReadOnly && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="space-y-0.5">
                              <label className="block text-[9px] font-extrabold text-slate-500 uppercase">Nombre Equipo</label>
                              <input
                                type="text"
                                placeholder="Ej. REVOLUTION MAXIMA"
                                value={tempEquipName}
                                onChange={(e) => setTempEquipName(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 outline-hidden focus:border-indigo-500"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <label className="block text-[9px] font-extrabold text-slate-500 uppercase">Marca</label>
                              <input
                                type="text"
                                placeholder="Ej. GE"
                                value={tempEquipBrand}
                                onChange={(e) => setTempEquipBrand(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 outline-hidden focus:border-indigo-500"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <label className="block text-[9px] font-extrabold text-slate-500 uppercase">Modalidad</label>
                              <select
                                value={tempEquipModality}
                                onChange={(e) => setTempEquipModality(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-extrabold text-slate-700 outline-hidden focus:border-indigo-500 cursor-pointer"
                              >
                                <option value="">-- Modalidad --</option>
                                {EQUIPMENT_MODALITIES.map(mod => (
                                  <option key={mod} value={mod}>{mod}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Optional Fields: Serial & GON */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5 border-t border-slate-200/60">
                            <div className="space-y-0.5">
                              <label className="block text-[9px] font-extrabold text-slate-500 uppercase flex items-center justify-between">
                                <span>Serial (Opcional)</span>
                              </label>
                              <input
                                type="text"
                                placeholder="Ej. SN-98765432"
                                value={tempEquipSerial}
                                onChange={(e) => setTempEquipSerial(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 font-mono outline-hidden focus:border-indigo-500"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <label className="block text-[9px] font-extrabold text-slate-500 uppercase flex items-center justify-between">
                                <span>GON (Opcional)</span>
                              </label>
                              <input
                                type="text"
                                placeholder="Ej. GON-12345"
                                value={tempEquipGon}
                                onChange={(e) => setTempEquipGon(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 font-mono outline-hidden focus:border-indigo-500"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end pt-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (!tempEquipName.trim()) return;
                                setContractFormEquipmentItems([
                                  ...contractFormEquipmentItems, 
                                  { 
                                    name: tempEquipName.trim(), 
                                    brand: tempEquipBrand.trim() || 'N/D',
                                    modality: tempEquipModality || undefined,
                                    serial: tempEquipSerial.trim() || undefined,
                                    gon: tempEquipGon.trim() || undefined,
                                  }
                                ]);
                                setTempEquipName('');
                                setTempEquipBrand('');
                                setTempEquipModality('');
                                setTempEquipSerial('');
                                setTempEquipGon('');
                              }}
                              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-extrabold px-3 py-1.5 rounded-lg text-3xs transition-all shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span>+ Agregar Equipo</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* List of currently covered equipments */}
                      <div className="border border-slate-205 rounded-xl divide-y divide-slate-100 max-h-[140px] overflow-y-auto bg-white">
                        {contractFormEquipmentItems.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-2 hover:bg-slate-50/50 transition-colors">
                            <div className="truncate pr-2 space-y-0.5">
                              <p className="font-bold text-slate-800 text-[10.5px] leading-tight">{item.name}</p>
                              <div className="flex flex-wrap items-center gap-1 text-[8.5px] text-slate-500 font-semibold leading-none">
                                <span>Marca: <span className="font-extrabold text-slate-700">{item.brand}</span></span>
                                {item.modality && (
                                  <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-1 py-0.2 rounded font-black text-[7.5px]">
                                    {item.modality}
                                  </span>
                                )}
                                {item.serial && (
                                  <span className="bg-slate-100 text-slate-700 border border-slate-200 px-1 py-0.2 rounded font-mono text-[7.5px]">
                                    S/N: {item.serial}
                                  </span>
                                )}
                                {item.gon && (
                                  <span className="bg-purple-50 text-purple-750 border border-purple-200 px-1 py-0.2 rounded font-mono text-[7.5px]">
                                    GON: {item.gon}
                                  </span>
                                )}
                              </div>
                            </div>
                            {!isSalesReadOnly && (
                              <button
                                type="button"
                                onClick={() => {
                                  setContractFormEquipmentItems(contractFormEquipmentItems.filter((_, i) => i !== index));
                                }}
                                className="text-red-500 hover:text-red-700 font-black text-2xs p-1 cursor-pointer shrink-0"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                        {contractFormEquipmentItems.length === 0 && (
                          <div className="p-3 text-center text-slate-400 italic text-[9px]">
                            Ningún equipo asignado a la cobertura.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Maintenance Scheduling Panel */}
                    <div className="space-y-2.5 pt-3 border-t border-slate-150">
                      <h4 className="font-extrabold text-[10px] text-slate-500 uppercase tracking-wider">Mantenimientos Programados</h4>
                      
                      {/* Option: Dejar pendiente de programación por el Administrador */}
                      <div className="bg-amber-50/90 border border-amber-250 rounded-xl p-2.5 space-y-1">
                        <label className="flex items-start gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            disabled={isSalesReadOnly}
                            checked={contractFormPendingAdmin}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setContractFormPendingAdmin(isChecked);
                              if (isChecked) {
                                setContractFormFrequency('Ninguno');
                                setContractFormMaintenanceDates([]);
                                setContractFormQcDate('');
                                setContractFormStatus('Pendiente');
                              } else if (contractFormStatus === 'Pendiente') {
                                const todayStr = new Date().toISOString().split('T')[0];
                                const isExpired = contractFormEnd && contractFormEnd < todayStr;
                                setContractFormStatus(isExpired ? 'Vencido' : 'Activo');
                              }
                            }}
                            className="w-4 h-4 mt-0.5 accent-amber-600 rounded cursor-pointer disabled:cursor-not-allowed"
                          />
                          <div>
                            <span className="font-extrabold text-[10.5px] text-amber-950 block">
                              ⏳ Dejar sin mantenimiento (Pendiente de programación por Admin)
                            </span>
                            <p className="text-[9px] text-amber-850 font-medium leading-tight mt-0.5">
                              {userRole === 'sales'
                                ? 'Cargue los datos del contrato y el archivo PDF. El Administrador asignará las fechas del cronograma.'
                                : 'Si activa esto, el contrato quedará marcado con alerta para definir las fechas posteriormente.'}
                            </p>
                          </div>
                        </label>
                      </div>
                      
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                          {/* Column 1: Target Equipment Selector */}
                          <div className="space-y-1">
                            <label className="block text-[9.5px] font-extrabold text-slate-600 uppercase">
                              {contractFormEquipmentItems.length > 1 ? '🎯 Aplica a Equipo' : '⚙️ Equipo'}
                            </label>
                            <select
                              value={contractFormSelectedEquipForFreq}
                              disabled={isSalesReadOnly || contractFormEquipmentItems.length === 0}
                              onChange={(e) => setContractFormSelectedEquipForFreq(e.target.value)}
                              className={`w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-extrabold text-slate-800 outline-hidden ${
                                isSalesReadOnly || contractFormEquipmentItems.length === 0
                                  ? 'bg-slate-100 cursor-not-allowed opacity-80'
                                  : 'bg-white focus:border-indigo-500 cursor-pointer shadow-2xs'
                              }`}
                            >
                              <option value="all">
                                {contractFormEquipmentItems.length === 0
                                  ? 'Todos los equipos'
                                  : `🌐 Todos (${contractFormEquipmentItems.length})`}
                              </option>
                              {contractFormEquipmentItems.map((item, idx) => (
                                <option key={idx} value={item.name}>
                                  ⚙️ {item.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Column 2: Frequency Selector */}
                          <div className="space-y-1">
                            <label className="block text-[9.5px] font-extrabold text-slate-600 uppercase">Frecuencia</label>
                            <select
                              value={contractFormFrequency}
                              disabled={isSalesReadOnly}
                              onChange={(e) => {
                                const freq = e.target.value as any;
                                setContractFormFrequency(freq);
                                if (freq !== 'Ninguno') {
                                  setContractFormPendingAdmin(false);
                                  if (contractFormStatus === 'Pendiente') {
                                    const todayStr = new Date().toISOString().split('T')[0];
                                    const isExpired = contractFormEnd && contractFormEnd < todayStr;
                                    setContractFormStatus(isExpired ? 'Vencido' : 'Activo');
                                  }
                                }
                              }}
                              className={`w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-hidden ${
                                isSalesReadOnly ? 'bg-slate-100 cursor-not-allowed opacity-80' : 'bg-white focus:border-indigo-500 cursor-pointer shadow-2xs'
                              }`}
                            >
                              <option value="Ninguno">Ninguno</option>
                              <option value="Mensual">Mensual</option>
                              <option value="Bimestral">Bimestral</option>
                              <option value="Trimestral">Trimestral</option>
                              <option value="Cuatrimestral">Cuatrimestral</option>
                              <option value="Semestral">Semestral</option>
                              <option value="Anual">Anual</option>
                              <option value="Personalizado">Personalizado (Fechas manuales)</option>
                            </select>
                          </div>

                          {/* Column 3: Suggested Day */}
                          <div className="space-y-1">
                            <label className="block text-[9.5px] font-extrabold text-slate-600 uppercase">Día Sugerido</label>
                            <input
                              type="number"
                              min={1}
                              max={31}
                              placeholder="Ej. 27"
                              disabled={isSalesReadOnly || contractFormFrequency === 'Ninguno' || contractFormFrequency === 'Personalizado'}
                              value={contractFormPreferredDay}
                              onChange={(e) => {
                                const val = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                                setContractFormPreferredDay(val);
                              }}
                              className={`w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-extrabold text-slate-800 outline-hidden ${
                                isSalesReadOnly || contractFormFrequency === 'Ninguno' || contractFormFrequency === 'Personalizado'
                                  ? 'bg-slate-100 cursor-not-allowed opacity-70'
                                  : 'bg-white focus:border-indigo-500'
                              }`}
                            />
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-[7.5px] text-slate-400 font-extrabold">Sugerir:</span>
                              {[1, 15, 27].map(day => (
                                <button
                                  key={day}
                                  type="button"
                                  disabled={isSalesReadOnly || contractFormFrequency === 'Ninguno' || contractFormFrequency === 'Personalizado'}
                                  onClick={() => setContractFormPreferredDay(day)}
                                  className={`px-1.5 py-0.2 rounded text-[8px] font-black transition-colors cursor-pointer ${
                                    contractFormPreferredDay === day
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-slate-200/80 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700'
                                  }`}
                                >
                                  {day}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Column 4: Preferred Starting Month */}
                          <div className="space-y-1">
                            <label className="block text-[9.5px] font-extrabold text-slate-600 uppercase">Mes Inicial</label>
                            <select
                              value={contractFormPreferredMonth}
                              disabled={isSalesReadOnly || contractFormFrequency === 'Ninguno' || contractFormFrequency === 'Personalizado'}
                              onChange={(e) => setContractFormPreferredMonth(e.target.value === '' ? '' : Number(e.target.value))}
                              className={`w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-extrabold text-slate-800 outline-hidden ${
                                isSalesReadOnly || contractFormFrequency === 'Ninguno' || contractFormFrequency === 'Personalizado'
                                  ? 'bg-slate-100 cursor-not-allowed opacity-70'
                                  : 'bg-white focus:border-indigo-500 cursor-pointer shadow-2xs'
                              }`}
                            >
                              <option value="">Auto (Desde Inicio)</option>
                              <option value={1}>01 - Enero</option>
                              <option value={2}>02 - Febrero</option>
                              <option value={3}>03 - Marzo</option>
                              <option value={4}>04 - Abril</option>
                              <option value={5}>05 - Mayo</option>
                              <option value={6}>06 - Junio</option>
                              <option value={7}>07 - Julio</option>
                              <option value={8}>08 - Agosto</option>
                              <option value={9}>09 - Septiembre</option>
                              <option value={10}>10 - Octubre</option>
                              <option value={11}>11 - Noviembre</option>
                              <option value={12}>12 - Diciembre</option>
                            </select>
                          </div>
                        </div>

                        <div className="pt-0.5">
                          <button
                            type="button"
                            disabled={isSalesReadOnly}
                            onClick={() => {
                              if (contractFormFrequency === 'Ninguno' || contractFormFrequency === 'Personalizado') {
                                alert("Seleccione una frecuencia periódica (ej. Mensual, Trimestral, Semestral, Anual) para autogenerar las visitas.");
                                return;
                              }
                              if (!contractFormStart || !contractFormEnd || contractFormStart >= contractFormEnd) {
                                alert("La Fecha Vencimiento debe ser posterior a la Fecha Inicio para poder calcular las fechas de mantenimiento.");
                                return;
                              }
                              const prefDay = typeof contractFormPreferredDay === 'number' ? contractFormPreferredDay : undefined;
                              const prefMonth = typeof contractFormPreferredMonth === 'number' ? contractFormPreferredMonth : undefined;
                              const generated = generateMaintenanceDates(contractFormStart, contractFormEnd, contractFormFrequency, contractFormType, prefDay, contractFormSelectedEquipForFreq, prefMonth);
                              if (generated.length === 0) {
                                alert("No se pudieron generar fechas con los parámetros actuales. Verifique que el período del contrato abarque la frecuencia seleccionada.");
                                return;
                              }
                              if (contractFormSelectedEquipForFreq === 'all') {
                                setContractFormMaintenanceDates(generated);
                                const autoQcs = computeDefaultQcDates(generated);
                                setContractFormQcDates(autoQcs);
                                if (autoQcs.length > 0) setContractFormQcDate(autoQcs[0].split('|')[0]);
                              } else {
                                const other = contractFormMaintenanceDates.filter(d => d.split('|')[1] !== contractFormSelectedEquipForFreq);
                                const merged = [...other, ...generated].sort((a, b) => a.split('|')[0].localeCompare(b.split('|')[0]));
                                setContractFormMaintenanceDates(merged);
                                const autoQcs = computeDefaultQcDates(merged);
                                setContractFormQcDates(autoQcs);
                                if (autoQcs.length > 0) setContractFormQcDate(autoQcs[0].split('|')[0]);
                              }
                            }}
                            className={`w-full py-2 border rounded-xl text-xs font-black transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                              isSalesReadOnly 
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                                : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white border-indigo-600 cursor-pointer active:scale-98'
                            }`}
                          >
                            <span>
                              {contractFormSelectedEquipForFreq === 'all'
                                ? '⚡ Generar / Recalcular Fechas (Todos los Equipos)'
                                : `+ Generar Fechas para ${contractFormSelectedEquipForFreq}`}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Add Specific Custom Date */}
                      {!isSalesReadOnly && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                          <span className="font-extrabold text-[10px] text-slate-600 uppercase tracking-wider block">
                            ➕ Agregar Fecha Manual
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div className="space-y-1">
                              <label className="block text-[9px] font-bold text-slate-500 uppercase">Fecha de Mantenimiento</label>
                              <input
                                type="date"
                                value={tempMaintenanceDate}
                                onChange={(e) => setTempMaintenanceDate(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-hidden font-mono focus:border-indigo-500"
                              />
                            </div>
                            {contractFormEquipmentItems.length > 0 && (
                              <div className="space-y-1">
                                <label className="block text-[9px] font-bold text-slate-500 uppercase">Para Equipo (Opcional)</label>
                                <select
                                  value={tempManualEquipTarget}
                                  onChange={(e) => setTempManualEquipTarget(e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-hidden focus:border-indigo-500 cursor-pointer"
                                >
                                  <option value="">(Todos los equipos)</option>
                                  {contractFormEquipmentItems.map((item, idx) => (
                                    <option key={idx} value={item.name}>
                                      ⚙️ {item.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (!tempMaintenanceDate) return;
                                const targetEq = tempManualEquipTarget || (contractFormSelectedEquipForFreq !== 'all' ? contractFormSelectedEquipForFreq : '');
                                const entryToAdd = targetEq ? `${tempMaintenanceDate}|${targetEq}` : tempMaintenanceDate;
                                if (contractFormMaintenanceDates.includes(entryToAdd)) {
                                  alert("Esta fecha ya está registrada.");
                                  return;
                                }
                                const updated = [...contractFormMaintenanceDates, entryToAdd].sort((a, b) => a.split('|')[0].localeCompare(b.split('|')[0]));
                                setContractFormMaintenanceDates(updated);
                                setTempMaintenanceDate('');
                                if (contractFormQcDates.length === 0) {
                                  setContractFormQcDates([entryToAdd]);
                                  setContractFormQcDate(tempMaintenanceDate);
                                }
                              }}
                              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-extrabold px-4 py-1.5 rounded-lg text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1"
                            >
                              <span>+ Agregar Fecha Manual</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* List of maintenance dates with interactive Quality Control toggles */}
                      <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-[140px] overflow-y-auto bg-white">
                        {(() => {
                          const currentQcs = contractFormQcDates.length > 0 ? contractFormQcDates : computeDefaultQcDates(contractFormMaintenanceDates);

                          return contractFormMaintenanceDates.map((rawEntry, index) => {
                            const [date, specificEquip] = rawEntry.split('|');
                            const isQc = currentQcs.some(qd => {
                              const [qDate, qEq] = qd.split('|');
                              if (specificEquip && qEq) {
                                return qDate === date && qEq === specificEquip;
                              }
                              return qd === rawEntry || qd === date || qDate === date;
                            });
                            const fmtDate = (d: string) => {
                              if (!d) return '—';
                              const [y, m, day] = d.split('-');
                              const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
                              return `${parseInt(day)} ${months[parseInt(m)-1]} ${y}`;
                            };

                            return (
                              <div key={index} className="flex items-center justify-between px-2.5 py-1.5 hover:bg-slate-50/50 transition-colors">
                                <div className="flex items-center gap-2 flex-wrap pr-1">
                                  <span className="font-mono text-slate-800 text-[10px] font-bold">{fmtDate(date)}</span>
                                  {specificEquip && (
                                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.2 rounded text-[8px] font-extrabold">
                                      ⚙️ {specificEquip}
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    disabled={isSalesReadOnly}
                                    onClick={() => {
                                      if (isQc) {
                                        const next = currentQcs.filter(qd => {
                                          const [qDate, qEq] = qd.split('|');
                                          if (specificEquip && qEq) {
                                            return !(qDate === date && qEq === specificEquip);
                                          }
                                          return qd !== rawEntry && qd !== date && qDate !== date;
                                        });
                                        setContractFormQcDates(next);
                                      } else {
                                        let next = currentQcs.filter(qd => {
                                          const [_, qEq] = qd.split('|');
                                          if (specificEquip && qEq) {
                                            return qEq !== specificEquip;
                                          }
                                          return true;
                                        });
                                        next.push(rawEntry);
                                        setContractFormQcDates(next);
                                        setContractFormQcDate(date);
                                      }
                                    }}
                                    className={`text-[8px] font-black px-1.5 py-0.5 rounded-full border transition-all ${
                                      isSalesReadOnly 
                                        ? (isQc ? 'bg-violet-400 border-violet-400 text-white cursor-not-allowed' : 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed')
                                        : (isQc ? 'bg-violet-600 border-violet-600 text-white shadow-3xs cursor-pointer' : 'bg-white hover:bg-slate-100 text-slate-400 border-slate-200 cursor-pointer')
                                    }`}
                                    title="Marcar esta visita como Control de Calidad"
                                  >
                                    {isQc ? '📋 Control Calidad' : 'Hacer QC'}
                                  </button>
                                </div>
                                {!isSalesReadOnly && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setContractFormQcDates(currentQcs.filter(qd => qd !== rawEntry && qd !== date));
                                      setContractFormMaintenanceDates(contractFormMaintenanceDates.filter((_, i) => i !== index));
                                    }}
                                    className="text-red-500 hover:text-red-700 font-black text-2xs p-1 cursor-pointer shrink-0"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            );
                          });
                        })()}
                        {contractFormMaintenanceDates.length === 0 && (
                          <div className="p-3 text-center text-slate-400 italic text-[9px]">
                            Ninguna visita de mantenimiento programada.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100 font-sans mt-3">
                {editingContract && userRole === 'admin' && onDeleteContract ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`¿Está seguro de que desea eliminar el contrato "${editingContract.id}"? Esta acción borrará el registro permanentemente.`)) {
                        onDeleteContract(editingContract.id);
                        setIsContractModalOpen(false);
                        setEditingContract(null);
                      }
                    }}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs px-3 py-2 rounded-lg cursor-pointer transition-colors border border-rose-200 flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span>Eliminar Contrato</span>
                  </button>
                ) : <div />}

                <div className="flex gap-2">
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
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-xs"
                  >
                    {editingContract ? 'Guardar Cambios' : 'Crear Registro'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        );
      })()}

      {/* Modal Detalles del Contrato */}
      {isContractDetailsModalOpen && selectedContractForDetails && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 no-print" id="contract-details-modal">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-xl p-5 space-y-4 animate-in zoom-in-95 duration-150 relative font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                <span>Detalle de Contrato: {selectedContractForDetails.id}</span>
              </h3>
              <button
                onClick={() => {
                  setIsContractDetailsModalOpen(false);
                  setSelectedContractForDetails(null);
                }}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-650 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs max-h-[75vh] overflow-y-auto overscroll-contain pr-1">
              {/* Combined Expiration & MTO Alert Box */}
              {(() => {
                const exp = getContractExpirationAlert(selectedContractForDetails.endDate, selectedContractForDetails.status, selectedContractForDetails.linkedContractId);
                const maintStatus = getContractMaintenanceStatus(selectedContractForDetails, workOrders);
                
                if (!exp && maintStatus.total === 0) return null;

                const alertColorClass = exp?.colorClass || (maintStatus.hasNoPending ? 'bg-purple-50 text-purple-950 border-purple-250' : 'bg-slate-50 text-slate-800 border-slate-200');

                return (
                  <div className={`p-3 rounded-xl border text-xs font-bold flex flex-col gap-2 shadow-2xs ${alertColorClass}`}>
                    {exp && exp.level !== 'ok' && (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{exp.level === 'renewed' ? '🔄' : exp.level === 'urgent_1m' ? '🚨' : exp.level === 'warning_3m' ? '⚠️' : '🔴'}</span>
                          <span>
                            {exp.level === 'renewed' 
                              ? `Contrato Renovado: Este contrato cuenta con un contrato sucesor vinculado (${selectedContractForDetails.linkedContractId}).`
                              : `Alerta de Vencimiento: Este contrato ${exp.text}`}
                          </span>
                        </div>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/80 font-black shadow-2xs shrink-0">
                          {exp.badgeText}
                        </span>
                      </div>
                    )}

                    {maintStatus.total > 0 && (
                      <div className={`flex flex-col gap-1.5 text-[11px] ${exp && exp.level !== 'ok' ? 'pt-2 border-t border-slate-200/60' : ''}`}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{maintStatus.hasNoPending ? '⚡' : '📋'}</span>
                            <span>
                              {maintStatus.hasNoPending ? (
                                <strong className="text-purple-900 font-extrabold">
                                  Mantenimientos al Día: ¡Se realizaron todos los MTOs ({maintStatus.done}/{maintStatus.total})! No quedan mantenimientos pendientes.
                                </strong>
                              ) : (
                                <span>
                                  <strong>Estado de Mantenimientos:</strong> {maintStatus.done} de {maintStatus.total} realizados · <strong className="text-amber-800">{maintStatus.remaining} {maintStatus.remaining === 1 ? 'MTO pendiente' : 'MTOs pendientes'}</strong>
                                </span>
                              )}
                            </span>
                          </div>
                          <span className={`text-[9px] uppercase px-2 py-0.5 rounded font-black shadow-2xs shrink-0 ${maintStatus.hasNoPending ? 'bg-purple-200 text-purple-950' : 'bg-slate-200 text-slate-800'}`}>
                            {maintStatus.hasNoPending ? '⚡ 0 PENDIENTES' : `📋 ${maintStatus.remaining} PENDIENTES`}
                          </span>
                        </div>

                        {/* Sectioned breakdown of pending maintenance by equipment */}
                        {!maintStatus.hasNoPending && maintStatus.eqBreakdown && maintStatus.eqBreakdown.some(e => e.remaining > 0) && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-200/50 pl-6">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">MTOs faltantes por equipo:</span>
                            {maintStatus.eqBreakdown.filter(e => e.remaining > 0).map((eq, idx) => (
                              <span key={idx} className="bg-white text-indigo-950 border border-indigo-200 font-bold text-[9px] px-2 py-0.5 rounded-md flex items-center gap-1 shadow-3xs font-mono">
                                <span>{eq.name}</span>
                                {eq.modality && <span className="bg-indigo-600 text-white font-black text-[7.5px] px-1 py-0.1 rounded uppercase">{eq.modality}</span>}
                                <span className="text-amber-700 font-extrabold ml-0.5">: {eq.remaining} {eq.remaining === 1 ? 'pendiente' : 'pendientes'}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
              {/* Header Contract Info card */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div>
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Cliente</span>
                  <span className="font-extrabold text-slate-800 text-[11px]">
                    {clients.find(c => c.id === selectedContractForDetails.clientId)?.name || selectedContractForDetails.clientId}
                  </span>
                </div>
                <div>
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Ciudad / Ubicación</span>
                  <span className="font-extrabold text-slate-800 text-[11px]">
                    {selectedContractForDetails.city ? `📍 ${selectedContractForDetails.city}` : 'No especificada'}
                  </span>
                </div>
                <div>
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Valor del Contrato</span>
                  <span className="font-extrabold text-emerald-700 text-[11px] font-mono">
                    {selectedContractForDetails.contractValue !== undefined && selectedContractForDetails.contractValue !== null
                      ? `$ ${selectedContractForDetails.contractValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
                      : 'No especificado'}
                  </span>
                </div>
                <div>
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Tipo Cobertura</span>
                  <span className="font-bold text-indigo-700 text-[11px]">{selectedContractForDetails.type}</span>
                </div>
                <div>
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Vigencia</span>
                  <span className="font-bold text-slate-700 text-[10px] font-mono">
                    {selectedContractForDetails.startDate} al {selectedContractForDetails.endDate}
                  </span>
                </div>
                <div>
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Estado Mantenimientos</span>
                  {(() => {
                    const maintStatus = getContractMaintenanceStatus(selectedContractForDetails, workOrders);
                    if (maintStatus.total === 0) {
                      return <span className="font-bold text-slate-500 text-[10px]">{selectedContractForDetails.maintenanceFrequency || 'Sin agenda'}</span>;
                    }
                    if (maintStatus.hasNoPending) {
                      return (
                        <span className="font-extrabold text-purple-750 text-[11px] flex items-center gap-1">
                          ⚡ {maintStatus.done}/{maintStatus.total} Realizados (0 pendientes)
                        </span>
                      );
                    }
                    return (
                      <span className="font-bold text-slate-700 text-[10px]">
                        📋 {maintStatus.done}/{maintStatus.total} Realizados ({maintStatus.remaining} {maintStatus.remaining === 1 ? 'pendiente' : 'pendientes'})
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Cloudinary Document Badges in Contract Details Modal */}
              {(selectedContractForDetails.contractPdfUrl || selectedContractForDetails.schedulePdfUrl || selectedContractForDetails.serviceRecordPdfUrl || selectedContractForDetails.caPdfUrl || selectedContractForDetails.podPdfUrl) && (
                <div className="bg-indigo-50/60 border border-indigo-150 rounded-xl p-3 space-y-2">
                  <span className="font-extrabold text-[9px] text-indigo-900 uppercase tracking-wider block">Documentos Adjuntos en la Nube (Cloudinary)</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedContractForDetails.contractPdfUrl && (
                      <a
                        href={getCleanCloudinaryUrl(selectedContractForDetails.contractPdfUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        📄 Abrir Documento de Contrato (PDF)
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {selectedContractForDetails.schedulePdfUrl && (
                      <a
                        href={getCleanCloudinaryUrl(selectedContractForDetails.schedulePdfUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        📅 Abrir Cronograma Firmado (PDF)
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {selectedContractForDetails.serviceRecordPdfUrl && (
                      <a
                        href={getCleanCloudinaryUrl(selectedContractForDetails.serviceRecordPdfUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        🛠️ Service Record (SR)
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {selectedContractForDetails.caPdfUrl && (
                      <a
                        href={getCleanCloudinaryUrl(selectedContractForDetails.caPdfUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        📜 Certificate of Acceptance (CA)
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {selectedContractForDetails.podPdfUrl && (
                      <a
                        href={getCleanCloudinaryUrl(selectedContractForDetails.podPdfUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        📦 Proof of Delivery (POD)
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Covered Equipments */}
              {selectedContractForDetails.equipmentItems && selectedContractForDetails.equipmentItems.length > 0 && (
                <div className="space-y-2">
                  <span className="font-extrabold text-[9px] text-slate-500 uppercase tracking-wider block">Equipos Cobertura y Adjuntos de Entrega</span>
                  <div className="space-y-1.5">
                    {selectedContractForDetails.equipmentItems.map((item, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200 p-2 rounded-xl flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-extrabold text-slate-800 text-xs">🖥️ {item.name}</span>
                          <span className="text-[9px] text-slate-500 font-semibold">({item.brand})</span>
                          {item.modality && (
                            <span className="bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded text-[7.5px] font-black">
                              {item.modality}
                            </span>
                          )}
                          {item.serial && (
                            <span className="bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.2 rounded font-mono text-[7.5px] font-bold">
                              S/N: {item.serial}
                            </span>
                          )}
                          {item.gon && (
                            <span className="bg-purple-50 text-purple-750 border border-purple-200 px-1.5 py-0.2 rounded font-mono text-[7.5px] font-bold">
                              GON: {item.gon}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedContractForSchedulePdf(selectedContractForDetails);
                              setSelectedEquipmentForSchedulePdf(item);
                              setIsContractSchedulePdfOpen(true);
                            }}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-extrabold text-[8px] px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-colors"
                            title="Generar Cronograma en PDF para este equipo"
                          >
                            📄 Cronograma PDF
                          </button>
                          {item.serviceRecordPdfUrl && (
                            <a href={getCleanCloudinaryUrl(item.serviceRecordPdfUrl)} target="_blank" rel="noreferrer" className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[8px] px-2 py-0.5 rounded flex items-center gap-1">
                              🛠️ SR
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                          {item.caPdfUrl && (
                            <a href={getCleanCloudinaryUrl(item.caPdfUrl)} target="_blank" rel="noreferrer" className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-[8px] px-2 py-0.5 rounded flex items-center gap-1">
                              📜 CA
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                          {item.podPdfUrl && (
                            <a href={getCleanCloudinaryUrl(item.podPdfUrl)} target="_blank" rel="noreferrer" className="bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-[8px] px-2 py-0.5 rounded flex items-center gap-1">
                              📦 POD
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Maintenance Agenda List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-extrabold text-[9px] text-slate-500 uppercase tracking-wider block">Cronograma de Visitas Programadas</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedContractForSchedulePdf(selectedContractForDetails);
                        setSelectedEquipmentForSchedulePdf(selectedContractForDetails.equipmentItems?.[0] || null);
                        setIsContractSchedulePdfOpen(true);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[8.5px] px-2.5 py-1 rounded-md cursor-pointer transition-all flex items-center gap-1 shadow-2xs active:scale-95 shrink-0"
                      title="Generar e imprimir cronograma oficial en PDF para el cliente"
                    >
                      <Printer className="w-3 h-3" />
                      <span>📄 Descargar Cronograma Oficial (PDF)</span>
                    </button>
                    {userRole === 'admin' && onAddWorkOrder && selectedContractForDetails.maintenanceDates && selectedContractForDetails.maintenanceDates.some(d => !workOrders.some(wo => isWoMatchingContractDate(wo, selectedContractForDetails, d, contracts))) && (
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        const unagendedDates = (selectedContractForDetails.maintenanceDates || []).filter(rawDate => {
                          return !workOrders.some(wo => isWoMatchingContractDate(wo, selectedContractForDetails, rawDate, contracts));
                        });

                        if (unagendedDates.length === 0) return;

                        if (!confirm(`¿Desea agendar automáticamente ${unagendedDates.length} visitas pendientes en el calendario de Agendamiento?`)) return;

                        const defaultEngineer = engineers[0]?.id || 'ENG-001';
                        for (let uIdx = 0; uIdx < unagendedDates.length; uIdx++) {
                          const rawDate = unagendedDates[uIdx];
                          const cleanDate = rawDate.split('|')[0].trim();
                          const eqNameInEntry = rawDate.split('|')[1]?.trim();
                          const eqName = eqNameInEntry || (selectedContractForDetails.equipmentItems && selectedContractForDetails.equipmentItems.length > 0 
                            ? (selectedContractForDetails.equipmentItems.length === 1 ? selectedContractForDetails.equipmentItems[0].name : selectedContractForDetails.equipmentItems[uIdx % selectedContractForDetails.equipmentItems.length]?.name || selectedContractForDetails.equipmentItems[0].name)
                            : 'Equipos según contrato');
                          
                          const woId = `WO-MTO-${selectedContractForDetails.id}-${cleanDate}-${Math.floor(Math.random() * 1000)}`;
                          const activeQcDates = (selectedContractForDetails.qcDates && selectedContractForDetails.qcDates.length > 0)
                            ? selectedContractForDetails.qcDates
                            : (selectedContractForDetails.qcDate ? [selectedContractForDetails.qcDate] : computeDefaultQcDates(selectedContractForDetails.maintenanceDates || []));

                          const isQc = activeQcDates.some(qd => {
                            const [qDate, qEq] = qd.split('|');
                            if (eqNameInEntry && qEq) {
                              return qDate === cleanDate && qEq === eqNameInEntry;
                            }
                            return qd === rawDate || qd === cleanDate || qDate === cleanDate;
                          });

                          const newWO: WorkOrder = {
                            id: woId,
                            clientId: selectedContractForDetails.clientId,
                            engineerId: defaultEngineer,
                            plannedDate: cleanDate,
                            plannedTime: '09:00 AM - 11:00 AM',
                            durationDays: 1,
                            type: isQc ? 'Inspección' : 'Preventivo',
                            status: 'Pendiente',
                            equipmentName: eqName,
                            notes: `Mantenimiento preventivo autogenerado bajo Contrato: ${selectedContractForDetails.id}${isQc ? ' (Visita de Control de Calidad)' : ''}`
                          };

                          await onAddWorkOrder(newWO);
                        }
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[8.5px] px-2.5 py-1 rounded-md cursor-pointer transition-all flex items-center gap-1 shadow-2xs active:scale-95 shrink-0"
                      title="Agendar automáticamente todas las visitas sin orden asignada en el calendario"
                    >
                      <span>⚡ Auto-Agendar Visitas ({selectedContractForDetails.maintenanceDates.filter(d => !workOrders.some(wo => isWoMatchingContractDate(wo, selectedContractForDetails, d, contracts))).length})</span>
                    </button>
                  )}
                  </div>
                </div>
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden bg-white max-h-[220px] overflow-y-auto">
                  {selectedContractForDetails.maintenanceDates && selectedContractForDetails.maintenanceDates.length > 0 ? (
                    selectedContractForDetails.maintenanceDates.map((date, idx) => {
                      const [cleanDate, specificEquipInDate] = date.split('|');

                      // Check for matching work order
                      const matchingWO = workOrders.find(
                        wo => isWoMatchingContractDate(wo, selectedContractForDetails, date, contracts)
                      );

                      // Determine equipment name
                      let targetEqName = specificEquipInDate?.trim() || matchingWO?.equipmentName;
                      if (!targetEqName && selectedContractForDetails.equipmentItems && selectedContractForDetails.equipmentItems.length > 0) {
                        if (selectedContractForDetails.equipmentItems.length === 1) {
                          targetEqName = selectedContractForDetails.equipmentItems[0].name;
                        } else {
                          targetEqName = selectedContractForDetails.equipmentItems[idx % selectedContractForDetails.equipmentItems.length]?.name;
                        }
                      }

                      // Determine modality
                      const matchingEqItem = selectedContractForDetails.equipmentItems?.find(item => item.name === targetEqName);
                      const targetModality = matchingEqItem?.modality;

                      // Is it the designated QC date?
                      const activeQcDatesDetails = (selectedContractForDetails.qcDates && selectedContractForDetails.qcDates.length > 0)
                        ? selectedContractForDetails.qcDates
                        : (selectedContractForDetails.qcDate ? [selectedContractForDetails.qcDate] : computeDefaultQcDates(selectedContractForDetails.maintenanceDates || []));

                      const isQc = activeQcDatesDetails.some(qd => {
                        const [qDate, qEq] = qd.split('|');
                        if (specificEquipInDate && qEq) {
                          return qDate === cleanDate && qEq === specificEquipInDate;
                        }
                        return qd === date || qd === cleanDate || qDate === cleanDate;
                      });

                      const fmtDate = (d: string) => {
                        if (!d) return '—';
                        const [y, m, day] = d.split('-');
                        const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
                        return `${parseInt(day)} de ${months[parseInt(m)-1]}, ${y}`;
                      };

                      // Status determination
                      let statusText = 'No Agendado (Pendiente)';
                      let statusClasses = 'bg-slate-50 text-slate-500 border-slate-200';
                      
                      if (matchingWO) {
                        if (matchingWO.status === 'Realizado' || matchingWO.status === 'Conciliado') {
                          statusText = 'Hecho (Realizado)';
                          statusClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                        } else if (matchingWO.status === 'En Proceso' || matchingWO.status === 'Reportado') {
                          statusText = `Agendado (${matchingWO.status})`;
                          statusClasses = 'bg-sky-50 text-sky-700 border-sky-200';
                        } else {
                          statusText = 'Agendado (Pendiente)';
                          statusClasses = 'bg-amber-50 text-amber-700 border-amber-200';
                        }
                      }

                      return (
                        <div 
                          key={idx} 
                          onClick={() => {
                            if (userRole === 'admin' && matchingWO) {
                              setIsContractDetailsModalOpen(false);
                              setSelectedContractForDetails(null);
                              if (matchingWO.plannedDate) {
                                const parts = matchingWO.plannedDate.split('-');
                                if (parts.length === 3) {
                                  setCalendarYear(Number(parts[0]));
                                  setCalendarMonth(Number(parts[1]));
                                  setSelectedDay(Number(parts[2]));
                                }
                              }
                              setActiveAdminTab('agendamiento');
                              setInfoWO(matchingWO);
                            }
                          }}
                          className={`flex items-center justify-between p-3 transition-colors ${
                            userRole === 'admin' && matchingWO 
                              ? 'hover:bg-indigo-50/50 cursor-pointer group' 
                              : 'hover:bg-slate-50/50 cursor-default'
                          }`}
                          title={userRole === 'admin' && matchingWO ? "Haga clic para ir directamente a la orden agendada en el calendario" : undefined}
                        >
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className={`font-mono text-slate-800 text-[11px] font-bold ${userRole === 'admin' && matchingWO ? 'group-hover:text-indigo-700' : ''} transition-colors`}>
                                {fmtDate(cleanDate)}
                              </span>
                              {targetEqName && (
                                <span className="bg-indigo-50 text-indigo-900 border border-indigo-200 px-2 py-0.5 rounded-md text-[9px] font-extrabold flex items-center gap-1 shadow-3xs">
                                  <Cpu className="w-3 h-3 text-indigo-600 shrink-0" />
                                  <span>{targetEqName}</span>
                                  {targetModality && (
                                    <span className="bg-indigo-600 text-white font-black text-[7.5px] px-1 py-0.1 rounded uppercase">
                                      {targetModality}
                                    </span>
                                  )}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              {isQc ? (
                                <span className="bg-violet-100 text-violet-900 border border-violet-200 font-extrabold text-[8px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                  📋 Control de Calidad
                                </span>
                              ) : (
                                <span className="bg-slate-100 text-slate-700 border border-slate-200 font-bold text-[8px] px-1.5 py-0.5 rounded">
                                  🛠️ Mantenimiento Preventivo
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {userRole === 'admin' && matchingWO ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsContractDetailsModalOpen(false);
                                  setSelectedContractForDetails(null);
                                  if (matchingWO.plannedDate) {
                                    const parts = matchingWO.plannedDate.split('-');
                                    if (parts.length === 3) {
                                      setCalendarYear(Number(parts[0]));
                                      setCalendarMonth(Number(parts[1]));
                                      setSelectedDay(Number(parts[2]));
                                    }
                                  }
                                  setActiveAdminTab('agendamiento');
                                  setInfoWO(matchingWO);
                                }}
                                className={`text-[8.5px] font-extrabold px-2.5 py-1 rounded-full border transition-all cursor-pointer flex items-center gap-1 hover:shadow-xs hover:scale-105 active:scale-95 ${statusClasses}`}
                                title="Haga clic para ver/editar esta orden directamente en Agendamiento"
                              >
                                <span>{statusText}</span>
                                <span className="text-[9px] font-black opacity-80">↗</span>
                              </button>
                            ) : (
                              <span className={`text-[8.5px] font-extrabold px-2 py-0.5 rounded-full border ${statusClasses}`}>
                                {statusText}
                              </span>
                            )}

                            {/* Admin Quick Action: Toggle Realizado / Pendiente */}
                            {userRole === 'admin' && matchingWO && (
                              matchingWO.status === 'Realizado' || matchingWO.status === 'Conciliado' ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onUpdateWorkOrderStatus(matchingWO.id, 'Pendiente');
                                  }}
                                  className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-extrabold px-2.5 py-1 rounded-md text-[9px] transition-colors cursor-pointer shadow-2xs flex items-center gap-1 shrink-0"
                                  title="Revertir y cambiar esta visita de nuevo a estado Pendiente"
                                >
                                  <span>↩ Cambiar a Pendiente</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onUpdateWorkOrderStatus(matchingWO.id, 'Realizado');
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-2.5 py-1 rounded-md text-[9px] transition-colors cursor-pointer shadow-2xs flex items-center gap-1 shrink-0"
                                  title="Marcar esta visita de mantenimiento como Realizada directamente"
                                >
                                  <span>✓ Marcar Realizado</span>
                                </button>
                              )
                            )}

                            {/* Admin Quick Action: Agendar */}
                            {userRole === 'admin' && !matchingWO && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Pre-fill creation form and open Create WO modal
                                  setNewWODate(date);
                                  setNewWOClient(selectedContractForDetails.clientId);
                                  const matchingClient = clients.find(c => c.id === selectedContractForDetails.clientId);
                                  setNewWOClientSearch(matchingClient ? matchingClient.name : '');
                                  if (selectedContractForDetails.equipmentItems && selectedContractForDetails.equipmentItems.length > 0) {
                                    setNewWOEquipment(selectedContractForDetails.equipmentItems[0].name);
                                  } else {
                                    setNewWOEquipment('');
                                  }
                                  setNewWOType(isQc ? 'Especial' : 'Preventivo');
                                  setNewWONotes(`Visita programada bajo Contrato ${selectedContractForDetails.id}${isQc ? ' - Control de Calidad' : ''}`);
                                  
                                  // Close contract details view and open work order creation
                                  setIsContractDetailsModalOpen(false);
                                  setIsCreatingWO(true);
                                }}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-2.5 py-1 rounded-md text-[9px] transition-colors cursor-pointer"
                              >
                                Agendar
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-5 text-center text-slate-400 italic text-[10px]">
                      Este contrato no posee visitas de mantenimiento agendadas.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 font-sans">
              <button
                type="button"
                onClick={() => {
                  setIsContractDetailsModalOpen(false);
                  setSelectedContractForDetails(null);
                }}
                className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors text-slate-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal / Vista de Cronograma Oficial en PDF / Word (ORIMEC) */}
      {isContractSchedulePdfOpen && selectedContractForSchedulePdf && (() => {
        const con = selectedContractForSchedulePdf;
        const clientObj = clients.find(c => c.id === con.clientId);
        const clientName = clientObj?.name || con.clientId;
        
        // Equipments list to show in Table 1
        const displayedEquipments = selectedEquipmentForSchedulePdf 
          ? [selectedEquipmentForSchedulePdf] 
          : (con.equipmentItems && con.equipmentItems.length > 0 ? con.equipmentItems : [{ name: 'Equipo de Contrato', brand: 'GENERAL ELECTRIC', modality: 'S/N' }]);

        const eqTitleName = selectedEquipmentForSchedulePdf?.name || (con.equipmentItems && con.equipmentItems.length === 1 ? con.equipmentItems[0].name : 'EQUIPOS');
        const eqModalityName = selectedEquipmentForSchedulePdf?.modality || (con.equipmentItems && con.equipmentItems.length === 1 ? con.equipmentItems[0].modality : '');

        // Dates for Table 2
        let rawDates = con.maintenanceDates || [];
        if (selectedEquipmentForSchedulePdf && rawDates.length > 0) {
          const filterByEq = rawDates.filter(d => d.includes(`|${selectedEquipmentForSchedulePdf.name}`));
          if (filterByEq.length > 0) {
            rawDates = filterByEq;
          }
        }

        const handlePrintContractSchedule = () => {
          const sourceEl = document.getElementById('contract-schedule-printable-area-card');
          if (!sourceEl) return;

          const clone = sourceEl.cloneNode(true) as HTMLElement;
          clone.id = 'print-schedule-clone';
          clone.style.cssText = 'display:block;width:100%;position:static;margin:0 auto;padding:20px;background:white;color:black;';

          const printWrap = document.createElement('div');
          printWrap.id = 'print-schedule-isolation-wrap';
          printWrap.appendChild(clone);
          document.body.appendChild(printWrap);
          document.body.classList.add('is-printing-schedule');

          const style = document.createElement('style');
          style.id = 'print-schedule-style';
          style.innerHTML = `
            @media print {
              @page {
                size: A4 portrait !important;
                margin: 8mm 10mm !important;
              }
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              body.is-printing-schedule > *:not(#print-schedule-isolation-wrap) {
                display: none !important;
              }
              body.is-printing-schedule #print-schedule-isolation-wrap {
                display: block !important;
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                background: white !important;
              }
              table {
                page-break-inside: avoid !important;
              }
            }
          `;
          document.head.appendChild(style);

          const cleanup = () => {
            document.getElementById('print-schedule-style')?.remove();
            document.getElementById('print-schedule-isolation-wrap')?.remove();
            document.body.classList.remove('is-printing-schedule');
            window.removeEventListener('afterprint', cleanup);
          };

          window.addEventListener('afterprint', cleanup);
          window.print();
          setTimeout(cleanup, 2500);
        };

        const handleDownloadWordContractSchedule = () => {
          const sourceEl = document.getElementById('contract-schedule-printable-area-card');
          if (!sourceEl) return;

          const htmlContent = `
            <html xmlns:o='urn:schemas-microsoft-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
              <meta charset='utf-8'>
              <title>Cronograma de Mantenimiento ORIMEC</title>
              <style>
                body { font-family: Arial, sans-serif; font-size: 10.5pt; color: #000000; line-height: 1.4; }
                h1 { font-size: 18pt; font-weight: bold; color: #0f172a; margin: 0; }
                h2 { font-size: 11pt; font-weight: bold; color: #0f172a; text-transform: uppercase; margin-top: 10pt; }
                h3 { font-size: 10pt; font-weight: bold; color: #0f172a; text-transform: uppercase; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 15pt; }
                th { background-color: #f1f5f9; color: #000000; font-weight: bold; border: 1.5pt solid #000000; padding: 6pt; text-align: center; text-transform: uppercase; font-size: 9.5pt; }
                td { border: 1pt solid #000000; padding: 6pt; text-align: center; font-size: 9.5pt; }
                .text-left { text-align: left; }
                .font-bold { font-weight: bold; }
                ul { margin-top: 5pt; margin-bottom: 15pt; }
                li { margin-bottom: 3pt; }
                .signature-box { border: 1.5pt solid #1e1b4b; background-color: #f5f3ff; padding: 8pt; width: 180pt; margin-top: 10pt; }
              </style>
            </head>
            <body>
              ${sourceEl.innerHTML}
            </body>
            </html>
          `;

          const blob = new Blob(['\ufeff', htmlContent], {
            type: 'application/msword;charset=utf-8'
          });

          const cleanClientName = (clientName || 'Cliente').replace(/[^a-zA-Z0-9_-]/g, '_');
          const fileName = `Cronograma_Mantenimiento_${cleanClientName}_${con.id}.doc`;

          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };

        const periodicityVal = con.maintenanceFrequency || 'CUATRIMESTRAL';
        const periodicityMonths = periodicityVal.toLowerCase().includes('mensual') ? '1' 
          : periodicityVal.toLowerCase().includes('bimestral') ? '2'
          : periodicityVal.toLowerCase().includes('trimestral') ? '3'
          : periodicityVal.toLowerCase().includes('cuatrimestral') ? '4'
          : periodicityVal.toLowerCase().includes('semestral') ? '6'
          : periodicityVal.toLowerCase().includes('anual') ? '12' : '4';

        return (
          <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 overflow-y-auto no-print" id="contract-schedule-pdf-modal">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[92vh]">
              {/* Modal Header Bar */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl font-sans shrink-0">
                <div className="flex items-center gap-2">
                  <Printer className="w-5 h-5 text-indigo-600" />
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                    Cronograma Oficial de Mantenimientos Preventivos
                  </h4>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {con.equipmentItems && con.equipmentItems.length > 1 && (
                    <select
                      value={selectedEquipmentForSchedulePdf?.name || 'all'}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'all') {
                          setSelectedEquipmentForSchedulePdf(null);
                        } else {
                          const found = con.equipmentItems?.find(i => i.name === val);
                          setSelectedEquipmentForSchedulePdf(found || null);
                        }
                      }}
                      className="text-xs border border-slate-300 rounded-lg px-2.5 py-1 font-bold text-indigo-950 bg-white"
                    >
                      <option value="all">📋 Todos los Equipos ({con.equipmentItems.length})</option>
                      {con.equipmentItems.map((eq, i) => (
                        <option key={i} value={eq.name}>🖥️ {eq.name} ({eq.brand})</option>
                      ))}
                    </select>
                  )}
                  <button
                    type="button"
                    onClick={handlePrintContractSchedule}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-2 px-3.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md active:scale-95"
                  >
                    <Printer className="w-4 h-4" />
                    Descargar PDF
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadWordContractSchedule}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2 px-3.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md active:scale-95"
                  >
                    <FileText className="w-4 h-4" />
                    Descargar Word (.doc)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsContractSchedulePdfOpen(false);
                      setSelectedContractForSchedulePdf(null);
                      setSelectedEquipmentForSchedulePdf(null);
                    }}
                    className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Printable / Exportable Document Area */}
              <div className="p-6 md:p-10 overflow-y-auto flex-1 bg-slate-100/70">
                <div className="bg-white p-8 md:p-12 rounded-xl border border-slate-200 shadow-md font-sans text-slate-900 max-w-[780px] mx-auto text-xs leading-relaxed" id="contract-schedule-printable-area-card">
                  
                  {/* Header Logo & Title */}
                  <div className="flex flex-col items-center justify-center border-b-2 border-slate-900 pb-5 mb-6 text-center">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-xl flex items-center justify-center tracking-tighter shadow-sm">
                        ORI
                      </div>
                      <div className="text-left">
                        <h1 className="font-black text-2xl tracking-tighter text-slate-950 leading-none">ORIMEC</h1>
                        <p className="text-[10px] text-slate-600 font-extrabold uppercase tracking-widest mt-0.5">Oriental Medical del Ecuador C.A.</p>
                      </div>
                    </div>
                    <h2 className="font-black text-sm uppercase tracking-widest text-slate-900 mt-3 pt-3 border-t border-slate-300 w-full">
                      CRONOGRAMA DE MANTENIMIENTOS PREVENTIVOS
                    </h2>
                  </div>

                  {/* Client Info */}
                  <div className="mb-6 font-bold text-xs flex items-center gap-2">
                    <span className="text-slate-600">Cliente:</span>
                    <span className="uppercase text-slate-950 font-black text-sm">{clientName}</span>
                  </div>

                  {/* Tabla 1: Información del Equipo */}
                  <div className="mb-6 overflow-x-auto">
                    <table className="w-full border-collapse border-2 border-slate-900 text-center text-xs">
                      <thead>
                        <tr className="bg-slate-100 font-black uppercase text-slate-900 border-b-2 border-slate-900">
                          <th className="border border-slate-900 p-2.5">EQUIPO</th>
                          <th className="border border-slate-900 p-2.5">MARCA</th>
                          <th className="border border-slate-900 p-2.5">MODELO</th>
                          <th className="border border-slate-900 p-2.5">PERIODICIDAD</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedEquipments.map((eq, idx) => (
                          <tr key={idx} className="font-extrabold uppercase border-b border-slate-900">
                            <td className="border border-slate-900 p-2.5 text-slate-950">{eq.name}</td>
                            <td className="border border-slate-900 p-2.5">{eq.brand || 'GENERAL ELECTRIC'}</td>
                            <td className="border border-slate-900 p-2.5">{eq.modality || eq.serial || 'S/N'}</td>
                            <td className="border border-slate-900 p-2.5">{periodicityVal.toUpperCase()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Subtítulo Tabla 2 */}
                  <div className="text-center my-6">
                    <h3 className="font-black text-xs uppercase tracking-widest border-b border-slate-300 pb-1 inline-block">
                      CRONOGRAMA {eqModalityName ? eqModalityName.toUpperCase() : eqTitleName.toUpperCase()}
                    </h3>
                  </div>

                  {/* Tabla 2: Fechas Propuestas */}
                  <div className="mb-8 overflow-x-auto">
                    <table className="w-full border-collapse border-2 border-slate-900 text-center text-xs">
                      <thead>
                        <tr className="bg-slate-100 font-black uppercase text-slate-900 border-b-2 border-slate-900">
                          <th className="border border-slate-900 p-2.5">FECHA</th>
                          <th className="border border-slate-900 p-2.5">TIEMPO REQUERIDO</th>
                          <th className="border border-slate-900 p-2.5">TIPO</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rawDates.length > 0 ? (
                          rawDates.map((dStr, idx) => {
                            const cleanDate = dStr.split('|')[0].trim();
                            const formattedDate = formatCronogramaDateMonthYear(cleanDate);
                            return (
                              <tr key={idx} className="font-extrabold border-b border-slate-900">
                                <td className="border border-slate-900 p-2.5 capitalize">{formattedDate}</td>
                                <td className="border border-slate-900 p-2.5">4 horas</td>
                                <td className="border border-slate-900 p-2.5 font-black text-slate-950">Preventivo</td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr className="font-bold">
                            <td colSpan={3} className="border border-slate-900 p-4 italic text-slate-500">
                              No hay fechas de mantenimiento programadas en este contrato.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Text & Clauses */}
                  <div className="space-y-3 text-[11px] leading-relaxed mb-12 text-slate-850">
                    <p className="font-bold italic">
                      Los horarios serán determinados de manera flexible, sujetos a la disponibilidad y coordinación entre ambas partes.
                    </p>
                    <ul className="list-disc pl-5 space-y-1 font-semibold text-slate-900">
                      <li>Plazo de ejecución: 12 meses a partir de la instalación de los equipos o vigencia del contrato.</li>
                      <li>Fecha de inicio de garantía / contrato: <strong>{con.startDate}</strong>.</li>
                      <li>Mantenimientos preventivos: cada <strong>{periodicityMonths}</strong> meses.</li>
                      <li>Mantenimientos correctivos ilimitados bajo demanda.</li>
                    </ul>
                  </div>

                  {/* Official Footer Signature Block */}
                  <div className="pt-6 border-t border-slate-300 flex justify-between items-end">
                    <div className="space-y-2">
                      <p className="font-extrabold text-xs text-slate-900">Atentamente,</p>

                      <div className="flex items-center gap-4 pt-4">
                        {/* Stamp Graphic */}
                        <div className="border-2 border-indigo-900/50 rounded-xl p-2.5 bg-indigo-50/30 text-indigo-950 font-mono text-[9.5px] leading-snug shadow-2xs">
                          <p className="font-black text-xs">ORIMEC C.A.</p>
                          <p className="text-[8.5px] font-bold">RUC: 1791271750001</p>
                          <p className="font-black text-[9px] mt-1 border-t border-indigo-200 pt-0.5 uppercase">Ing. Soraya Carrasco R.</p>
                          <p className="text-[8px] font-bold uppercase">GERENCIA TÉCNICA</p>
                        </div>

                        <div className="text-left font-sans">
                          <p className="font-black text-slate-950 text-sm">Ing. Soraya Carrasco R.</p>
                          <p className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">GERENTE TÉCNICA</p>
                          <p className="font-black text-slate-600 text-xs">ORIMEC C.A.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        );
      })()}
      {/* Modal Detalle de Capacitación Programada en Agenda */}
      {infoScheduledTraining && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 overflow-y-auto max-h-[90vh] z-50 border border-slate-150 font-sans space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎓</span>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                    {infoScheduledTraining.title}
                  </h3>
                  {infoScheduledTraining.courseCode && (
                    <span className="inline-block bg-purple-100 text-purple-700 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded mt-0.5 border border-purple-200">
                      {infoScheduledTraining.courseCode}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setInfoScheduledTraining(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Ingeniero Asignado */}
              {(() => {
                const eng = engineers.find(e => e.id === infoScheduledTraining.engineerId);
                return (
                  <div className="bg-purple-50/60 border border-purple-100 p-3 rounded-xl flex items-center gap-3">
                    <span className="text-2xl">{eng ? getEngineerEmoji(eng.id) : '👤'}</span>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Ingeniero en Capacitación</span>
                      <p className="font-extrabold text-slate-900 text-xs">{eng?.name || 'Técnico'}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">{eng?.specialty} • {eng?.sede || 'Quito'}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Detalle de Fechas, Lugar y Precio */}
              <div className="grid grid-cols-2 gap-2.5 text-2xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 space-y-0.5">
                  <span className="block font-bold text-slate-400 uppercase text-[8px]">Fechas & Duración</span>
                  <p className="font-mono font-bold text-slate-800 text-[10.5px]">
                    {infoScheduledTraining.startDate} → {infoScheduledTraining.endDate}
                  </p>
                  <p className="text-[9px] font-semibold text-purple-700">
                    {Math.max(1, Math.round((new Date(infoScheduledTraining.endDate + 'T00:00:00').getTime() - new Date(infoScheduledTraining.startDate + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24)) + 1)} días
                  </p>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 space-y-0.5">
                  <span className="block font-bold text-slate-400 uppercase text-[8px]">Lugar & Inversión</span>
                  <p className="font-bold text-slate-800 text-[10.5px] truncate">
                    📍 {infoScheduledTraining.location}
                  </p>
                  <p className="text-[9.5px] font-mono font-extrabold text-emerald-700">
                    {infoScheduledTraining.cost ? `$ ${infoScheduledTraining.cost.toLocaleString('en-US')}` : 'Sin costo registrado'}
                  </p>
                </div>
              </div>

              {/* Estado */}
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                <span className="font-bold text-slate-500 text-[10px] uppercase">Estado de la Capacitación</span>
                <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border ${
                  infoScheduledTraining.status === 'Completado' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  infoScheduledTraining.status === 'En Curso' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  infoScheduledTraining.status === 'Cancelado' ? 'bg-red-50 text-red-700 border-red-200' :
                  'bg-purple-50 text-purple-700 border-purple-200'
                }`}>
                  {infoScheduledTraining.status}
                </span>
              </div>

              {infoScheduledTraining.notes && (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                  <span className="block font-bold text-slate-400 uppercase text-[8px] mb-0.5">Observaciones</span>
                  <p className="text-3xs text-slate-600 italic font-medium">"{infoScheduledTraining.notes}"</p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              {onDeleteScheduledTraining && (
                <button
                  type="button"
                  onClick={async () => {
                    if (window.confirm(`¿Eliminar la capacitación "${infoScheduledTraining.title}"?`)) {
                      await onDeleteScheduledTraining(infoScheduledTraining.id);
                      setInfoScheduledTraining(null);
                    }
                  }}
                  className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setInfoScheduledTraining(null)}
                className="ml-auto bg-slate-800 hover:bg-slate-900 text-white text-xs font-extrabold px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Contratos con GE (Garantía Extendida & Facturación) */}
      {isContractGeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg p-5 space-y-4 animate-in zoom-in-95 duration-150 relative font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                <span>{editingContractGe ? 'Editar Factura GE' : 'Nueva Factura GE'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsContractGeModalOpen(false);
                  setEditingContractGe(null);
                }}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-650 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Switcher de Modo: Cliente Existente vs Nuevo Cliente GE */}
            {!editingContractGe && (
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setGeFormMode('existing');
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    geFormMode === 'existing'
                      ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>👥 Cliente Existente</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGeFormMode('new');
                    setGeFormCliente('');
                    setGeFormSid('');
                    setGeFormModalidad('');
                    setGeFormEquipo('');
                    setGeFormEquipmentNum('');
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    geFormMode === 'new'
                      ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>✨ Nuevo Cliente GE</span>
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!geFormCliente) {
                  alert('Por favor seleccione o ingrese el nombre del cliente.');
                  return;
                }
                if (!geFormInvoice) {
                  alert('Por favor ingrese el número de invoice/factura.');
                  return;
                }

                const parsedAmount = parseFloat(geFormAmount.replace(/[\$\,\s]/g, '')) || 0;

                const geItem: ContractGE = {
                  id: editingContractGe ? editingContractGe.id : `GE-${geFormInvoice}-${Date.now()}`,
                  cliente: geFormCliente,
                  sid: geFormSid,
                  modalidad: geFormModalidad,
                  equipo: geFormEquipo,
                  equipmentNum: geFormEquipmentNum,
                  invoice: geFormInvoice,
                  invoiceAmount: parsedAmount,
                  months: geFormMonths,
                  invoiceDate: geFormInvoiceDate,
                  dueDate: geFormDueDate,
                  paymentPeriod: geFormPaymentPeriod,
                  monthNum: geFormMonthNum || '1',
                  contractNum: geFormContractNum || '1',
                  observaciones: geFormObs,
                  createdAt: editingContractGe?.createdAt || new Date().toISOString()
                };

                if (editingContractGe && onUpdateContractGE) {
                  onUpdateContractGE(geItem);
                } else if (onAddContractGE) {
                  onAddContractGE(geItem);
                }

                setIsContractGeModalOpen(false);
                setEditingContractGe(null);
              }}
              className="space-y-3 text-xs"
            >
              {/* Cliente Selector depending on geFormMode */}
              {geFormMode === 'existing' && !editingContractGe ? (
                <div className="space-y-1 relative">
                  <label className="block font-bold text-slate-700">SELECCIONAR CLIENTE EXISTENTE *</label>
                  {geFormCliente ? (
                    <div className="bg-indigo-50 border border-indigo-200 p-2.5 rounded-xl flex justify-between items-center">
                      <div>
                        <span className="block text-[9px] font-bold text-indigo-500 uppercase">Cliente Seleccionado</span>
                        <span className="font-extrabold text-indigo-900 text-sm">{geFormCliente}</span>
                        {geFormEquipo && <span className="text-[10px] text-slate-500 font-semibold block">{geFormEquipo} ({geFormModalidad || 'GE'})</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setGeFormCliente('');
                          setGeFormSid('');
                          setGeFormModalidad('');
                          setGeFormEquipo('');
                          setGeFormEquipmentNum('');
                          setGeClientSearchQuery('');
                          setIsGeClientDropdownOpen(true);
                        }}
                        className="text-xs font-bold text-indigo-700 hover:underline cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-indigo-200"
                      >
                        Cambiar Cliente
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Buscar cliente guardado (ej. Hospital Metropolitano, Dr. Figueroa...)"
                        value={geClientSearchQuery}
                        onFocus={() => setIsGeClientDropdownOpen(true)}
                        onChange={(e) => {
                          setGeClientSearchQuery(e.target.value);
                          setIsGeClientDropdownOpen(true);
                        }}
                        className="w-full p-2.5 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                      {isGeClientDropdownOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto divide-y divide-slate-100">
                          {(() => {
                            const existingMap = new Map<string, { name: string; sid?: string; modalidad?: string; equipo?: string; equipmentNum?: string | number }>();
                            clients.forEach(c => {
                              if (c.name && !existingMap.has(c.name.trim().toLowerCase())) {
                                existingMap.set(c.name.trim().toLowerCase(), { name: c.name.trim() });
                              }
                            });
                            contractsGE.forEach(c => {
                              if (c.cliente && !existingMap.has(c.cliente.trim().toLowerCase())) {
                                existingMap.set(c.cliente.trim().toLowerCase(), {
                                  name: c.cliente.trim(),
                                  sid: c.sid,
                                  modalidad: c.modalidad,
                                  equipo: c.equipo,
                                  equipmentNum: c.equipmentNum
                                });
                              }
                            });
                            const clientList = Array.from(existingMap.values()).filter(c =>
                              c.name.toLowerCase().includes(geClientSearchQuery.toLowerCase().trim())
                            );

                            if (clientList.length === 0) {
                              return (
                                <div className="p-3 text-center text-slate-400 text-3xs italic">
                                  No se encontraron clientes coincidentes. Pruebe a cambiar a "✨ Nuevo Cliente GE".
                                </div>
                              );
                            }

                            return clientList.map((client, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setGeFormCliente(client.name);
                                  if (client.sid) setGeFormSid(client.sid);
                                  if (client.modalidad) setGeFormModalidad(client.modalidad);
                                  if (client.equipo) setGeFormEquipo(client.equipo);
                                  if (client.equipmentNum) setGeFormEquipmentNum(String(client.equipmentNum));
                                  const nextM = autoCalculateGeNextMonth(client.name);
                                  setGeFormMonthNum(nextM);
                                  setIsGeClientDropdownOpen(false);
                                }}
                                className="w-full text-left p-2.5 hover:bg-indigo-50 transition-colors flex justify-between items-center cursor-pointer"
                              >
                                <div>
                                  <span className="font-extrabold text-slate-800 text-xs block">{client.name}</span>
                                  {client.equipo && <span className="text-[10px] text-slate-500 font-semibold">{client.equipo} {client.modalidad ? `• ${client.modalidad}` : ''}</span>}
                                </div>
                                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">Seleccionar</span>
                              </button>
                            ));
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">NOMBRE DEL NUEVO CLIENTE *</label>
                  <input
                    type="text"
                    required
                    placeholder="ej: Nuevo Centro Médico San Francisco"
                    value={geFormCliente}
                    onChange={e => setGeFormCliente(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg font-semibold"
                  />
                </div>
              )}

              {/* SID, MODALIDAD y EQUIPO solo visibles al registrar Nuevo Cliente GE o al Editar */}
              {(geFormMode === 'new' || editingContractGe) && (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">SID (SYSTEM ID)</label>
                      <input
                        type="text"
                        placeholder="ej: CE6XG22000"
                        value={geFormSid}
                        onChange={e => setGeFormSid(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">MODALIDAD</label>
                      <input
                        type="text"
                        placeholder="ej: CT, MR, SURGERY"
                        value={geFormModalidad}
                        onChange={e => setGeFormModalidad(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700">EQUIPMENT #</label>
                      <input
                        type="text"
                        placeholder="ej: 1"
                        value={geFormEquipmentNum}
                        onChange={e => setGeFormEquipmentNum(e.target.value)}
                        className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">EQUIPO (MODELO)</label>
                    <input
                      type="text"
                      placeholder="ej: REVOLUTION ACT, 1.5T SIGNA CREATOR"
                      value={geFormEquipo}
                      onChange={e => setGeFormEquipo(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg font-semibold"
                    />
                  </div>
                </>
              )}

              {/* Sección de Selección Rápida de Montos Históricos para Cliente Existente */}
              {geFormMode === 'existing' && geFormCliente && (
                (() => {
                  const amountsMap = new Map<number, { count: number; maxMonth: number }>();
                  contractsGE.forEach(c => {
                    if (c.cliente && c.cliente.trim().toLowerCase() === geFormCliente.trim().toLowerCase()) {
                      const amt = c.invoiceAmount || 0;
                      if (amt > 0) {
                        const existing = amountsMap.get(amt) || { count: 0, maxMonth: 0 };
                        const m = parseInt(String(c.monthNum || 0), 10) || 0;
                        amountsMap.set(amt, {
                          count: existing.count + 1,
                          maxMonth: Math.max(existing.maxMonth, m)
                        });
                      }
                    }
                  });

                  const prevAmounts = Array.from(amountsMap.entries()).map(([amount, info]) => ({ amount, ...info }));

                  if (prevAmounts.length === 0) return null;

                  return (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                          💵 Historial de Montos ($) para {geFormCliente}:
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold">Clic para seleccionar</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {prevAmounts.map((item, idx) => {
                          const isSelected = parseFloat(geFormAmount.replace(/[\$\,\s]/g, '')) === item.amount;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setGeFormAmount(String(item.amount));
                                const nextM = autoCalculateGeNextMonth(geFormCliente);
                                setGeFormMonthNum(nextM);
                              }}
                              className={`text-2xs font-mono font-black px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                                isSelected
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                  : 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-200 hover:border-emerald-300'
                              }`}
                            >
                              <span>${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                              <span className={`text-[9px] font-sans font-bold px-1 rounded ${isSelected ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                                {item.count} factura{item.count > 1 ? 's' : ''} • Úl. #Mes: {item.maxMonth}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">INVOICE (FACTURA) *</label>
                  <input
                    type="text"
                    required
                    placeholder="ej: 100601349"
                    value={geFormInvoice}
                    onChange={e => setGeFormInvoice(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">INVOICE AMOUNT ($)</label>
                  <input
                    type="text"
                    placeholder="ej: 3557.25"
                    value={geFormAmount}
                    onChange={e => setGeFormAmount(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">FECHA FACTURA (INVOICE DATE)</label>
                  <input
                    type="date"
                    value={geFormInvoiceDate}
                    onChange={e => setGeFormInvoiceDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono font-semibold text-slate-800 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">FECHA VENCIMIENTO (DUE DATE)</label>
                  <input
                    type="date"
                    value={geFormDueDate}
                    onChange={e => setGeFormDueDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono font-semibold text-slate-800 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">FECHA/AÑO PAGO</label>
                  <input
                    type="text"
                    placeholder="ej: June-2022"
                    value={geFormPaymentPeriod}
                    onChange={e => setGeFormPaymentPeriod(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">#MES</label>
                  <input
                    type="text"
                    placeholder="ej: 1"
                    value={geFormMonthNum}
                    onChange={e => setGeFormMonthNum(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">CONTRATO</label>
                  <input
                    type="text"
                    placeholder="ej: 1"
                    value={geFormContractNum}
                    onChange={e => setGeFormContractNum(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">OBSERVACIONES / COMMENTS</label>
                <input
                  type="text"
                  placeholder="ej: RENOVACION o Sin fecha de pago"
                  value={geFormObs}
                  onChange={e => setGeFormObs(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg font-semibold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsContractGeModalOpen(false);
                    setEditingContractGe(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-xs"
                >
                  {editingContractGe ? 'Guardar Cambios' : 'Registrar Factura GE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIGURACIÓN GLOBAL DE PLANTILLAS DE PERMISOS */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-500/20 p-2.5 rounded-xl border border-indigo-400/30 text-indigo-400">
                  ⚙️
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base tracking-wide flex items-center gap-2">
                    <span>CONFIGURADOR GLOBAL DE PLANTILLAS DE PERMISOS</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Personaliza los permisos predeterminados para Ventas, Ingeniería y Admin, y aplícalos masivamente a todos los usuarios.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs Selector */}
            <div className="bg-slate-100 p-2.5 border-b border-slate-200 flex flex-wrap gap-2 justify-center sm:justify-start">
              {[
                { key: 'Ventas', label: '⚡ Plantilla Ventas' },
                { key: 'Ingeniería', label: '🛠️ Plantilla Ingeniería' },
                { key: 'Admin', label: '👑 Plantilla Admin Total' },
              ].map(tab => {
                const isActive = activeTemplateTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      const key = tab.key as 'Ventas' | 'Ingeniería' | 'Admin';
                      setActiveTemplateTab(key);
                      setTempTemplatePermissions(globalRoleTemplates[key]);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm scale-102'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Checkboxes Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              <div className="bg-indigo-50/70 border border-indigo-150 p-3 rounded-xl flex items-center justify-between text-xs text-indigo-900 font-medium">
                <span>Editando permisos predeterminados de la <strong>{activeTemplateTab === 'Ventas' ? 'Plantilla Ventas' : activeTemplateTab === 'Ingeniería' ? 'Plantilla Ingeniería' : 'Plantilla Admin Total'}</strong>:</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-extrabold px-2 py-0.5 rounded-full border border-indigo-200">
                  {engineers.filter(e => activeTemplateTab === 'Ventas' ? e.specialty === 'Ventas' : activeTemplateTab === 'Ingeniería' ? (e.specialty === 'Ingeniería' || e.specialty === 'Aplicaciones' || e.specialty === 'IT') : true).length} Usuario(s) asociados
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* 📅 AGENDAMIENTO Y ÓRDENES */}
                <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-extrabold text-[10px] text-indigo-900 uppercase tracking-wider block border-b border-slate-200 pb-1">📅 Agendamiento y Órdenes</span>
                  {[
                    { key: 'canViewWorkOrders', label: 'Ver mapa y calendario de agenda' },
                    { key: 'canCreateWorkOrders', label: 'Crear / agendar órdenes' },
                    { key: 'canEditWorkOrders', label: 'Editar / reprogramar órdenes' },
                    { key: 'canDeleteWorkOrders', label: 'Eliminar órdenes de trabajo' },
                    { key: 'canChangeWorkOrderStatus', label: 'Marcar estado (Realizado/Pendiente)' },
                  ].map(perm => (
                    <label key={perm.key} className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer hover:text-indigo-600 transition-colors">
                      <input
                        type="checkbox"
                        checked={!!(tempTemplatePermissions as any)[perm.key]}
                        onChange={e => setTempTemplatePermissions(prev => ({ ...prev, [perm.key]: e.target.checked }))}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                      />
                      <span>{perm.label}</span>
                    </label>
                  ))}
                </div>

                {/* 📜 CONTRATOS DE MANTENIMIENTO */}
                <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-extrabold text-[10px] text-amber-900 uppercase tracking-wider block border-b border-slate-200 pb-1">📜 Contratos de Mantenimiento</span>
                  {[
                    { key: 'canViewContracts', label: 'Ver contratos y cronogramas' },
                    { key: 'canCreateContracts', label: 'Crear nuevos contratos' },
                    { key: 'canEditContracts', label: 'Editar contratos y fechas' },
                    { key: 'canDeleteContracts', label: 'Eliminar contratos' },
                    { key: 'canViewContractValues', label: '💰 Ver Valores $ USD del Contrato', highlight: true },
                  ].map(perm => (
                    <label key={perm.key} className={`flex items-center gap-2 text-xs font-bold cursor-pointer transition-colors ${perm.highlight ? 'text-emerald-700 font-extrabold' : 'text-slate-700 hover:text-indigo-600'}`}>
                      <input
                        type="checkbox"
                        checked={!!(tempTemplatePermissions as any)[perm.key]}
                        onChange={e => setTempTemplatePermissions(prev => ({ ...prev, [perm.key]: e.target.checked }))}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                      />
                      <span>{perm.label}</span>
                    </label>
                  ))}
                </div>

                {/* 📑 INFORMES TÉCNICOS */}
                <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-extrabold text-[10px] text-sky-900 uppercase tracking-wider block border-b border-slate-200 pb-1">📑 Informes Técnicos</span>
                  {[
                    { key: 'canViewReports', label: 'Ver informes técnicos' },
                    { key: 'canCreateReports', label: 'Crear nuevos informes (RE-TE-04)' },
                    { key: 'canApproveReports', label: 'Aprobar / Validar informes' },
                    { key: 'canExportReportsPdf', label: 'Descargar e imprimir PDF' },
                  ].map(perm => (
                    <label key={perm.key} className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer hover:text-indigo-600 transition-colors">
                      <input
                        type="checkbox"
                        checked={!!(tempTemplatePermissions as any)[perm.key]}
                        onChange={e => setTempTemplatePermissions(prev => ({ ...prev, [perm.key]: e.target.checked }))}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                      />
                      <span>{perm.label}</span>
                    </label>
                  ))}
                </div>

                {/* 🏢 CLIENTES Y EQUIPOS */}
                <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-extrabold text-[10px] text-emerald-900 uppercase tracking-wider block border-b border-slate-200 pb-1">🏢 Clientes y Equipos</span>
                  {[
                    { key: 'canViewClients', label: 'Ver directorio de clientes' },
                    { key: 'canEditClients', label: 'Crear / Editar clientes' },
                    { key: 'canViewEquipments', label: 'Ver inventario de equipos' },
                    { key: 'canEditEquipments', label: 'Crear / Editar equipos' },
                  ].map(perm => (
                    <label key={perm.key} className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer hover:text-indigo-600 transition-colors">
                      <input
                        type="checkbox"
                        checked={!!(tempTemplatePermissions as any)[perm.key]}
                        onChange={e => setTempTemplatePermissions(prev => ({ ...prev, [perm.key]: e.target.checked }))}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                      />
                      <span>{perm.label}</span>
                    </label>
                  ))}
                </div>

                {/* 📂 REGISTRO MTO */}
                <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-extrabold text-[10px] text-pink-900 uppercase tracking-wider block border-b border-slate-200 pb-1">📂 Registro de Mantenimiento</span>
                  {[
                    { key: 'canViewRegistry', label: 'Ver Registro de Equipos (Hoja Vida)' },
                    { key: 'canEditRegistry', label: 'Crear / Importar CSV de Registro' },
                  ].map(perm => (
                    <label key={perm.key} className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer hover:text-indigo-600 transition-colors">
                      <input
                        type="checkbox"
                        checked={!!(tempTemplatePermissions as any)[perm.key]}
                        onChange={e => setTempTemplatePermissions(prev => ({ ...prev, [perm.key]: e.target.checked }))}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                      />
                      <span>{perm.label}</span>
                    </label>
                  ))}
                </div>

                {/* ⚙️ ADMINISTRACIÓN Y REPORTES */}
                <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-extrabold text-[10px] text-purple-900 uppercase tracking-wider block border-b border-slate-200 pb-1">⚙️ Administración del Sistema</span>
                  {[
                    { key: 'canManageUsers', label: 'Gestionar usuarios y otorgar permisos' },
                    { key: 'canViewAuditLogs', label: 'Ver registros de auditoría y cambios' },
                    { key: 'canExportData', label: 'Exportar reportes a Excel / CSV' },
                  ].map(perm => (
                    <label key={perm.key} className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer hover:text-indigo-600 transition-colors">
                      <input
                        type="checkbox"
                        checked={!!(tempTemplatePermissions as any)[perm.key]}
                        onChange={e => setTempTemplatePermissions(prev => ({ ...prev, [perm.key]: e.target.checked }))}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                      />
                      <span>{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="bg-slate-100 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const updated = {
                      ...globalRoleTemplates,
                      [activeTemplateTab]: tempTemplatePermissions
                    };
                    setGlobalRoleTemplates(updated);
                    try {
                      localStorage.setItem('orimec_global_role_templates', JSON.stringify(updated));
                    } catch (e) {
                      console.error("Error saving templates", e);
                    }
                    alert(`✅ Plantilla '${activeTemplateTab}' guardada exitosamente para futuros usuarios.`);
                  }}
                  className="px-4 py-2 text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  💾 Solo Guardar Plantilla
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    const updated = {
                      ...globalRoleTemplates,
                      [activeTemplateTab]: tempTemplatePermissions
                    };
                    setGlobalRoleTemplates(updated);
                    try {
                      localStorage.setItem('orimec_global_role_templates', JSON.stringify(updated));
                    } catch (e) {
                      console.error("Error saving templates", e);
                    }

                    const matchingEngineers = engineers.filter(eng => {
                      if (activeTemplateTab === 'Ventas') return eng.specialty === 'Ventas';
                      if (activeTemplateTab === 'Ingeniería') return eng.specialty === 'Ingeniería' || eng.specialty === 'Aplicaciones' || eng.specialty === 'IT';
                      return true;
                    });

                    let updatedCount = 0;
                    if (onUpdateEngineer) {
                      matchingEngineers.forEach(eng => {
                        onUpdateEngineer({
                          ...eng,
                          customPermissions: tempTemplatePermissions
                        });
                        updatedCount++;
                      });
                    }
                    alert(`🎉 Plantilla '${activeTemplateTab}' guardada y aplicada masivamente a ${updatedCount} usuario(s) existentes.`);
                    setIsTemplateModalOpen(false);
                  }}
                  className="px-4 py-2 text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <span>🔄 Guardar y Aplicar a Todos ({engineers.filter(e => activeTemplateTab === 'Ventas' ? e.specialty === 'Ventas' : activeTemplateTab === 'Ingeniería' ? (e.specialty === 'Ingeniería' || e.specialty === 'Aplicaciones' || e.specialty === 'IT') : true).length})</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

