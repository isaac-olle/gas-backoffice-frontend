import { useState, useRef, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { UserProfile } from '../../../modules/user_profile/domain/UserProfile';
import { UserRole } from '../../../modules/auth/domain/User';

interface TopbarProps {
  profile: UserProfile | null;
  role: UserRole | null;
  onSignOut: () => void;
}

export function Topbar({ profile, role, onSignOut }: TopbarProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = profile?.displayName
    ? profile.displayName
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <header className="h-16 shrink-0 bg-red-600 flex items-center justify-start px-8">
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="w-10 h-10 rounded-full bg-red-900 flex items-center justify-center text-red-100 font-semibold text-sm shadow-lg hover:shadow-xl transition"
        >
          {profile?.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </button>

        {open && (
          <div className="absolute left-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-4 z-10">
            <p className="text-sm font-medium text-slate-200 truncate">
              {profile?.displayName ?? 'Usuari'}
            </p>
            <p className="text-xs text-slate-400 truncate mt-0.5">{profile?.email}</p>
            {role && (
              <p className="text-xs text-slate-500 capitalize mt-1">
                Role: <span className="text-red-500 font-medium">{formatRole(role)}</span>
              </p>
            )}

            <button
              type="button"
              onClick={onSignOut}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-950 text-slate-200 text-sm font-medium py-2 px-3 rounded-lg transition duration-150 border border-slate-700"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

function formatRole(role: string): string {
  return role.replace(/[-_]+/g, ' ');
}
