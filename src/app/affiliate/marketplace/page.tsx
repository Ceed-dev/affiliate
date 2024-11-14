"use client";

// Import necessary libraries and components
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { ExtendedProjectData } from "../../types";
import { fetchAllProjects } from "../../utils/firebase";
import { fetchTokenSymbols } from "../../utils/contracts";
import { ProjectCard } from "../../components/project";

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

  // Fetch project data on component mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectsData = await fetchAllProjects();
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
    <div className="w-11/12 sm:w-2/3 lg:w-3/5 mx-auto mb-10 md:my-20">
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
          {projects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              linkUrl={`${baseUrl}/affiliate/${project.id}`} 
              isDarkBackground={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}