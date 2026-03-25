import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { Trash, Pencil, BellDot, Eye, RefreshCwOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

export default function Document({ document }) {
  const [selected, setSelected] = useState(document.selected || false);
  const [citit, setCitit] = useState(document.citit);
  useEffect(() => {
    setCitit(document.citit);
  }, [document.citit]);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const markAsReadMutation = useMutation({
    mutationFn: async (circulatie_id) => {
      await api.put(`/circulatie/mark-citit/${circulatie_id}`, {
        user_id: user.id,
      });
    },
    onSuccess: () => {
      setCitit(new Date().toISOString());
      queryClient.invalidateQueries({ queryKey: ['documents', user.id] });
      queryClient.invalidateQueries({ queryKey: ['documentsCount', user.id] });
    },
  });

  const handleCloseDocument = async () => {
    console.log('Closing document with id:', document.id);
    confirm('Sunteți sigur că doriți să închideți acest document?') &&
      (await closeDocument());
  };

  const closeDocument = async () => {
    try {
      await api.put(`/circulatie/close/${document.id}`);
      queryClient.invalidateQueries({ queryKey: ['documents', user.id] });
      queryClient.invalidateQueries({ queryKey: ['documentsCount', user.id] });
      toast.success('Document închis cu succes');
    } catch (error) {
      console.error('Error closing document:', error);
      toast.error('Eroare la închiderea documentului');
    }
  };

  const handleSelectRow = () => {
    setSelected(!selected);
  };

  const marcheazaCitit = (circulatie_id) => {
    markAsReadMutation.mutate(circulatie_id);
  };

  return (
    <tr className={`w-full bg-sky-100 ${!citit ? 'font-bold' : ''}`}>
      <td className="p-2">
        <input
          type="checkbox"
          checked={selected}
          className="w-4 h-4 cursor-pointer"
          onChange={() => handleSelectRow(document.nr_inreg)}
        />
        <br />
      </td>
      <td className="p-2 border-r border-gray-300">
        <Link
          to={`/documents/${document.id}`}
          onClick={() => marcheazaCitit(document.circulatie_id)}
        >
          {document.nr_inreg}/rev.{document.nr_revizie}
        </Link>
      </td>
      <td className="p-2 border-r border-gray-300">{document.partener}</td>
      <td className="p-2 border-r border-gray-300">{document.data_intrare}</td>
      <td className="p-2 border-r border-gray-300">{document.from_user}</td>
      <td className="p-2 border-r border-gray-300">{document.note}</td>
      <td className="p-2 border-r border-gray-300">
        {citit ? (
          <span className="text-green-600 font-semibold">
            <Eye />
          </span>
        ) : (
          <span className="text-red-600 font-semibold">
            <BellDot />
          </span>
        )}
      </td>
      <td>
        <div className="flex items-center justify-center gap-2">
          <button
            className="bg-red-500 text-white px-3 py-1"
            onClick={handleCloseDocument}
          >
            <RefreshCwOff size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}
