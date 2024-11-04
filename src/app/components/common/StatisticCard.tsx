import React from "react";
import Image from "next/image";

// Define the props for the StatisticCard component
type StatisticCardProps = {
  title: string;   // Title of the statistic (e.g., "Total Clicks")
  loading: boolean; // Loading state; true if data is still being fetched
  value: string;   // The main statistic value to display (e.g., "1234")
  unit: string;    // Unit of measurement for the value (e.g., "TIMES")
};

/**
 * StatisticCard Component
 * 
 * A reusable card component that displays a statistic with a title, value, and unit.
 * If loading is true, it shows a loading spinner. Once data is loaded, it shows the 
 * statistic's value and unit.
 * 
 * Usage:
 * - Suitable for displaying key metrics (like clicks, conversions, earnings) in an analytics dashboard.
 * - Pass `loading` as true when fetching data and update `value` and `unit` after data is retrieved.
 * 
 * @param {string} title - The title of the statistic
 * @param {boolean} loading - Whether data is being loaded
 * @param {string} value - The main value of the statistic
 * @param {string} unit - Unit of the statistic value
 * @returns {JSX.Element} The rendered StatisticCard component
 */
export const StatisticCard: React.FC<StatisticCardProps> = ({ title, loading, value, unit }) => {
  return (
    <div className="bg-slate-100 rounded-lg p-4 space-y-5">
      {/* Statistic title */}
      <h3 className="text-xs font-semibold text-gray-500 uppercase">
        {title}
      </h3>

      {/* Show loading spinner if loading is true; otherwise display the value and unit */}
      {loading ? (
        <Image
          src="/assets/common/loading.png"
          alt="Loading indicator"
          width={50}
          height={50}
          className="animate-spin mx-auto"
        />
      ) : (
        <div className="flex flex-wrap items-baseline">
          {/* Main statistic value */}
          <span className="text-2xl font-semibold text-gray-900 mr-1">{value}</span>
          {/* Unit of the statistic */}
          <span className="text-gray-500 text-sm">{unit}</span>
        </div>
      )}
    </div>
  );
};