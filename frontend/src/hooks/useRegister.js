import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const useRegister = () => {
  const { login } = useAuth(); // Luăm funcția de login din context
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (userData) => {
      const response = await fetch('https://api.exemplu.ro/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Eroare la înregistrare');
      }

      return response.json(); // Presupunem că returnează { user, token }
    },
    onSuccess: (data) => {
      // 1. Logăm utilizatorul automat folosind datele primite
      login(data.user, data.token);

      // 2. Notificăm utilizatorul
      toast.success(`Bun venit, ${data.user.name}!`);

      // 3. Redirecționăm către Dashboard
      navigate('/dashboard');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
