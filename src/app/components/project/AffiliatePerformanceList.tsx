import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AffiliatePerformanceData, AggregatedAffiliatePerformanceData } from "../../types/referralTypes";
import { formatAddress } from "../../utils/formatUtils";
import { copyToClipboard } from "../../utils/generalUtils";

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
      <div className="shadow rounded-lg">
        {/* Display loading indicator while aggregating data */}
        {aggregating ? (
          <div className="py-10 flex flex-row items-center justify-center gap-5">
            <Image
              src="/assets/common/loading.png"
              alt="Loading indicator"
              width={50}
              height={50}
              className="animate-spin"
            /> 
            <p className="animate-pulse font-semibold text-gray-600">
              Aggregating data...
            </p>
          </div>
        ) : (
          /* Table displaying the aggregated affiliate performance data */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              {/* Table header with columns for affiliate performance metrics */}
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    Influencer
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    Earnings
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    Conversions
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    Creation Date
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    Social Engagement
                  </th>
                </tr>
              </thead>
  
              {/* Table body with rows for each affiliate’s performance data */}
              <tbody className="bg-white divide-y divide-gray-200">
                {referralData.length ? (
                  referralData.map((referral, index) => (
                    <React.Fragment key={index}>
                      <tr className="text-gray-500 hover:bg-gray-50 hover:text-gray-900">
                        {/* Affiliate username with copy-to-clipboard functionality for wallet address */}
                        <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5">
                          <p>
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
                          </p>
                        </td>
                        {/* Display aggregated earnings */}
                        <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5">
                          {referral.aggregatedEarnings}
                        </td>
                        {/* Display total number of conversions */}
                        <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5">
                          {referral.aggregatedConversionLogs}
                        </td>
                        {/* Display total number of clicks */}
                        <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5">
                          {referral.clicks.length}
                        </td>
                        {/* Display referral creation date */}
                        <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5">
                          {referral.createdAt.toLocaleDateString()}
                        </td>
                        {/* Display Social Engagement Data Toggle Button */}
                        <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5">
                          <button onClick={() => toggleRowExpansion(referral.id!)} className="text-blue-500 hover:text-blue-700">
                            {expandedRows[referral.id!] ? "Hide" : "Detail"}
                          </button>
                        </td>
                      </tr>

                      {/* TODO: Fix UI */}
                      {expandedRows[referral.id!] && (
                        <tr className="bg-gray-50">
                          {/* Empty cell to align with the main table structure */}
                          <td />

                          {/* Tweet Engagement Data */}
                          {referral.tweets && referral.tweets.length > 0 && (
                            <td colSpan={5} className="py-2">
                              {referral.tweets.map((tweet) => (
                                <tr key={tweet.tweetId} className="flex justify-between">
                                  {/* Display Tweet Impressions */}
                                  <td className="flex flex-col items-center">
                                    <p className="text-sm font-medium">Impressions</p>
                                    <p>{tweet.metrics.impressionCount}</p>
                                  </td>
                                  {/* Display Tweet Likes */}
                                  <td className="flex flex-col items-center">
                                    <p className="text-sm font-medium">Likes</p>
                                    <p>{tweet.metrics.likeCount}</p>
                                  </td>
                                  {/* Display Tweet Retweets */}
                                  <td className="flex flex-col items-center">
                                    <p className="text-sm font-medium">Retweets</p>
                                    <p>{tweet.metrics.retweetCount}</p>
                                  </td>
                                  {/* Display Tweet Bookmarks */}
                                  <td className="flex flex-col items-center">
                                    <p className="text-sm font-medium">Bookmarks</p>
                                    <p>{tweet.metrics.bookmarkCount}</p>
                                  </td>
                                  {/* Link to view the actual tweet on Twitter */}
                                  <Link
                                    href={tweet.tweetUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-slate-200 hover:bg-slate-300 rounded-full px-4 my-1 font-semibold flex items-center justify-center mr-20"
                                  >
                                    View Post
                                  </Link>
                                </tr>
                              ))}
                            </td>
                          )}
                        </tr>
                      )}

                      {expandedRows[referral.id!] && (
                        <tr className="bg-gray-50">
                          {/* Empty cells to align with the main table structure */}
                          <td />
                          <td />

                          {/* YouTube Video Engagement Data */}
                          {referral.youtubeVideos && referral.youtubeVideos.length > 0 && (
                            <td colSpan={4} className="py-2">
                              {referral.youtubeVideos.map((video) => (
                                <tr key={video.videoId} className="flex justify-between">
                                  {/* Display YouTube Video Comments */}
                                  <td className="flex flex-col items-center">
                                    <p className="text-sm font-medium">Comments</p>
                                    <p>{video.statistics.commentCount}</p>
                                  </td>
                                  {/* Display YouTube Video Likes */}
                                  <td className="flex flex-col items-center">
                                    <p className="text-sm font-medium">Likes</p>
                                    <p>{video.statistics.likeCount}</p>
                                  </td>
                                  {/* Display YouTube Video Views */}
                                  <td className="flex flex-col items-center">
                                    <p className="text-sm font-medium">Views</p>
                                    <p>{video.statistics.viewCount}</p>
                                  </td>
                                  {/* Link to view the actual video on YouTube */}
                                  <Link
                                    href={`https://www.youtube.com/watch?v=${video.videoId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-slate-200 hover:bg-slate-300 rounded-full px-4 my-1 font-semibold flex items-center justify-center mr-20"
                                  >
                                    View Video
                                  </Link>
                                </tr>
                              ))}
                            </td>
                          )}
                        </tr>
                      )}

                    </React.Fragment>
                  ))
                ) : (
                  /* Message to display when no referral data is available */
                  <tr className="text-gray-500">
                    <td colSpan={6} className="text-center py-4">
                      No Referral Data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );  
};