"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { NavBar, AffiliatesList } from "../../components/dashboard";
import { StatisticCard, BarChart } from "../../components/common";
import { WorldHeatmap } from "../../components/WorldHeatmap";
import { ProjectData, ExtendedReferralData, ConversionLog, ClickData } from "../../types";
import { fetchProjectData, fetchReferralsByProjectId, fetchConversionLogsForReferrals, getApiKeyData } from "../../utils/firebase";
import { getProvider, ERC20 } from "../../utils/contracts";
import { chainRpcUrls } from "../../constants/chains";
import { popularTokens } from "../../constants/popularTokens";

export default function Dashboard({ params }: { params: { projectId: string } }) {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);

  const [referralData, setReferralData] = useState<ExtendedReferralData[] | null>(null);
  const [loadingReferral, setLoadingReferral] = useState(true);

  const [tokenSymbol, setTokenSymbol] = useState("");
  const [loadingTokenSymbol, setLoadingTokenSymbol] = useState(true);

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
    <div>
      <NavBar projectId={params.projectId} />
      <div className="min-h-screen bg-[#F8FAFC] space-y-5 px-4 sm:px-10 md:px-20 lg:px-40 py-10 md:py-20">

        <h1 className="font-bold text-2xl">Dashboard</h1>

        {/* API KEY */}
        {apiKey && (
          <div className="bg-slate-100 p-5 rounded-lg">
            <h2 className="font-semibold">API KEY</h2>
            <p className="text-[#6B7280] flex flex-row items-center gap-4">
              <button onClick={() => setShowApiKey(!showApiKey)}>
                <Image
                  src={showApiKey ? "/assets/common/hide-password.png" : "/assets/common/show-password.png"}
                  alt="Toggle Icon"
                  height={18}
                  width={18}
                />
              </button>
              {showApiKey ? (
                <button
                  onClick={handleCopyApiKey}
                  className="w-full cursor-pointer hover:underline flex flex-row items-center justify-between"
                >
                  {apiKey}
                  <Image
                    src="/assets/common/copy.png"
                    alt="copy icon"
                    width={14}
                    height={14}
                  />
                </button>
              ) : (
                apiKey.split("").map(() => "*").join("")
              )}
            </p>
          </div>
        )}

        {/* Analytics */}
        <div className="space-y-2">
          <h2 className="font-bold text-xl">Analytics</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatisticCard
              title="Conversions (All Time)"
              loading={false}
              value={"10000"}
              unit="TIMES"
            />
            <StatisticCard
              title="Clicks (All Time)"
              loading={false}
              value={"20000"}
              unit="TIMES"
            />
          </div>
        </div>

        {/* Conversion/Click Chart */}
        <div className="bg-slate-100 p-5 md:p-10 rounded-lg shadow">
          {loadingConversionData ? (
            <div className="flex flex-row items-center justify-center gap-5">
              <Image
                src="/assets/common/loading.png"
                alt="loading.png"
                width={50}
                height={50}
                className="animate-spin"
              /> 
              <p className="animate-pulse font-semibold text-gray-600">
                Loading data for chart visualization...
              </p>
            </div>
          ) : (
            <BarChart
              dataMap={{"Conversions": conversionData, "Clicks": allClickData}}
              timeRange="month"
            />
          )}
        </div>

        {/* World Heatmap */}
        <WorldHeatmap
          dataPoints={allClickData}
          unitLabel="clicks"
          projectId={params.projectId}
          useTestData={false}
        />

        {/* List */}
        <AffiliatesList
          referrals={referralData || []}
          selectedToken={tokenSymbol || ""}
        />

      </div>
    </div>
  );
}