import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ExtendedProjectData } from "../types";

type ProjectCardProps = {
  project: ExtendedProjectData;
  linkUrl: string;
  isMultipleOwners?: boolean;
};

export const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  linkUrl,
  isMultipleOwners = false 
}) => {
  return (
    <Link href={linkUrl}>
      <div className="max-w-xl w-full h-[300px] bg-white rounded-lg shadow-md overflow-visible transition duration-300 ease-in-out transform hover:scale-105">
        <div className="w-full h-16 bg-gray-200 mb-10 relative">
          {isMultipleOwners && (
            <Image
              className="absolute -top-4 right-10 bg-white border-2 border-slate-300 rounded-full shadow-lg"
              src="/people.png"
              width={50}
              height={50}
              alt="People Icon"
            />
          )}
          <Image
            className="absolute -top-4 -right-4 bg-white border-2 border-slate-300 rounded-full shadow-lg"
            src={project.projectType === "DirectPayment" ? "/direct-payment.png" : "/escrow-payment.png"}
            width={50}
            height={50}
            alt="Project Type Icon"
          />
          <Image
            className="w-full h-full object-cover"
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
            <p className="font-semibold bg-green-200 px-2 py-1 rounded-md border border-white">
              {project.projectType === "EscrowPayment" ? `${project.rewardAmount} ${project.selectedToken}` : project.selectedToken}
            </p>
          </div>
        </div>
        <div className="p-4 flex flex-col gap-5">
          <h3 className="text-lg leading-6 font-medium text-[#121212]">{project.projectName}</h3>
          <p className="text-gray-700 text-base">{project.description}</p>
        </div>
      </div>
    </Link>
  );
};