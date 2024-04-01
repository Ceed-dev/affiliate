"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

function Marketplace() {
  const projects = [
    {
      name: "Qube member NFT",
      description: "Qubeは分散型のアフィリエイトネットワークです。",
      avatarUrl: "/qube.png",
      imageUrl: "/background.jpg",
      reward: "15 USDC",
      projectUrl: "/qube-member-nft",
    },
    {
      name: "Pixels",
      description:
        "Pixels is an interoperable web3 farming game. Make your home in a world of unlimited adventure. Master skills and play with friends. Build new communities and enjoy a new style of gameplay! Explore, make friends and build the most amazing farming empire.",
      avatarUrl: "/pixels.png",
      imageUrl: "/background.jpg",
      reward: "1 USDC",
      projectUrl: "/marketplace",
    },
    {
      name: "Matr1x",
      description: "MATR1X is an innovative cultural and entertainment platform combining Web3 + Artificial Intelligence (AI) + eSports. Its purpose is to bring revolution in technological innovation to the global game and digital content industry via blockchain and AI technology.",
      avatarUrl: "/matr1x.png",
      imageUrl: "/background.jpg",
      reward: "1 USDC",
      projectUrl: "/marketplace",
    },
    {
      name: "StarryNift",
      description: "StarryNift is a co-creation metaverse, bringing players immersive 3D virtual experiences where they can Play, Create and Socialize. Our Mission: Expand Metaverse Horizons with innovative & diverse use cases to accelerate Web3 adoption.",
      avatarUrl: "/starrynift.png",
      imageUrl: "/background.jpg",
      reward: "1 USDC",
      projectUrl: "/marketplace",
    },
    {
      name: "motoDEX",
      description: "MotoDEX is a NFT game, competition of multi-level racing on motorcycles on high-speed tracks with unlimited opportunities for players. motoDEX is a project that is developing by leaps and bounds.",
      avatarUrl: "/motodex.png",
      imageUrl: "/background.jpg",
      reward: "1 USDC",
      projectUrl: "/marketplace",
    },
    {
      name: "OasChoice",
      description: "Earn Free OAS everyday! Quiz game for predicting the price of OAS! Tweet the results and get 10x the votes power!",
      avatarUrl: "/oaschoice.png",
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
                    <div className="shadow-md flex justify-center items-center rounded-full" >
                      <Image
                        className="bg-white rounded-full h-16 w-16 object-fill"
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