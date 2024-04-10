"use client";

import { useState } from "react";

import { useAddress } from "@thirdweb-dev/react";

import { 
  StatusBar,
  ProjectDetailsForm,
  AffiliatesForm,
  LogoForm,
  SocialLinksForm
} from "../../components/createProject";

import { saveProjectToFirestore } from "../../utils/firebase";

import { ProjectData, ImageType } from "../../types";

export default function CreateProject() {
  const address = useAddress();

  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => {
    setCurrentStep(currentStep < 4 ? currentStep + 1 : 4);

    // Debug
    console.log("projectData:", JSON.stringify(projectData, null, 2));
  };

  const [projectData, setProjectData] = useState<ProjectData>({
    projectName: "",
    slug: "my-project",
    description: "",
    selectedToken: "USDC",
    rewardAmount: 0,
    redirectUrl: "",
    logo: null,
    cover: null,
    websiteUrl: "",
    discordUrl: "",
    twitterUrl: "",
    instagramUrl: "",
    ownerAddress: "",
    affiliateAddress: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const [previewData, setPreviewData] = useState({
    logoPreview: "",
    coverPreview: ""
  });

  const handleChange = (field: string, isNumeric?: boolean) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = isNumeric ? parseInt(event.target.value, 10) || 0 : event.target.value;
    setProjectData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (type: ImageType) => (event: React.ChangeEvent<HTMLInputElement>) => {
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
  
  const removeImage = (type: ImageType) => () => {
    setPreviewData(prev => ({ ...prev, [`${type}Preview`]: "" }));
    setProjectData(prev => ({ ...prev, [type]: "" }));
  };

  const renderForm = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProjectDetailsForm
            data={{
              projectName: projectData.projectName,
              slug: projectData.slug,
              description: projectData.description
            }}
            handleChange={handleChange}
            nextStep={nextStep}
          />
        );
      case 2:
        return (
          <AffiliatesForm 
            data={{
              selectedToken: projectData.selectedToken,
              rewardAmount: projectData.rewardAmount,
              redirectUrl: projectData.redirectUrl
            }}
            handleChange={handleChange}
            nextStep={nextStep}
          />
        );
      case 3:
        return (
          <LogoForm
            data={{
              logoPreview: previewData.logoPreview,
              coverPreview: previewData.coverPreview
            }}
            handleImageChange={handleImageChange}
            removeImage={(type) => removeImage(type)}
            nextStep={nextStep}
          />
        );
      case 4:
        return (
          <SocialLinksForm
            data={{
              websiteUrl: projectData.websiteUrl,
              discordUrl: projectData.discordUrl,
              twitterUrl: projectData.twitterUrl,
              instagramUrl: projectData.instagramUrl
            }}
            handleChange={handleChange}
            nextStep={() => saveProjectToFirestore(projectData, address as string)}
          />
        );
      default:
        return <div>No step selected</div>;
    }
  };

  return (
    <div className="flex flex-col">
      <StatusBar currentStep={currentStep} />
      {renderForm()}
    </div>
  );
}