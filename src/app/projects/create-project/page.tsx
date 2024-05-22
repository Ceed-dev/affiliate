"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAddress } from "@thirdweb-dev/react";
import { toast } from "react-toastify";
import { DateValueType } from "react-tailwindcss-datepicker";
import { 
  StatusBar,
  ProjectDetailsForm,
  AffiliatesForm,
  LogoForm,
  SocialLinksForm
} from "../../components/createProject";
import { saveProjectToFirestore, deleteProjectFromFirestore } from "../../utils/firebase";
import { approveToken, depositToken } from "../../utils/contracts";
import { ProjectData, ImageType, WhitelistedAddress } from "../../types";

export default function CreateProject() {
  const address = useAddress();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  // TODO: "Deposit"の文言を一時的に取り除く。
  // - Reason: 一時的に、報酬トークンの支払いはエスクローコントラクトではなくEOAから直接行うため。
  // - Planned Reversion: 未定。
  // - Date: 2024-05-17
  // - Author: shungo0222
  // - Issue: #314
  // ===== BEGIN ORIGINAL CODE =====
  // const initialStatus = "Save & Deposit";
  // ===== END ORIGINAL CODE =====
  // ===== BEGIN MODIFICATION =====
  const initialStatus = "Save";
  // ===== END MODIFICATION =====
  const [saveAndDepositStatus, setSaveAndDepositStatus] = useState(initialStatus);
  const [isSaving, setIsSaving] = useState(false);
  const [hideSaveAndDepositButton, setHideSaveAndDepositButton] = useState(false);
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
    whitelistedAddresses: {},
    slots: {
      total: 0,
      remaining: 0
    },
    budget: {
      total: 0,
      remaining: 0
    },
    deadline: null
  });
  const [previewData, setPreviewData] = useState({
    logoPreview: "",
    coverPreview: ""
  });

  const nextStep = () => setCurrentStep(currentStep < 5 ? currentStep + 1 : 5);

  // handleChange is a higher-order function that creates an event handler for form elements.
  // It takes a `field` string that can include dot notation for nested objects (e.g., "slots.remaining").
  // `isNumeric` is an optional parameter that when set to true, will parse the input value as an integer.
  const handleChange = (field: string, isNumeric?: boolean) => 
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      // Parse the event value. If `isNumeric` is true, parse the value as an integer.
      // If parsing fails or returns NaN, default to 0.
      const value = isNumeric ? parseInt(event.target.value, 10) || 0 : event.target.value;
      
      // Set the new state of project data.
      setProjectData(prev => {
        // Split the `field` string into keys for accessing nested properties.
        const keys = field.split(".");

        // Create a shallow copy of the previous state to maintain immutability.
        let updated = { ...prev } as any;

        // Traverse the keys to access the correct nested property.
        // `item` is used to reference the current level of the state object.
        let item = updated;
        for (let i = 0; i < keys.length - 1; i++) {
          item = item[keys[i]];  // Navigate deeper into the nested object.
        }

        // Set the new value at the final key. This updates the nested property.
        item[keys[keys.length - 1]] = value;

        // Return the updated state to update the state in React.
        return updated;
      });
    };

  const handleDateChange = (newValue: DateValueType) => {
    setProjectData(prev => {
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

  // TODO: ホワイトリストアドレスを更新する関数。
  // - Reason: フォーム内で入出力するため。
  // - Planned Reversion: 未定。
  // - Date: 2024-05-17
  // - Author: shungo0222
  // - Issue: #313
  // ===== BEGIN MODIFICATION =====
  const handleWhitelistChange = (newWhitelistedAddresses: { [address: string]: WhitelistedAddress }) => {
    setProjectData(prevData => ({
      ...prevData,
      whitelistedAddresses: newWhitelistedAddresses
    }));
  };
  // ===== END MODIFICATION =====

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

  const saveProjectAndDepositToken = async () => {
    const depositAmount = 10;
    setIsSaving(true);

    setSaveAndDepositStatus("Saving project to Firestore...");
    const result = await saveProjectToFirestore(projectData, `${address}`);
    if (!result) {
      toast.error("Failed to save project. Please try again.");
      setSaveAndDepositStatus(initialStatus);
      setIsSaving(false);
      return;
    }
    const { projectId } = result;

    // TODO: トークンのデポジット機能を一時的にコメントアウト。
    // - Reason: 一時的に、報酬トークンの支払いはエスクローコントラクトではなくEOAから直接行うため。
    // - Planned Reversion: 未定。
    // - Date: 2024-05-17
    // - Author: shungo0222
    // - Issue: #314
    // ===== BEGIN ORIGINAL CODE =====
    // setSaveAndDepositStatus("Apprcoving tokens...");
    // const approveSuccess = await approveToken(projectData.selectedTokenAddress, depositAmount);
    // if (!approveSuccess) {
    //   toast.error("Failed to approve token. Please try again.");
    //   setSaveAndDepositStatus(initialStatus);
    //   setIsSaving(false);
    //   await deleteProjectFromFirestore(projectId);
    //   return;
    // }

    // setSaveAndDepositStatus("Depositing tokens...");
    // const depositSuccess = await depositToken(projectId, projectData.selectedTokenAddress, depositAmount);
    // if (!depositSuccess) {
    //   toast.error("Failed to deposit token. Please try again.");
    //   setSaveAndDepositStatus(initialStatus);
    //   setIsSaving(false);
    //   await deleteProjectFromFirestore(projectId);
    //   return;
    // }
    // ===== END ORIGINAL CODE =====

    setHideSaveAndDepositButton(true);
    nextStep();
    setIsSaving(false);

    toast.success("Project saved successfully! Redirecting to the dashboard...", {
      onClose: () => router.push(`/projects/${projectId}`)
    });
  };

  const renderForm = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProjectDetailsForm
            data={{
              projectName: projectData.projectName,
              description: projectData.description,
              totalSlots: projectData.slots.total,
              totalBudget: projectData.budget.total,
              deadline: projectData.deadline
            }}
            handleChange={handleChange}
            handleDateChange={handleDateChange}
            nextStep={nextStep}
          />
        );
      case 2:
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
      case 3:
        return (
          <SocialLinksForm
            data={{
              websiteUrl: projectData.websiteUrl,
              discordUrl: projectData.discordUrl,
              xUrl: projectData.xUrl,
              instagramUrl: projectData.instagramUrl
            }}
            handleChange={handleChange}
            nextStep={nextStep}
          />
        );
      case 4:
      case 5:
        return (
          <AffiliatesForm 
            data={{
              selectedTokenAddress: projectData.selectedTokenAddress,
              // TODO: ホワイトリストアドレスを受け渡す。
              // - Reason: フォーム内で入出力するため。
              // - Planned Reversion: 未定。
              // - Date: 2024-05-17
              // - Author: shungo0222
              // - Issue: #313
              // ===== BEGIN ORIGINAL CODE =====
              // rewardAmount: projectData.rewardAmount,
              // redirectUrl: projectData.redirectUrl
              // ===== END ORIGINAL CODE =====
              // ===== BEGIN MODIFICATION =====
              whitelistedAddresses: projectData.whitelistedAddresses
              // ===== END MODIFICATION =====
            }}
            handleChange={handleChange}
            // TODO: ホワイトリストアドレスを更新する関数。
            // - Reason: フォーム内で入出力するため。
            // - Planned Reversion: 未定。
            // - Date: 2024-05-17
            // - Author: shungo0222
            // - Issue: #313
            // ===== BEGIN MODIFICATION =====
            handleWhitelistChange={handleWhitelistChange}
            // ===== END MODIFICATION =====
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