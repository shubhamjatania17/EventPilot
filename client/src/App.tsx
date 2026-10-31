import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { EventProvider, useEvent } from './context/EventContext';
import { LandingPage } from './pages/public/LandingPage';
import { SignInPage } from './pages/public/SignInPage';
import { SignUpPage } from './pages/public/SignUpPage';
import { AppLayout } from './components/AppLayout';
import { OverviewPage } from './pages/app/OverviewPage';
import { EventsPage } from './pages/app/EventsPage';
import { BudgetPage } from './pages/app/BudgetPage';
import { TimelinePage } from './pages/app/TimelinePage';
import { VendorsPage } from './pages/app/VendorsPage';
import { GuestsPage } from './pages/app/GuestsPage';
import { TasksPage } from './pages/app/TasksPage';
import { IdeasPage } from './pages/app/IdeasPage';
import { EventDayPage } from './pages/app/EventDayPage';
import { SettingsPage } from './pages/app/SettingsPage';

const AppIndex: React.FC = () => {
  const { hasEvents, loading } = useEvent();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }
  return <Navigate to={hasEvents ? "/app/overview" : "/app/events"} replace />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <EventProvider>
          <Routes>
            {/* Public Routes - Landing page stays on landing page */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            {/* Authenticated Workspace Routes */}
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<AppIndex />} />
              <Route path="overview" element={<OverviewPage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="budget" element={<BudgetPage />} />
              <Route path="timeline" element={<TimelinePage />} />
              <Route path="vendors" element={<VendorsPage />} />
              <Route path="guests" element={<GuestsPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="ideas" element={<IdeasPage />} />
              <Route path="event-day" element={<EventDayPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </EventProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
