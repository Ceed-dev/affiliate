"use client";

import { useState } from "react";

import { StatusBarComponent } from "../../components/statusbar/StatusBarComponent";
import { 
  ProjectDetailsForm,
  AffiliatesForm,
  LogoForm
} from "../../components/createProject";

export default function CreateProject() {
  const [projectData, setProjectData] = useState({
    projectName: "",
    slug: "my-project",
    description: "",
    selectedToken: "",
    rewardAmount: "",
    redirectUrl: "",
    logo: "",
    cover: "",
    websiteUrl: "",
    discordUrl: "",
    twitterUrl: "",
    instagramUrl: ""
  });

  const [previewData, setPreviewData] = useState({
    logoPreview: "",
    coverPreview: ""
  });

  const handleImageChange = (type: "logo" | "cover") => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewData(prev => ({ ...prev, [`${type}Preview`]: reader.result as string }));
        setProjectData(prev => ({ ...prev, [type]: file }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeImage = (type: "logo" | "cover") => () => {
    setPreviewData(prev => ({ ...prev, [`${type}Preview`]: "" }));
    setProjectData(prev => ({ ...prev, [type]: "" }));
  };

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProjectData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    console.log("projectData: ", projectData);
  };

  const [currentStep, setCurrentStep] = useState(3);

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

      {currentStep === 2 &&
        <AffiliatesForm 
          data={{
            selectedToken: projectData.selectedToken,
            rewardAmount: projectData.rewardAmount,
            redirectUrl: projectData.redirectUrl
          }}
          handleChange={handleChange}
        />
      }

      {currentStep === 3 &&
        <LogoForm
          data={{
            logoPreview: previewData.logoPreview,
            coverPreview: previewData.coverPreview
          }}
          handleImageChange={handleImageChange}
          removeImage={(type) => removeImage(type)}
        />
      }

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