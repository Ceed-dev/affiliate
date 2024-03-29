"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

function Marketplace() {
  const projects = [
    {
      name: "Test NFT Collection",
      description:
        "Blockchain Analytics that help you invest with confidence. Discover and instantly Trade over 3M+ tokens with Flooz.xyz",
      avatarUrl: "/qube.png",
      imageUrl: "/background.jpg",
      reward: "1 USDC",
      projectUrl: "/test-nft-collection",
    },
    {
      name: "ShareMint Affiliate Program",
      description:
        "ShareMint turns your community into your most effective salesforce",
      avatarUrl: "/vercel.png",
      imageUrl: "/background.jpg",
      reward: "1 USDC",
      projectUrl: "/marketplace",
    },
    {
      name: "Ledger Affiliate Program",
      description:
        "Create unique referral links that invite your audience to shop for Ledger products, the world's leading solutions to self-custody and manage your crypto assets securely.",
      avatarUrl: "/vercel.png",
      imageUrl: "/background.jpg",
      reward: "1 USDC",
      projectUrl: "/marketplace",
    },
    {
      name: "Binance Affiliate Program",
      description:
        "Join the Binance Affiliate Program and earn special rewards when you introduce new users to Binance, the world's leading cryptocurrency exchange.",
      avatarUrl: "/vercel.png",
      imageUrl: "/background.jpg",
      reward: "1 USDC",
      projectUrl: "/marketplace",
    },
    {
      name: "Inbox Zero",
      description: "Clean up your email inbox in minutes with AI assistance.",
      avatarUrl: "/vercel.png",
      imageUrl: "/background.jpg",
      reward: "1 USDC",
      projectUrl: "/marketplace",
    },
    {
      name: "Awaken Tax",
      description:
        "Awaken is the first tax software built for web3. Awaken gives you the crypto reports that you need.",
      avatarUrl: "/vercel.png",
      imageUrl: "/background.jpg",
      reward: "1 USDC",
      projectUrl: "/marketplace",
    },
  ];

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
            <Link href={project.projectUrl} key={index}>
              <div className="max-w-xl w-full h-[300px] bg-white rounded-lg shadow-md overflow-hidden transition duration-300 ease-in-out transform hover:scale-105">
                <div className="w-full h-16 bg-gray-200 mb-10 relative">
                  <Image
                    className="w-full h-full object-cover"
                    src={project.imageUrl}
                    width={100}
                    height={100}
                    alt={`${project.name} image`}
                  />
                  <div className="absolute top-8 px-10 w-full flex flex-row items-center justify-between">
                    <div className="w-16 h-16 bg-white rounded-full shadow-md flex justify-center items-center" >
                      <Image
                        src={project.avatarUrl}
                        width={50}
                        height={50}
                        alt={`${project.avatarUrl}`}
                      />
                    </div>
                    <p className="font-semibold bg-green-200 px-2 py-1 rounded-md border border-white">{project.reward}</p>
                  </div>
                </div>
                <div className="p-4 flex flex-col gap-5">
                  <h3 className="text-lg leading-6 font-medium text-[#121212]">
                    {project.name}
                  </h3>
                  <p className="text-gray-700 text-base">{project.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Marketplace;