import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tenzorce — Learn. Practice. Prove.",
  description:
    "Tenzorce LAP — AI-powered Learning, Practice and Assessment platform for colleges and training institutes.",
};

// Root layout (Server Component). Global <html>/<body> shell only.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
