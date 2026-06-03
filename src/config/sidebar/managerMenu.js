import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileCheck,
  Milestone,
  Receipt,
  ShieldCheck,
  Eye,
  GraduationCap
} from 'lucide-react';

export const managerMenu = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'employees', label: 'Employee Directory', icon: Users },
  { id: 'document-verification', label: 'Document Verification', icon: FileCheck },
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
  { id: 'leave', label: 'Leave Approvals', icon: Milestone },
  { id: 'payroll', label: 'Hours Monitor', icon: Receipt },
  { id: 'audits', label: 'Audits Panel', icon: ShieldCheck },
  { id: 'observation', label: 'Observation', icon: Eye },
  { id: 'competency', label: 'Competency', icon: GraduationCap }
];
