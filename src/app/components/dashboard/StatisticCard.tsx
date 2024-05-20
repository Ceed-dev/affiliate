import React from "react";
import Image from "next/image";

type StatisticCardProps = {
  title: string;
  loading: boolean;
  value: string;
  unit: string;
}

export const StatisticCard: React.FC<StatisticCardProps> = ({ title, loading, value, unit }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-sm leading-5 font-semibold text-gray-400 tracking-wide uppercase mb-1">
        {title}
      </h3>
      {loading ? (
        <Image src="/loading.png" alt="loading" width={50} height={50} className="animate-spin mx-auto" />
      ) : (
        <div className="flex flex-wrap items-baseline">
          <span className="text-3xl leading-8 font-semibold text-gray-900 min-w-max mr-2">{value}</span>
          <span className="text-gray-500 text-md font-bold">{unit}</span>
        </div>
      )}
    </div>
  );
};