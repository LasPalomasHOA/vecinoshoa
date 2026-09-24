import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { HeroBanner } from './components/common/HeroBanner';
import { ToastContainer } from './components/common/ToastContainer';
import { LoginView } from './components/auth/LoginView';

// Views
import { FrontDeskView } from './components/frontdesk/FrontDeskView';
import { CalendarTimeline } from './components/calendar/CalendarTimeline';
import { PropertiesView } from './components/properties/PropertiesView';
import { UsersView } from './components/users/UsersView';
import { RequestsView } from './components/requests/RequestsView';
import { ReportsView } from './components/reports/ReportsView';

// Modals
import { ReservationModal } from './components/frontdesk/ReservationModal';
import { CheckInModal } from './components/frontdesk/CheckInModal';
import { ReservationDetailModal } from './components/frontdesk/ReservationDetailModal';
import { PropertyFormModal } from './components/properties/PropertyFormModal';
import { BuildingsManagerModal } from './components/properties/BuildingsManagerModal';
import { UserFormModal } from './components/users/UserFormModal';
import { RequestModal } from './components/requests/RequestModal';

import { Reservacion, Propiedad, Usuario } from './types';

export const App: React.FC = () => {
  const { activeTab } = useApp();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Modal states
  const [isResModalOpen, setIsResModalOpen] = useState(false);
  const [resToEdit, setResToEdit] = useState<Reservacion | null>(null);
  const [newResInitialData, setNewResInitialData] = useState<{
    propiedadId?: number;
    fechaCheckin?: string;
    fechaCheckout?: string;
  } | null>(null);

  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [checkInRes, setCheckInRes] = useState<Reservacion | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailRes, setDetailRes] = useState<Reservacion | null>(null);

  const [isPropModalOpen, setIsPropModalOpen] = useState(false);
  const [propToEdit, setPropToEdit] = useState<Propiedad | null>(null);

  const [isBuildingsModalOpen, setIsBuildingsModalOpen] = useState(false);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<Usuario | null>(null);

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // Handlers
  const handleOpenNewReservation = (propiedadId?: number, fechaCheckin?: string, fechaCheckout?: string) => {
    setResToEdit(null);
    setNewResInitialData(
      propiedadId || fechaCheckin || fechaCheckout
        ? { propiedadId, fechaCheckin, fechaCheckout }
        : null
    );
    setIsResModalOpen(true);
  };

  const handleEditReservation = (res: Reservacion) => {
    setResToEdit(res);
    setIsResModalOpen(true);
  };

  const handleCheckIn = (res: Reservacion) => {
    setCheckInRes(res);
    setIsCheckInModalOpen(true);
  };

  const handleViewReservationDetail = (res: Reservacion) => {
    setDetailRes(res);
    setIsDetailModalOpen(true);
  };

  const handleOpenNewProperty = () => {
    setPropToEdit(null);
    setIsPropModalOpen(true);
  };

  const handleEditProperty = (prop: Propiedad) => {
    setPropToEdit(prop);
    setIsPropModalOpen(true);
  };

  const handleOpenNewUser = () => {
    setUserToEdit(null);
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: Usuario) => {
    setUserToEdit(user);
    setIsUserModalOpen(true);
  };

  const handleOpenNewRequest = () => {
    setIsRequestModalOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <>
        <LoginView />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 print:bg-white print:block print:p-0 print:m-0">
      
      {/* Fixed Left Sidebar Navigation */}
      <Sidebar />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 print:block print:w-full print:p-0 print:m-0">
        
        {/* Top Navbar */}
        <Navbar />

        {/* Content Container */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto print:p-0 print:m-0 print:max-w-none print:w-full print:block">
          
          {/* Hero Banner with Resort Branding */}
          <HeroBanner />

          {/* Module Views */}
          {activeTab === 'frontdesk' && (
            <FrontDeskView
              onOpenNewReservation={handleOpenNewReservation}
              onEditReservation={handleEditReservation}
              onViewReservationDetail={handleViewReservationDetail}
              onCheckIn={handleCheckIn}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarTimeline
              onSelectReservation={handleViewReservationDetail}
              onNewReservation={handleOpenNewReservation}
            />
          )}

          {activeTab === 'properties' && (
            <PropertiesView
              onOpenNewProperty={handleOpenNewProperty}
              onEditProperty={handleEditProperty}
              onOpenBuildingsManager={() => setIsBuildingsModalOpen(true)}
            />
          )}

          {activeTab === 'users' && (
            <UsersView
              onOpenNewUser={handleOpenNewUser}
              onEditUser={handleEditUser}
            />
          )}

          {activeTab === 'requests' && (
            <RequestsView
              onOpenNewRequest={handleOpenNewRequest}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView />
          )}

        </main>

      </div>

      {/* Modals */}
      <ReservationModal
        isOpen={isResModalOpen}
        onClose={() => {
          setIsResModalOpen(false);
          setNewResInitialData(null);
        }}
        reservationToEdit={resToEdit}
        initialData={newResInitialData}
      />

      <CheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        reservation={checkInRes}
      />

      <ReservationDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        reservation={detailRes}
        onEdit={handleEditReservation}
        onCheckIn={handleCheckIn}
      />

      <PropertyFormModal
        isOpen={isPropModalOpen}
        onClose={() => setIsPropModalOpen(false)}
        propertyToEdit={propToEdit}
      />

      <BuildingsManagerModal
        isOpen={isBuildingsModalOpen}
        onClose={() => setIsBuildingsModalOpen(false)}
      />

      <UserFormModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        userToEdit={userToEdit}
      />

      <RequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
      />

      {/* Floating Notifications */}
      <ToastContainer />

    </div>
  );
};

export default App;
