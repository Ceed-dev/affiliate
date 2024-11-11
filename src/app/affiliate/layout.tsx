"use client";

// Import necessary libraries and components
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-toastify";
import { useAddress, useDisconnect } from "@thirdweb-dev/react";
import { formatAddress } from "../utils/formatUtils";
import { ChainSelector } from "../components/ChainSelector";

export default function AffiliateLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const address = useAddress();
  const disconnect = useDisconnect();
  const [showDisconnect, setShowDisconnect] = useState(false);
  const disconnectButtonRef = useRef<HTMLButtonElement | null>(null);
  const disconnectRef = useRef<HTMLButtonElement | null>(null);

  // Function to toggle the display of the disconnect button
  const toggleDisconnectButton = () => {
    setShowDisconnect((prev) => !prev);
  };

  // Close the disconnect button menu if clicked outside
  const handleClickOutside = (event: MouseEvent) => {
    if (
      (disconnectButtonRef.current && disconnectButtonRef.current.contains(event.target as Node)) ||
      (disconnectRef.current && disconnectRef.current.contains(event.target as Node)) 
    ) {
      return;
    }
    setShowDisconnect(false);
  };

  // Add event listener for handling clicks outside of the disconnect button menu
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Redirect to onboarding page if the user is not connected
  useEffect(() => {
    if (!address) {
      router.push("/onboarding");
      toast.info("Please connect your wallet.");
    }
  }, [address, router]);

  // Check if the current path is the marketplace
  const isMarketplacePath = pathname.endsWith("marketplace");

  return (
    <div className="min-h-screen bg-black text-white md:flex">
      {/* Sidebar for desktop view, top navigation bar for mobile */}
      <div className="md:bg-[#222222] flex flex-row md:flex-col md:fixed md:h-full w-full md:w-64 px-3 md:px-7 py-3 md:py-7">
        <div 
          className={`w-full flex flex-row items-center ${
            isMarketplacePath ? "justify-center md:justify-start" : "justify-between"
          }`}
        >
          {/* Back button visible only on mobile for non-marketplace pages */}
          {!isMarketplacePath && (
            <Link
              href="/affiliate/marketplace"
              className="md:hidden"
            >
              <Image
                src="/assets/common/triangle-left-white.png"
                alt="Go Back Icon"
                width={25}
                height={25}
              />
            </Link>
          )}
          
          {/* Qube logo and brand name */}
          <Link
            href="/#"
            className="flex flex-row items-center gap-3 transition duration-300 ease-in-out transform hover:-translate-y-1"
          >
            <Image
              src="/qube.png"
              alt="qube.png"
              width={30}
              height={30}
            />
            <p className="text-xl font-bold">Qube</p>
          </Link>
          
          {/* Placeholder for right alignment */}
          <div />
        </div>

        {/* Marketplace link in sidebar for desktop view */}
        <Link
          href="/affiliate/marketplace"
          className="hidden md:flex items-center gap-3 bg-white/5 rounded-xl p-3 md:mt-5"
        >
          <Image
            src="/assets/common/compass-white.png"
            alt="Projects"
            width={25}
            height={25}
          />
          <span className="font-semibold">Projects</span>
        </Link>

        {/* Account button with disconnect option in sidebar for desktop view */}
        <button
          onClick={toggleDisconnectButton}
          ref={disconnectButtonRef}
          className="hidden md:flex items-center gap-3 bg-white/5 rounded-xl p-3 md:mt-auto"
        >
          <Image
            src="/assets/common/account-white.png"
            alt="User"
            width={25}
            height={25}
          />
          <span className="font-semibold text-white/60">
            {address ? formatAddress(address) : "Not connected"}
          </span>
        </button>
        
        {/* Disconnect button that appears on demand */}
        {showDisconnect && address && (
          <button
            onClick={() => {
              disconnect();
              setShowDisconnect(false);
            }}
            className="absolute bottom-20 text-red-500 text-sm py-2 px-4 z-10 border-2 border-red-900 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
            ref={disconnectRef}
          >
            Disconnect
          </button>
        )}
      </div>

      {/* Main content area that adjusts based on sidebar width on desktop */}
      <div className="flex-1 md:ml-64">
        {children}
      </div>
    </div>
  );
}