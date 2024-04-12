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
    { url: projectData?.discordUrl, icon: "/discord.png", alt: "discord.png", size: 40 },
    { url: projectData?.twitterUrl, icon: "/x.png", alt: "x.png" ,size: 30 },
    { url: projectData?.instagramUrl, icon: "/instagram.png", alt: "instagram.png", size: 40 }
  ];

  return (
    <div className="h-[200px] w-full relative mb-24 flex justify-center">
      {projectData?.cover 
        ? <Image 
            src={projectData.cover} 
            alt="Cover" 
            layout="fill" 
            objectFit="cover" 
          /> 
        : <div className={`w-full h-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 ${loading ? "animate-pulse" : ""}`} />
      }
      <div className="w-2/3 absolute bottom-[-75px] flex flex-row justify-between">
        <div className="flex flex-row items-end">
          <div className={`w-40 h-40 bg-white rounded-full shadow-md flex items-center justify-center ${loading ? "animate-pulse" : ""}`}>
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
          <h1 className="text-3xl font-semibold px-10 py-5">{projectData?.projectName}</h1>
        </div>
        <div className="flex flex-row items-center gap-5">
          {socialLinks.map((link, index) => {
            if (!link.url) return null;
            return (
              <Link 
                key={index}
                href={link.url}
                target="_blank"
                className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center transition-transform duration-300 ease-in-out hover:scale-105"
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