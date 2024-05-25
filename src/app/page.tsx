"use client";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { navLinks, features, stats, logos, faqs, socialMediaLinks, footerLinks } from "./constants/homepageData";

export default function Home() {
  const [faqActiveIndex, setFaqActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    if (faqActiveIndex === index) {
      setFaqActiveIndex(null);
    } else {
      setFaqActiveIndex(index);
    }
  };

  return (
    <div className="flex flex-col">
      <Head>
        <title>Simple Landing Page</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="fixed w-full bg-slate-100 py-2">
        <div className="w-full lg:w-2/3 px-5 lg:px-0 flex flex-row justify-between items-center mx-auto">
          <Link href="#" className="flex flex-row items-center gap-3 transition duration-300 ease-in-out transform hover:-translate-y-1">
            <Image src="/qube.png" alt="qube.png" width={50} height={50} />
            <p className="text-lg font-semibold">Qube</p>
          </Link>
          
          <div className="flex flex-row gap-10">
            {navLinks.map((link, index) => (
              <Link key={index} href={link.id} className="hover:text-gray-500">{link.label}</Link>
            ))}
          </div>
        </div>
      </header>

      <main className="flex flex-col bg-white">

        {/* Overview */}
        <section className="bg-purple-600 text-white px-20">
          <div className="h-[600px] md:h-screen flex flex-col gap-10 justify-center items-start w-full xl:w-1/2">
            <h1 className="text-3xl md:text-5xl font-bold">Drive Acquisition, Amplify Revenue</h1>
            <h2 className="text-xl md:text-3xl font-semibold">The Premier Web3  Affiliate Network for Gaming in Asia</h2>
            <p className="text-md md:text-xl">
              Our trusted affiliate network connects you with a vast pool of gaming influencers and guilds across Asia, enabling you to reach and convert your target audience at scale, transparent tracking and automatic distribution of tokenized rewards to drive higher engagement and conversions.
            </p>
          </div>
        </section>

        {/* 3 features */}
        <section id="features" className="p-20">
          <h1 className="text-xl md:text-3xl font-bold mb-10">Streamline Your Web3 Affiliate & Refferal Marketing Strategy</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col gap-5 items-center">
                <h2 className="text-lg md:text-2xl font-semibold">{feature.title}</h2>
                <p className="text-md md:text-lg">{feature.description}</p>
              </div> 
            ))}
          </div>
        </section>

        {/* Users' Voices */}
        <section id="voices" className="bg-purple-600 text-white p-20">
          <p className="text-md text-center mb-20">We&apos;re in a good company</p>
          <div className="flex flex-row flex-wrap gap-10 justify-center">
            {logos.map((logo, index) => (
              <Image key={index} src={logo} alt={logo} width={120} height={120} />
            ))}
          </div>
        </section>

        {/* Number of affiliators */}
        <section id="partners" className="p-20">
          <h1 className="text-xl md:text-3xl font-bold mb-10">Number of affiliators</h1>
          <div className="flex flex-col gap-10 items-center">
            <h2 className="text-lg md:text-2xl font-semibold">A powerful network to support your project</h2>
            <p className="text-md md:text-xl">We&apos;re growing an amazing network of affiliates to promote the next generation of web3 gaming.</p>
            <div className="flex flex-col lg:flex-row shadow-lg rounded-lg bg-slate-50">
              {stats.map((stat, index) => (
                <>
                  {index !== 0 && (
                    <div className="border-l border-2 border-gray-200 min-h-full" />
                  )}
                  <div className="flex flex-col gap-3 py-5 md:py-10 px-10 md:px-20 items-center">
                    <h3 className="text-4xl font-bold">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-sky-500">
                        {stat.value}
                      </span>
                    </h3>
                    <p className="text-md font-semibold text-slate-500">{stat.label}</p>
                  </div>
                </>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="bg-purple-600 text-white p-20 mb-10">
          <h1 className="text-xl md:text-3xl font-bold mb-10">FAQ</h1>
          {faqs.map((faq, index) => (
            <div key={index} className="mb-5">
              <div
                className="cursor-pointer text-md lg:text-lg xl:text-xl flex flex-row justify-between font-semibold"
                onClick={() => toggleFAQ(index)}
              >
                {faq.question}
                <Image src={faqActiveIndex === index ? "/up-arrow.png" : "/down-arrow.png"} alt="arrow" width={30} height={30} />
              </div>
              {faqActiveIndex === index && (
                <p className="text-md mr-8 mb-3">{faq.answer}</p>
              )}
            </div>
          ))}
        </section>

      </main>

      <footer className="bg-purple-600 grid grid-cols-1 lg:grid-cols-4 gap-5 p-20">
        <div className="lg:col-span-2 flex flex-col items-center gap-3">
          <Link href="#" className="flex flex-row items-center gap-3 transition duration-300 ease-in-out transform hover:-translate-y-1">
            <Image src="/qube.png" alt="qube.png" width={100} height={100} />
            <p className="text-2xl font-bold">Qube</p>
          </Link>
          <div className="flex flex-row gap-5">
            {socialMediaLinks.map((link, index) => (
              <Link key={index} href={link.url} target="_blank" className="bg-white hover:bg-slate-200 p-3 rounded-full inline-flex justify-center items-center h-14 w-14 hover:shadow-xl">
                <Image src={link.src} alt={link.alt} width={30} height={30} />
              </Link>
            ))}
          </div>
        </div>
        {Object.entries(footerLinks).map(([category, links]) => (
          <div key={category} className="flex flex-col items-center lg:items-start gap-5 text-slate-300">
            <h3 className="font-bold text-white text-xl">{category}</h3>
            {links.map(link => (
              <Link key={link.label} href={link.url} target="_blank" className="hover:text-slate-100 hover:font-semibold">
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </footer>
    </div>
  );
}