"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";

import { AffiliateInfo } from "../types";
import { UserAccountSetupModal } from "../components/UserAccountSetupModal";
import { createNewUser, isUserProjectOwner, checkUserExistenceAndShowModal, fetchUserById } from "../utils/userUtils";
// import { ChainSelector } from "../components/common";
// import { useChainContext } from "../context/chainContext";

import { createThirdwebClient } from "thirdweb";
import { ConnectButton, useActiveWallet, useActiveWalletChain } from "thirdweb/react";

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

export default function Onboarding() {
  const router = useRouter();
  const wallet = useActiveWallet();
  const chain = useActiveWalletChain();
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

      // TODO: Fix later
      // Switch to the correct network if mismatched
      // if (isMismatched) {
      //   try {
      //     await switchChain(selectedChain.chainId);
      //   } catch (error) {
      //     console.error("Failed to switch network:", error);
      //     toast.error("Failed to switch network");
      //     return;
      //   }
      // }

      // Check if user is a project owner
      const isProjectOwner = await isUserProjectOwner(walletAddress);
      setDisableRoleSelection(isProjectOwner); // Disable role selection if project owner

      // Check if user exists and prompt for info if not
      const userExists = await checkUserExistenceAndShowModal(walletAddress, setIsModalOpen);
      if (userExists) {
        const userData = await fetchUserById(walletAddress);
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
                wallet?.disconnect();
                errorShownRef.current = false;
              },
            });
          }
        }
      }
    }
  };

  // Trigger user check when wallet or chain changes
  useEffect(() => {
    const walletAddress = wallet?.getAccount()?.address;
    if (walletAddress && chain) {
      handleUserCheck(walletAddress);
    }
  }, [wallet, chain]);

  // Save user information
  const handleSaveUserInfo = async (info: AffiliateInfo) => {
    const walletAddress = wallet?.getAccount()?.address;
    if (walletAddress) {
      try {
        await createNewUser(walletAddress, info);
        setIsModalOpen(false);
        // Automatically checks the user after saving info
        handleUserCheck(walletAddress);
      } catch (error) {
        console.error("Failed to save user info: ", error);
        toast.error("Failed to save user info");
        wallet.disconnect();
      }
    } else {
      console.error("Wallet address is not set.");
      toast.error("Unexpected error occurred. Please try again.");
      wallet?.disconnect();
    }
  };

  return (
    <div className="bg-[#EDEDED] flex flex-col items-center min-h-screen gap-[100px]">
      {/* Header section with logo and chain selector */}
      <div className="w-11/12 sm:w-2/3 flex flex-row items-center justify-center md:justify-between mt-5">
        <Link href="/#" className="flex flex-row items-center gap-3 transition duration-300 ease-in-out transform hover:-translate-y-1">
          <Image
            src="/qube.png"
            alt="Qube Logo"
            width={30}
            height={30}
          />
          <p className="text-xl font-bold font-corporate">Qube</p>
        </Link>
        <span className="hidden md:block">
          {/* TODO: Fix later */}
          {/* <ChainSelector /> */}
        </span>
      </div>

      {/* Onboarding section */}
      <div className="bg-white rounded-3xl w-11/12 sm:w-2/3 xl:w-1/3 flex flex-col items-center py-20">
        <div className="flex flex-row items-center gap-3 mb-20">
          <Image
            src="/qube.png"
            alt="Qube Logo"
            width={30}
            height={30}
          />
          <p className="font-bold text-3xl">Qube</p>
        </div>
        <h1 className="text-3xl font-bold mb-5">Welcome to Qube</h1>
        <p className="mb-20">Sign in to continue</p>
        
        {/* Wallet connection button */}
        <ConnectButton
          client={client}
          appMetadata={{
            name: "Qube",
            url: "https://www.0xqube.xyz",
          }}
          connectModal={{
            size: "compact",
          }}
          onConnect={async (wallet) => {
            try {
              const walletAddress = wallet.getAccount()?.address;
              if (walletAddress) {
                await handleUserCheck(walletAddress);
              } else {
                console.error("Failed to retrieve wallet address");
              }
            } catch (error) {
              console.error("Error during wallet connection:", error);
            }
          }}
        />
      </div>

      {/* User account setup modal */}
      <UserAccountSetupModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          wallet?.disconnect();
        }}
        onSave={handleSaveUserInfo}
        disableRoleSelection={disableRoleSelection}
      />
    </div>
  );
}