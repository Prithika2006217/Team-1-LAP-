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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [branch, setBranch] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    if (name.trim().length < 2) {
      setError("Please enter your name.");
      return false;
    }
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor={`${role}-name`} className="text-sm font-medium text-slate-700">Your Name</Label>
        <Input
          id={`${role}-name`}
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-11"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${role}-email`} className="text-sm font-medium text-slate-700">Email</Label>
        <Input
          id={`${role}-email`}
          type="email"
          placeholder="you@college.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11"
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
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-100 p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </Button>
      <div className="text-center">
        <button type="button" onClick={onSignup} className="text-sm text-primary hover:text-primary/80 font-medium">
          Need an account? Sign up
        </button>
      </div>
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
      // Store user name for dashboard display
      localStorage.setItem("userName", name.trim());
      document.cookie = `userName=${encodeURIComponent(name.trim())}; path=/; max-age=86400`;
      router.push("/dashboard");
    } catch (signupError) {
      console.error("Signup request failed", { url: `${API_BASE}/api/auth/signup`, method: "POST", error: signupError });
      setError(signupError instanceof Error ? signupError.message : "Unable to create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="signup-name" className="text-sm font-medium text-slate-700">Your Name</Label>
        <Input 
          id="signup-name" 
          placeholder="Enter your name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          className="h-11"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email" className="text-sm font-medium text-slate-700">Email</Label>
        <Input 
          id="signup-email" 
          type="email" 
          placeholder="you@college.edu" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          className="h-11"
        />
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
        <Label htmlFor="signup-password" className="text-sm font-medium text-slate-700">Password</Label>
        <div className="relative">
          <Input 
          id="signup-password" 
          type={showPassword ? "text" : "password"} 
          placeholder="Enter password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} className="pr-10" 
          className="h-11"
        />
          <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:text-slate-900" aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-100 p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
        {loading ? "Creating account…" : "Create account"}
      </Button>
      <div className="text-center">
        <button type="button" onClick={onBack} className="text-sm text-primary hover:text-primary/80 font-medium">
          Already have an account? Sign in
        </button>
      </div>
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
        <div className="mb-8 flex items-center justify-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground shadow-lg">
            T
          </span>
          <div className="flex flex-col">
            <span className="text-3xl font-bold text-slate-900">tenzorce</span>
            <span className="text-xs font-medium text-slate-400">Learn. Practice. Prove.</span>
          </div>
        </div>

        <Card className="shadow-xl border-slate-200">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl">{showSignup ? "Create your account" : "Welcome back"}</CardTitle>
            <CardDescription className="text-base">
              {showSignup ? "Create an account to get started." : "Sign in to continue to your workspace."}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Tabs value={selectedRole} onValueChange={setSelectedRole}>
              <TabsList className="grid w-full grid-cols-4">
                {ROLES.map((r) => (
                  <TabsTrigger key={r.value} value={r.value} className="text-xs">
                    {r.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {ROLES.map((r) => (
                <TabsContent key={r.value} value={r.value} className="mt-0">
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

        <p className="mt-6 text-center text-xs text-slate-400">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
