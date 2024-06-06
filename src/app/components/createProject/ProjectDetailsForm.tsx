import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAddress } from "@thirdweb-dev/react";
import Datepicker, { DateValueType } from "react-tailwindcss-datepicker";
import { NextButton } from "./NextButton";
import { ProjectType } from "../../types";
import { isAddress } from "ethers/lib/utils";
import { toast } from "react-toastify";

type ProjectDetailsFormProps = {
  data: {
    projectType: ProjectType;
    projectName: string;
    description: string;
    ownerAddresses: string[];
    totalSlots?: number;
    remainingSlots?: number;
    totalBudget?: number;
    remainingBudget?: number;
    deadline?: Date | null;
  };
  handleChange: (field: string, isNumeric?: boolean) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleOwnerChange: (newOwnerAddresses: string[]) => void;
  handleDateChange?: (date: DateValueType) => void;
  nextStep?: () => void;
};

export const ProjectDetailsForm: React.FC<ProjectDetailsFormProps> = ({
  data,
  handleChange,
  handleOwnerChange,
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

  // ===== BEGIN OWNER MANAGEMENT =====
  const address = useAddress();
  const [ownerAddresses, setOwnerAddresses] = useState<string[]>(data.ownerAddresses || []);
  const [newOwnerAddress, setNewOwnerAddress] = useState("");

  useEffect(() => {
    if (address && ownerAddresses.length === 0) {
      const initialOwners = [address];
      setOwnerAddresses(initialOwners);
      handleOwnerChange(initialOwners);
    }
  }, [address, ownerAddresses.length, handleOwnerChange]);

  const handleAddOwner = () => {
    if (!isAddress(newOwnerAddress)) {
      setNewOwnerAddress("");
      toast.error("Invalid wallet address.");
      return;
    }

    if (ownerAddresses.includes(newOwnerAddress)) {
      setNewOwnerAddress("");
      toast.error("Address already exists.");
      return;
    }

    const updatedOwners = [...ownerAddresses, newOwnerAddress];
    setOwnerAddresses(updatedOwners);
    handleOwnerChange(updatedOwners);
    setNewOwnerAddress("");
    toast.success("Owner added successfully.");
  };

  const handleRemoveOwner = (address: string) => {
    const updatedOwners = ownerAddresses.filter(owner => owner !== address);
    setOwnerAddresses(updatedOwners);
    handleOwnerChange(updatedOwners);
    toast.success("Owner removed successfully.");
  };
  // ===== END OWNER MANAGEMENT =====

  return (
    <div className="bg-white rounded-lg shadow-md p-5 my-10 text-sm">

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

        <div className="flex flex-col gap-2">
          <h2>Project Owners</h2>
          <div className="flex items-center mb-2">
            <input
              type="text"
              value={newOwnerAddress}
              onChange={(e) => setNewOwnerAddress(e.target.value)}
              placeholder="Enter owner wallet address"
              className="w-full p-2 border border-[#D1D5DB] rounded-lg text-sm outline-none"
            />
            <button
              type="button"
              onClick={handleAddOwner}
              className="ml-2 bg-green-500 hover:bg-green-700 text-white py-2 px-7 rounded"
            >
              Add
            </button>
          </div>
          {ownerAddresses.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full mt-2 border-collapse">
                <thead>
                  <tr>
                    <th className="border border-[#D1D5DB] p-2">Wallet Address</th>
                    <th className="border border-[#D1D5DB] p-2">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {ownerAddresses.map((address, index) => (
                    <tr key={index}>
                      <td className="border border-[#D1D5DB] p-2">
                        {address}
                        {address === useAddress() && (
                          <span className="text-gray-500 ml-2">(Your wallet address, automatically added as project owner)</span>
                        )}
                      </td>
                      <td className="border border-[#D1D5DB] p-2 text-center">
                        {address === useAddress() ? (
                          <button
                            type="button"
                            className="bg-gray-300 text-white p-2 rounded cursor-not-allowed"
                            disabled
                          >
                            <Image
                              src="/trash.png"
                              alt="trash.png"
                              height={20}
                              width={20}
                              className="transition duration-300 ease-in-out transform"
                            />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRemoveOwner(address)}
                            className="bg-red-200 hover:bg-red-300 text-white p-2 rounded transition duration-300 ease-in-out transform hover:scale-105"
                          >
                            <Image
                              src="/trash.png"
                              alt="trash.png"
                              height={20}
                              width={20}
                              className="transition duration-300 ease-in-out transform"
                            />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {nextStep && <NextButton onClick={() => isFormComplete() && nextStep()} disabled={!isFormComplete()} />}

    </div>
  );
};