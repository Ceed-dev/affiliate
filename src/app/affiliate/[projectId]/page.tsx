"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ConnectWallet, lightTheme, useAddress, WalletInstance, useDisconnect } from "@thirdweb-dev/react";
import { toast } from "react-toastify";
import { ProjectData, ReferralData, PaymentTransaction } from "../../types";
import { ProjectHeader, ConversionsList } from "../../components/affiliate";
import { StatisticCard } from "../../components/dashboard/StatisticCard";
import { fetchProjectData, fetchReferralData, joinProject, fetchTransactionsForReferrals } from "../../utils/firebase";
import { initializeSigner, ERC20 } from "../../utils/contracts";

export default function Affiliate({ params }: { params: { projectId: string } }) {
  const address = useAddress();
  const disconnect = useDisconnect();

  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);

  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [loadingReferral, setLoadingReferral] = useState(true);

  const [transactionData, setTransactionData] = useState<PaymentTransaction[]>([]);
  const [loadingTransactionData, setLoadingTransactionData] = useState(true);

  const [referralId, setReferralId] = useState<string | null>(null);
  const [buttonLabel, setButtonLabel] = useState("Copy");

  const [tokenSymbol, setTokenSymbol] = useState("");
  const [loadingTokenSymbol, setLoadingTokenSymbol] = useState(true);

  // TODO: Google Formリンク表示機能を一時的に追加。リファラルID機能をコメントアウト。
  // リダイレクトリンク変数をGoogle Formリンクを保持するための変数として使用。
  // しかし、将来的にはそれぞれのギルドのウォレットアドレスに対して別々のGoogle Formリンクを
  // 表示する必要があるため、修正が必要。
  // - Reason: ギルド向け機能の開発のため。
  // - Planned Reversion: 未定。
  // - Date: 2024-05-15
  // - Author: shungo0222
  // - Issue: #304
  // ===== BEGIN ORIGINAL CODE =====
  // const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  // const REFERRAL_LINK = `${baseUrl}/referee/${params.projectId}/${referralId}`;
  // ===== END ORIGINAL CODE =====
  // ===== BEGIN MODIFICATION =====
  const [REFERRAL_LINK, SET_REFERRAL_LINK] = useState("");
  useEffect(() => {
    if (!projectData) return;
    SET_REFERRAL_LINK(projectData.redirectUrl);
  }, [projectData]);
  // ===== END MODIFICATION =====

  // Automatically disconnect the wallet when the page loads to ensure a clean state for session management.
  useEffect(() => {
    disconnect();
  }, []);

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
      fetchTransactionsForReferrals([referralData], setTransactionData)
        .then(() => {
          setLoadingTransactionData(false);
        })
        .catch(error => {
          console.error("Error fetching transactions: ", error.message);
          toast.error(`Error fetching transactions: ${error.message}`);
          setLoadingTransactionData(false);
        });
    }
  }, [referralData]);

  const copyLinkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(REFERRAL_LINK);
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

      {/* Project Description and Action Panel */}
      <div className="w-2/3 flex flex-col lg:flex-row mx-auto gap-10 mb-10">
        {/* Project Description Container */}
        <div className={`basis-3/5 border rounded-lg shadow-md p-6 text-lg bg-white ${loadingProject ? "animate-pulse" : ""}`}>
          {projectData?.description}
        </div>
        {/* Join Project and Referral Actions */}
        <div className="basis-2/5 border rounded-lg shadow-md p-6 h-min bg-white">
          <h2 className="text-lg font-semibold text-gray-900">
            Earn {!(projectData?.rewardAmount) || loadingTokenSymbol ? <span className="text-gray-500">Loading...</span> : `${projectData?.rewardAmount} ${tokenSymbol}`} for each successful referral
          </h2>
          <p className="text-gray-600 pb-4">{address ? "Share your link with others and start earning!" : "Join the project to start referring others."}</p>
          {address && 
            <div className="flex bg-[#F3F4F6] rounded-md p-2 gap-3">
              <input
                type="text"
                value={REFERRAL_LINK}
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
          }
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
              // TODO: Google Formリンク表示機能を一時的に追加。
              // そのため、リファラルIDを生成・取得する必要はない。
              // - Reason: ギルド向け機能の開発のため。
              // - Planned Reversion: 未定。
              // - Date: 2024-05-15
              // - Author: shungo0222
              // - Issue: #305
              // ===== BEGIN ORIGINAL CODE =====
              // onConnect={async (wallet: WalletInstance) => {
              //   try {
              //     if (!projectData) {
              //       // If project data is not yet loaded, wait for it to load
              //       return;
              //     }
              //     const walletAddress = await wallet.getAddress();
              //     const referralId = await joinProject(params.projectId, walletAddress);
              //     console.log("Referral ID: ", referralId);
              //     setReferralId(referralId);
              //   } catch (error: any) {
              //     console.error("Failed to join project: ", error);
              //     toast.error(`Failed to join project: ${error.message}`);
              //   }
              // }}
              // ===== END ORIGINAL CODE =====
            />
          </div>
        </div>
      </div>

      {address && 
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
            <StatisticCard
              title="Last Conversion Date"
              loading={loadingReferral}
              value={`${referralData?.lastConversionDate ? referralData.lastConversionDate.toLocaleDateString() : "N/A"}`}
              unit=""
            />
          </div>

          {loadingTransactionData
            ? <div className="flex flex-row items-center justify-center gap-5 bg-white w-2/3 mx-auto rounded-lg shadow h-[100px] md:h-[200px]">
                <Image src="/loading.png" alt="loading.png" width={50} height={50} className="animate-spin" /> 
                <p className="animate-pulse font-semibold text-gray-600">Loading transaction data...</p>
              </div>
            : <ConversionsList transactions={transactionData} />
          }
        </>
      }

    </div>
  );
}