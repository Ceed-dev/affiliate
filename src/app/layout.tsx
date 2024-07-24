"use client";

import Head from "next/head";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import {
  ThirdwebProvider,
  metamaskWallet,
  coinbaseWallet,
  walletConnect,
} from "@thirdweb-dev/react";
import { getChainByChainIdAsync } from "@thirdweb-dev/chains";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ChainProvider, useChainContext } from "./context/chainContext";
import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getChains } from "./utils/contracts";

const inter = Inter({ subsets: ["latin"] });

const supportedChainIds = getChains().map(chain => chain.chainId);

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { selectedChain, setSelectedChain } = useChainContext();
  const router = useRouter();

  const handleChainChanged = useCallback(async (chainId: string) => {
    const chainIdDecimal = parseInt(chainId, 16);
    if (!supportedChainIds.includes(chainIdDecimal)) {
      toast.error("Unsupported chain detected. Please switch to a supported chain.");
      await switchToSupportedChain();
    } else {
      const chain = await getChainByChainIdAsync(chainIdDecimal);
      setSelectedChain(chain);
      toast.success(`Switched to ${chain.name}`);
    }
  }, [setSelectedChain]);

  const switchToSupportedChain = useCallback(async () => {
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
  }, [router, setSelectedChain]);

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

  return (
    <ThirdwebProvider
      activeChain={selectedChain}
      clientId="57b58ed3058432b8220286445c2b302d"
      supportedWallets={[
        metamaskWallet({ recommended: true }),
        coinbaseWallet(),
        walletConnect(),
      ]}
      // authConfig={{
      //   authUrl: "/api/auth",
      //   domain: "http://localhost:3000",
      // }}
    >
      <html lang="en" className="bg-slate-200">
        <Head>
          <Script
            src="https://cdn.cookie3.co/scripts/analytics/0.11.4/cookie3.analytics.min.js"
            integrity="sha384-lzDmDdr/zEhMdlE+N04MgISCyL3RIWNCb9LjsrQeEFi8Gy5CKXIRI+u58ZV+ybYz"
            crossOrigin="anonymous"
            async
            strategy="lazyOnload"
            data-site-id="1328"
            data-chain-tracking-enabled="true"
          />
        </Head>
        <body className={inter.className}>
          {children}
          <ToastContainer position="bottom-right" autoClose={3000} />
        </body>
      </html>
    </ThirdwebProvider>
  );
}

const App = ({ children }: { children: React.ReactNode }) => {
  return (
    <ChainProvider>
      <RootLayout>{children}</RootLayout>
    </ChainProvider>
  );
};

export default App;
