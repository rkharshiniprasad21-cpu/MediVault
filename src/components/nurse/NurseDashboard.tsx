import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { RegisterPatientModal } from './RegisterPatientModal';
import { AssignDoctorModal } from './AssignDoctorModal';
import { PatientDetailModal } from '../common/PatientDetailModal';
import { ScheduleAppointmentModal } from '../appointments/ScheduleAppointmentModal';
import {
  UserPlus,
  UserCheck,
  Search,
  Eye,
  Calendar,
  Clock,
  ArrowRight,
  Stethoscope,
  HeartPulse,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Patient } from '../../types';

export const NurseDashboard: React.FC = () => {
  const { patients, staff, currentNav, setCurrentNav, assignDoctorToPatient, showToast } = useApp();

  // Modals
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignPatientId, setAssignPatientId] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Unassigned' | 'Assigned'>('All');

  // Quick 3-step assignment form state right on the dashboard for extreme ease of use
  const [quickStepPatientId, setQuickStepPatientId] = useState<string>('');
  const [quickStepDoctorId, setQuickStepDoctorId] = useState<string>('');
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);

  const doctors = staff.filter((s) => s.role === 'doctor');
  const unassignedPatients = patients.filter((p) => p.assignmentStatus === 'Unassigned');

  // Auto-select first unassigned patient and first doctor
  React.useEffect(() => {
    if (!quickStepPatientId && unassignedPatients.length > 0) {
      setQuickStepPatientId(unassignedPatients[0].id);
    } else if (!quickStepPatientId && patients.length > 0) {
      setQuickStepPatientId(patients[0].id);
    }
    if (!quickStepDoctorId && doctors.length > 0) {
      setQuickStepDoctorId(doctors[0].id);
    }
  }, [patients, unassignedPatients, doctors, quickStepPatientId, quickStepDoctorId]);

  const handleQuickAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickStepPatientId || !quickStepDoctorId) return;

    const success = assignDoctorToPatient(quickStepPatientId, quickStepDoctorId);
    if (success) {
      setAssignmentSuccess(true);
      setTimeout(() => setAssignmentSuccess(false), 3000);
    }
  };

  const handleOpenAssignModal = (patientId: string) => {
    setAssignPatientId(patientId);
    setAssignModalOpen(true);
  };

  // Filter patients
  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.assignedDoctorName && p.assignedDoctorName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      filterStatus === 'All' ? true : p.assignmentStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Today's appointments
  const allAppointments = patients.flatMap((p) => p.appointments);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Triage Summary */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Triage Intake & Patient Assignment Station
            </h2>
            <p className="text-xs text-slate-500">
              {unassignedPatients.length > 0
                ? `${unassignedPatients.length} patient(s) waiting for physician assignment`
                : 'All current triage patients are assigned to physicians'}
            </p>
          </div>
        </div>

        {/* Prominent "Register Patient" Button */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => setRegisterModalOpen(true)}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Patient</span>
          </button>
          <button
            onClick={() => handleOpenAssignModal('')}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2.5 text-sm font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/60 rounded-lg transition-colors"
          >
            <UserCheck className="w-4 h-4" />
            <span>Assign Doctor</span>
          </button>
        </div>
      </div>

      {/* 3-Step Doctor Assignment Card (Explicitly spotlighted as per prompt) */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Assign Doctor to Patient (3-Step Quick Process)
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Updates doctor's dashboard instantly
          </span>
        </div>

        {assignmentSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs font-medium text-emerald-800 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Doctor assignment confirmed successfully! The patient has been added to the doctor's active patient list.
            </span>
          </div>
        )}

        <form onSubmit={handleQuickAssign} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Step 1: Select a patient */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                1
              </span>
              <span>Step 1: Select Patient</span>
            </label>
            <select
              value={quickStepPatientId}
              onChange={(e) => setQuickStepPatientId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.patientId}) — {p.assignmentStatus}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Select a doctor from dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                2
              </span>
              <span>Step 2: Select Doctor</span>
            </label>
            <select
              value={quickStepDoctorId}
              onChange={(e) => setQuickStepDoctorId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.specialty}
                </option>
              ))}
            </select>
          </div>

          {/* Step 3: Click "Confirm Assignment" */}
          <div className="md:col-span-2 flex items-center gap-2">
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Step 3: Confirm Assignment</span>
            </button>
            <span className="text-[11px] text-slate-400 hidden lg:inline">
              No page reload needed
            </span>
          </div>
        </form>
      </div>

      {/* Main Patient Table (Section 5 requirements) */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Header & Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Patients List
            </h3>
            <p className="text-xs text-slate-500">
              Overview of all registered patients, triage status, and assigned physicians
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1">
              {(['All', 'Unassigned', 'Assigned'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    filterStatus === st
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Required 5 Columns: Patient Name, Patient ID, Assignment Status, Assigned Doctor, Action */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-3">Patient ID</th>
                <th className="py-3 px-3">Assignment Status</th>
                <th className="py-3 px-3">Assigned Doctor</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">
                    No patients found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">
                        {patient.name}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {patient.age} yrs · {patient.gender}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {patient.patientId}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={patient.assignmentStatus} size="sm" />
                    </td>
                    <td className="py-3 px-3">
                      {patient.assignedDoctorName ? (
                        <span className="font-medium text-slate-900">
                          {patient.assignedDoctorName}
                        </span>
                      ) : (
                        <span className="text-amber-600 font-medium">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedPatient(patient)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleOpenAssignModal(patient.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                            patient.assignmentStatus === 'Unassigned'
                              ? 'text-white bg-sky-600 hover:bg-sky-700 shadow-xs'
                              : 'text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/60'
                          }`}
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>{patient.assignmentStatus === 'Unassigned' ? 'Assign' : 'Reassign'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Today's Appointments Section */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Today's Clinic Appointments & Consultations
            </h3>
          </div>
          <button
            onClick={() => setScheduleModalOpen(true)}
            className="text-xs font-semibold text-sky-600 hover:text-sky-800 transition-colors"
          >
            + New Appointment
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {allAppointments.length === 0 ? (
            <p className="col-span-3 text-center py-6 text-xs text-slate-400">
              No appointments scheduled for today.
            </p>
          ) : (
            allAppointments.map((apt) => (
              <div
                key={apt.id}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2 hover:bg-white hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    {apt.patientName}
                  </span>
                  <StatusBadge status={apt.status} size="sm" />
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{apt.date} at {apt.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                    <span>{apt.doctorName}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate pt-1 border-t border-slate-200/60">
                    {apt.reason} · Room: {apt.room}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      <RegisterPatientModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
      />

      <AssignDoctorModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        preselectedPatientId={assignPatientId}
      />

      <PatientDetailModal
        patient={selectedPatient}
        isOpen={Boolean(selectedPatient)}
        onClose={() => setSelectedPatient(null)}
        onOpenAssignDoctor={handleOpenAssignModal}
      />

      <ScheduleAppointmentModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
      />
    </div>
  );
};
