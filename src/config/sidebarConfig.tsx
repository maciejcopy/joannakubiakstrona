import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Layers,
  Settings,
  User,
} from 'lucide-react';

export interface SidebarItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export const adminSidebarItems: SidebarItem[] = [
  {
    label: 'Dashboard',
    path: '/panel/admin/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: 'Kalendarz',
    path: '/panel/admin/kalendarz',
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    label: 'Klienci',
    path: '/panel/admin/klienci',
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: 'Typy Sesji',
    path: '/panel/admin/sesje',
    icon: <Layers className="h-5 w-5" />,
  },
  {
    label: 'Ustawienia',
    path: '/panel/admin/ustawienia',
    icon: <Settings className="h-5 w-5" />,
  },
  {
    label: 'Mój Profil',
    path: '/profil',
    icon: <User className="h-5 w-5" />,
  },
];

export const pacjentSidebarItems: SidebarItem[] = [
  {
    label: 'Moje Wizyty',
    path: '/panel/pacjent/dashboard',
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    label: 'Mój Profil',
    path: '/panel/pacjent/profil',
    icon: <User className="h-5 w-5" />,
  },
];
