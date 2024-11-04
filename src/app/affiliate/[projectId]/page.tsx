"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAddress } from "@thirdweb-dev/react";
import { getChainByChainIdAsync } from "@thirdweb-dev/chains";
import { toast } from "react-toastify";
import { ProjectData, ReferralData, ConversionLog, ClickData, Tier } from "../../types";
import { ProjectHeader } from "../../components/project";
import { StatisticCard } from "../../components/dashboard/StatisticCard";
import { BarChart } from "../../components/dashboard";
import { ToggleButton } from "../../components/ToggleButton";
import { TieredDetailsModal } from "../../components/TieredDetailsModal";
import { WorldHeatmap } from "../../components/WorldHeatmap";
import { 
  fetchProjectData, fetchReferralData, joinProject, fetchTransactionsForReferrals, 
  fetchConversionLogsForReferrals, fetchClickData,
} from "../../utils/firebase";
import { getProvider, ERC20 } from "../../utils/contracts";
import { getNextPaymentDate, getTimeZoneSymbol } from "../../utils/dateUtils";
import { formatChainName } from "../../utils/formatUtils";
import { chainRpcUrls } from "../../constants/chains";
import { popularTokens } from "../../constants/popularTokens";

export default function Affiliate({ params }: { params: { projectId: string } }) {
  const address = useAddress();

  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);

  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loadingReferral, setLoadingReferral] = useState(true);

  // const [transactionData, setTransactionData] = useState<PaymentTransaction[]>([]);
  // const [loadingTransactionData, setLoadingTransactionData] = useState(true);

  const [referralId, setReferralId] = useState<string | null>(null);
  const [buttonLabel, setButtonLabel] = useState("Copy");

  const [conversionLogs, setConversionLogs] = useState<ConversionLog[]>([]);
  const [loadingConversionLogs, setLoadingConversionLogs] = useState(true);

  const [clickData, setClickData] = useState<ClickData[]>([]);
  const [loadingClickData, setLoadingClickData] = useState(true);

  const [tokenSymbol, setTokenSymbol] = useState("");
  const [loadingTokenSymbol, setLoadingTokenSymbol] = useState(true);

  const [referralLink, setReferralLink] = useState("");

  const [isWhitelisted, setIsWhitelisted] = useState(false);

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const toggleDescriptionExpand = () => setIsDescriptionExpanded(!isDescriptionExpanded);
  const description = projectData?.description || "";
  const shouldShowDescriptionToggle = description.length > 350;

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
        setLoadingProject(false);
      })
      .catch(error => {
        const message = (error instanceof Error) ? error.message : "Unknown error";
        console.error("Error loading the project: ", message);
        toast.error(`Error loading the project: ${message}`);
        setLoadingProject(false);
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
      setButtonLabel("Copied!");
      toast.info("Referral link copied to clipboard!");
      setTimeout(() => setButtonLabel("Copy"), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast.error("Failed to copy referral link. Please try again.");
    }
  };

  // ===== BEGIN TIER MODAL MANAGEMENT =====

  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [selectedTierDetails, setSelectedTierDetails] = useState<Tier[] | null>(null);

  const openTierModal = (tiers: Tier[]) => {
    setSelectedTierDetails(tiers);
    setIsTierModalOpen(true);
  };

  const closeTierModal = () => {
    setIsTierModalOpen(false);
    setSelectedTierDetails(null);
  };
  
  // ===== END TIER MODAL MANAGEMENT =====

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col pb-10 md:pb-20">

      {/* Header */}
      {projectData &&
        <ProjectHeader 
          cover={projectData.cover as string}
          logo={projectData.logo as string}
          projectName={projectData.projectName}
          description={projectData.description}
          websiteUrl={projectData.websiteUrl}
          xUrl={projectData.xUrl}
          discordUrl={projectData.discordUrl}
        />
      }

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
            className="bg-slate-300 hover:bg-slate-400 font-semibold w-full rounded-2xl py-2 mt-2"
            onClick={copyReferralLinkToClipboard}
          >
            Copy
          </button>
        </div>
      )}

      <button
        className="bg-sky-500 text-white w-full text-sm py-3 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
        onClick={handleJoinProject}
      >
        Join Project
      </button>

      {/* Conversion Points Table */}
      <div className="w-11/12 sm:w-2/3 mx-auto mb-10">
        <div className="overflow-x-auto bg-gray-100 p-4 rounded-lg shadow-md">
          {projectData && projectData.conversionPoints.every(point => !point.isActive) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <strong className="font-bold">Notice:</strong>
              <span className="block sm:inline"> All conversion points are currently inactive. New users cannot join this project at the moment.</span>
            </div>
          )}
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Reward Details</h2>
          <p className="text-sm text-gray-600 mb-4">
            Below are the reward details for each conversion point, including whether each point is currently active or inactive. You can see the reward type and value associated with each point.
          </p>
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Reward Type</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Activate/Deactivate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {projectData && projectData.conversionPoints.length > 0 ? (
                projectData!.conversionPoints.map((point, index) => (
                  <tr key={point.id}>
                    <td className="px-6 py-4 max-w-[200px] overflow-hidden truncate">{point.title}</td>
                    <td className="px-6 py-4 overflow-hidden truncate">{point.paymentType}</td>
                    <td className="px-6 py-4 overflow-hidden truncate">
                      {point.paymentType === "FixedAmount" ? point.rewardAmount : 
                      point.paymentType === "RevenueShare" ? `${point.percentage}%` : 
                      point.paymentType === "Tiered" && point.tiers ? (
                        <div className="flex items-center">
                          <span>{`${point.tiers.length} Tiers`}</span>
                          <button 
                            onClick={() => point.tiers && openTierModal(point.tiers)} 
                            className="ml-2"
                          >
                            <Image src="/assets/common/new-tab.png" alt="new-tab.png" width={15} height={15} />
                          </button>
                        </div>
                      ) : ""}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <ToggleButton 
                        isOn={point.isActive} 
                        onToggle={() => {}}
                        disabled={true} 
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No conversion points added.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isTierModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 p-5">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full">
            {selectedTierDetails && <TieredDetailsModal tiers={selectedTierDetails} closeModal={closeTierModal} />}
          </div>
        </div>
      )}

      {address && referralId && referralData &&
        <>
          <div className="w-11/12 sm:w-2/3 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-5 mb-10">
            {/* <StatisticCard
              title="Conversions"
              loading={loadingReferral}
              value={`${referralData?.conversions}`}
              unit="TIMES"
            /> */}
            <StatisticCard
              title="Conversions (This month)"
              loading={loadingReferral || loadingConversionLogs}
              value={`${totalConversions}`}
              unit="TIMES"
            />
            {/* <StatisticCard
              title="Earnings"
              loading={loadingReferral || loadingTokenSymbol}
              value={`${referralData?.earnings}`}
              unit={tokenSymbol}
            /> */}
            <StatisticCard
              title="Earnings (This month)"
              loading={loadingReferral || loadingTokenSymbol || loadingConversionLogs}
              value={`${totalEarnings}`}
              unit={tokenSymbol}
            />
            {/* <StatisticCard
              title="Last Conversion Date"
              loading={loadingReferral}
              value={`${referralData?.lastConversionDate ? referralData.lastConversionDate.toLocaleDateString() : "N/A"}`}
              unit=""
            /> */}
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

          {/* World Heatmap */}
          {/* <div className="w-11/12 sm:w-2/3 mx-auto mb-10">
            <WorldHeatmap
              dataPoints={clickData}
              unitLabel="clicks"
              projectId={params.projectId}
              useTestData={false}
            />
          </div> */}

          {/* {loadingTransactionData
            ? <div className="flex flex-row items-center justify-center gap-5 bg-white w-2/3 mx-auto rounded-lg shadow h-[100px] md:h-[200px]">
                <Image src="/assets/common/loading.png" alt="loading.png" width={50} height={50} className="animate-spin" /> 
                <p className="animate-pulse font-semibold text-gray-600">Loading transaction data...</p>
              </div>
            : <ConversionsList explorerUrl={Explorer Url Here} transactions={transactionData} />
          } */}

          {loadingConversionLogs || loadingClickData
            ? <div className="flex flex-row items-center justify-center gap-5 bg-white w-11/12 sm:w-2/3 mx-auto rounded-lg shadow h-[100px] md:h-[200px]">
                <Image src="/assets/common/loading.png" alt="loading.png" width={50} height={50} className="animate-spin" /> 
                <p className="animate-pulse font-semibold text-gray-600">Loading data...</p>
              </div>
            : <div className="bg-white w-11/12 sm:w-2/3 mx-auto rounded-lg shadow p-5 md:p-10">
                <BarChart dataMap={{"Conversions": conversionLogs, "Clicks": clickData}} timeRange="week" />
              </div>
          }

        </>
      }

    </div>
  );
}