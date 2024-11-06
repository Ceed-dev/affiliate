import React, { useState, useEffect } from "react";
import Image from "next/image";
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
                      </tr>
                    </React.Fragment>
                  ))
                ) : (
                  /* Message to display when no referral data is available */
                  <tr className="text-gray-500">
                    <td colSpan={5} className="text-center py-4">
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