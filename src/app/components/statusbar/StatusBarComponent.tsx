import React from "react";

import { StepComponent } from "./StepComponent";
import { steps } from "../../constants/stepts";

type StatusBarComponentProps = {
  currentStep: number;
}

export const StatusBarComponent: React.FC<StatusBarComponentProps> = ({ currentStep }) => {
  return (
    <div className="flex flex-row justify-between border-b-2 border-gray-300 py-2 px-20">
      {steps.map((step, index) => (
        <StepComponent key={index} number={index + 1} step={step} currentStep={currentStep} />
      ))}
    </div>
  );
}