import { describe, it, expect, vi } from 'vitest';
import api from './axiosInstance';

describe('axiosInstance Interceptors', () => {
  it('ar trebui să redirecționeze la login și să curețe stocarea la eroarea 401', async () => {
    // 1. Simulăm un mediu în care avem date în storage
    localStorage.setItem('token', 'expired-token');
    
    // 2. Mock pentru un răspuns de eroare 401 de la server
    // Folosim o tehnică de "mocking" pentru a simula un apel eșuat
    const mockError = {
      response: { status: 401 },
      config: { _retry: false }
    };

    // 3. Executăm manual logica de eroare a interceptorului
    // (În mod normal, Axios face asta automat, dar în test o forțăm)
    try {
      // Obținem funcția de eroare din interceptorul de răspuns
      const errorHandler = api.interceptors.response.handlers[0].rejected;
      await errorHandler(mockError);
    } catch (e) {
      // Eroarea este re-aruncată de interceptor, e normal
    }

    // 4. VERIFICĂRI (ASSERTIONS)
    // A fost curățat token-ul?
    expect(localStorage.getItem('token')).toBeNull();
    
    // A fost redirecționat utilizatorul?
    expect(window.location.href).toContain('/login?reason=expired');
  });
});