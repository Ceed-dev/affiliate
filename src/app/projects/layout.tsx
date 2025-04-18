"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-toastify";
import { useActiveWallet } from "thirdweb/react";
import { formatAddress } from "../utils/formatUtils";

export default function ProjectsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const wallet = useActiveWallet();
  const [showDisconnect, setShowDisconnect] = useState(false);
  const disconnectButtonRef = useRef<HTMLButtonElement | null>(null);
  const disconnectRef = useRef<HTMLButtonElement | null>(null);

  // Checks if the current path is the main "projects" page
  const isProjectsPath = pathname.endsWith("projects");

  // Extracts the project ID from the URL if available
  const projectId = pathname.split("/")[2];

  /**
   * Determines whether to display the project-specific navigation tabs (Dashboard/Settings).
   * - Tabs are shown only if the path starts with "/projects/{projectId}"
   * - Excludes "/projects/create-project" and confirms path ends with the project ID or "/settings"
   */
  const displayProjectTabs =
    projectId !== "create-project" &&
    pathname.startsWith(`/projects/${projectId}`) &&
    (pathname.endsWith(projectId) || pathname.endsWith("/settings"));

  // Checks if the current page is the Dashboard for the selected project
  const isDashboardPage = pathname === `/projects/${projectId}`;

  // Checks if the current page is the Settings page for the selected project
  const isSettingsPage = pathname === `/projects/${projectId}/settings`;

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
    if (!wallet) {
      router.push("/onboarding");
      toast.info("Please connect your wallet.");
    }
  }, [wallet, router]);

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
              className="md:hidden transition duration-300 ease-in-out transform hover:-translate-y-1"
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

          {/* Dashboard/Settings Toggle Button or Blank */}
          {displayProjectTabs ? (
            <Link
              href={`/projects/${projectId}${isSettingsPage ? "" : "/settings"}`}
              className="md:hidden transition duration-300 ease-in-out transform hover:-translate-y-1"
            >
              <Image
                src={`/assets/common/${isSettingsPage ? "dashboard" : "settings"}-black.png`}
                alt="Dashboard/Settings Icon"
                width={25}
                height={25}
              />
            </Link>
          ) : (
            // Placeholder for right alignment
            <div className="w-[25px] h-[25px] md:hidden" />
          )}
        </div>

        {/* Navigation Links for Desktop View */}
        <Link
          href="/projects"
          className="hidden md:flex items-center gap-3 rounded-xl p-3 bg-white hover:bg-white/60 md:mt-5"
        >
          <Image
            src="/assets/common/explore-black.png"
            alt="Projects"
            width={25}
            height={25}
          />
          <span className="font-semibold">Projects</span>
        </Link>

        {displayProjectTabs && (
          <div className="hidden md:flex flex-col gap-5 border-t-2 border-white pt-5 mt-5">
            <Link
              href={`/projects/${projectId}`}
              className={`flex items-center gap-3 rounded-xl p-3 ${
                isDashboardPage ? "bg-[#222222] hover:bg-opacity-85 text-white" : "bg-white hover:bg-white/60"
              }`}
            >
              <Image
                src={`/assets/common/dashboard-${isDashboardPage ? "white" : "black"}.png`}
                alt="Dashboard"
                width={25}
                height={25}
              />
              <span className="font-semibold">Dashboard</span>
            </Link>
            {/* TODO: Fix later */}
            {projectId !== "7N9BtaMllIzUwjxZUujQ" &&
              <Link
                href={`/projects/${projectId}/settings`}
                className={`flex items-center gap-3 rounded-xl p-3 ${
                  isSettingsPage ? "bg-[#222222] hover:bg-opacity-85 text-white" : "bg-white hover:bg-white/60"
                }`}
              >
                <Image
                  src={`/assets/common/settings-${isSettingsPage ? "white" : "black"}.png`}
                  alt="Settings"
                  width={25}
                  height={25}
                />
                <span className="font-semibold">Settings</span>
              </Link>
            }
          </div>
        )}

        {/* Account button with disconnect option in sidebar for desktop view */}
        <button
          onClick={toggleDisconnectButton}
          ref={disconnectButtonRef}
          className="hidden md:flex items-center gap-3 bg-white hover:bg-white/60 rounded-xl p-3 md:mt-auto"
        >
          <Image
            src="/assets/common/account-circle-black.png"
            alt="User"
            width={25}
            height={25}
          />
          <span className="font-semibold text-[#757575]">
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
