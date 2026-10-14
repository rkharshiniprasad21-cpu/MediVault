import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Patient } from '../../types';
import { StatusBadge } from './StatusBadge';
import {
  X,
  Plus,
  Pill,
  FileText,
  Activity,
  Heart,
  Calendar,
  AlertTriangle,
  Stethoscope,
  Phone,
  UserCheck,
} from 'lucide-react';

interface PatientDetailModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAssignDoctor?: (patientId: string) => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patient,
  isOpen,
  onClose,
  onOpenAssignDoctor,
}) => {
  const {
    currentUser,
    addMedicalRecord,
    addPrescription,
    addTestResult,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'history' | 'prescriptions' | 'tests'
  >('overview');

  // Sub-modal states for adding record, rx, test
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [showAddRx, setShowAddRx] = useState(false);
  const [showAddTest, setShowAddTest] = useState(false);

  // Form states
  const [recordForm, setRecordForm] = useState({
    diagnosis: '',
    notes: '',
    followUpDate: '',
    severity: 'Routine' as 'Routine' | 'Moderate' | 'Critical',
  });

  const [rxForm, setRxForm] = useState({
    medication: '',
    dosage: '',
    frequency: 'Once daily',
    duration: '30 days',
    instructions: '',
  });

  const [testForm, setTestForm] = useState({
    testName: '',
    category: 'Biochemistry',
    result: '',
    normalRange: '',
    status: 'Normal' as 'Normal' | 'Abnormal' | 'Pending',
    notes: '',
  });

  if (!isOpen || !patient) return null;

  const canAddMedicalData = currentUser.role === 'doctor' || currentUser.role === 'admin';

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordForm.diagnosis.trim() || !recordForm.notes.trim()) return;
    addMedicalRecord(patient.id, recordForm);
    setRecordForm({ diagnosis: '', notes: '', followUpDate: '', severity: 'Routine' });
    setShowAddRecord(false);
  };

  const handleSaveRx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxForm.medication.trim() || !rxForm.dosage.trim()) return;
    addPrescription(patient.id, rxForm);
    setRxForm({ medication: '', dosage: '', frequency: 'Once daily', duration: '30 days', instructions: '' });
    setShowAddRx(false);
  };

  const handleSaveTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testForm.testName.trim() || !testForm.result.trim()) return;
    addTestResult(patient.id, testForm);
    setTestForm({ testName: '', category: 'Biochemistry', result: '', normalRange: '', status: 'Normal', notes: '' });
    setShowAddTest(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl max-w-3xl w-full border border-slate-200 shadow-xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-sm shrink-0 border border-sky-200">
              {patient.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{patient.name}</h2>
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {patient.patientId}
                </span>
                <StatusBadge status={patient.assignmentStatus} size="sm" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {patient.age} yrs · {patient.gender} · Blood: {patient.bloodType} · Admitted:{' '}
                {patient.admissionDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUser.role !== 'patient' && onOpenAssignDoctor && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAssignDoctor(patient.id);
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/60 rounded-lg transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Assign Doctor</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-slate-200 gap-1 bg-white shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Medical History</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full">
              {patient.medicalHistory.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'prescriptions'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Prescriptions</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full">
              {patient.prescriptions.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'tests'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Test Results</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full">
              {patient.testResults.length}
            </span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Vitals Strip */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <Activity className="w-4 h-4 text-sky-600" />
                    <span>Current Vital Signs</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Checked {patient.vitals.lastChecked}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Blood Pressure</span>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">
                      {patient.vitals.bloodPressure}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Heart Rate</span>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">
                      {patient.vitals.heartRate} bpm
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Temperature</span>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">
                      {patient.vitals.temperature}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[11px] text-slate-500 block">Oxygen (SpO2)</span>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">
                      {patient.vitals.oxygenLevel}%
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 col-span-2 sm:col-span-1">
                    <span className="text-[11px] text-slate-500 block">Weight</span>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">
                      {patient.vitals.weight}
                    </span>
                  </div>
                </div>
              </div>

              {/* Care Team & Emergency Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Attending Team */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-sky-600" />
                    <span>Care Team</span>
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Attending Physician:</span>
                      <span className="font-semibold text-slate-900">
                        {patient.assignedDoctorName || 'Not yet assigned'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Triage / Ward Nurse:</span>
                      <span className="font-semibold text-slate-900">
                        {patient.assignedNurseName}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Admission Date:</span>
                      <span className="font-mono text-slate-700">
                        {patient.admissionDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-teal-600" />
                    <span>Emergency Contact</span>
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Name:</span>
                      <span className="font-semibold text-slate-900">
                        {patient.emergencyContact.name} ({patient.emergencyContact.relationship})
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Phone:</span>
                      <span className="font-mono text-slate-700">
                        {patient.emergencyContact.phone}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Address:</span>
                      <span className="text-slate-700 truncate max-w-[200px]">
                        {patient.address}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Allergies & Conditions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-rose-200/80 bg-rose-50/20">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 uppercase tracking-wider mb-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Known Allergies</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.allergies.map((alg, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-white text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md font-medium"
                      >
                        {alg}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    <Heart className="w-3.5 h-3.5 text-sky-600" />
                    <span>Active Medical Conditions</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.conditions.map((c, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-medium"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MEDICAL HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Chronological Clinical Entries
                </h3>
                {canAddMedicalData && (
                  <button
                    onClick={() => setShowAddRecord(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Medical Record</span>
                  </button>
                )}
              </div>

              {/* Add Record Form Sub-panel */}
              {showAddRecord && (
                <form
                  onSubmit={handleSaveRecord}
                  className="p-4 border border-sky-200 bg-sky-50/30 rounded-xl space-y-3 animate-in fade-in duration-150"
                >
                  <h4 className="text-xs font-bold text-sky-900">
                    New Clinical Consultation Entry
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Primary Diagnosis / Clinical Focus *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Hypertension Re-assessment"
                        value={recordForm.diagnosis}
                        onChange={(e) =>
                          setRecordForm({ ...recordForm, diagnosis: e.target.value })
                        }
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Recommended Follow-up Date
                      </label>
                      <input
                        type="date"
                        value={recordForm.followUpDate}
                        onChange={(e) =>
                          setRecordForm({ ...recordForm, followUpDate: e.target.value })
                        }
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Physician Notes & Clinical Assessment *
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Enter clinical observations, treatment recommendations, and discussion notes..."
                      value={recordForm.notes}
                      onChange={(e) =>
                        setRecordForm({ ...recordForm, notes: e.target.value })
                      }
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                      required
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddRecord(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg"
                    >
                      Save Clinical Note
                    </button>
                  </div>
                </form>
              )}

              {patient.medicalHistory.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  No medical records logged yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {patient.medicalHistory.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            {rec.diagnosis}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            By {rec.doctorName}
                            {rec.doctorRole ? ` (${rec.doctorRole})` : ''} · {rec.date}
                          </p>
                        </div>
                        {rec.severity && <StatusBadge status={rec.severity} size="sm" />}
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                        {rec.notes}
                      </p>
                      {rec.followUpDate && (
                        <div className="flex items-center gap-1.5 text-[11px] text-sky-700 pt-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Follow-up scheduled: {rec.followUpDate}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PRESCRIPTIONS */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Active & Historical Medications
                </h3>
                {canAddMedicalData && (
                  <button
                    onClick={() => setShowAddRx(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Prescription</span>
                  </button>
                )}
              </div>

              {/* Add Prescription Form */}
              {showAddRx && (
                <form
                  onSubmit={handleSaveRx}
                  className="p-4 border border-sky-200 bg-sky-50/30 rounded-xl space-y-3 animate-in fade-in duration-150"
                >
                  <h4 className="text-xs font-bold text-sky-900">
                    New Medication Order
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Medication Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Amoxicillin"
                        value={rxForm.medication}
                        onChange={(e) =>
                          setRxForm({ ...rxForm, medication: e.target.value })
                        }
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Dosage *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 500mg"
                        value={rxForm.dosage}
                        onChange={(e) =>
                          setRxForm({ ...rxForm, dosage: e.target.value })
                        }
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Frequency
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Twice daily with meals"
                        value={rxForm.frequency}
                        onChange={(e) =>
                          setRxForm({ ...rxForm, frequency: e.target.value })
                        }
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Duration
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 10 days"
                        value={rxForm.duration}
                        onChange={(e) =>
                          setRxForm({ ...rxForm, duration: e.target.value })
                        }
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Patient Instructions
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Finish all pills even if feeling better."
                      value={rxForm.instructions}
                      onChange={(e) =>
                        setRxForm({ ...rxForm, instructions: e.target.value })
                      }
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddRx(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg"
                    >
                      Prescribe Medication
                    </button>
                  </div>
                </form>
              )}

              {patient.prescriptions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  No active prescriptions recorded.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white overflow-hidden">
                  {patient.prescriptions.map((rx) => (
                    <div key={rx.id} className="p-4 space-y-1.5 hover:bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Pill className="w-4 h-4 text-sky-600" />
                          <h4 className="text-sm font-bold text-slate-900">
                            {rx.medication} {rx.dosage}
                          </h4>
                        </div>
                        <StatusBadge status={rx.status} size="sm" />
                      </div>
                      <p className="text-xs text-slate-600">
                        {rx.frequency} · Duration: {rx.duration}
                      </p>
                      {rx.instructions && (
                        <p className="text-xs text-slate-500 italic">
                          "{rx.instructions}"
                        </p>
                      )}
                      <p className="text-[11px] text-slate-400 pt-1">
                        Prescribed by {rx.prescribedBy} on {rx.prescribedDate}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TEST RESULTS */}
          {activeTab === 'tests' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Laboratory & Diagnostic Results
                </h3>
                {canAddMedicalData && (
                  <button
                    onClick={() => setShowAddTest(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Test Result</span>
                  </button>
                )}
              </div>

              {/* Add Test Form */}
              {showAddTest && (
                <form
                  onSubmit={handleSaveTest}
                  className="p-4 border border-sky-200 bg-sky-50/30 rounded-xl space-y-3 animate-in fade-in duration-150"
                >
                  <h4 className="text-xs font-bold text-sky-900">Record Lab Result</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Test Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Serum Creatinine"
                        value={testForm.testName}
                        onChange={(e) =>
                          setTestForm({ ...testForm, testName: e.target.value })
                        }
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Category
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Renal Panel, Hematology"
                        value={testForm.category}
                        onChange={(e) =>
                          setTestForm({ ...testForm, category: e.target.value })
                        }
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Result *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 0.9 mg/dL"
                        value={testForm.result}
                        onChange={(e) =>
                          setTestForm({ ...testForm, result: e.target.value })
                        }
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Normal Range
                      </label>
                      <input
                        type="text"
                        placeholder="0.7 - 1.3 mg/dL"
                        value={testForm.normalRange}
                        onChange={(e) =>
                          setTestForm({ ...testForm, normalRange: e.target.value })
                        }
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Status
                      </label>
                      <select
                        value={testForm.status}
                        onChange={(e) =>
                          setTestForm({
                            ...testForm,
                            status: e.target.value as 'Normal' | 'Abnormal' | 'Pending',
                          })
                        }
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="Normal">Normal</option>
                        <option value="Abnormal">Abnormal</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddTest(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg"
                    >
                      Save Result
                    </button>
                  </div>
                </form>
              )}

              {patient.testResults.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  No laboratory tests recorded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {patient.testResults.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5 hover:border-slate-300"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            {t.testName}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {t.category} · {t.date}
                          </p>
                        </div>
                        <StatusBadge status={t.status} size="sm" />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <div>
                          <span className="text-slate-500 block">Observed Value:</span>
                          <span className="font-semibold text-slate-900 tabular-nums">
                            {t.result}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Standard Reference:</span>
                          <span className="text-slate-700 tabular-nums">
                            {t.normalRange || 'N/A'}
                          </span>
                        </div>
                      </div>
                      {t.notes && (
                        <p className="text-xs text-slate-500 italic mt-1">
                          Note: {t.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            MediVault Electronic Health Record System
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close Record
          </button>
        </div>
      </div>
    </div>
  );
};
