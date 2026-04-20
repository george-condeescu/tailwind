import React, { useState } from 'react';
import api from '../api/axiosInstance';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';

const editableFieldsByRole = {
  operator: ['observatii', 'partener_id', 'obiectul'],
  contabil: ['cod_ssi', 'cod_angajament'],
  manager: [
    'observatii',
    'partener_id',
    'obiectul',
    'cod_ssi',
    'cod_angajament',
  ],
};

function canEditField(field, role) {
  const editableFields = editableFieldsByRole[role] || [];
  return editableFields.includes(field);
}

export default function InformatiiDocument({ documentData }) {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();

  const isRecipient =
    documentData?.current_user_id !== documentData?.created_by_user_id &&
    userId === documentData?.current_user_id;

  const [editing, setEditing] = useState(false);
  const [codSsi, setCodSsi] = useState('');
  const [codAngajament, setCodAngajament] = useState('');
  const [saving, setSaving] = useState(false);

  const queryLastSender = useQuery({
    queryKey: ['lastSender', documentData?.id, userId],
    queryFn: async () => {
      const response = await api.get(
        `/circulatie/last-sender/${documentData?.id}/${userId}`,
      );
      const { data } = response;
      if (!data || Object.keys(data).length === 0) return null;
      return data;
    },
    enabled: !!documentData?.id && !!userId,
  });

  const {
    data: lastSenderData,
    isLoading: isLoadingLastSender,
    error: errorLastSender,
  } = queryLastSender;

  const handleEditStart = () => {
    setCodSsi(documentData?.registru?.cod_ssi || '');
    setCodAngajament(documentData?.registru?.cod_angajament || '');
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/registru/${documentData?.registru?.nr_inreg}`, {
        cod_ssi: codSsi,
        cod_angajament: codAngajament,
      });
      toast.success('Salvat cu succes');
      queryClient.invalidateQueries({
        queryKey: ['document', String(documentData?.id)],
      });
      setEditing(false);
    } catch (err) {
      toast.error(
        'Eroare la salvare: ' + (err.response?.data?.error || err.message),
      );
    } finally {
      setSaving(false);
    }
  };

  if (isLoadingLastSender) {
    return <div>Loading...</div>;
  }

  if (errorLastSender) {
    return <div>Error loading document: {errorLastSender?.message}</div>;
  }

  return (
    <div className="p-4">
      <h3 className="text-2xl font-bold mb-4">Informatii Document</h3>
      {documentData ? (
        <div className="bg-white p-4 rounded shadow">
          <p className="mb-2 border-b border-gray-200 pb-2">
            <strong>Numar Inregistrare:</strong> {documentData?.nr_inreg}
          </p>
          <p className="mb-2 border-b border-gray-200 pb-2">
            <strong>Numar revizie:</strong> {documentData?.nr_revizie ?? 'N/A'}
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

          {isRecipient && editing ? (
            <>
              <div className="mb-2 border-b border-gray-200 pb-2">
                <strong>Cod SSI:</strong>
                <input
                  type="text"
                  value={codSsi}
                  onChange={(e) => setCodSsi(e.target.value)}
                  className="ml-2 border rounded px-2 py-0.5 text-sm w-48"
                  disabled={!canEditField('cod_ssi', user.role)}
                />
              </div>
              <div className="mb-2 border-b border-gray-200 pb-2">
                <strong>Cod Angajament:</strong>
                <input
                  type="text"
                  value={codAngajament}
                  onChange={(e) => setCodAngajament(e.target.value)}
                  className="ml-2 border rounded px-2 py-0.5 text-sm w-48"
                  disabled={!canEditField('cod_angajament', user.role)}
                />
              </div>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Se salvează...' : 'Salvează'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
                >
                  Anulează
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="mb-2 border-b border-gray-200 pb-2">
                <strong>Cod SSI:</strong>{' '}
                {documentData?.registru?.cod_ssi ||
                  (isRecipient ? (
                    <span className="text-gray-400 italic">necompletat</span>
                  ) : (
                    '—'
                  ))}
              </p>
              <p className="mb-2 border-b border-gray-200 pb-2">
                <strong>Cod Angajament:</strong>{' '}
                {documentData?.registru?.cod_angajament ||
                  (isRecipient ? (
                    <span className="text-gray-400 italic">necompletat</span>
                  ) : (
                    '—'
                  ))}
              </p>
              {isRecipient && (
                <button
                  onClick={handleEditStart}
                  className="mb-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                  disabled={
                    !canEditField('cod_ssi', user.role) &&
                    !canEditField('cod_angajament', user.role)
                  }
                >
                  Completează Cod SSI / Cod Angajament
                </button>
              )}
            </>
          )}

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
