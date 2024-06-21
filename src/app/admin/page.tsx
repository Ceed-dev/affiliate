"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAddress } from "@thirdweb-dev/react";
import { toast } from "react-toastify";
import { ethers } from "ethers";
import Image from "next/image";
import Link from "next/link";
import { formatAddress } from "../utils/formatters";
import { fetchAllUnpaidConversionLogs, processRewardPaymentTransaction, logErrorToFirestore, updateIsPaidFlag } from "../utils/firebase";
import { initializeSigner, ERC20 } from "../utils/contracts";
import { UnpaidConversionLog } from "../types";

export default function Admin() {
  const router = useRouter();
  const pathname = usePathname();
  const address = useAddress();
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [isSignerInitialized, setIsSignerInitialized] = useState(false);
  const adminWalletAddresses = process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES?.split(",");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const explorerUrl = process.env.NEXT_PUBLIC_EXPLORER_BASE_URL;
  const [isLoading, setIsLoading] = useState(false);
  const [processingLogId, setProcessingLogId] = useState<string | null>(null);
  const [unpaidConversionLogs, setUnpaidConversionLogs] = useState<UnpaidConversionLog[]>([]);

  useEffect(() => {
    if (!address) {
      if (pathname !== "/onboarding") {
        router.push("/onboarding");
        toast.error("You must be connected to access this page");
      }
      return;
    }

    if (!adminWalletAddresses?.map(addr => addr.toLowerCase()).includes(address!.toLowerCase())) {
      if (pathname !== "/onboarding") {
        router.push("/onboarding");
        toast.error("You do not have permission to access this page");
      }
      return;
    }

    if (!isSignerInitialized) {
      const initializedSigner = initializeSigner();
      if (!initializedSigner) {
        console.error("Signer initialization failed");
        if (pathname !== "/onboarding") {
          router.push("/onboarding");
          toast.error("Failed to initialize signer");
        }
        return;
      }
      setSigner(initializedSigner);
      setIsSignerInitialized(true);
    }
  }, [address, adminWalletAddresses, router, pathname, isSignerInitialized]);

  useEffect(() => {
    if (signer && isSignerInitialized) {
      loadUnpaidConversionLogs();
    }
  }, [signer, isSignerInitialized]);

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
    setProcessingLogId(log.logId);
    try {
      toast.info(`Starting payment process for ${log.logId}...`);
      
      // Mark the log as paid to prevent duplicate payments
      await updateIsPaidFlag(log.referralId, log.logId, true);

      let transactionHash;
      try {
        const erc20 = new ERC20(log.selectedTokenAddress, signer!);
        toast.info("Transferring tokens...");
        transactionHash = await erc20.transfer(log.affiliateWallet, log.amount);
      } catch (error) {
        // If token transfer fails, revert the isPaid flag
        await updateIsPaidFlag(log.referralId, log.logId, false);

        console.error("Failed to transfer tokens: ", error);
        toast.error("Failed to transfer tokens");
        return; // If the token transfer fails, exit the function
      }

      try {
        toast.info("Updating transaction in Firestore...");
        await processRewardPaymentTransaction(
          log.projectId,
          log.referralId,
          log.logId,
          log.amount,
          transactionHash,
          log.timestamp
        );

        toast.success(`Payment processed for ${log.logId}. View transaction: ${explorerUrl}/tx/${transactionHash}`);
      } catch (error: any) {
        console.error("Failed to update Firestore: ", error);
        toast.error("Failed to update Firestore");

        await logErrorToFirestore(
          "FirestoreUpdateAfterPaymentError",
          `Failed to update Firestore: ${error.message}`,
          { ...log, transactionHash }
        );
      } finally {
        // Regardless of success or failure in Firestore update, remove the log from the list
        setUnpaidConversionLogs(prevLogs => prevLogs.filter(l => l.logId !== log.logId));
      }

    } catch (error) {
      console.error("Failed to process payment: ", error);
      toast.error("Failed to process payment");
    } finally {
      setProcessingLogId(null);
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
                <tr key={log.logId} className={`${processingLogId === log.logId ? "bg-gray-300 cursor-not-allowed animate-pulse" : ""}`}>
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
                      className={`bg-sky-500 hover:bg-sky-700 hover:shadow-lg text-white px-3 py-1 rounded ${processingLogId === log.logId ? "cursor-not-allowed opacity-50" : ""}`}
                      onClick={() => handlePay(log)}
                      disabled={processingLogId === log.logId}
                    >
                      {processingLogId === log.logId ? (
                        <div className="flex items-center pr-4 gap-2">
                          <Image src={"/loading.png"} height={20} width={20} alt="loading" className="animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        "Pay"
                      )}
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
