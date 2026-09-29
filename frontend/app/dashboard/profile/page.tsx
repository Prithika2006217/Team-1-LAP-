"use client";

import { useEffect, useState } from "react";
import { TabPlaceholder } from "@/components/tab-placeholder";

type Profile = {
  name?: string;
  email?: string;
  branch?: string;
  rollNo?: string;
  role?: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const token = document.cookie.match(/(?:^|;\s*)token=([^;]+)/)?.[1];
    if (!token) return;

    try {
      const encodedPayload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const paddedPayload = encodedPayload.padEnd(Math.ceil(encodedPayload.length / 4) * 4, "=");
      setProfile(JSON.parse(atob(paddedPayload)) as Profile);
    } catch {
      setProfile(null);
    }
  }, []);

  if (!profile) {
    return <TabPlaceholder title="Profile" description="Your account details are unavailable." todo="Sign in again to load your profile." />;
  }

  return (
    <section className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-950">Profile</h1>
      <p className="mt-1 text-sm text-slate-500">Your account details.</p>
      <dl className="mt-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
        <div><dt className="text-xs font-semibold uppercase text-slate-400">Name</dt><dd className="mt-1 text-sm font-medium text-slate-900">{profile.name || "Not provided"}</dd></div>
        <div><dt className="text-xs font-semibold uppercase text-slate-400">Email</dt><dd className="mt-1 text-sm font-medium text-slate-900">{profile.email || "Not provided"}</dd></div>
        <div><dt className="text-xs font-semibold uppercase text-slate-400">Branch</dt><dd className="mt-1 text-sm font-medium text-slate-900">{profile.branch || "Not provided"}</dd></div>
        <div><dt className="text-xs font-semibold uppercase text-slate-400">Roll No</dt><dd className="mt-1 text-sm font-medium text-slate-900">{profile.rollNo || "Not provided"}</dd></div>
        <div><dt className="text-xs font-semibold uppercase text-slate-400">Role</dt><dd className="mt-1 text-sm font-medium text-slate-900">{profile.role || "Not provided"}</dd></div>
      </dl>
    </section>
  );
}
