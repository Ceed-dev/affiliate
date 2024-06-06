"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAddress } from "@thirdweb-dev/react";
import { toast } from "react-toastify";
import { ProjectData, ExtendedProjectData } from "../types";
import { fetchProjectsByOwner } from "../utils/firebase";
import { initializeSigner, ERC20 } from "../utils/contracts";
import { ProjectCard } from "../components/ProjectCard";

export default function Projects() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const address = useAddress();
  const [projects, setProjects] = useState<ExtendedProjectData[] | []>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTokenSymbols = async (projects: ProjectData[]) => {
      const signer = initializeSigner();
      return Promise.all(projects.map(async (project) => {
        const erc20 = new ERC20(project.selectedTokenAddress, signer);
        const symbol = await erc20.getSymbol();
        return { ...project, selectedToken: symbol };
      }));
    };
  
    if (address) {
      fetchProjectsByOwner(address)
        .then(async (projects) => {
          const projectsWithSymbols = await fetchTokenSymbols(projects);
          setProjects(projectsWithSymbols);
        })
        .catch(error => {
          const errorMessage = error.message || "An unknown error occurred";
          setError(errorMessage);
          toast.error(`Error: ${errorMessage}`);
        })
        .finally(() => setLoading(false));
    }
  }, [address]);

  return (
    <div className="w-2/3 mx-auto mt-10">
      <div className="flex flex-row justify-between items-center mb-10">
        <h1 className="text-2xl font-semibold">Your Projects</h1>
        <Link 
          href="/projects/create-project" 
          className="bg-sky-500 text-white py-2 px-3 text-sm rounded-md transition duration-300 ease-in-out transform hover:scale-105"
        >
          + New Project
        </Link>
      </div>
      {loading && 
        <div className="flex flex-row items-center justify-center gap-5 mt-20">
          <Image src="/loading.png" alt="loading.png" width={50} height={50} className="animate-spin" /> 
          <p className="text-gray-500 font-semibold text-lg">Loading...</p>
        </div>
      }
      {!loading && projects.length === 0
        ?
          <div className="text-center mt-10">
            <p className="text-sm">No projects</p>
            <p className="text-sm text-gray-500">Get started by creating a new project.</p>
          </div>
        : 
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project: ExtendedProjectData) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                linkUrl={`${baseUrl}/projects/${project.id}${project.projectType === "DirectPayment" ? "/settings" : ""}`} 
                isMultipleOwners={project.ownerAddresses.length > 1}
              />
            ))}
          </div>
      }
    </div>
  );
}