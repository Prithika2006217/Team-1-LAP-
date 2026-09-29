import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <Link href="/" className="text-sm font-semibold text-primary hover:text-indigo-700">Back to Tenzorce</Link>
        <h1 className="mt-8 text-3xl font-bold tracking-tight text-slate-950">Privacy Policy</h1>
        <p className="mt-4 leading-7 text-slate-500">Our privacy policy is being prepared. Contact hello@tenzorce.com with privacy questions in the meantime.</p>
      </div>
    </main>
  );
}
