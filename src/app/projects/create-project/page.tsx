"use client"; // This directive allows the component to be rendered on the client side only

// External Libraries
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Components
import { 
  GeneralForm, 
  BrandResourceForm, 
  MemberForm, 
  RewardForm, 
  TargetingForm,
  SaveButton 
} from "../../components/project";

// Utilities
import {
  handleUpdateConversionPoints,
  createHandleChange,
  createHandleOwnerChange,
  createHandleImageChange,
  createRemoveImage,
  saveProject
} from "../../utils/projectUtils";

// Types and Interfaces
import { ProjectData, ImageType, PreviewData, ConversionPoint } from "../../types";

// Context Providers
import { useChainContext } from "../../context/chainContext";

/**
 * Create Project Page
 * ---------------------------
 * This page provides a form interface for users to create a new project within the application.
 * 
 * Overview:
 * - Collects necessary project information such as name, description, and branding images.
 * - Allows configuration of chain selection, token address, and optional referral features.
 * - Supports setting up conversion points, including options for reward types (Fixed Amount, Revenue Share, Tiered).
 * - Includes preview functionality for uploaded images.
 * - Saves project data to Firestore and generates an API key for integration with external systems.
 * 
 * Access Control:
 * - Accessible only to authenticated users with project creation permissions.
 * - Redirects the user to the project dashboard upon successful project creation.
 * 
 * Usage:
 * - Used primarily by project owners and admins setting up new projects for the platform.
 * - The page ensures validation of all required inputs before submission.
 * 
 * @page
 * @returns {JSX.Element} Rendered Create Project page
 */
export default function CreateProject() {
  // Router and context
  const router = useRouter();
  const { selectedChain } = useChainContext();

  // ========================== State Definitions ==========================

  // Holds all project data entered by the user or retrieved from the database
  const [projectData, setProjectData] = useState<ProjectData>({
    projectName: "",
    description: "",
    selectedToken: {
      chainId: selectedChain.id, // Chain ID of the selected blockchain
      address: "", // Token address associated with the project
      symbol: "", // Token symbol (default empty)
    },

    // Media assets for project representation
    logo: null,
    cover: null,

    // URLs related to the project
    websiteUrl: "",
    xUrl: "",
    discordUrl: "",

    // Affiliates and other settings
    ownerAddresses: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    redirectUrl: "",

    // Financial tracking fields
    totalPaidOut: 0,
    lastPaymentDate: null,

    // Referral, conversion point and external campaigns settings
    isReferralEnabled: false,
    conversionPoints: [],
    externalCampaigns: [],

    // Targeting settings for the project
    targeting: {
      audienceCountries: [], // List of countries for audience targeting
    },

    // Marketplace visibility setting
    isVisibleOnMarketplace: process.env.NEXT_PUBLIC_ENVIRONMENT === "production" ? false : true, // Environment-dependent default

    // XP reward system setting
    isUsingXpReward: false, // Indicates whether XP points are used as a reward, default is false
  }); 

  // Preview data for displaying project images before upload
  const [previewData, setPreviewData] = useState<PreviewData>({
    logoPreview: "",
    coverPreview: "",
  });

  // Boolean state to enable or disable the referral feature for the project
  const [isReferralEnabled, setIsReferralEnabled] = useState<boolean>(false);

  // Boolean state to enable or disable the use of XP points as a reward for the project
  const [isUsingXpReward, setIsUsingXpReward] = useState<boolean>(false);

  // Stores all conversion points added to the project
  const [conversionPoints, setConversionPoints] = useState<ConversionPoint[]>([]);

  // Stores the selected audience countries for the project
  const [audienceCountries, setAudienceCountries] = useState<string[]>([]);

  // Tracks the presence of validation errors in the social links form.
  // - `true` indicates that one or more fields contain errors.
  // - `false` means all fields are valid.
  // This state is used to prevent form submission when validation errors exist.
  const [socialLinkFormError, setSocialLinkFormError] = useState(false);

  // Tracks the validation state of the token selection.
  // - `true` indicates an error in the token address, validity, or ERC20 compliance.
  // - `false` means the token selection is valid.
  // This state is checked before form submission to ensure the token meets validation criteria.
  const [tokenError, setTokenError] = useState(false);

  // Tracks the validation state of the redirect link.
  // - `true` indicates an error in the redirect link format or value.
  // - `false` means the redirect link is valid.
  // This state is checked before form submission to ensure all fields meet the required validation criteria.
  const [redirectLinkError, setRedirectLinkError] = useState(false);

  // State to manage the save process: if true, saving is in progress
  const [isSaving, setIsSaving] = useState(false);

  // State to manage save completion status: if true, the project has been saved successfully
  const [isSaved, setIsSaved] = useState(false);

  // ========================== Function Definitions ==========================

  /**
   * Handles adding or removing conversion points in the project data.
   * - Uses `handleUpdateConversionPoints` to modify the conversion points list based on the specified action.
   * - The `setConversionPoints` state updater is passed to ensure the project data is updated.
   *
   * @param action - The action to perform, either "add" or "remove".
   * @param point - The conversion point to add or remove (optional).
   */
  const updateConversionPoints = (action: "add" | "remove", point?: ConversionPoint) => 
    handleUpdateConversionPoints(action, point, setConversionPoints);

  // Initialize `handleChange` with `setProjectData` to create an event handler function.
  // This handler updates specific fields within the `projectData` state using dot notation for nested properties.
  // `handleChange` can parse values as numeric or float types based on optional flags.
  const handleChange = createHandleChange(setProjectData);

  // Initialize `handleOwnerChange` with `setProjectData` to manage owner address updates in the project state.
  // `handleOwnerChange` replaces the existing owner addresses with a provided list of new addresses.
  const handleOwnerChange = createHandleOwnerChange(setProjectData);

  /**
   * Initializes the image change handler for managing image uploads in the project.
   * - Uses `setPreviewData` to update the preview display for the selected image.
   * - Updates the actual project data with the uploaded file using `setProjectData`.
   * 
   * This handler enables dynamic handling of different image types (e.g., "logo", "cover") 
   * by specifying the type directly in component calls.
   * 
   * Example usage:
   * ```jsx
   * <input
   *   type="file"
   *   accept="image/*"
   *   onChange={handleImageChange("logo")}
   * />
   * ```
   */
  const handleImageChange = createHandleImageChange(setPreviewData, setProjectData);

  /**
   * Creates a function to handle the removal of an image based on the specified type.
   * - Clears the preview data for the specified image type (e.g., "logo" or "cover").
   * - Sets the project data field for the specified image type to `null`.
   *
   * @param type - The type of image to remove (e.g., "logo" or "cover").
   * @returns A function that, when invoked, removes the specified image from both the preview and project data states.
   */
  const removeImage = (type: ImageType) => createRemoveImage(setPreviewData, setProjectData, type);

  /**
   * Handles saving the project data by calling the `saveProject` function with necessary parameters.
   * - This function consolidates and validates the project data before initiating the save process.
   * - Invokes `saveProject`, which performs the required validation checks and saves the data to Firestore.
   * - Sets appropriate loading and saved states to provide user feedback during the save process.
   *
   * @returns A promise that resolves once the project data has been processed and saved.
   */
  const handleSaveProject = async () => {
    await saveProject(
      projectData,               // Object containing all the project's main data fields
      selectedChain.id,          // The ID of the blockchain chain selected for this project
      conversionPoints,          // Array of conversion points associated with the project
      audienceCountries,         // Array of selected audience countries for targeting
      isReferralEnabled,         // Boolean indicating if the referral feature is enabled
      isUsingXpReward,           // Boolean indicating if XP points are used as a reward
      socialLinkFormError,       // Error state for social link validation
      tokenError,                // Error state for token selection
      redirectLinkError,         // Error state for redirect link validation
      setIsSaving,               // Function to set the loading state during the save process
      setIsSaved,                // Function to set the saved state upon successful save
      router                     // Next.js router for page navigation upon completion
    );
  };

  return (
    <div className="flex flex-col items-center mb-10 md:my-20">
      <div className="max-w-4xl space-y-5 md:space-y-10 px-4">
        <h1 className="font-bold text-2xl md:text-3xl">Project Setup</h1>
        <GeneralForm
          projectName={projectData.projectName}
          description={projectData.description}
          handleChange={handleChange}
        />
        <BrandResourceForm
          websiteUrl={projectData.websiteUrl}
          xUrl={projectData.xUrl}
          discordUrl={projectData.discordUrl}
          logoPreview={previewData.logoPreview}
          coverPreview={previewData.coverPreview}
          handleChange={handleChange}
          handleImageChange={handleImageChange}
          removeImage={removeImage}
          setSocialLinkFormError={setSocialLinkFormError}
        />
        <MemberForm
          ownerAddresses={projectData.ownerAddresses}
          handleOwnerChange={handleOwnerChange}
        />
        <RewardForm
          isUsingXpReward={isUsingXpReward}
          isReferralEnabled={isReferralEnabled}
          selectedToken={projectData.selectedToken}
          conversionPoints={conversionPoints}
          redirectUrl={projectData.redirectUrl}
          handleChange={handleChange}
          setIsUsingXpReward={setIsUsingXpReward}
          setIsReferralEnabled={setIsReferralEnabled}
          handleUpdateConversionPoints={updateConversionPoints}
          setTokenError={setTokenError}
          setRedirectLinkError={setRedirectLinkError}
        />
        <TargetingForm
          selectedCountries={audienceCountries}
          setSelectedCountries={setAudienceCountries}
        />
        <SaveButton
          onClick={handleSaveProject}
          disabled={isSaving || isSaved}
        >
          {isSaving ? (
            <div className="flex flex-row items-center justify-center gap-5">
              <Image 
                src="/assets/common/loading.png" 
                height={30} 
                width={30} 
                alt="loading.png" 
                className="animate-spin" 
              />
              <span className="animate-pulse">Saving...</span>
            </div>
          ) : isSaved ? (
            <span className="text-green-500 font-bold">Saved!</span>
          ) : (
            "Save"
          )}
        </SaveButton>
      </div>
    </div>
  );
}