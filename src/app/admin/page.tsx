"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAddress } from "@thirdweb-dev/react";
import { toast } from "react-toastify";
import Image from "next/image";
import Link from "next/link";
import { formatAddress } from "../utils/formatters";
import { fetchAllUnpaidConversionLogs } from "../utils/firebase";
import { UnpaidConversionLog } from "../types";

export default function Admin() {
  const router = useRouter();
  const address = useAddress();
  const adminWalletAddress = process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const explorerUrl = process.env.NEXT_PUBLIC_EXPLORER_BASE_URL;
  const [isLoading, setIsLoading] = useState(false);
  const [unpaidConversionLogs, setUnpaidConversionLogs] = useState<UnpaidConversionLog[]>([]);

  useEffect(() => {
    if (!address) {
      router.push("/onboarding");
      toast.error("You must be connected to access this page");
      return;
    }

    if (address.toLowerCase() !== adminWalletAddress?.toLowerCase()) {
      router.push("/onboarding");
      toast.error("You do not have permission to access this page");
      return;
    }

    loadUnpaidConversionLogs();
  }, [address, adminWalletAddress, router]);

  const loadUnpaidConversionLogs = () => {
    setIsLoading(true);
    fetchAllUnpaidConversionLogs()
      .then((logs) => {
        setUnpaidConversionLogs(logs);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching unpaid conversion logs: ", error);
        toast.error("Failed to fetch unpaid conversion logs");
        setIsLoading(false);
      });
  };

  const handlePay = async (log: UnpaidConversionLog) => {
    try {
      // Implement your payment processing logic here
      console.log("Processing payment for: ", log);
      toast.success(`Payment processed for ${log.logId}`);
    } catch (error) {
      console.error("Failed to process payment: ", error);
      toast.error("Failed to process payment");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center">

      <header className="w-full px-5 lg:px-0 py-2 border-b-2 border-sky-500 shadow-md">
        <div className="flex flex-row justify-between w-full lg:w-2/3 mx-auto">
          <Link href="/#" className="flex flex-row items-center gap-3 transition duration-300 ease-in-out transform hover:-translate-y-1">
            <Image
              src="/qube.png"
              alt="qube.png"
              width={50}
              height={50}
            />
            <p className="text-lg font-semibold">Qube</p>
          </Link>
          <button
            className="bg-gray-100 text-gray-600 text-sm py-2 px-2 md:px-7 border-2 border-white shadow-xl rounded-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            {address ? formatAddress(address) : "Not connected"}
          </button>
        </div>
      </header>
      
      <div className="w-11/12 flex justify-between items-center my-5">
        <h1 className="text-lg sm:text-2xl lg:text-4xl font-semibold">Admin Dashboard</h1>
        <button 
          className={`${isLoading ? "bg-slate-400" : "bg-sky-500 hover:bg-sky-700"} text-white w-[130px] h-[40px] rounded transition`}
          onClick={loadUnpaidConversionLogs}
          disabled={isLoading}
        >
          {isLoading ? (
            <Image src={"/loading.png"} height={30} width={30} alt="loading.png" className="animate-spin mx-auto" />
          ) : (
            "Reload Data"
          )}
        </button>
      </div>
      
      <div className="overflow-x-auto w-11/12 shadow-md rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Log ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Affiliate Wallet</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referral ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-lg text-gray-500">
                  <div className="flex flex-row items-center justify-center gap-5">
                    <Image src={"/loading.png"} height={50} width={50} alt="loading.png" className="animate-spin" />
                    Loading..., this may take a while.
                  </div>
                </td>
              </tr>
            ) : unpaidConversionLogs.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-lg text-gray-500 text-center">
                  No unpaid conversion logs found.
                </td>
              </tr>
            ) : (
              unpaidConversionLogs.map((log) => (
                <tr key={log.logId}>
                  <td className="px-6 py-4 text-sm text-gray-900">{log.logId}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{log.timestamp.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <Link 
                      href={`${explorerUrl}/address/${log.affiliateWallet}`}
                      target="_blank"
                      className="text-blue-500 hover:underline"
                    >
                      {log.affiliateWallet}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <Link
                      href={`${baseUrl}/affiliate/${log.projectId}`}
                      target="_blank"
                      className="text-blue-500 hover:underline"
                    >
                      {log.projectId}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <Link 
                      href={`${explorerUrl}/address/${log.selectedTokenAddress}`}
                      target="_blank"
                      className="text-blue-500 hover:underline"
                    >
                      {log.selectedTokenAddress}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{log.amount}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{log.referralId}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <button 
                      className="bg-sky-500 hover:bg-sky-700 hover:shadow-lg text-white px-3 py-1 rounded"
                      onClick={() => handlePay(log)}
                    >
                      Pay
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
