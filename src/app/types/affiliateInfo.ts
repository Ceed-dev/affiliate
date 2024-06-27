export type UserRole = "ProjectOwner" | "Affiliate";

export type AffiliateInfo = {
  username: string;
  email: string;
  xProfileUrl: string;
  role: UserRole;
};