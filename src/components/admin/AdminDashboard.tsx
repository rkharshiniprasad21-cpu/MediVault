import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { PatientDetailModal } from '../common/PatientDetailModal';
import { AssignDoctorModal } from '../nurse/AssignDoctorModal';
import { RegisterPatientModal } from '../nurse/RegisterPatientModal';
import { ScheduleAppointmentModal } from '../appointments/ScheduleAppointmentModal';
import { AddStaffModal } from './AddStaffModal';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Users,
  Stethoscope,
  HeartPulse,
  UserCheck,
  Search,
  Plus,
  Eye,
  Trash2,
  Calendar,
  FileText,
  Activity,
  ArrowRight,
  Filter,
  CheckCircle2,
  Download,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { Patient, StaffMember } from '../../types';

export const AdminDashboard: React.FC = () => {
  const {
    patients,
    staff,
    activities,
    currentNav,
    setCurrentNav,
    deletePatient,
    cancelAppointment,
    showToast,
  } = useApp();

  // Modals
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignPatientId, setAssignPatientId] = useState<string | null>(null);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [addStaffModalOpen, setAddStaffModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Assigned' | 'Unassigned'>('All');
  const [staffRoleFilter, setStaffRoleFilter] = useState<'All' | 'doctor' | 'nurse'>('All');

  // Stats calculation
  const totalPatients = patients.length;
  const totalDoctors = staff.filter((s) => s.role === 'doctor').length;
  const totalNurses = staff.filter((s) => s.role === 'nurse').length;
  const unassignedPatients = patients.filter((p) => p.assignmentStatus === 'Unassigned').length;

  // Filtered patients
  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.assignedDoctorName && p.assignedDoctorName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === 'All' ? true : p.assignmentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered staff
  const filteredStaff = staff.filter((s) => {
    if (staffRoleFilter === 'All') return true;
    return s.role === staffRoleFilter;
  });

  // Collect all appointments across patients
  const allAppointments = patients.flatMap((p) => p.appointments);

  const handleOpenAssign = (patientId: string) => {
    setAssignPatientId(patientId);
    setAssignModalOpen(true);
  };

  const handleExportReport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Patient ID,Name,Age,Gender,Status,Assigned Doctor,Admission Date']
        .concat(
          patients.map(
            (p) =>
              `"${p.patientId}","${p.name}","${p.age}","${p.gender}","${p.assignmentStatus}","${
                p.assignedDoctorName || 'None'
              }","${p.admissionDate}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `medivault_patient_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Facility report downloaded as CSV', 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* If currentNav is 'dashboard', show the 4 summary cards & overview */}
      {currentNav === 'dashboard' && (
        <>
          {/* Section 4: Four Primary Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Patients */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Patients
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                  {totalPatients}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Active in registry
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {/* Card 2: Total Doctors */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Doctors
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                  {totalDoctors}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Specialists & GPs
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Stethoscope className="w-5 h-5" />
              </div>
            </div>

            {/* Card 3: Total Nurses */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Nurses
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                  {totalNurses}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Triage & Inpatient
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <HeartPulse className="w-5 h-5" />
              </div>
            </div>

            {/* Card 4: Unassigned Patients */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Unassigned Patients
                </p>
                <p className="text-2xl font-bold text-amber-600 mt-1 tabular-nums">
                  {unassignedPatients}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {unassignedPatients > 0 ? 'Requires attention' : 'All assigned'}
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Quick Actions
                </h3>
                <p className="text-xs text-slate-500">
                  Immediate administrative operations
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setRegisterModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Patient</span>
                </button>
                <button
                  onClick={() => handleOpenAssign('')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/60 rounded-lg transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Assign Doctor</span>
                </button>
                <button
                  onClick={() => setScheduleModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Schedule Appointment</span>
                </button>
                <button
                  onClick={() => setAddStaffModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Staff</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Grid: Recent Patients & Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Recent Patients */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Recent Patients</h3>
                  <p className="text-xs text-slate-500">
                    Latest admitted and registered patients
                  </p>
                </div>
                <button
                  onClick={() => setCurrentNav('patients')}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 transition-colors"
                >
                  <span>View All ({patients.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-4">Patient</th>
                      <th className="py-2.5 px-3">Patient ID</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Assigned Doctor</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patients.slice(0, 5).map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {p.name}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-500">
                          {p.patientId}
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge status={p.assignmentStatus} size="sm" />
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          {p.assignedDoctorName || (
                            <button
                              onClick={() => handleOpenAssign(p.id)}
                              className="text-amber-600 hover:underline font-medium text-[11px]"
                            >
                              Assign now
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedPatient(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right 1 Col: Recent Activities */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Recent Activities</h3>
                <span className="text-[11px] text-slate-400">Live feed</span>
              </div>
              <div className="mt-3 flex-1 overflow-y-auto space-y-3">
                {activities.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    No recent activities
                  </p>
                ) : (
                  activities.slice(0, 5).map((act) => (
                    <div
                      key={act.id}
                      className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">
                          {act.action}
                        </span>
                        <span className="text-[10px] text-slate-400 tabular-nums">
                          {act.timestamp}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-snug">{act.details}</p>
                      <p className="text-[10px] text-slate-400">By {act.userName}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* VIEW: PATIENTS LIST (Search, Filters, Management) */}
      {currentNav === 'patients' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                All Registered Patients
              </h2>
              <p className="text-xs text-slate-500">
                Complete clinical records, assignments, and patient profiles
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRegisterModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register Patient</span>
              </button>
            </div>
          </div>

          {/* Search & Filters Bar */}
          <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search patient, ID, doctor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto text-xs">
              <span className="text-slate-500 text-[11px] font-medium mr-1">
                Filter Status:
              </span>
              {(['All', 'Assigned', 'Unassigned'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    statusFilter === st
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-3">Patient ID</th>
                  <th className="py-3 px-3">Age / Gender</th>
                  <th className="py-3 px-3">Blood Type</th>
                  <th className="py-3 px-3">Assignment Status</th>
                  <th className="py-3 px-3">Assigned Doctor</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                      No patients match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block">
                          {p.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {p.phone}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {p.patientId}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {p.age} yrs · {p.gender}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700">
                        {p.bloodType}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={p.assignmentStatus} size="sm" />
                      </td>
                      <td className="py-3 px-3">
                        {p.assignedDoctorName ? (
                          <span className="font-medium text-slate-900">
                            {p.assignedDoctorName}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleOpenAssign(p.id)}
                            className="text-amber-600 hover:underline font-semibold text-[11px]"
                          >
                            Assign Doctor
                          </button>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedPatient(p)}
                            className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-md transition-colors"
                            title="View patient record"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenAssign(p.id)}
                            className="p-1.5 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors"
                            title="Assign or reassign doctor"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(p.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Remove patient"
                          >
                            <Trash2 className="w-4 h-4" />
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
      )}

      {/* VIEW: STAFF DIRECTORY */}
      {currentNav === 'staff' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Staff Directory</h2>
              <p className="text-xs text-slate-500">
                Hospital physicians, specialists, nurses, and administrative team
              </p>
            </div>
            <button
              onClick={() => setAddStaffModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Staff Member</span>
            </button>
          </div>

          <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Role Filter:</span>
            {(['All', 'doctor', 'nurse'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setStaffRoleFilter(r)}
                className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                  staffRoleFilter === r
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {r === 'All' ? 'All Roles' : `${r}s`}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
            {filteredStaff.map((member) => (
              <div
                key={member.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{member.name}</h3>
                    <p className="text-xs text-sky-700 font-medium">
                      {member.specialty || member.department}
                    </p>
                  </div>
                  <StatusBadge status={member.status} size="sm" />
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <p className="flex justify-between">
                    <span className="text-slate-400">Department:</span>
                    <span className="font-medium text-slate-800">{member.department}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="text-slate-700">{member.email}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400">Phone:</span>
                    <span className="font-mono text-slate-700">{member.phone}</span>
                  </p>
                  {member.role === 'doctor' && (
                    <p className="flex justify-between pt-1 border-t border-slate-100 text-slate-900 font-medium">
                      <span>Assigned Patients:</span>
                      <span className="tabular-nums font-bold text-sky-700">
                        {member.activePatientsCount || 0}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: ASSIGNMENTS */}
      {currentNav === 'assignments' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Physician Assignments
              </h2>
              <p className="text-xs text-slate-500">
                Match each patient with their dedicated attending doctor
              </p>
            </div>
            <button
              onClick={() => handleOpenAssign('')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>New Assignment</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-3">Patient ID</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Assigned Physician</th>
                  <th className="py-3 px-3">Triage Nurse</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {p.name}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">
                      {p.patientId}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={p.assignmentStatus} size="sm" />
                    </td>
                    <td className="py-3 px-3">
                      {p.assignedDoctorName ? (
                        <span className="font-semibold text-slate-900">
                          {p.assignedDoctorName}
                        </span>
                      ) : (
                        <span className="text-amber-600 font-medium">
                          Awaiting Assignment
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {p.assignedNurseName}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenAssign(p.id)}
                        className="px-3 py-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/60 rounded-lg transition-colors"
                      >
                        {p.assignedDoctorName ? 'Reassign' : 'Assign Doctor'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: APPOINTMENTS */}
      {currentNav === 'appointments' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Facility Schedule & Appointments
              </h2>
              <p className="text-xs text-slate-500">
                Upcoming consultations and clinical visits across all departments
              </p>
            </div>
            <button
              onClick={() => setScheduleModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule Appointment</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-3">Patient</th>
                  <th className="py-3 px-3">Attending Doctor</th>
                  <th className="py-3 px-3">Reason</th>
                  <th className="py-3 px-3">Room / Suite</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      No appointments currently scheduled.
                    </td>
                  </tr>
                ) : (
                  allAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                        {apt.date} · {apt.time}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {apt.patientName}
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {apt.doctorName}
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                        {apt.reason}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {apt.room}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={apt.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        {apt.status === 'Upcoming' && (
                          <button
                            onClick={() => cancelAppointment(apt.patientId, apt.id)}
                            className="text-xs text-rose-600 hover:underline font-medium"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: REPORTS */}
      {currentNav === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Hospital Reports & Analytics
              </h2>
              <p className="text-xs text-slate-500">
                Summaries of admissions, coverage ratios, and physician capacity
              </p>
            </div>
            <button
              onClick={handleExportReport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV Report</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Physician Coverage Rate
              </span>
              <p className="text-3xl font-bold text-slate-900 tabular-nums">
                {totalPatients > 0
                  ? `${Math.round(((totalPatients - unassignedPatients) / totalPatients) * 100)}%`
                  : '100%'}
              </p>
              <p className="text-xs text-slate-500">
                {totalPatients - unassignedPatients} of {totalPatients} patients assigned to an attending physician.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Average Doctor Load
              </span>
              <p className="text-3xl font-bold text-slate-900 tabular-nums">
                {totalDoctors > 0 ? (totalPatients / totalDoctors).toFixed(1) : '0'}
              </p>
              <p className="text-xs text-slate-500">
                Active patients per registered physician.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Scheduled Consultations
              </span>
              <p className="text-3xl font-bold text-slate-900 tabular-nums">
                {allAppointments.length}
              </p>
              <p className="text-xs text-slate-500">
                Active clinic consultations booked.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Patient Detail Modal */}
      <PatientDetailModal
        patient={selectedPatient}
        isOpen={Boolean(selectedPatient)}
        onClose={() => setSelectedPatient(null)}
        onOpenAssignDoctor={handleOpenAssign}
      />

      {/* Assign Doctor Modal */}
      <AssignDoctorModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        preselectedPatientId={assignPatientId}
      />

      {/* Register Patient Modal */}
      <RegisterPatientModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
      />

      {/* Schedule Appointment Modal */}
      <ScheduleAppointmentModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
      />

      {/* Add Staff Modal */}
      <AddStaffModal
        isOpen={addStaffModalOpen}
        onClose={() => setAddStaffModalOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteConfirmId)}
        title="Remove Patient Record"
        message="Are you sure you want to delete this patient record? This action will remove all history, vitals, and prescriptions permanently."
        confirmLabel="Delete Patient"
        danger
        onCancel={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) {
            deletePatient(deleteConfirmId);
            setDeleteConfirmId(null);
          }
        }}
      />
    </div>
  );
};
