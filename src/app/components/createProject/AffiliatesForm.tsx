import React from "react";
import { ethers } from "ethers";
import { NextButton } from "./NextButton";
import { tokenOptions } from "../../constants/tokenOptions";
import { erc20ABI } from "../../constants/erc20Abi";
import { escrowABI } from "../../constants/escrowAbi";

const DepositButton = () => {
  const tokenAddress = "0x9b5f49000d02479d1300e041fff1d74f49588749";
  const escrowAddress = "0x0CF4afA255F208DF4846b324c3e6b5A1E1e6A534";

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, signer);
  const escrowContract = new ethers.Contract(escrowAddress, escrowABI, signer);

  const approveToken = async (amount: number) => {
    try {
      const beforeAllowance = await tokenContract.allowance(await signer.getAddress(), escrowAddress);
      console.log(`Current allowance before is ${ethers.utils.formatUnits(beforeAllowance, 6)} tokens.`);

      const txResponse = await tokenContract.approve(escrowAddress, ethers.utils.parseUnits(amount.toString(), 6));
      await txResponse.wait();

      const afterAllowance = await tokenContract.allowance(await signer.getAddress(), escrowAddress);
      console.log(`Current allowance after is ${ethers.utils.formatUnits(afterAllowance, 6)} tokens.`);
    } catch (error) {
      console.error('Approval failed:', error);
      alert('Approval failed. See console for more details.');
      throw error; // Stop the execution if approval fails
    }
  };

  const depositTokens = async (amount: number) => {
    try {
      const formattedAmount = ethers.utils.parseUnits(amount.toString(), 6);
      const txResponse = await escrowContract.deposit(tokenAddress, formattedAmount);
      const receipt = await txResponse.wait();
      console.log('Deposit transaction receipt:', receipt);
      alert('Deposit successful!');
    } catch (error) {
      console.error('Deposit failed:', error);
      alert('Deposit failed. See console for more details.');
    }
  };

  const handleDeposit = async () => {
    const amount = 100;
    await approveToken(amount);
    await depositTokens(amount);
  };

  return (
    <button
      onClick={handleDeposit}
      className="w-2/3 mx-auto h-12 bg-sky-500 text-white rounded-lg p-2 outline-none transition duration-300 ease-in-out transform hover:scale-105"
      type="button"
    >
      Deposit to Escrow
    </button>
  );
}

type AffiliatesFormProps = {
  data: {
    selectedToken: string;
    rewardAmount: number;
    redirectUrl: string;
  };
  handleChange: (field: string, isNumeric?: boolean) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  nextStep: () => void;
};

export const AffiliatesForm: React.FC<AffiliatesFormProps> = ({
  data,
  handleChange,
  nextStep
}) => {
  const isFormComplete = data.selectedToken.trim() && data.rewardAmount > 0 && data.redirectUrl.trim();

  return (
    <div className="bg-white w-2/5 rounded-lg shadow-md p-5 mx-auto mt-10 text-sm">

      <h1 className="text-xl mb-5">Affiliates</h1>

      <div className="flex flex-col gap-5">
        
        <div className="flex flex-col gap-2">
          <h2>Token <span className="text-red-500">*</span></h2>
          <select
            value={data.selectedToken}
            onChange={handleChange("selectedToken")}
            className="w-full p-2 border border-[#D1D5DB] rounded-lg outline-none"
          >
            {tokenOptions.map((token, index) => (
              <option key={index} value={token}>
                {token}
              </option>
            ))}
          </select>
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

        <div className="flex flex-col gap-2">
          <h2>Initial Deposit</h2>
          <DepositButton />
        </div>
      </div>

      <NextButton onClick={() => isFormComplete && nextStep()} disabled={!isFormComplete} />

    </div>
  );
};