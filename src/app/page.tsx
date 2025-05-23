"use client";

// React & Next.js dependencies
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

// Homepage data
import { 
  languageOptions, 
  navLinks, 
  statsData, 
  trustedPartners, 
  partnersData, 
  kolGuildData, 
  features, 
  analyticsStats, 
  investorLogos, 
  clientLogos, 
  socialMediaLinks, 
  footerContent 
} from "./constants/homepageData";

import { LanguageToggle } from "./components/common";

export default function Homepage() {
  // ================== STATE HOOKS ==================

  // State for mobile menu
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  // State for active tab in partners section
  const [activeTab, setActiveTab] = useState<keyof typeof partnersData>("Game");
  const [indicatorStyle, setIndicatorStyle] = useState({ width: "0px", left: "0px" });
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // State for publisher mode
  const [isPublisher, setIsPublisher] = useState(true);

  // State for footer background image
  const [footerImage, setFooterImage] = useState("/assets/homepage/footer/desktop.png");

  // State for language toggle
  const [language, setLanguage] = useState<"en" | "jp">("en");

  // State for responsive highlight frame
  const [highlightFrame, setHighlightFrame] = useState("/assets/homepage/wide-highlight-frame.png");

  // Reference for scrolling logos
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);

  // ================== UTILITY FUNCTIONS ==================

  /**
   * Smoothly scrolls to a section by its ID.
   * Ensures the section is visible while accounting for the fixed header.
   * @param id - The ID of the section to scroll to
   */
  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // ================== EFFECT HOOKS ==================

  // Automatically close mobile menu when resizing to desktop view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update footer image based on screen size
  useEffect(() => {
    const updateFooterImage = () => {
      setFooterImage(window.innerWidth >= 768 ? "/assets/homepage/footer/desktop.png" : "/assets/homepage/footer/mobile.png");
    };

    updateFooterImage(); // Set initial state
    window.addEventListener("resize", updateFooterImage);
    return () => window.removeEventListener("resize", updateFooterImage);
  }, []);

  // Update highlight frame image based on screen size
  useEffect(() => {
    const updateHighlightFrame = () => {
      setHighlightFrame(window.innerWidth < 768 ? "/assets/homepage/highlight-frame.png" : "/assets/homepage/wide-highlight-frame.png");
    };

    updateHighlightFrame(); // Set initial state
    window.addEventListener("resize", updateHighlightFrame);
    return () => window.removeEventListener("resize", updateHighlightFrame);
  }, []);

  // Update the sliding indicator position and width when the active tab changes
  // This ensures the underline smoothly moves to the selected tab with the correct width
  useEffect(() => {
    if (tabRefs.current[activeTab]) {
      const tabElement = tabRefs.current[activeTab]!;
      setIndicatorStyle({
        width: `${tabElement.offsetWidth}px`,
        left: `${tabElement.offsetLeft}px`,
      });
    }
  }, [activeTab]);

  // ================== CLIENT LOGO SCROLL MANAGEMENT ==================

  const SCROLL_INTERVAL = 10; // Scroll update interval in milliseconds
  const SCROLL_SPEED = 1; // Scroll speed in pixels per update

  useEffect(() => {
    const scrollElement = scrollRef.current;

    if (!scrollElement) return;

    const scrollInterval = setInterval(() => {
      scrollElement.scrollLeft += SCROLL_SPEED;

      // Determine the middle logo position
      const middlePosition = scrollElement.scrollLeft + scrollElement.clientWidth / 2;
      const logoWidth = scrollElement.scrollWidth / (clientLogos.length * 2);
      const currentIndex = Math.floor(middlePosition / logoWidth) % clientLogos.length;

      setActiveDot(currentIndex);

      // Reset scrolling when reaching the duplicated end
      if (scrollElement.scrollLeft >= scrollElement.scrollWidth / 2) {
        scrollElement.scrollLeft = 0;
      }
    }, SCROLL_INTERVAL);

    return () => clearInterval(scrollInterval);
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full h-[64px] md:h-[87px] px-5 md:px-10 lg:px-16 xl:px-44 2xl:px-72 flex items-center justify-between bg-black/60 backdrop-blur-md border-b border-[#242424] z-40">

        {/* === Left Section: Logo === */}
        <Link href="#" className="flex flex-row items-center gap-3 transition duration-300 ease-in-out transform hover:-translate-y-1">
          <Image 
            src="/qube.png" 
            alt="Qube Logo" 
            width={0} 
            height={0} 
            sizes="(max-width: 640px) 20px, (max-width: 768px) 28px, (max-width: 1024px) 36px, 44px"
            className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10"
          />

          <p className="text-lg md:text-3xl font-corporate">Qube</p>
        </Link>

        {/* === Center Section: Navigation (Desktop) === */}
        <nav className="hidden lg:flex space-x-3 lg:space-x-5 xl:space-x-7 items-center text-sm">
          {navLinks.map((link, index) => (
            <React.Fragment key={link.id}>
              <button 
                onClick={() => scrollToSection(link.id)} 
                className="hover:text-[#A5E100]">
                {link.label}
              </button>

              {/* Add a divider after each link except the last one */}
              {index < navLinks.length - 1 && <div className="h-11 w-px bg-[#8E8E8E]"></div>}
            </React.Fragment>
          ))}

          {/* Add a divider before the "KOL/Guild" button */}
          <div className="h-11 w-px bg-[#8E8E8E]"></div>

          {/* Toggle Button for Publisher/KOL */}
          <button onClick={() => setIsPublisher(!isPublisher)} className="hover:text-[#A5E100]">
            {isPublisher ? "KOL/Guild" : "Publisher"}
          </button>
        </nav>

        {/* === Right Section: Buttons === */}
        <div className="flex items-center">
          <div className="hidden lg:flex gap-2 2xl:gap-10">
            {/* Language Toggle Button (Eng/JA) */}
            {/* <LanguageToggle language={language} setLanguage={setLanguage} /> */}
            {/* Launch App Button (Desktop) */}
            <Link
              href="/onboarding"
              className="px-6 py-2 border-2 border-[#A5E100] text-black hover:text-[#A5E100] 
                        bg-[#A5E100] hover:bg-black rounded-md transition duration-300"
            >
              Launch App
            </Link>
          </div>

          {/* Hamburger Menu Button (Mobile) */}
          <button onClick={toggleMenu} className="lg:hidden">
            <Image src="/assets/common/menu-green.png" alt="Menu" width={30} height={30} />
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
            src="/assets/common/close-green.png"
            alt="Close Menu"
            width={30}
            height={30}
          />
        </button>

        {/* === Navigation Links === */}
        <nav className="w-full">
          <ul className="flex flex-col w-full">
            {navLinks.map((item) => (
              <li key={item.id} className="border-b border-[#8E8E8E]">
                <button
                  onClick={() => {
                    scrollToSection(item.id);
                    toggleMenu();
                  }}
                  className="block text-xl text-center py-5 hover:text-[#A5E100] w-full"
                >
                  {item.label}
                </button>
              </li>
            ))}
            {/* Publisher / KOL/Guild Toggle Button */}
            <li>
              <button
                onClick={() => setIsPublisher(!isPublisher)}
                className="block w-full text-xl text-center py-5 hover:text-[#A5E100]"
              >
                {isPublisher ? "KOL/Guild" : "Publisher"}
              </button>
            </li>
          </ul>
        </nav>
        
        {/* Language Toggle Button (Eng/JA) */}
        {/* <div className="my-5">
          <LanguageToggle language={language} setLanguage={setLanguage} />
        </div> */}
      </div>

      {/* Main Content Section */}
      <main>
        {/* Hero Section */}
        <section id="#" className="relative w-full min-h-[60vh] md:h-screen">
          {/* Desktop Background Image */}
          <Image
            src="/assets/homepage/hero/desktop.png"
            alt="Qube Hero Desktop"
            fill
            className="absolute inset-0 w-full h-full hidden md:block object-cover"
          />
          
          {/* Mobile Background Image */}
          <Image
            src="/assets/homepage/hero/mobile.png"
            alt="Qube Hero Mobile"
            fill
            className="absolute inset-0 w-full min-h-[70vh] md:hidden object-cover"
            style={{ objectPosition: "bottom center" }}
          />

          {/* Text & Button Container */}
          <div className="absolute top-[23%] md:top-[30%] w-full md:w-auto md:left-[9%] text-center md:text-left">
            {/* Mobile Title (Single Line) */}
            <h1 className="text-2xl sm:text-4xl md:hidden font-chakra leading-[108%] tracking-wide">
              {isPublisher ? "BUILD FOR WEB3 GAMING" : "AMPLIFY YOUR INFLUENCE"}
            </h1>

            {/* Desktop Title (Two Lines) */}
            <h1 className="hidden md:block text-5xl lg:text-6xl xl:text-[80px] 2xl:text-[96px] font-chakra leading-[108%] tracking-wide">
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
              className="mt-4 md:mt-8 inline-block px-6 py-2 border-2 border-[#A5E100] text-black hover:text-[#A5E100] 
                        bg-[#A5E100] hover:bg-black rounded-md transition duration-300"
            >
              Launch App
            </Link>
          </div>
        </section>

        {/* About Section - Displaying Key Statistics */}
        <section id="about" className="scroll-mt-20 md:scroll-mt-32">
          <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-24 md:mt-5 px-7 md:px-20 xl:px-36">
            {/* Statistics Cards */}
            {statsData.map((stat, index) => (
              <div key={index} className="relative w-full">
                {/* Background Frame for the Statistic */}
                <Image
                  src="/assets/homepage/highlight-frame-glow.png"
                  alt="Stats Card"
                  width={568}
                  height={308}
                  className="w-full"
                />
                {/* Title for the Statistic */}
                <p className="absolute top-2 left-4 text-md text-[#8E8E8E]">
                  {stat.title}
                </p>
                {/* Statistic Value */}
                <h2 className="absolute inset-0 flex items-center justify-center text-[36px] font-chakra font-medium">
                  {stat.value}
                </h2>
              </div>
            ))}
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="relative w-full mt-20 md:mt-60 px-7 md:px-20 xl:px-36">
          {/* Section Title */}
          <h2 className="text-3xl md:text-5xl font-chakra font-medium leading-[108.8%] text-center mb-10 md:mb-20">
            TRUSTED BY
          </h2>

          {/* Border Image & Logos */}
          <div className="relative w-full flex flex-col items-center">
            <div className="relative w-full">
              <Image
                src={highlightFrame}
                alt="Section Border"
                width={1920}
                height={300}
                className="w-full h-[230px] xl:h-[140px]"
              />

              {/* Logos */}
              <div className="absolute inset-0 flex flex-wrap justify-center items-center gap-2 lg:gap-16 px-6 py-6">
                {trustedPartners.map((logo, index) => (
                  <div key={index} className="flex flex-row items-center gap-3">
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16">
                      <Image src={logo.src} alt={logo.name} fill className="rounded-full object-contain" />
                    </div>
                    <p className="text-xs md:text-xl">{logo.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why Us Section */}
        <section id="why-us" className="px-5 md:px-2 lg:px-16 xl:px-40 2xl:px-80 mt-20 md:mt-60 scroll-mt-20 md:scroll-mt-32">
          {/* Section Title */}
          <h2 className="font-chakra font-medium leading-[108.8%] text-center text-2xl md:text-5xl">
            {isPublisher ? "BUILD PARTNERSHIP THAT" : "CONNECT WITH"}
          </h2>
          <h2 className="font-chakra font-medium leading-[108.8%] text-center text-2xl md:text-5xl text-[#A5E100] mt-3 md:mt-5">
            {isPublisher ? "AMPLIFY YOUR REACH" : "TOP WEB3 GAMES"}
          </h2>
          <p className="text-center text-md md:text-xl text-[#8E8E8E] mt-3 md:mt-5">
            {isPublisher
              ? "Identify the best KOL/Guild/Community with audiences aligned to enhance your game growth."
              : "Work with the top games in the industry and seize the opportunity now!"
            }
          </p>

          {/* Content Section */}
          <div className="flex justify-center mt-10 md:mt-20">
            {isPublisher ? (
              <div className="w-full border border-[#8E8E8E] rounded-xl p-3 md:p-6 md:mx-20">
                {/* Tab Menu */}
                <div className="relative overflow-x-auto whitespace-nowrap mb-5 md:mb-10">
                  <div className="flex justify-around w-full mx-auto relative">
                    {/* Slide indicator for underline animation */}
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gray-600"></span>
                    <span
                      className="absolute bottom-0 h-[2px] bg-[#A5E100] transition-all duration-300"
                      style={indicatorStyle}
                    ></span>

                    {Object.keys(partnersData).map((tab) => (
                      <button
                        key={tab}
                        ref={(el) => {
                          if (el) {
                            tabRefs.current[tab] = el;
                          }
                        }}
                        onClick={() => setActiveTab(tab as keyof typeof partnersData)}
                        className={`relative flex-1 text-lg md:text-3xl font-bold px-4 py-2 text-center ${
                          activeTab === tab ? "text-[#A5E100]" : "text-[#8E8E8E] hover:text-gray-300 transition"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                {partnersData[activeTab].length > 0 ? (
                  <div
                    key={activeTab}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 transition-all duration-500 ease-out opacity-0 translate-y-4 animate-fade-in"
                  >
                    {partnersData[activeTab].map(({ image, name, country, role, followers }, index) => (
                      <div key={index} className="flex gap-4 items-center">
                        <Image src={image} alt={name} width={96} height={96} className="rounded-lg w-20 h-20 md:w-24 md:h-24" />
                        <div className="flex flex-col justify-center">
                          <h3 className="text-xl font-bold">{name}</h3>
                          <p className="text-md text-[#8E8E8E]">{country} ・ {role}</p>
                          <p className="text-md text-[#8E8E8E]">{followers}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-[#8E8E8E] transition-all duration-500 opacity-0 animate-fade-in">
                    No data available.
                  </p>
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

        {/* Monetization & Measurable Results Section */}
        <section className="px-7 md:px-20 xl:px-36 mt-20 md:mt-60">
          {/* Title */}
          <div className="font-chakra font-medium leading-[108.8%] text-center text-2xl md:text-5xl">
            <h2>{isPublisher ? "PAY ONLY FOR" : "MONETIZE"}</h2>
            <h3 className="font-chakra font-medium leading-[108.8%] text-[#A5E100] mt-3 md:mt-5">
              {isPublisher ? "MEASURABLE RESULTS" : "YOUR INFLUENCE"}
            </h3>
          </div>

          {!isPublisher && (
            <p className="text-center text-md md:text-xl text-[#8E8E8E] mt-3 md:mt-5">
              Have you built a thriving community without knowing how to generate income? We&apos;re here to support you!
            </p>
          )}

          {/* Feature Cards for Publisher */}
          {isPublisher ? (
            <div className="mt-10 md:mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-14 mx-auto">
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
                <Image src="/assets/homepage/influence/desktop.png" alt="Central Icon Desktop" width={600} height={600} className="hidden md:block w-full object-contain" />
                {/* Mobile Image */}
                <Image src="/assets/homepage/influence/mobile.png" alt="Central Icon Mobile" width={300} height={300} className="md:hidden w-full object-contain" />
              </div>
            </div>
          )}
        </section>

        {/* Analytics & Reporting Section */}
        <section className="px-7 md:px-20 xl:px-36 mt-20 md:mt-60">
          {/* Title */}
          <div className="font-chakra font-medium leading-[108.8%] text-center text-2xl md:text-5xl">
            <h2>{isPublisher ? "ACCESS CAMPAIGN" : "DATA-DRIVEN IMPACT"}</h2>
            {isPublisher && <p className="text-[#A5E100] mt-3 md:mt-5">ANALYTICS & REPORTING</p>}
          </div>
          
          {!isPublisher && (
            <p className="text-center text-md md:text-xl text-[#8E8E8E] mt-3 md:mt-5">
              Efficiently measure, analyze, and maximize your impact, engagement, reach, and conversions included.
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 md:mt-20">
            {/* Left Side: Statistics Data */}
            <div className="grid grid-cols-2 gap-3 md:gap-6 xl:gap-10">
              {analyticsStats.map((item, index) => (
                <div key={index} className="relative w-full h-full">
                  {/* Background Image */}
                  <Image src="/assets/homepage/highlight-frame-glow.png" alt="Stats Background" width={568} height={308} className="w-full h-full" />
                  
                  {/* Title */}
                  <p className="absolute top-2 left-4 text-xs md:text-md lg:text-lg text-[#8E8E8E]">
                    {item.title}
                  </p>
                  
                  {/* Value */}
                  <h2 className="absolute inset-0 flex items-center justify-center font-chakra font-medium leading-[108.8%] text-md md:text-lg lg:text-xl xl:text-3xl">
                    {item.value}
                  </h2>
                </div>
              ))}
            </div>

            {/* Right Side: Graph */}
            <div className="flex justify-center">
              <Image src="/assets/homepage/analytics-graph.png" alt="Analytics Graph" width={500} height={300} className="w-full max-w-lg" />
            </div>
          </div>
        </section>

        {/* Investors Section */}
        <section id="achievements" className="px-7 md:px-20 xl:px-36 mt-20 md:mt-60 scroll-mt-20 md:scroll-mt-32">
          {/* Title */}
          <h2 className="font-chakra font-medium leading-[108.8%] text-center text-2xl md:text-5xl">INVESTORS</h2>

          <div className="flex flex-col items-center mt-10 md:mt-20">
            {/* Border Image */}
            <div className="relative w-full">
              <Image
                src={highlightFrame}
                alt="Section Border"
                width={1920}
                height={300}
                className="w-full h-[100px] xl:h-[140px]"
              />

              {/* Investor Logos */}
              <div className="absolute inset-0 flex justify-center items-center gap-5 lg:gap-16 p-5 lg:p-10">
                {investorLogos.map((investor, index) => (
                  <div key={index} className="relative w-full h-full">
                    <Image src={investor.src} alt={investor.name} fill className="object-contain" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Our Clients Section */}
        <section className="md:px-20 xl:px-36 mt-20 md:mt-60">
          {/* Section Title */}
          <h1 className="font-chakra font-medium leading-[108.8%] text-center text-2xl md:text-5xl mb-10 md:mb-20">
            CLIENTS
          </h1>

          {/* Mobile: Auto-scrolling Client Logos */}
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

          {/* Desktop: Grid Layout for Client Logos */}
          <div className="hidden md:grid grid-cols-4 gap-10 place-items-center">
            {clientLogos.map((logo, index) => (
              <div key={index} className="w-24 h-24 md:w-40 md:h-40">
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
        {/* Background Image */}
        <Image
          src={footerImage}
          alt="Qube Footer"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 w-full h-full"
        />

        {/* Footer Content */}
        <div className="relative z-10 flex flex-col items-center text-center pb-5 pt-20 md:pt-32">
          {/* Catchphrase */}
          <h2 className="font-chakra font-medium leading-[108.8%] text-md md:text-2xl xl:text-4xl text-[#A5E100]">
            THE STRONGEST GROWTH DRIVER
          </h2>
          <h3 className="font-chakra font-medium leading-[108.8%] text-md md:text-2xl xl:text-4xl mt-2">FOR YOUR GAME</h3>

          <div className="mt-32 md:mt-40 lg:mt-60 flex flex-col md:flex-row gap-6 md:gap-12 lg:gap-28 xl:gap-40">
            {/* Logo & Social Icons */}
            <div className="flex flex-col items-center md:items-start">
              <Link href="#" className="flex items-center gap-3 transition-transform hover:-translate-y-1">
                <Image src="/qube.png" alt="Qube Logo" width={40} height={40} />
                <p className="text-2xl lg:text-5xl font-corporate">Qube</p>
              </Link>

              {/* Social Media Icons */}
              <div className="flex gap-2 mt-4">
                {socialMediaLinks.map(({ url, src, alt, size }, index) => (
                  <Link
                    key={index}
                    href={url}
                    target="_blank"
                    className="bg-black border border-[#8E8E8E] hover:border-gray-300 rounded-lg p-1 transition-shadow hover:shadow-lg flex items-center justify-center w-7 lg:w-9 h-7 lg:h-9"
                  >
                    <Image src={src} alt={alt} width={size} height={size} className="object-contain" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex flex-row space-x-5 md:space-x-10 lg:space-x-20 text-left text-sm md:text-base">
              {footerContent["en"].map(({ category, links }, index) => (
                <div key={index}>
                  <h4 className="text-[#A5E100] font-semibold">{category}</h4>
                  <ul className="mt-2 space-y-2">
                    {links.map(({ url, label }, linkIndex) => (
                      <li key={linkIndex}>
                        <a href={url} className="hover:text-[#A5E100]">
                          {label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <div className="text-[#8E8E8E] text-sm mt-20">
            &copy; {new Date().getFullYear()} All Rights Reserved by Ceed Inc.
          </div>
        </div>
      </footer>

    </div>
  );
}