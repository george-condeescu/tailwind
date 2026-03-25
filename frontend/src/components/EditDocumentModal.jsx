import { useEffect, useRef, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trash2, Upload, FileText } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axiosInstance';
import { formatDateTime } from '../utils/functions';

const editDocumentSchema = z.object({
  note: z
    .string()
    .max(1000, 'Notițele trebuie să aibă maximum 1000 de caractere')
    .optional(),
});

export default function EditDocumentModal({ docId, show, handleClose, onSaved }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [docMeta, setDocMeta] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(editDocumentSchema),
    mode: 'onTouched',
  });

  // fetch document metadata
  useEffect(() => {
    if (!docId || !show) return;
    api
      .get(`/documents/${docId}`)
      .then((res) => {
        const d = res.data;
        setDocMeta(d);
        reset({ note: d.note || '' });
      })
      .catch(() => toast.error('Eroare la încărcarea documentului'));
  }, [docId, show, reset]);

  // fetch attached files
  const { data: files = [], isLoading: filesLoading } = useQuery({
    queryKey: ['fisiere', String(docId)],
    queryFn: async () => {
      const res = await api.get(`/fisiere/${docId}`);
      return res.data;
    },
    enabled: !!docId && show,
  });

  const onSubmit = async (data) => {
    if (!docMeta) return;
    setSaving(true);
    try {
      await api.put(`/documents/${docId}`, {
        nr_inreg: docMeta.nr_inreg,
        nr_revizie: docMeta.nr_revizie,
        created_by_user_id: docMeta.created_by_user_id,
        current_user_id: docMeta.current_user_id,
        note: data.note,
      });
      toast.success('Document actualizat cu succes');
      onSaved?.();
      setTimeout(handleClose, 800);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Eroare la salvare');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = fileInputRef.current?.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('document_id', docId);
    formData.append('uploaded_by_user_id', user.id);
    formData.append('file', file);
    try {
      await api.post('/fisiere/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fileInputRef.current.value = '';
      queryClient.invalidateQueries({ queryKey: ['fisiere', String(docId)] });
      toast.success('Fișier încărcat cu succes');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Eroare la încărcare');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Ștergi fișierul?')) return;
    try {
      await api.delete(`/fisiere/${fileId}`);
      queryClient.invalidateQueries({ queryKey: ['fisiere', String(docId)] });
      toast.success('Fișier șters');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Eroare la ștergere');
    }
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" size="lg">
      <Modal.Header
        closeButton
        style={{ backgroundColor: 'rgb(4,84,135)', color: 'white' }}
      >
        <Modal.Title>
          Editează Document{docMeta ? ` — ${docMeta.nr_inreg} / rev. ${docMeta.nr_revizie}` : ''}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Note form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mb-5">
          <div>
            <label className="block text-sm font-medium mb-1">Note</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded"
              rows={3}
              {...register('note')}
            />
            {errors.note && (
              <p className="text-red-500 text-sm mt-1">{errors.note.message}</p>
            )}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Se salvează...' : 'Salvează'}
            </button>
          </div>
        </form>

        <hr className="my-4" />

        {/* File upload */}
        <div className="mb-4">
          <h6 className="font-semibold text-gray-700 mb-2">Atașează fișier</h6>
          <form onSubmit={handleUpload} className="flex items-center gap-2">
            <input
              type="file"
              accept="application/pdf"
              ref={fileInputRef}
              className="block text-sm text-slate-500
                file:mr-3 file:py-1.5 file:px-3
                file:rounded file:border-0
                file:text-sm file:font-medium
                file:bg-sky-100 file:text-sky-800
                hover:file:bg-sky-200"
            />
            <button
              type="submit"
              disabled={uploading}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
            >
              <Upload size={14} />
              {uploading ? 'Se încarcă...' : 'Încarcă'}
            </button>
          </form>
        </div>

        {/* Files list */}
        <div>
          <h6 className="font-semibold text-gray-700 mb-2">Fișiere atașate</h6>
          {filesLoading ? (
            <p className="text-sm text-gray-500">Se încarcă fișierele...</p>
          ) : files.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Niciun fișier atașat.</p>
          ) : (
            <ul className="space-y-2">
              {files.map((file) => (
                <li
                  key={file.id}
                  className="flex items-center justify-between px-3 py-2 border rounded bg-gray-50"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText size={16} className="text-blue-500 shrink-0" />
                    <div className="min-w-0">
                      <a
                        href={`/pdfuri/${file.file_name}`}
                        download={file.original_name}
                        className="text-sm text-blue-700 hover:underline truncate block"
                      >
                        {file.original_name}
                      </a>
                      <span className="text-xs text-gray-400">
                        {formatDateTime(file.createdAt)}
                      </span>
                    </div>
                  </div>
                  {user.id === file.uploaded_by_user_id && (
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="ml-3 text-red-600 hover:text-red-800 shrink-0"
                      title="Șterge fișier"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Închide
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
