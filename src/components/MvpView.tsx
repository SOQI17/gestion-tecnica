import React, { useState } from 'react';
import { Layers, Rocket, ShieldCheck, Milestone, Calendar, ArrowRight, Zap, PlaySquare } from 'lucide-react';
import { motion } from 'motion/react';

interface MvpPhase {
  number: number;
  title: string;
  duration: string;
  focus: string;
  deliverables: string[];
  substitutesExcel: string;
  riskMitigation: string;
}

export default function MvpView() {
  const [selectedPhase, setSelectedPhase] = useState<number>(1);

  const phases: MvpPhase[] = [
    {
      number: 1,
      title: 'MVP: Esqueleto Base y Migración de Datos Activos',
      duration: 'Semanas 1 - 3',
      focus: 'Establecer la estructura de base de datos relacional y migrar la masa de datos de clientes, ingenieros y equipos desde el histórico de Excel.',
      deliverables: [
        'Modelo de base de datos PostgreSQL / Firebase inicializado.',
        'Módulo autenticador básico para el administrador de control.',
        'Script cargador / importador automático de archivos .xlsx para no perder el registro de mantenimientos históricos.',
        'Versión web inicial de "Agenda / Programación" para crear órdenes de servicio interactivas.'
      ],
      substitutesExcel: 'Reemplaza la pestaña "BASE INGENIEROS" y "HISTORIAL CLIENTES". La asignación manual de fechas se traslada del calendario Excel al gestor web.',
      riskMitigation: 'Se mitiga la pérdida de datos históricos manteniendo una copia de lectura del Excel "REPORTES INGENIEROS 2626.xlsm" mientras corre el MVP.'
    },
    {
      number: 2,
      title: 'Portal de Campo Mobile (Técnicos de Soporte)',
      duration: 'Semanas 4 - 6',
      focus: 'Habilitar el canal interactivo móvil para los ingenieros. Los ingenieros dejan de registrar hallazgos en hojas físicas o mandar correos aislados.',
      deliverables: [
        'Versión Web App de lectura-escritura optimizada para celulares y tablets en campo.',
        'Manejo de estado offline-first (guarda localmente en caché si se va la señal en sótanos).',
        'Formulario interactivo checklist de actividades con carga de evidencias fotográficas directas.',
        'Módulo Captura de Firma De Conformidad manuscrita digitalizada sobre la pantalla.'
      ],
      substitutesExcel: 'Erradica la transcripción manual posterior de reportes en físico mandados por Whatsapp. Elimina archivos adjuntos dispersos en carpetas de red.',
      riskMitigation: 'Para zonas sin cobertura móvil profunda de red, el navegador se sincronizará automáticamente apenas reingrese a cobertura 4G/Wifi local.'
    },
    {
      number: 3,
      title: 'Cámara de Conciliación Automática y Alertas',
      duration: 'Semanas 7 - 8',
      focus: 'Implementar el Validador de Auditorías y eliminar completamente las macros cruzadas del Excel.',
      deliverables: [
        'Interfaz interactiva de verificación en tiempo real (visión paralela planificado v.s. reportado).',
        'Firma criptográfica de conciliación para auditoría contable.',
        'Automatización de alertas de correo cliente para informar el finiquito de su mantenimiento preventivo.',
        'Controlador de almacén para materiales e insumos cargados en los cierres de soporte.'
      ],
      substitutesExcel: 'Sustituye completamente la macro de conciliación del clásico archivo XLSM. El estatus de conciliado se asigna directamente tras la validación aprobada del administrador.',
      riskMitigation: 'Mapeo estricto 1:1 de folios. Si un técnico altera repuestos fuera de catálogo, la conciliación se frena con banderín rojo automático.'
    },
    {
      number: 4,
      title: 'Escalamiento e Integración ERP/Facturación',
      duration: 'Semanas 9+',
      focus: 'Cerrar el ciclo logístico financiero de la empresa uniendo el agendamiento del servicio con la facturación y métricas ejecutivas.',
      deliverables: [
        'Integración con ERP principal para facturación de correctivos o repuestos.',
        'Métricas automatizadas de NPS e indicadores de eficacia del técnico.',
        'Reportes ejecutivos de recurrencia de fallas mecánicas por cliente en los últimos 12 meses (mantenimiento predictivo).'
      ],
      substitutesExcel: 'El Excel queda extinto. El 100% del ciclo (Agenda -> Ejecución en campo -> Firma Cliente -> Conciliación -> Facturación) es digital y auditable.',
      riskMitigation: 'Las claves de API de los servicios de terceras partes se resguardan en servidores encriptados HTTPS.'
    }
  ];

  return (
    <div className="space-y-8" id="mvp-view-root">
      {/* Introduction Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center">
        <div className="p-4 bg-indigo-50 text-indigo-700 rounded-full">
          <Rocket className="w-8 h-8 animate-bounce" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-lg">Estrategia Gradual de Lanzamiento (MVP)</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Una migración abrupta perturba la operación de campo. Esta hoja de ruta optimizada permite apagar el Excel paulatinamente en 4 fases, mitigando riesgos operativos y garantizando continuidad.
          </p>
        </div>
      </div>

      {/* Interactive horizontal Phase roadmap selection */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {phases.map((ph) => {
          const isSelected = selectedPhase === ph.number;
          return (
            <button
              key={ph.number}
              id={`btn-mvp-phase-${ph.number}`}
              onClick={() => setSelectedPhase(ph.number)}
              className={`p-4 text-left rounded-xl border transition-all duration-200 cursor-pointer ${
                isSelected 
                  ? 'bg-slate-900 border-slate-950 text-white shadow-md' 
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`text-4xs font-bold font-mono px-2 py-0.5 rounded ${isSelected ? 'bg-indigo-500/30 text-indigo-200' : 'bg-slate-100 text-slate-500'}`}>
                  FASE {ph.number}
                </span>
                <span className={`text-[10px] font-bold ${isSelected ? 'text-indigo-300' : 'text-indigo-600'}`}>{ph.duration}</span>
              </div>
              <h4 className="font-bold text-xs truncate mt-2">{ph.title.split(':')[1] || ph.title}</h4>
            </button>
          );
        })}
      </div>

      {/* Selected Phase detailed checklist & values */}
      {(() => {
        const ph = phases.find(p => p.number === selectedPhase);
        if (!ph) return null;

        return (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs grid grid-cols-1 lg:grid-cols-12">
            {/* Left part list of deliverables */}
            <div className="lg:col-span-7 p-6 space-y-4">
              <div>
                <span className="text-4xs font-bold font-mono text-indigo-600 uppercase tracking-widest">PROPUESTA DE ENTREGABLES</span>
                <h3 className="text-md font-bold text-slate-900 mt-1">{ph.title}</h3>
                <p className="text-2xs text-slate-500 mt-1">{ph.focus}</p>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-4">
                <p className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Entregables de Ingeniería de Software:</p>
                <div className="space-y-2">
                  {ph.deliverables.map((item, idx) => (
                    <div key={idx} className="flex gap-2 text-xs text-slate-700 align-top">
                      <input type="checkbox" readOnly checked className="mt-0.5 accent-indigo-600 h-3.5 w-3.5 shrink-0" />
                      <p className="leading-tight">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right part Excel substitution comparisons */}
            <div className="lg:col-span-5 bg-slate-900/5 backdrop-blur-xs p-6 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-[10px] uppercase">
                    <Zap className="w-3.5 h-3.5 text-indigo-600" />
                    <span>¿Cómo sustituye el Excel actual?</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-serif italic">
                    "{ph.substitutesExcel}"
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[10px] uppercase">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Mitigación de Riesgo Operativo</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans">
                    {ph.riskMitigation}
                  </p>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 text-3xs flex items-center justify-between">
                <div>
                  <p className="text-slate-400 font-mono font-bold uppercase tracking-wider">Hito del Plan</p>
                  <p className="font-bold text-xs mt-0.5">Siguiente paso a Fase {ph.number + 1 <= 4 ? ph.number + 1 : 4}</p>
                </div>
                {ph.number < 4 && (
                  <button
                    id={`btn-next-phase-${ph.number}`}
                    onClick={() => setSelectedPhase(ph.number + 1)}
                    className="p-1 px-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-bold flex items-center gap-1 border border-indigo-700 transition-colors cursor-pointer"
                  >
                    <span>Fase {ph.number + 1}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
