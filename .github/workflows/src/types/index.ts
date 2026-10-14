export type UserRole = 'admin' | 'nurse' | 'doctor' | 'patient';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  title: string;
  department?: string;
  avatar?: string;
  patientId?: string; // Links to Patient.id if role is 'patient'
}

export type AssignmentStatus = 'Assigned' | 'Unassigned' | 'Pending';
export type PatientRecordStatus = 'Active' | 'Completed' | 'Pending' | 'Discharged';

export interface Vitals {
  bloodPressure: string;
  heartRate: number;
  temperature: string;
  oxygenLevel: number;
  weight: string;
  lastChecked: string;
}

export interface MedicalRecord {
  id: string;
  date: string;
  doctorName: string;
  doctorRole?: string;
  diagnosis: string;
  notes: string;
  followUpDate?: string;
  severity?: 'Routine' | 'Moderate' | 'Critical';
}

export interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  prescribedBy: string;
  prescribedDate: string;
  status: 'Active' | 'Completed' | 'Pending';
}

export interface TestResult {
  id: string;
  testName: string;
  category: string;
  date: string;
  result: string;
  normalRange: string;
  status: 'Normal' | 'Abnormal' | 'Pending';
  notes?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty?: string;
  date: string;
  time: string;
  reason: string;
  room: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled' | 'In Progress';
}

export interface Patient {
  id: string;
  patientId: string; // PT-2026-001 format
  name: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  bloodType: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  assignedDoctorId: string | null;
  assignedDoctorName: string | null;
  assignedNurseName: string;
  admissionDate: string;
  assignmentStatus: AssignmentStatus;
  status: PatientRecordStatus;
  vitals: Vitals;
  allergies: string[];
  conditions: string[];
  medicalHistory: MedicalRecord[];
  prescriptions: Prescription[];
  testResults: TestResult[];
  appointments: Appointment[];
  notes?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'doctor' | 'nurse' | 'admin';
  specialty?: string;
  department: string;
  email: string;
  phone: string;
  status: 'Active' | 'On Leave';
  activePatientsCount?: number;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  type: 'assignment' | 'registration' | 'record' | 'appointment';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning';
}
