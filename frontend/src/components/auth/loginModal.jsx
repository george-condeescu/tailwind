import { useEffect } from 'react';

import {
  useSearchParams,
  useNavigate,
  useLocation,
  Link,
} from 'react-router-dom';

import { toast, Toaster } from 'react-hot-toast';
import { z } from 'zod';
import { Modal } from 'react-bootstrap';

//context
import { useAuth } from '../../hooks/useAuth';
import { useDepartments } from '../../hooks/useDepartment';
import api from '../../api/axiosInstance';

//validare
import { loginSchema } from '../../validations/login.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import './loginModal.css';

export default function Login({ isOpen: propIsOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason');
  const { dispatch } = useAuth();
  const { getDepartmentByUserId } = useDepartments();

  // const [show, setShow] = useState(false);
  const initialForm = {
    email: '',
    password: '',
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: initialForm,
    mode: 'onChange', // validare cand user da click in afara camp sau incearca sa submit form, nu in timp ce scrie
  });

  // Modalul este deschis dacă primim prop-ul sau dacă suntem pe ruta /login
  const isVisible = propIsOpen || location.pathname === '/login';

  const handleClose = () => {
    // Dacă am ajuns aici prin rută, închiderea înseamnă plecarea de pe /login
    if (location.pathname === '/login') {
      navigate('/'); // sau înapoi de unde a venit
    }
  };

  useEffect(() => {
    if (!isVisible) return null; // Nu randăm nimic dacă nu e vizibil

    if (reason === 'expired') {
      toast.error(
        'Sesiunea ta a expirat. Te rugăm să te reconectezi pentru siguranță.',
        {
          duration: 5000,
          icon: '🔒',
        },
      );
    }
    if (reason === 'unauthorized') {
      toast.error('Nu ai permisiunea de a accesa acea pagină.', {
        duration: 5000,
        icon: '❌',
      });
    }
  }, [isVisible, reason]);

  const onSubmit = async (data) => {
    try {
      loginSchema.parse(data);

      // Example API call using axios
      await api
        .post('/auth/login', data)
        .then(async (res) => {
          if (res.status === 200) {
            const { token, user } = res.data;

            // Salvezi fizic în browser
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            // Obtin departamentul utilizatorului și îl salvez în localStorage --- AICI SE ÎNTÂMPLĂ LOGIN-UL EFECTIV, DUPĂ CE AM PRIMIT RASPUNSUL DE LA SERVER ȘI AM SALVAT DATELE ÎN BROWSER
            const department = await getDepartmentByUserId(user.id);
            localStorage.setItem('department', JSON.stringify(department));

            // ... după salvarea în localStorage
            dispatch({ type: 'LOGIN_SUCCESS', payload: user });
            navigate('/dashboard'); // Redirect to the dashboard or any other page
            toast.success('Login successful!', {
              duration: 5000,
              icon: '✅',
              className: 'custom-large-toast',
            });
            handleClose();
          } else {
            toast.error('Login failed. Please check your credentials.', {
              duration: 5000,
              icon: '❌',
              className: 'custom-large-toast',
            });
          }
        })
        .catch((err) => {
          console.error('Login error:', err);
          const message =
            err.response?.data?.message ||
            'A apărut o eroare la autentificare. Încearcă din nou.';
          toast.error(message, {
            duration: 5000,
            icon: '❌',
            className: 'custom-large-toast',
          });
        });
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast.error(err.message, {
            duration: 5000,
            icon: '❌',
            className: 'custom-large-toast',
          });
        });
      }
    }
  };

  return (
    <>
      <Toaster position="top-center" />

      <Modal show={isVisible} onHide={handleClose} size="sl" backdrop="static">
        <Modal.Header
          closeButton
          style={{ backgroundColor: 'rgb(4,84,135)', color: 'white' }}
        >
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block mb-2 text-indigo-500" htmlFor="email">
                Email
              </label>
              <input
                className={`w-full p-2 mb-6 text-indigo-700 border-b-2 border-indigo-500 outline-none bg-white ${errors.email ? 'border-red-500' : ''}`}
                type="email"
                name="email"
                id="email"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label className="block mb-2 text-indigo-500" htmlFor="password">
                Password
              </label>
              <input
                className={`w-full p-2 mb-6 text-indigo-700 border-b-2 border-indigo-500 outline-none bg-white ${errors.password ? 'border-red-500' : ''}`}
                type="password"
                name="password"
                id="password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div>
              <button
                className="w-full bg-indigo-700 hover:bg-pink-700 text-white font-bold py-2 px-4 mb-6 mt-2 rounded disabled:bg-gray-500"
                type="submit"
                disabled={!isValid}
              >
                Login
              </button>
            </div>
          </form>
          <footer>
            <Link
              className="text-indigo-700 hover:text-pink-700 text-sm float-left"
              to="/forgot-password"
            >
              Am uitat parola?
            </Link>
            <Link
              className="text-indigo-700 hover:text-pink-700 text-sm float-right"
              to="/register"
            >
              Creează cont
            </Link>
          </footer>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="bg-gray-700 text-white px-5 py-2 rounded"
            type="button"
            onClick={handleClose}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
