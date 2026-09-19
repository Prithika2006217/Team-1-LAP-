// Dashboard layout (Server Component). Renders the persistent Sidebar + Header
// shell around every authenticated tab. The main content area is a white-on-
// slate canvas per the Tenzorce design system.
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      {/* Offset content by the fixed sidebar width on large screens. */}
      <div className="lg:pl-64">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
