import { getProvider } from "./initializeSigner";
import { productionChains, testChains, chainRpcUrls } from "../../constants/chains";
import { ProjectData } from "../../types";
import { ERC20 } from "./erc20";

export const getChains = () => {
  if (process.env.NEXT_PUBLIC_ENVIRONMENT === "production") {
    return productionChains;
  } else {
    return testChains;
  }
};

export const isEOA = async (address: string, chainId: number): Promise<boolean> => {
  const provider = getProvider(chainRpcUrls[chainId]);
  try {
    const code = await provider.getCode(address);
    return code === "0x";
  } catch (error) {
    console.error("Error checking address:", error);
    return false;
  }
};

export const fetchTokenSymbols = async (projects: ProjectData[]) => {
  return Promise.all(projects.map(async (project) => {
    const rpcUrl = chainRpcUrls[project.selectedChainId];
    if (!rpcUrl) {
      throw new Error(`RPC URL for chain ID ${project.selectedChainId} not found.`);
    }

    const erc20 = new ERC20(project.selectedTokenAddress, getProvider(rpcUrl));
    const symbol = await erc20.getSymbol();
    return { ...project, selectedToken: symbol };
  }));
};