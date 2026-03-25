import { useState, useEffect } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import api from '../../../api/axiosInstance.js';
import { useQuery, useQueryClient } from '@tanstack/react-query';

//context
import { useDepartments } from '../../../hooks/useDepartment';

//validare
import { departamentSchema } from '../../../validations/departament.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import '../../auth/loginModal.css';

export default function EditDepartmentModal({ id, show, handleClose }) {
  const queryClient = useQueryClient();

  const { data: allDepartments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await api.get('/departments');
      return response.data.data;
    },
  });

  const emptyForm = {
    name: '',
    type: '',
    parent_id: '',
    code: '',
    is_active: 1,
  };

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(departamentSchema),
    defaultValues: emptyForm,
    mode: 'onTouched',
  });

  const query = useQuery({
    queryKey: ['department', id],
    queryFn: async () => {
      const response = await api.get(`/departments/${id}`);
      if (response.status !== 200)
        throw new Error('Failed to fetch department data.');
      return response.data.data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (query.data) {
      const normalized = {
        ...query.data,
        parent_id: query.data.parent_id ?? '',
        is_active: Boolean(query.data.is_active),
      };
      reset(normalized);
    }
  }, [query.data, reset]);

  const onSubmit = async (data) => {
    setSuccess('');
    setLoading(true);

    try {
      const response = await api.put(`/departments/${id}`, data);
      if (response.status !== 200)
        throw new Error('Failed to save department.');
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['department', id] });
      setSuccess('Departament editat cu succes');
      setTimeout(handleClose, 1000);
    } catch (error) {
      const msg = error.response?.data?.message || 'Eroare necunoscută';
      toast.error(msg);
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
          <Modal.Title>Editează departament</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
              {success}
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
            {errors.is_active && (
              <p className="text-red-500 text-sm mt-1">
                {errors.is_active.message}
              </p>
            )}

            <div className="flex gap-2 justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Se încarcă...' : 'Salvează'}
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
