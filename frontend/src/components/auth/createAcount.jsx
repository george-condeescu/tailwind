import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { Modal } from 'react-bootstrap';
import { Plus, X } from 'lucide-react';

import axios from 'axios';
import api from '../../api/axiosInstance';

//validare
import { userCreateSchema } from '../../validations/user.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export default function CreateAccount({ isOpen: propIsOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modalul este deschis dacă primim prop-ul sau dacă suntem pe ruta /register
  const isVisible = propIsOpen || location.pathname === '/register';

  const initialForm = {
    username: '',
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    department: '',
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userCreateSchema),
    defaultValues: initialForm,
    mode: 'onChange', // validare cand user da click in afara camp sau incearca sa submit form, nu in timp ce scrie
  });

  const handleClose = () => {
    // Logic to close the modal, e.g., set a state variable to false
    // Dacă am ajuns aici prin rută, închiderea înseamnă plecarea de pe /register

    if (location.pathname === '/register') {
      navigate('/'); // sau înapoi de unde a venit
    }
  };

  useEffect(() => {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    setLoading(true);
    axios
      .get(`${baseURL}/departments/public`)
      .then((res) => setDepartments(res.data.data ?? res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (data) => {
    // Add validation and submission logic here
    const validatedData = userCreateSchema.parse(data);
    try {
      // Call API to create account with validatedData
      await api.post('/auth/register', {
        username: validatedData.username,
        full_name: validatedData.full_name,
        email: validatedData.email,
        password: validatedData.password,
        is_admin: 0,
        org_unit_id: validatedData.department,
      });

      toast.success('Utilizator creat cu succes!', {
        icon: '✅',
        style: { borderRadius: '10px', background: '#333', color: '#fff' },
      });
      setTimeout(() => {
        handleClose(); // Close modal on success
      }, 3000);
    } catch (err) {
      const message =
        err.response?.data?.error || err.message || 'Something went wrong';
      toast.error(
        <span>
          {' '}
          ❌ <b>Eroare la crearea contului:</b> {message}
        </span>,
      );
    }
  };
  if (loading) return <p>Loading departments...</p>;
  if (error) return <p>Error loading departments: {error}</p>;

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 5000 }} />
      <Modal show={isVisible} onHide={handleClose} size="sl" backdrop="static">
        <Modal.Header
          closeButton
          style={{ backgroundColor: 'rgb(4,84,135)', color: 'white' }}
        >
          <Modal.Title>Creare Cont</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                type="text"
                id="username"
                name="username"
                {...register('username')}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                {...register('full_name')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              {errors.full_name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                {...register('email')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                {...register('password')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                {...register('confirm_password')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              {errors.confirm_password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirm_password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                id="department"
                name="department"
                {...register('department')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="" disabled>
                  -- Selectați Departamentul --
                </option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {errors.department && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.department.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-gray-500"
            >
              <Plus className="w-4 h-4 mr-2 inline-block" /> Creare Cont
            </button>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-200"
            onClick={handleClose}
          >
            <X className="w-4 h-4 mr-2 inline-block" />
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
