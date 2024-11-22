import React from "react";
import { ConversionPoint } from "../../types";

type ConversionPointsTableProps = {
  conversionPoints: ConversionPoint[]; // Array of conversion points with their details
  tokenSymbol: string; // Token symbol for rewards
  chainName: string;   // Chain name where rewards are given
};

/**
 * ConversionPointsTable Component
 *
 * Displays a table-like view of active conversion points with their titles and values.
 * If all conversion points are inactive, shows an alert message instead.
 */
export const ConversionPointsTable: React.FC<ConversionPointsTableProps> = ({ conversionPoints, tokenSymbol, chainName }) => {
  return (
    <div className="bg-[#222222] p-5 mx-3 rounded-xl space-y-3">
      <h1 className="font-bold text-lg">Reward Detail</h1>
      {/* Alert message if all conversion points are inactive */}
      {conversionPoints.every(point => !point.isActive) ? (
        <div className="bg-red-100 border border-red-400 text-red-700 p-2 rounded" role="alert">
          <strong className="font-bold">Notice:</strong>
          <span className="block sm:inline"> All conversion points are currently inactive. New users cannot join this project at the moment.</span>
        </div>
      ) : (
        // Informational message for active conversion points
        <p className="text-sm text-white/60">
          {/* TODO
            Temporary Fix:
            The reward unit displayed on the affiliate's screen is temporarily set to "xp" for all projects, regardless of the actual payment type.
            This change does not affect the underlying data structure or the way rewards are configured during project creation.
            The displayed value here is purely for UI purposes and does not modify backend or project-related data.
            */}
          {/* {`Earn ${tokenSymbol} for each successful referral on ${chainName}. Join the project to start referring other people.`} */}
          Earn &quot;xp&quot; for each successful referral. Join the project to start referring other people.
        </p>
      )}

      {/* List of active conversion points */}
      {conversionPoints
        .filter(point => point.isActive) // Only display active conversion points
        .map(point => (
          <div key={point.id} className="pt-2">
            {/* Conversion Point Title */}
            <p className="font-semibold truncate">{point.title}</p>

            {/* Conversion Point Value */}
            <p className="text-white/60 text-sm">
              {/* TODO
                Temporary Fix:
                The reward unit displayed on the affiliate's screen is temporarily set to "xp" for all projects, regardless of the actual payment type.
                This change does not affect the underlying data structure or the way rewards are configured during project creation.
                The displayed value here is purely for UI purposes and does not modify backend or project-related data.
                */}
              {/* {point.paymentType === "FixedAmount" ? (
                `${point.rewardAmount} ${tokenSymbol}`
              ) : ( 
                `${point.percentage}%`
              )} */}
              {`${point.paymentType === "FixedAmount" ? point.rewardAmount : point.percentage}xp`}
            </p>
          </div>
        ))}
    </div>
  );
};