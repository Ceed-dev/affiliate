"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAddress } from "@thirdweb-dev/react";
import { toast } from "react-toastify";
import { ProjectData } from "../types";
import { fetchProjectsByOwner } from "../utils/firebase";

export default function Projects() {
  const address = useAddress();
  const [projects, setProjects] = useState<ProjectData[] | []>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (address) {
      fetchProjectsByOwner(address)
        .then(setProjects)
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
      {projects.length === 0
        ?
          <div className="text-center mt-10">
            <p className="text-sm">No projects</p>
            <p className="text-sm text-gray-500">Get started by creating a new project.</p>
          </div>
        : 
          (projects.map((project: ProjectData) => (
            <div key={project.id}>{project.id}</div>
          )))
      }
    </div>
  );
}