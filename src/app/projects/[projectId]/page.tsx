"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { NavBar, AffiliatesList } from "../../components/dashboard";
import { BarChart } from "../../components/common";
import { WorldHeatmap } from "../../components/WorldHeatmap";
import { ProjectData, ExtendedReferralData, ConversionLog, ClickData } from "../../types";
import { fetchProjectData, fetchReferralsByProjectId, fetchConversionLogsForReferrals, getApiKeyData } from "../../utils/firebase";
import { getProvider, Escrow, ERC20 } from "../../utils/contracts";
import { formatBalance } from "../../utils/formatUtils";
import { chainRpcUrls } from "../../constants/chains";
import { popularTokens } from "../../constants/popularTokens";

export default function Dashboard({ params }: { params: { projectId: string } }) {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);

  const [referralData, setReferralData] = useState<ExtendedReferralData[] | null>(null);
  const [loadingReferral, setLoadingReferral] = useState(true);

  const [tokenSymbol, setTokenSymbol] = useState("");
  const [loadingTokenSymbol, setLoadingTokenSymbol] = useState(true);

  // const [depositBalance, setDepositBalance] = useState("0");
  // const [loadingDepositBalance, setLoadingDepositBalance] = useState(true);

  // const [transactionData, setTransactionData] = useState<PaymentTransaction[]>([]);
  // const [loadingTransactionData, setLoadingTransactionData] = useState(true);

  const [conversionData, setConversionData] = useState<ConversionLog[]>([]);
  const [loadingConversionData, setLoadingConversionData] = useState(true);

  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  const [allClickData, setAllClickData] = useState<ClickData[]>([]);

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
    fetchReferralsByProjectId(params.projectId)
      .then(data => {
        setReferralData(data);
        setLoadingReferral(false);
      })
      .catch(error => {
        const message = (error instanceof Error) ? error.message : "Unknown error";
        console.error("Error loading the referrals: ", message);
        toast.error(`Error loading the referrals: ${message}`);
        setLoadingReferral(false);
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

        // const escrow = new Escrow(signer);
        // const projectInfo = await escrow.getProjectInfo(params.projectId);
        // setDepositBalance(projectInfo?.depositAmount ? formatBalance(projectInfo.depositAmount) : "0");
      } catch (error: any) {
        console.error("Error fetching token details: ", error);
        toast.error(`Error fetching token details: ${error.message}`);
      } finally {
        // setLoadingDepositBalance(false);
        setLoadingTokenSymbol(false);
      }
    };

    fetchTokenDetails();
  }, [projectData]);

  // useEffect(() => {
  //   if (referralData) {
  //     const referralDataAsBasic = referralData.map(({ username, ...rest }) => rest); // Convert ExtendedReferralData to ReferralData
  //     fetchTransactionsForReferrals(referralDataAsBasic, setTransactionData)
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

  useEffect(() => {
    if (referralData) {
      setAllClickData(
        referralData
        ? referralData.reduce((acc: ClickData[], referral) => {
            const clicksWithReferralId = referral.clicks.map(click => ({
              ...click,
              referralId: referral.id,
            }));
            return [...acc, ...clicksWithReferralId];
          }, [])
        : []
      );

      const referralDataAsBasic = referralData.map(({ username, ...rest }) => rest); // Convert ExtendedReferralData to ReferralData
      fetchConversionLogsForReferrals(referralDataAsBasic, setConversionData)
        .then(() => {
          setLoadingConversionData(false);
        })
        .catch(error => {
          console.error("Error fetching conversion logs: ", error.message);
          toast.error(`Error fetching conversion logs: ${error.message}`);
          setLoadingConversionData(false);
        });
    }
  }, [referralData]);

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const apiKeyData = await getApiKeyData(params.projectId);
        if (apiKeyData) {
          setApiKey(apiKeyData.apiKey);
        }
      } catch (error: any) {
        console.error("Error fetching API key: ", error);
        toast.error(`Error fetching API key: ${error.message}`);
      }
    };

    fetchApiKey();
  }, [params.projectId]);  

  const handleCopyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey)
        .then(() => {
          toast.success("API Key copied to clipboard");
        })
        .catch(error => {
          toast.error("Failed to copy API Key: " + error.message);
        });
    }
  };

  return (
    <>
      <NavBar projectId={params.projectId} />
      <div className="min-h-screen bg-[#F8FAFC] px-4 sm:px-10 md:px-20 lg:px-40 pb-10 md:pb-20 flex flex-col gap-5">

        {/* Title & API Key */}
        <div className="pt-5 flex flex-col md:flex-row md:items-center md:justify-between gap-5 md:gap-0">
          <div>
            <h3 className="text-lg leading-6 font-medium text-[#1F2937]">
              Project Dashboard
            </h3>
            <p className="text-sm text-[#6B7280]">
              Overview and manage your project details.
            </p>
          </div>
          {apiKey && (
            <div className="w-[350px]">
              <h3 className="text-lg leading-6 font-medium text-[#1F2937]">
                API Key
              </h3>
              <p className="text-sm text-[#6B7280] flex flex-row items-center gap-2">
                <button onClick={() => setShowApiKey(!showApiKey)} className="text-blue-500 hover:text-blue-700">
                  <Image src={showApiKey ? "/assets/common/hide-password.png" : "/assets/common/show-password.png"} alt="Toggle Icon" height={18} width={18} />
                </button>
                {showApiKey ? (
                  <span onClick={handleCopyApiKey} className="cursor-pointer hover:underline">
                    {apiKey}
                  </span>
                ) : (
                  apiKey.split("").map(() => "*").join("")
                )}
              </p>
            </div>
          )}
        </div>

        {/* World Heatmap */}
        <WorldHeatmap
          dataPoints={allClickData}
          unitLabel="clicks"
          projectId={params.projectId}
          useTestData={false}
        />

        {/* Chart */}
        <div className="bg-white p-5 md:p-10 rounded-lg shadow">
          {/* {loadingTransactionData */}
          {loadingConversionData
            ? <div className="flex flex-row items-center justify-center gap-5">
                <Image src="/assets/common/loading.png" alt="loading.png" width={50} height={50} className="animate-spin" /> 
                <p className="animate-pulse font-semibold text-gray-600">
                  {/* Loading transaction data for chart visualization... */}
                  Loading conversion data for chart visualization...
                </p>
              </div>
            // : <BarChart title="Number of Payment Transactions" transactions={transactionData} />
            : <BarChart dataMap={{"Conversions": conversionData, "Clicks": allClickData}} timeRange="month" />
          }
        </div>

        {/* List */}
        <AffiliatesList referrals={referralData || []} selectedToken={tokenSymbol || ""} />

      </div>
    </>
  );
}