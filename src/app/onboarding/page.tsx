"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import {
  ConnectWallet,
  lightTheme,
  useAddress,
  useDisconnect,
  useNetworkMismatch,
  useSwitchChain,
  WalletInstance
} from "@thirdweb-dev/react";
import { Polygon, PolygonAmoyTestnet } from "@thirdweb-dev/chains";

import { AffiliateInfoModal } from "../components/affiliate";
import { AffiliateInfo } from "../types";
import { checkUserAndPrompt, createNewUser } from "../utils/firebase";

const getActiveChain = () => {
  if (process.env.NEXT_PUBLIC_ACTIVE_CHAIN === "Polygon") {
    return Polygon;
  } else {
    return PolygonAmoyTestnet;
  }
};

export default function Onboarding() {
  const router = useRouter();
  const address = useAddress();
  const disconnect = useDisconnect();
  const isMismatched = useNetworkMismatch();
  const switchChain = useSwitchChain();
  const activeChain = getActiveChain();

  const [isUserExist, setIsUserExist] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const adminWalletAddress = process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS;

  useEffect(() => {
    const checkUser = async () => {
      if (address) {
        if (address.toLowerCase() === adminWalletAddress?.toLowerCase()) {
          router.push("/admin");
        } else {
          const userExists = await checkUserAndPrompt(address, setIsModalOpen);
          setIsUserExist(userExists);
        }
      }
    };

    checkUser();
  }, [address, adminWalletAddress, router]);

  useEffect(() => {
    if (address && isMismatched) {
      switchChain(activeChain.chainId).catch((error) => {
        console.error("Failed to switch network:", error);
        toast.error("Failed to switch network");
      });
    } else if (address && !isMismatched && isUserExist) {
      router.push("/projects");
    }
  }, [address, isMismatched, switchChain, isUserExist, router]);

  const handleSaveUserInfo = async (info: AffiliateInfo) => {
    if (address) {
      try {
        await createNewUser(address, info);
        setIsModalOpen(false);
        setIsUserExist(true);
      } catch (error) {
        console.error("Failed to save user info: ", error);
        toast.error("Failed to save user info");
        disconnect();
      }
    } else {
      console.error("Wallet address is not set.");
      toast.error("Unexpected error occurred. Please try again.");
      disconnect();
    }
  };

  const handleOnboarding = async (wallet: WalletInstance) => {
    const walletAddress = await wallet.getAddress();

    try {
      if (walletAddress.toLowerCase() === adminWalletAddress?.toLowerCase()) {
        router.push("/admin");
      } else {
        const userExists = await checkUserAndPrompt(walletAddress, setIsModalOpen);
        setIsUserExist(userExists);
      }
    } catch (error: any) {
      console.error("Failed to check user: ", error);
      toast.error(`Failed to check user: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen gap-[100px]">
      <div className="w-11/12 sm:w-2/3 flex mt-5">
        <Link href="/#" className="flex flex-row items-center gap-3 transition duration-300 ease-in-out transform hover:-translate-y-1">
          <Image
            src="/qube.png"
            alt="qube.png"
            width={50}
            height={50}
          />
          <p className="text-lg font-semibold">Qube</p>
        </Link>
      </div>
      <div className="bg-white border-2 border-sky-500 rounded-lg w-11/12 sm:w-2/3 xl:w-1/3 flex flex-col items-center gap-10 py-20">
        <Image
          src="/qube.png"
          alt="qube.png"
          width={50}
          height={50}
        />
        <h1 className="text-3xl font-bold">Welcome to Qube</h1>
        <p>Sign in to continue</p>
        
        <ConnectWallet
          className="bg-sky-600 text-white text-sm py-3 px-20 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
          theme={lightTheme({
            colors: {
              accentButtonBg: "#247bff",
              primaryButtonBg: "#009dff",
              primaryButtonText: "#ffffff",
            },
          })}
          switchToActiveChain={true}
          btnTitle={"Sign in"}
          modalTitle={"Log in or Sign up"}
          // auth={{ loginOptional: false }}
          modalSize={"compact"}
          onConnect={handleOnboarding}
        />  
      </div>

      <AffiliateInfoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          disconnect();
        }}
        onSave={handleSaveUserInfo}
      />
    </div>
  );
}