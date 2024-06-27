import React, { useState, useEffect } from "react";
import { AffiliateInfo, UserRole } from "../types";

type UserInfoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (info: AffiliateInfo) => void;
  disableRoleSelection?: boolean; // Optional flag to disable role selection
};

export const UserInfoModal: React.FC<UserInfoModalProps> = ({ isOpen, onClose, onSave, disableRoleSelection = false }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [xProfileUrl, setXProfileUrl] = useState("");
  const [role, setRole] = useState<UserRole>("ProjectOwner");
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);

  useEffect(() => {
    setIsSaveEnabled(validateInputs());
  }, [username, email, xProfileUrl, role]);

  const validateInputs = () => {
    return (
      validateUsername(username) &&
      validateEmail(email) &&
      validateUrl(xProfileUrl) &&
      validateRole(role)
    );
  };

  const validateUsername = (username: string) => {
    return username.trim().length > 0;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateRole = (role: UserRole) => {
    return role === "ProjectOwner" || role === "Affiliate";
  };

  const handleSave = () => {
    onSave({ username, email, xProfileUrl, role });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4">User Information</h2>
        <p className="text-sm text-gray-600 mb-4">
          Please provide your username, email address, X profile URL, and select your role to complete your registration.
        </p>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="block mb-1 font-semibold">Username <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border border-[#D1D5DB] rounded-lg text-sm outline-none"
              placeholder="qube1234"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block mb-1 font-semibold">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-[#D1D5DB] rounded-lg text-sm outline-none"
              placeholder="official@ceed.cloud"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block mb-1 font-semibold">X Profile URL <span className="text-red-500">*</span></label>
            <input
              type="url"
              value={xProfileUrl}
              onChange={(e) => setXProfileUrl(e.target.value)}
              className="w-full p-2 border border-[#D1D5DB] rounded-lg text-sm outline-none"
              placeholder="https://x.com/0xQube"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block mb-1 font-semibold">Role <span className="text-red-500">*</span></label>
            {disableRoleSelection && (
              <p className="text-sm text-gray-500">
                You are automatically assigned the role of "Ad publisher" because you are a team member of a project.
              </p>
            )}
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className={`w-full p-2 border border-[#D1D5DB] rounded-lg text-sm outline-none ${disableRoleSelection ? "bg-slate-100" : ""}`}
              disabled={disableRoleSelection}
            >
              <option value="ProjectOwner">Ad publisher</option>
              <option value="Affiliate">Affiliater</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-400 hover:bg-gray-500 hover:shadow-lg text-white rounded-lg">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`px-4 py-2 rounded-lg text-white ${isSaveEnabled ? "bg-blue-400 hover:bg-blue-500 hover:shadow-lg" : "bg-gray-300 cursor-not-allowed"}`}
            disabled={!isSaveEnabled}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
