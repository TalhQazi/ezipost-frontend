import {
  LayoutDashboard,
  FileText,
  Folder,
  Image,
  Users,
  User,
  Briefcase,
  BookOpen,
  Images,
  Lock,
  Settings,
  CalendarCheck,
  Building2,
  ShieldCheck,
  MessageSquare,
  Info,
} from "lucide-react";

export const menuItems = [
  /* ================= DASHBOARD ================= */
  {
    type: "item",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },

  /* ================= HOME SECTION ================= */

  {
    type: "item",
    label: "Mail Processing",
    icon: Images,
    path: "/mail-processing",
  },
  // {
  //   type: "item",
  //   label: "Bank Management",
  //   icon: Building2,
  //   path: "/bank",
  // },
  {
    type: "item",
    label: "Escrow Account",
    icon: Info,
    path: "/escrow",
  },
  {
    type: "item",
    label: "Transactions",
    icon: CalendarCheck,
    path: "/transactions",
  },
  {
    type: "item",
    label: "Audit Logs",
    icon: ShieldCheck,
    path: "/audit-logs",
  },
  {
    type: "item",
    label: "Rate Configurations",
    icon: Settings,
    path: "/rate-configs",
  },
   {
    type: "item",
    label: "Reports",
    icon: ShieldCheck,
    path: "/reports",
  },
  
  /* ================= SETTINGS SECTION ================= */
  // {
  //   type: "item",
  //   label: "Manage Admin Users",
  //   icon: ShieldCheck,
  //   path: "/admin-users",
  // },
  // {
  //   type: "item",
  //   label: "Change Password",
  //   icon: Lock,
  //   path: "/change-password",
  // },

  {
    type: "item",
    label: "Settings",
    icon: Settings,
    path: "/settings",
  },
];