import React from "react";
import { StatusStep } from "./StatusStep";
import { projectCreationSteps } from "../../../constants/projectCreationSteps";
import { ProjectType } from "../../../types";

export const getSteps = (projectType: ProjectType | null) => {
  if (!projectType || projectType === "EscrowPayment") {
    return projectCreationSteps;
  } else {
    return projectCreationSteps.filter(step => step !== "Media");
  }
};

type StatusBarProps = {
  currentStep: number;
  projectType: ProjectType | null;
}

export const StatusBar: React.FC<StatusBarProps> = ({ currentStep, projectType }) => {
  return (
    <div className="overflow-x-auto">
      <div className="flex flex-row justify-between border-b-2 border-gray-300 py-2 px-5 md:px-20 min-w-[max-content]">
        {getSteps(projectType).map((step, index) => (
          <StatusStep key={index} number={index + 1} step={step} currentStep={currentStep} />
        ))}
      </div>
    </div>
  );
}