import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema } from '../validations/changePassword.schema';
import { toast, Toaster } from 'react-hot-toast';
import api from '../api/axiosInstance';

export default function ChangePassword() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully');
      reset();
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to change password';
      toast.error(message);
    }
  };

  return (
    <div className="flex flex-col w-full items-center justify-center p-4 align-top">
      <div className="w-full max-w-md bg-white rounded-lg border shadow-xl p-10">
        <h2>Schimbă Parolă</h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="change-password-form"
        >
          <div className="form-group">
            <label htmlFor="currentPassword">Parola Curentă</label>
            <input
              type="password"
              id="currentPassword"
              {...register('currentPassword')}
              className={`form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
            />
            {errors.currentPassword && (
              <div className="invalid-feedback">
                {errors.currentPassword.message}
              </div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">Parola Nouă</label>
            <input
              type="password"
              id="newPassword"
              {...register('newPassword')}
              className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
            />
            {errors.newPassword && (
              <div className="invalid-feedback">
                {errors.newPassword.message}
              </div>
            )}
          </div>
          <div className="form-group mb-3">
            <label htmlFor="confirmNewPassword">Confirmă Parola Nouă</label>
            <input
              type="password"
              id="confirmNewPassword"
              {...register('confirmNewPassword')}
              className={`form-control ${errors.confirmNewPassword ? 'is-invalid' : ''}`}
            />
            {errors.confirmNewPassword && (
              <div className="invalid-feedback">
                {errors.confirmNewPassword.message}
              </div>
            )}
          </div>
          <button type="submit" className="btn btn-primary" disabled={!isValid}>
            Schimbă Parolă
          </button>{' '}
          <button
            type="button"
            className="btn btn-secondary ml-2"
            onClick={() => navigate('/profile')}
          >
            Close
          </button>
        </form>
        <Toaster />
      </div>
    </div>
  );
}
