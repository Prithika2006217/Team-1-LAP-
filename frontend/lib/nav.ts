import {
  LayoutDashboard,
  BookOpen,
  Target,
  ShieldCheck,
  BarChart3,
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
  { label: "Reports & Analytics", href: "/dashboard/reports", icon: BarChart3 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];
