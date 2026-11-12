import { LayoutDashboard, Users as UsersIcon, AlertTriangle, Activity, CreditCard, LucideIcon } from 'lucide-react';
import { GasStationIcon } from '../icons/GasStationIcon';
import { isAdminRole, UserRole } from '../../../modules/auth/domain/User';

export type SectionId = 'dashboard' | 'subscriptions' | 'users' | 'errors' | 'events';

interface NavItem {
  id: SectionId;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Clients & PRs', icon: LayoutDashboard },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, adminOnly: true },
  { id: 'users', label: 'Users', icon: UsersIcon, adminOnly: true },
  { id: 'errors', label: 'Errors', icon: AlertTriangle, adminOnly: true },
  { id: 'events', label: 'Events', icon: Activity, adminOnly: true },
];

interface SidebarProps {
  role: UserRole | null;
  activeSection: SectionId;
  onNavigate: (section: SectionId) => void;
}

export function Sidebar({ role, activeSection, onNavigate }: SidebarProps) {
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || isAdminRole(role));

  return (
    <aside className="w-64 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
        <div className="bg-gradient-to-br from-red-600 to-red-700 p-2 rounded-lg shadow-lg">
          <GasStationIcon className="w-6 h-6 text-slate-200" />
        </div>
        <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600">
          GAS
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeSection;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition duration-150 ${
                isActive
                  ? 'bg-red-600/10 text-red-500 border border-red-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
