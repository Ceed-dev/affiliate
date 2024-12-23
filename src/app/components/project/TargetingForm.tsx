import React from "react";
import { Dropdown } from "../common/Dropdown";
import { countries } from "../../constants/targetingOptions";

type TargetingFormProps = {
  selectedCountries: string[];
  setSelectedCountries?: React.Dispatch<React.SetStateAction<string[]>>;
  isEditing?: boolean;
};

/**
 * TargetingForm component displays and manages input fields for the project's targeting settings.
 * Initially includes a "Country" selection field with options provided in the `countries` constant.
 * Allows switching to a read-only mode if `isEditing` is false.
 */
export const TargetingForm: React.FC<TargetingFormProps> = ({
  selectedCountries,
  setSelectedCountries,
  isEditing = false,
}) => {
  return (
    <>
      <h1 className="text-2xl font-bold">Targeting</h1>

      <div className="space-y-5">

        {/* Country Selection */}
        <div className="space-y-2">
          <label htmlFor="country">
            Country <span className="text-red-500">*</span>
          </label>
          <p className="text-sm text-gray-500">
            Country cannot be edited after initial setup.
          </p>
          {isEditing ? (
            <div className="p-2 border border-[#D1D5DB] rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed">
              {selectedCountries.length > 0
                ? selectedCountries.join(", ")
                : "No countries selected"}
            </div>
          ) : (
            <Dropdown
              options={countries}
              selectedValues={selectedCountries}
              setSelectedValues={(countries) => setSelectedCountries!(countries as string[])}
              allowMultiple={true}
              direction="up"
              maxHeight={400}
            />
          )}
        </div>

      </div>
    </>
  );
};