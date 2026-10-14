import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { BookAppointmentModal } from './BookAppointmentModal';
import {
  User as UserIcon,
  Stethoscope,
  Calendar,
  Pill,
  Clock,
  FileText,
  Heart,
  Phone,
  Shield,
  Activity,
  Plus,
  CheckCircle2,
  AlertCircle,
  MapPin,
} from 'lucide-react';
import { Patient, Appointment } from '../../types';

export const PatientDashboard: React.FC = () => {
  const { currentUser, currentNav, setCurrentNav, patients, staff } = useApp();

  const [bookModalOpen, setBookModalOpen] = useState(false);

  // Patient only sees their own data
  const myRecord: Patient | undefined =
    patients.find(
      (p) =>
        p.id === currentUser.patientId ||
        p.name.toLowerCase() === currentUser.name.toLowerCase()
    ) || patients[0];

  const assignedDoctor = staff.find((s) => s.id === myRecord?.assignedDoctorId);

  // Next upcoming appointment
  const nextAppointment: Appointment | undefined = myRecord?.appointments.find(
    (a) => a.status === 'Upcoming'
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Welcome Message & Patient ID Bar */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md">
            Patient Health Portal
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-2">
            Welcome back, {myRecord ? myRecord.name.split(' ')[0] : currentUser.name}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Here is a clear, simple overview of your personal health records and care team.
          </p>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
            <UserIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              Your Patient ID
            </p>
            <p className="text-sm font-bold font-mono text-slate-900">
              {myRecord?.patientId || 'PT-2026-001'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs / Sub-views for Patient */}
      <div className="flex items-center gap-1 bg-white p-1.5 rounded-xl border border-slate-200/80 shadow-xs overflow-x-auto">
        {[
          { id: 'dashboard', label: 'Overview' },
          { id: 'profile', label: 'My Profile' },
          { id: 'history', label: 'Medical History' },
          { id: 'prescriptions', label: 'My Prescriptions' },
          { id: 'appointments', label: 'My Appointments' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentNav(tab.id)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              currentNav === tab.id
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW (Dashboard) */}
      {currentNav === 'dashboard' && (
        <>
          {/* Key Cards: My Doctor & Next Appointment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* My Doctor Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-sky-600" />
                  <h3 className="text-sm font-bold text-slate-900">My Doctor</h3>
                </div>
                <span className="text-xs text-sky-700 bg-sky-50 px-2 py-0.5 rounded font-medium">
                  Primary Physician
                </span>
              </div>

              {myRecord?.assignedDoctorName ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                      Dr
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {myRecord.assignedDoctorName}
                      </h4>
                      <p className="text-xs text-sky-700 font-medium">
                        {assignedDoctor?.specialty || 'General Practice'}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Department: {assignedDoctor?.department || 'Internal Medicine'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Clinic Phone:</span>
                      <span className="font-mono text-slate-800">
                        {assignedDoctor?.phone || '+1 (555) 234-5670'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Clinic Email:</span>
                      <span className="text-slate-800">
                        {assignedDoctor?.email || 'doctor@medivault.clinic'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-2">
                  <p className="text-xs text-amber-700 font-medium">
                    A primary doctor has not been assigned to you yet.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    The nursing triage station will assign your physician shortly.
                  </p>
                </div>
              )}
            </div>

            {/* Next Appointment Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Next Appointment
                  </h3>
                </div>
                <button
                  onClick={() => setBookModalOpen(true)}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-800 transition-colors"
                >
                  + Book Visit
                </button>
              </div>

              {nextAppointment ? (
                <div className="space-y-3">
                  <div className="p-3.5 bg-teal-50/50 border border-teal-100 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        {nextAppointment.reason}
                      </span>
                      <StatusBadge status={nextAppointment.status} size="sm" />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-700">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-teal-600" />
                        {nextAppointment.date}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        {nextAppointment.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 pt-1 border-t border-teal-100/60">
                      Location: {nextAppointment.room} · Physician:{' '}
                      {nextAppointment.doctorName}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <p className="text-xs text-slate-500">
                    You have no upcoming appointments scheduled.
                  </p>
                  <button
                    onClick={() => setBookModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Book an Appointment</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Medical Records Summary */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Recent Medical Records & Notes
                </h3>
              </div>
              <button
                onClick={() => setCurrentNav('history')}
                className="text-xs font-semibold text-sky-600 hover:text-sky-800 transition-colors"
              >
                View Full History
              </button>
            </div>

            {myRecord?.medicalHistory.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-400">
                No medical records available yet.
              </p>
            ) : (
              <div className="space-y-3">
                {myRecord?.medicalHistory.slice(0, 3).map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1.5 hover:bg-white hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">
                        {rec.diagnosis}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {rec.date}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {rec.notes}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Care notes by {rec.doctorName}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* VIEW: MY PROFILE */}
      {currentNav === 'profile' && myRecord && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">Personal Health Profile</h3>
            <p className="text-xs text-slate-500">
              Your registered personal details, contact information, and blood group
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Basic Details
              </span>
              <div className="flex justify-between">
                <span className="text-slate-500">Full Name:</span>
                <span className="font-semibold text-slate-900">{myRecord.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Age:</span>
                <span className="text-slate-800">{myRecord.age} years old</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gender:</span>
                <span className="text-slate-800">{myRecord.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Blood Group:</span>
                <span className="font-bold text-slate-900">{myRecord.bloodType}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Contact & Address
              </span>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-mono text-slate-800">{myRecord.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="text-slate-800">{myRecord.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Home Address:</span>
                <span className="text-slate-800 text-right max-w-[200px]">
                  {myRecord.address}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Emergency Contact
              </span>
              <div className="flex justify-between">
                <span className="text-slate-500">Contact Person:</span>
                <span className="font-semibold text-slate-900">
                  {myRecord.emergencyContact.name} ({myRecord.emergencyContact.relationship})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Emergency Phone:</span>
                <span className="font-mono text-slate-800">
                  {myRecord.emergencyContact.phone}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Known Allergies
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {myRecord.allergies.map((alg, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded font-medium"
                  >
                    {alg}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: MEDICAL HISTORY */}
      {currentNav === 'history' && myRecord && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              Your Complete Medical History
            </h3>
            <p className="text-xs text-slate-500">
              Chronological notes, diagnoses, and care instructions written by your doctors
            </p>
          </div>

          {myRecord.medicalHistory.length === 0 ? (
            <p className="text-center py-8 text-xs text-slate-400">
              No medical history records available.
            </p>
          ) : (
            <div className="space-y-4">
              {myRecord.medicalHistory.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {rec.diagnosis}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Recorded on {rec.date} by {rec.doctorName}
                      </p>
                    </div>
                    {rec.severity && <StatusBadge status={rec.severity} size="sm" />}
                  </div>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg leading-relaxed">
                    {rec.notes}
                  </p>
                  {rec.followUpDate && (
                    <p className="text-[11px] text-sky-700 font-medium">
                      Next suggested visit: {rec.followUpDate}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW: PRESCRIPTIONS */}
      {currentNav === 'prescriptions' && myRecord && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">My Prescriptions</h3>
            <p className="text-xs text-slate-500">
              Current medications, how often to take them, and doctor instructions
            </p>
          </div>

          {myRecord.prescriptions.length === 0 ? (
            <p className="text-center py-8 text-xs text-slate-400">
              You currently have no active prescriptions.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {myRecord.prescriptions.map((rx) => (
                <div key={rx.id} className="p-4 space-y-2 hover:bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Pill className="w-4 h-4 text-sky-600" />
                      <h4 className="text-sm font-bold text-slate-900">
                        {rx.medication} ({rx.dosage})
                      </h4>
                    </div>
                    <StatusBadge status={rx.status} size="sm" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
                    <div>
                      <span className="text-slate-400 block">How Often:</span>
                      <span className="font-semibold text-slate-800">
                        {rx.frequency}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Duration:</span>
                      <span className="text-slate-800">{rx.duration}</span>
                    </div>
                  </div>
                  {rx.instructions && (
                    <p className="text-xs text-slate-600 italic">
                      Special Instructions: "{rx.instructions}"
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400">
                    Prescribed by {rx.prescribedBy} on {rx.prescribedDate}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW: APPOINTMENTS */}
      {currentNav === 'appointments' && myRecord && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                My Appointments
              </h3>
              <p className="text-xs text-slate-500">
                All upcoming and past clinic visits
              </p>
            </div>
            <button
              onClick={() => setBookModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </button>
          </div>

          {myRecord.appointments.length === 0 ? (
            <p className="text-center py-8 text-xs text-slate-400">
              No appointments scheduled.
            </p>
          ) : (
            <div className="space-y-3">
              {myRecord.appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900">
                      {apt.reason}
                    </h4>
                    <StatusBadge status={apt.status} size="sm" />
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-sky-600" />
                      {apt.date}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-slate-800">
                      <Clock className="w-3.5 h-3.5 text-sky-600" />
                      {apt.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                      {apt.doctorName}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {apt.room}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Book Appointment Modal */}
      {myRecord && (
        <BookAppointmentModal
          isOpen={bookModalOpen}
          onClose={() => setBookModalOpen(false)}
          patientId={myRecord.id}
        />
      )}
    </div>
  );
};
