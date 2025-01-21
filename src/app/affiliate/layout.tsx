"use client";

// Import necessary libraries and components
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-toastify";
import { useActiveWallet } from "thirdweb/react";
import { formatAddress } from "../utils/formatUtils";
import { useXPContext } from "../context/xpContext";
import { useMarketplaceContext } from "../context/marketplaceContext";

export default function AffiliateLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const wallet = useActiveWallet();
  const [showDisconnect, setShowDisconnect] = useState(false);
  const disconnectButtonRef = useRef<HTMLButtonElement | null>(null);
  const disconnectRef = useRef<HTMLButtonElement | null>(null);
  const { totalXpPoints } = useXPContext();
  const { selectedCategory, setSelectedCategory } = useMarketplaceContext();

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
    if (!wallet) {
      router.push("/onboarding");
      toast.info("Please connect your wallet.");
    }
  }, [wallet, router]);

  // Check if the current path is the marketplace
  const isMarketplacePath = pathname.endsWith("marketplace");
  
  return (
    <div className="min-h-screen bg-black text-white md:flex">
      {/* Sidebar for desktop view, top navigation bar for mobile */}
      <div className="md:bg-[#222222] flex flex-row md:flex-col md:fixed md:h-full w-full md:w-64 px-3 md:px-7 py-3 md:py-7">
        <div className="w-full">
          <div 
            className={`w-full flex flex-row items-center justify-between ${
              isMarketplacePath && "md:justify-start"
            }`}
          >
            {/* Back button visible only on mobile for non-marketplace pages */}
            {!isMarketplacePath ? (
              <Link
                href="/affiliate/marketplace"
                className="md:hidden transition duration-300 ease-in-out transform hover:-translate-y-1"
              >
                <Image
                  src="/assets/common/chevron-left-white.png"
                  alt="Go Back Icon"
                  width={25}
                  height={25}
                />
              </Link>
            ): (
              <div className="w-[25px] h-[25px] md:hidden" />
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
              <p className="text-xl font-bold font-corporate">Qube</p>
            </Link>
            
            {/* XP points display in the header for mobile view */}
            <div className="md:hidden">{totalXpPoints} XP</div>
          </div>
          
          {/* Mobile Tab Bar */}
          {isMarketplacePath && (
            <div className="w-full bg-[#222222] flex md:hidden rounded-lg py-1 px-2 my-2">
              <button
                className={`flex-1 flex flex-row justify-center gap-2 py-1 transition-all duration-300 ease-in-out ${
                  selectedCategory === "Kaia"
                    ? "bg-black rounded-lg text-white scale-105 shadow-lg"
                    : "text-gray-500"
                }`}
                onClick={() => setSelectedCategory("Kaia")}
              >
                <Image
                  src={`/brand-assets/kaia.png`}
                  alt="Kaia"
                  width={25}
                  height={25}
                />
                Kaia
              </button>
              <button
                className={`flex-1 flex flex-row justify-center gap-2 py-1 transition-all duration-300 ease-in-out ${
                  selectedCategory === "GameFi"
                    ? "bg-black rounded-lg text-white scale-105 shadow-lg"
                    : "text-gray-500"
                }`}
                onClick={() => setSelectedCategory("GameFi")}
              >
                <Image
                  src={`/assets/common/sports-esports-${selectedCategory === "GameFi" ? "white" : "black"}.png`}
                  alt="GameFi"
                  width={25}
                  height={25}
                />
                GameFi
              </button>
            </div>
          )}
        </div>

        {/* Marketplace link in sidebar for desktop view */}
        <Link
          href="/affiliate/marketplace"
          className="hidden md:flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-xl p-3 md:mt-5"
        >
          <Image
            src="/assets/common/explore-white.png"
            alt="Projects"
            width={25}
            height={25}
          />
          <span className="font-semibold">Projects</span>
        </Link>

        {isMarketplacePath && (
          <div className="hidden md:flex flex-col gap-5 border-t-2 border-white/5 pt-5 mt-5">
            <button
              className={`flex items-center gap-3 rounded-xl p-3 ${
                selectedCategory === "Kaia" ? "bg-white hover:bg-white/60 text-black" : "bg-white/5 hover:bg-white/10"
              }`}
              onClick={() => setSelectedCategory("Kaia")}
            >
              <Image
                src={`/brand-assets/kaia.png`}
                alt="Kaia"
                width={25}
                height={25}
              />
              <span className="font-semibold">Kaia</span>
            </button>
            <button
              className={`flex items-center gap-3 rounded-xl p-3 ${
                selectedCategory === "GameFi" ? "bg-white hover:bg-white/60 text-black" : "bg-white/5 hover:bg-white/10"
              }`}
              onClick={() => setSelectedCategory("GameFi")}
            >
              <Image
                src={`/assets/common/sports-esports-${selectedCategory === "GameFi" ? "black" : "white"}.png`}
                alt="GameFi"
                width={25}
                height={25}
              />
              <span className="font-semibold">GameFi</span>
            </button>
          </div>
        )}

        {/* XP points display in the sidebar for desktop view */}
        <div
          className="hidden md:flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-xl p-3 md:mt-auto"
        >
          <Image
            src="/assets/common/paid-white.png"
            alt="XP"
            width={25}
            height={25}
          />
          <span className="font-semibold">{totalXpPoints} XP</span>
        </div>

        {/* Account button with disconnect option in sidebar for desktop view */}
        <button
          onClick={toggleDisconnectButton}
          ref={disconnectButtonRef}
          className="hidden md:flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-xl p-3 md:mt-5"
        >
          <Image
            src="/assets/common/account-circle-white.png"
            alt="User"
            width={25}
            height={25}
          />
          <span className="font-semibold text-white/60">
            {wallet ? formatAddress(wallet.getAccount()?.address!) : "Not connected"}
          </span>
        </button>
        
        {/* Disconnect button that appears on demand */}
        {showDisconnect && wallet && (
          <button
            onClick={() => {
              wallet.disconnect();
              setShowDisconnect(false);
            }}
            className="absolute bottom-20 text-red-500 bg-black text-sm py-2 px-4 z-10 border-2 border-red-900 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
            ref={disconnectRef}
          >
            Disconnect
          </button>
        )}
      </div>

      {/* Main content area that adjusts based on sidebar width on desktop */}
      <div className="flex-1 md:ml-64 bg-black">
        {children}
      </div>
    </div>
  );
}