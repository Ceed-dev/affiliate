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

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThirdwebProvider
      activeChain="mumbai"
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
          <ToastContainer position="bottom-right" />
        </body>
      </html>
    </ThirdwebProvider>
  );
}
