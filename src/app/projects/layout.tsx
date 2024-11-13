"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-toastify";
import { useAddress, useDisconnect } from "@thirdweb-dev/react";
import { formatAddress } from "../utils/formatUtils";

export default function ProjectsLayout({
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

  const toggleDisconnectButton = () => setShowDisconnect((prev) => !prev);

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!address) {
      router.push("/onboarding");
      toast.info("Please connect your wallet.");
    }
  }, [address, router]);

  const isProjectsPath = pathname.endsWith("projects");

  return (
    <div className="min-h-screen md:flex">
      {/* Sidebar / Navbar */}
      <div className="md:bg-[#F5F5F5] flex flex-row md:flex-col md:fixed md:h-full w-full md:w-64 px-3 md:px-7 py-3 md:py-7">
        <div 
          className={`w-full flex flex-row items-center ${
            isProjectsPath ? "justify-center md:justify-start" : "justify-between"
          }`}
        >
          {/* Back button for non-project paths */}
          {!isProjectsPath ? (
            <Link
              href="/projects"
              className="md:hidden"
            >
              <Image
                src="/assets/common/chevron-left-black.png"
                alt="Go Back Icon"
                width={25}
                height={25}
              />
            </Link>
          ) : (
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

          {/* Placeholder for right alignment */}
          <div className="w-[25px] h-[25px] md:hidden" />
        </div>

        {/* Navigation Links for Desktop View */}
        <Link
          href="/projects"
          className="hidden md:flex items-center gap-3 rounded-xl p-3 bg-white md:mt-5"
        >
          <Image
            src="/assets/common/explore-black.png"
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
          className="hidden md:flex items-center gap-3 bg-white rounded-xl p-3 md:mt-auto"
        >
          <Image
            src="/assets/common/account-circle-black.png"
            alt="User"
            width={25}
            height={25}
          />
          <span className="font-semibold text-[#757575]">
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
            ref={disconnectRef}
            className="absolute bottom-20 text-red-500 text-sm py-2 px-4 z-10 border-2 border-red-900 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            Disconnect
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64">
        {children}
      </div>
    </div>
  );
}