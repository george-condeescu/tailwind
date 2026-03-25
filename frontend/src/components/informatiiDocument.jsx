import React from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useQuery } from '@tanstack/react-query';

export default function InformatiiDocument({ documentData }) {
  const id = useParams().id;

  // query to fetch last sender
  const queryLastSender = useQuery({
    queryKey: ['lastSender', documentData?.id, id],
    queryFn: async () => {
      const response = await api.get(
        `/circulatie/last-sender/${documentData?.id}/${id}`,
      );
      return response.data;
    },
    enabled: !!documentData?.id && !!id,
  });

  const {
    data: lastSenderData,
    isLoading: isLoadingLastSender,
    error: errorLastSender,
  } = queryLastSender;

  if (isLoadingLastSender) {
    return <div>Loading...</div>;
  }

  if (errorLastSender) {
    return <div>Error loading document: {errorLastSender?.message}</div>;
  }

  return (
    <div className="p-4">
      <h3 className="text-2xl font-bold mb-4">Informatii Document</h3>{' '}
      {documentData ? (
        <div className="bg-white p-4 rounded shadow">
          <p className="mb-2 border-b border-gray-200 pb-2">
            <strong>Numar Inregistrare:</strong> {documentData?.nr_inreg}
          </p>
          <p className="mb-2 border-b border-gray-200 pb-2">
            <strong>Numar revizie:</strong> {documentData?.nr_revizie || 'N/A'}
          </p>
          <p className="mb-2 border-b border-gray-200 pb-2">
            <strong>Data:</strong> {documentData?.registru?.createdAt}
          </p>
          <p className="mb-2 border-b border-gray-200 pb-2">
            <strong>Partener:</strong>{' '}
            {documentData?.registru?.partner?.denumire || 'N/A'}
          </p>
          <p className="mb-2 border-b border-gray-200 pb-2">
            <strong>Obiectul:</strong> {documentData?.registru?.obiectul}
          </p>

          <p className="mb-2 border-b border-gray-200 pb-2">
            <strong>Cod SSI:</strong> {documentData?.registru?.cod_ssi}
          </p>
          <p className="mb-2 border-b border-gray-200 pb-2">
            <strong>Cod Angajament:</strong>{' '}
            {documentData?.registru?.cod_angajament}
          </p>
          <p className="mb-2 border-b border-gray-200 pb-2">
            <strong>Status:</strong> {documentData?.registru?.status}
          </p>
          <p className="mb-2 border-b border-gray-200 pb-2">
            <strong>From:</strong> {lastSenderData?.full_name || 'N/A'}
          </p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
