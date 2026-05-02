import { LogLevel, ParsedLog } from "@/types/logs";

export function parseLogLine(line: string): ParsedLog {
  const trimmed = line.trim();

  const timestampMatch =
    trimmed.match(/\[(.*?)\]/) ||
    trimmed.match(/\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z\b/);

  const levelMatch = trimmed.match(/\b(INFO|WARN|ERROR|DEBUG)\b/i);

  const level = (levelMatch?.[1]?.toUpperCase() as LogLevel) || "UNKNOWN";

  const serviceMatch = trimmed.match(
    /\b(INFO|WARN|ERROR|DEBUG)\b\s+([a-zA-Z0-9-_]+)[:\s-]/i
  );

  const service = serviceMatch?.[2];

  let message = trimmed;

  if (levelMatch) {
    message = message.replace(levelMatch[0], "").trim();
  }

  if (timestampMatch) {
    message = message.replace(timestampMatch[0], "").trim();
  }

  if (service) {
    message = message.replace(service, "").replace(/^[:\s-]+/, "").trim();
  }

  return {
    raw: line,
    timestamp: timestampMatch?.[1] || timestampMatch?.[0],
    level,
    service,
    message,
  };
}