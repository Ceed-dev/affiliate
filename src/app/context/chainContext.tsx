import React, { createContext, useContext, useState, ReactNode } from "react";
import { Chain } from "@thirdweb-dev/chains";
import { getChains } from "../utils/contracts";

type ChainContextType = {
  selectedChain: Chain;
  setSelectedChain: (chain: Chain) => void;
}

const ChainContext = createContext<ChainContextType | undefined>(undefined);

export const ChainProvider = ({ children }: { children: ReactNode }) => {
  const [selectedChain, setSelectedChain] = useState<Chain>(getChains()[0]);

  return (
    <ChainContext.Provider value={{ selectedChain, setSelectedChain }}>
      {children}
    </ChainContext.Provider>
  );
};

export const useChainContext = () => {
  const context = useContext(ChainContext);
  if (!context) {
    throw new Error("useChainContext must be used within a ChainProvider");
  }
  return context;
};
