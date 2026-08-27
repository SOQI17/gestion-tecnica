import React, { useState } from 'react';
import { Cpu, Database, Plus, Search, Building, ShieldCheck, Zap } from 'lucide-react';
import { Equipment, Client } from '../../types';

interface EquiposTabProps {
  equipments: Equipment[];
  clients: Client[];
  userRole: string;
  isEquipImporterOpen: boolean;
  setIsEquipImporterOpen: (open: boolean) => void;
  handleEquipCsvUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  equipCsvSuccess: string | null;
  equipCsvError: string | null;
  setEditingEquip: (equip: Equipment | null) => void;
  setEquipFormId: (id: string) => void;
  setEquipFormName: (name: string) => void;
  setEquipFormClientId: (clientId: string) => void;
  setEquipFormBrand: (brand: string) => void;
  setEquipFormModel: (model: string) => void;
  setEquipFormSerial: (serial: string) => void;
  setEquipFormSW: (sw: string) => void;
  setEquipFormSucursal: (sucursal: string) => void;
  setEquipFormStatus: (status: any) => void;
  setIsEquipModalOpen: (open: boolean) => void;
}

export const EquiposTab: React.FC<EquiposTabProps> = ({
  equipments,
  clients,
  userRole,
  isEquipImporterOpen,
  setIsEquipImporterOpen,
  handleEquipCsvUpload,
  equipCsvSuccess,
  equipCsvError,
  setEditingEquip,
  setEquipFormId,
  setEquipFormName,
  setEquipFormClientId,
  setEquipFormBrand,
  setEquipFormModel,
  setEquipFormSerial,
  setEquipFormSW,
  setEquipFormSucursal,
  setEquipFormStatus,
  setIsEquipModalOpen,
}) => {
  const [equipSearch, setEquipSearch] = useState('');
  const [equipPage, setEquipPage] = useState(1);

  const query = equipSearch.toLowerCase().trim();
  const filtered = equipments.filter(eq => {
    const client = clients.find(c => c.id === eq.clientId);
    return (
      eq.name.toLowerCase().includes(query) ||
      eq.id.toLowerCase().includes(query) ||
      eq.brand.toLowerCase().includes(query) ||
      eq.model.toLowerCase().includes(query) ||
      eq.serialNumber.toLowerCase().includes(query) ||
      (eq.sucursal || '').toLowerCase().includes(query) ||
      (client?.name || '').toLowerCase().includes(query)
    );
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((equipPage - 1) * itemsPerPage, equipPage * itemsPerPage);

  return (
    <div className="space-y-6 font-sans">
      {/* Header Block */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
        <div>
          <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-650" />
            Gestión de Equipos y Activos
          </h4>
          <p className="text-3xs text-slate-500 mt-0.5 font-medium">Administra los equipos biomédicos, marcas, modelos, series y versiones de software instaladas.</p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {userRole === 'admin' && (
            <button
              onClick={() => setIsEquipImporterOpen(!isEquipImporterOpen)}
              className={`font-semibold text-3xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 border transition-all cursor-pointer ${
                isEquipImporterOpen
                  ? 'bg-amber-600 border-amber-600 text-white'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isEquipImporterOpen ? 'Ocultar Ingestor' : '📥 Importar CSV'}</span>
            </button>
          )}
          <button
            onClick={() => {
              setEditingEquip(null);
              setEquipFormId('');
              setEquipFormName('');
              setEquipFormClientId(clients[0]?.id || '');
              setEquipFormBrand('GENERAL ELECTRIC');
              setEquipFormModel('');
              setEquipFormSerial('');
              setEquipFormSW('');
              setEquipFormSucursal('');
              setEquipFormStatus('Operativo');
              setIsEquipModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-3xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs border border-indigo-600 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Equipo</span>
          </button>
        </div>
      </div>

      {/* CSV Importer Panel */}
      {isEquipImporterOpen && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-2 flex flex-wrap justify-between items-center gap-2">
            <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Database className="w-4 h-4 text-indigo-500" />
              <span>Ingestor de Equipos / Catálogo (CSV)</span>
            </h5>
            <div className="flex gap-3 text-[10px] font-bold">
              <button
                onClick={() => {
                  const headers = ['CODIGO MODELO', 'NOMBRE', 'IDENTIFICADOR', 'CODIGO FAMILIA', 'CODIGO MARCA', 'id_subtipoCatalo', 'Val Repetidos', 'Val Marca'];
                  const sample = ['DEVOC43', 'D-EVO2 C43', 'Detector de rayos X, diseño ergonómico', 'DETRX', '2', '', 'OK', 'FUJIFILM'];
                  const csv = "\uFEFF" + [headers.join(';'), sample.join(';')].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'plantilla_modelos_mtorimec.csv';
                  a.click();
                }}
                className="text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
              >
                📥 Plantilla Modelos
              </button>
            </div>
          </div>
          <div className="text-3xs text-slate-500 font-medium leading-relaxed">
            <p>El archivo debe ser un CSV separado por comas o punto y coma. Se actualizarán o registrarán los equipos correspondientes.</p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <input
                type="file"
                accept=".csv"
                onChange={handleEquipCsvUpload}
                className="block text-3xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-3xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 file:cursor-pointer hover:file:bg-indigo-100 transition-all"
              />
            </div>

            {equipCsvSuccess && (
              <div className="text-3xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-150 p-2.5 rounded-lg">
                {equipCsvSuccess}
              </div>
            )}
            {equipCsvError && (
              <div className="text-3xs font-bold text-rose-700 bg-rose-50 border border-rose-150 p-2.5 rounded-lg">
                {equipCsvError}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar por equipo, ID, marca, modelo, serie o cliente..."
            value={equipSearch}
            onChange={(e) => {
              setEquipSearch(e.target.value);
              setEquipPage(1);
            }}
            className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-4 py-1.5 text-xs font-semibold text-slate-700 outline-hidden focus:ring-1 focus:ring-indigo-500 placeholder-slate-400"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
        <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider">{filtered.length} equipos encontrados</span>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-3xs font-bold uppercase text-slate-400 tracking-wider">
                <th className="p-4">Equipo / Nombre</th>
                <th className="p-4">Cliente / Sucursal</th>
                <th className="p-4">Marca / Modelo</th>
                <th className="p-4">Serie / Software</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-3xs font-bold">
                    No se encontraron equipos registrados.
                  </td>
                </tr>
              ) : (
                paginated.map(eq => {
                  const client = clients.find(c => c.id === eq.clientId);
                  return (
                    <tr key={eq.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-xs">{eq.name}</span>
                          <span className="text-3xs text-slate-400 font-mono">ID: {eq.id}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 flex items-center gap-1">
                            <Building className="w-3 h-3 text-slate-400" />
                            {client?.name || eq.clientId}
                          </span>
                          {eq.sucursal && (
                            <span className="text-3xs text-slate-500 font-medium">{eq.sucursal}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700">{eq.brand}</span>
                          <span className="text-3xs text-slate-500">{eq.model || '-'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs font-bold text-indigo-700">{eq.serialNumber || '-'}</span>
                          {eq.softwareVersion && (
                            <span className="text-3xs text-slate-400 font-mono">SW: {eq.softwareVersion}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-3xs font-bold ${
                          eq.status === 'Operativo'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : eq.status === 'En Servicio'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {eq.status === 'Operativo' ? <ShieldCheck className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                          {eq.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingEquip(eq);
                            setEquipFormId(eq.id);
                            setEquipFormName(eq.name);
                            setEquipFormClientId(eq.clientId);
                            setEquipFormBrand(eq.brand);
                            setEquipFormModel(eq.model);
                            setEquipFormSerial(eq.serialNumber);
                            setEquipFormSW(eq.softwareVersion || '');
                            setEquipFormSucursal(eq.sucursal || '');
                            setEquipFormStatus(eq.status);
                            setIsEquipModalOpen(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between font-sans">
            <span className="text-3xs text-slate-500 font-medium">Pág. {equipPage} de {totalPages}</span>
            <div className="flex gap-1">
              <button
                onClick={() => setEquipPage(prev => Math.max(prev - 1, 1))}
                disabled={equipPage === 1}
                className="px-2.5 py-1 text-3xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => setEquipPage(prev => Math.min(prev + 1, totalPages))}
                disabled={equipPage === totalPages}
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
