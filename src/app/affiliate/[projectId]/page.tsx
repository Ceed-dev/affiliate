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
import { displayFormattedDateWithTimeZone } from "../../utils/formatters";
import { useCountdown } from "../../hooks/useCountdown";

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

  const targetDate = new Date("2024-06-20T18:00:00Z");
  const countdown = useCountdown(targetDate);

  // TODO: Google Formリンク表示機能を一時的に追加。リファラルID機能をコメントアウト。
  // リダイレクトリンク変数をGoogle Formリンクを保持するための変数として使用。
  // しかし、将来的にはそれぞれのギルドのウォレットアドレスに対して別々のGoogle Formリンクを
  // 表示する必要があるため、修正が必要。
  // - Reason: ギルド向け機能の開発のため。
  // - Planned Reversion: 未定。
  // - Date: 2024-05-15
  // - Author: shungo0222
  // - Issue: #304
  // ===== UPDATE =====
  // - Additional Modification: ウォレット接続時に該当のURLを設定する。
  // - Reason for Update: 接続したユーザーがコピーできるようにするため。
  // - Date of Update: 2024-05-17
  // - Author: shungo0222
  // - Issue: #315
  // ===== BEGIN ORIGINAL CODE =====
  // const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  // const REFERRAL_LINK = `${baseUrl}/referee/${params.projectId}/${referralId}`;
  // ===== END ORIGINAL CODE =====
  // ===== BEGIN MODIFICATION =====
  const [REFERRAL_LINK, SET_REFERRAL_LINK] = useState("");
  useEffect(() => {
    if (address && projectData?.whitelistedAddresses[address]) {
      // If an address exists in the whitelist, set the redirect URL for that address.
      SET_REFERRAL_LINK(projectData.whitelistedAddresses[address].redirectUrl);
    } else {
      // Reset link if address is not in whitelist
      SET_REFERRAL_LINK("");
    }
  }, [address, projectData?.whitelistedAddresses]);
  // ===== END MODIFICATION =====

  // TODO: ウォレットがホワイトリスト化されているかどうか、報酬に関するテキストの表示を設定。
  // - Reason: ウォレットごとに表示内容が異なるため。
  // - Planned Reversion: 未定。
  // - Date: 2024-05-17
  // - Author: shungo0222
  // - Issue: #315
  // ===== BEGIN MODIFICATION =====
  const [isWhitelisted, setIsWhitelisted] = useState(false);

  useEffect(() => {
    if (address && projectData?.whitelistedAddresses[address]) {
      setIsWhitelisted(true);
    } else {
      setIsWhitelisted(false);
    }
  }, [address, projectData?.whitelistedAddresses]);

  const rewardText = loadingTokenSymbol 
    ? <span className="text-gray-500">Loading...</span> 
    : (
        <span className="font-semibold bg-green-200 px-2 py-1 rounded-md shadow-lg">
          {isWhitelisted && address && projectData?.whitelistedAddresses[address].rewardAmount} {tokenSymbol}
        </span>
      );
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

  // TODO: コンバージョンダッシュボードを一時的に非表示するため、リファラルデータを読み込む必要なし。
  // - Reason: コンバージョンに関してはGoogle Sheetsなどで管理できるため。
  // - Planned Reversion: 未定。
  // - Date: 2024-05-15
  // - Author: shungo0222
  // - Issue: #306
  // ===== BEGIN ORIGINAL CODE =====
  // useEffect(() => {
  //   if (referralId) {
  //     fetchReferralData(referralId)
  //       .then(data => {
  //         setReferralData(data);
  //         setLoadingReferral(false);
  //       })
  //       .catch(error => {
  //         const message = (error instanceof Error) ? error.message : "Unknown error";
  //         console.error("Error loading the referral: ", message);
  //         toast.error(`Error loading the referral: ${message}`);
  //         setLoadingReferral(false);
  //       });
  //   }
  // }, [referralId]);
  // ===== END ORIGINAL CODE =====

  // TODO: コンバージョンダッシュボードを一時的に非表示するため、トランザクションデータを読み込む必要なし。
  // - Reason: コンバージョンに関してはGoogle Sheetsなどで管理できるため。
  // - Planned Reversion: 未定。
  // - Date: 2024-05-15
  // - Author: shungo0222
  // - Issue: #306
  // ===== BEGIN ORIGINAL CODE =====
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
  // ===== END ORIGINAL CODE =====

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

      {/* Project Status Overview */}
      <div className="w-2/3 mx-auto grid grid-cols-1 lg:grid-cols-3 gap-5 mb-10">
        <StatisticCard
          title="Remaining Duration"
          loading={loadingProject}
          value={countdown || "Calculating time left..."}
          unit={`Until ${displayFormattedDateWithTimeZone(targetDate)}`}
        />
        <StatisticCard
          title="Remaining Slots"
          loading={loadingProject}
          value="60/100"
          unit="Slots"
        />
        <StatisticCard
          title="Budget Balance"
          loading={loadingProject || loadingTokenSymbol}
          value="200"
          unit={tokenSymbol}
        />
      </div>

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
          <p className="text-gray-600 pb-4">{isWhitelisted ? "Share your link with others and start earning!" : "Join the project to start referring others."}</p>
          {isWhitelisted && 
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
              // ===== UPDATE =====
              // - Additional Modification: ウォレット接続時にホワイトリスト内に存在するのかを確認。
              // - Reason for Update: ホワイトリストされたウォレット以外ははじくため。
              // - Date of Update: 2024-05-17
              // - Author: shungo0222
              // - Issue: #315
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
              // ===== BEGIN MODIFICATION =====
              onConnect={async (wallet: WalletInstance) => {
                // Check the existence of the whitelist here
                const walletAddress = await wallet.getAddress();
                if (!projectData?.whitelistedAddresses[walletAddress]) {
                  toast.error("Your wallet address is not whitelisted for this project.");
                  disconnect();
                  return;
                }
              }}
              // ===== END MODIFICATION =====
            />
          </div>
        </div>
      </div>

      {/*
      TODO: コンバージョンダッシュボードを一時的に非表示する。
      - Reason: コンバージョンに関してはGoogle Sheetsなどで管理できるため。
      - Planned Reversion: 未定。
      - Date: 2024-05-15
      - Author: shungo0222
      - Issue: #306
      // ===== BEGIN ORIGINAL CODE =====
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
      // ===== END ORIGINAL CODE =====
      */}

    </div>
  );
}