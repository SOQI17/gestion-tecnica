import React from 'react';
import { TechnicalReport, WorkOrder, Client, Engineer } from '../../types';

interface RETE04ReportModalProps {
  report: TechnicalReport;
  task: WorkOrder;
  clients: Client[];
  engineers: Engineer[];
  setIsViewingRETE04: (viewing: boolean) => void;
}

export const RETE04ReportModal: React.FC<RETE04ReportModalProps> = ({
  report,
  task,
  clients,
  engineers,
  setIsViewingRETE04,
}) => {
  const client = clients.find(c => c.id === task.clientId);
  const eng = engineers.find(e => e.id === task.engineerId);

  const handlePrintReport = () => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        @page {
          size: portrait !important;
          margin: 6mm 8mm !important;
        }
        body {
          background: white !important;
          color: black !important;
        }
        .no-print, header, footer, button, nav, #root > :not(.printable-report-card), #admin-portal-root > :not(#rete04-printable-area) {
          display: none !important;
        }
        #rete04-printable-area {
          position: absolute;
          left: 0;
          top: 0;
          width: 100% !important;
          height: auto !important;
          padding: 0 !important;
          margin: 0 !important;
          background: white !important;
        }
        .printable-report-card {
          display: block !important;
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          box-shadow: none !important;
          background: white !important;
        }
      }
    `;
    document.head.appendChild(style);
    window.print();
    document.head.removeChild(style);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl font-sans shrink-0">
          <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Reporte Técnico Oficial de Asistencia (RE-TE-04)</h4>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePrintReport}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-3 rounded-lg text-3xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
            >
              Imprimir / PDF
            </button>
            <button
              type="button"
              onClick={() => setIsViewingRETE04(false)}
              className="bg-slate-200 hover:bg-slate-350 text-slate-700 font-bold py-1.5 px-3 rounded-lg text-3xs cursor-pointer transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100" id="rete04-printable-area">
          <div className="printable-report-card bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm font-sans text-slate-800 max-w-[800px] mx-auto text-[10px] leading-relaxed">
            
            {/* 1. Header Table */}
            <div className="border border-slate-400 grid grid-cols-12 text-center items-center mb-4">
              <div className="col-span-4 border-r border-slate-400 p-2 flex flex-col items-center justify-center min-h-[55px]">
                <span className="font-extrabold text-blue-900 text-sm tracking-tight">ORIMEC</span>
                <span className="text-[6px] text-slate-500 uppercase tracking-widest -mt-1 font-bold">Oriental Medical del Ecuador C.A.</span>
              </div>
              <div className="col-span-5 border-r border-slate-400 p-2 flex items-center justify-center font-extrabold text-xs uppercase">
                Reporte Técnico de Asistencia
              </div>
              <div className="col-span-3 text-[7.5px] p-1.5 flex flex-col justify-center gap-0.5 text-left font-mono">
                <div><span className="font-bold">CÓDIGO:</span> RE-TE-04</div>
                <div><span className="font-bold">REVISIÓN:</span> 08</div>
                <div><span className="font-bold">FECHA:</span> 01/11/2021</div>
              </div>
            </div>

            {/* Report Control Info Bar */}
            <div className="flex justify-between items-center bg-slate-100 p-2 border border-slate-300 rounded mb-4 font-mono text-[9px]">
              <div><span className="font-bold text-slate-600">Nº REPORTE TÉCNICO:</span> <span className="font-bold text-blue-900">{report.id || report.reportId || 'N/A'}</span></div>
              <div><span className="font-bold text-slate-600">ORDEN DE TRABAJO (WO):</span> <span className="font-bold text-indigo-700">{task.id}</span></div>
            </div>

            {/* 2. Información del cliente y equipo */}
            <div className="border border-slate-400 grid grid-cols-12 mb-4 text-[9px]">
              {/* Row 1: Client Name / Code */}
              <div className="col-span-2 border-r border-b border-slate-400 p-1 font-bold bg-slate-50">Cliente:</div>
              <div className="col-span-6 border-r border-b border-slate-400 p-1 font-bold uppercase">{client?.name || task.clientId}</div>
              <div className="col-span-2 border-r border-b border-slate-400 p-1 font-bold bg-slate-50">Código cliente:</div>
              <div className="col-span-2 border-b border-slate-400 p-1 font-mono">{task.clientId}</div>

              {/* Row 2: Address / City */}
              <div className="col-span-2 border-r border-b border-slate-400 p-1 font-bold bg-slate-50">Dirección:</div>
              <div className="col-span-6 border-r border-b border-slate-400 p-1">{client?.address || '-'}</div>
              <div className="col-span-2 border-r border-b border-slate-400 p-1 font-bold bg-slate-50">Ciudad / Prov:</div>
              <div className="col-span-2 border-b border-slate-400 p-1">{client?.industry || 'Quito / Pichincha'}</div>

              {/* Row 3: Equipment Name / Brand / Model */}
              <div className="col-span-2 border-r border-b border-slate-400 p-1 font-bold bg-slate-50">Equipo:</div>
              <div className="col-span-4 border-r border-b border-slate-400 p-1 font-bold">{task.equipmentName || report.equipmentName || '-'}</div>
              <div className="col-span-1 border-r border-b border-slate-400 p-1 font-bold bg-slate-50">Marca</div>
              <div className="col-span-2 border-r border-b border-slate-400 p-1">{report.eqBrand || 'GE Healthcare'}</div>
              <div className="col-span-1 border-r border-b border-slate-400 p-1 font-bold bg-slate-50">Modelo</div>
              <div className="col-span-2 border-b border-slate-400 p-1 font-bold">{report.eqModel || '-'}</div>

              {/* Row 4: Serial / Tubo Details */}
              <div className="col-span-2 border-r border-b border-slate-400 p-1 font-bold bg-slate-50">Serie Equipo:</div>
              <div className="col-span-4 border-r border-b border-slate-400 p-1 font-mono font-bold">{report.eqSerial || '-'}</div>
              <div className="col-span-1 border-r border-b border-slate-400 p-1 font-bold bg-slate-50">Serie Tubo</div>
              <div className="col-span-5 border-b border-slate-400 p-1 font-mono">{report.tuboSerial || 'N/A'}</div>

              {/* Row 5: Software / System ID */}
              <div className="col-span-2 border-r border-b border-slate-400 p-1 font-bold bg-slate-50">System ID:</div>
              <div className="col-span-4 border-r border-b border-slate-400 p-1 font-mono">{report.systemId || '-'}</div>
              <div className="col-span-2 border-r border-b border-slate-400 p-1 font-bold bg-slate-50">Versión S.O / SW:</div>
              <div className="col-span-4 border-b border-slate-400 p-1 font-mono">{report.swVersion || '-'}</div>

              {/* Row 6: Area / Date / Time */}
              <div className="col-span-2 border-r border-b border-slate-400 p-1 font-bold bg-slate-50">Atención por:</div>
              <div className="col-span-3 border-r border-b border-slate-400 p-1 text-[8px]">{report.atencionArea || 'Garantía extendida/Contrato'}</div>
              <div className="col-span-1 border-r border-b border-slate-400 p-1 font-bold bg-slate-50">Fecha</div>
              <div className="col-span-2 border-r border-b border-slate-400 p-1 font-mono">{report.executionDate ? report.executionDate.split('-').reverse().join('/') : ''}</div>
              <div className="col-span-1 border-r border-b border-slate-400 p-1 font-bold bg-slate-50">H. Inicio</div>
              <div className="col-span-1 border-r border-b border-slate-400 p-1 font-mono">{report.horaInicio || '08:00'}</div>
              <div className="col-span-1 border-r border-b border-slate-400 p-1 font-bold bg-slate-50">H. fin</div>
              <div className="col-span-1 border-b border-slate-400 p-1 font-mono">{report.horaFin || '16:00'}</div>

              {/* Row 7: Equipment Status & service area */}
              <div className="col-span-3 border-r border-slate-400 p-1 font-bold bg-slate-50">Estado al inicio</div>
              <div className="col-span-2 border-r border-slate-400 p-1 font-semibold text-center">{report.estadoInicio || 'Operativo'}</div>
              <div className="col-span-3 border-r border-slate-400 p-1 font-bold bg-slate-50">Estado al final</div>
              <div className="col-span-2 border-r border-slate-400 p-1 font-semibold text-center">{report.estadoFin || 'Operativo'}</div>
              <div className="col-span-1 border-r border-slate-400 p-1 font-bold bg-slate-50">Área</div>
              <div className="col-span-1 p-1 text-center font-bold text-[8.5px] truncate">{eng?.specialty?.split(' ')[0] || 'Ingeniería'}</div>
            </div>

            {/* 3. Motivo de la visita */}
            <div className="border border-slate-400 mb-4 overflow-hidden rounded-xs">
              <div className="bg-[#002060] text-white font-extrabold text-center uppercase tracking-wide py-1 text-[8.5px]">
                Motivo de la visita
              </div>
              <div className="p-2.5 min-h-[35px] text-slate-700 whitespace-pre-wrap">
                {report.motivoVisita || 'Mantenimiento Correctivo'}
              </div>
            </div>

            {/* 4. Trabajo Realizado */}
            <div className="border border-slate-400 mb-4 overflow-hidden rounded-xs">
              <div className="bg-[#002060] text-white font-extrabold text-center uppercase tracking-wide py-1 text-[8.5px]">
                Trabajo Realizado
              </div>
              <div className="p-2.5 min-h-[80px] text-slate-700 whitespace-pre-wrap leading-relaxed">
                {report.trabajoRealizado || report.actionsTaken || '-'}
              </div>
            </div>

            {/* 5. Observaciones */}
            <div className="border border-slate-400 mb-4 overflow-hidden rounded-xs">
              <div className="bg-[#002060] text-white font-extrabold text-center uppercase tracking-wide py-1 text-[8.5px]">
                Observaciones / Recomendaciones
              </div>
              <div className="p-2.5 min-h-[40px] text-slate-700 whitespace-pre-wrap">
                {report.observaciones || report.nextRecommendations || '-'}
              </div>
            </div>

            {/* 6. Repuestos Utilizados */}
            <div className="border border-slate-400 mb-4 overflow-hidden rounded-xs">
              <div className="bg-[#002060] text-white font-extrabold text-center uppercase tracking-wide py-1 text-[8.5px]">
                Repuestos Utilizados / Suministrados
              </div>
              <table className="w-full text-left border-collapse text-[8.5px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                    <th className="p-1 border-r border-slate-300">Código / P/N</th>
                    <th className="p-1 border-r border-slate-300">Descripción del Repuesto</th>
                    <th className="p-1 border-r border-slate-300 text-center">Cant.</th>
                    <th className="p-1 text-center">Nº Serie / Lote</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {report.partsUsed && report.partsUsed.length > 0 ? (
                    report.partsUsed.map((p, idx) => (
                      <tr key={idx}>
                        <td className="p-1 border-r border-slate-200 font-mono">{p.partNumber || '-'}</td>
                        <td className="p-1 border-r border-slate-200 font-semibold">{p.description}</td>
                        <td className="p-1 border-r border-slate-200 text-center font-bold">{p.quantity}</td>
                        <td className="p-1 text-center font-mono">{p.serialNumber || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-2 text-center text-slate-400 italic">Sin repuestos registrados para esta intervención.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 7. Firmas de Conformidad */}
            <div className="border border-slate-400 grid grid-cols-2 text-[9px] mt-6 rounded-xs overflow-hidden">
              <div className="p-3 border-r border-slate-400 flex flex-col justify-between min-h-[110px]">
                <div>
                  <span className="font-extrabold uppercase text-slate-700 block border-b border-slate-200 pb-1 mb-2 text-[8px]">Realizado por (Ingeniero ORIMEC):</span>
                  <div className="font-bold text-slate-900">{eng?.name || 'Ing. Especialista Biomédico'}</div>
                  <div className="text-[8px] text-slate-500">{eng?.specialty || 'Ingeniería de Servicio'}</div>
                </div>
                {report.signatures?.engineerSignatureUrl ? (
                  <img src={report.signatures.engineerSignatureUrl} alt="Firma Ingeniero" className="h-10 object-contain my-1" />
                ) : (
                  <div className="h-8 border-b border-dashed border-slate-300 my-1"></div>
                )}
                <div className="text-[7.5px] text-slate-400 italic">Firma / Sello de Responsable Técnico</div>
              </div>

              <div className="p-3 flex flex-col justify-between min-h-[110px]">
                <div>
                  <span className="font-extrabold uppercase text-slate-700 block border-b border-slate-200 pb-1 mb-2 text-[8px]">Recibido Conforme (Cliente):</span>
                  <div className="font-bold text-slate-900">{report.signatures?.clientRepresentativeName || client?.contactName || 'Responsable de Servicio / Físico'}</div>
                  <div className="text-[8px] text-slate-500">{client?.name}</div>
                </div>
                {report.signatures?.clientSignatureUrl ? (
                  <img src={report.signatures.clientSignatureUrl} alt="Firma Cliente" className="h-10 object-contain my-1" />
                ) : (
                  <div className="h-8 border-b border-dashed border-slate-300 my-1"></div>
                )}
                <div className="text-[7.5px] text-slate-400 italic">Firma / Sello de Recepción por el Cliente</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
