/**
 * Dropdown Component
 * 
 * This component provides a dropdown menu with support for single or multiple selection. 
 * It allows dynamic configuration of options and includes features like an "All" selector for 
 * multiple selection mode and customizable dropdown direction.
 * 
 * Props:
 * - options: Array of string options to display in the dropdown.
 * - selectedValues: The currently selected value(s) (string for single, string[] for multiple).
 * - setSelectedValues: Callback function to update the selected values.
 * - allowMultiple: Optional flag to enable multiple selection. Default is `false`.
 * - direction: Optional dropdown direction ("up" or "down"). Default is `"down"`.
 */

import React, { useState } from "react";

type DropdownProps = {
  options: string[]; // List of options to display in the dropdown
  selectedValues: string | string[]; // Current selected values (single or multiple)
  setSelectedValues: (values: string | string[]) => void; // Callback to update the selected values
  allowMultiple?: boolean; // Enable multiple selection mode
  direction?: "up" | "down"; // Dropdown open direction ("up" or "down")
  maxHeight?: number; // Maximum height of the dropdown (default: 240)
};

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  selectedValues,
  setSelectedValues,
  allowMultiple = false,
  direction = "down",
  maxHeight = 240,
}) => {
  // Manage the dropdown open/close state
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Check if a value is selected
   * - For multiple selection, checks if the value exists in the array.
   * - For single selection, checks if the value matches the selected value.
   */
  const isSelected = (value: string) =>
    Array.isArray(selectedValues)
      ? selectedValues.includes(value)
      : selectedValues === value;

  /**
   * Handle selection of a value
   * - For multiple selection, toggles the value in the selected array.
   * - For single selection, sets the selected value and closes the dropdown.
   * - Special handling for "All" selection in multiple selection mode.
   */
  const handleSelect = (value: string) => {
    if (allowMultiple) {
      if (value === "All") {
        // Toggle all options on "All" selection
        if (Array.isArray(selectedValues) && selectedValues.length === options.length) {
          setSelectedValues([]); // Deselect all
        } else {
          setSelectedValues(options); // Select all
        }
      } else {
        // Toggle individual values
        if (Array.isArray(selectedValues) && isSelected(value)) {
          const updatedValues = selectedValues.filter((r) => r !== value);
          setSelectedValues(updatedValues);
        } else {
          setSelectedValues(
            Array.isArray(selectedValues)
              ? [...selectedValues, value]
              : [value]
          );
        }
      }
    } else {
      // For single selection, update the value and close the dropdown
      setSelectedValues(value);
      setIsOpen(false);
    }
  };

  // Determine if all options are selected (for "All" checkbox)
  const allSelected =
    Array.isArray(selectedValues) &&
    selectedValues.length === options.length;

  return (
    <div className="relative">
      {/* Dropdown toggle button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full p-2 bg-transparent border border-[#D9D9D9] rounded-lg text-sm flex items-center justify-between focus:outline-none"
      >
        {/* Display selected values or placeholder */}
        <span
          className="truncate max-w-[85%] overflow-hidden text-ellipsis"
          title={
            Array.isArray(selectedValues)
              ? selectedValues.join(", ")
              : typeof selectedValues === "string"
              ? selectedValues
              : "Select an option"
          }
        >
          {Array.isArray(selectedValues) && selectedValues.length > 0
            ? selectedValues.join(", ")
            : typeof selectedValues === "string" && selectedValues
            ? selectedValues
            : "Select an option"}
        </span>
        {/* Arrow icon indicating dropdown state */}
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown options */}
      {isOpen && (
        <ul
          className={`absolute z-10 w-full bg-white border border-[#D9D9D9] rounded-lg shadow-md max-h-48 overflow-y-auto ${
            direction === "up" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
          style={{ maxHeight: `${maxHeight}px`, overflowY: "auto" }}
        >
          {/* "All" option for multiple selection */}
          {allowMultiple && (
            <li
              onClick={() => handleSelect("All")}
              className={`p-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center gap-2 ${
                allSelected ? "bg-gray-200 font-bold" : ""
              }`}
            >
              <span
                className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                  allSelected ? "bg-black text-white" : "border-gray-400"
                }`}
              >
                {allSelected && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-3 h-3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </span>
              All
            </li>
          )}
          {/* Individual options */}
          {options.map((option, index) => (
            <li
              key={index}
              onClick={() => handleSelect(option)}
              className={`p-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center gap-2 ${
                isSelected(option) ? "bg-gray-200 font-bold" : ""
              }`}
            >
              <span
                className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                  isSelected(option) ? "bg-black text-white" : "border-gray-400"
                }`}
              >
                {isSelected(option) && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-3 h-3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </span>
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};