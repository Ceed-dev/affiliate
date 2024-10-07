export type UserRole = "ProjectOwner" | "Affiliate";

export type AffiliateInfo = {
  username: string;
  email: string;
  role: UserRole;
  projectUrl?: string;
  xProfileUrl?: string;
};