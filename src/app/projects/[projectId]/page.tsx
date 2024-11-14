"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-toastify";

// Components
import { AnalyticsCard, BarChart } from "../../components/common";
import { WorldHeatmap } from "../../components/WorldHeatmap";
import { AffiliatePerformanceList } from "../../components/project";

// Types
import { ConversionLog, ClickData, AffiliatePerformanceData } from "../../types/referralTypes";

// Utility Functions
import { getApiKeyData } from "../../utils/firebase";
import { fetchReferralPerformanceByProjectId } from "../../utils/referralUtils";
import { copyToClipboard } from "../../utils/generalUtils";
import { useWindowSize } from "../../hooks/useWindowSize";

/**
 * Dashboard component for displaying project-specific performance analytics.
 * 
 * This component provides an overview of key metrics for a given project,
 * such as total clicks, conversions, and affiliate earnings. It includes:
 * - A list of affiliates and their engagement statistics.
 * - Statistical cards summarizing metrics like conversions and clicks.
 * - A bar chart visualizing conversion and click trends over time.
 * - A world heatmap illustrating geographic distribution of clicks.
 * - API key management with options to display and copy the key.
 * 
 * @param {Object} params - Object containing the project's unique identifier.
 * @returns {JSX.Element} - The rendered dashboard component.
 */
export default function Dashboard({ params }: { params: { projectId: string } }) {
  // State variables to store referral, conversion, and click data, along with loading states, API key, and display settings
  const [referralData, setReferralData] = useState<AffiliatePerformanceData[]>([]);
  const [conversionData, setConversionData] = useState<ConversionLog[]>([]);
  const [clickData, setClickData] = useState<ClickData[]>([]);
  const [loadingConversionData, setLoadingConversionData] = useState(true);
  const [loadingClickData, setLoadingClickData] = useState(true);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  // Detect screen width to adjust time range based on viewport size
  const width = useWindowSize();
  const timeRange = width <= 768 ? "week" : "month"; // Set to "week" on screens md (768px) or smaller

  // Fetch referral data, including associated click and conversion data, on component mount or project ID change
  useEffect(() => {
    fetchReferralPerformanceByProjectId(params.projectId)
      .then(data => {
        setReferralData(data);
        
        // Aggregate all clicks across referrals into a single array and update state
        const allClicks = data.flatMap(referral => referral.clicks);
        setClickData(allClicks);
        setLoadingClickData(false);

        // Aggregate all conversion logs across referrals into a single array and update state
        const allConversions = data.flatMap(referral => referral.conversionLogs);
        setConversionData(allConversions);
        setLoadingConversionData(false);
      })
      .catch(error => {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("Error loading referrals:", message);
        toast.error(`Error loading referrals: ${message}`);
        
        // Update loading states in case of error
        setLoadingClickData(false);
        setLoadingConversionData(false);
      });
  }, [params.projectId]);

  // Fetch and set the API key for the project
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const apiKeyData = await getApiKeyData(params.projectId);
        if (apiKeyData) {
          setApiKey(apiKeyData.apiKey);
        }
      } catch (error: any) {
        console.error("Error fetching API key:", error);
        toast.error(`Error fetching API key: ${error.message}`);
      }
    };

    fetchApiKey();
  }, [params.projectId]);

  return (
    <div className="min-h-screen space-y-5 md:space-y-10 px-4 md:px-10 lg:px-20 pb-10 md:py-20">
      
      {/* Page Title */}
      <h1 className="font-bold text-2xl md:text-3xl">Dashboard</h1>

      {/* API Key Display */}
      {apiKey && (
        <div className="bg-[#F5F5F5] p-5 rounded-lg">
          <h2 className="font-semibold">API KEY</h2>
          <p className="text-[#757575] flex flex-row items-center gap-4">
            {/* Toggle for showing/hiding API Key */}
            <button onClick={() => setShowApiKey(!showApiKey)}>
              <Image
                src={`/assets/common/visibility-${showApiKey ? "off-" : ""}black.png`}
                alt="Visibility Icon"
                height={20}
                width={20}
              />
            </button>
            {/* Display or Mask API Key */}
            {showApiKey ? (
              <button
                onClick={() => copyToClipboard(apiKey, "API Key copied to clipboard", "Failed to copy API Key")}
                className="w-full cursor-pointer hover:underline flex flex-row items-center justify-between"
              >
                <span className="break-all mr-2">{apiKey}</span>
                <Image
                  src="/assets/common/content-copy-black.png"
                  alt="copy icon"
                  width={20}
                  height={20}
                />
              </button>
            ) : (
              apiKey.split("").map(() => "*").join("")
            )}
          </p>
        </div>
      )}

      {/* Analytics Section */}
      <div className="space-y-2">
        <h2 className="font-bold text-xl">Analytics</h2>
        <div className="grid grid-cols-2 gap-3">
          {/* Conversion Analytics Card */}
          <AnalyticsCard
            title="Conversions"
            description="(All Time)"
            loading={loadingConversionData}
            value={conversionData.length}
            unit="TIMES"
          />
          {/* Click Analytics Card */}
          <AnalyticsCard
            title="Clicks"
            description="(All Time)"
            loading={loadingClickData}
            value={clickData.length}
            unit="TIMES"
          />
        </div>
      </div>

      {/* Conversion and Clicks Bar Chart */}
      <div className="bg-[#F5F5F5] p-2 md:p-10 rounded-lg">
        {loadingConversionData || loadingClickData ? (
          <div className="flex flex-row items-center justify-center gap-5">
            <Image
              src="/assets/common/loading.png"
              alt="Loading Icon"
              width={50}
              height={50}
              className="animate-spin"
            />
            <p className="animate-pulse font-semibold text-[#757575]">
              Loading data for chart visualization...
            </p>
          </div>
        ) : (
          <BarChart dataMap={{ "Conversions": conversionData, "Clicks": clickData }} timeRange={timeRange} />
        )}
      </div>

      {/* World Heatmap Visualization */}
      <WorldHeatmap
        dataPoints={clickData}
        unitLabel="clicks"
        projectId={params.projectId}
        useTestData={false}
      />

      {/* Affiliate Performance List */}
      <AffiliatePerformanceList referrals={referralData} />
      
    </div>
  );  
}