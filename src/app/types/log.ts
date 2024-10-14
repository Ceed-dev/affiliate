export type LogType = "log" | "warning" | "error";

export type LogEntry = {
  timestamp: Date;     // Log entry timestamp
  log: string;         // The log message
  type: LogType;       // Type of the log: log, warning, or error
  indentLevel: number; // Indentation level for log display, default is 0
};