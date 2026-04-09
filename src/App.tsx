import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { initAuth } from './stores/authStore'

import LandingPage        from './pages/LandingPage'
import LoginPage          from './pages/auth/LoginPage'
import AuthCallback       from './pages/auth/AuthCallback'
import ResetPasswordPage  from './pages/auth/ResetPasswordPage'
import BookingPage        from './pages/BookingPage'
import BookingSuccess     from './pages/booking/BookingSuccess'
import BookingCancel      from './pages/booking/BookingCancel'
import ProtectedRoute     from './components/auth/ProtectedRoute'
import AdminLayout        from './pages/admin/AdminLayout'
import AdminDashboard     from './pages/admin/AdminDashboard'
import AdminBookings      from './pages/admin/AdminBookings'
import AdminRooms         from './pages/admin/AdminRooms'
import AdminStaff         from './pages/admin/AdminStaff'
import AdminInventory     from './pages/admin/AdminInventory'
import AdminReports       from './pages/admin/AdminReports'
import AdminChannels      from './pages/admin/AdminChannels'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 2, retry: 1 } },
})

export default function App() {
  useEffect(() => { initAuth() }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Publike */}
          <Route path="/"                    element={<LandingPage />} />
          <Route path="/login"               element={<LoginPage />} />
          <Route path="/auth/callback"       element={<AuthCallback />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

          {/* Booking */}
          <Route path="/booking" element={
            <ProtectedRoute allowedRoles={['guest','receptionist','admin','superadmin']}>
              <BookingPage />
            </ProtectedRoute>
          } />
          <Route path="/booking/success" element={<BookingSuccess />} />
          <Route path="/booking/cancel"  element={<BookingCancel />} />

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['receptionist','staff','hr','admin','superadmin']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="rooms" element={
              <ProtectedRoute allowedRoles={['admin','superadmin']}><AdminRooms /></ProtectedRoute>
            } />
            <Route path="staff" element={
              <ProtectedRoute allowedRoles={['admin','superadmin','hr']}><AdminStaff /></ProtectedRoute>
            } />
            <Route path="inventory" element={
              <ProtectedRoute allowedRoles={['admin','superadmin','staff']}><AdminInventory /></ProtectedRoute>
            } />
            <Route path="reports" element={
              <ProtectedRoute allowedRoles={['admin','superadmin']}><AdminReports /></ProtectedRoute>
            } />
            <Route path="channels" element={
              <ProtectedRoute allowedRoles={['admin','superadmin']}><AdminChannels /></ProtectedRoute>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
