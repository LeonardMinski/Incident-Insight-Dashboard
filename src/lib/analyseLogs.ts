import { AnalysisResult, LogLevel, ParsedLog } from "@/types/logs";
import { createFingerprint, parseLogLine } from "./logParser";

const logLevels: LogLevel[] = ["INFO", "WARN", "ERROR", "DEBUG", "UNKNOWN"];

export function analyseLogs(input: string): AnalysisResult {
  const lines = input.split("\n").filter((line) => line.trim().length > 0);

  const parsed = lines.map(parseLogLine);

  const severityCounts = logLevels.reduce(
    (acc, level) => {
      acc[level] = 0;
      return acc;
    },
    {} as Record<LogLevel, number>,
  );

  parsed.forEach((log) => {
    if (severityCounts[log.level] !== undefined) {
      severityCounts[log.level] += 1;
    }
  });

  const groups: Record<string, ParsedLog[]> = {};

  parsed.forEach((log) => {
    if (log.level !== "ERROR" && log.level !== "WARN") return;

    const fingerprint = createFingerprint(log.message);

    if (!groups[fingerprint]) {
      groups[fingerprint] = [];
    }

    groups[fingerprint].push(log);
  });

  const sortedEntries = Object.entries(groups).sort(
    (a, b) => b[1].length - a[1].length,
  );

  const errorGroups = sortedEntries.map(([fingerprint, logs]) => {
    const firstLog = logs[0];

    return {
      fingerprint,
      message: firstLog.message,
      count: logs.length,
      level: firstLog.level,
      service: firstLog.service,
      examples: logs.map((log) => log.raw).slice(0, 3),
    };
  });

  const serviceCounts: Record<string, number> = {};

  parsed.forEach((log) => {
    if (!log.service) return;

    serviceCounts[log.service] = (serviceCounts[log.service] || 0) + 1;
  });

  const mostAffectedService = Object.entries(serviceCounts).sort(
    (a, b) => b[1] - a[1],
  )[0]?.[0];

  const highestSeverity: LogLevel =
    severityCounts.ERROR > 0
      ? "ERROR"
      : severityCounts.WARN > 0
        ? "WARN"
        : severityCounts.INFO > 0
          ? "INFO"
          : "UNKNOWN";

  return {
    totalLines: lines.length,
    parsedLines: parsed.length,
    severityCounts,
    groups: errorGroups,
    summary: {
      topIssue: errorGroups[0]?.message,
      mostAffectedService,
      highestSeverity,
    },
  };
}
