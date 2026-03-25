import React, { useEffect, useState, lazy } from 'react';
import { Button } from 'react-bootstrap';
import { PlusSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../api/axiosInstance.js';
import { usePartner } from '../../../hooks/usePartner.js';

export default function ListPartner() {
  const AddPartnerModal = lazy(() => import('./addPartner'));
  const EditPartnerModal = lazy(() => import('./editPartner'));

  const { partners, loading, error, getPartners, pagination } = usePartner();

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    getPartners(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleEdit = (id) => {
    setEditId(id);
    setShowEdit(true);
  };

  const handleDelete = async (id, denumire) => {
    if (!window.confirm(`Ștergi partenerul "${denumire}"?`)) return;
    try {
      await api.delete(`/partners/${id}`);
      toast.success('Partener șters cu succes');
      getPartners(page);
    } catch (err) {
      toast.error(
        'Eroare la ștergere: ' + (err.response?.data?.message || err.message),
      );
    }
  };

  const handleAdded = () => {
    setShowAdd(false);
    setPage(1);
  };

  const handleEditClose = () => {
    setShowEdit(false);
    setEditId(null);
    getPartners(page);
  };

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
          <div className="flex justify-between items-center mb-2 mt-3">
            <span className="font-bold">LISTĂ PARTENERI</span>
            <Button variant="primary" onClick={() => setShowAdd(true)}>
              <PlusSquare className="mr-1" size={16} />
            </Button>
          </div>
          <React.Suspense fallback={<div>Se încarcă...</div>}>
            {showAdd && (
              <AddPartnerModal show={showAdd} handleClose={handleAdded} />
            )}
            {showEdit && (
              <EditPartnerModal
                id={editId}
                show={showEdit}
                handleClose={handleEditClose}
              />
            )}
          </React.Suspense>
          <div className="relative overflow-x-auto bg-white shadow-xs rounded-base border border-default">
            <table className="w-full text-sm text-left text-body">
              <thead className="bg-blue-600 text-white uppercase text-xs tracking-wide">
                <tr>
                  <th className="px-2 py-2 font-semibold">ID</th>
                  <th className="px-2 py-2 font-semibold">Denumire</th>
                  <th className="px-2 py-2 font-semibold">CUI</th>
                  <th className="px-2 py-2 font-semibold">Reg. Com.</th>
                  <th className="px-2 py-2 font-semibold">Localitate</th>
                  <th className="px-2 py-2 font-semibold">Județ</th>
                  <th className="px-2 py-2 font-semibold">Telefon</th>
                  <th className="px-2 py-2 font-semibold">Email</th>
                  <th className="px-2 py-2 font-semibold">Contact</th>
                  <th className="px-2 py-2 font-semibold">Acțiune</th>
                </tr>
              </thead>
              <tbody>
                {partners && partners.length > 0 ? (
                  partners.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b hover:bg-gray-50 even:bg-gray-50"
                    >
                      <td className="px-2 py-2 whitespace-nowrap text-gray-700">
                        {p.id}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap font-medium text-gray-900">
                        {p.denumire}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-gray-700">
                        {p.cui || '-'}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-gray-700">
                        {p.reg_com || '-'}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-gray-700">
                        {p.localitate || '-'}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-gray-700">
                        {p.judet || '-'}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-gray-700">
                        {p.telefon || '-'}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-gray-700">
                        {p.email || '-'}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-gray-700">
                        {p.contact || '-'}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <button
                          className="inline-flex bg-blue-600 px-2 text-white hover:cursor-pointer font-bold mr-1"
                          onClick={() => handleEdit(p.id)}
                        >
                          Edit
                        </button>{' '}
                        <button
                          className="inline-flex bg-red-600 px-2 text-white hover:cursor-pointer font-bold"
                          onClick={() => handleDelete(p.id, p.denumire)}
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
                      Nu există parteneri înregistrați.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-3">
            <span className="text-sm text-gray-600">
              Total: {pagination.total} parteneri — Pagina {pagination.currentPage} din {pagination.totalPages}
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
                disabled={page >= pagination.totalPages}
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
