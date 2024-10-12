import { LogType, LogEntry } from "../types/log";

/**
 * Creates a new log entry with the specified log message, log type, and indentation level.
 * Automatically generates a timestamp for the log entry.
 *
 * @param log - The log message to be recorded.
 * @param type - The type of the log (log, warning, or error).
 * @param indentLevel - The level of indentation for the log (default is 0).
 * @returns A new LogEntry object.
 */
export const createLogEntry = (
  log: string, 
  type: LogType, 
  indentLevel: number = 0
): LogEntry => ({
  timestamp: new Date(),
  log,
  type,
  indentLevel,
});