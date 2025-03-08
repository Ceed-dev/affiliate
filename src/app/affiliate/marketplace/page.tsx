"use client";

// Import necessary libraries and components
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useActiveWallet } from "thirdweb/react";
import { useXPContext } from "../../context/xpContext";
import { useMarketplaceContext } from "../../context/marketplaceContext";
import { fetchUserById } from "../../utils/userUtils";
import { fetchProjects } from "../../utils/projectUtils";
import { getFeaturedProject, getMarketplaceBanner, getKaiaProjects } from "../../utils/appSettingsUtils";
import { calculateTotalXpPoints } from "../../utils/xpUtils";
import { MarketplaceProjectCard } from "../../components/project";

/**
 * Marketplace Component
 * ---------------------------
 * This component renders the marketplace page, displaying a list of projects that users can explore.
 * It fetches project data, including token symbols, from the database and displays loading or error messages as needed.
 * 
 * Layout:
 * - Shows a loading spinner while data is being fetched.
 * - Displays a list of project cards if projects are available.
 * - Displays a message if no projects are currently available.
 * 
 * @returns {JSX.Element} - The rendered marketplace page component.
 */
export default function Marketplace() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const wallet = useActiveWallet();
  const address = wallet?.getAccount()?.address;

  const [loading, setLoading] = useState<boolean>(false);
  const [joinedProjectIds, setJoinedProjectIds] = useState<string[]>([]);

  const {
    projects,
    setProjects,
    featuredProjectId,
    setFeaturedProjectId,
    bannerMessage,
    setBannerMessage,
    selectedCategory,
    kaiaProjectIds,
    setKaiaProjectIds,
  } = useMarketplaceContext();
  
  const { setTotalXpPoints } = useXPContext();

  // Fetches the Featured Project ID and updates the context state.
  // This hook runs only if the featured project ID is not already available.
  useEffect(() => {
    const fetchFeaturedProjectId = async () => {
      if (featuredProjectId) return; // Skip if data already exists

      try {
        const data = await getFeaturedProject();
        if (data) setFeaturedProjectId(data.projectId);
      } catch (error) {
        console.error("Failed to fetch featured project:", error);
      }
    };

    fetchFeaturedProjectId();
  }, [featuredProjectId, setFeaturedProjectId]);

  // Fetches the Banner Message for the Marketplace and updates the context state.
  // This hook runs only if the banner message is not already available.
  useEffect(() => {
    const fetchBannerMessage = async () => {
      if (bannerMessage) return; // Skip if data already exists

      try {
        const data = await getMarketplaceBanner();
        if (data) setBannerMessage(data.message);
      } catch (error) {
        console.error("Failed to fetch banner message:", error);
      }
    };

    fetchBannerMessage();
  }, [bannerMessage, setBannerMessage]);

  // Fetches the Kaia project IDs for the Marketplace and updates the context state.
  // This hook runs only if the Kaia project IDs are not already available in the context.
  useEffect(() => {
    const fetchKaiaProjectIds = async () => {
      if (kaiaProjectIds.length > 0) return; // Skip if data already exists

      try {
        const data = await getKaiaProjects();
        if (data) setKaiaProjectIds(data);
      } catch (error) {
        console.error("Failed to fetch Kaia project IDs:", error);
      }
    };

    fetchKaiaProjectIds();
  }, [kaiaProjectIds, setKaiaProjectIds]);

  // Fetches projects and updates the context state.
  // Additionally, fetches and updates the user's joined project IDs.
  // This hook avoids unnecessary API calls if the data is already available.
  useEffect(() => {
    const fetchProjectsData = async () => {
      if (!address) {
        toast.error("Wallet address is not available");
        return;
      }

      try {
        // Fetch user data and update joinedProjectIds state
        const userData = await fetchUserById(address);
        const audienceCountry = userData?.audienceCountry || undefined;
        const joinedProjectIds = userData?.joinedProjectIds || [];
        setJoinedProjectIds(joinedProjectIds);

        // Skip API call if projects are already loaded
        if (projects.length > 0) return;

        setLoading(true);

        // Fetch project data and update context state
        const data = await fetchProjects({ audienceCountry, joinedProjectIds });
        setProjects(data);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectsData();
  }, [address, projects, setProjects, setJoinedProjectIds]);

  /**
   * useEffect hook for calculating and updating XP points for the user.
   * 
   * This hook runs whenever the `address` or `joinedProjectIds` change.
   * It calculates the user's total XP points based on the joined projects and updates the context state.
   * 
   * - If the user's wallet address or joined project IDs are not available, the calculation is skipped.
   * - A loading state is managed using `setXpLoading`.
   * - Errors during calculation are logged and displayed using a toast notification.
   */
  useEffect(() => {
    const calculateXpPoints = async () => {
      try {
        // Skip calculation if the user's address or joined projects are unavailable
        if (!address || joinedProjectIds.length === 0) return;

        // Calculate total XP points for the user
        const totalXp = await calculateTotalXpPoints(joinedProjectIds, address);

        // Update the context with the calculated XP points
        setTotalXpPoints(totalXp);
      } catch (error) {
        // Log the error and show a toast notification
        console.error("Error calculating XP points:", error);
        toast.error("Failed to calculate XP points.");
      }
    };

    // Invoke the calculation function whenever dependencies change
    calculateXpPoints();
  }, [address, joinedProjectIds, setTotalXpPoints]);

  // Filter projects based on the selected category
  const filteredProjects = projects.filter((project) => {
    if (selectedCategory === "Kaia") {
      // Show only projects in the Kaia category
      return kaiaProjectIds.includes(project.id!);
    } else if (selectedCategory === "GameFi") {
      // Show projects NOT in the Kaia category (or other logic for GameFi)
      return !kaiaProjectIds.includes(project.id!);
    }
    // Default to showing all projects if no specific category is selected
    return true;
  });

  return (
    <>
      {/* Background Overlay */}
      <div 
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center z-10 opacity-80"
        style={{
          backgroundImage: `url('/assets/common/marketplace-bg.png')`,
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 10%, rgba(0,0,0,0) 60%)",
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 10%, rgba(0,0,0,0) 60%)",
        }}
      />

      {/* Hero Section */}
      <div className="relative w-full text-center z-20">
        {/* Title */}
        <h1 className="md:mt-20 font-chakra text-2xl md:text-4xl bg-gradient-to-r from-[#BFFF0D] to-[#25EAA2] text-transparent bg-clip-text">
          EARN MORE WITH QUBE
        </h1>
        
        {/* Subtitle */}
        <p className="text-sm md:text-xl mt-1 md:mt-2 mb-2 md:mb-4">
          Pick a project and refer to your friend to earn reward
        </p>

        {/* Browse Project Button */}
        <button 
          onClick={() => {
            const section = document.getElementById("marketplace");
            if (section) {
              section.scrollIntoView({ behavior: "smooth" });
            }
          }}
          className="inline-block bg-white text-black font-semibold px-6 py-2 md:mb-10 rounded-full transition 
                      hover:bg-gradient-to-r hover:from-[#BFFF0D] hover:to-[#25EAA2]"
        >
          Browse project
        </button>
      </div>

      <div id="marketplace" className="relative z-20 w-11/12 sm:w-2/3 xl:w-3/5 mx-auto pt-7 pb-10 md:pb-20">
        {/* Banner Message */}
        {bannerMessage && (
          <div className="bg-[#5865F2] hover:bg-[#5865F2]/90 font-semibold py-3 px-5 mb-6 rounded-lg flex items-center gap-2">
            {/* Explosion emoji */}
            <span
              className="text-2xl bg-white/5 px-2 py-1 rounded-lg"
              role="img"
              aria-label="explosion"
            >
              💥
            </span>
            <span className="text-md md:text-lg lg:text-xl">{bannerMessage}</span>
          </div>
        )}

        {loading ? (
          // Loading Spinner
          <div className="flex flex-row items-center justify-center gap-5 mt-20">
            <Image
              src="/assets/common/loading.png"
              alt="loading icon"
              width={50}
              height={50}
              className="animate-spin"
            />
            <p className="font-semibold text-lg animate-pulse">Loading...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          // Message for no projects available
          <div className="text-center mt-10">
            <p className="text-md">No projects</p>
            <p className="text-sm text-gray-400">Check back later for new opportunities to join exciting projects.</p>
          </div>
        ) : (
          // Project Cards Grid
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {featuredProjectId && filteredProjects.find((project) => project.id === featuredProjectId) ? (
              <>
                {/* Display featured project as a large card */}
                <div className="col-span-1 xl:col-span-2">
                  <MarketplaceProjectCard
                    project={filteredProjects.find((project) => project.id === featuredProjectId)!}
                    linkUrl={`${baseUrl}/affiliate/${featuredProjectId}`}
                    isFeatured={true}
                  />
                </div>
                
                {/* Display other projects in regular 2-column grid */}
                {filteredProjects
                  .filter((project) => project.id !== featuredProjectId)
                  .map((project) => (
                    <MarketplaceProjectCard
                      key={project.id}
                      project={project}
                      linkUrl={`${baseUrl}/affiliate/${project.id}`}
                    />
                  ))
                }
              </>
            ) : (
              // Display all projects in regular 2-column grid if there's no featured project
              filteredProjects.map((project) => (
                <MarketplaceProjectCard
                  key={project.id}
                  project={project}
                  linkUrl={`${baseUrl}/affiliate/${project.id}`}
                />
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}