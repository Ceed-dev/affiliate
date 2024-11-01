import React, { useState } from "react";

type GeneralFormProps = {
  projectName: string;
  description: string;
  handleChange: (
    field: "projectName" | "description",
    isNumeric?: boolean
  ) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

/**
 * GeneralForm component displays and manages input fields for the project's general information.
 * It includes fields for project name and description, with character counters and limits.
 */
export const GeneralForm: React.FC<GeneralFormProps> = ({
  projectName,
  description,
  handleChange,
}) => {
  const maxTitleLength = 50;
  const maxDescLength = 500;

  // State to track the number of characters in the project name and description fields
  const [titleCharCount, setTitleCharCount] = useState(projectName.length);
  const [descCharCount, setDescCharCount] = useState(description.length);

  return (
    <>
      <h1 className="text-2xl font-bold">General</h1>

      <div className="space-y-5">

        {/* Project Name Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="projectName">
              Project name <span className="text-red-500">*</span>
            </label>
            <p className={`text-sm ${titleCharCount >= maxTitleLength ? "text-red-500" : "text-gray-500"}`}>
              {titleCharCount}/{maxTitleLength}
              {titleCharCount >= maxTitleLength && <span className="ml-2">Character limit reached</span>}
            </p>
          </div>
          <input
            id="projectName"
            type="text"
            value={projectName}
            onChange={(e) => {
              handleChange("projectName")(e);
              setTitleCharCount(e.target.value.length);
            }}
            maxLength={maxTitleLength}
            className="w-full p-2 border border-gray-300 rounded-lg outline-none"
            placeholder="Enter project name"
          />
        </div>

        {/* Description Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </label>
            <p className={`text-sm ${descCharCount >= maxDescLength ? "text-red-500" : "text-gray-500"}`}>
              {descCharCount}/{maxDescLength}
              {descCharCount >= maxDescLength && <span className="ml-2">Character limit reached</span>}
            </p>
          </div>
          <textarea
            id="description"
            value={description}
            onChange={(e) => {
              handleChange("description")(e);
              setDescCharCount(e.target.value.length);
            }}
            maxLength={maxDescLength}
            className="w-full p-2 border border-gray-300 rounded-lg outline-none h-24"
            placeholder="BAYC is a collection of 10,000 Bored Ape NFTs — unique digital collectibles living on the Ethereum blockchain."
          />
        </div>

      </div>

    </>
  );
};