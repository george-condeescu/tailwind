import { useEffect, useState } from 'react';
import { TicketCheck, RefreshCw, X, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../hooks/useAuth';

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

const statusLabels = {
  nou: 'Nou',
  in_lucru: 'În lucru',
  rezolvat: 'Rezolvat',
};

const prioritateLabels = {
  scazuta: 'Scăzută',
  medie: 'Medie',
  ridicata: 'Ridicată',
};

function TicketCard({ ticket }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-start justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-start gap-3 min-w-0">
          <div className="mt-0.5 shrink-0 text-blue-500">
            <TicketCheck size={20} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 truncate">{ticket.subiect}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              #{ticket.id} &middot;{' '}
              {ticket.createdAt
                ? new Date(ticket.createdAt).toLocaleDateString('ro-RO', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })
                : '—'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4 shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${prioritateColors[ticket.prioritate] ?? ''}`}>
            {prioritateLabels[ticket.prioritate] ?? ticket.prioritate}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[ticket.status] ?? ''}`}>
            {statusLabels[ticket.status] ?? ticket.status}
          </span>
          {ticket.admin_mesaj && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-600 flex items-center gap-1">
              <MessageSquare size={11} />
              Răspuns
            </span>
          )}
          {expanded ? (
            <ChevronUp size={16} className="text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-6 pb-6 flex flex-col gap-4 border-t border-gray-100 pt-4">
          {/* Mesaj utilizator */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase mb-1">Mesajul tău</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg px-4 py-3">
              {ticket.mesaj || '—'}
            </p>
          </div>

          {/* Capturi ecran */}
          {ticket.fisiere?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase mb-2">
                Capturi de ecran atașate ({ticket.fisiere.length})
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {ticket.fisiere.map((f, i) => (
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

          {/* Raspuns admin */}
          {ticket.admin_mesaj ? (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
              <p className="text-xs font-medium text-blue-500 uppercase mb-1 flex items-center gap-1">
                <MessageSquare size={12} />
                Răspuns echipă suport
              </p>
              <p className="text-sm text-blue-900 whitespace-pre-wrap">{ticket.admin_mesaj}</p>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-700">
              Tichetul tău este în așteptare. Echipa de suport îți va răspunde în cel mai scurt timp.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TicketsMele() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTickets = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/tickets/user/${user.id}`);
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.error || 'Eroare la încărcarea tichetelor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user?.id]);

  const counts = {
    total: tickets.length,
    nou: tickets.filter((t) => t.status === 'nou').length,
    in_lucru: tickets.filter((t) => t.status === 'in_lucru').length,
    rezolvat: tickets.filter((t) => t.status === 'rezolvat').length,
  };

  return (
    <main className="flex-1 w-full bg-linear-to-br from-blue-50 to-slate-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-blue-800 flex items-center gap-2">
              <TicketCheck size={28} />
              Tichetele mele
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Urmărește statusul solicitărilor și răspunsurile echipei de suport.
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

        {/* Stats */}
        {!loading && tickets.length > 0 && (
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total', value: counts.total, color: 'bg-white border-gray-100 text-gray-700' },
              { label: 'Noi', value: counts.nou, color: 'bg-blue-50 border-blue-100 text-blue-700' },
              { label: 'În lucru', value: counts.in_lucru, color: 'bg-orange-50 border-orange-100 text-orange-700' },
              { label: 'Rezolvate', value: counts.rezolvat, color: 'bg-green-50 border-green-100 text-green-700' },
            ].map(({ label, value, color }) => (
              <div key={label} className={`rounded-xl border px-4 py-3 shadow-sm text-center ${color}`}>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs mt-0.5 opacity-70">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <X size={16} />
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <TicketCheck size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Nu ai trimis niciun tichet încă.</p>
            <p className="text-gray-400 text-sm mt-1 mb-5">
              Dacă ai o problemă sau o întrebare, echipa noastră de suport te poate ajuta.
            </p>
            <Link
              to="/support"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
            >
              Deschide un tichet
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
            <div className="text-center pt-2">
              <Link
                to="/support"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
              >
                + Deschide un tichet nou
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
