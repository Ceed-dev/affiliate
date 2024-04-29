"use client";

import React from "react";
import BarChart from "../../components/BarChart";
import { NavBar } from "../../components/dashboard/NavBar";

export default function Dashboard() {
  return (
    <>
      <NavBar />
      <div className="bg-[#F8FAFC] px-4 sm:px-10 md:px-20 lg:px-40 pb-10 md:pb-20 flex flex-col gap-5">

        {/* Title */}
        <div className="pt-5">
          <h3 className="text-lg leading-6 font-medium text-[#1F2937]">
            Affiliate sign up page
          </h3>
          <p className="text-sm text-[#6B7280]">
            The page for affiliates to claim their referral link.
          </p>
        </div>

        {/* Statistic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-sm leading-5 font-semibold text-gray-400 tracking-wide uppercase">
              Deposit Balance
            </h3>
            <p className="text-3xl leading-8 font-semibold text-gray-900">
              10000 USDC
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-sm leading-5 font-semibold text-gray-400 tracking-wide uppercase">
              Total Paid Out
            </h3>
            <p className="text-3xl leading-8 font-semibold text-gray-900">
              100 USDC
            </p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-sm leading-5 font-semibold text-gray-400 tracking-wide uppercase">
              Total Affiliates
            </h3>
            <p className="text-3xl leading-8 font-semibold text-gray-900">
              15 PEOPLE
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white p-10 rounded-lg shadow">
          <BarChart />
        </div>

        {/* List */}
        <div className="bg-white shadow rounded-lg p-10">

          <h2 className="text-lg leading-6 font-medium text-gray-900">
            Affiliates
          </h2>
          <p className="text-gray-700 text-sm mb-5">
            A list of all affiliates.
          </p>

          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  Earnings (USDC)
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  Conversions
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  Last Conversion Date
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider ">
                  Creation Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="text-gray-500 hover:bg-gray-50 hover:text-gray-900">
                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5">
                  <p>0x329...1689</p>
                </td>
                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5">
                  20
                </td>
                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5">
                  5
                </td>
                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 ">
                  2024/02/03
                </td>
                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 ">
                  2024/01/01
                </td>
              </tr>
              <tr className="text-gray-500 hover:bg-gray-50 hover:text-gray-900">
                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5">
                  <p>0x329...1689</p>
                </td>
                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5">
                  20
                </td>
                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5">
                  5
                </td>
                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 ">
                  2024/02/03
                </td>
                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 ">
                  2024/01/01
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </>
  );
}