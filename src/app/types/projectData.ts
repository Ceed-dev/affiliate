import { WhitelistedAddress } from ".";

type BaseProjectData = {
  id?: string;
  projectName: string;
  description: string;
  selectedTokenAddress: string;
  logo: string | null;
  cover: string | null;
  websiteUrl: string;
  xUrl: string;
  discordUrl: string;
  ownerAddresses: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type DirectPaymentProjectData = BaseProjectData & {
  projectType: "DirectPayment";
  whitelistedAddresses: { [address: string]: WhitelistedAddress };
  slots: {
    total: number;
    remaining: number;
  };
  budget: {
    total: number;
    remaining: number;
  };
  deadline: Date | null;
};

export type EscrowPaymentProjectData = BaseProjectData & {
  projectType: "EscrowPayment";
  rewardAmount: number;
  redirectUrl: string;
  totalPaidOut: number;
  lastPaymentDate: Date | null;
  embed: string | null;
};

export type ProjectData = DirectPaymentProjectData | EscrowPaymentProjectData;
