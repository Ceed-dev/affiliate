import React from "react";
import Image from "next/image";

// Define the props for the AnalyticsCard component
type AnalyticsCardProps = {
  title: string;                // Title of the metric (e.g., "Total Clicks")
  description?: string;         // Optional description for additional context
  loading: boolean;             // Loading state; true if data is still being fetched
  value: number | Date;         // The main metric value to display (either a number or Date)
  unit?: string;                // Optional unit of measurement for the value (e.g., "TIMES" or "%")
};

/**
 * AnalyticsCard Component
 * 
 * A reusable card component that displays a key metric with a title, value, optional description, and unit.
 * It supports both number and Date values, with loading spinner support.
 * 
 * Usage:
 * - Suitable for displaying key metrics (clicks, conversions, earnings, dates) in analytics dashboards.
 * - Set `loading` to true during data fetching, then update `value` and `unit` after data retrieval.
 * - `description` provides additional context about the metric.
 * 
 * @param {string} title - The title of the metric
 * @param {string} [description] - Optional description for the metric
 * @param {boolean} loading - Whether the data is being loaded
 * @param {number | Date} value - The main metric value to display
 * @param {string} [unit] - Optional unit of the metric value
 * @returns {JSX.Element} Rendered AnalyticsCard component
 */
export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  description,
  loading,
  value,
  unit,
}) => {
  // Formats date as "MM.DD." for month and day, and "Year" for the year
  const formatDate = (date: Date) => {
    const monthDay = `${date.getMonth() + 1}.${date.getDate()}.`; // Example: "12.1."
    const year = date.getFullYear();                              // Example: "2024"
    return { monthDay, year };
  };

  // Determines the value to display based on the type of `value`
  const displayValue =
    typeof value === "number"
      ? value.toLocaleString("en-US")    // Format number with commas
      : formatDate(value);               // Format Date as monthDay and year

  return (
    <div className="bg-[#222222] text-white/60 text-sm rounded-lg p-4 h-full flex flex-col">
      {/* Header section with title and optional description */}
      <div className="mb-12">
        <h3 className="font-semibold uppercase">{title}</h3>
        {description && <p>{description}</p>}
      </div>

      {/* Main content: loading spinner or metric value with optional unit */}
      {loading ? (
        // Loading spinner when data is still being fetched
        <div className="flex items-center justify-center h-full">
          <Image
            src="/assets/common/loading.png"
            alt="Loading indicator"
            width={50}
            height={50}
            className="animate-spin"
          />
        </div>
      ) : (
        <div className="mt-auto">
          {/* Display unit above value if value is a Date */}
          {value instanceof Date && unit && (
            <p className="text-gray-500 text-sm">{unit}</p>
          )}
          <div className="flex items-baseline">
            {typeof displayValue === "string" ? (
              <>
                {/* Display numeric value with unit beside it */}
                <span className="text-3xl font-semibold text-white">{displayValue}</span>
                {unit && <span className="text-sm ml-1">{unit}</span>}
              </>
            ) : (
              <>
                {/* Display date with month and day in bold, year in smaller font */}
                <span className="text-white font-bold text-3xl">{displayValue.monthDay}</span>
                <span className="ml-1">{displayValue.year}</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};