export type Specialty = 'Ingeniería' | 'Aplicaciones' | 'Ventas' | 'IT';

export type MaintenanceType = 'Preventivo' | 'Correctivo' | 'Instalación' | 'Calibración' | 'Soporte' | 'FMI' | 'Capacitación' | 'Inspección';

export type WorkOrderStatus = 'Pendiente' | 'En Proceso' | 'Realizado' | 'Reportado' | 'Conciliado';

export interface UserPermissions {
  // 📅 AGENDAMIENTO Y ÓRDEN DE TRABAJO
  canViewWorkOrders?: boolean;
  canCreateWorkOrders?: boolean;
  canEditWorkOrders?: boolean;
  canDeleteWorkOrders?: boolean;
  canChangeWorkOrderStatus?: boolean;

  // 📜 CONTRATOS DE MANTENIMIENTO
  canViewContracts?: boolean;
  canCreateContracts?: boolean;
  canEditContracts?: boolean;
  canDeleteContracts?: boolean;
  canViewContractValues?: boolean;

  // 📑 INFORMES TÉCNICOS (RE-TE-04 & AUDITORÍA)
  canViewReports?: boolean;
  canCreateReports?: boolean;
  canApproveReports?: boolean;
  canExportReportsPdf?: boolean;

  // 🏢 CLIENTES Y EQUIPOS
  canViewClients?: boolean;
  canEditClients?: boolean;
  canViewEquipments?: boolean;
  canEditEquipments?: boolean;

  // 📂 REGISTRO DE MANTENIMIENTO (HOJA DE VIDA DE EQUIPOS)
  canViewRegistry?: boolean;
  canEditRegistry?: boolean;

  // 🌴 VACACIONES Y PERMISOS DE PERSONAL
  canViewVacations?: boolean;
  canManageVacations?: boolean;

  // 📚 CAPACITACIONES Y ENTRENAMIENTOS
  canViewTrainings?: boolean;
  canManageTrainings?: boolean;

  // ⚙️ ADMINISTRACIÓN Y SISTEMA
  canManageUsers?: boolean;
  canViewAuditLogs?: boolean;
  canExportData?: boolean;
}

export interface RoleTemplates {
  Ingeniería: UserPermissions;
  Ventas: UserPermissions;
  Admin: UserPermissions;
}

export interface Engineer {
  id: string;
  name: string;
  specialty: Specialty;
  email: string;
  phone: string;
  avatar: string;
  availability: 'Disponible' | 'En Campo' | 'Inactivo';
  skills: string[];
  theme?: 'indigo' | 'emerald' | 'crimson' | 'dark';
  annualVacationDays?: number; // Total annual vacation days
  entryDate?: string; // YYYY-MM-DD
  pendingVacationsLastYear?: number;
  standbyVacationsLastYear?: number;
  birthdayVacationDay?: number; // 0 or 1, default 1
  sede?: 'Quito' | 'Guayaquil' | 'Cuenca' | 'Sede Central';
  customPermissions?: UserPermissions;
}

export interface Client {
  id: string;
  name: string;
  address: string;
  industry: string;
  contactName: string;
  contactPhone: string;
  installedEquipments: string[];
  city?: string;
  coordinates?: { lat: number; lng: number };
}

export interface WorkOrder {
  id: string;
  clientId: string;
  engineerId: string;
  supportEngineerId?: string;
  supportEngineerIds?: string[];
  plannedDate: string; // YYYY-MM-DD
  plannedTime?: string; // entry hour/time e.g., "14:00 AM" or "09:00 AM"
  type: MaintenanceType;
  status: WorkOrderStatus;
  equipmentName: string;
  notes: string;
  durationDays?: number; // duration in days
  isEquipmentDown?: boolean; // indicates if the equipment is down / stopped
  clientConfirmed?: boolean; // true when client has confirmed the scheduled visit
}

export interface MaterialUsed {
  item: string;
  qty: number;
}

export interface TechnicalReport {
  id: string;
  workOrderId: string;
  executionDate: string;
  hoursSpent: number;
  technicalFindings: string;
  actionsTaken: string;
  materialsUsed: MaterialUsed[];
  nextRecommendations: string;
  technicianSignature: string; // Base64 or drawing indicator
  clientSignatureName: string;
  clientSignatureData?: string; // Base64 signature
  validationState?: 'pendiente' | 'aprobado' | 'rechazado';
  validationNotes?: string;
  validatedAt?: string;

  // Campos adicionales para el formato oficial RE-TE-04 de ORIMEC
  numRegistro?: string;       // Número de Registro (ej: ORI-OTC-425)
  correoCliente?: string;     // Correo electrónico
  telefonoCliente?: string;   // Teléfono del cliente
  atencionArea?: 'Garantía extendida/Contrato' | 'Garantía de compra' | 'Facturable' | 'Otro';
  horaInicio?: string;        // Hora de inicio (ej: "08:00:00")
  horaFin?: string;           // Hora de fin (ej: "16:00:00")
  estadoInicio?: 'Operativo' | 'No Operativo';
  estadoFin?: 'Operativo' | 'No Operativo';
  
  // Datos del Equipo
  equipoMarca?: string;
  equipoModelo?: string;
  equipoSerie?: string;
  equipoSoftware?: string;
  
  // Secciones de Texto
  motivoVisita?: string;       // Motivo de la visita
  trabajoRealizado?: string;   // Trabajo realizado (extiende/reemplaza actionsTaken)
  observaciones?: string;      // Observaciones (extiende/reemplaza nextRecommendations)
  
  // Repuestos Requeridos
  repuestosRequeridos?: MaterialUsed[];
  
  // Registro Fotográfico (hasta 5 imágenes en Base64/DataURL)
  registroFotografico?: string[];
  
  // Firmas y Cédulas
  technicianCedula?: string;
  technicianSignatureData?: string; // Firma dibujada (Base64)
  supportTechnicianName?: string;
  supportTechnicianCedula?: string;
  supportTechnicianSignature?: string; // Firma de apoyo (Base64)
  clientCedula?: string;
}

export interface Equipment {
  id: string;
  name: string;
  clientId: string; // references Client.id
  brand: string;
  model: string;
  serialNumber: string;
  softwareVersion?: string;
  sucursal?: string;
  status: 'Operativo' | 'No Operativo';
  createdAt?: string;
}

export interface ContractEquipmentItem {
  name: string;
  brand: string;
  modality?: string;
  serial?: string; // Número de serie del equipo (opcional)
  gon?: string; // Código GON (opcional)
  serviceRecordPdfUrl?: string; // Documento Service Record (SR) específico del equipo
  caPdfUrl?: string; // Documento Certificate of Acceptance (CA) específico del equipo
  podPdfUrl?: string; // Documento Proof of Delivery (POD) específico del equipo
}

export interface Contract {
  id: string; // Contract Number
  clientId: string; // references Client.id
  type: 'Garantía extendida/Contrato' | 'Garantía de compra' | 'Facturable' | 'Otro';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: 'Activo' | 'Vencido' | 'Pendiente' | 'Inactivo';
  city?: string; // Ciudad del contrato (ej: Quito, Guayaquil, Cuenca)
  contractValue?: number; // Valor del contrato en USD (opcional)
  coverage?: string;
  equipmentItems?: ContractEquipmentItem[]; // List of equipment covered
  maintenanceFrequency?: 'Mensual' | 'Bimestral' | 'Trimestral' | 'Cuatrimestral' | 'Semestral' | 'Anual' | 'Personalizado' | 'Ninguno';
  maintenanceDates?: string[]; // Scheduled dates for maintenance
  qcDate?: string; // Quality control date (fallback / primer QC)
  qcDates?: string[]; // Quality control dates (per-equipment or multiple QC visits)
  createdAt?: string;
  contractPdfUrl?: string; // Documento del Contrato (PDF o Imagen en Cloudinary)
  schedulePdfUrl?: string; // Cronograma Firmado (PDF o Imagen en Cloudinary)
  isNewEquipment?: boolean; // Marca si el contrato aplica para Equipo Nuevo
  serviceRecordPdfUrl?: string; // Documento Service Record (SR)
  caPdfUrl?: string; // Documento Certificate of Acceptance (CA)
  podPdfUrl?: string; // Documento Proof of Delivery (POD)
  pendingAdminSchedule?: boolean; // Indica si fue cargado por vendedor sin cronograma, a la espera de asignación por Admin
  linkedContractId?: string; // ID del contrato sucesor (siguiente contrato del mismo cliente)
}

export interface Vacation {
  id: string;
  engineerId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  status: 'Solicitado' | 'Aprobado' | 'Rechazado';
  notes?: string;
  createdAt?: string;
  includeWeekends?: boolean;
}

export const ECUADOR_HOLIDAYS = [
  // 2025
  { id: 'FERIADO-EC-2025-01-01', startDate: '2025-01-01', endDate: '2025-01-01', notes: 'Feriado Nacional: Año Nuevo 🇪🇨' },
  { id: 'FERIADO-EC-2025-03-03', startDate: '2025-03-03', endDate: '2025-03-04', notes: 'Feriado Nacional: Carnaval 🇪🇨' },
  { id: 'FERIADO-EC-2025-04-18', startDate: '2025-04-18', endDate: '2025-04-18', notes: 'Feriado Nacional: Viernes Santo 🇪🇨' },
  { id: 'FERIADO-EC-2025-05-02', startDate: '2025-05-02', endDate: '2025-05-02', notes: 'Feriado Nacional: Día del Trabajo (Traslado) 🇪🇨' },
  { id: 'FERIADO-EC-2025-05-23', startDate: '2025-05-23', endDate: '2025-05-23', notes: 'Feriado Nacional: Batalla de Pichincha (Traslado) 🇪🇨' },
  { id: 'FERIADO-EC-2025-08-11', startDate: '2025-08-11', endDate: '2025-08-11', notes: 'Feriado Nacional: Primer Grito de Independencia (Traslado 10 de Agosto) 🇪🇨' },
  { id: 'FERIADO-EC-2025-10-10', startDate: '2025-10-10', endDate: '2025-10-10', notes: 'Feriado Nacional: Independencia de Guayaquil (Traslado) 🇪🇨' },
  { id: 'FERIADO-EC-2025-11-02', startDate: '2025-11-02', endDate: '2025-11-04', notes: 'Feriado Nacional: Día de los Difuntos e Independencia de Cuenca 🇪🇨' },
  { id: 'FERIADO-EC-2025-12-25', startDate: '2025-12-25', endDate: '2025-12-25', notes: 'Feriado Nacional: Navidad 🇪🇨' },

  // 2026
  { id: 'FERIADO-EC-2026-01-01', startDate: '2026-01-01', endDate: '2026-01-01', notes: 'Feriado Nacional: Año Nuevo 🇪🇨' },
  { id: 'FERIADO-EC-2026-02-16', startDate: '2026-02-16', endDate: '2026-02-17', notes: 'Feriado Nacional: Carnaval 🇪🇨' },
  { id: 'FERIADO-EC-2026-04-03', startDate: '2026-04-03', endDate: '2026-04-03', notes: 'Feriado Nacional: Viernes Santo 🇪🇨' },
  { id: 'FERIADO-EC-2026-05-01', startDate: '2026-05-01', endDate: '2026-05-01', notes: 'Feriado Nacional: Día del Trabajo 🇪🇨' },
  { id: 'FERIADO-EC-2026-05-25', startDate: '2026-05-25', endDate: '2026-05-25', notes: 'Feriado Nacional: Batalla de Pichincha (Traslado) 🇪🇨' },
  { id: 'FERIADO-EC-2026-08-10', startDate: '2026-08-10', endDate: '2026-08-10', notes: 'Feriado Nacional: Primer Grito de Independencia (10 de Agosto) 🇪🇨' },
  { id: 'FERIADO-EC-2026-10-09', startDate: '2026-10-09', endDate: '2026-10-09', notes: 'Feriado Nacional: Independencia de Guayaquil 🇪🇨' },
  { id: 'FERIADO-EC-2026-11-02', startDate: '2026-11-02', endDate: '2026-11-03', notes: 'Feriado Nacional: Día de los Difuntos e Independencia de Cuenca 🇪🇨' },
  { id: 'FERIADO-EC-2026-12-25', startDate: '2026-12-25', endDate: '2026-12-25', notes: 'Feriado Nacional: Navidad 🇪🇨' }
];

export interface EngineerPermission {
  id: string;
  engineerId: string;
  date: string; // YYYY-MM-DD
  hours: number;
  reason: string;
  type: 'Permiso' | 'Compensación';
  createdAt: string;
}

export interface AppUser {
  uid: string;
  email: string;
  name?: string;
  role: 'admin' | 'engineer' | 'sales';
  engineerId?: string; // Solo presente si el rol es 'engineer'
}

export interface Curso {
  id: string;       // e.g. "GE-01"
  codigo: string;   // e.g. "GE-01"
  titulo: string;   // e.g. "Fibra Óptica Avanzada"
  modalidad: string; // e.g. "GE", "FE", "MR", "CT"
  costo: number;    // costo en USD, ej. 150
}

export interface HistorialEntrenamiento {
  id: string; // auto or composite: id_ingeniero + "_" + codigo_curso
  id_ingeniero: string;
  codigo_curso: string;
  fecha_completado: string; // ej. "11/14/2011"
}

export interface MaintenanceRegistry {
  id: string;
  institutionName: string;
  eqBrand: string;
  eqModel: string;
  eqSerial: string;
  tuboBrand: string;
  tuboModel: string;
  tuboSerial: string;
  fecha: string;
  responsable: string;
  createdAt?: string;
  workOrderId?: string; // Referencia a la orden de trabajo que originó este registro
  documentUrl?: string; // Documento o Acta de entrega adjunta (PDF/Imagen en Cloudinary)
}

export interface ScheduledTraining {
  id: string;
  title: string;          // Título de la capacitación
  courseCode?: string;     // Código del curso (ej: GE-01)
  engineerId: string;      // ID del ingeniero asignado
  supportEngineerIds?: string[]; // Ingenieros acompañantes / apoyo
  startDate: string;       // YYYY-MM-DD
  endDate: string;         // YYYY-MM-DD
  location: string;        // Lugar donde se realizará (ej: Quito, Alemania, En línea)
  cost?: number;           // Precio / Costo en USD
  status: 'Programado' | 'En Curso' | 'Completado' | 'Cancelado';
  notes?: string;          // Observaciones o notas adicionales
  createdAt?: string;
  certificateUrl?: string; // Diploma / Certificado de capacitación (PDF/Imagen en Cloudinary)
}

export interface ContractGE {
  id: string;
  cliente: string;
  sid?: string;              // SID (System ID / Serial ID: ej. CE6XG22000)
  modalidad?: string;        // MODALIDAD (ej: CT, MR, SURGERY)
  equipo?: string;           // EQUIPO (ej: REVOLUTION ACT, 1.5T SIGNA CREATOR)
  equipmentNum?: number | string; // EQUIPMENT # / Cuota equipo
  invoice: string;           // INVOICE (Nº Factura)
  invoiceAmount: number;     // INVOICE AMOUNT (Monto en USD)
  months?: number | string;  // MONTHS (Duración en meses)
  invoiceDate: string;       // INVOICE DATE / CONTRACT DATE
  dueDate: string;           // DUE DATE
  paymentPeriod?: string;    // FECHA/AÑO PAGO (ej: June-2022)
  monthNum?: number | string; // #MES
  contractNum?: string;      // CONTRATO
  observaciones?: string;    // OBSERVACIONES / COMMENTS (ej: RENOVACION)
  createdAt?: string;
}
