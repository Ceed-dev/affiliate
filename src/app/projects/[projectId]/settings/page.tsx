"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { DateValueType } from "react-tailwindcss-datepicker";
import cloneDeep from "lodash/cloneDeep";
import { getChainByChainIdAsync, Chain } from "@thirdweb-dev/chains";
import { ProjectData, DirectPaymentProjectData, EscrowPaymentProjectData, ImageType, WhitelistedAddress } from "../../../types";
import { NavBar } from "../../../components/dashboard";
import { 
  ProjectDetailsForm, 
  AffiliatesForm,
  LogoForm,
  SocialLinksForm,
  NextButton 
} from "../../../components/createProject";
import { fetchProjectData, updateProjectInFirestore } from "../../../utils/firebase";

export default function Settings({ params }: { params: { projectId: string } }) {
  const [initialProjectData, setInitialProjectData] = useState<ProjectData | null>(null);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [previewData, setPreviewData] = useState({
    logoPreview: "",
    coverPreview: "",
    embedPreview: "",
  });

  const [socialLinkFormError, setSocialLinkFormError] = useState(false);
  const [redirectLinkError, setRedirectLinkError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchProjectData(params.projectId);
        setInitialProjectData(cloneDeep(data));
        setProjectData(cloneDeep(data));
        setLoadingProject(false);

        setPreviewData({
          logoPreview: data.logo || "",
          coverPreview: data.cover || "",
          embedPreview: data.projectType === "EscrowPayment" ? data.embed || "" : "",
        });

        if (data.selectedChainId) {
          const chain = await getChainByChainIdAsync(data.selectedChainId);
          setSelectedChain(chain);
        }
      } catch (error) {
        const message = (error instanceof Error) ? error.message : "Unknown error";
        console.error("Error loading the project: ", message);
        toast.error(`Error loading the project: ${message}`);
        setLoadingProject(false);
      }
    };

    fetchData();
  }, [params.projectId]);

  const handleImageChange = (type: ImageType) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewData(prev => ({ ...prev, [`${type}Preview`]: reader.result as string }));
        setProjectData(prev => { 
          if (prev === null) return null;
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
      if (prev === null) return null;
      return {
        ...prev, 
        [type]: "" 
      };
    });
  };

  // handleChange is a higher-order function that creates an event handler for form elements.
  // It takes a `field` string that can include dot notation for nested objects (e.g., "slots.remaining").
  // `isNumeric` is an optional parameter that when set to true, will parse the input value as a number.
  const handleChange = (field: string, isNumeric?: boolean, isFloat?: boolean) => 
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      let value: any;
    
      // Parse the event value based on the `isNumeric` and `isFloat` flags.
      if (isNumeric) {
        value = isFloat ? parseFloat(event.target.value) : parseInt(event.target.value, 10);
        if (isFloat && !isNaN(value)) {
          value = Math.round(value * 10) / 10; // Limited to one decimal place
        }
        if (isNaN(value)) value = 0;  // Default to 0 if parsing fails.
      } else {
        value = event.target.value;
      }
      
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
      if (prev === null) return null;
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
      if (prevData === null) return null;
      return {
        ...prevData,
        whitelistedAddresses: newWhitelistedAddresses
      }
    });
  };

  const hasChanges = () => {
    if (!initialProjectData || !projectData) return false;
  
    return JSON.stringify(initialProjectData) !== JSON.stringify(projectData);
  };

  const isFormComplete = () => {
    if (!projectData) return false;

    if (projectData.projectType === "DirectPayment") {
      const directProjectData = projectData as DirectPaymentProjectData;
      return projectData.projectName.trim() !== "" &&
              projectData.description.trim() !== "" &&
              projectData.logo &&
              projectData.cover &&
              projectData.websiteUrl &&
              projectData.xUrl &&
              projectData.selectedTokenAddress.trim() !== "" &&
              Object.keys(projectData.whitelistedAddresses || {}).length > 0 &&
              directProjectData.slots.total > 0 &&
              directProjectData.slots.remaining >= 0 &&
              directProjectData.budget.total > 0 &&
              directProjectData.budget.remaining >= 0 &&
              directProjectData.deadline !== null;
    }

    if (projectData.projectType === "EscrowPayment") {
      const escrowProjectData = projectData as EscrowPaymentProjectData;
      return projectData.projectName.trim() !== "" &&
              projectData.description.trim() !== "" &&
              projectData.logo &&
              projectData.cover &&
              projectData.websiteUrl &&
              projectData.xUrl &&
              projectData.selectedTokenAddress.trim() !== "" &&
              // escrowProjectData.rewardAmount > 0 && TODO: Fix
              escrowProjectData.redirectUrl.trim() !== "" &&
              escrowProjectData.embed;
    }

    return false;
  };

  const handleSaveChanges = async () => {
    if (isFormComplete() && projectData) {
      console.log("Saving changes...");
      try {
        const updatedData = await updateProjectInFirestore(
          params.projectId,
          projectData,
          setIsUpdating
        );
        setProjectData(updatedData);
        setInitialProjectData(updatedData);

        const newPreviewData = {
          logoPreview: `${updatedData.logo}`,
          coverPreview: `${updatedData.cover}`,
          embedPreview: updatedData.projectType === "EscrowPayment" ? (updatedData as EscrowPaymentProjectData).embed || "" : ""
        };

        setPreviewData(newPreviewData);
      } catch (error: any) {
        console.error("Failed to save changes:", error);
        toast.error("Failed to save changes: " + error.message);
      }
    } else {
      toast.error("Please fill out all required fields.");
    }
  };

  return (
    <>
      <NavBar projectId={params.projectId} projectType={projectData?.projectType!} />
      <div className="min-h-screen bg-[#F8FAFC] px-4 sm:px-10 md:px-32 lg:px-60 xl:px-96 pt-1 pb-10">
        {loadingProject ? (
          <div className="flex flex-row items-center justify-center gap-5 mt-20">
            <Image src="/loading.png" alt="loading.png" width={50} height={50} className="animate-spin" /> 
            <p className="text-gray-500 font-semibold text-lg">Loading...</p>
          </div>
        ) : (
          <>
            <ProjectDetailsForm
              data={{
                projectType: projectData?.projectType!,
                projectName: projectData?.projectName ?? "",
                description: projectData?.description ?? "",
                ownerAddresses: projectData?.ownerAddresses ?? [],
                ...(projectData?.projectType === "DirectPayment" && {
                  totalSlots: (projectData as DirectPaymentProjectData).slots.total,
                  remainingSlots: (projectData as DirectPaymentProjectData).slots.remaining,
                  totalBudget: (projectData as DirectPaymentProjectData).budget.total,
                  remainingBudget: (projectData as DirectPaymentProjectData).budget.remaining,
                  deadline: (projectData as DirectPaymentProjectData).deadline,
                }),
              }}
              handleChange={handleChange}
              handleOwnerChange={handleOwnerChange}
              handleDateChange={projectData?.projectType === "DirectPayment" ? handleDateChange : undefined}
            />
            <LogoForm
              data={{
                logoPreview: previewData.logoPreview,
                coverPreview: previewData.coverPreview,
                ...(projectData?.projectType === "EscrowPayment" && { embedPreview: previewData.embedPreview }),
                projectType: projectData?.projectType!,
              }}
              handleImageChange={handleImageChange}
              removeImage={(type) => removeImage(type)}
            />
            <SocialLinksForm
              data={{
                websiteUrl: projectData?.websiteUrl ?? "",
                xUrl: projectData?.xUrl ?? "",
                discordUrl: projectData?.discordUrl ?? "",
              }}
              handleChange={handleChange}
              setSocialLinkFormError={setSocialLinkFormError}
            />
            <AffiliatesForm 
              data={{
                projectType: projectData?.projectType!,
                selectedTokenAddress: projectData?.selectedTokenAddress ?? "",
                whitelistedAddresses: projectData?.projectType === "DirectPayment" ? (projectData as DirectPaymentProjectData)?.whitelistedAddresses ?? {} : undefined,
                // rewardAmount: projectData?.projectType === "EscrowPayment" ? (projectData as EscrowPaymentProjectData)?.rewardAmount ?? 0 : undefined, TODO: Fix
                redirectUrl: projectData?.projectType === "EscrowPayment" ? (projectData as EscrowPaymentProjectData)?.redirectUrl ?? "" : undefined,
              }}
              handleChange={handleChange}
              handleWhitelistChange={projectData?.projectType === "DirectPayment" ? handleWhitelistChange : undefined}
              setRedirectLinkError={setRedirectLinkError}
              selectedChain={selectedChain ?? undefined}
            />
            <NextButton onClick={handleSaveChanges} disabled={!isFormComplete() || !hasChanges() || isUpdating || socialLinkFormError || redirectLinkError}>
              {isUpdating ? (
                <div className="flex flex-row items-center justify-center gap-5">
                  <Image src="/loading.png" alt="loading.png" width={30} height={30} className="animate-spin" /> 
                  <p className="text-gray-500 font-semibold text-lg">Updating...</p>
                </div>
              ) : (
                <p>Save Changes</p>
              )}
            </NextButton>
          </>
        )}
      </div>
    </>
  );
}