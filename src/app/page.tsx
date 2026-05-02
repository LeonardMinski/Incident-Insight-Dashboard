"use client";

import { useState } from "react";
import { AnalysisResult } from "@/types/logs";

const sampleLogs = `[2026-05-01 10:32:00] ERROR payment-service: Stripe timeout after 10s
[2026-05-01 10:32:05] ERROR payment-service: Stripe timeout after 5s
[2026-05-01 10:33:00] WARN auth-service: Token refresh failed
[2026-05-01 10:34:00] INFO api-gateway: Request completed
[2026-05-01 10:35:00] ERROR checkout-service: Database connection failed`;

export default function Home() {
  const [input, setInput] = useState(sampleLogs);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyse = async () => {
    if (!input.trim()) return;

    setLoading(true);

    try {
      const response = await fetch("/api/analyse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input }),
      });

      const data = await response.json();

      if (data.result) {
        setResult(data.result);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-slate-900">
          Incident Insight Dashboard
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Paste raw logs, analyse repeated issues, identify affected services,
          and generate structured incident insights.
        </p>

        <section className="mt-6 rounded-xl bg-white p-4 shadow">
          <label className="text-sm font-medium text-slate-700">Raw logs</label>

          <textarea
            className="mt-2 h-64 w-full rounded-lg border border-slate-300 p-3 font-mono text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleAnalyse}
              disabled={loading || !input.trim()}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading ? "Analysing..." : "Analyse logs"}
            </button>

            <button
              onClick={() => {
                setInput("");
                setResult(null);
              }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
            >
              Clear
            </button>
          </div>
        </section>

        {result && (
          <section className="mt-6 rounded-xl bg-white p-4 shadow">
            <h2 className="text-xl font-semibold text-slate-900">
              Analysis result
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-slate-100 p-4">
                <p className="text-sm text-slate-500">Total lines</p>
                <p className="text-2xl font-bold">{result.totalLines}</p>
              </div>

              <div className="rounded-lg bg-slate-100 p-4">
                <p className="text-sm text-slate-500">Errors</p>
                <p className="text-2xl font-bold">
                  {result.severityCounts.ERROR}
                </p>
              </div>

              <div className="rounded-lg bg-slate-100 p-4">
                <p className="text-sm text-slate-500">Warnings</p>
                <p className="text-2xl font-bold">
                  {result.severityCounts.WARN}
                </p>
              </div>

              <div className="rounded-lg bg-slate-100 p-4">
                <p className="text-sm text-slate-500">Highest severity</p>
                <p className="text-2xl font-bold">
                  {result.summary.highestSeverity}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-slate-900">Summary</h3>
              <p className="mt-2 text-sm text-slate-700">
                Top issue: {result.summary.topIssue ?? "None detected"}
              </p>
              <p className="text-sm text-slate-700">
                Most affected service:{" "}
                {result.summary.mostAffectedService ?? "Unknown"}
              </p>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-slate-900">Grouped issues</h3>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2">Level</th>
                      <th className="py-2">Service</th>
                      <th className="py-2">Message</th>
                      <th className="py-2">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.groups.map((group) => (
                      <tr key={group.fingerprint} className="border-b">
                        <td className="py-2">{group.level}</td>
                        <td className="py-2">{group.service ?? "Unknown"}</td>
                        <td className="py-2">{group.message}</td>
                        <td className="py-2">{group.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
