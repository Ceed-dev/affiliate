"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { useAddress } from "@thirdweb-dev/react";
import cloneDeep from "lodash/cloneDeep";
import { getChainByChainIdAsync, Chain } from "@thirdweb-dev/chains";

// Types
import { ProjectData, ImageType, PreviewData } from "../../../types";

// Components
import { 
  GeneralForm, 
  BrandResourceForm, 
  MemberForm, 
  RewardForm, 
  SaveButton,
  DeleteProject,
} from "../../../components/project";

// Utilities
import {
  toggleConversionPointActiveState,
  createHandleChange,
  createHandleOwnerChange,
  createHandleImageChange,
  createRemoveImage,
  updateProject,
} from "../../../utils/projectUtils";
import { fetchProjects } from "../../../utils/projectUtils";

/**
 * Project Settings Page
 * ---------------------------
 * This page provides an interface for managing the settings and configurations of an existing project.
 * 
 * Overview:
 * - Displays and allows editing of essential project details, including name, description, and branding images.
 * - Supports configuration for chain selection, token address, and optional referral settings.
 * - Enables toggling of conversion points and configuration of reward types (Fixed Amount, Revenue Share, Tiered).
 * - Includes preview functionality for uploaded branding images (logo and cover).
 * - Updates project data in Firestore upon submission and displays success or error notifications.
 * 
 * Features:
 * - Toggle functionality for `isActive` status on individual conversion points.
 * - Input validation for form fields, including social links and token addresses.
 * - Visual feedback on save and delete actions with loading states and success/error messages.
 * - Allows project deletion with confirmation input, deleting associated images and data from Firestore.
 * 
 * Access Control:
 * - Accessible only to authenticated users with permissions to edit the project.
 * - Restricts delete functionality to admin users based on wallet address verification.
 * 
 * Usage:
 * - Primarily used by project owners and admins to manage ongoing projects and update settings as needed.
 * - Ensures all required fields are validated before updating.
 * - Redirects to the project listing page after successful deletion.
 * 
 * @page
 * @param {object} params - Parameters passed to the page component.
 * @param {string} params.projectId - ID of the project to be edited.
 * @returns {JSX.Element} Rendered Project Settings page
 */
export default function Settings({ params }: { params: { projectId: string } }) {
  // ========================== State Definitions ==========================

  // Temporarily restricting project deletion access to the admin's wallet address.
  // This will likely be reverted to allow general user access in the future.
  const isAdmin = useAddress() === "0x329980D088Ba66B3d459AE3d396a722437801689";

  // Default values for initializing project data
  const defaultProjectData: ProjectData = {
    projectName: "",
    description: "",
    selectedChainId: 1, // Default chain ID
    selectedTokenAddress: "",
    logo: null,
    cover: null,
    websiteUrl: "",
    xUrl: "",
    discordUrl: "",
    ownerAddresses: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    redirectUrl: "",
    totalPaidOut: 0,
    lastPaymentDate: null,
    isReferralEnabled: false,
    conversionPoints: []
  };

  // Project data states
  const [initialProjectData, setInitialProjectData] = useState<ProjectData>(defaultProjectData); // Initial project data snapshot for comparison
  const [projectData, setProjectData] = useState<ProjectData>(defaultProjectData); // Current project data for editing

  // Chain selection state
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null); // The selected blockchain chain

  // Preview data for displaying project images before upload
  const [previewData, setPreviewData] = useState<PreviewData>({
    logoPreview: "",
    coverPreview: ""
  });

  // Tracks the presence of validation errors in the social links form.
  // - `true` indicates that one or more fields contain errors.
  // - `false` means all fields are valid.
  const [socialLinkFormError, setSocialLinkFormError] = useState(false);

  // State to manage the update process: if true, updating is in progress
  const [isUpdating, setIsUpdating] = useState(false);

  // Project loading state
  const [loadingProject, setLoadingProject] = useState(true); // If true, project data is being fetched

  // Delete confirmation states
  const [deleteInput, setDeleteInput] = useState(""); // Input field for confirming project deletion
  const [isDeleting, setIsDeleting] = useState(false); // If true, deletion is in progress

  // ========================== Data Fetching ==========================
  
  useEffect(() => {
    // Fetches project data and initializes relevant state variables upon component mount.
    const fetchData = async () => {
      try {
        // Retrieve project data from the database by project ID
        const projectDataArray = await fetchProjects({ projectId: params.projectId });

        // Ensure project data is found
        if (!projectDataArray || projectDataArray.length === 0) {
          console.error("Project data not found for the provided project ID.");
          return; // Handle the error (e.g., display an error message or navigate away)
        }

        const data = projectDataArray[0]; // FetchProjects returns an array, so we take the first item
  
        // Set both `initialProjectData` and `projectData` states to the retrieved project data.
        // This allows `initialProjectData` to serve as a reference for detecting changes.
        setInitialProjectData(cloneDeep(data));
        setProjectData(cloneDeep(data));
  
        // Configure image preview data if the images are stored as URLs (strings)
        setPreviewData({
          logoPreview: typeof data.logo === "string" ? data.logo : "",
          coverPreview: typeof data.cover === "string" ? data.cover : "",
        });
  
        // Fetch the blockchain chain data for the selected chain ID and set `selectedChain`
        const chain = await getChainByChainIdAsync(data.selectedChainId);
        setSelectedChain(chain);
      } catch (error) {
        // Capture and display errors that occur during data fetch
        const message = (error instanceof Error) ? error.message : "Unknown error";
        console.error("Error loading the project: ", message);
        toast.error(`Error loading the project: ${message}`);
      } finally {
        // Ensures that `loadingProject` is set to false, regardless of success or failure
        setLoadingProject(false);
      }
    };
  
    // Invoke fetchData immediately upon component mounting and any time `params.projectId` changes
    fetchData();
  }, [params.projectId]);

  // ========================== Function Definitions ==========================

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

  // Initialize `handleConversionPointToggle` to toggle the `isActive` state of a specific conversion point in `projectData`.
  // This handler receives a conversion point ID and uses it to find and toggle the `isActive` status of that conversion point.
  const handleConversionPointToggle = (id: string) => toggleConversionPointActiveState(id, setProjectData);

  // Define `hasChanges` to check if there are any modifications to `projectData` compared to its initial state.
  // This function serializes and compares `initialProjectData` and `projectData` objects to determine if any field has changed.
  // Returns `true` if changes are detected, otherwise `false`.
  const hasChanges = () => {
    if (!initialProjectData || !projectData) return false;
    return JSON.stringify(initialProjectData) !== JSON.stringify(projectData);
  };

  /**
   * Handles updating the project data by calling the `updateProject` function with necessary parameters.
   * - Consolidates the project data and initiates the update process.
   * - Invokes `updateProject`, which performs validation checks and updates the data in Firestore.
   * - Sets appropriate loading and feedback states to indicate update progress and completion.
   *
   * @returns A promise that resolves once the project data has been processed and updated.
   */
  const handleUpdateProject = async () => {
    await updateProject(
      params.projectId,         // The ID of the project being updated
      projectData,              // Object containing all the project's main data fields
      setIsUpdating,            // Function to set the loading state during the update process
      setProjectData,           // Function to set the current project data state after update
      setInitialProjectData,    // Function to set the initial project data state after update
      setPreviewData,           // Function to update image preview data after update
      socialLinkFormError       // Error state for social link validation
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center pb-10 md:py-20">
      {loadingProject ? (
        <div className="flex flex-row items-center justify-center gap-5 mt-20">
          <Image
            src="/assets/common/loading.png"
            alt="loading.png"
            width={50}
            height={50}
            className="animate-spin"
          /> 
          <p className="text-[#757575] font-semibold text-lg">Loading...</p>
        </div>
      ) : (
        <div className="w-full max-w-4xl space-y-5 md:space-y-10 px-4">
          <h1 className="font-bold text-2xl md:text-3xl">Project Update</h1>
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
            isReferralEnabled={projectData.isReferralEnabled}
            selectedTokenAddress={projectData.selectedTokenAddress}
            conversionPoints={projectData.conversionPoints}
            redirectUrl={projectData.redirectUrl}
            handleChange={handleChange}
            selectedChain={selectedChain}
            handleConversionPointToggle={handleConversionPointToggle}
            isEditing={true}
          />
          <SaveButton 
            onClick={handleUpdateProject}
            disabled={!hasChanges()}
          >
            {isUpdating ? (
              <div className="flex flex-row items-center justify-center gap-5">
                <Image 
                  src="/assets/common/loading.png"
                  height={30} 
                  width={30} 
                  alt="loading.png" 
                  className="animate-spin" 
                />
                <span className="animate-pulse">Updating...</span>
              </div>
            ) : (
              "Update"
            )}
          </SaveButton>

          {/* Project Delete Field */}
          {isAdmin && (
            <DeleteProject
              projectId={params.projectId}
              projectName={projectData.projectName}
              deleteInput={deleteInput}
              setDeleteInput={setDeleteInput}
              isDeleting={isDeleting}
              setIsDeleting={setIsDeleting}
            />
          )}
        </div>
      )}
    </div>
  );
}