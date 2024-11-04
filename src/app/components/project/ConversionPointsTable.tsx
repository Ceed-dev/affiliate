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
    <div className="space-y-2">
      <h1 className="font-bold">Reward Detail</h1>
      <div className="bg-gray-100 p-4 rounded-lg shadow-md">
        {/* Alert message if all conversion points are inactive */}
        {conversionPoints.every(point => !point.isActive) ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
            <strong className="font-bold">Notice:</strong>
            <span className="block sm:inline"> All conversion points are currently inactive. New users cannot join this project at the moment.</span>
          </div>
        ) : (
          // Informational message for active conversion points
          <p className="text-sm text-gray-600 mb-4">
            {`Earn ${tokenSymbol} for each successful referral on ${chainName}. Join the project to start referring other people.`}
          </p>
        )}

        {/* List of active conversion points */}
        <div className="space-y-2">
          {conversionPoints
            .filter(point => point.isActive) // Only display active conversion points
            .map(point => (
              <div key={point.id} className="pt-2">
                {/* Conversion Point Title */}
                <p className="font-semibold text-gray-800">{point.title}</p>

                {/* Conversion Point Value */}
                <p className="text-gray-600 text-sm">
                  {point.paymentType === "FixedAmount" ? (
                    `${point.rewardAmount} ${tokenSymbol}`
                  ) : ( 
                    `${point.percentage}%`
                  )}
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};