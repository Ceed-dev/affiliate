"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { ExtendedProjectData } from "../../types";
import { fetchAllProjects } from "../../utils/firebase";
import { fetchTokenSymbols } from "../../utils/contracts";
import { ProjectCard } from "../../components/ProjectCard";

export default function Marketplace() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const [projects, setProjects] = useState<ExtendedProjectData[] | []>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
    <div className="w-11/12 sm:w-2/3 mx-auto mt-5 pb-20">
      <h1 className="text-xl font-bold">Projects</h1>
      {loading ? (
        <div className="flex flex-row items-center justify-center gap-5 mt-20">
          <Image
            src="/assets/common/loading.png"
            alt="loading.png"
            width={50}
            height={50}
            className="animate-spin"
          /> 
          <p className="text-gray-500 font-semibold text-lg">Loading...</p>
        </div>
      ): (
        projects.length === 0 ? (
          <div className="text-center mt-10">
            <p className="text-sm">No projects</p>
            <p className="text-sm text-gray-500">Check back later for new opportunities to join exciting projects.</p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2">
            {projects.map((project: ExtendedProjectData) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                linkUrl={`${baseUrl}/affiliate/${project.id}`} 
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}