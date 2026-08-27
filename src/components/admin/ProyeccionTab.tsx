import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp,
  FileSpreadsheet,
  Printer,
  DollarSign,
  AlertTriangle,
  Users,
  Award,
  BarChart3,
  Search,
  Pencil,
  Eye
} from 'lucide-react';
import { Contract, Client } from '../../types';

interface ProyeccionTabProps {
  contracts: Contract[];
  clients: Client[];
  onUpdateContract?: (updatedContract: Contract) => void;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  handleExportCrmExcelCsv: (filtered: any[]) => void;
  handlePrintContractProjectionPdf: (filtered: any[], totals: any) => void;
  setSelectedContractForDetails: (con: Contract) => void;
  setIsContractDetailsModalOpen: (open: boolean) => void;
}

const isClientMatch = (woClientId: string | undefined, conClientId: string | undefined, clientsList: Client[] = []) => {
  if (!woClientId || !conClientId) return false;
  const c1 = woClientId.trim().toLowerCase();
  const c2 = conClientId.trim().toLowerCase();
  if (c1 === c2) return true;
  const client1 = clientsList.find(c => c.id === woClientId || c.name.trim().toLowerCase() === c1);
  const client2 = clientsList.find(c => c.id === conClientId || c.name.trim().toLowerCase() === c2);
  if (client1 && client2 && client1.id === client2.id) return true;
  if (client1 && (client1.name.trim().toLowerCase().includes(c2) || c2.includes(client1.name.trim().toLowerCase()))) return true;
  if (client2 && (client2.name.trim().toLowerCase().includes(c1) || c1.includes(client2.name.trim().toLowerCase()))) return true;
  return false;
};

export const ProyeccionTab: React.FC<ProyeccionTabProps> = ({
  contracts,
  clients,
  onUpdateContract,
  showNotification,
  handleExportCrmExcelCsv,
  handlePrintContractProjectionPdf,
  setSelectedContractForDetails,
  setIsContractDetailsModalOpen,
}) => {
  // Local state for Projection Tab
  const [contractValueFilter, setContractValueFilter] = useState<'all' | 'unvalued' | 'valued'>('all');
  const [projSearch, setProjSearch] = useState('');
  const [projFilter, setProjFilter] = useState<'todos' | 'vencidos' | 'criticos' | 'proximos' | 'futuros' | 'renovados'>('todos');
  const [projStageFilter, setProjStageFilter] = useState<string>('all');
  const [projPriorityFilter, setProjPriorityFilter] = useState<'todas' | 'Alta' | 'Media' | 'Baja'>('todas');
  const [projSort, setProjSort] = useState<'vencimiento' | 'valor' | 'cliente' | 'prioridad'>('vencimiento');
  const [projPage, setProjPage] = useState(1);
  const [editingValContractId, setEditingValContractId] = useState<string | null>(null);
  const [editingValInput, setEditingValInput] = useState<string>('');

  // Memoized CRM Contract Projections
  const allProjections = useMemo(() => {
    const todayMs = new Date().setHours(0, 0, 0, 0);
    const clientMap = new Map(clients.map(c => [c.id, c]));

    return contracts.map(con => {
      const client = clients.find(c => isClientMatch(c.id, con.clientId, clients)) || clientMap.get(con.clientId);
      const clientName = client ? client.name : (con.clientId && con.clientId !== 'fsm_placeholder' ? con.clientId : 'Cliente por Registrar');
      const endDateMs = new Date(con.endDate + 'T00:00:00').getTime();
      const diffDays = Math.ceil((endDateMs - todayMs) / (1000 * 60 * 60 * 24));

      let urgencyCategory: 'vencidos' | 'criticos' | 'proximos' | 'futuros' = 'futuros';
      if (diffDays < 0) urgencyCategory = 'vencidos';
      else if (diffDays <= 30) urgencyCategory = 'criticos';
      else if (diffDays <= 90) urgencyCategory = 'proximos';
      else urgencyCategory = 'futuros';

      const valUSD = con.contractValue || 0;

      // Smart renewal status detection if not manually set
      const hasSuccessor = contracts.some(other =>
        other.id !== con.id &&
        (other.clientId === con.clientId || isClientMatch(other.clientId, con.clientId, clients)) &&
        other.startDate > con.startDate
      );

      let defaultStatus: Contract['proposalStatus'] = 'Sin Contactar';
      if (hasSuccessor || con.linkedContractId) {
        defaultStatus = 'Renovado';
      } else if (diffDays <= 90) {
        defaultStatus = 'En Negociación';
      }

      const proposalStatus = con.proposalStatus || defaultStatus;

      // Smart calculation or custom override for closing probability (%)
      let defaultProb = 50;
      if (proposalStatus === 'Renovado') defaultProb = 100;
      else if (proposalStatus === 'En Negociación') defaultProb = 75;
      else if (proposalStatus === 'Propuesta Presentada') defaultProb = 50;
      else if (proposalStatus === 'Solicitud Enviada') defaultProb = 30;
      else if (proposalStatus === 'Sin Contactar') defaultProb = 15;
      else if (proposalStatus === 'Perdido') defaultProb = 0;

      const closingProbability = typeof con.closingProbability === 'number' ? con.closingProbability : defaultProb;

      // Auto-assign priority based on value / expiration if not explicitly set
      let priority: 'Alta' | 'Media' | 'Baja' = con.dealPriority || 'Media';
      if (!con.dealPriority) {
        if (diffDays < 0 || diffDays <= 30 || valUSD >= 5000) priority = 'Alta';
        else if (diffDays <= 90 || valUSD >= 2000) priority = 'Media';
        else priority = 'Baja';
      }

      return {
        contract: con,
        client,
        clientName,
        diffDays,
        urgencyCategory,
        valUSD,
        proposalStatus,
        priority,
        closingProbability,
        hasSuccessor
      };
    });
  }, [contracts, clients]);

  // CRM Funnel Stage Totals — Solicitud Enviada & Propuesta Presentada hidden from funnel display
  const stages = [
    { id: 'Sin Contactar', label: 'Sin Contactar', color: 'bg-slate-100 border-slate-300 text-slate-800', dot: '⚪' },
    { id: 'En Negociación', label: 'En Negociación', color: 'bg-purple-50 border-purple-300 text-purple-900', dot: '🤝' },
    { id: 'Renovado', label: 'Renovados / Ganados', color: 'bg-emerald-50 border-emerald-300 text-emerald-900', dot: '✅' },
    { id: 'Perdido', label: 'Perdidos', color: 'bg-rose-50 border-rose-300 text-rose-900', dot: '❌' },
  ];

  const stageSummary = stages.map(st => {
    const deals = allProjections.filter(p => p.proposalStatus === st.id);
    const sumVal = deals.reduce((acc, p) => acc + p.valUSD, 0);
    return {
      ...st,
      count: deals.length,
      valUSD: sumVal
    };
  });

  // Executive Metrics
  const totalPipelineVal = allProjections.reduce((acc, p) => acc + p.valUSD, 0);
  const totalRiskDeals = allProjections.filter(p => p.urgencyCategory !== 'futuros');
  const totalRiskVal = totalRiskDeals.reduce((acc, p) => acc + p.valUSD, 0);
  const uniqueTargetClients = new Set(totalRiskDeals.map(p => p.clientName)).size;

  const wonDeals = allProjections.filter(p => p.proposalStatus === 'Renovado');
  const inProgressDeals = allProjections.filter(p => p.proposalStatus === 'En Negociación' || p.proposalStatus === 'Propuesta Presentada');
  const totalClosedOrActive = wonDeals.length + inProgressDeals.length;
  const conversionRate = allProjections.length > 0 ? Math.round((totalClosedOrActive / allProjections.length) * 100) : 0;

  const dealsWithValue = allProjections.filter(p => p.valUSD > 0);
  const avgTicketUSD = dealsWithValue.length > 0 ? Math.round(dealsWithValue.reduce((a, b) => a + b.valUSD, 0) / dealsWithValue.length) : 0;

  const totals = {
    totalRiskValue: totalRiskVal,
    uniqueTargetClients,
    criticosCount: allProjections.filter(p => p.urgencyCategory === 'criticos').length,
    proximosCount: allProjections.filter(p => p.urgencyCategory === 'proximos').length,
    vencidosCount: allProjections.filter(p => p.urgencyCategory === 'vencidos').length,
    pipelineVal: totalPipelineVal
  };

  // Filter & Sort
  let filtered = allProjections.filter(p => {
    if (projFilter === 'vencidos') return p.urgencyCategory === 'vencidos';
    if (projFilter === 'criticos') return p.urgencyCategory === 'criticos';
    if (projFilter === 'proximos') return p.urgencyCategory === 'proximos';
    if (projFilter === 'futuros') return p.urgencyCategory === 'futuros';
    if (projFilter === 'renovados') return p.proposalStatus === 'Renovado';
    return true;
  });

  if (projStageFilter !== 'all') {
    filtered = filtered.filter(p => p.proposalStatus === projStageFilter);
  }

  if (projPriorityFilter !== 'todas') {
    filtered = filtered.filter(p => p.priority === projPriorityFilter);
  }

  if (contractValueFilter === 'unvalued') {
    filtered = filtered.filter(p => !p.valUSD || p.valUSD <= 0);
  } else if (contractValueFilter === 'valued') {
    filtered = filtered.filter(p => p.valUSD && p.valUSD > 0);
  }

  if (projSearch.trim()) {
    const q = projSearch.trim().toLowerCase();
    filtered = filtered.filter(p =>
      p.contract.id.toLowerCase().includes(q) ||
      p.clientName.toLowerCase().includes(q) ||
      (p.contract.type || '').toLowerCase().includes(q) ||
      (p.contract.equipmentItems || []).some(e => (e.name || '').toLowerCase().includes(q))
    );
  }

  if (projSort === 'vencimiento') {
    filtered.sort((a, b) => a.diffDays - b.diffDays);
  } else if (projSort === 'valor') {
    filtered.sort((a, b) => b.valUSD - a.valUSD);
  } else if (projSort === 'cliente') {
    filtered.sort((a, b) => a.clientName.localeCompare(b.clientName));
  } else if (projSort === 'prioridad') {
    const pOrder = { Alta: 1, Media: 2, Baja: 3 };
    filtered.sort((a, b) => pOrder[a.priority] - pOrder[b.priority]);
  }

  const handleSaveContractValue = (contractId: string, val: number) => {
    const con = contracts.find(c => c.id === contractId);
    if (con && onUpdateContract) {
      onUpdateContract({ ...con, contractValue: val });
      showNotification(`Valor del contrato ${contractId} actualizado a $${val.toLocaleString('en-US')}`, 'success');
    }
    setEditingValContractId(null);
  };

  const handleSaveProposalStatus = (contractId: string, newStatus: Contract['proposalStatus']) => {
    const con = contracts.find(c => c.id === contractId);
    if (con && onUpdateContract) {
      onUpdateContract({ ...con, proposalStatus: newStatus });
      showNotification(`Estado de gestión para ${contractId} actualizado a "${newStatus}"`, 'success');
    }
  };

  const handleSaveDealPriority = (contractId: string, newPriority: Contract['dealPriority']) => {
    const con = contracts.find(c => c.id === contractId);
    if (con && onUpdateContract) {
      onUpdateContract({ ...con, dealPriority: newPriority });
      showNotification(`Prioridad comercial para ${contractId} asignada a ${newPriority}`, 'success');
    }
  };

  const handleSaveClosingProbability = (contractId: string, newProb: number) => {
    const con = contracts.find(c => c.id === contractId);
    if (con && onUpdateContract) {
      onUpdateContract({ ...con, closingProbability: newProb });
      showNotification(`Probabilidad de cierre para ${contractId} actualizada a ${newProb}%`, 'success');
    }
  };

  const ClosingProbabilityCell = ({ initialVal, onSave }: { initialVal: number, onSave: (v: number) => void }) => {
    const [val, setVal] = useState<string>(initialVal.toString());

    useEffect(() => {
      setVal(initialVal.toString());
    }, [initialVal]);

    const commitVal = (vStr: string) => {
      let num = parseInt(vStr, 10);
      if (isNaN(num)) num = 0;
      if (num < 0) num = 0;
      if (num > 100) num = 100;
      setVal(num.toString());
      if (num !== initialVal) {
        onSave(num);
      }
    };

    const numVal = parseInt(val, 10) || 0;

    return (
      <div
        className="inline-flex items-center gap-1 bg-white border border-slate-200 px-1.5 py-1 rounded-xl shadow-2xs hover:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500 transition-all"
        title="Edite el porcentaje de apertura o disposición del cliente (0-100%)"
      >
        <button
          type="button"
          onClick={() => commitVal((numVal - 5).toString())}
          className="w-4 h-4 rounded flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-3xs cursor-pointer select-none"
          title="Restar 5%"
        >
          -
        </button>
        <input
          type="number"
          min={0}
          max={100}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={() => commitVal(val)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              commitVal(val);
              (e.target as HTMLInputElement).blur();
            }
          }}
          className="w-9 text-center text-xs font-black text-slate-900 bg-transparent focus:outline-none"
        />
        <span className="text-[10px] font-black text-slate-400">%</span>
        <button
          type="button"
          onClick={() => commitVal((numVal + 5).toString())}
          className="w-4 h-4 rounded flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-3xs cursor-pointer select-none"
          title="Sumar 5%"
        >
          +
        </button>
        <div
          className="w-2.5 h-2.5 rounded-full shrink-0 ml-0.5 shadow-3xs"
          style={{
            backgroundColor:
              numVal >= 80 ? '#10b981' :
              numVal >= 60 ? '#0284c7' :
              numVal >= 40 ? '#f59e0b' :
              numVal >= 20 ? '#f97316' : '#ef4444'
          }}
          title={`Apertura del Cliente: ${numVal}%`}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Banner Header & Export Actions */}
      <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-700/40 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-emerald-500/20 text-emerald-300 font-extrabold text-[9px] px-2.5 py-0.5 rounded-full border border-emerald-400/30 uppercase tracking-widest flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              CRM & Pipeline Comercial Biomédico
            </span>
            <span className="bg-indigo-500/30 text-indigo-200 text-[9px] font-bold px-2 py-0.5 rounded-full border border-indigo-400/20">
              ORIMEC Executive Suite
            </span>
          </div>
          <h3 className="font-black text-xl text-white tracking-tight">Proyección Comercial & Gestión de Clientes Potenciales</h3>
          <p className="text-xs text-indigo-200 mt-1 leading-relaxed">
            Embudo de oportunidades comerciales, control de montos negociados en USD, asignación de prioridades y proyección de renovación de contratos.
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10 flex-wrap">
          <button
            onClick={() => handleExportCrmExcelCsv(filtered)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-emerald-500/30 flex items-center gap-2 cursor-pointer"
            title="Exportar proyección comercial completa a Excel (CSV con soporte de caracteres latinos)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>📊 Exportar CRM (Excel)</span>
          </button>
          <button
            onClick={() => handlePrintContractProjectionPdf(filtered, totals)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-indigo-500/30 flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>🖨️ Exportar Informe CRM (PDF)</span>
          </button>
        </div>
      </div>

      {/* Executive CRM KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pipeline Total Estimado */}
        <div className="bg-white border border-indigo-100 p-4 rounded-xl shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">Pipeline Comercial Total</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="font-black text-2xl text-slate-900 mt-2">
            ${totalPipelineVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-500 font-semibold mt-1">
            Valor proyectado acumulado de {allProjections.length} contratos
          </p>
        </div>

        {/* Card 2: Valor Cartera en Riesgo */}
        <div className="bg-white border border-amber-100 p-4 rounded-xl shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">Valor Cartera en Riesgo</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="font-black text-2xl text-slate-900 mt-2">
            ${totalRiskVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] font-bold text-amber-800 mt-1">
            {totalRiskDeals.length} contratos en riesgo (&le;90d / Vencidos)
          </p>
        </div>

        {/* Card 3: Clientes Objetivo */}
        <div className="bg-white border border-emerald-100 p-4 rounded-xl shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Clientes Potenciales</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="font-black text-2xl text-slate-900 mt-2">{uniqueTargetClients}</p>
          <p className="text-[10px] text-slate-500 font-semibold mt-1">
            Instituciones clave para solicitud de renovación
          </p>
        </div>

        {/* Card 4: Ticket Promedio por Contrato */}
        <div className="bg-white border border-purple-100 p-4 rounded-xl shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700">Ticket Promedio Contrato</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="font-black text-2xl text-slate-900 mt-2">
            ${avgTicketUSD.toLocaleString('en-US')} USD
          </p>
          <p className="text-[10px] font-bold text-purple-800 mt-1">
            Tasa de Oportunidad Activa: {conversionRate}%
          </p>
        </div>
      </div>

      {/* Embudo Comercial + Filter Controls + Pipeline Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h4 className="font-black text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>Embudo Comercial de Ventas & Renovación (Pipeline CRM)</span>
          </h4>
          {projStageFilter !== 'all' && (
            <button
              onClick={() => setProjStageFilter('all')}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
            >
              Ver Todas las Etapas
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-5 border-b border-slate-100">
          {stageSummary.map(st => {
            const isSelected = projStageFilter === st.id;
            return (
              <div
                key={st.id}
                onClick={() => setProjStageFilter(isSelected ? 'all' : st.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer select-none ${st.color} ${
                  isSelected ? 'ring-2 ring-indigo-600 scale-[1.02] shadow-md' : 'hover:shadow-xs hover:scale-[1.01]'
                }`}
              >
                <div className="flex items-center justify-between text-2xs font-extrabold">
                  <span>{st.dot} {st.label}</span>
                  <span className="bg-white/80 px-1.5 py-0.2 rounded font-black text-[9px]">{st.count}</span>
                </div>
                <p className="font-black text-sm text-slate-900 mt-2 leading-none">
                  ${st.valUSD.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
                <p className="text-[8.5px] font-semibold text-slate-500 mt-1">
                  {allProjections.length > 0 ? Math.round((st.count / allProjections.length) * 100) : 0}% del total
                </p>
              </div>
            );
          })}
        </div>

        {/* Pipeline subheader: title + Estado pills */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span>📋 Pipeline de Oportunidades &amp; Gestión Comercial ({filtered.length} registros)</span>
            </h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
              Haz clic en el Valor (USD) para ingresar o editar el monto. Asigna la Etapa Comercial y Prioridad directamente.
            </p>
          </div>
          {/* Estado filter pills */}
          <div className="flex items-center gap-1.5 flex-wrap justify-end shrink-0">
            <button
              onClick={() => setProjFilter('todos')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                projFilter === 'todos'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({allProjections.length})
            </button>
            <button
              onClick={() => setProjFilter('vencidos')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                projFilter === 'vencidos'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              🔴 Vencidos ({allProjections.filter(p => p.urgencyCategory === 'vencidos').length})
            </button>
            <button
              onClick={() => setProjFilter('criticos')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                projFilter === 'criticos'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              🟠 Críticos &lt;30d ({allProjections.filter(p => p.urgencyCategory === 'criticos').length})
            </button>
            <button
              onClick={() => setProjFilter('proximos')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                projFilter === 'proximos'
                  ? 'bg-yellow-500 text-white shadow-xs'
                  : 'bg-yellow-50 text-yellow-800 border border-yellow-200 hover:bg-yellow-100'
              }`}
            >
              🟡 Próximos 30-90d ({allProjections.filter(p => p.urgencyCategory === 'proximos').length})
            </button>
            <button
              onClick={() => setProjFilter('renovados')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                projFilter === 'renovados'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              ✅ Renovados ({allProjections.filter(p => p.proposalStatus === 'Renovado').length})
            </button>
          </div>
        </div>

        {/* Search + Valor + Ordenar + Prioridad row */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 bg-white">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por cliente, nº contrato o equipo..."
              value={projSearch}
              onChange={(e) => setProjSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-slate-50/60 placeholder-slate-400 text-slate-700"
            />
          </div>
          <div className="h-4 w-px bg-slate-200 shrink-0" />
          <div className="flex items-center gap-1.5 shrink-0">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Valor:</span>
            <select
              value={contractValueFilter}
              onChange={(e: any) => setContractValueFilter(e.target.value)}
              className={`font-extrabold text-[11px] outline-hidden cursor-pointer rounded-md px-2 py-1 border transition-colors ${
                contractValueFilter !== 'all'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-transparent border-slate-200 text-slate-700'
              }`}
            >
              <option value="all">Todos los Valores</option>
              <option value="unvalued">⚠️ Sin Valor ($0 / Pendientes)</option>
              <option value="valued">✅ Con Valor Registrado</option>
            </select>
          </div>
          <div className="h-4 w-px bg-slate-200 shrink-0" />
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Ordenar:</span>
            <select
              value={projSort}
              onChange={(e: any) => setProjSort(e.target.value)}
              className="font-extrabold text-[11px] text-slate-700 bg-transparent border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer"
            >
              <option value="vencimiento">Por Vencimiento</option>
              <option value="valor">Por Valor (USD)</option>
              <option value="prioridad">Por Prioridad</option>
              <option value="cliente">Por Cliente</option>
            </select>
          </div>
          <div className="h-4 w-px bg-slate-200 shrink-0" />
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Prioridad:</span>
            <button
              onClick={() => setProjPriorityFilter('todas')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md cursor-pointer transition-all ${
                projPriorityFilter === 'todas'
                  ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setProjPriorityFilter('Alta')}
              className={`px-2.5 py-1 text-[11px] font-extrabold rounded-md cursor-pointer transition-all ${
                projPriorityFilter === 'Alta'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
              }`}
            >
              🔥 Alta
            </button>
            <button
              onClick={() => setProjPriorityFilter('Media')}
              className={`px-2.5 py-1 text-[11px] font-extrabold rounded-md cursor-pointer transition-all ${
                projPriorityFilter === 'Media'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              ⚡ Media
            </button>
          </div>
          <div className="ml-auto shrink-0 text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
            <span className="text-indigo-600 font-extrabold">{filtered.length}</span> / {allProjections.length} registros
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] font-extrabold uppercase tracking-wider">
                <th className="p-3">Nº Contrato</th>
                <th className="p-3">Cliente / Ubicación</th>
                <th className="p-3">Equipos Coberturados</th>
                <th className="p-3 text-right">Valor Contrato (USD)</th>
                <th className="p-3 text-center">Prioridad</th>
                <th className="p-3 text-center">% de Cierre</th>
                <th className="p-3 text-center">Vencimiento</th>
                <th className="p-3 text-center">Días Restantes</th>
                <th className="p-3 text-center">Etapa del Embudo (CRM)</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400 font-semibold">
                    No se encontraron oportunidades con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                (() => {
                  const itemsPerPage = 20;
                  const totalProjPages = Math.ceil(filtered.length / itemsPerPage);
                  const safePage = Math.min(projPage, totalProjPages || 1);
                  const paginatedList = filtered.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

                  return paginatedList.map(p => {
                    const con = p.contract;
                    const isEditingVal = editingValContractId === con.id;

                    return (
                      <tr key={con.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Contract ID */}
                        <td className="p-3 font-black text-indigo-900">
                          <span
                            onClick={() => { setSelectedContractForDetails(con); setIsContractDetailsModalOpen(true); }}
                            className="cursor-pointer hover:underline text-indigo-700"
                          >
                            {con.id}
                          </span>
                        </td>

                        {/* Client Name & City */}
                        <td className="p-3 font-bold text-slate-800">
                          <div>
                            <p className="font-extrabold">{p.clientName}</p>
                            {con.city && (
                              <span className="inline-block bg-slate-100 text-slate-600 text-[9px] font-semibold px-1.5 py-0.2 rounded mt-0.5">
                                📍 {con.city}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Covered Equipment */}
                        <td className="p-3 text-slate-600 text-[11px]">
                          {con.equipmentItems && con.equipmentItems.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {con.equipmentItems.map((item, idx) => (
                                <span key={idx} className="bg-slate-100 text-slate-700 text-[9.5px] font-semibold px-1.5 py-0.5 rounded border border-slate-200/60">
                                  {item.name} {item.brand ? `(${item.brand})` : ''}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[10px]">Sin equipos especificados</span>
                          )}
                        </td>

                        {/* Contract Value ($ USD) */}
                        <td className="p-3 text-right font-black text-emerald-700">
                          {isEditingVal ? (
                            <div className="flex items-center justify-end gap-1">
                              <span className="text-xs text-slate-500 font-bold">$</span>
                              <input
                                type="number"
                                min={0}
                                value={editingValInput}
                                onChange={(e) => setEditingValInput(e.target.value)}
                                className="w-24 p-1 text-xs font-mono font-bold border border-indigo-300 rounded focus:ring-1 focus:ring-indigo-500 bg-white"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveContractValue(con.id, parseFloat(editingValInput) || 0);
                                  } else if (e.key === 'Escape') {
                                    setEditingValContractId(null);
                                  }
                                }}
                              />
                              <button
                                onClick={() => handleSaveContractValue(con.id, parseFloat(editingValInput) || 0)}
                                className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-3xs font-bold cursor-pointer"
                              >
                                ✓
                              </button>
                            </div>
                          ) : (
                            <div
                              onClick={() => {
                                setEditingValContractId(con.id);
                                setEditingValInput((con.contractValue || 0).toString());
                              }}
                              className="group inline-flex items-center gap-1 cursor-pointer hover:bg-emerald-50 p-1 rounded transition-colors"
                              title="Haga clic para editar el valor del contrato en USD"
                            >
                              <span className="text-xs">
                                {p.valUSD > 0
                                  ? `$${p.valUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                  : <span className="text-slate-400 font-normal italic">$ Ingresar Valor</span>}
                              </span>
                              <Pencil className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                            </div>
                          )}
                        </td>

                        {/* Priority Dropdown */}
                        <td className="p-3 text-center">
                          <select
                            value={p.priority}
                            onChange={(e: any) => handleSaveDealPriority(con.id, e.target.value)}
                            className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded border focus:outline-none cursor-pointer ${
                              p.priority === 'Alta'
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : p.priority === 'Media'
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            <option value="Alta">🔥 Alta</option>
                            <option value="Media">⚡ Media</option>
                            <option value="Baja">❄️ Baja</option>
                          </select>
                        </td>

                        {/* % de Cierre (Probabilidad / Disposición del Cliente) */}
                        <td className="p-3 text-center">
                          <ClosingProbabilityCell
                            initialVal={p.closingProbability}
                            onSave={(newProb) => handleSaveClosingProbability(con.id, newProb)}
                          />
                        </td>

                        {/* End Date */}
                        <td className="p-3 text-center font-bold text-slate-700">
                          {con.endDate}
                        </td>

                        {/* Days Remaining & Urgency Badge */}
                        <td className="p-3 text-center">
                          {p.urgencyCategory === 'vencidos' && (
                            <span className="bg-rose-50 text-rose-800 border border-rose-200 font-extrabold text-[9.5px] px-2 py-1 rounded-lg inline-block shadow-2xs">
                              🔴 Vencido ({Math.abs(p.diffDays)}d)
                            </span>
                          )}
                          {p.urgencyCategory === 'criticos' && (
                            <span className="bg-amber-50 text-amber-800 border border-amber-200 font-extrabold text-[9.5px] px-2 py-1 rounded-lg inline-block shadow-2xs">
                              🟠 {p.diffDays} días (Crítico)
                            </span>
                          )}
                          {p.urgencyCategory === 'proximos' && (
                            <span className="bg-yellow-50 text-yellow-800 border border-yellow-200 font-extrabold text-[9.5px] px-2 py-1 rounded-lg inline-block shadow-2xs">
                              🟡 {p.diffDays} días (Próximo)
                            </span>
                          )}
                          {p.urgencyCategory === 'futuros' && (
                            <span className="bg-blue-50 text-blue-800 border border-blue-200 font-extrabold text-[9.5px] px-2 py-1 rounded-lg inline-block shadow-2xs">
                              🔵 {p.diffDays} días
                            </span>
                          )}
                        </td>

                        {/* Proposal Status Dropdown (CRM Funnel) */}
                        <td className="p-3 text-center">
                          <select
                            value={p.proposalStatus}
                            onChange={(e: any) => handleSaveProposalStatus(con.id, e.target.value)}
                            className={`text-[10px] font-extrabold px-2 py-1 rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer ${
                              p.proposalStatus === 'Renovado'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : p.proposalStatus === 'En Negociación'
                                ? 'bg-purple-50 text-purple-800 border-purple-300'
                                : p.proposalStatus === 'Propuesta Presentada'
                                ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                                : p.proposalStatus === 'Solicitud Enviada'
                                ? 'bg-sky-50 text-sky-800 border-sky-300'
                                : p.proposalStatus === 'Perdido'
                                ? 'bg-rose-50 text-rose-800 border-rose-300'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            <option value="Sin Contactar">⚪ Sin Contactar</option>
                            <option value="Solicitud Enviada">📩 Solicitud Enviada</option>
                            <option value="Propuesta Presentada">📋 Propuesta Presentada</option>
                            <option value="En Negociación">🤝 En Negociación</option>
                            <option value="Renovado">✅ Renovado</option>
                            <option value="Perdido">❌ Perdido</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-center">
                          <button
                            onClick={() => { setSelectedContractForDetails(con); setIsContractDetailsModalOpen(true); }}
                            className="text-[10px] font-extrabold px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Detalle</span>
                          </button>
                        </td>
                      </tr>
                    );
                  });
                })()
              )}
            </tbody>
          </table>
        </div>

        {/* Projection Pagination Footer */}
        {(() => {
          const itemsPerPage = 20;
          const totalProjPages = Math.ceil(filtered.length / itemsPerPage);
          if (totalProjPages <= 1) return null;

          return (
            <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between font-sans">
              <span className="text-3xs text-slate-500 font-medium">
                Página {projPage} de {totalProjPages} ({filtered.length} Oportunidades Totales)
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setProjPage(prev => Math.max(prev - 1, 1))}
                  disabled={projPage === 1}
                  className="px-3 py-1 text-xs font-extrabold border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setProjPage(prev => Math.min(prev + 1, totalProjPages))}
                  disabled={projPage === totalProjPages}
                  className="px-3 py-1 text-xs font-extrabold border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Siguiente
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
