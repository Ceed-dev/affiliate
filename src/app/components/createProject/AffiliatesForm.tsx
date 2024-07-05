import React, { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { isAddress } from "ethers/lib/utils";
import { NextButton } from "./NextButton";
import { initializeSigner, ERC20 } from "../../utils/contracts";
import { formatBalance } from "../../utils/formatters";
import { WhitelistedAddress, ProjectType } from "../../types";

type AffiliatesFormProps = {
  data: {
    projectType: ProjectType;
    selectedTokenAddress: string;
    whitelistedAddresses?: { [address: string]: WhitelistedAddress };
    rewardAmount?: number;
    redirectUrl?: string;
  };
  handleChange: (field: string, isNumeric?: boolean, isFloat?: boolean) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleWhitelistChange?: (newWhitelistedAddresses: { [address: string]: WhitelistedAddress }) => void;
  nextStep?: () => void;
  isSaving?: boolean;
  hideButton?: boolean;
  status?: string;
};

type WhitelistEntry = {
  address: string;
  details: WhitelistedAddress;
}

export const AffiliatesForm: React.FC<AffiliatesFormProps> = ({
  data,
  handleChange,
  handleWhitelistChange,
  nextStep,
  isSaving,
  hideButton,
  status
}) => {
  const isEditing = nextStep === undefined;
  const isFormComplete = () => {
    if (data.projectType === "DirectPayment") {
      return (
        data.selectedTokenAddress.trim() &&
        Object.keys(data.whitelistedAddresses ?? {}).length > 0
      );
    } else if (data.projectType === "EscrowPayment") {
      return (
        data.selectedTokenAddress.trim() &&
        data.rewardAmount !== undefined &&
        data.rewardAmount > 0 &&
        data.redirectUrl?.trim()
      );
    }
    return false; // In case projectType is not set or unknown
  };

  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenBalance, setTokenBalance] = useState("");
  const [tokenAllowance, setTokenAllowance] = useState("");
  const [isFetchingTokenDetails, setIsFetchingTokenDetails] = useState(false);
  const [isTokenAddressValid, setIsTokenAddressValid] = useState(true);
  const [isErc20Token, setIsErc20Token] = useState(true);

  const initializeTokenStates = () => {
    setTokenSymbol("");
    setTokenBalance("");
    setTokenAllowance("");
  };

  const fetchTokenDetails = async (address: string) => {
    if (address.trim() === "") {
      setIsTokenAddressValid(true); // Reset validation state for empty input
      setIsErc20Token(true); // Reset to avoid conflicting error messages
      initializeTokenStates();
      return;
    }
    if (!isAddress(address)) {
      setIsTokenAddressValid(false);
      setIsErc20Token(true); // reset to avoid conflicting error messages
      initializeTokenStates();
      return;
    }
    setIsTokenAddressValid(true);

    setIsFetchingTokenDetails(true);
    try {
      const signer = initializeSigner();
      if (!signer) {
        throw new Error("Failed to initialize signer.");
      }
      const erc20 = new ERC20(address, signer);
      const symbol = await erc20.getSymbol();
      const balance = await erc20.getBalance(await signer.getAddress());
      const allowance = await erc20.getAllowance(await signer.getAddress(), `${process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS}`);

      setTokenSymbol(symbol);
      setTokenBalance(balance);
      setTokenAllowance(allowance);

      setIsErc20Token(true);

      console.log(JSON.stringify({
        "Address": address,
        "Symbol": symbol,
        "Balance": balance,
        "Allowance": allowance,
      }, null, 2));
    } catch (error: any) {
      console.error(`Error fetching token details: ${error.message}`);
      toast.error(`Error fetching token details: ${error.message}`);
      setIsErc20Token(false);
      initializeTokenStates();
    }
    setIsFetchingTokenDetails(false);
  };

  useEffect(() => {
    if (data.selectedTokenAddress) {
      fetchTokenDetails(data.selectedTokenAddress);
    } else {
      initializeTokenStates();
    }
  }, [data.selectedTokenAddress]);

  // ===== BEGIN WHITELIST MANAGEMENT =====

  // Use "data.whitelistedAddresses" as initial value
  const [whitelistedEntries, setWhitelistedEntries] = useState<WhitelistEntry[]>(() =>
    Object.entries(data.whitelistedAddresses ?? {}).map(([address, details]) => ({
      address,
      details
    }))
  );
  const [newAddress, setNewAddress] = useState("");
  const [newRedirectUrl, setNewRedirectUrl] = useState("");
  const [newRewardAmount, setNewRewardAmount] = useState(0);

  // Helper function to check if URL is valid
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleAdd = () => {
    // Input validation
    if (!isAddress(newAddress)) {
      toast.error("Invalid wallet address.");
      return;
    }
    if (!isValidUrl(newRedirectUrl)) {
      toast.error("Invalid URL.");
      return;
    }
    if (!(newRewardAmount > 0)) {
      toast.error("Reward amount must be greater than zero.");
      return;
    }
  
    // Check for duplicate addresses
    const exists = Object.keys(data.whitelistedAddresses ?? {}).includes(newAddress);
    if (exists) {
      toast.error("Address already exists in the whitelist.");
      return;
    }
  
    // Create new entry
    const newEntry: WhitelistedAddress = { redirectUrl: newRedirectUrl, rewardAmount: newRewardAmount };
    const updatedEntries = { ...data.whitelistedAddresses, [newAddress]: newEntry };
  
    // Update entire project data
    if (handleWhitelistChange) {
      handleWhitelistChange(updatedEntries);
    }
  
    // Also updates local state
    setWhitelistedEntries(prevEntries => [...prevEntries, { address: newAddress, details: newEntry }]);
  
    // Reset input field
    setNewAddress("");
    setNewRedirectUrl("");
    setNewRewardAmount(0);
    toast.success("New address added to whitelist.");
  };  

  const handleRemove = (addressToRemove: string) => {
    // Create a new array that excludes the specified address from `whitelistedEntries`
    setWhitelistedEntries(prevEntries =>
      prevEntries.filter(entry => entry.address !== addressToRemove)
    );

    // Delete the address from the original project data
    const updatedEntries = { ...data.whitelistedAddresses };
    delete updatedEntries[addressToRemove];
    if (handleWhitelistChange) {
      handleWhitelistChange(updatedEntries);
    }

    toast.success(`Address ${addressToRemove} has been removed from the whitelist.`);
  };

  // ===== END WHITELIST MANAGEMENT =====

  return (
    <div className="bg-white rounded-lg shadow-md p-5 mt-10 text-sm">

      <h1 className="text-xl mb-5">Affiliates</h1>

      <div className="flex flex-col gap-5">
        
        <div className="flex flex-col gap-2">
          <h2>Token <span className="text-red-500">*</span> {isEditing && <span className="text-gray-500 text-sm">(Not editable)</span>}</h2>
          <input
            readOnly={isEditing}
            type="text"
            value={data.selectedTokenAddress}
            onChange={(e) => {
              handleChange("selectedTokenAddress")(e);
              const address = e.target.value.trim();
              if (address === "") {
                setIsTokenAddressValid(true);
                setIsErc20Token(true);
                initializeTokenStates();
              } else {
                fetchTokenDetails(address);
              }
            }}
            placeholder="Enter token contract address"
            className={`w-full p-2 border border-[#D1D5DB] rounded-lg outline-none ${isEditing ? "bg-gray-100 text-gray-500" : "bg-white text-black"}`}
          />
          {!isTokenAddressValid && (
            <p className="text-red-500 text-sm pl-2">Invalid token address.</p>
          )}
          {!isErc20Token && (
            <p className="text-red-500 text-sm pl-2">Address is not an ERC20 token contract.</p>
          )}
          {isFetchingTokenDetails &&
            <div className="flex flex-row gap-3">
              <Image src="/loading.png" alt="loading.png" width={20} height={20} className="animate-spin" /> 
              <p className="text-gray-900 animate-pulse">Fetching Token Details...</p>
            </div>
          }
          {tokenSymbol && tokenBalance && tokenAllowance && 
            <div className="flex flex-row justify-around">
              <p><span className="font-semibold">Token:</span> {tokenSymbol}</p>
              <p>/</p>
              <p><span className="font-semibold">Balance:</span> {formatBalance(tokenBalance)}</p>
              <p>/</p>
              <p><span className="font-semibold">Allowance:</span> {formatBalance(tokenAllowance)}</p>
            </div>
          }
        </div>

        {data.projectType === "DirectPayment" && (
          <div className="flex flex-col gap-2">
            <h2>Whitelist Management <span className="text-red-500">*</span></h2>
            <div className="w-full border border-[#D1D5DB] rounded-lg outline-none flex flex-col pr-2 bg-white text-black">
              <div className="flex flex-row">
                <span className="rounded-tl-lg w-1/3 text-[#6B7280] bg-gray-100 p-2 mr-1">
                  WALLET ADDRESS:
                </span>
                <input 
                  value={newAddress} 
                  onChange={e => setNewAddress(e.target.value)} 
                  placeholder="0x1234567890abcdef1234567890abcdef12345678" 
                  className="w-full outline-none" 
                />
              </div>
              <div className="flex flex-row">
                <span className="w-1/3 text-[#6B7280] bg-gray-100 p-2 mr-1">
                  REDIRECT URL:
                </span>
                <input 
                  value={newRedirectUrl} 
                  onChange={e => setNewRedirectUrl(e.target.value)} 
                  placeholder={process.env.NEXT_PUBLIC_BASE_URL}
                  className="w-full outline-none" 
                />
              </div>
              <div className="flex flex-row">
                <span className="rounded-bl-lg w-1/3 text-[#6B7280] bg-gray-100 p-2 mr-1">
                  REWARD AMOUNT:
                </span>
                <input 
                  type="number" 
                  value={newRewardAmount} 
                  onChange={e => setNewRewardAmount(parseInt(e.target.value, 10))} 
                  placeholder="Reward Amount" 
                  className="w-full outline-none" 
                />
              </div>
            </div>
            <button 
              onClick={handleAdd} 
              className="bg-green-500 hover:scale-105 hover:bg-green-700 text-white p-2 rounded transition-transform duration-300"
            >
              Add to Whitelist
            </button>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Wallet Address</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Redirect URL</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Reward Amount</th>
                    <th className="px-6 py-3 bg-gray-50">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {whitelistedEntries.length ? (
                    whitelistedEntries.map(entry => (
                      <tr key={entry.address}>
                        <td className="px-6 py-4 overflow-hidden truncate">{entry.address}</td>
                        <td className="px-6 py-4 overflow-hidden truncate">{entry.details.redirectUrl}</td>
                        <td className="px-6 py-4 overflow-hidden truncate">{entry.details.rewardAmount}</td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => handleRemove(entry.address)}>
                            <Image 
                              src="/trash.png" 
                              alt="trash.png" 
                              height={20} 
                              width={20} 
                              className="transition duration-300 ease-in-out transform hover:scale-125" 
                            />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="text-gray-500">
                      <td colSpan={4} className="text-center py-4">No Whitelist Data</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {data.projectType === "EscrowPayment" && (
          <>
            <div className="flex flex-col gap-2">
              <h2>Reward Amount <span className="text-red-500">*</span></h2>
              <p className="text-gray-500 text-sm">
                You can enter an integer or a value up to one decimal place.
              </p>
              <div className="rounded-lg border border-[#D1D5DB] flex items-center">
                <span className="w-[150px] text-[#6B7280] bg-gray-100 p-2 mr-1">
                  Token Units:
                </span>
                <input
                  type="number"
                  value={data.rewardAmount?.toString() || ""}
                  onChange={handleChange("rewardAmount", true, true)}
                  className="w-full outline-none"
                  min="1"
                  step="0.1"
                  placeholder="Enter token units"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h2>Redirect URL <span className="text-red-500">*</span></h2>
              <div className="rounded-lg border border-[#D1D5DB] flex items-center">
                <span className="w-[150px] text-[#6B7280] bg-gray-100 p-2 mr-1">
                  URL:
                </span>
                <input
                  type="url"
                  value={data.redirectUrl}
                  onChange={handleChange("redirectUrl")}
                  className="w-full outline-none"
                  placeholder="Enter the redirect URL"
                />
              </div>
            </div>
          </>
        )}
        
      </div>

      {nextStep && !hideButton &&
        <NextButton 
          onClick={() => isFormComplete() && nextStep()} 
          disabled={
            !isFormComplete() || 
            !isTokenAddressValid || 
            !isErc20Token || 
            isFetchingTokenDetails || 
            (isSaving ?? true)
          } 
        >
          <div className="flex flex-row items-center justify-center gap-5">
            {isSaving && (
              <Image 
                src={"/loading.png"} 
                height={30} 
                width={30} 
                alt="loading.png" 
                className="animate-spin" 
              />
            )}
            {status}
          </div>
        </NextButton>
      }

    </div>
  );
};