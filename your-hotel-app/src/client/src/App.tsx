import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HotelProvider, useHotel } from './context/HotelContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { RoomsPage } from './pages/RoomsPage';
import { KitchenPage } from './pages/KitchenPage';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Modal } from './components/common/Modal';
import { ReservationForm } from './components/reservations/ReservationForm';
import { InvoiceModal } from './components/billing/InvoiceModal';
import { ToastContainer } from './components/common/Toast';
import { Spinner } from './components/common/Spinner';

import { ErrorBoundary } from './components/common/ErrorBoundary';

const MainLayout: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const {
    isReservationModalOpen,
    setIsReservationModalOpen,
    editingReservation,
    setEditingReservation,
    selectedRoom,
    setSelectedRoom,
    activeInvoice,
    setActiveInvoice,
  } = useHotel();

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Role guard: redirect Kitchen staff to kitchen workspace
  React.useEffect(() => {
    if (user?.role === 'Kitchen') {
      setActiveTab('kitchen');
    } else {
      setActiveTab('dashboard');
    }
  }, [user?.role]);

  const handleSetTab = (tab: string) => {
    if (user?.role === 'Kitchen' && tab === 'reservations') {
      return; // Restricted from reservations CRUD
    }
    setActiveTab(tab);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Spinner size="lg" className="text-amber-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleOpenNewReservation = (roomNumber?: string) => {
    setEditingReservation(null);
    setSelectedRoom(roomNumber || null);
    setIsReservationModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsReservationModalOpen(false);
    setEditingReservation(null);
    setSelectedRoom(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navbar */}
      <Navbar onOpenNewReservation={() => handleOpenNewReservation()} />

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleSetTab}
          onOpenNewReservation={() => handleOpenNewReservation()}
        />

        {/* Dynamic Main Workspace View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage
              onNavigateTab={tab => handleSetTab(tab)}
              onOpenNewReservation={() => handleOpenNewReservation()}
            />
          )}
          {activeTab === 'reservations' && (
            <ReservationsPage onOpenNewReservation={() => handleOpenNewReservation()} />
          )}
          {activeTab === 'rooms' && (
            <RoomsPage onOpenNewReservation={() => handleOpenNewReservation()} />
          )}
          {activeTab === 'kitchen' && <KitchenPage />}
        </main>
      </div>

      {/* Reservation Create / Edit Modal */}
      <Modal
        isOpen={isReservationModalOpen}
        onClose={handleCloseModal}
        title={editingReservation ? `Edit Reservation #${editingReservation.id}` : 'Create New Guest Reservation'}
        subtitle="Manage full 33-column guest profile, room assignment, perks & live billing"
        maxWidth="2xl"
      >
        <ReservationForm
          onSuccess={handleCloseModal}
          onCancel={handleCloseModal}
          initialData={editingReservation}
          defaultRoomNumber={selectedRoom}
        />
      </Modal>

      {/* Guest Folio & Invoice Modal */}
      <InvoiceModal
        isOpen={!!activeInvoice}
        onClose={() => setActiveInvoice(null)}
        invoice={activeInvoice}
      />

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <HotelProvider>
          <MainLayout />
        </HotelProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
