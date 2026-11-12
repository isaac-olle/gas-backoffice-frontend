import { useState } from 'react';
import { useAuth } from '../../../modules/auth/AuthContext';
import { useUserProfile } from '../../hooks/useUserProfile';
import { Sidebar, SectionId } from './Sidebar';
import { Topbar } from './Topbar';
import { DashboardPage } from '../../DashboardPage';
import { UsersPage } from '../../UsersPage';
import { ErrorsPage } from '../../ErrorsPage';
import { EventsPage } from '../../EventsPage';
import { SubscriptionsPage } from '../../SubscriptionsPage';

const SECTION_TITLES: Record<SectionId, string> = {
  dashboard: 'Clients & PRs',
  subscriptions: 'Subscriptions',
  users: 'Users',
  errors: 'Errors',
  events: 'Events',
};

export function MainLayout() {
  const { role, useCases } = useAuth();
  const { profile } = useUserProfile();
  const [activeSection, setActiveSection] = useState<SectionId>('dashboard');

  const handleSignOut = async () => {
    try {
      await useCases.signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar role={role} activeSection={activeSection} onNavigate={setActiveSection} />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar profile={profile} role={role} onSignOut={handleSignOut} />

        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="text-lg font-semibold text-slate-100 mb-5">
            {SECTION_TITLES[activeSection]}
          </h1>

          {activeSection === 'dashboard' && <DashboardPage />}
          {activeSection === 'subscriptions' && <SubscriptionsPage />}
          {activeSection === 'users' && <UsersPage />}
          {activeSection === 'errors' && <ErrorsPage />}
          {activeSection === 'events' && <EventsPage />}
        </main>
      </div>
    </div>
  );
}
