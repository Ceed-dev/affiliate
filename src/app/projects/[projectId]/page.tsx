"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { NavBar, PaymentTransactionsChart, StatisticCard, AffiliatesList } from "../../components/dashboard";
import { ProjectData, ReferralData, PaymentTransaction } from "../../types";
import { fetchProjectData, fetchReferralsByProjectId, fetchTransactionsForReferrals } from "../../utils/firebase";
import { initializeSigner, Escrow, ERC20 } from "../../utils/contracts";
import { formatBalance } from "../../utils/formatters";

export default function Dashboard({ params }: { params: { projectId: string } }) {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);

  const [referralData, setReferralData] = useState<ReferralData[] | null>(null);
  const [loadingReferral, setLoadingReferral] = useState(true);

  const [tokenSymbol, setTokenSymbol] = useState("");
  const [loadingTokenSymbol, setLoadingTokenSymbol] = useState(true);

  const [depositBalance, setDepositBalance] = useState("0");
  const [loadingDepositBalance, setLoadingDepositBalance] = useState(true);

  const [transactionData, setTransactionData] = useState<PaymentTransaction[]>([]);
  const [loadingTransactionData, setLoadingTransactionData] = useState(true);

  useEffect(() => {
    fetchProjectData(params.projectId)
      .then(data => {
        setProjectData(data);
        setLoadingProject(false);
      })
      .catch(error => {
        const message = (error instanceof Error) ? error.message : "Unknown error";
        console.error("Error loading the project: ", message);
        toast.error(`Error loading the project: ${message}`);
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
        console.error("Error loading the referrals: ", message);
        toast.error(`Error loading the referrals: ${message}`);
        setLoadingReferral(false);
      });
  }, [params.projectId]);

  useEffect(() => {
    if (!projectData) return;

    const fetchTokenDetails = async () => {
      try {
        const signer = initializeSigner();
        const escrow = new Escrow(signer);
        const erc20 = new ERC20(projectData.selectedTokenAddress, signer);

        const [symbol, decimals] = await Promise.all([
          erc20.getSymbol(),
          erc20.getDecimals()
        ]);

        setTokenSymbol(symbol);

        const depositorAddress = await signer.getAddress();
        const balance = await escrow.getDepositBalance(projectData.selectedTokenAddress, depositorAddress, decimals);
        setDepositBalance(formatBalance(balance));
      } catch (error: any) {
        console.error("Error fetching token details: ", error);
        toast.error(`Error fetching token details: ${error.message}`);
      } finally {
        setLoadingDepositBalance(false);
        setLoadingTokenSymbol(false);
      }
    };

    fetchTokenDetails();
  }, [projectData]);

  useEffect(() => {
    if (referralData) {
      fetchTransactionsForReferrals(referralData, setTransactionData)
        .then(() => {
          setLoadingTransactionData(false);
        })
        .catch(error => {
          console.error("Error fetching transactions: ", error.message);
          toast.error(`Error fetching transactions: ${error.message}`);
          setLoadingTransactionData(false);
        });
    }
  }, [referralData]);

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-[#F8FAFC] px-4 sm:px-10 md:px-20 lg:px-40 pb-10 md:pb-20 flex flex-col gap-5">

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
          <StatisticCard
            title="Deposit Balance"
            loading={loadingDepositBalance || loadingTokenSymbol}
            value={depositBalance}
            unit={tokenSymbol}
          />
          <StatisticCard
            title="Total Paid Out"
            loading={loadingProject || loadingTokenSymbol}
            value={`${projectData?.totalPaidOut}`}
            unit={tokenSymbol}
          />
          <StatisticCard
            title="Total Affiliates"
            loading={loadingReferral}
            value={`${referralData?.length || 0}`}
            unit="PEOPLE"
          />
        </div>

        {/* Chart */}
        <div className="bg-white p-10 rounded-lg shadow">
          {loadingTransactionData
            ? <div className="flex flex-row items-center justify-center gap-5">
                <Image src="/loading.png" alt="loading.png" width={50} height={50} className="animate-spin" /> 
                <p className="animate-pulse font-semibold text-gray-600">Loading transaction data for chart visualization...</p>
              </div>
            : <PaymentTransactionsChart transactions={transactionData} />
          }
        </div>

        {/* List */}
        <AffiliatesList referrals={referralData || []} selectedToken={tokenSymbol || ""} />

      </div>
    </>
  );
}