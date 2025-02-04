"use client";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Dropdown } from "./components/common/Dropdown";
import { 
  languageOptions, navLinks, homepageContent, 
  trustedPartners, calendlyLink, clientLogos, 
  socialMediaLinks, footerTaglines, footerContent,
} from "./constants/homepageData";

export default function Home() {
  const DEFAULT_LANGUAGE = "en"; // Default language

  const searchParams = useSearchParams();
  const router = useRouter();

  // State to track if the role in query parameter is "affiliate"
  const [isAffiliate, setIsAffiliate] = useState(false);

  // State to track the selected language
  const [language, setLanguage] = useState("en"); // Default to English

  useEffect(() => {
    // Retrieve the "role" parameter from the searchParams
    const role = searchParams.get("role");
    // Set isAffiliate to true if "role" is "affiliate"
    setIsAffiliate(role === "affiliate");
  }, [searchParams]); // Run effect whenever searchParams changes

  useEffect(() => {
    // Extract supported languages from languageOptions
    const supportedLanguages = languageOptions.map(option => option.value);
  
    // Retrieve the "lg" parameter from the searchParams
    const lg = searchParams.get("lg");
    
    if (lg && supportedLanguages.includes(lg)) {
      setLanguage(lg);
    } else {
      setLanguage(DEFAULT_LANGUAGE); // Fallback to default language if no valid "lg" parameter is found
    }
  }, [searchParams]);

  // Function to handle URL updates for language or role changes
  const updateQueryParams = (params: { lg?: string; role?: string }) => {
    const currentParams = new URLSearchParams(searchParams.toString());

    // Update the parameters
    if (params.lg) currentParams.set("lg", params.lg);
    if (params.role) currentParams.set("role", params.role);

    // Push the updated URL
    router.push(`?${currentParams.toString()}`);
  };

  // Function to handle language change
  const changeLanguage = (selectedLabel: string) => {
    // Find the value corresponding to the selected label
    const selectedOption = languageOptions.find(
      (option) => option.label === selectedLabel
    );

    if (!selectedOption) {
      console.warn(`Language option with label "${selectedLabel}" not found.`);
      return; // Exit early if the selected label is invalid
    }

    // Update the language in the URL
    updateQueryParams({ lg: selectedOption.value });
  };

  // Determine the role key based on the `isAffiliate` state.
  // This key will be used to fetch the appropriate content from the homepageContent object.
  const roleKey = isAffiliate ? "affiliate" : "projectOwner";

  // Retrieve the content for the current language and role key.
  // If the content for the selected language is not found, fallback to the English version for "projectOwner".
  const content = homepageContent[language]?.[roleKey] ?? homepageContent["en"][roleKey];

  const [faqActiveIndex, setFaqActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    if (faqActiveIndex === index) {
      setFaqActiveIndex(null);
    } else {
      setFaqActiveIndex(index);
    }
  };

  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // ============= BEGIN CLIENT LOGO MANAGEMENT =============
  const SCROLL_INTERVAL = 10;
  const SCROLL_SPEED = 1;
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);
  
  useEffect(() => {
    const scrollElement = scrollRef.current;
    let scrollAmount = 0;
  
    // Set up interval to scroll the element
    const scrollInterval = setInterval(() => {
      if (scrollElement) {
        // Increment the scroll position by the defined scroll speed
        scrollElement.scrollLeft += SCROLL_SPEED;
        scrollAmount += SCROLL_SPEED;
  
        // Get the middle position of the scroll (to identify which logo is in the center)
        const middlePosition = scrollElement.scrollLeft + scrollElement.clientWidth / 2;
  
        // Calculate the width of each logo (including the duplicated logos for continuous scrolling)
        const logoWidth = scrollElement.scrollWidth / (clientLogos.length * 2);
  
        // Determine which logo is currently in the middle of the screen
        const currentIndex = Math.floor(middlePosition / logoWidth) % clientLogos.length;
  
        // Set the active dot (index) to reflect the current logo in the middle
        setActiveDot(currentIndex);
  
        // Reset the scroll to the beginning when it reaches the end
        if (scrollElement.scrollLeft >= scrollElement.scrollWidth / 2) {
          scrollElement.scrollLeft = 0;
          scrollAmount = 0;
        }
      }
    }, SCROLL_INTERVAL);
  
    // Clean up the interval on component unmount or update
    return () => clearInterval(scrollInterval);
  }, []);  
  // ============= END CLIENT LOGO MANAGEMENT =============

  const LaunchAppButton: React.FC = () => (
    <Link
      href="/onboarding"
      className="font-bold md:text-xl bg-lime-300 hover:bg-lime-100 py-2 px-8 rounded-md text-black"
    >
      Launch App
    </Link>
  );

  return (
    <div className="flex flex-col bg-black text-white">
      <Head>
        <title>Qube</title>
        <link rel="icon" href="/qube.png" />
      </Head>

      {/* Navbar */}
      <header className="fixed w-full pt-5 pb-2 z-10 bg-black">
        <div className="w-full lg:w-11/12 px-5 lg:px-0 flex flex-row justify-between items-center mx-auto">
          {/* Qube Icon Image */}
          <Link
            href="#"
            className="flex flex-row items-center gap-3 transition duration-300 ease-in-out transform hover:-translate-y-1"
          >
            <Image
              src="/qube.png"
              alt="qube.png"
              width={35}
              height={35}
            />
            <p className="text-3xl font-semibold font-corporate">Qube</p>
          </Link>

          {/* Menu Items */}
          <div className="hidden lg:flex flex-row items-center gap-4 xl:gap-10">
            {navLinks.map((link, index) => (
              <Link
                key={index}
                href={link.id}
                className="hover:text-gray-500"
              >
                {link.label}
              </Link>
            ))}
            {/* Conditionally render an additional link based on isAffiliate */}
            <button 
              onClick={() =>
                updateQueryParams({
                  role: isAffiliate ? "projectOwner" : "affiliate",
                  lg: language, // Maintain the current language
                })
              }
              className="hover:text-gray-500 cursor-pointer"
            >
              {isAffiliate ? "Publisher" : "KOL/Guild"}
            </button>
            {/* Language Dropdown */}
            <Dropdown
              options={languageOptions.map((option) => option.label)}
              selectedValues={languageOptions.find((option) => option.value === language)?.label || "English"}
              setSelectedValues={(value) => changeLanguage(value as string)}
            />
          </div>

          {/* Launch Button */}
          <div className="hidden lg:block">
            <LaunchAppButton />
          </div>

          {/* Menu Toggle Icon */}
          <div className="lg:hidden flex items-center">
            <button onClick={toggleMenu} className="focus:outline-none">
              <Image
                src={menuOpen 
                  ? "/assets/common/close-white.png" 
                  : "/assets/common/menu-white.png"
                }
                alt="Menu Toggle Icon"
                width={30}
                height={30}
              />
            </button>
          </div>
        </div>

        {/* Toggle Menu */}
        {menuOpen && (
          <div className="lg:hidden pt-4">
            <nav className="flex flex-col p-5 border-t border-gray-200">
              {navLinks.map((link, index) => (
                <Link 
                  key={index} 
                  href={link.id} 
                  className="py-2 hover:text-gray-500"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {/* Conditionally render an additional link based on isAffiliate in mobile view */}
              <button 
                onClick={() =>
                  updateQueryParams({
                    role: isAffiliate ? "projectOwner" : "affiliate",
                    lg: language, // Maintain the current language
                  })
                }
                className="hover:text-gray-500 cursor-pointer text-left mb-3"
              >
                {isAffiliate ? "Publisher" : "KOL/Guild"}
              </button>
              {/* Language Dropdown */}
              <Dropdown
                options={languageOptions.map((option) => option.label)}
                selectedValues={languageOptions.find((option) => option.value === language)?.label || "English"}
                setSelectedValues={(value) => changeLanguage(value as string)}
              />
            </nav>
          </div>
        )}
      </header>

      <main className="flex flex-col">

        {/* Home */}
        <section id="#" className="mb-14 md:mb-24 pt-28 md:pt-52 px-10 lg:px-0 h-[600px] md:h-screen flex flex-col items-center justify-between">
          {/* Intro Text */}
          <div className="text-center">
            <h1 className="text-2xl md:text-5xl font-bold mb-6 md:mb-10 relative">
              <span className="relative inline-block">
                {content.hero.titleLine1}
                {/* Underline Image */}
                {language === "en" && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 mt-[-5px] w-[200px] md:w-[400px]">
                    <img
                      src="/assets/homepage/blue-stylized-underline.png"
                      alt="Stylized Underline"
                      className="w-full"
                    />
                  </div>
                )}
              </span>
              <span className="relative inline-block">
                {content.hero.titleLine2}
                {/* Underline Image */}
                {language === "ja" && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 mt-[-5px] w-[200px] md:w-[400px]">
                    <img
                      src="/assets/homepage/blue-stylized-underline.png"
                      alt="Stylized Underline"
                      className="w-full"
                    />
                  </div>
                )}
              </span>
            </h1>
            <h2 className="text-lg md:text-3xl mb-5">
              {content.hero.subtitle}
            </h2>
            <p className="text-md md:text-xl">
              {content.hero.descriptionLine1}
              <br className="hidden md:block" />
              <span className="ml-1 md:ml-0">
                {content.hero.descriptionLine2}
              </span>
            </p>
          </div>
          {/* Launch Button */}
          <div className="my-16">
            <LaunchAppButton />
          </div>
          {/* Trusted Partners */}
          <div className="pb-10 md:pb-48 border-b border-gray-700 w-full lg:w-11/12">
            <p className="text-xl md:text-3xl text-center mb-4">Trusted By</p>
            <div className="flex flex-wrap justify-center gap-4 lg:gap-10">
              {trustedPartners.map((partner, index) => (
                <div key={index} className="flex items-center space-x-2 md:space-x-4">
                  <img
                    src={partner.logoUrl}
                    alt={partner.name}
                    className="w-8 md:w-12 h-8 md:h-12 rounded-full"
                  />
                  <span className="font-semibold">{partner.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About 1 */}
        <section id="about" className="pt-40 pb-10 lg:py-28 px-10 lg:px-0 lg:w-11/12 lg:mx-auto flex flex-col gap-10 lg:flex-row lg:items-center">
          {/* Text */}
          <div className="flex-1 text-center lg:text-start">
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-5 lg:mb-10">
              {content.about1.title1}
              <br className="hidden lg:block" />
              {!isAffiliate && (
                <>
                  <span className="mx-2 lg:mx-0">{content.about1.title2}</span>
                  <br className="hidden lg:block" />
                </>
              )}
              {content.about1.title3}
            </h1>
            <p className="text-md md:text-xl">
              {content.about1.description}
            </p>
          </div>
          {/* Image */}
          <Image
            src={content.about1.image}
            alt={content.about1.image}
            width={600}
            height={600}
            quality={100}
            className="flex-1 w-full h-auto object-cover"
          />
        </section>

        {/* About 2 */}
        <section className="py-10 px-10 lg:px-0 lg:w-11/12 lg:mx-auto flex flex-col gap-7 lg:gap-0 lg:flex-row-reverse lg:items-center">
          {/* Text */}
          <div className="flex-1 text-center lg:text-start">
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-5 lg:mb-10">
              {content.about2.title1}
              <br className="hidden lg:block" />
              {content.about2.title2}
            </h1>
            <p className="text-md md:text-xl">
              {content.about2.description}
            </p>
          </div>
          {/* Image */}
          <Image
            src={content.about2.image}
            alt={content.about2.image}
            width={600}
            height={600}
            quality={100}
            className="flex-1 w-full h-auto object-cover"
          />
        </section>

        {/* About 3 */}
        <section className="py-10 px-10 lg:px-0 lg:w-11/12 lg:mx-auto flex flex-col gap-7 lg:gap-0 lg:flex-row lg:items-center">
          {/* Text */}
          <div className="flex-1 text-center lg:text-start">
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-5 lg:mb-10">
              {content.about3.title1}
              <br className="hidden lg:block" />
              {content.about3.title2}
            </h1>
            <p className="text-md md:text-xl">
              {content.about3.description}
            </p>
          </div>
          {/* Image */}
          <Image
            src={content.about3.image}
            alt={content.about3.image}
            width={600}
            height={600}
            quality={100}
            className="flex-1 w-full h-auto object-cover"
          />
        </section>

        {/* Achievements */}
        <section id="achievements" className="pt-28 pb-20 px-10 lg:px-0 lg:w-11/12 lg:mx-auto text-center">
          <h1 className="text-2xl md:text-5xl font-bold mb-5 lg:mb-10">
            {content.achievements.title}
          </h1>
          {/* Achievement Cards */}
          <div className="flex flex-col lg:flex-row gap-12 px-5 py-14 rounded-lg justify-around bg-lime-400 text-black font-bold text-lg md:text-3xl">
            {content.achievements.items.map((achievement: { count: string; label: string }, index: number) => (
              <div key={index} className="bg-white rounded-lg py-5 lg:px-5 xl:px-10 flex-1">
                <p className="mb-5">{achievement.count}</p>
                <p>{achievement.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Our Clients */}
        <section id="clients" className="pt-28 pb-20">
          <h1 className="text-2xl md:text-5xl font-bold mb-5 lg:mb-10 text-center">
            {content.clients.title}
          </h1>
          {/* Client Logo Auto Scroll */}
          <div className="overflow-x-auto" ref={scrollRef}>
            <div className="flex items-center justify-start space-x-6 px-6">
              {clientLogos.concat(clientLogos).map((logo, index) => (
                <div key={index} className="p-4 flex-shrink-0">
                  <Image
                    src={logo}
                    alt={`Logo ${index + 1}`}
                    width={200}
                    height={200}
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Dots Indicator */}
          <div className="flex justify-center items-center mt-4">
            {clientLogos.map((_, index) => (
              <div
                key={index}
                className={`rounded-full mx-2 ${
                  activeDot === index ? "bg-lime-300 h-5 w-5" : "bg-gray-400 h-3 w-3"
                }`}
              />
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="pt-28 pb-20 w-11/12 lg:w-2/3 mx-auto">
          {/* Toggle Title */}
          <h1 className="text-2xl md:text-5xl font-bold mb-5 lg:mb-10 text-center">
            {content.faq.title}
          </h1>
          {/* Q&As */}
          <div className="p-10 md:px-20">
            {content.faq.items.map((faq: { question: string; answer: string }, index: number) => (
              <div key={index} className="mb-5">
                <div
                  className="cursor-pointer text-md lg:text-lg xl:text-2xl flex flex-row justify-between font-semibold"
                  onClick={() => toggleFAQ(index)}
                >
                  {faq.question}
                  <div className="w-5 md:w-7 h-5 md:h-7 md:p-1 bg-white rounded-full">
                    <Image
                      src={faqActiveIndex === index 
                        ? "/assets/common/arrow-upward-black.png" 
                        : "/assets/common/arrow-downward-black.png"
                      }
                      alt="up/down arrow"
                      width={20}
                      height={20}
                    />
                  </div>
                </div>
                {faqActiveIndex === index && (
                  <p className="text-md mr-8 mb-3">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact Us */}
        <section className="md:hidden w-11/12 mx-auto rounded-md text-center font-bold text-3xl bg-lime-300 text-black p-10">
          <p dangerouslySetInnerHTML={{ __html: content.contactUs.message }}></p>
          <Link href={calendlyLink} target="_blank">
            <button className="text-white text-xl bg-black rounded-lg shadow-md w-full py-4 mt-10">
              {content.contactUs.buttonLabel}
            </button>
          </Link>
        </section>

      </main>

      <footer className="w-11/12 mx-auto mt-20">
        {/* Footer Contents */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-0 mb-16">
          {/* Logo & Social Links */}
          <div className="lg:w-1/2 flex flex-col gap-5">
            <Link
              href="#"
              className="flex flex-row items-center gap-3 transition duration-300 ease-in-out transform hover:-translate-y-1"
            >
              <Image
                src="/qube.png"
                alt="qube.png"
                width={35}
                height={35}
              />
              <p className="text-3xl font-bold font-corporate">Qube</p>
            </Link>
            <div className="flex flex-row gap-5">
              {socialMediaLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.url}
                  target="_blank"
                  className="bg-[#222222] hover:bg-[#222222]/80 rounded-full inline-flex justify-center items-center h-8 w-8 p-1 hover:shadow-xl"
                >
                  <Image
                    src={link.src}
                    alt={link.alt}
                    width={link.size}
                    height={link.size}
                  />
                </Link>
              ))}
            </div>
            <p dangerouslySetInnerHTML={{ __html: footerTaglines[language as "en" | "ja"] }} />
          </div>
          {/* Other Links */}
          <div className="flex flex-row gap-10 md:gap-16 lg:gap-28">
            {footerContent[language as "en" | "ja"]?.map((category, index) => (
              <div key={index} className="flex flex-col gap-5">
                <h3 className="font-bold text-lime-300 text-xl">{category.category}</h3>
                {category.links.map((link, linkIndex) => (
                  <Link
                    key={linkIndex}
                    href={link.url}
                    target="_blank"
                    className="hover:text-slate-400"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* Border & Copyright */}
        <div className="border-b border-gray-700" />
        <p className="text-center text-gray-500 py-10 text-sm md:text-md lg:text-lg">
          © Copyright 2024, All Rights Reserved by Ceed Inc.
        </p>
      </footer>

    </div>
  );
}