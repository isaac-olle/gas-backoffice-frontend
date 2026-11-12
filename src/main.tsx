import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './modules/auth/AuthContext';
import { AuthRepository } from './modules/auth/infrastructure/repositories/AuthRepository';
import { UserProfileProvider } from './modules/user_profile/UserProfileContext';
import { UserProfileRepository } from './modules/user_profile/infrastructure/repositories/UserProfileRepository';
import { ClientsProvider } from './modules/clients/ClientsContext';
import { ClientRepository } from './modules/clients/infrastructure/repositories/ClientRepository';
import { ProtectedResourcesProvider } from './modules/protected_resources/ProtectedResourcesContext';
import { ProtectedResourceRepository } from './modules/protected_resources/infrastructure/repositories/ProtectedResourceRepository';
import { UsersProvider } from './modules/users/UsersContext';
import { ManagedUserRepository } from './modules/users/infrastructure/repositories/ManagedUserRepository';
import { ErrorsProvider } from './modules/errors/ErrorsContext';
import { GasErrorRepository } from './modules/errors/infrastructure/repositories/GasErrorRepository';
import { EventsProvider } from './modules/events/EventsContext';
import { GasEventRepository } from './modules/events/infrastructure/repositories/GasEventRepository';
import { ScopesProvider } from './modules/scopes/ScopesContext';
import { ScopeRepository } from './modules/scopes/infrastructure/repositories/ScopeRepository';
import { SubscriptionsProvider } from './modules/subscriptions/SubscriptionsContext';
import { SubscriptionRepository } from './modules/subscriptions/infrastructure/repositories/SubscriptionRepository';

const authRepository = new AuthRepository();
const userProfileRepository = new UserProfileRepository();
const clientRepository = new ClientRepository();
const protectedResourceRepository = new ProtectedResourceRepository();
const managedUserRepository = new ManagedUserRepository();
const gasErrorRepository = new GasErrorRepository();
const gasEventRepository = new GasEventRepository();
const scopeRepository = new ScopeRepository();
const subscriptionRepository = new SubscriptionRepository();

createRoot(document.getElementById('root')!).render(
  <AuthProvider authRepository={authRepository}>
      <UserProfileProvider userProfileRepository={userProfileRepository}>
        <ClientsProvider clientRepository={clientRepository}>
          <ProtectedResourcesProvider protectedResourceRepository={protectedResourceRepository}>
            <UsersProvider managedUserRepository={managedUserRepository}>
              <ErrorsProvider gasErrorRepository={gasErrorRepository}>
                <ScopesProvider scopeRepository={scopeRepository}>
                  <SubscriptionsProvider subscriptionRepository={subscriptionRepository}>
                    <EventsProvider gasEventRepository={gasEventRepository}>
                      <App />
                    </EventsProvider>
                  </SubscriptionsProvider>
                </ScopesProvider>
              </ErrorsProvider>
            </UsersProvider>
          </ProtectedResourcesProvider>
        </ClientsProvider>
      </UserProfileProvider>
  </AuthProvider>
);
