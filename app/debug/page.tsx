"use client";

import { useState } from "react";

export default function DebugPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const [testResult, setTestResult] = useState<string>("");
  const [testing, setTesting] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    setTestResult("Testing connection...");

    try {
      const response = await fetch(`${apiUrl}/health`);
      const data = await response.json();
      setTestResult(`✅ Success! Response: ${JSON.stringify(data)}`);
    } catch (error: any) {
      setTestResult(`❌ Failed: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="card max-w-2xl w-full p-8">
        <h1 className="text-2xl font-bold mb-6">Debug Info</h1>

        <div className="space-y-4">
          <div>
            <p className="font-semibold text-neutral-700">API URL:</p>
            <p className="text-lg font-mono bg-neutral-100 p-3 rounded mt-2 break-all">
              {apiUrl}
            </p>
          </div>

          <div>
            <p className="font-semibold text-neutral-700">Environment:</p>
            <p className="text-lg font-mono bg-neutral-100 p-3 rounded mt-2">
              {process.env.NODE_ENV}
            </p>
          </div>

          <div>
            <p className="font-semibold text-neutral-700">All NEXT_PUBLIC_ vars:</p>
            <pre className="text-sm font-mono bg-neutral-100 p-3 rounded mt-2 overflow-auto">
              {JSON.stringify(
                Object.keys(process.env)
                  .filter(key => key.startsWith('NEXT_PUBLIC_'))
                  .reduce((acc, key) => ({ ...acc, [key]: process.env[key] }), {}),
                null,
                2
              )}
            </pre>
          </div>

          <div>
            <button
              onClick={testConnection}
              disabled={testing}
              className="btn-primary w-full"
            >
              {testing ? "Testing..." : "Test API Connection"}
            </button>
            {testResult && (
              <p className="mt-2 p-3 bg-neutral-100 rounded text-sm">
                {testResult}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
