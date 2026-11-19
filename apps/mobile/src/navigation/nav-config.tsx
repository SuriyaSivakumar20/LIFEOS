import React from 'react';
import {
  Home,
  Wallet,
  CheckSquare,
  Flame,
  Bot,
  BookOpen,
  BarChart3,
  Settings,
} from 'lucide-react-native';
import type { NavItemConfig } from '@lifeos/ui';

export const PRIMARY_NAV_ITEMS: NavItemConfig[] = [
  {
    key: 'home',
    label: 'Home',
    route: '/',
    icon: ({ color, size }) => <Home color={color} size={size} />,
  },
  {
    key: 'money',
    label: 'Money',
    route: '/money',
    icon: ({ color, size }) => <Wallet color={color} size={size} />,
  },
  {
    key: 'planner',
    label: 'Planner',
    route: '/planner',
    icon: ({ color, size }) => <CheckSquare color={color} size={size} />,
  },
  {
    key: 'habits',
    label: 'Habits',
    route: '/habits',
    icon: ({ color, size }) => <Flame color={color} size={size} />,
  },
  {
    key: 'alfred',
    label: 'Alfred',
    route: '/alfred',
    icon: ({ color, size }) => <Bot color={color} size={size} />,
  },
];

export const ALL_NAV_ITEMS: NavItemConfig[] = [
  ...PRIMARY_NAV_ITEMS,
  {
    key: 'journal',
    label: 'Journal',
    route: '/journal',
    icon: ({ color, size }) => <BookOpen color={color} size={size} />,
  },
  {
    key: 'insights',
    label: 'Insights',
    route: '/insights',
    icon: ({ color, size }) => <BarChart3 color={color} size={size} />,
  },
  {
    key: 'settings',
    label: 'Settings',
    route: '/settings',
    icon: ({ color, size }) => <Settings color={color} size={size} />,
  },
];
