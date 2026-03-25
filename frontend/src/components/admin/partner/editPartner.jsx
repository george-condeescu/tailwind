import { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../../api/axiosInstance.js';
import { partenerSchema } from '../../../validations/partener.schema.js';

export default function EditPartnerModal({ id, show, handleClose }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(partenerSchema),
    mode: 'onTouched',
  });

  useEffect(() => {
    if (!id) return;
    api.get(`/partners/${id}`).then((res) => {
      reset(res.data);
    }).catch(() => {
      toast.error('Eroare la încărcarea partenerului');
    });
  }, [id, reset]);

  const onSubmit = async (data) => {
    setSuccess('');
    setLoading(true);
    try {
      await api.put(`/partners/${id}`, data);
      setSuccess('Partener editat cu succes');
      setTimeout(handleClose, 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Eroare necunoscută');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'denumire', label: 'Denumire', required: true },
    { name: 'cui', label: 'CUI' },
    { name: 'reg_com', label: 'Reg. Com.' },
    { name: 'adresa', label: 'Adresă' },
    { name: 'tara', label: 'Țară' },
    { name: 'judet', label: 'Județ' },
    { name: 'localitate', label: 'Localitate' },
    { name: 'telefon', label: 'Telefon' },
    { name: 'email', label: 'Email' },
    { name: 'contact', label: 'Contact' },
  ];

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" size="lg">
      <Modal.Header
        closeButton
        style={{ backgroundColor: 'rgb(4,84,135)', color: 'white' }}
      >
        <Modal.Title>Editează partener</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {success}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {fields.map(({ name, label }) => (
            <div key={name}>
              <input
                type="text"
                placeholder={label}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                {...register(name)}
              />
              {errors[name] && (
                <p className="text-red-500 text-sm mt-1">{errors[name].message}</p>
              )}
            </div>
          ))}
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
