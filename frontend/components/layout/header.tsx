"use client";

// Fixed top header. Client Component because logout mutates cookies and
// navigates. Kept intentionally minimal — interns wire in search, notifications
// and the real user menu per the deck.
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, ChevronDown, LogOut, Search, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";


// Get user name from cookie/localStorage (mock auth - replace with real auth when ready)
function getUserName(): string {
  if (typeof window === "undefined") return "User";
  
  // Try to get from localStorage first
  const localName = localStorage.getItem("userName");
  if (localName) return localName;
  
  // Try to get from cookie
  const match = document.cookie.match(/(?:^|;\s*)userName=([^;]+)/);
  if (match) return decodeURIComponent(match[1]);
  
  // Fallback to generic name
  return "User";
}

type SessionDisplayUser = {
  name?: string;
  email?: string;
  picture?: string;
  avatarUrl?: string;
};

function readSessionDisplayUser(): SessionDisplayUser {
  const token = document.cookie.match(/(?:^|;\s*)token=([^;]+)/)?.[1];
  if (!token) return {};

  try {
    const payload = JSON.parse(atob(decodeURIComponent(token).split(".")[1])) as SessionDisplayUser;
    return payload;
  } catch {
    return {};
  }
}

function UserAvatar() {
  const [user, setUser] = useState<SessionDisplayUser>({});

  useEffect(() => {
    setUser(readSessionDisplayUser());
  }, []);

  const label = user.name || user.email || "Tenzorce User";
  const initials = label
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
  const image = user.picture || user.avatarUrl;

  return image ? (
    <img src={image} alt={`${label} profile`} className="h-9 w-9 rounded-full object-cover" />
  ) : (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground" aria-label={`${label} avatar`}>
      {initials || "TU"}
    </div>
  );
}

export function Header() {
  const router = useRouter();
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    setUserName(getUserName());
  }, []);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeProfile(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", closeProfile);
    return () => document.removeEventListener("mousedown", closeProfile);
  }, []);

  function handleLogout() {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "uid=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  }

  function updateSearch(value: string) {
    setSearch(value);
    window.dispatchEvent(new CustomEvent("study-space-search", { detail: value }));
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-100 bg-white px-6">
      <form onSubmit={submitSearch} className="flex flex-1 items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-400">
        <Search className="h-4 w-4" />
        <input value={search} onChange={(event) => updateSearch(event.target.value)} placeholder="Search a CSE topic to learn..." aria-label="Search a CSE topic" className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" />
      </form>

      <Button variant="ghost" size="icon" aria-label="Notifications">
        <Bell className="h-5 w-5 text-slate-600" />
      </Button>

      <div className="relative flex items-center gap-3" ref={profileRef}>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-slate-900">{userName}</p>
          <p className="text-xs text-slate-400">Signed in</p>
        </div>
        <button type="button" onClick={() => setProfileOpen((open) => !open)} className="flex items-center gap-1 rounded-lg p-1 hover:bg-slate-100" aria-label="Open profile menu" aria-expanded={profileOpen}>
          <UserAvatar />
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </button>
        {profileOpen && (
          <div className="absolute right-0 top-12 z-40 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
            <Link href="/dashboard/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
              <UserCircle className="h-4 w-4" />
              View Profile
            </Link>
            <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
