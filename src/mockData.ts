import { Engineer, Client, WorkOrder, TechnicalReport } from './types';

export const masterEngineers: Engineer[] = [
  {
    id: 'ENG-001',
    name: 'Ing. Andrés Vega',
    specialty: 'Ingeniería',
    email: 'andres.vega@soporte.com',
    phone: '',
    avatar: '',
    availability: 'Disponible',
    skills: [],
    entryDate: '2021-02-15',
    pendingVacationsLastYear: 3,
    standbyVacationsLastYear: 1,
    annualVacationDays: 15
  },
  {
    id: 'ENG-002',
    name: 'Ing. David Changuán',
    specialty: 'Ingeniería',
    email: 'david.changuan@soporte.com',
    phone: '',
    avatar: '',
    availability: 'Disponible',
    skills: [],
    entryDate: '2022-06-01',
    pendingVacationsLastYear: 5,
    standbyVacationsLastYear: 0,
    annualVacationDays: 15
  },
  {
    id: 'ENG-003',
    name: 'Ing. Eduardo Hinojosa',
    specialty: 'Ingeniería',
    email: 'eduardo.hinojosa@soporte.com',
    phone: '',
    avatar: '',
    availability: 'Disponible',
    skills: [],
    entryDate: '2019-11-10',
    pendingVacationsLastYear: 0,
    standbyVacationsLastYear: 2,
    annualVacationDays: 15
  },
  {
    id: 'ENG-004',
    name: 'Ing. Francisco Sotomayor',
    specialty: 'Ingeniería',
    email: 'francisco.sotomayor@soporte.com',
    phone: '',
    avatar: '',
    availability: 'Disponible',
    skills: [],
    entryDate: '2020-08-20',
    pendingVacationsLastYear: 4,
    standbyVacationsLastYear: 3,
    annualVacationDays: 15
  },
  {
    id: 'ENG-005',
    name: 'Ing. Sixto Calderón',
    specialty: 'Aplicaciones',
    email: 'sixto.calderon@soporte.com',
    phone: '',
    avatar: '',
    availability: 'Disponible',
    skills: [],
    entryDate: '2023-01-10',
    pendingVacationsLastYear: 2,
    standbyVacationsLastYear: 0,
    annualVacationDays: 15
  },
  {
    id: 'ENG-006',
    name: 'Ing. Daniel Zhunio',
    specialty: 'Aplicaciones',
    email: 'daniel.zhunio@soporte.com',
    phone: '',
    avatar: '',
    availability: 'Disponible',
    skills: [],
    entryDate: '2022-10-15',
    pendingVacationsLastYear: 1,
    standbyVacationsLastYear: 1,
    annualVacationDays: 15
  },
  {
    id: 'ENG-007',
    name: 'Ing. Diego Bosquez',
    specialty: 'Aplicaciones',
    email: 'diego.bosquez@soporte.com',
    phone: '',
    avatar: '',
    availability: 'Disponible',
    skills: [],
    entryDate: '2024-03-01',
    pendingVacationsLastYear: 0,
    standbyVacationsLastYear: 0,
    annualVacationDays: 15
  },
  {
    id: 'ENG-008',
    name: 'Ing. José Calderón',
    specialty: 'Aplicaciones',
    email: 'jose.calderon@soporte.com',
    phone: '',
    avatar: '',
    availability: 'Disponible',
    skills: [],
    entryDate: '2018-05-12',
    pendingVacationsLastYear: 7,
    standbyVacationsLastYear: 4,
    annualVacationDays: 15
  },
  {
    id: 'ENG-009',
    name: 'Ing. Miguel Niola',
    specialty: 'Ventas',
    email: 'miguel.niola@soporte.com',
    phone: '',
    avatar: '',
    availability: 'Disponible',
    skills: [],
    entryDate: '2023-07-15',
    pendingVacationsLastYear: 2,
    standbyVacationsLastYear: 2,
    annualVacationDays: 15
  },
  {
    id: 'ENG-010',
    name: 'Ing. Hernán Maldonado',
    specialty: 'Ventas',
    email: 'hernan.maldonado@soporte.com',
    phone: '',
    avatar: '',
    availability: 'Disponible',
    skills: [],
    entryDate: '2021-09-01',
    pendingVacationsLastYear: 3,
    standbyVacationsLastYear: 1,
    annualVacationDays: 15
  },
  {
    id: 'ENG-011',
    name: 'Ing. José Quinde',
    specialty: 'Ventas',
    email: 'jose.quinde@soporte.com',
    phone: '',
    avatar: '',
    availability: 'Disponible',
    skills: [],
    entryDate: '2020-12-01',
    pendingVacationsLastYear: 6,
    standbyVacationsLastYear: 2,
    annualVacationDays: 15
  }
];

export const mockEngineers: Engineer[] = [];
export const mockClients: Client[] = [];
export const mockWorkOrders: WorkOrder[] = [];
export const mockReports: TechnicalReport[] = [];
