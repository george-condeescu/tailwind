import { useEffect, useState } from 'react';
import { TicketCheck, RefreshCw, X, Send } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import api from '../../../api/axiosInstance';
import { useAuth } from '../../../hooks/useAuth';
import toast from 'react-hot-toast';

const PAGE_SIZE = 10;

const prioritateColors = {
  scazuta: 'bg-green-100 text-green-700',
  medie: 'bg-yellow-100 text-yellow-700',
  ridicata: 'bg-red-100 text-red-700',
};

const statusColors = {
  nou: 'bg-blue-100 text-blue-700',
  in_lucru: 'bg-orange-100 text-orange-700',
  rezolvat: 'bg-green-100 text-green-700',
};

const STATUS_OPTIONS = ['nou', 'in_lucru', 'rezolvat'];

/* ─── View modal ─────────────────────────────────────────────────────────── */
function parseFisiere(fisiere) {
  if (Array.isArray(fisiere)) return fisiere;
  if (typeof fisiere === 'string') {
    try { return JSON.parse(fisiere); } catch { return []; }
  }
  return [];
}

function ViewTicketModal({ ticket, onClose }) {
  const [creator, setCreator] = useState(null);
  const fisiere = parseFisiere(ticket.fisiere);

  useEffect(() => {
    if (!ticket.user_id) return;
    api
      .get(`/auth/admin/users/${ticket.user_id}`)
      .then(({ data }) => setCreator(data))
      .catch(() => setCreator(null));
  }, [ticket.user_id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h5 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <TicketCheck size={18} className="text-blue-600" />
            Tichet #{ticket.id}
          </h5>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase mb-1">
              Creat de
            </p>
            <p className="text-sm text-gray-800">
              {creator
                ? `${creator.nume ?? ''} ${creator.prenume ?? ''}`.trim() ||
                  creator.username ||
                  `User #${ticket.user_id}`
                : `User #${ticket.user_id}`}
              {creator?.email && (
                <span className="ml-2 text-gray-400 text-xs">
                  ({creator.email})
                </span>
              )}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-400 uppercase mb-1">
              Subiect
            </p>
            <p className="text-sm text-gray-800">{ticket.subiect || '—'}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-400 uppercase mb-1">
              Mesaj
            </p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">
              {ticket.mesaj || '—'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase mb-1">
                Prioritate
              </p>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${prioritateColors[ticket.prioritate] ?? ''}`}
              >
                {ticket.prioritate}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase mb-1">
                Status
              </p>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[ticket.status] ?? ''}`}
              >
                {ticket.status?.replace('_', ' ')}
              </span>
            </div>
          </div>

          {ticket.admin_mesaj && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-medium text-blue-500 uppercase mb-1">
                Răspuns admin
              </p>
              <p className="text-sm text-blue-900 whitespace-pre-wrap">
                {ticket.admin_mesaj}
              </p>
            </div>
          )}

          {fisiere.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase mb-2">
                Capturi de ecran
              </p>
              <div className="grid grid-cols-3 gap-2">
                {fisiere.map((f, i) => (
                  <a
                    key={i}
                    href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/uploads/tickets/${f.filename}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-lg overflow-hidden border border-gray-200 hover:opacity-80 transition-opacity"
                    title={f.originalname}
                  >
                    <img
                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/uploads/tickets/${f.filename}`}
                      alt={f.originalname}
                      className="w-full h-20 object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Închide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Message modal ───────────────────────────────────────────────────────── */
function MessageModal({ ticket, onClose, onSent }) {
  const [mesaj, setMesaj] = useState(ticket.admin_mesaj ?? '');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mesaj.trim()) return;
    setSending(true);
    try {
      const { data } = await api.put(`/tickets/${ticket.id}/mesaj`, {
        admin_mesaj: mesaj,
      });
      onSent(data);
      toast.success('Mesaj trimis.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Eroare la trimitere.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h5 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Send size={18} className="text-blue-600" />
            Trimite mesaj — tichet #{ticket.id}
          </h5>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <textarea
            value={mesaj}
            onChange={(e) => setMesaj(e.target.value)}
            rows={5}
            placeholder="Scrie răspunsul tău..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Anulează
            </button>
            <button
              type="submit"
              disabled={sending || !mesaj.trim()}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              <Send size={14} />
              {sending ? 'Se trimite...' : 'Trimite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Ticket row ──────────────────────────────────────────────────────────── */
function TicketRow({ ticket, onView, onMessage, onDelete, onStatusChange }) {
  const [changingStatus, setChangingStatus] = useState(false);
  const fisiere = parseFisiere(ticket.fisiere);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setChangingStatus(true);
    try {
      const { data } = await api.put(`/tickets/${ticket.id}`, {
        ...ticket,
        status: newStatus,
      });
      onStatusChange(data);
    } catch {
      toast.error('Eroare la schimbarea statusului.');
    } finally {
      setChangingStatus(false);
    }
  };

  return (
    <tr className="bg-sky-100 border-b-2 border-blue-500 hover:bg-gray-50">
      <td className="px-2 py-2 whitespace-nowrap text-[16px] text-blue-900">
        {ticket.id}
      </td>
      <td className="px-2 py-2 text-[16px] font-medium text-blue-900 max-w-50 truncate">
        {ticket.subiect}
      </td>
      <td className="px-2 py-2 whitespace-nowrap text-[16px] text-blue-900">
        {ticket.user_id ?? '—'}
      </td>
      <td className="px-2 py-2 whitespace-nowrap">
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${prioritateColors[ticket.prioritate] ?? ''}`}
        >
          {ticket.prioritate}
        </span>
      </td>
      <td className="px-2 py-2 whitespace-nowrap">
        <select
          value={ticket.status}
          onChange={handleStatusChange}
          disabled={changingStatus}
          className={`text-xs px-2 py-0.5 rounded-full font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60 ${statusColors[ticket.status] ?? ''}`}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>
      </td>
      <td className="px-2 py-2 whitespace-nowrap text-[14px] text-blue-900">
        {ticket.createdAt
          ? new Date(ticket.createdAt).toLocaleDateString('ro-RO')
          : '—'}
      </td>
      <td className="px-2 py-2 whitespace-nowrap text-[14px] text-blue-900 text-center">
        {fisiere.length}
      </td>
      <td className="px-2 py-2 whitespace-nowrap text-[16px] font-medium text-blue-900 space-x-1">
        <button
          className="inline-flex bg-blue-600 px-2 text-white hover:cursor-pointer font-bold"
          onClick={() => onView(ticket)}
        >
          Afișare
        </button>{' '}
        <button
          className="inline-flex bg-green-600 px-2 text-white hover:cursor-pointer font-bold"
          onClick={() => onMessage(ticket)}
        >
          Mesaj
        </button>{' '}
        <button
          className="inline-flex bg-red-600 px-2 text-white hover:cursor-pointer font-bold"
          onClick={() => onDelete(ticket.id)}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

/* ─── Main list ───────────────────────────────────────────────────────────── */
export default function TicketsList() {
  const { user, loading: authLoading } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewTicket, setViewTicket] = useState(null);
  const [messageTicket, setMessageTicket] = useState(null);

  const fetchTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/tickets');
      setTickets(Array.isArray(data) ? data : []);
      setCurrentPage(1);
    } catch (err) {
      setError(err.response?.data?.error || 'Eroare la încărcarea tichetelor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.is_admin) fetchTickets();
  }, [user]);

  if (!authLoading && (!user || !user.is_admin)) {
    return <Navigate to="/" replace />;
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Ești sigur că vrei să ștergi acest tichet?')) return;
    try {
      await api.delete(`/tickets/${id}`);
      setTickets((prev) => prev.filter((t) => t.id !== id));
      toast.success('Tichet șters.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Eroare la ștergere.');
    }
  };

  const handleTicketUpdate = (updated) => {
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleMessageSent = (updated) => {
    handleTicketUpdate(updated);
    setMessageTicket(null);
  };

  const totalPages = Math.ceil(tickets.length / PAGE_SIZE);
  const paginated = tickets.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <main className="flex-1 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <TicketCheck size={28} className="text-blue-600" />
              Tichete de suport
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Gestionarea tichetelor trimise de utilizatori
            </p>
          </div>
          <button
            onClick={fetchTickets}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Actualizează
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center text-gray-400">
            Nu există tichete înregistrate.
          </div>
        ) : (
          <div className="relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default">
            <table className="w-full text-[16px] text-left text-body">
              <thead className="bg-blue-600 text-white uppercase text-[16px] tracking-wide">
                <tr className="bg-neutral-primary border-b border-default">
                  <th className="px-2 py-2 font-semibold">ID</th>
                  <th className="px-2 py-2 font-semibold">Subiect</th>
                  <th className="px-2 py-2 font-semibold">User ID</th>
                  <th className="px-2 py-2 font-semibold">Prioritate</th>
                  <th className="px-2 py-2 font-semibold">Status</th>
                  <th className="px-2 py-2 font-semibold">Dată</th>
                  <th className="px-2 py-2 font-semibold">Fișiere</th>
                  <th className="px-2 py-2 font-semibold">Acțiune</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((ticket) => (
                  <TicketRow
                    key={ticket.id}
                    ticket={ticket}
                    onView={setViewTicket}
                    onMessage={setMessageTicket}
                    onDelete={handleDelete}
                    onStatusChange={handleTicketUpdate}
                  />
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1 py-3">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded border text-sm disabled:opacity-40 hover:bg-gray-100"
                >
                  &laquo;
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded border text-sm ${
                        currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded border text-sm disabled:opacity-40 hover:bg-gray-100"
                >
                  &raquo;
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {viewTicket && (
        <ViewTicketModal
          ticket={viewTicket}
          onClose={() => setViewTicket(null)}
        />
      )}

      {messageTicket && (
        <MessageModal
          ticket={messageTicket}
          onClose={() => setMessageTicket(null)}
          onSent={handleMessageSent}
        />
      )}
    </main>
  );
}
