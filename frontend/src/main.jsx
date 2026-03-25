import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { AuthProvider } from './context/authContext.jsx';
import { DepartmentProvider } from './context/departmentContext.jsx';
import { PartnerProvider } from './context/partnerContext.jsx';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient();


import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DepartmentProvider>
          <PartnerProvider>
            <App />
          </PartnerProvider>
        </DepartmentProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
