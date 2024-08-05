import React from "react";

type ButtonProps = {
  onClick: () => void; 
  disabled: boolean;
  color?: string;
  children?: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  disabled = false, 
  color = "sky", 
  children = "Next" 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${disabled ? "bg-gray-300" : `bg-${color}-500 hover:bg-${color}-700 hover:scale-105`} text-white mt-4 py-2 w-full rounded transition-transform duration-300`}
    >
      {children}
    </button>
  );
};