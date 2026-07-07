import React, { useState } from 'react';
import { Database, Table, ArrowRight, User2, MapPin, Calendar, FileText, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function DataModelView() {
  const [selectedEntity, setSelectedEntity] = useState<'engineers' | 'clients' | 'orders' | 'reports'>('orders');

  const entities = {
    engineers: {
      name: 'Ingenieros (engineers)',
      icon: User2,
      description: 'Registra los datos maestros de los técnicos calificados para ejecutar los mantenimientos.',
      columns: [
        { name: 'id', type: 'VARCHAR(50) (PK)', desc: 'Identificador único del ingeniero (Ej: ENG-001).' },
        { name: 'name', type: 'VARCHAR(150)', desc: 'Nombre completo del ingeniero.' },
        { name: 'specialty', type: 'VARCHAR(100)', desc: 'Especialidad principal técnica (HVAC, Eléctrico, etc.).' },
        { name: 'email', type: 'VARCHAR(100) (UNIQUE)', desc: 'Correo institucional para envío de notificaciones.' },
        { name: 'phone', type: 'VARCHAR(25)', desc: 'Teléfono o celular para contacto de emergencia.' },
        { name: 'avatar_url', type: 'TEXT', desc: 'URL para foto de perfil en el dashboard.' },
        { name: 'availability', type: 'VARCHAR(20)', desc: 'Estado de disponibilidad: Disponible, En Campo, Inactivo.' },
        { name: 'skills', type: 'TEXT[]', desc: 'Arreglo de competencias o certificaciones secundarias.' }
      ],
      json: `{
  "id": "ENG-001",
  "name": "Ing. Carlos Mendoza",
  "specialty": "Ingeniería",
  "email": "carlos.mendoza@soporte.com",
  "phone": "+52 55 4123 4567",
  "availability": "Disponible",
  "skills": ["Sistemas Chiller VRF", "Termografía Infrarroja"]
}`
    },
    clients: {
      name: 'Clientes / Lugares (clients)',
      icon: MapPin,
      description: 'Datos maestros de las locaciones físicas y equipos donde se ejecutarán las órdenes de trabajo.',
      columns: [
        { name: 'id', type: 'VARCHAR(50) (PK)', desc: 'Identificador del cliente o sede corporativa.' },
        { name: 'name', type: 'VARCHAR(150)', desc: 'Razón social o nombre identificatorio del sitio.' },
        { name: 'address', type: 'TEXT', desc: 'Dirección física completa del lugar.' },
        { name: 'industry', type: 'VARCHAR(100)', desc: 'Giro de industria del cliente.' },
        { name: 'contact_name', type: 'VARCHAR(150)', desc: 'Nombre de contacto técnico/administrador local.' },
        { name: 'contact_phone', type: 'VARCHAR(25)', desc: 'Teléfono directo del contacto local.' },
        { name: 'installed_equipments', type: 'TEXT[]', desc: 'Lista de identificadores de equipos asignados a este sitio.' }
      ],
      json: `{
  "id": "CLI-101",
  "name": "Corporativo Arcos",
  "address": "Av. Paseo de la Reforma 2600, Lomas de Chapultepec, CDMX",
  "contact_name": "Lic. Gerardo Alcocer",
  "installed_equipments": [
    "Sistema Chiller Trane de 150 TR",
    "Subestación Eléctrica 450 KVA"
  ]
}`
    },
    orders: {
      name: 'Agenda / Órdenes de Trabajo (work_orders)',
      icon: Calendar,
      description: 'El núcleo de planificación de tareas. Vincula un cliente con un ingeniero en una fecha planificada.',
      columns: [
        { name: 'id', type: 'VARCHAR(50) (PK)', desc: 'Folio secuencial de la orden (Ej: WO-2026-001).' },
        { name: 'client_id', type: 'VARCHAR(50) (FK -> clients.id)', desc: 'ID del cliente donde se realiza el servicio.' },
        { name: 'engineer_id', type: 'VARCHAR(50) (FK -> engineers.id)', desc: 'ID del ingeniero asignado.' },
        { name: 'planned_date', type: 'DATE', desc: 'Fecha planificada del mantenimiento (Formato YYYY-MM-DD).' },
        { name: 'type', type: 'VARCHAR(50)', desc: 'Tipo: Preventivo, Correctivo, Instalación, Calibración.' },
        { name: 'status', type: 'VARCHAR(30)', desc: 'Flujo de avance: Pendiente, En Proceso, Realizado, Reportado, Conciliado.' },
        { name: 'equipment_name', type: 'VARCHAR(150)', desc: 'Nombre del equipo específico a revisar.' },
        { name: 'notes', type: 'TEXT', desc: 'Instrucciones iniciales registradas por el administrador.' }
      ],
      json: `{
  "id": "WO-2026-001",
  "client_id": "CLI-101",
  "engineer_id": "ENG-001",
  "planned_date": "2026-06-02",
  "type": "Preventivo",
  "status": "Realizado",
  "equipment_name": "Sistema Chiller Trane de 150 TR"
}`
    },
    reports: {
      name: 'Reportes Técnicos (technical_reports)',
      icon: FileText,
      description: 'Documentación fina rellenada en campo por el técnico. Resuelve la conciliación.',
      columns: [
        { name: 'id', type: 'VARCHAR(50) (PK)', desc: 'ID del reporte asociado (usualmente REP + WO_ID).' },
        { name: 'work_order_id', type: 'VARCHAR(50) (FK -> work_orders.id - UNIQUE)', desc: 'Orden a la que responde/satisface.' },
        { name: 'execution_date', type: 'TIMESTAMP', desc: 'Fecha y hora exacta de captura/cierre en campo.' },
        { name: 'hours_spent', type: 'DECIMAL(5,2)', desc: 'Horas hombre aplicadas en el mantenimiento.' },
        { name: 'technical_findings', type: 'TEXT', desc: 'Fallas encontradas o estado inicial del sistema.' },
        { name: 'actions_taken', type: 'TEXT', desc: 'Acciones correctivas o actividades realizadas.' },
        { name: 'materials_used', type: 'JSONB/TEXT', desc: 'Lista de repuestos y materiales consumidos (item, qty).' },
        { name: 'technician_signature', type: 'TEXT', desc: 'Nombre, ID o firma digitalizada del ingeniero soporte.' },
        { name: 'client_signature_name', type: 'VARCHAR(150)', desc: 'Nombre del representante cliente que firmó de conformidad.' },
        { name: 'validation_state', type: 'VARCHAR(20)', desc: 'Estado auditor del admin: pendiente, aprobado, rechazado.' }
      ],
      json: `{
  "id": "REP-WO-2026-001",
  "work_order_id": "WO-2026-001",
  "execution_date": "2026-06-02T18:30:00Z",
  "hours_spent": 3.5,
  "technical_findings": "Filtros colmatados de tierra. Presiones estables.",
  "actions_taken": "Limpieza profunda de láminas y cambio de filtros.",
  "validation_state": "pendiente"
}`
    }
  };

  return (
    <div className="space-y-8" id="data-model-root">
      {/* Title block */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Database className="w-5.5 h-5.5 text-indigo-600" />
          Modelo de Datos & Relaciones
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Estructura de tablas y atributos recomendados para erradicar inconsistencias de registro y permitir una auditoría rápida.
        </p>
      </div>

      {/* Relational connections visualization */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Arquitectura Relacional / Flujo de Llaves</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Engineers */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs relative">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase mb-2">
              <User2 className="w-3.5 h-3.5" />
              <span>Ingerieros (PK: id)</span>
            </div>
            <p className="text-xs text-slate-500 font-mono">1 Ingeniero tiene muchas Órdenes asignadas en el tiempo.</p>
            <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 z-10 bg-white border border-slate-200 p-1 rounded-full">
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </div>
          </div>

          {/* Clients */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs relative">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase mb-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>Clientes (PK: id)</span>
            </div>
            <p className="text-xs text-slate-500 font-mono">1 Cliente recibe múltiples servicios planificados.</p>
            <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 z-10 bg-white border border-slate-200 p-1 rounded-full">
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </div>
          </div>

          {/* Work Orders */}
          <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-xs relative">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Órdenes (PK: id)</span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Tabla pivote de la Agenda. Recibe FK de técnicos y de clientes.</p>
            <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 z-10 bg-slate-900 border border-slate-800 p-1 rounded-full">
              <ArrowRight className="w-3 h-3 text-indigo-400" />
            </div>
          </div>

          {/* Technical Reports */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase mb-2">
              <FileText className="w-3.5 h-3.5" />
              <span>Reportes (PK: id)</span>
            </div>
            <p className="text-xs text-slate-500 font-mono">Relación 1 a 1 estricta con Orden a través de work_order_id.</p>
          </div>
        </div>
      </div>

      {/* Interactive Entity details & sample JSON */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Buttons and Field details */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit">
            {[
              { id: 'engineers', label: 'Ingenieros' },
              { id: 'clients', label: 'Clientes' },
              { id: 'orders', label: 'Órdenes' },
              { id: 'reports', label: 'Reportes' },
            ].map(tab => (
              <button
                key={tab.id}
                id={`btn-model-tab-${tab.id}`}
                onClick={() => setSelectedEntity(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 ${
                  selectedEntity === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-800">{entities[selectedEntity].name}</h4>
                <p className="text-xs text-slate-500">{entities[selectedEntity].description}</p>
              </div>
            </div>
            <div className="p-2 divide-y divide-slate-100">
              {entities[selectedEntity].columns.map((col, idx) => (
                <div key={idx} className="p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{col.name}</span>
                    <span className="font-mono text-indigo-600 font-semibold">{col.type}</span>
                  </div>
                  <p className="text-slate-500 sm:text-right max-w-sm">{col.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* JSON Schema visualizer */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 text-slate-300 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <span className="text-xs font-mono font-bold text-slate-500">FORMATO JSON DE REGISTRO</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-0.5 rounded">Válido</span>
              </div>
              <pre className="font-mono text-xs overflow-x-auto text-emerald-400 leading-relaxed whitespace-pre-wrap">
                {entities[selectedEntity].json}
              </pre>
            </div>
            <p className="text-2xs text-slate-500 mt-6 pt-4 border-t border-slate-900 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              Tipos definidos en TypeScript para sincronización mutua con formularios de validación.
            </p>
          </div>
        </div>
      </div>

      {/* Migration mapping Excel vs Database */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-sm text-slate-800">Mapeo de Migración: Excel vs Modern Web DB</h3>
          <p className="text-xs text-slate-500 mt-1">Cómo se mapeará cada celda del archivo "REPORTES INGENIEROS 2626.xlsm" al sistema relacional.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-bold text-2xs uppercase">
                <th className="p-4">Columna / Pestaña del Excel</th>
                <th className="p-4">Entidad DB de Destino</th>
                <th className="p-4">Atributo Técnico</th>
                <th className="p-4">Ventaja del Cambio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700 font-medium">
              <tr>
                <td className="p-4 font-bold">FECHA PROGRAMACIÓN</td>
                <td className="p-4">work_orders</td>
                <td className="p-4 font-mono text-indigo-600">planned_date (DATE)</td>
                <td className="p-4 text-slate-500">Evita fechas en formatos erróneos (ej. texto) o nulos de planificación. En calendario interactivo.</td>
              </tr>
              <tr>
                <td className="p-4 font-bold">INGENIERO DE SOPORTE</td>
                <td className="p-4">engineers</td>
                <td className="p-4 font-mono text-indigo-600">engineer_id (FK)</td>
                <td className="p-4 text-slate-500">Resuelve problemas tipográficos ("C. Mendoza", "Carlos M.") asignando un ID base. Permite medir ocupación técnica.</td>
              </tr>
              <tr>
                <td className="p-4 font-bold">LUGAR / CLIENTE</td>
                <td className="p-4">clients</td>
                <td className="p-4 font-mono text-indigo-600">client_id (FK)</td>
                <td className="p-4 text-slate-500">Resuelve variaciones de nombre de cliente o direcciones faltantes. El sistema da autocompletado y mapa.</td>
              </tr>
              <tr>
                <td className="p-4 font-bold">TIPO DE SERVICIO</td>
                <td className="p-4">work_orders</td>
                <td className="p-4 font-mono text-indigo-600">type (ENUM)</td>
                <td className="p-4 text-slate-500">Configurado como ENUM rígido: Preventivo, Correctivo, Instalación, Calibración.</td>
              </tr>
              <tr>
                <td className="p-4 font-bold">REPORTE FÍSICO / PDF LINK</td>
                <td className="p-4">technical_reports</td>
                <td className="p-4 font-mono text-indigo-600">work_order_id (FK: Strict 1:1)</td>
                <td className="p-4 text-slate-500">Se elimina la subida de links rotos de carpetas locales. El reporte reside directo en la DB asociado con material y firmas.</td>
              </tr>
              <tr>
                <td className="p-4 font-bold">CONCILIADO EN EXCEL</td>
                <td className="p-4">technical_reports</td>
                <td className="p-4 font-mono text-indigo-600">validation_state (VARCHAR)</td>
                <td className="p-4 text-slate-500">El estatus de validación pasa de ser un coloreado manual de fila a un estado digital firmado por el administrador.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
