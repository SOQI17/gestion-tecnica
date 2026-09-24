import React, { useState, useMemo, useDeferredValue } from 'react';
import { FileText, Search, Plus, Upload, Download, Trash2, X, Layers, Eye, Pencil, Loader2, FolderOpen } from 'lucide-react';
import { OrimecDocumentRecord, OrimecDocumentFile } from '../types';
import { uploadFileToCloudinary, triggerDirectDownload, MAX_FILE_SIZE_BYTES } from '../utils/cloudinary';

interface OrimecPortalProps {
  documents: OrimecDocumentRecord[];
  onAdd: (doc: OrimecDocumentRecord) => void;
  onUpdate: (doc: OrimecDocumentRecord) => void;
  onDelete?: (id: string) => void;
  currentUserEmail?: string;
  userRole?: string;
}

const DOC_TYPES: OrimecDocumentFile['docType'][] = ['Contrato', 'Garantía', 'Acta de entrega-recepción', 'Otro'];

const sanitizeForFilename = (val: string): string =>
  (val || 'SD').trim().replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') || 'SD';

const emptyForm = () => ({
  clientName: '',
  clientTaxId: '',
  institutionOrAddress: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  processCode: '',
  equipmentName: '',
  equipmentBrand: '',
  equipmentModel: '',
  equipmentSerial: '',
  recordDate: new Date().toISOString().split('T')[0],
});

export default function OrimecPortal({ documents, onAdd, onUpdate, onDelete, currentUserEmail, userRole }: OrimecPortalProps) {
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [pendingFiles, setPendingFiles] = useState<OrimecDocumentFile[]>([]);

  // Combo editable: sugiere los 4 tipos predefinidos pero acepta cualquier texto libre
  const [newFileDocTypeText, setNewFileDocTypeText] = useState<string>('Contrato');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [viewingDoc, setViewingDoc] = useState<OrimecDocumentRecord | null>(null);
  const [docToDelete, setDocToDelete] = useState<OrimecDocumentRecord | null>(null);

  const isAdmin = userRole === 'admin';

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    const active = documents.filter(d => !d.deleted);
    if (!q) return active;
    return active.filter(d => {
      const haystack = [
        d.clientName, d.clientTaxId, d.institutionOrAddress, d.processCode,
        d.equipmentName, d.equipmentBrand, d.equipmentModel, d.equipmentSerial,
        d.recordDate, ...d.files.map(f => f.docType), ...d.files.map(f => f.customTypeLabel || '')
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [documents, deferredSearch]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => (b.recordDate || '').localeCompare(a.recordDate || '')), [filtered]);
  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
  const paginated = useMemo(() => sorted.slice((page - 1) * itemsPerPage, page * itemsPerPage), [sorted, page]);

  const resetForm = () => {
    setForm(emptyForm());
    setPendingFiles([]);
    setNewFileDocTypeText('Contrato');
    setUploadError(null);
    setEditingId(null);
  };

  // Si el texto coincide (sin distinguir mayúsculas) con uno de los 3 tipos fijos, se usa ese tipo
  // tal cual; cualquier otro texto se guarda como 'Otro' con esa etiqueta libre.
  const resolveDocType = (text: string): { docType: OrimecDocumentFile['docType']; customTypeLabel?: string } => {
    const trimmed = text.trim();
    const preset = DOC_TYPES.find(t => t !== 'Otro' && t.toLowerCase() === trimmed.toLowerCase());
    if (preset) return { docType: preset };
    return { docType: 'Otro', customTypeLabel: trimmed };
  };

  const openNewModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (docRec: OrimecDocumentRecord) => {
    setForm({
      clientName: docRec.clientName || '',
      clientTaxId: docRec.clientTaxId || '',
      institutionOrAddress: docRec.institutionOrAddress || '',
      contactName: docRec.contactName || '',
      contactPhone: docRec.contactPhone || '',
      contactEmail: docRec.contactEmail || '',
      processCode: docRec.processCode || '',
      equipmentName: docRec.equipmentName || '',
      equipmentBrand: docRec.equipmentBrand || '',
      equipmentModel: docRec.equipmentModel || '',
      equipmentSerial: docRec.equipmentSerial || '',
      recordDate: docRec.recordDate || new Date().toISOString().split('T')[0],
    });
    setPendingFiles(docRec.files || []);
    setEditingId(docRec.id);
    setUploadError(null);
    setIsModalOpen(true);
  };

  const computeFileName = (typeLabel: string): string => {
    const equipoOProceso = form.equipmentName.trim() || form.processCode.trim() || 'SinEquipo';
    const parts = [typeLabel || 'Documento', form.clientName.trim() || 'Cliente', equipoOProceso, form.recordDate || 'SinFecha'];
    return `${parts.map(sanitizeForFilename).join('_')}.pdf`;
  };

  const handleFileSelected = async (file: File | null) => {
    setUploadError(null);
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Solo se aceptan archivos PDF en Documentos ORIMEC.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setUploadError(`El archivo pesa ${sizeMb} MB. El límite máximo es de 20 MB.`);
      return;
    }
    if (!newFileDocTypeText.trim()) {
      setUploadError('Ingrese o seleccione el tipo de documento.');
      return;
    }
    try {
      setIsUploading(true);
      setUploadProgress(0);
      const url = await uploadFileToCloudinary(file, (p) => setUploadProgress(p));
      const { docType, customTypeLabel } = resolveDocType(newFileDocTypeText);
      const newFile: OrimecDocumentFile = {
        id: `FILE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        docType,
        ...(customTypeLabel ? { customTypeLabel } : {}),
        url,
        fileName: computeFileName(customTypeLabel || docType),
        sizeBytes: file.size,
        uploadedAt: new Date().toISOString(),
      };
      setPendingFiles(prev => [...prev, newFile]);
    } catch (err: any) {
      setUploadError(err?.message || 'Error al subir el archivo a Cloudinary.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removePendingFile = (fileId: string) => {
    setPendingFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientName.trim()) {
      setUploadError('El nombre / razón social del cliente es obligatorio.');
      return;
    }
    if (pendingFiles.length === 0) {
      setUploadError('Debe adjuntar al menos un archivo PDF con su tipo de documento asignado.');
      return;
    }
    const nowIso = new Date().toISOString();
    if (editingId) {
      const existing = documents.find(d => d.id === editingId);
      const updated: OrimecDocumentRecord = {
        ...(existing as OrimecDocumentRecord),
        ...form,
        id: editingId,
        files: pendingFiles,
        updatedAt: nowIso,
      };
      onUpdate(updated);
    } else {
      const newRecord: OrimecDocumentRecord = {
        id: `ORIMEC-${Date.now()}`,
        ...form,
        files: pendingFiles,
        createdBy: currentUserEmail || 'desconocido',
        createdAt: nowIso,
      };
      onAdd(newRecord);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const inputCls = "w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all";
  const labelCls = "block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1";

  return (
    <div className="space-y-6 font-sans">
      {/* Header Block */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-800 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
            <Layers className="w-5 h-5 text-white" strokeWidth={2.4} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              Documentos ORIMEC
            </h4>
            <p className="text-3xs text-slate-500 mt-0.5 font-medium">Repositorio de documentación de procesos ganados y equipos nuevos: contratos, garantías y actas de entrega-recepción.</p>
          </div>
        </div>
        <button
          onClick={openNewModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-3xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs border border-indigo-600 transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nuevo Registro</span>
        </button>
      </div>

      {/* Search & count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar por cliente, tipo de documento, equipo o fecha..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-4 py-1.5 text-xs font-semibold text-slate-700 outline-hidden focus:ring-1 focus:ring-indigo-500 placeholder-slate-400"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
        <span className="text-3xs text-slate-400 font-bold uppercase tracking-wider">{sorted.length} registro{sorted.length === 1 ? '' : 's'}</span>
      </div>

      {/* List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left border-collapse text-[10.5px] font-semibold text-slate-655">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-3xs font-bold uppercase text-slate-400 tracking-wider">
                <th className="p-3">Cliente / Proceso</th>
                <th className="p-3">Equipo</th>
                <th className="p-3">Fecha</th>
                <th className="p-3 text-center">Archivos</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 text-3xs font-bold">
                    {search ? 'No se encontraron registros con ese filtro.' : 'Aún no hay documentos registrados. Crea el primero con "Nuevo Registro".'}
                  </td>
                </tr>
              ) : (
                paginated.map(docRec => (
                  <tr key={docRec.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-900 font-extrabold text-[11.5px]">{docRec.clientName}</span>
                        <span className="text-slate-400 text-3xs">
                          {docRec.processCode ? `Proceso: ${docRec.processCode}` : (docRec.clientTaxId ? `RUC/CI: ${docRec.clientTaxId}` : '-')}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      {docRec.equipmentName ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-slate-800 font-bold">{docRec.equipmentName}</span>
                          <span className="text-slate-500 text-3xs">{[docRec.equipmentBrand, docRec.equipmentModel].filter(Boolean).join(' / ') || '-'}</span>
                        </div>
                      ) : <span className="text-slate-400">-</span>}
                    </td>
                    <td className="p-3 font-mono text-slate-700">{docRec.recordDate || '-'}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setViewingDoc(docRec)}
                        className="inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full text-[9px] font-black cursor-pointer transition-colors"
                        title="Ver archivos adjuntos"
                      >
                        <FileText className="w-2.5 h-2.5" />
                        {docRec.files.length}
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setViewingDoc(docRec)}
                          className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors border border-indigo-200 cursor-pointer"
                          title="Ver detalle"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => openEditModal(docRec)}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                          title="Editar registro"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        {isAdmin && onDelete && (
                          <button
                            onClick={() => setDocToDelete(docRec)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors border border-rose-200 cursor-pointer"
                            title="Eliminar registro"
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100">
            <span className="text-3xs font-bold text-slate-400 uppercase">Página {page} de {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                className="px-2.5 py-1 text-3xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                className="px-2.5 py-1 text-3xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl p-6 space-y-4 animate-in zoom-in-95 duration-150 relative">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-indigo-600" />
                {editingId ? 'Editar Registro de Documentos' : 'Nuevo Registro de Documentos'}
              </h4>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col max-h-[75vh]">
              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {/* Client / process data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Nombre / Razón Social *</label>
                    <input required className={inputCls} value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} placeholder="Ej. Hospital de Especialidades..." />
                  </div>
                  <div>
                    <label className={labelCls}>RUC o Cédula</label>
                    <input className={inputCls} value={form.clientTaxId} onChange={e => setForm(f => ({ ...f, clientTaxId: e.target.value }))} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Institución o Dirección</label>
                    <input className={inputCls} value={form.institutionOrAddress} onChange={e => setForm(f => ({ ...f, institutionOrAddress: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Persona de Contacto</label>
                    <input className={inputCls} value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Teléfono de Contacto</label>
                    <input className={inputCls} value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Correo de Contacto</label>
                    <input type="email" className={inputCls} value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Código de Proceso / Contrato</label>
                    <input className={inputCls} value={form.processCode} onChange={e => setForm(f => ({ ...f, processCode: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Fecha *</label>
                    <input required type="date" className={inputCls} value={form.recordDate} onChange={e => setForm(f => ({ ...f, recordDate: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Equipo (Nombre)</label>
                    <input className={inputCls} value={form.equipmentName} onChange={e => setForm(f => ({ ...f, equipmentName: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Marca</label>
                    <input className={inputCls} value={form.equipmentBrand} onChange={e => setForm(f => ({ ...f, equipmentBrand: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Modelo</label>
                    <input className={inputCls} value={form.equipmentModel} onChange={e => setForm(f => ({ ...f, equipmentModel: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Serie</label>
                    <input className={inputCls} value={form.equipmentSerial} onChange={e => setForm(f => ({ ...f, equipmentSerial: e.target.value }))} />
                  </div>
                </div>

                {/* Files section */}
                <div className="space-y-2.5 pt-3 border-t border-slate-150">
                  <h5 className="font-extrabold text-[10px] text-slate-500 uppercase tracking-wider">Archivos PDF</h5>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2.5">
                    <div>
                      <label className={labelCls}>Tipo de Documento</label>
                      <input
                        list="orimec-doc-type-options"
                        className={inputCls}
                        value={newFileDocTypeText}
                        onChange={e => setNewFileDocTypeText(e.target.value)}
                        placeholder="Ej. Contrato, Garantía, o escribe uno propio..."
                      />
                      <datalist id="orimec-doc-type-options">
                        {DOC_TYPES.filter(t => t !== 'Otro').map(t => <option key={t} value={t} />)}
                      </datalist>
                    </div>
                    <div>
                      <label className={labelCls}>Seleccionar Archivo PDF (máx. 20 MB)</label>
                      <input
                        type="file"
                        accept="application/pdf"
                        disabled={isUploading}
                        onChange={e => {
                          const file = e.target.files?.[0] || null;
                          handleFileSelected(file);
                          e.target.value = '';
                        }}
                        className="block w-full text-3xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-3xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 file:cursor-pointer hover:file:bg-indigo-100 transition-all disabled:opacity-50"
                      />
                      {isUploading && (
                        <p className="text-3xs font-bold text-amber-600 animate-pulse mt-1 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> Subiendo... ({uploadProgress}%)
                        </p>
                      )}
                      {uploadError && (
                        <p className="text-3xs font-bold text-rose-600 mt-1">{uploadError}</p>
                      )}
                    </div>
                  </div>

                  {/* Pending files list */}
                  <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-48 overflow-y-auto">
                    {pendingFiles.length === 0 ? (
                      <div className="p-3 text-center text-slate-400 italic text-[9px]">Ningún archivo adjuntado todavía.</div>
                    ) : (
                      pendingFiles.map(f => (
                        <div key={f.id} className="flex items-center justify-between gap-2 p-2.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold text-slate-800 truncate">{f.fileName}</p>
                              <p className="text-[9px] text-slate-400">{f.docType === 'Otro' ? f.customTypeLabel : f.docType}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button type="button" onClick={() => triggerDirectDownload(f.url, f.fileName)} className="p-1 text-slate-400 hover:text-indigo-600 cursor-pointer" title="Descargar">
                              <Download className="w-3 h-3" />
                            </button>
                            <button type="button" onClick={() => removePendingFile(f.id)} className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer" title="Quitar">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 mt-3">
                <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={isUploading} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-xs flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  {editingId ? 'Guardar Cambios' : 'Crear Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Files Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-sm text-slate-800">{viewingDoc.clientName}</h4>
              <button onClick={() => setViewingDoc(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-[10px] text-slate-500 font-semibold space-y-0.5">
              {viewingDoc.processCode && <p>Proceso: {viewingDoc.processCode}</p>}
              {viewingDoc.equipmentName && <p>Equipo: {viewingDoc.equipmentName} {[viewingDoc.equipmentBrand, viewingDoc.equipmentModel].filter(Boolean).join(' / ')}</p>}
              <p>Fecha: {viewingDoc.recordDate}</p>
            </div>
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100">
              {viewingDoc.files.map(f => (
                <div key={f.id} className="flex items-center justify-between gap-2 p-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-800 truncate">{f.fileName}</p>
                      <p className="text-[9px] text-slate-400">{f.docType === 'Otro' ? f.customTypeLabel : f.docType}</p>
                    </div>
                  </div>
                  <button onClick={() => triggerDirectDownload(f.url, f.fileName)} className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200 cursor-pointer shrink-0" title="Descargar">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {docToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-3xs flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-sm w-full p-4 space-y-4 animate-in zoom-in-95 duration-150">
            <h4 className="font-extrabold text-xs text-red-700 uppercase tracking-wider">⚠ Confirmar Eliminación</h4>
            <p className="text-3xs text-slate-650 font-semibold leading-normal">
              ¿Estás seguro de que deseas eliminar el registro de <strong>{docToDelete.clientName}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setDocToDelete(null)} className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">
                Cancelar
              </button>
              <button
                onClick={() => { if (onDelete) onDelete(docToDelete.id); setDocToDelete(null); }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer shadow-xs"
              >
                Eliminar Registro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
