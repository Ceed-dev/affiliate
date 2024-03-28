"use client";

import { useState } from "react";

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
    <main className="flex min-h-screen items-center justify-center">

      <div className="p-6 border rounded-lg shadow-md">
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