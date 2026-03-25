import { Button, Modal } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import api from '../api/axiosInstance';
import { formatDateTime } from '../utils/functions';

const statusColors = {
  DRAFT: 'bg-yellow-100 text-yellow-800',
  ACTIVE: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
  CANCELED: 'bg-red-100 text-red-800',
};

export default function DetaliiRegistruModal({ nrInreg, show, handleClose }) {
  const { data: registru, isLoading: loadingReg } = useQuery({
    queryKey: ['registru', nrInreg],
    queryFn: async () => {
      const res = await api.get(`/registru/${nrInreg}`);
      return res.data;
    },
    enabled: !!nrInreg,
  });

  const { data: revizii = [], isLoading: loadingRevizii } = useQuery({
    queryKey: ['revizii', nrInreg],
    queryFn: async () => {
      const res = await api.get(`/documents/nr-inreg/${nrInreg}`);
      return res.data;
    },
    enabled: !!nrInreg,
  });

  return (
    <Modal show={show} onHide={handleClose} size="lg" backdrop="static">
      <Modal.Header
        closeButton
        style={{ backgroundColor: 'rgb(4,84,135)', color: 'white' }}
      >
        <Modal.Title>Detalii Registru — {nrInreg}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loadingReg ? (
          <p>Se încarcă...</p>
        ) : registru ? (
          <div className="bg-gray-50 border rounded p-4 mb-4 text-sm">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <p>
                <strong>Nr. Înregistrare:</strong> {registru.nr_inreg}
              </p>
              <p className="flex items-center gap-1">
                <strong>Status:</strong>
                <span
                  className={`ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[registru.status] || 'bg-gray-100 text-gray-800'}`}
                >
                  {registru.status}
                </span>
              </p>
              <p>
                <strong>Partener:</strong>{' '}
                {registru.partner?.denumire || '-'}
              </p>
              <p>
                <strong>Data creare:</strong>{' '}
                {formatDateTime(registru.createdAt)}
              </p>
              <p className="col-span-2">
                <strong>Obiectul:</strong> {registru.obiectul}
              </p>
              <p>
                <strong>Cod SSI:</strong> {registru.cod_ssi}
              </p>
              <p>
                <strong>Cod Angajament:</strong> {registru.cod_angajament}
              </p>
              {registru.observatii && (
                <p className="col-span-2">
                  <strong>Observații:</strong> {registru.observatii}
                </p>
              )}
            </div>
          </div>
        ) : null}

        <h6 className="font-bold text-blue-800 mb-3">Revizii</h6>
        <hr className="mb-3" />

        {loadingRevizii ? (
          <p className="text-sm text-gray-500">Se încarcă reviziile...</p>
        ) : revizii.length === 0 ? (
          <p className="text-sm text-gray-500">
            Nu există revizii pentru acest registru.
          </p>
        ) : (
          revizii.map((rev) => (
            <div
              key={rev.id}
              className="bg-white border rounded p-3 mb-2 shadow-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-blue-700">
                  Revizia #{rev.nr_revizie}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDateTime(rev.createdAt)}
                  {rev.creator?.full_name ? ` — ${rev.creator.full_name}` : ''}
                </span>
              </div>
              {rev.note && (
                <p className="text-sm text-gray-700">
                  <strong>Notă:</strong> {rev.note}
                </p>
              )}
              {rev.fisiere?.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Fișiere atașate:
                  </p>
                  {rev.fisiere.map((f) => (
                    <a
                      key={f.id}
                      href={`/pdfuri/${f.file_name}`}
                      download={f.original_name}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:underline mb-1"
                    >
                      <Download size={14} /> {f.original_name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Închide
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
