import React, { useState } from "react";
import { Chain } from "@thirdweb-dev/chains";
import { useSwitchChain } from "@thirdweb-dev/react";
import Image from "next/image";
import { useChainContext } from "../context/chainContext";
import { getChains } from "../utils/contracts";
import { formatChainName } from "../utils/formatUtils";
import { toast } from "react-toastify";

// Props interface for the ChainSelector component
interface ChainSelectorProps {
  useSwitch?: boolean;              // Toggle for enabling/disabling chain switching
  isEditing?: boolean;              // If true, only shows selected chain without allowing switch
  overrideSelectedChain?: Chain;    // If provided, overrides context-selected chain
}

export const ChainSelector: React.FC<ChainSelectorProps> = ({ 
  useSwitch = false, 
  isEditing = false, 
  overrideSelectedChain 
}) => {
  // Retrieve the selected chain and updater function from context
  const { selectedChain: contextSelectedChain, setSelectedChain: setContextSelectedChain } = useChainContext();

  const [dropdownOpen, setDropdownOpen] = useState(false); // Dropdown visibility state
  const chains = getChains();                              // List of available chains
  const switchChain = useSwitchChain();                    // Hook for switching blockchain networks

  // Determines the active chain, preferring `overrideSelectedChain` if provided
  const selectedChain = overrideSelectedChain || contextSelectedChain;

  // Sets the selected chain in context if not overridden
  const setSelectedChain = (chain: Chain) => {
    if (!overrideSelectedChain) {
      setContextSelectedChain(chain);
    }
  };

  // Handles chain change based on `useSwitch` prop
  const handleChainChange = async (chain: Chain) => {
    if (useSwitch) {
      try {
        await switchChain(chain.chainId);  // Attempts network switch if useSwitch is true
        setSelectedChain(chain);           // Sets the selected chain locally
        setDropdownOpen(false);            // Closes dropdown
        toast.success(`Successfully switched to ${chain.name}.`);
      } catch (error) {
        console.error("Failed to switch network:", error);
        toast.error("Failed to switch network.");
      }
    } else {
      setSelectedChain(chain);             // Only sets the selected chain locally if useSwitch is false
      setDropdownOpen(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      {/* Button to open the dropdown or show selected chain info */}
      <button
        type="button"
        onClick={() => {
          if (isEditing) {
            toast.info(`Selected chain: ${selectedChain.name}`); // Shows chain info if editing mode is active
          } else {
            setDropdownOpen(!dropdownOpen);                       // Toggles dropdown visibility
          }
        }}
        className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
      >
        <Image 
          src={`/chains/${formatChainName(selectedChain.name)}.png`} 
          alt={selectedChain.name} 
          width={20} 
          height={20} 
        />
        <span className="ml-2">{selectedChain.name}</span>
      </button>

      {/* Dropdown for selecting available chains */}
      {dropdownOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {chains.map((chain) => (
              <button
                key={chain.chainId}
                onClick={() => handleChainChange(chain)}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <Image 
                  src={`/chains/${formatChainName(chain.name)}.png`} 
                  alt={chain.name} 
                  width={20} 
                  height={20} 
                />
                <span className="ml-2">{chain.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};