"use client";

// Import necessary libraries and components
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { ExtendedProjectData } from "../../types";
import { fetchAllProjects } from "../../utils/firebase";
import { fetchTokenSymbols } from "../../utils/contracts";
import { ProjectCard } from "../../components/project";
import { getFeaturedProject, getMarketplaceBanner } from "../../utils/appSettingsUtils";

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
  
  // State variables
  const [projects, setProjects] = useState<ExtendedProjectData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [featuredProjectId, setFeaturedProjectId] = useState<string | null>(null);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  // Fetch project data on component mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        // Fetch all projects, featured project data, and marketplace banner data
        const [projectsData, featuredProjectData, bannerData] = await Promise.all([
          fetchAllProjects(),
          getFeaturedProject(),
          getMarketplaceBanner(),
        ]);

        // Set the featured project ID if available
        if (featuredProjectData) {
          setFeaturedProjectId(featuredProjectData.projectId);
        }

        // Set the banner message if available
        if (bannerData) {
          setBannerMessage(bannerData.message);
        }

        // Fetch token symbols for projects
        const projectsWithSymbols = await fetchTokenSymbols(projectsData);
        setProjects(projectsWithSymbols);
      } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : "An unknown error occurred";
        toast.error(`Error: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  return (
    <div className="w-11/12 sm:w-2/3 lg:w-3/5 mx-auto pb-10 md:py-20">
      {/* Banner Message */}
      {bannerMessage && (
        <div className="bg-[#5865F2] font-semibold py-3 px-5 mb-6 rounded-lg flex items-center gap-2">
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

      {/* Page Title, hidden on small screens */}
      <h1 className="hidden md:block text-2xl font-bold mb-5">Projects</h1>

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
      ) : projects.length === 0 ? (
        // Message for no projects available
        <div className="text-center mt-10">
          <p className="text-md">No projects</p>
          <p className="text-sm text-gray-400">Check back later for new opportunities to join exciting projects.</p>
        </div>
      ) : (
        // Project Cards Grid
        <div className="grid grid-cols-2 gap-4">
          {featuredProjectId && projects.find((project) => project.id === featuredProjectId) ? (
            <>
              {/* Display featured project as a large card */}
              <div className="col-span-2 mb-6 md:mb-10 transition duration-300 ease-in-out transform hover:scale-105">
                <ProjectCard
                  project={projects.find((project) => project.id === featuredProjectId)!}
                  linkUrl={`${baseUrl}/affiliate/${featuredProjectId}`}
                  isDarkBackground={true}
                  isFeatured={true}
                />
              </div>
              
              {/* Display other projects in regular 2-column grid */}
              {projects
                .filter((project) => project.id !== featuredProjectId)
                .map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    linkUrl={`${baseUrl}/affiliate/${project.id}`}
                    isDarkBackground={true}
                  />
                ))
              }
            </>
          ) : (
            // Display all projects in regular 2-column grid if there's no featured project
            projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                linkUrl={`${baseUrl}/affiliate/${project.id}`}
                isDarkBackground={true}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}