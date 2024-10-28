export type ImageType = "logo" | "cover" | "embeds";

export type PreviewData = {
  logoPreview: string;
  coverPreview: string;
  // ==============================================
  // This code manages the embed images feature for affiliates to select and display ads within projects.
  // Temporarily disabled on [2024-10-28] in version [v2.29.6] (Issue #1426).
  // Uncomment to re-enable the embed images feature in the future.
  // embedPreviews: string[];
  // ==============================================
};