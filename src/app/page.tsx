"use client";

import { useState } from "react";
import { AnalysisResult, LogLevel } from "@/types/logs";

const sampleLogs = `[2026-05-01 10:32:00] ERROR payment-service: Stripe timeout after 10s
[2026-05-01 10:32:05] ERROR payment-service: Stripe timeout after 5s
[2026-05-01 10:33:00] WARN auth-service: Token refresh failed
[2026-05-01 10:34:00] INFO api-gateway: Request completed
[2026-05-01 10:35:00] ERROR checkout-service: Database connection failed`;

const severityBadgeStyles: Record<string, string> = {
  ERROR: "border-red-500/40 bg-red-500/10 text-red-300",
  WARN: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  INFO: "border-sky-500/40 bg-sky-500/10 text-sky-200",
  DEBUG: "border-zinc-500/40 bg-zinc-500/10 text-zinc-300",
};

export default function Home() {
  const [severityFilter, setSeverityFilter] = useState<LogLevel | "ALL">("ALL");
  const [input, setInput] = useState(sampleLogs);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const nonEmptyLineCount = input
    .split("\n")
    .filter((line) => line.trim().length > 0).length;
  const analysisStatus = loading
    ? "Analysing logs."
    : result
      ? "Analysis complete."
      : "Analysis has not run.";

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

  const severityOptions: Array<LogLevel | "ALL"> = [
    "ALL",
    "ERROR",
    "WARN",
    "INFO",
    "DEBUG",
    "UNKNOWN",
  ];

  const visibleGroups =
    result && severityFilter !== "ALL"
      ? result.groups.filter((group) => group.level === severityFilter)
      : (result?.groups ?? []);

  return (
    <main
      aria-busy={loading}
      className="min-h-screen bg-zinc-950 px-4 py-5 text-zinc-100 sm:px-6 lg:px-8"
    >
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-emerald-400 focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-zinc-950"
        href="#raw-logs-input"
      >
        Skip to raw logs input
      </a>

      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-3 border-b border-zinc-800 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
              Incident Insight
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-zinc-50">
              Log analysis console
            </h1>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-emerald-400"
            />
            <span>local parser</span>
          </div>
        </header>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <section
            aria-labelledby="raw-logs-heading"
            className="rounded-md border border-zinc-800 bg-zinc-900/70"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
              <label
                className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-zinc-400"
                htmlFor="raw-logs-input"
                id="raw-logs-heading"
              >
                Raw logs
              </label>
              <span
                aria-live="polite"
                className="font-mono text-xs text-zinc-400"
              >
                {nonEmptyLineCount} lines
              </span>
            </div>

            <p className="sr-only" id="raw-logs-help">
              Paste raw application logs here, then press Analyse logs to group
              repeated issues by severity, service, message, and count.
            </p>

            <textarea
              aria-describedby="raw-logs-help"
              className="h-128 w-full resize-none bg-zinc-950/60 p-4 font-mono text-sm leading-6 text-zinc-200 outline-none placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-emerald-400"
              id="raw-logs-input"
              onChange={(e) => setInput(e.target.value)}
              placeholder="[timestamp] LEVEL service: message"
              spellCheck={false}
              value={input}
            />

            <div className="flex items-center justify-between gap-3 border-t border-zinc-800 px-4 py-3">
              <button
                aria-describedby="analysis-status"
                className="rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-400"
                disabled={loading || !input.trim()}
                onClick={handleAnalyse}
                type="button"
              >
                {loading ? "Analysing..." : "Analyse logs"}
              </button>

              <button
                className="rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-50 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                onClick={() => {
                  setInput("");
                  setResult(null);
                }}
                type="button"
              >
                Clear
              </button>
            </div>

            <p
              aria-live="polite"
              className="sr-only"
              id="analysis-status"
              role="status"
            >
              {analysisStatus}
            </p>
          </section>

          <section
            aria-labelledby="analysis-results-heading"
            className="space-y-5"
          >
            <h2 className="sr-only" id="analysis-results-heading">
              Analysis results
            </h2>

            {result ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-md border border-zinc-800 bg-zinc-900/70 p-4">
                    <p className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-400">
                      Total lines
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-zinc-50">
                      {result.totalLines}
                    </p>
                  </div>

                  <div className="rounded-md border border-red-500/30 bg-red-500/5 p-4">
                    <p className="font-mono text-xs uppercase tracking-[0.14em] text-red-200">
                      Errors
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-red-200">
                      {result.severityCounts.ERROR}
                    </p>
                  </div>

                  <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-4">
                    <p className="font-mono text-xs uppercase tracking-[0.14em] text-amber-100">
                      Warnings
                    </p>
                    <p className="mt-3 text-3xl font-semibold text-amber-100">
                      {result.severityCounts.WARN}
                    </p>
                  </div>

                  <div className="rounded-md border border-zinc-800 bg-zinc-900/70 p-4">
                    <p className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-400">
                      Highest severity
                    </p>
                    <span
                      aria-label={`Highest severity: ${result.summary.highestSeverity}`}
                      className={`mt-4 inline-flex rounded border px-2 py-1 font-mono text-xs font-semibold ${
                        severityBadgeStyles[result.summary.highestSeverity] ??
                        "border-zinc-700 bg-zinc-800 text-zinc-300"
                      }`}
                    >
                      {result.summary.highestSeverity}
                    </span>
                  </div>
                </div>

                <div className="rounded-md border border-zinc-800 bg-zinc-900/70">
                  <div className="border-b border-zinc-800 px-4 py-3">
                    <h3 className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">
                      Summary
                    </h3>
                  </div>
                  <div className="grid gap-4 px-4 py-4 text-sm sm:grid-cols-2">
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-400">
                        Top issue
                      </p>
                      <p className="mt-2 text-zinc-200">
                        {result.summary.topIssue ?? "None detected"}
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-400">
                        Most affected service
                      </p>
                      <p className="mt-2 font-mono text-zinc-200">
                        {result.summary.mostAffectedService ?? "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  aria-labelledby="grouped-issues-heading"
                  className="rounded-md border border-zinc-800 bg-zinc-900/70"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
                    <h3
                      className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-zinc-400"
                      id="grouped-issues-heading"
                    >
                      Grouped issues
                    </h3>
                    <span
                      aria-live="polite"
                      className="font-mono text-xs text-zinc-400"
                    >
                      {result.groups.length} groups
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {severityOptions.map((level) => (
                      <button
                        key={level}
                        onClick={() => setSeverityFilter(level)}
                        className={`rounded border px-3 py-1 text-xs ${
                          severityFilter === level
                            ? "border-white bg-white text-black"
                            : "border-slate-700 text-slate-300"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                      <caption className="sr-only">
                        Grouped log issues with severity level, affected
                        service, repeated message, and occurrence count.
                      </caption>
                      <thead className="bg-zinc-950/50 font-mono text-xs uppercase tracking-[0.12em] text-zinc-400">
                        <tr className="border-b border-zinc-800">
                          <th
                            className="whitespace-nowrap px-4 py-3 font-medium"
                            scope="col"
                          >
                            Level
                          </th>
                          <th
                            className="whitespace-nowrap px-4 py-3 font-medium"
                            scope="col"
                          >
                            Service
                          </th>
                          <th
                            className="min-w-80 px-4 py-3 font-medium"
                            scope="col"
                          >
                            Message
                          </th>
                          <th
                            className="whitespace-nowrap px-4 py-3 text-right font-medium"
                            scope="col"
                          >
                            Count
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleGroups.map((group) => (
                          <tr
                            key={group.fingerprint}
                            className="border-b border-zinc-800/80 text-zinc-300 last:border-0 hover:bg-zinc-800/40"
                          >
                            <td className="px-4 py-3">
                              <span
                                aria-label={`Severity level: ${group.level}`}
                                className={`inline-flex rounded border px-2 py-1 font-mono text-xs font-semibold ${
                                  severityBadgeStyles[group.level] ??
                                  "border-zinc-700 bg-zinc-800 text-zinc-300"
                                }`}
                              >
                                {group.level}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-zinc-400">
                              {group.service ?? "Unknown"}
                            </td>
                            <td className="px-4 py-3 font-mono text-xs leading-5 text-zinc-300">
                              {group.message}
                            </td>
                            <td
                              aria-label={`${group.count} occurrences`}
                              className="px-4 py-3 text-right font-mono text-xs text-zinc-200"
                            >
                              {group.count}
                            </td>
                          </tr>
                        ))}

                        {visibleGroups.length === 0 && (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-4 py-6 text-center text-sm text-slate-400"
                            >
                              No grouped issues match this filter.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div
                aria-live="polite"
                className="flex min-h-128 items-center justify-center rounded-md border border-dashed border-zinc-800 bg-zinc-900/40 px-6 text-center"
                role="status"
              >
                <div>
                  <p className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-zinc-400">
                    Awaiting analysis
                  </p>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-400">
                    Paste service logs and run analysis to surface severity
                    counts, top issue, affected service, and grouped incidents.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
