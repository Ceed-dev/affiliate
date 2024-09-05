export type WhitelistedAddress = {
  redirectUrl: string;
  rewardAmount: number;
}

export type WhitelistEntry = {
  address: string;
  details: WhitelistedAddress;
}