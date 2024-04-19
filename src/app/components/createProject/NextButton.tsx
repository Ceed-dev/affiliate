import React from "react";

type NextButtonProps = {
  onClick: () => void; 
  disabled: boolean;
  children?: React.ReactNode;
};

export const NextButton: React.FC<NextButtonProps> = ({ onClick, disabled, children = "Next" }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${disabled ? "bg-gray-300" : "bg-sky-500 hover:scale-105 hover:bg-sky-700"} text-white mt-4 py-2 w-full rounded transition-transform duration-300`}
    >
      {children}
    </button>
  );
};