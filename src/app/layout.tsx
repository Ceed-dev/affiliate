"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import {
  ThirdwebProvider,
  metamaskWallet,
  coinbaseWallet,
  walletConnect,
} from "@thirdweb-dev/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ChainProvider, useChainContext } from "./context/chainContext";

const inter = Inter({ subsets: ["latin"] });

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const { selectedChain } = useChainContext();

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
