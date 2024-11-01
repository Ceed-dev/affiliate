import React from "react";

// Props for the SaveButton component
type SaveButtonProps = {
  onClick: () => void;  // Function to handle button click event
  children: React.ReactNode; // Custom text or elements to display within the button
  disabled?: boolean;   // Optional flag to disable the button
};

/**
 * SaveButton Component
 * A reusable button component styled for a save action.
 * - Displays customizable text via children prop.
 * - When disabled, shows a grayed-out style and disables the click event.
 * - Has a hover effect that slightly scales the button and changes the background color.
 *
 * @param {SaveButtonProps} props - The props for the SaveButton component.
 * @returns {JSX.Element} - The SaveButton element.
 */
export const SaveButton: React.FC<SaveButtonProps> = ({ 
  onClick, 
  children,
  disabled = false, 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-3 rounded font-bold transition-transform duration-300 ${
        disabled 
          ? "bg-gray-300 cursor-not-allowed" 
          : "text-white bg-slate-800 hover:bg-slate-900 hover:scale-105"
      }`}
    >
      {children}
    </button>
  );
};