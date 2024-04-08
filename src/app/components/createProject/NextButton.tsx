import React from "react";

type NextButtonProps = {
  onClick: () => void; 
};

export const NextButton: React.FC<NextButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-sky-500 text-white mt-4 py-2 w-full rounded hover:bg-sky-700 transition-transform duration-300 hover:scale-105"
    >
      Next
    </button>
  );
};