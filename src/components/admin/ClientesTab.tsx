import React, { useState } from 'react';
import { Users, Database, Plus, AlertCircle, Search } from 'lucide-react';
import { Client } from '../../types';

interface ClientesTabProps {
  clients: Client[];
  userRole: string;
  isClientImporterOpen: boolean;
  setIsClientImporterOpen: (open: boolean) => void;
  clientCsvError: string | null;
  handleClientCsvUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setEditingClient: (client: Client | null) => void;
  setClientFormId: (val: string) => void;
  setClientFormName: (val: string) => void;
  setClientFormAddress: (val: string) => void;
  setClientFormCity: (val: string) => void;
  setClientFormContact: (val: string) => void;
  setClientFormPhone: (val: string) => void;
  setIsClientModalOpen: (open: boolean) => void;
}

export const ClientesTab: React.FC<ClientesTabProps> = ({
  clients,
  userRole,
  isClientImporterOpen,
  setIsClientImporterOpen,
  clientCsvError,
  handleClientCsvUpload,
  setEditingClient,
  setClientFormId,
  setClientFormName,
  setClientFormAddress,
  setClientFormCity,
  setClientFormContact,
  setClientFormPhone,
  setIsClientModalOpen,
}) => {
  const [clientSearch, setClientSearch] = useState('');
  const [clientPage, setClientPage] = useState(1);

  const query = clientSearch.toLowerCase().trim();
  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(query) ||
    c.id.toLowerCase().includes(query) ||
    c.address.toLowerCase().includes(query) ||
    (c.contactName || '').toLowerCase().includes(query)
  );

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((clientPage - 1) * itemsPerPage, clientPage * itemsPerPage);

  return (
    <div className="space-y-6 font-sans">
      {/* Header Block */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
        <div>
          <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            Gestión de Terceros y Clientes
          </h4>
          <p className="text-3xs text-slate-500 mt-0.5 font-medium">Administra la información de clientes, RUC/cédula, sucursales y datos de contacto.</p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {userRole === 'admin' && (
            <button
              onClick={() => setIsClientImporterOpen(!isClientImporterOpen)}
              className={`font-semibold text-3xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 border transition-all cursor-pointer ${
                isClientImporterOpen
                  ? 'bg-amber-600 border-amber-600 text-white'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isClientImporterOpen ? 'Ocultar Ingestor' : '📥 Importar CSV'}</span>
            </button>
          )}
          <button
            onClick={() => {
              setEditingClient(null);
              setClientFormId('');
              setClientFormName('');
              setClientFormAddress('');
              setClientFormCity('');
              setClientFormContact('');
              setClientFormPhone('');
              setIsClientModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-3xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs border border-indigo-600 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Cliente</span>
          </button>
        </div>
      </div>

      {/* CSV Importer Panel */}
      {isClientImporterOpen && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
            <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider font-mono">📥 Ingestor de Clientes (CSV)</h5>
            <button
              onClick={() => {
                const headers = ['id', 'name', 'address', 'sucursal', 'contactName', 'contactPhone', 'contactEmail'];
                const sample = ['1792040001001', 'HOSPITAL METROPOLITANO', 'Av. Mariana de Jesús', 'Quito', 'Dra. María Elena', '099123456', 'contacto@hospital.com'];
                const csv = "\uFEFF" + [headers.join(';'), sample.join(';')].join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'formato_clientes_mtorimec.csv';
                a.click();
              }}
              className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              📥 Descargar Plantilla Ejemplo
            </button>
          </div>
          <p className="text-3xs text-slate-505 font-medium leading-relaxed">
            El archivo debe ser un CSV separado por comas o punto y coma. Las cabeceras requeridas son: **id** (RUC/cédula), **name** (Nombre), **address** (Dirección) y **sucursal** (Ciudad).
          </p>
          <div className="flex flex-col gap-2">
            <input
              type="file"
              accept=".csv"
              onChange={handleClientCsvUpload}
              className="block w-full text-3xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-3xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 file:cursor-pointer hover:file:bg-indigo-100 transition-all"
            />
            {clientCsvError && (
              <div className="text-3xs text-red-650 font-bold bg-red-50 p-2 rounded-lg border border-red-100 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                <span>{clientCsvError}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar por RUC/cédula, nombre, dirección o contacto..."
            value={clientSearch}
            onChange={(e) => {
              setClientSearch(e.target.value);
              setClientPage(1);
            }}
            className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-4 py-1.5 text-xs font-semibold text-slate-700 outline-hidden focus:ring-1 focus:ring-indigo-500 placeholder-slate-400"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
        <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider">{filtered.length} Clientes encontrados</span>
      </div>

      {/* Clients Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <table className="w-full text-left border-collapse text-[11px] font-sans">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-655 font-extrabold uppercase text-[9px] tracking-wider">
              <th className="p-3.5">Cédula / RUC</th>
              <th className="p-3.5">Nombre de Cliente</th>
              <th className="p-3.5">Dirección</th>
              <th className="p-3.5">Ciudad / Sucursal</th>
              <th className="p-3.5">Contacto Principal</th>
              <th className="p-3.5">Teléfono</th>
              <th className="p-3.5 text-right no-print">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-750 font-medium">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-8 text-slate-400 font-semibold italic">
                  No se encontraron clientes.
                </td>
              </tr>
            ) : (
              paginated.map(cli => (
                <tr key={cli.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-slate-900">{cli.id}</td>
                  <td className="p-3.5 font-extrabold text-slate-900">{cli.name}</td>
                  <td className="p-3.5">{cli.address}</td>
                  <td className="p-3.5 font-bold text-indigo-700">{cli.industry || '-'}</td>
                  <td className="p-3.5">{cli.contactName || '-'}</td>
                  <td className="p-3.5 font-mono">{cli.contactPhone || '-'}</td>
                  <td className="p-3.5 text-right no-print">
                    <button
                      onClick={() => {
                        setEditingClient(cli);
                        setClientFormId(cli.id);
                        setClientFormName(cli.name);
                        setClientFormAddress(cli.address);
                        setClientFormCity(cli.industry || '');
                        setClientFormContact(cli.contactName || '');
                        setClientFormPhone(cli.contactPhone || '');
                        setIsClientModalOpen(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between font-sans">
            <span className="text-3xs text-slate-500 font-medium">Pág. {clientPage} de {totalPages}</span>
            <div className="flex gap-1">
              <button
                onClick={() => setClientPage(prev => Math.max(prev - 1, 1))}
                disabled={clientPage === 1}
                className="px-2.5 py-1 text-3xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => setClientPage(prev => Math.min(prev + 1, totalPages))}
                disabled={clientPage === totalPages}
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
