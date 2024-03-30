"use client";

import { useState } from "react";
import Image from "next/image";

import {
  ThirdwebProvider,
  ConnectWallet,
  metamaskWallet,
  coinbaseWallet,
  walletConnect,
  rainbowWallet,
  lightTheme,
  useAddress,
} from "@thirdweb-dev/react";

function AffiliatePage() {
  const address = useAddress();

  const [buttonLabel, setButtonLabel] = useState("Copy");

  const copyTextToClipboard = async () => {
    const text = "http://localhost:3000/test-nft-collection/referee?r=kelsin";
    try {
      await navigator.clipboard.writeText(text);
      setButtonLabel("Copied!");
      setTimeout(() => setButtonLabel("Copy"), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <main className="flex flex-col h-screen items-center">

      <div className="h-[200px] w-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 relative mb-32">
        <div className="w-full absolute bottom-[-75px] flex flex-row justify-around">
          <div className="flex flex-row items-end">
            <div className="w-40 h-40 bg-white rounded-full shadow-md flex items-center justify-center">
              <Image
                src="/qube.png"
                width={100}
                height={100}
                alt="Qube"
              />
            </div>
            <h1 className="text-3xl font-semibold px-10 py-5">Test NFT Collection</h1>
          </div>
          <div className="flex flex-row items-center gap-5">
            <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center">
              <Image
                src="/x.png"
                width={30}
                height={30}
                alt="X"
              />
            </div>
            <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center">
              <Image
                src="/discord.png"
                width={30}
                height={30}
                alt="Discord"
              />
            </div>
            <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center">
              <Image
                src="/www.png"
                width={50}
                height={50}
                alt="www"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-row w-full justify-center gap-32">
        <div className="w-1/3 border rounded-lg shadow-md p-6 text-lg">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
        </div>
        <div className="p-6 border rounded-lg shadow-md h-min">
          <h2 className="text-lg font-semibold text-gray-900">Earn 1 USDC for each successful referral</h2>
          <p className="text-gray-600 pb-4">{address ? "Share your link with other and start earning!" : "Join the project to start referring others."}</p>

          {address && <div className="flex justify-center items-center bg-[#F3F4F6] rounded-lg p-2 mb-4 gap-5">
            <input
              type="text"
              value="http://localhost:3000/test-nft-collection/referee?r=kelsin"
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

      {address && <div className="w-3/5 mt-10">
        <div className="flex flex-row gap-20">
          <div className="h-[100px] w-full text-gray-500 p-5 rounded-lg shadow-md">
            <p>Referrals</p>
            <span className="text-3xl text-black">0</span> from 1 visit
          </div>
          <div className="h-[100px] w-full text-gray-500 p-5 rounded-lg shadow-md">
            <p>Purchased</p>
            <span className="text-3xl text-black">0 USDC</span> by 0 purchasers
          </div>
          <div className="h-[100px] w-full text-gray-500 p-5 rounded-lg shadow-md">
            <p>Earned (1 USDC)</p>
            <p className="text-3xl text-black">0 USDC</p>
          </div>
        </div>
        <div className="border rounded-lg shadow-md mt-10">
          <div className="flex flex-row px-10 py-3 bg-gray-50 shadow-sm">
            <p className="flex-1">Address</p>
            <p className="flex-1">Purchased</p>
            <p className="flex-1">USDC Paid</p>
            <p className="flex-1">Your Share (1 USDC)</p>
          </div>
          <p className="px-10 py-5 text-sm text-gray-500">You haven't referred any users yet.</p>
        </div>
      </div>}

    </main>
  );
}

export default function Affiliate() {
  return (
    <ThirdwebProvider
      activeChain="mumbai"
      supportedWallets={[
        metamaskWallet({ recommended: true }),
        coinbaseWallet(),
        walletConnect(),
        rainbowWallet(),
      ]}
    >
      <AffiliatePage />
    </ThirdwebProvider>
  );
}