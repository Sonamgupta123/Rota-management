import {
  LayoutDashboard,
  Users,
  FileCheck,
  CalendarDays,
  Milestone,
  Receipt,
  BarChart3,
  ClipboardList,
  ShieldCheck,
  Eye,
  GraduationCap
} from 'lucide-react';

export const adminMenu = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'employees', label: 'Employee Profiles', icon: Users },
  { id: 'verification-audit-log', label: 'Verification Audit Log', icon: FileCheck },
  {
    id: 'rota-group',
    label: 'Rota',
    icon: CalendarDays,
    isExpandable: true,
    submenu: [
      { id: 'rota', label: 'Rota Calendar' },
      { id: 'shift-planning', label: 'Shift Planning' },
      { id: 'day-notes', label: 'Day Notes' },
      { id: 'attendance', label: 'Attendance' }
    ]
  },
  { id: 'leave', label: 'Leave Manager', icon: Milestone },
  { id: 'payroll', label: 'Payroll Summary', icon: Receipt },
  { id: 'reports', label: 'Reports Insights', icon: BarChart3 },
  { id: 'visitor-tablet', label: 'Visitor Registration', icon: ClipboardList },
  { id: 'audits', label: 'Audits Panel', icon: ShieldCheck },
  { id: 'observation', label: 'Observation', icon: Eye },
  { id: 'competency', label: 'Competency', icon: GraduationCap }
];
