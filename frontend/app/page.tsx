import { redirect } from "next/navigation";

// Landing route — the base app sends everyone to the dashboard. The middleware
// bounces unauthenticated users to /login, so this stays a simple redirect.
export default function Home() {
  redirect("/dashboard");
}
