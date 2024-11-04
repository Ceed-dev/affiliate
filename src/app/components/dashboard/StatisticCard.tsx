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
    <div className="bg-slate-100 rounded-lg p-4 space-y-5">
      <h3 className="text-xs font-semibold text-gray-500 uppercase">
        {title}
      </h3>
      {loading ? (
        <Image
          src="/assets/common/loading.png"
          alt="loading"
          width={50}
          height={50}
          className="animate-spin mx-auto"
        />
      ) : (
        <div className="flex flex-wrap items-baseline">
          <span className="text-2xl font-semibold text-gray-900 mr-1">{value}</span>
          <span className="text-gray-500 text-sm">{unit}</span>
        </div>
      )}
    </div>
  );
};