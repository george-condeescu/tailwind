import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Parolele nu coincid.');
      return;
    }
    setLoading(true);
    try {
      await api.put('/auth/reset-password', {
        token,
        password,
        confirmPassword,
      });
      toast.success('Parola a fost resetată cu succes.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      const msg =
        error.response?.data?.message || 'Eroare la resetarea parolei.';
      toast.error(msg);
    } finally {
      setLoading(false);
      navigate('/login');
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col w-full items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg border shadow-xl p-10">
          <h2>Link invalid</h2>
          <p className="mt-4 text-red-500">
            Linkul de resetare a parolei este invalid sau lipsește tokenul.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg border shadow-xl p-10">
        <h2>Resetare parolă</h2>
        <div className="mt-4">
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label htmlFor="password">Parolă nouă</label>
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="Introduceți parola nouă"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="form-group mb-3">
              <label htmlFor="confirmPassword">Confirmare parolă</label>
              <input
                type="password"
                id="confirmPassword"
                className="form-control"
                placeholder="Confirmați parola nouă"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary mt-3"
              disabled={loading}
            >
              {loading ? 'Se procesează...' : 'Resetează parola'}
            </button>{' '}
            <button
              type="button"
              className="btn btn-secondary mt-3 ml-2"
              onClick={() => navigate('/login')}
            >
              Înapoi la login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
