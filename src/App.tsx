import React, { useState, Suspense, lazy } from 'react';
import { useApp } from './context/AppContext';
import { useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { ToastContainer } from './components/common/ToastContainer';
import { LoginView } from './components/auth/LoginView';

// Views (Primary eager, secondary lazy-loaded to reduce initial bundle egress)
import { InicioView } from './components/dashboard/InicioView';
import { FrontDeskView } from './components/frontdesk/FrontDeskView';

const CalendarTimeline = lazy(() => import('./components/calendar/CalendarTimeline').then(m => ({ default: m.CalendarTimeline })));
const PropertiesView = lazy(() => import('./components/properties/PropertiesView').then(m => ({ default: m.PropertiesView })));
const UsersView = lazy(() => import('./components/users/UsersView').then(m => ({ default: m.UsersView })));
const RequestsView = lazy(() => import('./components/requests/RequestsView').then(m => ({ default: m.RequestsView })));
const ReportsView = lazy(() => import('./components/reports/ReportsView').then(m => ({ default: m.ReportsView })));
const ComunicadosView = lazy(() => import('./components/comunicados/ComunicadosView').then(m => ({ default: m.ComunicadosView })));
const BitacoraView = lazy(() => import('./components/bitacora/BitacoraView').then(m => ({ default: m.BitacoraView })));

// Modals
import { ReservationModal } from './components/frontdesk/ReservationModal';
import { CheckInModal } from './components/frontdesk/CheckInModal';
import { ReservationDetailModal } from './components/frontdesk/ReservationDetailModal';
import { PropertyFormModal } from './components/properties/PropertyFormModal';
import { BuildingsManagerModal } from './components/properties/BuildingsManagerModal';
import { UserFormModal } from './components/users/UserFormModal';
import { RequestModal } from './components/requests/RequestModal';

const GuestQrModal = lazy(() => import('./components/frontdesk/GuestQrModal').then(m => ({ default: m.GuestQrModal })));

import { Reservacion, Propiedad, Usuario, SolicitudAcceso } from './types';

export const App: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();
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

  const [isQrPassModalOpen, setIsQrPassModalOpen] = useState(false);
  const [qrPassRes, setQrPassRes] = useState<Reservacion | null>(null);

  const [isPropModalOpen, setIsPropModalOpen] = useState(false);
  const [propToEdit, setPropToEdit] = useState<Propiedad | null>(null);

  const [isBuildingsModalOpen, setIsBuildingsModalOpen] = useState(false);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<Usuario | null>(null);

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestToEdit, setRequestToEdit] = useState<SolicitudAcceso | null>(null);

  // Handlers
  const handleOpenQrPass = (res: Reservacion) => {
    setQrPassRes(res);
    setIsQrPassModalOpen(true);
  };
  const handleOpenNewReservation = (propiedadId?: number, fechaCheckin?: string, fechaCheckout?: string) => {
    setResToEdit(null);
    const validPropId = typeof propiedadId === 'number' ? propiedadId : undefined;
    const validCheckin = typeof fechaCheckin === 'string' ? fechaCheckin : undefined;
    const validCheckout = typeof fechaCheckout === 'string' ? fechaCheckout : undefined;

    setNewResInitialData(
      validPropId || validCheckin || validCheckout
        ? { propiedadId: validPropId, fechaCheckin: validCheckin, fechaCheckout: validCheckout }
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
    setRequestToEdit(null);
    setIsRequestModalOpen(true);
  };

  const handleEditRequest = (sol: SolicitudAcceso) => {
    setRequestToEdit(sol);
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
          
          <Suspense fallback={
            <div className="flex items-center justify-center py-20 text-xs font-semibold text-slate-400">
              Cargando módulo...
            </div>
          }>
            {/* Module Views */}
            {activeTab === 'inicio' && (
              <InicioView
                onOpenNewReservation={handleOpenNewReservation}
                onViewReservationDetail={handleViewReservationDetail}
                onOpenQrPass={handleOpenQrPass}
                onNavigateTab={setActiveTab}
              />
            )}

            {activeTab === 'frontdesk' && (
              <FrontDeskView
                onOpenNewReservation={handleOpenNewReservation}
                onEditReservation={handleEditReservation}
                onViewReservationDetail={handleViewReservationDetail}
                onCheckIn={handleCheckIn}
                onOpenQrPass={handleOpenQrPass}
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
                onEditRequest={handleEditRequest}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView />
            )}

            {activeTab === 'comunicados' && (
              <ComunicadosView />
            )}

            {activeTab === 'bitacora' && (
              <BitacoraView />
            )}
          </Suspense>

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
        onOpenQrPass={handleOpenQrPass}
      />

      <ReservationDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        reservation={detailRes}
        onEdit={handleEditReservation}
        onCheckIn={handleCheckIn}
        onOpenQrPass={handleOpenQrPass}
      />

      {isQrPassModalOpen && (
        <Suspense fallback={null}>
          <GuestQrModal
            isOpen={isQrPassModalOpen}
            onClose={() => {
              setIsQrPassModalOpen(false);
              setQrPassRes(null);
            }}
            reservation={qrPassRes}
            onCheckIn={handleCheckIn}
          />
        </Suspense>
      )}

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
        onClose={() => {
          setIsRequestModalOpen(false);
          setRequestToEdit(null);
        }}
        solicitudToEdit={requestToEdit}
      />

      {/* Floating Notifications */}
      <ToastContainer />

    </div>
  );
};

export default App;
