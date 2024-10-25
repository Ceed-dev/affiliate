import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExtendedProjectData } from "../types";
import { formatChainName } from "../utils/formatUtils";
import { getChainByChainIdAsync } from "@thirdweb-dev/chains";

type ProjectCardProps = {
  project: ExtendedProjectData;
  linkUrl: string;
};

export const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  linkUrl,
}) => {
  const [chainName, setChainName] = useState<string | undefined>();

  useEffect(() => {
    const fetchChainName = async () => {
      try {
        const chain = await getChainByChainIdAsync(project.selectedChainId);
        setChainName(chain.name);
      } catch (error) {
        console.error(`Failed to get chain name for chain ID ${project.selectedChainId}:`, error);
      }
    };

    fetchChainName();
  }, [project.selectedChainId]);

  return (
    <Link href={linkUrl}>
      <div className="max-w-xl w-full h-[300px] bg-white rounded-lg shadow-md overflow-visible transition duration-300 ease-in-out transform hover:scale-105">
        <div className="w-full h-16 bg-gray-200 mb-10">
          <Image
            className="w-full h-full object-cover rounded-t-lg"
            src={project.cover as string}
            width={100}
            height={100}
            alt={`${project.projectName}'s cover`}
          />
          <div className="absolute top-8 px-10 w-full flex flex-row items-center justify-between">
            <div className="shadow-md flex justify-center items-center rounded-full">
              <Image
                className="bg-white rounded-full h-16 w-16 object-fill"
                src={project.logo as string}
                width={50}
                height={50}
                alt={`${project.projectName}'s logo`}
              />
            </div>
            <p className="flex flex-row items-center bg-green-200 px-2 py-1 rounded-md border border-white">
              <p className="font-semibold">{project.selectedToken}</p>
              {chainName && <Image src={`/chains/${formatChainName(chainName)}.png`} alt={chainName} width={18} height={18} className="m-1" />}
            </p>
          </div>
        </div>
        <div className="p-4 flex flex-col gap-5">
          <h3 className="text-lg leading-6 font-medium text-[#121212] truncate">{project.projectName}</h3>
          <p className="text-gray-700 text-base overflow-hidden text-ellipsis" style={{ display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 5 }}>
            {project.description}
          </p>
        </div>
      </div>
    </Link>
  );
};