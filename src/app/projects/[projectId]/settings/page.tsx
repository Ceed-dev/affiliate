"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { DateValueType } from "react-tailwindcss-datepicker";
import cloneDeep from "lodash/cloneDeep";
import { getChainByChainIdAsync, Chain } from "@thirdweb-dev/chains";
import { useAddress } from "@thirdweb-dev/react";
import { 
  ProjectData, DirectPaymentProjectData, EscrowPaymentProjectData,
  ImageType, PreviewData, WhitelistedAddress,
} from "../../../types";
import { NavBar } from "../../../components/dashboard";
import { 
  ProjectDetailsForm, 
  AffiliatesForm,
  LogoForm,
  EmbedImageForm,
  SocialLinksForm,
  Button,
} from "../../../components/createProject";
import { fetchProjectData, updateProjectInFirestore, deleteProject } from "../../../utils/firebase";

export default function Settings({ params }: { params: { projectId: string } }) {
  const address = useAddress();
  const router = useRouter();
  const [initialProjectData, setInitialProjectData] = useState<ProjectData | null>(null);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData>({
    logoPreview: "",
    coverPreview: "",
    // ==============================================
    // This code manages the embed images feature for affiliates to select and display ads within projects.
    // Temporarily disabled on [2024-10-28] in version [v2.29.6] (Issue #1426).
    // Uncomment to re-enable the embed images feature in the future.
    // embedPreviews: [],
    // ==============================================
  });

  const [socialLinkFormError, setSocialLinkFormError] = useState(false);
  const [redirectLinkError, setRedirectLinkError] = useState(false);

  const [deleteInput, setDeleteInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const isDeleteButtonEnabled = deleteInput === projectData?.projectName && !isDeleting;

  const handleDeleteClick = async () => {
    if (window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      try {
        setIsDeleting(true);
        await deleteProject(params.projectId);
        toast.success("The project was deleted successfully.");
        router.push("/projects");
      } catch (error) {
        console.error("Failed to delete project:", error);
        toast.error("Deletion failed, please try again later.");
      } finally {
        setIsDeleting(false);
      }
    } else {
      setDeleteInput("");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchProjectData(params.projectId);
        setInitialProjectData(cloneDeep(data));
        setProjectData(cloneDeep(data));
        setLoadingProject(false);

        // Filter out File types and ensure embedPreviews only contains strings
        // ==============================================
        // This code manages the embed images feature for affiliates to select and display ads within projects.
        // Temporarily disabled on [2024-10-28] in version [v2.29.6] (Issue #1426).
        // Uncomment to re-enable the embed images feature in the future.
        // const embedPreviews = data.projectType === "EscrowPayment" 
        // ? (data.embeds || []).filter((embed: string | File) => typeof embed === "string") 
        // : [];
        // ==============================================

        setPreviewData({
          logoPreview: typeof data.logo === "string" ? data.logo : "",
          coverPreview: typeof data.cover === "string" ? data.cover : "",
          // ==============================================
          // This code manages the embed images feature for affiliates to select and display ads within projects.
          // Temporarily disabled on [2024-10-28] in version [v2.29.6] (Issue #1426).
          // Uncomment to re-enable the embed images feature in the future.
          // embedPreviews: embedPreviews as string[],
          // ==============================================
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

  const handleImageChange = (type: ImageType, index?: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewData(prev => {
          // ==============================================
          // This code manages the embed images feature for affiliates to select and display ads within projects.
          // Temporarily disabled on [2024-10-28] in version [v2.29.6] (Issue #1426).
          // Uncomment to re-enable the embed images feature in the future.
          // if (type === "embeds") {
          //   const newPreviews = [...prev.embedPreviews];
          //   if (index !== undefined) {
          //     newPreviews[index] = reader.result as string;
          //   } else {
          //     newPreviews.push(reader.result as string);
          //   }
          //   return { ...prev, embedPreviews: newPreviews };
          // } else {
            return { ...prev, [`${type}Preview`]: reader.result as string };
          // }
          // ==============================================
        });
        setProjectData(prev => {
          if (!prev) return prev;
          // ==============================================
          // This code manages the embed images feature for affiliates to select and display ads within projects.
          // Temporarily disabled on [2024-10-28] in version [v2.29.6] (Issue #1426).
          // Uncomment to re-enable the embed images feature in the future.
          // if (type === "embeds" && prev.projectType === "EscrowPayment") {
          //   const newEmbeds = [...(prev.embeds || [])];
          //   if (index !== undefined) {
          //     newEmbeds[index] = file;
          //   } else {
          //     newEmbeds.push(file);
          //   }
          //   return {
          //     ...prev,
          //     embeds: newEmbeds
          //   };
          // } else {
            return {
              ...prev,
              [type]: file
            };
          // }
          // ==============================================
        });
      };
      reader.readAsDataURL(file);
    }
  };  
  
  const removeImage = (type: ImageType, index?: number) => () => {
    setPreviewData(prev => {
      // ==============================================
      // This code manages the embed images feature for affiliates to select and display ads within projects.
      // Temporarily disabled on [2024-10-28] in version [v2.29.6] (Issue #1426).
      // Uncomment to re-enable the embed images feature in the future.
      // if (type === "embeds") {
      //   const newPreviews = prev.embedPreviews.filter((_, i) => i !== index);
      //   return { ...prev, embedPreviews: newPreviews };
      // } else {
        return { ...prev, [`${type}Preview`]: "" };
      // }
      // ==============================================
    });
    setProjectData(prev => {
      if (!prev) return prev;
      // ==============================================
      // This code manages the embed images feature for affiliates to select and display ads within projects.
      // Temporarily disabled on [2024-10-28] in version [v2.29.6] (Issue #1426).
      // Uncomment to re-enable the embed images feature in the future.
      // if (type === "embeds" && prev.projectType === "EscrowPayment") {
      //   const newEmbeds = (prev.embeds || []).filter((_, i) => i !== index);
      //   return {
      //     ...prev,
      //     embeds: newEmbeds
      //   };
      // } else {
        return {
          ...prev,
          [type]: null
        };
      // }
      // ==============================================
    });
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

  const handleConversionPointToggle = (id: string) => {
    setProjectData(prevData => {
      if (!prevData || prevData.projectType !== "EscrowPayment") return prevData;
  
      const updatedConversionPoints = prevData.conversionPoints.map(point =>
        point.id === id ? { ...point, isActive: !point.isActive } : point
      );
  
      return {
        ...prevData,
        conversionPoints: updatedConversionPoints,
      };
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
              projectData.websiteUrl.trim() !== "" &&
              projectData.xUrl.trim() !== "" &&
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
                            projectData.websiteUrl.trim() !== "" &&
                            projectData.xUrl.trim() !== "" &&
                            projectData.selectedTokenAddress.trim() !== "" &&
                            escrowProjectData.redirectUrl.trim() !== "";
                            // ==============================================
                            // This code manages the embed images feature for affiliates to select and display ads within projects.
                            // Temporarily disabled on [2024-10-28] in version [v2.29.6] (Issue #1426).
                            // Uncomment to re-enable the embed images feature in the future.
                            // escrowProjectData.embeds.length > 0;
                            // ==============================================
    }

    return false;
  };

  const handleSaveChanges = async () => {
    if (isFormComplete() && projectData) {
      console.log("Saving changes...");
      try {
        // ==============================================
        // This code manages the embed images feature for affiliates to select and display ads within projects.
        // Temporarily disabled on [2024-10-28] in version [v2.29.6] (Issue #1426).
        // Uncomment to re-enable the embed images feature in the future.
        // const deletedEmbeds = initialProjectData?.projectType === "EscrowPayment" 
        // ? (initialProjectData as EscrowPaymentProjectData).embeds.filter(
        //     (embed) => !(projectData as EscrowPaymentProjectData).embeds.includes(embed)
        //   ) as string[]
        // : [];
        // ==============================================

        const updatedData = await updateProjectInFirestore(
          params.projectId,
          projectData,
          // ==============================================
          // This code manages the embed images feature for affiliates to select and display ads within projects.
          // Temporarily disabled on [2024-10-28] in version [v2.29.6] (Issue #1426).
          // Uncomment to re-enable the embed images feature in the future.
          // deletedEmbeds,
          // ==============================================
          setIsUpdating,
        );
        setProjectData(updatedData);
        setInitialProjectData(updatedData);

        const newPreviewData = {
          logoPreview: `${updatedData.logo}`,
          coverPreview: `${updatedData.cover}`,
          // ==============================================
          // This code manages the embed images feature for affiliates to select and display ads within projects.
          // Temporarily disabled on [2024-10-28] in version [v2.29.6] (Issue #1426).
          // Uncomment to re-enable the embed images feature in the future.
          // embedPreviews: updatedData.projectType === "EscrowPayment" 
          //   ? (updatedData as EscrowPaymentProjectData).embeds.filter((embed): embed is string => typeof embed === "string") 
          //   : []
          // ==============================================
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
            <Image src="/assets/common/loading.png" alt="loading.png" width={50} height={50} className="animate-spin" /> 
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
            <SocialLinksForm
              data={{
                websiteUrl: projectData?.websiteUrl ?? "",
                xUrl: projectData?.xUrl ?? "",
                discordUrl: projectData?.discordUrl ?? "",
              }}
              handleChange={handleChange}
              setSocialLinkFormError={setSocialLinkFormError}
            />
            <LogoForm
              data={{
                logoPreview: previewData.logoPreview,
                coverPreview: previewData.coverPreview,
              }}
              handleImageChange={handleImageChange}
              removeImage={(type) => removeImage(type)}
            />
            {/* ============================================== */}
            {/* This code manages the embed images feature for affiliates to select and display ads within projects. */}
            {/* Temporarily disabled on [2024-10-28] in version [v2.29.6] (Issue #1426). */}
            {/* Uncomment to re-enable the embed images feature in the future. */}
            {/* {projectData?.projectType === "EscrowPayment" && (
              <EmbedImageForm
                data={{
                  embedPreviews: previewData.embedPreviews,
                }}
                handleImageChange={handleImageChange}
                removeImage={removeImage}
              />
            )} */}
            {/* ============================================== */}
            <AffiliatesForm 
              data={{
                projectType: projectData?.projectType!,
                selectedTokenAddress: projectData?.selectedTokenAddress ?? "",
                whitelistedAddresses: projectData?.projectType === "DirectPayment" ? (projectData as DirectPaymentProjectData)?.whitelistedAddresses ?? {} : undefined,
                redirectUrl: projectData?.projectType === "EscrowPayment" ? (projectData as EscrowPaymentProjectData)?.redirectUrl ?? "" : undefined,
                isReferralEnabled: projectData?.projectType === "EscrowPayment" ? (projectData as EscrowPaymentProjectData).isReferralEnabled : undefined,
                conversionPoints: projectData?.projectType === "EscrowPayment" ? (projectData as EscrowPaymentProjectData).conversionPoints : undefined,
              }}
              handleChange={handleChange}
              handleConversionPointToggle={projectData?.projectType === "EscrowPayment" ? handleConversionPointToggle : undefined}
              handleWhitelistChange={projectData?.projectType === "DirectPayment" ? handleWhitelistChange : undefined}
              setRedirectLinkError={setRedirectLinkError}
              selectedChain={selectedChain ?? undefined}
            />
            <Button onClick={handleSaveChanges} disabled={!isFormComplete() || !hasChanges() || isUpdating || socialLinkFormError || redirectLinkError}>
              {isUpdating ? (
                <div className="flex flex-row items-center justify-center gap-5">
                  <Image src="/assets/common/loading.png" alt="loading.png" width={30} height={30} className="animate-spin" /> 
                  <p className="text-gray-500 font-semibold text-lg">Updating...</p>
                </div>
              ) : (
                <p>Save Changes</p>
              )}
            </Button>

            {/* Project Delete Field */}
            {/* Temporarily restricting project deletion access to the admin's wallet address. */}
            {/* This will likely be reverted to allow general user access in the future. */}
            {address === "0x329980D088Ba66B3d459AE3d396a722437801689" && (
              <div className="mb-10 mt-20 p-5 border-2 border-red-600 bg-red-100 rounded-lg shadow-md">
                <div className="bg-yellow-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                  <strong className="font-bold">Warning: All of the following data will be permanently deleted:</strong>
                  <ul className="mt-2 list-disc list-inside">
                    <li>Project data, including all associated images</li>
                    <li>API key data linked to the project</li>
                    <li>Referral ID data issued by affiliates who participated in the project</li>
                    <li>All conversion and click data associated with the referral IDs</li>
                  </ul>
                  <p className="mt-4">This action cannot be undone. Please proceed with caution.</p>
                </div>
                <p className="text-red-700 mb-4">
                  To delete the project, please enter the project name &apos;{projectData?.projectName}&apos; in the field below.
                </p>
                <input
                  type="text"
                  className="mb-4 p-2 border border-red-600 bg-white rounded w-full"
                  placeholder="Enter project name"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                />

                <button
                  className={`w-full bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-700 ${!isDeleteButtonEnabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={handleDeleteClick}
                  disabled={!isDeleteButtonEnabled}
                >
                  {isDeleting
                    ? <span className="flex flex-row items-center justify-center gap-2">
                        Deleting...
                        <Image src={"/assets/common/loading.png"} height={30} width={30} alt="loading.png" className="animate-spin" />
                      </span> 
                    : "Delete Project"
                  }
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}