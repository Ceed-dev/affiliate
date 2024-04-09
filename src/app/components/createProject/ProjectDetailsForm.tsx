import React from "react";

import { NextButton } from "./NextButton";

type ProjectDetailsFormProps = {
  data: {
    projectName: string;
    slug: string;
    description: string;
  };
  handleChange: (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  nextStep: () => void;
};

export const ProjectDetailsForm: React.FC<ProjectDetailsFormProps> = ({
  data,
  handleChange,
  nextStep
}) => {
  return (
    <div className="bg-white w-2/5 rounded-lg shadow-md p-5 mx-auto mt-10 text-sm">

      <h1 className="text-xl mb-5">Project Details</h1>

      <div className="flex flex-col gap-5">

        <div className="flex flex-col gap-2">
          <h2>Project name <span className="text-red-500">*</span></h2>
          <input
            type="text"
            value={data.projectName}
            onChange={handleChange("projectName")}
            className="w-full p-2 border border-[#D1D5DB] rounded-lg text-sm outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <h2>Slug <span className="text-red-500">*</span></h2>
          <div className="rounded-lg border border-[#D1D5DB] flex items-center">
            <span className="text-[#6B7280] bg-gray-100 p-2 mr-1">
              https://www.0xqube.xyz/
            </span>
            <input
              type="text"
              value={data.slug}
              onChange={handleChange("slug")}
              className="w-full outline-none text-sm"
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <h2>Description <span className="text-red-500">*</span></h2>
          <textarea
            value={data.description}
            onChange={handleChange("description")}
            className="w-full outline-none p-2 border border-[#D1D5DB] rounded-lg h-24"
            placeholder="BAYC is a collection of 10,000 Bored Ape NFTs — unique digital collectibles living on the Ethereum blockchain."
          />
        </div>

      </div>

      <NextButton onClick={nextStep} />

    </div>
  );
};