import React from "react";
import { ExternalCampaign } from "../../types";

// Type definition for ExternalCampaignForm component props
type ExternalCampaignFormProps = {
  externalCampaigns: ExternalCampaign[]; // Array of external campaigns linked to the project
  updateExternalCampaigns: (action: "add" | "remove", campaign?: ExternalCampaign) => void; // Function to add/remove external campaigns
};

/**
 * External Campaign Form Component
 * - Allows users to add external campaigns by entering ASP name, campaign ID, and a label.
 */
export const ExternalCampaignForm: React.FC<ExternalCampaignFormProps> = ({
  externalCampaigns,
  updateExternalCampaigns,
}) => {
  return (
    <>
      <h1 className="text-2xl font-bold">External Campaigns</h1>

      <div className="space-y-4 border border-gray-300 p-5 rounded-lg">

        {/* Campaign Input Section */}
        <div className="space-y-3">
          {/* ASP (Network) Selection */}
          <div className="space-y-1">
            <label className="font-medium">Select Network <span className="text-red-500">*</span></label>
            <select className="w-full border border-gray-300 rounded-lg p-2 outline-none">
              <option value="">Select ASP</option>
              <option value="A8.net">A8.net</option>
              <option value="ValueCommerce">ValueCommerce</option>
              <option value="Rakuten">Rakuten Affiliate</option>
            </select>
          </div>

          {/* Campaign ID Input */}
          <div className="space-y-1">
            <label className="font-medium">Campaign ID <span className="text-red-500">*</span></label>
            <input
              type="text"
              placeholder="Enter campaign ID"
              className="w-full border border-gray-300 rounded-lg p-2 outline-none"
            />
          </div>

          {/* Label Input */}
          <div className="space-y-1">
            <label className="font-medium">Label (Optional)</label>
            <input
              type="text"
              placeholder="e.g., 'A8.net - Summer Campaign'"
              className="w-full border border-gray-300 rounded-lg p-2 outline-none"
            />
          </div>

          {/* Add Campaign Button */}
          <button className="w-full bg-slate-100 hover:bg-slate-200 py-2 border border-black rounded transition-transform duration-300 hover:scale-105">
            Add Campaign
          </button>
        </div>

        {/* Campaigns List Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Network</th>
                <th className="p-2 border">Campaign ID</th>
                <th className="p-2 border">Label</th>
                <th className="p-2 border">Remove</th>
              </tr>
            </thead>
            <tbody>
              {/* Placeholder for campaigns (to be dynamically populated) */}
              <tr>
                <td className="p-2 border text-center">A8.net</td>
                <td className="p-2 border text-center">12345</td>
                <td className="p-2 border text-center">A8.net - Campaign A</td>
                <td className="p-2 border text-center">
                  <button className="text-red-500 hover:text-red-700">Remove</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};