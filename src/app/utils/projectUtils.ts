import { Dispatch, SetStateAction } from "react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { toast } from "react-toastify";
import { doc, collection, getDoc, getDocs, setDoc, updateDoc, query, where, Timestamp, Query, CollectionReference, DocumentData } from "firebase/firestore";
import { db } from "./firebase/firebaseConfig";
import { saveApiKeyToFirestore, updateProjectInFirestore, deleteProjectFromFirebase } from "./firebase";
import { uploadImageAndGetURL } from "./firebase/uploadImageAndGetURL";
import { isValidProjectData, validateProjectData } from "./validationUtils";
import { ProjectData, ImageType, PreviewData, ConversionPoint, ExternalCampaign } from "../types";
import { CampaignData } from "../types/campaign";

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
 * Updates the external campaign mappings based on the specified action.
 * - If action is "add" and a valid external campaign is provided, it adds the campaign to the list.
 * - If action is "remove" and a valid campaign ID is provided, it removes the campaign from the list.
 *
 * @param action - Specifies whether to add or remove an external campaign ("add" | "remove").
 * @param point - The external campaign object to be added or removed (optional).
 * @param setExternalCampaigns - State updater function for external campaigns.
 */
export const handleUpdateExternalCampaigns = (
  action: "add" | "remove",
  point: ExternalCampaign | undefined,
  setExternalCampaigns: Dispatch<SetStateAction<ExternalCampaign[]>>
) => {
  setExternalCampaigns(prevPoints => {
    if (action === "add" && point) return [...prevPoints, point];
    if (action === "remove" && point?.campaignId) return prevPoints.filter(p => p.campaignId !== point.campaignId);
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
      // NOTE: The `rewardAmount` validation logic below is no longer applied.
      // As of Release v3.2.9, the handling and validation of `rewardAmount` has been moved to a separate logic 
      // using a dedicated temporary state variable for string-based input handling. This code remains for reference
      // but will not affect the current behavior.
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
 * @param externalCampaigns - List of external campaigns associated with the project.
 *                             This allows linking the project with campaigns from external ASPs like A8.net.
 *                             Each campaign includes the ASP name, campaign ID, and an optional label.
 * @param audienceCountries - Array of selected audience countries.
 * @param isReferralEnabled - Flag indicating if the referral feature is enabled.
 * @param isUsingXpReward - Flag indicating if XP points are used as the reward.
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
  externalCampaigns: ExternalCampaign[],
  audienceCountries: string[],
  isReferralEnabled: boolean,
  isUsingXpReward: boolean,
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
    redirectLinkError,
    audienceCountries,
    isUsingXpReward,
  );

  if (!isValid) return false;

  setIsSaving(true);

  const updatedProjectData: ProjectData = {
    ...projectData,
    selectedToken: {
      chainId: selectedChainId,
      address: projectData.selectedToken.address,
      symbol: projectData.selectedToken.symbol,
    },
    isReferralEnabled,
    isUsingXpReward,
    conversionPoints: conversionPoints.map((point, index) => ({
      ...point,
      isActive: index === 0 ? true : point.isActive,
    })),
    externalCampaigns,
    targeting: {
      audienceCountries,
    },
    capiVersion: "v2",
    aggregatedStats: {
      ASP: {
        clickStats: {
          total: 0,
          byCountry: {},
          byDay: {},
          byMonth: {},
          timestamps: {
            firstClickAt: null,
            lastClickAt: null,
          },
        },
        conversionStats: {
          total: 0,
          byConversionPoint: {},
          byCountry: {},
          byDay: {},
          byMonth: {},
          timestamps: {
            firstConversionAt: null,
            lastConversionAt: null,
          },
        },
        rewardStats: {
          byRewardUnit: {},
          isPaid: { paidCount: 0, unpaidCount: 0 },
          timestamps: {
            firstPaidAt: null,
            lastPaidAt: null,
          },
        },
      },
      INDIVIDUAL: {
        clickStats: {
          total: 0,
          byCountry: {},
          byDay: {},
          byMonth: {},
          timestamps: {
            firstClickAt: null,
            lastClickAt: null,
          },
        },
        conversionStats: {
          total: 0,
          byConversionPoint: {},
          byCountry: {},
          byDay: {},
          byMonth: {},
          timestamps: {
            firstConversionAt: null,
            lastConversionAt: null,
          },
        },
        rewardStats: {
          byRewardUnit: {},
          isPaid: { paidCount: 0, unpaidCount: 0 },
          timestamps: {
            firstPaidAt: null,
            lastPaidAt: null,
          },
        },
      },
    },
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

async function fetchCampaignAsProjectLike(): Promise<ProjectData> {
  const campaignRef = doc(db, "campaigns", "7N9BtaMllIzUwjxZUujQ");
  const campaignSnap = await getDoc(campaignRef);

  const campaign = campaignSnap.data() as CampaignData;

  const projectLike: ProjectData = {
    id: campaignSnap.id,
    projectName: campaign.name,
    description: campaign.description,
    selectedToken: {
      chainId: campaign.rewards.default.chainId!,
      address: campaign.rewards.default.tokenAddress!,
      symbol: campaign.rewards.default.unit,
    },
    logo: campaign.images.logo,
    cover: campaign.images.cover,
    websiteUrl: campaign.urls.website,
    xUrl: campaign.urls.x,
    discordUrl: campaign.urls.discord ?? "",
    ownerAddresses: Object.keys(campaign.members),
    createdAt: campaign.timestamps.createdAt,
    updatedAt: campaign.timestamps.updatedAt,
    redirectUrl: campaign.urls.redirect,
    totalPaidOut: 0,
    lastPaymentDate: null,
    isReferralEnabled: false,
    isVisibleOnMarketplace: campaign.settings.isVisibleOnMarketplace,
    isUsingXpReward: false,
    conversionPoints: campaign.conversionPoints.map((point) => ({
      id: point.id,
      title: point.title,
      paymentType: "FixedAmount",
      rewardAmount: point.rewardDetails.amount,
      isActive: point.isActive,
    })) as ConversionPoint[],
    externalCampaigns: [],
    targeting: campaign.targeting,
    capiVersion: campaign.settings.capiVersion,
    aggregatedStats: campaign.aggregatedStats,
  };

  return projectLike;
}

/**
 * Fetches and formats project data from Firestore.
 * This function can fetch a single project, all projects, or projects filtered by owner address.
 * It also supports executing a callback for each fetched project.
 *
 * Usage Examples:
 *
 * // 1. Fetch a single project by ID
 * const project = await fetchProjects({ projectId: "exampleProjectId" });
 * console.log(project);
 *
 * // 2. Fetch all projects
 * const allProjects = await fetchProjects();
 * console.log(allProjects);
 *
 * // 3. Fetch projects by owner address
 * const ownerProjects = await fetchProjects({ ownerAddress: "0xOwnerAddress" });
 * console.log(ownerProjects);
 *
 * // 4. Execute a callback for each fetched project
 * const allProjects = await fetchProjects({
 *   onEachProject: (project) => {
 *     console.log(`Processing project: ${project.title}`);
 *   },
 * });
 *
 * @param options - Options to customize the query
 * @returns {Promise<ProjectData[]>} - Array of formatted project data objects
 */
export async function fetchProjects(options: {
  projectId?: string; // Fetch a single project by ID
  ownerAddress?: string; // Filter projects by owner address
  audienceCountry?: string; // Filter projects by audience country
  joinedProjectIds?: string[]; // Include these project IDs even if they don't match other filters
  onEachProject?: (project: ProjectData) => void; // Callback for each project
} = {}): Promise<ProjectData[]> {
  const { projectId, ownerAddress, audienceCountry, joinedProjectIds, onEachProject } = options;

  if (projectId === "7N9BtaMllIzUwjxZUujQ") {
    const campaignProject = await fetchCampaignAsProjectLike();
    return [campaignProject];
  }

  try {
    let querySnapshot;
    let docSnap;

    if (projectId) {
      // Fetch a single project by ID
      const docRef = doc(db, "projects", projectId);
      docSnap = await getDoc(docRef);

      if (!docSnap.exists() || !isValidProjectData(docSnap.data())) {
        throw new Error("No such project or data validation failed");
      }
    } else {
      // Construct the Firestore query
      const projectCollection = collection(db, "projects") as CollectionReference<DocumentData>;
      let q: Query<DocumentData> = projectCollection;

      // Add ownerAddress filter if provided
      if (ownerAddress) {
        q = query(q, where("ownerAddresses", "array-contains", ownerAddress));
      }

      // Add audienceCountry filter if provided
      if (audienceCountry) {
        q = query(q, where("targeting.audienceCountries", "array-contains", audienceCountry));
      }

      querySnapshot = await getDocs(q);
    }

    const projects: ProjectData[] = [];
    const projectIds = new Set<string>();

    const processDoc = (docData: any, docId: string) => {
      const convertTimestamp = (timestamp?: Timestamp | null) => timestamp?.toDate() || null;

      const projectData: ProjectData = {
        ...docData,
        id: docId,
        createdAt: convertTimestamp(docData.createdAt),
        updatedAt: convertTimestamp(docData.updatedAt),
        lastPaymentDate: convertTimestamp(docData.lastPaymentDate),
      };

      onEachProject?.(projectData);
      return projectData;
    };

    if (docSnap) {
      // Handle single document case
      const data = docSnap.data();
      projects.push(processDoc(data, docSnap.id));
    } else if (querySnapshot) {
      // Handle multiple documents case
      querySnapshot.forEach((doc) => {
        const data = doc.data();

        // Check if project data is valid and visible on the marketplace
        // If ownerAddress is provided, ignore isVisibleOnMarketplace
        if (
          isValidProjectData(data) &&
          (ownerAddress || data.isVisibleOnMarketplace)
        ) {
          projects.push(processDoc(data, doc.id));
          projectIds.add(doc.id);
        }
      });
    }

    // Add joinedProjectIds that are not already in the project list
    if (joinedProjectIds && joinedProjectIds.length > 0) {
      const missingProjectIds = joinedProjectIds.filter((id) => !projectIds.has(id));

      for (const projectId of missingProjectIds) {
        const docRef = doc(db, "projects", projectId);
        const projectDoc = await getDoc(docRef);

        if (projectDoc.exists() && isValidProjectData(projectDoc.data())) {
          projects.push(processDoc(projectDoc.data(), projectDoc.id));
        }
      }
    }

    // TODO: Fix later
    if (
      ownerAddress === "0x329980D088Ba66B3d459AE3d396a722437801689" || // Shungo
      ownerAddress === "0x6e0aDF01ac5D52536ae9AB34368Cc646171DBEc1" || // Badhan
      ownerAddress === "0x5355251E37Aa7a617b95E94A3bef0a04272fe564" // Boxing Star's Owner
    ) {
      const campaignProject = await fetchCampaignAsProjectLike();
      projects.push(campaignProject);
    }

    return projects;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw new Error("Failed to fetch projects");
  }
}

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

/**
 * Fetches the visibility state of a project from Firestore.
 * 
 * @param projectId - The ID of the project to fetch visibility state for.
 * @returns {Promise<boolean>} - The visibility state of the project on the marketplace.
 */
export const fetchProjectVisibility = async (projectId: string): Promise<boolean> => {
  try {
    const projectRef = doc(db, "projects", projectId);
    const projectSnapshot = await getDoc(projectRef);

    if (!projectSnapshot.exists()) {
      throw new Error(`Project with ID ${projectId} not found.`);
    }

    const projectData = projectSnapshot.data();
    if (typeof projectData.isVisibleOnMarketplace !== "boolean") {
      throw new Error("Visibility field is missing or invalid in project data.");
    }

    return projectData.isVisibleOnMarketplace;
  } catch (error) {
    console.error("Error fetching project visibility:", error);
    throw error;
  }
};

/**
 * Updates the visibility of a project on the marketplace.
 *
 * @param projectId - The ID of the project to update.
 * @param isVisible - The new visibility state to set (true for visible, false for hidden).
 * @returns {Promise<void>} - Resolves when the update is successful, rejects with an error otherwise.
 */
export const updateProjectVisibility = async (projectId: string, isVisible: boolean): Promise<void> => {
  try {
    const projectDocRef = doc(db, "projects", projectId);
    await updateDoc(projectDocRef, { isVisibleOnMarketplace: isVisible });
    console.log(`Project ${projectId} visibility updated to: ${isVisible ? "Visible" : "Hidden"}`);
  } catch (error) {
    console.error(`Error updating visibility for project ${projectId}:`, error);
    throw new Error("Failed to update project visibility.");
  }
};
