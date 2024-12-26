// List of language options with labels for display and values for selection
export const languageOptions = [
  { label: "English", value: "en" },
  { label: "日本語", value: "ja" },
];

// Navigation links used in the main navbar
export const navLinks = [
  { id: "#", label: "Home" },
  { id: "#about", label: "About" },
  { id: "#achievements", label: "Achievements" },
  { id: "#clients", label: "Our Clients" },
  { id: "#faq", label: "FAQ" },
];

// Define the structure for role-specific content.
// This allows dynamic content management for different user roles.
type RoleContent = Record<string, any>;

// Define the structure for the homepage content.
// It supports multilingual data (language) and role-specific content (affiliate, projectOwner).
type HomepageContent = {
  [language: string]: {
    affiliate: RoleContent;
    projectOwner: RoleContent;
  };
};

// Homepage content data structure
// - Supports multiple languages (e.g., "en", "ja").
// - Includes role-specific sections for "affiliate" and "projectOwner".
// - Each role has a set of sections, such as "hero".
export const homepageContent: HomepageContent = {
  en: {
    affiliate: {
      hero: {
        titleLine1: "Ready to Amplify",
        titleLine2: "Your Influence?",
        subtitle: "Elevate your influence and connect with impactful audiences",
        descriptionLine1: "Collaborate with Qube to access a powerful network for gaming brands.",
        descriptionLine2: "Amplify your reach and strengthen your presence in the Web3 world.",
      },
      about1: {
        title1: "Connect with ",
        title2: "",
        title3: "the top web3 games",
        description: "Get an opportunity to work with the best games in this industry now.",
        image: "/assets/homepage/image-4.png",
      },
      about2: {
        title1: "Turn your influence ",
        title2: "into revenue",
        description: "Have you built a thriving community without knowing how to generate income? We're here to support you!",
        image: "/assets/homepage/image-5.png",
      },
      about3: {
        title1: "Track Your Impact ",
        title2: "with Qube Analytics",
        description: "Track engagement, reach, and conversions to measure success and optimize future strategies. Make data-driven decisions to maximize your community's impact.",
        image: "/assets/homepage/image-6.png",
      },
      achievements: {
        title: "Achievements",
        items: [
          { count: "3,000+", label: "Registered Affiliates" },
          { count: "2,000,000+", label: "Gamers Reach" },
          { count: "11,000+", label: "Onboarding Users" },
        ],
      },
      clients: {
        title: "Our Clients",
      },
      faq: {
        title: "Frequently Asked Questions",
        items: [
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
        ],
      },
      contactUs: {
        message: "Let&apos;s grab some<br />time and explore!",
        buttonLabel: "Contact Us",
      },
    },
    projectOwner: {
      hero: {
        titleLine1: "Drive Acquisition,",
        titleLine2: "Amplify Revenue",
        subtitle: "Ready to Grow with a Network that Rewards Results?",
        descriptionLine1: "Our network connects you with gaming influencers and guilds across Asia,",
        descriptionLine2: "enabling large-scale audience reach and conversion.",
      },
      about1: {
        title1: "Build Partnerships",
        title2: "that",
        title3: "Amplify your reach",
        description: "Identify the best KOL/Guild/Community with audiences aligned to enhance your game growth.",
        image: "/assets/homepage/image-1.png",
      },
      about2: {
        title1: "Pay Only for ",
        title2: "Measurable Results",
        description: "Benefit from a performance-based model where you only pay for successful conversions and measurable outcomes.",
        image: "/assets/homepage/image-2.png",
      },
      about3: {
        title1: "Access Campaign ",
        title2: "Analytics & Reporting",
        description: "Identify best KOL/Guild/Community with audiences aligned to enhance your game growth.",
        image: "/assets/homepage/image-3.png",
      },
      achievements: {
        title: "Achievements",
        items: [
          { count: "3,000+", label: "Registered Affiliates" },
          { count: "2,000,000+", label: "Gamers Reach" },
          { count: "11,000+", label: "Onboarding Users" },
        ],
      },
      clients: {
        title: "Our Clients",
      },
      faq: {
        title: "Frequently Asked Questions",
        items: [
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
        ],
      },
      contactUs: {
        message: "Let&apos;s grab some<br />time and explore!",
        buttonLabel: "Contact Us",
      },
    },
  },
};

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

// Social media links for the footer or other sections
export const socialMediaLinks = [
  { src: "/brand-assets/x-white.png", alt: "X", url: "https://x.com/0xQube", size: 17 },
  { src: "/brand-assets/discord-white.png", alt: "Discord", url: "https://discord.gg/xXbRG2WQdD", size: 25 },
  { src: "/brand-assets/telegram-white.png", alt: "Telegram", url: "https://t.me/qubexyz", size: 25 },
];

// Footer links categorized under "Company" and "Help"
export const footerLinks = {
  "Company": [
    { url: "#", label: "Home" },
    // Keeping about link commented out for future use
    // { url: "https://qube2-succery.vercel.app/corporate", label: "About" },
    { url: "https://docs.google.com/forms/d/1csWLltBq0j3ddaiDv5W3iAndu2v5YZ1QfTQpULWIUP8/prefill", label: "Contact" },
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