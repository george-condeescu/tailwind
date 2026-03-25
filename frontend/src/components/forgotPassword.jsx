import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api/axiosInstance';

export default function ForgotPassword() {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;

    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Link de resetare a parolei trimis! Verifică-ți emailul.');
      navigate('/login', {
        state: {
          message: 'Link de resetare a parolei trimis! Verifică-ți emailul.',
        },
      });
    } catch (error) {
      console.error('Eroare la trimiterea cererii:', error);
      toast.error(
        'Eroare la trimiterea cererii. Vă rugăm să încercați din nou.',
      );
    }
  };

  return (
    <div className="flex flex-col w-full items-center justify-center p-4 align-top">
      <div className="w-full max-w-md bg-white rounded-lg border shadow-xl p-10">
        <h2>Am uitat parola</h2>

        <div className="mt-4">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Adresă de email</label>
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="Introduceți adresa de email"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary mt-3">
              Trimite linkul de resetare
            </button>{' '}
            <button
              type="button"
              className="btn btn-secondary mt-3 ml-2"
              onClick={() => window.history.back()}
            >
              Înapoi
            </button>
          </form>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            Introduceți adresa de email și vă vom trimite un link pentru a
            reseta parola.
          </p>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            Dacă nu primiți un email, vă rugăm să verificați folderul de spam
            sau să încercați din nou.
          </p>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            Pentru asistență suplimentară, contactați echipa noastră de suport
            la{' '}
            <a href="mailto:support@example.com" className="text-blue-500">
              support@example.com
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
