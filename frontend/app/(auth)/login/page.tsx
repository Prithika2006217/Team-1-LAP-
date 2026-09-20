"use client";

// Multi-role tabbed login and signup.
// Four login modes (Student, Trainer, TPO, Admin) via shadcn/ui Tabs.
// Client-side validation runs BEFORE hitting the API to avoid wasted requests.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE } from "@/lib/api";

// Role tabs shown in the deck. Values map to the Prisma Role enum.
const ROLES = [
  { value: "STUDENT", label: "Student" },
  { value: "TRAINER", label: "Trainer" },
  { value: "COLLEGE_TPO", label: "TPO" },
  { value: "SUPER_ADMIN", label: "Admin" },
] as const;

function LoginForm({ role, onSignup }: { role: string; onSignup: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    setError(null);
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Client-side validation first — no server round-trip for bad input.
    if (!validate()) return;

    setLoading(true);
    // --- MOCK auth (base only) -------------------------------------------
    // Interns: replace with a fetch to the backend, then set the real token.
    const dummyToken = `dummy.${role}.${Date.now()}`;
    document.cookie = `token=${dummyToken}; path=/; max-age=86400`;
    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${role}-email`}>Email</Label>
        <Input
          id={`${role}-email`}
          type="email"
          placeholder="you@college.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${role}-password`}>Password</Label>
        <Input
          id={`${role}-password`}
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </Button>
      <button type="button" onClick={onSignup} className="w-full text-sm text-primary hover:underline">
        Need an account? Sign up
      </button>
    </form>
  );
}

function SignupForm({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) return setError("Please enter your full name.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Please enter a valid email address.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to create account.");

      document.cookie = `uid=${encodeURIComponent(data.user.id)}; path=/; max-age=86400`;
      document.cookie = `token=dummy.${data.user.role}.${Date.now()}; path=/; max-age=86400`;
      router.push("/dashboard");
    } catch (signupError) {
      setError(signupError instanceof Error ? signupError.message : "Unable to create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-name">Full name</Label>
        <Input id="signup-name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input id="signup-email" type="email" placeholder="you@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input id="signup-password" type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating account…" : "Create account"}
      </Button>
      <button type="button" onClick={onBack} className="w-full text-sm text-primary hover:underline">
        Already have an account? Sign in
      </button>
    </form>
  );
}

export default function LoginPage() {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-xl font-bold text-primary-foreground">
            T
          </span>
          <span className="text-2xl font-bold text-slate-900">tenzorce</span>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>{showSignup ? "Create your account" : "Welcome back"}</CardTitle>
            <CardDescription>{showSignup ? "Create an account to get started." : "Sign in to continue to your workspace."}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="STUDENT">
              <TabsList className="grid w-full grid-cols-4">
                {ROLES.map((r) => (
                  <TabsTrigger key={r.value} value={r.value}>
                    {r.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {ROLES.map((r) => (
                <TabsContent key={r.value} value={r.value}>
                  {showSignup ? (
                    <SignupForm onBack={() => setShowSignup(false)} />
                  ) : (
                    <LoginForm role={r.value} onSignup={() => setShowSignup(true)} />
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
