export type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG" | "UNKNOWN";

export type ParsedLog = {
  raw: string;
  timestamp?: string;
  level: LogLevel;
  service?: string;
  message: string;
};

export type ErrorGroup = {
  fingerprint: string;
  message: string;
  count: number;
  level: LogLevel;
  service?: string;
  examples: string[];
};

export type AnalysisResult = {
  totalLines: number;
  parsedLines: number;
  severityCounts: Record<LogLevel, number>;
  groups: ErrorGroup[];
  summary: {
    topIssue?: string;
    mostAffectedService?: string;
    highestSeverity: LogLevel;
  };
};