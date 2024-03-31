"use client";

import React from "react";
import BarChart from "../components/BarChart";

function Dashboard() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] px-40 py-20">
      <div className="px-8 py-5">
        <div className="flex flex-col sm:flex-row sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h3 className="text-lg leading-6 font-medium text-[#1F2937]">
              Affiliate sign up page
            </h3>
            <p className="mt-1 text-sm text-[#6B7280]">
              The page for affiliates to claim their referral link.
            </p>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-sm leading-5 font-semibold text-gray-400 tracking-wide uppercase">
                Total Affiliates
              </h3>
              <div className="mt-1 text-3xl leading-8 font-semibold text-gray-900">
                1
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-sm leading-5 font-semibold text-gray-400 tracking-wide uppercase">
                Total Referring Affiliates
              </h3>
              <div className="mt-1 text-3xl leading-8 font-semibold text-gray-900">
                0
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-sm leading-5 font-semibold text-gray-400 tracking-wide uppercase">
                Total Affiliate Revenue
              </h3>
              <div className="mt-1 text-3xl leading-8 font-semibold text-gray-900">
                0 USDC
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">
              Affiliate sign ups
            </h2>
          </div>
          <div className="px-10 py-5">
            <BarChart />
          </div>
        </div>
        <div className="mb-4">
          <h2 className="text-lg leading-6 font-medium text-gray-900">
            Affiliates
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            A list of all affiliates.
          </p>
        </div>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-4 mb-6">
          <div className="flex items-center mb-4">
            <div className="relative inline-block text-left mr-auto">
              <button
                type="button"
                className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                id="options-menu"
                aria-haspopup="true"
                aria-expanded="true"
              >
                General
                <svg
                  className="ml-2 -mr-1 h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <button
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#4F46E5] hover:bg-[#4338CA] focus:outline-none"
              name="export_csv"
            >
              Export to CSV
            </button>
            <button
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#10B981] hover:bg-[#059669] focus:outline-none"
              name="add_affiliate"
            >
              Add affiliate
            </button>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  Invited
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  Visits
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  Revenue Generated
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  Earned (1 USDC)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 font-medium text-gray-900">
                  <p>0x329...1689</p>
                </td>
                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                  1
                </td>
                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                  18
                </td>
                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                  0 USDC
                </td>
                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 text-gray-500">
                  0 USDC
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;