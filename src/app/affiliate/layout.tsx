"use client";

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
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const address = useAddress();
  const disconnect = useDisconnect();
  const [showDisconnect, setShowDisconnect] = useState(false);
  const disconnectButtonRef = useRef<HTMLButtonElement | null>(null);
  const disconnectRef = useRef<HTMLButtonElement | null>(null);

  const toggleDisconnectButton = () => {
    setShowDisconnect((prev) => !prev);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      (disconnectButtonRef.current && disconnectButtonRef.current.contains(event.target as Node)) ||
      (disconnectRef.current && disconnectRef.current.contains(event.target as Node)) 
    ) {
      return;
    }
    setShowDisconnect(false);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!address) {
      router.push("/onboarding");
      toast.info("Please connect your wallet.");
    }
  }, [address, router]);

  const isMarketplacePath = pathname.endsWith("marketplace"); // Check if the path ends with "marketplace"

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex flex-row justify-between px-3 md:px-10 py-2 shadow-md">
        <div className={`w-full flex flex-row items-center ${isMarketplacePath ? "justify-center" : "justify-between"}`}>
          {/* Conditionally render the back button */}
          {!isMarketplacePath && (
            <Link 
              href="/affiliate/marketplace"
              className="bg-white rounded-full p-1 flex items-center justify-center"
            >
              <Image
                src="/assets/common/left-arrow.png"
                alt="Go Back Icon"
                width={20}
                height={20}
              />
            </Link>
          )}
          <Link href="/#" className="flex flex-row items-center gap-3 transition duration-300 ease-in-out transform hover:-translate-y-1">
            <Image
              src="/qube.png"
              alt="qube.png"
              width={40}
              height={40}
            />
            <p className="text-lg font-semibold">Qube</p>
          </Link>
          {/* Conditionally render the share button */}
          {!isMarketplacePath && (
            // <button>
            //   <Image
            //     src="/assets/common/share.png"
            //     alt="Share Icon"
            //     width={20}
            //     height={20}
            //   />
            // </button>
            <div></div>
          )}
          {/* <Link className="text-sm text-gray-500 hover:text-black" href="/affiliate/marketplace">Marketplace</Link> */}
        </div>
        {/* <div className="flex flex-row items-center gap-5 relative">
          <ChainSelector useSwitch={true} />
          <button
            className="bg-gray-100 text-gray-600 text-sm py-2 px-2 md:px-7 border-2 border-white shadow-xl rounded-md transition duration-300 ease-in-out transform hover:scale-105"
            onClick={toggleDisconnectButton}
            ref={disconnectButtonRef}
          >
            {address ? formatAddress(address) : "Not connected"}
          </button>
          {showDisconnect && address && (
            <button
              onClick={() => {
                disconnect();
                setShowDisconnect(false);
              }}
              className="absolute top-12 right-0 bg-red-500 text-white text-sm py-2 px-4 z-10 border-2 border-white shadow-lg rounded-md transition duration-300 ease-in-out transform hover:scale-105"
              ref={disconnectRef}
            >
              Disconnect
            </button>
          )}
        </div> */}
      </div>
      {children}
    </div>
  );
}