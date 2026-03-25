// src/context/AuthContext.test.jsx
import { render, screen } from '@testing-library/react';
import { AuthProvider } from './AuthContext';
import { useAuth } from '../hooks/useAuth';
import { expect, it, describe } from 'vitest';

// O componentă mică pentru a testa hook-ul
const TestComponent = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <span>Loading...</span>;
  return <span>{isAuthenticated ? 'Logged In' : 'Logged Out'}</span>;
};

describe('AuthContext', () => {
  it('afișează starea de loading la început', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
