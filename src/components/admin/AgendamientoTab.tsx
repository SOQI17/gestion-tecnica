import React from 'react';
import { Calendar as CalendarIcon, ClipboardList, CheckCircle2, UserCheck, Plus, Database, Printer, FileSpreadsheet, Sparkles, AlertTriangle, Trash2, Search, X, RotateCcw, Check, FileText, Filter, Users, PieChart, Percent, Award, TrendingUp, Briefcase, ExternalLink, ShieldAlert, Send, BarChart3, CalendarRange } from 'lucide-react';
import { motion } from 'motion/react';
import { WorkOrder, Engineer, Client, TechnicalReport, MaintenanceType, UserPermissions } from '../../types';

export interface AgendamientoTabProps {
  totalPlanned: number;
  pendingValidation: number;
  completedConciliado: number;
  activeFieldCount: number;
  engineers: Engineer[];
  setIsEngsModalOpen: (open: boolean) => void;
  activeSubTab: 'scheduler' | 'auditor' | 'ordersList' | 'dashboard';
  setActiveSubTab: (tab: 'scheduler' | 'auditor' | 'ordersList' | 'dashboard') => void;
  effectivePermissions: UserPermissions;
  isImporterOpen: boolean;
  setIsImporterOpen: (open: boolean) => void;
  setNewWOClient: (val: string) => void;
  setNewWOClientSearch: (val: string) => void;
  setNewWOEquipment: (val: string) => void;
  setNewWONotes: (val: string) => void;
  setNewWOSupportEngineers: (val: string[]) => void;
  setNewWOSupportEngineer: (val: string) => void;
  setNewWOType: (val: MaintenanceType) => void;
  setNewWOTimeStart: (val: string) => void;
  setNewWOTimeEnd: (val: string) => void;
  setNewWODurationDays: (val: number) => void;
  setNewWODate: (val: string) => void;
  setWoEngDropdownOpen: (open: boolean) => void;
  setWoEngSearchQuery: (val: string) => void;
  setIsCreatingWO: (open: boolean) => void;
  currentDateStr: string;
  handlePrintCalendar: () => void;
  handleExportCalendarExcel: () => void;
  handleSmartReorganize: () => void;
  filterOnlyConflicting: boolean;
  setFilterOnlyConflicting: (val: boolean) => void;
  conflictingWOIds: Set<string>;
  setIsReportMonthModalOpen: (open: boolean) => void;
  currentMonthWOs: WorkOrder[];
  setIsResetModalOpen: (open: boolean) => void;
  handleLoadSamplePlanificacion: () => void;
  handleLoadSampleReportes: () => void;
  handleDrag: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  dragActive: boolean;
  csvFileName: string;
  importYear: string;
  handleImportYearChange: (val: string) => void;
  importMonth: string;
  handleImportMonthChange: (val: string) => void;
  detectedFormatType: 'planificacion' | 'reportes' | null;
  importFeedback: string;
  parsedOrders: WorkOrder[];
  handleCommitImport: () => void;
  clients: Client[];
  parsedClients: Client[];
  parsedEngineers: Engineer[];
  parsedReports: TechnicalReport[];
  calendarMonth: number;
  setCalendarMonth: (m: number) => void;
  calendarYear: number;
  setCalendarYear: (y: number) => void;
  highlightedEngineerId: string | null;
  setHighlightedEngineerId: (id: string | null) => void;
  monthEngineers: Engineer[];
  getEngineerEmoji: (id: string) => string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isReorganizePreviewMode: boolean;
  reassignedWOIds: Set<string>;
  handleApplyReorganization: () => void;
  handleCancelReorganizationPreview: () => void;
  calendarDays: any[];
  calendarMonthName: string;
  workOrders: WorkOrder[];
  getEngineerColorClasses: (id: string) => any;
  matchesSearch: (wo: WorkOrder) => boolean;
  setInfoWO: (wo: WorkOrder) => void;
  getEngineerFullNameNoTitle: (name: string) => string;
  auditorStyle: 'excelTabs' | 'auditDesk';
  setAuditorStyle: (style: 'excelTabs' | 'auditDesk') => void;
  auditorMonth: number;
  setAuditorMonth: (m: number) => void;
  auditorYear: number;
  setAuditorYear: (y: number) => void;
  monthsList: string[];
  selectedEngTab: string;
  setSelectedEngTab: (id: string) => void;
  reports: TechnicalReport[];
  onValidateReport: (workOrderId: string, status: 'aprobado' | 'rechazado', notes: string) => void;
  selectedAuditWOId: string | null;
  setSelectedAuditWOId: (id: string | null) => void;
  isRechazando: boolean;
  setIsRechazando: (val: boolean) => void;
  validationNotes: string;
  setValidationNotes: (notes: string) => void;
  setSelectedRETE04WOId: (id: string | null) => void;
  setIsViewingRETE04: (open: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (st: string) => void;
  filteredOrders: WorkOrder[];
  showEngFilterModal: boolean;
  setShowEngFilterModal: (show: boolean) => void;
  excludedEngIds: string[];
  setExcludedEngIds: React.Dispatch<React.SetStateAction<string[]>>;
  filteredDashOrders: WorkOrder[];
  dashYear: number;
  setDashYear: (y: number) => void;
  dashPeriod: 'month' | 'semester' | 'year';
  setDashPeriod: (p: 'month' | 'semester' | 'year') => void;
  dashMonth: number;
  setDashMonth: (m: number) => void;
  dashSemester: 1 | 2;
  setDashSemester: (s: 1 | 2) => void;
  handleExportDashboardCSV: () => void;
  handlePrintMainDashboard: () => void;
  expandedMainKPICard: string | null;
  setExpandedMainKPICard: React.Dispatch<React.SetStateAction<string | null>>;
  dashboardKPIs: any;
  getWOEffectiveStatus: (wo: WorkOrder) => string;
  getWOClientDisplayName: (wo: WorkOrder) => string;
  isInstallationWO: (wo: WorkOrder) => boolean;
  engineerStats: any[];
  setSelectedEngForMetrics: (eng: Engineer) => void;
  setIsEngMetricsModalOpen: (open: boolean) => void;
}

export const AgendamientoTab: React.FC<AgendamientoTabProps> = ({
  totalPlanned,
  pendingValidation,
  completedConciliado,
  activeFieldCount,
  engineers,
  setIsEngsModalOpen,
  activeSubTab,
  setActiveSubTab,
  effectivePermissions,
  isImporterOpen,
  setIsImporterOpen,
  setNewWOClient,
  setNewWOClientSearch,
  setNewWOEquipment,
  setNewWONotes,
  setNewWOSupportEngineers,
  setNewWOSupportEngineer,
  setNewWOType,
  setNewWOTimeStart,
  setNewWOTimeEnd,
  setNewWODurationDays,
  setNewWODate,
  setWoEngDropdownOpen,
  setWoEngSearchQuery,
  setIsCreatingWO,
  currentDateStr,
  handlePrintCalendar,
  handleExportCalendarExcel,
  handleSmartReorganize,
  filterOnlyConflicting,
  setFilterOnlyConflicting,
  conflictingWOIds,
  setIsReportMonthModalOpen,
  currentMonthWOs,
  setIsResetModalOpen,
  handleLoadSamplePlanificacion,
  handleLoadSampleReportes,
  handleDrag,
  handleDrop,
  handleFileChange,
  dragActive,
  csvFileName,
  importYear,
  handleImportYearChange,
  importMonth,
  handleImportMonthChange,
  detectedFormatType,
  importFeedback,
  parsedOrders,
  handleCommitImport,
  clients,
  parsedClients,
  parsedEngineers,
  parsedReports,
  calendarMonth,
  setCalendarMonth,
  calendarYear,
  setCalendarYear,
  highlightedEngineerId,
  setHighlightedEngineerId,
  monthEngineers,
  getEngineerEmoji,
  searchQuery,
  setSearchQuery,
  isReorganizePreviewMode,
  reassignedWOIds,
  handleApplyReorganization,
  handleCancelReorganizationPreview,
  calendarDays,
  calendarMonthName,
  workOrders,
  getEngineerColorClasses,
  matchesSearch,
  setInfoWO,
  getEngineerFullNameNoTitle,
  auditorStyle,
  setAuditorStyle,
  auditorMonth,
  setAuditorMonth,
  auditorYear,
  setAuditorYear,
  monthsList,
  selectedEngTab,
  setSelectedEngTab,
  reports,
  onValidateReport,
  selectedAuditWOId,
  setSelectedAuditWOId,
  isRechazando,
  setIsRechazando,
  validationNotes,
  setValidationNotes,
  setSelectedRETE04WOId,
  setIsViewingRETE04,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  filteredOrders,
  showEngFilterModal,
  setShowEngFilterModal,
  excludedEngIds,
  setExcludedEngIds,
  filteredDashOrders,
  dashYear,
  setDashYear,
  dashPeriod,
  setDashPeriod,
  dashMonth,
  setDashMonth,
  dashSemester,
  setDashSemester,
  handleExportDashboardCSV,
  handlePrintMainDashboard,
  expandedMainKPICard,
  setExpandedMainKPICard,
  dashboardKPIs,
  getWOEffectiveStatus,
  getWOClientDisplayName,
  isInstallationWO,
  engineerStats,
  setSelectedEngForMetrics,
  setIsEngMetricsModalOpen,
}) => {
  return (
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
                      const weekDaysData = weekDays.map((cell: any) => {
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
                            const done = (st.statusCounts.Conciliado || 0) + (st.statusCounts.Realizado || 0) + (st.statusCounts.Reportado || 0);
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
                  const colors = ['#4f46e5', '#0284c7', '#059669', '#d97706', '#7c3aed', '#db2777', '#2563eb', '#0d9488'];

                  if (totalWorkload === 0) {
                    return (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
                        <PieChart className="w-12 h-12 stroke-1 text-slate-300 mb-2" />
                        <p className="text-xs font-semibold">Sin tareas registradas para este periodo.</p>
                      </div>
                    );
                  }

                  let cumulativeAngle = 0;
                  const slices = engineerStats.map((st, i) => {
                    const percentage = (st.total / totalWorkload) * 100;
                    const angle = (st.total / totalWorkload) * 360;
                    const startAngle = cumulativeAngle;
                    cumulativeAngle += angle;
                    return {
                      engineer: st.engineer,
                      total: st.total,
                      percentage: Math.round(percentage),
                      color: colors[i % colors.length],
                      startAngle,
                      angle
                    };
                  });

                  return (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4 pt-4">
                      {/* SVG Pie */}
                      <div className="relative w-44 h-44 shrink-0">
                        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                          {slices.map((slice, i) => {
                            if (slice.angle === 360) {
                              return <circle key={i} cx="50" cy="50" r="35" fill="none" stroke={slice.color} strokeWidth="18" />;
                            }
                            const x1 = 50 + 35 * Math.cos((Math.PI * slice.startAngle) / 180);
                            const y1 = 50 + 35 * Math.sin((Math.PI * slice.startAngle) / 180);
                            const x2 = 50 + 35 * Math.cos((Math.PI * (slice.startAngle + slice.angle)) / 180);
                            const y2 = 50 + 35 * Math.sin((Math.PI * (slice.startAngle + slice.angle)) / 180);
                            const largeArcFlag = slice.angle > 180 ? 1 : 0;
                            const pathData = `M 50 50 L ${x1} ${y1} A 35 35 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                            return (
                              <path
                                key={i}
                                d={pathData}
                                fill={slice.color}
                                className="hover:opacity-80 transition-opacity cursor-pointer"
                              />
                            );
                          })}
                          <circle cx="50" cy="50" r="22" fill="white" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-xl font-black text-slate-800 leading-none">{totalWorkload}</span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">Tareas</span>
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="w-full space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                        {slices.map((sl, i) => (
                          <div key={i} className="flex items-center justify-between text-3xs font-semibold text-slate-700 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-2 truncate">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sl.color }} />
                              <span className="truncate">{sl.engineer.name}</span>
                            </div>
                            <span className="font-bold font-mono text-slate-900 shrink-0 ml-2">{sl.total} ({sl.percentage}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Breakdown Table (Col-7) */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
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
  );
};
