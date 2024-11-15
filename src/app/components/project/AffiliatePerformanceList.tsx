import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { TweetMetrics, YouTubeVideoStatistics } from "../../types/affiliateInfo";
import { AffiliatePerformanceData, AggregatedAffiliatePerformanceData } from "../../types/referralTypes";
import { formatAddress } from "../../utils/formatUtils";
import { copyToClipboard, formatNumberWithUnits } from "../../utils/generalUtils";

// Define the props for AffiliatePerformanceList
type AffiliatePerformanceListProps = {
  referrals: AffiliatePerformanceData[]; // Array of affiliate performance data objects
};

/**
 * AffiliatePerformanceList component
 * 
 * This component displays a detailed list of performance data for each affiliate. 
 * It aggregates clicks, conversions, and earnings per affiliate and provides a 
 * table view with real-time updates.
 *
 * @component
 * @param {AffiliatePerformanceData[]} referrals - An array of affiliate performance data objects
 * 
 * @returns A styled table with aggregated affiliate performance data, including 
 *          influencer username, earnings, conversions, clicks, and creation date.
 */
export const AffiliatePerformanceList: React.FC<AffiliatePerformanceListProps> = ({
  referrals,
}) => {
  // State to store aggregated referral performance data
  const [referralData, setReferralData] = useState<AggregatedAffiliatePerformanceData[]>([]);

  // State to manage the loading indicator while aggregating data
  const [aggregating, setAggregating] = useState<boolean>(true);

  // State to manage the expanded/collapsed status of each referral row.
  // The keys in this object represent referral IDs, and the values are booleans 
  // indicating whether the row is expanded (true) or collapsed (false) for each referral.
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});

  // CSS classes for table headers, defining background, text style, and alignment for uniform header styling.
  const tableHeaderClass = "px-6 py-3 bg-[#F5F5F5] text-left text-xs leading-4 font-medium text-black/60 uppercase tracking-wider whitespace-nowrap";

  // CSS classes for regular table cells, ensuring consistent padding, text size, and line height.
  const cellClass = "px-6 py-4 whitespace-nowrap text-sm leading-5";

  // Function to dynamically generate CSS classes for the toggle button based on its expanded/collapsed state.
  // When expanded, the button has text-only styling; otherwise, it has a background and rounded edges.
  const buttonClass = (isExpanded: boolean) =>
    `py-2 px-4 ml-9 font-semibold ${isExpanded ? "px-5 text-black/60 hover:text-black/80" : "bg-black/5 hover:bg-black/20 rounded-full"}`;

  // Array of tweet metrics with each metric's key and display label.
  // This array is used to dynamically render tweet engagement data with labels in the UI.
  const tweetMetricKeys: [keyof TweetMetrics, string][] = [
    ["impressionCount", "Impressions"],
    ["likeCount", "Likes"],
    ["retweetCount", "Retweets"],
    ["bookmarkCount", "Bookmarks"],
  ];

  // Array of YouTube video metrics with each metric's key and display label.
  // This array facilitates dynamic rendering of YouTube engagement data with appropriate labels.
  const youtubeMetricKeys: [keyof YouTubeVideoStatistics, string][] = [
    ["commentCount", "Comments"],
    ["likeCount", "Likes"],
    ["viewCount", "Views"],
  ];

  useEffect(() => {
    // Process each referral to calculate total earnings and conversion counts
    const aggregatedData = referrals.map(referral => {
      // Calculate the total earnings by summing up the 'amount' field from each conversion log
      const totalAmount = referral.conversionLogs.reduce((sum, log) => sum + log.amount, 0);
      
      // Calculate the total number of conversions by counting the conversion log entries
      const totalConversionLogs = referral.conversionLogs.length;

      // Return a new referral object including the aggregated earnings and conversion count
      return {
        ...referral,
        aggregatedEarnings: totalAmount,
        aggregatedConversionLogs: totalConversionLogs,
      };
    });

    // Update the state with the newly aggregated referral data
    setReferralData(aggregatedData);
    
    // Set aggregating to false to hide the loading indicator
    setAggregating(false);
    
  }, [referrals]);

  // Function to toggle the expansion state of a specific referral row.
  // When called with a referral ID, it updates the `expandedRows` state,
  // flipping the boolean value for that specific ID. If the row is currently
  // expanded (true), it will collapse (false), and vice versa.
  const toggleRowExpansion = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-2">

      {/* Header for the Engagement Table */}
      <h1 className="font-bold text-xl">Engagement</h1>

      {/* Affiliate Performance List Table */}
      {aggregating ? (
        // Display loading indicator while aggregating data 
        <div className="bg-[#F5F5F5] py-10 rounded-lg flex flex-row items-center justify-center gap-5">
          <Image
            src="/assets/common/loading.png"
            alt="Loading indicator"
            width={50}
            height={50}
            className="animate-spin"
          /> 
          <p className="animate-pulse font-semibold text-black/60">
            Aggregating data...
          </p>
        </div>
      ) : (
        // Table displaying the aggregated affiliate performance data
        <div className="overflow-x-auto rounded-lg border border-black/10">
          <table className="min-w-full">
            {/* Table header with columns for affiliate performance metrics */}
            <thead>
              <tr>
                {["Influencer", "Earnings", "Conversions", "Clicks", "Creation Date", "Social Engagement"].map((header, index, array) => (
                  <th
                    key={header}
                    className={`${tableHeaderClass} ${index === 0 && "rounded-tl-lg"} ${index === array.length - 1 && "rounded-tr-lg"}`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table body with rows for each affiliate’s performance data */}
            <tbody className="divide-y divide-black/10">
              {referralData.length ? (
                referralData.map((referral, index) => (
                  <React.Fragment key={index}>
                    <tr className="hover:bg-gray-50">
                      {[
                        {
                          content: (
                            <>
                              {referral.username}{" "}
                              <span
                                onClick={() =>
                                  copyToClipboard(
                                    referral.affiliateWallet,
                                    "Wallet address copied to clipboard",
                                    "Failed to copy address"
                                  )
                                }
                                className="text-blue-500 hover:text-blue-700 cursor-pointer"
                                title="Click to copy address"
                              >
                                ({formatAddress(referral.affiliateWallet)})
                              </span>
                            </>
                          ),
                        },
                        { content: formatNumberWithUnits(referral.aggregatedEarnings) },
                        { content: formatNumberWithUnits(referral.aggregatedConversionLogs) },
                        { content: formatNumberWithUnits(referral.clicks.length) },
                        { content: referral.createdAt.toLocaleDateString() },
                        {
                          content: (
                            <button
                              onClick={() => toggleRowExpansion(referral.id!)}
                              className={buttonClass(expandedRows[referral.id!])}
                            >
                              {expandedRows[referral.id!] ? "Hide" : "Detail"}
                            </button>
                          ),
                        },
                      ].map((item, index) => (
                        <td key={index} className={cellClass}>
                          {item.content}
                        </td>
                      ))}
                    </tr>

                    {/* Tweet Engagement Data */}
                    {expandedRows[referral.id!] && referral.tweets && referral.tweets.length > 0 && (
                      referral.tweets.map((tweet) => (
                        <tr key={tweet.tweetId} className="bg-[#F5F5F5]">
                          {/* Left empty cell to align with the "Influencer" column */}
                          <td className="px-6 py-2" />

                          {/* Map through tweet metrics to render each metric cell */}
                          {tweetMetricKeys.map(([metric, label], idx) => (
                            <td key={idx} className="px-6 py-2">
                              <p className="text-sm text-[#757575]">{label}</p>
                              <p>{formatNumberWithUnits(tweet.metrics[metric])}</p>
                            </td>
                          ))}

                          {/* Link to view the actual tweet on X */}
                          <td className="px-6 py-2">
                            <Link
                              href={tweet.tweetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-2 px-4 ml-4 font-semibold rounded-full bg-black/5 hover:bg-black/20"
                            >
                              View Post
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}

                    {/* YouTube Video Engagement Data */}
                    {expandedRows[referral.id!] && referral.youtubeVideos && referral.youtubeVideos.length > 0 && (
                      referral.youtubeVideos.map((video) => (
                        <tr key={video.videoId} className="bg-[#F5F5F5]">
                          {/* Left empty cells to align with the "Influencer" and "Earnings" columns */}
                          <td className="px-6 py-2" />
                          <td className="px-6 py-2" />

                          {/* Map through YouTube metrics to render each metric cell */}
                          {youtubeMetricKeys.map(([metric, label], idx) => (
                            <td key={idx} className="px-6 py-2">
                              <p className="text-sm text-[#757575]">{label}</p>
                              <p>{formatNumberWithUnits(video.statistics[metric])}</p>
                            </td>
                          ))}

                          {/* Link to watch the actual video on YouTube */}
                          <td className="px-6 py-2">
                            <Link
                              href={`https://www.youtube.com/watch?v=${video.videoId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-2 px-4 ml-2 font-semibold rounded-full bg-black/5 hover:bg-black/20"
                            >
                              Watch Video
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}

                  </React.Fragment>
                ))
              ) : (
                /* Message to display when no affiliate performance data is available */
                <tr>
                  <td colSpan={6} className="text-black/60 text-center py-4">
                    No Referral Data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );  
};