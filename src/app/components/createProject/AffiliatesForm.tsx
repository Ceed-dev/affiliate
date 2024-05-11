import React, { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { NextButton } from "./NextButton";
import { initializeSigner, ERC20 } from "../../utils/contracts";
import { formatBalance } from "../../utils/formatters";

type AffiliatesFormProps = {
  data: {
    selectedTokenAddress: string;
    rewardAmount: number;
    redirectUrl: string;
  };
  handleChange: (field: string, isNumeric?: boolean) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  nextStep?: () => void;
  isSaving?: boolean;
  hideButton?: boolean;
  status?: string;
};

export const AffiliatesForm: React.FC<AffiliatesFormProps> = ({
  data,
  handleChange,
  nextStep,
  isSaving,
  hideButton,
  status
}) => {
  const isEditing = nextStep === undefined;
  const isFormComplete = data.selectedTokenAddress.trim() && data.rewardAmount > 0 && data.redirectUrl.trim();

  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenBalance, setTokenBalance] = useState("");
  const [tokenAllowance, setTokenAllowance] = useState("");
  const [isFetchingTokenDetails, setIsFetchingTokenDetails] = useState(false);

  const initializeTokenStates = () => {
    setTokenSymbol("");
    setTokenBalance("");
    setTokenAllowance("");
  };

  useEffect(() => {
    const fetchTokenDetails = async () => {
      if (data.selectedTokenAddress) {
        setIsFetchingTokenDetails(true);
        try {
          const signer = initializeSigner();
          const erc20 = new ERC20(data.selectedTokenAddress, signer);
          const symbol = await erc20.getSymbol();
          const balance = await erc20.getBalance(await signer.getAddress());
          const allowance = await erc20.getAllowance(await signer.getAddress(), `${process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS}`);

          setTokenSymbol(symbol);
          setTokenBalance(balance);
          setTokenAllowance(allowance);

          console.log(JSON.stringify({
            "Address" : data.selectedTokenAddress,
            "Symbol" : symbol,
            "Balance" : balance,
            "Allowance" : allowance,
          }, null, 2));
        } catch (error: any) {
          console.error(`Error fetching token details: ${error.message}`);
          toast.error(`Error fetching token details: ${error.message}`);
          initializeTokenStates();
        }
        setIsFetchingTokenDetails(false);
      } else {
        initializeTokenStates();
      }
    };

    fetchTokenDetails();
  }, [data.selectedTokenAddress]);

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
            onChange={handleChange("selectedTokenAddress")}
            placeholder="Enter token contract address"
            className={`w-full p-2 border border-[#D1D5DB] rounded-lg outline-none ${isEditing ? "bg-gray-100 text-gray-500" : "bg-white text-black"}`}
          />
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

        <div className="flex flex-col gap-2">
          <h2>Reward Amount <span className="text-red-500">*</span></h2>
          <div className="rounded-lg border border-[#D1D5DB] flex items-center">
            <span className="w-[150px] text-[#6B7280] bg-gray-100 p-2 mr-1">
              Token Units:
            </span>
            <input
              type="number"
              value={data.rewardAmount.toString()}
              onChange={handleChange("rewardAmount", true)}
              className="w-full outline-none"
              min="1"
              step="1"
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

      </div>

      {nextStep && !hideButton &&
        <NextButton onClick={() => isFormComplete && nextStep()} disabled={!isFormComplete || (isSaving ?? true)} >
          <div className="flex flex-row items-center justify-center gap-5">
            {isSaving && <Image src={"/loading.png"} height={30} width={30} alt="loading.png" className="animate-spin" />}
            {status}
          </div>
        </NextButton>
      }

    </div>
  );
};