import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api/axiosInstance';

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (userData) => {
      const response = await api.post('/auth/register', userData);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Cont creat. Așteaptă activarea de către administrator.');
      navigate('/login');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || error.message);
    },
  });
};
