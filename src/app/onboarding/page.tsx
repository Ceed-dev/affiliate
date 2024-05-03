"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import {
  ConnectWallet,
  lightTheme,
  useAddress
} from "@thirdweb-dev/react";

export default function Onboarding() {
  const router = useRouter();
  const address = useAddress();

  useEffect(() => {
    if (address) {
      router.push("/projects");
    }
  });

  return (
    <div className="flex flex-col items-center min-h-screen gap-[100px]">
      <div className="w-2/3 flex mt-5">
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
      <div className="bg-white border-2 border-sky-500 rounded-lg w-2/3 xl:w-1/3 flex flex-col items-center gap-10 py-20">
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
        />  

      </div>
    </div>
  );
}