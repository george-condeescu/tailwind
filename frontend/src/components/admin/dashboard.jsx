import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Building2,
  Handshake,
  Paperclip,
  Ticket,
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import api from '../../api/axiosInstance';

const SECTIONS = [
  {
    title: 'Registre',
    icon: BookOpen,
    color: 'bg-blue-600',
    listPath: '/admin/registers',
    addPath: '/admin/registers?action=add',
    description: 'Gestionează registrele de documente',
  },
  {
    title: 'Utilizatori',
    icon: Users,
    color: 'bg-indigo-600',
    listPath: '/admin/users',
    addPath: '/admin/users?action=add',
    description: 'Conturi și permisiuni utilizatori',
  },
  {
    title: 'Departamente',
    icon: Building2,
    color: 'bg-teal-600',
    listPath: '/admin/departments',
    addPath: '/admin/departments?action=add',
    description: 'Structura organizatorică',
  },
  {
    title: 'Parteneri',
    icon: Handshake,
    color: 'bg-orange-500',
    listPath: '/admin/partners',
    addPath: '/admin/partners?action=add',
    description: 'Parteneri și entități externe',
  },
  {
    title: 'Fișiere',
    icon: Paperclip,
    color: 'bg-rose-600',
    listPath: '/lista-documente',
    addPath: '/addDocument',
    description: 'Documente și atașamente',
  },
  {
    title: 'Tichete',
    icon: Ticket,
    color: 'bg-violet-600',
    listPath: '/admin/tickets',
    addPath: '/admin/tickets?action=add',
    description: 'Gestionează tichetele',
  },
];

const ACTION_COLORS = {
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800',
  LOGIN: 'bg-purple-100 text-purple-800',
  LOGOUT: 'bg-gray-100 text-gray-700',
};

const PAGE_SIZE = 15;

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = async (p) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(
        `/admin/audit-events?limit=${PAGE_SIZE}&page=${p}`,
      );
      setEvents(data.events ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(page);
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="p-6 w-full max-w-7xl mx-auto">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">
        Dashboard Administrativ
      </h3>

      {/* Section cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-10">
        {SECTIONS.map((section) => (
          <div
            key={section.title}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col"
          >
            <div
              className={`${section.color} px-4 py-3 flex items-center gap-2`}
            >
              <section.icon size={18} className="text-white" />
              <span className="text-white font-semibold text-sm">
                {section.title}
              </span>
            </div>
            <div className="px-4 py-3 flex-1">
              <p className="text-xs text-gray-500 mb-3">
                {section.description}
              </p>
              <div className="flex flex-wrap gap-1">
                <Link
                  to={section.listPath}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                >
                  <Search size={11} /> Detalii
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Audit events */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
          <h5 className="font-semibold text-gray-800">
            Evenimente recente (audit)
          </h5>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">Total: {total}</span>
            <button
              onClick={() => fetchEvents(page)}
              disabled={loading}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded disabled:opacity-40"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Reîncarcă
            </button>
          </div>
        </div>

        {error && (
          <div className="m-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-xs text-gray-600 uppercase tracking-wide border-b border-gray-200">
              <tr>
                <th className="px-4 py-2">Data</th>
                <th className="px-4 py-2">Utilizator</th>
                <th className="px-4 py-2">Acțiune</th>
                <th className="px-4 py-2">Entitate</th>
                <th className="px-4 py-2">ID Entitate</th>
                <th className="px-4 py-2">Rezumat</th>
                <th className="px-4 py-2">IP</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-gray-400"
                  >
                    Se încarcă...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-gray-400"
                  >
                    Nu există evenimente înregistrate.
                  </td>
                </tr>
              ) : (
                events.map((ev) => (
                  <tr
                    key={ev.id}
                    className="border-b hover:bg-gray-50 even:bg-gray-50/50"
                  >
                    <td className="px-4 py-2 whitespace-nowrap text-gray-600 text-xs">
                      {ev.created_at
                        ? new Date(ev.created_at).toLocaleString('ro-RO')
                        : '-'}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-800 text-xs">
                      {ev.actor_name ?? ev.actor_email ?? (
                        <span className="text-gray-400 italic">sistem</span>
                      )}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${ACTION_COLORS[ev.action] ?? 'bg-gray-100 text-gray-700'}`}
                      >
                        {ev.action}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-700 text-xs">
                      {ev.entity_type ?? '-'}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-500 text-xs">
                      {ev.entity_id ?? '-'}
                    </td>
                    <td className="px-4 py-2 text-gray-700 text-xs max-w-xs truncate">
                      {ev.summary ?? '-'}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-400 text-xs">
                      {ev.ip_address ?? '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
          <span>
            Pagina {page} din {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-40 text-xs"
            >
              <ChevronLeft size={13} /> Anterior
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-40 text-xs"
            >
              Următor <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
