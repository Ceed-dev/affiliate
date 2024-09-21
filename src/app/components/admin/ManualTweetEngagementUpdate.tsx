import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import { xApiReferences } from "../../constants/xApiReferences";
import { fetchAllReferralIds } from "../../utils/firebase";
import { ExtendedTweetEngagement } from "../../types";

interface ManualTweetEngagementUpdateProps {
  referralIdsForTweetEngagementData: string;
  setReferralIdsForTweetEngagementData: (value: string) => void;
  handleFetchTweetEngagement: () => Promise<void>;
  loadingTweetEngagementData: boolean;
  engagementDataArray: ExtendedTweetEngagement[] | null;
}

export const ManualTweetEngagementUpdate: React.FC<ManualTweetEngagementUpdateProps> = ({
  referralIdsForTweetEngagementData,
  setReferralIdsForTweetEngagementData,
  handleFetchTweetEngagement,
  loadingTweetEngagementData,
  engagementDataArray,
}) => {
  return (
    <>
      <div className="w-11/12">
        <h2 className="text-md sm:text-xl lg:text-2xl font-semibold">Manually update Tweet engagement data</h2>
        <p className="text-sm text-gray-600">Enter specific Referral IDs to manually retrieve and update the latest engagement data.</p>
        <p className="text-lg text-red-500 font-bold underline mt-2">
          Note: X API allows up to 10,000 engagement data retrievals per month. Be mindful of the usage limits.
        </p>
        {/* Display buttons for API references */}
        <div className="mt-5 flex flex-row gap-2">
          {xApiReferences.map((ref, index) => (
            <Link
              key={index}
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-orange-300 py-2 px-4 rounded-lg shadow-md text-center hover:bg-orange-500 transition"
            >
              {ref.title}
            </Link>
          ))}
        </div>
      </div>

      {/* Referral IDs input section */}
      <div className="w-11/12 mt-5">
        <div className="flex flex-col lg:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Enter referral IDs separated by commas, e.g. n1L5kdmanZzOlMQs20wH,C2xmmXIW0p8tqki4IVFG"
            className="border border-gray-300 p-2 rounded w-full lg:w-2/3 outline-none" 
            value={referralIdsForTweetEngagementData} 
            onChange={(e) => setReferralIdsForTweetEngagementData(e.target.value)}
          />
          <button 
            className={`bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded ${!referralIdsForTweetEngagementData ? "opacity-50 cursor-not-allowed" : ""}`} 
            onClick={handleFetchTweetEngagement}
            disabled={!referralIdsForTweetEngagementData}
          >
            Fetch & Update
          </button>
          <button 
            className="bg-orange-500 hover:bg-orange-700 text-white px-4 py-2 rounded" 
            onClick={async () => {
              const fetchedReferralIds = await fetchAllReferralIds();
              setReferralIdsForTweetEngagementData(fetchedReferralIds.join(","));
              
              // Show toast notification with the number of fetched referrals
              toast.success(`${fetchedReferralIds.length} referral IDs fetched successfully`);
            }}
          >
            Fetch All Referrals
          </button>
        </div>
      </div>

      {/* Update result display area */}
      {loadingTweetEngagementData ? (
        <div className="flex justify-center items-center my-5">
          <Image src="/assets/common/loading.png" alt="loading" width={50} height={50} className="animate-spin" />
        </div>
      ) : engagementDataArray ? (
        <div className="w-11/12 mt-5 mb-10 bg-gray-100 p-5 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">
            Tweet Engagement Data 
            {engagementDataArray.length > 0 && (
              <span className="text-sm">({engagementDataArray[0].fetchedAt.toLocaleString()})</span>
            )}
          </h3>
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
                {engagementDataArray.map((data, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6 text-right">{data.referralId}</td>
                    <td className="py-3 px-6 text-right">
                      {data.tweetUrl ? (
                        <Link
                          href={data.tweetUrl} 
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
        <p className="text-md text-gray-600 my-5">No Data Yet...</p>
      )}
    </>
  );
}