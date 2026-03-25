import { useEffect, useState, lazy, Suspense } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../../api/axiosInstance.js';
import { usePartner } from '../../../hooks/usePartner.js';

const EditRegistruModal = lazy(() => import('./editRegistru.jsx'));

const PAGE_SIZE = 10;

const STATUS_COLORS = {
  DRAFT: 'bg-yellow-100 text-yellow-800',
  ACTIVE: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-700',
  CANCELED: 'bg-red-100 text-red-800',
};

export default function AdminListaRegistre() {
  const { getAllPartners } = usePartner();
  const [registre, setRegistre] = useState([]);
  const [allPartners, setAllPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [showEdit, setShowEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchRegistre = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/registru');
      console.log('Registre:', data);
      setRegistre(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistre();
    getAllPartners().then((data) => setAllPartners(data?.partners ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (nr_inreg) => {
    if (!window.confirm(`Ștergi registrul "${nr_inreg}"?`)) return;
    try {
      await api.delete(`/registru/${nr_inreg}`);
      toast.success('Registru șters cu succes');
      setRegistre((prev) => prev.filter((r) => r.nr_inreg !== nr_inreg));
      const newTotal = registre.length - 1;
      const maxPage = Math.max(1, Math.ceil(newTotal / PAGE_SIZE));
      if (page > maxPage) setPage(maxPage);
    } catch (err) {
      toast.error(
        'Eroare la ștergere: ' + (err.response?.data?.error || err.message),
      );
    }
  };

  const handleEdit = (nr_inreg) => {
    setEditId(nr_inreg);
    setShowEdit(true);
  };

  const handleEditClose = () => {
    setShowEdit(false);
    setEditId(null);
    fetchRegistre();
  };

  const totalPages = Math.max(1, Math.ceil(registre.length / PAGE_SIZE));
  const paginated = registre.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col p-1 items-center w-full">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded w-full">
          {error}
        </div>
      )}
      {loading ? (
        <div>
          <h1>LOADING ...</h1>
        </div>
      ) : (
        <div className="w-full px-6">
          <Suspense fallback={null}>
            {showEdit && (
              <EditRegistruModal
                nr_inreg={editId}
                show={showEdit}
                handleClose={handleEditClose}
              />
            )}
          </Suspense>
          <div className="flex justify-between items-center mb-2 mt-3">
            <span className="font-bold">LISTĂ REGISTRE</span>
          </div>
          <div className="relative overflow-x-auto bg-white shadow-xs rounded-base border border-default">
            <table className="w-full text-sm text-left text-body">
              <thead className="bg-blue-600 text-white uppercase text-xs tracking-wide">
                <tr>
                  <th className="px-2 py-2 font-semibold">Nr. Înreg.</th>
                  <th className="px-2 py-2 font-semibold">Obiectul</th>
                  <th className="px-2 py-2 font-semibold">Cod SSI</th>
                  <th className="px-2 py-2 font-semibold">Cod Angajament</th>
                  <th className="px-2 py-2 font-semibold">Partener</th>
                  <th className="px-2 py-2 font-semibold">Status</th>
                  <th className="px-2 py-2 font-semibold">Observații</th>
                  <th className="px-2 py-2 font-semibold">Data creare</th>
                  <th className="px-2 py-2 font-semibold">Creator</th>
                  <th className="px-2 py-2 font-semibold">Acțiune</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length > 0 ? (
                  paginated.map((r) => (
                    <tr
                      key={r.nr_inreg}
                      className="border-b hover:bg-gray-50 even:bg-gray-50"
                    >
                      <td className="px-2 py-2 whitespace-nowrap font-medium text-gray-900">
                        {r.nr_inreg}
                      </td>
                      <td className="px-2 py-2 text-gray-700">{r.obiectul}</td>
                      <td className="px-2 py-2 whitespace-nowrap text-gray-700">
                        {r.cod_ssi || '-'}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-gray-700">
                        {r.cod_angajament || '-'}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-gray-700">
                        {allPartners.find(
                          (p) => Number(p.id) === Number(r.partener_id),
                        )?.denumire ?? r.partener_id}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-700'}`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-gray-700">
                        {r.observatii || '-'}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-gray-700">
                        {r.createdAt
                          ? new Date(r.createdAt).toLocaleDateString('ro-RO')
                          : '-'}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-gray-700">
                        {r.creator?.full_name ?? '-'}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <button
                          className="inline-flex bg-blue-600 px-2 text-white hover:cursor-pointer font-bold mr-1"
                          onClick={() => handleEdit(r.nr_inreg)}
                        >
                          Edit
                        </button>{' '}
                        <button
                          className="inline-flex bg-red-600 px-2 text-white hover:cursor-pointer font-bold"
                          onClick={() => handleDelete(r.nr_inreg)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-4 text-center text-gray-500"
                    >
                      Nu există registre înregistrate.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-3">
            <span className="text-sm text-gray-600">
              Total: {registre.length} registre — Pagina {page} din {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded disabled:opacity-40"
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1}
              >
                &laquo; Anterior
              </button>
              <button
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded disabled:opacity-40"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages}
              >
                Următor &raquo;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
