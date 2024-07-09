import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAddress } from "@thirdweb-dev/react";
import Datepicker, { DateValueType } from "react-tailwindcss-datepicker";
import { NextButton } from "./NextButton";
import { ProjectType } from "../../types";
import { checkUserRole } from "../../utils/firebase";
import { isEOA } from "../../utils/contracts";
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
  const address = useAddress();

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
  const [ownerAddresses, setOwnerAddresses] = useState<string[]>(data.ownerAddresses || []);
  const [newOwnerAddress, setNewOwnerAddress] = useState("");
  const [isCheckingNewOwnerAddress, setIsCheckingNewOwnerAddress] = useState(false);

  useEffect(() => {
    if (address && ownerAddresses.length === 0) {
      const initialOwners = [address];
      setOwnerAddresses(initialOwners);
      handleOwnerChange(initialOwners);
    }
  }, [address, ownerAddresses.length, handleOwnerChange]);

  const handleAddOwner = async () => {
    setIsCheckingNewOwnerAddress(true);

    if (!isAddress(newOwnerAddress)) {
      setNewOwnerAddress("");
      toast.error("Invalid wallet address.");
      setIsCheckingNewOwnerAddress(false);
      return;
    }

    if (ownerAddresses.includes(newOwnerAddress)) {
      setNewOwnerAddress("");
      toast.error("Address already exists.");
      setIsCheckingNewOwnerAddress(false);
      return;
    }

    // Check if the address is an EOA
    const eoa = await isEOA(newOwnerAddress);
    if (!eoa) {
      setNewOwnerAddress("");
      toast.error("This address is a contract address and cannot be added as a team member.");
      setIsCheckingNewOwnerAddress(false);
      return;
    }

    // Check if the user is an affiliate
    const userRole = await checkUserRole(newOwnerAddress);
    if (userRole === "Affiliate") {
      setNewOwnerAddress("");
      toast.error("This user is registered as an Affiliate and cannot be added as a team member.");
      setIsCheckingNewOwnerAddress(false);
      return;
    }

    const updatedOwners = [...ownerAddresses, newOwnerAddress];
    setOwnerAddresses(updatedOwners);
    handleOwnerChange(updatedOwners);
    setNewOwnerAddress("");
    toast.success("Owner added successfully.");
    setIsCheckingNewOwnerAddress(false);
  };

  const handleRemoveOwner = (address: string) => {
    const updatedOwners = ownerAddresses.filter(owner => owner !== address);
    setOwnerAddresses(updatedOwners);
    handleOwnerChange(updatedOwners);
    toast.success("Owner removed successfully.");
  };
  // ===== END OWNER MANAGEMENT =====

  const [titleCharCount, setTitleCharCount] = useState(data.projectName.length);
  const [descCharCount, setDescCharCount] = useState(data.description.length);

  const maxTitleLength = 50;
  const maxDescLength = 500;

  return (
    <div className="bg-white rounded-lg shadow-md p-5 my-10 text-sm">

      <h1 className="text-xl mb-5">Project Details</h1>

      <div className="flex flex-col gap-5">

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <h2>Project name <span className="text-red-500">*</span></h2>
            <p className={`text-sm ${titleCharCount >= maxTitleLength ? "text-red-500" : "text-gray-500"}`}>
              {titleCharCount}/{maxTitleLength}
              {titleCharCount >= maxTitleLength && <span className="ml-2">Character limit reached</span>}
            </p>
          </div>
          <input
            type="text"
            value={data.projectName}
            onChange={(e) => {
              handleChange("projectName")(e);
              setTitleCharCount(e.target.value.length);
            }}
            maxLength={maxTitleLength}
            className="w-full p-2 border border-[#D1D5DB] rounded-lg text-sm outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <h2>Description <span className="text-red-500">*</span></h2>
            <p className={`text-sm ${descCharCount >= maxDescLength ? "text-red-500" : "text-gray-500"}`}>
              {descCharCount}/{maxDescLength}
              {descCharCount >= maxDescLength && <span className="ml-2">Character limit reached</span>}
            </p>
          </div>
          <textarea
            value={data.description}
            onChange={(e) => {
              handleChange("description")(e);
              setDescCharCount(e.target.value.length);
            }}
            maxLength={maxDescLength}
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
          <h2>Team Members</h2>
          <div className="flex items-center mb-2">
            <input
              type="text"
              value={newOwnerAddress}
              onChange={(e) => setNewOwnerAddress(e.target.value)}
              placeholder="Enter team member&apos;s wallet address"
              className="w-full p-2 border border-[#D1D5DB] rounded-lg text-sm outline-none"
            />
            <button
              type="button"
              onClick={handleAddOwner}
              className={`ml-2 text-white py-2 px-7 rounded ${isCheckingNewOwnerAddress ? "bg-gray-200" : "bg-green-500 hover:bg-green-700"}`}
              disabled={isCheckingNewOwnerAddress}
            >
              {isCheckingNewOwnerAddress ? (
                <Image src={"/loading.png"} height={30} width={30} alt="loading.png" className="animate-spin" />
              ) : (
                "Add"
              )}
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
                  {ownerAddresses.map((ownerAddress, index) => (
                    <tr key={index}>
                      <td className="border border-[#D1D5DB] p-2">
                        {ownerAddress}
                        {ownerAddress === address && (
                          <span className="text-gray-500 ml-2">(Your wallet address, automatically added as a team member)</span>
                        )}
                      </td>
                      <td className="border border-[#D1D5DB] p-2 text-center">
                        {ownerAddress === address ? (
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
                            onClick={() => handleRemoveOwner(ownerAddress)}
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