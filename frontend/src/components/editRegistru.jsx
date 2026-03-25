import { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import { usePartner } from '../hooks/usePartner';

const editRegistruSchema = z.object({
  observatii: z.string().optional(),
  partener_id: z.coerce.number().min(1, 'Partenerul este obligatoriu'),
  obiectul: z.string().min(1, 'Obiectul este obligatoriu'),
  cod_ssi: z.string().min(1, 'Cod SSI este obligatoriu'),
  cod_angajament: z.string().min(1, 'Cod Angajament este obligatoriu'),
  status: z.enum(['DRAFT', 'ACTIVE', 'CLOSED', 'CANCELED']),
});

export default function EditRegistruModal({ nrInreg, show, handleClose }) {
  const [loading, setLoading] = useState(false);
  const { getAllPartners } = usePartner();

  const { data: partners = [] } = useQuery({
    queryKey: ['partners', 'all'],
    queryFn: getAllPartners,
  });

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
    if (!nrInreg) return;
    api
      .get(`/registru/${nrInreg}`)
      .then((res) => {
        const r = res.data;
        reset({
          observatii: r.observatii || '',
          partener_id: r.partener_id,
          obiectul: r.obiectul,
          cod_ssi: r.cod_ssi,
          cod_angajament: r.cod_angajament,
          status: r.status,
        });
      })
      .catch(() => toast.error('Eroare la încărcarea registrului'));
  }, [nrInreg, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.put(`/registru/${nrInreg}`, data);
      toast.success('Registru actualizat cu succes');
      setTimeout(handleClose, 800);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Eroare la salvare');
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
        <Modal.Title>Editează Registru — {nrInreg}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Observații</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded"
              rows={2}
              {...register('observatii')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Partener</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded"
              {...register('partener_id')}
            >
              <option value="">-- selectează --</option>
              {partners.partners.map((p) => (
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
            <label className="block text-sm font-medium mb-1">Obiectul</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded"
              rows={2}
              {...register('obiectul')}
            />
            {errors.obiectul && (
              <p className="text-red-500 text-sm mt-1">
                {errors.obiectul.message}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Cod SSI</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded"
                {...register('cod_ssi')}
              />
              {errors.cod_ssi && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.cod_ssi.message}
                </p>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Cod Angajament
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded"
                {...register('cod_angajament')}
              />
              {errors.cod_angajament && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.cod_angajament.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded"
              {...register('status')}
            >
              <option value="DRAFT">DRAFT</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="CLOSED">CLOSED</option>
              <option value="CANCELED">CANCELED</option>
            </select>
          </div>
          <div className="flex justify-end pt-2">
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
