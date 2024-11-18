import { Dispatch, SetStateAction } from "react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { toast } from "react-toastify";
import { doc, collection, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase/firebaseConfig";
import { saveApiKeyToFirestore, updateProjectInFirestore, deleteProjectFromFirebase } from "./firebase";
import { uploadImageAndGetURL } from "./firebase/uploadImageAndGetURL";
import { validateProjectData } from "./validationUtils";
import { ProjectData, ImageType, PreviewData, ConversionPoint } from "../types";

/**
 * Checks if a project with the given ID exists in the Firestore 'projects' collection.
 *
 * @param projectId - The ID of the project to check.
 * @returns {Promise<boolean>} - Returns true if the project exists, otherwise false.
 */
export const checkProjectExists = async (projectId: string): Promise<boolean> => {
  try {
    const projectDocRef = doc(db, "projects", projectId);
    const projectSnapshot = await getDoc(projectDocRef);

    return projectSnapshot.exists();
  } catch (error) {
    console.error("Error checking project existence:", error);
    throw new Error("Failed to check if the project exists.");
  }
};

/**
 * Saves a new project to Firestore, uploading images and generating a new project ID.
 * @param projectData - The project data to save.
 * @returns {Promise<{ projectId: string } | null>} - An object with projectId if successful, otherwise null.
 */
const saveNewProjectToFirestore = async (
  projectData: ProjectData
): Promise<{ projectId: string } | null> => {
  try {
    const now = new Date();
    const projectRef = doc(collection(db, "projects"));
    const projectId = projectRef.id;

    let logoURL: string | null = null;
    if (projectData.logo instanceof File) {
      logoURL = await uploadImageAndGetURL(projectData.logo, projectId, "logo");
    }

    let coverURL: string | null = null;
    if (projectData.cover instanceof File) {
      coverURL = await uploadImageAndGetURL(projectData.cover, projectId, "cover");
    }

    const projectDataToSave = {
      ...projectData,
      logo: logoURL ?? (projectData.logo as string),
      cover: coverURL ?? (projectData.cover as string),
      createdAt: now,
      updatedAt: now
    };

    await setDoc(projectRef, projectDataToSave);
    console.log("Document written with ID: ", projectId);
    
    return { projectId };
  } catch (error: any) {
    console.error("Error adding document: ", error.message || "An unknown error occurred while saving the project.");
    return null;
  }
};

/**
 * Updates the conversion points based on the specified action.
 * - If action is "add" and a valid conversion point is provided, it adds the point to the list.
 * - If action is "remove" and a valid conversion point ID is provided, it removes the point from the list.
 *
 * @param action - Specifies whether to add or remove a conversion point ("add" | "remove").
 * @param point - The conversion point object to be added or removed (optional).
 * @param setConversionPoints - State updater function for conversion points.
 */
export const handleUpdateConversionPoints = (
  action: "add" | "remove",
  point: ConversionPoint | undefined,
  setConversionPoints: Dispatch<SetStateAction<ConversionPoint[]>>
) => {
  setConversionPoints(prevPoints => {
    if (action === "add" && point) return [...prevPoints, point];
    if (action === "remove" && point?.id) return prevPoints.filter(p => p.id !== point.id);
    return prevPoints;
  });
};

/**
 * Toggles the `isActive` state of a specific conversion point by ID within the project data.
 * Updates the conversion points array with the toggled value.
 *
 * @param id - The ID of the conversion point to toggle.
 * @param setProjectData - State updater function for the entire project data.
 */
export const toggleConversionPointActiveState = (
  id: string,
  setProjectData: Dispatch<SetStateAction<ProjectData>>
) => {
  setProjectData(prevData => ({
    ...prevData,
    conversionPoints: prevData.conversionPoints.map(point =>
      point.id === id ? { ...point, isActive: !point.isActive } : point
    )
  }));
};

/**
 * Creates a generic event handler for updating nested state fields with dot notation.
 * - Supports numeric parsing and validation for fields like `rewardAmount` and `percentage`.
 *
 * @param setState - Function to update the state (e.g., `setProjectData`).
 * @returns A function that generates handlers for specific fields.
 */
export const createHandleChange = (
  setState: React.Dispatch<React.SetStateAction<ProjectData>>
) => (
  field: string, 
  isNumeric?: boolean, 
  isFloat?: boolean
) => 
  (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    let value: any;
    const keys = field.split(".");

    // Parse and validate numeric input if specified
    if (isNumeric) {
      value = isFloat ? parseFloat(event.target.value) : parseInt(event.target.value, 10);
      if (isFloat && !isNaN(value)) value = Math.round(value * 10) / 10; // Limit to one decimal place
      if (isNaN(value)) value = 0;  // Default to 0 if parsing fails

      // Specific validation rules for certain fields
      if (keys.includes("rewardAmount") && (value < 1 || value > 10000)) {
        toast.error("Value must be between 1 and 10000.");
        return;
      } else if (keys.includes("percentage") && (value < 0.1 || value > 100)) {
        toast.error("Percentage must be between 0.1 and 100.");
        return;
      }
    } else {
      value = event.target.value;  // Default to string for non-numeric fields
    }

    // Update project state with new value, handling nested properties
    setState(prev => {
      if (!prev) return prev;
      let updated = { ...prev } as any;
      let item = updated;

      // Traverse through keys to reach the nested property
      for (let i = 0; i < keys.length - 1; i++) {
        if (!item[keys[i]]) item[keys[i]] = {};  // Initialize nested object if missing
        item = item[keys[i]];
      }

      // Update the final key with the new value
      item[keys[keys.length - 1]] = value;
      return updated;
    });
  };

/**
 * Returns a handler function that updates the `ownerAddresses` field in the project data state.
 * - Replaces the existing owner addresses with the provided list of new addresses.
 * - Utilizes the provided `setProjectData` function to update state.
 *
 * @param setProjectData - The state setter function for `projectData`.
 * @returns A function that takes an array of new owner addresses and updates the state.
 */
export const createHandleOwnerChange = (
  setProjectData: React.Dispatch<React.SetStateAction<ProjectData>>
) => (newOwnerAddresses: string[]) => {
  setProjectData(prevData =>
    prevData ? { ...prevData, ownerAddresses: newOwnerAddresses } : prevData
  );
};

/**
 * Creates a function to handle image selection, updating both preview and project data.
 * - Dynamically sets the image preview and updates project data state.
 *
 * @param setPreviewData - Function to update the preview state (e.g., `setPreviewData`).
 * @param setProjectData - Function to update the project data state (e.g., `setProjectData`).
 * @returns A function that accepts an ImageType and returns an event handler for managing file input changes.
 */
export const createHandleImageChange = (
  setPreviewData: React.Dispatch<React.SetStateAction<PreviewData>>,
  setProjectData: React.Dispatch<React.SetStateAction<ProjectData>>
) => (type: ImageType, index?: number) => 
  (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        setPreviewData(prev => ({ ...prev, [`${type}Preview`]: reader.result as string }));
        setProjectData(prev => prev ? { ...prev, [type]: file } : prev);
      };

      reader.readAsDataURL(file);
    }
  };

/**
 * Returns a function to remove a selected image from both preview and project data.
 * - Clears the preview data and sets the project data field to null.
 *
 * @param setPreviewData - Function to update the preview state (e.g., clears the preview image).
 * @param setProjectData - Function to update the project data (e.g., sets the image field to null).
 * @param type - The type of image being removed (e.g., "logo" or "cover").
 * @param index - Optional index for cases where multiple images might be handled.
 * @returns A function that, when invoked, removes the specified image.
 */
export const createRemoveImage = (
  setPreviewData: React.Dispatch<React.SetStateAction<PreviewData>>,
  setProjectData: React.Dispatch<React.SetStateAction<ProjectData>>,
  type: ImageType,
  index?: number
) => () => {
  // Update the preview to show no image and set the project data field to null
  setPreviewData(prev => ({ ...prev, [`${type}Preview`]: "" }));
  setProjectData(prev => prev ? { ...prev, [type]: null } : prev);
};

/**
 * Saves the project data to Firestore, generates an API key, and handles redirection on success.
 * Includes validation checks and error handling for each required field.
 *
 * @param projectData - The project data to be saved.
 * @param selectedChainId - The ID of the selected blockchain chain.
 * @param conversionPoints - An array of conversion points.
 * @param isReferralEnabled - Flag indicating if the referral feature is enabled.
 * @param socialLinkFormError - Boolean indicating if there are errors in social links.
 * @param tokenError - Boolean indicating if there are errors in token selection.
 * @param redirectLinkError - Boolean indicating if there's an error in the redirect link.
 * @param setIsSaving - Function to update the saving state.
 * @param setIsSaved - Function to mark the project as saved.
 * @param router - Next.js router instance for navigation.
 * @returns {Promise<boolean>} - Returns true if the project was saved successfully, otherwise false.
 */
export const saveProject = async (
  projectData: ProjectData,
  selectedChainId: number,
  conversionPoints: ConversionPoint[],
  isReferralEnabled: boolean,
  socialLinkFormError: boolean,
  tokenError: boolean,
  redirectLinkError: boolean,
  setIsSaving: (saving: boolean) => void,
  setIsSaved: (saved: boolean) => void,
  router: AppRouterInstance
): Promise<boolean> => {
  // Run validation checks before saving
  const isValid = validateProjectData(
    projectData,
    socialLinkFormError,
    true,
    tokenError,
    conversionPoints,
    redirectLinkError
  );

  if (!isValid) return false;

  setIsSaving(true);

  const updatedProjectData: ProjectData = {
    ...projectData,
    selectedChainId,
    isReferralEnabled,
    conversionPoints: conversionPoints.map((point, index) => ({
      ...point,
      isActive: index === 0 ? true : point.isActive,
    })),
  };

  const result = await saveNewProjectToFirestore(updatedProjectData);
  if (!result) {
    toast.error("Failed to save project. Please try again.");
    setIsSaving(false);
    return false;
  }

  const { projectId } = result;
  const apiKey = await saveApiKeyToFirestore(projectId);
  if (!apiKey) {
    toast.error("Failed to generate API key. Please try again.");
    setIsSaving(false);
    await deleteProjectFromFirebase(projectId);
    return false;
  }

  setIsSaving(false);
  setIsSaved(true);

  toast.success("Project saved successfully! Redirecting to the dashboard...", {
    onClose: () => router.push(`/projects/${projectId}`)
  });

  return true;
};

/**
 * Updates the project data in Firestore and updates local states with new data.
 *
 * @param projectId - The ID of the project to update.
 * @param projectData - The project data to be saved.
 * @param setIsUpdating - State updater function to manage update status.
 * @param setProjectData - State updater function to update the current project data.
 * @param setInitialProjectData - State updater function to update the initial project data.
 * @param setPreviewData - State updater function for updating preview images.
 * @param socialLinkFormError - Boolean indicating errors in social links form.
 * @returns {Promise<void>}
 */
export const updateProject = async (
  projectId: string,
  projectData: ProjectData,
  setIsUpdating: Dispatch<SetStateAction<boolean>>,
  setProjectData: Dispatch<SetStateAction<ProjectData>>,
  setInitialProjectData: Dispatch<SetStateAction<ProjectData>>,
  setPreviewData: Dispatch<SetStateAction<PreviewData>>,
  socialLinkFormError: boolean
): Promise<void> => {
  // Run validation checks before updating
  const isValid = validateProjectData(
    projectData,
    socialLinkFormError,
    false
  );

  if (!isValid) return;

  setIsUpdating(true);

  try {
    const updatedData = await updateProjectInFirestore(projectId, projectData);

    if (updatedData) {
      setProjectData(updatedData);
      setInitialProjectData(updatedData);

      setPreviewData({
        logoPreview: typeof updatedData.logo === "string" ? updatedData.logo : "",
        coverPreview: typeof updatedData.cover === "string" ? updatedData.cover : "",
      });

      toast.success("Project updated successfully!");
    }
  } catch (error: any) {
    console.error("Failed to save changes:", error);
    toast.error("Failed to save changes: " + error.message);
  } finally {
    setIsUpdating(false);
  }
};

/**
 * Deletes a project from Firestore and handles navigation and state updates.
 *
 * @param projectId - The ID of the project to delete.
 * @param router - Next.js router instance for navigation after deletion.
 * @param setIsDeleting - Function to set the deleting state.
 * @param setDeleteInput - Function to reset the delete input field after deletion.
 */
export const deleteProject = async (
  projectId: string,
  router: AppRouterInstance,
  setIsDeleting: (isDeleting: boolean) => void,
  setDeleteInput: (input: string) => void
): Promise<void> => {
  if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
    setDeleteInput(""); // Reset input if deletion is canceled
    return;
  }

  try {
    setIsDeleting(true);
    await deleteProjectFromFirebase(projectId);
    toast.success("The project was deleted successfully.");
    router.push("/projects");
  } catch (error) {
    console.error("Failed to delete project:", error);
    toast.error("Deletion failed, please try again later.");
  } finally {
    setIsDeleting(false);
    setDeleteInput(""); // Reset input after successful deletion
  }
};