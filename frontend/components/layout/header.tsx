"use client";

// Fixed top header. Client Component because logout mutates cookies and
// navigates. Kept intentionally minimal — interns wire in search, notifications
// and the real user menu per the deck.
import { useRouter } from "next/navigation";
import { Bell, LogOut, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const router = useRouter();

  function handleLogout() {
    // Clear the auth cookie and return to login. (Base placeholder.)
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-100 bg-white px-6">
      {/* Search (placeholder) */}
      <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-400">
        <Search className="h-4 w-4" />
        <span>Search modules, tests, and more…</span>
      </div>

      <Button variant="ghost" size="icon" aria-label="Notifications">
        <Bell className="h-5 w-5 text-slate-600" />
      </Button>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-slate-900">Tenzorce User</p>
          <p className="text-xs text-slate-400">Signed in</p>
        </div>
        <div className="h-9 w-9 rounded-full bg-primary/10" />
      </div>

      <Button variant="outline" size="sm" onClick={handleLogout}>
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </header>
  );
}
