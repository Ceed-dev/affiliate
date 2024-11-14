import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ExtendedProjectData } from "../../types";

type ProjectCardProps = {
  project: ExtendedProjectData;
  linkUrl: string;
  isDarkBackground: boolean;
};

/**
 * ProjectCard Component
 * ---------------------------
 * This component displays a project card with details such as cover image, logo, project name,
 * description, and primary conversion point reward. It supports responsive styles for different
 * screen sizes and shows a project preview with a link to the project's detailed page.
 * 
 * Props:
 * - `project`: The project data to display.
 * - `linkUrl`: The URL to navigate to the project's detailed page.
 * 
 * @component
 * @param {ProjectCardProps} props - Contains `project`, `linkUrl` and `isDarkBackground`.
 * @returns {JSX.Element} Rendered ProjectCard component.
 */
export const ProjectCard: React.FC<ProjectCardProps> = ({ project, linkUrl, isDarkBackground }) => {
  // Extract the primary conversion point to display reward and type
  const conversionPoint = project.conversionPoints[0];
  const textColorClass = isDarkBackground ? "text-white/60" : "text-black/60";

  return (
    <Link
      href={linkUrl}
      className="space-y-2 transition duration-300 ease-in-out transform hover:scale-105"
    >
      {/* Project cover image */}
      <Image
        className="w-full h-[100px] md:h-[150px] lg:h-[220px] rounded-lg border border-white/10"
        src={project.cover as string}
        width={500}
        height={500}
        alt={`${project.projectName}'s cover`}
      />

      {/* Project logo and name */}
      <div className="flex items-center gap-2">
        <Image
          className="rounded-full h-7 w-7"
          src={project.logo as string}
          width={100}
          height={100}
          alt={`${project.projectName}'s logo`}
        />
        <h1 className="truncate font-bold">{project.projectName}</h1>
      </div>

      {/* Project description with a 2-line clamp */}
      <p 
        className={`text-sm text-ellipsis overflow-hidden ${textColorClass} line-clamp-2`}
        style={{ minHeight: "2.5rem" }}
      >
        {project.description}
      </p>

      {/* Conversion point reward display */}
      {conversionPoint && (
        <div className="text-right">
          <span className="font-bold mr-2">
            {conversionPoint.rewardAmount || conversionPoint.percentage}
          </span>
          <span className={`${textColorClass} text-sm`}>
            {conversionPoint.paymentType === "FixedAmount" ? project.selectedToken : "%"}
          </span>
        </div>
      )}
    </Link>
  );
};