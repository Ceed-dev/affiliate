"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAddress } from "@thirdweb-dev/react";
import { getChainByChainIdAsync } from "@thirdweb-dev/chains";
import { toast } from "react-toastify";
import { 
  ProjectData, DirectPaymentProjectData, EscrowPaymentProjectData, ReferralData, 
  PaymentTransaction, ConversionLog, ClickData,
  FixedAmountDetails, RevenueShareDetails, TieredDetails,
} from "../../types";
import { ConversionsList, ProjectHeader } from "../../components/affiliate";
import { StatisticCard } from "../../components/dashboard/StatisticCard";
import { BarChart } from "../../components/dashboard";
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

  const [isTierDetailModalOpen, setIsTierDetailModalOpen] = useState(false);

  let embedCode: string = "";

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const toggleDescriptionExpand = () => setIsDescriptionExpanded(!isDescriptionExpanded);
  const description = projectData?.description || "";
  const shouldShowDescriptionToggle = description.length > 350;

  if (projectData && projectData.projectType === "EscrowPayment") {
    const escrowProjectData = projectData as EscrowPaymentProjectData;
    if (escrowProjectData.embed) {
      embedCode = generateEmbedCode(escrowProjectData.embed, referralLink);
    }
  }

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
      try {
        const referralId = await joinProject(params.projectId, address!);
        console.log("Referral ID from existing user: ", referralId);
        setReferralId(referralId);
      } catch (error: any) {
        console.error("Failed to join project: ", error);
        toast.error(`Failed to join project: ${error.message}`);
      }
    }
  };

  // Calculate min and max reward for Tiered payment type
  let tieredRewardRange = "";
  if (projectData?.projectType === "EscrowPayment" && projectData.paymentType === "Tiered") {
    const tiers = (projectData.paymentDetails as TieredDetails).tiers;
    const minReward = Math.min(...tiers.map(tier => tier.rewardAmount));
    const maxReward = Math.max(...tiers.map(tier => tier.rewardAmount));
    tieredRewardRange = `${minReward}~${maxReward}`;
  }

  const rewardText = loadingTokenSymbol 
    ? <span className="text-gray-500">Loading...</span> 
    : (
        <span className="font-semibold bg-green-200 px-2 py-1 rounded-md shadow-lg">
          {projectData?.projectType === "DirectPayment" && isWhitelisted && address
            ? (projectData as DirectPaymentProjectData).whitelistedAddresses[address].rewardAmount
            : projectData?.projectType === "EscrowPayment" 
              ? projectData?.paymentType === "FixedAmount" ? (
                  `${(projectData.paymentDetails as FixedAmountDetails).rewardAmount}`
                ) : projectData.paymentType === "RevenueShare" ? (
                  `${(projectData.paymentDetails as RevenueShareDetails).percentage}% of revenue in`
                ) : projectData.paymentType === "Tiered" ? (
                  `${tieredRewardRange}`
                ) : null
              : null
          } {tokenSymbol}
        </span>
      );

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
            Earn {rewardText} for each successful referral
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
          {projectData?.projectType === "EscrowPayment" && projectData.paymentType === "Tiered" && (
            <button
              className="text-blue-500 hover:text-blue-700 hover:font-semibold hover:underline"
              onClick={() => setIsTierDetailModalOpen(true)}
            >
              &rarr; Show Tier Detail
            </button>
          )}
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
          <div className="bg-white rounded-lg shadow-md p-6 m-2 max-w-md">
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
            <div className="flex justify-center">
              <button
                onClick={copyEmbedCodeToClipboard}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
              >
                Copy to Clipboard
              </button>
            </div>
            <h3 className="text-lg font-semibold mt-4">Preview:</h3>
            <div className="mt-4 border border-gray-300 p-2 rounded overflow-hidden max-w-full flex justify-center items-center">
              <Image
                src={(projectData as EscrowPaymentProjectData).embed!}
                alt="Preview Image"
                layout="responsive"
                width={300}
                height={200}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {projectData?.projectType === "EscrowPayment" && projectData.paymentType === "Tiered" && isTierDetailModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-md p-6 m-2 max-w-md">
            <div className="flex flex-row justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Tier Detail</h2>
              <button onClick={() => setIsTierDetailModalOpen(false)} >
                <Image src="/close.png" alt="Close Icon" width={15} height={15} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Conversions Required</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Reward Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(projectData.paymentDetails as TieredDetails).tiers.map((tier, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 overflow-hidden truncate">{tier.conversionsRequired}</td>
                      <td className="px-6 py-4 overflow-hidden truncate">{tier.rewardAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}