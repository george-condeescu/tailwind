import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Trash2, Archive, Star } from 'lucide-react';
import Document from './document';
import SearchDocument from './searchDocument';
import api from '../api/axiosInstance';

import { useQuery } from '@tanstack/react-query';

const emptyFilters = {
  nrInreg: '',
  data_start: '',
  data_end: '',
  partener: '',
  from: '',
  status: '',
};

export default function Inbox() {
  const { user } = useAuth();
  const [activeFilters, setActiveFilters] = useState(emptyFilters);

  const queryDocuments = useQuery({
    queryKey: ['documents', user.id],
    queryFn: async () => {
      const response = await api.get(`/documents/user/${user.id}/inbox`);
      return response.data;
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      const hasUnread = Array.isArray(data) && data.some((doc) => !doc.citit);
      return hasUnread ? 30000 : false;
    },
  });

  const {
    data: documents,
    isLoading: loadingDocuments,
    error: errorDocuments,
  } = queryDocuments;

  const filteredData = documents
    ? documents.filter((doc) => {
        const { nrInreg, data_start, data_end, partener, from, status } =
          activeFilters;

        if (
          nrInreg &&
          !String(doc.nr_inreg ?? '')
            .toLowerCase()
            .includes(nrInreg.toLowerCase())
        )
          return false;

        if (
          partener &&
          !String(doc.partener ?? '')
            .toLowerCase()
            .includes(partener.toLowerCase())
        )
          return false;

        if (
          from &&
          !String(doc.from_user ?? '')
            .toLowerCase()
            .includes(from.toLowerCase())
        )
          return false;

        if (
          status &&
          !String(doc.action ?? '')
            .toLowerCase()
            .includes(status.toLowerCase())
        )
          return false;

        if (data_start && doc.data_intrare) {
          if (new Date(doc.data_intrare) < new Date(data_start)) return false;
        }

        if (data_end && doc.data_intrare) {
          if (new Date(doc.data_intrare) > new Date(data_end)) return false;
        }

        return true;
      })
    : [];

  return (
    <>
      {loadingDocuments ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : errorDocuments ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500">
            Error loading documents: {errorDocuments.message}
          </p>
        </div>
      ) : (
        <div className="flex flex-col w-full h-screen bg-gray-50">
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="border-b border-gray-200 p-2 bg-sky-700">
              <h5 className="text-xl font-bold text-white">Inbox</h5>
            </div>
            <SearchDocument
              onSearch={setActiveFilters}
              onReset={() => setActiveFilters(emptyFilters)}
            />
            {/* Document List */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-sky-700 text-white">
                    <th className="p-2 border-b">Select</th>
                    <th className="p-2 border-b">Nr. înreg.</th>
                    <th className="p-2 border-b">Partener</th>
                    <th className="p-2 border-b">Data primire</th>
                    <th className="p-2 border-b">Provenientă</th>
                    <th className="p-2 border-b">Note</th>
                    <th className="p-2 border-b">Stare</th>
                    <th className="p-2 border-b">Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((document) => (
                    <Document key={document.id} document={document} />
                  ))}
                </tbody>
              </table>
              {filteredData.length === 0 && (
                <p className="text-center text-gray-400 py-6">
                  Niciun document găsit.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
