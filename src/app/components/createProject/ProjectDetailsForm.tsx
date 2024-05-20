import React from "react";
import Datepicker, { DateValueType } from "react-tailwindcss-datepicker";
import { NextButton } from "./NextButton";

type ProjectDetailsFormProps = {
  data: {
    projectName: string;
    description: string;
    totalSlots: number;
    totalBudget: number;
    deadline: Date | null;
  };
  handleChange: (field: string, isNumeric?: boolean) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleDateChange: (date: DateValueType) => void;
  nextStep?: () => void;
};

export const ProjectDetailsForm: React.FC<ProjectDetailsFormProps> = ({
  data,
  handleChange,
  handleDateChange,
  nextStep,
}) => {
  const isFormComplete = () => {
    return (
      data.projectName.trim() !== "" &&
      data.description.trim() !== "" &&
      data.totalSlots > 0 &&
      data.totalBudget > 0 &&
      data.deadline !== null
    );
  };

  // Set tomorrow's date as the minimum date for the datepicker
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get the user's local timezone and UTC offset
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const userUTCOffset = new Date().toLocaleTimeString("en-us",{timeZoneName:"short"}).split(" ")[2];

  return (
    <div className="bg-white rounded-lg shadow-md p-5 mt-10 text-sm">

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
          <h2>Description <span className="text-red-500">*</span></h2>
          <textarea
            value={data.description}
            onChange={handleChange("description")}
            className="w-full outline-none p-2 border border-[#D1D5DB] rounded-lg h-24"
            placeholder="BAYC is a collection of 10,000 Bored Ape NFTs — unique digital collectibles living on the Ethereum blockchain."
          />
        </div>

        <div className="flex flex-col gap-2">
          <h2>Total Slots <span className="text-red-500">*</span></h2>
          <input
            type="number"
            value={data.totalSlots || ""}
            onChange={handleChange("slots.total", true)}
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "+" || e.key === "e") {
                e.preventDefault();
              }
            }}
            placeholder="0"
            min="1"
            className="w-full p-2 border border-[#D1D5DB] rounded-lg text-sm outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <h2>Total Budget <span className="text-red-500">*</span></h2>
          <input
            type="number"
            value={data.totalBudget || ""}
            onChange={handleChange("budget.total", true)}
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "+" || e.key === "e") {
                e.preventDefault();
              }
            }}
            placeholder="0"
            min="1"
            className="w-full p-2 border border-[#D1D5DB] rounded-lg text-sm outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <h2>Deadline (Time Zone: {userTimeZone} {userUTCOffset}) <span className="text-red-500">*</span></h2>
          <p className="text-gray-500 text-sm">
            The deadline will automatically be set to 23:59:59 of the selected day.
          </p>
          <Datepicker
            primaryColor={"sky"} 
            value={{startDate: data.deadline, endDate: data.deadline}}
            onChange={handleDateChange}
            asSingle={true}
            useRange={false}
            minDate={tomorrow}
            inputClassName="w-full p-2 border border-[#D1D5DB] rounded-lg text-sm outline-none"
          />
        </div>

      </div>

      {nextStep && <NextButton onClick={() => isFormComplete() && nextStep()} disabled={!isFormComplete()} />}

    </div>
  );
};