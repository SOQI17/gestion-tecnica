import React, { useState } from 'react';
import { Briefcase, Database, Plus, Search, FileSpreadsheet, Building, AlertCircle, Calendar, Tag, ShieldCheck, Clock, Shield, CheckCircle2, ChevronRight, Sparkles, Filter, ExternalLink, Eye, Pencil, Trash2, ArrowUpRight, Folder, Hourglass, BellRing, Ban, AlertTriangle, FileText } from 'lucide-react';
import { Contract, Client, ContractGE } from '../../types';

interface ContratosTabProps {
  workOrders?: WorkOrder[];
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
  onEditContract?: (contract: Contract) => void;
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
  onEditContractGE?: (contract: ContractGE) => void;
  setIsContractGeModalOpen: (open: boolean) => void;
  
  // Reset functions
  resetContractForm: () => void;
  resetContractGeForm: (clientName?: string) => void;
}

export const ContratosTab: React.FC<ContratosTabProps> = ({
  workOrders = [],
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
  onEditContract,
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
  onEditContractGE,
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
                              if (onEditContractGE) {
                                onEditContractGE(c);
                              } else {
                                setEditingContractGE(c);
                                setIsContractGeModalOpen(true);
                              }
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
      {/* Top Filter KPI Cards Deck */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 no-print">
        {/* Card 1: Total Contratos */}
        <button
          type="button"
          onClick={() => {
            setContractFilterExpiration(null);
            setContractPage(1);
          }}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer shadow-xs ${
            contractFilterExpiration === null
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-md ring-2 ring-indigo-300'
              : 'bg-white border-slate-200 text-slate-800 hover:border-indigo-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <Folder className={`w-4 h-4 ${contractFilterExpiration === null ? 'text-indigo-200' : 'text-indigo-600'}`} />
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
              contractFilterExpiration === null ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700'
            }`}>
              ✓ ACTIVO
            </span>
          </div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider mt-2 opacity-80">TOTAL CONTRATOS</p>
          <h4 className="text-lg font-black mt-0.5">{contracts.length} <span className="text-3xs font-semibold opacity-70">Registros</span></h4>
        </button>

        {/* Card 2: Sin Cronograma */}
        <button
          type="button"
          onClick={() => {
            setContractFilterExpiration(contractFilterExpiration === 'pending_admin' ? null : 'pending_admin');
            setContractPage(1);
          }}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer shadow-xs ${
            contractFilterExpiration === 'pending_admin'
              ? 'bg-amber-500 border-amber-500 text-white shadow-md ring-2 ring-amber-300'
              : 'bg-white border-slate-200 text-slate-800 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <Hourglass className={`w-4 h-4 ${contractFilterExpiration === 'pending_admin' ? 'text-amber-100' : 'text-amber-500'}`} />
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
              contractFilterExpiration === 'pending_admin' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-800'
            }`}>
              PENDIENTE
            </span>
          </div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider mt-2 opacity-80">SIN CRONOGRAMA</p>
          <h4 className="text-lg font-black mt-0.5">
            {contracts.filter(c => !c.schedulePdfUrl && (c.pendingAdminSchedule || (c.maintenanceFrequency === 'Ninguno' && (!c.maintenanceDates || c.maintenanceDates.length === 0)))).length} <span className="text-3xs font-semibold opacity-70">Contratos</span>
          </h4>
        </button>

        {/* Card 3: Por Vencer 1M */}
        <button
          type="button"
          onClick={() => {
            setContractFilterExpiration(contractFilterExpiration === '1m' ? null : '1m');
            setContractPage(1);
          }}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer shadow-xs ${
            contractFilterExpiration === '1m'
              ? 'bg-rose-600 border-rose-600 text-white shadow-md ring-2 ring-rose-300'
              : 'bg-rose-50/50 border-rose-200 text-slate-800 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <BellRing className={`w-4 h-4 ${contractFilterExpiration === '1m' ? 'text-rose-100' : 'text-rose-600'}`} />
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
              contractFilterExpiration === '1m' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'
            }`}>
              1 MES
            </span>
          </div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider mt-2 text-rose-900 opacity-90">POR VENCER (1M)</p>
          <h4 className="text-lg font-black mt-0.5 text-rose-950">
            {contracts.filter(c => getContractExpirationAlert(c.endDate, c.status, c.linkedContractId)?.level === 'urgent_1m').length} <span className="text-3xs font-semibold opacity-70">Contratos</span>
          </h4>
        </button>

        {/* Card 4: Por Vencer 3M */}
        <button
          type="button"
          onClick={() => {
            setContractFilterExpiration(contractFilterExpiration === '3m' ? null : '3m');
            setContractPage(1);
          }}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer shadow-xs ${
            contractFilterExpiration === '3m'
              ? 'bg-amber-600 border-amber-600 text-white shadow-md ring-2 ring-amber-300'
              : 'bg-amber-50/40 border-amber-200 text-slate-800 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <AlertTriangle className={`w-4 h-4 ${contractFilterExpiration === '3m' ? 'text-amber-100' : 'text-amber-600'}`} />
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
              contractFilterExpiration === '3m' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'
            }`}>
              3 MESES
            </span>
          </div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider mt-2 text-amber-900 opacity-90">POR VENCER (3M)</p>
          <h4 className="text-lg font-black mt-0.5 text-amber-950">
            {contracts.filter(c => getContractExpirationAlert(c.endDate, c.status, c.linkedContractId)?.level === 'warning_3m').length} <span className="text-3xs font-semibold opacity-70">Contratos</span>
          </h4>
        </button>

        {/* Card 5: Inactivos / No Renovados */}
        <button
          type="button"
          onClick={() => {
            setContractFilterExpiration(contractFilterExpiration === 'inactivo' ? null : 'inactivo');
            setContractPage(1);
          }}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer shadow-xs ${
            contractFilterExpiration === 'inactivo'
              ? 'bg-slate-700 border-slate-700 text-white shadow-md ring-2 ring-slate-300'
              : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <Ban className={`w-4 h-4 ${contractFilterExpiration === 'inactivo' ? 'text-slate-200' : 'text-slate-500'}`} />
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
              contractFilterExpiration === 'inactivo' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              INACTIVOS
            </span>
          </div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider mt-2 opacity-80">NO RENOVADOS</p>
          <h4 className="text-lg font-black mt-0.5">
            {contracts.filter(c => c.status === 'Inactivo').length} <span className="text-3xs font-semibold opacity-70">Contratos</span>
          </h4>
        </button>

        {/* Card 6: Vencidos Total */}
        <button
          type="button"
          onClick={() => {
            setContractFilterExpiration(contractFilterExpiration === 'expired' ? null : 'expired');
            setContractPage(1);
          }}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer shadow-xs ${
            contractFilterExpiration === 'expired'
              ? 'bg-red-700 border-red-700 text-white shadow-md ring-2 ring-red-400'
              : 'bg-red-50/40 border-red-200 text-slate-800 hover:border-red-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
              contractFilterExpiration === 'expired' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-800'
            }`}>
              VENCIDOS
            </span>
          </div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider mt-2 text-red-900 opacity-90">VENCIDOS TOTAL</p>
          <h4 className="text-lg font-black mt-0.5 text-red-950">
            {contracts.filter(c => getContractExpirationAlert(c.endDate, c.status, c.linkedContractId)?.level === 'expired' && (!c.linkedContractId || c.linkedContractId.trim() === '')).length} <span className="text-3xs font-semibold opacity-70">Contratos</span>
          </h4>
        </button>
      </div>

      {/* Header Action Toolbar */}
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
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white border border-slate-200 p-3 rounded-xl shadow-2xs">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar por contrato, cliente, marca o equipo..."
            value={contractSearch}
            onChange={(e) => {
              setContractSearch(e.target.value);
              setContractPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-4 py-2 text-xs font-semibold text-slate-700 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-400"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Brand Filter & Date Sort Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={contractFilterBrand}
            onChange={(e) => {
              setContractFilterBrand(e.target.value);
              setContractPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-hidden focus:border-indigo-500 cursor-pointer uppercase"
          >
            <option value="all">🏷️ MARCA: Todas las Marcas</option>
            {Array.from(new Set(contracts.flatMap(c => (c.equipmentItems || []).map(e => e.brand).filter(Boolean)))).map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <select
            value={contractDateSort}
            onChange={(e) => {
              setContractDateSort(e.target.value as any);
              setContractPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-hidden focus:border-indigo-500 cursor-pointer uppercase"
          >
            <option value="none">📅 ORDENAR POR FECHA: Por Defecto</option>
            <option value="start_asc">Fecha Inicio (Más Antigua primero)</option>
            <option value="start_desc">Fecha Inicio (Más Reciente primero)</option>
            <option value="end_asc">Fecha Vencimiento (Más Próxima a Vencer)</option>
            <option value="end_desc">Fecha Vencimiento (Lejana a Vencer)</option>
          </select>

          <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider px-2">
            Mostrando {paginated.length} de {sorted.length} contratos
          </span>
        </div>
      </div>

      {/* Full 10-Column Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                <th className="p-3.5">Nº CONTRATO</th>
                <th className="p-3.5">CLIENTE</th>
                <th className="p-3.5">TIPO DE CONTRATO</th>
                <th className="p-3.5 text-right">VALOR (USD)</th>
                <th className="p-3.5 text-center">MARCA EQUIPO</th>
                <th className="p-3.5 text-center">FECHA INICIO</th>
                <th className="p-3.5 text-center">FECHA VENCIMIENTO</th>
                <th className="p-3.5 text-center">ESTADO</th>
                <th className="p-3.5">DETALLE DE COBERTURA</th>
                <th className="p-3.5 text-center">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-xs">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400 text-3xs font-bold uppercase tracking-wider">
                    No se encontraron contratos registrados.
                  </td>
                </tr>
              ) : (
                paginated.map(con => {
                  const client = clients.find(c => c.id === con.clientId);
                  const expAlert = getContractExpirationAlert(con.endDate, con.status, con.linkedContractId);

                  // Extract Brands for Column 5
                  const brands = Array.from(new Set((con.equipmentItems || []).map(e => e.brand).filter(Boolean)));
                  
                  // Equipment Summary list for Column 8
                  const equipSummary = (con.equipmentItems || [])
                    .map(e => `${e.name || ''} ${e.brand ? `(${e.brand})` : ''}`.trim())
                    .filter(Boolean)
                    .join(' • ');

                  return (
                    <tr key={con.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* 1. Nº CONTRATO */}
                      <td className="p-3.5">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-slate-900 font-mono text-xs">{con.id}</span>
                          {con.linkedContractId && (
                            <span className="text-[10px] text-indigo-600 font-bold">Vínculo: {con.linkedContractId}</span>
                          )}
                        </div>
                      </td>

                      {/* 2. CLIENTE */}
                      <td className="p-3.5 font-bold text-slate-800">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{client?.name || con.clientId}</span>
                          <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                            <span>📍 {client?.city || con.city || 'Quito'}</span>
                          </span>
                        </div>
                      </td>

                      {/* 3. TIPO DE CONTRATO */}
                      <td className="p-3.5">
                        <span className="font-bold text-indigo-900 bg-indigo-50/70 px-2 py-1 rounded-md text-[11px] inline-block">
                          {con.type}
                        </span>
                      </td>

                      {/* 4. VALOR (USD) */}
                      <td className="p-3.5 text-right font-mono font-bold text-slate-800">
                        {con.contractValue && con.contractValue > 0
                          ? `$${con.contractValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                          : <span className="text-slate-400 font-normal">-</span>
                        }
                      </td>

                      {/* 5. MARCA EQUIPO */}
                      <td className="p-3.5 text-center">
                        {brands.length > 0 ? (
                          <div className="flex flex-wrap items-center justify-center gap-1">
                            {brands.map(b => (
                              <span key={b} className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                {b}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                            GE
                          </span>
                        )}
                      </td>

                      {/* 6. FECHA INICIO */}
                      <td className="p-3.5 text-center font-mono text-xs font-semibold text-slate-700">
                        {con.startDate || '-'}
                      </td>

                      {/* 7. FECHA VENCIMIENTO */}
                      <td className="p-3.5 text-center font-mono text-xs font-bold text-slate-900">
                        {con.endDate || '-'}
                      </td>

                      {/* 8. ESTADO */}
                      <td className="p-3.5 text-center">
                        <div className="flex flex-col items-center gap-1.5 min-w-[170px]">
                          {/* Status pill */}
                          <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            con.status === 'Activo'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-rose-100 text-rose-900 border border-rose-300'
                          }`}>
                            {con.status}
                          </span>

                          {/* MTOS PENDIENTES Pill (Linked strictly to Contract & Agendamiento) */}
                          {(() => {
                            // Strict Work Orders matching this specific contract ID or serial number
                            const contractWOs = workOrders.filter(w => 
                              (w.contractId && (w.contractId === con.id || (con.linkedContractId && w.contractId === con.linkedContractId))) ||
                              (con.equipmentItems && con.equipmentItems.some(e => e.serialNumber && e.serialNumber.trim() !== '' && e.serialNumber === w.equipmentSerial))
                            );

                            const scheduledDates = con.maintenanceDates || [];
                            
                            // Total visits scheduled for this contract
                            let totalMtos = 0;
                            if (scheduledDates.length > 0) {
                              totalMtos = scheduledDates.length;
                            } else if (contractWOs.length > 0) {
                              totalMtos = contractWOs.length;
                            } else {
                              const freqMult = con.maintenanceFrequency === 'Mensual' ? 12 
                                : con.maintenanceFrequency === 'Bimensual' ? 6 
                                : con.maintenanceFrequency === 'Trimestral' ? 4 
                                : con.maintenanceFrequency === 'Cuatrimestral' ? 3 
                                : con.maintenanceFrequency === 'Semestral' ? 2 : 2;
                              totalMtos = (con.equipmentItems?.length || 1) * freqMult;
                            }

                            // Completed visits count from linked Agendamiento / Work Orders or schedule
                            let completedMtos = 0;
                            if (contractWOs.length > 0) {
                              completedMtos = contractWOs.filter(w => w.status === 'Completado' || w.status === 'Saldado' || w.status === 'Reportado').length;
                            } else if (scheduledDates.length > 0) {
                              completedMtos = scheduledDates.filter((d: any) => typeof d === 'object' ? (d.completed || d.status === 'completed') : false).length;
                              if (completedMtos === 0) {
                                const todayStr = new Date().toISOString().split('T')[0];
                                completedMtos = scheduledDates.filter((d: any) => {
                                  const dateStr = typeof d === 'string' ? d : d.date;
                                  return dateStr && dateStr < todayStr;
                                }).length;
                              }
                            } else {
                              completedMtos = Math.max(0, totalMtos - 4);
                            }

                            // Ensure logical bounds: completedMtos <= totalMtos
                            completedMtos = Math.min(completedMtos, totalMtos);
                            const pendingMtos = Math.max(0, totalMtos - completedMtos);

                            return (
                              <div className="bg-slate-100/90 border border-slate-200 text-slate-700 font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center justify-center gap-1.5 shadow-2xs w-full">
                                <FileText className="w-3 h-3 text-slate-500 shrink-0" />
                                <span>{pendingMtos} MTOS PENDIENTES ({completedMtos}/{totalMtos})</span>
                              </div>
                            );
                          })()}

                          {/* Equipment summary box */}
                          {(() => {
                            const equipCountMap: Record<string, number> = {};
                            (con.equipmentItems || []).forEach(e => {
                              const key = `${e.name || 'Equipo'}${e.brand ? ` (${e.brand})` : ''}`.trim();
                              equipCountMap[key] = (equipCountMap[key] || 0) + 1;
                            });
                            const equipText = Object.entries(equipCountMap).map(([k, count]) => `${count} ${k}`).join(' • ');
                            if (!equipText) return null;

                            return (
                              <div className="bg-indigo-50/80 border border-indigo-200/70 rounded-lg p-1.5 text-[9px] font-bold text-indigo-900 font-mono leading-tight w-full text-center max-w-[240px]">
                                ({equipText})
                              </div>
                            );
                          })()}

                          {expAlert?.level === 'urgent_1m' && (
                            <span className="text-[10px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              ⚠️ Vence en {expAlert.daysRemaining}d
                            </span>
                          )}

                          {expAlert?.level === 'warning_3m' && (
                            <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              ⌛ Vence en {expAlert.daysRemaining}d
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 9. DETALLE DE COBERTURA */}
                      <td className="p-3.5">
                        <div className="flex flex-col gap-1.5 text-3xs font-bold min-w-[130px]">
                          {con.coverage && (
                            <span className="text-slate-600 font-semibold text-3xs line-clamp-1 block mb-0.5">{con.coverage}</span>
                          )}

                          {con.isNewEquipment && (
                            <span className="inline-flex items-center gap-1 text-amber-900 bg-amber-100/90 border border-amber-300 px-2.5 py-0.5 rounded-lg text-[10px] font-bold shadow-2xs w-max">
                              ✨ Equipo Nuevo
                            </span>
                          )}

                          {/* Contrato PDF Link Button */}
                          {(() => {
                            const targetPdf = con.contractPdfUrl || con.pdfUrl;
                            return (
                              <button
                                type="button"
                                onClick={() => {
                                  if (targetPdf) {
                                    window.open(targetPdf, '_blank');
                                  } else if (onEditContract) {
                                    onEditContract(con);
                                  } else {
                                    setEditingContract(con);
                                    setIsContractModalOpen(true);
                                  }
                                }}
                                className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all w-max shadow-2xs cursor-pointer"
                                title={targetPdf ? "Ver Documento del Contrato PDF" : "Abrir ficha de contrato para adjuntar o ver documento"}
                              >
                                📄 Contrato <ExternalLink className="w-2.5 h-2.5 text-emerald-600" />
                              </button>
                            );
                          })()}

                          {/* Cronograma PDF Link Button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (con.schedulePdfUrl) {
                                window.open(con.schedulePdfUrl, '_blank');
                              } else if (onEditContract) {
                                onEditContract(con);
                              } else {
                                setEditingContract(con);
                                setIsContractModalOpen(true);
                              }
                            }}
                            className="inline-flex items-center gap-1 text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-300 px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all w-max shadow-2xs cursor-pointer"
                            title={con.schedulePdfUrl ? "Ver Cronograma PDF" : "Abrir ficha de contrato para ver mantenimientos o adjuntar cronograma"}
                          >
                            📅 Cronograma <ExternalLink className="w-2.5 h-2.5 text-purple-600" />
                          </button>
                        </div>
                      </td>

                      {/* 10. ACCIONES */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (onEditContract) {
                                onEditContract(con);
                              } else {
                                setEditingContract(con);
                                setIsContractModalOpen(true);
                              }
                            }}
                            className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer text-xs"
                          >
                            Editar
                          </button>
                          {onDeleteContract && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`¿Está seguro de eliminar el contrato ${con.id}?`)) {
                                  onDeleteContract(con.id);
                                }
                              }}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                              title="Eliminar Contrato"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
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
                className="px-2.5 py-1 text-3xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Anterior
              </button>
              <button
                onClick={() => setContractPage(prev => Math.min(prev + 1, totalPages))}
                disabled={contractPage === totalPages}
                className="px-2.5 py-1 text-3xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
