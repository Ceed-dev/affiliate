import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getChainByChainIdAsync } from "@thirdweb-dev/chains";
import { ExtendedProjectData } from "../types";
import { formatChainName } from "../utils/formatUtils";

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
    <Link
      href={linkUrl}
      className="space-y-2 transition duration-300 ease-in-out transform hover:scale-105"
    >
      <Image
        className="w-full max-h-[200px] rounded-lg"
        src={project.cover as string}
        width={500}
        height={500}
        alt={`${project.projectName}'s cover`}
      />
      <div className="flex flex-row items-center gap-2">
        <Image
          className="rounded-full h-7 w-7"
          src={project.logo as string}
          width={100}
          height={100}
          alt={`${project.projectName}'s logo`}
        />
        <h1 className="truncate font-bold">{project.projectName}</h1>
      </div>
      <p
        className="text-slate-600 text-sm text-ellipsis overflow-hidden"
        style={{ display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 2 }}
      >
        {project.description}
      </p>
      <p className="text-sm font-semibold text-right">
        {project.conversionPoints[0].rewardAmount || project.conversionPoints[0].percentage}
        {" "}
        {project.conversionPoints[0].paymentType === "FixedAmount" ? project.selectedToken : "%"}
      </p>
    </Link>
  );
};