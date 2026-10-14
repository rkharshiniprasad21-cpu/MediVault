import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Menu,
  Bell,
  Check,
  ChevronDown,
  User as UserIcon,
  Shield,
  Stethoscope,
  HeartPulse,
} from 'lucide-react';
import { UserRole } from '../../types';

export const Header: React.FC = () => {
  const {
    currentUser,
    allUsers,
    switchUser,
    switchRole,
    currentNav,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    setMobileMenuOpen,
  } = useApp();

  const [notifOpen, setNotifOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setRoleSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = () => {
    switch (currentNav) {
      case 'dashboard':
        if (currentUser.role === 'admin') return 'Hospital Administration';
        if (currentUser.role === 'nurse') return 'Triage & Nurse Station';
        if (currentUser.role === 'doctor') return 'Physician Clinical Hub';
        return 'Patient Health Portal';
      case 'patients':
        return currentUser.role === 'doctor' ? 'My Assigned Patients' : 'Patient Management';
      case 'staff':
        return 'Medical Staff Directory';
      case 'assignments':
        return 'Physician Assignments';
      case 'appointments':
        return 'Appointments & Schedule';
      case 'reports':
        return 'Clinical & Facility Reports';
      case 'history':
        return 'My Medical History';
      case 'prescriptions':
        return 'Current Prescriptions';
      case 'profile':
        return 'Patient Profile';
      default:
        return 'MediVault';
    }
  };

  const roleIcons: Record<UserRole, React.ElementType> = {
    admin: Shield,
    nurse: HeartPulse,
    doctor: Stethoscope,
    patient: UserIcon,
  };

  const CurrentRoleIcon = roleIcons[currentUser.role] || UserIcon;

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Trigger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <h1 className="text-base md:text-lg font-bold text-slate-900 tracking-tight leading-tight">
            {getPageTitle()}
          </h1>
          <span className="text-xs text-slate-500 hidden sm:inline">
            MediVault Clinic System
          </span>
        </div>
      </div>

      {/* Right: Role Switcher & Notifications & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Role Switcher Pill / Selector */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setRoleSwitcherOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
            title="Switch User Role to test different interfaces"
          >
            <CurrentRoleIcon className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span className="hidden sm:inline">Portal:</span>
            <span className="capitalize text-slate-900">{currentUser.role}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {roleSwitcherOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 border-b border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Active Role
                </p>
                <p className="text-xs text-slate-500">
                  Select any profile to experience the role workflow:
                </p>
              </div>

              <div className="py-1">
                {allUsers.map((u) => {
                  const Icon = roleIcons[u.role];
                  const isCurrent = currentUser.id === u.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setRoleSwitcherOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs transition-colors ${
                        isCurrent
                          ? 'bg-sky-50 text-sky-900 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
                            isCurrent
                              ? 'bg-sky-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate">
                          <p className="truncate font-medium">{u.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {u.title}
                          </p>
                        </div>
                      </div>
                      {isCurrent && (
                        <Check className="w-4 h-4 text-sky-600 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((prev) => !prev)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-[11px] bg-sky-100 text-sky-800 font-semibold px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-[11px] text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                        !notif.read ? 'bg-sky-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-slate-900 leading-snug">
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {notif.timestamp}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Mini Avatar */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200">
            {currentUser.name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-900 leading-tight">
              {currentUser.name}
            </p>
            <p className="text-[11px] text-slate-500 capitalize">
              {currentUser.role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
