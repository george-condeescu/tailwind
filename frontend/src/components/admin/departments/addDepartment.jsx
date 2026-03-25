import { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';

import api from '../../../api/axiosInstance';

//validare
import { departamentSchema } from '../../../validations/departament.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import '../../auth/loginModal.css';

const initialForm = {
  name: '',
  type: '',
  parent_id: '',
  code: '',
  is_active: 0,
};

export default function AddDepartmentModal({ id, show, handleClose }) {
  const { data: allDepartments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await api.get('/departments');
      return response.data.data;
    },
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(departamentSchema),
    defaultValues: initialForm,
    mode: 'onTouched',
  });

  const onSubmit = async (data) => {
    setServerError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await api.post('/departments', data);
      if (response.status !== 201)
        throw new Error('Failed to save department.');
      setSuccess('Departament creat cu succes');
      reset(initialForm);
      setTimeout(handleClose, 2000);
    } catch (error) {
      setServerError(error.response?.data?.message || 'Eroare necunoscută');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-1">
      <Modal show={show} onHide={handleClose} backdrop="static" size="lg">
        <Modal.Header
          closeButton
          style={{ backgroundColor: 'rgb(4,84,135)', color: 'white' }}
        >
          <Modal.Title>Adaugă departament</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
              {success}
            </div>
          )}
          {serverError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {serverError}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input
              type="text"
              id="name"
              placeholder="Nume departament"
              className="w-full px-3 py-2 border border-gray-300 rounded"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}

            <select
              className="w-full px-3 py-2 border border-gray-300 rounded"
              {...register('type')}
            >
              <option value="">Selectează tip</option>
              <option value="CONDUCERE">Conducere</option>
              <option value="DIRECTIE">Direcție</option>
              <option value="SERVICIU">Serviciu</option>
              <option value="COMPARTIMENT">Compartiment</option>
            </select>
            {errors.type && (
              <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
            )}

            <input
              type="text"
              id="code"
              placeholder="Cod"
              className="w-full px-3 py-2 border border-gray-300 rounded"
              {...register('code')}
            />
            {errors.code && (
              <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>
            )}

            <select
              id="parent_id"
              className="w-full px-3 py-2 border border-gray-300 rounded"
              {...register('parent_id')}
            >
              <option value="">-- selectează --</option>
              {allDepartments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {errors.parent_id && (
              <p className="text-red-500 text-sm mt-1">
                {errors.parent_id.message}
              </p>
            )}

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                {...register('is_active')}
              />
              Activ
            </label>

            <div className="flex gap-2 justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Se încarcă...' : 'Adaugă Departament'}
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
    </div>
  );
}
