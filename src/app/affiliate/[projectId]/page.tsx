"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAddress } from "@thirdweb-dev/react";
import { getChainByChainIdAsync } from "@thirdweb-dev/chains";
import { toast } from "react-toastify";
import { ProjectData, ReferralData, ConversionLog, ClickData, Tier } from "../../types";
import { ProjectHeader, ConversionPointsTable } from "../../components/project";
import { StatisticCard } from "../../components/dashboard/StatisticCard";
import { BarChart } from "../../components/dashboard";
import { 
  fetchProjectData, fetchReferralData, joinProject, 
  fetchConversionLogsForReferrals, fetchClickData,
} from "../../utils/firebase";
import { getProvider, ERC20 } from "../../utils/contracts";
import { getNextPaymentDate, getTimeZoneSymbol } from "../../utils/dateUtils";
import { chainRpcUrls } from "../../constants/chains";
import { popularTokens } from "../../constants/popularTokens";

export default function Affiliate({ params }: { params: { projectId: string } }) {
  const address = useAddress();

  const [projectData, setProjectData] = useState<ProjectData | null>(null);

  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loadingReferral, setLoadingReferral] = useState(true);

  const [referralId, setReferralId] = useState<string | null>(null);

  const [conversionLogs, setConversionLogs] = useState<ConversionLog[]>([]);
  const [loadingConversionLogs, setLoadingConversionLogs] = useState(true);

  const [clickData, setClickData] = useState<ClickData[]>([]);
  const [loadingClickData, setLoadingClickData] = useState(true);

  const [tokenSymbol, setTokenSymbol] = useState("");
  const [loadingTokenSymbol, setLoadingTokenSymbol] = useState(true);

  const [referralLink, setReferralLink] = useState("");

  useEffect(() => {
    const updateReferralLink = () => {
      if (referralId && projectData) {
        // The conditional logic here checks if the project ID matches "FX26BxKbDVuJvaCtcTDf" (DBR project).
        // For this specific project, we continue using the old referral link format for compatibility reasons
        // to avoid requiring existing clients and affiliates to update their referral links.
        // For all other projects, the new referral link format is used, which includes the target URL (t)
        // as a query parameter. This optimization reduces unnecessary database lookups by passing
        // the redirect URL directly, improving performance and reducing latency.
        if (projectData.id === "FX26BxKbDVuJvaCtcTDf") {
          setReferralLink(`${projectData.redirectUrl}?r=${referralId}`);
        } else {
          // The target URL (t) is included in the referral link to optimize performance.
          // By passing the redirect URL (projectData.redirectUrl) as the `t` parameter in the API call, 
          // we avoid unnecessary database lookups on the server side. This ensures the API can 
          // directly use the provided URL for redirection, reducing latency and server load.
          setReferralLink(`${process.env.NEXT_PUBLIC_BASE_URL}/api/click?r=${referralId}&t=${encodeURIComponent(projectData.redirectUrl)}`);
        }
      } else {
        setReferralLink("");
      }
    };
  
    updateReferralLink();
  }, [address, projectData, referralId]);  

  useEffect(() => {
    fetchProjectData(params.projectId)
      .then(data => {
        setProjectData(data);
      })
      .catch(error => {
        const message = (error instanceof Error) ? error.message : "Unknown error";
        console.error("Error loading the project: ", message);
        toast.error(`Error loading the project: ${message}`);
      });
  }, [params.projectId]);

  useEffect(() => {
    if (!projectData) return;

    const fetchTokenDetails = async () => {
      try {
        const predefinedToken = (popularTokens[projectData.selectedChainId] || []).find(token => token.address === projectData.selectedTokenAddress);

        if (predefinedToken) {
          setTokenSymbol(predefinedToken.symbol);
        } else {
          const rpcUrl = chainRpcUrls[projectData.selectedChainId];
          if (!rpcUrl) {
            throw new Error(`RPC URL for chain ID ${projectData.selectedChainId} not found.`);
          }

          const erc20 = new ERC20(projectData.selectedTokenAddress, getProvider(rpcUrl));
          const symbol = await erc20.getSymbol();
          setTokenSymbol(symbol);
        }
      } catch (error: any) {
        console.error("Error fetching token details: ", error);
        toast.error(`Error fetching token details: ${error.message}`);
      } finally {
        setLoadingTokenSymbol(false);
      }
    };

    fetchTokenDetails();
  }, [projectData]);

  useEffect(() => {
    if (referralId) {
      fetchReferralData(referralId)
        .then(data => {
          setReferralData(data);
          setLoadingReferral(false);
        })
        .catch(error => {
          const message = (error instanceof Error) ? error.message : "Unknown error";
          console.error("Error loading the referral: ", message);
          toast.error(`Error loading the referral: ${message}`);
          setLoadingReferral(false);
        });
    }
  }, [referralId]);

  useEffect(() => {
    if (referralData) {
      fetchConversionLogsForReferrals([referralData], setConversionLogs)
        .then(() => {
          setLoadingConversionLogs(false);
        })
        .catch(error => {
          const message = (error instanceof Error) ? error.message : "Unknown error";
          console.error("Error loading conversion logs: ", message);
          toast.error(`Error loading conversion logs: ${message}`);
          setLoadingConversionLogs(false);
        })
      
      fetchClickData(referralId!)
        .then(data => {
          // Include referralId in the click data and handle the case where referralId is null
          const clicksWithReferralId = data.map(click => ({
            ...click,
            referralId: referralId || undefined,  // Convert null to undefined
          }));
          
          // Set the modified click data
          setClickData(clicksWithReferralId);
          setLoadingClickData(false);
        })
        .catch(error => {
          const message = (error instanceof Error) ? error.message : "Unknown error";
          console.error("Error loading click data: ", message);
          toast.error(`Error loading click data: ${message}`);
          setLoadingClickData(false);
        });
    }
  }, [referralData, referralId]);

  // ============== Get Chain Name =============
  const [chainName, setChainName] = useState<string | undefined>();

  useEffect(() => {
    const fetchChainName = async () => {
      try {
        const chain = await getChainByChainIdAsync(projectData?.selectedChainId!);
        setChainName(chain.name);
      } catch (error) {
        console.error(`Failed to get chain name for chain ID ${projectData?.selectedChainId}:`, error);
      }
    };

    if (projectData?.selectedChainId) {
      fetchChainName();
    }
  }, [projectData?.selectedChainId]);
  // ===========================================

  const handleJoinProject = async () => {
    const allConversionPointsInactive = projectData!.conversionPoints.every(point => !point.isActive);
    try {
      const referralId = await joinProject(params.projectId, address!, allConversionPointsInactive);
      console.log("Referral ID from existing user: ", referralId);
      setReferralId(referralId);
    } catch (error: any) {
      console.error("Failed to join project: ", error);
      toast.error(`Failed to join project: ${error.message}`);
    }
  };

  const calculateEarningsAndConversions = (conversionLogs: ConversionLog[], currentMonth: Date): { totalEarnings: number, totalConversions: number } => {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  
    const filteredLogs = conversionLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startOfMonth && logDate <= endOfMonth;
    });
  
    const totalEarnings = filteredLogs.reduce((sum, log) => sum + log.amount, 0);
    const totalConversions = filteredLogs.length;
  
    return { totalEarnings, totalConversions };
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
                    loading={loadingReferral || loadingConversionLogs}
                    value={`${totalConversions}`}
                    unit="TIMES"
                  />
                  <StatisticCard
                    title="Earnings (This month)"
                    loading={loadingReferral || loadingTokenSymbol || loadingConversionLogs}
                    value={`${totalEarnings}`}
                    unit={tokenSymbol}
                  />
                  <StatisticCard
                    title="Total Clicks (All time)"
                    loading={loadingClickData}
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
                {loadingConversionLogs || loadingClickData ? (
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