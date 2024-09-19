import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ExtendedReferralData, AggregatedReferralData } from "../../types";
import { formatAddress } from "../../utils/formatters";
import { toast } from "react-toastify";
import { aggregateReferralData } from "../../utils/firebase";

type AffiliatesListProps = {
  referrals: ExtendedReferralData[];
  selectedToken: string;
};

export const AffiliatesList: React.FC<AffiliatesListProps> = ({ referrals, selectedToken }) => {
  const [referralData, setReferralData] = useState<AggregatedReferralData[]>([]);
  const [aggregating, setAggregating] = useState<boolean>(true);

  useEffect(() => {
    const fetchAndSetConversionLogs = async () => {
      setAggregating(true);
      try {
        const updatedReferrals = await aggregateReferralData(referrals);
        setReferralData(updatedReferrals);
      } catch (error) {
        // Error handling is already done in the helper function
      } finally {
        setAggregating(false);
      }
    };

    fetchAndSetConversionLogs();
  }, [referrals]);

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
      .then(() => {
        toast.success("Wallet address copied to clipboard");
      })
      .catch((error) => {
        toast.error("Failed to copy address: " + error.message);
      });
  };

  // ============= BEGIN ENGAGEMENT DATA ROW MANAGEMENT =============
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleEngagementData = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };
  // ============= END ENGAGEMENT DATA ROW MANAGEMENT =============

  return (
    <div className="bg-white shadow rounded-lg p-5 md:p-10">
      <h2 className="text-lg leading-6 font-medium text-gray-900">
        Affiliates
      </h2>
      <p className="text-gray-700 text-sm mb-5">
        A list of all affiliates.
      </p>
      {aggregating ? (
        <div className="flex flex-row items-center justify-center gap-5">
          <Image src="/assets/common/loading.png" alt="loading.png" width={50} height={50} className="animate-spin" /> 
          <p className="animate-pulse font-semibold text-gray-600">Aggregating data...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Earnings ({selectedToken})</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Conversions</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Last Conversion Date</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Creation Date</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Tweet</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Engagement</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {referralData.length ? (
                referralData.map((referral, index) => (
                  <React.Fragment key={index}>
                    <tr className="text-gray-500 hover:bg-gray-50 hover:text-gray-900">
                      <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5">
                        <p>{referral.username} <span 
                          onClick={() => handleCopyAddress(referral.affiliateWallet)}
                          className="text-blue-500 hover:text-blue-700 cursor-pointer"
                          title="Click to copy address"
                        >
                          ({formatAddress(referral.affiliateWallet)})
                        </span></p>
                      </td>
                      <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5">{referral.aggregatedEarnings}</td>
                      <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5">{referral.aggregatedConversions}</td>
                      <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5">{referral.clicks.length}</td>
                      <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 hidden lg:table-cell">{referral.aggregatedLastConversionDate ? referral.aggregatedLastConversionDate.toLocaleDateString() : "N/A"}</td>
                      <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 hidden lg:table-cell">{referral.createdAt.toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 hidden lg:table-cell">
                        {referral.tweetUrl ? (
                          <a 
                            href={referral.tweetUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                          >
                            <Image 
                              src="/brand-assets/x.png" 
                              alt="Open Tweet" 
                              width={16} 
                              height={16} 
                              className="inline-block mr-2"
                            />
                          </a>
                        ) : (
                          <span className="text-gray-500">Not Submitted</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 hidden lg:table-cell">
                        {referral.tweetEngagement ? (
                          <button onClick={() => toggleEngagementData(index)} className="text-blue-500 hover:text-blue-700">
                            {activeIndex === index ? "Hide" : "Show"}
                          </button>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </td>
                    </tr>
                    {/* View engagement data */}
                    {activeIndex === index && referral.tweetEngagement && (
                      <tr>
                        {/* Add blank cells to display data in the right column */}
                        <td className="px-6 py-4"></td>
                        <td colSpan={7} className="px-6 py-4 bg-slate-200">
                          <div className="flex text-sm justify-between">
                            <div>
                              <strong>Retweets:</strong> {referral.tweetEngagement.retweetCount}
                            </div>
                            <div>
                              <strong>Likes:</strong> {referral.tweetEngagement.likeCount}
                            </div>
                            <div>
                              <strong>Replies:</strong> {referral.tweetEngagement.replyCount}
                            </div>
                            <div>
                              <strong>Quotes:</strong> {referral.tweetEngagement.quoteCount}
                            </div>
                            <div>
                              <strong>Impressions:</strong> {referral.tweetEngagement.impressionCount}
                            </div>
                            <div>
                              <strong>Bookmarks:</strong> {referral.tweetEngagement.bookmarkCount}
                            </div>
                          </div>
                          <div className="mt-4 text-right text-gray-500 text-sm">
                            <strong>Fetched At:</strong> {new Date(referral.tweetEngagement.fetchedAt).toLocaleString()}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr className="text-gray-500">
                  <td colSpan={8} className="text-center py-4">No Referral Data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};