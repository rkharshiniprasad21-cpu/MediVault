import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Patient,
  StaffMember,
  ActivityLog,
  AppNotification,
  MedicalRecord,
  Prescription,
  TestResult,
  Appointment,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_STAFF,
  INITIAL_PATIENTS,
  INITIAL_ACTIVITIES,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';

interface ToastData {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface AppContextType {
  currentUser: User;
  allUsers: User[];
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  patients: Patient[];
  staff: StaffMember[];
  activities: ActivityLog[];
  notifications: AppNotification[];
  currentNav: string;
  setCurrentNav: (nav: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (v: boolean) => void;
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
  toasts: ToastData[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;

  // Actions
  registerPatient: (data: {
    name: string;
    age: number;
    gender: 'Female' | 'Male' | 'Other';
    bloodType: string;
    phone: string;
    email: string;
    address: string;
    emergencyContact: { name: string; relationship: string; phone: string };
    allergies: string[];
    conditions: string[];
    initialDiagnosis?: string;
    assignedDoctorId?: string;
  }) => Patient;
  assignDoctorToPatient: (patientId: string, doctorId: string) => boolean;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  addMedicalRecord: (
    patientId: string,
    record: { diagnosis: string; notes: string; followUpDate?: string; severity?: 'Routine' | 'Moderate' | 'Critical' }
  ) => void;
  addPrescription: (
    patientId: string,
    rx: { medication: string; dosage: string; frequency: string; duration: string; instructions: string }
  ) => void;
  addTestResult: (
    patientId: string,
    test: { testName: string; category: string; result: string; normalRange: string; status: 'Normal' | 'Abnormal' | 'Pending'; notes?: string }
  ) => void;
  scheduleAppointment: (appointment: {
    patientId: string;
    doctorId: string;
    date: string;
    time: string;
    reason: string;
    room?: string;
  }) => void;
  cancelAppointment: (patientId: string, appointmentId: string) => void;
  addStaffMember: (member: Omit<StaffMember, 'id'>) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  resetSampleData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'medivault_south_indian_v4_users',
  CURRENT_USER_ID: 'medivault_south_indian_v4_user_id',
  PATIENTS: 'medivault_south_indian_v4_patients',
  STAFF: 'medivault_south_indian_v4_staff',
  ACTIVITIES: 'medivault_south_indian_v4_activities',
  NOTIFICATIONS: 'medivault_south_indian_v4_notifications',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (saved) {
      const found = INITIAL_USERS.find((u) => u.id === saved);
      if (found) return found;
    }
    return INITIAL_USERS[0]; // Admin by default
  });

  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_PATIENTS;
      }
    }
    return INITIAL_PATIENTS;
  });

  const [staff, setStaff] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STAFF);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_STAFF;
      }
    }
    return INITIAL_STAFF;
  });

  const [activities, setActivities] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_ACTIVITIES;
      }
    }
    return INITIAL_ACTIVITIES;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_NOTIFICATIONS;
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [currentNav, setCurrentNav] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastData[]>([]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUser.id);
  }, [currentUser]);

  // Reset tab to dashboard on role change
  const switchUser = (userId: string) => {
    const found = allUsers.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      setCurrentNav('dashboard');
      setSelectedPatientId(null);
      showToast(`Switched account to ${found.name} (${found.title})`, 'info');
    }
  };

  const switchRole = (role: UserRole) => {
    const found = allUsers.find((u) => u.role === role);
    if (found) {
      setCurrentUser(found);
      setCurrentNav('dashboard');
      setSelectedPatientId(null);
      showToast(`Switched role to ${role.toUpperCase()}: ${found.name}`, 'info');
    }
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Register Patient
  const registerPatient = (data: {
    name: string;
    age: number;
    gender: 'Female' | 'Male' | 'Other';
    bloodType: string;
    phone: string;
    email: string;
    address: string;
    emergencyContact: { name: string; relationship: string; phone: string };
    allergies: string[];
    conditions: string[];
    initialDiagnosis?: string;
    assignedDoctorId?: string;
  }): Patient => {
    const nextNumber = patients.length + 1;
    const formattedId = `PT-2026-${String(nextNumber).padStart(3, '0')}`;
    const newId = `pat-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    let doctorName: string | null = null;
    let assignmentStatus: 'Assigned' | 'Unassigned' = 'Unassigned';

    if (data.assignedDoctorId) {
      const assignedDoc = staff.find((s) => s.id === data.assignedDoctorId);
      if (assignedDoc) {
        doctorName = assignedDoc.name;
        assignmentStatus = 'Assigned';
      }
    }

    const newPatient: Patient = {
      id: newId,
      patientId: formattedId,
      name: data.name,
      age: data.age,
      gender: data.gender,
      bloodType: data.bloodType,
      phone: data.phone,
      email: data.email,
      address: data.address,
      emergencyContact: data.emergencyContact,
      assignedDoctorId: data.assignedDoctorId || null,
      assignedDoctorName: doctorName,
      assignedNurseName: currentUser.role === 'nurse' ? currentUser.name : 'Revathi Srinivasan',
      admissionDate: today,
      assignmentStatus,
      status: 'Active',
      vitals: {
        bloodPressure: '120/80',
        heartRate: 72,
        temperature: '98.6°F',
        oxygenLevel: 98,
        weight: '70 kg',
        lastChecked: 'Just now',
      },
      allergies: data.allergies.length > 0 ? data.allergies : ['None recorded'],
      conditions: data.conditions.length > 0 ? data.conditions : ['Routine intake'],
      medicalHistory: data.initialDiagnosis
        ? [
            {
              id: `rec-${Date.now()}`,
              date: today,
              doctorName: currentUser.name,
              diagnosis: data.initialDiagnosis,
              notes: 'Initial clinical intake assessment conducted upon admission.',
              severity: 'Routine',
            },
          ]
        : [],
      prescriptions: [],
      testResults: [],
      appointments: [],
    };

    setPatients((prev) => [newPatient, ...prev]);

    // Update staff active count if assigned
    if (data.assignedDoctorId) {
      setStaff((prev) =>
        prev.map((s) =>
          s.id === data.assignedDoctorId
            ? { ...s, activePatientsCount: (s.activePatientsCount || 0) + 1 }
            : s
        )
      );
    }

    // Add activity log
    const newActivity: ActivityLog = {
      id: `act-${Date.now()}`,
      timestamp: 'Just now',
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Registered New Patient',
      details: `Registered ${data.name} (${formattedId})${
        doctorName ? ` and assigned to ${doctorName}` : ' to Triage queue'
      }`,
      type: 'registration',
    };
    setActivities((prev) => [newActivity, ...prev]);

    showToast(`Patient ${data.name} (${formattedId}) successfully registered!`, 'success');
    return newPatient;
  };

  // Assign Doctor to Patient (Immediate cross-role reactivity)
  const assignDoctorToPatient = (patientId: string, doctorId: string): boolean => {
    const doctor = staff.find((s) => s.id === doctorId);
    if (!doctor) {
      showToast('Doctor not found in staff registry', 'error');
      return false;
    }

    const patient = patients.find((p) => p.id === patientId || p.patientId === patientId);
    if (!patient) {
      showToast('Patient not found', 'error');
      return false;
    }

    const previousDoctorId = patient.assignedDoctorId;

    // Update patient
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patient.id) {
          return {
            ...p,
            assignedDoctorId: doctor.id,
            assignedDoctorName: doctor.name,
            assignmentStatus: 'Assigned',
          };
        }
        return p;
      })
    );

    // Update staff counts
    setStaff((prev) =>
      prev.map((s) => {
        if (s.id === doctor.id) {
          return { ...s, activePatientsCount: (s.activePatientsCount || 0) + 1 };
        }
        if (previousDoctorId && s.id === previousDoctorId) {
          return { ...s, activePatientsCount: Math.max(0, (s.activePatientsCount || 1) - 1) };
        }
        return s;
      })
    );

    // Activity log
    const newActivity: ActivityLog = {
      id: `act-${Date.now()}`,
      timestamp: 'Just now',
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Assigned Physician',
      details: `Assigned ${doctor.name} (${doctor.specialty || 'General'}) to ${patient.name} (${patient.patientId})`,
      type: 'assignment',
    };
    setActivities((prev) => [newActivity, ...prev]);

    // Notification
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Doctor Assignment Confirmed',
      message: `${patient.name} (${patient.patientId}) assigned to ${doctor.name}.`,
      timestamp: 'Just now',
      read: false,
      type: 'success',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast(`Assigned ${patient.name} to ${doctor.name}`, 'success');
    return true;
  };

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    showToast('Patient records updated successfully', 'success');
  };

  const deletePatient = (id: string) => {
    const patientToDelete = patients.find((p) => p.id === id);
    if (patientToDelete) {
      setPatients((prev) => prev.filter((p) => p.id !== id));
      if (selectedPatientId === id) setSelectedPatientId(null);
      showToast(`Patient ${patientToDelete.name} removed from system`, 'info');
    }
  };

  const addMedicalRecord = (
    patientId: string,
    record: { diagnosis: string; notes: string; followUpDate?: string; severity?: 'Routine' | 'Moderate' | 'Critical' }
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const newRecord: MedicalRecord = {
      id: `rec-${Date.now()}`,
      date: today,
      doctorName: currentUser.name,
      doctorRole: currentUser.title,
      diagnosis: record.diagnosis,
      notes: record.notes,
      followUpDate: record.followUpDate,
      severity: record.severity || 'Routine',
    };

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId || p.patientId === patientId) {
          return {
            ...p,
            medicalHistory: [newRecord, ...p.medicalHistory],
          };
        }
        return p;
      })
    );

    const targetPatient = patients.find((p) => p.id === patientId || p.patientId === patientId);
    if (targetPatient) {
      setActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          timestamp: 'Just now',
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'Added Medical Record',
          details: `Diagnosis: ${record.diagnosis} for ${targetPatient.name} (${targetPatient.patientId})`,
          type: 'record',
        },
        ...prev,
      ]);
    }

    showToast('Medical record added successfully', 'success');
  };

  const addPrescription = (
    patientId: string,
    rx: { medication: string; dosage: string; frequency: string; duration: string; instructions: string }
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const newRx: Prescription = {
      id: `rx-${Date.now()}`,
      medication: rx.medication,
      dosage: rx.dosage,
      frequency: rx.frequency,
      duration: rx.duration,
      instructions: rx.instructions,
      prescribedBy: currentUser.name,
      prescribedDate: today,
      status: 'Active',
    };

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId || p.patientId === patientId) {
          return {
            ...p,
            prescriptions: [newRx, ...p.prescriptions],
          };
        }
        return p;
      })
    );

    showToast(`Prescribed ${rx.medication} ${rx.dosage}`, 'success');
  };

  const addTestResult = (
    patientId: string,
    test: { testName: string; category: string; result: string; normalRange: string; status: 'Normal' | 'Abnormal' | 'Pending'; notes?: string }
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const newTest: TestResult = {
      id: `test-${Date.now()}`,
      testName: test.testName,
      category: test.category,
      date: today,
      result: test.result,
      normalRange: test.normalRange,
      status: test.status,
      notes: test.notes,
    };

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId || p.patientId === patientId) {
          return {
            ...p,
            testResults: [newTest, ...p.testResults],
          };
        }
        return p;
      })
    );

    showToast(`Test result recorded for ${test.testName}`, 'success');
  };

  const scheduleAppointment = (data: {
    patientId: string;
    doctorId: string;
    date: string;
    time: string;
    reason: string;
    room?: string;
  }) => {
    const targetPatient = patients.find((p) => p.id === data.patientId || p.patientId === data.patientId);
    const targetDoctor = staff.find((s) => s.id === data.doctorId);

    if (!targetPatient) {
      showToast('Patient not found', 'error');
      return;
    }

    const docName = targetDoctor ? targetDoctor.name : (targetPatient.assignedDoctorName || 'Attending Physician');
    const docSpecialty = targetDoctor?.specialty || 'General Practice';

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      patientId: targetPatient.id,
      patientName: targetPatient.name,
      doctorId: data.doctorId,
      doctorName: docName,
      doctorSpecialty: docSpecialty,
      date: data.date,
      time: data.time,
      reason: data.reason,
      room: data.room || 'Consultation Room 104',
      status: 'Upcoming',
    };

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === targetPatient.id) {
          return {
            ...p,
            appointments: [newAppointment, ...p.appointments],
          };
        }
        return p;
      })
    );

    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        timestamp: 'Just now',
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'Scheduled Appointment',
        details: `${targetPatient.name} with ${docName} on ${data.date} at ${data.time}`,
        type: 'appointment',
      },
      ...prev,
    ]);

    showToast(`Appointment scheduled for ${targetPatient.name}`, 'success');
  };

  const cancelAppointment = (patientId: string, appointmentId: string) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          return {
            ...p,
            appointments: p.appointments.map((a) =>
              a.id === appointmentId ? { ...a, status: 'Cancelled' as const } : a
            ),
          };
        }
        return p;
      })
    );
    showToast('Appointment cancelled', 'info');
  };

  const addStaffMember = (member: Omit<StaffMember, 'id'>) => {
    const newStaff: StaffMember = {
      ...member,
      id: `staff-${Date.now()}`,
      activePatientsCount: 0,
    };
    setStaff((prev) => [...prev, newStaff]);
    showToast(`Staff member ${member.name} added to ${member.department}`, 'success');
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    showToast('All notifications cleared', 'info');
  };

  const resetSampleData = () => {
    setPatients(INITIAL_PATIENTS);
    setStaff(INITIAL_STAFF);
    setActivities(INITIAL_ACTIVITIES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrentUser(INITIAL_USERS[0]);
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(INITIAL_PATIENTS));
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(INITIAL_STAFF));
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, INITIAL_USERS[0].id);
    showToast('Reset to official South Indian hospital sample data.', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        switchUser,
        switchRole,
        patients,
        staff,
        activities,
        notifications,
        currentNav,
        setCurrentNav,
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileMenuOpen,
        setMobileMenuOpen,
        selectedPatientId,
        setSelectedPatientId,
        toasts,
        showToast,
        removeToast,
        registerPatient,
        assignDoctorToPatient,
        updatePatient,
        deletePatient,
        addMedicalRecord,
        addPrescription,
        addTestResult,
        scheduleAppointment,
        cancelAppointment,
        addStaffMember,
        markNotificationRead,
        clearAllNotifications,
        resetSampleData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
