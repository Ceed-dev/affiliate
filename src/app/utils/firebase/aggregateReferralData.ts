import { fetchConversionLogsForReferrals } from "./fetchConversionLogsForReferrals";
import { ExtendedReferralData, ConversionLog, AggregatedReferralData } from "../../types";
import { toast } from "react-toastify";

export const aggregateReferralData = async (referrals: ExtendedReferralData[]): Promise<AggregatedReferralData[]> => {
  try {
    const updatedReferrals = await Promise.all(
      referrals.map(async (referral) => {
        const conversionLogs: ConversionLog[] = [];
        await fetchConversionLogsForReferrals([referral], (logs: ConversionLog[]) => {
          conversionLogs.push(...logs);
        });

        const totalAmount = conversionLogs.reduce((sum, log) => sum + log.amount, 0);
        const totalConversions = conversionLogs.length;
        const lastConversionDate = conversionLogs.reduce((latest, log) => {
          return log.timestamp > latest ? log.timestamp : latest;
        }, new Date(0));

        return {
          ...referral,
          aggregatedEarnings: totalAmount,
          aggregatedConversions: totalConversions,
          aggregatedLastConversionDate: lastConversionDate > new Date(0) ? lastConversionDate : null,
        };
      })
    );

    return updatedReferrals;
  } catch (error: any) {
    console.error("Failed to fetch conversion logs: ", error);
    toast.error("Failed to fetch conversion logs: " + error.message);
    throw error;
  }
};
