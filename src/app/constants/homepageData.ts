// Navigation links used in the main navbar
export const navLinks = [
  { id: "#", label: "Home" },
  { id: "#about", label: "About" },
  { id: "#achievements", label: "Achievements" },
  { id: "#clients", label: "Our Clients" },
  { id: "#faq", label: "FAQ" },
];

// List of trusted partners and their logos
export const trustedPartners = [
  { logoUrl: "/brand-assets/double-jump-tokyo.png", name: "doublejump.tokyo" },
  { logoUrl: "/brand-assets/gumi.png", name: "gumi" },
  { logoUrl: "/brand-assets/game-swift.png", name: "Game Swift" },
  { logoUrl: "/chains/oasys.png", name: "Oasys" },
  { logoUrl: "/chains/arbitrum.png", name: "Arbitrum" },
];

// Calendly link used for scheduling meetings
export const calendlyLink = "https://calendly.com/badhan998877/badhan-meeting";

// Achievements to display in the "Achievements" section
export const achievements = [
  { count: "3,000+", label: "Registered Affiliates" },
  { count: "2,000,000+", label: "Gamers Reach" },
  { count: "11,000+", label: "Onboarding Users" },
];

// Client logos to display in the "Our Clients" section
export const clientLogos = [
  "/brand-assets/dark-blood-reborn.png",
  "/brand-assets/snpit.png",
  "/brand-assets/oshi3.png",
  "/brand-assets/farcana.png",
  "/brand-assets/starheroes.png",
  "/brand-assets/champions-tcg.png",
  "/brand-assets/buddy-arena.png",
  "/brand-assets/chain-colosseum-phoenix.png",
];

// Frequently Asked Questions (FAQ) section content
export const faqs = [
  {
    question: "How does your affiliate vetting process work?",
    answer: "We rigorously vet affiliates to ensure quality and reputation. Each applicant is evaluated on audience demographics, content quality, past performance, and adherence to our guidelines. Only top-tier affiliates with proven track records are approved.",
  },
  {
    question: "Can I run customized affiliate campaigns?",
    answer: "Absolutely. You can customize the affiliate campaigns based on your goals, target audience, and reward structures. Launch an unique affiliate campaign only for your project and maximize the output.",
  },
  {
    question: "What kind of support do you provide?",
    answer: "We are here to support you with the entire process. We will help you from planning the campaign to execution including technical support.",
  },
  {
    question: "How are affiliate payouts handled?",
    answer: "Our platform supports secure payouts in both fiat and cryptocurrencies. Affiliates can choose their payout method, with all transactions recorded on the blockchain for transparency.",
  },
];

// Social media links for the footer or other sections
export const socialMediaLinks = [
  { src: "/brand-assets/x/black.png", alt: "X", url: "https://x.com/0xQube" },
];

// Footer links categorized under "Company" and "Help"
export const footerLinks = {
  "Company": [
    { url: "#", label: "Home" },
    // Keeping about link commented out for future use
    // { url: "https://qube2-succery.vercel.app/corporate", label: "About" },
    { url: "mailto:official@ceed.cloud", label: "Contact" },
    { url: "#", label: "Career (Coming Soon)" },
  ],
  "Help": [
    { url: `${calendlyLink}`, label: "Book Demo" },
    {
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/terms-and-conditions`,
      label: "Terms and Conditions",
    },
    {
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/privacy-policy`,
      label: "Privacy Policy",
    },
  ],
};