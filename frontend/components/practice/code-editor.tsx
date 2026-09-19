"use client";

// Code editor — Monaco, dynamically imported with SSR disabled (Monaco touches
// `window` / `navigator` and cannot render on the server).
import { useState } from "react";
import dynamic from "next/dynamic";
import { Sun, Moon, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const MonacoEditor = dynamic(() => import("@monaco-editor/react").then((m) => m.default), {
  ssr: false,
  loading: () => (
    <div className="flex h-72 items-center justify-center bg-slate-900 text-sm text-slate-400">
      Loading editor…
    </div>
  ),
});

const LANGUAGES = [
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "C++", value: "cpp" },
];

export function CodeEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [language, setLanguage] = useState("python");
  const [theme, setTheme] = useState<"vs-dark" | "light">("vs-dark");

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm"
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setTheme((t) => (t === "vs-dark" ? "light" : "vs-dark"))}
            aria-label="Toggle editor theme"
          >
            {theme === "vs-dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {/* Run Code is a placeholder — wire to a code-execution service later. */}
          <Button type="button" variant="outline" size="sm">
            <Play className="h-4 w-4" /> Run Code
          </Button>
        </div>
      </div>

      <MonacoEditor
        height="18rem"
        language={language}
        theme={theme}
        value={value}
        onChange={(v) => onChange(v ?? "")}
        options={{ minimap: { enabled: false }, fontSize: 14, scrollBeyondLastLine: false }}
      />
    </div>
  );
}
