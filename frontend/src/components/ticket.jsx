import { useState, useRef } from 'react';
import { Send, CheckCircle, AlertCircle, X, ImageIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

const MAX_FILES = 5;
const MAX_SIZE_MB = 10;

export default function CreateTicket() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    subiect: '',
    mesaj: '',
    prioritate: 'medie',
  });
  const [fisiere, setFisiere] = useState([]); // { file, preview }[]
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    const remaining = MAX_FILES - fisiere.length;
    if (remaining <= 0) {
      toast.error(`Poți atașa maxim ${MAX_FILES} fișiere.`);
      return;
    }
    const toAdd = selected.slice(0, remaining);
    const oversized = toAdd.filter((f) => f.size > MAX_SIZE_MB * 1024 * 1024);
    if (oversized.length) {
      toast.error(`Fișierele nu pot depăși ${MAX_SIZE_MB} MB.`);
      return;
    }
    const withPreviews = toAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setFisiere((prev) => [...prev, ...withPreviews]);
    // reset input so same file can be re-added after removal
    e.target.value = '';
  };

  const removeFile = (index) => {
    setFisiere((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dt = e.dataTransfer;
    handleFileChange({ target: { files: dt.files }, preventDefault: () => {} });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('subiect', form.subiect);
      formData.append('mesaj', form.mesaj);
      formData.append('prioritate', form.prioritate);
      if (user?.id != null) formData.append('user_id', user.id);
      fisiere.forEach(({ file }) => formData.append('fisiere', file));

      await api.post('/tickets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // revoke object URLs
      fisiere.forEach(({ preview }) => URL.revokeObjectURL(preview));
      setSubmitted(true);
      setForm({ subiect: '', mesaj: '', prioritate: 'medie' });
      setFisiere([]);
    } catch (err) {
      toast.error(
        err.response?.data?.error || 'Eroare la trimiterea tichetului.',
      );
    } finally {
      setLoading(false);
    }
  };

  const prioritateOptions = [
    { value: 'scazuta', label: 'Scăzută' },
    { value: 'medie', label: 'Medie' },
    { value: 'ridicata', label: 'Ridicată' },
  ];

  const prioritateColors = {
    scazuta: 'text-green-600 bg-green-50 border-green-200',
    medie: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    ridicata: 'text-red-600 bg-red-50 border-red-200',
  };

  return (
    <div className="flex-1 w-full bg-linear-to-br from-blue-50 to-slate-100 py-12 px-4">
      {/* Hero */}
      <div className="max-w-2xl mx-auto text-center mb-5">
        <h3 className="text-4xl font-bold text-blue-800 mb-2">
          Deschide un tichet de suport
        </h3>
        <p className="text-gray-500 text-lg">
          Descrie problema întâmpinată și echipa noastră te va contacta cât mai
          curând.
        </p>
      </div>

      {/* Info banner dacă nu e autentificat */}
      {!user && (
        <div className="max-w-2xl mx-auto mb-6 flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-yellow-700 text-sm">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>
            Nu ești autentificat. Tichetul va fi trimis anonim. Autentifică-te
            pentru a putea urmări statusul tichetului.
          </span>
        </div>
      )}

      {/* Form card */}
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md border border-gray-100 p-8">
        <h5 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Send size={22} className="text-blue-600" />
          Detalii tichet
        </h5>

        {submitted ? (
          <div className="flex flex-col items-center py-10 gap-3 text-green-600">
            <CheckCircle size={48} />
            <p className="text-lg font-semibold">Tichet trimis cu succes!</p>
            <p className="text-gray-500 text-sm text-center">
              Echipa de suport a primit solicitarea ta și îți va răspunde în cel
              mai scurt timp.
            </p>
            <button
              className="mt-4 text-sm text-blue-600 hover:underline"
              onClick={() => setSubmitted(false)}
            >
              Deschide alt tichet
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Subiect */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Subiect <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subiect"
                value={form.subiect}
                onChange={handleChange}
                required
                maxLength={255}
                placeholder="Descrie pe scurt problema..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Mesaj */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Mesaj <span className="text-red-500">*</span>
              </label>
              <textarea
                name="mesaj"
                value={form.mesaj}
                onChange={handleChange}
                required
                rows={6}
                placeholder="Descrie în detaliu problema întâmpinată..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
            </div>

            {/* Prioritate */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Prioritate
              </label>
              <div className="flex gap-3">
                {prioritateOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex-1 cursor-pointer border rounded-lg px-3 py-2 text-sm font-medium text-center transition-colors ${
                      form.prioritate === opt.value
                        ? prioritateColors[opt.value]
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="prioritate"
                      value={opt.value}
                      checked={form.prioritate === opt.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Atașamente capturi ecran */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Capturi de ecran (opțional)
              </label>

              {/* Drop zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fisiere.length < MAX_FILES && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl px-4 py-6 flex flex-col items-center gap-2 transition-colors ${
                  fisiere.length < MAX_FILES
                    ? 'border-blue-200 bg-blue-50/40 hover:bg-blue-50 cursor-pointer'
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                }`}
              >
                <ImageIcon size={28} className="text-blue-400" />
                <p className="text-sm text-gray-500 text-center">
                  {fisiere.length < MAX_FILES ? (
                    <>
                      Trage imaginile aici sau{' '}
                      <span className="text-blue-600 font-medium">alege fișiere</span>
                      <br />
                      <span className="text-xs text-gray-400">
                        PNG, JPG, GIF, WebP — max {MAX_SIZE_MB} MB / fișier, până la {MAX_FILES} fișiere
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400">
                      Ai atins limita de {MAX_FILES} fișiere.
                    </span>
                  )}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </div>

              {/* Previzualizare fișiere */}
              {fisiere.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {fisiere.map(({ file, preview }, idx) => (
                    <div
                      key={idx}
                      className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                    >
                      <img
                        src={preview}
                        alt={file.name}
                        className="w-full h-28 object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1 flex items-center justify-between gap-1">
                        <span className="text-white text-xs truncate flex-1">
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="text-white hover:text-red-300 shrink-0"
                          title="Elimină"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User info */}
            {user && (
              <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm text-gray-500">
                Tichetul va fi înregistrat pe contul{' '}
                <span className="font-semibold text-gray-700">
                  {user.full_name || user.email}
                </span>
                .
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="self-end flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              <Send size={16} />
              {loading ? 'Se trimite...' : 'Trimite tichetul'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
