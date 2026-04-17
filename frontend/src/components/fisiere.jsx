import { useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import { useAuth } from '../hooks/useAuth';

import { FileLock, RefreshCw, Trash2 } from 'lucide-react';

export default function Fisiere() {
  const { id } = useParams();
  const { user } = useAuth();

  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  // Queries
  const query = useQuery({
    queryKey: ['fisiere', id],
    queryFn: async () => {
      const response = await api.get(`/fisiere/${id}`);
      return response.data;
    },
  });
  const { data: files, isLoading, error } = query;

  const { data: documentData } = useQuery({
    queryKey: ['document', id],
    queryFn: async () => {
      const response = await api.get(`/documents/${id}`);
      return response.data;
    },
  });

  // users
  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/auth/users');
      return response.data;
    },
  });

  const {
    data: usersData,
    isLoading: isUsersLoading,
    error: usersError,
  } = usersQuery;

  const handleDownload = async (fileId, originalName) => {
    try {
      const response = await api.get(`/fisiere/download/${fileId}`, {
        responseType: 'blob',
        headers: { Accept: '*/*' },
      });

      const contentType = response.headers['content-type'] || '';
      if (contentType.includes('text/html') || contentType.includes('application/json')) {
        console.error('Server returned error instead of file, content-type:', contentType);
        alert('Eroare la descărcarea fișierului.');
        return;
      }

      const blob = new Blob([response.data], { type: contentType || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = originalName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(url), 150);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Eroare la descărcarea fișierului.');
    }
  };

  const handleDelete = async (fileId) => {
    if (!confirm('Ștergi fișierul?')) return;
    try {
      await api.delete(`/fisiere/${fileId}`);
      queryClient.invalidateQueries({ queryKey: ['fisiere', id] });
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Eroare la ștergerea fișierului.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const file = fileInputRef.current?.files[0];
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('document_id', id);
    formData.append('uploaded_by_user_id', user.id);
    formData.append('file', file);

    try {
      await api.post('/fisiere/upload', formData);
      fileInputRef.current.value = '';
      await queryClient.invalidateQueries({ queryKey: ['fisiere', id] });
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    }
  };

  if (isLoading || isUsersLoading) {
    return <div>Loading...</div>;
  }

  if (error || usersError) {
    return <div>{error?.message || usersError?.message}</div>;
  }
  return (
    <div className="p-4">
      <h5 className="text-2xl font-bold mb-2 text-blue-800!">
        Fisiere atașate documentului {documentData?.nr_inreg}/{documentData?.nr_revizie}
      </h5>
      <hr className="mb-2" />
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="application/pdf"
          ref={fileInputRef}
          name="file"
          className="
          block w-full text-sm text-slate-500 mb-2
          file:mr-4 file:py-2 file:px-2
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-sky-300 file:text-sky-900
          hover:file:bg-sky-400
        "
        />
        <button
          type="submit"
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded mb-2"
        >
          <RefreshCw size={16} />
          Incarcare fisier
        </button>
      </form>

      <hr className="mb-2" />
      {/* <div className="flex flex-col bg-white p-2 border rounded mb-1"> */}
      {files.length > 0 &&
        files.map((file) => (
          <div
            key={file.id}
            className="flex flex-row bg-white p-2 border rounded mb-1"
          >
            <div className="w-[80%]">
              <p className="text-gray-700">
                Nume fisier:{' '}
                <button
                  className="text-blue-600 underline hover:text-blue-800"
                  onClick={() => handleDownload(file.id, file.original_name)}
                >
                  {file.original_name}
                </button>
              </p>
              <p className="text-sm text-gray-500">
                Incarcat de{' '}
                {usersData.users.find(
                  (user) => user.id === file.uploaded_by_user_id,
                )?.full_name || 'Unknown'}{' '}
                la {file.createdAt}
              </p>
            </div>
            <div className="w-[20%] flex  flex-row items-center justify-end gap-2">
              {user.id === file.uploaded_by_user_id && (
                <>
                  <button
                    className=" mt-2 bg-red-700 text-white px-3 py-1 rounded"
                    onClick={() => handleDelete(file.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    className=" mt-2 ml-2 bg-blue-700 text-white px-3 py-1 rounded"
                    onClick={() => console.log('lock')}
                  >
                    <FileLock size={18} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      {/* </div> */}
    </div>
  );
}
