import React, { useState } from 'react';
import { FileSpreadsheet, Download, Database, Plus, Trash2, Search, Pencil } from 'lucide-react';
import { MaintenanceRegistry, WorkOrder, Client, Engineer } from '../../types';

interface RegistroTabProps {
  maintenanceRegistries: MaintenanceRegistry[];
  workOrders: WorkOrder[];
  clients: Client[];
  engineers: Engineer[];
  userRole: string;
  isRegistryImporterOpen: boolean;
  setIsRegistryImporterOpen: (open: boolean) => void;
  handleRegistryCsvUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  registryCsvSuccess: string | null;
  setRegistryCsvSuccess: (msg: string | null) => void;
  registryCsvError: string | null;
  setRegistryCsvError: (msg: string | null) => void;
  onClearMaintenanceRegistries?: () => void;
  onDeleteMaintenanceRegistry?: (id: string) => void;
  setEditingRegistry: (reg: MaintenanceRegistry | null) => void;
  setRegFormInstitutionName: (val: string) => void;
  setRegFormEqBrand: (val: string) => void;
  setRegFormEqModel: (val: string) => void;
  setRegFormEqSerial: (val: string) => void;
  setRegFormTuboBrand: (val: string) => void;
  setRegFormTuboModel: (val: string) => void;
  setRegFormTuboSerial: (val: string) => void;
  setRegFormFecha: (val: string) => void;
  setRegFormResponsable: (val: string) => void;
  setIsRegistryModalOpen: (open: boolean) => void;
  findBestEquipmentMatch: (institutionName: string, equipmentName: string) => any;
}

export const RegistroTab: React.FC<RegistroTabProps> = ({
  maintenanceRegistries,
  workOrders,
  clients,
  engineers,
  userRole,
  isRegistryImporterOpen,
  setIsRegistryImporterOpen,
  handleRegistryCsvUpload,
  registryCsvSuccess,
  setRegistryCsvSuccess,
  registryCsvError,
  setRegistryCsvError,
  onClearMaintenanceRegistries,
  onDeleteMaintenanceRegistry,
  setEditingRegistry,
  setRegFormInstitutionName,
  setRegFormEqBrand,
  setRegFormEqModel,
  setRegFormEqSerial,
  setRegFormTuboBrand,
  setRegFormTuboModel,
  setRegFormTuboSerial,
  setRegFormFecha,
  setRegFormResponsable,
  setIsRegistryModalOpen,
  findBestEquipmentMatch,
}) => {
  const [registrySearch, setRegistrySearch] = useState('');
  const [registryPage, setRegistryPage] = useState(1);
  const [registrySortField, setRegistrySortField] = useState<'fecha' | 'institution' | 'responsable' | 'equipment'>('fecha');
  const [registrySortDir, setRegistrySortDir] = useState<'asc' | 'desc'>('desc');

  const getEffectiveRegistryFields = (reg: MaintenanceRegistry) => {
    let institutionName = (reg.institutionName || '').trim();
    let eqBrand = (reg.eqBrand || '').trim();
    let eqModel = (reg.eqModel || '').trim();
    let eqSerial = (reg.eqSerial || '').trim();
    let tuboBrand = (reg.tuboBrand || '').trim();
    let tuboModel = (reg.tuboModel || '').trim();
    let tuboSerial = (reg.tuboSerial || '').trim();
    let fecha = (reg.fecha || '').trim();
    let responsable = (reg.responsable || '').trim();

    if (reg.workOrderId) {
      const wo = workOrders.find(w => w.id === reg.workOrderId);
      if (wo) {
        const client = clients.find(c => c.id === wo.clientId || c.name.trim().toLowerCase() === (wo.clientId || '').trim().toLowerCase());
        if (client) {
          institutionName = client.name;
        }
        if (wo.plannedDate) {
          fecha = wo.plannedDate;
        }
        if (wo.engineerId) {
          const eng = engineers.find(e => e.id === wo.engineerId);
          if (eng) responsable = eng.name;
        }
        if (wo.equipmentName) {
          const matchedEq = findBestEquipmentMatch(institutionName || client?.name || '', wo.equipmentName);
          if (matchedEq && matchedEq.eqModel) {
            eqBrand = matchedEq.eqBrand && matchedEq.eqBrand !== '-' ? matchedEq.eqBrand : eqBrand;
            eqModel = matchedEq.eqModel;
            if (matchedEq.eqSerial && matchedEq.eqSerial !== '-') eqSerial = matchedEq.eqSerial;
            if (matchedEq.tuboBrand && matchedEq.tuboBrand !== '-') tuboBrand = matchedEq.tuboBrand;
            if (matchedEq.tuboModel && matchedEq.tuboModel !== '-') tuboModel = matchedEq.tuboModel;
            if (matchedEq.tuboSerial && matchedEq.tuboSerial !== '-') tuboSerial = matchedEq.tuboSerial;
          } else {
            eqModel = wo.equipmentName;
          }
        }
      }
    }

    if (institutionName.includes(';')) {
      const parts = institutionName.split(';').map(p => p.trim()).filter(Boolean);
      if (parts.length >= 3) {
        const isPart1Date = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|ene|abr|ago|dic|\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})\b/i.test(parts[1]);
        if (isPart1Date) {
          if (!eqSerial || eqSerial === '-') eqSerial = parts[0];
          if (!fecha || fecha === '-') fecha = parts[1];
          if (parts[2]) institutionName = parts[2];
          if (parts[3] && (!responsable || responsable === '-')) responsable = parts[3];
        } else {
          institutionName = parts[parts.length - 1] || parts[0];
        }
      } else if (parts.length === 2) {
        institutionName = parts[0];
        if (!responsable || responsable === '-') responsable = parts[1];
      }
    }

    return {
      ...reg,
      institutionName: institutionName || '-',
      eqBrand: eqBrand || '-',
      eqModel: eqModel || '-',
      eqSerial: eqSerial || '-',
      tuboBrand: tuboBrand || '-',
      tuboModel: tuboModel || '-',
      tuboSerial: tuboSerial || '-',
      fecha: fecha || '-',
      responsable: responsable || '-'
    };
  };

  const parseRegistryDateMs = (dateStr: string): number => {
    if (!dateStr || dateStr === '-' || dateStr.trim() === '') return 0;
    const str = dateStr.trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
      const time = new Date(str + (str.length === 10 ? 'T00:00:00' : '')).getTime();
      if (!isNaN(time)) return time;
    }

    const monthMap: Record<string, number> = {
      jan: 0, ene: 0, feb: 1, mar: 2, apr: 3, abr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, ago: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11, dic: 11
    };

    const parts = str.split(/[/.\s-]+/);
    if (parts.length >= 3) {
      const p0 = parseInt(parts[0], 10);
      const p2 = parseInt(parts[2], 10);
      if (!isNaN(p0) && !isNaN(p2)) {
        const mStr = parts[1].toLowerCase().slice(0, 4);
        let monthIdx = -1;

        if (monthMap[mStr] !== undefined) {
          monthIdx = monthMap[mStr];
        } else {
          const p1 = parseInt(parts[1], 10);
          if (!isNaN(p1) && p1 >= 1 && p1 <= 12) monthIdx = p1 - 1;
        }

        if (monthIdx >= 0) {
          const year = p2 < 100 ? (p2 > 50 ? 1900 + p2 : 2000 + p2) : p2;
          const day = p0;
          const d = new Date(year, monthIdx, day);
          if (!isNaN(d.getTime())) return d.getTime();
        }
      }
    }

    const fallback = new Date(str).getTime();
    return isNaN(fallback) ? 0 : fallback;
  };

  const handleExportRegistryExcel = (itemsToExport: MaintenanceRegistry[]) => {
    if (!itemsToExport || itemsToExport.length === 0) {
      alert("No hay registros para exportar.");
      return;
    }
    const headers = [
      'ID Registro',
      'Nombre de Persona o Institucion',
      'Equipo Marca',
      'Equipo Modelo',
      'Equipo Serie',
      'Tubo de Rayos X Marca',
      'Tubo de Rayos X Modelo',
      'Tubo de Rayos X Serie',
      'Fecha',
      'Responsable',
      'ID Orden Trabajo'
    ];

    const rows = itemsToExport.map(r => [
      `"${(r.id || '').replace(/"/g, '""')}"`,
      `"${(r.institutionName || '').replace(/"/g, '""')}"`,
      `"${(r.eqBrand || '').replace(/"/g, '""')}"`,
      `"${(r.eqModel || '').replace(/"/g, '""')}"`,
      `"${(r.eqSerial || '').replace(/"/g, '""')}"`,
      `"${(r.tuboBrand || '').replace(/"/g, '""')}"`,
      `"${(r.tuboModel || '').replace(/"/g, '""')}"`,
      `"${(r.tuboSerial || '').replace(/"/g, '""')}"`,
      `"${(r.fecha || '').replace(/"/g, '""')}"`,
      `"${(r.responsable || '').replace(/"/g, '""')}"`,
      `"${(r.workOrderId || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(';'), ...rows.map(row => row.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateTag = new Date().toISOString().split('T')[0];
    a.download = `Registro_Equipos_MTO_${dateTag}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const query = registrySearch.toLowerCase().trim();

  const virtualRegistriesFromWorkOrders = workOrders
    .filter(wo => (wo.status === 'Realizado' || wo.status === 'Conciliado') && !(maintenanceRegistries || []).some(reg => reg.workOrderId === wo.id))
    .map(wo => {
      const client = clients.find(c => c.id === wo.clientId || c.name.trim().toLowerCase() === (wo.clientId || '').trim().toLowerCase());
      const eng = engineers.find(e => e.id === wo.engineerId);
      const instName = client ? client.name : (wo.clientId && wo.clientId !== 'fsm_placeholder' ? wo.clientId : 'S/N Institución');
      const eqName = wo.equipmentName || '';
      
      const matchedEq = findBestEquipmentMatch(instName, eqName);

      let brand = matchedEq?.eqBrand || '-';
      let model = matchedEq?.eqModel || eqName || '-';
      let serial = matchedEq?.eqSerial || '-';
      let tBrand = matchedEq?.tuboBrand || '-';
      let tModel = matchedEq?.tuboModel || '-';
      let tSerial = matchedEq?.tuboSerial || '-';

      if (!brand || brand === '-' || !serial || serial === '-') {
        const serialMatch = eqName.match(/\(([^)]+)\)/);
        if (serialMatch) serial = serialMatch[1];
      }

      const virtReg: MaintenanceRegistry = {
        id: `VIRT-REG-${wo.id}`,
        institutionName: instName,
        eqBrand: brand,
        eqModel: model,
        eqSerial: serial,
        tuboBrand: tBrand,
        tuboModel: tModel,
        tuboSerial: tSerial,
        fecha: wo.plannedDate || new Date().toISOString().split('T')[0],
        responsable: eng ? eng.name : 'S/N Responsable',
        createdAt: new Date().toISOString(),
        workOrderId: wo.id,
      };
      return getEffectiveRegistryFields(virtReg);
    });

  const effectiveRegistries = [
    ...(maintenanceRegistries || []).map(getEffectiveRegistryFields),
    ...virtualRegistriesFromWorkOrders
  ];

  const filtered = effectiveRegistries.filter(reg => {
    if (!query) return true;
    return (
      reg.institutionName.toLowerCase().includes(query) ||
      reg.eqBrand.toLowerCase().includes(query) ||
      reg.eqModel.toLowerCase().includes(query) ||
      reg.eqSerial.toLowerCase().includes(query) ||
      reg.tuboBrand.toLowerCase().includes(query) ||
      reg.tuboModel.toLowerCase().includes(query) ||
      reg.tuboSerial.toLowerCase().includes(query) ||
      reg.fecha.toLowerCase().includes(query) ||
      reg.responsable.toLowerCase().includes(query)
    );
  }).sort((a, b) => {
    if (registrySortField === 'fecha') {
      const timeA = parseRegistryDateMs(a.fecha);
      const timeB = parseRegistryDateMs(b.fecha);
      if (timeA === 0 && timeB === 0) return 0;
      if (timeA === 0) return 1;
      if (timeB === 0) return -1;
      return registrySortDir === 'asc' ? timeA - timeB : timeB - timeA;
    }

    if (registrySortField === 'institution') {
      const valA = a.institutionName.trim();
      const valB = b.institutionName.trim();
      const isDashA = !valA || valA === '-';
      const isDashB = !valB || valB === '-';
      if (isDashA && isDashB) return 0;
      if (isDashA) return 1;
      if (isDashB) return -1;
      const cmp = valA.localeCompare(valB, 'es', { sensitivity: 'base', numeric: true });
      return registrySortDir === 'asc' ? cmp : -cmp;
    }

    if (registrySortField === 'responsable') {
      const valA = a.responsable.trim();
      const valB = b.responsable.trim();
      const isDashA = !valA || valA === '-';
      const isDashB = !valB || valB === '-';
      if (isDashA && isDashB) return 0;
      if (isDashA) return 1;
      if (isDashB) return -1;
      const cmp = valA.localeCompare(valB, 'es', { sensitivity: 'base', numeric: true });
      return registrySortDir === 'asc' ? cmp : -cmp;
    }

    if (registrySortField === 'equipment') {
      const eqA = `${a.eqBrand !== '-' ? a.eqBrand : ''} ${a.eqModel !== '-' ? a.eqModel : ''} ${a.eqSerial !== '-' ? a.eqSerial : ''}`.trim();
      const eqB = `${b.eqBrand !== '-' ? b.eqBrand : ''} ${b.eqModel !== '-' ? b.eqModel : ''} ${b.eqSerial !== '-' ? b.eqSerial : ''}`.trim();
      const isDashA = !eqA;
      const isDashB = !eqB;
      if (isDashA && isDashB) return 0;
      if (isDashA) return 1;
      if (isDashB) return -1;
      const cmp = eqA.localeCompare(eqB, 'es', { sensitivity: 'base', numeric: true });
      return registrySortDir === 'asc' ? cmp : -cmp;
    }

    return 0;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((registryPage - 1) * itemsPerPage, registryPage * itemsPerPage);

  return (
    <div className="space-y-6 font-sans">
      {/* Header Block */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
        <div>
          <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-pink-500" />
            Registro de Equipos de Mantenimiento
          </h4>
          <p className="text-3xs text-slate-500 mt-0.5 font-medium">Administra y registra las instituciones, marcas, modelos y tubos de rayos X a los que se realiza soporte.</p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => handleExportRegistryExcel(filtered)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-3xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs border border-emerald-600 transition-colors"
            title="Exportar todos los registros filtrados a formato Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>📊 Exportar Excel</span>
          </button>
          {userRole === 'admin' && (
            <button
              onClick={() => setIsRegistryImporterOpen(!isRegistryImporterOpen)}
              className={`font-semibold text-3xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 border transition-all cursor-pointer ${
                isRegistryImporterOpen
                  ? 'bg-amber-600 border-amber-600 text-white'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isRegistryImporterOpen ? 'Ocultar Ingestor' : '📥 Importar CSV'}</span>
            </button>
          )}
          <button
            onClick={() => {
              setEditingRegistry(null);
              setRegFormInstitutionName('');
              setRegFormEqBrand('FUJIFILM');
              setRegFormEqModel('');
              setRegFormEqSerial('');
              setRegFormTuboBrand('FUJIFILM');
              setRegFormTuboModel('');
              setRegFormTuboSerial('');
              setRegFormFecha('');
              setRegFormResponsable('');
              setIsRegistryModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-3xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs border border-indigo-600 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Registro</span>
          </button>
        </div>
      </div>

      {/* CSV Importer Panel */}
      {isRegistryImporterOpen && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-2 flex flex-wrap justify-between items-center gap-2">
            <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Database className="w-4 h-4 text-indigo-500" />
              <span>Ingestor de Registros de Mantenimiento (CSV)</span>
            </h5>
            <div className="flex gap-3 text-[10px] font-bold">
              <button
                onClick={() => {
                  const headers = [
                    'Nombre de Persona o Institucion',
                    'Equipo Marca',
                    'Equipo Modelo',
                    'Equipo Serie',
                    'Tubo de Rayos X Marca',
                    'Tubo de Rayos X Modelo',
                    'Tubo de Rayos X Serie',
                    'Fecha',
                    'Responsable'
                  ];
                  const sample = [
                    'HOSP. ENRIQUE GARCES',
                    'FUJIFILM',
                    'FCR GO',
                    '26830304',
                    'FUJIFILM',
                    'M-5CE-31',
                    'KC 11834201',
                    '2/Apr/2014',
                    'SIXTO CALDERON'
                  ];
                  const csv = "\uFEFF" + [headers.join(';'), sample.join(';')].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'plantilla_registro_mantenimiento.csv';
                  a.click();
                }}
                className="text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
              >
                📥 Descargar Plantilla CSV
              </button>
            </div>
          </div>
          <div className="text-3xs text-slate-500 font-medium leading-relaxed">
            <p>El archivo debe ser un CSV separado por comas o punto y coma. Se detectarán automáticamente los encabezados correspondientes.</p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <input
                type="file"
                accept=".csv"
                onChange={handleRegistryCsvUpload}
                className="block text-3xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-3xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 file:cursor-pointer hover:file:bg-indigo-100 transition-all"
              />
              {onClearMaintenanceRegistries && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("¿Está seguro de que desea eliminar todos los registros de mantenimiento? Esta acción es irreversible.")) {
                      onClearMaintenanceRegistries();
                      setRegistryCsvSuccess(null);
                      setRegistryCsvError(null);
                    }
                  }}
                  className="text-[10px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar todos los Registros</span>
                </button>
              )}
            </div>

            {registryCsvSuccess && (
              <div className="text-3xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-150 p-2.5 rounded-lg">
                {registryCsvSuccess}
              </div>
            )}
            {registryCsvError && (
              <div className="text-3xs font-bold text-rose-700 bg-rose-50 border border-rose-150 p-2.5 rounded-lg">
                {registryCsvError}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search & Grid Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar por institución, marca, modelo, serie o responsable..."
            value={registrySearch}
            onChange={(e) => {
              setRegistrySearch(e.target.value);
              setRegistryPage(1);
            }}
            className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-4 py-1.5 text-xs font-semibold text-slate-700 outline-hidden focus:ring-1 focus:ring-indigo-500 placeholder-slate-400"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Sorting controls */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs">
            <span className="text-3xs text-slate-400 font-bold uppercase shrink-0">Ordenar por:</span>
            <select
              value={registrySortField}
              onChange={e => {
                setRegistrySortField(e.target.value as any);
                setRegistryPage(1);
              }}
              className="bg-transparent text-xs font-bold text-slate-800 outline-hidden cursor-pointer"
            >
              <option value="fecha">📅 Fecha</option>
              <option value="institution">🏢 Institución / Cliente (A-Z)</option>
              <option value="responsable">👤 Responsable (A-Z)</option>
              <option value="equipment">⚙️ Equipo (A-Z)</option>
            </select>
            <button
              type="button"
              onClick={() => setRegistrySortDir(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="ml-1 px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-indigo-700 font-extrabold text-3xs rounded cursor-pointer transition-colors border border-slate-200 flex items-center gap-1"
              title={registrySortDir === 'asc' ? "Orden Ascendente (A-Z / Antiguos primero)" : "Orden Descendente (Z-A / Recientes primero)"}
            >
              <span>{registrySortDir === 'asc' ? '⬆️ Asc (A-Z)' : '⬇️ Desc (Z-A)'}</span>
            </button>
          </div>

          <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider">{filtered.length} registros encontrados</span>
        </div>
      </div>

      {/* Registries Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left border-collapse text-[10.5px] font-semibold text-slate-655">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-3xs font-bold uppercase text-slate-400 tracking-wider select-none">
                <th
                  onClick={() => {
                    if (registrySortField === 'institution') setRegistrySortDir(d => d === 'asc' ? 'desc' : 'asc');
                    else { setRegistrySortField('institution'); setRegistrySortDir('asc'); }
                  }}
                  className="p-3 cursor-pointer hover:bg-slate-100/80 transition-colors"
                  title="Haga clic para ordenar por Nombre de Institución"
                >
                  <div className="flex items-center gap-1">
                    <span>Nombre de Persona o Institución</span>
                    {registrySortField === 'institution' && (
                      <span className="text-indigo-600 font-black">{registrySortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => {
                    if (registrySortField === 'equipment') setRegistrySortDir(d => d === 'asc' ? 'desc' : 'asc');
                    else { setRegistrySortField('equipment'); setRegistrySortDir('asc'); }
                  }}
                  className="p-3 cursor-pointer hover:bg-slate-100/80 transition-colors"
                  title="Haga clic para ordenar por Equipo"
                >
                  <div className="flex items-center gap-1">
                    <span>Equipo (Marca / Modelo / Serie)</span>
                    {registrySortField === 'equipment' && (
                      <span className="text-indigo-600 font-black">{registrySortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="p-3">Tubo de Rayos X (Marca / Modelo / Serie)</th>
                <th
                  onClick={() => {
                    if (registrySortField === 'fecha') setRegistrySortDir(d => d === 'asc' ? 'desc' : 'asc');
                    else { setRegistrySortField('fecha'); setRegistrySortDir('desc'); }
                  }}
                  className="p-3 text-center cursor-pointer hover:bg-slate-100/80 transition-colors"
                  title="Haga clic para ordenar por Fecha"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Fecha</span>
                    {registrySortField === 'fecha' && (
                      <span className="text-indigo-600 font-black">{registrySortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => {
                    if (registrySortField === 'responsable') setRegistrySortDir(d => d === 'asc' ? 'desc' : 'asc');
                    else { setRegistrySortField('responsable'); setRegistrySortDir('asc'); }
                  }}
                  className="p-3 cursor-pointer hover:bg-slate-100/80 transition-colors"
                  title="Haga clic para ordenar por Responsable"
                >
                  <div className="flex items-center gap-1">
                    <span>Responsable</span>
                    {registrySortField === 'responsable' && (
                      <span className="text-indigo-600 font-black">{registrySortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-3xs font-bold">
                    No se encontraron registros de mantenimiento.
                  </td>
                </tr>
              ) : (
                paginated.map(reg => (
                  <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 text-slate-900 font-bold text-[11.5px] max-w-[200px]" title={reg.institutionName}>
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="truncate">{reg.institutionName}</span>
                        {reg.workOrderId && (
                          <span className="shrink-0 text-[8px] font-extrabold bg-sky-100 text-sky-700 border border-sky-200 px-1.5 py-0.5 rounded-full uppercase tracking-wide" title={`Origen: Orden de trabajo ${reg.workOrderId}`}>
                            📅 OT
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-800 font-bold">{reg.eqBrand}</span>
                        <span className="text-slate-500 text-3xs">{reg.eqModel} <span className="text-slate-400 font-mono">({reg.eqSerial})</span></span>
                      </div>
                    </td>
                    <td className="p-3">
                      {reg.tuboBrand !== '-' ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-slate-800 font-bold">{reg.tuboBrand}</span>
                          <span className="text-slate-500 text-3xs">{reg.tuboModel} <span className="text-slate-400 font-mono">({reg.tuboSerial})</span></span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-mono">-</span>
                      )}
                    </td>
                    <td className="p-3 text-center text-slate-700 font-mono">
                      {reg.fecha}
                    </td>
                    <td className="p-3 text-indigo-700 font-bold">
                      {reg.responsable}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingRegistry(reg);
                            setRegFormInstitutionName(reg.institutionName !== '-' ? reg.institutionName : '');
                            setRegFormEqBrand(reg.eqBrand !== '-' ? reg.eqBrand : '');
                            setRegFormEqModel(reg.eqModel !== '-' ? reg.eqModel : '');
                            setRegFormEqSerial(reg.eqSerial !== '-' ? reg.eqSerial : '');
                            setRegFormTuboBrand(reg.tuboBrand !== '-' ? reg.tuboBrand : '');
                            setRegFormTuboModel(reg.tuboModel !== '-' ? reg.tuboModel : '');
                            setRegFormTuboSerial(reg.tuboSerial !== '-' ? reg.tuboSerial : '');
                            setRegFormFecha(reg.fecha !== '-' ? reg.fecha : '');
                            setRegFormResponsable(reg.responsable !== '-' ? reg.responsable : '');
                            setIsRegistryModalOpen(true);
                          }}
                          className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors border border-indigo-200 cursor-pointer text-3xs font-bold flex items-center gap-1"
                          title="Editar este registro de mantenimiento"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Editar</span>
                        </button>
                        {onDeleteMaintenanceRegistry && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`¿Eliminar el registro de ${reg.institutionName}?`)) {
                                onDeleteMaintenanceRegistry(reg.id);
                              }
                            }}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors border border-rose-200 cursor-pointer text-3xs font-bold flex items-center gap-1"
                            title="Eliminar este registro"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100">
            <span className="text-3xs font-bold text-slate-400 uppercase">Página {registryPage} de {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={registryPage === 1}
                onClick={() => setRegistryPage(p => Math.max(p - 1, 1))}
                className="px-2.5 py-1 text-3xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                disabled={registryPage === totalPages}
                onClick={() => setRegistryPage(p => Math.min(p + 1, totalPages))}
                className="px-2.5 py-1 text-3xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
