// List of language options with labels for display and values for selection
export const languageOptions = [
  { label: "English", value: "en" },
  { label: "日本語", value: "ja" },
];

// Navigation links used in the main navbar
export const navLinks = [
  { id: "#", label: "Home" },
  { id: "about", label: "About" },
  { id: "why-us", label: "Why us" },
  { id: "achievements", label: "Achievements" },
];

// Key statistics representing the platform's reach and user engagement
export const statsData = [
  { title: "Registered Affiliates", value: "3,000+" },
  { title: "Gamers Reach", value: "1,700,000+" },
  { title: "Onboarding Users", value: "700,000+" },
  { title: "TG Game & LINE Games", value: "1,000,000+" }
];

// List of trusted partners and their logos
export const trustedPartners = [
  { src: "/brand-assets/double-jump-tokyo.png", name: "doublejump.tokyo" },
  { src: "/brand-assets/gumi.png", name: "gumi" },
  { src: "/brand-assets/game-swift.png", name: "Game Swift" },
  { src: "/brand-assets/kaia.png", name: "Kaia" },
  { src: "/chains/arbitrum.png", name: "Arbitrum" },
];

// Partner data categorized by type
export const partnersData = {
  Game: [
    { name: "VMG.ron", country: "Philippines", role: "Streamer", followers: "340k+ Follower", image: "/assets/homepage/kol/game/1.png" },
    { name: "marksenpai26", country: "Philippines", role: "Tutorial", followers: "142k+ Follower", image: "/assets/homepage/kol/game/2.png" },
    { name: "VLADRAX", country: "Philippines", role: "Streamer", followers: "13k+ Follower", image: "/assets/homepage/kol/game/3.png" },
    { name: "Elisa", country: "France & Spain", role: "Streamer", followers: "50k+ Follower", image: "/assets/homepage/kol/game/4.png" },
  ],
  NFT: [
    { name: "David", country: "Vietnam", role: "Creator", followers: "15k+ Follower", image: "/assets/homepage/kol/nft/1.png" },
    { name: "kasotukun", country: "Japan", role: "Creator", followers: "41k+ Follower", image: "/assets/homepage/kol/nft/2.png" },
    { name: "DzT DAO", country: "Japan", role: "Creator", followers: "28k+ Follower", image: "/assets/homepage/kol/nft/3.png" },
  ],
  Meme: [],
  DeFi: [],
};

// KOL/Guilds
export const kolGuildData = [
  { image: "/assets/homepage/game/beacon.png", name: "Beacon" },
  { image: "/assets/homepage/game/pirate-nation.png", name: "Pirate Nation" },
  { image: "/assets/homepage/game/counter-fire.png", name: "Counter Fire" },
  { image: "/assets/homepage/game/king-of-destiny.png", name: "King Of Destiny" },
];

// Features displayed for publishers
export const features = [
  { icon: "/assets/homepage/feature/1.png", title: "Launch Campaign" },
  { icon: "/assets/homepage/feature/2.png", title: "Dashboard Monitor" },
  { icon: "/assets/homepage/feature/3.png", title: "Pay for the CV only" },
];

// Analytics statistics data for the reporting section
export const analyticsStats = [
  { title: "Conversions (this month)", value: "123" },
  { title: "Earning (this month)", value: "6,150 USDC" },
  { title: "Total Clicks (All time)", value: "345" },
  { title: "Next Payment Date", value: "11.01.2024" },
];

// Investor logos data for the Investors section
export const investorLogos = [
  { src: "/brand-assets/kusabi.png", name: "KUSABI" },
  { src: "/brand-assets/decima.png", name: "DECIMA" },
  { src: "/brand-assets/adways.png", name: "ADWAYS" },
];

// Client logos to display in the "CLIENTS" section
export const clientLogos = [
  "/brand-assets/farcana.png",
  "/brand-assets/tgwiz.png",
  "/brand-assets/goat-gaming.png",
  "/brand-assets/starheroes.png",
  "/brand-assets/chain-colosseum-phoenix.png",
  "/brand-assets/rumble-kong-league.png",
  "/brand-assets/delabs-games.png",
  "/brand-assets/overtake.png",
];

// Calendly link used for scheduling meetings
export const calendlyLink = "https://calendly.com/badhan998877/badhan-meeting";

// Social media links for the footer or other sections
export const socialMediaLinks = [
  { src: "/brand-assets/x-white.png", alt: "X", url: "https://x.com/0xQube", size: 17 },
  { src: "/brand-assets/discord-white.png", alt: "Discord", url: "https://discord.gg/xXbRG2WQdD", size: 25 },
  { src: "/brand-assets/telegram-white.png", alt: "Telegram", url: "https://t.me/qubexyz", size: 25 },
];

export const footerContent = {
  en: [
    {
      category: "Company",
      links: [
        { label: "Home", url: "#" },
        { label: "Contact", url: "https://docs.google.com/forms/d/1csWLltBq0j3ddaiDv5W3iAndu2v5YZ1QfTQpULWIUP8/prefill" },
        { label: "Career (Coming Soon)", url: "#" },
      ],
    },
    {
      category: "Help",
      links: [
        { label: "Book Demo", url: calendlyLink },
        { label: "Terms and Conditions", url: `${process.env.NEXT_PUBLIC_BASE_URL}/terms-and-conditions` },
        { label: "Privacy Policy", url: `${process.env.NEXT_PUBLIC_BASE_URL}/privacy-policy` },
      ],
    },
  ],
  ja: [
    {
      category: "会社",
      links: [
        { label: "ホーム", url: "#" },
        { label: "コンタクト", url: "https://docs.google.com/forms/d/1csWLltBq0j3ddaiDv5W3iAndu2v5YZ1QfTQpULWIUP8/prefill" },
        { label: "キャリア（近日公開予定）", url: "#" },
      ],
    },
    {
      category: "ヘルプ",
      links: [
        { label: "デモ予約", url: calendlyLink },
        { label: "利用規約", url: `${process.env.NEXT_PUBLIC_BASE_URL}/terms-and-conditions` },
        { label: "プライバシーポリシー", url: `${process.env.NEXT_PUBLIC_BASE_URL}/privacy-policy` },
      ],
    },
  ],
};