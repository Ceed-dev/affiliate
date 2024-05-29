import React from "react";
import Datepicker, { DateValueType } from "react-tailwindcss-datepicker";
import { NextButton } from "./NextButton";
import { ProjectType } from "../../types";

type ProjectDetailsFormProps = {
  data: {
    projectType: ProjectType;
    projectName: string;
    description: string;
    totalSlots?: number;
    remainingSlots?: number;
    totalBudget?: number;
    remainingBudget?: number;
    deadline?: Date | null;
  };
  handleChange: (field: string, isNumeric?: boolean) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleDateChange?: (date: DateValueType) => void;
  nextStep?: () => void;
};

export const ProjectDetailsForm: React.FC<ProjectDetailsFormProps> = ({
  data,
  handleChange,
  handleDateChange,
  nextStep,
}) => {
  const isEditing = nextStep === undefined;

  const isFormComplete = () => {
    if (data.projectType === "DirectPayment") {
      const baseComplete =
        data.projectName.trim() !== "" &&
        data.description.trim() !== "" &&
        data.totalSlots !== undefined &&
        data.totalSlots > 0 &&
        data.totalBudget !== undefined &&
        data.totalBudget > 0 &&
        data.deadline !== null;

      if (isEditing) {
        return (
          baseComplete &&
          data.remainingSlots !== undefined &&
          data.remainingBudget !== undefined
        );
      }
      return baseComplete;
    } else {
      return (
        data.projectName.trim() !== "" &&
        data.description.trim() !== ""
      );
    }
  };

  const tomorrow = new Date();
  let userTimeZone = "";
  let userUTCOffset = "";

  if (data.projectType === "DirectPayment") {
    tomorrow.setDate(tomorrow.getDate() + 1);
    userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    userUTCOffset = new Date().toLocaleTimeString("en-us", { timeZoneName: "short" }).split(" ")[2];
  }

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

        {data.projectType === "DirectPayment" && (
          <>
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

            {isEditing && (
              <div className="flex flex-col gap-2">
                <h2>Remaining Slots <span className="text-red-500">*</span></h2>
                <input
                  type="number"
                  value={data.remainingSlots || 0}
                  onChange={handleChange("slots.remaining", true)}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "+" || e.key === "e") {
                      e.preventDefault();
                    }
                  }}
                  placeholder="0"
                  min="0"
                  className="w-full p-2 border border-[#D1D5DB] rounded-lg text-sm outline-none"
                />
              </div>
            )}

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

            {isEditing && (
              <div className="flex flex-col gap-2">
                <h2>Remaining Budget <span className="text-red-500">*</span></h2>
                <input
                  type="number"
                  value={data.remainingBudget || 0}
                  onChange={handleChange("budget.remaining", true)}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "+" || e.key === "e") {
                      e.preventDefault();
                    }
                  }}
                  placeholder="0"
                  min="0"
                  className="w-full p-2 border border-[#D1D5DB] rounded-lg text-sm outline-none"
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <h2>Deadline (Time Zone: {userTimeZone} {userUTCOffset}) <span className="text-red-500">*</span></h2>
              <p className="text-gray-500 text-sm">
                The deadline will automatically be set to 23:59:59 of the selected day.
              </p>
              <Datepicker
                primaryColor={"sky"} 
                value={{startDate: data.deadline ?? null, endDate: data.deadline ?? null}}
                onChange={handleDateChange ?? (() => {})}
                asSingle={true}
                useRange={false}
                minDate={tomorrow}
                inputClassName="w-full p-2 border border-[#D1D5DB] rounded-lg text-sm outline-none"
              />
            </div>
          </>
        )}

      </div>

      {nextStep && <NextButton onClick={() => isFormComplete() && nextStep()} disabled={!isFormComplete()} />}

    </div>
  );
};