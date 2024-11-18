import React, { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { FeaturedProjectData, MarketplaceBannerData } from "../../types/appSettingsTypes";
import { updateFeaturedProject, updateMarketplaceBanner } from "../../utils/appSettingsUtils";
import { checkProjectExists } from "../../utils/projectUtils";

/**
 * Props for the AppSettings component.
 * ---------------------------
 * This type defines the structure of the props used in the AppSettings component,
 * which manages application settings such as the featured project and marketplace banner.
 */
interface AppSettingsProps {
  /**
   * The current featured project data, including project ID and last updated timestamp.
   * Can be null if no featured project is set.
   */
  featuredProjectData: FeaturedProjectData | null;

  /**
   * Function to update the state of the featured project data.
   * Accepts a new state or a state updater function.
   */
  setFeaturedProjectData: React.Dispatch<React.SetStateAction<FeaturedProjectData | null>>;

  /**
   * Indicates whether the featured project data is being loaded.
   * Displays a loading state if true.
   */
  loadingFeatured: boolean;

  /**
   * The current marketplace banner data, including the banner message and last updated timestamp.
   * Can be null if no banner is set.
   */
  bannerData: MarketplaceBannerData | null;

  /**
   * Function to update the state of the marketplace banner data.
   * Accepts a new state or a state updater function.
   */
  setBannerData: React.Dispatch<React.SetStateAction<MarketplaceBannerData | null>>;

  /**
   * Indicates whether the marketplace banner data is being loaded.
   * Displays a loading state if true.
   */
  loadingBanner: boolean;
};

/**
 * AppSettings Component
 * ---------------------------
 * This component allows the admin to manage application settings, such as the featured project
 * and the marketplace banner. It provides forms for updating these settings and handles the logic
 * for making updates to Firestore.
 *
 * @param {AppSettingsProps} props - Props including app settings states and their update functions.
 * @returns {JSX.Element} - Rendered AppSettings component.
 */
export const AppSettings: React.FC<AppSettingsProps> = ({
  featuredProjectData,
  setFeaturedProjectData,
  loadingFeatured,
  bannerData,
  setBannerData,
  loadingBanner,
}) => {
  // Local state to track form inputs and changes
  const [localFeaturedProjectId, setLocalFeaturedProjectId] = useState<string | null>(null);
  const [localBannerMessage, setLocalBannerMessage] = useState<string | null>(null);

  // Loading state for button actions
  const [savingFeaturedProject, setSavingFeaturedProject] = useState<boolean>(false);
  const [savingBanner, setSavingBanner] = useState<boolean>(false);

  // Initialize local state on component mount or when props change
  useEffect(() => {
    setLocalFeaturedProjectId(featuredProjectData?.projectId ?? null);
    setLocalBannerMessage(bannerData?.message ?? null);
  }, [featuredProjectData, bannerData]);

  // Function to check if update is needed
  const trimmedLocalFeaturedProjectId = localFeaturedProjectId?.trim() || null;
  const trimmedFeaturedProjectId = featuredProjectData?.projectId || null;
  const isFeaturedProjectUpdated = trimmedLocalFeaturedProjectId !== trimmedFeaturedProjectId;

  const trimmedLocalMessage = localBannerMessage?.trim() || null;
  const isBannerMessageUpdated = trimmedLocalMessage !== (bannerData?.message || null);

  /**
   * Handles the update for the featured project.
   */
  const handleUpdateFeaturedProject = async () => {
    if (!featuredProjectData) {
      toast.error("No featured project data available.");
      return;
    }

    const trimmedProjectId = localFeaturedProjectId?.trim() || null;

    setSavingFeaturedProject(true);

    try {
      // Check if the project exists only if a project ID is provided
      if (trimmedProjectId) {
        const exists = await checkProjectExists(trimmedProjectId);
        if (!exists) {
          toast.error("The specified project ID does not exist.");
          // Reset the local input to the previous valid state
          setLocalFeaturedProjectId(featuredProjectData?.projectId ?? null);
          return;
        }
      }

      await updateFeaturedProject(trimmedProjectId);
      toast.success("Featured project updated successfully.");
      setFeaturedProjectData({
        projectId: trimmedProjectId,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error("Error updating featured project:", error);
      toast.error("Failed to update the featured project.");
    } finally {
      setSavingFeaturedProject(false);
    }
  };

  /**
   * Handles the update for the marketplace banner.
   */
  const handleUpdateMarketplaceBanner = async () => {
    if (!bannerData) {
      toast.error("No banner data available.");
      return;
    }

    const trimmedMessage = localBannerMessage?.trim() || null;

    setSavingBanner(true);

    try {
      await updateMarketplaceBanner(trimmedMessage);
      toast.success("Marketplace banner updated successfully.");
      setBannerData({
        message: trimmedMessage,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error("Error updating marketplace banner:", error);
      toast.error("Failed to update the marketplace banner.");
    } finally {
      setSavingBanner(false);
    }
  };

  return (
    <div className="w-11/12 space-y-5">
      {/* Featured Project Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-semibold">Featured Project</h2>
          <p className="text-black/60 text-sm">Last Updated: {featuredProjectData?.lastUpdated.toLocaleString()}</p>
        </div>
        {loadingFeatured ? (
          <div className="flex items-center gap-3">
            <Image
              src="/assets/common/loading.png"
              height={25}
              width={25}
              alt="loading.png"
              className="animate-spin"
            />
            <p className="text-gray-500 animate-pulse">Loading current featured project...</p>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={localFeaturedProjectId ?? ""}
              onChange={(e) => setLocalFeaturedProjectId(e.target.value || null)}
              className="border border-gray-300 rounded px-4 py-2 w-full focus:outline-none"
              placeholder="Enter Project ID or leave empty"
            />
            <button
              onClick={handleUpdateFeaturedProject}
              disabled={!isFeaturedProjectUpdated || savingFeaturedProject}
              className={`px-6 py-2 rounded transition flex items-center justify-center ${
                isFeaturedProjectUpdated && !savingFeaturedProject
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {savingFeaturedProject ? (
                <Image
                  src="/assets/common/loading.png"
                  height={25}
                  width={25}
                  alt="saving..."
                  className="animate-spin"
                />
              ) : (
                "Update"
              )}
            </button>
          </div>
        )}
      </div>
  
      {/* Marketplace Banner Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-semibold">Marketplace Banner</h2>
          <p className="text-black/60 text-sm">Last Updated: {bannerData?.lastUpdated.toLocaleString()}</p>
        </div>
        {loadingBanner ? (
          <div className="flex items-center gap-3">
            <Image
              src="/assets/common/loading.png"
              height={25}
              width={25}
              alt="loading.png"
              className="animate-spin"
            />
            <p className="text-gray-500 animate-pulse">Loading current banner message...</p>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={localBannerMessage ?? ""}
              onChange={(e) => setLocalBannerMessage(e.target.value || null)}
              className="border border-gray-300 rounded px-4 py-2 w-full focus:outline-none"
              placeholder="Enter banner message or leave empty"
            />
            <button
              onClick={handleUpdateMarketplaceBanner}
              disabled={!isBannerMessageUpdated || savingBanner}
              className={`px-6 py-2 rounded transition flex items-center justify-center ${
                isBannerMessageUpdated && !savingBanner
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {savingBanner ? (
                <Image
                  src="/assets/common/loading.png"
                  height={25}
                  width={25}
                  alt="saving..."
                  className="animate-spin"
                />
              ) : (
                "Update"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );  
};