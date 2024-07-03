import { ProjectType } from "../types";

export const projectTypes = [
  // Temporarily hiding the "Direct Payment" option from the project type selection.
  // This can be re-enabled by uncommenting the corresponding section below.
  // {
  //   type: "DirectPayment" as ProjectType,
  //   src: "/direct-payment.png",
  //   alt: "Direct Payment",
  //   title: "Direct Payment",
  //   description: "Manage payments directly with your own external account (EOA), manually updating budget and slots."
  // },
  {
    type: "EscrowPayment" as ProjectType,
    src: "/escrow-payment.png",
    alt: "Escrow Payment",
    title: "Escrow Payment",
    description: "Use an escrow service for automated payments and secure transactions via API calls from the escrow contract."
  }
];