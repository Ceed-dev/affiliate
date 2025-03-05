"use client";

// React & Next.js dependencies
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

// Homepage data (logos, social media links, footer content)
import { clientLogos, socialMediaLinks, footerContent } from "./constants/homepageData";

export default function Homepage() {
  // State for mobile menu
  const [menuOpen, setMenuOpen] = useState(false);

  // Function to toggle mobile menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Automatically close mobile menu when resizing to desktop view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);
    
    // Cleanup event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ================== DATA DEFINITIONS ==================

  const statsData = [
    { title: "Registered Affiliates", value: "3,000+" },
    { title: "Gamers Reach", value: "1,700,000+" },
    { title: "Onboarding Users", value: "700,000+" },
    { title: "TG Game & LINE Games", value: "1,000,000+" }
  ];

  // Partner data categorized by type
  const partnersData = {
    Game: [
      { name: "VMG.ron", country: "Philippines", role: "Streamer", followers: "340k+ Follower", image: "/tmp/game1.png" },
      { name: "marksenpai26", country: "Philippines", role: "Tutorial", followers: "142k+ Follower", image: "/tmp/game2.png" },
      { name: "VLADRAX", country: "Philippines", role: "Streamer", followers: "13k+ Follower", image: "/tmp/game3.png" },
      { name: "Elisa", country: "France & Spain", role: "Streamer", followers: "50k+ Follower", image: "/tmp/game4.png" },
    ],
    NFT: [
      { name: "David", country: "Vietnam", role: "Creator", followers: "15k+ Follower", image: "/tmp/nft1.png" },
      { name: "kasotukun", country: "Japan", role: "Creator", followers: "41k+ Follower", image: "/tmp/nft2.png" },
      { name: "DzT DAO", country: "Japan", role: "Creator", followers: "28k+ Follower", image: "/tmp/nft3.png" },
    ],
    Meme: [],
    DeFi: [],
  };

  // Features displayed for publishers
  const features = [
    { icon: "/tmp/pay1.png", title: "Launch Campaign" },
    { icon: "/tmp/pay2.png", title: "Dashboard Monitor" },
    { icon: "/tmp/pay3.png", title: "Pay for the CV only" },
  ];

  // Sample data for KOL/Guilds
  const kolGuildData = [
    { image: "/tmp/connect1.png", name: "Beacon" },
    { image: "/tmp/connect2.png", name: "Pirate Nation" },
    { image: "/tmp/connect3.png", name: "Counter Fire" },
    { image: "/tmp/connect4.png", name: "King Destiny" },
  ];

  // ================== STATE HOOKS ==================
  const [activeTab, setActiveTab] = useState<keyof typeof partnersData>("Game");
  const [isPublisher, setIsPublisher] = useState(true);

  // ================== CLIENT LOGO SCROLL MANAGEMENT ==================
  const SCROLL_INTERVAL = 10; // Scroll update interval in milliseconds
  const SCROLL_SPEED = 1; // Scroll speed in pixels per update

  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    const scrollElement = scrollRef.current;

    // Set up auto-scrolling interval
    const scrollInterval = setInterval(() => {
      if (scrollElement) {
        // Increment scroll position
        scrollElement.scrollLeft += SCROLL_SPEED;

        // Get the middle position to determine the active logo
        const middlePosition = scrollElement.scrollLeft + scrollElement.clientWidth / 2;
        const logoWidth = scrollElement.scrollWidth / (clientLogos.length * 2);

        // Update active dot based on the middle logo
        const currentIndex = Math.floor(middlePosition / logoWidth) % clientLogos.length;
        setActiveDot(currentIndex);

        // Reset scrolling when it reaches the duplicated end
        if (scrollElement.scrollLeft >= scrollElement.scrollWidth / 2) {
          scrollElement.scrollLeft = 0;
        }
      }
    }, SCROLL_INTERVAL);

    // Cleanup interval on unmount
    return () => clearInterval(scrollInterval);
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full h-[64px] md:h-[87px] px-5 md:px-2 lg:px-16 xl:px-40 2xl:px-80 flex items-center justify-between bg-black/60 backdrop-blur-md border-b border-[#242424] z-40">

        {/* === Left Section: Logo === */}
        <Link href="#" className="flex flex-row items-center gap-3 transition duration-300 ease-in-out transform hover:-translate-y-1">
          <Image src="/qube.png" alt="Qube Logo" width={36} height={36} />
          <p className="text-3xl font-corporate">Qube</p>
        </Link>

        {/* === Center Section: Navigation (Desktop) === */}
        <nav className="hidden md:flex space-x-4 lg:space-x-8 items-center">
          <Link href="#" className="hover:text-gray-400">Home</Link>
          <div className="h-11 w-px bg-white"></div>
          <Link href="#about" className="hover:text-gray-400">About</Link>
          <div className="h-11 w-px bg-white"></div>
          <Link href="#why-us" className="hover:text-gray-400">Why us</Link>
          <div className="h-11 w-px bg-white"></div>
          <Link href="#achievements" className="hover:text-gray-400">Achievements</Link>
          <div className="h-11 w-px bg-white"></div>

          {/* Toggle Button for Publisher/KOL */}
          <button onClick={() => setIsPublisher(!isPublisher)} className="hover:text-gray-400">
            {isPublisher ? "KOL/Guild" : "Publisher"}
          </button>
        </nav>

        {/* === Right Section: Buttons === */}
        <div className="flex items-center space-x-4">
          {/* Launch App Button (Desktop) */}
          <Link href="/onboarding" className="hidden md:block px-6 py-2 bg-lime-300 text-black font-bold rounded-md hover:bg-lime-200">
            Launch App
          </Link>

          {/* Hamburger Menu Button (Mobile) */}
          <button onClick={toggleMenu} className="md:hidden">
            <Image src="/assets/common/menu-white.png" alt="Menu" width={30} height={30} />
          </button>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      <div
        className={`fixed top-0 left-0 w-full bg-black flex flex-col items-center justify-center transition-transform duration-300 ease-in-out z-50 ${
          menuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* === Close Button === */}
        <button
          onClick={toggleMenu}
          className="w-full flex justify-end px-6 py-4"
        >
          <Image
            src="/assets/common/close-white.png"
            alt="Close Menu"
            width={30}
            height={30}
          />
        </button>

        {/* === Navigation Links === */}
        <nav className="w-full">
          <ul className="flex flex-col w-full">
            {[
              { href: "#", label: "Home" },
              { href: "#about", label: "About" },
              { href: "#why-us", label: "Why us" },
              { href: "#achievements", label: "Achievements" },
            ].map((item, index) => (
              <li key={index} className="border-b border-[#4A4A4A]">
                <Link
                  href={item.href}
                  className="block text-xl text-center py-5 hover:text-gray-400"
                  onClick={toggleMenu}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {/* Publisher / KOL/Guild Toggle Button */}
            <li>
              <button
                onClick={() => setIsPublisher(!isPublisher)}
                className="block w-full text-xl text-center py-5 hover:text-gray-400"
              >
                {isPublisher ? "KOL/Guild" : "Publisher"}
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content Section */}
      <main>
        {/* Hero Section */}
        <section className="relative w-full min-h-[60vh] md:h-screen">
          {/* Desktop Background Image */}
          <Image
            src="/tmp/1.png"
            alt="Qube Hero Desktop"
            fill
            className="absolute inset-0 w-full h-full hidden md:block object-cover"
          />
          
          {/* Mobile Background Image */}
          <Image
            src="/tmp/2.png"
            alt="Qube Hero Mobile"
            fill
            className="absolute inset-0 w-full min-h-[60vh] md:hidden object-cover"
            style={{ objectPosition: "bottom center" }}
          />

          {/* Text & Button Container */}
          <div className="absolute top-[15%] md:top-[30%] w-full md:w-auto md:left-[9%] text-center md:text-left">
            {/* Mobile Title (Single Line) */}
            <h1 className="text-2xl md:hidden font-bold leading-tight">
              {isPublisher ? "BUILD FOR WEB3 GAMING" : "AMPLIFY YOUR INFLUENCE"}
            </h1>

            {/* Desktop Title (Two Lines) */}
            <h1 className="hidden md:block text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold leading-tight">
              {isPublisher ? "BUILD FOR" : "AMPLIFY YOUR"} <br />
              {isPublisher ? "WEB3 GAMING" : "INFLUENCE"}
            </h1>

            {/* Subtitle */}
            <p className="mt-2 text-lg md:text-3xl">
              {isPublisher ? "Game, Gain, and Grow together" : "Expand, Connect, and Thrive"}
            </p>

            {/* Launch App Button */}
            <Link
              href="/onboarding"
              className="mt-4 inline-block px-6 py-2 bg-lime-300 text-black font-bold rounded-md hover:bg-lime-200"
            >
              Launch App
            </Link>
          </div>
        </section>

        <section id="about">
          <div className="max-w-none mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-5 px-7 2xl:px-40">
            {statsData.map((stat, index) => (
              <div key={index} className="relative w-full">
                <Image
                  src="/tmp/3.png"
                  alt="Stats Card"
                  width={568}
                  height={308}
                  className="w-full"
                />
                <p className="absolute top-2 left-4 text-md text-gray-400">
                  {stat.title}
                </p>
                <h2 className="absolute inset-0 flex items-center justify-center text-4xl font-bold">
                  {stat.value}
                </h2>
              </div>
            ))}
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="relative w-full px-7 2xl:px-40 mt-20 md:mt-60">
          {/* Section Title */}
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-10 md:mb-20">
            TRUSTED BY
          </h2>

          {/* Border Image & Logos */}
          <div className="relative w-full flex flex-col items-center">
            <div className="relative w-full">
              <Image
                src="/tmp/4.png"
                alt="Section Border"
                width={1920}
                height={300}
                className="w-full h-[250px] md:h-[220px] lg:h-[300px] xl:h-[160px]"
              />

              {/* Logos */}
              <div className="absolute inset-0 flex flex-wrap justify-center items-center gap-2 lg:gap-16 px-6 py-6">
                {[
                  { src: "/brand-assets/double-jump-tokyo.png", alt: "doublejump.tokyo", name: "doublejump.tokyo" },
                  { src: "/brand-assets/gumi.png", alt: "gumi", name: "gumi" },
                  { src: "/brand-assets/game-swift.png", alt: "Game Swift", name: "Game Swift" },
                  { src: "/brand-assets/kaia.png", alt: "Kaia", name: "Kaia" },
                  { src: "/chains/arbitrum.png", alt: "Arbitrum", name: "Arbitrum" }
                ].map((logo, index) => (
                  <div key={index} className="flex flex-row items-center gap-3">
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16">
                      <Image src={logo.src} alt={logo.alt} fill className="rounded-full object-contain" />
                    </div>
                    <p className="text-xs md:text-xl">{logo.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why Us Section */}
        <section id="why-us" className="px-5 md:px-2 lg:px-16 xl:px-40 2xl:px-80 mt-20 md:mt-60">
          {/* Section Title */}
          <h2 className="text-center text-2xl md:text-5xl font-bold">
            {isPublisher ? "BUILD PARTNERSHIP THAT" : "CONNECT WITH"}
          </h2>
          <h2 className="text-center text-2xl md:text-5xl font-bold text-lime-400 mt-3 md:mt-5">
            {isPublisher ? "AMPLIFY YOUR REACH" : "TOP WEB3 GAMES"}
          </h2>
          <p className="text-center text-md md:text-xl text-gray-400 mt-3 md:mt-5">
            {isPublisher
              ? "Identify the best KOL/Guild/Community with audiences aligned to enhance your game growth."
              : "Work with the top games in the industry and seize the opportunity now!"
            }
          </p>

          {/* Content Section */}
          <div className="flex justify-center mt-10 md:mt-20">
            {isPublisher ? (
              <div className="w-full border border-gray-500 rounded-xl p-3 md:p-6">
                {/* Tab Menu */}
                <div className="overflow-x-auto whitespace-nowrap mb-5 md:mb-10">
                  <div className="flex justify-around w-full mx-auto">
                    {["Game", "NFT", "Meme", "DeFi"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab as keyof typeof partnersData)}
                        className={`relative flex-1 text-lg md:text-3xl font-bold px-4 py-2 text-center ${
                          activeTab === tab ? "text-lime-400" : "text-gray-400 hover:text-gray-200 transition"
                        }`}
                      >
                        {tab}
                        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gray-600"></span>
                        {activeTab === tab && (
                          <span className="absolute bottom-0 left-0 w-full h-[2px] bg-lime-400"></span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                {partnersData[activeTab].length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                    {partnersData[activeTab].map(({ image, name, country, role, followers }, index) => (
                      <div key={index} className="flex gap-4 items-center">
                        <Image src={image} alt={name} width={96} height={96} className="rounded-lg w-20 h-20 md:w-24 md:h-24" />
                        <div className="flex flex-col justify-center">
                          <h3 className="text-xl font-bold">{name}</h3>
                          <p className="text-md text-gray-400">{country} ・ {role}</p>
                          <p className="text-md text-gray-400">{followers}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400">No data available.</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {kolGuildData.map(({ image, name }, index) => (
                  <div key={index} className="w-full">
                    <Image src={image} alt={name} width={400} height={250} className="rounded-xl w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="px-7 2xl:px-40 mt-20 md:mt-60">
          {/* Title */}
          <div className="text-center text-2xl md:text-5xl font-bold">
            <h2>{isPublisher ? "PAY ONLY FOR" : "MONETIZE"}</h2>
            <h3 className="text-lime-400 mt-3 md:mt-5">
              {isPublisher ? "MEASURABLE RESULTS" : "YOUR INFLUENCE"}
            </h3>
          </div>

          {!isPublisher && (
            <p className="text-center text-md md:text-xl text-gray-400 mt-3 md:mt-5">
              Have you built a thriving community without knowing how to generate income? We&apos;re here to support you!
            </p>
          )}

          {/* Feature Cards for Publisher */}
          {isPublisher ? (
            <div className="mt-10 md:mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 mx-auto">
              {features.map((feature, index) => (
                <div key={index} className="aspect-square flex flex-col items-center justify-center border border-gray-600 rounded-lg text-center p-2 md:p-5">
                  {/* Icon */}
                  <div className="w-full h-full rounded-lg flex items-center justify-center relative">
                    <Image src={feature.icon} alt={feature.title} fill className="object-contain" />
                  </div>
                  {/* Title */}
                  <p className="text-lg md:text-xl font-semibold">{feature.title}</p>
                </div>
              ))}
            </div>
          ) : (
            /* Monetization Section for Non-Publishers */
            <div className="flex justify-center items-center w-full py-10">
              <div className="relative w-full max-w-[1000px] flex items-center justify-center">
                {/* Desktop Image */}
                <Image src="/tmp/monetize-desktop.png" alt="Central Icon Desktop" width={600} height={600} className="hidden md:block w-full object-contain" />
                {/* Mobile Image */}
                <Image src="/tmp/monetize-mobile.png" alt="Central Icon Mobile" width={300} height={300} className="md:hidden w-full object-contain" />
              </div>
            </div>
          )}
        </section>

        {/* Analytics & Reporting Section */}
        <section className="px-7 2xl:px-40 mt-20 md:mt-60">
          {/* Title */}
          <div className="text-center text-2xl md:text-5xl font-bold">
            <h2>{isPublisher ? "ACCESS CAMPAIGN" : "DATA-DRIVEN IMPACT"}</h2>
            {isPublisher && <p className="text-lime-400 mt-3 md:mt-5">ANALYTICS & REPORTING</p>}
          </div>
          
          {!isPublisher && (
            <p className="text-center text-md md:text-xl text-gray-400 mt-3 md:mt-5">
              Efficiently measure, analyze, and maximize your impact, engagement, reach, and conversions included.
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 md:mt-20">
            {/* Left Side: Statistics Data */}
            <div className="grid grid-cols-2 gap-3 md:gap-6 xl:gap-10">
              {[
                { title: "Conversions (this month)", value: "123" },
                { title: "Earning (this month)", value: "6,150 USDC" },
                { title: "Total Clicks (All time)", value: "345" },
                { title: "Next Payment Date", value: "11.01.2024" }
              ].map((item, index) => (
                <div key={index} className="relative w-full">
                  {/* Background Image */}
                  <Image src="/tmp/3.png" alt="Stats Background" width={568} height={308} className="w-full" />
                  
                  {/* Title */}
                  <p className="absolute top-2 left-4 text-xs md:text-md lg:text-lg text-gray-400">
                    {item.title}
                  </p>
                  
                  {/* Value */}
                  <h2 className="absolute inset-0 flex items-center justify-center text-md md:text-lg lg:text-xl xl:text-3xl font-bold">
                    {item.value}
                  </h2>
                </div>
              ))}
            </div>

            {/* Right Side: Graph */}
            <div className="flex justify-center">
              <Image src="/tmp/graph1.png" alt="Analytics Graph" width={500} height={300} className="w-full max-w-lg" />
            </div>
          </div>
        </section>

        {/* Investors Section */}
        <section id="achievements" className="px-7 2xl:px-40 mt-20 md:mt-60">
          {/* タイトル */}
          <h2 className="text-center text-2xl md:text-5xl font-bold">
            INVESTORS
          </h2>

          {/* ボーダー画像とロゴ一覧のコンテナ */}
          <div className="flex flex-col items-center mt-10 md:mt-20">
            {/* ボーダー画像 */}
            <div className="relative w-full">
              <Image
                src="/tmp/4.png" // Figmaからエクスポートしたボーダー画像
                alt="Section Border"
                width={1920}
                height={300}
                className="w-full h-[80px] md:h-[160px] lg:h-[120px] xl:h-[140px]"
              />

              {/* ロゴ一覧（ボーダー画像の中に収める） */}
              <div className="absolute inset-0 flex justify-center items-center gap-5 lg:gap-16 p-5 lg:p-10">
                <div className="relative w-full h-full">
                  <Image src="/brand-assets/kusabi.png" alt="KUSABI" fill className="object-contain" />
                </div>
                <div className="relative w-full h-full">
                  <Image src="/brand-assets/decima.png" alt="DECIMA" fill className="object-contain" />
                </div>
                <div className="relative w-full h-full">
                  <Image src="/brand-assets/adways.png" alt="ADWAYS" fill className="object-contain" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Clients */}
        <section className="2xl:px-40 mt-20 md:mt-60">
          <h1 className="text-center text-2xl md:text-5xl font-bold mb-10 md:mb-20">
            CLIENTS
          </h1>
          {/* モバイル: 自動スクロール */}
          {/* Client Logo Auto Scroll */}
          <div className="block md:hidden overflow-x-auto" ref={scrollRef}>
            <div className="flex items-center justify-start space-x-5">
              {clientLogos.concat(clientLogos).map((logo, index) => (
                <div key={index} className="flex-shrink-0">
                  <Image
                    src={logo}
                    alt={`Logo ${index + 1}`}
                    width={80}
                    height={80}
                    className="object-contain rounded-lg w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Dots Indicator */}
          {/* <div className="flex justify-center items-center mt-4">
            {clientLogos.map((_, index) => (
              <div
                key={index}
                className={`rounded-full mx-2 ${
                  activeDot === index ? "bg-lime-300 h-5 w-5" : "bg-gray-400 h-3 w-3"
                }`}
              />
            ))}
          </div> */}
          {/* デスクトップ: グリッドレイアウト */}
          <div className="hidden md:grid grid-cols-4 gap-10 place-items-center">
            {clientLogos.map((logo, index) => (
              <div key={index} className="w-24 h-24 md:w-28 md:h-28">
                <Image
                  src={logo}
                  alt={`Logo ${index + 1}`}
                  width={100}
                  height={100}
                  className="object-contain rounded-lg w-full h-full"
                />
              </div>
            ))}
          </div>
        </section>

      </main>

      <footer className="relative w-full min-h-[50vh] mt-20 md:mt-60">
        {/* デスクトップ用背景画像 */}
        <Image
          src="/tmp/footer-desktop.png"
          alt="Qube Footer Desktop"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 w-full h-full hidden md:block"
        />

        {/* モバイル用背景画像 */}
        <Image
          src="/tmp/footer-mobile.png"
          alt="Qube Footer Mobile"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 w-full h-full md:hidden"
        />

        {/* フッターコンテンツ */}
        <div className="relative z-10 flex flex-col items-center text-center pb-5 pt-20 md:pt-32">
          {/* キャッチコピー */}
          <h2 className="text-md md:text-2xl xl:text-4xl font-bold text-lime-400">
            THE STRONGEST GROWTH DRIVER
          </h2>
          <h3 className="text-md md:text-2xl xl:text-4xl font-bold mt-2">FOR YOUR GAME</h3>

          <div className="mt-14 md:mt-40 lg:mt-60 flex flex-col md:flex-row gap-6 md:gap-12 lg:gap-28 xl:gap-40">
            <div className="flex flex-col items-center md:items-start">
              {/* Logo */}
              <Link href="#" className="flex flex-row items-center gap-3 transition duration-300 ease-in-out transform hover:-translate-y-1">
                <Image src="/qube.png" alt="Qube Logo" width={40} height={40} />
                <p className="text-2xl lg:text-5xl font-corporate">Qube</p>
              </Link>

              {/* SNSアイコン */}
              <div className="flex flex-row mx-auto md:mx-0 gap-2 mt-4">
                {socialMediaLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.url}
                    target="_blank"
                    className="bg-black border border-gray-400 hover:border-gray-300 rounded-lg inline-flex justify-center items-center h-7 lg:h-9 w-7 lg:w-9 p-1 transition-shadow hover:shadow-lg"
                  >
                    <Image
                      src={link.src}
                      alt={link.alt}
                      width={link.size}
                      height={link.size}
                      className="object-contain"
                    />
                  </Link>
                ))}
              </div>
            </div>

            {/* ナビゲーション */}
            <div className="flex flex-row space-x-5 md:space-x-10 lg:space-x-20 text-left text-sm md:text-base">
              {footerContent["en"].map((category, index) => (
                <div key={index}>
                  <h4 className="text-lime-400 font-semibold">{category.category}</h4>
                  <ul className="mt-2 space-y-2">
                    {category.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <a href={link.url} className="hover:text-lime-400">
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* コピーライト */}
          <div className="text-gray-400 text-sm mt-20">
            &copy; {new Date().getFullYear()} All Rights Reserved by Ceed Inc.
          </div>
        </div>
      </footer>

    </div>
  );
}