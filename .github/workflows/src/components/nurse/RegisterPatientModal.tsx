import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, UserPlus, AlertCircle } from 'lucide-react';

interface RegisterPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegisterPatientModal: React.FC<RegisterPatientModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { registerPatient, staff } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Female' as 'Female' | 'Male' | 'Other',
    bloodType: 'O+',
    phone: '',
    email: '',
    address: '',
    emergencyName: '',
    emergencyRel: 'Spouse',
    emergencyPhone: '',
    allergies: '',
    conditions: '',
    initialDiagnosis: '',
    assignedDoctorId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const doctors = staff.filter((s) => s.role === 'doctor');

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.age || Number(formData.age) <= 0 || Number(formData.age) > 130) {
      newErrors.age = 'Enter a valid age (1-130)';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.emergencyName.trim()) newErrors.emergencyName = 'Emergency contact is required';
    if (!formData.emergencyPhone.trim()) newErrors.emergencyPhone = 'Emergency phone is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    registerPatient({
      name: formData.name.trim(),
      age: Number(formData.age),
      gender: formData.gender,
      bloodType: formData.bloodType,
      phone: formData.phone.trim(),
      email: formData.email.trim() || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@medivault.in`,
      address: formData.address.trim() || 'Anna Salai, Chennai, Tamil Nadu 600002',
      emergencyContact: {
        name: formData.emergencyName.trim(),
        relationship: formData.emergencyRel,
        phone: formData.emergencyPhone.trim(),
      },
      allergies: formData.allergies
        ? formData.allergies.split(',').map((s) => s.trim()).filter(Boolean)
        : ['None recorded'],
      conditions: formData.conditions
        ? formData.conditions.split(',').map((s) => s.trim()).filter(Boolean)
        : ['Intake Assessment Pending'],
      initialDiagnosis: formData.initialDiagnosis.trim() || undefined,
      assignedDoctorId: formData.assignedDoctorId || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Register New Patient
              </h2>
              <p className="text-xs text-slate-500">
                Create intake record with contact and initial clinical data
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section 1: Personal Details */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              1. Personal Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Yazhini Selvan or Saravanan Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors ${
                    errors.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                  }`}
                />
                {errors.name && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Age <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    placeholder="e.g. 34"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors ${
                      errors.age ? 'border-rose-400' : 'border-slate-300'
                    }`}
                  />
                  {errors.age && (
                    <p className="text-[11px] text-rose-500 mt-1">{errors.age}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gender: e.target.value as 'Female' | 'Male' | 'Other',
                      })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Blood Group
                </label>
                <select
                  value={formData.bloodType}
                  onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
                >
                  <option value="O+">O positive (O+)</option>
                  <option value="O-">O negative (O-)</option>
                  <option value="A+">A positive (A+)</option>
                  <option value="A-">A negative (A-)</option>
                  <option value="B+">B positive (B+)</option>
                  <option value="B-">B negative (B-)</option>
                  <option value="AB+">AB positive (AB+)</option>
                  <option value="AB-">AB negative (AB-)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="+91 98401 23456"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors ${
                    errors.phone ? 'border-rose-400' : 'border-slate-300'
                  }`}
                />
                {errors.phone && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Emergency */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              2. Emergency Contact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Contact Person <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senthil Kumar"
                  value={formData.emergencyName}
                  onChange={(e) =>
                    setFormData({ ...formData, emergencyName: e.target.value })
                  }
                  className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors ${
                    errors.emergencyName ? 'border-rose-400' : 'border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Relationship
                </label>
                <select
                  value={formData.emergencyRel}
                  onChange={(e) =>
                    setFormData({ ...formData, emergencyRel: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Child">Child</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Emergency Phone <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="+91 98401 99880"
                  value={formData.emergencyPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, emergencyPhone: e.target.value })
                  }
                  className={`w-full px-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors ${
                    errors.emergencyPhone ? 'border-rose-400' : 'border-slate-300'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Clinical Intake & Doctor Assignment */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              3. Clinical Intake & Assignment
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Assigned Attending Doctor (Optional - can be assigned later)
                </label>
                <select
                  value={formData.assignedDoctorId}
                  onChange={(e) =>
                    setFormData({ ...formData, assignedDoctorId: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
                >
                  <option value="">Leave unassigned for triage</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} — {doc.specialty} ({doc.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Known Allergies (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Penicillin, Latex, None"
                    value={formData.allergies}
                    onChange={(e) =>
                      setFormData({ ...formData, allergies: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Chief Complaint / Intake Reason
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chest tightness, Fever, Routine physical"
                    value={formData.initialDiagnosis}
                    onChange={(e) =>
                      setFormData({ ...formData, initialDiagnosis: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors"
            >
              Complete Registration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
