"use client";

import { useState } from "react";
import Image from "next/image";

import { StatusBarComponent } from "../../components/statusbar/StatusBarComponent";
import { ProjectDetailsForm } from "../../components/createProject/ProjectDetailsForm";

export default function CreateProject() {
  const [projectData, setProjectData] = useState({
    currentStep: 1,
    projectName: "",
    slug: "my-project",
    description: "",
    selectedToken: "",
    rewardAmount: "",
    redirectUrl: "",
    logo: "",
    logoPreview: "",
    coverImage: "",
    coverPreview: "",
    websiteUrl: "",
    discordUrl: "",
    twitterUrl: "",
    instagramUrl: ""
  });
  const tokenOptions = ["USDC", "USDT", "MATIC"];

  const nextStep = () => {
    setProjectData(prev => ({
      ...prev,
      currentStep: prev.currentStep === 4 ? 4 : prev.currentStep + 1
    }));
  };

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProjectData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    console.log("projectData: ", projectData);
  };

  const [currentStep, setCurrentStep] = useState(1);

  const [step, setStep] = useState(1);
  const [formTitle, setFormTitle] = useState("Project Details");
  const [projectName, setProjectName] = useState("");
  const [slug, setSlug] = useState("my-project");
  const [description, setDescription] = useState("");

  const [selectedToken, setSelectedToken] = useState("");
  const [rewardAmount, setRewardAmount] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");

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

  const handleDeposit = () => {
    console.log("Deposit action initiated");
  };

  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");

  const handleLogoChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const removeLogoImage = () => {
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogo(null);
    setLogoPreview("");
  }

  const handleCoverChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const removeCoverImage = () => {
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
    }
    setCoverImage(null);
    setCoverPreview("");
  }

  const [websiteUrl, setWebsiteUrl] = useState("");
  const [discordUrl, setDiscordUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");

  return (
    <div className="flex flex-col">

      <StatusBarComponent currentStep={currentStep} />

      {currentStep === 1 &&
        <ProjectDetailsForm
          data={{
            projectName: projectData.projectName,
            slug: projectData.slug,
            description: projectData.description
          }}
          handleChange={handleChange}
        />
      }

      {currentStep === 2 && <div className="bg-white w-2/5 rounded-lg shadow-md p-5 mx-auto mt-10 text-sm">

        <h1 className="text-xl mb-5">Affiliates</h1>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h2>Token</h2>
            <select
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              className="w-full p-2 border border-[#D1D5DB] rounded-lg outline-none"
            >
              {tokenOptions.map((token, index) => (
                <option key={index} value={token}>
                  {token}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <h2>Reward Amount</h2>
            <div className="rounded-lg border border-[#D1D5DB] flex items-center">
              <span className="w-[150px] text-[#6B7280] bg-gray-100 p-2 mr-1">
                Token Units:
              </span>
              <input
                type="number"
                value={rewardAmount}
                onChange={(e) => setRewardAmount(e.target.value)}
                className="w-full outline-none"
                min="1"
                step="1"
                placeholder="Enter token units"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h2>Redirect URL</h2>
            <div className="rounded-lg border border-[#D1D5DB] flex items-center">
              <span className="w-[150px] text-[#6B7280] bg-gray-100 p-2 mr-1">
                URL:
              </span>
              <input
                type="url"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                className="w-full outline-none"
                placeholder="Enter the redirect URL"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h2>Initial Deposit</h2>
            <button
              onClick={handleDeposit}
              className="w-2/3 mx-auto h-12 bg-sky-500 text-white rounded-lg p-2 outline-none transition duration-300 ease-in-out transform hover:scale-105"
              type="button"
            >
              Deposit to Escrow
            </button>
          </div>
        </div>

      </div>}

      {currentStep === 3 && <div className="bg-white w-2/5 rounded-lg shadow-md p-5 mx-auto mt-10 text-sm">

        <h1 className="text-xl mb-5">Logo & Cover Image</h1>

        <p className="text-gray-400 mb-5">Upload a logo and cover image for your project. It displays with a height of 192px and full screen width.</p>

        <div className="relative mb-[75px]">
          <div className="h-[192px] w-full">
            <label htmlFor="cover-upload" className="cursor-pointer block h-full">
              {coverPreview ? (
                <>
                  <Image src={coverPreview} alt="Cover Preview" layout="fill" objectFit="cover" className="rounded-lg" />
                  <button 
                    type="button"
                    onClick={removeCoverImage}
                    className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center opacity-0 hover:opacity-100 rounded-lg transition-opacity"
                  >
                    <Image src="/trash.png" alt="trash.png" height={50} width={50} />
                  </button>
                </>
              ) : (
                <p className="bg-blue-50 hover:bg-gray-500 hover:text-white h-full flex justify-center items-center text-xl rounded-lg">
                  Upload Cover
                </p>
              )}
            </label>
            <input
              id="cover-upload"
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="hidden"
            />
          </div>
          <div className="absolute left-10 -bottom-[75px]">
            <label htmlFor="logo-upload" className="cursor-pointer">
              {logoPreview ? (
                <>
                  <Image src={logoPreview} alt="Logo Preview" width={150} height={150} className="object-cover rounded-full border-4 border-white" />
                  <button 
                    type="button"
                    onClick={removeLogoImage}
                    className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center opacity-0 hover:opacity-100 rounded-full transition-opacity"
                  >
                    <Image src="/trash.png" alt="trash.png" height={50} width={50} />
                  </button>
                </>
              ) : (
                <p className="bg-blue-50 hover:bg-gray-500 hover:text-white h-[150px] w-[150px] flex justify-center items-center text-md rounded-full border-4 border-white">
                  Upload Image
                </p>
              )}
            </label>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
          </div>
        </div>
      </div>}

      {currentStep === 4 && <div className="bg-white w-2/5 rounded-lg shadow-md p-5 mx-auto mt-10 text-sm">

        <h1 className="text-xl mb-5">Socials</h1>

        <div className="flex flex-col gap-5">

          <div className="flex flex-col gap-2">
            <h2>Website</h2>
            <input
              type="url"
              placeholder="https://mysite.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full p-2 border border-[#D1D5DB] rounded-lg text-sm outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <h2>Discord</h2>
            <input
              type="url"
              placeholder="https://discord.gg/my-group"
              value={discordUrl}
              onChange={(e) => setDiscordUrl(e.target.value)}
              className="w-full p-2 border border-[#D1D5DB] rounded-lg text-sm outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <h2>Twitter</h2>
            <input
              type="url"
              placeholder="https://twitter.com/my-twitter"
              value={twitterUrl}
              onChange={(e) => setTwitterUrl(e.target.value)}
              className="w-full p-2 border border-[#D1D5DB] rounded-lg text-sm outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <h2>Instagram</h2>
            <input
              type="url"
              placeholder="https://instagram.com/my-insta"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              className="w-full p-2 border border-[#D1D5DB] rounded-lg text-sm outline-none"
            />
          </div>

        </div>

      </div>}

    </div>
  );
}