import { useState, useRef, use } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast, Toaster } from 'react-hot-toast';
import { Plus, FileText, RefreshCw, X, Paperclip } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../hooks/useAuth';

// Validare Zod
import { revizieCreateSchema } from '../validations/revizie.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export default function AdaugaRevizie() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const nrInregFromUrl = searchParams.get('nr_inreg') ?? '';
  const [selectedNrInreg, setSelectedNrInreg] = useState(nrInregFromUrl);
  const [revizieNr, setRevizieNr] = useState('');
  const [note, setNote] = useState('');
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Încărcăm lista de registre pentru dropdown (doar ale utilizatorului curent)
  const { data: registers, isLoading: registersLoading } = useQuery({
    queryKey: ['registers', user?.id],
    queryFn: async () => {
      const res = await api.get('/registru/search?created_by_me=true');
      return res.data;
    },
  });

  // Încărcăm detaliile registrului selectat pentru snapshot
  const { data: registruDetails, isLoading: registruLoading } = useQuery({
    queryKey: ['register', selectedNrInreg],
    queryFn: async () => {
      const res = await api.get(`/registru/${selectedNrInreg}`);
      return res.data;
    },
    enabled: !!selectedNrInreg,
  });

  // Ultimul nr revizie pentru registrul selectat
  const { data: existingDocs } = useQuery({
    queryKey: ['documents-nr-inreg', selectedNrInreg],
    queryFn: async () => {
      const res = await api.get(
        `/documents/nr-inreg/${encodeURIComponent(selectedNrInreg)}`,
      );
      return res.data;
    },
    enabled: !!selectedNrInreg,
  });

  // Calculăm ultimul nr revizie pentru a-l afișa ca referință
  const lastRevizieNr = existingDocs?.length
    ? Math.max(...existingDocs.map((d) => d.nr_revizie ?? 0))
    : null;

  const handleFileAdd = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const handleFileRemove = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const initialFormValues = {
    nr_inreg: nrInregFromUrl,
    nr_revizie: '',
    note: '',
  };

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(revizieCreateSchema),
    defaultValues: initialFormValues,
    mode: 'onSubmit',
  });

  const onSubmit = async (data) => {
    console.log('Form data:', data);
    if (!data.nr_inreg) {
      toast.error('Selectați un registru!');
      return;
    }
    setSubmitting(true);
    try {
      // Validare client-side
      revizieCreateSchema.parse({
        nr_inreg: data.nr_inreg,
        nr_revizie: data.nr_revizie ? parseInt(data.nr_revizie) : undefined,
        created_by_user_id: user.id,
        content_snapshot: JSON.stringify(registruDetails ?? {}),
        note: data.note,
        current_user_id: user.id,
      });

      // 1. Creăm documentul (revizia)
      const newDoc = await api.post('/documents', {
        nr_inreg: data.nr_inreg,
        created_by_user_id: user.id,
        current_user_id: user.id,
        content_snapshot: JSON.stringify(registruDetails ?? {}),
        note: data.note || undefined,
        nr_revizie: data.nr_revizie ? parseInt(data.nr_revizie) : undefined,
      });

      const documentId = newDoc.data.id;

      // 2. Încărcăm fișierele atașate
      for (const file of files) {
        const formData = new FormData();
        formData.append('document_id', documentId);
        formData.append('uploaded_by_user_id', user.id);
        formData.append('file', file);
        await api.post('/fisiere/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      // 3. Creăm circulația aferentă reviziei
      const now = new Date();
      await api.post('/circulatie', {
        document_id: documentId,
        action: 'RECEIVE',
        from_user_id: user.id,
        to_user_id: user.id,
        data_intrare: now,
        data_iesire: null,
      });

      // 4. Setam statusul registrului la "ACTIVE"
      await api.put(`/registru/${selectedNrInreg}`, { status: 'ACTIVE' });

      await queryClient.invalidateQueries({ queryKey: ['documents', user.id] });
      await queryClient.invalidateQueries({
        queryKey: ['documentsCount', user.id],
      });
      toast.success('Revizia a fost adăugată cu succes!');
      setTimeout(() => navigate('/inbox'), 2000);
      setFiles([]);
      setSelectedNrInreg('');
    } catch (err) {
      console.error('Eroare la adăugarea reviziei:', err);
      toast.error(
        err?.response?.data?.error || 'Eroare la adăugarea reviziei.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Toaster position="top-center" />
      <h2 className="text-2xl font-bold text-blue-800 mb-6">Adaugă Revizie</h2>

      <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-6">
        {/* Selectare registru */}
        <div>
          <label className="block text-sm font-medium mb-1">Registru</label>
          {registersLoading ? (
            <p className="text-gray-500 text-sm">Se încarcă registrele...</p>
          ) : (
            <select
              name="nr_inreg"
              id="nr_inreg"
              {...register('nr_inreg', {
                onChange: (e) => setSelectedNrInreg(e.target.value),
              })}
              disabled={!!nrInregFromUrl}
              className="w-full border rounded px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">-- Selectați un registru --</option>
              {registers?.map((r) => (
                <option key={r.nr_inreg} value={r.nr_inreg}>
                  {r.nr_inreg} — {r.partner?.denumire ?? '—'}
                </option>
              ))}
            </select>
          )}
          {errors.nr_inreg && (
            <p className="text-red-500 text-sm mt-1">
              {errors.nr_inreg.message}
            </p>
          )}
        </div>

        {/* Informații registru selectat */}
        {selectedNrInreg && (
          <div className="bg-gray-50 border rounded p-4 space-y-1 text-sm">
            {registruLoading ? (
              <p className="text-gray-500">Se încarcă detaliile...</p>
            ) : registruDetails ? (
              <>
                <p>
                  <strong>Nr. înregistrare:</strong> {registruDetails.nr_inreg}
                </p>
                <p>
                  <strong>Partener:</strong>{' '}
                  {registruDetails.partner?.denumire ?? '—'}
                </p>
                <p>
                  <strong>Obiectul:</strong> {registruDetails.obiectul}
                </p>
                <p>
                  <strong>Cod SSI:</strong> {registruDetails.cod_ssi}
                </p>
                <p>
                  <strong>Cod Angajament:</strong>{' '}
                  {registruDetails.cod_angajament}
                </p>
                <p>
                  <strong>Observații:</strong>{' '}
                  {registruDetails.observatii ?? '—'}
                </p>
                <p>
                  <strong>Status:</strong> {registruDetails.status}
                </p>
                <p>
                  <strong>Data creare:</strong>{' '}
                  {new Date(registruDetails.createdAt).toLocaleDateString(
                    'ro-RO',
                  )}
                </p>
              </>
            ) : null}
          </div>
        )}

        {/* Nr revizie */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Nr. revizie
            {lastRevizieNr !== null && (
              <span className="text-gray-400 font-normal ml-1">
                (ultima: {lastRevizieNr})
              </span>
            )}
          </label>
          <input
            name="nr_revizie"
            id="nr_revizie"
            type="number"
            placeholder={lastRevizieNr !== null ? String(lastRevizieNr) : ''}
            className="w-full border rounded px-3 py-2"
            {...register('nr_revizie')}
          />
          {errors.nr_revizie && (
            <p className="text-red-500 text-sm mt-1">
              {errors.nr_revizie.message}
            </p>
          )}
        </div>

        {/* Notă revizie */}
        <div>
          <label className="block text-sm font-medium mb-1">Notă revizie</label>
          <textarea
            name="note"
            id="note"
            className="w-full border rounded px-3 py-2"
            rows={3}
            placeholder="Notă opțională pentru această revizie..."
            {...register('note')}
          />
          {errors.note && (
            <p className="text-red-500 text-sm mt-1">{errors.note.message}</p>
          )}
        </div>

        {/* Atașare fișiere */}
        <div>
          <label className="block text-sm font-medium mb-2">
            <div className="flex items-center gap-2">
              <Paperclip size={16} /> Fișiere atașate
            </div>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileAdd}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 border border-dashed border-gray-400 text-gray-600 px-4 py-2 rounded hover:border-blue-500 hover:text-blue-600 transition-colors"
          >
            <Paperclip size={16} /> Atașează fișier(e)
          </button>

          {files.length > 0 && (
            <ul className="mt-3 space-y-2">
              {files.map((f, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between bg-white border rounded px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-blue-500" />
                    <span>{f.name}</span>
                    <span className="text-gray-400">
                      ({(f.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFileRemove(i)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !selectedNrInreg}
          className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {submitting ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <Plus size={16} />
          )}
          {submitting ? 'Se salvează...' : 'Adaugă Revizia'}
        </button>
      </form>
    </div>
  );
}
