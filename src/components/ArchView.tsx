import React, { useState } from 'react';
import { Server, Database, Smartphone, Laptop, Cpu, Layers, Lock, Wifi, CheckCircle2, Zap, Cloud, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function ArchView() {
  const [activeLayer, setActiveLayer] = useState<'frontend' | 'backend' | 'database' | 'mobile'>('frontend');

  const stackDetails = {
    frontend: {
      title: 'Capa de Interfaz (Frontend Web Portal)',
      tech: 'React 19 + Vite + Tailwind CSS + Lucide Icons',
      desc: 'El centro de control administrativo se construye como una Single Page Application (SPA) ultrarrápida. La modularidad de React permite vistas de tableros de control complejos, calendarios interactivos sin recargas de página, y dashboards de conciliación con gran fluidez visual.',
      benefits: [
        'Renderizado instantáneo de calendarios pesados con cientos de folios.',
        'Diseño Responsivo con Tailwind CSS que se adapta a pantallas de escritorio para administradores y tablets.',
        'Estado manejado con Context API/Zustand para actualización síncrona inmediata.',
        'Librerías optimizadas para gráficos rápidos (Recharts/D3).'
      ]
    },
    backend: {
      title: 'Capa de Negocio (Backend Server / API)',
      tech: 'Node.js (Express) / NestJS + TypeScript',
      desc: 'Una API REST robusta que automatiza la lógica de control. Se encarga de validar los flujos de transición de estados de las órdenes de trabajo (ej. no se puede reportar una orden que no ha sido marcada como "En Proceso"), encriptar firmas, y notificar electrónicamente a los clientes.',
      benefits: [
        'Ecosistema TypeScript unificado de extremo a extremo, compartiendo interfaces de datos con el Frontend.',
        'Asincronía ideal para subidas múltiples de fotos de evidencias técnicas por reporte.',
        'Integración nativa con sistemas de cola para procesos lentos como generación semi-automática de PDFs.',
        'Middlewares de seguridad de acceso y auditoría de cambios.'
      ]
    },
    database: {
      title: 'Capa de Datos (Durable Cloud Persistence)',
      tech: 'PostgreSQL o Firebase Firestore DB',
      desc: 'Para una operación híbrida que requiere flexibilidad de reportes y relaciones sólidas, se recomienda PostgreSQL para el control transaccional histórico (Órdenes, Clientes, Facturación). O alternativamente Firebase Firestore para sincronización instantánea y soporte nativo offline en campo.',
      benefits: [
        'Transacciones ACID seguras para evitar la duplicidad de firmas o folios.',
        'Capacidad de búsqueda geoespacial integrada (PostGIS en PostgreSQL) para trazar rutas óptimas de ingenieros.',
        'Estructura de esquemas estricta que impide reportes técnicos corruptos o incompletos.',
        'Almacenamiento indexado rápido para el historial de equipos de clientes.'
      ]
    },
    mobile: {
      title: 'Aplicación del Técnico en Campo (Mobile App)',
      tech: 'React Native / PWA (Progressive Web App)',
      desc: 'El ingeniero en campo opera usualmente en sótanos, salas de máquinas lejanas o subestaciones eléctricas subterráneas sin conectividad de datos. Una solución móvil PWA o React Native permite almacenar los reportes de manera local en SQLite/IndexedDB para sincronizarse automáticamente apenas detecte señal.',
      benefits: [
        'Soporte Offline First con almacenamiento local seguro.',
        'Acceso de bajo nivel al hardware: Cámara (para fotos del equipo) y GPS (para timestamp de llegada).',
        'Huella ligera de instalación para técnicos externos con celulares propios (BYOD).',
        'Notificaciones Push en tiempo real para asignación emergente de correctivos.'
      ]
    }
  };

  return (
    <div className="space-y-8" id="arch-view-root">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
        <div className="max-w-3xl">
          <span className="bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Propuesta de Arquitectura de Sistemas
          </span>
          <h1 className="text-3xl font-bold text-white mt-4 tracking-tight">
            Arquitectura de Migración Digital: Planificación y Reporte Técnico
          </h1>
          <p className="text-slate-300 mt-2 text-md leading-relaxed">
            Un ecosistema robusto, escalable y optimizado para la movilidad, diseñado para erradicar el control manual en papel y macros de Excel, garantizando sincronización en tiempo real y blindaje de la información.
          </p>
        </div>
      </div>

      {/* Interactive Stack Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Visual Diagram Selector */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 tracking-tight">Capas del Ecosistema</h3>
          <div className="space-y-3">
            {[
              { id: 'frontend', name: 'Frontend Admin Portal', icon: Laptop, color: 'text-blue-600 bg-blue-50 border-blue-200' },
              { id: 'backend', name: 'API Server / Capa de Negocio', icon: Server, color: 'text-purple-600 bg-purple-50 border-purple-200' },
              { id: 'database', name: 'Base de Datos Transaccional', icon: Database, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
              { id: 'mobile', name: 'Mobile App (Offline-First)', icon: Smartphone, color: 'text-amber-600 bg-amber-50 border-amber-200' },
            ].map((layer) => {
              const Icon = layer.icon;
              const isSelected = activeLayer === layer.id;
              return (
                <button
                  key={layer.id}
                  id={`btn-arch-layer-${layer.id}`}
                  onClick={() => setActiveLayer(layer.id as any)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-4 ${
                    isSelected
                      ? 'bg-slate-900 border-slate-900 text-white shadow-md scale-[1.02]'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-100 text-slate-600'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{layer.name}</p>
                    <p className={`text-xs ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>Ver stack y justificación</p>
                  </div>
                  <ArrowRight className={`w-4 h-4 transition-transform duration-200 ${isSelected ? 'transform translate-x-1 text-indigo-400' : 'text-slate-400'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Explanation Side Panel */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between">
          <motion.div
            key={activeLayer}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Componente Seleccionado</p>
              <h2 className="text-xl font-bold text-slate-900 mt-1">{stackDetails[activeLayer].title}</h2>
              <div className="mt-3 inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-mono px-3 py-1.5 rounded-lg border border-indigo-100">
                <Cpu className="w-3.5 h-3.5" />
                <span>{stackDetails[activeLayer].tech}</span>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              {stackDetails[activeLayer].desc}
            </p>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Beneficios para Ingeniería y Control</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stackDetails[activeLayer].benefits.map((benefit, idx) => (
                  <div key={idx} className="flex gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-700 leading-normal">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-slate-400" /> Seguridad HTTPS + JWT</span>
            <span className="flex items-center gap-1"><Wifi className="w-3.5 h-3.5 text-slate-400" /> Soporte Offline Autónomo</span>
          </div>
        </div>
      </div>

      {/* Why the Stack fits Maintenance Environment */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-600" />
          ¿Por qué es el adecuado para un entorno de mantenimiento técnico?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <div className="p-2 w-fit bg-red-50 text-red-600 rounded-lg">
              <Wifi className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-800">Resiliencia ante la Desconexión</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Los ingenieros de soporte a menudo trabajan en áreas técnicas acorazadas con nula o poca señal (cuartos de máquinas, plantas generadoras, sótanos). El enfoque Offline-First permite operar de modo autónomo completando checklist y levantando firmas sin detener el trabajo.
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <div className="p-2 w-fit bg-emerald-50 text-emerald-600 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-800">Cero Datos Corruptos o Extraviados</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              El Excel actual corre el riesgo latente de sobreescritura accidental o borrado de macros de conciliación. Una base de datos relacional robusta con pistas de auditoría asegura que cada modificación de estado de una orden quede firmada por el usuario, con fecha, hora e historial inalterable.
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
            <div className="p-2 w-fit bg-indigo-50 text-indigo-600 rounded-lg">
              <Cloud className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-800">Transición Excel-a-Web Transparente</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              La arquitectura propuesta hereda y unifica los conceptos clave definidos en "REPORTES INGENIEROS 2626.xlsm" (Agenda planificada vs. Entrega del reporte físico). Al digitalizarse, acelera el cobro o finiquito ya que la auditoría pasa de tardar días a realizarse en 3 clics en tiempo real.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
