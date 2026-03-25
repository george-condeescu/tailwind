import React, { useState, lazy } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  GitBranch,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../hooks/useAuth';
import { formatDateTime } from '../utils/functions';

const ITEMS_PER_PAGE = 10;

const statusColors = {
  DRAFT: 'bg-yellow-100 text-yellow-800',
  ACTIVE: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
  CANCELED: 'bg-red-100 text-red-800',
};

export default function ListaRegistre() {
  const EditRegistruModal = lazy(() => import('./editRegistru'));
  const DetaliiRegistruModal = lazy(() => import('./detaliiRegistru'));

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [showEdit, setShowEdit] = useState(false);
  const [showDetalii, setShowDetalii] = useState(false);
  const [selectedNrInreg, setSelectedNrInreg] = useState(null);

  const {
    data: allRegistre = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['registre', user?.id],
    queryFn: async () => {
      const res = await api.get('/registru');
      return res.data.filter((r) => r.user_id === user.id);
    },
    enabled: !!user?.id,
  });

  const totalPages = Math.ceil(allRegistre.length / ITEMS_PER_PAGE);
  const registre = allRegistre.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const handleEdit = (e, nrInreg) => {
    e.stopPropagation();
    setSelectedNrInreg(nrInreg);
    setShowEdit(true);
  };

  const handleDelete = async (e, nrInreg) => {
    e.stopPropagation();
    if (!window.confirm(`Ștergi registrul "${nrInreg}"?`)) return;
    try {
      await api.delete(`/registru/${nrInreg}`);
      toast.success('Registru șters cu succes');
      queryClient.invalidateQueries({ queryKey: ['registre', user?.id] });
      if (page > 1 && registre.length === 1) setPage(page - 1);
    } catch (err) {
      toast.error(
        'Eroare la ștergere: ' + (err.response?.data?.error || err.message),
      );
    }
  };

  const handleAdaugaRevizie = (e, nrInreg) => {
    e.stopPropagation();
    navigate(`/revizie-document?nr_inreg=${encodeURIComponent(nrInreg)}`);
  };

  const handleRowClick = (nrInreg) => {
    setSelectedNrInreg(nrInreg);
    setShowDetalii(true);
  };

  const handleEditClose = () => {
    setShowEdit(false);
    setSelectedNrInreg(null);
    queryClient.invalidateQueries({ queryKey: ['registre', user?.id] });
  };

  const handleDetaliiClose = () => {
    setShowDetalii(false);
    setSelectedNrInreg(null);
  };

  if (isLoading)
    return (
      <div className="flex flex-col p-4 items-center w-full">
        <h1>Se încarcă...</h1>
      </div>
    );

  if (error)
    return <div className="p-4 text-red-500">Eroare: {error.message}</div>;

  return (
    <div className="flex flex-col p-1 items-center w-full">
      <div className="w-full px-6">
        <div className="flex justify-between items-center mb-2 mt-3">
          <span className="font-bold">LISTA REGISTRELOR MELE</span>
          <span className="text-sm text-gray-500">
            {allRegistre.length} înregistrări
          </span>
        </div>

        <React.Suspense fallback={<div>Se încarcă...</div>}>
          {showEdit && (
            <EditRegistruModal
              nrInreg={selectedNrInreg}
              show={showEdit}
              handleClose={handleEditClose}
            />
          )}
          {showDetalii && (
            <DetaliiRegistruModal
              nrInreg={selectedNrInreg}
              show={showDetalii}
              handleClose={handleDetaliiClose}
            />
          )}
        </React.Suspense>

        <div className="relative overflow-x-auto bg-white shadow-xs rounded-base border border-default">
          <table className="w-full text-sm text-left text-body">
            <thead className="bg-blue-600 text-white uppercase text-xs tracking-wide">
              <tr>
                <th className="px-2 py-2 font-semibold">Nr. Înreg.</th>
                <th className="px-2 py-2 font-semibold">Obiectul</th>
                <th className="px-2 py-2 font-semibold">Cod SSI</th>
                <th className="px-2 py-2 font-semibold">Cod Angajament</th>
                <th className="px-2 py-2 font-semibold">Status</th>
                <th className="px-2 py-2 font-semibold">Data creare</th>
                <th className="px-2 py-2 font-semibold">Acțiune</th>
              </tr>
            </thead>
            <tbody>
              {registre.length > 0 ? (
                registre.map((r) => (
                  <tr
                    key={r.nr_inreg}
                    className="border-b hover:bg-blue-50 even:bg-gray-50 cursor-pointer"
                    onClick={() => handleRowClick(r.nr_inreg)}
                  >
                    <td className="px-2 py-2 whitespace-nowrap font-medium text-gray-900">
                      {r.nr_inreg}
                    </td>
                    <td className="px-2 py-2 text-gray-700 max-w-xs truncate">
                      {r.obiectul}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-gray-700">
                      {r.cod_ssi || '-'}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-gray-700">
                      {r.cod_angajament || '-'}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[r.status] || 'bg-gray-100 text-gray-800'}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-gray-700">
                      {formatDateTime(r.createdAt)}
                    </td>
                    <td
                      className="px-2 py-2 whitespace-nowrap w-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="inline-flex items-center bg-blue-600 px-2 py-0.5 text-white hover:cursor-pointer font-bold mr-1 rounded"
                        onClick={(e) => handleEdit(e, r.nr_inreg)}
                        title="Editează"
                      >
                        <Edit size={13} className="mr-1" /> Edit
                      </button>{' '}
                      <button
                        className="inline-flex items-center bg-red-600 px-2 py-0.5 text-white hover:cursor-pointer font-bold rounded mr-1"
                        onClick={(e) => handleDelete(e, r.nr_inreg)}
                        title="Șterge"
                      >
                        <Trash2 size={13} className="mr-1" /> Del
                      </button>{' '}
                      <button
                        className="inline-flex items-center bg-green-600 px-2 py-0.5 text-white hover:cursor-pointer font-bold rounded"
                        onClick={(e) => handleAdaugaRevizie(e, r.nr_inreg)}
                        title="Adaugă Revizie"
                      >
                        <GitBranch size={13} className="mr-1" /> Revizie
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    Nu există registre create de tine.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm text-gray-600">
              Pagina {page} din {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-2 py-1 rounded border text-sm disabled:opacity-40 hover:bg-gray-100"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded border text-sm ${p === page ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-100'}`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-2 py-1 rounded border text-sm disabled:opacity-40 hover:bg-gray-100"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
