import React, { useState } from 'react';
import { Briefcase, Database, Plus, Search, FileSpreadsheet, Building, AlertCircle, Calendar, Tag, ShieldCheck, Clock, Shield, CheckCircle2, ChevronRight, Sparkles, Filter, ExternalLink, Eye, Pencil, Trash2, ArrowUpRight } from 'lucide-react';
import { Contract, Client, ContractGE } from '../../types';

interface ContratosTabProps {
  contractsSubTab: 'garantias' | 'ge';
  contracts: Contract[];
  clients: Client[];
  userRole: string;
  contractsGE: ContractGE[];
  contractSearch: string;
  setContractSearch: (val: string) => void;
  contractValueFilter: 'all' | 'valued' | 'unvalued';
  setContractValueFilter: (val: 'all' | 'valued' | 'unvalued') => void;
  contractFilterBrand: string;
  setContractFilterBrand: (val: string) => void;
  contractFilterExpiration: '1m' | '3m' | 'expired' | 'pending_admin' | 'inactivo' | null;
  setContractFilterExpiration: (val: '1m' | '3m' | 'expired' | 'pending_admin' | 'inactivo' | null) => void;
  contractDateSort: 'none' | 'start_asc' | 'start_desc' | 'end_asc' | 'end_desc';
  setContractDateSort: (val: 'none' | 'start_asc' | 'start_desc' | 'end_asc' | 'end_desc') => void;
  contractPage: number;
  setContractPage: React.Dispatch<React.SetStateAction<number>>;
  isContractImporterOpen: boolean;
  setIsContractImporterOpen: (open: boolean) => void;
  handleContractCsvUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  contractCsvError: string | null;
  exportContractsToExcel: () => void;
  getContractExpirationAlert: (endDate: string, status: string, linkedContractId?: string) => { level: 'urgent_1m' | 'warning_3m' | 'expired' | null; daysRemaining: number } | null;
  setEditingContract: (contract: Contract | null) => void;
  setIsContractModalOpen: (open: boolean) => void;
  onDeleteContract?: (contractId: string) => void;
  onRenewContract?: (contract: Contract) => void;
  
  // GE subtab props
  contractGeSearch: string;
  setContractGeSearch: (val: string) => void;
  exportContractsGeToExcel: () => void;
  isContractGeImporterOpen: boolean;
  setIsContractGeImporterOpen: (open: boolean) => void;
  handleContractGeCsvUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  contractGeCsvError: string | null;
  onClearContractsGE?: () => void;
  onDeleteContractGE?: (id: string) => void;
  setEditingContractGE: (contract: ContractGE | null) => void;
  setIsContractGeModalOpen: (open: boolean) => void;
  
  // Reset functions
  resetContractForm: () => void;
  resetContractGeForm: (clientName?: string) => void;
}

export const ContratosTab: React.FC<ContratosTabProps> = ({
  contractsSubTab,
  contracts,
  clients,
  userRole,
  contractsGE,
  contractSearch,
  setContractSearch,
  contractValueFilter,
  setContractValueFilter,
  contractFilterBrand,
  setContractFilterBrand,
  contractFilterExpiration,
  setContractFilterExpiration,
  contractDateSort,
  setContractDateSort,
  contractPage,
  setContractPage,
  isContractImporterOpen,
  setIsContractImporterOpen,
  handleContractCsvUpload,
  contractCsvError,
  exportContractsToExcel,
  getContractExpirationAlert,
  setEditingContract,
  setIsContractModalOpen,
  onDeleteContract,
  onRenewContract,
  contractGeSearch,
  setContractGeSearch,
  exportContractsGeToExcel,
  isContractGeImporterOpen,
  setIsContractGeImporterOpen,
  handleContractGeCsvUpload,
  contractGeCsvError,
  onClearContractsGE,
  onDeleteContractGE,
  setEditingContractGE,
  setIsContractGeModalOpen,
  resetContractForm,
  resetContractGeForm,
}) => {
  const normalizeBrandName = (brand?: string): string => {
    if (!brand) return '';
    const trimmed = brand.trim();
    const upper = trimmed.toUpperCase();
    if (
      upper === 'GE' ||
      upper === 'GENERAL ELECTRIC' ||
      upper === 'GE HEALTHCARE' ||
      upper === 'GE MEDICAL' ||
      upper === 'G.E.' ||
      upper === 'GE MEDICAL SYSTEMS'
    ) {
      return 'GE';
    }
    return trimmed;
  };

  if (contractsSubTab === 'ge') {
    const query = contractGeSearch.toLowerCase().trim();
    const filteredGE = contractsGE.filter(c => {
      let name = (c.cliente || 'Desconocido').trim();
      name = name.replace(/\uFFFD/g, 'í').replace(/Mara/g, 'María').trim();
      return (
        name.toLowerCase().includes(query) ||
        (c.sid || '').toLowerCase().includes(query) ||
        (c.modalidad || '').toLowerCase().includes(query) ||
        (c.equipo || '').toLowerCase().includes(query) ||
        c.invoice.toLowerCase().includes(query) ||
        (c.contractNum || '').toLowerCase().includes(query) ||
        (c.paymentPeriod || '').toLowerCase().includes(query) ||
        (c.observaciones || '').toLowerCase().includes(query)
      );
    });

    const totalAmount = filteredGE.reduce((sum, item) => sum + (item.invoiceAmount || 0), 0);

    return (
      <div className="space-y-6 font-sans">
        {/* GE Header Block */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
          <div>
            <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
              Contratos con General Electric (GE)
            </h4>
            <p className="text-3xs text-slate-500 mt-0.5 font-medium">Gestión de cuotas, facturación, servicios contratados y SID GE por cliente.</p>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <button
              type="button"
              onClick={exportContractsGeToExcel}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-3xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-emerald-200 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>📊 Exportar Excel</span>
            </button>

            {userRole === 'admin' && (
              <button
                onClick={() => setIsContractGeImporterOpen(!isContractGeImporterOpen)}
                className={`font-semibold text-3xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 border transition-all cursor-pointer ${
                  isContractGeImporterOpen
                    ? 'bg-amber-600 border-amber-600 text-white'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>{isContractGeImporterOpen ? 'Ocultar Ingestor' : '📥 Importar CSV GE'}</span>
              </button>
            )}
            <button
              onClick={() => resetContractGeForm()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-3xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs border border-indigo-600 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Registro GE</span>
            </button>
          </div>
        </div>

        {/* GE CSV Importer */}
        {isContractGeImporterOpen && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
              <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider font-mono">📥 Ingestor de Contratos GE (CSV)</h5>
            </div>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept=".csv"
                onChange={handleContractGeCsvUpload}
                className="block w-full text-3xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-3xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 file:cursor-pointer hover:file:bg-indigo-100 transition-all"
              />
              {contractGeCsvError && (
                <div className="text-3xs text-rose-700 font-bold bg-rose-50 p-2 rounded-lg border border-rose-100 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                  <span>{contractGeCsvError}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* GE Search Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Buscar por cliente, SID, modalidad, equipo, factura o contrato..."
              value={contractGeSearch}
              onChange={(e) => setContractGeSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-4 py-1.5 text-xs font-semibold text-slate-700 outline-hidden focus:ring-1 focus:ring-indigo-500 placeholder-slate-400"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider">{filteredGE.length} registros (Total: ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })})</span>
        </div>

        {/* GE Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-3xs font-bold uppercase text-slate-400 tracking-wider">
                  <th className="p-4">Cliente</th>
                  <th className="p-4">SID / Modalidad</th>
                  <th className="p-4">Equipo</th>
                  <th className="p-4">Factura</th>
                  <th className="p-4 text-right">Monto ($)</th>
                  <th className="p-4">Vencimiento</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredGE.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 text-3xs font-bold">
                      No se encontraron contratos GE registrados.
                    </td>
                  </tr>
                ) : (
                  filteredGE.map(c => {
                    let cleanName = (c.cliente || 'Desconocido').trim();
                    cleanName = cleanName.replace(/\uFFFD/g, 'í').replace(/Mara/g, 'María').trim();

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-900">{cleanName}</td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-mono font-bold text-indigo-700">{c.sid || '-'}</span>
                            <span className="text-3xs text-slate-400 font-bold">{c.modalidad || '-'}</span>
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-slate-800">{c.equipo || '-'}</td>
                        <td className="p-4 font-mono font-bold text-slate-700">{c.invoice}</td>
                        <td className="p-4 text-right font-mono font-extrabold text-slate-900">
                          ${(c.invoiceAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 text-slate-600 font-medium">{c.dueDate || '-'}</td>
                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingContractGE(c);
                              setIsContractGeModalOpen(true);
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
        </div>
      </div>
    );
  }

  // Garantías Subview
  const query = contractSearch.toLowerCase().trim();
  const filtered = contracts.filter(con => {
    const client = clients.find(c => c.id === con.clientId);
    const matchesQuery = (
      con.id.toLowerCase().includes(query) ||
      con.type.toLowerCase().includes(query) ||
      (con.coverage || '').toLowerCase().includes(query) ||
      (client?.name || '').toLowerCase().includes(query) ||
      (con.equipmentItems || []).some(e =>
        (e.brand || '').toLowerCase().includes(query) ||
        normalizeBrandName(e.brand).toLowerCase().includes(query) ||
        (e.name || '').toLowerCase().includes(query)
      )
    );

    if (!matchesQuery) return false;

    if (contractValueFilter === 'unvalued') {
      if (con.contractValue && con.contractValue > 0) return false;
    } else if (contractValueFilter === 'valued') {
      if (!con.contractValue || con.contractValue <= 0) return false;
    }

    if (contractFilterBrand !== 'all') {
      const hasBrand = (con.equipmentItems || []).some(
        e => normalizeBrandName(e.brand).toLowerCase() === contractFilterBrand.toLowerCase()
      );
      if (!hasBrand) return false;
    }

    if (contractFilterExpiration) {
      const expAlert = getContractExpirationAlert(con.endDate, con.status, con.linkedContractId);
      if (contractFilterExpiration === '1m' && expAlert?.level !== 'urgent_1m') return false;
      if (contractFilterExpiration === '3m' && expAlert?.level !== 'warning_3m') return false;
      if (contractFilterExpiration === 'expired' && (expAlert?.level !== 'expired' || (con.linkedContractId && con.linkedContractId.trim() !== ''))) return false;
      if (contractFilterExpiration === 'pending_admin') {
        const isPending = !con.schedulePdfUrl && (con.pendingAdminSchedule || (con.maintenanceFrequency === 'Ninguno' && (!con.maintenanceDates || con.maintenanceDates.length === 0)));
        if (!isPending) return false;
      }
      if (contractFilterExpiration === 'inactivo' && con.status !== 'Inactivo') return false;
    }

    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (contractDateSort === 'start_asc') return (a.startDate || '').localeCompare(b.startDate || '');
    if (contractDateSort === 'start_desc') return (b.startDate || '').localeCompare(a.startDate || '');
    if (contractDateSort === 'end_asc') return (a.endDate || '').localeCompare(b.endDate || '');
    if (contractDateSort === 'end_desc') return (b.endDate || '').localeCompare(a.endDate || '');
    return 0;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
  const paginated = sorted.slice((contractPage - 1) * itemsPerPage, contractPage * itemsPerPage);

  return (
    <div className="space-y-6 font-sans">
      {/* Header Block */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
        <div>
          <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            Gestión de Contratos y Garantías
          </h4>
          <p className="text-3xs text-slate-500 mt-0.5 font-medium">Administra los contratos de servicio, garantías comerciales y coberturas de mantenimiento.</p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <button
            type="button"
            onClick={exportContractsToExcel}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-3xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-emerald-200 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>📊 Exportar Excel</span>
          </button>

          {userRole === 'admin' && (
            <button
              onClick={() => setIsContractImporterOpen(!isContractImporterOpen)}
              className={`font-semibold text-3xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 border transition-all cursor-pointer ${
                isContractImporterOpen
                  ? 'bg-amber-600 border-amber-600 text-white'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isContractImporterOpen ? 'Ocultar Ingestor' : '📥 Importar CSV'}</span>
            </button>
          )}
          <button
            onClick={() => resetContractForm()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-3xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs border border-indigo-600 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Contrato</span>
          </button>
        </div>
      </div>

      {/* CSV Importer */}
      {isContractImporterOpen && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
            <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider font-mono">📥 Ingestor de Contratos (CSV)</h5>
          </div>
          <div className="flex flex-col gap-2">
            <input
              type="file"
              accept=".csv"
              onChange={handleContractCsvUpload}
              className="block w-full text-3xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-3xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 file:cursor-pointer hover:file:bg-indigo-100 transition-all"
            />
            {contractCsvError && (
              <div className="text-3xs text-rose-700 font-bold bg-rose-50 p-2 rounded-lg border border-rose-100 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                <span>{contractCsvError}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar por contrato, cliente, marca o equipo..."
            value={contractSearch}
            onChange={(e) => {
              setContractSearch(e.target.value);
              setContractPage(1);
            }}
            className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-4 py-1.5 text-xs font-semibold text-slate-700 outline-hidden focus:ring-1 focus:ring-indigo-500 placeholder-slate-400"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
        <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider">{sorted.length} contratos encontrados</span>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-3xs font-bold uppercase text-slate-400 tracking-wider">
                <th className="p-4">N° Contrato</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Tipo / Cobertura</th>
                <th className="p-4">Vigencia</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-3xs font-bold">
                    No se encontraron contratos registrados.
                  </td>
                </tr>
              ) : (
                paginated.map(con => {
                  const client = clients.find(c => c.id === con.clientId);
                  const expAlert = getContractExpirationAlert(con.endDate, con.status, con.linkedContractId);

                  return (
                    <tr key={con.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-900 font-mono">{con.id}</td>
                      <td className="p-4 font-bold text-indigo-950 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {client?.name || con.clientId}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{con.type}</span>
                          {con.coverage && (
                            <span className="text-3xs text-slate-500 line-clamp-1">{con.coverage}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col text-3xs font-semibold text-slate-700">
                          <span>{con.startDate} - {con.endDate}</span>
                          {expAlert?.level === 'urgent_1m' && (
                            <span className="text-rose-600 font-bold mt-0.5">⚠️ Vence en {expAlert.daysRemaining} días</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-3xs font-bold ${
                          con.status === 'Activo'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {con.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingContract(con);
                            setIsContractModalOpen(true);
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
            <span className="text-3xs text-slate-500 font-medium">Pág. {contractPage} de {totalPages}</span>
            <div className="flex gap-1">
              <button
                onClick={() => setContractPage(prev => Math.max(prev - 1, 1))}
                disabled={contractPage === 1}
                className="px-2.5 py-1 text-3xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => setContractPage(prev => Math.min(prev + 1, totalPages))}
                disabled={contractPage === totalPages}
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
