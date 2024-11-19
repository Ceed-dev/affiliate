"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAddress } from "@thirdweb-dev/react";
import { toast } from "react-toastify";
import { ExtendedProjectData } from "../types";
import { fetchProjects } from "../utils/projectUtils";
import { fetchTokenSymbols } from "../utils/contracts";
import { ProjectCard } from "../components/project";

/**
 * Projects Component
 * ---------------------------
 * This component displays a list of projects created by the client (project owner).
 * It fetches the projects owned by the connected wallet address and displays them in a grid.
 * If no projects exist, a message prompts the user to create a new project.
 *
 * Layout:
 * - Shows a loading spinner while data is being fetched.
 * - Displays a list of project cards if projects are available.
 * - Displays a message if no projects are currently available.
 *
 * @returns {JSX.Element} - The rendered projects page component.
 */
export default function Projects() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const address = useAddress();

  // State variables
  const [projects, setProjects] = useState<ExtendedProjectData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch the projects owned by the current user
  useEffect(() => {
    if (address) {
      const loadProjects = async () => {
        try {
          const projectsData = await fetchProjects({ ownerAddress: address });
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
    }
  }, [address]);

  return (
    <div className="w-11/12 sm:w-2/3 lg:w-3/5 mx-auto mb-10 md:my-20">
      {/* Page Title and New Project Button */}
      <div className="flex flex-row justify-between items-center mb-5">
        <h1 className="text-2xl font-bold">Your Projects</h1>
        <Link 
          href="/projects/create-project" 
          className="bg-[#25D366] text-white py-2 px-3 text-sm rounded-md transition duration-300 ease-in-out transform hover:scale-105"
        >
          + New Project
        </Link>
      </div>

      {/* Loading Spinner */}
      {loading ? (
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
        // Message when no projects are available
        <div className="text-center mt-10">
          <p className="text-md">No projects</p>
          <p className="text-sm text-gray-400">Get started by creating a new project.</p>
        </div>
      ) : (
        // Project Cards Grid
        <div className="grid grid-cols-2 gap-4">
          {projects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              linkUrl={`${baseUrl}/projects/${project.id}`}
              isDarkBackground={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}