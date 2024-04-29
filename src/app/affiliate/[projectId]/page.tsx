"use client";

import { useState, useEffect } from "react";
import { ConnectWallet, lightTheme, useAddress, WalletInstance } from "@thirdweb-dev/react";
import { toast } from "react-toastify";
import { ProjectData } from "../../types";
import { ProjectHeader, ConversionsList } from "../../components/affiliate";
import { fetchProjectData, joinProject } from "../../utils/firebase";
import { StatisticCard } from "../../components/dashboard/StatisticCard";

export default function Affiliate({ params }: { params: { projectId: string } }) {
  const address = useAddress();
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [referralId, setReferralId] = useState<string | null>(null);
  const [buttonLabel, setButtonLabel] = useState("Copy");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const REFERRAL_LINK = `${baseUrl}/referee/${params.projectId}/${referralId}`;

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

  const copyLinkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(REFERRAL_LINK);
      setButtonLabel("Copied!");
      toast.info("Link copied to clipboard!");
      setTimeout(() => setButtonLabel("Copy"), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast.error("Failed to copy link. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col pb-10 md:pb-20">

      {/* Header */}
      <ProjectHeader projectData={projectData} loading={loading} />

      {/* Project Description and Action Panel */}
      <div className="w-2/3 flex flex-col lg:flex-row mx-auto gap-10 mb-10">
        {/* Project Description Container */}
        <div className={`basis-3/5 border rounded-lg shadow-md p-6 text-lg bg-white ${loading ? "animate-pulse" : ""}`}>
          {projectData?.description}
        </div>
        {/* Join Project and Referral Actions */}
        <div className="basis-2/5 border rounded-lg shadow-md p-6 h-min bg-white">
          <h2 className="text-lg font-semibold text-gray-900">
            Earn {projectData?.rewardAmount || <span className="text-gray-500">Loading...</span>} {projectData?.selectedToken} for each successful referral
          </h2>
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
              onConnect={async (wallet: WalletInstance) => {
                try {
                  if (!projectData) {
                    // If project data is not yet loaded, wait for it to load
                    return;
                  }
                  const walletAddress = await wallet.getAddress();
                  const referralId = await joinProject(params.projectId, walletAddress);
                  console.log("Referral ID: ", referralId);
                  setReferralId(referralId);
                } catch (error: any) {
                  console.error("Failed to join project: ", error);
                  toast.error(`Failed to join project: ${error.message}`);
                }
              }}
            />
          </div>
        </div>
      </div>

      {address && 
        <>
          <div className="w-2/3 mx-auto grid grid-cols-1 lg:grid-cols-3 gap-5 mb-10">
            <StatisticCard
              title="Conversions"
              loading={false}
              value={"3"}
              unit="TIMES"
            />
            <StatisticCard
              title={`Earnings (${projectData?.selectedToken})`}
              loading={false}
              value="9"
              unit={`${projectData?.selectedToken}`}
            />
            <StatisticCard
              title="Last Conversion Date"
              loading={false}
              value="Mar 27"
              unit="2024"
            />
          </div>

          <ConversionsList transactions={[
            {
              transactionHash: "0x599bb98f072b78cdcf6b9330cfe23bcb516e35d4e56ef79ed3e8b2b23b9c2c58",
              timestamp: new Date()
            },
            {
              transactionHash: "0x6577550cd796928693f4b3051813ba532f14b10078ea610b95c268c1050cab65",
              timestamp: new Date()
            },
            {
              transactionHash: "0xa91756c46f733a82d79b50b7f158bf96db5e55f4bdb35882c8a823b12d3255fb",
              timestamp: new Date()
            }
          ]} />
        </>
      }

    </div>
  );
}