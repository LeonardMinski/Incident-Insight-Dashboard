import { AnalysisResult, LogLevel } from "@/types/logs";
import { parseLogLine } from "./logParser";
import { createFingerprint } from "./logParser";
import { ParsedLog } from "@/types/logs";

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
  // next: group logs
  const groups: Record<string, ParsedLog[]> = {};
  parsed.forEach((log) => {
    const fingerprint = createFingerprint(log.message);
    if (!groups[fingerprint]) {
      groups[fingerprint] = [];
    }
    groups[fingerprint].push(log);
  });
  // next: sort groups
  // next: build summary

  return {
    totalLines: lines.length,
    parsedLines: parsed.length,
    severityCounts,
    groups: [],
    summary: {
      highestSeverity: "UNKNOWN",
    },
  };
}
