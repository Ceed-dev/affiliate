"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAddress, useSwitchChain, useChainId } from "@thirdweb-dev/react";
import { Chain } from "@thirdweb-dev/chains";
import { toast } from "react-toastify";
import { ethers } from "ethers";
import Image from "next/image";
import Link from "next/link";
import { formatAddress, formatChainName } from "../utils/formatters";
import { 
  fetchAllUnpaidConversionLogs, processRewardPaymentTransaction, logErrorToFirestore, 
  updateIsPaidFlag, fetchUnapprovedUsers, approveUser 
} from "../utils/firebase";
import { initializeSigner, ERC20 } from "../utils/contracts";
import { UnpaidConversionLog, UserData, ExtendedTweetEngagement } from "../types";
import { popularTokens } from "../constants/popularTokens";
import { xApiReferences } from "../constants/xApiReferences";

const ZERO_ADDRESS = ethers.constants.AddressZero;

export default function Admin() {
  const router = useRouter();
  const pathname = usePathname();
  const address = useAddress();
  const switchChain = useSwitchChain();
  const currentChainId = useChainId();
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [isSignerInitialized, setIsSignerInitialized] = useState(false);
  const adminWalletAddresses = process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES?.split(",");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const [unpaidLogsLoading, setUnpaidLogsLoading] = useState(false);
  const [userApprovalLoading, setUserApprovalLoading] = useState(false);
  const [processingLogId, setProcessingLogId] = useState<string | null>(null);
  const [unpaidConversionLogs, setUnpaidConversionLogs] = useState<UnpaidConversionLog[]>([]);
  const [tokenSummary, setTokenSummary] = useState<{ 
    [tokenAddress: string]: { amount: number, chain: Chain } 
  }>({});
  const [activeTab, setActiveTab] = useState("unpaidConversionLogs");
  const [unapprovedUsers, setUnapprovedUsers] = useState<UserData[]>([]);

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
      loadUnapprovedUsers();
    }
  }, [signer, isSignerInitialized]);

  const loadUnpaidConversionLogs = () => {
    setUnpaidLogsLoading(true);
    fetchAllUnpaidConversionLogs()
      .then((logs) => {
        setUnpaidConversionLogs(logs);
        summarizeTokens(logs);
        setUnpaidLogsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching unpaid conversion logs: ", error);
        toast.error("Failed to fetch unpaid conversion logs");
        setUnpaidLogsLoading(false);
      });
  };

  const loadUnapprovedUsers = () => {
    setUserApprovalLoading(true);
    fetchUnapprovedUsers()
      .then((users) => {
        setUnapprovedUsers(users);
        setUserApprovalLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching unapproved users: ", error);
        toast.error("Failed to fetch unapproved users");
        setUserApprovalLoading(false);
      });
  };

  const summarizeTokens = (logs: UnpaidConversionLog[]) => {
    const summary: { [key: string]: { amount: number, chain: Chain } } = {};

    logs.forEach(log => {
      const tokenKey = log.selectedTokenAddress === ZERO_ADDRESS 
        ? `${ZERO_ADDRESS}-${log.selectedChain.chainId}`  // Combine ZERO_ADDRESS with chain ID for uniqueness
        : log.selectedTokenAddress;

      if (!summary[tokenKey]) {
        summary[tokenKey] = { amount: 0, chain: log.selectedChain };
      }
      summary[tokenKey].amount += log.amount;
    });

    setTokenSummary(summary);
  };

  const handlePay = async (log: UnpaidConversionLog) => {
    setProcessingLogId(log.logId);
    try {
      toast.info(`Starting payment process for ${log.logId}...`);

      // Check if the current wallet chain matches the log's chain
      if (currentChainId !== log.selectedChain.chainId) {
        try {
          await switchChain(log.selectedChain.chainId);
        } catch (error) {
          console.error("Failed to switch chains: ", error);
          toast.error("Failed to switch chains");
          return;
        }
      }
      
      // Mark the log as paid to prevent duplicate payments
      await updateIsPaidFlag(log.referralId, log.logId, true);

      let transactionHashAffiliate, transactionHashUser;
      const payoutAmount = log.userWalletAddress ? log.amount / 2 : log.amount;

      try {
        toast.info("Transferring tokens to affiliate...");

        if (log.selectedTokenAddress === ZERO_ADDRESS) {
          // Native token transfer process
          const transactionResponse = await signer!.sendTransaction({
            to: log.affiliateWallet,
            value: ethers.utils.parseEther(payoutAmount.toString()),
            gasLimit: ethers.utils.hexlify(21000),
            gasPrice: await signer!.getGasPrice(),
          });
          transactionHashAffiliate = transactionResponse.hash;
        } else {
          // ERC20 token transfer process
          const erc20 = new ERC20(log.selectedTokenAddress, signer!);
          transactionHashAffiliate = await erc20.transfer(log.affiliateWallet, payoutAmount);
        }
      } catch (error) {
        // If token transfer fails, revert the isPaid flag
        await updateIsPaidFlag(log.referralId, log.logId, false);

        console.error("Failed to transfer tokens: ", error);
        toast.error("Failed to transfer tokens");
        return; // If the token transfer fails, exit the function
      }

      // If referral is enabled, also transfer to user
      if (log.userWalletAddress) {
        try {
          toast.info("Transferring tokens to user...");

          if (log.selectedTokenAddress === ZERO_ADDRESS) {
            // Native token transfer process
            const transactionResponse = await signer!.sendTransaction({
              to: log.userWalletAddress,
              value: ethers.utils.parseEther(payoutAmount.toString()),
              gasLimit: ethers.utils.hexlify(21000),
              gasPrice: await signer!.getGasPrice(),
            });
            transactionHashUser = transactionResponse.hash;
          } else {
            // ERC20 token transfer process
            const erc20 = new ERC20(log.selectedTokenAddress, signer!);
            transactionHashUser = await erc20.transfer(log.userWalletAddress, payoutAmount);
          }
        } catch (error: any) {
          // Log error in the database for later review
          await logErrorToFirestore(
            "UserPaymentError",
            `Failed to transfer tokens to user: ${error.message}`,
            { ...log, transactionHashAffiliate }
          );

          console.error("Failed to transfer tokens to user: ", error);
          toast.error("Failed to transfer tokens to user");
          // We don't revert the isPaid flag here, as the affiliate payment succeeded

          // Set a placeholder "error" string to indicate failure in user payment
          transactionHashUser = "error";
        }
      }

      try {
        toast.info("Updating transaction in Firestore...");
        await processRewardPaymentTransaction(
          log.projectId,
          log.referralId,
          log.logId,
          payoutAmount,
          transactionHashAffiliate,
          log.timestamp,
          transactionHashUser // Optional: it will be passed whether it's defined, "error", or undefined
        );

        toast.success(`Payment processed for ${log.logId}.`);
      } catch (error: any) {
        console.error("Failed to update Firestore: ", error);
        toast.error("Failed to update Firestore");

        await logErrorToFirestore(
          "FirestoreUpdateAfterPaymentError",
          `Failed to update Firestore: ${error.message}`,
          { ...log, transactionHashAffiliate }
        );
      } finally {
        // Regardless of success or failure in Firestore update, remove the log from the list
        setUnpaidConversionLogs(prevLogs => {
          const updatedLogs = prevLogs.filter(l => l.logId !== log.logId);
          summarizeTokens(updatedLogs); // Update token summary
          return updatedLogs;
        });
      }

    } catch (error) {
      console.error("Failed to process payment: ", error);
      toast.error("Failed to process payment");
    } finally {
      setProcessingLogId(null);
    }
  };

  const handleApprove = async (walletAddress: string) => {
    const confirmApproval = window.confirm("Are you sure you want to approve this user?");
    if (!confirmApproval) {
      return;
    }

    try {
      toast.info(`Approving user ${walletAddress}...`);
      
      await approveUser(walletAddress);
  
      // Remove the approved user from the list
      setUnapprovedUsers(prevUsers => prevUsers.filter(user => user.walletAddress !== walletAddress));
    } catch (error: any) {
      console.error("Failed to approve user: ", error);
      toast.error(`Failed to approve user: ${error.message}`);
    }
  };

  // =============== BEGIN TWEET ENGAGEMENT MANAGEMENT ==============
  const [referralIdsForTweetEngagementData, setReferralIdsForTweetEngagementData] = useState("");
  const [engagementDataArray, setEngagementDataArray] = useState<ExtendedTweetEngagement[] | null>(null);
  const [loadingTweetEngagementData, setLoadingTweetEngagementData] = useState(false);

  const handleFetchTweetEngagement = async () => {
    setLoadingTweetEngagementData(true);
    try {
      // Do something...
      console.log(referralIdsForTweetEngagementData);
    } catch (error) {
      console.error("Failed to fetch & update tweet engagement:", error);
    } finally {
      setLoadingTweetEngagementData(false);
    }
  };
  // =============== END TWEET ENGAGEMENT MANAGEMENT ==============

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
          className={`${(activeTab === "unpaidConversionLogs" && unpaidLogsLoading) || (activeTab === "userApproval" && userApprovalLoading) ? "bg-slate-400" : "bg-sky-500 hover:bg-sky-700"} text-white w-[130px] h-[40px] rounded transition`}
          onClick={() => {
            if (activeTab === "unpaidConversionLogs") {
              loadUnpaidConversionLogs();
            } else if (activeTab === "userApproval") {
              loadUnapprovedUsers();
            }
          }}
          disabled={(activeTab === "unpaidConversionLogs" && unpaidLogsLoading) || (activeTab === "userApproval" && userApprovalLoading)}
        >
          {(activeTab === "unpaidConversionLogs" && unpaidLogsLoading) || (activeTab === "userApproval" && userApprovalLoading) ? (
            <Image src={"/assets/common/loading.png"} height={30} width={30} alt="loading.png" className="animate-spin mx-auto" />
          ) : (
            "Reload Data"
          )}
        </button>
      </div>

      <div className="w-11/12 border-b border-slate-400 my-5 overflow-x-auto">
        <ul className="flex w-max">
          <li className={`mr-1 ${activeTab === "unpaidConversionLogs" ? "text-sky-500" : ""}`}>
            <button 
              onClick={() => setActiveTab("unpaidConversionLogs")}
              className={`inline-block py-2 px-4 font-semibold whitespace-nowrap ${activeTab === "unpaidConversionLogs" ? "bg-slate-300 rounded-t-md" : ""}`}
            >
              Unpaid Conversion Logs & Token Summary
            </button>
          </li>
          <li className={`mr-1 ${activeTab === "userApproval" ? "text-sky-500" : ""}`}>
            <button 
              onClick={() => setActiveTab("userApproval")}
              className={`inline-block py-2 px-4 font-semibold whitespace-nowrap ${activeTab === "userApproval" ? "bg-slate-300 rounded-t-md" : ""}`}
            >
              User Approval
            </button>
          </li>
          <li className={`mr-1 ${activeTab === "manualTweetEngagementUpdate" ? "text-sky-500" : ""}`}>
            <button 
              onClick={() => setActiveTab("manualTweetEngagementUpdate")}
              className={`inline-block py-2 px-4 font-semibold whitespace-nowrap ${activeTab === "manualTweetEngagementUpdate" ? "bg-slate-300 rounded-t-md" : ""}`}
            >
              Manual Tweet Engagement Update
            </button>
          </li>
        </ul>
      </div>

      {activeTab === "unpaidConversionLogs" && (
        <>
          {/* Token Summary */}
          <div className="w-11/12">
            <h2 className="text-md sm:text-xl lg:text-2xl font-semibold">Token Summary ({Object.keys(tokenSummary).length})</h2>
            <p className="text-sm text-gray-600">Summary of tokens required for payments.</p>
          </div>
          <div className="overflow-x-auto w-11/12 shadow-md rounded-md my-5">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chain</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {unpaidLogsLoading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-lg text-gray-500">
                      <div className="flex flex-row items-center justify-center gap-5">
                        <Image src={"/assets/common/loading.png"} height={50} width={50} alt="loading.png" className="animate-spin" />
                        Loading..., this may take a while.
                      </div>
                    </td>
                  </tr>
                ) : Object.keys(tokenSummary).length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-lg text-gray-500 text-center">
                      No unpaid conversion logs found.
                    </td>
                  </tr>
                ) : (
                  Object.keys(tokenSummary).map((tokenKey) => (
                    <tr key={tokenKey}>
                      <td className="px-6 py-4">
                        <button 
                          className="flex items-center justify-center p-2 bg-slate-100 hover:bg-slate-200 rounded-md shadow-md transition duration-300 ease-in-out"
                          onClick={() => toast.info(`Selected chain: ${tokenSummary[tokenKey].chain.name}`)}
                        >
                          <Image 
                            src={`/chains/${formatChainName(tokenSummary[tokenKey].chain.name)}.png`} 
                            alt={tokenSummary[tokenKey].chain.name} 
                            width={20} 
                            height={20} 
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {tokenKey.startsWith(`${ZERO_ADDRESS}-`) ? (
                          // If the token key indicates a native token, display "Native Token" with the symbol
                          <span>
                            Native Token ({(popularTokens[tokenSummary[tokenKey].chain.chainId] || []).find(token => token.address === ZERO_ADDRESS)?.symbol})
                          </span>
                        ) : (
                          <Link 
                            href={`${tokenSummary[tokenKey].chain.explorers?.[0]?.url}/address/${tokenKey}`}
                            target="_blank"
                            className="text-blue-500 hover:underline"
                          >
                            {((popularTokens[tokenSummary[tokenKey].chain.chainId] || []).find(token => token.address === tokenKey)?.symbol || "") && (
                              <span className="mr-1">
                                ({popularTokens[tokenSummary[tokenKey].chain.chainId].find(token => token.address === tokenKey)?.symbol})
                              </span>
                            )}
                            {tokenKey}
                          </Link>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{tokenSummary[tokenKey].amount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Unpaid Conversion Logs */}
          <div className="w-11/12">
            <h2 className="text-md sm:text-xl lg:text-2xl font-semibold">Unpaid Conversion Logs ({unpaidConversionLogs.length})</h2>
            <p className="text-sm text-gray-600">List of unpaid conversion logs awaiting payment.</p>
          </div>
          <div className="overflow-x-auto w-11/12 shadow-md rounded-md my-5">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Log ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Affiliate Wallet</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">User Wallet Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chain</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referral ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Conversion ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {unpaidLogsLoading ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-4 text-lg text-gray-500">
                      <div className="flex flex-row items-center justify-center gap-5">
                        <Image src={"/assets/common/loading.png"} height={50} width={50} alt="loading.png" className="animate-spin" />
                        Loading..., this may take a while.
                      </div>
                    </td>
                  </tr>
                ) : unpaidConversionLogs.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-4 text-lg text-gray-500 text-center">
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
                          href={`${log.selectedChain.explorers?.[0]?.url}/address/${log.affiliateWallet}`}
                          target="_blank"
                          className="text-blue-500 hover:underline"
                        >
                          {log.affiliateWallet}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {log.userWalletAddress ? (
                          <Link 
                            href={`${log.selectedChain.explorers?.[0]?.url}/address/${log.userWalletAddress}`}
                            target="_blank"
                            className="text-blue-500 hover:underline"
                          >
                            {log.userWalletAddress}
                          </Link>
                        ) : "N/A"}
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
                      <td className="px-6 py-4">
                        <button 
                          className="flex items-center justify-center p-2 bg-slate-100 hover:bg-slate-200 rounded-md shadow-md transition duration-300 ease-in-out"
                          onClick={() => toast.info(`Selected chain: ${log.selectedChain.name}`)}
                        >
                          <Image 
                            src={`/chains/${formatChainName(log.selectedChain.name)}.png`} 
                            alt={log.selectedChain.name} 
                            width={20} 
                            height={20} 
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {log.selectedTokenAddress === ZERO_ADDRESS ? (
                          // Display "Native Token" with the symbol if the token address is the zero address
                          <span>Native Token ({(popularTokens[log.selectedChain.chainId] || []).find(token => token.address === ethers.constants.AddressZero)?.symbol})</span>
                        ) : (
                          <Link 
                            href={`${log.selectedChain.explorers?.[0]?.url}/address/${log.selectedTokenAddress}`}
                            target="_blank"
                            className="text-blue-500 hover:underline"
                          >
                            {((popularTokens[log.selectedChain.chainId] || []).find(token => token.address === log.selectedTokenAddress)?.symbol || "") && (
                              <span className="mr-1">
                                ({popularTokens[log.selectedChain.chainId].find(token => token.address === log.selectedTokenAddress)?.symbol})
                              </span>
                            )}
                            {log.selectedTokenAddress}
                          </Link>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {log.userWalletAddress ? (
                          `${log.amount} (${log.amount / 2} for each)`
                        ) : (
                          log.amount
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{log.referralId}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{log.conversionId}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <button 
                          className={`bg-sky-500 hover:bg-sky-700 hover:shadow-lg text-white px-3 py-1 rounded ${processingLogId === log.logId ? "cursor-not-allowed opacity-50" : ""}`}
                          onClick={() => handlePay(log)}
                          disabled={processingLogId === log.logId}
                        >
                          {processingLogId === log.logId ? (
                            <div className="flex items-center pr-4 gap-2">
                              <Image src={"/assets/common/loading.png"} height={20} width={20} alt="loading" className="animate-spin" />
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
        </>
      )}

      {activeTab === "userApproval" && (
        <>
          <div className="w-11/12">
            <h2 className="text-md sm:text-xl lg:text-2xl font-semibold">User Approval</h2>
            <p className="text-sm text-gray-600">List of users awaiting approval.</p>
          </div>
          {/* Unapproved Users */}
          <div className="overflow-x-auto w-11/12 shadow-md rounded-md my-5">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">X Profile URL</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userApprovalLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-lg text-gray-500">
                      <div className="flex flex-row items-center justify-center gap-5">
                        <Image src={"/assets/common/loading.png"} height={50} width={50} alt="loading.png" className="animate-spin" />
                        Loading..., this may take a while.
                      </div>
                    </td>
                  </tr>
                ) : unapprovedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-lg text-gray-500 text-center">
                      No users awaiting approval.
                    </td>
                  </tr>
                ) : (
                  unapprovedUsers.map((user) => (
                    <tr key={user.walletAddress}>
                      <td className="px-6 py-4 text-sm text-gray-900">{user.username}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <Link 
                          href={`mailto:${user.email}`}
                          target="_blank"
                          className="text-blue-500 hover:underline"
                        >
                          {user.email}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <Link 
                          href={user.xProfileUrl}
                          target="_blank"
                          className="text-blue-500 hover:underline"
                        >
                          {user.xProfileUrl}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{user.walletAddress}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{user.createdAt.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <button 
                          className="bg-green-500 hover:bg-green-700 hover:shadow-lg text-white px-3 py-1 rounded"
                          onClick={() => handleApprove(user.walletAddress!)}
                        >
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === "manualTweetEngagementUpdate" && (
        <>
          <div className="w-11/12">
            <h2 className="text-md sm:text-xl lg:text-2xl font-semibold">Manually update Tweet engagement data</h2>
            <p className="text-sm text-gray-600">Enter specific Referral IDs to manually retrieve and update the latest engagement data.</p>
            <p className="text-lg text-red-500 font-bold underline mt-2">
              Note: X API allows up to 10,000 engagement data retrievals per month. Be mindful of the usage limits.
            </p>
            {/* Display buttons for API references */}
            <div className="mt-5 flex flex-row gap-2">
              {xApiReferences.map((ref, index) => (
                <a
                  key={index}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-orange-300 py-2 px-4 rounded-lg shadow-md text-center hover:bg-orange-500 transition"
                >
                  {ref.title}
                </a>
              ))}
            </div>
          </div>

          {/* Referral IDs input section */}
          <div className="w-11/12 mt-5">
            <div className="flex flex-col lg:flex-row gap-4">
              <input 
                type="text" 
                placeholder="Enter referral IDs separated by commas, e.g. n1L5kdmanZzOlMQs20wH,C2xmmXIW0p8tqki4IVFG"
                className="border border-gray-300 p-2 rounded w-full lg:w-2/3 outline-none" 
                value={referralIdsForTweetEngagementData} 
                onChange={(e) => setReferralIdsForTweetEngagementData(e.target.value)}
              />
              <button 
                className={`bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded ${!referralIdsForTweetEngagementData ? "opacity-50 cursor-not-allowed" : ""}`} 
                onClick={handleFetchTweetEngagement}
                disabled={!referralIdsForTweetEngagementData}
              >
                Fetch & Update
              </button>
            </div>
          </div>

          {/* Update result display area */}
          {loadingTweetEngagementData ? (
            <div className="flex justify-center items-center my-5">
              <Image src="/assets/common/loading.png" alt="loading" width={50} height={50} className="animate-spin" />
            </div>
          ) : engagementDataArray ? (
            <div className="w-11/12 mt-5 mb-10 bg-gray-100 p-5 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Tweet Engagement Data <span className="text-sm">({engagementDataArray[0].fetchedAt.toLocaleString()})</span></h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-md shadow-md">
                  <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                    <tr>
                      <th className="py-3 px-6 text-right whitespace-nowrap">Referral Id</th>
                      <th className="py-3 px-6 text-right whitespace-nowrap">Tweet</th>
                      <th className="py-3 px-6 text-right whitespace-nowrap">Retweet</th>
                      <th className="py-3 px-6 text-right whitespace-nowrap">Like</th>
                      <th className="py-3 px-6 text-right whitespace-nowrap">Reply</th>
                      <th className="py-3 px-6 text-right whitespace-nowrap">Quote</th>
                      <th className="py-3 px-6 text-right whitespace-nowrap">Impression</th>
                      <th className="py-3 px-6 text-right whitespace-nowrap">Bookmark</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700 text-sm">
                    {engagementDataArray.map((data, index) => (
                      <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                        <td className="py-3 px-6 text-right">{data.referralId}</td>
                        <td className="py-3 px-6 text-right">
                          {data.tweetUrl ? (
                            <a 
                              href={data.tweetUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                            >
                              <Image 
                                src="/brand-assets/x.png" 
                                alt="Open Tweet" 
                                width={16} 
                                height={16} 
                                className="inline-block mr-2"
                              />
                            </a>
                          ) : (
                            <span className="text-gray-500">Not Submitted</span>
                          )}
                        </td>
                        <td className="py-3 px-6 text-right">{data.retweetCount}</td>
                        <td className="py-3 px-6 text-right">{data.likeCount}</td>
                        <td className="py-3 px-6 text-right">{data.replyCount}</td>
                        <td className="py-3 px-6 text-right">{data.quoteCount}</td>
                        <td className="py-3 px-6 text-right">{data.impressionCount}</td>
                        <td className="py-3 px-6 text-right">{data.bookmarkCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-md text-gray-600 my-5">No Data Yet...</p>
          )}
        </>
      )}

    </div>
  );
};
