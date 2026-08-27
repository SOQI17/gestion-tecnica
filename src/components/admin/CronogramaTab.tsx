import React from 'react';
import { Calendar as CalendarIcon, Search, Printer } from 'lucide-react';
import { Engineer, WorkOrder, Client } from '../../types';

interface CronogramaTabProps {
  calendarMonth: number;
  setCalendarMonth: (m: number) => void;
  calendarYear: number;
  setCalendarYear: (y: number) => void;
  highlightedEngineerId: string | null;
  setHighlightedEngineerId: (id: string | null) => void;
  engineers: Engineer[];
  getEngineerEmoji: (id: string) => string;
  handlePrintCalendar: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  calendarDays: any[];
  calendarMonthName: string;
  workOrders: WorkOrder[];
  clients: Client[];
  getEngineerColorClasses: (id: string) => any;
  matchesSearch: (wo: WorkOrder) => boolean;
  setInfoWO: (wo: WorkOrder | null) => void;
}

export const CronogramaTab: React.FC<CronogramaTabProps> = ({
  calendarMonth,
  setCalendarMonth,
  calendarYear,
  setCalendarYear,
  highlightedEngineerId,
  setHighlightedEngineerId,
  engineers,
  getEngineerEmoji,
  handlePrintCalendar,
  searchQuery,
  setSearchQuery,
  calendarDays,
  calendarMonthName,
  workOrders,
  clients,
  getEngineerColorClasses,
  matchesSearch,
  setInfoWO,
}) => {
  return (
    <div className="space-y-4 font-sans relative" id="cronograma-standalone-view">
      <div id="printable-calendar" className="space-y-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        {/* Standalone Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-indigo-50 border border-indigo-100 p-4 rounded-xl gap-4 no-print">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600" />
            <div>
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2 flex-wrap">
                <span>Cronograma Mensual Oficial -</span>
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

                  <div className="flex items-center gap-1.5 ml-2 no-print">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Ingeniero:</span>
                    <select
                      value={highlightedEngineerId || ''}
                      onChange={(e) => setHighlightedEngineerId(e.target.value || null)}
                      className="bg-white border border-indigo-200 rounded px-2 py-0.5 text-xs font-extrabold text-indigo-900 cursor-pointer outline-hidden focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">Todos 👥</option>
                      {engineers.map(e => (
                        <option key={e.id} value={e.id}>
                          {getEngineerEmoji(e.id)} {e.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </h4>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end no-print">
            <button
              type="button"
              onClick={handlePrintCalendar}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              title="Imprimir calendario a PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Imprimir PDF</span>
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar en calendario..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-indigo-200 rounded-lg pl-8 pr-7 py-1 text-xs font-semibold text-slate-700 outline-hidden focus:ring-1 focus:ring-indigo-500 placeholder-slate-400 w-48 transition-all"
              />
              <Search className="w-3.5 h-3.5 text-indigo-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Standalone Calendar Grid split by weeks */}
        {(() => {
          const paddedDays = calendarDays;
          const weeks = [];
          for (let i = 0; i < paddedDays.length; i += 7) {
            weeks.push(paddedDays.slice(i, i + 7));
          }

          return (
            <div className="space-y-2 print:space-y-0 calendar-weeks-wrapper">
              <div className="grid grid-cols-7 gap-0 print:hidden text-center mb-1">
                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(dayName => (
                  <div key={dayName} className="font-bold text-3xs text-slate-400 uppercase py-1.5">
                    {dayName}
                  </div>
                ))}
              </div>

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

                const shouldBreakAfter = false;
                return (
                  <div key={wIndex} style={{ display: 'flex', flexDirection: 'column' }} className={`calendar-week-container bg-white rounded-xl border border-slate-200 mb-4 overflow-hidden shadow-2xs print:mb-6 print:border-slate-200 ${shouldBreakAfter ? 'print-break-after' : ''}`}>
                    <div className="hidden print:flex justify-between items-center p-2.5 pb-1 border-b border-slate-200 bg-indigo-50/20">
                      <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                        Cronograma Mensual - {calendarMonthName} {calendarYear}
                      </span>
                      <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider">
                        Semana {wIndex + 1}
                      </span>
                    </div>

                    <div className="hidden print:grid grid-cols-7 gap-0 border-b border-slate-200 text-center font-bold text-[8px] uppercase py-0.5 bg-slate-50">
                      {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(dayName => (
                        <div key={dayName} className="text-slate-500 py-1">
                          {dayName}
                        </div>
                      ))}
                    </div>

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
                                    ? 'bg-red-50 text-red-955 border border-red-205 border-l-4 border-l-red-500'
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setInfoWO(wo);
                                  }}
                                  style={{ gridColumn: `${colStart} / span ${colSpan}` }}
                                  className={`h-7 px-2 mx-1 flex items-center justify-between text-[9px] font-bold select-none cursor-pointer transition-all shadow-3xs ${pillStyle} ${roundedClass}`}
                                >
                                  <div className="flex items-center gap-1.5 truncate flex-1 mr-1">
                                    <span className="shrink-0">{eng ? getEngineerEmoji(eng.id) : '👤'}</span>
                                    <span className="truncate text-slate-800 uppercase tracking-wide">
                                      {client?.name || 'Cliente'} - {wo.equipmentName}
                                    </span>
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
  );
};
