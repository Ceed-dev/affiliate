// Core Imports
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";

// Ethers and Third-Party Libraries
import { ethers } from "ethers";
import { isAddress } from "ethers/lib/utils";
import { Chain } from "@thirdweb-dev/chains";

// Utils and Constants
import { initializeSigner, ERC20 } from "../../utils/contracts";
import { copyToClipboard } from "../../utils/generalUtils";
import { formatBalance } from "../../utils/formatUtils";
import { popularTokens } from "../../constants/popularTokens";

// Types and Contexts
import { PaymentType, ConversionPoint, Tier, SelectedToken } from "../../types";
import { useChainContext } from "../../context/chainContext";

// Components
import { ChainSelector } from "../common";
import { ToggleButton } from "../ToggleButton";
import { TieredDetailsModal } from "../TieredDetailsModal";

// Constants
const ZERO_ADDRESS = ethers.constants.AddressZero;

// Type definition for SelectButton component props
type SelectButtonProps = {
  isSelected: boolean; // Flag to indicate if the button is selected
  onClick: () => void; // Function to handle button click
  title: string; // Title text displayed on the button
  description: string; // Description text displayed below the title
  warningText?: string; // Optional warning text displayed when selected
  disabled?: boolean; // Optional flag to disable the button (default: false)
};

// SelectButton component
const SelectButton: React.FC<SelectButtonProps> = ({
  isSelected,
  onClick,
  title,
  description,
  warningText,
  disabled = false,
}) => (
  <button
    onClick={!disabled ? onClick : undefined} // Disable onClick if disabled is true
    className={`w-full flex items-center gap-3 rounded-lg py-4 px-6 text-left text-sm font-medium text-gray-900 cursor-pointer focus:outline-none ${
      isSelected ? "bg-gray-200 hover:bg-gray-300 border-2 border-black" : "bg-white hover:bg-gray-50 border"
    } ${disabled ? "cursor-not-allowed opacity-50" : ""}`} // Styling for disabled state
    disabled={disabled} // HTML disabled attribute
  >
    {/* Selection Indicator */}
    <div
      className={`flex-none w-8 h-8 rounded-full flex items-center justify-center ${
        isSelected ? "bg-black" : "border border-gray-400"
      } ${disabled ? "opacity-50" : ""}`} // Styling for disabled indicator
    >
      {isSelected && (
        <Image
          src="/assets/common/check-white.png"
          width={25}
          height={25}
          alt="check"
        />
      )}
    </div>

    {/* Content: Title and Description */}
    <div>
      <span>
        {title}
        {disabled && (
          <span className="ml-2 text-xs text-gray-500">(Not Editable)</span> // Show "Not Editable" when disabled
        )}
      </span>
      <p className="text-gray-500 mt-2">{description}</p>
      {/* Conditional display of warning text if the button is selected */}
      {isSelected && warningText && (
        <p className="text-red-500 font-bold underline">{warningText}</p>
      )}
    </div>
  </button>
);

// Type definition for RewardForm component props
type RewardFormProps = {
  // Required properties
  isReferralEnabled: boolean; // Controls the state of referral feature
  selectedToken: SelectedToken; // Selected token data object
  conversionPoints: ConversionPoint[]; // Array of conversion points
  redirectUrl: string; // Redirect URL for the project
  handleChange: (field: string, isNumeric?: boolean, isFloat?: boolean) => 
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void; // Function to handle form input changes

  // Optional properties
  setIsReferralEnabled?: (value: boolean) => void; // Function to toggle referral state
  selectedChain?: Chain | null; // Selected blockchain chain info (optional, defaults to context if omitted)
  handleUpdateConversionPoints?: (action: "add" | "remove", point?: ConversionPoint) => void; // Function to add/remove conversion points
  handleConversionPointToggle?: (id: string) => void; // Function to toggle conversion point's active state
  setTokenError?: (hasError: boolean) => void; // Function to set error state for token
  setRedirectLinkError?: (hasError: boolean) => void; // Function to set error state for redirect URL
  isEditing?: boolean; // Boolean to control edit mode (defaults to false)
};

// RewardForm component definition
export const RewardForm: React.FC<RewardFormProps> = ({
  // Required props
  isReferralEnabled,
  selectedToken,
  conversionPoints,
  redirectUrl,
  handleChange,
  
  // Optional props
  setIsReferralEnabled,
  selectedChain: selectedChainProp,
  handleUpdateConversionPoints,
  handleConversionPointToggle,
  setTokenError,
  setRedirectLinkError,
  isEditing = false, // Defaults to false if not provided
}) => {
  // Selected chain management
  const { selectedChain: contextSelectedChain } = useChainContext();
  const selectedChain = selectedChainProp ?? contextSelectedChain;

  // Token and chain states
  const [selectedTokenLabel, setSelectedTokenLabel] = useState(
    selectedToken.address
      ? popularTokens[selectedChain.chainId]?.find(token => token.address === selectedToken.address)?.symbol || "other"
      : "other"
  );
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenBalance, setTokenBalance] = useState("");
  const [tokenAllowance, setTokenAllowance] = useState("");
  const [isFetchingTokenDetails, setIsFetchingTokenDetails] = useState(false);
  const [isTokenAddressValid, setIsTokenAddressValid] = useState(true);
  const [isErc20Token, setIsErc20Token] = useState(true);

  // Conversion point state
  const [rewardAmountInput, setRewardAmountInput] = useState<string>("0"); // Temporary input state
  const [newConversionPoint, setNewConversionPoint] = useState<Partial<ConversionPoint>>({
    id: "", // ID to be generated later
    title: "", // Title of conversion point
    paymentType: "FixedAmount", // Default payment type
    rewardAmount: 0, // Default reward amount for FixedAmount type
  });

  // State to track the number of characters in the conversion point title
  const maxTitleLength = 50;
  const [titleCharCount, setTitleCharCount] = useState(newConversionPoint.title?.length || 0);

  // Helper function to reset token states
  const initializeTokenStates = () => {
    setTokenSymbol("");
    setTokenBalance("");
    setTokenAllowance("");
  };

  // Handle payment type change for conversion point
  const handlePaymentTypeChange = (paymentType: PaymentType) => {
    const newPoint = {
      id: "", // ID will be generated later
      title: "",
      paymentType,
      rewardAmount: paymentType === "FixedAmount" ? 0 : undefined,
      percentage: paymentType === "RevenueShare" ? 0 : undefined,
      tiers: paymentType === "Tiered" ? [] : undefined,
    };
    setNewConversionPoint(newPoint);
    setTitleCharCount(0);
    setRewardAmountInput("0");
  };

  // Effect to reset token selector when the selected chain changes
  useEffect(() => {
    if (!isEditing) {
      // Reset token states when the selected chain changes.
      // The additional state resets for `isFetchingTokenDetails`, `isTokenAddressValid`,
      // and `isErc20Token` are deliberately kept outside the `initializeTokenStates` function.
      // This separation avoids potential bugs caused by overwriting these states
      // during other calls to `initializeTokenStates`, ensuring that these resets
      // are only triggered when the chain changes.
      initializeTokenStates();
      setIsFetchingTokenDetails(false);
      setIsTokenAddressValid(true);
      setIsErc20Token(true);

      // Reset the token selector to "other" and clear the token address value
      // when the chain changes. This ensures that the selected token is always 
      // relevant to the newly selected chain and avoids mismatched token address issues.
      setSelectedTokenLabel("other");
      handleChange("selectedToken.address")({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>);
      handleChange("selectedToken.symbol")({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>);
    }
  }, [selectedChain]);

  // Reset to FixedAmount if referral enabled and Tiered selected
  useEffect(() => {
    if (isReferralEnabled && newConversionPoint.paymentType === "Tiered") {
      setTierEntries([]);
      handlePaymentTypeChange("FixedAmount");
    }
  }, [isReferralEnabled]);

  // Fetch token details based on address
  const fetchTokenDetails = async (address: string) => {
    if (address.trim() === "" || !isAddress(address)) {
      setIsTokenAddressValid(false);
      setIsErc20Token(true);
      initializeTokenStates();
      return;
    }

    setIsTokenAddressValid(true);
    setIsFetchingTokenDetails(true);

    try {
      const signer = initializeSigner();
      if (!signer) throw new Error("Failed to initialize signer.");
      const erc20 = new ERC20(address, signer);
      const symbol = await erc20.getSymbol();
      const balance = await erc20.getBalance(await signer.getAddress());

      setTokenSymbol(symbol);
      handleChange("selectedToken.symbol")({ target: { value: symbol } } as React.ChangeEvent<HTMLInputElement>);
      setTokenBalance(balance);
      setIsErc20Token(true);
    } catch (error: any) {
      console.error("Error fetching token details:", error.message);
      toast.error("Error fetching token details: " + error.message);
      setIsErc20Token(false);
      initializeTokenStates();
    } finally {
      setIsFetchingTokenDetails(false);
    }
  };

  // Fetch token details only if not editing
  useEffect(() => {
    if (!isEditing && selectedToken.address && selectedTokenLabel === "other") {
      fetchTokenDetails(selectedToken.address);
    } else {
      initializeTokenStates();
    }
  }, [selectedToken.address, selectedToken]);

  // Effect to update token error state in parent component
  useEffect(() => {
    if (setTokenError) {
      const hasTokenError = !selectedToken.address.trim() || !isTokenAddressValid || !isErc20Token || isFetchingTokenDetails;
      setTokenError(hasTokenError);
    }
  }, [selectedToken.address, isTokenAddressValid, isErc20Token, isFetchingTokenDetails, setTokenError]);

  // ===== TIER MANAGEMENT =====

  // State for managing tiers
  const [tierEntries, setTierEntries] = useState<Tier[]>([]);
  const [newConversionsRequired, setNewConversionsRequired] = useState(0);
  const [newTierRewardAmount, setNewTierRewardAmount] = useState(0);
  const [isCheckingNewTierEntry, setIsCheckingNewTierEntry] = useState(false);

  // Add a new tier after validating inputs
  const handleAddTier = async () => {
    setIsCheckingNewTierEntry(true);

    if (newConversionsRequired < 1 || newConversionsRequired > 1000 || newTierRewardAmount <= 0) {
      toast.error("Invalid tier values provided.");
      setIsCheckingNewTierEntry(false);
      return;
    }
    if (tierEntries.some(tier => tier.conversionsRequired === newConversionsRequired)) {
      toast.error("Tier with the same conversions required already exists.");
      setIsCheckingNewTierEntry(false);
      return;
    }

    const newTier: Tier = { conversionsRequired: newConversionsRequired, rewardAmount: newTierRewardAmount };
    const updatedTiers = [...tierEntries, newTier].sort((a, b) => a.conversionsRequired - b.conversionsRequired);
    
    setTierEntries(updatedTiers);
    setNewConversionPoint(prevPoint => ({ ...prevPoint, tiers: updatedTiers }));
    setNewConversionsRequired(0);
    setNewTierRewardAmount(0);

    toast.success("New reward tier added.");
    setIsCheckingNewTierEntry(false);
  };

  // Remove a specific tier
  const handleRemoveTier = (index: number) => {
    const updatedTiers = tierEntries.filter((_, i) => i !== index);
    setTierEntries(updatedTiers);
    setNewConversionPoint(prevPoint => ({ ...prevPoint, tiers: updatedTiers }));
    toast.success("Reward tier removed.");
  };

  // ===== REDIRECT URL MANAGEMENT =====

  const [redirectUrlError, setRedirectUrlError] = useState("");

  // Validate redirect URL
  const handleRedirectUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    const isValid = (() => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    })();

    setRedirectUrlError(isValid ? "" : "Invalid redirect URL.");
    setRedirectLinkError?.(!isValid);
    handleChange("redirectUrl")(event);
  };

  // ===== TIER MODAL MANAGEMENT =====

  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [selectedTierDetails, setSelectedTierDetails] = useState<Tier[] | null>(null);

  const openTierModal = (tiers: Tier[]) => {
    setSelectedTierDetails(tiers);
    setIsTierModalOpen(true);
  };

  const closeTierModal = () => {
    setIsTierModalOpen(false);
    setSelectedTierDetails(null);
  };

  // Generate a simple alphanumeric ID
  const generateSimpleAlphanumericId = (length: number = 8): string => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join("");
  };

  return (
    <>
      <h1 className="text-2xl font-bold">Rewards</h1>

      <div className="space-y-5">
  
        {/* Referral Feature ON/OFF Button */}
        <SelectButton
          isSelected={isReferralEnabled}
          onClick={() => setIsReferralEnabled?.(!isReferralEnabled)}
          title="Referrals"
          description="Enabling the referral feature ensures that both affiliates and users who cause conversions receive rewards."
          warningText="This toggle button cannot be changed after initial setup."
          disabled={isEditing}
        />
    
        {/* Chain & Token Selection */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">
            Chain & Token <span className="text-red-500">* </span>
          </h2>
          <p className="text-gray-500 text-sm">
            {isEditing ? "Not editable" : "Chain & Token address cannot be edited after initial setup."}
          </p>

          {/* Chain Selector and Token Selection */}
          <div className="flex flex-col md:flex-row justify-start items-center gap-2">
            <div className="w-full md:w-auto flex flex-row gap-2">
              <ChainSelector useSwitch={true} isEditing={isEditing} overrideSelectedChain={selectedChain} />

              {/* Token Selector */}
              <select
                value={selectedTokenLabel}
                onChange={(e) => {
                  const selectedSymbol = e.target.value;
                  setSelectedTokenLabel(selectedSymbol);

                  if (selectedSymbol === "other") {
                    handleChange("selectedToken.address")({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>);
                    handleChange("selectedToken.symbol")({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>);
                  } else {
                    setIsTokenAddressValid(true);
                    setIsErc20Token(true);
                    const token = popularTokens[selectedChain.chainId]?.find(token => token.symbol === selectedSymbol);
                    if (token) {
                      handleChange("selectedToken.address")({ target: { value: token.address } } as React.ChangeEvent<HTMLInputElement>);
                      handleChange("selectedToken.symbol")({ target: { value: token.symbol } } as React.ChangeEvent<HTMLInputElement>);
                    }
                  }
                }}
                className={`flex-1 md:flex-none p-2 border border-[#D1D5DB] rounded-lg outline-none ${isEditing ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
                disabled={isEditing}
              >
                {isEditing ? (
                  <option>{selectedToken.symbol}</option>
                ) : (
                  <>
                    <option value="" disabled>Select a token</option>
                    {(popularTokens[selectedChain.chainId] || []).map((token) => (
                      <option key={token.address} value={token.symbol}>
                        {token.symbol}
                      </option>
                    ))}
                    <option value="other">Other Token</option>
                  </>
                )}
              </select>
            </div>

            {/* Custom Token Address Input */}
            <input
              readOnly={isEditing || selectedTokenLabel !== "other"}
              type="text"
              value={selectedToken.address === ZERO_ADDRESS ? "Native Token" : selectedToken.address}
              onChange={(e) => {
                const address = e.target.value.trim();
                handleChange("selectedToken.address")(e);

                if (address === "") {
                  setIsTokenAddressValid(true);
                  setIsErc20Token(true);
                  initializeTokenStates();
                  handleChange("selectedToken.symbol")({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>);
                } else if (address !== ZERO_ADDRESS) {
                  fetchTokenDetails(address);
                }
              }}
              placeholder="Enter token contract address"
              className={`w-full md:w-auto grow p-2 border border-[#D1D5DB] rounded-lg outline-none ${isEditing || selectedTokenLabel !== "other" ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white text-black"}`}
            />
          </div>

          {/* Validation Messages */}
          {!isTokenAddressValid && <p className="text-red-500 text-sm pl-2">Invalid token address.</p>}
          {!isErc20Token && <p className="text-red-500 text-sm pl-2">Address is not an ERC20 token contract.</p>}
          {isFetchingTokenDetails && (
            <div className="flex flex-row gap-3">
              <Image src="/assets/common/loading.png" alt="loading" width={20} height={20} className="animate-spin" />
              <p className="text-gray-900 animate-pulse">Fetching Token Details...</p>
            </div>
          )}

          {/* Token Information */}
          {!isEditing && tokenSymbol && tokenBalance && (
            <div className="flex flex-row justify-around">
              <p><span className="font-semibold">Token:</span> {tokenSymbol}</p>
              <p>/</p>
              <p><span className="font-semibold">Balance:</span> {formatBalance(tokenBalance)}</p>
              <p>/</p>
              <p><span className="font-semibold">Allowance:</span> -</p>
            </div>
          )}

          {/* Explorer Link */}
          {isEditing && selectedChain?.explorers?.length && selectedToken.address !== ZERO_ADDRESS && (
            <Link
              href={`${selectedChain.explorers[0].url}/address/${selectedToken.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mr-auto text-blue-400 hover:text-blue-700 hover:font-semibold hover:underline"
            >
              &rarr; View on Explorer
            </Link>
          )}
        </div>

        {/* Conversion Points Setup Section: Configure rewards for affiliates based on the type of conversion point */}
        {!isEditing && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">
              Conversion Points <span className="text-red-500">*</span>
            </h2>

            <div className="border border-[#D1D5DB] rounded-lg space-y-4 p-5">
              
              {/* Payment Type Selection */}
              <div className="space-y-2">
                <h3>
                  How do you want to reward affiliates? <span className="text-red-500">*</span>
                </h3>
                <SelectButton
                  isSelected={newConversionPoint.paymentType === "FixedAmount"}
                  onClick={() => {
                    setTierEntries([]);
                    handlePaymentTypeChange("FixedAmount");
                  }}
                  title="Fixed Amount"
                  description="Reward affiliates with tokens for each successful referral."
                />
                <SelectButton
                  isSelected={newConversionPoint.paymentType === "RevenueShare"}
                  onClick={() => {
                    setTierEntries([]);
                    handlePaymentTypeChange("RevenueShare");
                  }}
                  title="Revenue Share"
                  description="Reward affiliates with a percentage of the revenue they help generate."
                />
              </div>

              {/* Conversion Point Title */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3>Conversion Point Title <span className="text-red-500">*</span></h3>
                  <p className={`text-sm ${titleCharCount >= maxTitleLength ? "text-red-500" : "text-gray-500"}`}>
                    {titleCharCount}/{maxTitleLength}
                    {titleCharCount >= maxTitleLength && <span className="ml-2">Character limit reached</span>}
                  </p>
                </div>
                <div className="rounded-lg border border-[#D1D5DB] flex items-center">
                  <span className="w-[70px] md:w-[150px] text-[#6B7280] bg-gray-100 p-2 mr-2 rounded-l-lg">Title:</span>
                  <input
                    type="text"
                    value={newConversionPoint.title || ""}
                    onChange={(e) => {
                      setNewConversionPoint(prevPoint => ({
                        ...prevPoint,
                        title: e.target.value
                      }));
                      setTitleCharCount(e.target.value.length)
                    }}
                    maxLength={maxTitleLength}
                    placeholder="Enter conversion point title (e.g., Purchase an NFT)"
                    className="w-full outline-none p-2 rounded-r-lg"
                  />
                </div>
              </div>

              {/* Reward Amount for FixedAmount */}
              {newConversionPoint.paymentType === "FixedAmount" && (
                <div className="space-y-2">
                  <h3>Reward Amount <span className="text-red-500">*</span></h3>
                  <p className="text-gray-500 text-sm">
                    You can enter an integer or a value up to two decimal places. The value must be between 0.01 and 10000.
                  </p>
                  <div className="rounded-lg border border-[#D1D5DB] flex items-center">
                    <span className="w-[200px] md:w-[150px] text-[#6B7280] bg-gray-100 p-2 mr-2 rounded-l-lg">Token Units:</span>
                    <input
                      type="text" // Use text to handle intermediate states like "1." or ".0"
                      value={rewardAmountInput}
                      onChange={(e) => {
                        const value = e.target.value;
                      
                        // Allow only valid numeric input (including intermediate states like "1." or ".0")
                        if (/^\d*\.?\d{0,2}$/.test(value)) {
                          setRewardAmountInput(value); // Temporarily store the input as a string
                        }
                      }}
                      className="w-full outline-none pr-2"
                      placeholder="Enter token units"
                    />
                  </div>
                </div>
              )}

              {/* Revenue Share for RevenueShare */}
              {newConversionPoint.paymentType === "RevenueShare" && (
                <div className="space-y-2">
                  <h3>Revenue Share Percentage <span className="text-red-500">*</span></h3>
                  <p className="text-gray-500 text-sm">
                    Percentage an affiliate is paid for each purchase they refer. The value must be between 0.1 and 100.
                  </p>
                  <div className="rounded-lg border border-[#D1D5DB] flex items-center">
                    <span className="w-[150px] text-[#6B7280] bg-gray-100 p-2 mr-2 rounded-l-lg">Percentage:</span>
                    <input
                      type="number"
                      value={newConversionPoint.percentage?.toString() || ""}
                      onChange={(e) =>
                        // Limit input to one decimal place by rounding to the nearest tenth.
                        // For example, if the user enters 2.33, this will round and set it to 2.3.
                        setNewConversionPoint(prevPoint => ({
                          ...prevPoint,
                          percentage: Math.round(parseFloat(e.target.value) * 10) / 10
                        }))
                      }
                      className="w-full outline-none p-2 rounded-r-lg"
                      min="0.1"
                      max="100"
                      step="0.1"
                      placeholder="Enter percentage"
                    />
                  </div>
                </div>
              )}

              {/* Tier Management for Tiered */}
              {newConversionPoint.paymentType === "Tiered" && (
                <div className="space-y-2">
                  <h3>Tier Management <span className="text-red-500">*</span></h3>
                  <div className="flex flex-row items-center gap-3">
                    <div className="space-y-1 w-full">
                      <div className="flex flex-row border border-[#D1D5DB] rounded-lg">
                        <span className="text-[#6B7280] bg-gray-100 p-2 mr-2 rounded-l-lg whitespace-nowrap">CONVERSIONS REQUIRED:</span>
                        <input 
                          type="number" 
                          value={newConversionsRequired} 
                          onChange={e => setNewConversionsRequired(parseInt(e.target.value, 10))} 
                          placeholder="Conversions Required" 
                          className="w-full outline-none pr-2 rounded-r-lg"
                        />
                      </div>
                      <div className="flex flex-row border border-[#D1D5DB] rounded-lg">
                        <span className="text-[#6B7280] bg-gray-100 p-2 mr-2 rounded-l-lg whitespace-nowrap">REWARD AMOUNT:</span>
                        <input 
                          type="number" 
                          value={newTierRewardAmount} 
                          onChange={e => setNewTierRewardAmount(parseInt(e.target.value, 10))} 
                          placeholder="Reward Amount" 
                          className="w-full outline-none pr-2 rounded-r-lg" 
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddTier} 
                      className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                        isCheckingNewTierEntry ? "bg-gray-200" : "bg-slate-100 hover:bg-slate-200"
                      }`}
                      disabled={isCheckingNewTierEntry}
                    >
                      {isCheckingNewTierEntry ? (
                        <Image
                          src={"/assets/common/loading.png"}
                          height={30}
                          width={30}
                          alt="loading.png"
                          className="animate-spin mx-auto"
                        />
                      ) : (
                        "Add Reward Tier"
                      )}
                    </button>
                  </div>

                  {/* Tier Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Conversions Required</th>
                          <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Reward Amount</th>
                          <th className="px-6 py-3 bg-gray-50">Remove</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {tierEntries.length ? (
                          tierEntries.map((entry, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 overflow-hidden truncate">{entry.conversionsRequired}</td>
                              <td className="px-6 py-4 overflow-hidden truncate">{entry.rewardAmount}</td>
                              <td className="px-6 py-4 text-center">
                                <button onClick={() => handleRemoveTier(index)}>
                                  <Image 
                                    src="/assets/common/trash.png" 
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
                            <td colSpan={3} className="text-center py-4">No Reward Tier</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Add Conversion Point Button */}
              <button
                type="button"
                onClick={() => {
                  if (!conversionPoints || conversionPoints.length >= 10) {
                    toast.error("You can only add up to 10 conversion points.");
                    return;
                  }

                  if (!newConversionPoint.title?.trim()) {
                    toast.error("Please provide a valid title for the conversion point.");
                    return;
                  }

                  // Parse and validate reward amount for FixedAmount
                  let rewardAmount: number | null = null;
                  if (newConversionPoint.paymentType === "FixedAmount") {
                    rewardAmount = parseFloat(rewardAmountInput || ""); // Convert rewardAmountInput to number
                    if (isNaN(rewardAmount) || rewardAmount < 0.01 || rewardAmount > 10000) {
                      toast.error("Please provide a valid reward amount between 0.01 and 10000 for FixedAmount.");
                      return;
                    }
                  }

                  if (newConversionPoint.paymentType === "RevenueShare" && 
                      (!newConversionPoint.percentage || newConversionPoint.percentage < 0.1 || newConversionPoint.percentage > 100)) {
                    toast.error("Please provide a valid percentage between 0.1 and 100 for RevenueShare.");
                    return;
                  }

                  if (newConversionPoint.paymentType === "Tiered" && (!newConversionPoint.tiers || newConversionPoint.tiers.length === 0)) {
                    toast.error("Please provide at least one tier for Tiered.");
                    return;
                  }

                  const completeConversionPoint: ConversionPoint = {
                    id: generateSimpleAlphanumericId(),
                    title: newConversionPoint.title.trim(),
                    paymentType: newConversionPoint.paymentType as PaymentType,
                    ...(newConversionPoint.paymentType === "FixedAmount" && {
                      rewardAmount: rewardAmount!,
                    }),
                    ...(newConversionPoint.paymentType === "RevenueShare" && {
                      percentage: newConversionPoint.percentage!,
                    }),
                    ...(newConversionPoint.paymentType === "Tiered" && {
                      tiers: newConversionPoint.tiers!,
                    }),
                    isActive: false,
                  };

                  handleUpdateConversionPoints?.("add", completeConversionPoint);
                  setNewConversionPoint({
                    id: "",
                    title: "",
                    paymentType: "FixedAmount",
                    rewardAmount: 0,
                  });
                  setRewardAmountInput("0");
                  setTitleCharCount(0);
                  setTierEntries([]);
                }}
                className="w-full py-3 border border-black rounded transition-transform duration-300 hover:scale-105 bg-slate-100 hover:bg-slate-200"
              >
                Add Conversion Point
              </button>

            </div>
          </div>
        )}

        {/* Conversion Points List Section: Display list of added conversion points with actions for each entry */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Added Conversion Points</h2>
          <div className="border border-[#D1D5DB] rounded-lg divide-y divide-gray-300">
            {/* Check if there are any conversion points */}
            {conversionPoints.length > 0 ? (
              conversionPoints.map((point, index) => (
                <div key={index} className="flex justify-between items-center p-4">
                  {/* Conversion Point Details */}
                  <div>
                    <p className="font-semibold text-gray-900 truncate
                                  w-[230px] sm:w-[550px] md:w-[430px] lg:w-[680px] xl:w-[700px]">
                      {point.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {/* Display reward type and amount */}
                      {point.paymentType} :{" "}
                      {point.paymentType === "FixedAmount" && `${point.rewardAmount} Tokens`}
                      {point.paymentType === "RevenueShare" && `${point.percentage}%`}
                      {point.paymentType === "Tiered" && (
                        <span
                          className="hover:underline cursor-pointer"
                          onClick={() => point.tiers && openTierModal(point.tiers)}
                        >
                          {`${point.tiers?.length} Tiers`}
                          <Image
                            src="/assets/common/open-in-new-black.png"
                            alt="open-in-new-black icon"
                            width={14}
                            height={14}
                            className="inline-block mx-1"
                          />
                        </span>
                      )}
                      {/* Display and copy ID */}
                      {" / ID : "}
                      <span
                        className="hover:underline cursor-pointer"
                        onClick={() => copyToClipboard(
                          point.id,
                          "Copied to clipboard!",
                          "Failed to copy."
                        )}
                      >
                        {point.id}
                        <Image
                          src="/assets/common/content-copy-black.png"
                          alt="copy icon"
                          width={14}
                          height={14}
                          className="inline-block ml-1"
                        />
                      </span>
                    </p>
                  </div>

                  {/* Conditional rendering for toggle or delete action */}
                  {isEditing ? (
                    <ToggleButton 
                      isOn={point.isActive} 
                      onToggle={() => handleConversionPointToggle?.(point.id)} 
                    />
                  ) : (
                    <button
                      onClick={() => handleUpdateConversionPoints?.("remove", point)}
                      className="transition duration-300 ease-in-out transform hover:scale-125"
                    >
                      <Image 
                        src="/assets/common/trash.png" 
                        alt="trash icon" 
                        height={20} 
                        width={20} 
                      />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                {/* Display message if no conversion points are present */}
                No Conversion Points
              </div>
            )}
          </div>
        </div>

        {/* Redirect URL Section: Display and configure the redirect URL with validation */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">
            Redirect URL <span className="text-red-500">* </span>
          </h2>
          <p className="text-gray-500 text-sm">
            {/* Display editability status based on `isEditing` */}
            {isEditing ? "Not editable" : "Redirect URL cannot be edited after initial setup."}
          </p>

          {/* Input container with conditional styling for edit state */}
          <div
            className={`rounded-lg border border-[#D1D5DB] flex items-center ${isEditing ? "bg-gray-100" : ""}`}
          >
            {/* Label with conditional border for separation in editing mode */}
            <span className={`w-[150px] text-[#6B7280] bg-gray-100 p-2 mr-2 rounded-l-lg ${isEditing && "border-r"}`}>
              URL:
            </span>

            {/* Input field for redirect URL, with conditional styling for errors and edit state */}
            <input
              readOnly={isEditing}  // Make input read-only if editing is disabled
              type="url"
              value={redirectUrl}
              onChange={handleRedirectUrlChange}
              className={`w-full outline-none ${redirectUrlError ? "border-red-500" : ""} ${
                isEditing ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "text-black"
              }`}
              placeholder="Enter the redirect URL"
            />
          </div>

          {/* Error message display for invalid URLs */}
          {redirectUrlError && <p className="text-red-500 text-xs mt-1">{redirectUrlError}</p>}
        </div>

      </div>

      {/* Tier Modal Overlay and Content */}
      {isTierModalOpen && (
        <div className="fixed inset-0 -top-10 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          
          {/* Modal Container */}
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full">
            
            {/* Conditionally render TieredDetailsModal when selectedTierDetails exists */}
            {selectedTierDetails && (
              <TieredDetailsModal 
                tiers={selectedTierDetails} 
                closeModal={closeTierModal} 
              />
            )}
          </div>
        </div>
      )}

    </>
  );  
};