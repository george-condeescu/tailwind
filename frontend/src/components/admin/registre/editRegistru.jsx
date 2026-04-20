import { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../../api/axiosInstance.js';
import { usePartner } from '../../../hooks/usePartner.js';

//context
import { useAuth } from '../../../hooks/useAuth.js';

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

const editRegistruSchema = z.object({
  obiectul: z.string().min(1, 'Obiectul este obligatoriu'),
  cod_ssi: z.string().min(1, 'Cod SSI este obligatoriu'),
  cod_angajament: z.string().min(1, 'Cod Angajament este obligatoriu'),
  partener_id: z.coerce.number().min(1, 'Partener ID este obligatoriu'),
  status: z.enum(['DRAFT', 'ACTIVE', 'CLOSED', 'CANCELED']),
  observatii: z.string().optional(),
});

export default function EditRegistruModal({ nr_inreg, show, handleClose }) {
  const { getAllPartners } = usePartner();
  const { user } = useAuth();
  const [allPartners, setAllPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [creatorName, setCreatorName] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editRegistruSchema),
    mode: 'onTouched',
  });

  useEffect(() => {
    getAllPartners()
      .then((data) => setAllPartners(data?.partners ?? []))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!nr_inreg) return;
    api
      .get(`/registru/${nr_inreg}`)
      .then((res) => {
        reset(res.data);
        setCreatorName(res.data.creator?.full_name ?? '');
      })
      .catch(() => toast.error('Eroare la încărcarea registrului'));
  }, [nr_inreg, reset]);

  const onSubmit = async (data) => {
    setSuccess('');
    setLoading(true);
    try {
      await api.put(`/registru/${nr_inreg}`, data);
      setSuccess('Registru editat cu succes');
      setTimeout(handleClose, 1000);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Eroare necunoscută');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" size="lg">
      <Modal.Header
        closeButton
        style={{ backgroundColor: 'rgb(4,84,135)', color: 'white' }}
      >
        <Modal.Title>Editează registru — {nr_inreg}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {success}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Obiectul <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded"
              {...register('obiectul')}
              disabled={!canEditField('obiectul', user.role)}
            />
            {errors.obiectul && (
              <p className="text-red-500 text-sm mt-1">
                {errors.obiectul.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cod SSI <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded"
                {...register('cod_ssi')}
                disabled={!canEditField('cod_ssi', user.role)}
              />
              {errors.cod_ssi && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.cod_ssi.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cod Angajament <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded"
                {...register('cod_angajament')}
                disabled={!canEditField('cod_angajament', user.role)}
              />
              {errors.cod_angajament && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.cod_angajament.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Partener <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white"
                {...register('partener_id')}
                disabled={!canEditField('partener_id', user.role)}
              >
                <option value="">— Selectează partener —</option>
                {allPartners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.denumire}
                  </option>
                ))}
              </select>
              {errors.partener_id && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.partener_id.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded bg-white"
                {...register('status')}
              >
                <option value="DRAFT">DRAFT</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="CLOSED">CLOSED</option>
                <option value="CANCELED">CANCELED</option>
              </select>
              {errors.status && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.status.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observații
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded resize-none"
              {...register('observatii')}
              disabled={!canEditField('observatii', user.role)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Creator
            </label>
            <input
              type="text"
              readOnly
              value={creatorName}
              className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-100 text-gray-600 cursor-default"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Se salvează...' : 'Salvează'}
            </button>
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Anulează
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
