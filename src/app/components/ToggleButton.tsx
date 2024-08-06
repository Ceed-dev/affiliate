import React from "react";

type ToggleButtonProps = {
  isOn: boolean;
  onToggle: (value: boolean) => void;
  disabled?: boolean;
};

export const ToggleButton: React.FC<ToggleButtonProps> = ({ isOn, onToggle, disabled = false }) => {
  return (
    <button
      onClick={() => !disabled && onToggle(!isOn)}
      disabled={disabled}
      className={`relative inline-flex items-center h-6 rounded-full w-11 focus:outline-none ${
        isOn ? "bg-green-500" : "bg-gray-300"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`transform transition-transform duration-200 ease-in-out ${
          isOn ? "translate-x-5" : "translate-x-1"
        } inline-block w-5 h-5 rounded-full bg-white`}
      />
    </button>
  );
};
