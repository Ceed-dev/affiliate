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
          { count: "3k", label: "Registered Affiliates" },
          { count: "1.7M", label: "Gamers Reach" },
          { count: "700k+", label: "Onboarding Users" },
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
          { count: "3k", label: "Registered Affiliates" },
          { count: "1.7M", label: "Gamers Reach" },
          { count: "700k+", label: "Onboarding Users" },
          { count: "-", label: "TG Game & LINE Games" },
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
  ja: {
    affiliate: {
      hero: {
        titleLine1: "業界唯一の",
        titleLine2: "web3特化アフィリエイトサービス",
        subtitle: "プロジェクトに貢献し、報酬を獲得するチャンス",
        descriptionLine1: "Qubeと協力して、ゲームブランド向けの強力なネットワークにアクセスしましょう。",
        descriptionLine2: "リーチを拡大し、web3の世界での存在感を強化しましょう。",
      },
      about1: {
        title1: "トップクラスのweb3ゲームと繋がろう",
        title2: "",
        title3: "",
        description: "業界をリードする多種多様なゲームとあなたを繋ぎます。",
        image: "/assets/homepage/image-4.png",
      },
      about2: {
        title1: "あなたの影響力を収益に",
        title2: "",
        description: "収益化の方法がわからないまま、活気あるコミュニティを築いていませんか？私たちがサポートします！",
        image: "/assets/homepage/image-5.png",
      },
      about3: {
        title1: "Qube Analyticsが",
        title2: "あなたの影響力を追跡",
        description: "エンゲージメントやリーチ、コンバージョンなどの項目から成果を測定し、より最適な戦略形成をサポート。データに基づいた選択でより大きなコミュニティの影響力へ。",
        image: "/assets/homepage/image-6.png",
      },
      achievements: {
        title: "実績",
        items: [
          { count: "3k", label: "登録アフィリエイト数" },
          { count: "1.7M", label: "ゲーマーリーチ数" },
          { count: "700k+", label: "オンボーディングユーザー数" },
        ],
      },
      clients: {
        title: "クライアント",
      },
      faq: {
        title: "よくある質問",
        items: [
          {
            question: "アフィリエイトキャンペーンはカスタマイズできますか？",
            answer: "もちろんです！目標やターゲットオーディエンス、報酬構造などに基づいて、キャンペーンを柔軟にカスタマイズできます。あなただけのユニークなキャンペーンを作り上げることで、より良い成果が見込めます。",
          },
          {
            question: "どのようなサポートを提供していますか？",
            answer: "キャンペーンの企画から実行に至るまで、全ての段階で全力でサポートいたします。キャンペーンの戦略から技術的なサポートまで、何なりとお申し付けください。",
          },
          {
            question: "アフィリエイトの支払いはどのように処理されますか？",
            answer: "当プラットフォームでは、法定通貨と暗号通貨の両方で安全な支払いをサポートしています。各キャンペーンで支払い方法を選択でき、すべての取引が透明性のためにブロックチェーン上に記録されます。",
          },
        ],
      },
      contactUs: {
        message: "時間を調整してお話ししましょう！",
        buttonLabel: "お問い合わせ",
      },
    },
    projectOwner: {
      hero: {
        titleLine1: "web3マーケットでのアフィリエイトなら",
        titleLine2: "Qube",
        subtitle: "dappの成長／web3での収益化を目指す全ての方へ",
        descriptionLine1: "Qubeはアジア全域のインフルエンサーやギルドとあなたを繋ぎ、",
        descriptionLine2: "より多くのユーザーへあなたのプロダクトを届けます。",
      },
      about1: {
        title1: "強固なパートナーシップで",
        title2: "リーチの拡大へ",
        title3: "",
        description: "あなたのゲームの成長への手助けとなる様々なKOLやギルド、コミュニティをご用意しています。",
        image: "/assets/homepage/image-1.png",
      },
      about2: {
        title1: "支払いは測定可能な成果のみに",
        title2: "",
        description: "完全成果報酬型によって、お支払いは成功したコンバージョンと測定可能な成果だけ。",
        image: "/assets/homepage/image-2.png",
      },
      about3: {
        title1: "キャンペーンのレポート、成果をチェック",
        title2: "",
        description: "適切なKOLやギルド、コミュニティを分析することで、より大きな成長へ。",
        image: "/assets/homepage/image-3.png",
      },
      achievements: {
        title: "実績",
        items: [
          { count: "3k", label: "登録アフィリエイト数" },
          { count: "1.7M", label: "ゲーマーリーチ数" },
          { count: "700k+", label: "オンボーディングユーザー数" },
          { count: "-", label: "TGゲーム & LINEゲーム" },
        ],
      },
      clients: {
        title: "クライアント",
      },
      faq: {
        title: "よくある質問",
        items: [
          {
            question: "アフィリエイトキャンペーンはカスタマイズできますか？",
            answer: "もちろんです！目標やターゲットオーディエンス、報酬構造などに基づいて、キャンペーンを柔軟にカスタマイズできます。あなただけのユニークなキャンペーンを作り上げることで、より良い成果が見込めます。",
          },
          {
            question: "どのようなサポートを提供していますか？",
            answer: "キャンペーンの企画から実行に至るまで、全ての段階で全力でサポートいたします。キャンペーンの戦略から技術的なサポートまで、何なりとお申し付けください。",
          },
          {
            question: "アフィリエイトの支払いはどのように処理されますか？",
            answer: "当プラットフォームでは、法定通貨と暗号通貨の両方で安全な支払いをサポートしています。各キャンペーンで支払い方法を選択でき、すべての取引が透明性のためにブロックチェーン上に記録されます。",
          },
        ],
      },
      contactUs: {
        message: "時間を調整してお話ししましょう！",
        buttonLabel: "お問い合わせ",
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
  "/brand-assets/rumble-kong-league.png",
  "/brand-assets/overtake.png",
  "/brand-assets/goat-gaming.png",
  "/brand-assets/delabs-games.png",
  "/brand-assets/farcana.png",
  "/brand-assets/starheroes.png",
  "/brand-assets/tgwiz.png",
  "/brand-assets/chain-colosseum-phoenix.png",
];

// Social media links for the footer or other sections
export const socialMediaLinks = [
  { src: "/brand-assets/x-white.png", alt: "X", url: "https://x.com/0xQube", size: 17 },
  { src: "/brand-assets/discord-white.png", alt: "Discord", url: "https://discord.gg/xXbRG2WQdD", size: 25 },
  { src: "/brand-assets/telegram-white.png", alt: "Telegram", url: "https://t.me/qubexyz", size: 25 },
];

export const footerTaglines = {
  en: `
    <p>
      The strongest growth driver for your<br />game.<br />
      Launch Campaign and Acquire<br />targeted users.
    </p>
  `,
  ja: `
    <p>
      web3で成果報酬型マーケティングならQube。<br />
      キャンペーンを開始して<br />
      更なるユーザーの獲得へ。
    </p>
  `,
};

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