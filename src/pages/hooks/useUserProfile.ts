import { useEffect, useState } from 'react';
import { useUserProfileContext } from '../../modules/user_profile/UserProfileContext';
import { UserProfile } from '../../modules/user_profile/domain/UserProfile';

export function useUserProfile() {
  const { useCases } = useUserProfileContext();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    useCases
      .getCurrentUserProfile()
      .then((result) => {
        if (active) setProfile(result);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [useCases]);

  return { profile, loading };
}
