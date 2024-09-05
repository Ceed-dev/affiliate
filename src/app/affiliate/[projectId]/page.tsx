"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAddress } from "@thirdweb-dev/react";
import { getChainByChainIdAsync } from "@thirdweb-dev/chains";
import { toast } from "react-toastify";
import { 
  ProjectData, DirectPaymentProjectData, EscrowPaymentProjectData, ReferralData, 
  ConversionLog, ClickData, Tier,
} from "../../types";
import { ConversionsList, ProjectHeader } from "../../components/affiliate";
import { StatisticCard } from "../../components/dashboard/StatisticCard";
import { BarChart } from "../../components/dashboard";
import { ToggleButton } from "../../components/ToggleButton";
import { TieredDetailsModal } from "../../components/TieredDetailsModal";
import { fetchProjectData, fetchReferralData, joinProject, fetchTransactionsForReferrals, fetchConversionLogsForReferrals, fetchClickData } from "../../utils/firebase";
import { getProvider, ERC20 } from "../../utils/contracts";
import { displayFormattedDateWithTimeZone, getNextPaymentDate, getTimeZoneSymbol, formatChainName } from "../../utils/formatters";
import { generateEmbedCode } from "../../utils/embed/generateEmbedCode";
import { useCountdown } from "../../hooks/useCountdown";
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

  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const toggleDescriptionExpand = () => setIsDescriptionExpanded(!isDescriptionExpanded);
  const description = projectData?.description || "";
  const shouldShowDescriptionToggle = description.length > 350;

  // ============== Embed Images Modal Management ==============
  const [currentEmbedIndex, setCurrentEmbedIndex] = useState(0);

  const handleNextEmbed = () => {
    if (projectData?.projectType === "EscrowPayment") {
      const embedsLength = (projectData as EscrowPaymentProjectData).embeds.length;
      setCurrentEmbedIndex((prevIndex) => (prevIndex + 1) % embedsLength);
    }
  };
  
  const handlePreviousEmbed = () => {
    if (projectData?.projectType === "EscrowPayment") {
      const embedsLength = (projectData as EscrowPaymentProjectData).embeds.length;
      setCurrentEmbedIndex((prevIndex) => (prevIndex - 1 + embedsLength) % embedsLength);
    }
  };
  // ===========================================================

  const [embedCode, setEmbedCode] = useState("");

  useEffect(() => {
    if (projectData && projectData.projectType === "EscrowPayment") {
      const escrowProjectData = projectData as EscrowPaymentProjectData;
      if (escrowProjectData.embeds && typeof escrowProjectData.embeds[currentEmbedIndex] === "string") {
        setEmbedCode(generateEmbedCode(escrowProjectData.embeds[currentEmbedIndex] as string, referralLink));
      }
    }
  }, [currentEmbedIndex, projectData, referralLink]);

  const countdown = useCountdown(
    projectData?.projectType === "DirectPayment"
      ? (projectData as DirectPaymentProjectData).deadline ?? undefined
      : undefined
  );

  useEffect(() => {
    const updateReferralLink = () => {
      if (projectData?.projectType === "DirectPayment") {
        const directPaymentProject = projectData as DirectPaymentProjectData;
        if (address && directPaymentProject?.whitelistedAddresses[address]) {
          setReferralLink(directPaymentProject.whitelistedAddresses[address].redirectUrl);
        } else {
          setReferralLink("");
        }
      } else if (projectData?.projectType === "EscrowPayment") {
        if (referralId) {
          setReferralLink(`${projectData.redirectUrl}?r=${referralId}`);
        } else {
          setReferralLink("");
        }
      }
    };
  
    updateReferralLink();
  }, [address, projectData, projectData?.projectType, referralId]);  

  useEffect(() => {
    if (projectData?.projectType === "DirectPayment" && address && (projectData as DirectPaymentProjectData).whitelistedAddresses[address]) {
      setIsWhitelisted(true);
    } else {
      setIsWhitelisted(false);
    }
  }, [address, projectData]);

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
          setClickData(data);
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

  // useEffect(() => {
  //   if (referralData) {
  //     fetchTransactionsForReferrals([referralData], setTransactionData)
  //       .then(() => {
  //         setLoadingTransactionData(false);
  //       })
  //       .catch(error => {
  //         console.error("Error fetching transactions: ", error.message);
  //         toast.error(`Error fetching transactions: ${error.message}`);
  //         setLoadingTransactionData(false);
  //       });
  //   }
  // }, [referralData]);

  const handleJoinProject = async () => {
    if (projectData?.projectType === "DirectPayment") {
      if (!projectData?.whitelistedAddresses[address!]) {
        toast.error("Your wallet address is not whitelisted for this project.");
        return;
      }
    } else if (projectData?.projectType === "EscrowPayment") {
      const allConversionPointsInactive = projectData?.conversionPoints?.every(point => !point.isActive);

      try {
        const referralId = await joinProject(params.projectId, address!, allConversionPointsInactive);
        console.log("Referral ID from existing user: ", referralId);
        setReferralId(referralId);
      } catch (error: any) {
        console.error("Failed to join project: ", error);
        toast.error(`Failed to join project: ${error.message}`);
      }
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

  const copyEmbedCodeToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      toast.success("Embed code copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast.error("Failed to copy embed code. Please try again.");
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
      <ProjectHeader projectData={projectData} loading={loadingProject} />

      {/* Project Status Overview */}
      {projectData?.projectType === "DirectPayment" && (
        <div className="w-11/12 sm:w-2/3 mx-auto grid grid-cols-1 lg:grid-cols-3 gap-5 mb-10">
          <StatisticCard
            title="Remaining Duration"
            loading={loadingProject}
            value={countdown || "Calculating time left..."}
            unit={`Until ${displayFormattedDateWithTimeZone(projectData?.deadline ?? undefined)}`}
          />
          <StatisticCard
            title="Remaining Slots"
            loading={loadingProject}
            value={`${projectData?.slots.remaining}/${projectData?.slots.total}`}
            unit="Slots"
          />
          <StatisticCard
            title="Budget Balance"
            loading={loadingProject || loadingTokenSymbol}
            value={`${projectData?.budget.remaining}/${projectData?.budget.total}`}
            unit={tokenSymbol}
          />
        </div>
      )}

      {/* Project Description and Action Panel */}
      <div className="w-11/12 sm:w-2/3 flex flex-col lg:flex-row mx-auto gap-10 mb-10">
        {/* Project Description Container */}
        <div className={`basis-3/5 border rounded-lg shadow-md p-6 text-lg bg-white ${loadingProject ? "animate-pulse" : ""}`}>
          {isDescriptionExpanded ? description : `${description.substring(0, 350)}${shouldShowDescriptionToggle ? "..." : ""}`}
          {shouldShowDescriptionToggle && (
            <button onClick={toggleDescriptionExpand} className="text-blue-500 hover:underline ml-2">
              {isDescriptionExpanded ? "Read less" : "Read more"}
            </button>
          )}
        </div>
        {/* Join Project and Referral Actions */}
        <div className="basis-2/5 border rounded-lg shadow-md p-6 h-min bg-white">
          <h2 className="text-lg font-semibold text-gray-900">
            Earn {tokenSymbol} for each successful referral
            {chainName && (
              <>
                {" on "}
                <span className="text-purple-700 underline animate-pulse">{chainName}</span>
                <Image 
                  src={`/chains/${formatChainName(chainName)}.png`} 
                  alt={chainName} 
                  width={18} 
                  height={18} 
                  className="m-1 inline" 
                />
              </>
            )}
          </h2>
          <p className="text-gray-600 pb-4">
            {projectData?.projectType === "DirectPayment" && isWhitelisted 
              ? "Share your link with others and start earning!"
              : projectData?.projectType === "EscrowPayment" && address && referralId
              ? "Share your link with others and start earning!"
              : "Join the project to start referring others."
            }
          </p>
          {(projectData?.projectType === "DirectPayment" && isWhitelisted) ||
           (projectData?.projectType === "EscrowPayment" && address && referralId) ? (
            <div className="flex flex-col gap-3">
              <div className="flex bg-[#F3F4F6] rounded-md p-2 gap-3">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="font-roboto text-sm bg-transparent outline-none w-full"
                />
                <button
                  type="button"
                  className="text-sm text-[#2563EB] font-bold bg-transparent hover:underline"
                  onClick={copyReferralLinkToClipboard}
                >
                  {buttonLabel}
                </button>
              </div>
              {projectData?.projectType === "EscrowPayment" && address && referralId && (
                <button
                  className="bg-green-500 text-white w-full text-sm py-3 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
                  onClick={() => setIsEmbedModalOpen(true)}
                >
                  Show Embed Code
                </button>
              )}
            </div>
          ) : (
            <button
              className="bg-sky-500 text-white w-full text-sm py-3 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
              onClick={handleJoinProject}
            >
              Join Project
            </button>
          )}
        </div>
      </div>

      {/* Conversion Points Table */}
      {projectData?.projectType === "EscrowPayment" && (
        <div className="w-11/12 sm:w-2/3 mx-auto mb-10">
          <div className="overflow-x-auto bg-gray-100 p-4 rounded-lg shadow-md">
            {projectData.conversionPoints?.every(point => !point.isActive) && (
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
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Reward Type</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Activate/Deactivate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {projectData.conversionPoints && projectData.conversionPoints.length > 0 ? (
                  projectData.conversionPoints.map((point, index) => (
                    <tr key={point.id}>
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
                              <Image src="/new-tab.png" alt="new-tab.png" width={15} height={15} />
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
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">No conversion points added.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isTierModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 p-5">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full">
            {selectedTierDetails && <TieredDetailsModal tiers={selectedTierDetails} closeModal={closeTierModal} />}
          </div>
        </div>
      )}

      {projectData?.projectType === "EscrowPayment" && address && referralId && 
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

          {/* {loadingTransactionData
            ? <div className="flex flex-row items-center justify-center gap-5 bg-white w-2/3 mx-auto rounded-lg shadow h-[100px] md:h-[200px]">
                <Image src="/loading.png" alt="loading.png" width={50} height={50} className="animate-spin" /> 
                <p className="animate-pulse font-semibold text-gray-600">Loading transaction data...</p>
              </div>
            : <ConversionsList explorerUrl={Explorer Url Here} transactions={transactionData} />
          } */}

          {loadingConversionLogs || loadingClickData
            ? <div className="flex flex-row items-center justify-center gap-5 bg-white w-11/12 sm:w-2/3 mx-auto rounded-lg shadow h-[100px] md:h-[200px]">
                <Image src="/loading.png" alt="loading.png" width={50} height={50} className="animate-spin" /> 
                <p className="animate-pulse font-semibold text-gray-600">Loading data...</p>
              </div>
            : <div className="bg-white w-11/12 sm:w-2/3 mx-auto rounded-lg shadow p-5 md:p-10">
                <BarChart dataMap={{"Conversions": conversionLogs, "Clicks": clickData}} />
              </div>
          }
        </>
      }

      {isEmbedModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-md p-6 m-2 max-w-xl">
            <div className="flex flex-row justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Embed Code</h2>
              <button onClick={() => setIsEmbedModalOpen(false)} >
                <Image src="/close.png" alt="Close Icon" width={15} height={15} />
              </button>
            </div>
            <textarea
              readOnly
              value={embedCode}
              className="w-full p-2 border outline-none border-[#D1D5DB] rounded-lg text-sm mb-4"
              rows={6}
            />
            <div className="flex justify-center mb-4">
              <button
                onClick={copyEmbedCodeToClipboard}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
              >
                Copy to Clipboard
              </button>
            </div>
            <h3 className="text-lg font-semibold mt-4">Preview</h3>
            <div className="mt-4 border border-gray-300 p-2 rounded overflow-hidden max-w-full flex flex-col items-center justify-center">
              <div className="my-4">
                <Image
                  src={(projectData as EscrowPaymentProjectData).embeds[currentEmbedIndex] as string}
                  alt="Preview Image"
                  layout="responsive"
                  width={300}
                  height={200}
                  className="object-contain"
                />
              </div>
              {(projectData as EscrowPaymentProjectData).embeds.length > 1 && (
                <div className="flex gap-5 w-full">
                  <button onClick={handlePreviousEmbed} className="bg-blue-300 hover:bg-blue-500 hover:text-white flex-1 p-2 rounded">Previous</button>
                  <button onClick={handleNextEmbed} className="bg-green-300 hover:bg-green-500 hover:text-white flex-1 p-2 rounded">Next</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}