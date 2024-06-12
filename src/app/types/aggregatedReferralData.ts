import { ExtendedReferralData } from "./extendedReferralData";

export type AggregatedReferralData = ExtendedReferralData & {
  aggregatedEarnings: number;
  aggregatedConversions: number;
  aggregatedLastConversionDate: Date | null;
};