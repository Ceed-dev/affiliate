import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ProjectData } from "../../types";

type MarketplaceProjectCardProps = {
  project: ProjectData;
  linkUrl: string;
  isFeatured?: boolean;
};

/**
 * MarketplaceProjectCard Component
 * ---------------------------
 * This component displays a project card with details such as cover image, project name,
 * description, and primary conversion point reward. It supports responsive styles for different
 * screen sizes and shows a project preview with a link to the project's detailed page.
 *
 * Props:
 * - `project`: The project data to display.
 * - `linkUrl`: The URL to navigate to the project's detailed page.
 * - `isFeatured`: Optional flag to indicate if the project is featured (default is false).
 *
 * @component
 * @param {MarketplaceProjectCardProps} props - Contains `project`, `linkUrl`, and `isFeatured`.
 * @returns {JSX.Element} Rendered MarketplaceProjectCard component.
 */
export const MarketplaceProjectCard: React.FC<MarketplaceProjectCardProps> = ({
  project,
  linkUrl,
  isFeatured = false,
}) => {
  const conversionPoint = project.conversionPoints[0];
  const rewardText =
    conversionPoint.paymentType === "FixedAmount"
      ? project.isUsingXpReward
        ? "XP"
        : project.selectedToken.symbol
      : "% " + project.selectedToken.symbol;

  const tokenSymbol = project.selectedToken?.symbol || "";
  const tokenImageSrc = ["USDC", "USDT"].includes(tokenSymbol)
    ? `/tokens/${tokenSymbol}.png`
    : "/assets/common/xp.png";

  return (
    <Link
      href={linkUrl}
      className="block transition duration-300 ease-in-out transform hover:scale-105"
    >
      <div className="bg-[#1E1E1E] p-4 rounded-2xl">
        {/* Project Title & Description */}
        <h2 className="text-2xl line-clamp-1">{project.projectName}</h2>
        <p className="text-sm text-gray-400 mt-1 line-clamp-2 min-h-[40px]">
          {project.description}
        </p>

        {/* Project Cover Image */}
        <div
          className={`relative rounded-2xl overflow-hidden my-5 ${isFeatured ? "h-[168px] xl:h-[366px]" : "h-[168px]"
            }`}
        >
          <Image
            src={project.cover as string}
            alt={`${project.projectName}'s cover`}
            layout="fill"
            objectFit="cover"
          />
        </div>

        {/* Reward Display */}
        <div className="flex items-center gap-3">
          {/* Reward Icon */}
          <Image
            src={tokenImageSrc}
            alt={tokenSymbol || "Default XP"}
            width={48}
            height={48}
          />

          {/* Reward Text */}
          <div>
            <p className="text-gray-400">Successful referral</p>
            <p className="font-semibold text-xl">
              Earn{" "}
              <span className="bg-gradient-to-r from-[#BFFF0D] to-[#25EAA2] text-transparent bg-clip-text">
                {conversionPoint.rewardAmount || conversionPoint.percentage}{" "}
                {rewardText}
              </span>{" "}
              each
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};
