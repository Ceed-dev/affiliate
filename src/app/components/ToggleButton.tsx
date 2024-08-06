import React from "react";

type ToggleButtonProps = {
  isOn: boolean;
  onToggle: () => void;
};

export const ToggleButton: React.FC<ToggleButtonProps> = ({ isOn, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex items-center h-6 rounded-full w-11 focus:outline-none ${
        isOn ? "bg-green-500" : "bg-gray-300"
      }`}
    >
      <span
        className={`transform transition-transform duration-200 ease-in-out ${
          isOn ? "translate-x-5" : "translate-x-1"
        } inline-block w-5 h-5 rounded-full bg-white`}
      />
    </button>
  );
};
