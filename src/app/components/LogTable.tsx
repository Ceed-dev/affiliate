import React from "react";
import { LogEntry } from "../types/log";

// Define the props for the LogTable component
type LogTableProps = {
  logs: LogEntry[]; // The array of log entries to be displayed
};

/**
 * LogTable Component
 * Displays a table with timestamp, type, and log message for each log entry.
 * Background color is applied based on the log type (log, warning, or error).
 * Indentation is applied to the log message based on the indentLevel.
 */
export const LogTable: React.FC<LogTableProps> = ({ logs }) => {
  return (
    <div className="my-5">
      {/* Display the total number of logs */}
      <h3 className="font-semibold text-lg mb-2">
        Processing Logs: ({logs.length} {logs.length === 1 ? "log" : "logs"})
      </h3>

      <div className="bg-gray-100 p-3 rounded-md mt-3 overflow-auto max-h-[700px]">
        {/* Table for displaying logs */}
        <table className="table-auto w-full border-collapse border border-gray-300 text-md">
          <thead>
            <tr>
              <th className="border border-gray-300 px-2 py-1 text-left whitespace-nowrap">Timestamp</th>
              <th className="border border-gray-300 px-2 py-1 text-left">Type</th>
              <th className="border border-gray-300 px-2 py-1 text-left">Log Message</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index} className="mb-1">
                {/* Display the timestamp of the log */}
                <td className="border border-gray-300 px-2 py-1 whitespace-nowrap">
                  <span className="text-gray-700">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                </td>

                {/* Display the log type with background color based on the type */}
                <td className={`border border-gray-300 px-2 py-1 ${log.type === "error" ? "bg-red-200" : log.type === "warning" ? "bg-yellow-200" : "bg-sky-200"}`}>
                  <span className="font-semibold text-black">
                    {log.type.toUpperCase()}
                  </span>
                </td>

                {/* Display the log message with visual indentation using "|--" */}
                <td className="border border-gray-300 px-2 py-1">
                  <span className="text-gray-700">
                    {log.indentLevel > 0 
                      ? <span style={{ marginLeft: `${log.indentLevel * 10}px` }}>|--</span>
                      : null}
                    {log.log}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};