"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { DateValueType } from "react-tailwindcss-datepicker";
import { 
  getSteps,
  StatusBar,
  ProjectTypeSelectionForm,
  ProjectDetailsForm,
  AffiliatesForm,
  LogoForm,
  EmbedImageForm,
  SocialLinksForm
} from "../../components/createProject";
import { saveProjectToFirestore, saveApiKeyToFirestore, deleteProject } from "../../utils/firebase";
import { approveToken, depositToken } from "../../utils/contracts";
import { 
  ProjectType, DirectPaymentProjectData, EscrowPaymentProjectData, 
  ProjectData, ImageType, PreviewData, WhitelistedAddress, ConversionPoint,
} from "../../types";
import { useChainContext } from "../../context/chainContext";

export default function CreateProject() {
  const router = useRouter();
  const { selectedChain } = useChainContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [initialStatus, setInitialStatus] = useState<string>("");
  const [saveAndDepositStatus, setSaveAndDepositStatus] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [hideSaveAndDepositButton, setHideSaveAndDepositButton] = useState(false);
  const [projectType, setProjectType] = useState<ProjectType | null>(null);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData>({
    logoPreview: "",
    coverPreview: "",
    embedPreviews: [],
  });
  const [isReferralEnabled, setIsReferralEnabled] = useState<boolean>(false);
  const [conversionPoints, setConversionPoints] = useState<ConversionPoint[]>([]);

  const handleUpdateConversionPoints = (action: "add" | "remove", point?: ConversionPoint) => {
    setConversionPoints(prevPoints => {
      if (action === "add" && point) {
        return [...prevPoints, point];
      } else if (action === "remove" && point?.id) {
        return prevPoints.filter(p => p.id !== point.id);
      }
      return prevPoints;
    });
  };

  const nextStep = () => setCurrentStep(currentStep + 1);
  const previousStep = () => setCurrentStep(currentStep - 1);

  const handleProjectTypeChange = (type: ProjectType) => {
    setProjectType(type);

    // const status = type === "DirectPayment" ? "Save" : "Save & Deposit";
    const status = "Save";
    setInitialStatus(status);
    setSaveAndDepositStatus(status);

    const commonData = {
      projectName: "",
      description: "",
      selectedChainId: selectedChain.chainId,
      selectedTokenAddress: "",
      logo: null,
      cover: null,
      websiteUrl: "",
      xUrl: "",
      discordUrl: "",
      ownerAddresses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (type === "DirectPayment") {
      setProjectData({
        ...commonData,
        projectType: "DirectPayment",
        whitelistedAddresses: {},
        slots: {
          total: 0,
          remaining: 0,
        },
        budget: {
          total: 0,
          remaining: 0,
        },
        deadline: null,
      } as DirectPaymentProjectData);
    } else if (type === "EscrowPayment") {
      setProjectData({
        ...commonData,
        projectType: "EscrowPayment",
        redirectUrl: "",
        totalPaidOut: 0,
        lastPaymentDate: null,
        embeds: [],
        isReferralEnabled: false,
        conversionPoints: [],
      } as EscrowPaymentProjectData);
    }
  };

  // handleChange is a higher-order function that creates an event handler for form elements.
  // It takes a `field` string that can include dot notation for nested objects (e.g., "slots.remaining").
  // `isNumeric` is an optional parameter that when set to true, will parse the input value as a number.
  const handleChange = (field: string, isNumeric?: boolean, isFloat?: boolean) => 
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      let value: any;

      // Split the `field` string into keys for accessing nested properties.
      const keys = field.split(".");
    
      // Parse the event value based on the `isNumeric` and `isFloat` flags.
      if (isNumeric) {
        value = isFloat ? parseFloat(event.target.value) : parseInt(event.target.value, 10);
        if (isFloat && !isNaN(value)) {
          value = Math.round(value * 10) / 10; // Limited to one decimal place
        }
        if (isNaN(value)) value = 0;  // Default to 0 if parsing fails.

        // Add validation for FixedAmount and RevenueShare
        if (keys.includes("rewardAmount")) {
          if (value < 1 || value > 10000) {
            toast.error("Value must be between 1 and 10000.");
            return;
          }
        } else if (keys.includes("percentage")) {
          if (value < 0.1 || value > 100) {
            toast.error("Percentage must be between 0.1 and 100.");
            return;
          }
        }
      } else {
        value = event.target.value;
      }
      
      // Set the new state of project data.
      setProjectData(prev => {
        if (!prev) return prev;

        // Create a shallow copy of the previous state to maintain immutability.
        let updated = { ...prev } as any;

        // Traverse the keys to access the correct nested property.
        // `item` is used to reference the current level of the state object.
        let item = updated;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!item[keys[i]]) {
            item[keys[i]] = {};  // Ensure the nested object exists.
          }
          item = item[keys[i]];  // Navigate deeper into the nested object.
        }

        // Set the new value at the final key. This updates the nested property.
        item[keys[keys.length - 1]] = value;

        // Return the updated state to update the state in React.
        return updated;
      });
    };

  const handleOwnerChange = async (newOwnerAddresses: string[]) => {
    setProjectData(prevData => {
      if (!prevData) return prevData;
  
      return {
        ...prevData,
        ownerAddresses: newOwnerAddresses
      };
    });
  };

  const handleDateChange = (newValue: DateValueType) => {
    setProjectData(prev => {
      if (!prev) return prev;

      let deadline = null;
      if (newValue?.startDate) {
        const date = new Date(newValue.startDate);
        date.setHours(23, 59, 59, 999);
        deadline = date;
      }
      return {
        ...prev,
        deadline,
      };
    });
  };

  const handleWhitelistChange = (newWhitelistedAddresses: { [address: string]: WhitelistedAddress }) => {
    setProjectData(prevData => {
      if (!prevData) return prevData;
  
      return {
        ...prevData,
        whitelistedAddresses: newWhitelistedAddresses
      };
    });
  };

  const handleImageChange = (type: ImageType, index?: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewData(prev => {
          if (type === "embeds") {
            const newPreviews = [...prev.embedPreviews];
            if (index !== undefined) {
              newPreviews[index] = reader.result as string;
            } else {
              newPreviews.push(reader.result as string);
            }
            return { ...prev, embedPreviews: newPreviews };
          } else {
            return { ...prev, [`${type}Preview`]: reader.result as string };
          }
        });
        setProjectData(prev => {
          if (!prev) return prev;
  
          if (type === "embeds" && prev.projectType === "EscrowPayment") {
            const newEmbeds = [...(prev.embeds || [])];
            if (index !== undefined) {
              newEmbeds[index] = file;
            } else {
              newEmbeds.push(file);
            }
            return {
              ...prev,
              embeds: newEmbeds
            };
          } else {
            return {
              ...prev,
              [type]: file
            };
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };  
  
  const removeImage = (type: ImageType, index?: number) => () => {
    setPreviewData(prev => {
      if (type === "embeds") {
        const newPreviews = prev.embedPreviews.filter((_, i) => i !== index);
        return { ...prev, embedPreviews: newPreviews };
      } else {
        return { ...prev, [`${type}Preview`]: "" };
      }
    });
    setProjectData(prev => {
      if (!prev) return prev;
  
      if (type === "embeds" && prev.projectType === "EscrowPayment") {
        const newEmbeds = (prev.embeds || []).filter((_, i) => i !== index);
        return {
          ...prev,
          embeds: newEmbeds
        };
      } else {
        return {
          ...prev,
          [type]: null
        };
      }
    });
  };

  const saveProjectAndDepositToken = async () => {
    if (!projectData) {
      toast.error("Project data is not available. Please try again.");
      return;
    }

    setIsSaving(true);

    let updatedProjectData: ProjectData = {
      ...projectData,
      selectedChainId: selectedChain.chainId,
    };

    // Set remaining values to be equal to total values
    if (projectType === "DirectPayment") {
      const directPaymentData = projectData as DirectPaymentProjectData;
      updatedProjectData = {
        ...directPaymentData,
        slots: {
          ...directPaymentData.slots,
          remaining: directPaymentData.slots.total
        },
        budget: {
          ...directPaymentData.budget,
          remaining: directPaymentData.budget.total
        }
      };
    }

    // Include conversionPoints and other relevant data before saving to Firestore
    if (projectType === "EscrowPayment") {
      const escrowPaymentData = projectData as EscrowPaymentProjectData;

      // Ensure the first conversion point is active
      const updatedConversionPoints = conversionPoints.map((point, index) => ({
        ...point,
        isActive: index === 0 ? true : point.isActive,
      }));

      updatedProjectData = {
        ...escrowPaymentData,
        isReferralEnabled: isReferralEnabled,
        conversionPoints: updatedConversionPoints, // Add conversionPoints to the project data
      };
    }

    setSaveAndDepositStatus("Saving project to Firestore...");
    const result = await saveProjectToFirestore(updatedProjectData);
    if (!result) {
      toast.error("Failed to save project. Please try again.");
      setSaveAndDepositStatus(initialStatus);
      setIsSaving(false);
      return;
    }
    const { projectId } = result;

    if (projectType === "EscrowPayment") {
      setSaveAndDepositStatus("Generating API key...");
      const apiKey = await saveApiKeyToFirestore(projectId);
      if (!apiKey) {
        toast.error("Failed to generate API key. Please try again.");
        setSaveAndDepositStatus(initialStatus);
        setIsSaving(false);
        await deleteProject(projectId);
        return;
      }
    }

    // Remove the deposit token logic as it's no longer needed
    /*
    if (projectType === "EscrowPayment") {
      const depositAmount = 10; //TODO: Fix later
  
      setSaveAndDepositStatus("Approving tokens...");
      const approveSuccess = await approveToken(projectData.selectedTokenAddress, depositAmount);
      if (!approveSuccess) {
        toast.error("Failed to approve token. Please try again.");
        setSaveAndDepositStatus(initialStatus);
        setIsSaving(false);
        await deleteProject(projectId);
        return;
      }
  
      setSaveAndDepositStatus("Depositing tokens...");
      const depositSuccess = await depositToken(projectId, projectData.selectedTokenAddress, depositAmount);
      if (!depositSuccess) {
        toast.error("Failed to deposit token. Please try again.");
        setSaveAndDepositStatus(initialStatus);
        setIsSaving(false);
        await deleteProject(projectId);
        return;
      }
    }
    */

    setHideSaveAndDepositButton(true);
    nextStep();
    setIsSaving(false);

    const redirectUrl = projectType === "DirectPayment" 
      ? `/projects/${projectId}/settings`
      : `/projects/${projectId}`;

    toast.success("Project saved successfully! Redirecting to the dashboard...", {
      onClose: () => router.push(redirectUrl)
    });
  };

  const renderForm = () => {
    const steps = getSteps(projectType);

    switch (steps[Math.min(currentStep - 1, steps.length - 1)]) {
      case "Type":
        return (
          <ProjectTypeSelectionForm
            handleProjectTypeChange={handleProjectTypeChange}
            nextStep={nextStep}
          />
        );
      case "Details":
        return (
          <ProjectDetailsForm
            data={{
              projectType: projectType!,
              projectName: projectData?.projectName ?? "",
              description: projectData?.description ?? "",
              ownerAddresses: projectData?.ownerAddresses ?? [],
              ...(projectType === "DirectPayment" && {
                totalSlots: (projectData as DirectPaymentProjectData).slots.total,
                totalBudget: (projectData as DirectPaymentProjectData).budget.total,
                deadline: (projectData as DirectPaymentProjectData).deadline,
              }),
            }}
            handleChange={handleChange}
            handleOwnerChange={handleOwnerChange}
            handleDateChange={projectType === "DirectPayment" ? handleDateChange : undefined}
            nextStep={nextStep}
            previousStep={previousStep}
          />
        );
      case "Socials":
        return (
          <SocialLinksForm
            data={{
              websiteUrl: projectData?.websiteUrl ?? "",
              xUrl: projectData?.xUrl ?? "",
              discordUrl: projectData?.discordUrl ?? "",
            }}
            handleChange={handleChange}
            nextStep={nextStep}
            previousStep={previousStep}
          />
        );
      case "Logo":
        return (
          <LogoForm
            data={{
              logoPreview: previewData.logoPreview,
              coverPreview: previewData.coverPreview,
            }}
            handleImageChange={handleImageChange}
            removeImage={(type) => removeImage(type)}
            nextStep={nextStep}
            previousStep={previousStep}
          />
        );
      case "Media":
        return (
          <EmbedImageForm
            data={{
              embedPreviews: previewData.embedPreviews,
            }}
            handleImageChange={handleImageChange}
            removeImage={removeImage}
            nextStep={nextStep}
            previousStep={previousStep}
          />
        );
      case "Affiliates":
        return (
          <AffiliatesForm
            data={{
              projectType: projectType!,
              selectedTokenAddress: projectData?.selectedTokenAddress ?? "",
              whitelistedAddresses: projectType === "DirectPayment" ? (projectData as DirectPaymentProjectData)?.whitelistedAddresses ?? {} : undefined,
              redirectUrl: projectType === "EscrowPayment" ? (projectData as EscrowPaymentProjectData)?.redirectUrl ?? "" : undefined,
              isReferralEnabled: projectType === "EscrowPayment" ? isReferralEnabled : undefined,
              conversionPoints: projectType === "EscrowPayment" ? conversionPoints : undefined,
            }}
            handleChange={handleChange}
            handleUpdateConversionPoints={projectType === "EscrowPayment" ? handleUpdateConversionPoints : undefined}
            handleWhitelistChange={projectType === "DirectPayment" ? handleWhitelistChange : undefined}
            setIsReferralEnabled={projectType === "EscrowPayment" ? setIsReferralEnabled : undefined}
            nextStep={saveProjectAndDepositToken}
            previousStep={previousStep}
            isSaving={isSaving}
            hideButton={hideSaveAndDepositButton}
            status={saveAndDepositStatus}
          />
        );
      default:
        return <div>No step selected</div>;
    }
  };

  return (
    <div className="flex flex-col">
      <StatusBar currentStep={currentStep} projectType={projectType} />
      <div className="w-11/12 md:w-8/12 mx-auto">
        {renderForm()}
      </div>
    </div>
  );
}