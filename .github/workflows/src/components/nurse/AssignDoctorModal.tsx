import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, UserCheck, Stethoscope, CheckCircle2 } from 'lucide-react';

interface AssignDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPatientId?: string | null;
}

export const AssignDoctorModal: React.FC<AssignDoctorModalProps> = ({
  isOpen,
  onClose,
  preselectedPatientId,
}) => {
  const { patients, staff, assignDoctorToPatient } = useApp();

  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [successState, setSuccessState] = useState<boolean>(false);

  useEffect(() => {
    if (preselectedPatientId) {
      setSelectedPatientId(preselectedPatientId);
    } else {
      // Default to first unassigned patient if any
      const unassigned = patients.find((p) => p.assignmentStatus === 'Unassigned');
      if (unassigned) {
        setSelectedPatientId(unassigned.id);
      } else if (patients.length > 0) {
        setSelectedPatientId(patients[0].id);
      }
    }
  }, [preselectedPatientId, isOpen, patients]);

  const doctors = staff.filter((s) => s.role === 'doctor');

  useEffect(() => {
    if (doctors.length > 0 && !selectedDoctorId) {
      setSelectedDoctorId(doctors[0].id);
    }
  }, [doctors, selectedDoctorId]);

  if (!isOpen) return null;

  const currentSelectedPatient = patients.find((p) => p.id === selectedPatientId);
  const currentSelectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  const handleConfirmAssignment = () => {
    if (!selectedPatientId || !selectedDoctorId) return;

    const ok = assignDoctorToPatient(selectedPatientId, selectedDoctorId);
    if (ok) {
      setSuccessState(true);
      setTimeout(() => {
        setSuccessState(false);
        onClose();
      }, 1400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Assign Doctor
              </h2>
              <p className="text-xs text-slate-500">
                Connect patient directly with an attending physician
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Splash */}
        {successState ? (
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Assignment Confirmed!
            </h3>
            <p className="text-xs text-slate-600 max-w-xs">
              {currentSelectedPatient?.name} is now assigned to{' '}
              {currentSelectedDoctor?.name}. The physician dashboard has been updated.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* 3 Simple Steps */}

            {/* Step 1: Select Patient */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center justify-center">
                    1
                  </span>
                  Select Patient
                </label>
                {currentSelectedPatient?.assignmentStatus === 'Unassigned' && (
                  <span className="text-[11px] text-amber-600 font-medium">
                    Currently Unassigned
                  </span>
                )}
              </div>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.patientId}) — {p.assignmentStatus}
                    {p.assignedDoctorName ? ` (Dr: ${p.assignedDoctorName})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Select Doctor */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center justify-center">
                  2
                </span>
                Select Doctor
              </label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.specialty} ({d.department})
                  </option>
                ))}
              </select>
            </div>

            {/* Summary Preview Box */}
            {currentSelectedPatient && currentSelectedDoctor && (
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient:</span>
                  <span className="font-semibold text-slate-900">
                    {currentSelectedPatient.name} ({currentSelectedPatient.patientId})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigning To:</span>
                  <span className="font-semibold text-sky-700">
                    {currentSelectedDoctor.name} ({currentSelectedDoctor.specialty})
                  </span>
                </div>
              </div>
            )}

            {/* Step 3: Confirm Assignment Button */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAssignment}
                className="px-5 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors flex items-center gap-2"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Confirm Assignment</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
