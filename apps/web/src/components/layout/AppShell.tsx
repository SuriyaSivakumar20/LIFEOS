import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Home,
  Wallet,
  Calendar,
  Flame,
  Sparkles,
  BookOpen,
  TrendingUp,
  Settings,
  Sun,
  Moon,
  Menu,
  X,
  ShieldCheck,
  HardDrive,
} from 'lucide-react';
import { useTheme } from '../../hooks/use-theme';
import { usePersistentStorage } from '../../hooks/use-persistent-storage';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  primary?: boolean;
}

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: <Home size={18} />, primary: true },
  { to: '/money', label: 'Money', icon: <Wallet size={18} />, primary: true },
  { to: '/planner', label: 'Planner', icon: <Calendar size={18} />, primary: true },
  { to: '/habits', label: 'Habits', icon: <Flame size={18} />, primary: true },
  { to: '/alfred', label: 'Alfred', icon: <Sparkles size={18} />, primary: true },
];

const SECONDARY_NAV_ITEMS: NavItem[] = [
  { to: '/journal', label: 'Journal', icon: <BookOpen size={18} /> },
  { to: '/insights', label: 'Insights', icon: <TrendingUp size={18} /> },
  { to: '/settings', label: 'Settings', icon: <Settings size={18} /> },
];

const ALL_NAV_ITEMS = [...PRIMARY_NAV_ITEMS, ...SECONDARY_NAV_ITEMS];

export const AppShell: React.FC = () => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { isPersisted, requestPersistence } = usePersistentStorage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const currentNav = ALL_NAV_ITEMS.find((item) =>
    item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
  ) || PRIMARY_NAV_ITEMS[0];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-bg-primary text-content-primary">
      {/* ======================================================== */}
      {/* Desktop Sidebar (>= 768px)                                */}
      {/* ======================================================== */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-boundary bg-bg-secondary select-none">
        {/* Brand Header */}
        <div className="p-5 border-b border-boundary flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center font-bold text-white shadow-sm">
              L
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-content-primary">
                LIFE<span className="text-accent-primary">OS</span>
              </span>
              <p className="text-[10px] text-content-muted tracking-wider uppercase font-medium">
                Local-First PWA
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="text-[11px] font-semibold text-content-muted uppercase tracking-wider px-3 mb-2">
            Modules
          </div>
          {PRIMARY_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent-primary text-white font-semibold shadow-sm'
                    : 'text-content-secondary hover:text-content-primary hover:bg-bg-elevated/70'
                }`
              }
            >
              <span className="shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div className="text-[11px] font-semibold text-content-muted uppercase tracking-wider px-3 pt-4 mb-2">
            System & Tools
          </div>
          {SECONDARY_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent-primary text-white font-semibold shadow-sm'
                    : 'text-content-secondary hover:text-content-primary hover:bg-bg-elevated/70'
                }`
              }
            >
              <span className="shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer: Theme & Storage */}
        <div className="p-3 border-t border-boundary bg-bg-secondary space-y-2">
          {/* Storage Persistence Indicator */}
          <div
            onClick={() => !isPersisted && requestPersistence()}
            title={isPersisted ? 'Browser persistent storage is active' : 'Click to request persistent storage'}
            className="flex items-center justify-between px-3 py-1.5 rounded-md bg-bg-elevated/50 border border-boundary/40 text-xs text-content-secondary cursor-pointer hover:bg-bg-elevated transition-colors"
          >
            <div className="flex items-center gap-2">
              <HardDrive size={14} className={isPersisted ? 'text-status-success' : 'text-status-warning'} />
              <span>{isPersisted ? 'Persistent' : 'Ephemeral'} Storage</span>
            </div>
            {isPersisted && <ShieldCheck size={14} className="text-status-success" />}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-bg-elevated/70 hover:bg-bg-elevated border border-boundary text-xs font-medium text-content-primary transition-colors"
          >
            <span className="flex items-center gap-2">
              {resolvedTheme === 'dark' ? <Moon size={14} className="text-accent-primary" /> : <Sun size={14} className="text-accent-primary" />}
              <span>Appearance: {resolvedTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </span>
            <span className="text-[10px] uppercase font-bold text-content-muted">Toggle</span>
          </button>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* Mobile Top Header (< 768px)                               */}
      {/* ======================================================== */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-bg-secondary border-b border-boundary sticky top-0 z-30 select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-accent-primary flex items-center justify-center font-bold text-white text-xs">
            L
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-content-primary leading-tight">
              {currentNav.label}
            </h1>
            <p className="text-[10px] text-content-muted font-medium">
              LIFEOS Local-First
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-1.5 rounded-md bg-bg-elevated border border-boundary text-content-secondary hover:text-content-primary"
          >
            {resolvedTheme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-1.5 rounded-md bg-bg-elevated border border-boundary text-content-secondary hover:text-content-primary"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* Mobile Full Menu Drawer Modal                             */}
      {/* ======================================================== */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex flex-col justify-end"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="bg-bg-secondary border-t border-boundary rounded-t-xl p-5 space-y-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-boundary">
              <span className="text-sm font-semibold text-content-primary">
                All Navigation
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-md text-content-secondary hover:text-content-primary"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {ALL_NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 p-3 rounded-lg text-xs font-medium border transition-colors ${
                      isActive
                        ? 'bg-accent-primary text-white border-accent-primary font-semibold'
                        : 'bg-bg-elevated text-content-primary border-boundary hover:border-accent-primary/50'
                    }`
                  }
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>

            <div className="pt-2 border-t border-boundary flex items-center justify-between text-xs text-content-muted">
              <span>Status: {isPersisted ? 'Storage Persistent' : 'Storage Ephemeral'}</span>
              <span>v1.0.0 PWA</span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* Main Content Area                                         */}
      {/* ======================================================== */}
      <main className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6 overflow-y-auto">
        <div className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </div>
      </main>

      {/* ======================================================== */}
      {/* Mobile Fixed Bottom Navigation Bar (< 768px)              */}
      {/* ======================================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-bg-secondary/95 backdrop-blur-md border-t border-boundary flex items-center justify-around py-1.5 px-2 select-none">
        {PRIMARY_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2 rounded-md transition-colors min-w-[56px] ${
                isActive
                  ? 'text-accent-primary font-semibold'
                  : 'text-content-secondary hover:text-content-primary'
              }`
            }
          >
            <span className="shrink-0 mb-0.5">{item.icon}</span>
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </NavLink>
        ))}

        {/* More Options Button */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-md text-content-secondary hover:text-content-primary min-w-[56px]"
        >
          <Menu size={18} className="mb-0.5" />
          <span className="text-[10px] tracking-tight">More</span>
        </button>
      </nav>
    </div>
  );
};
