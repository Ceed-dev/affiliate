"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ConnectWallet, lightTheme, useAddress, WalletInstance, useDisconnect } from "@thirdweb-dev/react";
import { toast } from "react-toastify";
import { ProjectData, DirectPaymentProjectData, ReferralData, PaymentTransaction, AffiliateInfo, ConversionLog } from "../../types";
import { AffiliateInfoModal, ConversionsList, ProjectHeader } from "../../components/affiliate";
import { StatisticCard } from "../../components/dashboard/StatisticCard";
import { BarChart } from "../../components/dashboard";
import { fetchProjectData, fetchReferralData, joinProject, fetchTransactionsForReferrals, checkUserAndPrompt, createNewUserAndJoinProject, fetchConversionLogsForReferrals } from "../../utils/firebase";
import { initializeSigner, ERC20 } from "../../utils/contracts";
import { displayFormattedDateWithTimeZone, getNextPaymentDate, getTimeZoneSymbol } from "../../utils/formatters";
import { useCountdown } from "../../hooks/useCountdown";

export default function Affiliate({ params }: { params: { projectId: string } }) {
  const address = useAddress();
  const disconnect = useDisconnect();

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

  const [tokenSymbol, setTokenSymbol] = useState("");
  const [loadingTokenSymbol, setLoadingTokenSymbol] = useState(true);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const [referralLink, setReferralLink] = useState("");

  const [isWhitelisted, setIsWhitelisted] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const countdown = useCountdown(
    projectData?.projectType === "DirectPayment"
      ? (projectData as DirectPaymentProjectData).deadline ?? undefined
      : undefined
  );

  // Automatically disconnect the wallet when the page loads to ensure a clean state for session management.
  useEffect(() => {
    disconnect();
  }, []);

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
          setReferralLink(`${baseUrl}/referee/${params.projectId}/${referralId}`);
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
        const signer = initializeSigner(`${process.env.NEXT_PUBLIC_WALLET_PRIVATE_KEY}`);
        const erc20 = new ERC20(projectData.selectedTokenAddress, signer);
        const symbol = await erc20.getSymbol();

        setTokenSymbol(symbol);
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
    }
  }, [referralData]);

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

  const handleSaveAffiliateInfo = async (info: AffiliateInfo) => {
    if (address) {
      try {
        const referralId = await createNewUserAndJoinProject(params.projectId, address, info);
        console.log("Referral ID from new user registration: ", referralId);
        setReferralId(referralId);
        setIsModalOpen(false);
      } catch (error) {
        console.error("Failed to save affiliate info: ", error);
        toast.error("Failed to save affiliate info");
        disconnect();
      }
    } else {
      console.error("Wallet address is not set.");
      toast.error("Unexpected error occurred. Please try again.");
      disconnect();
    }
  };

  const handleJoinProject = async (wallet: WalletInstance) => {
    const walletAddress = await wallet.getAddress();
  
    if (projectData?.projectType === "DirectPayment") {
      if (!projectData?.whitelistedAddresses[walletAddress]) {
        toast.error("Your wallet address is not whitelisted for this project.");
        disconnect();
        return;
      }
    } else if (projectData?.projectType === "EscrowPayment") {
      try {
        const userExists = await checkUserAndPrompt(walletAddress, setIsModalOpen);
        if (userExists) {
          const referralId = await joinProject(params.projectId, walletAddress);
          console.log("Referral ID from existing user: ", referralId);
          setReferralId(referralId);
        } else {
          toast.info("Please enter your affiliate information.");
        }
      } catch (error: any) {
        console.error("Failed to join project: ", error);
        toast.error(`Failed to join project: ${error.message}`);
      }
    }
  };

  const rewardText = loadingTokenSymbol 
    ? <span className="text-gray-500">Loading...</span> 
    : (
        <span className="font-semibold bg-green-200 px-2 py-1 rounded-md shadow-lg">
          {projectData?.projectType === "DirectPayment" && isWhitelisted && address
            ? (projectData as DirectPaymentProjectData).whitelistedAddresses[address].rewardAmount
            : projectData?.projectType === "EscrowPayment"
            ? projectData.rewardAmount
            : null
          } {tokenSymbol}
        </span>
      );
  
  const copyLinkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setButtonLabel("Copied!");
      toast.info("Link copied to clipboard!");
      setTimeout(() => setButtonLabel("Copy"), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast.error("Failed to copy link. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col pb-10 md:pb-20">

      {/* Header */}
      <ProjectHeader projectData={projectData} loading={loadingProject} />

      {/* Project Status Overview */}
      {projectData?.projectType === "DirectPayment" && (
        <div className="w-2/3 mx-auto grid grid-cols-1 lg:grid-cols-3 gap-5 mb-10">
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
      <div className="w-2/3 flex flex-col lg:flex-row mx-auto gap-10 mb-10">
        {/* Project Description Container */}
        <div className={`basis-3/5 border rounded-lg shadow-md p-6 text-lg bg-white ${loadingProject ? "animate-pulse" : ""}`}>
          {projectData?.description}
        </div>
        {/* Join Project and Referral Actions */}
        <div className="basis-2/5 border rounded-lg shadow-md p-6 h-min bg-white">
          <h2 className="text-lg font-semibold text-gray-900">
            Earn {rewardText} for each successful referral
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
                onClick={copyLinkToClipboard}
              >
                {buttonLabel}
              </button>
            </div>
          ) : null}
          <div className="flex flex-col justify-stretch mt-4">
            <ConnectWallet
              theme={lightTheme({
                colors: { primaryButtonBg: "#0091ff" },
              })}
              btnTitle={"Join Project"}
              switchToActiveChain={true}
              modalSize={"compact"}
              modalTitleIconUrl={""}
              showThirdwebBranding={false}
              onConnect={handleJoinProject}
            />
          </div>
        </div>
      </div>

      {projectData?.projectType === "EscrowPayment" && address && referralId && 
        <>
          <div className="w-2/3 mx-auto grid grid-cols-1 lg:grid-cols-3 gap-5 mb-10">
            <StatisticCard
              title="Conversions"
              loading={loadingReferral}
              value={`${referralData?.conversions}`}
              unit="TIMES"
            />
            <StatisticCard
              title="Earnings"
              loading={loadingReferral || loadingTokenSymbol}
              value={`${referralData?.earnings}`}
              unit={tokenSymbol}
            />
            {/* <StatisticCard
              title="Last Conversion Date"
              loading={loadingReferral}
              value={`${referralData?.lastConversionDate ? referralData.lastConversionDate.toLocaleDateString() : "N/A"}`}
              unit=""
            /> */}
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
            : <ConversionsList transactions={transactionData} />
          } */}

          {loadingConversionLogs
            ? <div className="flex flex-row items-center justify-center gap-5 bg-white w-2/3 mx-auto rounded-lg shadow h-[100px] md:h-[200px]">
                <Image src="/loading.png" alt="loading.png" width={50} height={50} className="animate-spin" /> 
                <p className="animate-pulse font-semibold text-gray-600">Loading conversion data...</p>
              </div>
            : <div className="bg-white w-2/3 mx-auto rounded-lg shadow p-10">
                <BarChart title="Number of Conversions" transactions={conversionLogs} />
              </div>
          }
        </>
      }

      <AffiliateInfoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          disconnect();
        }}
        onSave={handleSaveAffiliateInfo}
      />
    </div>
  );
}