import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import { useAuth } from '../hooks/useAuth';
import { Trash, PenLine, X } from 'lucide-react';

export default function Comentarii() {
  const id = useParams().id;

  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [editComentariu, setEditComentariu] = useState(null); // { id, text }

  const { data: documentData } = useQuery({
    queryKey: ['document', id],
    queryFn: async () => {
      const response = await api.get(`/documents/${id}`);
      return response.data;
    },
  });

  //Query pentru a prelua comentariile asociate documentului
  const query = useQuery({
    queryKey: ['comentarii', id],
    queryFn: async () => {
      const response = await api.get(`/comentarii/document/${id}`);
      return response.data;
    },
  });

  const queryKey = ['comentarii', id];

  // Mutation pentru a sterge un comentariu
  const deleteMutation = useMutation({
    mutationFn: async (comentariuId) => {
      await api.delete(`/comentarii/${comentariuId}`);
    },
    onSuccess: (_, comentariuId) => {
      queryClient.setQueryData(queryKey, (old) =>
        old ? old.filter((c) => c.id !== comentariuId) : []
      );
    },
  });

  // Mutation pentru a edita un comentariu
  const editMutation = useMutation({
    mutationFn: async ({ comentariuId, text }) => {
      const response = await api.put(`/comentarii/${comentariuId}`, { text });
      return response.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, (old) =>
        old ? old.map((c) => (c.id === updated.id ? updated : c)) : []
      );
      queryClient.invalidateQueries({ queryKey });
      setEditComentariu(null);
    },
  });

  // Mutation pentru a adauga un comentariu nou
  const mutation = useMutation({
    mutationFn: async (newComentariu) => {
      const response = await api.post('/comentarii', newComentariu);
      return response.data;
    },
    onSuccess: (created) => {
      queryClient.setQueryData(queryKey, (old) => (old ? [...old, created] : [created]));
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const { data, isLoading, error } = query;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading comentarii</div>;
  }

  const comentariiData = data || [];

  return (
    <div className="p-4">
      <h5 className="text-2xl font-bold mb-2 text-blue-500">
        Comentarii pentru <span className="text-blue-700 font-bold">{documentData?.nr_inreg}/{documentData?.nr_revizie}</span>
      </h5>
      <hr className="mb-2" />
      {comentariiData
        .filter((comentariu) => comentariu.document_id === parseInt(id))
        .map((comentariu) => (
          <div key={comentariu.id} className="bg-white mb-4 p-2 border rounded">
            <p className="text-gray-700 mb-2">{comentariu.text}</p>
            <p className="text-sm text-gray-500">
              Adăugat de {comentariu.persoana} la{' '}
              {new Date(comentariu.data_modif).toLocaleString()}
            </p>
            {comentariu.persoana === user?.full_name && (
              <p>
                <button
                  className="bg-blue-700 text-white px-2 py-1 rounded"
                  onClick={() => setEditComentariu({ id: comentariu.id, text: comentariu.text })}
                >
                  <PenLine size={12} />
                </button>{' '}
                <button
                  className={`bg-red-700 text-white px-2 py-1 rounded`}
                  onClick={() => {
                    console.log('Sterg comentariu cu id:', comentariu.id);
                    deleteMutation.mutate(comentariu.id);
                  }}
                >
                  <Trash size={12} />
                </button>
              </p>
            )}
          </div>
        ))}
      <h5 className="text-lg font-bold mb-2">Adauga un comentariu:</h5>
      <textarea
        id="comentariuText"
        className="w-full p-2 border rounded mb-2 bg-gray-100"
        rows="4"
        placeholder="Scrie un comentariu..."
      ></textarea>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={() => {
          const newComentariu = {
            document_id: id,
            text: document.getElementById('comentariuText').value,
            persoana: user?.full_name || 'User', // Replace with actual user data
            data_modif: new Date().toISOString(),
          };
          mutation.mutate(newComentariu);
          document.getElementById('comentariuText').value = ''; // Clear textarea
        }}
      >
        Adauga Comentariu
      </button>

      {/* Modal editare comentariu */}
      {editComentariu && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h5 className="text-lg font-bold">Editare comentariu</h5>
              <button onClick={() => setEditComentariu(null)}>
                <X size={18} />
              </button>
            </div>
            <textarea
              className="w-full p-2 border rounded mb-4 bg-gray-100"
              rows="4"
              value={editComentariu.text}
              onChange={(e) => setEditComentariu({ ...editComentariu, text: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded border"
                onClick={() => setEditComentariu(null)}
              >
                Anulează
              </button>
              <button
                className="bg-blue-700 text-white px-4 py-2 rounded"
                onClick={() =>
                  editMutation.mutate({ comentariuId: editComentariu.id, text: editComentariu.text })
                }
              >
                Salvează
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}