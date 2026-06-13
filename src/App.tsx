import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { BookingWizard } from './pages/rezerwacja/BookingWizard';
import { Unauthorized } from './pages/Unauthorized';
import { PacjentDashboard } from './pages/panel/pacjent/PacjentDashboard';
import { PacjentProfil } from './pages/panel/pacjent/PacjentProfil';
import { AdminDashboard } from './pages/panel/admin/AdminDashboard';
import { AdminKalendarz } from './pages/panel/admin/AdminKalendarz';
import { AdminBookingDetails } from './pages/panel/admin/AdminBookingDetails';
import { AdminClientDetails } from './pages/panel/admin/AdminClientDetails';
import { AdminSesje } from './pages/panel/admin/AdminSesje';
import { AdminKlienci } from './pages/panel/admin/AdminKlienci';
import { AdminUstawienia } from './pages/panel/admin/AdminUstawienia';
import { AuthGuard } from './components/AuthGuard';
import { UserProfile } from './pages/UserProfile';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#1f2937',
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            padding: '12px 20px',
            fontSize: '14px',
            fontFamily: 'Inter, system-ui, sans-serif'
          },
          success: {
            iconTheme: {
              primary: '#2F5C3A',
              secondary: '#ffffff',
            },
            style: {
              border: '1px solid #C4DEBE/50',
              background: '#F6FAF4',
              color: '#2F5C3A',
            }
          },
          error: {
            iconTheme: {
              primary: '#B4453A',
              secondary: '#ffffff',
            },
            style: {
              border: '1px solid #FBEDEB',
              background: '#FBEDEB',
              color: '#B4453A',
            }
          }
        }}
      />
      <Routes>
        {/* Publiczne ścieżki */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/rezerwacja" element={<BookingWizard />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route 
          path="/profil" 
          element={
            <AuthGuard allowedRoles={['user', 'client', 'admin']}>
              <UserProfile />
            </AuthGuard>
          } 
        />

        {/* Panel Pacjenta (Chroniony dla user/client/admin) */}
        <Route 
          path="/panel/pacjent/dashboard" 
          element={
            <AuthGuard allowedRoles={['user', 'client', 'admin']}>
              <PacjentDashboard />
            </AuthGuard>
          } 
        />
        <Route 
          path="/panel/pacjent/profil" 
          element={
            <AuthGuard allowedRoles={['user', 'client', 'admin']}>
              <PacjentProfil />
            </AuthGuard>
          } 
        />

        {/* Panel Administratora (Chroniony wyłącznie dla admina) */}
        <Route 
          path="/panel/admin/dashboard" 
          element={
            <AuthGuard allowedRoles={['admin']}>
              <AdminDashboard />
            </AuthGuard>
          } 
        />
        <Route 
          path="/panel/admin/kalendarz" 
          element={
            <AuthGuard allowedRoles={['admin']}>
              <AdminKalendarz />
            </AuthGuard>
          } 
        />
        <Route 
          path="/panel/admin/bookings/:id" 
          element={
            <AuthGuard allowedRoles={['admin']}>
              <AdminBookingDetails />
            </AuthGuard>
          } 
        />
        <Route 
          path="/panel/admin/clients/:id" 
          element={
            <AuthGuard allowedRoles={['admin']}>
              <AdminClientDetails />
            </AuthGuard>
          } 
        />
        <Route 
          path="/panel/admin/sesje" 
          element={
            <AuthGuard allowedRoles={['admin']}>
              <AdminSesje />
            </AuthGuard>
          } 
        />
        <Route 
          path="/panel/admin/klienci" 
          element={
            <AuthGuard allowedRoles={['admin']}>
              <AdminKlienci />
            </AuthGuard>
          } 
        />
        <Route 
          path="/panel/admin/ustawienia" 
          element={
            <AuthGuard allowedRoles={['admin']}>
              <AdminUstawienia />
            </AuthGuard>
          } 
        />

        {/* Domyślne przekierowanie */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;