import React from 'react';
import { 
  Palmtree, 
  Search, 
  Check, 
  X, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  ClipboardList, 
  Briefcase, 
  AlertTriangle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Engineer, Vacation, WorkOrder, EngineerPermission } from '../../types';

interface VacacionesTabProps {
  engineers: Engineer[];
  vacations: Vacation[];
  workOrders: WorkOrder[];
  permissions: EngineerPermission[];
  getEngineerEmoji: (id: string) => string;
  getVacationDuration: (start: string, end: string, includeWeekends?: boolean) => number;
  getEndDateStr: (start: string, durationDays: number) => string;
  isVacationTaken: (endDateStr: string) => boolean;
  formatHoursToDays: (hours: number) => string;
  getYearsInCompanyNum: (entryDate?: string) => number;
  calculateYearsInCompany: (entryDate?: string) => string;
  ECUADOR_HOLIDAYS: any[];
  onAddVacation?: (v: Vacation) => Promise<void>;
  onUpdateVacation?: (v: Vacation) => Promise<void>;
  onDeleteVacation?: (id: string) => Promise<void>;
  onUpdateEngineer?: (e: Engineer) => Promise<void>;
  onAddPermission?: (p: EngineerPermission) => Promise<void>;
  onDeletePermission?: (id: string) => Promise<void>;
  // Local state props passed from AdminPortal
  vacFormEngId: string;
  setVacFormEngId: (id: string) => void;
  vacFormStart: string;
  setVacFormStart: (s: string) => void;
  vacFormEnd: string;
  setVacFormEnd: (e: string) => void;
  vacFormNotes: string;
  setVacFormNotes: (n: string) => void;
  vacFormIncludeWeekends: boolean;
  setVacFormIncludeWeekends: (b: boolean) => void;
  vacationSubTab: 'saldos' | 'historial';
  setVacationSubTab: (tab: 'saldos' | 'historial') => void;
  vacEngSearchQuery: string;
  setVacEngSearchQuery: (q: string) => void;
  vacFormSearchOpen: boolean;
  setVacFormSearchOpen: (b: boolean) => void;
  vacFormSearchQuery: string;
  setVacFormSearchQuery: (q: string) => void;
  auditEngId: string;
  setAuditEngId: (id: string) => void;
  permFormType: 'Permiso' | 'Compensación';
  setPermFormType: (t: 'Permiso' | 'Compensación') => void;
  permFormDate: string;
  setPermFormDate: (d: string) => void;
  permFormHours: number;
  setPermFormHours: (h: number) => void;
  permFormReason: string;
  setPermFormReason: (r: string) => void;
  historyEngId: string | null;
  setHistoryEngId: (id: string | null) => void;
  modalVacIncludeWeekends: boolean;
  setModalVacIncludeWeekends: (b: boolean) => void;
  EditableNumberInput: React.FC<{ value: number; onSave: (val: number) => void }>;
}

export const VacacionesTab: React.FC<VacacionesTabProps> = ({
  engineers,
  vacations,
  workOrders,
  permissions,
  getEngineerEmoji,
  getVacationDuration,
  getEndDateStr,
  isVacationTaken,
  formatHoursToDays,
  getYearsInCompanyNum,
  calculateYearsInCompany,
  ECUADOR_HOLIDAYS,
  onAddVacation,
  onUpdateVacation,
  onDeleteVacation,
  onUpdateEngineer,
  onAddPermission,
  onDeletePermission,
  vacFormEngId,
  setVacFormEngId,
  vacFormStart,
  setVacFormStart,
  vacFormEnd,
  setVacFormEnd,
  vacFormNotes,
  setVacFormNotes,
  vacFormIncludeWeekends,
  setVacFormIncludeWeekends,
  vacationSubTab,
  setVacationSubTab,
  vacEngSearchQuery,
  setVacEngSearchQuery,
  vacFormSearchOpen,
  setVacFormSearchOpen,
  vacFormSearchQuery,
  setVacFormSearchQuery,
  auditEngId,
  setAuditEngId,
  permFormType,
  setPermFormType,
  permFormDate,
  setPermFormDate,
  permFormHours,
  setPermFormHours,
  permFormReason,
  setPermFormReason,
  historyEngId,
  setHistoryEngId,
  modalVacIncludeWeekends,
  setModalVacIncludeWeekends,
  EditableNumberInput,
}) => {
  const pendingRequestsCount = (vacations || []).filter(v => v.status === 'Solicitado').length;

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

    if (schedulingConflicts.length > 0) {
      const confirmVac = window.confirm(
        `⚠️ ALERTA DE CRUCE DE TRABAJO Y VACACIONES:\n\nEl técnico ${eng?.name || ''} tiene ${schedulingConflicts.length} orden(es) de trabajo asignadas durante estas fechas.\n\n¿Desea registrar las vacaciones de todas formas?`
      );
      if (!confirmVac) return;
    }

    const overlappingVac = (vacations || []).find(v => 
      v.engineerId === targetEngId && v.status === 'Aprobado' &&
      (vacFormStart <= v.endDate && vacFormEnd >= v.startDate)
    );
    if (overlappingVac) {
      const confirmOverlap = window.confirm(
        `⚠️ ALERTA DE VACACIONES CRUZADAS / DUPLICADAS:\n\nEl técnico ${eng?.name || ''} ya cuenta con vacaciones aprobadas del ${overlappingVac.startDate} al ${overlappingVac.endDate}.\n\n¿Desea registrar estas vacaciones de todos modos?`
      );
      if (!confirmOverlap) return;
    }

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

  const handleLoadEcuadorHolidays = async () => {
    if (!onAddVacation) {
      alert("Función no disponible.");
      return;
    }
    let addedCount = 0;
    for (const h of ECUADOR_HOLIDAYS) {
      const exists = (vacations || []).some(v => v.id === h.id || (v.startDate === h.startDate && v.notes?.includes(h.notes)));
      if (!exists) {
        const newVac: Vacation = {
          id: h.id,
          engineerId: 'FERIADO',
          startDate: h.startDate,
          endDate: h.endDate,
          status: 'Aprobado',
          notes: h.notes,
          createdAt: new Date().toISOString(),
          includeWeekends: true
        };
        await onAddVacation(newVac);
        addedCount++;
      }
    }
    if (addedCount > 0) {
      alert(`¡Éxito! Se han registrado automáticamente ${addedCount} feriados nacionales de Ecuador.`);
    } else {
      alert("Los feriados nacionales de Ecuador ya se encuentran cargados.");
    }
  };

  const renderHistorialSubTab = () => {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in duration-200">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">Historial y Solicitudes Agrupadas</h3>
              <p className="text-3xs text-slate-455 mt-0.5">Revise y apruebe las solicitudes pendientes o consulte el histórico agrupado por técnico</p>
            </div>

            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
              {(() => {
                const grouped: Record<string, Vacation[]> = {};
                (vacations || []).forEach(vac => {
                  if (!grouped[vac.engineerId]) {
                    grouped[vac.engineerId] = [];
                  }
                  grouped[vac.engineerId].push(vac);
                });

                const sortedGroupedKeys = Object.keys(grouped).sort((a, b) => {
                  const engA = engineers.find(e => e.id === a);
                  const engB = engineers.find(e => e.id === b);
                  const nameA = engA ? engA.name.toLowerCase() : '';
                  const nameB = engB ? engB.name.toLowerCase() : '';
                  return nameA.localeCompare(nameB);
                });

                if (sortedGroupedKeys.length === 0) {
                  return (
                    <div className="text-center py-12 text-slate-400 bg-slate-50/50 rounded-xl border border-slate-150">
                      <Palmtree className="w-8 h-8 mx-auto opacity-30 mb-2" />
                      <p className="text-3xs font-bold uppercase">Sin registros de vacaciones</p>
                    </div>
                  );
                }

                return sortedGroupedKeys.map(engId => {
                  const eng = engineers.find(e => e.id === engId);
                  const isFeriadoGroup = engId === 'FERIADO';
                  const title = isFeriadoGroup ? 'Feriados Nacionales de Ecuador 🇪🇨' : (eng?.name || 'Técnico');
                  const subtitle = isFeriadoGroup ? 'Días feriados obligatorios según calendario oficial' : eng?.specialty;
                  const emoji = isFeriadoGroup ? '🇪🇨' : (eng ? getEngineerEmoji(eng.id) : '👤');
                  const engVac = grouped[engId].sort((a, b) => b.startDate.localeCompare(a.startDate));
                  return (
                    <div key={engId} className={`border rounded-xl p-4 space-y-3 hover:shadow-xs transition-all ${isFeriadoGroup ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
                        <span className="text-base shrink-0">{emoji}</span>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-2xs leading-none">{title}</h4>
                          <p className="text-[10px] text-slate-500 mt-1 font-semibold">{subtitle}</p>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {engVac.map(vac => {
                          const duration = getVacationDuration(vac.startDate, vac.endDate, vac.includeWeekends);
                          const fmtDate = (d: string) => {
                            if (!d) return '—';
                            const [y, m, day] = d.split('-');
                            const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
                            return `${parseInt(day)} ${months[parseInt(m)-1]} ${y}`;
                          };
                          const taken = isVacationTaken(vac.endDate);

                          return (
                            <div key={vac.id} className="bg-white border border-slate-150 rounded-lg p-3 space-y-2 hover:shadow-3xs transition-shadow">
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="space-y-0.5">
                                    <p className="text-xs font-black text-slate-900 leading-tight">
                                      Desde: <span className="text-indigo-600">{fmtDate(vac.startDate)}</span>
                                    </p>
                                    <p className="text-xs font-black text-slate-900 leading-tight">
                                      Hasta: <span className="text-indigo-600">{fmtDate(vac.endDate)}</span>
                                    </p>
                                  </div>
                                  <span className="inline-block bg-slate-100 text-slate-600 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-slate-200">
                                    {duration} {duration === 1 ? 'día' : 'días'}{vac.includeWeekends === false ? ' (hab.)' : ''}
                                  </span>
                                </div>

                                <div className="flex flex-col items-end gap-1.5">
                                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border shrink-0 ${
                                    vac.status === 'Aprobado'
                                      ? (taken ? 'bg-amber-50 text-amber-805 border-amber-200' : 'bg-emerald-50 text-emerald-705 border-emerald-200')
                                      : vac.status === 'Rechazado'
                                      ? 'bg-red-50 text-red-700 border-red-200'
                                      : 'bg-amber-50 text-amber-805 border-amber-200'
                                  }`}>
                                    {vac.status === 'Aprobado' && taken ? 'Tomada' : vac.status}
                                  </span>

                                  {onDeleteVacation && (
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        if (window.confirm("¿Está seguro de que desea eliminar este registro?")) {
                                          await onDeleteVacation(vac.id);
                                        }
                                      }}
                                      className="text-red-500 hover:text-red-750 font-bold text-[9px] cursor-pointer"
                                    >
                                      Eliminar
                                    </button>
                                  )}
                                </div>
                              </div>

                              {vac.notes && vac.notes !== 'Programado por el Administrador' && vac.notes !== 'Solicitado por el Ingeniero' && (
                                <p className="text-3xs text-slate-500 bg-slate-50/50 border border-slate-150 p-2 rounded-md font-medium leading-relaxed italic">
                                  "{vac.notes}"
                                </p>
                              )}

                              {vac.status === 'Solicitado' && (
                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                  <button
                                    type="button"
                                    onClick={() => onUpdateVacation && onUpdateVacation({ ...vac, status: 'Aprobado' })}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] px-2 py-0.5 rounded cursor-pointer transition-colors flex items-center gap-0.5 shadow-3xs"
                                  >
                                    <Check className="w-2.5 h-2.5" />
                                    <span>Aprobar</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onUpdateVacation && onUpdateVacation({ ...vac, status: 'Rechazado' })}
                                    className="bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[9px] px-2 py-0.5 rounded border border-red-200 cursor-pointer transition-colors flex items-center gap-0.5"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                    <span>Rechazar</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">Auditor de Técnico Individual</h3>
              <p className="text-3xs text-slate-455 mt-0.5">Seleccione un técnico para auditar y registrar horas extra / permisos</p>
            </div>
            
            <select
              value={auditEngId}
              onChange={e => setAuditEngId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer font-bold"
            >
              <option value="">-- Seleccionar Técnico --</option>
              {engineers.map(e => (
                <option key={e.id} value={e.id}>{getEngineerEmoji(e.id)} {e.name}</option>
              ))}
            </select>

            {auditEngId ? (() => {
              const eng = engineers.find(e => e.id === auditEngId);
              if (!eng) return null;
              
              const engVacations = (vacations || []).filter(v => v.engineerId === eng.id);
              const approvedVacations = engVacations.filter(v => v.status === 'Aprobado');
              const taken = approvedVacations.reduce((sum, v) => sum + getVacationDuration(v.startDate, v.endDate, v.includeWeekends), 0);
              const quota = eng.annualVacationDays ?? 15;
              const pending = eng.pendingVacationsLastYear ?? 0;
              const standby = eng.standbyVacationsLastYear ?? 0;
              const birthday = eng.birthdayVacationDay !== undefined ? eng.birthdayVacationDay : 1;
              const years = getYearsInCompanyNum(eng.entryDate);
              const seniorityDays = Math.min(Math.max(Math.floor(years) - 5, 0), 15);
              
              const initialHours = (quota + pending + standby + seniorityDays + birthday) * 8;
              const vacationTakenHours = taken * 8;
              
              const engPermissions = (permissions || []).filter(p => p.engineerId === eng.id);
              const compHours = engPermissions.filter(p => p.type === 'Compensación').reduce((sum, p) => sum + Number(p.hours || 0), 0);
              const permHours = engPermissions.filter(p => p.type === 'Permiso').reduce((sum, p) => sum + Number(p.hours || 0), 0);
              
              const netAvailableHours = initialHours + compHours - vacationTakenHours - permHours;

              return (
                <div className="space-y-6 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-indigo-50/50 border border-indigo-150 p-3 rounded-xl">
                      <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider block">Saldo Vacaciones</span>
                      <span className="text-sm font-black font-mono mt-1 block text-slate-800">
                        {formatHoursToDays(netAvailableHours)}
                      </span>
                      <span className="text-4xs text-indigo-550 leading-none block mt-1 font-semibold">Neto disponible</span>
                    </div>
                    
                    <div className="bg-amber-50/50 border border-amber-150 p-3 rounded-xl">
                      <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider block">Bolsa de Horas</span>
                      <span className={`text-sm font-black font-mono mt-1 block ${compHours - permHours < 0 ? 'text-rose-650 animate-pulse' : 'text-emerald-700'}`}>
                        {formatHoursToDays(compHours - permHours)}
                      </span>
                      <span className="text-4xs text-amber-500 leading-none block mt-1 font-semibold">Horas a favor / contra</span>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 space-y-3.5">
                    <span className="text-[10px] font-extrabold text-slate-800 uppercase tracking-wider block">Registrar Permiso o Compensación</span>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="block text-4xs font-bold text-slate-450 uppercase">Tipo</label>
                        <select
                          value={permFormType}
                          onChange={e => setPermFormType(e.target.value as any)}
                          className="w-full p-1.5 rounded border border-slate-200 bg-white text-[10px] font-bold"
                        >
                          <option value="Permiso">🔴 Permiso (Descuenta)</option>
                          <option value="Compensación">🟢 Compensación (Suma)</option>
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
                        <label className="block text-4xs font-bold text-slate-455 uppercase flex items-center justify-between">
                          <span>Horas</span>
                          <button
                            type="button"
                            onClick={() => setPermFormHours(8)}
                            className="text-[7px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-1.5 py-0.5 rounded border border-indigo-200 font-extrabold cursor-pointer transition-colors"
                          >
                            Día Laboral (8h)
                          </button>
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={24}
                          value={permFormHours}
                          onChange={e => setPermFormHours(Math.max(1, parseInt(e.target.value) || 0))}
                          className="w-full p-1.5 rounded border border-slate-200 text-[10px] font-mono font-bold"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="block text-4xs font-bold text-slate-455 uppercase">Motivo / Descripción</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={permFormReason}
                            onChange={e => setPermFormReason(e.target.value)}
                            placeholder="Ej: Cita médica, Horas extra soporte..."
                            className="w-full p-1.5 rounded border border-slate-200 text-[10px] flex-1 focus:outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              if (!permFormDate || !permFormReason || !permFormHours) {
                                alert("Por favor rellene todos los campos (Fecha, Horas y Motivo)");
                                return;
                              }
                              const newPerm = {
                                id: 'PERM-' + Date.now(),
                                engineerId: eng.id,
                                date: permFormDate,
                                hours: permFormHours,
                                type: permFormType,
                                reason: permFormReason,
                                createdAt: new Date().toISOString()
                              };
                              if (onAddPermission) {
                                await onAddPermission(newPerm);
                                setPermFormDate('');
                                setPermFormReason('');
                                setPermFormHours(8);
                              }
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[9px] px-3.5 rounded-lg cursor-pointer transition-colors shadow-2xs shrink-0"
                          >
                            Registrar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Historial de Horas y Permisos</span>
                    {engPermissions.length === 0 ? (
                      <p className="text-4xs text-slate-450 italic text-center py-2">Sin registros de permisos o compensaciones.</p>
                    ) : (
                      <div className="max-h-40 overflow-y-auto space-y-1.5 divide-y divide-slate-100 pr-1">
                        {[...engPermissions]
                          .sort((a, b) => b.date.localeCompare(a.date))
                          .map(p => (
                            <div key={p.id} className="flex items-center justify-between text-[10px] py-1.5 bg-white px-2.5 rounded-md border border-slate-150 hover:shadow-3xs transition-shadow">
                              <div className="flex items-center gap-2">
                                <span className={`font-mono font-bold px-1.5 py-0.2 rounded text-[9px] ${
                                  p.type === 'Compensación' 
                                    ? 'bg-emerald-50 text-emerald-805 border-emerald-200' 
                                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                                }`}>
                                  {p.type === 'Compensación' 
                                    ? (p.hours === 8 ? '+1 día lab.' : `+${p.hours}h`) 
                                    : (p.hours === 8 ? '-1 día lab.' : `-${p.hours}h`)}
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
              );
            })() : (
              <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl text-slate-400 bg-slate-50/10">
                <p className="text-3xs font-extrabold uppercase">Sin técnico seleccionado</p>
                <p className="text-4xs text-slate-455 mt-1">Seleccione un técnico del dropdown para realizar auditorías</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 no-print" id="vacaciones-tab-root">
      {/* Summary Metrics Row */}
      {(() => {
        const todayDateStr = "2026-07-07";
        const activeTodayVacations = (vacations || []).filter(v => v.status === 'Aprobado' && v.startDate <= todayDateStr && v.endDate >= todayDateStr);
        const activeTodayCount = activeTodayVacations.length;
        
        const totalComp = (permissions || []).filter(p => p.type === 'Compensación').reduce((sum, p) => sum + Number(p.hours || 0), 0);
        const totalPerm = (permissions || []).filter(p => p.type === 'Permiso').reduce((sum, p) => sum + Number(p.hours || 0), 0);
        const netGlobalHours = totalComp - totalPerm;

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

            <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-xs">
              <div>
                <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Solicitudes Pendientes</span>
                <h3 className="text-2xl font-bold text-indigo-700 mt-1">{pendingRequestsCount}</h3>
                <p className="text-3xs text-slate-500 mt-1">Esperando revisión y aprobación</p>
              </div>
              <div className={`p-3 rounded-lg ${pendingRequestsCount > 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-500'}`}>
                <ClipboardList className="w-5 h-5" />
              </div>
            </div>

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

      {/* Vacation Sub Tabs Selector & Ecuador Holidays Loader */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex border border-slate-200 bg-slate-50/50 p-1.5 rounded-xl gap-2 w-fit">
          <button
            type="button"
            onClick={() => setVacationSubTab('saldos')}
            className={`px-4 py-1.5 rounded-lg font-extrabold text-2xs tracking-tight transition-all cursor-pointer flex items-center gap-1.5 ${
              vacationSubTab === 'saldos'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>📊 Resumen de Saldos</span>
          </button>
          <button
            type="button"
            onClick={() => setVacationSubTab('historial')}
            className={`px-4 py-1.5 rounded-lg font-extrabold text-2xs tracking-tight transition-all cursor-pointer flex items-center gap-1.5 ${
              vacationSubTab === 'historial'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>📋 Historial y Auditoría</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleLoadEcuadorHolidays}
          className="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
          title="Cargar automáticamente los feriados nacionales oficiales de Ecuador"
        >
          <span>🇪🇨 Auto-Cargar Feriados de Ecuador (2025-2026)</span>
        </button>
      </div>

      {vacationSubTab === 'saldos' ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">Control de Cupos de Vacaciones</h3>
                  <p className="text-3xs text-slate-455 mt-0.5">Defina los días anuales y vea el balance acumulado de cada ingeniero</p>
                </div>
                
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
                    <tr className="bg-slate-100/60 text-slate-400 text-[8px] font-black uppercase tracking-wide border-b border-slate-100 text-center select-none">
                      <th className="px-3 py-2 text-left">Ingeniero</th>
                      <th className="px-1 py-2 text-center leading-tight">Cupo<br/>Anual</th>
                      <th className="px-1 py-2 text-center leading-tight">Adic.<br/>Antigüed.</th>
                      <th className="px-1 py-2 text-center leading-tight">Pend.<br/>Año Ant.</th>
                      <th className="px-1 py-2 text-center leading-tight">Stand<br/>by</th>
                      <th className="px-1 py-2 text-center leading-tight">Día<br/>Cumpl.</th>
                      <th className="px-1 py-2 text-center leading-tight">Días<br/>Tomados</th>
                      <th className="px-1 py-2 text-center leading-tight">Bolsa<br/>Horas</th>
                      <th className="px-2 py-2 text-center leading-tight">Saldo<br/>Disponible</th>
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
                            <td colSpan={9} className="text-center p-8 text-slate-400 font-semibold italic">
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
                        const birthday = eng.birthdayVacationDay !== undefined ? eng.birthdayVacationDay : 1;
                        
                        const years = getYearsInCompanyNum(eng.entryDate);
                        const seniorityDays = Math.min(Math.max(Math.floor(years) - 5, 0), 15);
                        
                        const initialHours = (quota + pending + standby + seniorityDays + birthday) * 8;
                        const vacationTakenHours = taken * 8;
                        
                        const compHours = (permissions || []).filter(p => p.engineerId === eng.id && p.type === 'Compensación').reduce((sum, p) => sum + Number(p.hours || 0), 0);
                        const permHours = (permissions || []).filter(p => p.engineerId === eng.id && p.type === 'Permiso').reduce((sum, p) => sum + Number(p.hours || 0), 0);
                        
                        const netAvailableHours = initialHours + compHours - vacationTakenHours - permHours;

                        return (
                          <tr key={eng.id} className="hover:bg-slate-50/40 transition-all text-center">
                            <td 
                              className="px-3 py-2.5 cursor-pointer hover:bg-indigo-50/30 transition-colors group/row text-left"
                              onClick={() => setHistoryEngId(eng.id)}
                              title="Haga clic para ver el historial completo de vacaciones"
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm shrink-0 group-hover/row:scale-110 transition-transform">{getEngineerEmoji(eng.id)}</span>
                                <div>
                                  <p className="font-extrabold text-[11px] text-slate-900 group-hover/row:text-indigo-600 transition-colors flex items-center gap-1">
                                    <span>{eng.name}</span>
                                    <span className="text-[7px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1 rounded opacity-0 group-hover/row:opacity-100 transition-opacity">🌴</span>
                                  </p>
                                  <p className="text-[8px] text-slate-400 font-semibold truncate max-w-[130px]">{eng.specialty}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-1 py-2.5">
                              <div className="flex items-center justify-center">
                                <EditableNumberInput 
                                  value={quota} 
                                  onSave={(val) => onUpdateEngineer && onUpdateEngineer({ ...eng, annualVacationDays: val })} 
                                />
                              </div>
                            </td>
                            <td className="px-1 py-2.5 font-mono font-bold text-[10px] text-slate-600">
                              {seniorityDays}d
                            </td>
                            <td className="px-1 py-2.5">
                              <div className="flex items-center justify-center">
                                <EditableNumberInput 
                                  value={pending} 
                                  onSave={(val) => onUpdateEngineer && onUpdateEngineer({ ...eng, pendingVacationsLastYear: val })} 
                                />
                              </div>
                            </td>
                            <td className="px-1 py-2.5">
                              <div className="flex items-center justify-center">
                                <EditableNumberInput 
                                  value={standby} 
                                  onSave={(val) => onUpdateEngineer && onUpdateEngineer({ ...eng, standbyVacationsLastYear: val })} 
                                />
                              </div>
                            </td>
                            <td className="px-1 py-2.5">
                              <div className="flex items-center justify-center">
                                <EditableNumberInput 
                                  value={birthday} 
                                  onSave={(val) => onUpdateEngineer && onUpdateEngineer({ ...eng, birthdayVacationDay: val })} 
                                />
                              </div>
                            </td>
                            <td className="px-1 py-2.5 font-mono font-bold text-[10px] text-slate-600">
                              {taken}d
                            </td>
                            <td className="px-1 py-2.5 font-mono font-extrabold text-[10px]">
                              <span className={compHours - permHours < 0 ? 'text-rose-600' : 'text-emerald-700'}>
                                {formatHoursToDays(compHours - permHours)}
                              </span>
                            </td>
                            <td className="px-2 py-2.5 font-mono">
                              <span className={`font-bold px-1.5 py-0.5 rounded-full text-[9px] border ${
                                netAvailableHours < 0 
                                  ? 'bg-red-50 text-red-700 border-red-200' 
                                  : netAvailableHours === 0
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-teal-50 text-teal-700 border-teal-200'
                              }`}>
                                {formatHoursToDays(netAvailableHours)}
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

            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6">
              <h3 className="font-extrabold text-sm text-slate-900 tracking-tight mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>Programar Vacaciones Manualmente</span>
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1 relative">
                    <label className="block text-3xs font-bold text-slate-500 uppercase">Técnico</label>
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

                    {vacFormSearchOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => {
                            setVacFormSearchOpen(false);
                            setVacFormSearchQuery('');
                          }} 
                        />
                        
                        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-60 animate-in fade-in slide-in-from-top-1 duration-150">
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
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
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

                {schedulingConflicts.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-850 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                      <span className="font-extrabold text-2xs">⚠️ Alerta: Conflicto de Órdenes de Trabajo</span>
                    </div>
                    <p className="text-3xs font-semibold leading-normal">
                      Este técnico tiene <strong>{schedulingConflicts.length} orden(es) de trabajo</strong> asignadas en las fechas seleccionadas.
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

          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">Historial y Solicitudes</h3>
                <p className="text-3xs text-slate-450 mt-0.5">Revise las solicitudes de técnicos e historial general</p>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {(() => {
                  const grouped: Record<string, Vacation[]> = {};
                  (vacations || []).forEach(vac => {
                    if (!grouped[vac.engineerId]) {
                      grouped[vac.engineerId] = [];
                    }
                    grouped[vac.engineerId].push(vac);
                  });

                  const sortedGroupedKeys = Object.keys(grouped).sort((a, b) => {
                    const engA = engineers.find(e => e.id === a);
                    const engB = engineers.find(e => e.id === b);
                    const nameA = engA ? engA.name.toLowerCase() : '';
                    const nameB = engB ? engB.name.toLowerCase() : '';
                    return nameA.localeCompare(nameB);
                  });

                  if (sortedGroupedKeys.length === 0) {
                    return (
                      <div className="text-center py-8 text-slate-400">
                        <Palmtree className="w-8 h-8 mx-auto opacity-30 mb-2" />
                        <p className="text-3xs font-bold uppercase">Sin registros de vacaciones</p>
                      </div>
                    );
                  }

                  return sortedGroupedKeys.map(engId => {
                    const eng = engineers.find(e => e.id === engId);
                    const engVac = grouped[engId].sort((a, b) => b.startDate.localeCompare(a.startDate));
                    return (
                      <div key={engId} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                        <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200/50">
                          <span className="text-sm shrink-0">{eng ? getEngineerEmoji(eng.id) : '👤'}</span>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-3xs leading-none">{eng?.name || 'Técnico'}</h4>
                            <p className="text-[9px] text-slate-400 mt-0.5 font-semibold">{eng?.specialty}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {engVac.map(vac => {
                            const duration = getVacationDuration(vac.startDate, vac.endDate, vac.includeWeekends);
                            const fmtDate = (d: string) => {
                              if (!d) return '—';
                              const [y, m, day] = d.split('-');
                              const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
                              return `${parseInt(day)} ${months[parseInt(m)-1]} ${y}`;
                            };
                            const taken = isVacationTaken(vac.endDate);

                            return (
                              <div key={vac.id} className="bg-white border border-slate-150 rounded-lg p-2.5 space-y-2 hover:shadow-3xs transition-shadow">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="space-y-0.5">
                                    <p className="text-3xs font-black text-slate-900 leading-tight">
                                      Desde: <span className="text-indigo-600">{fmtDate(vac.startDate)}</span>
                                    </p>
                                    <p className="text-3xs font-black text-slate-900 leading-tight">
                                      Hasta: <span className="text-indigo-600">{fmtDate(vac.endDate)}</span>
                                    </p>
                                    <span className="inline-block bg-slate-100 text-slate-600 text-[8px] font-black px-1.5 py-0.2 rounded-full mt-1 border border-slate-200">
                                      {duration} {duration === 1 ? 'día' : 'días'}{vac.includeWeekends === false ? ' (hab.)' : ''}
                                    </span>
                                  </div>

                                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border shrink-0 ${
                                      vac.status === 'Aprobado'
                                        ? (taken ? 'bg-amber-50 text-amber-805 border-amber-200' : 'bg-emerald-50 text-emerald-705 border-emerald-200')
                                        : vac.status === 'Rechazado'
                                        ? 'bg-red-50 text-red-700 border-red-200'
                                        : 'bg-amber-50 text-amber-805 border-amber-200'
                                    }`}>
                                      {vac.status === 'Aprobado' && taken ? 'Tomada' : vac.status}
                                    </span>
                                    {onDeleteVacation && (
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          if (window.confirm(`¿Eliminar la vacación del ${fmtDate(vac.startDate)} al ${fmtDate(vac.endDate)}?`)) {
                                            await onDeleteVacation(vac.id);
                                          }
                                        }}
                                        className="text-red-500 hover:text-red-700 font-bold text-[9px] cursor-pointer flex items-center gap-0.5 hover:underline"
                                        title="Eliminar este registro de vacaciones"
                                      >
                                        🗑 Eliminar
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {vac.notes && vac.notes !== 'Programado por el Administrador' && vac.notes !== 'Solicitado por el Ingeniero' && (
                                  <p className="text-[8px] text-slate-500 bg-slate-50/50 p-1.5 rounded-md italic font-semibold leading-relaxed">
                                    "{vac.notes}"
                                  </p>
                                )}

                                {vac.status === 'Solicitado' && (
                                  <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-slate-100">
                                    <button
                                      type="button"
                                      onClick={() => onUpdateVacation && onUpdateVacation({ ...vac, status: 'Aprobado' })}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[8px] px-2 py-0.5 rounded cursor-pointer transition-colors flex items-center gap-0.5 shadow-3xs"
                                    >
                                      <Check className="w-2 h-2" />
                                      <span>Aprobar</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => onUpdateVacation && onUpdateVacation({ ...vac, status: 'Rechazado' })}
                                      className="bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[8px] px-2 py-0.5 rounded border border-red-200 cursor-pointer transition-colors flex items-center gap-0.5"
                                    >
                                      <X className="w-2 h-2" />
                                      <span>Rechazar</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </div>
      ) : renderHistorialSubTab()}

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
                <div className="absolute inset-0 cursor-pointer bg-slate-900/40" onClick={() => setHistoryEngId(null)} />

                <motion.div
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.96, opacity: 0 }}
                  className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden z-50 border border-slate-200 flex flex-col max-h-[90vh]"
                >
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getEngineerEmoji(eng.id)}</span>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                          Historial de Vacaciones — {eng.name}
                        </h3>
                        <p className="text-3xs text-slate-455 mt-0.5 font-semibold">
                          {eng.specialty} • Visualizando balance e historial completo
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

                  <div className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
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

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                      <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Cupo Anual</span>
                        <span className="text-sm font-black text-slate-800 font-mono mt-1 block">{quota} días</span>
                      </div>
                      <div className="bg-teal-50/50 border border-teal-150 p-3 rounded-xl">
                        <span className="text-[9px] font-bold text-teal-600 uppercase tracking-wider block">Días Tomados</span>
                        <span className="text-sm font-black text-teal-700 font-mono mt-1 block">{taken} días</span>
                      </div>
                      <div className="bg-amber-50/50 border border-amber-150 p-3 rounded-xl">
                        <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider block">Bolsa de Horas</span>
                        <span className={`text-sm font-black font-mono mt-1 block ${compHours - permHours < 0 ? 'text-rose-650 animate-pulse' : 'text-emerald-700'}`}>
                          {compHours - permHours >= 0 ? `+${compHours - permHours}h` : `${compHours - permHours}h`}
                        </span>
                      </div>
                      <div className="bg-indigo-50/50 border border-indigo-150 p-3 rounded-xl">
                        <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider block">Saldo Neto</span>
                        <span className={`text-sm font-black font-mono mt-1 block ${netAvailableHours < 0 ? 'text-rose-600' : 'text-indigo-705'}`}>
                          {netDays}d y {netRemHours}h
                        </span>
                      </div>
                    </div>

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
                          className="w-3.5 h-3.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
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

                    <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-4 shadow-3xs">
                      <h4 className="font-extrabold text-2xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Bolsa de Horas de Trabajo y Permisos (Compensaciones)</span>
                      </h4>

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
                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                        : 'bg-rose-50 text-rose-800 border border-rose-200'
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

                                    {onDeleteVacation && (
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          if (window.confirm(`¿Eliminar el registro del ${fmtDate(vac.startDate)} al ${fmtDate(vac.endDate)}?`)) {
                                            await onDeleteVacation(vac.id);
                                          }
                                        }}
                                        className="text-red-400 hover:text-red-700 font-bold text-[9px] cursor-pointer flex items-center gap-0.5 hover:underline"
                                        title="Eliminar este registro de vacaciones"
                                      >
                                        🗑 Eliminar
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>

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
