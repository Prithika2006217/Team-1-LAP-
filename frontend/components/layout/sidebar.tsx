// Persistent left sidebar (fixed). This is a Server Component — it renders the
// brand + static shell on the server and delegates only the active-link
// highlighting to the small <SidebarNav/> Client Component.
import Link from "next/link";
import { SidebarNav } from "./sidebar-nav";

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-100 bg-white lg:flex">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2 px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">
            T
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-lg font-bold text-slate-900">tenzorce</span>
            <span className="text-[10px] font-medium text-slate-400">
              Learn. Practice. Prove.
            </span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <SidebarNav />
      </div>
    </aside>
  );
}
