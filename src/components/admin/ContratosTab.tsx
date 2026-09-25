import React, { useState, useMemo, useDeferredValue, useEffect, useRef, useCallback } from 'react';
import { Briefcase, Database, Plus, Search, FileSpreadsheet, Building, AlertCircle, Calendar, Tag, ShieldCheck, Clock, Shield, CheckCircle2, ChevronRight, Sparkles, Filter, ExternalLink, Eye, Pencil, Trash2, ArrowUpRight, Folder, Hourglass, BellRing, Ban, AlertTriangle, FileText, TrendingUp, CalendarRange, Users } from 'lucide-react';
import { Contract, Client, ContractGE, WorkOrder } from '../../types';
import { triggerDirectDownload } from '../../utils/cloudinary';

interface ContratosTabProps {
  workOrders?: WorkOrder[];
  contractsSubTab: 'garantias' | 'ge' | 'proyeccion';
  contracts: Contract[];
  clients: Client[];
  userRole: string;
  contractsGE: ContractGE[];
  contractSearch: string;
  setContractSearch: (val: string) => void;
  contractValueFilter: 'all' | 'valued' | 'unvalued';
  setContractValueFilter: (val: 'all' | 'valued' | 'unvalued') => void;
  contractSectorFilter?: 'all' | 'Público' | 'Privado';
  setContractSectorFilter?: (val: 'all' | 'Público' | 'Privado') => void;
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
  getContractExpirationAlert: (endDate: string, status: string, linkedContractId?: string) => { level: 'renewed' | 'expired' | 'urgent_1m' | 'warning_3m' | 'ok'; days: number; text: string; badgeText: string; colorClass: string } | null;
  getContractMaintenanceStatus?: (con: Contract, workOrders: WorkOrder[]) => { total: number; done: number; scheduled: number; unScheduled: number; remaining: number; hasNoPending: boolean; isAllScheduled: boolean };
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
  contractSectorFilter = 'all',
  setContractSectorFilter,
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

  // Autonomous local search states with debouncing so typing is ultra-fluid
  const [localContractSearch, setLocalContractSearch] = useState(contractSearch);
  const [debouncedContractSearch, setDebouncedContractSearch] = useState(contractSearch);
  const [localContractGeSearch, setLocalContractGeSearch] = useState(contractGeSearch);
  const [debouncedContractGeSearch, setDebouncedContractGeSearch] = useState(contractGeSearch);

  // New filters requested by user: Tipo de contrato, Estado, Fechas Inicio & Vencimiento
  const [contractTypeFilter, setContractTypeFilter] = useState<string>('all');
  const [contractStatusFilter, setContractStatusFilter] = useState<string>('all');
  const [contractStartDate, setContractStartDate] = useState<string>('');
  const [contractEndDate, setContractEndDate] = useState<string>('');

  // 150ms debouncing for instant keystroke rendering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedContractSearch(localContractSearch);
    }, 150);
    return () => clearTimeout(timer);
  }, [localContractSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedContractGeSearch(localContractGeSearch);
    }, 150);
    return () => clearTimeout(timer);
  }, [localContractGeSearch]);

  useEffect(() => {
    if (contractSearch === '') {
      setLocalContractSearch('');
      setDebouncedContractSearch('');
    }
  }, [contractSearch]);

  useEffect(() => {
    if (contractGeSearch === '') {
      setLocalContractGeSearch('');
      setDebouncedContractGeSearch('');
    }
  }, [contractGeSearch]);

  // Sync contractStatusFilter with contractFilterExpiration
  useEffect(() => {
    if (contractFilterExpiration) {
      setContractStatusFilter(contractFilterExpiration);
    } else if (contractStatusFilter !== 'activo') {
      setContractStatusFilter('all');
    }
  }, [contractFilterExpiration]);

  // Distinct contract types extracted from actual contracts
  const contractTypesList = useMemo(() => {
    const types = new Set<string>();
    contracts.forEach(c => {
      if (c.type && c.type.trim()) types.add(c.type.trim());
    });
    return Array.from(types).sort();
  }, [contracts]);

  // Persistent cache for getContractMaintenanceStatus to avoid recomputing on render/typing
  const maintStatusCacheRef = useRef<Map<string, any>>(new Map());
  useEffect(() => {
    maintStatusCacheRef.current.clear();
  }, [contracts, workOrders, getContractMaintenanceStatus]);

  const getCachedMaintenanceStatus = useCallback((con: Contract) => {
    if (!getContractMaintenanceStatus) return null;
    if (maintStatusCacheRef.current.has(con.id)) {
      return maintStatusCacheRef.current.get(con.id);
    }
    const res = getContractMaintenanceStatus(con, workOrders || []);
    maintStatusCacheRef.current.set(con.id, res);
    return res;
  }, [workOrders, getContractMaintenanceStatus]);

  const deferredContractSearch = debouncedContractSearch;
  const deferredContractGeSearch = debouncedContractGeSearch;

  const queryGE = deferredContractGeSearch.toLowerCase().trim();
  const filteredGE = useMemo(() => {
    if (!queryGE) return contractsGE;
    return contractsGE.filter(c => {
      let name = (c.cliente || 'Desconocido').trim();
      name = name.replace(/\uFFFD/g, 'í').replace(/Mara/g, 'María').trim();
      return (
        name.toLowerCase().includes(queryGE) ||
        (c.sid || '').toLowerCase().includes(queryGE) ||
        (c.modalidad || '').toLowerCase().includes(queryGE) ||
        (c.equipo || '').toLowerCase().includes(queryGE) ||
        c.invoice.toLowerCase().includes(queryGE) ||
        (c.contractNum || '').toLowerCase().includes(queryGE) ||
        (c.paymentPeriod || '').toLowerCase().includes(queryGE) ||
        (c.observaciones || '').toLowerCase().includes(queryGE)
      );
    });
  }, [contractsGE, queryGE]);

  // Garantías Subview: estos hooks se calculan aquí, ANTES del branch condicional de 'ge' más
  // abajo, para que se ejecute siempre el mismo número de hooks sin importar la sub-pestaña
  // activa (Reglas de los Hooks) — de lo contrario React lanza el error "Rendered fewer hooks
  // than expected" al alternar entre Garantías y GE.
  const query = deferredContractSearch.toLowerCase().trim();

  // Mapa de clientes para lookup O(1) de alto rendimiento
  const clientsByIdMap = useMemo(() => {
    const map = new Map<string, Client>();
    clients.forEach(c => map.set(c.id, c));
    return map;
  }, [clients]);

  // Pre-index contracts for instant client name search
  const indexedContracts = useMemo(() => {
    return contracts.map(con => {
      const client = clientsByIdMap.get(con.clientId);
      const clientName = client?.name || '';
      const _clientSearchStr = `${clientName} ${con.clientId} ${con.id} ${client?.city || con.city || ''}`.toLowerCase();
      return {
        con,
        client,
        _clientSearchStr
      };
    });
  }, [contracts, clientsByIdMap]);

  const filtered = useMemo(() => {
    return indexedContracts
      .filter(({ con, client, _clientSearchStr }) => {
        // 1. Buscador centrado en el cliente
        if (query && !_clientSearchStr.includes(query)) return false;

        // 2. Filtro por Tipo de Contrato
        if (contractTypeFilter !== 'all' && con.type !== contractTypeFilter) return false;

        // 3. Filtro por Fecha de Inicio y Fecha de Vencimiento
        if (contractStartDate && contractEndDate) {
          if (contractStartDate === contractEndDate) {
            if (!con.startDate?.startsWith(contractStartDate) && !con.endDate?.startsWith(contractEndDate)) return false;
          } else if (contractStartDate < contractEndDate) {
            if (!con.startDate || con.startDate < contractStartDate) return false;
            if (!con.endDate || con.endDate > contractEndDate) return false;
          } else {
            if (!con.startDate?.startsWith(contractStartDate)) return false;
            if (!con.endDate?.startsWith(contractEndDate)) return false;
          }
        } else if (contractStartDate) {
          if (!con.startDate || !con.startDate.startsWith(contractStartDate)) return false;
        } else if (contractEndDate) {
          if (!con.endDate || !con.endDate.startsWith(contractEndDate)) return false;
        }

        // 4. Filtro por Estado
        const effectiveStatus = contractStatusFilter !== 'all' ? contractStatusFilter : contractFilterExpiration;
        if (effectiveStatus && effectiveStatus !== 'all') {
          const expAlert = getContractExpirationAlert(con.endDate, con.status, con.linkedContractId);
          if (effectiveStatus === 'activo') {
            // con.status === 'Vencido' se revisa aparte de expAlert.level: si el contrato ya tiene
            // un sucesor vinculado, getContractExpirationAlert prioriza el nivel "renewed" y nunca
            // marca "expired", aunque el contrato en sí siga con status Vencido.
            if (con.status === 'Inactivo' || con.status === 'Vencido' || expAlert?.level === 'expired') return false;
          } else if (effectiveStatus === '1m' && expAlert?.level !== 'urgent_1m') {
            return false;
          } else if (effectiveStatus === '3m' && expAlert?.level !== 'warning_3m') {
            return false;
          } else if (effectiveStatus === 'expired' && (expAlert?.level !== 'expired' || (con.linkedContractId && con.linkedContractId.trim() !== ''))) {
            return false;
          } else if (effectiveStatus === 'pending_admin') {
            const isPending = !con.schedulePdfUrl && (con.pendingAdminSchedule || (con.maintenanceFrequency === 'Ninguno' && (!con.maintenanceDates || con.maintenanceDates.length === 0)));
            if (!isPending) return false;
          } else if (effectiveStatus === 'inactivo' && con.status !== 'Inactivo') {
            return false;
          }
        }

        // 5. Filtro por Valor
        if (contractValueFilter === 'unvalued') {
          if (con.contractValue && con.contractValue > 0) return false;
        } else if (contractValueFilter === 'valued') {
          if (!con.contractValue || con.contractValue <= 0) return false;
        }

        // 6. Filtro por Marca
        if (contractFilterBrand !== 'all') {
          const hasBrand = (con.equipmentItems || []).some(
            e => normalizeBrandName(e.brand).toLowerCase() === contractFilterBrand.toLowerCase()
          );
          if (!hasBrand) return false;
        }

        // 7. Filtro por Sector
        if (contractSectorFilter !== 'all') {
          const conSector = con.sector || (client?.industry?.toLowerCase().includes('público') || client?.industry?.toLowerCase().includes('publico') || client?.name.toUpperCase().includes('MSP') || client?.name.toUpperCase().includes('IESS') || client?.name.toUpperCase().includes('SOLCA') || client?.name.toUpperCase().includes('HOSPITAL') ? 'Público' : 'Privado');
          if (conSector !== contractSectorFilter) return false;
        }

        return true;
      })
      .map(item => item.con);
  }, [
    indexedContracts,
    query,
    contractTypeFilter,
    contractStatusFilter,
    contractStartDate,
    contractEndDate,
    contractValueFilter,
    contractFilterBrand,
    contractSectorFilter,
    contractFilterExpiration,
    getContractExpirationAlert
  ]);

  // Memoize KPI counts to avoid 5 full array scans with date math on every render
  const contractKpiCounts = useMemo(() => {
    let pendingAdmin = 0;
    let urgent1m = 0;
    let warning3m = 0;
    let inactivo = 0;
    let expired = 0;

    for (let i = 0; i < contracts.length; i++) {
      const c = contracts[i];
      if (!c.schedulePdfUrl && (c.pendingAdminSchedule || (c.maintenanceFrequency === 'Ninguno' && (!c.maintenanceDates || c.maintenanceDates.length === 0)))) {
        pendingAdmin++;
      }
      const expAlert = getContractExpirationAlert ? getContractExpirationAlert(c.endDate, c.status, c.linkedContractId) : null;
      if (expAlert?.level === 'urgent_1m') urgent1m++;
      if (expAlert?.level === 'warning_3m') warning3m++;
      if (c.status === 'Inactivo') inactivo++;
      if (expAlert?.level === 'expired' && (!c.linkedContractId || c.linkedContractId.trim() === '')) expired++;
    }

    return { pendingAdmin, urgent1m, warning3m, inactivo, expired };
  }, [contracts, getContractExpirationAlert]);

  if (contractsSubTab === 'ge') {

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
      const m = Number(c.months) || 0;
      if (m >= 1 && m <= 6) dur1_6++;
      else if (m >= 7 && m <= 12) dur7_12++;
      else if (m >= 13 && m <= 24) dur13_24++;
      else if (m > 24) dur25Plus++;
    });

    const renewalAlerts = contractsGE.filter(c => c.observaciones && c.observaciones.toLowerCase().includes('renovacion'));

    return (
      <div className="space-y-6 font-sans">
        {/* GE Header Toolbar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileSpreadsheet className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
              Dashboard de Contratos con GE & Facturación
            </h4>
            <p className="text-3xs text-slate-500 dark:text-slate-500 mt-0.5 font-medium">
              Control ejecutivo de facturación, modalidades (CT, MR, SURGERY), coberturas y renovaciones.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <button
              type="button"
              onClick={() => setIsGeDashboardExpanded(!isGeDashboardExpanded)}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-3xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-500" />
              <span>{isGeDashboardExpanded ? '⏱ Ocultar Dashboard' : '📊 Mostrar Dashboard'}</span>
            </button>

            <button
              type="button"
              onClick={exportContractsGeToExcel}
              className="bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-semibold text-3xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>📊 Exportar Excel</span>
            </button>

            {userRole === 'admin' && (
              <button
                onClick={() => setIsContractGeImporterOpen(!isContractGeImporterOpen)}
                className={`font-semibold text-3xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 border transition-all cursor-pointer ${
                  isContractGeImporterOpen
                    ? 'bg-amber-600 border-amber-600 text-white'
                    : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-xs space-y-3">
            <div className="border-b border-slate-100 dark:border-slate-700 pb-2 flex justify-between items-center">
              <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wider font-mono">📥 Ingestor de Contratos GE (CSV)</h5>
            </div>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept=".csv"
                onChange={handleContractGeCsvUpload}
                className="block w-full text-3xs text-slate-500 dark:text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-3xs file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-950 file:text-indigo-700 dark:file:text-indigo-300 file:cursor-pointer hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900 transition-all"
              />
              {contractGeCsvError && (
                <div className="text-3xs text-rose-700 dark:text-rose-300 font-bold bg-rose-50 dark:bg-rose-950 p-2 rounded-lg border border-rose-100 dark:border-rose-800 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-500" />
                  <span>{contractGeCsvError}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Top 4 Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-extrabold uppercase tracking-wide text-slate-400 dark:text-slate-500">Total Facturado GE</span>
              <span className="text-xl font-black text-indigo-700 dark:text-indigo-300">${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Volumen Total USD acumulado</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base shadow-2xs">
              💰
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-extrabold uppercase tracking-wide text-slate-400 dark:text-slate-500">Total Registros GE</span>
              <span className="text-xl font-black text-slate-800 dark:text-slate-100">{filteredGE.length} Facturas</span>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">{contractsGE.length} guardadas en Firestore</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-base shadow-2xs">
              🧾
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-extrabold uppercase tracking-wide text-slate-400 dark:text-slate-500">Cliente con Más Facturas</span>
              <span className="text-sm font-black text-indigo-700 dark:text-indigo-300 truncate max-w-[140px] block">{topClientsByCount[0]?.name || 'N/A'}</span>
              <p className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">{topClientsByCount[0]?.count || 0} Facturas registradas</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base shadow-2xs">
              🏆
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
            <div>
              <span className="block text-[10px] font-extrabold uppercase tracking-wide text-slate-400 dark:text-slate-500">Renovaciones & Alertas</span>
              <span className="text-xl font-black text-amber-600 dark:text-amber-400">{renewalAlerts.length} Pendientes</span>
              <p className="text-[9px] text-amber-700 dark:text-amber-300 font-semibold mt-0.5">{withObsCount} observaciones notas</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-base shadow-2xs">
              ⚠️
            </div>
          </div>
        </div>

        {/* Visual Analytics Executive Cards Section */}
        {isGeDashboardExpanded && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Card 1: Top 5 Clientes por Cantidad de Facturas */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-2">
                <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Clientes con Más Facturas (N° Facturas)</span>
                </h5>
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Top 5</span>
              </div>
              <div className="space-y-2.5">
                {topClientsByCount.length === 0 ? (
                  <p className="text-3xs text-slate-400 dark:text-slate-500 italic">No hay datos suficientes.</p>
                ) : (
                  topClientsByCount.map((client, idx) => {
                    const pct = filteredGE.length > 0 ? (client.count / filteredGE.length) * 100 : 0;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-3xs">
                          <div className="truncate max-w-[170px]">
                            <span className="font-extrabold text-slate-900 dark:text-slate-100 block truncate">{client.name}</span>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold font-mono">${client.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-mono font-black text-indigo-700 dark:text-indigo-300 block text-xs">
                              {client.count} factura{client.count !== 1 ? 's' : ''}
                            </span>
                            <span className="text-[9px] font-bold text-indigo-500 dark:text-indigo-500">
                              {pct.toFixed(1)}% del total
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden flex">
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
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-2">
                <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Clientes con Mayor Facturación ($ USD)</span>
                </h5>
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Top 5</span>
              </div>
              <div className="space-y-2.5">
                {topClientsByAmount.length === 0 ? (
                  <p className="text-3xs text-slate-400 dark:text-slate-500 italic">No hay datos suficientes.</p>
                ) : (
                  topClientsByAmount.map((client, idx) => {
                    const pct = totalAmount > 0 ? (client.totalAmount / totalAmount) * 100 : 0;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-3xs">
                          <div className="truncate max-w-[160px]">
                            <span className="font-extrabold text-slate-900 dark:text-slate-100 block truncate">{client.name}</span>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold">{client.count} factura{client.count !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-mono font-black text-emerald-700 dark:text-emerald-300 block text-xs">
                              ${client.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                              {pct.toFixed(1)}% del total
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden flex">
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
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-2">
                <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <CalendarRange className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Duración Cobertura (Meses)</span>
                </h5>
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Rango Meses</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-center">
                  <span className="block text-[9px] font-bold text-slate-500 dark:text-slate-500 uppercase">1 - 6 Meses</span>
                  <span className="text-base font-black text-slate-800 dark:text-slate-100">{dur1_6} Facturas</span>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 p-3 rounded-xl text-center">
                  <span className="block text-[9px] font-bold text-indigo-700 dark:text-indigo-300 uppercase">7 - 12 Meses</span>
                  <span className="text-base font-black text-indigo-900 dark:text-indigo-300">{dur7_12} Facturas</span>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 p-3 rounded-xl text-center">
                  <span className="block text-[9px] font-bold text-purple-700 dark:text-purple-300 uppercase">13 - 24 Meses</span>
                  <span className="text-base font-black text-purple-900 dark:text-purple-300">{dur13_24} Facturas</span>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-3 rounded-xl text-center">
                  <span className="block text-[9px] font-bold text-amber-700 dark:text-amber-300 uppercase">&gt; 24 Meses</span>
                  <span className="text-base font-black text-amber-900 dark:text-amber-300">{dur25Plus} Facturas</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GE Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-2xs">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Buscar por cliente, SID, modalidad, equipo, invoice, periodo, observaciones..."
              value={localContractGeSearch}
              onChange={(e) => setLocalContractGeSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-8 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-hidden focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all placeholder-slate-400 dark:placeholder-slate-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            {localContractGeSearch && (
              <button
                type="button"
                onClick={() => {
                  setLocalContractGeSearch('');
                  setContractGeSearch('');
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
          <span className="text-3xs font-mono font-black text-slate-500 dark:text-slate-500 uppercase tracking-wider px-2">
            {filteredGE.length} REGISTROS GE ENCONTRADOS
          </span>
        </div>

        {/* Full 12-Column GE Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase text-slate-500 dark:text-slate-500 tracking-wider">
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
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-medium text-xs">
                {filteredGE.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="p-8 text-center text-slate-400 dark:text-slate-500 text-3xs font-bold uppercase tracking-wider">
                      No se encontraron contratos GE registrados.
                    </td>
                  </tr>
                ) : (
                  filteredGE.map(c => {
                    let cleanName = (c.cliente || 'Desconocido').trim();
                    cleanName = cleanName.replace(/\uFFFD/g, 'í').replace(/Mara/g, 'María').trim();

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors">
                        {/* 1. CLIENTE */}
                        <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{cleanName}</td>

                        {/* 2. SID / MODALIDAD */}
                        <td className="p-3.5">
                          <div className="flex flex-col">
                            <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300 text-xs">{c.sid || '-'}</span>
                            {c.modalidad && (
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">{c.modalidad}</span>
                            )}
                          </div>
                        </td>

                        {/* 3. EQUIPO */}
                        <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">{c.equipo || '-'}</td>

                        {/* 4. INVOICE */}
                        <td className="p-3.5 font-mono font-extrabold text-indigo-900 dark:text-indigo-300 text-xs">{c.invoice}</td>

                        {/* 5. INVOICE AMOUNT */}
                        <td className="p-3.5 text-right font-mono font-black text-emerald-700 dark:text-emerald-300 text-xs">
                          ${(c.invoiceAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        {/* 6. MONTHS */}
                        <td className="p-3.5 text-center font-mono font-bold text-slate-700 dark:text-slate-300">{c.months || '-'}</td>

                        {/* 7. FECHA FACTURA */}
                        <td className="p-3.5">
                          <div className="flex flex-col text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                            <span>{c.invoiceDate || '-'}</span>
                            {c.dueDate && (
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold">Venc: {c.dueDate}</span>
                            )}
                          </div>
                        </td>

                        {/* 8. PERIODO / #MES */}
                        <td className="p-3.5">
                          <div className="flex flex-col text-[10px] font-bold text-indigo-950 dark:text-indigo-300">
                            <span>{c.paymentPeriod || '-'}</span>
                            {c.monthNum && (
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold">#Mes: {c.monthNum}</span>
                            )}
                          </div>
                        </td>

                        {/* 9. CONTRATO */}
                        <td className="p-3.5 text-center">
                          {c.contractNum ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono font-extrabold text-3xs border border-indigo-200 dark:border-indigo-800">
                              {c.contractNum}
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 font-normal">-</span>
                          )}
                        </td>

                        {/* 10. OBSERVACIONES / COMMENTS */}
                        <td className="p-3.5 max-w-[200px]">
                          {c.observaciones ? (
                            <span className="text-3xs text-slate-600 dark:text-slate-300 font-medium line-clamp-2" title={c.observaciones}>
                              {c.observaciones}
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 font-normal">-</span>
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
                              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900 font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer text-xs"
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
                                className="p-1.5 text-rose-500 dark:text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900 rounded-md transition-colors cursor-pointer"
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

  // Garantías Subview (query, clientsByIdMap, indexedContracts, filtered y contractKpiCounts
  // ahora se calculan más arriba, antes del branch de 'ge', para respetar las Reglas de los Hooks)
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
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-indigo-300 dark:hover:border-indigo-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <Folder className={`w-4 h-4 ${contractFilterExpiration === null ? 'text-indigo-200' : 'text-indigo-600 dark:text-indigo-400'}`} />
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
              contractFilterExpiration === null ? 'bg-white/20 text-white' : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
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
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-amber-300 dark:hover:border-amber-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <Hourglass className={`w-4 h-4 ${contractFilterExpiration === 'pending_admin' ? 'text-amber-100' : 'text-amber-500 dark:text-amber-500'}`} />
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
              contractFilterExpiration === 'pending_admin' ? 'bg-white/20 text-white' : 'bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
            }`}>
              PENDIENTE
            </span>
          </div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider mt-2 opacity-80">SIN CRONOGRAMA</p>
          <h4 className="text-lg font-black mt-0.5">
            {contractKpiCounts.pendingAdmin} <span className="text-3xs font-semibold opacity-70">Contratos</span>
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
              : 'bg-rose-50/50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-slate-800 dark:text-slate-100 hover:border-rose-300 dark:hover:border-rose-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <BellRing className={`w-4 h-4 ${contractFilterExpiration === '1m' ? 'text-rose-100' : 'text-rose-600 dark:text-rose-400'}`} />
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
              contractFilterExpiration === '1m' ? 'bg-white/20 text-white' : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
            }`}>
              1 MES
            </span>
          </div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider mt-2 text-rose-900 dark:text-rose-300 opacity-90">POR VENCER (1M)</p>
          <h4 className="text-lg font-black mt-0.5 text-rose-950 dark:text-rose-300">
            {contractKpiCounts.urgent1m} <span className="text-3xs font-semibold opacity-70">Contratos</span>
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
              : 'bg-amber-50/40 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-slate-800 dark:text-slate-100 hover:border-amber-300 dark:hover:border-amber-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <AlertTriangle className={`w-4 h-4 ${contractFilterExpiration === '3m' ? 'text-amber-100' : 'text-amber-600 dark:text-amber-400'}`} />
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
              contractFilterExpiration === '3m' ? 'bg-white/20 text-white' : 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300'
            }`}>
              3 MESES
            </span>
          </div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider mt-2 text-amber-900 dark:text-amber-300 opacity-90">POR VENCER (3M)</p>
          <h4 className="text-lg font-black mt-0.5 text-amber-950 dark:text-amber-300">
            {contractKpiCounts.warning3m} <span className="text-3xs font-semibold opacity-70">Contratos</span>
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
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <Ban className={`w-4 h-4 ${contractFilterExpiration === 'inactivo' ? 'text-slate-200' : 'text-slate-500 dark:text-slate-500'}`} />
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
              contractFilterExpiration === 'inactivo' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
              INACTIVOS
            </span>
          </div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider mt-2 opacity-80">NO RENOVADOS</p>
          <h4 className="text-lg font-black mt-0.5">
            {contractKpiCounts.inactivo} <span className="text-3xs font-semibold opacity-70">Contratos</span>
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
              : 'bg-red-50/40 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-slate-800 dark:text-slate-100 hover:border-red-300 dark:hover:border-red-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
              contractFilterExpiration === 'expired' ? 'bg-white/20 text-white' : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
            }`}>
              VENCIDOS
            </span>
          </div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider mt-2 text-red-900 dark:text-red-300 opacity-90">VENCIDOS TOTAL</p>
          <h4 className="text-lg font-black mt-0.5 text-red-950 dark:text-red-300">
            {contractKpiCounts.expired} <span className="text-3xs font-semibold opacity-70">Contratos</span>
          </h4>
        </button>
      </div>

      {/* Header Action Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
        <div>
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Gestión de Contratos y Garantías
          </h4>
          <p className="text-3xs text-slate-500 dark:text-slate-500 mt-0.5 font-medium">Administra los contratos de servicio, garantías comerciales y coberturas de mantenimiento.</p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <button
            type="button"
            onClick={exportContractsToExcel}
            className="bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-semibold text-3xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>📊 Exportar Excel</span>
          </button>

          {userRole === 'admin' && (
            <button
              onClick={() => setIsContractImporterOpen(!isContractImporterOpen)}
              className={`font-semibold text-3xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 border transition-all cursor-pointer ${
                isContractImporterOpen
                  ? 'bg-amber-600 border-amber-600 text-white'
                  : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-xs space-y-3">
          <div className="border-b border-slate-100 dark:border-slate-700 pb-2 flex justify-between items-center">
            <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wider font-mono">📥 Ingestor de Contratos (CSV)</h5>
          </div>
          <div className="flex flex-col gap-2">
            <input
              type="file"
              accept=".csv"
              onChange={handleContractCsvUpload}
              className="block w-full text-3xs text-slate-500 dark:text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-3xs file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-950 file:text-indigo-700 dark:file:text-indigo-300 file:cursor-pointer hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900 transition-all"
            />
            {contractCsvError && (
              <div className="text-3xs text-rose-700 dark:text-rose-300 font-bold bg-rose-50 dark:bg-rose-950 p-2 rounded-lg border border-rose-100 dark:border-rose-800 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-500" />
                <span>{contractCsvError}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Executive Search & Filter Control Bar */}
      <div className="bg-gradient-to-r from-slate-50 dark:from-slate-900 via-white dark:via-slate-950 to-slate-50 dark:to-slate-900 border border-slate-200/90 dark:border-slate-700/90 p-3.5 rounded-2xl shadow-xs space-y-3">
        {/* Row 1: Buscador de Cliente + Dropdowns Principales */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
          {/* Search input specifically for Client Name */}
          <div className="relative flex-1 min-w-[280px]">
            <input
              type="text"
              placeholder="Buscar por nombre de cliente..."
              value={localContractSearch}
              onChange={(e) => {
                setLocalContractSearch(e.target.value);
                setContractPage(1);
              }}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15 dark:focus:ring-indigo-400/15 rounded-xl pl-9 pr-8 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 outline-hidden transition-all shadow-2xs placeholder-slate-400 dark:placeholder-slate-500"
            />
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400 absolute left-3 top-1/2 -translate-y-1/2" />
            {localContractSearch && (
              <button
                type="button"
                onClick={() => {
                  setLocalContractSearch('');
                  setDebouncedContractSearch('');
                  setContractSearch('');
                  setContractPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Tipo de Contrato Dropdown */}
            <div className="relative">
              <select
                value={contractTypeFilter}
                onChange={(e) => {
                  setContractTypeFilter(e.target.value);
                  setContractPage(1);
                }}
                className={`appearance-none bg-white dark:bg-slate-900 border text-xs font-extrabold px-3.5 py-2 pr-7 rounded-xl shadow-2xs transition-all cursor-pointer outline-hidden ${
                  contractTypeFilter !== 'all'
                    ? 'border-amber-400 dark:border-amber-700 bg-amber-50/60 dark:bg-amber-950/60 text-amber-950 dark:text-amber-300 ring-2 ring-amber-500/10 dark:ring-amber-400/10'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <option value="all">📑 TIPO: Todos los Tipos</option>
                {contractTypesList.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
            </div>

            {/* Estado Dropdown */}
            <div className="relative">
              <select
                value={contractStatusFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setContractStatusFilter(val);
                  if (val === 'all') setContractFilterExpiration(null);
                  else if (val === 'activo') setContractFilterExpiration(null);
                  else setContractFilterExpiration(val as any);
                  setContractPage(1);
                }}
                className={`appearance-none text-xs font-extrabold px-3.5 py-2 pr-7 rounded-xl shadow-2xs transition-all cursor-pointer outline-hidden ${
                  contractStatusFilter !== 'all'
                    ? 'bg-indigo-100/80 dark:bg-indigo-950/80 border border-indigo-400 dark:border-indigo-700 text-indigo-950 dark:text-indigo-300 ring-2 ring-indigo-500/10 dark:ring-indigo-400/10'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <option value="all">🛡️ ESTADO: Todos los Estados</option>
                <option value="activo">✓ Solo Activos</option>
                <option value="inactivo">🚫 Inactivos / No Renovados</option>
                <option value="1m">⏰ Por Vencer (1 Mes)</option>
                <option value="3m">⚠️ Por Vencer (3 Meses)</option>
                <option value="expired">🔴 Vencidos</option>
                <option value="pending_admin">⏳ Sin Cronograma</option>
              </select>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
            </div>

            {/* Marca Dropdown */}
            <div className="relative">
              <select
                value={contractFilterBrand}
                onChange={(e) => {
                  setContractFilterBrand(e.target.value);
                  setContractPage(1);
                }}
                className={`appearance-none bg-white dark:bg-slate-900 border text-xs font-extrabold px-3.5 py-2 pr-7 rounded-xl shadow-2xs transition-all cursor-pointer outline-hidden ${
                  contractFilterBrand !== 'all'
                    ? 'border-indigo-400 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-300 ring-2 ring-indigo-500/10 dark:ring-indigo-400/10'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <option value="all">🏷️ MARCA: Todas las Marcas</option>
                {Array.from(new Set(contracts.flatMap(c => (c.equipmentItems || []).map(e => e.brand).filter(Boolean)))).map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
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
                    ? 'bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-400 dark:border-emerald-700 text-emerald-950 dark:text-emerald-300 ring-2 ring-emerald-500/10 dark:ring-emerald-400/10'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <option value="all">💲 VALOR: Todos los Valores</option>
                <option value="valued">💲 Con Valor ($ &gt; 0)</option>
                <option value="unvalued">💲 Sin Valor ($0 / Sin Precio)</option>
              </select>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
            </div>

            {/* Sector Dropdown */}
            <div className="relative">
              <select
                value={contractSectorFilter}
                onChange={(e) => {
                  if (setContractSectorFilter) setContractSectorFilter(e.target.value as any);
                  setContractPage(1);
                }}
                className={`appearance-none text-xs font-extrabold px-3.5 py-2 pr-7 rounded-xl shadow-2xs transition-all cursor-pointer outline-hidden ${
                  contractSectorFilter !== 'all'
                    ? 'bg-blue-100/80 dark:bg-blue-950/80 border border-blue-400 dark:border-blue-700 text-blue-950 dark:text-blue-300 ring-2 ring-blue-500/10 dark:ring-blue-400/10'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <option value="all">🏢 SECTOR: Todos los Sectores</option>
                <option value="Público">🏛️ Público (MSP / IESS / FFAA)</option>
                <option value="Privado">🏢 Privado</option>
              </select>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
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
                    ? 'bg-purple-100/80 dark:bg-purple-950/80 border border-purple-400 dark:border-purple-700 text-purple-950 dark:text-purple-300 ring-2 ring-purple-500/10 dark:ring-purple-400/10'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <option value="none">📅 ORDENAR: Por Defecto</option>
                <option value="start_asc">Fecha Inicio (Antigua primero)</option>
                <option value="start_desc">Fecha Inicio (Reciente primero)</option>
                <option value="end_asc">Fecha Vencimiento (Próxima a Vencer)</option>
                <option value="end_desc">Fecha Vencimiento (Lejana a Vencer)</option>
              </select>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Row 2: Filtros de Fecha de Inicio y Vencimiento + Botón Limpiar y Contador */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60">
          <div className="flex flex-wrap items-center gap-3">
            {/* Fecha Inicio */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl px-2.5 py-1.5 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-500 tracking-wider">Inicio:</span>
              <input
                type="date"
                value={contractStartDate}
                onChange={(e) => {
                  setContractStartDate(e.target.value);
                  setContractPage(1);
                }}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-0.5 text-3xs font-bold text-slate-700 dark:text-slate-300 outline-hidden hover:border-indigo-400 dark:hover:border-indigo-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                title="Filtrar por Fecha de Inicio"
              />
              {contractStartDate && (
                <button
                  type="button"
                  onClick={() => {
                    setContractStartDate('');
                    setContractPage(1);
                  }}
                  className="text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 text-xs ml-0.5 cursor-pointer font-bold"
                  title="Limpiar fecha de inicio"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Fecha Vencimiento */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-xl px-2.5 py-1.5 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-500 tracking-wider">Vencimiento:</span>
              <input
                type="date"
                value={contractEndDate}
                onChange={(e) => {
                  setContractEndDate(e.target.value);
                  setContractPage(1);
                }}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-0.5 text-3xs font-bold text-slate-700 dark:text-slate-300 outline-hidden hover:border-rose-400 dark:hover:border-rose-500 focus:border-rose-500 dark:focus:border-rose-400 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                title="Filtrar por Fecha de Vencimiento"
              />
              {contractEndDate && (
                <button
                  type="button"
                  onClick={() => {
                    setContractEndDate('');
                    setContractPage(1);
                  }}
                  className="text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 text-xs ml-0.5 cursor-pointer font-bold"
                  title="Limpiar fecha de vencimiento"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Reset Filters Pill */}
            {(contractFilterBrand !== 'all' || contractValueFilter !== 'all' || contractSectorFilter !== 'all' || contractDateSort !== 'none' || localContractSearch.trim() !== '' || contractFilterExpiration !== null || contractTypeFilter !== 'all' || contractStatusFilter !== 'all' || contractStartDate || contractEndDate) && (
              <button
                type="button"
                onClick={() => {
                  setContractFilterBrand('all');
                  setContractValueFilter('all');
                  if (setContractSectorFilter) setContractSectorFilter('all');
                  setContractDateSort('none');
                  setLocalContractSearch('');
                  setDebouncedContractSearch('');
                  setContractSearch('');
                  setContractTypeFilter('all');
                  setContractStatusFilter('all');
                  setContractStartDate('');
                  setContractEndDate('');
                  setContractFilterExpiration(null);
                  setContractPage(1);
                }}
                className="bg-rose-50 dark:bg-rose-950 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-extrabold px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                title="Limpiar todos los filtros"
              >
                <span>✕ Limpiar</span>
              </button>
            )}

            {/* Results Badge Counter */}
            <div className="bg-slate-900 text-white font-mono text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl shadow-xs border border-slate-800 flex items-center gap-1.5 shrink-0 ml-auto xl:ml-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Mostrando {paginated.length} de {sorted.length} contratos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full 10-Column Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase text-slate-500 dark:text-slate-500 tracking-wider">
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
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-medium text-xs">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400 dark:text-slate-500 text-3xs font-bold uppercase tracking-wider">
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
                    ? 'border-l-4 border-l-amber-500 bg-amber-50/20 dark:bg-amber-950/20 hover:bg-amber-50/30 dark:hover:bg-amber-900/30'
                    : expAlert?.level === 'urgent_1m'
                    ? 'border-l-4 border-l-rose-500 bg-rose-50/20 dark:bg-rose-950/20 hover:bg-rose-50/30 dark:hover:bg-rose-900/30'
                    : expAlert?.level === 'expired'
                    ? 'border-l-4 border-l-red-600 bg-red-50/20 dark:bg-red-950/20 hover:bg-red-50/30 dark:hover:bg-red-900/30'
                    : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/60';

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
                              className="font-extrabold text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 hover:underline font-mono text-xs text-left cursor-pointer flex items-center gap-1.5 group"
                              title="Ver Detalle del Contrato"
                            >
                              <span>{con.id}</span>
                              <Eye className="w-3 h-3 text-indigo-400 dark:text-indigo-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                            </button>
                          ) : (
                            <span className="font-extrabold text-slate-900 dark:text-slate-100 font-mono text-xs">{con.id}</span>
                          )}
                          {con.linkedContractId && (
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">Vínculo: {con.linkedContractId}</span>
                          )}
                        </div>
                      </td>

                      {/* 2. CLIENTE */}
                      <td className="px-3 py-2.5 font-bold text-slate-800 dark:text-slate-100">
                        <div className="flex flex-col justify-center">
                          <span className="font-black text-xs text-slate-950 dark:text-slate-100 leading-snug tracking-tight">{client?.name || con.clientId}</span>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-500 dark:text-slate-500 font-bold">📍 {client?.city || con.city || 'Quito'}</span>
                            {(() => {
                              const sec = con.sector || (client?.industry?.toLowerCase().includes('público') || client?.industry?.toLowerCase().includes('publico') || client?.name.toUpperCase().includes('MSP') || client?.name.toUpperCase().includes('IESS') || client?.name.toUpperCase().includes('SOLCA') || client?.name.toUpperCase().includes('HOSPITAL') ? 'Público' : 'Privado');
                              return (
                                <span className={`text-[8.5px] font-black uppercase px-1.5 py-0.2 rounded border ${
                                  sec === 'Público'
                                    ? 'bg-purple-100/80 dark:bg-purple-950/80 text-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                                    : 'bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                }`}>
                                  {sec === 'Público' ? '🏛️ Público' : '🏢 Privado'}
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                      </td>

                      {/* 3. TIPO DE CONTRATO */}
                      <td className="px-3 py-2.5">
                        <span className="font-bold text-indigo-900 dark:text-indigo-300 bg-indigo-50/70 dark:bg-indigo-950/70 px-2 py-1 rounded-md text-[11px] inline-block">
                          {con.type}
                        </span>
                      </td>

                      {/* 4. VALOR (USD) */}
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-800 dark:text-slate-100">
                        {con.contractValue && con.contractValue > 0
                          ? `$${con.contractValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                          : <span className="text-slate-400 dark:text-slate-500 font-normal">-</span>
                        }
                      </td>

                      {/* 5. MARCA EQUIPO */}
                      <td className="px-2 py-2.5 text-center">
                        {brands.length > 0 ? (
                          <div className="flex flex-wrap items-center justify-center gap-1">
                            {brands.map(b => (
                              <span key={b} className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700">
                                {b}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            GE
                          </span>
                        )}
                      </td>

                      {/* 6. FECHA INICIO */}
                      <td className="px-2 py-2.5 text-center font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {con.startDate || '-'}
                      </td>

                      {/* 7. FECHA VENCIMIENTO */}
                      <td className="px-2 py-2.5 text-center font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                        <div className="flex flex-col items-center">
                          <span>{con.endDate || '-'}</span>
                          {expAlert?.level === 'warning_3m' && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-900 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-950/90 border border-amber-300 dark:border-amber-800 px-1.5 py-0.5 rounded-md shadow-2xs mt-1">
                              ⚠️ 3 MESES ({expAlert.days}d)
                            </span>
                          )}
                          {expAlert?.level === 'urgent_1m' && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black text-rose-900 dark:text-rose-300 bg-rose-100/90 dark:bg-rose-950/90 border border-rose-300 dark:border-rose-800 px-1.5 py-0.5 rounded-md shadow-2xs mt-1">
                              ⚠️ 1 MES ({expAlert.days}d)
                            </span>
                          )}
                          {expAlert?.level === 'expired' && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-black text-red-950 dark:text-red-300 bg-red-100/90 dark:bg-red-950/90 border border-red-300 dark:border-red-800 px-1.5 py-0.5 rounded-md shadow-2xs mt-1">
                              🚨 VENCIDO ({expAlert.days}d)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 8. ESTADO */}
                      <td className="px-2 py-2.5 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          {/* Status pill */}
                          {expAlert?.level === 'warning_3m' ? (
                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 w-full shadow-2xs">
                              ⚠️ 3 MESES (POR VENCER)
                            </span>
                          ) : expAlert?.level === 'urgent_1m' ? (
                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-100 dark:bg-rose-950 text-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800 w-full shadow-2xs">
                              ⚠️ 1 MES (POR VENCER)
                            </span>
                          ) : expAlert?.level === 'expired' ? (
                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-100 dark:bg-red-950 text-red-950 dark:text-red-300 border border-red-300 dark:border-red-800 w-full shadow-2xs">
                              🚨 VENCIDO
                            </span>
                          ) : (
                            <span className={`inline-flex items-center justify-center px-3 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                              con.status === 'Activo'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                            }`}>
                              {con.status || 'ACTIVO'}
                            </span>
                          )}

                          {/* MTOS PENDIENTES Pill - uses same logic as contract details modal */}
                          {(() => {
                            // Use the shared getContractMaintenanceStatus function if available (same logic as modal)
                            if (getContractMaintenanceStatus) {
                              const s = getCachedMaintenanceStatus(con);
                              if (!s || s.total === 0) return null;

                              if (s.hasNoPending) {
                                return (
                                  <div className="bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center justify-center gap-1.5 shadow-2xs w-full">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    <span>✓ TODO REALIZADO ({s.done}/{s.total})</span>
                                  </div>
                                );
                              }

                              if (s.isAllScheduled) {
                                return (
                                  <div className="bg-sky-100 dark:bg-sky-950 border border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-300 font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center justify-center gap-1.5 shadow-2xs w-full" title="Todas las visitas se encuentran agendadas en el calendario">
                                    <Calendar className="w-3 h-3 text-sky-600 dark:text-sky-400 shrink-0" />
                                    <span>📅 {s.scheduled} AGENDADO{s.scheduled > 1 ? 'S' : ''} ({s.done}/{s.total})</span>
                                  </div>
                                );
                              }

                              const lastOne = s.unScheduled === 1;
                              const pillClass = lastOne
                                ? 'bg-amber-100 dark:bg-amber-950 border-amber-400 dark:border-amber-700 text-amber-900 dark:text-amber-300 animate-pulse'
                                : 'bg-slate-100/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300';

                              return (
                                <div className={`${pillClass} border font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center justify-center gap-1.5 shadow-2xs w-full`}>
                                  {lastOne ? <span className="text-amber-500 dark:text-amber-500 shrink-0 leading-none">⚠️</span> : <FileText className="w-3 h-3 text-slate-500 dark:text-slate-500 shrink-0" />}
                                  <span>{s.unScheduled} {s.unScheduled === 1 ? 'POR AGENDAR' : 'POR AGENDAR'} ({s.done}/{s.total})</span>
                                </div>
                              );
                            }

                            // Fallback: manual count from maintenanceDates
                            const scheduledDates = con.maintenanceDates || [];
                            if (scheduledDates.length === 0) return null;
                            const totalMtos = scheduledDates.length;
                            const completedMtos = scheduledDates.filter((d: any) =>
                              typeof d === 'object' && (d.completed || d.status === 'completed' || d.status === 'Completado')
                            ).length;
                            const pendingMtos = Math.max(0, totalMtos - completedMtos);
                            return (
                              <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center justify-center gap-1.5 shadow-2xs w-full">
                                <FileText className="w-3 h-3 text-slate-500 dark:text-slate-500 shrink-0" />
                                <span>{pendingMtos} POR AGENDAR ({completedMtos}/{totalMtos})</span>
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
                              <div className="bg-indigo-50/80 dark:bg-indigo-950/80 border border-indigo-200/70 dark:border-indigo-800/70 rounded-lg p-1.5 text-[9px] font-bold text-indigo-900 dark:text-indigo-300 font-mono leading-tight w-full text-center max-w-[240px]">
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
                            <span className="text-slate-600 dark:text-slate-300 font-semibold text-3xs line-clamp-1 block mb-0.5">{con.coverage}</span>
                          )}

                          {/* ✨ Equipo Nuevo Badge */}
                          {con.isNewEquipment && (
                            <span className="inline-flex items-center gap-1 text-amber-900 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-950/90 border border-amber-300 dark:border-amber-800 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold shadow-2xs w-max">
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
                                className="inline-flex items-center gap-1 text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-800 px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all w-max shadow-2xs cursor-pointer"
                                title="Descargar Documento del Contrato PDF"
                              >
                                📄 Contrato <ExternalLink className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
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
                                className="inline-flex items-center gap-1 text-amber-950 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 hover:bg-amber-100 dark:hover:bg-amber-900 border border-amber-300 dark:border-amber-800 px-2 py-0.5 rounded-md text-[10px] font-extrabold transition-all w-max shadow-2xs cursor-pointer"
                                title="Descargar Service Record (SR) PDF"
                              >
                                🛠 SR <ExternalLink className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
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
                                className="inline-flex items-center gap-1 text-orange-950 dark:text-orange-300 bg-orange-50 dark:bg-orange-950 hover:bg-orange-100 dark:hover:bg-orange-900 border border-orange-300 dark:border-orange-800 px-2 py-0.5 rounded-md text-[10px] font-extrabold transition-all w-max shadow-2xs cursor-pointer"
                                title="Descargar Certificate of Acceptance (CA) PDF"
                              >
                                📜 CA <ExternalLink className="w-2.5 h-2.5 text-orange-600 dark:text-orange-400" />
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
                                className="inline-flex items-center gap-1 text-sky-950 dark:text-sky-300 bg-sky-50 dark:bg-sky-950 hover:bg-sky-100 dark:hover:bg-sky-900 border border-sky-300 dark:border-sky-800 px-2 py-0.5 rounded-md text-[10px] font-extrabold transition-all w-max shadow-2xs cursor-pointer"
                                title="Descargar Proof of Delivery (POD) PDF"
                              >
                                📦 POD <ExternalLink className="w-2.5 h-2.5 text-sky-600 dark:text-sky-400" />
                              </button>
                            );
                          })()}

                          {/* 📅 Cronograma PDF Button */}
                          {con.schedulePdfUrl && (
                            <button
                              type="button"
                              onClick={() => triggerDirectDownload(con.schedulePdfUrl!, `Cronograma_${con.id}.pdf`)}
                              className="inline-flex items-center gap-1 text-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 hover:bg-purple-100 dark:hover:bg-purple-900 border border-purple-300 dark:border-purple-800 px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all w-max shadow-2xs cursor-pointer"
                              title="Descargar Cronograma PDF"
                            >
                              📅 Cronograma <ExternalLink className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400" />
                            </button>
                          )}

                          {/* Fallback if no coverage badges or PDFs exist */}
                          {!con.coverage && !con.isNewEquipment && !(con.contractPdfUrl || con.pdfUrl) && !con.schedulePdfUrl && !(con.serviceRecordPdfUrl || con.srPdfUrl || con.equipmentItems?.some(e => e.serviceRecordPdfUrl || e.srPdfUrl || e.caPdfUrl || e.podPdfUrl)) && (
                            <span className="text-slate-400 dark:text-slate-500 font-normal text-center block">-</span>
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
                              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900 font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer text-xs flex items-center gap-1 border border-indigo-100/80 dark:border-indigo-800/80 shadow-2xs"
                              title="Ver Detalle del Contrato"
                            >
                              <Eye className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
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
                            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer text-xs"
                          >
                            Editar
                          </button>
                          {onRenewContract && userRole === 'admin' && !con.linkedContractId && (
                            <button
                              type="button"
                              onClick={() => onRenewContract(con)}
                              className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900 font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer text-xs border border-emerald-200/80 dark:border-emerald-800/80 shadow-2xs"
                              title="Crear el contrato de renovación, copiando cliente y equipos"
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              <span>Renovar</span>
                            </button>
                          )}
                          {onDeleteContract && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`¿Está seguro de eliminar el contrato ${con.id}?`)) {
                                  onDeleteContract(con.id);
                                }
                              }}
                              className="p-1.5 text-rose-500 dark:text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900 rounded-md transition-colors cursor-pointer"
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
          <div className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between font-sans">
            <span className="text-3xs text-slate-500 dark:text-slate-500 font-medium">Pág. {contractPage} de {totalPages}</span>
            <div className="flex gap-1">
              <button
                onClick={() => setContractPage(prev => Math.max(prev - 1, 1))}
                disabled={contractPage === 1}
                className="px-2.5 py-1 text-3xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Anterior
              </button>
              <button
                onClick={() => setContractPage(prev => Math.min(prev + 1, totalPages))}
                disabled={contractPage === totalPages}
                className="px-2.5 py-1 text-3xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
