"use client";

import React, { useState, useEffect } from "react";
import { fetchAllProjects } from "../utils/firebase";
import { toast } from "react-toastify";
import { ProjectData } from "../types";
import Image from "next/image";
import Link from "next/link";

export default function Marketplace() {
  const [projects, setProjects] = useState<ProjectData[] | []>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllProjects()
      .then(setProjects)
      .catch(error => {
        const errorMessage = error.message || "An unknown error occurred";
        setError(errorMessage);
        toast.error(`Error: ${errorMessage}`);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <div className="py-20 px-36">
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
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <Link href={`http://localhost:3000/affiliate/${project.id}`} key={index}>
                  <div className="max-w-xl w-full h-[300px] bg-white rounded-lg shadow-md overflow-hidden transition duration-300 ease-in-out transform hover:scale-105">
                    <div className="w-full h-16 bg-gray-200 mb-10 relative">
                      <Image
                        className="w-full h-full object-cover"
                        src={project.cover as string}
                        width={100}
                        height={100}
                        alt={`${project.projectName}'s cover`}
                      />
                      <div className="absolute top-8 px-10 w-full flex flex-row items-center justify-between">
                        <div className="shadow-md flex justify-center items-center rounded-full" >
                          <Image
                            className="bg-white rounded-full h-16 w-16 object-fill"
                            src={project.logo as string}
                            width={50}
                            height={50}
                            alt={`${project.projectName}'s logo`}
                          />
                        </div>
                        <p className="font-semibold bg-green-200 px-2 py-1 rounded-md border border-white">{project.rewardAmount} {project.selectedToken}</p>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col gap-5">
                      <h3 className="text-lg leading-6 font-medium text-[#121212]">
                        {project.projectName}
                      </h3>
                      <p className="text-gray-700 text-base">{project.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
        }
      </div>
    </div>
  );
}