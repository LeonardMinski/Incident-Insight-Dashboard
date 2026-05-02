import { LogLevel, ParsedLog } from "@/types/logs";

export function parseLogLine(line: string): ParsedLog {
  const trimmed = line.trim();

  const levelMatch = trimmed.match(/\b(INFO|WARN|ERROR|DEBUG)\b/i);
  const level = (levelMatch?.[1]?.toUpperCase() as LogLevel) || "UNKNOWN";

  return {
    raw: line,
    level,
    message: trimmed,
  };
}