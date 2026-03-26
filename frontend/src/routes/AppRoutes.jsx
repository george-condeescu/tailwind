// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoutes';

// Importă paginile tale
import Home from '../components/home';
import Inbox from '../components/inbox';
import MainContent from '../components/mainContent';

import AdaugaDocumentIntern from '../components/adaugaDocumentIntern';
import AdaugaRevizie from '../components/AdaugaRevizie';
import ListaDocumente from '../components/listaDocumente';
import ListaRegistre from '../components/listaRegistre';
import DetaliiDocument from '../components/detaliiDocument';
import DocumentLayout from '../components/DocumentLayout';
import SearchGeneral from '../components/SearchGeneral';
import Raports from '../components/raports';
import ChangePassword from '../components/changePassword';
import Profile from '../components/profile';
import ForgotPassword from '../components/forgotPassword';
import ResetPassword from '../components/resetPassword';
import About from '../components/about';
import Contact from '../components/contact';
import PageNotFound from '../components/PageNotFound';
import CreateTicket from '../components/ticket';
import TicketsMele from '../components/ticketsMele';

//admin
import Dashboard from '../components/admin/dashboard';
import ListUsers from '../components/admin/users/listUsers';
import ListaDepartment from '../components/admin/departments/listDepartaments';
import ListPartner from '../components/admin/partner/listPartner';
import FlushCache from '../components/admin/flushcache';
import AdminListaRegistre from '../components/admin/registre/adminListaRegistre';
import TicketsList from '../components/admin/tickets/ticketsList';

//auth
import Login from '../components/auth/loginModal';
import CreateAccount from '../components/auth/createAcount';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rute Publice */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<CreateAccount />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/support" element={<CreateTicket />} />

      {/* Rute Protejate - Înfășurate în ProtectedRoute */}
      <Route
        path="/tickets"
        element={
          <ProtectedRoute>
            <TicketsMele />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inbox"
        element={
          <ProtectedRoute>
            <Inbox />
          </ProtectedRoute>
        }
      />
      <Route
        path="/documents/:id/*"
        element={
          <ProtectedRoute>
            <DetaliiDocument />
          </ProtectedRoute>
        }
      />

      <Route
        path="/addDocument"
        element={
          <ProtectedRoute>
            <AdaugaDocumentIntern />
          </ProtectedRoute>
        }
      />

      <Route
        path="/lista-documente"
        element={
          <ProtectedRoute>
            <ListaDocumente />
          </ProtectedRoute>
        }
      />

      <Route
        path="/lista-registre"
        element={
          <ProtectedRoute>
            <ListaRegistre />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <ListUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/departments"
        element={
          <ProtectedRoute>
            <ListaDepartment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <SearchGeneral />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rapoarte"
        element={
          <ProtectedRoute>
            <Raports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/partners"
        element={
          <ProtectedRoute>
            <ListPartner />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/registers"
        element={
          <ProtectedRoute>
            <AdminListaRegistre />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/tickets"
        element={
          <ProtectedRoute>
            <TicketsList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/flush-cache"
        element={
          <ProtectedRoute>
            <FlushCache />
          </ProtectedRoute>
        }
      />

      <Route
        path="/revizie-document"
        element={
          <ProtectedRoute>
            <AdaugaRevizie />
          </ProtectedRoute>
        }
      />

      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/edit"
        element={
          <ProtectedRoute>
            <Profile openEdit />
          </ProtectedRoute>
        }
      />

      {/* Redirecționare implicită pentru rute inexistente */}
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

export default AppRoutes;
