"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";

import {
  ConnectWallet,
  lightTheme,
  useAddress,
  useDisconnect,
  useNetworkMismatch,
  useSwitchChain,
  useChain,
  WalletInstance,
} from "@thirdweb-dev/react";
import { AffiliateInfo } from "../types";
import { UserAccountSetupModal } from "../components/UserAccountSetupModal";
import { ChainSelector } from "../components/ChainSelector";
import { checkUserAndPrompt, fetchUserData, checkIfProjectOwner } from "../utils/firebase";
import { createNewUser } from "../utils/userUtils";
import { useChainContext } from "../context/chainContext";

export default function Onboarding() {
  const router = useRouter();
  const address = useAddress();
  const disconnect = useDisconnect();
  const isMismatched = useNetworkMismatch();
  const switchChain = useSwitchChain();
  const chain = useChain();
  const { selectedChain } = useChainContext();

  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [disableRoleSelection, setDisableRoleSelection] = useState(false); // Role selection control
  const errorShownRef = useRef(false); // Prevent duplicate error messages

  // Get admin wallet addresses from environment variables
  const adminWalletAddresses = process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES?.split(",");

  // Function to handle user check and navigation
  const handleUserCheck = async (walletAddress: string) => {
    if (adminWalletAddresses?.map(addr => addr.toLowerCase()).includes(walletAddress.toLowerCase())) {
      router.push("/admin");
    } else {
      if (!walletAddress || !chain) {
        console.log("No wallet address or chain available.");
        return;
      }

      // Switch to the correct network if mismatched
      if (isMismatched) {
        try {
          await switchChain(selectedChain.chainId);
        } catch (error) {
          console.error("Failed to switch network:", error);
          toast.error("Failed to switch network");
          return;
        }
      }

      // Check if user is a project owner
      const isProjectOwner = await checkIfProjectOwner(walletAddress);
      setDisableRoleSelection(isProjectOwner); // Disable role selection if project owner

      // Check if user exists and prompt for info if not
      const userExists = await checkUserAndPrompt(walletAddress, setIsModalOpen);
      if (userExists) {
        const userData = await fetchUserData(walletAddress);
        if (userData && userData.allowed) {
          // Navigate based on user role
          if (userData.role === "ProjectOwner") {
            router.push("/projects");
          } else if (userData.role === "Affiliate") {
            router.push("/affiliate/marketplace");
          }
        } else {
          // Show error if user has not been granted access
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

  // Trigger user check when address or chain changes
  useEffect(() => {
    if (address && chain) {
      handleUserCheck(address);
    }
  }, [address, chain]);

  // Save user information
  const handleSaveUserInfo = async (info: AffiliateInfo) => {
    if (address) {
      try {
        await createNewUser(address, info);
        setIsModalOpen(false);
        // Automatically checks the user after saving info
        handleUserCheck(address);
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

  // Handle wallet connection and user onboarding
  const handleOnboarding = async (wallet: WalletInstance) => {
    const walletAddress = await wallet.getAddress();

    try {
      await handleUserCheck(walletAddress); // Check user upon wallet connection
    } catch (error: any) {
      console.error("Failed to check user: ", error);
      toast.error(`Failed to check user: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen gap-[100px]">
      {/* Header section with logo and chain selector */}
      <div className="w-11/12 sm:w-2/3 flex flex-row items-center justify-between mt-5">
        <Link href="/#" className="flex flex-row items-center gap-3 transition duration-300 ease-in-out transform hover:-translate-y-1">
          <Image
            src="/qube.png"
            alt="Qube Logo"
            width={50}
            height={50}
          />
          <p className="text-lg font-semibold">Qube</p>
        </Link>
        <ChainSelector />
      </div>

      {/* Onboarding section */}
      <div className="bg-white border-2 border-sky-500 rounded-lg w-11/12 sm:w-2/3 xl:w-1/3 flex flex-col items-center gap-10 py-20">
        <Image
          src="/qube.png"
          alt="Qube Logo"
          width={50}
          height={50}
        />
        <h1 className="text-3xl font-bold">Welcome to Qube</h1>
        <p>Sign in to continue</p>
        
        {/* Wallet connection button */}
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
          modalSize={"compact"}
          onConnect={handleOnboarding} // Handles the onboarding process after wallet connection
        />  
      </div>

      {/* User account setup modal */}
      <UserAccountSetupModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          disconnect();
        }}
        onSave={handleSaveUserInfo}
        disableRoleSelection={disableRoleSelection}
      />
    </div>
  );
}