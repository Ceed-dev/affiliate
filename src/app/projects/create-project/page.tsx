"use client";

import { useState } from "react";

import { 
  StatusBar,
  ProjectDetailsForm,
  AffiliatesForm,
  LogoForm,
  SocialLinksForm
} from "../../components/createProject";

export default function CreateProject() {
  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => {
    setCurrentStep(currentStep < 4 ? currentStep + 1 : 4);

    // Debug
    console.log("projectData:", JSON.stringify(projectData, null, 2));
  };

  const [projectData, setProjectData] = useState({
    projectName: "",
    slug: "my-project",
    description: "",
    selectedToken: "USDC",
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

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProjectData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

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
            nextStep={nextStep}
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