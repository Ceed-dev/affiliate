import React from "react";
import Image from "next/image";

type StepComponentProps = {
  number: number;
  step: string;
  currentStep: number;
};

export const StepComponent: React.FC<StepComponentProps> = ({ number, step, currentStep }) => {
  let textStyle = "text-black text-sm";
  if (number > currentStep) {
    textStyle = "text-gray-500 text-sm";
  } else if (number === currentStep) {
    textStyle = "text-blue-700 font-semibold text-sm";
  }

  return (
    <div className="flex flex-row items-center gap-5">
      {number > 1 && 
        <Image src="/status-arrow.png" height={20} width={20} alt="status-arrow.png" />
      }
      {number < currentStep 
        ? <div className="w-[40px] h-[40px] bg-blue-500 rounded-full flex justify-center items-center animate-checkmarkAppear">
            <Image src="/checkmark.png" width={15} height={15} alt="checkmark.png" />
          </div>
        : <div className={`border-2 ${number > currentStep ? "border-gray-500 text-gray-500" : "border-blue-500 text-blue-500 animate-bounce"} rounded-full w-[40px] h-[40px] flex justify-center items-center`}>
            {number}
          </div>
      }
      <p className={textStyle}>{step}</p>
    </div>
  );
}