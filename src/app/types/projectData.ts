export type ProjectData = {
  id?: string;
  projectName: string;
  slug: string;
  description: string;
  selectedToken: string;
  rewardAmount: number;
  redirectUrl: string;
  logo: string | null;
  cover: string | null;
  websiteUrl: string;
  discordUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  ownerAddress: string;
  affiliateAddress: string[];
  createdAt: Date;
  updatedAt: Date;
};