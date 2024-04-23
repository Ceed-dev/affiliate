import React from "react";
import { NextButton } from "./NextButton";
import { tokenOptions } from "../../constants/tokenOptions";
import { DepositButton } from "../DepositButton";

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