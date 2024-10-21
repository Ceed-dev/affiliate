import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { YOUTUBE_API_REFERENCES } from "../../constants/googleApiConstants"; // YouTube API reference links
// import { fetchAndUpdateYouTubeEngagementData } from "../../utils/firebase/youtubeEngagementHelpers";
import { createLogEntry } from "../../utils/logUtils";
import { LogType, LogEntry } from "../../types/log";
import { LogTable } from "../LogTable";

// ManualYouTubeVideoEngagementUpdate component: Handles manual update of YouTube video engagement data
export const ManualYouTubeVideoEngagementUpdate = ({}) => {
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
        <h2 className="text-md sm:text-xl lg:text-2xl font-semibold">Manually update YouTube video engagement data</h2>
        <p className="text-lg text-red-500 font-bold underline mt-2">
          Note: YouTube Data API has a quota limit. Be mindful of the usage limits.
        </p>

        {/* Links to YouTube API references */}
        <div className="mt-5 flex flex-row gap-2">
          {YOUTUBE_API_REFERENCES.map((ref, index) => (
            <Link
              key={index}
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-orange-300 py-2 px-4 rounded-lg shadow-md text-center hover:bg-orange-500 transition"
            >
              {ref.title} {/* Title of each API reference */}
            </Link>
          ))}
        </div>
      </div>

      {/* Fetch YouTube video engagement data with a loading spinner and log display */}
      <div className="w-11/12 my-5">
        {/* Button to fetch YouTube video engagement data */}
        <button
          className={`bg-sky-300 hover:bg-sky-400 rounded-md py-2 px-5 shadow-md font-semibold ${
            isProcessing ? "opacity-50 cursor-not-allowed" : ""
          }`}
          // onClick={async () => await fetchAndUpdateYouTubeEngagementData(setIsProcessing, addLog, setTotalTasks, setCompletedTasks)} // Fetch and update data on click
          onClick={() => {}}
          disabled={isProcessing} // Disable button during processing
        >
          {isProcessing ? (
            <div className="flex flex-row items-center gap-2">
              {/* Loading spinner during processing */}
              <Image src="/assets/common/loading.png" alt="loading" width={30} height={30} className="animate-spin" />
              <span className="animate-pulse">Processing...</span>
            </div>
          ) : (
            "Fetch YouTube Video Engagement Data"
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
}