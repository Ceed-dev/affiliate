import React from "react";

import { StatusStep } from "./StatusStep";
import { steps } from "../../../constants/stepts";

type StatusBarProps = {
  currentStep: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({ currentStep }) => {
  return (
    <div className="flex flex-row justify-between border-b-2 border-gray-300 py-2 px-5 md:px-20">
      {steps.map((step, index) => (
        <StatusStep key={index} number={index + 1} step={step} currentStep={currentStep} />
      ))}
    </div>
  );
}