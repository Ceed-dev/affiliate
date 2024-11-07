import React from "react";
import Image from "next/image";
import Link from "next/link";

type ProjectHeaderProps = {
  cover: string;             // Project cover image URL
  logo: string;              // Project logo image URL
  projectName: string;       // Project name
  description: string;       // Project description
  websiteUrl: string;        // Required website URL
  xUrl: string;              // Required X (formerly Twitter) URL
  discordUrl?: string;       // Optional Discord URL
};

/**
 * ProjectHeader Component
 *
 * Displays the header section for a project, including cover image, logo, project title,
 * description, and social media links. Social media icons are conditionally rendered 
 * based on their existence.
 */
export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  cover,
  logo,
  projectName,
  description,
  websiteUrl,
  xUrl,
  discordUrl,
}) => {
  // Social media links array with details for rendering icons
  const socialLinks = [
    { url: websiteUrl, icon: "/assets/common/www.png", alt: "Website", size: 40 },
    { url: xUrl, icon: "/brand-assets/x/black.png", alt: "X", size: 30 },
    { url: discordUrl, icon: "/brand-assets/discord.png", alt: "Discord", size: 40 },
  ];

  return (
    <div>
      {/* Cover Image Section */}
      <div className="h-[200px] relative mb-16">
        <Image
          src={cover}
          alt="Cover Image"
          layout="fill"
          objectFit="cover"
          className="rounded-lg"
        />

        {/* Logo and Social Links Overlay */}
        <div className="absolute bottom-[-50px] w-full flex flex-row items-end justify-between px-5">
          {/* Logo Image */}
          <Image
            className="w-28 h-28 rounded-full"
            src={logo}
            width={100}
            height={100}
            alt="Project Logo"
          />

          {/* Social Media Links */}
          <div className="flex flex-row gap-2">
            {socialLinks.map((link, index) => {
              if (!link.url) return null;  // Only render links that have a URL
              return (
                <Link 
                  key={index}
                  href={link.url}
                  target="_blank"
                  className="w-10 h-10 p-2 bg-slate-200 rounded-full flex items-center justify-center transition-transform duration-300 ease-in-out hover:scale-105"
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

      {/* Project Title and Description */}
      <h1 className="font-bold mb-2">{projectName}</h1>
      <p className="text-sm">{description}</p>
    </div>
  );
};