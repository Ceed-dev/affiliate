"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  ConnectWallet,
  lightTheme,
  useAddress,
} from "@thirdweb-dev/react";
import { ProjectData } from "../../types";

import { fetchProjectData } from "../../utils/firebase";

export default function Affiliate({ params }: { params: { projectId: string } }) {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjectData(params.projectId)
      .then(data => {
        setProjectData(data);
        setLoading(false);
      })
      .catch(error => {
        const message = (error instanceof Error) ? error.message : "Unknown error";
        console.error("Error loading the project: ", message);
        setError(message);
        setLoading(false);
      });
  }, [params.projectId]);

  const address = useAddress();

  const [buttonLabel, setButtonLabel] = useState("Copy");

  const copyTextToClipboard = async () => {
    const text = "http://localhost:3000/qube-member-nft/referee?r=kelsin";
    try {
      await navigator.clipboard.writeText(text);
      setButtonLabel("Copied!");
      setTimeout(() => setButtonLabel("Copy"), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <div className="flex flex-col">

      {/* Header */}
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
            {projectData?.websiteUrl && 
              <Link 
                href={projectData.websiteUrl}
                target="_blank"
                className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center transition-transform duration-300 ease-in-out hover:scale-105"
              >
                <Image
                  src="/www.png"
                  width={40}
                  height={40}
                  alt="www.png"
                />
              </Link>
            }
            {projectData?.discordUrl &&
              <Link
                href={projectData.discordUrl}
                target="_blank"
                className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center transition-transform duration-300 ease-in-out hover:scale-105"
              >
                <Image
                  src="/discord.png"
                  width={40}
                  height={40}
                  alt="discord.png"
                />
              </Link>
            }
            {projectData?.twitterUrl &&
              <Link 
                href={projectData.twitterUrl}
                target="_blank"
                className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center transition-transform duration-300 ease-in-out hover:scale-105"
              >
                <Image
                  src="/x.png"
                  width={30}
                  height={30}
                  alt="x.png"
                />
              </Link>
            }
            {projectData?.instagramUrl &&
              <Link 
                href={projectData.instagramUrl}
                target="_blank"
                className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center transition-transform duration-300 ease-in-out hover:scale-105"
              >
                <Image
                  src="/instagram.png"
                  width={40}
                  height={40}
                  alt="instagram.png"
                />
              </Link>
            }
          </div>
        </div>
      </div>

      <div className="flex flex-row w-full justify-center gap-32">
        <div className="w-1/3 border rounded-lg shadow-md p-6 text-lg">
          Qube is an decentralized affiliate network for gaming.
        </div>
        <div className="p-6 border rounded-lg shadow-md h-min">
          <h2 className="text-lg font-semibold text-gray-900">Earn 15 USDC for each successful referral</h2>
          <p className="text-gray-600 pb-4">{address ? "Share your link with other and start earning!" : "Join the project to start referring others."}</p>

          {address && <div className="flex justify-center items-center bg-[#F3F4F6] rounded-lg p-2 mb-4 gap-5">
            <input
              type="text"
              value="http://localhost:3000/qube-member-nft/referee?r=kelsin"
              readOnly
              className="font-roboto text-sm bg-transparent outline-none w-full"
            />
            <button
              type="button"
              className="text-sm text-[#2563EB] bg-transparent hover:underline"
              onClick={copyTextToClipboard}
            >
              {buttonLabel}
            </button>
          </div>}

          <div className="flex flex-col justify-stretch mt-4">
            <ConnectWallet
              theme={lightTheme({
                colors: { primaryButtonBg: "#0091ff" },
              })}
              btnTitle={"Join Project"}
              switchToActiveChain={true}
              modalSize={"compact"}
              modalTitleIconUrl={""}
              showThirdwebBranding={false}
            />
          </div>

        </div>
      </div>

      {/* {address && <div className="w-3/5 mt-10">
        <div className="flex flex-row gap-20">
          <div className="h-[100px] w-full text-gray-500 p-5 rounded-lg shadow-md">
            <p>Referrals</p>
            <span className="text-2xl text-black">1</span> from 1 visit
          </div>
          <div className="h-[100px] w-full text-gray-500 p-5 rounded-lg shadow-md">
            <p>Purchased</p>
            <span className="text-2xl text-black">50 USDC</span> by 1 purchasers
          </div>
          <div className="h-[100px] w-full text-gray-500 p-5 rounded-lg shadow-md">
            <p>Earned (USDC)</p>
            <p className="text-2xl text-black">15 USDC</p>
          </div>
        </div>
        <div className="border rounded-lg shadow-md mt-10">
          <div className="flex flex-row px-10 py-3 bg-gray-50 shadow-sm">
            <p className="flex-1">Address</p>
            <p className="flex-1">Purchased</p>
            <p className="flex-1">USDC Paid</p>
            <p className="flex-1">Your Share (USDC)</p>
          </div>
          <div className="flex flex-row px-10 py-3 shadow-sm">
            <p className="flex-1">0xf1f...998a</p>
            <p className="flex-1">✅</p>
            <p className="flex-1">50</p>
            <p className="flex-1">15</p>
          </div>
        </div>
      </div>} */}

    </div>
  );
}