import { IUserProfileRepository } from '../domain/IUserProfileRepository';
import { UserProfile } from '../domain/UserProfile';

export function getCurrentUserProfile(
  userProfileRepository: IUserProfileRepository,
): Promise<UserProfile> {
  return userProfileRepository.getCurrentUserProfile();
}
