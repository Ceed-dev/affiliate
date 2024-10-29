// Project types for selection during the project creation process
import { ProjectType } from "../types";

export const projectTypes = [
  // Temporarily hiding the "Direct Payment" option from the project type selection.
  // This can be re-enabled by uncommenting the corresponding section below.
  // {
  //   type: "DirectPayment" as ProjectType,
  //   src: "/assets/common/direct-payment.png",
  //   alt: "Direct Payment",
  //   title: "Direct Payment",
  //   description: "Manage payments directly with your own external account (EOA), manually updating budget and slots."
  // },
  {
    type: "EscrowPayment" as ProjectType,
    src: "/assets/common/escrow-payment.png",
    alt: "Escrow Payment",
    title: "Escrow Payment",
    description: "Use an escrow service for automated payments and secure transactions via API calls from the escrow contract."
  }
];

// Project creation steps used during the project creation process
export const projectCreationSteps = [
  "Type",
  "Details",
  "Socials",
  "Logo",
  // ==============================================
  // This code manages the embed images feature for affiliates to select and display ads within projects.
  // Temporarily disabled on [2024-10-28] in version [v2.29.6] (Issue #1426).
  // Uncomment to re-enable the embed images feature in the future.
  // Display "Media" step only if ProjectType is null or EscrowPayment
  // "Media",
  // ==============================================
  "Affiliates",
];