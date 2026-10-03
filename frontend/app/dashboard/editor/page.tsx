"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Trash2, RotateCcw, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const LANGUAGES = [
  { id: 71, name: "Python", monaco: "python" },
  { id: 62, name: "Java", monaco: "java" },
  { id: 50, name: "C", monaco: "c" },
  { id: 54, name: "C++", monaco: "cpp" },
  { id: 63, name: "JavaScript", monaco: "javascript" },
  { id: 74, name: "TypeScript", monaco: "typescript" },
];

const DEFAULT_CODE = {
  python: `# Write your Python code here
def main():
    print("Hello, World!")

if __name__ == "__main__":
    main()`,
  java: `// Write your Java code here
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  c: `// Write your C code here
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
  cpp: `// Write your C++ code here
#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`,
  javascript: `// Write your JavaScript code here
console.log("Hello, World!");`,
  typescript: `// Write your TypeScript code here
console.log("Hello, World!");`,
};

export default function EditorPage() {
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const [code, setCode] = useState(DEFAULT_CODE.python);
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState<{ stdout: string; stderr: string; time: string; memory: string; error?: string } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  const handleLanguageChange = (languageId: number) => {
    const lang = LANGUAGES.find((l) => l.id === languageId);
    if (lang) {
      setSelectedLanguage(lang);
      setCode(DEFAULT_CODE[lang.monaco as keyof typeof DEFAULT_CODE]);
      setOutput(null);
      setEditorKey((prev) => prev + 1); // Force remount of editor
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language_id: selectedLanguage.id,
          source_code: code,
          stdin: stdin,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setOutput({
          stdout: "",
          stderr: "",
          time: "",
          memory: "",
          error: data.error,
        });
      } else {
        setOutput({
          stdout: data.stdout || "",
          stderr: data.stderr || "",
          time: data.time || "0",
          memory: data.memory || "0",
        });
      }
    } catch (error) {
      setOutput({
        stdout: "",
        stderr: "",
        time: "",
        memory: "",
        error: "Failed to execute code. Please try again.",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleClear = () => {
    setCode("");
    setOutput(null);
  };

  const handleReset = () => {
    setCode(DEFAULT_CODE[selectedLanguage.monaco as keyof typeof DEFAULT_CODE]);
    setOutput(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Code Editor</h1>
            <p className="text-sm text-slate-600">Write, compile, and run your code</p>
          </div>
          <Link href="/dashboard/assessment-center">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Assessment Center
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Editor Section */}
          <div className="lg:col-span-2 space-y-3">
            {/* Language Selection */}
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-slate-700">Language:</label>
                  <select
                    value={selectedLanguage.id}
                    onChange={(e) => handleLanguageChange(Number(e.target.value))}
                    className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.id} value={lang.id}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Code Editor */}
            <Card className="border-slate-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Source Code</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClear}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      className="gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[500px] border-t border-slate-200">
                  <Editor
                    key={editorKey}
                    height="500px"
                    defaultLanguage={selectedLanguage.monaco}
                    language={selectedLanguage.monaco}
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: true },
                      fontSize: 14,
                      lineNumbers: "on",
                      roundedSelection: true,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 4,
                      wordWrap: "on",
                      bracketPairColorization: { enabled: true },
                      suggest: {
                        showKeywords: true,
                        showSnippets: true,
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Output Section */}
          <div className="space-y-3">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Output</CardTitle>
                  <Button
                    onClick={handleRunCode}
                    disabled={isRunning}
                    className="gap-2"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Run Code
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {output ? (
                  <>
                    {output.error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600 font-medium">Error:</p>
                        <pre className="text-sm text-red-700 mt-1 whitespace-pre-wrap">{output.error}</pre>
                      </div>
                    )}

                    {output.stdout && (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                        <p className="text-sm font-medium text-slate-700 mb-1">Standard Output:</p>
                        <pre className="text-sm text-slate-900 font-mono whitespace-pre-wrap">{output.stdout}</pre>
                      </div>
                    )}

                    {output.stderr && (
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                        <p className="text-sm font-medium text-orange-700 mb-1">Standard Error:</p>
                        <pre className="text-sm text-orange-800 font-mono whitespace-pre-wrap">{output.stderr}</pre>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded-md">
                        <p className="text-xs text-slate-600">Execution Time:</p>
                        <p className="text-sm font-medium text-slate-900">{output.time}s</p>
                      </div>
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded-md">
                        <p className="text-xs text-slate-600">Memory:</p>
                        <p className="text-sm font-medium text-slate-900">{output.memory}MB</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Play className="h-12 w-12 text-slate-300 mb-3" />
                    <p className="text-sm text-slate-500">Run your code to see the output</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stdin Input */}
            <Card>
              <CardHeader className="pb-2 pt-3">
                <CardTitle className="text-base">Standard Input (stdin)</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  placeholder="Enter input for your program..."
                  className="w-full h-24 px-3 py-2 border border-slate-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
