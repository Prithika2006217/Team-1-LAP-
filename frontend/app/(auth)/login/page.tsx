"use client";

// Multi-role tabbed login and signup.
// Four login modes (Student, Trainer, TPO, Admin) via shadcn/ui Tabs.
// Client-side validation runs BEFORE hitting the API to avoid wasted requests.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
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
  const [branch, setBranch] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (role === "STUDENT" && !branch.trim()) {
      setError("Please enter your branch.");
      return false;
    }
    if (role === "STUDENT" && !rollNo.trim()) {
      setError("Please enter your roll number.");
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
    setError(null);
    try {
      const loginUrl = `${API_BASE}/api/auth/login`;
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, ...(role === "STUDENT" ? { role, branch, rollNo } : {}) }),
      });
      console.debug("Login response", { url: loginUrl, status: response.status, ok: response.ok });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to sign in.");
      document.cookie = `uid=${encodeURIComponent(data.user.id)}; path=/; max-age=86400`;
      document.cookie = `token=${encodeURIComponent(data.token)}; path=/; max-age=86400`;
      router.push("/dashboard");
    } catch (loginError) {
      console.error("Login request failed", { url: `${API_BASE}/api/auth/login`, method: "POST", error: loginError });
      setError(loginError instanceof TypeError && loginError.message === "Failed to fetch" ? `Unable to reach the API at ${API_BASE}. Confirm the backend is running on port 5000.` : loginError instanceof Error ? loginError.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
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
      {role === "STUDENT" && (
        <>
          <div className="space-y-2">
            <Label htmlFor={`${role}-branch`}>Branch</Label>
            <Input id={`${role}-branch`} placeholder="CSE, ECE, MECH" value={branch} onChange={(e) => setBranch(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${role}-roll-no`}>Roll No</Label>
            <Input id={`${role}-roll-no`} placeholder="Your roll number" value={rollNo} onChange={(e) => setRollNo(e.target.value)} />
          </div>
        </>
      )}
      <div className="space-y-2">
        <Label htmlFor={`${role}-password`}>Password</Label>
        <div className="relative">
          <Input
            id={`${role}-password`}
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-10"
          />
          <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:text-slate-900" aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
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

function SignupForm({ role, onBack }: { role: string; onBack: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [branch, setBranch] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) return setError("Please enter your full name.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Please enter a valid email address.");
    if (role === "STUDENT" && !branch.trim()) return setError("Please enter your branch.");
    if (role === "STUDENT" && !rollNo.trim()) return setError("Please enter your roll number.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");

    setLoading(true);
    setError(null);
    try {
      const signupUrl = `${API_BASE}/api/auth/signup`;
      const response = await fetch(signupUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, ...(role === "STUDENT" ? { branch, rollNo } : {}) }),
      });
      console.debug("Signup response", { url: signupUrl, status: response.status, ok: response.ok });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to create account.");

      document.cookie = `uid=${encodeURIComponent(data.user.id)}; path=/; max-age=86400`;
      document.cookie = `token=${encodeURIComponent(data.token)}; path=/; max-age=86400`;
      router.push("/dashboard");
    } catch (signupError) {
      console.error("Signup request failed", { url: `${API_BASE}/api/auth/signup`, method: "POST", error: signupError });
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
      {role === "STUDENT" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="signup-branch">Branch</Label>
            <Input id="signup-branch" placeholder="CSE, ECE, MECH" value={branch} onChange={(e) => setBranch(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-roll-no">Roll No</Label>
            <Input id="signup-roll-no" placeholder="Your roll number" value={rollNo} onChange={(e) => setRollNo(e.target.value)} />
          </div>
        </>
      )}
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <div className="relative">
          <Input id="signup-password" type={showPassword ? "text" : "password"} placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" />
          <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:text-slate-900" aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
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
  const [selectedRole, setSelectedRole] = useState("STUDENT");

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
            <Tabs value={selectedRole} onValueChange={setSelectedRole}>
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
                    <SignupForm role={r.value} onBack={() => setShowSignup(false)} />
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
