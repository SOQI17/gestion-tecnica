export type Specialty = 'Ingeniería' | 'Aplicaciones' | 'Ventas' | 'IT';

export type MaintenanceType = 'Preventivo' | 'Correctivo' | 'Instalación' | 'Calibración' | 'Soporte' | 'FMI' | 'Capacitación' | 'Inspección';

export type WorkOrderStatus = 'Pendiente' | 'En Proceso' | 'Realizado' | 'Reportado' | 'Conciliado';

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
}

export interface Client {
  id: string;
  name: string;
  address: string;
  industry: string;
  contactName: string;
  contactPhone: string;
  installedEquipments: string[];
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
}

export interface Contract {
  id: string; // Contract Number
  clientId: string; // references Client.id
  type: 'Garantía extendida/Contrato' | 'Garantía de compra' | 'Facturable' | 'Otro';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: 'Activo' | 'Vencido' | 'Pendiente';
  coverage?: string;
  equipmentItems?: ContractEquipmentItem[]; // List of equipment covered
  maintenanceFrequency?: 'Mensual' | 'Bimestral' | 'Trimestral' | 'Cuatrimestral' | 'Semestral' | 'Anual' | 'Personalizado' | 'Ninguno';
  maintenanceDates?: string[]; // Scheduled dates for maintenance
  qcDate?: string; // Quality control date
  createdAt?: string;
  contractPdfUrl?: string; // Documento del Contrato (PDF o Imagen en Cloudinary)
  schedulePdfUrl?: string; // Cronograma Firmado (PDF o Imagen en Cloudinary)
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
  role: 'admin' | 'engineer';
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
