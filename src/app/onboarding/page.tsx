"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
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
import { checkUserAndPrompt, createNewUser, fetchUserData } from "../utils/firebase";

const getActiveChain = () => {
  if (process.env.NEXT_PUBLIC_ACTIVE_CHAIN === "Polygon") {
    return Polygon;
  } else {
    return PolygonAmoyTestnet;
  }
};

export default function Onboarding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const address = useAddress();
  const disconnect = useDisconnect();
  const isMismatched = useNetworkMismatch();
  const switchChain = useSwitchChain();
  const activeChain = getActiveChain();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const errorShownRef = useRef(false);

  const adminWalletAddresses = process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES?.split(",");

  useEffect(() => {
    // Define the allowed parameters
    const allowedParams = ["ad-publisher", "affiliate-marketplace"];

    // Get the query parameters
    const next = searchParams.get("next");
    
    // Redirect if parameters are missing or inappropriate
    if (!next || !allowedParams.includes(next)) {
      toast.error("Invalid access. Redirect to home page.", {
        onClose: () => {
          router.push("/");
        },
      });
    }
  }, [searchParams, router]);

  const handleUserCheck = async (walletAddress: string) => {
    if (adminWalletAddresses?.map(addr => addr.toLowerCase()).includes(walletAddress.toLowerCase())) {
      router.push("/admin");
    } else {
      const userExists = await checkUserAndPrompt(walletAddress, setIsModalOpen);
      if (userExists) {
        const userData = await fetchUserData(walletAddress);
        if (userData && userData.allowed) {
          const nextPage = searchParams.get("next");
          if (nextPage === "ad-publisher") {
            router.push("/projects");
          } else if (nextPage === "affiliate-marketplace") {
            router.push("/affiliate/marketplace");
          }
        } else {
          if (!errorShownRef.current) {
            errorShownRef.current = true;
            toast.error("You have not yet been granted permission to use the product.", {
              onClose: () => {
                disconnect();
                errorShownRef.current = false;
              },
            });
          }
        }
      }
    }
  };

  useEffect(() => {
    if (address) {
      handleUserCheck(address);
    }
  }, [address]);

  useEffect(() => {
    if (address && isMismatched) {
      switchChain(activeChain.chainId).catch((error) => {
        console.error("Failed to switch network:", error);
        toast.error("Failed to switch network");
      });
    }
  }, [address, isMismatched, switchChain, activeChain.chainId]);

  const handleSaveUserInfo = async (info: AffiliateInfo) => {
    if (address) {
      try {
        await createNewUser(address, info);
        setIsModalOpen(false);
        toast.success("Please wait while access is granted by the administrator.");
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
      await handleUserCheck(walletAddress);
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