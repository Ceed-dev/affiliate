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

import { ProjectHeader } from "../../components/affiliate";

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

  const copyLinkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(REFERRAL_LINK);
      setButtonLabel("Copied!");
      setTimeout(() => setButtonLabel("Copy"), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  // TODO: Fix
  const REFERRAL_LINK = `http://localhost:3000/affiliate/${params.projectId}/referee?r=kelsin`;

  return (
    <div className="flex flex-col">

      {/* Header */}
      <ProjectHeader projectData={projectData} loading={loading} />

      <div className="w-2/3 flex flex-row mx-auto gap-10">
        <div className={`basis-3/5 border rounded-lg shadow-md p-6 text-lg bg-white ${loading ? "animate-pulse" : ""}`}>
          {projectData?.description}
        </div>
        <div className="basis-2/5 border rounded-lg shadow-md p-6 h-min bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Earn {projectData?.rewardAmount || <span className="text-gray-500">Loading...</span>} {projectData?.selectedToken} for each successful referral</h2>
          <p className="text-gray-600 pb-4">{address ? "Share your link with others and start earning!" : "Join the project to start referring others."}</p>

          {address && 
            <div className="flex bg-[#F3F4F6] rounded-md p-2 gap-3">
              <input
                type="text"
                value={REFERRAL_LINK}
                readOnly
                className="font-roboto text-sm bg-transparent outline-none w-full"
              />
              <button
                type="button"
                className="text-sm text-[#2563EB] font-bold bg-transparent hover:underline"
                onClick={copyLinkToClipboard}
              >
                {buttonLabel}
              </button>
            </div>
          }

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