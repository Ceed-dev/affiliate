"use client";

// 1. External Libraries
import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Inter } from "next/font/google";
import {
  ThirdwebProvider,
  metamaskWallet,
  coinbaseWallet,
  walletConnect,
} from "@thirdweb-dev/react";
import { getChainByChainIdAsync } from "@thirdweb-dev/chains";
import { ToastContainer, toast } from "react-toastify";

// 2. Project Modules
import { ChainProvider, useChainContext } from "./context/chainContext";
import { getChains } from "./utils/contracts";

// 3. Styles
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";

// 4. Constants
const inter = Inter({ subsets: ["latin"] });
const supportedChainIds = getChains().map(chain => chain.chainId);

/**
 * RootLayout component is responsible for managing the global layout, 
 * including the Thirdweb provider, chain management, and toast notifications.
 */
const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  // Context and Router Hooks
  const { selectedChain, setSelectedChain } = useChainContext();
  const router = useRouter();

  // Handle chain switching on network change
  const handleChainChanged = useCallback(
    async (chainId: string) => {
      const chainIdDecimal = parseInt(chainId, 16);
      if (!supportedChainIds.includes(chainIdDecimal)) {
        toast.error("Unsupported chain detected. Please switch to a supported chain.");
        await switchToSupportedChain();
      } else {
        const chain = await getChainByChainIdAsync(chainIdDecimal);
        setSelectedChain(chain);
        toast.success(`Switched to ${chain.name}`);
      }
    },
    [setSelectedChain]
  );

  // Switch to the first supported chain
  const switchToSupportedChain = useCallback(
    async () => {
      try {
        const firstSupportedChain = await getChainByChainIdAsync(supportedChainIds[0]);
        if (firstSupportedChain) {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${firstSupportedChain.chainId.toString(16)}` }],
          });
          setSelectedChain(firstSupportedChain);
          toast.success(`Successfully switched to ${firstSupportedChain.name}.`);
        }
      } catch (error) {
        console.error("Failed to switch network:", error);
        toast.error("Failed to switch network. Redirecting to onboarding page.");
        router.push("/onboarding");
      }
    },
    [router, setSelectedChain]
  );

  // Listen for chain changes on mount and cleanup on unmount
  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (typeof window.ethereum !== "undefined") {
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [handleChainChanged]);

  // Render the layout with Thirdweb provider and other global components
  return (
    <ThirdwebProvider
      activeChain={selectedChain}
      clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!}
      supportedWallets={[
        metamaskWallet({ recommended: true }),
        coinbaseWallet(),
        walletConnect(),
      ]}
    >
      <html lang="en">
        <Script
          src="https://cdn.cookie3.co/scripts/analytics/0.11.4/cookie3.analytics.min.js"
          integrity="sha384-lzDmDdr/zEhMdlE+N04MgISCyL3RIWNCb9LjsrQeEFi8Gy5CKXIRI+u58ZV+ybYz"
          crossOrigin="anonymous"
          async
          strategy="lazyOnload"
          data-site-id="1328"
          data-chain-tracking-enabled="true"
        />
        <body className={inter.className}>
          {children}
          <ToastContainer position="bottom-right" autoClose={3000} />
        </body>
      </html>
    </ThirdwebProvider>
  );
};

/**
 * App component wraps the RootLayout with a ChainProvider for chain context management.
 */
const App = ({ children }: { children: React.ReactNode }) => {
  return (
    <ChainProvider>
      <RootLayout>{children}</RootLayout>
    </ChainProvider>
  );
};

export default App;