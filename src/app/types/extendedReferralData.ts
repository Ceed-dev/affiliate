import { ReferralData } from "./referralData";
import { ClickData } from "./clickData";

export type ExtendedReferralData = ReferralData & {
  username: string;
  clicks: ClickData[];
};