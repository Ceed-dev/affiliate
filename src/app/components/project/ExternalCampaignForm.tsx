import React, { useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { ExternalCampaign } from "../../types";

// Type definition for ExternalCampaignForm component props
type ExternalCampaignFormProps = {
  externalCampaigns: ExternalCampaign[]; // Array of external campaigns linked to the project
  updateExternalCampaigns?: (action: "add" | "remove", campaign?: ExternalCampaign) => void; // Function to add/remove external campaigns
};

/**
 * External Campaign Form Component
 * - Allows users to add external campaigns by entering ASP name, campaign ID, and a label.
 */
export const ExternalCampaignForm: React.FC<ExternalCampaignFormProps> = ({
  externalCampaigns,
  updateExternalCampaigns,
}) => {
  const [campaignSource, setCampaignSource] = useState<string>("");
  const [campaignId, setCampaignId] = useState<string>("");
  const [campaignLabel, setCampaignLabel] = useState<string>("");

  const handleAddCampaign = () => {
    if (!campaignSource || !campaignId) {
      toast.error("Please fill in all required fields.");
      return;
    }
  
    const newCampaign: ExternalCampaign = {
      source: campaignSource,
      campaignId,
      label: campaignLabel.trim() ? campaignLabel : "", // Optional field
    };
  
    updateExternalCampaigns?.("add", newCampaign);
  
    // Reset input fields
    setCampaignSource("");
    setCampaignId("");
    setCampaignLabel("");
  };

  return (
    <>
      <h1 className="text-2xl font-bold">External Campaigns</h1>

      <div className="space-y-4 border border-gray-300 p-5 rounded-lg">

        {/* Campaign Input Section - Only show when updateExternalCampaigns exists */}
        {updateExternalCampaigns && (
          <div className="space-y-3">
            {/* ASP (Network) Selection */}
            <div className="space-y-1">
              <label className="font-medium">Select Network <span className="text-red-500">*</span></label>
              <select 
                className="w-full border border-gray-300 rounded-lg p-2 outline-none"
                value={campaignSource}
                onChange={(e) => setCampaignSource(e.target.value)}
              >
                <option value="">Select ASP</option>
                <option value="AFRo">AFRo</option>
                <option value="Adways">Adways</option>
              </select>
            </div>

            {/* Campaign ID Input */}
            <div className="space-y-1">
              <label className="font-medium">Campaign ID <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                placeholder="Enter campaign ID"
                className="w-full border border-gray-300 rounded-lg p-2 outline-none"
              />
            </div>

            {/* Label Input */}
            <div className="space-y-1">
              <label className="font-medium">Label (Optional)</label>
              <input
                type="text"
                value={campaignLabel}
                onChange={(e) => setCampaignLabel(e.target.value)}
                placeholder="e.g., 'A8.net - Summer Campaign'"
                className="w-full border border-gray-300 rounded-lg p-2 outline-none"
              />
            </div>

            {/* Add Campaign Button */}
            <button 
              className="w-full bg-slate-100 hover:bg-slate-200 py-2 border border-black rounded transition-transform duration-300 hover:scale-105"
              onClick={handleAddCampaign}
            >
              Add Campaign
            </button>
          </div>
        )}

        {/* Campaigns List Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Network</th>
                <th className="p-2 border">Campaign ID</th>
                <th className="p-2 border">Label</th>
                {/* Only show "Remove" column when updateExternalCampaigns is provided (New Project) */}
                {updateExternalCampaigns && <th className="p-2 border">Remove</th>}
              </tr>
            </thead>
            <tbody>
              {externalCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={updateExternalCampaigns ? 4 : 3} className="p-4 text-center text-gray-500">
                    No external campaigns added yet.
                  </td>
                </tr>
              ) : (
                externalCampaigns.map((campaign) => (
                  <tr key={campaign.campaignId}>
                    <td className="p-2 border text-center">{campaign.source}</td>
                    <td className="p-2 border text-center">{campaign.campaignId}</td>
                    <td className="p-2 border text-center">{campaign.label || "—"}</td>
                    {/* Only show "Remove" button when updateExternalCampaigns is provided (New Project) */}
                    {updateExternalCampaigns && (
                      <td className="p-2 border text-center">
                        <button
                          onClick={() => updateExternalCampaigns?.("remove", campaign)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Image 
                            src="/assets/common/trash.png" 
                            alt="trash.png" 
                            height={20} 
                            width={20} 
                            className="transition duration-300 ease-in-out transform hover:scale-125" 
                          />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </>
  );
};