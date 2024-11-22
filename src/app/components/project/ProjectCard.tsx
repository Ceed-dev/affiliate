import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ProjectData } from "../../types";

type ProjectCardProps = {
  project: ProjectData; // The project data containing details such as name, description, and images
  linkUrl: string;              // The URL to navigate to the detailed project page when the card is clicked
  isDarkBackground: boolean;    // A flag indicating whether the card should have a dark background
  isFeatured?: boolean;         // Optional flag to indicate if the project is featured (default is false)
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
 * - `isDarkBackground`: Indicates whether the background is dark.
 * - `isFeatured`: Optional flag to indicate if the project is featured (default is false).
 * 
 * @component
 * @param {ProjectCardProps} props - Contains `project`, `linkUrl`, `isDarkBackground`, and `isFeatured`.
 * @returns {JSX.Element} Rendered ProjectCard component.
 */
export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  linkUrl,
  isDarkBackground,
  isFeatured = false, // Default to false if not provided
}) => {
  // Extract the primary conversion point to display reward and type
  const conversionPoint = project.conversionPoints[0];
  const textColorClass = isDarkBackground ? "text-white/60" : "text-black/60";

  return (
    <Link
      href={linkUrl}
      className="space-y-2 transition duration-300 ease-in-out transform hover:scale-105"
    >
      {/* Project cover image */}
      <div className={`relative border border-white/10 rounded-lg ${
        isFeatured ? "h-[200px] md:h-[300px] lg:h-[440px]" : "h-[100px] md:h-[150px] lg:h-[220px]"
      }`}>
        <Image
          className="rounded-lg"
          src={project.cover as string}
          alt={`${project.projectName}'s cover`}
          layout="fill"
          objectFit="cover"
        />
      </div>

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
            {/* TODO
              Temporary Fix:
              The reward unit displayed on the affiliate's screen is temporarily set to "xp" for all projects, regardless of the actual payment type.
              This change does not affect the underlying data structure or the way rewards are configured during project creation.
              The displayed value here is purely for UI purposes and does not modify backend or project-related data.
              */}
            {isDarkBackground
              ? "xp"
              : conversionPoint.paymentType === "FixedAmount"
              ? project.selectedToken.symbol
              : "%"}
          </span>
        </div>
      )}
    </Link>
  );
};