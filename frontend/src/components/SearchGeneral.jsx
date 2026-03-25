import { useState } from 'react';
import { Search, RotateCcw, ChevronDown } from 'lucide-react';
import api from '../api/axiosInstance';
import { formatDateTime } from '../utils/functions';

const STATUS_OPTIONS = ['', 'DRAFT', 'ACTIVE', 'CLOSED', 'CANCELED'];

const STATUS_COLORS = {
  DRAFT: 'text-gray-600 bg-gray-100',
  ACTIVE: 'text-green-700 bg-green-100',
  CLOSED: 'text-blue-700 bg-blue-100',
  CANCELED: 'text-red-700 bg-red-100',
};

const emptyForm = {
  nr_inreg: '',
  created_by_user_id: '',
  nr_revizie: '',
  partener: '',
  obiectul: '',
  cod_ssi: '',
  cod_angajament: '',
  status: '',
  observatii: '',
  createdAt_start: '',
  createdAt_end: '',
  updatedAt_start: '',
  updatedAt_end: '',
};

export default function SearchGeneral() {
  const [form, setForm] = useState(emptyForm);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setSearched(true);

    const params = Object.fromEntries(
      Object.entries(form).filter(([, v]) => v !== ''),
    );

    try {
      const response = await api.get('/registru/search', { params });
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(emptyForm);
    setResults([]);
    setSearched(false);
    setError(null);
  };

  return (
    <div className="w-full p-4">
      {/* Search form */}
      <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 mb-4">
        <h2 className="text-lg font-bold text-sky-900 mb-3">
          Căutare documente
        </h2>

        {/* Row 1 */}
        <div className="flex flex-wrap gap-3 mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-45">
            <label className="font-medium text-gray-700 whitespace-nowrap text-sm">
              Nr. înreg.:
            </label>
            <input
              type="text"
              name="nr_inreg"
              value={form.nr_inreg}
              onChange={handleChange}
              placeholder="ex: 2024-001"
              onKeyDown={handleKeyDown}
              className="flex-1 p-2 border border-gray-300 rounded text-sm"
            />
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-40">
            <label className="font-medium text-gray-700 whitespace-nowrap text-sm">
              Nr. revizie:
            </label>
            <input
              type="number"
              name="nr_revizie"
              value={form.nr_revizie}
              onChange={handleChange}
              placeholder="0"
              min="0"
              onKeyDown={handleKeyDown}
              className="flex-1 p-2 border border-gray-300 rounded text-sm"
            />
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-45">
            <label className="font-medium text-gray-700 whitespace-nowrap text-sm">
              Creat de (ID):
            </label>
            <input
              type="number"
              name="created_by_user_id"
              value={form.created_by_user_id}
              onChange={handleChange}
              placeholder="ID utilizator"
              min="1"
              onKeyDown={handleKeyDown}
              className="flex-1 p-2 border border-gray-300 rounded text-sm"
            />
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-40">
            <label className="font-medium text-gray-700 whitespace-nowrap text-sm">
              Status:
            </label>
            <div className="relative flex-1">
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded text-sm appearance-none pr-8"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s || '— toate —'}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="flex flex-wrap gap-3 mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-50">
            <label className="font-medium text-gray-700 whitespace-nowrap text-sm">
              Partener:
            </label>
            <input
              type="text"
              name="partener"
              value={form.partener}
              onChange={handleChange}
              placeholder="Denumire partener..."
              onKeyDown={handleKeyDown}
              className="flex-1 p-2 border border-gray-300 rounded text-sm"
            />
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-50">
            <label className="font-medium text-gray-700 whitespace-nowrap text-sm">
              Obiectul:
            </label>
            <input
              type="text"
              name="obiectul"
              value={form.obiectul}
              onChange={handleChange}
              placeholder="Obiectul documentului..."
              onKeyDown={handleKeyDown}
              className="flex-1 p-2 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>

        {/* Row 3 */}
        <div className="flex flex-wrap gap-3 mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-45">
            <label className="font-medium text-gray-700 whitespace-nowrap text-sm">
              Cod SSI:
            </label>
            <input
              type="text"
              name="cod_ssi"
              value={form.cod_ssi}
              onChange={handleChange}
              placeholder="Cod SSI..."
              onKeyDown={handleKeyDown}
              className="flex-1 p-2 border border-gray-300 rounded text-sm"
            />
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-50">
            <label className="font-medium text-gray-700 whitespace-nowrap text-sm">
              Cod angajament:
            </label>
            <input
              type="text"
              name="cod_angajament"
              value={form.cod_angajament}
              onChange={handleChange}
              placeholder="Cod angajament..."
              onKeyDown={handleKeyDown}
              className="flex-1 p-2 border border-gray-300 rounded text-sm"
            />
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-50">
            <label className="font-medium text-gray-700 whitespace-nowrap text-sm">
              Observații:
            </label>
            <input
              type="text"
              name="observatii"
              value={form.observatii}
              onChange={handleChange}
              placeholder="Observații..."
              onKeyDown={handleKeyDown}
              className="flex-1 p-2 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>

        {/* Row 4 — date ranges */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2 flex-1 min-w-40">
            <label className="font-medium text-gray-700 whitespace-nowrap text-sm">
              Creat de la:
            </label>
            <input
              type="date"
              name="createdAt_start"
              value={form.createdAt_start}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="flex-1 p-2 border border-gray-300 rounded text-sm"
            />
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-40">
            <label className="font-medium text-gray-700 whitespace-nowrap text-sm">
              până la:
            </label>
            <input
              type="date"
              name="createdAt_end"
              value={form.createdAt_end}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="flex-1 p-2 border border-gray-300 rounded text-sm"
            />
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-40">
            <label className="font-medium text-gray-700 whitespace-nowrap text-sm">
              Modificat de la:
            </label>
            <input
              type="date"
              name="updatedAt_start"
              value={form.updatedAt_start}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="flex-1 p-2 border border-gray-300 rounded text-sm"
            />
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-40">
            <label className="font-medium text-gray-700 whitespace-nowrap text-sm">
              până la:
            </label>
            <input
              type="date"
              name="updatedAt_end"
              value={form.updatedAt_end}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="flex-1 p-2 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-5 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Resetează
          </button>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center gap-1 px-8 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm disabled:opacity-60"
          >
            <Search className="w-4 h-4" />
            {loading ? 'Se caută...' : 'Caută'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          Eroare: {error}
        </div>
      )}

      {/* Results */}
      {searched && !loading && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
            <span className="text-sm font-medium text-gray-700">
              {results.length === 0
                ? 'Niciun rezultat găsit'
                : `${results.length} înregistrare${results.length !== 1 ? 'i' : ''} găsite`}
            </span>
          </div>

          {results.length > 0 && (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-amber-300 border-b-2 border-gray-300">
                  <th className="p-2 border-r border-gray-300 text-left whitespace-nowrap">
                    Nr. înreg.
                  </th>
                  <th className="p-2 border-r border-gray-300 text-left whitespace-nowrap">
                    Revizie
                  </th>
                  <th className="p-2 border-r border-gray-300 text-left whitespace-nowrap">
                    Partener
                  </th>
                  <th className="p-2 border-r border-gray-300 text-left min-w-45">
                    Obiectul
                  </th>
                  <th className="p-2 border-r border-gray-300 text-left whitespace-nowrap">
                    Cod SSI
                  </th>
                  <th className="p-2 border-r border-gray-300 text-left whitespace-nowrap">
                    Cod angajament
                  </th>
                  <th className="p-2 border-r border-gray-300 text-left whitespace-nowrap">
                    Status
                  </th>
                  <th className="p-2 border-r border-gray-300 text-left min-w-37.5">
                    Observații
                  </th>
                  <th className="p-2 border-r border-gray-300 text-left whitespace-nowrap">
                    Creat de
                  </th>
                  <th className="p-2 border-r border-gray-300 text-left whitespace-nowrap">
                    Creat la
                  </th>
                  <th className="p-2 text-left whitespace-nowrap">
                    Modificat la
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((reg) => {
                  const latestDoc =
                    reg.documents?.length > 0
                      ? reg.documents.reduce((best, d) =>
                          d.nr_revizie > best.nr_revizie ? d : best,
                        )
                      : null;
                  return (
                    <tr
                      key={reg.nr_inreg}
                      className="border-b border-amber-100 hover:bg-amber-50 transition-colors"
                    >
                      <td className="p-2 border-r border-amber-100 font-mono font-semibold text-blue-700 whitespace-nowrap">
                        {latestDoc ? (
                          <a href={`/documents/${latestDoc.id}`}>
                            {reg.nr_inreg}
                          </a>
                        ) : (
                          reg.nr_inreg
                        )}
                      </td>
                      <td className="p-2 border-r border-amber-100 text-center">
                        {latestDoc ? latestDoc.nr_revizie : '—'}
                      </td>
                      <td className="p-2 border-r border-amber-100 whitespace-nowrap">
                        {reg.partner?.denumire ?? '—'}
                      </td>
                      <td className="p-2 border-r border-amber-100">
                        {reg.obiectul}
                      </td>
                      <td className="p-2 border-r border-amber-100 whitespace-nowrap">
                        {reg.cod_ssi}
                      </td>
                      <td className="p-2 border-r border-amber-100 whitespace-nowrap">
                        {reg.cod_angajament}
                      </td>
                      <td className="p-2 border-r border-amber-100 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${STATUS_COLORS[reg.status] ?? ''}`}
                        >
                          {reg.status}
                        </span>
                      </td>
                      <td className="p-2 border-r border-amber-100 text-gray-600">
                        {reg.observatii || '—'}
                      </td>
                      <td className="p-2 border-r border-amber-100 whitespace-nowrap">
                        {reg.creator?.full_name ?? '—'}
                      </td>
                      <td className="p-2 border-r border-amber-100 whitespace-nowrap text-gray-600">
                        {formatDateTime(reg.createdAt)}
                      </td>
                      <td className="p-2 whitespace-nowrap text-gray-600">
                        {formatDateTime(reg.updatedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
