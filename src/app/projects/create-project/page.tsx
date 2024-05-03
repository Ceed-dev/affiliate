"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const address = useAddress();
  const [isLoading, setIsLoading] = useState(false);
  const [hideCompleteButton, setHideCompleteButton] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => {
    setCurrentStep(currentStep < 5 ? currentStep + 1 : 5);

    // Debug
    console.log("projectData:", JSON.stringify(projectData, null, 2));
  };

  const [projectData, setProjectData] = useState<ProjectData>({
    projectName: "",
    description: "",
    selectedTokenAddress: "",
    rewardAmount: 0,
    redirectUrl: "",
    logo: null,
    cover: null,
    websiteUrl: "",
    discordUrl: "",
    xUrl: "",
    instagramUrl: "",
    ownerAddress: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    totalPaidOut: 0,
    lastPaymentDate: null,
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
              selectedTokenAddress: projectData.selectedTokenAddress,
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
      case 5:
        return (
          <SocialLinksForm
            data={{
              websiteUrl: projectData.websiteUrl,
              discordUrl: projectData.discordUrl,
              xUrl: projectData.xUrl,
              instagramUrl: projectData.instagramUrl
            }}
            handleChange={handleChange}
            nextStep={() => saveProjectToFirestore(
              projectData, 
              address as string, 
              setIsLoading,
              setHideCompleteButton,
              nextStep,
              router
            )}
            isLoading={isLoading}
            hideCompleteButton={hideCompleteButton}
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