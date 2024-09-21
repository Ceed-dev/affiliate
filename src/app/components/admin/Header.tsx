import Link from "next/link";
import Image from "next/image";
import { formatAddress } from "../../utils/formatters"; // Import utility function to format address

interface HeaderProps {
  address: string | null; // Address prop can be either a string or null
}

// Header component: Displays formatted address if connected, otherwise shows "Not connected"
export const Header: React.FC<HeaderProps> = ({ address }) => {
  return (
    // Header layout and styling
    <header className="w-full px-5 lg:px-0 py-2 border-b-2 border-sky-500 shadow-md">
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
            width={50}
            height={50}
          />
          {/* Qube text */}
          <p className="text-lg font-semibold">Qube</p>
        </Link>

        {/* Button: Shows formatted address if connected, otherwise "Not connected" */}
        <button
          className="bg-gray-100 text-gray-600 text-sm py-2 px-2 md:px-7 border-2 border-white shadow-xl rounded-md transition duration-300 ease-in-out transform hover:scale-105"
          // Adds hover effect to scale up the button slightly
        >
          {address ? formatAddress(address) : "Not connected"} 
          {/* Display formatted address if connected, else "Not connected" */}
        </button>
      </div>
    </header>
  );
}