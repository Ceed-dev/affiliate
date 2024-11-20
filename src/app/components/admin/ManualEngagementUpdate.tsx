import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { fetchAndUpdateEngagementData } from "../../utils/firebase/engagementHelpers";
import { createLogEntry } from "../../utils/logUtils";
import { LogType, LogEntry } from "../../types/log";
import { LogTable } from "../common/LogTable";

// Props for ManualEngagementUpdate component
interface ManualEngagementUpdateProps {
  title: string;
  quotaNote: string;
  apiReferences: { title: string; url: string }[];
  platform: "X" | "YouTube";
}

// ManualEngagementUpdate component: Handles manual update of engagement data for various services
export const ManualEngagementUpdate = ({
  title,
  quotaNote,
  apiReferences,
  platform,
}: ManualEngagementUpdateProps) => {
  // State variables for logs, processing status, and task progress
  const [logs, setLogs] = useState<LogEntry[]>([]); // Holds log entries
  const [isProcessing, setIsProcessing] = useState(false); // Manages processing state
  const [progress, setProgress] = useState(0); // Tracks progress (0 to 100)
  const [totalTasks, setTotalTasks] = useState(0); // Total number of tasks
  const [completedTasks, setCompletedTasks] = useState(0); // Tracks completed tasks

  /**
   * Adds a new log entry to the logs state.
   * The new log is prepended to the previous log entries.
   *
   * @param {string} log - The log message to add.
   * @param {LogType} type - The type of the log (log, warning, error).
   * @param {number} [indentLevel=0] - Optional indentation level for better visual organization of logs.
   */
  const addLog = (log: string, type: LogType, indentLevel: number = 0) => {
    setLogs((prevLogs) => [
      createLogEntry(log, type, indentLevel), // Create the new log entry
      ...prevLogs, // Preserve existing log entries
    ]);
  };

  /**
   * Updates the progress percentage whenever completedTasks or totalTasks changes.
   * The progress is calculated as (completedTasks / totalTasks) * 100.
   * This ensures the progress bar is updated in real-time as tasks are completed.
   */
  useEffect(() => {
    if (totalTasks > 0) {
      setProgress((completedTasks / totalTasks) * 100); // Calculate progress as a percentage
    }
  }, [completedTasks, totalTasks]); // Only runs when completedTasks or totalTasks changes
  
  return (
    <>
      {/* Header section with instructions */}
      <div className="w-11/12">
        <h2 className="text-md sm:text-xl lg:text-2xl font-semibold">{title}</h2>
        <p className="text-lg text-red-500 font-bold underline mt-2">{quotaNote}</p>

        {/* Links to API references */}
        <div className="mt-5 flex flex-row gap-2 overflow-x-scroll">
          {apiReferences.map((ref, index) => (
            <Link
              key={index}
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-orange-300 py-2 px-4 rounded-lg shadow-md text-center hover:bg-orange-500 whitespace-nowrap transition"
            >
              {ref.title} {/* Title of each API reference */}
            </Link>
          ))}
        </div>
      </div>

      {/* Fetch engagement data with a loading spinner and log display */}
      <div className="w-11/12 my-5">
        {/* Button to fetch engagement data */}
        <button
          className={`bg-[#25D366] hover:bg-[#25D366]/80 rounded-md py-2 px-5 shadow-md font-semibold ${
            isProcessing ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={async () => await fetchAndUpdateEngagementData(platform, setIsProcessing, addLog, setTotalTasks, setCompletedTasks)}
          disabled={isProcessing} // Disable button during processing
        >
          {isProcessing ? (
            <div className="flex flex-row items-center gap-2">
              {/* Loading spinner during processing */}
              <Image
                src="/assets/common/loading.png"
                alt="loading"
                width={30}
                height={30}
                className="animate-spin"
              />
              <span className="animate-pulse">Processing...</span>
            </div>
          ) : (
            "Fetch Engagement Data"
          )}
        </button>

        {/* Progress bar */}
        {isProcessing && totalTasks > 0 && (
          <div className="mt-5">
            <progress
              value={progress}
              max="100"
              className={`${progress !== 100 ? "animate-pulse" : ""}`} // Animate if progress is not 100%
            />
            <p className="text-center mt-2">
              {Math.round(progress)}% Completed ({completedTasks}/{totalTasks} tasks)
            </p>
          </div>
        )}

        {/* Log table to display the logs */}
        <LogTable logs={logs} />
      </div>
    </>
  );
};