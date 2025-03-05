// "use client";

// import Head from "next/head";
// import Image from "next/image";
// import Link from "next/link";
// import { useSearchParams, useRouter } from "next/navigation";
// import { useState, useEffect, useRef } from "react";
// import { Dropdown } from "./components/common/Dropdown";
// import { 
//   languageOptions, navLinks, homepageContent, 
//   trustedPartners, calendlyLink, clientLogos, 
//   socialMediaLinks, footerTaglines, footerContent,
// } from "./constants/homepageData";

// export default function Home() {
//   const DEFAULT_LANGUAGE = "en"; // Default language

//   const searchParams = useSearchParams();
//   const router = useRouter();

//   // State to track if the role in query parameter is "affiliate"
//   const [isAffiliate, setIsAffiliate] = useState(false);

//   // State to track the selected language
//   const [language, setLanguage] = useState("en"); // Default to English

//   useEffect(() => {
//     // Retrieve the "role" parameter from the searchParams
//     const role = searchParams.get("role");
//     // Set isAffiliate to true if "role" is "affiliate"
//     setIsAffiliate(role === "affiliate");
//   }, [searchParams]); // Run effect whenever searchParams changes

//   useEffect(() => {
//     // Extract supported languages from languageOptions
//     const supportedLanguages = languageOptions.map(option => option.value);
  
//     // Retrieve the "lg" parameter from the searchParams
//     const lg = searchParams.get("lg");
    
//     if (lg && supportedLanguages.includes(lg)) {
//       setLanguage(lg);
//     } else {
//       setLanguage(DEFAULT_LANGUAGE); // Fallback to default language if no valid "lg" parameter is found
//     }
//   }, [searchParams]);

//   // Function to handle URL updates for language or role changes
//   const updateQueryParams = (params: { lg?: string; role?: string }) => {
//     const currentParams = new URLSearchParams(searchParams.toString());

//     // Update the parameters
//     if (params.lg) currentParams.set("lg", params.lg);
//     if (params.role) currentParams.set("role", params.role);

//     // Push the updated URL
//     router.push(`?${currentParams.toString()}`);
//   };

//   // Function to handle language change
//   const changeLanguage = (selectedLabel: string) => {
//     // Find the value corresponding to the selected label
//     const selectedOption = languageOptions.find(
//       (option) => option.label === selectedLabel
//     );

//     if (!selectedOption) {
//       console.warn(`Language option with label "${selectedLabel}" not found.`);
//       return; // Exit early if the selected label is invalid
//     }

//     // Update the language in the URL
//     updateQueryParams({ lg: selectedOption.value });
//   };

//   // Determine the role key based on the `isAffiliate` state.
//   // This key will be used to fetch the appropriate content from the homepageContent object.
//   const roleKey = isAffiliate ? "affiliate" : "projectOwner";

//   // Retrieve the content for the current language and role key.
//   // If the content for the selected language is not found, fallback to the English version for "projectOwner".
//   const content = homepageContent[language]?.[roleKey] ?? homepageContent["en"][roleKey];

//   const [faqActiveIndex, setFaqActiveIndex] = useState<number | null>(null);

//   const toggleFAQ = (index: number) => {
//     if (faqActiveIndex === index) {
//       setFaqActiveIndex(null);
//     } else {
//       setFaqActiveIndex(index);
//     }
//   };

//   const [menuOpen, setMenuOpen] = useState(false);

//   const toggleMenu = () => {
//     setMenuOpen(!menuOpen);
//   };

//   // ============= BEGIN CLIENT LOGO MANAGEMENT =============
//   const SCROLL_INTERVAL = 10;
//   const SCROLL_SPEED = 1;
  
//   const scrollRef = useRef<HTMLDivElement>(null);
//   const [activeDot, setActiveDot] = useState(0);
  
//   useEffect(() => {
//     const scrollElement = scrollRef.current;
//     let scrollAmount = 0;
  
//     // Set up interval to scroll the element
//     const scrollInterval = setInterval(() => {
//       if (scrollElement) {
//         // Increment the scroll position by the defined scroll speed
//         scrollElement.scrollLeft += SCROLL_SPEED;
//         scrollAmount += SCROLL_SPEED;
  
//         // Get the middle position of the scroll (to identify which logo is in the center)
//         const middlePosition = scrollElement.scrollLeft + scrollElement.clientWidth / 2;
  
//         // Calculate the width of each logo (including the duplicated logos for continuous scrolling)
//         const logoWidth = scrollElement.scrollWidth / (clientLogos.length * 2);
  
//         // Determine which logo is currently in the middle of the screen
//         const currentIndex = Math.floor(middlePosition / logoWidth) % clientLogos.length;
  
//         // Set the active dot (index) to reflect the current logo in the middle
//         setActiveDot(currentIndex);
  
//         // Reset the scroll to the beginning when it reaches the end
//         if (scrollElement.scrollLeft >= scrollElement.scrollWidth / 2) {
//           scrollElement.scrollLeft = 0;
//           scrollAmount = 0;
//         }
//       }
//     }, SCROLL_INTERVAL);
  
//     // Clean up the interval on component unmount or update
//     return () => clearInterval(scrollInterval);
//   }, []);  
//   // ============= END CLIENT LOGO MANAGEMENT =============

//   const LaunchAppButton: React.FC = () => (
//     <Link
//       href="/onboarding"
//       className="font-bold md:text-xl bg-lime-300 hover:bg-lime-100 py-2 px-8 rounded-md text-black"
//     >
//       Launch App
//     </Link>
//   );

//   return (
//     <div className="flex flex-col bg-black text-white">
//       <Head>
//         <title>Qube</title>
//         <link rel="icon" href="/qube.png" />
//       </Head>

//       {/* Navbar */}
//       <header className="fixed w-full pt-5 pb-2 z-10 bg-black">
//         <div className="w-full lg:w-11/12 px-5 lg:px-0 flex flex-row justify-between items-center mx-auto">
//           {/* Qube Icon Image */}
//           <Link
//             href="#"
//             className="flex flex-row items-center gap-3 transition duration-300 ease-in-out transform hover:-translate-y-1"
//           >
//             <Image
//               src="/qube.png"
//               alt="qube.png"
//               width={35}
//               height={35}
//             />
//             <p className="text-3xl font-semibold font-corporate">Qube</p>
//           </Link>

//           {/* Menu Items */}
//           <div className="hidden lg:flex flex-row items-center gap-4 xl:gap-10">
//             {navLinks.map((link, index) => (
//               <Link
//                 key={index}
//                 href={link.id}
//                 className="hover:text-gray-500"
//               >
//                 {link.label}
//               </Link>
//             ))}
//             {/* Conditionally render an additional link based on isAffiliate */}
//             <button 
//               onClick={() =>
//                 updateQueryParams({
//                   role: isAffiliate ? "projectOwner" : "affiliate",
//                   lg: language, // Maintain the current language
//                 })
//               }
//               className="hover:text-gray-500 cursor-pointer"
//             >
//               {isAffiliate ? "Publisher" : "KOL/Guild"}
//             </button>
//             {/* Language Dropdown */}
//             <Dropdown
//               options={languageOptions.map((option) => option.label)}
//               selectedValues={languageOptions.find((option) => option.value === language)?.label || "English"}
//               setSelectedValues={(value) => changeLanguage(value as string)}
//             />
//           </div>

//           {/* Launch Button */}
//           <div className="hidden lg:block">
//             <LaunchAppButton />
//           </div>

//           {/* Menu Toggle Icon */}
//           <div className="lg:hidden flex items-center">
//             <button onClick={toggleMenu} className="focus:outline-none">
//               <Image
//                 src={menuOpen 
//                   ? "/assets/common/close-white.png" 
//                   : "/assets/common/menu-white.png"
//                 }
//                 alt="Menu Toggle Icon"
//                 width={30}
//                 height={30}
//               />
//             </button>
//           </div>
//         </div>

//         {/* Toggle Menu */}
//         {menuOpen && (
//           <div className="lg:hidden pt-4">
//             <nav className="flex flex-col p-5 border-t border-gray-200">
//               {navLinks.map((link, index) => (
//                 <Link 
//                   key={index} 
//                   href={link.id} 
//                   className="py-2 hover:text-gray-500"
//                   onClick={() => setMenuOpen(false)}
//                 >
//                   {link.label}
//                 </Link>
//               ))}
//               {/* Conditionally render an additional link based on isAffiliate in mobile view */}
//               <button 
//                 onClick={() =>
//                   updateQueryParams({
//                     role: isAffiliate ? "projectOwner" : "affiliate",
//                     lg: language, // Maintain the current language
//                   })
//                 }
//                 className="hover:text-gray-500 cursor-pointer text-left mb-3"
//               >
//                 {isAffiliate ? "Publisher" : "KOL/Guild"}
//               </button>
//               {/* Language Dropdown */}
//               <Dropdown
//                 options={languageOptions.map((option) => option.label)}
//                 selectedValues={languageOptions.find((option) => option.value === language)?.label || "English"}
//                 setSelectedValues={(value) => changeLanguage(value as string)}
//               />
//             </nav>
//           </div>
//         )}
//       </header>

//       <main className="flex flex-col">

//         {/* Home */}
//         <section id="#" className="mb-14 md:mb-24 pt-28 md:pt-52 px-10 lg:px-0 h-[600px] md:h-screen flex flex-col items-center justify-between">
//           {/* Intro Text */}
//           <div className="text-center">
//             <h1 className="text-2xl md:text-5xl font-bold mb-6 md:mb-10 relative">
//               <span className="relative inline-block">
//                 {content.hero.titleLine1}
//                 {/* Underline Image */}
//                 {language === "en" && (
//                   <div className="absolute left-1/2 transform -translate-x-1/2 mt-[-5px] w-[200px] md:w-[400px]">
//                     <img
//                       src="/assets/homepage/blue-stylized-underline.png"
//                       alt="Stylized Underline"
//                       className="w-full"
//                     />
//                   </div>
//                 )}
//               </span>
//               <span className="relative inline-block">
//                 {content.hero.titleLine2}
//                 {/* Underline Image */}
//                 {language === "ja" && (
//                   <div className="absolute left-1/2 transform -translate-x-1/2 mt-[-5px] w-[200px] md:w-[400px]">
//                     <img
//                       src="/assets/homepage/blue-stylized-underline.png"
//                       alt="Stylized Underline"
//                       className="w-full"
//                     />
//                   </div>
//                 )}
//               </span>
//             </h1>
//             <h2 className="text-lg md:text-3xl mb-5">
//               {content.hero.subtitle}
//             </h2>
//             <p className="text-md md:text-xl">
//               {content.hero.descriptionLine1}
//               <br className="hidden md:block" />
//               <span className="ml-1 md:ml-0">
//                 {content.hero.descriptionLine2}
//               </span>
//             </p>
//           </div>
//           {/* Launch Button */}
//           <div className="my-16">
//             <LaunchAppButton />
//           </div>
//           {/* Trusted Partners */}
//           <div className="pb-10 md:pb-48 border-b border-gray-700 w-full lg:w-11/12">
//             <p className="text-xl md:text-3xl text-center mb-4">Trusted By</p>
//             <div className="flex flex-wrap justify-center gap-4 lg:gap-10">
//               {trustedPartners.map((partner, index) => (
//                 <div key={index} className="flex items-center space-x-2 md:space-x-4">
//                   <img
//                     src={partner.logoUrl}
//                     alt={partner.name}
//                     className="w-8 md:w-12 h-8 md:h-12 rounded-full"
//                   />
//                   <span className="font-semibold">{partner.name}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>

//         {/* About 1 */}
//         <section id="about" className="pt-40 pb-10 lg:py-28 px-10 lg:px-0 lg:w-11/12 lg:mx-auto flex flex-col gap-10 lg:flex-row lg:items-center">
//           {/* Text */}
//           <div className="flex-1 text-center lg:text-start">
//             <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-5 lg:mb-10">
//               {content.about1.title1}
//               <br className="hidden lg:block" />
//               {!isAffiliate && (
//                 <>
//                   <span className="mx-2 lg:mx-0">{content.about1.title2}</span>
//                   <br className="hidden lg:block" />
//                 </>
//               )}
//               {content.about1.title3}
//             </h1>
//             <p className="text-md md:text-xl">
//               {content.about1.description}
//             </p>
//           </div>
//           {/* Image */}
//           <Image
//             src={content.about1.image}
//             alt={content.about1.image}
//             width={600}
//             height={600}
//             quality={100}
//             className="flex-1 w-full h-auto object-cover"
//           />
//         </section>

//         {/* About 2 */}
//         <section className="py-10 px-10 lg:px-0 lg:w-11/12 lg:mx-auto flex flex-col gap-7 lg:gap-0 lg:flex-row-reverse lg:items-center">
//           {/* Text */}
//           <div className="flex-1 text-center lg:text-start">
//             <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-5 lg:mb-10">
//               {content.about2.title1}
//               <br className="hidden lg:block" />
//               {content.about2.title2}
//             </h1>
//             <p className="text-md md:text-xl">
//               {content.about2.description}
//             </p>
//           </div>
//           {/* Image */}
//           <Image
//             src={content.about2.image}
//             alt={content.about2.image}
//             width={600}
//             height={600}
//             quality={100}
//             className="flex-1 w-full h-auto object-cover"
//           />
//         </section>

//         {/* About 3 */}
//         <section className="py-10 px-10 lg:px-0 lg:w-11/12 lg:mx-auto flex flex-col gap-7 lg:gap-0 lg:flex-row lg:items-center">
//           {/* Text */}
//           <div className="flex-1 text-center lg:text-start">
//             <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-5 lg:mb-10">
//               {content.about3.title1}
//               <br className="hidden lg:block" />
//               {content.about3.title2}
//             </h1>
//             <p className="text-md md:text-xl">
//               {content.about3.description}
//             </p>
//           </div>
//           {/* Image */}
//           <Image
//             src={content.about3.image}
//             alt={content.about3.image}
//             width={600}
//             height={600}
//             quality={100}
//             className="flex-1 w-full h-auto object-cover"
//           />
//         </section>

//         {/* Achievements */}
//         <section id="achievements" className="pt-28 pb-20 px-10 lg:px-0 lg:w-11/12 lg:mx-auto text-center">
//           <h1 className="text-2xl md:text-5xl font-bold mb-5 lg:mb-10">
//             {content.achievements.title}
//           </h1>
//           {/* Achievement Cards */}
//           <div className="flex flex-col lg:flex-row gap-12 px-5 py-14 rounded-lg justify-around bg-lime-400 text-black font-bold text-lg md:text-3xl">
//             {content.achievements.items.map((achievement: { count: string; label: string }, index: number) => (
//               <div key={index} className="bg-white rounded-lg py-5 lg:px-5 xl:px-10 flex-1">
//                 <p className="mb-5">{achievement.count}</p>
//                 <p>{achievement.label}</p>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* Our Clients */}
//         <section id="clients" className="pt-28 pb-20">
//           <h1 className="text-2xl md:text-5xl font-bold mb-5 lg:mb-10 text-center">
//             {content.clients.title}
//           </h1>
//           {/* Client Logo Auto Scroll */}
//           <div className="overflow-x-auto" ref={scrollRef}>
//             <div className="flex items-center justify-start space-x-6 px-6">
//               {clientLogos.concat(clientLogos).map((logo, index) => (
//                 <div key={index} className="p-4 flex-shrink-0">
//                   <Image
//                     src={logo}
//                     alt={`Logo ${index + 1}`}
//                     width={200}
//                     height={200}
//                     className="object-contain"
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>
//           {/* Dots Indicator */}
//           <div className="flex justify-center items-center mt-4">
//             {clientLogos.map((_, index) => (
//               <div
//                 key={index}
//                 className={`rounded-full mx-2 ${
//                   activeDot === index ? "bg-lime-300 h-5 w-5" : "bg-gray-400 h-3 w-3"
//                 }`}
//               />
//             ))}
//           </div>
//         </section>

//         {/* FAQ */}
//         <section id="faq" className="pt-28 pb-20 w-11/12 lg:w-2/3 mx-auto">
//           {/* Toggle Title */}
//           <h1 className="text-2xl md:text-5xl font-bold mb-5 lg:mb-10 text-center">
//             {content.faq.title}
//           </h1>
//           {/* Q&As */}
//           <div className="p-10 md:px-20">
//             {content.faq.items.map((faq: { question: string; answer: string }, index: number) => (
//               <div key={index} className="mb-5">
//                 <div
//                   className="cursor-pointer text-md lg:text-lg xl:text-2xl flex flex-row justify-between font-semibold"
//                   onClick={() => toggleFAQ(index)}
//                 >
//                   {faq.question}
//                   <div className="w-5 md:w-7 h-5 md:h-7 md:p-1 bg-white rounded-full">
//                     <Image
//                       src={faqActiveIndex === index 
//                         ? "/assets/common/arrow-upward-black.png" 
//                         : "/assets/common/arrow-downward-black.png"
//                       }
//                       alt="up/down arrow"
//                       width={20}
//                       height={20}
//                     />
//                   </div>
//                 </div>
//                 {faqActiveIndex === index && (
//                   <p className="text-md mr-8 mb-3">{faq.answer}</p>
//                 )}
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* Contact Us */}
//         <section className="md:hidden w-11/12 mx-auto rounded-md text-center font-bold text-3xl bg-lime-300 text-black p-10">
//           <p dangerouslySetInnerHTML={{ __html: content.contactUs.message }}></p>
//           <Link href={calendlyLink} target="_blank">
//             <button className="text-white text-xl bg-black rounded-lg shadow-md w-full py-4 mt-10">
//               {content.contactUs.buttonLabel}
//             </button>
//           </Link>
//         </section>

//       </main>

//       <footer className="w-11/12 mx-auto mt-20">
//         {/* Footer Contents */}
//         <div className="flex flex-col lg:flex-row gap-10 lg:gap-0 mb-16">
//           {/* Logo & Social Links */}
//           <div className="lg:w-1/2 flex flex-col gap-5">
//             <Link
//               href="#"
//               className="flex flex-row items-center gap-3 transition duration-300 ease-in-out transform hover:-translate-y-1"
//             >
//               <Image
//                 src="/qube.png"
//                 alt="qube.png"
//                 width={35}
//                 height={35}
//               />
//               <p className="text-3xl font-bold font-corporate">Qube</p>
//             </Link>
//             <div className="flex flex-row gap-5">
//               {socialMediaLinks.map((link, index) => (
//                 <Link
//                   key={index}
//                   href={link.url}
//                   target="_blank"
//                   className="bg-[#222222] hover:bg-[#222222]/80 rounded-full inline-flex justify-center items-center h-8 w-8 p-1 hover:shadow-xl"
//                 >
//                   <Image
//                     src={link.src}
//                     alt={link.alt}
//                     width={link.size}
//                     height={link.size}
//                   />
//                 </Link>
//               ))}
//             </div>
//             <p dangerouslySetInnerHTML={{ __html: footerTaglines[language as "en" | "ja"] }} />
//           </div>
//           {/* Other Links */}
//           <div className="flex flex-row gap-10 md:gap-16 lg:gap-28">
//             {footerContent[language as "en" | "ja"]?.map((category, index) => (
//               <div key={index} className="flex flex-col gap-5">
//                 <h3 className="font-bold text-lime-300 text-xl">{category.category}</h3>
//                 {category.links.map((link, linkIndex) => (
//                   <Link
//                     key={linkIndex}
//                     href={link.url}
//                     target="_blank"
//                     className="hover:text-slate-400"
//                   >
//                     {link.label}
//                   </Link>
//                 ))}
//               </div>
//             ))}
//           </div>
//         </div>
//         {/* Border & Copyright */}
//         <div className="border-b border-gray-700" />
//         <p className="text-center text-gray-500 py-10 text-sm md:text-md lg:text-lg">
//           © Copyright 2024, All Rights Reserved by Ceed Inc.
//         </p>
//       </footer>

//     </div>
//   );
// }

"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { clientLogos, socialMediaLinks, footerContent } from "./constants/homepageData";

export default function NewHome() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const partnersData = {
    Game: [
      {
        name: "VMG.ron",
        country: "Philippines",
        role: "Streamer",
        followers: "340k+ Follower",
        image: "/tmp/game1.png",
      },
      {
        name: "marksenpai26",
        country: "Philippines",
        role: "Tutorial",
        followers: "142k+ Follower",
        image: "/tmp/game2.png",
      },
      {
        name: "VLADRAX",
        country: "Philippines",
        role: "Streamer",
        followers: "13k+ Follower",
        image: "/tmp/game3.png",
      },
      {
        name: "Elisa",
        country: "France & Spain",
        role: "Streamer",
        followers: "50k+ Follower",
        image: "/tmp/game4.png",
      },
    ],
    NFT: [
      {
        name: "David",
        country: "Vietnam",
        role: "Creator",
        followers: "15k+ Follower",
        image: "/tmp/nft1.png",
      },
      {
        name: "kasotukun",
        country: "Japan",
        role: "Creator",
        followers: "41k+ Follower",
        image: "/tmp/nft2.png",
      },
      {
        name: "DzT DAO",
        country: "Japan",
        role: "Creator",
        followers: "28k+ Follower",
        image: "/tmp/nft3.png",
      },
    ],
    Meme: [],
    DeFi: [],
  };

  const [activeTab, setActiveTab] = useState<keyof typeof partnersData>("Game");

  const features = [
    {
      icon: "/tmp/pay1.png", // 仮のアイコンパス
      title: "Launch Campaign",
    },
    {
      icon: "/tmp/pay2.png", // 仮のアイコンパス
      title: "Dashboard Monitor",
    },
    {
      icon: "/tmp/pay3.png", // 仮のアイコンパス
      title: "Pay for the CV only",
    },
  ];

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

  const [isPublisher, setIsPublisher] = useState(true);

  const kolGuildData = [
    { image: "/tmp/connect1.png", name: "Beacon" },
    { image: "/tmp/connect2.png", name: "Pirate Nation" },
    { image: "/tmp/connect3.png", name: "Counter Fire" },
    { image: "/tmp/connect4.png", name: "King Destiny" },
  ];

  return (
    <div className="relative min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full h-[64px] md:h-[87px] px-5 md:px-2 lg:px-16 xl:px-40 2xl:px-80 flex items-center justify-between bg-black/60 backdrop-blur-md border-b border-[#242424] z-40">
        {/* Logo */}
        <Link href="#" className="flex flex-row items-center gap-3 transition duration-300 ease-in-out transform hover:-translate-y-1">
          <Image src="/qube.png" alt="Qube Logo" width={36} height={36} />
          <p className="text-3xl font-corporate">Qube</p>
        </Link>

        {/* Navigation (Desktop) */}
        <nav className="hidden md:flex space-x-4 lg:space-x-8 items-center">
          <Link href="#" className="hover:text-gray-400">Home</Link>
          <div className="h-11 w-px bg-white"></div>
          <Link href="#about" className="hover:text-gray-400">About</Link>
          <div className="h-11 w-px bg-white"></div>
          <Link href="#why-us" className="hover:text-gray-400">Why us</Link>
          <div className="h-11 w-px bg-white"></div>
          <Link href="#achievements" className="hover:text-gray-400">Achievements</Link>
          <div className="h-11 w-px bg-white"></div>
          <button onClick={() => setIsPublisher(!isPublisher)} className="hover:text-gray-400">
            {isPublisher ? "KOL/Guild" : "Publisher"}
          </button>
        </nav>

        {/* Launch App Button */}
        <Link href="/onboarding" className="hidden md:block px-6 py-2 bg-lime-300 text-black font-bold rounded-md hover:bg-lime-200">Launch App</Link>

        {/* Hamburger Menu Button (Mobile) */}
        <button onClick={toggleMenu} className="md:hidden focus:outline-none">
          <Image src="/assets/common/menu-white.png" alt="Menu" width={30} height={30} />
        </button>
      </header>

      {/* Mobile Navigation Menu */}
      <div
        className={`fixed top-0 left-0 w-full bg-black flex flex-col items-center justify-center transform ${menuOpen ? "translate-y-0" : "-translate-y-full"} transition-transform duration-300 ease-in-out z-50`}
      >
        {/* Close Button as a Separate Row */}
        <button
          onClick={toggleMenu}
          className="w-full flex justify-end px-6 py-4"
        >
          <Image src="/assets/common/close-white.png" alt="Close Menu" width={30} height={30} />
        </button>
        <Link href="#" className="text-xl hover:text-gray-400 py-5 w-full text-center border-b border-[#4A4A4A]" onClick={toggleMenu}>Home</Link>
        <Link href="#about" className="text-xl hover:text-gray-400 py-5 w-full text-center border-b border-[#4A4A4A]" onClick={toggleMenu}>About</Link>
        <Link href="#why-us" className="text-xl hover:text-gray-400 py-5 w-full text-center border-b border-[#4A4A4A]" onClick={toggleMenu}>Why us</Link>
        <Link href="#achievements" className="text-xl hover:text-gray-400 py-5 w-full text-center border-b border-[#4A4A4A]" onClick={toggleMenu}>Achievements</Link>
        <button onClick={() => setIsPublisher(!isPublisher)} className="text-xl hover:text-gray-400 py-5 w-full text-center">
          {isPublisher ? "KOL/Guild" : "Publisher"}
        </button>
      </div>

      {/* Main Content Section */}
      <main>
        {/* Hero Section */}
        <section id="home" className="relative w-full min-h-[60vh] md:h-screen">
          {/* デスクトップ用背景画像 */}
          <Image
            src="/tmp/1.png"
            alt="Qube Hero Desktop"
            layout="fill"
            objectFit="cover"
            className="absolute inset-0 w-full h-full hidden md:block"
          />
          {/* モバイル用背景画像 */}
          <Image
            src="/tmp/2.png"
            alt="Qube Hero Mobile"
            layout="fill"
            objectFit="cover"
            className="absolute inset-0 w-full min-h-[60vh] md:hidden"
            style={{ objectPosition: "bottom center" }}
          />

          {/* テキスト & ボタン */}
          <div className="absolute top-[15%] md:top-[30%] w-full md:w-auto md:left-[9%] text-center md:text-left">
            {/* モバイル用（1行表示） */}
            <h1 className="text-2xl md:hidden font-bold leading-tight">
              {isPublisher ? "BUILD FOR WEB3 GAMING" : "AMPLIFY YOUR INFLUENCE"}
            </h1>

            {/* デスクトップ用（2行表示） */}
            <h1 className="hidden md:block text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold leading-tight">
              {isPublisher ? "BUILD FOR" : "AMPLIFY YOUR"} <br /> {isPublisher ? "WEB3 GAMING" : "INFLUENCE"}
            </h1>

            <p className="mt-2 text-lg md:text-3xl">
              {isPublisher ? "Game, Gain, and Grow together" : "Expand, Connect, and Thrive"}
            </p>

            <Link
              href="/onboarding"
              className="mt-4 inline-block px-6 py-3 md:px-8 md:py-4 bg-lime-300 text-black font-bold text-base md:text-2xl rounded-md hover:bg-lime-200"
            >
              Launch App
            </Link>
          </div>
        </section>

        <section id="about">
          <div className="max-w-none mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-5 px-7 2xl:px-40">
            {/* 1つ目のボックス */}
            <div className="relative w-full">
              <Image
                src="/tmp/3.png"
                alt="Stats Card"
                width={568}
                height={308}
                className="w-full"
              />
              <p className="absolute top-2 left-4 text-md text-gray-400">
                Registered Affiliates
              </p>
              <h2 className="absolute inset-0 flex items-center justify-center text-4xl font-bold">
                3,000+
              </h2>
            </div>

            {/* 2つ目のボックス */}
            <div className="relative w-full">
              <Image
                src="/tmp/3.png"
                alt="Stats Card"
                width={568}
                height={308}
                className="w-full"
              />
              <p className="absolute top-2 left-4 text-md text-gray-400">
                Gamers Reach
              </p>
              <h2 className="absolute inset-0 flex items-center justify-center text-4xl font-bold">
                1,700,000+
              </h2>
            </div>

            {/* 3つ目のボックス */}
            <div className="relative w-full">
              <Image
                src="/tmp/3.png"
                alt="Stats Card"
                width={568}
                height={308}
                className="w-full"
              />
              <p className="absolute top-2 left-4 text-md text-gray-400">
                Onboarding Users
              </p>
              <h2 className="absolute inset-0 flex items-center justify-center text-4xl font-bold">
                700,000+
              </h2>
            </div>

            {/* 4つ目のボックス */}
            <div className="relative w-full">
              <Image
                src="/tmp/3.png"
                alt="Stats Card"
                width={568}
                height={308}
                className="w-full"
              />
              <p className="absolute top-2 left-4 text-md text-gray-400">
                TG Game & LINE Games
              </p>
              <h2 className="absolute inset-0 flex items-center justify-center text-4xl font-bold">
                TBA
              </h2>
            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="relative w-full px-7 2xl:px-40 mt-20 md:mt-60">
          {/* タイトル */}
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-10 md:mb-20">
            TRUSTED BY
          </h2>

          {/* ボーダー画像とロゴ一覧のコンテナ */}
          <div className="relative w-full flex flex-col items-center">
            {/* ボーダー画像（高さを動的に変更可能にする） */}
            <div className="relative w-full">
              <Image
                src="/tmp/4.png" // Figmaからエクスポートしたボーダー画像
                alt="Section Border"
                width={1920}
                height={300} // 高さを200 → 300 に増やす（状況に応じて変更）
                className="w-full h-[250px] md:h-[220px] lg:h-[300px] xl:h-[160px]" // md, lg で高さを動的に調整
              />

              {/* ロゴ一覧（ボーダー画像の中に収める） */}
              <div className="absolute inset-0 flex flex-wrap justify-center items-center gap-2 lg:gap-16 px-6 py-6">
                <div className="flex flex-row items-center gap-3">
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16">
                    <Image
                      src="/brand-assets/double-jump-tokyo.png"
                      alt="doublejump.tokyo"
                      fill
                      className="rounded-full object-contain"
                    />
                  </div>
                  <p className="text-xs md:text-xl">doublejump.tokyo</p>
                </div>
                <div className="flex flex-row items-center gap-3">
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16">
                    <Image
                      src="/brand-assets/gumi.png"
                      alt="gumi"
                      fill
                      className="rounded-full object-contain"
                    />
                  </div>
                  <p className="text-xs md:text-xl">gumi</p>
                </div>
                <div className="flex flex-row items-center gap-3">
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16">
                    <Image
                      src="/brand-assets/game-swift.png"
                      alt="Game Swift"
                      fill
                      className="rounded-full object-contain"
                    />
                  </div>
                  <p className="text-xs md:text-xl">Game Swift</p>
                </div>
                <div className="flex flex-row items-center gap-3">
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16">
                    <Image
                      src="/brand-assets/kaia.png"
                      alt="Kaia"
                      fill
                      className="rounded-full object-contain"
                    />
                  </div>
                  <p className="text-xs md:text-xl">Kaia</p>
                </div>
                <div className="flex flex-row items-center gap-3">
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16">
                    <Image
                      src="/chains/arbitrum.png"
                      alt="Arbitrum"
                      fill
                      className="rounded-full object-contain"
                    />
                  </div>
                  <p className="text-xs md:text-xl">Arbitrum</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="why-us" className="px-5 md:px-2 lg:px-16 xl:px-40 2xl:px-80 mt-20 md:mt-60">
          {/* タイトル */}
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

          {/* カード全体の枠 */}
          <div className="flex justify-center mt-10 md:mt-20">
            {isPublisher ? (
              <div className="w-full border border-gray-500 rounded-xl p-3 md:p-6">
                {/* タブメニュー */}
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
                        {/* デフォルトのグレーの線 */}
                        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gray-600"></span>
                        {/* アクティブなタブの緑の線（上書き） */}
                        {activeTab === tab && (
                          <span className="absolute bottom-0 left-0 w-full h-[2px] bg-lime-400"></span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* タブコンテンツ */}
                {partnersData[activeTab].length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                    {partnersData[activeTab].map((partner, index) => (
                      <div
                        key={index}
                        className="flex gap-4 items-center"
                      >
                        {/* プロフィール画像 */}
                        <Image
                          src={partner.image}
                          alt={partner.name}
                          width={96} // 画像サイズ統一
                          height={96}
                          className="rounded-lg w-20 h-20 md:w-24 md:h-24"
                        />

                        {/* テキスト情報 */}
                        <div className="flex flex-col justify-center">
                          <h3 className="text-xl font-bold">{partner.name}</h3>
                          <p className="text-md text-gray-400">{partner.country} ・ {partner.role}</p>
                          <p className="text-md text-gray-400">{partner.followers}</p>
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
                {kolGuildData.map((game, index) => (
                  <div key={index} className="w-full">
                    <Image
                      src={game.image}
                      alt={game.name}
                      width={400}
                      height={250}
                      className="rounded-xl w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="px-7 2xl:px-40 mt-20 md:mt-60">
          {/* タイトル */}
          <div className="text-center text-2xl md:text-5xl font-bold">
            <h2>
              {isPublisher ? "PAY ONLY FOR" : "MONETIZE"}
            </h2>
            <h3 className="text-lime-400 mt-3 md:mt-5">
              {isPublisher ? "MEASURABLE RESULTS" : "YOUR INFLUENCE"}
            </h3>
          </div>
          {!isPublisher &&
            <p className="text-center text-md md:text-xl text-gray-400 mt-3 md:mt-5">
              Have you built a thriving community without knowing how to generate income? We&apos;re here to support you!
            </p>
          }

          {/* カード一覧 */}
          {isPublisher && (
            <div className="mt-10 md:mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 mx-auto">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="aspect-square flex flex-col items-center justify-center border border-gray-600 rounded-lg text-center p-2 md:p-5"
                >
                  {/* アイコン */}
                  <div className="w-full h-full rounded-lg flex items-center justify-center relative">
                    <Image 
                      src={feature.icon} 
                      alt={feature.title} 
                      fill // 👈 これを追加（width, heightは不要）
                      className="object-contain" // 👈 画像のアスペクト比を維持して表示
                    />
                  </div>

                  {/* タイトル */}
                  <p className="text-lg md:text-xl font-semibold">
                    {feature.title}
                  </p>
                </div>
              ))}
            </div>
          )}

          {!isPublisher && (
            <div className="flex justify-center items-center w-full py-10">
              <div className="relative w-full max-w-[1000px] flex items-center justify-center">
                {/* デスクトップ用画像 */}
                <Image
                  src="/tmp/monetize-desktop.png"
                  alt="Central Icon Desktop"
                  width={600}
                  height={600}
                  className="hidden md:block w-full object-contain"
                />
                {/* モバイル用画像 */}
                <Image
                  src="/tmp/monetize-mobile.png"
                  alt="Central Icon Mobile"
                  width={300}
                  height={300}
                  className="md:hidden w-full object-contain"
                />
              </div>
            </div>
          )}

        </section>

        {/* Analytics & Reporting Section */}
        <section className="px-7 2xl:px-40 mt-20 md:mt-60">
          {/* タイトル */}
          <div className="text-center text-2xl md:text-5xl font-bold">
            <h2>
              {isPublisher ? "ACCESS CAMPAIGN" : "DATA-DRIVEN IMPACT"}
            </h2>
            {isPublisher && <p className="text-lime-400 mt-3 md:mt-5">ANALYTICS & REPORTING</p>}
          </div>
          {!isPublisher &&
            <p className="text-center text-md md:text-xl text-gray-400 mt-3 md:mt-5">
              Efficiently measure, analyze, and maximize your impact, engagement, reach, and conversions included.
            </p>
          }

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 md:mt-20">
            {/* 左側: 統計データ */}
            <div className="grid grid-cols-2 gap-3 md:gap-6 xl:gap-10">
              {[
                { title: "Conversions (this month)", value: "123" },
                { title: "Earning (this month)", value: "6,150 USDC" },
                { title: "Total Clicks (All time)", value: "345" },
                { title: "Next Payment Date", value: "11.01.2024" }
              ].map((item, index) => (
                <div key={index} className="relative w-full">
                  {/* 背景画像 */}
                  <Image
                    src="/tmp/3.png"
                    alt="/tmp/3.png"
                    width={568} // 適宜調整
                    height={308}
                    className="w-full"
                  />
                  
                  {/* タイトル */}
                  <p className="absolute top-2 left-4 text-xs md:text-md lg:text-lg text-gray-400">
                    {item.title}
                  </p>
                  
                  {/* 数値 */}
                  <h2 className="absolute inset-0 flex items-center justify-center text-md md:text-lg lg:text-xl xl:text-3xl font-bold">
                    {item.value}
                  </h2>
                </div>
              ))}
            </div>

            {/* 右側: グラフ（画像で表示） */}
            <div className="flex justify-center">
              <Image
                src="/tmp/graph1.png" // ここは適切なパスに変更
                alt="Analytics Graph"
                width={500} // 適宜調整
                height={300}
                className="w-full max-w-lg"
              />
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