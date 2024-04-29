"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import BarChart from "../../components/BarChart";
import { NavBar } from "../../components/dashboard/NavBar";
import { ProjectData, ReferralData } from "../../types";
import { fetchProjectData, fetchReferralsByProjectId } from "../../utils/firebase";
import { initializeSigner, Escrow, ERC20 } from "../../utils/contracts";
import { formatAddress } from "../../utils/formatAddress";

export default function Dashboard({ params }: { params: { projectId: string } }) {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);

  const [referralData, setReferralData] = useState<ReferralData[] | null>(null);
  const [loadingReferral, setLoadingReferral] = useState(true);
  const [referralError, setReferralError] = useState<string | null>(null);

  const USDC_ADDRESS = "0x9b5F49000D02479d1300e041FFf1d74F49588749";
  const signer = initializeSigner();
  const escrow = new Escrow(signer);
  const erc20 = new ERC20(USDC_ADDRESS, signer);

  const [depositBalance, setDepositBalance] = useState("0");
  const [loadingDepositBalance, setLoadingDepositBalance] = useState(true);
  const [depositBalanceError, setDepositBalanceError] = useState<string | null>(null);

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

  useEffect(() => {
    erc20.getDecimals().then(async decimals => {
      try {
        const depositorAddress = await signer.getAddress();
        const balance = await escrow.getDepositBalance(USDC_ADDRESS, depositorAddress, decimals);
        const formattedBalance = parseFloat(balance);
        const displayBalance = formattedBalance % 1 === 0 ? formattedBalance.toString() : balance;
        setDepositBalance(displayBalance);
        setLoadingDepositBalance(false);
      } catch (error) {
        const message = (error instanceof Error) ? error.message : "Failed to fetch deposit balance";
        console.error("Error loading deposit balance: ", message);
        setDepositBalanceError(message);
        setLoadingDepositBalance(false);
      }
    }).catch(error => {
      const message = (error instanceof Error) ? error.message : "Failed to fetch token decimals";
      console.error("Error fetching token decimals: ", message);
      setDepositBalanceError(message);
      setLoadingDepositBalance(false);
    });
  
  }, [params.projectId, USDC_ADDRESS, signer, erc20, escrow]);

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
            {loadingDepositBalance
              ? <Image src="/loading.png" alt="loading.png" width={50} height={50} className="animate-spin mx-auto" /> 
              : <p className="text-3xl leading-8 font-semibold text-gray-900">
                  {depositBalance} {projectData?.selectedToken}
                </p>
            }
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
                  Earnings ({projectData?.selectedToken})
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  Conversions
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Last Conversion Date
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Creation Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {referralData?.length ? (
                referralData?.map((referral, index) => (
                  <tr key={index} className="text-gray-500 hover:bg-gray-50 hover:text-gray-900">
                    <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5">
                      <p>{formatAddress(referral.affiliateWallet)}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5">
                      {referral.earnings}
                    </td>
                    <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5">
                      {referral.conversions}
                    </td>
                    <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 hidden lg:table-cell">
                      {referral.lastConversionDate ? referral.lastConversionDate.toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 hidden lg:table-cell">
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