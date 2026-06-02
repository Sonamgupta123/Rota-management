import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_EMPLOYEES,
  INITIAL_SHIFTS,
  INITIAL_OPEN_SHIFTS,
  INITIAL_ATTENDANCE,
  INITIAL_AUDITS,
  INITIAL_VISITORS,
  INITIAL_LEAVE,
  INITIAL_NOTIFICATIONS,
  buildInitialDocuments,
  MANDATORY_DOCS,
  INITIAL_DAY_NOTES
} from '../utils/mockData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Theme state
  const [darkMode, setDarkMode] = useState(true);

  // Auth and session state — restored from localStorage on refresh
  const [isLoggedIn, setIsLoggedInState] = useState(() => {
    return localStorage.getItem('session_active') === 'true';
  });

  // Role and routing navigation state — restored from localStorage
  const [currentRole, setCurrentRoleState] = useState(() => {
    return localStorage.getItem('session_role') || 'Admin';
  });
  const [currentView, setCurrentViewState] = useState(() => {
    return localStorage.getItem('session_view') || 'dashboard';
  });

  // Wrapper setters that also persist to localStorage
  const setIsLoggedIn = (val) => {
    if (val) {
      localStorage.setItem('session_active', 'true');
    } else {
      // Clear entire session on logout
      localStorage.removeItem('session_active');
      localStorage.removeItem('session_role');
      localStorage.removeItem('session_view');
    }
    setIsLoggedInState(val);
  };

  const setCurrentView = (view) => {
    localStorage.setItem('session_view', view);
    setCurrentViewState(view);
  };

  // Data state
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [documents, setDocuments] = useState(buildInitialDocuments(INITIAL_EMPLOYEES));
  const [shifts, setShifts] = useState(INITIAL_SHIFTS);
  const [openShifts, setOpenShifts] = useState(INITIAL_OPEN_SHIFTS);
  const [attendance, setAttendance] = useState(INITIAL_ATTENDANCE);
  const [audits, setAudits] = useState(INITIAL_AUDITS);
  const [visitors, setVisitors] = useState(INITIAL_VISITORS);
  const [leave, setLeave] = useState(INITIAL_LEAVE);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [dayNotes, setDayNotes] = useState(INITIAL_DAY_NOTES);

  // Active Employee state (used when role is Employee)
  const [activeEmployeeId, setActiveEmployeeId] = useState('EMP-002');
  
  // Live employee Clock tracker state
  const [clockState, setClockState] = useState({
    status: 'Clocked Out',
    timeIn: null,
    breakStart: null,
    totalBreaks: 0,
    timer: 0
  });

  // Global state for onboarding modal view, used to conditionally hide layout
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);

  // Load theme preference on start
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Sync theme changes
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  // Switch role — persists role
  const handleRoleChange = (role) => {
    localStorage.setItem('session_role', role);
    setCurrentRoleState(role);
  };

  // Add shift assignment helper
  const addShift = (day, type, employeeId, role) => {
    // Basic Rota Compliance validation
    // Rule 1: 12-Hour Rest Check
    const employeeShifts = shifts.filter(s => s.employeeId === employeeId && s.day === day);
    if (employeeShifts.length > 0) {
      alert(`⚠️ Rota Compliance Alert: ${employees.find(e => e.id === employeeId)?.name} already has a shift assigned on ${day}. Doubling shifts is flagged for rest periods!`);
    }

    // Rule 2: 6-Day Work Rule
    const totalWeeklyShifts = shifts.filter(s => s.employeeId === employeeId).length;
    if (totalWeeklyShifts >= 6) {
      alert(`⚠️ Safety Alert: ${employees.find(e => e.id === employeeId)?.name} has worked ${totalWeeklyShifts} shifts this week. Maximum safe working standard is 6 consecutive days.`);
    }

    // Rule 3: Approved Leave Check
    const dates = {
      "Monday": "2026-06-01",
      "Tuesday": "2026-06-02",
      "Wednesday": "2026-06-03",
      "Thursday": "2026-06-04",
      "Friday": "2026-06-05",
      "Saturday": "2026-06-06",
      "Sunday": "2026-06-07"
    };
    const dateStr = dates[day];
    if (dateStr && leave) {
      const leaveOnDay = leave.find(l => 
        l.employeeId === employeeId && 
        l.status === 'Approved' && 
        dateStr >= l.start && 
        dateStr <= l.end
      );
      if (leaveOnDay) {
        alert(`⚠️ Rota Compliance Alert: ${employees.find(e => e.id === employeeId)?.name} is on approved leave (${leaveOnDay.type}) on ${day} (${dateStr})!`);
      }
    }

    const newShift = {
      id: `S-${Date.now()}`,
      employeeId,
      day,
      type,
      role
    };

    setShifts(prev => [...prev, newShift]);
    addNotification('info', `Shift assigned to ${employees.find(e => e.id === employeeId)?.name} on ${day} (${type})`);
  };

  // Remove shift assignment
  const removeShift = (shiftId) => {
    const shift = shifts.find(s => s.id === shiftId);
    if (shift) {
      const empName = employees.find(e => e.id === shift.employeeId)?.name;
      setShifts(prev => prev.filter(s => s.id !== shiftId));
      addNotification('warning', `Cancelled shift for ${empName} on ${shift.day} (${shift.type})`);
    }
  };

  // Claim Open Shift helper
  const claimOpenShift = (openShiftId, employeeId) => {
    const openShift = openShifts.find(os => os.id === openShiftId);
    const emp = employees.find(e => e.id === employeeId);
    
    if (openShift && emp) {
      // Compliance Validations:
      // 12-Hour Rest Check on that day
      const sameDayShifts = shifts.filter(s => s.employeeId === employeeId && s.day === openShift.day);
      if (sameDayShifts.length > 0) {
        alert(`❌ Compliance Warning: You are already assigned a shift on ${openShift.day}. The 12-hour mandatory rest rule prevents you from claiming this.`);
        return false;
      }
      
      // 6-Day consecutive work check
      const weeklyShiftsCount = shifts.filter(s => s.employeeId === employeeId).length;
      if (weeklyShiftsCount >= 6) {
        alert(`❌ Safety Rest Warning: You have already scheduled 6 shifts this week. Standard healthcare compliance protects you against working 7 consecutive days.`);
        return false;
      }

      // Approved Leave check on that day
      const dates = {
        "Monday": "2026-06-01",
        "Tuesday": "2026-06-02",
        "Wednesday": "2026-06-03",
        "Thursday": "2026-06-04",
        "Friday": "2026-06-05",
        "Saturday": "2026-06-06",
        "Sunday": "2026-06-07"
      };
      const dateStr = dates[openShift.day];
      if (dateStr && leave) {
        const leaveOnDay = leave.find(l => 
          l.employeeId === employeeId && 
          l.status === 'Approved' && 
          dateStr >= l.start && 
          dateStr <= l.end
        );
        if (leaveOnDay) {
          alert(`❌ Compliance Warning: You are on approved leave (${leaveOnDay.type}) on ${openShift.day} (${dateStr}). You cannot claim shifts on this day.`);
          return false;
        }
      }

      // Add to shifts
      addShift(openShift.day, openShift.type, employeeId, openShift.role);
      // Remove from open shifts
      setOpenShifts(prev => prev.filter(os => os.id !== openShiftId));
      addNotification('success', `${emp.name} successfully claimed Open Shift for ${openShift.day} (${openShift.type})`);
      return true;
    }
    return false;
  };

  // Create Open Shift helper
  const createOpenShift = (day, type, role, reason) => {
    const newOpen = {
      id: `OS-${Date.now()}`,
      day,
      type,
      role,
      reason: reason || "Operational demand requirement"
    };
    setOpenShifts(prev => [...prev, newOpen]);
    addNotification('alert', `New Open Shift created: ${day} (${type}) for ${role}`);
  };

  // Notifications system helper
  const addNotification = (type, text) => {
    const newNotif = {
      id: `N-${Date.now()}`,
      type, // 'alert', 'info', 'warning', 'success'
      text,
      time: "Just now",
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Mark all notifications as read
  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Clock operations helpers
  const handleClockIn = (employeeId, location = "Oakfield care home", locationMeta = null) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toISOString().split('T')[0];

    // Determine status (Late after 08:05 AM)
    let status = "On Time";
    const minutes = now.getMinutes();
    const hours = now.getHours();
    if (hours > 8 || (hours === 8 && minutes > 5)) {
      status = "Late";
    }

    const newLog = {
      id: `A-${Date.now()}`,
      employeeId,
      date: dateString,
      clockIn: timeString,
      clockOut: 'Pending',
      breaks: [],
      status,
      location, // Log location from clock-in event
      latitude: locationMeta?.lat || null,
      longitude: locationMeta?.lng || null,
      geofenceStatus: locationMeta?.status || null,
      distance: locationMeta?.distance || null,
      accuracy: locationMeta?.accuracy || null
    };

    setAttendance(prev => [newLog, ...prev]);
    setClockState({
      status: 'Clocked In',
      timeIn: timeString,
      breakStart: null,
      totalBreaks: 0,
      timer: 0,
      location,
      latitude: locationMeta?.lat || null,
      longitude: locationMeta?.lng || null,
      geofenceStatus: locationMeta?.status || null,
      distance: locationMeta?.distance || null,
      accuracy: locationMeta?.accuracy || null
    });
    
    const geofenceText = locationMeta ? ` (Geofence: ${locationMeta.status}, ${locationMeta.lat}, ${locationMeta.lng})` : "";
    addNotification('success', `${employees.find(e => e.id === employeeId)?.name} clocked in at ${timeString} from ${location}${geofenceText}`);
  };

  const handleStartBreak = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setClockState(prev => ({
      ...prev,
      status: 'On Break',
      breakStart: timeString
    }));
  };

  const handleEndBreak = (employeeId) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add break interval to the active attendance record
    const dateString = now.toISOString().split('T')[0];
    setAttendance(prev => {
      return prev.map(log => {
        if (log.employeeId === employeeId && log.date === dateString && log.clockOut === 'Pending') {
          return {
            ...log,
            breaks: [...log.breaks, { start: clockState.breakStart, end: timeString }]
          };
        }
        return log;
      });
    });

    // Mock duration addition of 30 mins
    setClockState(prev => ({
      ...prev,
      status: 'Clocked In',
      breakStart: null,
      totalBreaks: prev.totalBreaks + 30
    }));
  };

  const handleClockOut = (employeeId) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toISOString().split('T')[0];

    setAttendance(prev => {
      return prev.map(log => {
        if (log.employeeId === employeeId && log.date === dateString && log.clockOut === 'Pending') {
          return {
            ...log,
            clockOut: timeString
          };
        }
        return log;
      });
    });

    setClockState(prev => ({
      ...prev,
      status: 'Clocked Out',
      timeIn: null,
      breakStart: null,
      timer: 0
    }));
    addNotification('info', `${employees.find(e => e.id === employeeId)?.name} clocked out at ${timeString}`);
  };

  // Visitor sign-in
  const registerVisitor = (name, company, phone, purpose, visitingPerson) => {
    const now = new Date();
    const timeString = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newVisitor = {
      id: `VIS-${Date.now()}`,
      name,
      company,
      phone,
      purpose,
      visitingPerson,
      clockIn: timeString,
      clockOut: 'Still Inside',
      status: 'Currently Inside'
    };

    setVisitors(prev => [newVisitor, ...prev]);
    addNotification('info', `Visitor registered at Reception: ${name} (${company})`);
  };

  // Visitor check-out
  const checkoutVisitor = (visitorId) => {
    const now = new Date();
    const timeString = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setVisitors(prev => prev.map(vis => {
      if (vis.id === visitorId) {
        return {
          ...vis,
          clockOut: timeString,
          status: 'Signed Out'
        };
      }
      return vis;
    }));
    
    const visitor = visitors.find(v => v.id === visitorId);
    if (visitor) {
      addNotification('info', `Visitor checked out: ${visitor.name}`);
    }
  };

  // Document Checklist Verifications (Amber/Red/Green status switching)
  const updateDocumentStatus = (employeeId, docName, field, value) => {
    setDocuments(prev => {
      const userDocs = prev[employeeId] || [];
      const updatedDocs = userDocs.map(doc => {
        if (doc.name === docName) {
          const newDoc = { ...doc, [field]: value };
          
          // Re-evaluate signatures
          if (field === 'uploadStatus' && value === 'Uploaded') {
            newDoc.employeeSignature = 'E-Signed';
            newDoc.complianceIndicator = 'Amber'; // Needs verify
          }
          if (field === 'verifiedStatus' && value === 'Verified') {
            newDoc.managerSignature = 'Verified By Manager';
            newDoc.complianceIndicator = 'Green';
          }
          if (field === 'verifiedStatus' && value === 'Needs Verification') {
            newDoc.managerSignature = 'Pending Verification';
            newDoc.complianceIndicator = 'Amber';
          }
          if (field === 'uploadStatus' && value === 'Pending') {
            newDoc.employeeSignature = 'Pending Signature';
            newDoc.managerSignature = 'Pending Verification';
            newDoc.verifiedStatus = 'Needs Verification';
            newDoc.complianceIndicator = 'Red';
          }

          return newDoc;
        }
        return doc;
      });
      
      return {
        ...prev,
        [employeeId]: updatedDocs
      };
    });

    const empName = employees.find(e => e.id === employeeId)?.name;
    addNotification('info', `Document "${docName}" updated for ${empName}`);
  };

  // Onboarding direct helper
  const onboardEmployee = (empData) => {
    const newEmpId = `EMP-0${employees.length + 1}`;
    const newEmp = {
      id: newEmpId,
      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120",
      ...empData,
      status: "Active"
    };

    // Add employee
    setEmployees(prev => [...prev, newEmp]);
    
    // Build initial empty documents checklists (Red status) for new employees
    setDocuments(prev => {
      const newDocsList = MANDATORY_DOCS.map(doc => ({
        name: doc,
        uploadStatus: "Pending",
        verifiedStatus: "Needs Verification",
        expiryDate: "N/A",
        employeeSignature: "Pending Signature",
        managerSignature: "Pending Verification",
        complianceIndicator: "Red"
      }));
      return {
        ...prev,
        [newEmpId]: newDocsList
      };
    });

    addNotification('success', `New Employee successfully onboarded: ${newEmp.name} (${newEmp.title})`);
  };

  // Audits submit helper
  const submitAuditResult = (auditId, score, details = null) => {
    setAudits(prev => prev.map(aud => {
      if (aud.id === auditId) {
        return {
          ...aud,
          status: 'Completed',
          lastCompleted: new Date().toISOString().split('T')[0],
          score: score,
          details: details || aud.details
        };
      }
      return aud;
    }));

    const audit = audits.find(a => a.id === auditId);
    if (audit) {
      addNotification('success', `${audit.type} successfully completed. Compliance score scored: ${score}%`);
    }
  };

  // Schedule new compliance audit reactively
  const scheduleAudit = (type, date, officerId) => {
    const newAudit = {
      id: `AUD-${Math.floor(100 + Math.random() * 900)}`,
      type,
      scheduledDate: date,
      officerId,
      status: 'Pending',
      lastCompleted: 'Never',
      score: null
    };
    setAudits(prev => [newAudit, ...prev]);
    addNotification('info', `New care audit scheduled: ${type} for ${date}`);
  };

  // Leave operations helpers
  const applyLeaveRequest = (employeeId, leaveData) => {
    const newLeave = {
      id: `LV-${Date.now()}`,
      employeeId,
      status: 'Pending',
      ...leaveData
    };

    setLeave(prev => [newLeave, ...prev]);
    addNotification('info', `New Leave Request pending review from ${employees.find(e => e.id === employeeId)?.name}`);
  };

  const approveLeaveRequest = (leaveId) => {
    setLeave(prev => prev.map(l => {
      if (l.id === leaveId) {
        return { ...l, status: 'Approved' };
      }
      return l;
    }));
    
    const request = leave.find(l => l.id === leaveId);
    if (request) {
      addNotification('success', `Holiday Request APPROVED for ${employees.find(e => e.id === request.employeeId)?.name}`);
    }
  };

  const rejectLeaveRequest = (leaveId) => {
    setLeave(prev => prev.map(l => {
      if (l.id === leaveId) {
        return { ...l, status: 'Rejected' };
      }
      return l;
    }));

    const request = leave.find(l => l.id === leaveId);
    if (request) {
      addNotification('warning', `Holiday Request REJECTED for ${employees.find(e => e.id === request.employeeId)?.name}`);
    }
  };

  // Helper to update employee details
  const updateEmployee = (id, updatedData) => {
    setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, ...updatedData } : emp));
    addNotification('success', `Employee details updated successfully`);
  };

  // Helper to add custom employee document
  const addEmployeeDocument = (employeeId, docName) => {
    setDocuments(prev => {
      const userDocs = prev[employeeId] || [];
      const newDoc = {
        name: docName,
        uploadStatus: "Uploaded",
        verifiedStatus: "Verified",
        expiryDate: "2028-12-31",
        employeeSignature: "E-Signed",
        managerSignature: "Verified By Manager",
        complianceIndicator: "Green",
        owner: "You",
        added: "Just now"
      };
      return {
        ...prev,
        [employeeId]: [newDoc, ...userDocs]
      };
    });
    addNotification('success', `Document "${docName}" uploaded successfully`);
  };

  // Day Notes helpers
  const addDayNote = (day, noteData) => {
    const now = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedDate = `${String(now.getDate()).padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newNote = {
      id: `DN-${Date.now()}`,
      day,
      ...noteData,
      createdDate: formattedDate
    };
    setDayNotes(prev => [...prev, newNote]);
    addNotification('info', `New Day Note added for ${day}: "${noteData.title}"`);
  };

  const editDayNote = (noteId, updatedData) => {
    const now = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedDate = `${String(now.getDate()).padStart(2, '0')} ${months[now.getMonth()]} ${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setDayNotes(prev => prev.map(note => {
      if (note.id === noteId) {
        return {
          ...note,
          ...updatedData,
          updatedDate: formattedDate
        };
      }
      return note;
    }));
    addNotification('info', `Day Note updated: "${updatedData.title}"`);
  };

  const deleteDayNote = (noteId) => {
    const note = dayNotes.find(n => n.id === noteId);
    if (note) {
      setDayNotes(prev => prev.filter(n => n.id !== noteId));
      addNotification('warning', `Deleted Day Note for ${note.day}: "${note.title}"`);
    }
  };

  return (
    <AppContext.Provider value={{
      darkMode,
      toggleDarkMode,
      isLoggedIn,
      setIsLoggedIn,
      currentRole,
      setCurrentRole: handleRoleChange,
      currentView,
      setCurrentView,
      
      employees,
      documents,
      shifts,
      openShifts,
      attendance,
      audits,
      visitors,
      leave,
      notifications,
      dayNotes,
      
      activeEmployeeId,
      setActiveEmployeeId,
      clockState,
      setClockState,
      isOnboardModalOpen,
      setIsOnboardModalOpen,
      
      // Operations actions
      addShift,
      removeShift,
      claimOpenShift,
      createOpenShift,
      markAllNotificationsRead,
      handleClockIn,
      handleClockOut,
      handleStartBreak,
      handleEndBreak,
      registerVisitor,
      checkoutVisitor,
      updateDocumentStatus,
      onboardEmployee,
      submitAuditResult,
      scheduleAudit,
      applyLeaveRequest,
      approveLeaveRequest,
      rejectLeaveRequest,
      updateEmployee,
      addEmployeeDocument,
      addDayNote,
      editDayNote,
      deleteDayNote
    }}>
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
