import React, { useEffect, useState, useMemo, lazy, Suspense } from 'react';
import {
  FileText,
  Users,
  Archive,
  Building2,
  Handshake,
  Clock,
  RefreshCw,
} from 'lucide-react';
import api from '../../api/axiosInstance';

/* ─── Tree components ─────────────────────────────────────────────────────── */
function TreeNode({ node, level }) {
  const [open, setOpen] = useState(false);
  return (
    <TreeRow
      node={node}
      level={level}
      isOpen={open}
      toggle={() => setOpen((v) => !v)}
    />
  );
}

function TreeRow({ node, level, isOpen, toggle }) {
  const hasChildren = node.children && node.children.length > 0;
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 8px',
          marginLeft: level * 16,
          borderRadius: 8,
          cursor: hasChildren ? 'pointer' : 'default',
          userSelect: 'none',
        }}
        onClick={hasChildren ? toggle : undefined}
      >
        <span
          style={{
            width: 18,
            display: 'inline-flex',
            justifyContent: 'center',
          }}
        >
          {hasChildren ? (isOpen ? '−' : '+') : '•'}
        </span>
        <span style={{ fontWeight: 600 }}>{node.name}</span>
      </div>
      {hasChildren && isOpen && (
        <div>
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function TreeAccordion({ data }) {
  const roots = useMemo(() => (Array.isArray(data) ? data : [data]), [data]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {roots.map((root) => (
        <TreeNode key={root.id} node={root} level={0} />
      ))}
    </div>
  );
}

/* ─── Stat card ───────────────────────────────────────────────────────────── */
const colorMap = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200',
  },
  orange: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-200',
  },
  red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
  teal: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200' },
};

function StatCard({ icon, title, value, color }) {
  const Icon = icon;
  const c = colorMap[color] ?? colorMap.blue;
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border ${c.border} p-5 flex items-center gap-4`}
    >
      <div className={`${c.bg} ${c.text} rounded-lg p-3`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value ?? '—'}</p>
        <p className="text-xs text-gray-500 mt-0.5">{title}</p>
      </div>
    </div>
  );
}

/* ─── Recent registrations table ─────────────────────────────────────────── */
function RecentTable({ rows }) {
  if (!rows.length) {
    return (
      <p className="text-gray-400 text-sm">Nu există înregistrări recente.</p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            <th className="pb-2 font-medium">Nr. înreg.</th>
            <th className="pb-2 font-medium">Obiect</th>
            <th className="pb-2 font-medium">Status</th>
            <th className="pb-2 font-medium">Dată</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.nr_inreg}
              className="border-b last:border-0 hover:bg-gray-50"
            >
              <td className="py-2 font-mono text-blue-600">{r.nr_inreg}</td>
              <td className="py-2 text-gray-700 max-w-[180px] truncate">
                {r.obiectul ?? '—'}
              </td>
              <td className="py-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    r.status === 'activ'
                      ? 'bg-green-100 text-green-700'
                      : r.status === 'inchis'
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {r.status ?? '—'}
                </span>
              </td>
              <td className="py-2 text-gray-500 whitespace-nowrap">
                {r.createdAt
                  ? new Date(r.createdAt).toLocaleDateString('ro-RO')
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Admin action card ───────────────────────────────────────────────────── */
function AdminCard({ icon, title, count, color, children }) {
  const Icon = icon;
  const c = colorMap[color] ?? colorMap.blue;
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`${c.bg} ${c.text} rounded-lg p-2`}>
          <Icon size={18} />
        </div>
        <div>
          <p className="font-semibold text-gray-800">{title}</p>
          <p className="text-xs text-gray-400">{count} înregistrări</p>
        </div>
      </div>
      <div className="w-full">
        <Suspense
          fallback={<span className="text-xs text-gray-400">Se încarcă…</span>}
        >
          {children}
        </Suspense>
      </div>
    </div>
  );
}

/* ─── Lazy modals ─────────────────────────────────────────────────────────── */
const AddDepartmentModal = lazy(() => import('./departments/addDepartment'));
const ListaDepartementModal = lazy(
  () => import('./departments/listDepartaments'),
);
const AddUserModal = lazy(() => import('./users/addUser'));
const ListUsersModal = lazy(() => import('./users/listUsers'));
const ListPartner = lazy(() => import('./partner/listPartner'));

/* ─── Dashboard ───────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const [stats, setStats] = useState({
    registre: null,
    utilizatori: null,
    fisiere: null,
    departamente: null,
    parteneri: null,
  });
  const [recentRegistre, setRecentRegistre] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState('');

  // Refresh keys for modals
  const [countDeps, setCountDeps] = useState(0);
  const [countUsers, setCountUsers] = useState(0);
  const [countPartners, setCountPartners] = useState(0);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const [regRes, usersRes, fisiereRes, depCountRes, partnersRes] =
        await Promise.allSettled([
          api.get('/registru'),
          api.get('/auth/admin/users'),
          api.get('/fisiere'),
          api.get('/departments/subordonati/count'),
          api.get('/partners'),
        ]);

      const registre =
        regRes.status === 'fulfilled' ? regRes.value.data.length : 0;
      const utilizatori =
        usersRes.status === 'fulfilled' ? usersRes.value.data.count : 0;
      const fisiere =
        fisiereRes.status === 'fulfilled' ? fisiereRes.value.data.length : 0;
      const departamente =
        depCountRes.status === 'fulfilled'
          ? depCountRes.value.data.count.count
          : 0;
      const parteneri =
        partnersRes.status === 'fulfilled' ? partnersRes.value.data.length : 0;

      setStats({ registre, utilizatori, fisiere, departamente, parteneri });
      setCountDeps(departamente);
      setCountUsers(utilizatori);
      setCountPartners(parteneri);

      if (regRes.status === 'fulfilled') {
        const all = regRes.value.data;
        // show last 5, most recent first
        setRecentRegistre([...all].reverse().slice(0, 5));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
    api
      .get('/departments/subordonati/7/subtree')
      .then((res) => setDepartments(res.data))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main className="flex-1 p-4 md:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
            <p className="text-gray-500 text-sm mt-1">
              Vedere generală a sistemului de registratură
            </p>
          </div>
          <button
            onClick={fetchStats}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <RefreshCw
              size={16}
              className={loadingStats ? 'animate-spin' : ''}
            />
            Actualizează
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* ── Stats ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            icon={FileText}
            title="Registre"
            value={stats.registre}
            color="blue"
          />
          <StatCard
            icon={Users}
            title="Utilizatori"
            value={stats.utilizatori}
            color="green"
          />
          <StatCard
            icon={Archive}
            title="Fișiere"
            value={stats.fisiere}
            color="orange"
          />
          <StatCard
            icon={Building2}
            title="Departamente"
            value={stats.departamente}
            color="red"
          />
          <StatCard
            icon={Handshake}
            title="Parteneri"
            value={stats.parteneri}
            color="teal"
          />
        </div>

        {/* ── Content ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Recent registrations */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-blue-500" />
              Înregistrări recente
            </h3>
            <RecentTable rows={recentRegistre} />
          </div>

          {/* Department tree */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Building2 size={18} className="text-red-500" />
              Structura organizatorică
            </h3>
            {departments.length > 0 ? (
              <TreeAccordion data={departments} />
            ) : (
              <p className="text-gray-400 text-sm">Se încarcă structura…</p>
            )}
          </div>
        </div>

        {/* ── Admin actions ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6">
          <AdminCard
            icon={Building2}
            title="Departamente"
            count={countDeps}
            color="red"
          >
            <AddDepartmentModal onSubmit={() => setCountDeps((n) => n + 1)} />
            <ListaDepartementModal refreshKey={countDeps} />
          </AdminCard>

          <AdminCard
            icon={Users}
            title="Utilizatori"
            count={countUsers}
            color="green"
          >
            <AddUserModal onSubmit={() => setCountUsers((n) => n + 1)} />
            <ListUsersModal
              refreshKey={countUsers}
              onAddUser={() => setCountUsers((n) => n + 1)}
              onDeleteUser={() => setCountUsers((n) => n - 1)}
            />
          </AdminCard>

          <AdminCard
            icon={Handshake}
            title="Parteneri"
            count={countPartners}
            color="teal"
          >
            <ListPartner />
          </AdminCard>

          <AdminCard
            icon={FileText}
            title="Registre"
            count={stats.registre}
            color="blue"
          >
            <p className="text-sm text-gray-500">
              Pentru gestionarea registrelor, accesați secțiunea{' '}
              <a
                href="/admin/registre"
                className="text-blue-600 hover:underline"
              >
                Registre
              </a>{' '}
              din meniul lateral.
            </p>
          </AdminCard>
        </div>
      </div>
    </main>
  );
}
