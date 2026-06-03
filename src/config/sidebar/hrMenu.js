import {
  LayoutDashboard,
  Users,
  FileCheck,
  CalendarDays,
  Milestone,
  Receipt,
  GraduationCap
} from 'lucide-react';

export const hrMenu = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'employees', label: 'Employee Profiles', icon: Users },
  { id: 'leave', label: 'Leave Approvals', icon: Milestone },
  { id: 'payroll', label: 'Payroll Summary', icon: Receipt },
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
  { id: 'competency', label: 'Competency', icon: GraduationCap }
];
