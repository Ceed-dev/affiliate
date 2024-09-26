import React, { createContext, useContext, useState, ReactNode } from "react";
import { Chain } from "@thirdweb-dev/chains";
import { getChains } from "../utils/contracts";

// Define the shape of the ChainContext
type ChainContextType = {
  selectedChain: Chain; // The currently selected chain
  setSelectedChain: (chain: Chain) => void; // Function to update the selected chain
};

// Create a context for managing the selected blockchain chain
const ChainContext = createContext<ChainContextType | undefined>(undefined);

/**
 * ChainProvider component
 * This provider wraps components that need access to the selected blockchain chain.
 * It stores the selected chain and provides a way to update it.
 * 
 * @param children - React children elements that will consume the chain context.
 */
export const ChainProvider = ({ children }: { children: ReactNode }) => {
  // Initialize selectedChain with the first chain from the list
  const [selectedChain, setSelectedChain] = useState<Chain>(getChains()[0]);

  return (
    <ChainContext.Provider value={{ selectedChain, setSelectedChain }}>
      {children}
    </ChainContext.Provider>
  );
};

/**
 * Custom hook to use the ChainContext
 * Provides access to the selected chain and the function to update it.
 * 
 * This hook ensures that it is only used within a ChainProvider.
 * 
 * @throws Error if used outside of ChainProvider
 * @returns {ChainContextType} The context value with selectedChain and setSelectedChain function
 */
export const useChainContext = (): ChainContextType => {
  const context = useContext(ChainContext);
  if (!context) {
    throw new Error("useChainContext must be used within a ChainProvider");
  }
  return context;
};
