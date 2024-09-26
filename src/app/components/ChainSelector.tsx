import React, { useState } from "react";
import { Chain } from "@thirdweb-dev/chains";
import { useSwitchChain } from "@thirdweb-dev/react";
import Image from "next/image";
import { useChainContext } from "../context/chainContext";
import { getChains } from "../utils/contracts";
import { formatChainName } from "../utils/formatUtil";
import { toast } from "react-toastify";

interface ChainSelectorProps {
  useSwitch?: boolean;
  isEditing?: boolean;
  overrideSelectedChain?: Chain;
}

export const ChainSelector: React.FC<ChainSelectorProps> = ({ useSwitch = false, isEditing = false, overrideSelectedChain }) => {
  const { selectedChain: contextSelectedChain, setSelectedChain: setContextSelectedChain } = useChainContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const chains = getChains();
  const switchChain = useSwitchChain();

  // Prefer to use overrideSelectedChain
  const selectedChain = overrideSelectedChain || contextSelectedChain;
  const setSelectedChain = (chain: Chain) => {
    if (!overrideSelectedChain) {
      setContextSelectedChain(chain);
    }
  };

  const handleChainChange = async (chain: Chain) => {
    if (useSwitch) {
      try {
        await switchChain(chain.chainId);
        setSelectedChain(chain);
        setDropdownOpen(false);
        toast.success(`Successfully switched to ${chain.name}.`);
      } catch (error) {
        console.error("Failed to switch network:", error);
        toast.error("Failed to switch network.");
      }
    } else {
      setSelectedChain(chain);
      setDropdownOpen(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => {
          if (isEditing) {
            toast.info(`Selected chain: ${selectedChain.name}`);
          } else {
            setDropdownOpen(!dropdownOpen)
          }
        }}
        className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
      >
        <Image src={`/chains/${formatChainName(selectedChain.name)}.png`} alt={selectedChain.name} width={20} height={20} />
      </button>

      {dropdownOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {chains.map(chain => (
              <button
                key={chain.chainId}
                onClick={() => handleChainChange(chain)}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <Image src={`/chains/${formatChainName(chain.name)}.png`} alt={chain.name} width={20} height={20} />
                <span className="ml-2">{chain.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
