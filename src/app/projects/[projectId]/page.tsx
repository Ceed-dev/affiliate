"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-toastify";

// Components
import { AnalyticsCard, BarChart } from "../../components/common";
import { WorldHeatmap } from "../../components/WorldHeatmap";
import { AffiliatePerformanceList } from "../../components/project";
import { ToggleButton } from "../../components/ToggleButton";

// Types
import { ConversionLog, ClickData, AffiliatePerformanceData } from "../../types/referralTypes";
import { ExternalCampaign, ProjectData } from "../../types";

// Utility Functions
import { getApiKeyData } from "../../utils/firebase";
import { fetchProjects, fetchProjectVisibility, updateProjectVisibility } from "../../utils/projectUtils";
import { fetchReferralPerformanceByProjectId, fetchCampaignPerformanceBylCampaignId } from "../../utils/referralUtils";
import { copyToClipboard } from "../../utils/generalUtils";
import { fetchAspConversionsByCampaigns } from "../../utils/postbackUtils";
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
  const [projectData, setProjectData] = useState<ProjectData>();
  const [referralData, setReferralData] = useState<AffiliatePerformanceData[]>([]);
  const [conversionData, setConversionData] = useState<ConversionLog[]>([]);
  const [clickData, setClickData] = useState<ClickData[]>([]);
  const [loadingConversionData, setLoadingConversionData] = useState(true);
  const [loadingClickData, setLoadingClickData] = useState(true);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [projectVisibility, setProjectVisibility] = useState<boolean>(false);
  const [externalCampaigns, setExternalCampaigns] = useState<ExternalCampaign[]>([]);
  const [aspConversions, setAspConversions] = useState<object[]>([]);

  // Detect screen width to adjust "the bar chart" and "the heatmap" based on viewport size
  const width = useWindowSize();
  const timeRange = width <= 768 ? "week" : "month";    // Set to "week" on screens md (768px) or smaller
  const mapHeight = width <= 768 ? "300px" : "500px";   // Adjust height based on screen size
  const mapZoomLevel = width <= 768 ? 1 : 2;            // Set initial zoom level: 1 for mobile screens, 2 for larger screens
  const mapMinZoom = width <= 768 ? 1 : 2;              // Set minimum zoom level: 1 for mobile screens, 2 for larger screens

  // Fetch referral data, including associated click and conversion data, on component mount or project ID change
  useEffect(() => {
    const funcA = () => {
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
    };

    const funcB = async () => {
      const data = await fetchCampaignPerformanceBylCampaignId();
      setClickData(data.clicks);
      setLoadingClickData(false);
      setConversionData(data.conversions);
      setLoadingConversionData(false);
    }

    if (params.projectId !== "7N9BtaMllIzUwjxZUujQ") {
      funcA();
    } else {
      funcB();
    }

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

  useEffect(() => {
    /**
     * Fetches the visibility state of the project from Firestore
     * and updates the `projectVisibility` state.
     * 
     * This function ensures the visibility state is properly
     * retrieved and applied to the toggle button, allowing
     * users to adjust the visibility as needed.
     */
    const fetchVisibility = async () => {
      try {
        // Fetch the project's visibility state from Firestore
        const visibility = await fetchProjectVisibility(params.projectId);
  
        // Update the local state with the retrieved visibility value
        setProjectVisibility(visibility);
  
        console.log(`Fetched project visibility: ${visibility ? "Visible" : "Hidden"}`);
      } catch (error) {
        // Log and display an error message if fetching fails
        console.error("Failed to fetch project visibility:", error);
        toast.error("Failed to fetch project visibility.");
      }
    };
  
    // Call the function to fetch visibility state when component mounts
    if (params.projectId !== "7N9BtaMllIzUwjxZUujQ") {
      fetchVisibility();
    }
  }, [params.projectId]);  

  useEffect(() => {
    /**
     * Fetches the project data and extracts `externalCampaigns` for tracking ASP conversions.
     */
    const fetchProjectData = async () => {
      try {
        // Retrieve project data from Firestore
        const projectDataArray = await fetchProjects({ projectId: params.projectId });

        // Ensure project data is found
        if (!projectDataArray || projectDataArray.length === 0) {
          console.error("Project data not found for the provided project ID.");
          return;
        }

        const data = projectDataArray[0]; // Take the first item in the array

        // Set externalCampaigns state if available
        if (data.externalCampaigns && Array.isArray(data.externalCampaigns)) {
          setExternalCampaigns(data.externalCampaigns);
        }
      } catch (error) {
        console.error("Error fetching project data:", error);
        toast.error("Failed to load project data.");
      }
    };

    const fetchCampaignAsProjectData = async () => {
      const projectDataArray = await fetchProjects({ projectId: params.projectId });
      const data = projectDataArray[0]; // Take the first item in the array
      setProjectData(data);
    }

    if (params.projectId !== "7N9BtaMllIzUwjxZUujQ") {
      fetchProjectData();
    } else {
      fetchCampaignAsProjectData();
    }
  }, [params.projectId]);

  // Fetch ASP conversions after external campaigns are set
  useEffect(() => {
    /**
     * Fetches ASP conversion data based on externalCampaigns.
     */
    const fetchAspConversions = async () => {
      try {
        // Ensure external campaigns exist before fetching conversions
        if (!externalCampaigns || externalCampaigns.length === 0) {
          console.log("No external campaigns found for this project.");
          return;
        }

        // Fetch ASP conversion data
        const conversions = await fetchAspConversionsByCampaigns(externalCampaigns);

        // Store the retrieved data in state
        setAspConversions(conversions);
      } catch (error) {
        console.error("Error fetching ASP conversions:", error);
        toast.error("Failed to load ASP conversion data.");
      }
    };

    fetchAspConversions();
  }, [externalCampaigns]); // Runs when externalCampaigns change

  return (
    <div className="min-h-screen space-y-5 md:space-y-10 px-4 md:px-10 lg:px-20 pb-10 md:py-20">
      
      {/* Page Title */}
      <h1 className="font-bold text-2xl md:text-3xl">Dashboard</h1>

      {/* API Key Display */}
      {apiKey && params.projectId !== "7N9BtaMllIzUwjxZUujQ" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Left Block: API Key */}
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

          {/* Right Block: Toggle Button */}
          <div className="bg-[#F5F5F5] p-5 rounded-lg">
            <h2 className="font-semibold">
              Visibility
              <span className="text-[#757575] text-xs ml-1">
                Toggle project visibility on Marketplace
              </span>
            </h2>

            {/* Toggle Button */}
            <ToggleButton
              isOn={projectVisibility}
              onToggle={async (value) => {
                try {
                  await updateProjectVisibility(params.projectId, value);
                  setProjectVisibility(value);
                  toast.info(`Project visibility set to: ${value ? "Visible" : "Hidden"}`);
                } catch (error: any) {
                  toast.error("Failed to update project visibility:", error);
                }
              }}
            />
          </div>

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
            loading={projectData ? false : loadingConversionData}
            value={projectData
              ? projectData.aggregatedStats?.ASP.conversionStats.total! + projectData.aggregatedStats?.INDIVIDUAL.conversionStats.total!
              : conversionData.length
            }
            unit="TIMES"
          />
          {/* Click Analytics Card */}
          <AnalyticsCard
            title="Clicks"
            description="(All Time)"
            loading={projectData ? false : loadingClickData}
            value={projectData
              ? projectData.aggregatedStats?.ASP.clickStats.total! + projectData.aggregatedStats?.INDIVIDUAL.clickStats.total!
              : clickData.length
            }
            unit="TIMES"
          />
        </div>
      </div>

      {/* Conversion and Clicks Bar Chart */}
      <div className="bg-[#F5F5F5] p-2 md:p-10 rounded-lg">
        {loadingConversionData || loadingClickData ? (
          <div className="flex flex-row items-center justify-center gap-5 py-5">
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
        height={mapHeight}
        zoomLevel={mapZoomLevel}
        minZoom={mapMinZoom}
      />

      {/* Affiliate Performance List */}
      {params.projectId !== "7N9BtaMllIzUwjxZUujQ" && <AffiliatePerformanceList referrals={referralData} />}

      {/* ASP Conversion Data Table */}
      {params.projectId !== "7N9BtaMllIzUwjxZUujQ" &&
        <div className="mt-10">
          <h2 className="font-bold text-xl">ASP Conversions</h2>

          {aspConversions.length === 0 ? (
            <p className="text-gray-500 mt-2">No conversion data available for this project.</p>
          ) : (
            <div className="overflow-x-auto mt-3">
              <table className="w-full border border-gray-300 rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">ASP</th>
                    <th className="p-2 border">Campaign ID</th>
                    <th className="p-2 border">Click ID</th>
                    <th className="p-2 border">Event</th>
                    <th className="p-2 border">Value</th>
                    <th className="p-2 border">Currency</th>
                    <th className="p-2 border">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {aspConversions.map((conversion: any, index: number) => (
                    <tr key={index} className="border-t">
                      <td className="p-2 border text-center">{conversion.source}</td>
                      <td className="p-2 border text-center">{conversion.campaign_id}</td>
                      <td className="p-2 border text-center">{conversion.click_id}</td>
                      <td className="p-2 border text-center">{conversion.event_name}</td>
                      <td className="p-2 border text-center">{conversion.event_value}</td>
                      <td className="p-2 border text-center">{conversion.currency}</td>
                      <td className="p-2 border text-center">{new Date(conversion.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      }
      
    </div>
  );  
}
