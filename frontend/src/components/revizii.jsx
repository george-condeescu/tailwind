import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal } from 'react-bootstrap';
import { toast, Toaster } from 'react-hot-toast';
import { Plus, FileText, RefreshCw, Download } from 'lucide-react';
import api from '../api/axiosInstance';
import { useAuth } from '../hooks/useAuth';

export default function Revizii({ documentData }) {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [note, setNote] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const nr_inreg = documentData?.nr_inreg;

  const query = useQuery({
    queryKey: ['revizii', nr_inreg],
    queryFn: async () => {
      const response = await api.get(`/documents/nr-inreg/${nr_inreg}`);
      return response.data;
    },
    enabled: !!nr_inreg,
  });
  const { data: revizii, isLoading, error } = query;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newDoc = await api.post('/documents', {
        nr_inreg,
        created_by_user_id: user.id,
        current_user_id: user.id,
        content_snapshot: JSON.stringify(documentData?.registru ?? {}),
        note: note || undefined,
      });

      if (file) {
        const formData = new FormData();
        formData.append('document_id', newDoc.data.id);
        formData.append('uploaded_by_user_id', user.id);
        formData.append('file', file);
        await api.post('/fisiere/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      toast.success('Revizia a fost adăugată cu succes!');
      setShowModal(false);
      setNote('');
      setFile(null);
      query.refetch();
    } catch (err) {
      console.error('Eroare la adăugarea reviziei:', err);
      toast.error('Eroare la adăugarea reviziei.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-4">Se încarcă reviziile...</div>;
  if (error) return <div className="p-4 text-red-500">Eroare: {error.message}</div>;

  const registru = documentData?.registru;

  return (
    <div className="p-4">
      <Toaster position="top-center" />
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-2xl font-bold text-blue-800">
          Revizii — {nr_inreg}
        </h5>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Plus size={16} /> Adaugă Revizie
        </button>
      </div>
      <hr className="mb-4" />

      {revizii?.length === 0 && (
        <p className="text-gray-500">Nu există revizii pentru acest document.</p>
      )}

      {revizii?.map((rev) => (
        <div key={rev.id} className="bg-white border rounded p-3 mb-3 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-blue-700">
              Revizia #{rev.nr_revizie}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(rev.createdAt).toLocaleDateString('ro-RO')} — {rev.creator?.full_name}
            </span>
          </div>
          {rev.note && (
            <p className="text-sm text-gray-700 mb-2">
              <strong>Notă:</strong> {rev.note}
            </p>
          )}
          {rev.fisiere?.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium text-gray-500 mb-1">Fișiere atașate:</p>
              {rev.fisiere.map((f) => (
                <a
                  key={f.id}
                  href={`/pdfuri/${f.file_name}`}
                  download={f.original_name}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline mb-1"
                >
                  <Download size={14} /> {f.original_name}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Adaugă Revizie — {nr_inreg}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Date din registru (read-only) */}
          <div className="bg-gray-50 border rounded p-3 mb-4 space-y-1 text-sm">
            <p><strong>Nr. înregistrare:</strong> {registru?.nr_inreg ?? nr_inreg}</p>
            <p><strong>Partener:</strong> {registru?.partner?.denumire ?? '—'}</p>
            <p><strong>Obiectul:</strong> {registru?.obiectul ?? '—'}</p>
            <p><strong>Cod SSI:</strong> {registru?.cod_ssi ?? '—'}</p>
            <p><strong>Cod Angajament:</strong> {registru?.cod_angajament ?? '—'}</p>
            <p><strong>Status:</strong> {registru?.status ?? '—'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Notă revizie</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                rows={3}
                placeholder="Notă opțională pentru această revizie..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                <div className="flex items-center gap-2">
                  <FileText size={16} /> Fișier PDF (opțional)
                </div>
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files[0] ?? null)}
                className="
                  block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-3
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-sky-300 file:text-sky-900
                  hover:file:bg-sky-400
                "
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
              {submitting ? 'Se salvează...' : 'Adaugă Revizia'}
            </button>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="bg-secondary text-white py-2 px-4 rounded"
            onClick={() => setShowModal(false)}
          >
            Închide
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
