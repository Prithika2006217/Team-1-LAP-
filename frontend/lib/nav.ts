import {
  LayoutDashboard,
  BookOpen,
  Target,
  ShieldCheck,
  ClipboardList,
  TrendingUp,
  BarChart3,
  User,
  Settings,
  type LucideIcon,
} from "lucide-react";

// Sidebar navigation. One entry per tab an intern will build out.
// Keep hrefs in sync with the folders under app/dashboard/.
export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Study Space", href: "/dashboard/study-space", icon: BookOpen },
  { label: "Practice Arena", href: "/dashboard/practice-arena", icon: Target },
  { label: "Assessment Center", href: "/dashboard/assessment-center", icon: ShieldCheck },
  { label: "Results", href: "/dashboard/results", icon: ClipboardList },
  { label: "My Progress", href: "/dashboard/my-progress", icon: TrendingUp },
  { label: "Reports & Analytics", href: "/dashboard/reports", icon: BarChart3 },
  { label: "Profile", href: "/dashboard/profile", icon: User },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];
