"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { ProjectData, ExtendedProjectData } from "../../types";
import { fetchAllProjects } from "../../utils/firebase";
import { initializeSigner, ERC20 } from "../../utils/contracts";
import { ProjectCard } from "../../components/ProjectCard";

export default function Marketplace() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const [projects, setProjects] = useState<ExtendedProjectData[] | []>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTokenSymbols = async (projects: ProjectData[]) => {
      const signer = initializeSigner();
      return Promise.all(projects.map(async (project) => {
        const erc20 = new ERC20(project.selectedTokenAddress, signer!);
        const symbol = await erc20.getSymbol();
        return { ...project, selectedToken: symbol };
      }));
    };

    fetchAllProjects()
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
  }, []);

  return (
    <div className="min-h-screen">
      <div className="w-11/12 sm:w-2/3 mx-auto pt-10 pb-20">
        <div className="text-left">
          <h2 className="text-3xl leading-9 font-extrabold text-[#121212] sm:text-4xl sm:leading-10">
            Marketplace
          </h2>
          <p className="mt-4 text-lg leading-6 text-[#6B7280]">
            Earn a percentage of the revenue you generate for projects.
          </p>
        </div>
        {loading 
          ? 
            <div className="flex flex-row items-center justify-center gap-5 mt-20">
              <Image src="/loading.png" alt="loading.png" width={50} height={50} className="animate-spin" /> 
              <p className="text-gray-500 font-semibold text-lg">Loading...</p>
            </div>
          : 
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((project: ExtendedProjectData) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  linkUrl={`${baseUrl}/affiliate/${project.id}`} 
                />
              ))}
            </div>
        }
      </div>
    </div>
  );
}