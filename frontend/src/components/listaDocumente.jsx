import { useState } from 'react';
import { ChevronDown, Pencil, Trash2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axiosInstance';
import { formatDateTime } from '../utils/functions';
import EditDocumentModal from './EditDocumentModal';

const PAGE_SIZE = 10;

export default function ListaDocumente() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [editDocId, setEditDocId] = useState(null);

  const {
    data: rawDocumentsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['documents', user.id],
    queryFn: async () => {
      const response = await api.get(`/documents/user/${user.id}/all`);
      return response.data;
    },
    enabled: !!user?.id,
  });

  const documentsData = Array.isArray(rawDocumentsData) ? rawDocumentsData : [];

  const totalPages = Math.ceil(documentsData.length / PAGE_SIZE);
  const paginated = documentsData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const handleDelete = async (doc) => {
    if (!window.confirm(`Ștergi documentul ${doc.nr_inreg}/${doc.nr_revizie}?`))
      return;
    try {
      await api.delete(`/documents/${doc.id}`);
      toast.success('Document șters cu succes');
      queryClient.invalidateQueries({ queryKey: ['documents', user.id] });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Eroare la ștergere');
    }
  };

  if (isLoading) return <div>Loading documents...</div>;
  if (error) return <div>Error loading documents: {error.message}</div>;

  return (
    <div className="w-full overflow-x-auto bg-white p-5 rounded-lg shadow">
      <h5 className="m-10 text-amber-900! font-bold text-2xl">
        Lista documente pentru {user.full_name}
      </h5>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-amber-300 border-b-2 border-gray-300">
            <th className="p-2 border-r border-gray-300 text-left min-w-[140px]">
              <button className="flex items-center gap-1 text-black hover:text-red-800 font-bold text-md">
                Nr. inreg./Revizie <ChevronDown className="w-4 h-4" />
              </button>
            </th>
            <th className="p-2 border-r border-gray-300 text-left min-w-30">
              <button className="flex items-center gap-1 text-black hover:text-red-800 font-bold text-md">
                Data <ChevronDown className="w-4 h-4" />
              </button>
            </th>
            <th className="p-2 border-r border-gray-300 text-left min-w-30">
              <span className="text-black text-md font-bold">Partener</span>
            </th>
            <th className="p-2 border-r border-gray-300 text-left min-w-50">
              <button className="flex items-center gap-1 text-black hover:text-red-800 font-bold text-md">
                Obiect
              </button>
            </th>
            <th className="p-2 border-r border-gray-300 text-left min-w-50">
              <span className="text-black text-md font-bold">Proveniență</span>
            </th>
            <th className="p-2 border-r border-gray-300 text-left min-w-30">
              <span className="text-black text-md font-bold">
                Utilizator curent
              </span>
            </th>
            <th className="p-2 border-r border-gray-300 text-left min-w-30">
              <span className="text-black text-md font-bold">Observații</span>
            </th>
            <th className="p-2 border-r border-gray-300 text-left min-w-25">
              <span className="text-black text-md font-bold">Stare</span>
            </th>
            <th className="p-2 text-left min-w-22.5">
              <span className="text-black text-md font-bold">Acțiuni</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((doc) => {
            const isOwner = doc.created_by_user_id === user.id;
            const isTrimis = doc.current_user_id !== user.id;
            return (
              <tr
                key={doc.id}
                className="border-b border-amber-200 hover:bg-amber-50"
              >
                <td className="p-2 min-w-30">
                  {doc.nr_inreg}/{doc.nr_revizie}
                </td>
                <td className="p-2 min-w-30">
                  {formatDateTime(doc.data_creare)}
                </td>
                <td className="p-2 min-w-30">{doc.partener}</td>
                <td className="p-2 min-w-30">{doc.obiectul}</td>
                <td className="p-2 min-w-30">{doc.provenienta}</td>
                <td className="p-2 min-w-30">{doc.utilizator_curent}</td>
                <td className="p-2 min-w-30">{doc.note}</td>
                <td className="p-2 min-w-25">
                  {doc.citit ? (
                    <span className="text-green-600 font-semibold">Citit</span>
                  ) : (
                    <span className="text-red-600 font-semibold">Necitit</span>
                  )}
                </td>
                <td className="p-2 min-w-22.5">
                  {isOwner && !isTrimis && (
                    <div className="flex items-center gap-2">
                      <button
                        title="Editează"
                        onClick={() => setEditDocId(doc.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        title="Șterge"
                        onClick={() => handleDelete(doc)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <span className="text-sm text-gray-600">
            Pagina {page} din {totalPages} ({documentsData.length} documente)
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-amber-100"
            >
              &lsaquo; Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 text-sm border rounded ${
                  p === page
                    ? 'bg-amber-400 font-semibold'
                    : 'hover:bg-amber-100'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-amber-100"
            >
              Next &rsaquo;
            </button>
          </div>
        </div>
      )}

      <EditDocumentModal
        docId={editDocId}
        show={!!editDocId}
        handleClose={() => setEditDocId(null)}
        onSaved={() =>
          queryClient.invalidateQueries({ queryKey: ['documents', user.id] })
        }
      />
    </div>
  );
}
