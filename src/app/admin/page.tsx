"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAddress, useSwitchChain, useChainId } from "@thirdweb-dev/react";
import { Chain } from "@thirdweb-dev/chains";
import { toast } from "react-toastify";
import { ethers } from "ethers";

// Import utility functions and contract-related functions
import { 
  fetchAllUnpaidConversionLogs, processRewardPaymentTransaction, logErrorToFirestore, 
  updateIsPaidFlag, fetchUnapprovedUsers, approveUser, fetchReferralData, updateTweetEngagement,
} from "../utils/firebase";
import { initializeSigner, ERC20 } from "../utils/contracts";

// Import component types
import { 
  UnpaidConversionLog, UserData, ExtendedTweetEngagement, ReferralData, ActiveTab,
} from "../types";

// Import UI components
import { 
  Header, AdminHeaderWithReloadButton, AdminTabs, TokenSummary, UnpaidConversionLogs,
  UserApproval, ManualTweetEngagementUpdate,
} from "../components/admin";

const ZERO_ADDRESS = ethers.constants.AddressZero; // Constant for zero address

export default function Admin() {
  const router = useRouter();
  const pathname = usePathname();
  const address = useAddress();
  const switchChain = useSwitchChain();
  const currentChainId = useChainId();
  
  // Signer-related state
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [isSignerInitialized, setIsSignerInitialized] = useState(false);

  // Admin wallet addresses fetched from environment variables
  const adminWalletAddresses = process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESSES?.split(",");

  // Loading states for unpaid logs and user approvals
  const [unpaidLogsLoading, setUnpaidLogsLoading] = useState(false);
  const [userApprovalLoading, setUserApprovalLoading] = useState(false);

  // State for processing a specific unpaid conversion log
  const [processingLogId, setProcessingLogId] = useState<string | null>(null);

  // State for unpaid conversion logs and token summary
  const [unpaidConversionLogs, setUnpaidConversionLogs] = useState<UnpaidConversionLog[]>([]);
  const [tokenSummary, setTokenSummary] = useState<{ 
    [tokenAddress: string]: { amount: number, chain: Chain } 
  }>({});

  // Active tab management
  const [activeTab, setActiveTab] = useState<ActiveTab>("unpaidConversionLogs");

  // State for unapproved users
  const [unapprovedUsers, setUnapprovedUsers] = useState<UserData[]>([]);

  // ========================= BEGIN HOOKS & EFFECTS =========================

  // Effect to handle routing and signer initialization based on user address and permissions
  useEffect(() => {
    if (!address) {
      // Redirect to onboarding if not connected
      if (pathname !== "/onboarding") {
        router.push("/onboarding");
        toast.error("You must be connected to access this page");
      }
      return;
    }

    // Check if the user has admin permissions
    if (!adminWalletAddresses?.map(addr => addr.toLowerCase()).includes(address!.toLowerCase())) {
      if (pathname !== "/onboarding") {
        router.push("/onboarding");
        toast.error("You do not have permission to access this page");
      }
      return;
    }

    // Initialize signer if not already done
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

  // Effect to load unpaid logs and unapproved users after signer initialization
  useEffect(() => {
    if (signer && isSignerInitialized) {
      loadUnpaidConversionLogs();
      loadUnapprovedUsers();
    }
  }, [signer, isSignerInitialized]);

  // ========================= END HOOKS & EFFECTS =========================

  // ========================= BEGIN LOAD FUNCTIONS =========================

  // Function to load unpaid conversion logs and update token summary
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

  // Function to load unapproved users
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

  // Function to summarize token data from unpaid conversion logs
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

  // ========================= END LOAD FUNCTIONS =========================

  // ========================= BEGIN PAYMENT HANDLING =========================

  // Function to handle payment of an unpaid conversion log
  const handlePay = async (log: UnpaidConversionLog) => {
    setProcessingLogId(log.logId);
    try {
      toast.info(`Starting payment process for ${log.logId}...`);

      // Switch chain if necessary
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

      // Process payment
      let transactionHashAffiliate, transactionHashUser;
      const payoutAmount = log.userWalletAddress ? log.amount / 2 : log.amount;

      try {
        toast.info("Transferring tokens to affiliate...");

        // Handle native token transfers
        if (log.selectedTokenAddress === ZERO_ADDRESS) {
          const transactionResponse = await signer!.sendTransaction({
            to: log.affiliateWallet,
            value: ethers.utils.parseEther(payoutAmount.toString()),
            gasLimit: ethers.utils.hexlify(21000),
            gasPrice: await signer!.getGasPrice(),
          });
          transactionHashAffiliate = transactionResponse.hash;
        } else {
          // Handle ERC20 token transfers
          const erc20 = new ERC20(log.selectedTokenAddress, signer!);
          transactionHashAffiliate = await erc20.transfer(log.affiliateWallet, payoutAmount);
        }
      } catch (error) {
        // Revert the isPaid flag if payment fails
        await updateIsPaidFlag(log.referralId, log.logId, false);
        console.error("Failed to transfer tokens: ", error);
        toast.error("Failed to transfer tokens");
        return;
      }

      // Handle user payment if applicable
      if (log.userWalletAddress) {
        try {
          toast.info("Transferring tokens to user...");
          if (log.selectedTokenAddress === ZERO_ADDRESS) {
            const transactionResponse = await signer!.sendTransaction({
              to: log.userWalletAddress,
              value: ethers.utils.parseEther(payoutAmount.toString()),
              gasLimit: ethers.utils.hexlify(21000),
              gasPrice: await signer!.getGasPrice(),
            });
            transactionHashUser = transactionResponse.hash;
          } else {
            const erc20 = new ERC20(log.selectedTokenAddress, signer!);
            transactionHashUser = await erc20.transfer(log.userWalletAddress, payoutAmount);
          }
        } catch (error: any) {
          // Log error if user payment fails
          await logErrorToFirestore("UserPaymentError", `Failed to transfer tokens to user: ${error.message}`, { ...log, transactionHashAffiliate });
          console.error("Failed to transfer tokens to user: ", error);
          toast.error("Failed to transfer tokens to user");
          transactionHashUser = "error";
        }
      }

      // Update Firestore with the payment information
      try {
        toast.info("Updating transaction in Firestore...");
        await processRewardPaymentTransaction(
          log.projectId, log.referralId, log.logId, payoutAmount,
          transactionHashAffiliate, log.timestamp, transactionHashUser
        );
        toast.success(`Payment processed for ${log.logId}.`);
      } catch (error: any) {
        console.error("Failed to update Firestore: ", error);
        toast.error("Failed to update Firestore");
        await logErrorToFirestore("FirestoreUpdateAfterPaymentError", `Failed to update Firestore: ${error.message}`, { ...log, transactionHashAffiliate });
      } finally {
        // Remove the processed log from the list
        setUnpaidConversionLogs(prevLogs => {
          const updatedLogs = prevLogs.filter(l => l.logId !== log.logId);
          summarizeTokens(updatedLogs);
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

  // ========================= END PAYMENT HANDLING =========================

  // ========================= BEGIN USER APPROVAL HANDLING =========================

  // Function to approve a user based on wallet address
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

  // ========================= END USER APPROVAL HANDLING =========================

  // ========================= BEGIN TWEET ENGAGEMENT MANAGEMENT =========================

  const [referralIdsForTweetEngagementData, setReferralIdsForTweetEngagementData] = useState("");
  const [engagementDataArray, setEngagementDataArray] = useState<ExtendedTweetEngagement[] | null>(null);
  const [loadingTweetEngagementData, setLoadingTweetEngagementData] = useState(false);

  const handleFetchTweetEngagement = async () => {
    setLoadingTweetEngagementData(true);
    
    try {
      toast.info("Fetching Tweet engagement data...");
  
      // Convert comma-separated Referral IDs to array
      const referralIdsArray = referralIdsForTweetEngagementData
        .split(",")
        .map(id => id.trim())
        .filter(id => id !== "");
  
      const referralDataPromises = referralIdsArray.map(async (referralId) => {
        try {
          return await fetchReferralData(referralId);
        } catch (error) {
          return null; // Skip invalid or failed referral ID
        }
      });
  
      const referralDataResults = await Promise.allSettled(referralDataPromises);
  
      const validReferralDataResults = referralDataResults
        .filter((result): result is PromiseFulfilledResult<ReferralData | null> => result.status === "fulfilled" && result.value !== null)
        .map(result => result.value as ReferralData);
  
      const tweetIds = validReferralDataResults
        .map(referralData => {
          // const tweetUrl = referralData.tweetUrl;
          const tweetUrl = "";
          const tweetIdMatch = tweetUrl?.match(/status\/(\d+)/);
          if (!tweetIdMatch || !tweetIdMatch[1]) {
            console.error(`Invalid tweet URL for referral ID: ${referralData.id}`);
            return null;
          }
          return { tweetId: tweetIdMatch[1], tweetUrl, referralId: referralData.id! };
        })
        .filter(tweetData => tweetData !== null);
  
      const batchSize = 100;
      const batchedTweetData: ExtendedTweetEngagement[] = [];
  
      for (let i = 0; i < tweetIds.length; i += batchSize) {
        const tweetBatch = tweetIds.slice(i, i + batchSize);
        const tweetIdsBatch = tweetBatch.map(data => data!.tweetId).join(",");
  
        const response = await fetch(`/api/fetchTweetEngagement?tweetIds=${tweetIdsBatch}`, {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_X_API_BEARER_TOKEN as string,
          },
        });
  
        if (!response.ok) {
          console.error(`Error fetching tweet engagement data: ${response.statusText}`);
          toast.error(`Error fetching tweet engagement data: ${response.statusText}`);
          continue;
        }
  
        const engagementDataResponse = await response.json();
        const engagementDataArray = engagementDataResponse.data;
  
        tweetBatch.forEach((tweetData) => {
          if (tweetData) {
            const matchingData = engagementDataArray.find((engagement: { id: string }) => engagement.id === tweetData.tweetId);
            if (matchingData) {
              const engagementData = matchingData.public_metrics;
              batchedTweetData.push({
                referralId: tweetData.referralId,
                tweetUrl: tweetData.tweetUrl ?? "",
                retweetCount: engagementData.retweet_count,
                replyCount: engagementData.reply_count,
                likeCount: engagementData.like_count,
                quoteCount: engagementData.quote_count,
                bookmarkCount: engagementData.bookmark_count,
                impressionCount: engagementData.impression_count,
                fetchedAt: new Date(),
              });
            }
          }
        });
      }
  
      if (batchedTweetData.length === 0) {
        setEngagementDataArray(null);
        toast.warn("No engagement data found for the provided Tweet IDs.");
      } else {
        setEngagementDataArray(batchedTweetData);
        try {
          await updateTweetEngagement(batchedTweetData);
          toast.success("Tweet engagement data successfully updated in Firestore.");
        } catch (error) {
          console.error("Error updating Firestore with Tweet engagement data:", error);
          toast.error("Failed to update Firestore with Tweet engagement data.");
        }
      }
  
      setReferralIdsForTweetEngagementData("");
  
    } catch (error) {
      console.error("Failed to fetch & update tweet engagement:", error);
      toast.error("Failed to fetch & update Tweet engagement data.");
    } finally {
      setLoadingTweetEngagementData(false);
    }
  };

  // ========================= END TWEET ENGAGEMENT MANAGEMENT =========================

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* Header component */}
      <Header address={address ?? null} />
      
      {/* Admin header with reload buttons */}
      <AdminHeaderWithReloadButton
        activeTab={activeTab}
        unpaidLogsLoading={unpaidLogsLoading}
        userApprovalLoading={userApprovalLoading}
        loadUnpaidConversionLogs={loadUnpaidConversionLogs}
        loadUnapprovedUsers={loadUnapprovedUsers}
      />

      {/* Admin tabs component */}
      <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Render components based on active tab */}
      {activeTab === "unpaidConversionLogs" && (
        <>
          <TokenSummary tokenSummary={tokenSummary} unpaidLogsLoading={unpaidLogsLoading} />
          <UnpaidConversionLogs
            unpaidConversionLogs={unpaidConversionLogs}
            unpaidLogsLoading={unpaidLogsLoading}
            processingLogId={processingLogId}
            handlePay={handlePay}
          />
        </>
      )}

      {activeTab === "userApproval" && (
        <UserApproval
          userApprovalLoading={userApprovalLoading}
          unapprovedUsers={unapprovedUsers}
          handleApprove={handleApprove}
        />
      )}

      {activeTab === "manualTweetEngagementUpdate" && (
        <ManualTweetEngagementUpdate
          referralIdsForTweetEngagementData={referralIdsForTweetEngagementData}
          setReferralIdsForTweetEngagementData={setReferralIdsForTweetEngagementData}
          handleFetchTweetEngagement={handleFetchTweetEngagement}
          loadingTweetEngagementData={loadingTweetEngagementData}
          engagementDataArray={engagementDataArray}
        />
      )}
    </div>
  );
};