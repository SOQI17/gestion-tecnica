import React, { useState } from 'react';
import { Briefcase, Database, Plus, Search, FileSpreadsheet, Building, AlertCircle, Calendar, Tag, ShieldCheck, Clock, Shield, CheckCircle2, ChevronRight, Sparkles, Filter, ExternalLink, Eye, Pencil, Trash2, ArrowUpRight, Folder, Hourglass, BellRing, Ban, AlertTriangle, FileText, TrendingUp, CalendarRange } from 'lucide-react';
import { Contract, Client, ContractGE, WorkOrder } from '../../types';
import { triggerDirectDownload } from '../../utils/cloudinary';

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
  getContractMaintenanceStatus?: (con: Contract, workOrders: WorkOrder[]) => { total: number; done: number; remaining: number; hasNoPending: boolean };
  setEditingContract: (contract: Contract | null) => void;
  onEditContract?: (contract: Contract) => void;
  setIsContractModalOpen: (open: boolean) => void;
  onDeleteContract?: (contractId: string) => void;
  onRenewContract?: (contract: Contract) => void;
  setSelectedContractForDetails?: (contract: Contract) => void;
  setIsContractDetailsModalOpen?: (open: boolean) => void;
  
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
  getContractMaintenanceStatus,
  setEditingContract,
  onEditContract,
  setIsContractModalOpen,
  onDeleteContract,
  onRenewContract,
  setSelectedContractForDetails,
  setIsContractDetailsModalOpen,
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

  const [isGeDashboardExpanded, setIsGeDashboardExpanded] = useState(true);

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
    const withObsCount = filteredGE.filter(item => item.observaciones && item.observaciones.trim().length > 0).length;

    // Analytics: Top Clients by Number of Invoices
    const clientStatsMap = new Map<string, { totalAmount: number; count: number }>();
    contractsGE.forEach(c => {
      let name = (c.cliente || 'Desconocido').trim();
      name = name.replace(/\uFFFD/g, 'í').replace(/Mara/g, 'María').trim();

      const current = clientStatsMap.get(name) || { totalAmount: 0, count: 0 };
      clientStatsMap.set(name, {
        totalAmount: current.totalAmount + (c.invoiceAmount || 0),
        count: current.count + 1
      });
    });

    const topClientsByCount = Array.from(clientStatsMap.entries())
      .map(([name, stat]) => ({ name, ...stat }))
      .sort((a, b) => b.count - a.count || b.totalAmount - a.totalAmount)
      .slice(0, 5);

    const topClientsByAmount = Array.from(clientStatsMap.entries())
      .map(([name, stat]) => ({ name, ...stat }))
      .sort((a, b) => b.totalAmount - a.totalAmount || b.count - a.count)
      .slice(0, 5);

    // Duration buckets
    let dur1_6 = 0;
    let dur7_12 = 0;
    let dur13_24 = 0;
    let dur25Plus = 0;

    contractsGE.forEach(c => {
      const m = c.months || 0;
      if (m >= 1 && m <= 6) dur1_6++;
      else if (m >= 7 && m <= 12) dur7_12++;
      else if (m >= 13 && m <= 24) dur13_24++;
      else if (m > 24) dur25Plus++;
    });

    const renewalAlerts = contractsGE.filter(c => c.observaciones && c.observaciones.toLowerCase().includes('renovacion'));

    return (
      <div className="space-y-6 font-sans">
        {/* GE Header Toolbar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
          <div>
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4.5 h-4.5 text-indigo-600" />
              Dashboard de Contratos con GE & Facturación
            </h4>
            <p className="text-3xs text-slate-500 mt-0.5 font-medium">
              Control ejecutivo de facturación, modalidades (CT, MR, SURGERY), coberturas y renovaciones.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <button
              type="button"
              onClick={() => setIsGeDashboardExpanded(!isGeDashboardExpanded)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-3xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
            >
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{isGeDashboardExpanded ? '⏱ Ocultar Dashboard' : '📊 Mostrar Dashboard'}</span>
            </button>

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
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-3xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs border border-indigo-600 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Nueva Factura GE</span>
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

        {/* Top 4 Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Total Facturado GE</span>
              <span className="text-xl font-black text-indigo-700">${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Volumen Total USD acumulado</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-base shadow-2xs">
              💰
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Total Registros GE</span>
              <span className="text-xl font-black text-slate-800">{filteredGE.length} Facturas</span>
              <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{contractsGE.length} guardadas en Firestore</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-base shadow-2xs">
              🧾
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Cliente con Más Facturas</span>
              <span className="text-sm font-black text-indigo-700 truncate max-w-[140px] block">{topClientsByCount[0]?.name || 'N/A'}</span>
              <p className="text-[9px] text-indigo-600 font-bold mt-0.5">{topClientsByCount[0]?.count || 0} Facturas registradas</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-base shadow-2xs">
              🏆
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Renovaciones & Alertas</span>
              <span className="text-xl font-black text-amber-600">{renewalAlerts.length} Pendientes</span>
              <p className="text-[9px] text-amber-700 font-semibold mt-0.5">{withObsCount} observaciones notas</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-base shadow-2xs">
              ⚠️
            </div>
          </div>
        </div>

        {/* Visual Analytics Executive Cards Section */}
        {isGeDashboardExpanded && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Card 1: Top 5 Clientes por Cantidad de Facturas */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h5 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                  <span>Clientes con Más Facturas (N° Facturas)</span>
                </h5>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Top 5</span>
              </div>
              <div className="space-y-2.5">
                {topClientsByCount.length === 0 ? (
                  <p className="text-3xs text-slate-400 italic">No hay datos suficientes.</p>
                ) : (
                  topClientsByCount.map((client, idx) => {
                    const pct = filteredGE.length > 0 ? (client.count / filteredGE.length) * 100 : 0;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-3xs">
                          <div className="truncate max-w-[170px]">
                            <span className="font-extrabold text-slate-900 block truncate">{client.name}</span>
                            <span className="text-[9px] text-slate-400 font-semibold font-mono">${client.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-mono font-black text-indigo-700 block text-xs">
                              {client.count} factura{client.count !== 1 ? 's' : ''}
                            </span>
                            <span className="text-[9px] font-bold text-indigo-500">
                              {pct.toFixed(1)}% del total
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(pct, 5)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Card 2: Clientes con Mayor Valor de Facturación ($ USD) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h5 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Clientes con Mayor Facturación ($ USD)</span>
                </h5>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Top 5</span>
              </div>
              <div className="space-y-2.5">
                {topClientsByAmount.length === 0 ? (
                  <p className="text-3xs text-slate-400 italic">No hay datos suficientes.</p>
                ) : (
                  topClientsByAmount.map((client, idx) => {
                    const pct = totalAmount > 0 ? (client.totalAmount / totalAmount) * 100 : 0;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-3xs">
                          <div className="truncate max-w-[160px]">
                            <span className="font-extrabold text-slate-900 block truncate">{client.name}</span>
                            <span className="text-[9px] text-slate-400 font-semibold">{client.count} factura{client.count !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-mono font-black text-emerald-700 block text-xs">
                              ${client.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-[9px] font-bold text-emerald-600">
                              {pct.toFixed(1)}% del total
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(pct, 5)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Card 3: Duración Cobertura (Meses) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h5 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                  <CalendarRange className="w-4 h-4 text-emerald-600" />
                  <span>Duración Cobertura (Meses)</span>
                </h5>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Rango Meses</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                  <span className="block text-[9px] font-bold text-slate-500 uppercase">1 - 6 Meses</span>
                  <span className="text-base font-black text-slate-800">{dur1_6} Facturas</span>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-xl text-center">
                  <span className="block text-[9px] font-bold text-indigo-700 uppercase">7 - 12 Meses</span>
                  <span className="text-base font-black text-indigo-900">{dur7_12} Facturas</span>
                </div>
                <div className="bg-purple-50 border border-purple-200 p-3 rounded-xl text-center">
                  <span className="block text-[9px] font-bold text-purple-700 uppercase">13 - 24 Meses</span>
                  <span className="text-base font-black text-purple-900">{dur13_24} Facturas</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-center">
                  <span className="block text-[9px] font-bold text-amber-700 uppercase">&gt; 24 Meses</span>
                  <span className="text-base font-black text-amber-900">{dur25Plus} Facturas</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GE Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-3 rounded-xl shadow-2xs">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Buscar por cliente, SID, modalidad, equipo, invoice, periodo, observaciones..."
              value={contractGeSearch}
              onChange={(e) => setContractGeSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-4 py-2 text-xs font-semibold text-slate-700 outline-hidden focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-400"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <span className="text-3xs font-mono font-black text-slate-500 uppercase tracking-wider px-2">
            {filteredGE.length} REGISTROS GE ENCONTRADOS
          </span>
        </div>

        {/* Full 12-Column GE Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                  <th className="p-3.5">CLIENTE</th>
                  <th className="p-3.5">SID / MODALIDAD</th>
                  <th className="p-3.5">EQUIPO</th>
                  <th className="p-3.5">INVOICE</th>
                  <th className="p-3.5 text-right">INVOICE AMOUNT</th>
                  <th className="p-3.5 text-center">MONTHS</th>
                  <th className="p-3.5">FECHA FACTURA</th>
                  <th className="p-3.5">PERIODO / #MES</th>
                  <th className="p-3.5 text-center">CONTRATO</th>
                  <th className="p-3.5">OBSERVACIONES / COMMENTS</th>
                  <th className="p-3.5 text-center">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-xs">
                {filteredGE.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="p-8 text-center text-slate-400 text-3xs font-bold uppercase tracking-wider">
                      No se encontraron contratos GE registrados.
                    </td>
                  </tr>
                ) : (
                  filteredGE.map(c => {
                    let cleanName = (c.cliente || 'Desconocido').trim();
                    cleanName = cleanName.replace(/\uFFFD/g, 'í').replace(/Mara/g, 'María').trim();

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* 1. CLIENTE */}
                        <td className="p-3.5 font-bold text-slate-900">{cleanName}</td>

                        {/* 2. SID / MODALIDAD */}
                        <td className="p-3.5">
                          <div className="flex flex-col">
                            <span className="font-mono font-bold text-indigo-700 text-xs">{c.sid || '-'}</span>
                            {c.modalidad && (
                              <span className="text-[9px] text-slate-400 font-bold uppercase">{c.modalidad}</span>
                            )}
                          </div>
                        </td>

                        {/* 3. EQUIPO */}
                        <td className="p-3.5 font-semibold text-slate-700">{c.equipo || '-'}</td>

                        {/* 4. INVOICE */}
                        <td className="p-3.5 font-mono font-extrabold text-indigo-900 text-xs">{c.invoice}</td>

                        {/* 5. INVOICE AMOUNT */}
                        <td className="p-3.5 text-right font-mono font-black text-emerald-700 text-xs">
                          ${(c.invoiceAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        {/* 6. MONTHS */}
                        <td className="p-3.5 text-center font-mono font-bold text-slate-700">{c.months || '-'}</td>

                        {/* 7. FECHA FACTURA */}
                        <td className="p-3.5">
                          <div className="flex flex-col text-[10px] font-semibold text-slate-700">
                            <span>{c.invoiceDate || '-'}</span>
                            {c.dueDate && (
                              <span className="text-[9px] text-slate-400 font-bold">Venc: {c.dueDate}</span>
                            )}
                          </div>
                        </td>

                        {/* 8. PERIODO / #MES */}
                        <td className="p-3.5">
                          <div className="flex flex-col text-[10px] font-bold text-indigo-950">
                            <span>{c.paymentPeriod || '-'}</span>
                            {c.monthNum && (
                              <span className="text-[9px] text-slate-400 font-semibold">#Mes: {c.monthNum}</span>
                            )}
                          </div>
                        </td>

                        {/* 9. CONTRATO */}
                        <td className="p-3.5 text-center">
                          {c.contractNum ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-indigo-50 text-indigo-700 font-mono font-extrabold text-3xs border border-indigo-200">
                              {c.contractNum}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">-</span>
                          )}
                        </td>

                        {/* 10. OBSERVACIONES / COMMENTS */}
                        <td className="p-3.5 max-w-[200px]">
                          {c.observaciones ? (
                            <span className="text-3xs text-slate-600 font-medium line-clamp-2" title={c.observaciones}>
                              {c.observaciones}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">-</span>
                          )}
                        </td>

                        {/* 11. ACCIONES */}
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
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
                              className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer text-xs"
                            >
                              Editar
                            </button>
                            {onDeleteContractGE && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`¿Está seguro de eliminar el registro GE ${c.invoice}?`)) {
                                    onDeleteContractGE(c.id);
                                  }
                                }}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                title="Eliminar Registro GE"
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

      {/* Executive Search & Filter Control Bar */}
      <div className="bg-gradient-to-r from-slate-50 via-white to-slate-50 border border-slate-200/90 p-3.5 rounded-2xl shadow-xs flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3.5">
        {/* Search input with active indicator */}
        <div className="relative flex-1 min-w-[280px]">
          <input
            type="text"
            placeholder="Buscar por contrato, cliente, marca o equipo..."
            value={contractSearch}
            onChange={(e) => {
              setContractSearch(e.target.value);
              setContractPage(1);
            }}
            className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 rounded-xl pl-9 pr-8 py-2 text-xs font-bold text-slate-800 outline-hidden transition-all shadow-2xs placeholder-slate-400"
          />
          <Search className="w-4 h-4 text-indigo-600 absolute left-3 top-1/2 -translate-y-1/2" />
          {contractSearch && (
            <button
              type="button"
              onClick={() => {
                setContractSearch('');
                setContractPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Executive Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Marca Dropdown */}
          <div className="relative">
            <select
              value={contractFilterBrand}
              onChange={(e) => {
                setContractFilterBrand(e.target.value);
                setContractPage(1);
              }}
              className={`appearance-none bg-white border text-xs font-extrabold px-3.5 py-2 pr-7 rounded-xl shadow-2xs transition-all cursor-pointer outline-hidden ${
                contractFilterBrand !== 'all'
                  ? 'border-indigo-400 bg-indigo-50/50 text-indigo-950 ring-2 ring-indigo-500/10'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <option value="all">🏷️ MARCA: Todas las Marcas</option>
              {Array.from(new Set(contracts.flatMap(c => (c.equipmentItems || []).map(e => e.brand).filter(Boolean)))).map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
          </div>

          {/* Valor Dropdown */}
          <div className="relative">
            <select
              value={contractValueFilter}
              onChange={(e) => {
                setContractValueFilter(e.target.value as any);
                setContractPage(1);
              }}
              className={`appearance-none text-xs font-extrabold px-3.5 py-2 pr-7 rounded-xl shadow-2xs transition-all cursor-pointer outline-hidden ${
                contractValueFilter !== 'all'
                  ? 'bg-emerald-100/80 border border-emerald-400 text-emerald-950 ring-2 ring-emerald-500/10'
                  : 'bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <option value="all">💲 VALOR: Todos los Valores</option>
              <option value="valued">💲 Con Valor ($ &gt; 0)</option>
              <option value="unvalued">💲 Sin Valor ($0 / Sin Precio)</option>
            </select>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
          </div>

          {/* Orden por Fecha Dropdown */}
          <div className="relative">
            <select
              value={contractDateSort}
              onChange={(e) => {
                setContractDateSort(e.target.value as any);
                setContractPage(1);
              }}
              className={`appearance-none text-xs font-extrabold px-3.5 py-2 pr-7 rounded-xl shadow-2xs transition-all cursor-pointer outline-hidden ${
                contractDateSort !== 'none'
                  ? 'bg-purple-100/80 border border-purple-400 text-purple-950 ring-2 ring-purple-500/10'
                  : 'bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <option value="none">📅 ORDENAR: Por Defecto</option>
              <option value="start_asc">Fecha Inicio (Más Antigua primero)</option>
              <option value="start_desc">Fecha Inicio (Más Reciente primero)</option>
              <option value="end_asc">Fecha Vencimiento (Más Próxima a Vencer)</option>
              <option value="end_desc">Fecha Vencimiento (Lejana a Vencer)</option>
            </select>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
          </div>

          {/* Reset Filters Pill */}
          {(contractFilterBrand !== 'all' || contractValueFilter !== 'all' || contractDateSort !== 'none' || contractSearch.trim() !== '' || contractFilterExpiration !== null) && (
            <button
              type="button"
              onClick={() => {
                setContractFilterBrand('all');
                setContractValueFilter('all');
                setContractDateSort('none');
                setContractSearch('');
                setContractFilterExpiration(null);
                setContractPage(1);
              }}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-extrabold px-3 py-2 rounded-xl transition-all cursor-pointer shadow-2xs flex items-center gap-1"
              title="Limpiar todos los filtros"
            >
              <span>✕ Limpiar</span>
            </button>
          )}

          {/* Results Badge Counter */}
          <div className="bg-slate-900 text-white font-mono text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl shadow-xs border border-slate-800 flex items-center gap-1.5 shrink-0 ml-auto xl:ml-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Mostrando {paginated.length} de {sorted.length} contratos</span>
          </div>
        </div>
      </div>

      {/* Full 10-Column Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                <th className="px-3 py-2.5">Nº CONTRATO</th>
                <th className="px-3 py-2.5">CLIENTE</th>
                <th className="px-3 py-2.5">TIPO DE CONTRATO</th>
                <th className="px-3 py-2.5 text-right">VALOR (USD)</th>
                <th className="px-2 py-2.5 text-center">MARCA</th>
                <th className="px-2 py-2.5 text-center">FECHA INICIO</th>
                <th className="px-2 py-2.5 text-center">FECHA VENCIMIENTO</th>
                <th className="px-2 py-2.5 text-center">ESTADO</th>
                <th className="px-2 py-2.5">COBERTURA</th>
                <th className="px-3 py-2.5 text-center">ACCIONES</th>
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

                  // Extract Brands for Column 5 normalized (General Electric -> GE)
                  const rawBrands = (con.equipmentItems || []).map(e => e.brand).filter(Boolean);
                  const brands = Array.from(new Set(rawBrands.map(b => normalizeBrandName(b)).filter(Boolean)));

                  // Expiration Alert & Row Styling
                  const rowBorderClass = expAlert?.level === 'warning_3m'
                    ? 'border-l-4 border-l-amber-500 bg-amber-50/20 hover:bg-amber-50/30'
                    : expAlert?.level === 'urgent_1m'
                    ? 'border-l-4 border-l-rose-500 bg-rose-50/20 hover:bg-rose-50/30'
                    : expAlert?.level === 'expired'
                    ? 'border-l-4 border-l-red-600 bg-red-50/20 hover:bg-red-50/30'
                    : 'hover:bg-slate-50/60';

                  return (
                    <tr key={con.id} className={`transition-colors ${rowBorderClass}`}>
                      {/* 1. Nº CONTRATO */}
                      <td className="px-3 py-2.5">
                        <div className="flex flex-col">
                          {setSelectedContractForDetails && setIsContractDetailsModalOpen ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedContractForDetails(con);
                                setIsContractDetailsModalOpen(true);
                              }}
                              className="font-extrabold text-indigo-600 hover:text-indigo-900 hover:underline font-mono text-xs text-left cursor-pointer flex items-center gap-1.5 group"
                              title="Ver Detalle del Contrato"
                            >
                              <span>{con.id}</span>
                              <Eye className="w-3 h-3 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                            </button>
                          ) : (
                            <span className="font-extrabold text-slate-900 font-mono text-xs">{con.id}</span>
                          )}
                          {con.linkedContractId && (
                            <span className="text-[10px] text-indigo-600 font-bold">Vínculo: {con.linkedContractId}</span>
                          )}
                        </div>
                      </td>

                      {/* 2. CLIENTE */}
                      <td className="px-3 py-2.5 font-bold text-slate-800">
                        <div className="flex flex-col justify-center">
                          <span className="font-black text-xs text-slate-950 leading-snug tracking-tight">{client?.name || con.clientId}</span>
                          <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-0.5">
                            <span>📍 {client?.city || con.city || 'Quito'}</span>
                          </span>
                        </div>
                      </td>

                      {/* 3. TIPO DE CONTRATO */}
                      <td className="px-3 py-2.5">
                        <span className="font-bold text-indigo-900 bg-indigo-50/70 px-2 py-1 rounded-md text-[11px] inline-block">
                          {con.type}
                        </span>
                      </td>

                      {/* 4. VALOR (USD) */}
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-800">
                        {con.contractValue && con.contractValue > 0
                          ? `$${con.contractValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                          : <span className="text-slate-400 font-normal">-</span>
                        }
                      </td>

                      {/* 5. MARCA EQUIPO */}
                      <td className="px-2 py-2.5 text-center">
                        {brands.length > 0 ? (
                          <div className="flex flex-wrap items-center justify-center gap-1">
                            {brands.map(b => (
                              <span key={b} className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                                {b}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            GE
                          </span>
                        )}
                      </td>

                      {/* 6. FECHA INICIO */}
                      <td className="px-2 py-2.5 text-center font-mono text-xs font-semibold text-slate-700">
                        {con.startDate || '-'}
                      </td>

                      {/* 7. FECHA VENCIMIENTO */}
                      <td className="px-2 py-2.5 text-center font-mono text-xs font-bold text-slate-900">
                        <div className="flex flex-col items-center">
                          <span>{con.endDate || '-'}</span>
                          {expAlert?.level === 'warning_3m' && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-900 bg-amber-100/90 border border-amber-300 px-1.5 py-0.5 rounded-md shadow-2xs mt-1">
                              ⚠️ 3 MESES ({expAlert.daysRemaining}d)
                            </span>
                          )}
                          {expAlert?.level === 'urgent_1m' && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black text-rose-900 bg-rose-100/90 border border-rose-300 px-1.5 py-0.5 rounded-md shadow-2xs mt-1">
                              ⚠️ 1 MES ({expAlert.daysRemaining}d)
                            </span>
                          )}
                          {expAlert?.level === 'expired' && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black text-red-950 bg-red-100/90 border border-red-300 px-1.5 py-0.5 rounded-md shadow-2xs mt-1">
                              🚨 VENCIDO ({expAlert.daysRemaining}d)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 8. ESTADO */}
                      <td className="px-2 py-2.5 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          {/* Status pill */}
                          {expAlert?.level === 'warning_3m' ? (
                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-950 border border-amber-300 w-full shadow-2xs">
                              ⚠️ 3 MESES (POR VENCER)
                            </span>
                          ) : expAlert?.level === 'urgent_1m' ? (
                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-950 border border-rose-300 w-full shadow-2xs">
                              ⚠️ 1 MES (POR VENCER)
                            </span>
                          ) : expAlert?.level === 'expired' ? (
                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-950 border border-red-300 w-full shadow-2xs">
                              🚨 VENCIDO
                            </span>
                          ) : (
                            <span className={`inline-flex items-center justify-center px-3 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                              con.status === 'Activo'
                                ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                                : 'bg-rose-100 text-rose-950 border border-rose-300'
                            }`}>
                              {con.status || 'ACTIVO'}
                            </span>
                          )}

                          {/* MTOS PENDIENTES Pill - uses same logic as contract details modal */}
                          {(() => {
                            const getMtoPill = (pendingMtos: number, completedMtos: number, totalMtos: number) => {
                              const allDone = pendingMtos === 0;
                              const lastOne = pendingMtos === 1;
                              const pillClass = allDone
                                ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                                : lastOne
                                  ? 'bg-amber-100 border-amber-400 text-amber-900 animate-pulse'
                                  : 'bg-slate-100/90 border-slate-200 text-slate-700';
                              const icon = allDone
                                ? <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                : lastOne
                                  ? <span className="text-amber-500 shrink-0 leading-none">⚠️</span>
                                  : <FileText className="w-3 h-3 text-slate-500 shrink-0" />;
                              const label = allDone
                                ? `✓ TODO REALIZADO (${completedMtos}/${totalMtos})`
                                : `${pendingMtos} ${pendingMtos === 1 ? 'MTO PENDIENTE' : 'MTOS PENDIENTES'} (${completedMtos}/${totalMtos})`;
                              return (
                                <div className={`${pillClass} border font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center justify-center gap-1.5 shadow-2xs w-full`}>
                                  {icon}
                                  <span>{label}</span>
                                </div>
                              );
                            };

                            // Use the shared getContractMaintenanceStatus function if available (same logic as modal)
                            if (getContractMaintenanceStatus) {
                              const s = getContractMaintenanceStatus(con, workOrders);
                              if (s.total === 0) return null;
                              return getMtoPill(s.remaining, s.done, s.total);
                            }

                            // Fallback: manual count from maintenanceDates
                            const scheduledDates = con.maintenanceDates || [];
                            if (scheduledDates.length === 0) return null;
                            const totalMtos = scheduledDates.length;
                            const completedMtos = scheduledDates.filter((d: any) =>
                              typeof d === 'object' && (d.completed || d.status === 'completed' || d.status === 'Completado')
                            ).length;
                            const pendingMtos = Math.max(0, totalMtos - completedMtos);
                            return getMtoPill(pendingMtos, completedMtos, totalMtos);
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
                        </div>
                      </td>

                      {/* 9. DETALLE DE COBERTURA */}
                      <td className="px-2 py-2.5">
                        <div className="flex flex-col gap-1.5 text-3xs font-bold">
                          {con.coverage && (
                            <span className="text-slate-600 font-semibold text-3xs line-clamp-1 block mb-0.5">{con.coverage}</span>
                          )}

                          {/* ✨ Equipo Nuevo Badge */}
                          {con.isNewEquipment && (
                            <span className="inline-flex items-center gap-1 text-amber-900 bg-amber-100/90 border border-amber-300 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold shadow-2xs w-max">
                              ✨ Equipo Nuevo
                            </span>
                          )}

                          {/* 📄 Contrato PDF Button */}
                          {(() => {
                            const targetPdf = con.contractPdfUrl || con.pdfUrl;
                            if (!targetPdf) return null;
                            return (
                              <button
                                type="button"
                                onClick={() => triggerDirectDownload(targetPdf, `Contrato_${con.id}.pdf`)}
                                className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all w-max shadow-2xs cursor-pointer"
                                title="Descargar Documento del Contrato PDF"
                              >
                                📄 Contrato <ExternalLink className="w-2.5 h-2.5 text-emerald-600" />
                              </button>
                            );
                          })()}

                          {/* 🛠 Service Record (SR) PDF Button */}
                          {(() => {
                            const getValidUrl = (url?: string) => (url && typeof url === 'string' && url.trim().length > 5) ? url.trim() : null;
                            const srPdf = getValidUrl(con.serviceRecordPdfUrl) || 
                              getValidUrl(con.srPdfUrl) || 
                              con.equipmentItems?.map(e => getValidUrl(e.serviceRecordPdfUrl) || getValidUrl((e as any).srPdfUrl)).find(Boolean);
                            if (!srPdf) return null;
                            return (
                              <button
                                type="button"
                                onClick={() => triggerDirectDownload(srPdf, `SR_${con.id}.pdf`)}
                                className="inline-flex items-center gap-1 text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md text-[10px] font-extrabold transition-all w-max shadow-2xs cursor-pointer"
                                title="Descargar Service Record (SR) PDF"
                              >
                                🛠 SR <ExternalLink className="w-2.5 h-2.5 text-amber-600" />
                              </button>
                            );
                          })()}

                          {/* 📜 Certificate of Acceptance (CA) PDF Button */}
                          {(() => {
                            const getValidUrl = (url?: string) => (url && typeof url === 'string' && url.trim().length > 5) ? url.trim() : null;
                            const caPdf = getValidUrl(con.caPdfUrl) || 
                              con.equipmentItems?.map(e => getValidUrl(e.caPdfUrl)).find(Boolean);
                            if (!caPdf) return null;
                            return (
                              <button
                                type="button"
                                onClick={() => triggerDirectDownload(caPdf, `CA_${con.id}.pdf`)}
                                className="inline-flex items-center gap-1 text-orange-950 bg-orange-50 hover:bg-orange-100 border border-orange-300 px-2 py-0.5 rounded-md text-[10px] font-extrabold transition-all w-max shadow-2xs cursor-pointer"
                                title="Descargar Certificate of Acceptance (CA) PDF"
                              >
                                📜 CA <ExternalLink className="w-2.5 h-2.5 text-orange-600" />
                              </button>
                            );
                          })()}

                          {/* 📦 Proof of Delivery (POD) PDF Button */}
                          {(() => {
                            const getValidUrl = (url?: string) => (url && typeof url === 'string' && url.trim().length > 5) ? url.trim() : null;
                            const podPdf = getValidUrl(con.podPdfUrl) || 
                              con.equipmentItems?.map(e => getValidUrl(e.podPdfUrl)).find(Boolean);
                            if (!podPdf) return null;
                            return (
                              <button
                                type="button"
                                onClick={() => triggerDirectDownload(podPdf, `POD_${con.id}.pdf`)}
                                className="inline-flex items-center gap-1 text-sky-950 bg-sky-50 hover:bg-sky-100 border border-sky-300 px-2 py-0.5 rounded-md text-[10px] font-extrabold transition-all w-max shadow-2xs cursor-pointer"
                                title="Descargar Proof of Delivery (POD) PDF"
                              >
                                📦 POD <ExternalLink className="w-2.5 h-2.5 text-sky-600" />
                              </button>
                            );
                          })()}

                          {/* 📅 Cronograma PDF Button */}
                          {con.schedulePdfUrl && (
                            <button
                              type="button"
                              onClick={() => triggerDirectDownload(con.schedulePdfUrl!, `Cronograma_${con.id}.pdf`)}
                              className="inline-flex items-center gap-1 text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-300 px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all w-max shadow-2xs cursor-pointer"
                              title="Descargar Cronograma PDF"
                            >
                              📅 Cronograma <ExternalLink className="w-2.5 h-2.5 text-purple-600" />
                            </button>
                          )}

                          {/* Fallback if no coverage badges or PDFs exist */}
                          {!con.coverage && !con.isNewEquipment && !(con.contractPdfUrl || con.pdfUrl) && !con.schedulePdfUrl && !(con.serviceRecordPdfUrl || con.srPdfUrl || con.equipmentItems?.some(e => e.serviceRecordPdfUrl || e.srPdfUrl || e.caPdfUrl || e.podPdfUrl)) && (
                            <span className="text-slate-400 font-normal text-center block">-</span>
                          )}
                        </div>
                      </td>

                      {/* 10. ACCIONES */}
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {setSelectedContractForDetails && setIsContractDetailsModalOpen && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedContractForDetails(con);
                                setIsContractDetailsModalOpen(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer text-xs flex items-center gap-1 border border-indigo-100/80 shadow-2xs"
                              title="Ver Detalle del Contrato"
                            >
                              <Eye className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Ver Detalle</span>
                            </button>
                          )}
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
                            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer text-xs"
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
