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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading projects.</p>;

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
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <div>ID: {project.id}, Name: {project.projectName}</div>
            // <Link href={project.projectUrl} key={index}>
            //   <div className="max-w-xl w-full h-[300px] bg-white rounded-lg shadow-md overflow-hidden transition duration-300 ease-in-out transform hover:scale-105">
            //     <div className="w-full h-16 bg-gray-200 mb-10 relative">
            //       <Image
            //         className="w-full h-full object-cover"
            //         src={project.imageUrl}
            //         width={100}
            //         height={100}
            //         alt={`${project.name} image`}
            //       />
            //       <div className="absolute top-8 px-10 w-full flex flex-row items-center justify-between">
            //         <div className="shadow-md flex justify-center items-center rounded-full" >
            //           <Image
            //             className="bg-white rounded-full h-16 w-16 object-fill"
            //             src={project.avatarUrl}
            //             width={50}
            //             height={50}
            //             alt={`${project.avatarUrl}`}
            //           />
            //         </div>
            //         <p className="font-semibold bg-green-200 px-2 py-1 rounded-md border border-white">{project.reward}</p>
            //       </div>
            //     </div>
            //     <div className="p-4 flex flex-col gap-5">
            //       <h3 className="text-lg leading-6 font-medium text-[#121212]">
            //         {project.name}
            //       </h3>
            //       <p className="text-gray-700 text-base">{project.description}</p>
            //     </div>
            //   </div>
            // </Link>
          ))}
        </div>
      </div>
    </div>
  );
}