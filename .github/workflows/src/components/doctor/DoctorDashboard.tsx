import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { PatientDetailModal } from '../common/PatientDetailModal';
import {
  Users,
  Calendar,
  Clock,
  Search,
  FileText,
  Plus,
  Stethoscope,
  Activity,
  Heart,
  Eye,
  CheckCircle2,
  AlertCircle,
  Pill,
} from 'lucide-react';
import { Patient } from '../../types';

export const DoctorDashboard: React.FC = () => {
  const {
    currentUser,
    patients,
    addMedicalRecord,
    showToast,
  } = useApp();

  // Selected patient for modal
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Quick "Add Medical Record" modal state
  const [quickRecordPatient, setQuickRecordPatient] = useState<Patient | null>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Doctor-specific filtering: "Display only patients currently assigned to the logged-in doctor"
  const myPatients = patients.filter(
    (p) => p.assignedDoctorId === currentUser.id
  );

  // Filtered list with search
  const filteredMyPatients = myPatients.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.patientId.toLowerCase().includes(q) ||
      p.conditions.some((c) => c.toLowerCase().includes(q))
    );
  });

  // Today's appointments for this doctor
  const myAppointments = myPatients
    .flatMap((p) => p.appointments)
    .filter((a) => a.doctorId === currentUser.id);

  // Pending reviews: patients with abnormal tests or recent admission
  const pendingReviews = myPatients.filter(
    (p) =>
      p.testResults.some((t) => t.status === 'Abnormal' || t.status === 'Pending') ||
      p.medicalHistory.length === 0
  );

  const handleSaveQuickRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickRecordPatient || !diagnosis.trim() || !notes.trim()) return;

    addMedicalRecord(quickRecordPatient.id, {
      diagnosis: diagnosis.trim(),
      notes: notes.trim(),
      followUpDate: followUpDate || undefined,
      severity: 'Routine',
    });

    setDiagnosis('');
    setNotes('');
    setFollowUpDate('');
    setQuickRecordPatient(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Doctor Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Welcome back, {currentUser.name}
            </h2>
            <p className="text-xs text-slate-500">
              {currentUser.title} · {currentUser.department}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {myPatients.length > 0 && (
            <button
              onClick={() => setQuickRecordPatient(myPatients[0])}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Medical Record</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 Focused Summary Metrics: My Patients, Today's Appointments, Pending Reviews */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: My Patients */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              My Patients
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
              {myPatients.length}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Currently assigned to your care
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Today's Appointments */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Today's Appointments
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
              {myAppointments.length}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Consultations scheduled
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Pending Reviews */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Reviews
            </p>
            <p className="text-2xl font-bold text-amber-600 mt-1 tabular-nums">
              {pendingReviews.length}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Awaiting lab or intake review
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Section: My Patients List & Search */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Header & Search */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">My Patients</h3>
            <p className="text-xs text-slate-500">
              Only patients currently assigned to you are displayed here
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, ID, condition..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
          </div>
        </div>

        {/* Patient Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-3">Patient ID</th>
                <th className="py-3 px-3">Age / Gender</th>
                <th className="py-3 px-3">Blood Type</th>
                <th className="py-3 px-3">Latest Vitals</th>
                <th className="py-3 px-3">Active Diagnosis / Condition</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMyPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 px-4 text-slate-400">
                    <div className="max-w-md mx-auto text-center space-y-2">
                      <Stethoscope className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-sm font-semibold text-slate-700">
                        No assigned patients found
                      </p>
                      <p className="text-xs text-slate-500">
                        {searchQuery
                          ? 'No patients matched your search query.'
                          : 'When a nurse or administrator assigns a patient to your care, they will immediately appear here.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMyPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 block">
                        {patient.name}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Admitted: {patient.admissionDate}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-600">
                      {patient.patientId}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">
                      {patient.age} yrs · {patient.gender}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-700">
                      {patient.bloodType}
                    </td>
                    <td className="py-3.5 px-3 text-slate-700">
                      <span className="font-medium">{patient.vitals.bloodPressure}</span>
                      <span className="text-slate-400 text-[11px] block">
                        {patient.vitals.heartRate} bpm
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-slate-800 font-medium">
                        {patient.conditions[0] || 'Routine intake'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setQuickRecordPatient(patient)}
                          className="px-2.5 py-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/60 rounded-md transition-colors"
                          title="Add clinical consultation note"
                        >
                          + Record
                        </button>
                        <button
                          onClick={() => setSelectedPatient(patient)}
                          className="px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Record</span>
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

      {/* Today's Appointments List */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Today's Consultation Schedule
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {myAppointments.length} visit(s) scheduled
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {myAppointments.length === 0 ? (
            <p className="col-span-3 text-center py-6 text-xs text-slate-400">
              No appointments scheduled for today.
            </p>
          ) : (
            myAppointments.map((apt) => (
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
                    <span>{apt.time} ({apt.date})</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate pt-1 border-t border-slate-200/60">
                    Reason: {apt.reason} · Room: {apt.room}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Patient Detail Modal (Organized into 4 tabs: Overview, Medical History, Prescriptions, Test Results) */}
      <PatientDetailModal
        patient={selectedPatient}
        isOpen={Boolean(selectedPatient)}
        onClose={() => setSelectedPatient(null)}
      />

      {/* Quick Add Medical Record Dialog */}
      {quickRecordPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Add Medical Record
                </h3>
                <p className="text-xs text-slate-500">
                  For {quickRecordPatient.name} ({quickRecordPatient.patientId})
                </p>
              </div>
              <button
                onClick={() => setQuickRecordPatient(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuickRecord} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Clinical Diagnosis *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hypertension Re-assessment, Acute Sinusitis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Physician Notes & Clinical Assessment *
                </label>
                <textarea
                  rows={4}
                  placeholder="Record patient complaints, exam findings, assessment, and treatment plan..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Follow-up Date (Optional)
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setQuickRecordPatient(null)}
                  className="px-4 py-2 text-xs text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
