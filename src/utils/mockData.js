// Complete, high-fidelity mock data system for Care Home workforce & compliance

export const INITIAL_EMPLOYEES = [
  {
    id: "EMP-001",
    name: "Sarah Jenkins",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
    dob: "1988-04-12",
    address: "24 Maple Drive, Birmingham, B12 6XY",
    phone: "+44 7700 900077",
    email: "sarah.jenkins@oakfieldcare.co.uk",
    emergencyContact: "David Jenkins (Spouse) - +44 7700 900088",
    title: "Senior Care Assistant",
    role: "Manager", // Manager UI Role
    group: "Care Staff Day",
    manager: "Admin User",
    holidayAllocation: 28,
    startDate: "2021-03-15",
    status: "Active"
  },
  {
    id: "EMP-002",
    name: "James Carter",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
    dob: "1992-08-23",
    address: "107 High Street, Birmingham, B4 7TA",
    phone: "+44 7700 900122",
    email: "james.carter@oakfieldcare.co.uk",
    emergencyContact: "Elena Carter (Mother) - +44 7700 900123",
    title: "Registered Care Nurse",
    role: "Employee",
    group: "Care Staff Day",
    manager: "Sarah Jenkins",
    holidayAllocation: 30,
    startDate: "2022-06-10",
    status: "Active"
  },
  {
    id: "EMP-003",
    name: "Amira Patel",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120",
    dob: "1995-11-02",
    address: "59 Primrose Avenue, Solihull, B91 3RD",
    phone: "+44 7700 900455",
    email: "amira.patel@oakfieldcare.co.uk",
    emergencyContact: "Yousuf Patel (Father) - +44 7700 900456",
    title: "Care Support Worker",
    role: "Employee",
    group: "Care Staff Night",
    manager: "Sarah Jenkins",
    holidayAllocation: 28,
    startDate: "2023-01-20",
    status: "Active"
  },
  {
    id: "EMP-004",
    name: "Thomas McGregor",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120",
    dob: "1980-05-30",
    address: "12 Gorse Lane, Coventry, CV3 5FG",
    phone: "+44 7700 900233",
    email: "thomas.mcgregor@oakfieldcare.co.uk",
    emergencyContact: "Margaret McGregor (Spouse) - +44 7700 900234",
    title: "Head Cook",
    role: "Employee",
    group: "Cook",
    manager: "Sarah Jenkins",
    holidayAllocation: 25,
    startDate: "2019-09-01",
    status: "Active"
  },
  {
    id: "EMP-005",
    name: "Elena Rostova",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120",
    dob: "1990-02-14",
    address: "88 Kings Road, Birmingham, B11 4PR",
    phone: "+44 7700 900611",
    email: "elena.rostova@oakfieldcare.co.uk",
    emergencyContact: "Ivan Rostov (Brother) - +44 7700 900612",
    title: "Domestic Housekeeper",
    role: "Employee",
    group: "Domestic",
    manager: "Sarah Jenkins",
    holidayAllocation: 25,
    startDate: "2023-05-15",
    status: "Active"
  },
  {
    id: "EMP-006",
    name: "Marcus Vance",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120",
    dob: "1975-07-19",
    address: "41 Westbury Croft, Solihull, B90 2PL",
    phone: "+44 7700 900788",
    email: "marcus.vance@oakfieldcare.co.uk",
    emergencyContact: "Patricia Vance (Spouse) - +44 7700 900789",
    title: "Lead Compliance Officer",
    role: "Compliance Officer",
    group: "Care Staff Day",
    manager: "Admin User",
    holidayAllocation: 30,
    startDate: "2020-01-10",
    status: "Active"
  },
  {
    id: "EMP-007",
    name: "Chloe Bennett",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120",
    dob: "1997-09-05",
    address: "15 The Copse, Birmingham, B15 1QQ",
    phone: "+44 7700 900912",
    email: "chloe.bennett@oakfieldcare.co.uk",
    emergencyContact: "Arthur Bennett (Father) - +44 7700 900913",
    title: "Receptionist & Front Desk Office",
    role: "Receptionist",
    group: "Domestic",
    manager: "Sarah Jenkins",
    holidayAllocation: 25,
    startDate: "2022-10-01",
    status: "Active"
  },
  {
    id: "EMP-008",
    name: "Liam O'Connor",
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120",
    dob: "1993-03-27",
    address: "7 Silverwood Way, Birmingham, B29 4AA",
    phone: "+44 7700 900889",
    email: "liam.oconnor@oakfieldcare.co.uk",
    emergencyContact: "Fiona O'Connor (Mother) - +44 7700 900880",
    title: "Junior Care Support",
    role: "Employee",
    group: "Care Staff Day",
    manager: "Sarah Jenkins",
    holidayAllocation: 28,
    startDate: "2024-04-01",
    status: "Active"
  }
];

// List of the 19 required compliance documents
export const MANDATORY_DOCS = [
  "Pension Form",
  "Payroll Form",
  "Right To Work",
  "Employer References",
  "Friend Reference",
  "Application Form",
  "Equal Opportunity Form",
  "Contract",
  "Offer Letter",
  "Interview Letter",
  "Successful Letter",
  "Proof Of Address",
  "Job Description",
  "Interview File",
  "Passport",
  "Birth Certificate",
  "Driving Licence",
  "Induction",
  "ID Verification"
];

// Build initial high-fidelity document state for employees
export const buildInitialDocuments = (employees) => {
  const docsState = {};
  
  employees.forEach((emp) => {
    docsState[emp.id] = MANDATORY_DOCS.map((doc, idx) => {
      // Vary states dynamically to feel populated and alive
      let uploadStatus = "Uploaded";
      let verifiedStatus = "Verified";
      let expiryDate = "2028-12-31";
      
      // Some employees are perfectly compliant, some have missing documents
      if (emp.id === "EMP-008" && idx > 5) {
        uploadStatus = "Pending";
        verifiedStatus = "Needs Verification";
        expiryDate = "N/A";
      } else if (emp.id === "EMP-005" && idx % 7 === 0) {
        uploadStatus = "Pending";
        verifiedStatus = "Needs Verification";
        expiryDate = "N/A";
      } else if (emp.id === "EMP-002" && idx === 2) {
        // Right To Work expiring soon
        uploadStatus = "Uploaded";
        verifiedStatus = "Verified";
        expiryDate = "2026-06-15"; // Expiring in 2 weeks
      } else if (emp.id === "EMP-003" && idx === 14) {
        // Passport expired or expiring soon
        uploadStatus = "Uploaded";
        verifiedStatus = "Verified";
        expiryDate = "2026-05-10"; // Expired
      }
      
      return {
        name: doc,
        uploadStatus,
        verifiedStatus,
        expiryDate,
        employeeSignature: uploadStatus === "Uploaded" ? "E-Signed" : "Pending Signature",
        managerSignature: verifiedStatus === "Verified" ? "Verified By Manager" : "Pending Verification",
        complianceIndicator: uploadStatus === "Pending" 
          ? "Red" 
          : (expiryDate !== "N/A" && new Date(expiryDate) < new Date("2026-06-01")) 
            ? "Red" 
            : (expiryDate !== "N/A" && new Date(expiryDate) < new Date("2026-07-01"))
              ? "Amber"
              : "Green"
      };
    });
  });
  
  return docsState;
};

// Weekly Rota Calendar state (Shift assignment)
// Days: Monday - Sunday
export const INITIAL_SHIFTS = [
  // Monday
  { id: "S-1", employeeId: "EMP-001", day: "Monday", type: "8AM–2PM", role: "Care Staff Day" },
  { id: "S-2", employeeId: "EMP-002", day: "Monday", type: "8AM–2PM", role: "Care Staff Day" },
  { id: "S-3", employeeId: "EMP-008", day: "Monday", type: "8AM–2PM", role: "Care Staff Day" },
  { id: "S-4", employeeId: "EMP-003", day: "Monday", type: "8PM–8AM", role: "Care Staff Night" },
  { id: "S-5", employeeId: "EMP-004", day: "Monday", type: "8AM–8PM", role: "Cook" },
  { id: "S-6", employeeId: "EMP-005", day: "Monday", type: "8AM–2PM", role: "Domestic" },
  
  // Tuesday
  { id: "S-7", employeeId: "EMP-001", day: "Tuesday", type: "8AM–2PM", role: "Care Staff Day" },
  { id: "S-8", employeeId: "EMP-002", day: "Tuesday", type: "8AM–2PM", role: "Care Staff Day" },
  { id: "S-9", employeeId: "EMP-008", day: "Tuesday", type: "8AM–2PM", role: "Care Staff Day" },
  { id: "S-10", employeeId: "EMP-003", day: "Tuesday", type: "8PM–8AM", role: "Care Staff Night" },
  { id: "S-11", employeeId: "EMP-004", day: "Tuesday", type: "8AM–8PM", role: "Cook" },
  { id: "S-12", employeeId: "EMP-005", day: "Tuesday", type: "8AM–2PM", role: "Domestic" },

  // Wednesday
  { id: "S-13", employeeId: "EMP-001", day: "Wednesday", type: "8AM–2PM", role: "Care Staff Day" },
  { id: "S-14", employeeId: "EMP-002", day: "Wednesday", type: "8AM–2PM", role: "Care Staff Day" },
  { id: "S-15", employeeId: "EMP-003", day: "Wednesday", type: "8PM–8AM", role: "Care Staff Night" },
  // Understaffed Wednesday night care (needs 2, has 1)
  { id: "S-16", employeeId: "EMP-004", day: "Wednesday", type: "8AM–8PM", role: "Cook" },
  { id: "S-17", employeeId: "EMP-005", day: "Wednesday", type: "8AM–2PM", role: "Domestic" },

  // Thursday
  { id: "S-18", employeeId: "EMP-001", day: "Thursday", type: "8AM–2PM", role: "Care Staff Day" },
  { id: "S-19", employeeId: "EMP-002", day: "Thursday", type: "8AM–2PM", role: "Care Staff Day" },
  { id: "S-20", employeeId: "EMP-008", day: "Thursday", type: "8AM–2PM", role: "Care Staff Day" },
  { id: "S-21", employeeId: "EMP-003", day: "Thursday", type: "8PM–8AM", role: "Care Staff Night" },
  // Understaffed Thursday Cook (has 0, needs 1)
  { id: "S-22", employeeId: "EMP-005", day: "Thursday", type: "8AM–2PM", role: "Domestic" },

  // Friday
  { id: "S-23", employeeId: "EMP-001", day: "Friday", type: "8AM–2PM", role: "Care Staff Day" },
  { id: "S-24", employeeId: "EMP-002", day: "Friday", type: "8AM–2PM", role: "Care Staff Day" },
  { id: "S-25", employeeId: "EMP-008", day: "Friday", type: "8AM–2PM", role: "Care Staff Day" },
  { id: "S-26", employeeId: "EMP-003", day: "Friday", type: "8PM–8AM", role: "Care Staff Night" },
  // Overstaffed Care Staff Night for trial
  { id: "S-27", employeeId: "EMP-002", day: "Friday", type: "8PM–8AM", role: "Care Staff Night" }, 
  { id: "S-28", employeeId: "EMP-004", day: "Friday", type: "8AM–8PM", role: "Cook" },
  { id: "S-29", employeeId: "EMP-005", day: "Friday", type: "8AM–2PM", role: "Domestic" },

  // Saturday
  { id: "S-30", employeeId: "EMP-001", day: "Saturday", type: "8AM–2PM", role: "Care Staff Day" },
  { id: "S-31", employeeId: "EMP-003", day: "Saturday", type: "8PM–8AM", role: "Care Staff Night" },
  // Understaffed Care Day, Night, Cook on Weekend
  { id: "S-32", employeeId: "EMP-005", day: "Saturday", type: "8AM–2PM", role: "Domestic" },

  // Sunday
  { id: "S-33", employeeId: "EMP-002", day: "Sunday", type: "8AM–2PM", role: "Care Staff Day" },
  { id: "S-34", employeeId: "EMP-003", day: "Sunday", type: "8PM–8AM", role: "Care Staff Night" },
  { id: "S-35", employeeId: "EMP-004", day: "Sunday", type: "8AM–8PM", role: "Cook" },
  { id: "S-36", employeeId: "EMP-005", day: "Sunday", type: "8AM–2PM", role: "Domestic" }
];

export const INITIAL_OPEN_SHIFTS = [
  { id: "OS-1", day: "Wednesday", type: "8PM–8AM", role: "Care Staff Night", reason: "Amira needs assistance" },
  { id: "OS-2", day: "Thursday", type: "8AM–8PM", role: "Cook", reason: "Thomas on leave" },
  { id: "OS-3", day: "Saturday", type: "8AM–2PM", role: "Care Staff Day", reason: "Weekend extra cover" },
  { id: "OS-4", day: "Saturday", type: "8PM–8AM", role: "Care Staff Night", reason: "Standard vacancy" }
];

// Target/Required Staffing configuration
export const STAFF_REQUIREMENTS = {
  "Care Staff Day": 3,
  "Care Staff Night": 2,
  "Cook": 1,
  "Domestic": 1
};

// Shift Type timings representation
export const SHIFT_TIMINGS = {
  "8AM–2PM": "Day early (6 hrs)",
  "2PM–8PM": "Day late (6 hrs)",
  "8AM–8PM": "Full day (12 hrs)",
  "8PM–8AM": "Night shift (12 hrs)"
};

// Attendance logs
export const INITIAL_ATTENDANCE = [
  { id: "A-1", employeeId: "EMP-001", date: "2026-06-01", clockIn: "07:55 AM", clockOut: "02:02 PM", breaks: [{ start: "11:00 AM", end: "11:30 AM" }], status: "On Time", location: "Swan care home", latitude: 52.4862, longitude: -1.8904, geofenceStatus: "Inside", distance: 12, accuracy: "±5 meters" },
  { id: "A-2", employeeId: "EMP-002", date: "2026-06-01", clockIn: "08:15 AM", clockOut: "02:05 PM", breaks: [{ start: "12:00 PM", end: "12:30 PM" }], status: "Late", location: "Oakfield care home", latitude: 52.6369, longitude: -1.1398, geofenceStatus: "Inside", distance: 15, accuracy: "±5 meters" },
  { id: "A-3", employeeId: "EMP-004", date: "2026-06-01", clockIn: "07:50 AM", clockOut: "08:05 PM", breaks: [{ start: "01:00 PM", end: "01:45 PM" }], status: "On Time", location: "Birmingham medical", latitude: 52.4815, longitude: -1.9025, geofenceStatus: "Inside", distance: 9, accuracy: "±5 meters" },
  { id: "A-4", employeeId: "EMP-005", date: "2026-06-01", clockIn: "08:00 AM", clockOut: "02:00 PM", breaks: [{ start: "10:30 AM", end: "11:00 AM" }], status: "On Time", location: "Solihull hub", latitude: 52.4128, longitude: -1.7781, geofenceStatus: "Inside", distance: 8, accuracy: "±5 meters" },
  { id: "A-5", employeeId: "EMP-003", date: "2026-06-01", clockIn: "07:58 PM", clockOut: "Pending", breaks: [], status: "Active (Night)", location: "Oakfield care home", latitude: 52.6371, longitude: -1.1396, geofenceStatus: "Inside", distance: 14, accuracy: "±5 meters" },
];

// Audits types
export const AUDIT_TYPES = [
  "Fire Audit",
  "Medication Audit",
  "Care Plan Audit",
  "Health & Safety Audit",
  "Infection Control Audit",
  "Dignity Audit",
  "Nutrition Audit",
  "Complaints Audit",
  "Accident Audit"
];

// Audit records
export const INITIAL_AUDITS = [
  { id: "AUD-001", type: "Daily Walkaround", scheduledDate: "2026-06-01", officerId: "EMP-006", status: "Completed", lastCompleted: "2026-06-01", score: 95 },
  { id: "AUD-002", type: "Weekly Medication Audit", scheduledDate: "2026-06-03", officerId: "EMP-006", status: "In Progress", lastCompleted: "2026-05-27", score: null },
  { id: "AUD-052", type: "Monthly Medication Audit", scheduledDate: "2026-05-28", officerId: "EMP-006", status: "Overdue", lastCompleted: "2026-04-28", score: null },
  { id: "AUD-003", type: "Infection Control Audit", scheduledDate: "2026-05-25", officerId: "EMP-006", status: "Overdue", lastCompleted: "2025-11-25", score: null },
  { id: "AUD-004", type: "Care Plan Audit", scheduledDate: "2026-05-15", officerId: "EMP-006", status: "Completed", lastCompleted: "2026-05-15", score: 90 },
  { id: "AUD-005", type: "Health & Safety Audit", scheduledDate: "2026-04-20", officerId: "EMP-006", status: "Completed", lastCompleted: "2026-04-20", score: 92 },
  { id: "AUD-006", type: "Dignity Audit", scheduledDate: "2026-04-01", officerId: "EMP-006", status: "Completed", lastCompleted: "2026-04-01", score: 100 },
  { id: "AUD-007", type: "Storage of Medication Audit", scheduledDate: "2026-06-02", officerId: "EMP-006", status: "Pending", lastCompleted: "2026-05-02", score: null },
  { id: "AUD-008", type: "Pressure Mattress Audit", scheduledDate: "2026-05-10", officerId: "EMP-006", status: "Completed", lastCompleted: "2026-05-10", score: 92 },
  { id: "AUD-009", type: "Call Bell Audit", scheduledDate: "2026-06-05", officerId: "EMP-006", status: "Pending", lastCompleted: "2026-05-05", score: null },
  { id: "AUD-010", type: "Accident & Incident Audit", scheduledDate: "2026-05-18", officerId: "EMP-006", status: "Completed", lastCompleted: "2026-05-18", score: 96 },
  { id: "AUD-011", type: "Nutrition & Hydration Audit", scheduledDate: "2026-06-04", officerId: "EMP-006", status: "Pending", lastCompleted: "2026-05-04", score: null },
  { id: "AUD-012", type: "Fire Audit", scheduledDate: "2026-06-10", officerId: "EMP-006", status: "Pending", lastCompleted: "2026-03-10", score: null }
];

// Visitors log database
export const INITIAL_VISITORS = [
  { id: "VIS-101", name: "David Foster", company: "Premium Medical Supplies", phone: "+44 7911 123456", purpose: "Deliver Medical Stocks", visitingPerson: "Sarah Jenkins", clockIn: "2026-06-01 09:15 AM", clockOut: "2026-06-01 09:45 AM", status: "Signed Out" },
  { id: "VIS-102", name: "Helena Green", company: "Family Member", phone: "+44 7911 654321", purpose: "Visit resident Mary Green (Rm 14)", visitingPerson: "Mary Green (Resident)", clockIn: "2026-06-01 10:30 AM", clockOut: "Still Inside", status: "Currently Inside" },
  { id: "VIS-103", name: "Dr. Alistair Cook", company: "NHS Birmingham Clinic", phone: "+44 7911 888999", purpose: "Routine Resident Health Audits", visitingPerson: "Nurse James Carter", clockIn: "2026-06-01 11:10 AM", clockOut: "Still Inside", status: "Currently Inside" }
];

// Leave applications database
export const INITIAL_LEAVE = [
  { id: "LV-201", employeeId: "EMP-002", type: "Annual Leave", start: "2026-06-12", end: "2026-06-16", days: 4, reason: "Family Holiday trip", status: "Pending" },
  { id: "LV-202", employeeId: "EMP-004", type: "Annual Leave", start: "2026-06-04", end: "2026-06-05", days: 2, reason: "Doctor Checkup & Rest", status: "Approved" },
  { id: "LV-203", employeeId: "EMP-003", type: "Compassionate Leave", start: "2026-05-10", end: "2026-05-12", days: 3, reason: "Family emergency", status: "Approved" },
  { id: "LV-204", employeeId: "EMP-005", type: "Annual Leave", start: "2026-07-20", end: "2026-07-27", days: 6, reason: "Summer Trip", status: "Pending" }
];

// Notifications
export const INITIAL_NOTIFICATIONS = [
  { id: "N-1", type: "alert", text: "Wednesday Night Shift is understaffed (Care Staff Night: 1/2)", time: "10 mins ago", read: false },
  { id: "N-2", type: "info", text: "Medication Audit is due tomorrow", time: "2 hrs ago", read: false },
  { id: "N-3", type: "warning", text: "Right To Work document for James Carter is expiring on 2026-06-15", time: "5 hrs ago", read: false },
  { id: "N-4", type: "info", text: "Leave Request pending: James Carter (12 Jun - 16 Jun)", time: "1 day ago", read: true },
  { id: "N-5", type: "success", text: "New open shift claimed: Saturday Care Day by Liam O'Connor", time: "2 days ago", read: true }
];
