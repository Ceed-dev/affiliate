import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useDisconnect } from "@thirdweb-dev/react";
import { formatAddress } from "../../utils/formatUtils"; // Import utility function to format address

interface HeaderProps {
  address: string | null; // Address prop can be either a string or null
}

// Header component: Displays formatted address if connected, otherwise shows "Not connected"
export const Header: React.FC<HeaderProps> = ({ address }) => {
  const disconnect = useDisconnect();
  const [showDisconnect, setShowDisconnect] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const disconnectRef = useRef<HTMLButtonElement | null>(null);

  const toggleDisconnectButton = () => {
    setShowDisconnect((prev) => !prev);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      (buttonRef.current && buttonRef.current.contains(event.target as Node)) ||
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

  return (
    // Header layout and styling
    <header className="w-full px-5 lg:px-0 py-2 border-b-2 border-[#25D366] shadow-md">
      <div className="flex flex-row justify-between w-full lg:w-2/3 mx-auto">
        
        {/* Link to homepage with logo */}
        <Link 
          href="/#"
          className="flex flex-row items-center gap-3 transition duration-300 ease-in-out transform hover:-translate-y-1" 
          // Adds hover effect for slight translation on Y-axis
        >
          {/* Qube logo */}
          <Image
            src="/qube.png"
            alt="qube.png" // Alt text for accessibility
            width={30}
            height={30}
          />
          {/* Qube text */}
          <p className="text-xl font-bold font-corporate">Qube</p>
        </Link>

        <div className="relative">
          {/* Button: Shows formatted address if connected, otherwise "Not connected" */}
          <button
            className="bg-white/10 text-black/60 border text-sm font-semibold py-2 px-2 md:px-7 shadow-lg rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
            // Adds hover effect to scale up the button slightly
            onClick={toggleDisconnectButton}
            ref={buttonRef}
          >
            {address ? formatAddress(address) : "Not connected"} 
            {/* Display formatted address if connected, else "Not connected" */}
          </button>
          {showDisconnect && address && (
            <button
              className="absolute top-12 right-0 bg-red-500 text-white text-sm py-2 px-4 border-2 border-white shadow-lg rounded-md transition duration-300 ease-in-out transform hover:scale-105"
              onClick={() => {
                disconnect();
                setShowDisconnect(false);
              }}
              ref={disconnectRef}
            >
              Disconnect
            </button>
          )}
        </div>
      </div>
    </header>
  );
}