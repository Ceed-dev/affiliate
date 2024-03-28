"use client";

import { useEffect } from "react";
import { getInvitedById, saveAddress } from "@sharemint/sdk";

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

function HomePage() {
  const address = useAddress();

  async function _saveAddress(_address: string) {
    try {
      const result = await saveAddress({
        slug: "test-nft-collection", 
        inviteCode: getInvitedById(), 
        address: _address
      });
      console.log("'saveAddress' result: ", result);
    } catch (error) {
      console.log(`Failed to save address for ${address}: `, error);
      throw error;
    }
  }
  
  useEffect(() => {
    if (address) {
      _saveAddress(address);
    }
  }, [address]);

  return (
    <main className="flex min-h-screen items-center justify-center">

      <div className="p-6 border rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900">Get Access</h2>
        <p className="text-gray-600 pb-4 border-b">Complete the following steps to get access.</p>

        <div className={`flex flex-col justify-stretch mt-4 ${address && "mb-4 pb-4 border-b"}`}>
          <span className="text-gray-700 font-semibold pb-2">Connect wallet</span>
          
          <ConnectWallet
            theme={lightTheme({
              colors: { primaryButtonBg: "#0091ff" },
            })}
            btnTitle={"Sign in"}
            switchToActiveChain={true}
            modalSize={"compact"}
            modalTitleIconUrl={""}
            showThirdwebBranding={false}
          />
        </div>

        {address && (
          <button 
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none"
            onClick={() => window.open("https://testnets.opensea.io/collection/test-nft-collection-28?search[toggles][0]=IS_LISTED", "_blank")}
          >
            Continue with next steps
          </button>
        )}

      </div>

    </main>
  );
}

export default function Home() {
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
      <HomePage />
    </ThirdwebProvider>
  );
}