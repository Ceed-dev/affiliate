"use client";

// React and Next.js Imports
import { useState, useEffect } from "react";
import Image from "next/image";
import { useAddress } from "@thirdweb-dev/react";

// Libraries and External Utilities
import { getChainByChainIdAsync } from "@thirdweb-dev/chains";
import { toast } from "react-toastify";

// Components
import { ProjectHeader, ConversionPointsTable } from "../../components/project";
import { StatisticCard } from "../../components/dashboard/StatisticCard";
import { BarChart } from "../../components/dashboard";

// Types
import { ProjectData, ReferralData, ConversionLog, ClickData, Tier } from "../../types";

// Firebase and Blockchain Utilities
import { 
  fetchProjectData, 
  fetchReferralData, 
  joinProject, 
  fetchConversionLogsForReferrals, 
  fetchClickData 
} from "../../utils/firebase";
import { getProvider, ERC20 } from "../../utils/contracts";

// Date Utilities and Constants
import { getNextPaymentDate, getTimeZoneSymbol } from "../../utils/dateUtils";
import { chainRpcUrls } from "../../constants/chains";
import { popularTokens } from "../../constants/popularTokens";

/**
 * Affiliate Page
 * ---------------------------
 * This page displays the details of an affiliate project for users.
 * 
 * Overview:
 * - Renders project information such as header details, invite codes, analytics, and conversion charts.
 * - Provides users with an interface to join the project and view rewards and conversion points.
 * - Retrieves project data, referral data, and user-specific analytics from the database.
 * - Shows loading states and handles errors for seamless data fetching.
 * 
 * Props:
 * - `params`: Contains route parameters, specifically the `projectId` which identifies the project.
 * 
 * @component
 * @param {Object} params - Contains the route parameters.
 * @param {string} params.projectId - The ID of the project to display.
 * @returns {JSX.Element} Rendered Affiliate project page.
 */
export default function Affiliate({ params }: { params: { projectId: string } }) {
  const address = useAddress();

  // ========================= State Variables ===========================
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [referralId, setReferralId] = useState<string | null>(null);

  const [conversionLogs, setConversionLogs] = useState<ConversionLog[]>([]);
  const [clickData, setClickData] = useState<ClickData[]>([]);
  
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [chainName, setChainName] = useState<string | undefined>();

  // Loading states
  const [loading, setLoading] = useState({
    project: true,
    referral: true,
    tokenSymbol: true,
    conversionLogs: true,
    clickData: true,
  });

  const [referralLink, setReferralLink] = useState("");

  // ====================== Effect Hooks =======================

  // Fetch project data and set referral link
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const data = await fetchProjectData(params.projectId);
        setProjectData(data);
        setReferralLink(generateReferralLink(data, referralId));
      } catch (error) {
        handleError("project", error);
      } finally {
        setLoading(prev => ({ ...prev, project: false }));
      }
    };
    fetchProjectDetails();
  }, [params.projectId, referralId]);

  // Fetch token symbol if project data is available
  useEffect(() => {
    if (!projectData) return;
    const fetchTokenSymbol = async () => {
      try {
        const symbol = await getTokenSymbol(projectData.selectedChainId, projectData.selectedTokenAddress);
        setTokenSymbol(symbol);
      } catch (error) {
        handleError("tokenSymbol", error);
      } finally {
        setLoading(prev => ({ ...prev, tokenSymbol: false }));
      }
    };
    fetchTokenSymbol();
  }, [projectData]);

  // Fetch referral data if referral ID is available
  useEffect(() => {
    if (!referralId) return;
    const fetchReferralDetails = async () => {
      try {
        const data = await fetchReferralData(referralId);
        setReferralData(data);
      } catch (error) {
        handleError("referral", error);
      } finally {
        setLoading(prev => ({ ...prev, referral: false }));
      }
    };
    fetchReferralDetails();
  }, [referralId]);

  // Fetch chain name if chain ID is available in project data
  useEffect(() => {
    if (!projectData?.selectedChainId) return;
    const fetchChainNameAsync = async () => {
      try {
        const chain = await getChainByChainIdAsync(projectData.selectedChainId);
        setChainName(chain.name);
      } catch (error) {
        console.error("Failed to get chain name:", error);
      }
    };
    fetchChainNameAsync();
  }, [projectData?.selectedChainId]);

  // Fetch conversion logs and click data if referral data is available
  useEffect(() => {
    if (!referralData) return;

    const fetchAnalyticsData = async () => {
      try {
        const logs = await fetchConversionLogsForReferrals([referralData]);
        setConversionLogs(logs);
        setLoading(prev => ({ ...prev, conversionLogs: false }));
        
        const clicks = await fetchClickData(referralId!);
        setClickData(clicks);
        setLoading(prev => ({ ...prev, clickData: false }));
      } catch (error) {
        handleError("conversionLogs or clickData", error);
      }
    };
    fetchAnalyticsData();
  }, [referralData, referralId]);

  // ====================== Helper Functions =======================

  const handleJoinProject = async () => {
    const allConversionPointsInactive = projectData!.conversionPoints.every(point => !point.isActive);
    try {
      const referralId = await joinProject(params.projectId, address!, allConversionPointsInactive);
      setReferralId(referralId);
    } catch (error) {
      handleError("join project", error);
    }
  };

  /**
   * Generates the referral link based on the project data and referral ID.
   * 
   * For the project with ID "FX26BxKbDVuJvaCtcTDf" (DBR project), the old referral link format is used to ensure
   * compatibility, preventing the need for existing clients and affiliates to update their referral links.
   * 
   * For all other projects, the new referral link format is used, including the target URL (`t`) as a query parameter.
   * This approach reduces unnecessary database lookups by passing the redirect URL directly, improving performance 
   * and reducing latency on the server side. The API can then use this URL for redirection without additional queries.
   * 
   * @param {ProjectData} data - The project data containing redirect URL and project ID
   * @param {string | null} referralId - The referral ID associated with the affiliate
   * @returns {string} - The generated referral link based on the project's compatibility requirements
   */
  const generateReferralLink = (data: ProjectData, referralId: string | null) => {
    if (!referralId) return "";

    // Conditional logic to check if the project ID matches the DBR project
    if (data.id === "FX26BxKbDVuJvaCtcTDf") {
      // Use the old referral link format for DBR project compatibility
      return `${data.redirectUrl}?r=${referralId}`;
    } else {
      // Use the new referral link format with the target URL (`t`) for all other projects
      return `${process.env.NEXT_PUBLIC_BASE_URL}/api/click?r=${referralId}&t=${encodeURIComponent(data.redirectUrl)}`;
    }
  };

  const getTokenSymbol = async (chainId: number, tokenAddress: string) => {
    const predefinedToken = (popularTokens[chainId] || []).find(token => token.address === tokenAddress);
    if (predefinedToken) return predefinedToken.symbol;

    const rpcUrl = chainRpcUrls[chainId];
    if (!rpcUrl) throw new Error(`RPC URL for chain ID ${chainId} not found.`);
    
    const erc20 = new ERC20(tokenAddress, getProvider(rpcUrl));
    return await erc20.getSymbol();
  };

  const handleError = (context: string, error: any) => {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Error in ${context}: `, message);
    toast.error(`Error in ${context}: ${message}`);
  };

  const calculateEarningsAndConversions = (conversionLogs: ConversionLog[], currentMonth: Date) => {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const filteredLogs = conversionLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startOfMonth;
    });

    const totalEarnings = filteredLogs.reduce((sum, log) => sum + log.amount, 0);
    return { totalEarnings, totalConversions: filteredLogs.length };
  };

  const { totalEarnings, totalConversions } = calculateEarningsAndConversions(conversionLogs, new Date());

  const copyReferralLinkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast.info("Referral link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast.error("Failed to copy referral link. Please try again.");
    }
  };

  return (
    <div>
      {/* Loading Screen */}
      {!projectData ? (
        <div className="w-screen h-screen flex flex-row items-center justify-center gap-5">
          <Image
            src="/assets/common/loading.png"
            alt="loading"
            width={30}
            height={30}
            className="animate-spin"
          />
          <p className="animate-pulse font-semibold text-gray-600">Loading data...</p>
        </div>
      ) : (
        // Main Content
        <div className="min-h-screen bg-[#F8FAFC] space-y-5 px-3 pb-20">
  
          {/* Header */}
          <ProjectHeader 
            cover={projectData.cover as string}
            logo={projectData.logo as string}
            projectName={projectData.projectName}
            description={projectData.description}
            websiteUrl={projectData.websiteUrl}
            xUrl={projectData.xUrl}
            discordUrl={projectData.discordUrl}
          />
  
          {/* Invite Code Panel */}
          {referralLink && (
            <div className="bg-slate-200 rounded-lg p-5">
              <p className="text-green-500 font-bold mb-2">Joined!</p>
              <p className="font-semibold">Invite Code</p>
              <p className="text-sm text-slate-600 text-ellipsis overflow-hidden whitespace-nowrap">
                {referralLink}
              </p>
              <button
                type="button"
                className="bg-slate-300 hover:bg-slate-400 font-semibold w-full rounded-full py-2 mt-2"
                onClick={copyReferralLinkToClipboard}
              >
                Copy
              </button>
            </div>
          )}
  
          {address && referralId && referralData && (
            <>
              {/* Analytics */}
              <div className="space-y-2">
                <h1 className="font-bold">Analytics</h1>
                <div className="grid grid-cols-2 gap-3">
                  <StatisticCard
                    title="Conversions (This month)"
                    loading={loading.referral || loading.conversionLogs}
                    value={`${totalConversions}`}
                    unit="TIMES"
                  />
                  <StatisticCard
                    title="Earnings (This month)"
                    loading={loading.referral || loading.tokenSymbol || loading.conversionLogs}
                    value={`${totalEarnings}`}
                    unit={tokenSymbol}
                  />
                  <StatisticCard
                    title="Total Clicks (All time)"
                    loading={loading.clickData}
                    value={`${clickData.length}`}
                    unit="TIMES"
                  />
                  <StatisticCard
                    title="Next Payment Date"
                    loading={false}
                    value={getNextPaymentDate()}
                    unit={getTimeZoneSymbol()}
                  />
                </div>
              </div>
  
              {/* Conversion Chart */}
              <div className="space-y-2">
                <h1 className="font-bold">Click/Conversion Chart</h1>
                {loading.conversionLogs || loading.clickData ? (
                  <div className="flex flex-row items-center justify-center gap-5 bg-white rounded-lg shadow h-[100px]">
                    <Image
                      src="/assets/common/loading.png"
                      alt="loading.png"
                      width={30}
                      height={30}
                      className="animate-spin"
                    /> 
                    <p className="animate-pulse font-semibold text-gray-600">Loading data...</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow p-2">
                    <BarChart dataMap={{"Conversions": conversionLogs, "Clicks": clickData}} timeRange="week" />
                  </div>
                )}
              </div>
            </>
          )}
  
          {/* Conversion Points Table */}
          <ConversionPointsTable 
            conversionPoints={projectData.conversionPoints}
            tokenSymbol={tokenSymbol}
            chainName={chainName ?? ""}
          />
  
        </div>
      )}
  
      {/* Join Project Button */}
      {projectData && !referralId && (
        <div className="w-full bg-slate-100 py-3 px-5 fixed bottom-0 border-t border-gray-300">
          <button
            className="w-full bg-black hover:bg-gray-700 text-white rounded-full py-2 font-bold transition duration-300 ease-in-out transform hover:scale-105"
            onClick={handleJoinProject}
          >
            Join Project
          </button>
        </div>
      )}
    </div>
  );
}