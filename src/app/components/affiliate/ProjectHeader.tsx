import React from "react";
import Image from "next/image";
import Link from "next/link";

import { ProjectData } from "../../types";

type ProjectHeaderProps = {
  projectData: ProjectData | null;
  loading: boolean;
};

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({ projectData, loading }) => {
  const socialLinks = [
    { url: projectData?.websiteUrl, icon: "/www.png", alt: "www.png", size: 40 },
    { url: projectData?.xUrl, icon: "/x.png", alt: "x.png" ,size: 30 },
    { url: projectData?.discordUrl, icon: "/discord.png", alt: "discord.png", size: 40 },
  ];

  return (
    <div className="h-[200px] w-full relative mb-32 lg:mb-24 flex justify-center">
      {projectData?.cover 
        ? <Image 
            src={projectData.cover} 
            alt="Cover" 
            layout="fill" 
            objectFit="cover" 
          /> 
        : <div className={`w-full h-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 ${loading ? "animate-pulse" : ""}`} />
      }
      <div className="w-11/12 sm:w-2/3 absolute bottom-[-100px] lg:bottom-[-75px] flex flex-col lg:flex-row lg:justify-between">
        <div className="flex flex-row items-end justify-between lg:justify-normal w-full">
          <div className={`w-20 lg:w-40 rounded-full shadow-md flex items-center justify-center ${loading ? "animate-pulse" : ""}`}>
            {projectData?.logo && 
              <Image
                className="w-full rounded-full"
                src={projectData?.logo}
                width={100}
                height={100}
                alt="Logo"
              />
            }
          </div>
          <h1 className="text-lg sm:text-xl font-semibold px-3 sm:px-5 py-2 sm:py-3 md:py-4 lg:py-5 truncate w-full lg:max-w-[400px] xl:max-w-[500px] 2xl:max-w-[720px]">{projectData?.projectName}</h1>
        </div>
        <div className="flex flex-row items-center justify-center gap-5">
          {socialLinks.map((link, index) => {
            if (!link.url) return null;
            return (
              <Link 
                key={index}
                href={link.url}
                target="_blank"
                className="w-14 h-14 lg:w-16 lg:h-16 p-2 bg-white rounded-full shadow-md flex items-center justify-center transition-transform duration-300 ease-in-out hover:scale-105"
              >
                <Image
                  src={link.icon}
                  width={link.size}
                  height={link.size}
                  alt={link.alt}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}