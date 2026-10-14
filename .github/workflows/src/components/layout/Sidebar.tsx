import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  FileText,
  UserPlus,
  Stethoscope,
  ClipboardList,
  HeartPulse,
  Pill,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  User as UserIcon,
} from 'lucide-react';
import { UserRole } from '../../types';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

export const Sidebar: React.FC = () => {
  const {
    currentUser,
    currentNav,
    setCurrentNav,
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileMenuOpen,
    setMobileMenuOpen,
    setSelectedPatientId,
    switchRole,
    showToast,
  } = useApp();

  const getNavItems = (role: UserRole): NavItem[] => {
    switch (role) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'patients', label: 'Patients', icon: Users },
          { id: 'staff', label: 'Staff Directory', icon: Stethoscope },
          { id: 'assignments', label: 'Assignments', icon: UserCheck },
          { id: 'appointments', label: 'Appointments', icon: Calendar },
          { id: 'reports', label: 'Reports', icon: FileText },
        ];
      case 'nurse':
        return [
          { id: 'dashboard', label: 'Nurse Station', icon: LayoutDashboard },
          { id: 'patients', label: 'View Patients', icon: Users },
          { id: 'assignments', label: 'Assign Doctor', icon: UserCheck },
          { id: 'appointments', label: "Today's Schedule", icon: Calendar },
        ];
      case 'doctor':
        return [
          { id: 'dashboard', label: 'Doctor Hub', icon: LayoutDashboard },
          { id: 'patients', label: 'My Patients', icon: Users },
          { id: 'appointments', label: 'Appointments', icon: Calendar },
        ];
      case 'patient':
        return [
          { id: 'dashboard', label: 'Patient Home', icon: LayoutDashboard },
          { id: 'history', label: 'Medical History', icon: ClipboardList },
          { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
          { id: 'appointments', label: 'Appointments', icon: Calendar },
          { id: 'profile', label: 'My Profile', icon: UserIcon },
        ];
      default:
        return [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }];
    }
  };

  const navItems = getNavItems(currentUser.role);

  const handleNavClick = (id: string) => {
    setCurrentNav(id);
    setSelectedPatientId(null);
    setMobileMenuOpen(false);
  };

  const roleColors: Record<UserRole, { badge: string; text: string }> = {
    admin: { badge: 'bg-slate-100 text-slate-700', text: 'Administrator' },
    nurse: { badge: 'bg-teal-50 text-teal-700', text: 'Registered Nurse' },
    doctor: { badge: 'bg-sky-50 text-sky-700', text: 'Physician' },
    patient: { badge: 'bg-indigo-50 text-indigo-700', text: 'Patient' },
  };

  const content = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold shrink-0 shadow-xs">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-900 tracking-tight leading-none">
                MediVault
              </span>
              <span className="text-[11px] text-slate-500 font-medium mt-0.5">
                Clinical Healthcare
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed((prev) => !prev)}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden p-1 rounded-md text-slate-400 hover:text-slate-600"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Role Indicator Banner */}
      {!sidebarCollapsed && (
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Active Portal
            </span>
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                roleColors[currentUser.role].badge
              }`}
            >
              {roleColors[currentUser.role].text}
            </span>
          </div>
        </div>
      )}

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              title={sidebarCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-sky-700' : 'text-slate-400'
                }`}
              />
              {!sidebarCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/40">
        <div
          className={`flex items-center gap-3 p-2 rounded-lg ${
            sidebarCollapsed ? 'justify-center' : ''
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-semibold text-xs shrink-0">
            {currentUser.name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')}
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {currentUser.name}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                {currentUser.title}
              </p>
            </div>
          )}
        </div>

        {/* Quick logout action */}
        {!sidebarCollapsed && (
          <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500 px-1">
            <button
              onClick={() => {
                showToast('Signed out of session. Switched to Admin.', 'info');
                switchRole('admin');
              }}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
            <span className="text-[10px] text-slate-400">v2.4 Clean</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-200 ${
          sidebarCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        <div
          className={`fixed top-0 bottom-0 left-0 z-30 transition-all duration-200 ${
            sidebarCollapsed ? 'w-16' : 'w-60'
          }`}
        >
          {content}
        </div>
      </aside>

      {/* Mobile Drawer Backdrop & Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] h-full bg-white shadow-xl z-50">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
