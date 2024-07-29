"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { DateValueType } from "react-tailwindcss-datepicker";
import { 
  StatusBar,
  ProjectTypeSelectionForm,
  ProjectDetailsForm,
  AffiliatesForm,
  LogoForm,
  SocialLinksForm
} from "../../components/createProject";
import { saveProjectToFirestore, deleteProjectFromFirestore, saveApiKeyToFirestore } from "../../utils/firebase";
import { approveToken, depositToken } from "../../utils/contracts";
import { 
  ProjectType, DirectPaymentProjectData, EscrowPaymentProjectData, 
  ProjectData, ImageType, WhitelistedAddress, 
  PaymentType, FixedAmountDetails, RevenueShareDetails, Tier, TieredDetails, PaymentDetails,
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
  const [previewData, setPreviewData] = useState({
    logoPreview: "",
    coverPreview: "",
    embedPreview: "",
  });

  const nextStep = () => setCurrentStep(currentStep < 6 ? currentStep + 1 : 6);

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
        paymentType: "FixedAmount",
        paymentDetails: { rewardAmount: 0 },
        redirectUrl: "",
        totalPaidOut: 0,
        lastPaymentDate: null,
        embed: null,
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

  const handlePaymentTypeChange = (type: PaymentType) => {
    setProjectData(prev => {
      if (!prev) return prev;
  
      let paymentDetails: PaymentDetails = { rewardAmount: 0 };

      if (type === "FixedAmount") {
        paymentDetails = { rewardAmount: 0 } as FixedAmountDetails;
      } else if (type === "RevenueShare") {
        paymentDetails = { percentage: 0 } as RevenueShareDetails;
      } else if (type === "Tiered") {
        paymentDetails = { tiers: [] } as TieredDetails;
      }
  
      return {
        ...prev,
        paymentType: type,
        paymentDetails
      };
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

  const handleTierChange = (newTiers: Tier[]) => {
    setProjectData(prevData => {
      if (!prevData) return prevData;
  
      return {
        ...prevData,
        paymentDetails: {
          tiers: newTiers,
        } as TieredDetails,
      };
    });
  };

  const handleImageChange = (type: ImageType) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewData(prev => ({ ...prev, [`${type}Preview`]: reader.result as string }));
        setProjectData(prev => {
          if (!prev) return prev;
  
          return {
            ...prev,
            [type]: file
          };
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeImage = (type: ImageType) => () => {
    setPreviewData(prev => ({ ...prev, [`${type}Preview`]: "" }));
    setProjectData(prev => {
      if (!prev) return prev;
  
      return {
        ...prev,
        [type]: ""
      };
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
        await deleteProjectFromFirestore(projectId);
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
        await deleteProjectFromFirestore(projectId);
        return;
      }
  
      setSaveAndDepositStatus("Depositing tokens...");
      const depositSuccess = await depositToken(projectId, projectData.selectedTokenAddress, depositAmount);
      if (!depositSuccess) {
        toast.error("Failed to deposit token. Please try again.");
        setSaveAndDepositStatus(initialStatus);
        setIsSaving(false);
        await deleteProjectFromFirestore(projectId);
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
    switch (currentStep) {
      case 1:
        return (
          <ProjectTypeSelectionForm
            handleProjectTypeChange={handleProjectTypeChange}
            nextStep={nextStep}
          />
        );
      case 2:
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
          />
        );
      case 3:
        return (
          <LogoForm
            data={{
              logoPreview: previewData.logoPreview,
              coverPreview: previewData.coverPreview,
              ...(projectType! === "EscrowPayment" && { embedPreview: previewData.embedPreview }),
              projectType: projectType!,
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
              websiteUrl: projectData?.websiteUrl ?? "",
              xUrl: projectData?.xUrl ?? "",
              discordUrl: projectData?.discordUrl ?? "",
            }}
            handleChange={handleChange}
            nextStep={nextStep}
          />
        );
      case 5:
      case 6:
        return (
          <AffiliatesForm 
            data={{
              projectType: projectType!,
              selectedTokenAddress: projectData?.selectedTokenAddress ?? "",
              paymentType: projectType === "EscrowPayment" ? (projectData as EscrowPaymentProjectData)?.paymentType ?? "FixedAmount" : undefined,
              paymentDetails: projectType === "EscrowPayment" ? (projectData as EscrowPaymentProjectData)?.paymentDetails : undefined,
              whitelistedAddresses: projectType === "DirectPayment" ? (projectData as DirectPaymentProjectData)?.whitelistedAddresses ?? {} : undefined,
              redirectUrl: projectType === "EscrowPayment" ? (projectData as EscrowPaymentProjectData)?.redirectUrl ?? "" : undefined,
            }}
            handleChange={handleChange}
            handlePaymentTypeChange={projectType === "EscrowPayment" ? handlePaymentTypeChange : undefined}
            handleTierChange={projectType === "EscrowPayment" ? handleTierChange : undefined}
            handleWhitelistChange={projectType === "DirectPayment" ? handleWhitelistChange : undefined}
            nextStep={saveProjectAndDepositToken}
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
      <StatusBar currentStep={currentStep} />
      <div className="w-11/12 md:w-8/12 mx-auto">
        {renderForm()}
      </div>
    </div>
  );
}