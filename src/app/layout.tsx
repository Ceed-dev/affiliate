"use client";

// 1. External Libraries
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Inter } from "next/font/google";
import { ThirdwebProvider, useActiveWallet, useActiveWalletChain } from "thirdweb/react";
import { ToastContainer, toast } from "react-toastify";

// 2. Project Modules
import { ChainProvider, useChainContext } from "./context/chainContext";
import { XPProvider } from "./context/xpContext";
import { getChains } from "./utils/contracts";

// 3. Styles
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";

// 4. Constants
const inter = Inter({ subsets: ["latin"] });
const supportedChains = getChains();

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
  const router = useRouter();
  const { setSelectedChain } = useChainContext();

  const wallet = useActiveWallet();
  const activeChain = useActiveWalletChain();

  // Switch to the first supported chain
  const switchToSupportedChain = async () => {
    try {
      const firstSupportedChain = supportedChains[0];
      if (wallet && firstSupportedChain) {
        await wallet.switchChain(firstSupportedChain);
        setSelectedChain(firstSupportedChain);
        toast.success(`Switched to ${firstSupportedChain.name}`);
      }
    } catch (error) {
      console.error("Failed to switch network:", error);
      toast.error("Failed to switch network. Redirecting to onboarding page.");
      router.push("/onboarding");
    }
  };

  // Handle unsupported chain detection
  useEffect(() => {
    if (activeChain && !supportedChains.find((c) => c.id === activeChain.id)) {
      console.error("Unsupported chain detected. Switching to a supported chain...");
      switchToSupportedChain();
    }
  }, [activeChain]);

  // Render the layout with Thirdweb provider and other global components
  return (
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
  );
};

/**
 * App component wraps the RootLayout with a ChainProvider for chain context management.
 */
const App = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThirdwebProvider>
      <ChainProvider>
        <XPProvider>
          <RootLayout>{children}</RootLayout>
        </XPProvider>
      </ChainProvider>
    </ThirdwebProvider>
  );
};

export default App;