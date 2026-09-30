import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { RoomsPage } from './pages/RoomsPage';
import { KitchenPage } from './pages/KitchenPage';
import { HousekeepingPage } from './pages/HousekeepingPage';
import { GuestPortal } from './pages/GuestPortal';
import { GuestDashboard } from './pages/GuestDashboard';
import { GuestHubPage } from './pages/GuestHubPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { AuditTrailPage } from './pages/AuditTrailPage';
import { Toast } from './components/common/Toast';
import { SplashScreen } from './components/common/SplashScreen';
import { useSplashScreen } from './hooks/useSplashScreen';

export function App() {
  const { currentUser } = useAuth();
  const { showSplash, isFadingOut, roleStep, triggerSplash, dismissSplash } = useSplashScreen(2700);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isNewReservationOpen, setIsNewReservationOpen] = useState(false);
  const [publicView, setPublicView] = useState('login'); // 'login' | 'guest-booking' | 'guest-dashboard'

  // Trigger smooth intro animation whenever navigating to login page
  const handleNavigateToLogin = useCallback(() => {
    triggerSplash();
    setPublicView('login');
  }, [triggerSplash]);

  // Trigger smooth intro animation upon sign-out (when user session ends)
  const prevUserRef = useRef(currentUser);
  useEffect(() => {
    if (prevUserRef.current && !currentUser) {
      triggerSplash();
      setPublicView('login');
    }
    prevUserRef.current = currentUser;
  }, [currentUser, triggerSplash]);

  // If user is not logged in, allow direct public guest booking or staff/guest sign in
  if (!currentUser) {
    if (publicView === 'guest-booking') {
      return (
        <>
          {showSplash && (
            <SplashScreen isFadingOut={isFadingOut} roleStep={roleStep} onDismiss={dismissSplash} />
          )}
          <GuestPortal
            onNavigateToDashboard={() => setPublicView('guest-dashboard')}
            onNavigateToLogin={handleNavigateToLogin}
          />
        </>
      );
    }
    if (publicView === 'guest-dashboard') {
      return (
        <>
          {showSplash && (
            <SplashScreen isFadingOut={isFadingOut} roleStep={roleStep} onDismiss={dismissSplash} />
          )}
          <GuestDashboard
            onNavigateToBooking={() => setPublicView('guest-booking')}
            onNavigateToLogin={handleNavigateToLogin}
          />
        </>
      );
    }
    return (
      <>
        {showSplash && (
          <SplashScreen isFadingOut={isFadingOut} roleStep={roleStep} onDismiss={dismissSplash} />
        )}
        <LoginPage
          onNavigateToGuestBooking={() => setPublicView('guest-booking')}
          onNavigateToGuestDashboard={() => setPublicView('guest-dashboard')}
          isSplashActive={showSplash && !isFadingOut}
        />
      </>
    );
  }

  // Adjust default tab based on user role
  const isGuest = currentUser.role === 'guest';
  const isKitchen = currentUser.role === 'kitchen';
  const isAdmin = currentUser.username === 'admin' || currentUser.role === 'admin';
  const effectiveTab = isGuest
    ? (['my-bookings', 'book-room', 'guest-dining', 'guest-housekeeping', 'guest-profile'].includes(currentTab) ? currentTab : 'my-bookings')
    : isKitchen
    ? 'kitchen'
    : (!isAdmin && (currentTab === 'users' || currentTab === 'audit'))
    ? 'dashboard'
    : currentTab;

  return (
    <div className="h-screen bg-[#070b13] text-[#f1f5f9] flex flex-col font-sans antialiased overflow-hidden">
      {/* Intro Splash Loader */}
      {showSplash && (
        <SplashScreen isFadingOut={isFadingOut} roleStep={roleStep} onDismiss={dismissSplash} />
      )}

      {/* Top Navigation */}
      <Navbar onNavigate={setCurrentTab} />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar */}
        <Sidebar currentTab={effectiveTab} onSelectTab={setCurrentTab} />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 min-h-0">
          <div className="max-w-7xl mx-auto">
            {/* Logged-In Guest Experience */}
            {isGuest ? (
              <GuestHubPage
                currentTab={effectiveTab}
                onSelectTab={setCurrentTab}
              />
            ) : (
              /* Staff Experience (Admin, Manager, Kitchen) */
              <>
                {effectiveTab === 'dashboard' && (
                  <DashboardPage
                    onNavigate={setCurrentTab}
                    onOpenNewReservation={() => {
                      setCurrentTab('reservations');
                      setIsNewReservationOpen(true);
                    }}
                  />
                )}
                {effectiveTab === 'reservations' && (
                  <ReservationsPage
                    isOpenModal={isNewReservationOpen}
                    onOpenModal={() => setIsNewReservationOpen(true)}
                    onCloseModal={() => setIsNewReservationOpen(false)}
                  />
                )}
                {effectiveTab === 'rooms' && <RoomsPage />}
                {effectiveTab === 'housekeeping' && <HousekeepingPage />}
                {effectiveTab === 'kitchen' && <KitchenPage />}
                {effectiveTab === 'users' && isAdmin && <UserManagementPage />}
                {effectiveTab === 'audit' && isAdmin && <AuditTrailPage />}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Global Notifications Toast */}
      <Toast />
    </div>
  );
}

export default App;
