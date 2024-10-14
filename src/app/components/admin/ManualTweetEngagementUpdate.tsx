import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "react-toastify"; // Import toast for notifications
import { X_API_REFERENCES } from "../../constants/xApiConstants"; // X API reference links
import { fetchAllReferralIds } from "../../utils/firebase"; // Fetch function to get all referral IDs from Firebase
import { fetchAndUpdateTweetEngagementData } from "../../utils/firebase/tweetEngagementHelpers";
import { createLogEntry } from "../../utils/logUtils";
import { ExtendedTweetEngagement } from "../../types"; // Type definition for extended tweet engagement data
import { LogType, LogEntry } from "../../types/log";
import { LogTable } from "../LogTable";

// Props interface for ManualTweetEngagementUpdate component
interface ManualTweetEngagementUpdateProps {
  referralIdsForTweetEngagementData: string; // Referral IDs entered by the user
  setReferralIdsForTweetEngagementData: (value: string) => void; // Function to set referral IDs
  handleFetchTweetEngagement: () => Promise<void>; // Function to fetch engagement data from X API
  loadingTweetEngagementData: boolean; // Boolean to indicate if engagement data is loading
  engagementDataArray: ExtendedTweetEngagement[] | null; // Array of tweet engagement data
}

// ManualTweetEngagementUpdate component: Handles manual update of tweet engagement data
export const ManualTweetEngagementUpdate: React.FC<ManualTweetEngagementUpdateProps> = ({
  referralIdsForTweetEngagementData,
  setReferralIdsForTweetEngagementData,
  handleFetchTweetEngagement,
  loadingTweetEngagementData,
  engagementDataArray,
}) => {
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
        <h2 className="text-md sm:text-xl lg:text-2xl font-semibold">Manually update Tweet engagement data</h2>
        <p className="text-lg text-red-500 font-bold underline mt-2">
          Note: X API allows up to 10,000 engagement data retrievals per month. Be mindful of the usage limits.
        </p>

        {/* Links to X API references */}
        <div className="mt-5 flex flex-row gap-2">
          {X_API_REFERENCES.map((ref, index) => (
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

      {/* Fetch tweet engagement data with a loading spinner and log display */}
      <div className="w-11/12 mt-5">
        {/* Button to fetch tweet engagement data */}
        <button
          className={`bg-sky-300 hover:bg-sky-400 rounded-md py-2 px-5 shadow-md font-semibold ${
            isProcessing ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={async () => await fetchAndUpdateTweetEngagementData(setIsProcessing, addLog, setTotalTasks, setCompletedTasks)} // Fetch and update data on click
          disabled={isProcessing} // Disable button during processing
        >
          {isProcessing ? (
            <div className="flex flex-row items-center gap-2">
              {/* Loading spinner during processing */}
              <Image src="/assets/common/loading.png" alt="loading" width={30} height={30} className="animate-spin" />
              <span className="animate-pulse">Processing...</span>
            </div>
          ) : (
            "Fetch Tweet Engagement Data"
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

      {/* Input for referral IDs */}
      <div className="w-11/12 mt-5">
        <div className="flex flex-col lg:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Enter referral IDs separated by commas, e.g. n1L5kdmanZzOlMQs20wH,C2xmmXIW0p8tqki4IVFG"
            className="border border-gray-300 p-2 rounded w-full lg:w-2/3 outline-none" 
            value={referralIdsForTweetEngagementData} 
            onChange={(e) => setReferralIdsForTweetEngagementData(e.target.value)} // Update referral IDs input
          />
          <button 
            className={`bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded ${!referralIdsForTweetEngagementData ? "opacity-50 cursor-not-allowed" : ""}`} 
            onClick={handleFetchTweetEngagement} // Trigger fetching tweet engagement data
            disabled={!referralIdsForTweetEngagementData} // Disable button if no referral IDs are entered
          >
            Fetch & Update
          </button>
          <button 
            className="bg-orange-500 hover:bg-orange-700 text-white px-4 py-2 rounded" 
            onClick={async () => {
              // Fetch all referral IDs and update the input field
              const fetchedReferralIds = await fetchAllReferralIds();
              setReferralIdsForTweetEngagementData(fetchedReferralIds.join(","));
              
              // Show success notification with the number of fetched referrals
              toast.success(`${fetchedReferralIds.length} referral IDs fetched successfully`);
            }}
          >
            Fetch All Referrals
          </button>
        </div>
      </div>

      {/* Display loading state or engagement data */}
      {loadingTweetEngagementData ? (
        <div className="flex justify-center items-center my-5">
          {/* Loading spinner */}
          <Image src="/assets/common/loading.png" alt="loading" width={50} height={50} className="animate-spin" />
        </div>
      ) : engagementDataArray ? (
        <div className="w-11/12 mt-5 mb-10 bg-gray-100 p-5 rounded-lg shadow-md">
          {/* Header for engagement data table */}
          <h3 className="text-lg font-semibold mb-4">
            Tweet Engagement Data 
            {engagementDataArray.length > 0 && (
              <span className="text-sm">({engagementDataArray[0].fetchedAt.toLocaleString()})</span>
            )}
          </h3>

          {/* Table displaying engagement data */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-md shadow-md">
              <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <tr>
                  <th className="py-3 px-6 text-right whitespace-nowrap">Referral Id</th>
                  <th className="py-3 px-6 text-right whitespace-nowrap">Tweet</th>
                  <th className="py-3 px-6 text-right whitespace-nowrap">Retweet</th>
                  <th className="py-3 px-6 text-right whitespace-nowrap">Like</th>
                  <th className="py-3 px-6 text-right whitespace-nowrap">Reply</th>
                  <th className="py-3 px-6 text-right whitespace-nowrap">Quote</th>
                  <th className="py-3 px-6 text-right whitespace-nowrap">Impression</th>
                  <th className="py-3 px-6 text-right whitespace-nowrap">Bookmark</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-sm">
                {/* Map through engagement data array to display each record */}
                {engagementDataArray.map((data, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6 text-right">{data.referralId}</td>
                    <td className="py-3 px-6 text-right">
                      {/* Display tweet link or "Not Submitted" if missing */}
                      {data.tweetUrl ? (
                        <Link
                          href={data.tweetUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                        >
                          <Image 
                            src="/brand-assets/x/black.png" 
                            alt="Open Tweet" 
                            width={16} 
                            height={16} 
                            className="inline-block mr-2"
                          />
                        </Link>
                      ) : (
                        <span className="text-gray-500">Not Submitted</span>
                      )}
                    </td>
                    <td className="py-3 px-6 text-right">{data.retweetCount}</td>
                    <td className="py-3 px-6 text-right">{data.likeCount}</td>
                    <td className="py-3 px-6 text-right">{data.replyCount}</td>
                    <td className="py-3 px-6 text-right">{data.quoteCount}</td>
                    <td className="py-3 px-6 text-right">{data.impressionCount}</td>
                    <td className="py-3 px-6 text-right">{data.bookmarkCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Display message if no engagement data is present
        <p className="text-md text-gray-600 my-5">No Data Yet...</p>
      )}
    </>
  );
}