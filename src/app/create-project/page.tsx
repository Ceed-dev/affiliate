"use client";

import { useState } from "react";

export default function Home() {
  const [step, setStep] = useState(1);
  const [formTitle, setFormTitle] = useState("Project Details");
  const [projectName, setProjectName] = useState("");
  const [slug, setSlug] = useState("my-project");
  const [description, setDescription] = useState("");
  const [rewardType, setRewardType] = useState("fixedAmount");
  const [affiliateReward, setAffiliateReward] = useState("");
  const [referralsRequired, setReferralsRequired] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [contractAddress, setContractAddress] = useState("");

  const handleSubmit = (event: any) => {
    event.preventDefault();

    if (step === 3) {
      window.open("http://localhost:3000/test-nft-collection");
    } else {
      setStep((prevStep) => {
        if (prevStep === 3) {
          return 1;
        } else {
          return prevStep + 1;
        }
      });
      setFormTitle((prevFormTitle) => {
        if (prevFormTitle === "Project Details") {
          return "Affiliates";
        } else if (prevFormTitle === "Affiliates") {
          return "You've created a project!!";
        } else {
          return "Project Details";
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">

      <div className="flex items-center space-x-2 p-5">
        <div
          className={`w-[100px] h-[40px] rounded-full ${
            step >= 1
              ? "bg-[#3B82F6] text-white"
              : "bg-[#E5E7EB] text-[#9CA3AF]"
          } flex items-center justify-center`}
        >
          <span>1</span>
        </div>
        <p>Details</p>
        <div
          className={`w-full h-1 ${
            step > 1 ? "bg-[#3B82F6]" : "bg-[#E5E7EB]"
          }`}
        />
        <div
          className={`w-[100px] h-[40px] rounded-full ${
            step >= 2
              ? "bg-[#3B82F6] text-white"
              : "bg-[#E5E7EB] text-[#9CA3AF]"
          } flex items-center justify-center`}
        >
          <span>2</span>
        </div>
        <p>Affiliates</p>
        <div
          className={`w-full h-1 ${
            step > 2 ? "bg-[#3B82F6]" : "bg-[#E5E7EB]"
          }`}
        />
        <div
          className={`w-[100px] h-[40px] rounded-full ${
            step >= 3
              ? "bg-[#3B82F6] text-white"
              : "bg-[#E5E7EB] text-[#9CA3AF]"
          } flex items-center justify-center`}
        >
          <span>3</span>
        </div>
        <p>Complete</p>
      </div>

      <div className="border-t border-gray-300 my-4"></div>

      <div className="w-full max-w-4xl m-auto bg-white p-8 rounded-lg shadow">

        <h1 className="text-xl font-semibold mb-5">{formTitle}</h1>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div>
              <div className="mb-4">
                <label
                  htmlFor="project-name"
                  className="block mb-2 text-sm font-roboto text-[#121212]"
                >
                  Project name
                </label>
                <input
                  type="text"
                  id="project-name"
                  name="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full p-2 border border-[#D1D5DB] rounded-lg text-sm font-roboto"
                />
              </div>
              <div className="mb-4 relative rounded-lg border border-[#D1D5DB] p-2 flex items-center">
                <span className="text-sm font-roboto text-[#6B7280] mr-1">
                  https://0xqube.xyz/
                </span>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm font-roboto"
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="description"
                  className="block mb-2 text-sm font-roboto text-[#121212]"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border border-[#D1D5DB] rounded-lg text-sm font-roboto h-24 resize-none"
                  placeholder="BAYC is a collection of 10,000 Bored Ape NFTs — unique digital collectibles living on the Ethereum blockchain."
                ></textarea>
                <div className="mt-1 text-xs font-roboto text-[#6B7280]">
                  Displayed to affiliates and users. Supports markdown
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="mb-4">
                <p className="mb-2 text-sm font-roboto text-[#121212]">
                  How do you want to reward affiliates?
                </p>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="rewardType"
                      value="fixedAmount"
                      checked={rewardType === "fixedAmount"}
                      onChange={() => setRewardType("fixedAmount")}
                      className="text-[#2563EB]"
                    />
                    <span className="ml-2 text-sm font-roboto text-[#121212]">
                      Fixed Amount
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="rewardType"
                      value="revenueShare"
                      checked={rewardType === "revenueShare"}
                      onChange={() => setRewardType("revenueShare")}
                      className="text-[#2563EB]"
                    />
                    <span className="ml-2 text-sm font-roboto text-[#121212]">
                      Revenue Share
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="rewardType"
                      value="tiered"
                      checked={rewardType === "tiered"}
                      onChange={() => setRewardType("tiered")}
                      className="text-[#2563EB]"
                    />
                    <span className="ml-2 text-sm font-roboto text-[#121212]">
                      Tiered
                    </span>
                  </label>
                </div>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="affiliate-reward"
                  className="block mb-2 text-sm font-roboto text-[#121212]"
                >
                  Affiliate reward
                </label>
                <input
                  type="text"
                  id="affiliate-reward"
                  name="affiliateReward"
                  value={affiliateReward}
                  onChange={(e) => setAffiliateReward(e.target.value)}
                  className="w-full p-2 border border-[#D1D5DB] rounded-lg text-sm font-roboto"
                  placeholder="0"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="referrals-required"
                  className="block mb-2 text-sm font-roboto text-[#121212]"
                >
                  Referrals required to unlock
                </label>
                <input
                  type="text"
                  id="referrals-required"
                  name="referralsRequired"
                  value={referralsRequired}
                  onChange={(e) => setReferralsRequired(e.target.value)}
                  className="w-full p-2 border border-[#D1D5DB] rounded-lg text-sm font-roboto"
                />
              </div>
              <div className="mb-6">
                <div className="mb-4">
                  <label
                    htmlFor="contract-address"
                    className="block mb-2 text-sm font-roboto text-[#121212]"
                  >
                    Contract Address
                  </label>
                  <input
                    type="text"
                    id="contract-address"
                    name="contractAddress"
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                    className="w-full p-2 border border-[#D1D5DB] rounded-lg text-sm font-roboto"
                    placeholder="0xkw02jnf..."
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="purchase-price"
                    className="block mb-2 text-sm font-roboto text-[#121212]"
                  >
                    Purchase Price
                  </label>
                  <input
                    type="text"
                    id="purchase-price"
                    name="purchasePrice"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="w-full p-2 border border-[#D1D5DB] rounded-lg text-sm font-roboto"
                    placeholder="≋"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-[#2563EB] text-white rounded-lg px-6 py-2 font-roboto text-sm"
            >
              {step === 3 ? "Go To Affiliate Page" : "Next"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}