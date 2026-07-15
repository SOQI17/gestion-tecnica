import { Engineer, Curso, HistorialEntrenamiento } from '../types';

// Default raw CSV mock data that mimics the "CURSOS GE-FE.csv" horizontal matrix perfectly
export const MOCK_CURSOS_GE_FE_CSV = `CÓDIGO,TÍTULO,MODALIDAD,ADRIAN BENAVIDES,MIGUEL NIOLA,ALEXIS GUERRA,LAURA BLANCO,ROBERTO SANCHEZ,CARLA FIGUEROA
GE-01,Fundamentos de Redes IP,GE,10/12/2018,,05/20/2020,11/14/2011,04/05/2017,
GE-02,Enrutamiento Avanzado Cisco,GE,,06/15/2019,09/10/2021,,12/01/2018,10/10/2022
GE-03,Seguridad WAN y Firewalls,GE,03/24/2020,,,08/18/2021,,02/14/2023
FE-01,Empalme de Fibra Óptica FTTx,FE,05/11/2019,11/10/2017,04/15/2021,02/28/2012,,11/20/2021
FE-02,Mediciones OTDR y Reflectometría,FE,08/14/2020,02/18/2021,,10/12/2015,11/15/2019,
FE-03,Diseño de Redes GPON,FE,,,12/03/2022,06/30/2018,05/20/2021,04/12/2024
MR-01,Mantenimiento Correctivo de Radioenlaces,MR,11/18/2021,,01/15/2023,04/04/2021,10/10/2020,
CT-01,Climatización de Shelter y Nodos,CT,,10/05/2020,08/14/2022,,05/12/2018,08/11/2023`;

// Supporting details for cities (based on their support files)
export const INGENIEROS_DETALLES_SEMILLA: { [nombre: string]: 'Quito' | 'Guayaquil' | 'Cuenca' } = {
  "ADRIAN BENAVIDES": "Quito",
  "MIGUEL NIOLA": "Cuenca",
  "ALEXIS GUERRA": "Guayaquil",
  "LAURA BLANCO": "Quito",
  "ROBERTO SANCHEZ": "Guayaquil",
  "CARLA FIGUEROA": "Cuenca"
};

// Seed arrays derived from the horizontal CSV for quick system auto-population in Firestore
export const INGENIEROS_NORM_SEMILLA: Engineer[] = [
  {
    id: "adrian-benavides",
    name: "ADRIAN BENAVIDES",
    sede: "Quito",
    specialty: "Ingeniería",
    email: "adrian.benavides@orimec.com",
    phone: "+593 999 999 999",
    avatar: "",
    availability: "Disponible",
    skills: ["Ingeniería"]
  },
  {
    id: "miguel-niola",
    name: "MIGUEL NIOLA",
    sede: "Cuenca",
    specialty: "Ingeniería",
    email: "miguel.niola@orimec.com",
    phone: "+593 999 999 999",
    avatar: "",
    availability: "Disponible",
    skills: ["Ingeniería"]
  },
  {
    id: "alexis-guerra",
    name: "ALEXIS GUERRA",
    sede: "Guayaquil",
    specialty: "Ingeniería",
    email: "alexis.guerra@orimec.com",
    phone: "+593 999 999 999",
    avatar: "",
    availability: "Disponible",
    skills: ["Ingeniería"]
  },
  {
    id: "laura-blanco",
    name: "LAURA BLANCO",
    sede: "Quito",
    specialty: "Ingeniería",
    email: "laura.blanco@orimec.com",
    phone: "+593 999 999 999",
    avatar: "",
    availability: "Disponible",
    skills: ["Ingeniería"]
  },
  {
    id: "roberto-sanchez",
    name: "ROBERTO SANCHEZ",
    sede: "Guayaquil",
    specialty: "Ingeniería",
    email: "roberto.sanchez@orimec.com",
    phone: "+593 999 999 999",
    avatar: "",
    availability: "Disponible",
    skills: ["Ingeniería"]
  },
  {
    id: "carla-figueroa",
    name: "CARLA FIGUEROA",
    sede: "Cuenca",
    specialty: "Ingeniería",
    email: "carla.figueroa@orimec.com",
    phone: "+593 999 999 999",
    avatar: "",
    availability: "Disponible",
    skills: ["Ingeniería"]
  }
];

export const CURSOS_NORM_SEMILLA: Curso[] = [
  { id: "GE-01", codigo: "GE-01", titulo: "Fundamentos de Redes IP", modalidad: "GE", costo: 120 },
  { id: "GE-02", codigo: "GE-02", titulo: "Enrutamiento Avanzado Cisco", modalidad: "GE", costo: 180 },
  { id: "GE-03", codigo: "GE-03", titulo: "Seguridad WAN y Firewalls", modalidad: "GE", costo: 250 },
  { id: "FE-01", codigo: "FE-01", titulo: "Empalme de Fibra Óptica FTTx", modalidad: "FE", costo: 150 },
  { id: "FE-02", codigo: "FE-02", titulo: "Mediciones OTDR y Reflectometría", modalidad: "FE", costo: 190 },
  { id: "FE-03", codigo: "FE-03", titulo: "Diseño de Redes GPON", modalidad: "FE", costo: 220 },
  { id: "MR-01", codigo: "MR-01", titulo: "Mantenimiento Correctivo de Radioenlaces", modalidad: "MR", costo: 200 },
  { id: "CT-01", codigo: "CT-01", titulo: "Climatización de Shelter y Nodos", modalidad: "CT", costo: 140 }
];

export const HISTORIAL_NORM_SEMILLA: HistorialEntrenamiento[] = [
  { id: "adrian-benavides_GE-01", id_ingeniero: "adrian-benavides", codigo_curso: "GE-01", fecha_completado: "10/12/2018" },
  { id: "adrian-benavides_GE-03", id_ingeniero: "adrian-benavides", codigo_curso: "GE-03", fecha_completado: "03/24/2020" },
  { id: "adrian-benavides_FE-01", id_ingeniero: "adrian-benavides", codigo_curso: "FE-01", fecha_completado: "05/11/2019" },
  { id: "adrian-benavides_FE-02", id_ingeniero: "adrian-benavides", codigo_curso: "FE-02", fecha_completado: "08/14/2020" },
  { id: "adrian-benavides_MR-01", id_ingeniero: "adrian-benavides", codigo_curso: "MR-01", fecha_completado: "11/18/2021" },
  
  { id: "miguel-niola_GE-02", id_ingeniero: "miguel-niola", codigo_curso: "GE-02", fecha_completado: "06/15/2019" },
  { id: "miguel-niola_FE-01", id_ingeniero: "miguel-niola", codigo_curso: "FE-01", fecha_completado: "11/10/2017" },
  { id: "miguel-niola_FE-02", id_ingeniero: "miguel-niola", codigo_curso: "FE-02", fecha_completado: "02/18/2021" },
  { id: "miguel-niola_CT-01", id_ingeniero: "miguel-niola", codigo_curso: "CT-01", fecha_completado: "10/05/2020" },

  { id: "alexis-guerra_GE-01", id_ingeniero: "alexis-guerra", codigo_curso: "GE-01", fecha_completado: "05/20/2020" },
  { id: "alexis-guerra_GE-02", id_ingeniero: "alexis-guerra", codigo_curso: "GE-02", fecha_completado: "09/10/2021" },
  { id: "alexis-guerra_FE-01", id_ingeniero: "alexis-guerra", codigo_curso: "FE-01", fecha_completado: "04/15/2021" },
  { id: "alexis-guerra_FE-03", id_ingeniero: "alexis-guerra", codigo_curso: "FE-03", fecha_completado: "12/03/2022" },
  { id: "alexis-guerra_MR-01", id_ingeniero: "alexis-guerra", codigo_curso: "MR-01", fecha_completado: "01/15/2023" },
  { id: "alexis-guerra_CT-01", id_ingeniero: "alexis-guerra", codigo_curso: "CT-01", fecha_completado: "08/14/2022" },

  { id: "laura-blanco_GE-01", id_ingeniero: "laura-blanco", codigo_curso: "GE-01", fecha_completado: "11/14/2011" },
  { id: "laura-blanco_GE-03", id_ingeniero: "laura-blanco", codigo_curso: "GE-03", fecha_completado: "08/18/2021" },
  { id: "laura-blanco_FE-01", id_ingeniero: "laura-blanco", codigo_curso: "FE-01", fecha_completado: "02/28/2012" },
  { id: "laura-blanco_FE-02", id_ingeniero: "laura-blanco", codigo_curso: "FE-02", fecha_completado: "10/12/2015" },
  { id: "laura-blanco_FE-03", id_ingeniero: "laura-blanco", codigo_curso: "FE-03", fecha_completado: "06/30/2018" },
  { id: "laura-blanco_MR-01", id_ingeniero: "laura-blanco", codigo_curso: "MR-01", fecha_completado: "04/04/2021" }
];
