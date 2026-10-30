import { UserProfile } from './UserProfile';

export interface IUserProfileRepository {
  getCurrentUserProfile(): Promise<UserProfile>;
}
