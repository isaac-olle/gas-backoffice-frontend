import { createContext, useContext, useMemo, ReactNode } from 'react';
import { IUserProfileRepository } from './domain/IUserProfileRepository';
import { UserProfile } from './domain/UserProfile';
import { getCurrentUserProfile } from './application/GetCurrentUserProfile';

interface UserProfileUseCases {
  getCurrentUserProfile: () => Promise<UserProfile>;
}

interface UserProfileContextType {
  useCases: UserProfileUseCases;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

interface UserProfileProviderProps {
  userProfileRepository: IUserProfileRepository;
  children: ReactNode;
}

export function UserProfileProvider({ userProfileRepository, children }: UserProfileProviderProps) {
  const useCases = useMemo<UserProfileUseCases>(
    () => ({
      getCurrentUserProfile: () => getCurrentUserProfile(userProfileRepository),
    }),
    [userProfileRepository],
  );

  return (
    <UserProfileContext.Provider value={{ useCases }}>{children}</UserProfileContext.Provider>
  );
}

export function useUserProfileContext() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfileContext must be used within a UserProfileProvider');
  }
  return context;
}
