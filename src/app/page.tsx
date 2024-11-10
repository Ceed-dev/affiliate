"use client";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { 
  navLinks, trustedPartners, statsInAbout, calendlyLink, 
  featureBlocks, achievements, clientLogos, 
  faqs, socialMediaLinks, footerLinks,
} from "./constants/homepageData";

export default function Home() {
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
    <Link href="/onboarding" className="font-bold md:text-xl bg-lime-300 hover:bg-lime-100 py-2 px-8 rounded-md text-black">
      Launch App
    </Link>
  );

  const StatsAndLink: React.FC = () => (
    <div className="flex flex-col gap-2 mt-10">
      {/* Two Stats Card */}
      <div className="flex flex-row gap-4 text-sm md:text-md">
        {statsInAbout.map((stat, index) => (
          <div key={index} className="flex flex-row gap-2">
            <Image src={stat.icon} alt={stat.label} width={40} height={40} />
            <div>
              <p className="font-bold">{stat.count}</p>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
      {/* "Book Demo" Button */}
      <Link href={calendlyLink} target="_blank" className="text-xl font-bold shadow-md bg-lime-300 hover:bg-lime-100 py-2 px-4 mt-5 rounded-md text-black mr-auto">
        Book Demo
      </Link>
    </div>
  );

  return (
    <div className="flex flex-col bg-black text-white">
      <Head>
        <title>Qube</title>
        <link rel="icon" href="/qube.png" />
      </Head>

      {/* Navbar */}
      <header className="fixed w-full pt-5 pb-2 z-10">
        <div className="w-full lg:w-11/12 px-5 lg:px-0 flex flex-row justify-between items-center mx-auto">
          {/* Qube Icon Image */}
          <Link href="#" className="flex flex-row items-center gap-3 transition duration-300 ease-in-out transform hover:-translate-y-1">
            <Image src="/qube.png" alt="qube.png" width={50} height={50} />
            <p className="text-lg font-semibold">Qube</p>
          </Link>
          {/* Menu Items */}
          <div className="hidden md:flex flex-row items-center gap-4 xl:gap-10">
            {navLinks.map((link, index) => (
              <Link key={index} href={link.id} className="hover:text-gray-500">{link.label}</Link>
            ))}
          </div>
          {/* Launch Button */}
          <div className="hidden md:block">
            <LaunchAppButton />
          </div>
          {/* Menu Toggle Icon */}
          <div className="md:hidden flex items-center">
            <button onClick={toggleMenu} className="focus:outline-none">
              <Image src={menuOpen ? "/assets/common/close-white.png" : "/assets/common/hamburger.png"} alt="Menu Toggle Icon" width={30} height={30} />
            </button>
          </div>
        </div>
        {/* Toggle Menu */}
        {menuOpen && (
          <div className="md:hidden pt-4 bg-black">
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
            </nav>
          </div>
        )}
      </header>

      <main className="flex flex-col">

        {/* Home */}
        <section id="#" className="pt-28 md:pt-52 px-10 lg:px-0 h-[600px] md:h-screen flex flex-col items-center justify-between">
          {/* Intro Text */}
          <div className="text-center">
            <h1 className="text-2xl md:text-5xl font-bold mb-6 md:mb-10 relative">
              <span className="relative inline-block">
                Drive Acquisition
                {/* Underline Image */}
                <div className="absolute left-1/2 transform -translate-x-1/2 mt-[-5px] w-[200px] md:w-[400px]">
                  <img
                    src="/assets/homepage/blue-stylized-underline.png"
                    alt="Stylized Underline"
                    className="w-full"
                  />
                </div>
              </span>
              , Amplify Revenue
            </h1>
            <h2 className="text-lg md:text-3xl mb-5">Ready to Grow with a Network that Rewards Results?</h2>
            <p className="text-md md:text-xl">
              Our network connects you with gaming influencers and guilds across Asia,
              <br className="hidden md:block" />
              <span className="ml-1 md:ml-0">enabling large-scale audience reach and conversion.</span>
            </p>
          </div>
          {/* Launch Button */}
          <div className="my-12 lg:my-0">
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

        {/* About */}
        <section id="about" className="pt-28 pb-20 px-10 lg:px-0 lg:w-11/12 lg:mx-auto flex flex-col lg:flex-row">
          {/* Intro Text */}
          <div className="mr-10 md:mr-20 xl:mr-52 pb-5 lg:pb-0">
            <h1 className="text-2xl md:text-5xl font-bold mb-5 lg:mb-10">A product that is more than a tool</h1>
            <p className="text-md md:text-xl">Our expertises will help you launch an unique campaign made only for your game and achieve regional, segmented user acquisition and drive your growth.</p>
            {/* Two Stats And Button */}
            <div className="hidden lg:flex">
              <StatsAndLink />
            </div>
          </div>
          {/* UA Image */}
          <div className="flex justify-center items-start w-[300px] sm:w-[500px] md:w-[600px] lg:w-[1000px] mx-auto">
            <Image
              src="/assets/homepage/ua-number-screen.png"
              alt="UA Number Screen"
              width={500} 
              height={500} 
              className="w-full h-auto object-cover"
            />
          </div>
          {/* Two Stats And Button */}
          <div className="lg:hidden">
            <StatsAndLink />
          </div>
        </section>

        {/* Why Choose Us? */}
        <section id="why" className="pt-28 pb-20 px-10 lg:px-0 lg:w-11/12 lg:mx-auto text-center">
          <h1 className="text-2xl md:text-5xl font-bold mb-5 lg:mb-10">Why Choose Us?</h1>
          {/* Feature Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {featureBlocks.map((block, index) => (
              <div
                key={index}
                className="flex flex-col gap-5 items-center p-6"
              >
                <Image src={block.icon} alt={block.title} width={50} height={50} />
                <h3 className="text-xl font-semibold mt-4">{block.title}</h3>
                <p className="mt-2">{block.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Achievements */}
        <section id="achievements" className="pt-28 pb-20 px-10 lg:px-0 lg:w-11/12 lg:mx-auto text-center">
          <h1 className="text-2xl md:text-5xl font-bold mb-5 lg:mb-10">Achievements</h1>
          {/* Achievement Cards */}
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-0 px-5 py-14 rounded-lg justify-around bg-lime-400 text-black font-bold text-lg md:text-3xl">
            {achievements.map((achievement, index) => (
              <div key={index} className="bg-white rounded-lg py-5 lg:px-5 xl:px-10">
                <p className="mb-5">{achievement.count}</p>
                <p>{achievement.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Our Clients */}
        <section id="clients" className="pt-28 pb-20">
          <h1 className="text-2xl md:text-5xl font-bold mb-5 lg:mb-10 text-center">Our Clients</h1>
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
            <span className="block md:hidden">FAQ</span>
            <span className="hidden md:block">Frequently Asked Questions</span>
          </h1>
          {/* Q&As */}
          <div className="p-10 md:px-20">
            {faqs.map((faq, index) => (
              <div key={index} className="mb-5">
                <div
                  className="cursor-pointer text-md lg:text-lg xl:text-2xl flex flex-row justify-between font-semibold"
                  onClick={() => toggleFAQ(index)}
                >
                  {faq.question}
                  <div className="w-5 md:w-7 h-5 md:h-7 md:p-1 bg-white rounded-full">
                    <Image src={faqActiveIndex === index ? "/assets/common/up-arrow.png" : "/assets/common/down-arrow.png"} alt="up/down arrow" width={20} height={20} />
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
          <p>Let&apos;s grab some<br />time and explore!</p>
          <Link href={calendlyLink} target="_blank">
            <button className="text-white text-xl bg-black rounded-lg shadow-md w-full py-4 mt-10">
              Contact Us
            </button>
          </Link>
        </section>

      </main>

      <footer className="w-11/12 mx-auto mt-20">
        {/* Footer Contents */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-0 mb-16">
          {/* Logo & Social Links */}
          <div className="lg:w-1/2 flex flex-col gap-5">
            <Link href="#" className="flex flex-row items-center gap-3 transition duration-300 ease-in-out transform hover:-translate-y-1">
              <Image src="/qube.png" alt="qube.png" width={50} height={50} />
              <p className="text-2xl font-bold">Qube</p>
            </Link>
            <div className="flex flex-row gap-5">
              {socialMediaLinks.map((link, index) => (
                <Link key={index} href={link.url} target="_blank" className="bg-white hover:bg-slate-200 rounded-full inline-flex justify-center items-center h-7 w-7 p-2 hover:shadow-xl">
                  <Image src={link.src} alt={link.alt} width={20} height={20} />
                </Link>
              ))}
            </div>
            <p>The strongest growth driver for your<br />game.<br />Launch Campaign and Acquire<br />targeted users.</p>
          </div>
          {/* Other Links */}
          <div className="flex flex-row gap-10 md:gap-16 lg:gap-28">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="flex flex-col gap-5">
                <h3 className="font-bold text-lime-300 text-xl">{category}</h3>
                {links.map(link => (
                  <Link key={link.label} href={link.url} target="_blank" className="hover:text-slate-400">
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* Border & Copyright */}
        <div className="border-b border-gray-700" />
        <p className="text-center text-gray-500 py-10 text-sm md:text-md lg:text-lg">© Copyright 2022, All Rights Reserved by Qube.</p>
      </footer>

    </div>
  );
}