import Link from "next/link";
import Image from "next/image";
import { formatAddress } from "../../utils/formatters";

interface HeaderProps {
  address: string | null;
}

export const Header: React.FC<HeaderProps> = ({ address }) => {
  return (
    <header className="w-full px-5 lg:px-0 py-2 border-b-2 border-sky-500 shadow-md">
      <div className="flex flex-row justify-between w-full lg:w-2/3 mx-auto">
        <Link href="/#" className="flex flex-row items-center gap-3 transition duration-300 ease-in-out transform hover:-translate-y-1">
          <Image
            src="/qube.png"
            alt="qube.png"
            width={50}
            height={50}
          />
          <p className="text-lg font-semibold">Qube</p>
        </Link>
        <button
          className="bg-gray-100 text-gray-600 text-sm py-2 px-2 md:px-7 border-2 border-white shadow-xl rounded-md transition duration-300 ease-in-out transform hover:scale-105"
        >
          {address ? formatAddress(address) : "Not connected"}
        </button>
      </div>
    </header>
  );
}