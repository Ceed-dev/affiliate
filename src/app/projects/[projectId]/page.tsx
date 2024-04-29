"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import BarChart from "../../components/BarChart";
import { NavBar } from "../../components/dashboard/NavBar";
import { ProjectData, ReferralData } from "../../types";
import { fetchProjectData, fetchReferralsByProjectId } from "../../utils/firebase";

export default function Dashboard({ params }: { params: { projectId: string } }) {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);

  const [referralData, setReferralData] = useState<ReferralData[] | null>(null);
  const [loadingReferral, setLoadingReferral] = useState(true);
  const [referralError, setReferralError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjectData(params.projectId)
      .then(data => {
        setProjectData(data);
        setLoadingProject(false);
      })
      .catch(error => {
        const message = (error instanceof Error) ? error.message : "Unknown error";
        console.error("Error loading the project: ", message);
        setProjectError(message);
        setLoadingProject(false);
      });
  }, [params.projectId]);

  useEffect(() => {
    fetchReferralsByProjectId(params.projectId)
      .then(data => {
        setReferralData(data);
        setLoadingReferral(false);
      })
      .catch(error => {
        const message = (error instanceof Error) ? error.message : "Unknown error";
        console.error("Error loading the project: ", message);
        setReferralError(message);
        setLoadingReferral(false);
      });
  }, [params.projectId]);

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
            {loadingProject
              ? <Image src="/loading.png" alt="loading.png" width={50} height={50} className="animate-spin mx-auto" /> 
              : <p className="text-3xl leading-8 font-semibold text-gray-900">
                  {projectData?.totalPaidOut} {projectData?.selectedToken}
                </p>
            }
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-sm leading-5 font-semibold text-gray-400 tracking-wide uppercase">
              Total Affiliates
            </h3>
            {loadingReferral
              ? <Image src="/loading.png" alt="loading.png" width={50} height={50} className="animate-spin mx-auto" /> 
              : <p className="text-3xl leading-8 font-semibold text-gray-900">
                  {referralData?.length || 0} PEOPLE
                </p>
            }
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
              {referralData?.length ? (
                referralData?.map((referral, index) => (
                  <tr key={index} className="text-gray-500 hover:bg-gray-50 hover:text-gray-900">
                    <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5">
                      <p>{referral.affiliateWallet}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5">
                      {referral.earnings}
                    </td>
                    <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5">
                      {referral.conversions}
                    </td>
                    <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5">
                      {referral.lastConversionDate ? referral.lastConversionDate.toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5">
                      {referral.createdAt.toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="text-gray-500">
                  <td colSpan={5} className="text-center py-4">
                    No Referral Data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </>
  );
}