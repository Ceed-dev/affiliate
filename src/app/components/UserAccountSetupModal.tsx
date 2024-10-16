import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AffiliateInfo, UserRole } from "../types";
import { generateXAuthUrl } from "../utils/xApiUtils";
import { generateGoogleAuthUrl } from "../utils/googleApiUtils";
import { API_ENDPOINTS } from "../constants/xApiConstants";

type UserAccountSetupModalProps = {
  isOpen: boolean;                   // Indicates whether the modal is open or not
  onClose: () => void;               // Function to close the modal
  onSave: (info: AffiliateInfo) => void;  // Function to save the affiliate information
  disableRoleSelection?: boolean;    // Option to disable role selection (default: false)
};

export const UserAccountSetupModal: React.FC<UserAccountSetupModalProps> = ({
  isOpen,
  onClose,
  onSave,
  disableRoleSelection = false,
}) => {
  const searchParams = useSearchParams();  // Used to fetch query parameters from the URL

  // State variables for form fields and data management
  const [username, setUsername] = useState<string>("");      // Stores the user's input for username
  const [email, setEmail] = useState<string>("");            // Stores the user's input for email
  const [role, setRole] = useState<UserRole>("ProjectOwner"); // Manages selected user role
  const [projectUrl, setProjectUrl] = useState<string>("");  // Project URL input for ProjectOwner role
  const [isSaveEnabled, setIsSaveEnabled] = useState(false); // Enables save button when inputs are valid

  // State variables for X API authentication and user data
  const [xAuthTokenData, setXAuthTokenData] = useState<any>(null);  // Stores X API authentication token data
  const [xUserData, setXUserData] = useState<any>(null);            // Stores X user profile data
  const [isXApiLoading, setIsXApiLoading] = useState<boolean>(false); // Manages loading state during API calls

  // State variables for Google API authentication and user data
  const [googleAuthTokenData, setGoogleAuthTokenData] = useState<any>(null);  // Stores Google API authentication token data
  const [googleUserData, setGoogleUserData] = useState<any>(null);            // Stores Google user profile data
  const [isGoogleApiLoading, setIsGoogleApiLoading] = useState<boolean>(false); // Manages loading state during API calls

  // Load data from localStorage when the modal is opened
  useEffect(() => {
    if (isOpen) {
      loadLocalStorageData();  // Function to load data from localStorage
    }
  }, [isOpen]);

  // Validate input fields when modal is open or form data changes
  useEffect(() => {
    if (isOpen) {
      setIsSaveEnabled(validateInputs());  // Function to validate the user inputs
    }
  }, [username, email, role, projectUrl, isOpen]);

  // Loads user input and API data from localStorage
  const loadLocalStorageData = () => {
    setUsername(localStorage.getItem("username") || "");     // Load stored username
    setEmail(localStorage.getItem("email") || "");           // Load stored email
    setRole((localStorage.getItem("role") as UserRole) || "ProjectOwner"); // Load user role
    setProjectUrl(localStorage.getItem("projectUrl") || ""); // Load project URL if applicable

    // Load X API authentication token data if available
    const storedXAuthTokenData = localStorage.getItem("xAuthTokenData");
    if (storedXAuthTokenData) {
      try {
        setXAuthTokenData(JSON.parse(storedXAuthTokenData));  // Parse and store token data
      } catch (error) {
        console.error("Failed to parse X auth token data from localStorage:", error);
      }
    }

    // Load X user data if available
    const storedXUserData = localStorage.getItem("xUserData");
    if (storedXUserData) {
      try {
        setXUserData(JSON.parse(storedXUserData));  // Parse and store user data
      } catch (error) {
        console.log("Failed to parse X user data from localStorage:", error);
      }
    }
  };

  // Sync user input changes to localStorage when the modal is open
  useEffect(() => {
    if (isOpen) localStorage.setItem("username", username);  // Store username in localStorage
  }, [username, isOpen]);

  useEffect(() => {
    if (isOpen) localStorage.setItem("email", email);        // Store email in localStorage
  }, [email, isOpen]);

  useEffect(() => {
    if (isOpen) localStorage.setItem("role", role);          // Store role in localStorage
  }, [role, isOpen]);

  useEffect(() => {
    if (isOpen) localStorage.setItem("projectUrl", projectUrl); // Store project URL in localStorage
  }, [projectUrl, isOpen]);

  // Validates user inputs (username, email, role, and project URL)
  const validateInputs = () => {
    return (
      validateUsername(username) &&
      validateEmail(email) &&
      validateRole(role) &&
      (role !== "ProjectOwner" || validateUrl(projectUrl)) // Only validate project URL for ProjectOwner
    );
  };

  // OAuth access token fetching from the X API after the user is redirected back
  useEffect(() => {
    const fetchAuthData = async () => {
      setIsXApiLoading(true);  // Set loading state during API call
      const code = searchParams.get("code");
      const state = searchParams.get("state");

      // Validate presence of code and state parameter
      if (!code || state !== (process.env.NEXT_PUBLIC_X_API_OAUTH_STATE as string)) {
        console.error("Missing necessary parameters or invalid state.");
        setIsXApiLoading(false);
        return;
      }

      try {
        // Fetch the OAuth token from the X API using the authorization code
        const response = await fetch(API_ENDPOINTS.AUTH(code, state));
        const data = await response.json();

        // If access token is received, store it in state and localStorage
        if (data.access_token) {
          setXAuthTokenData(data);
          localStorage.setItem("xAuthTokenData", JSON.stringify(data));
          console.log("X Account connected successfully");
        }
      } catch (error) {
        console.error("Error fetching access token:", error);
      } finally {
        setIsXApiLoading(false);  // Reset loading state
      }
    };

    fetchAuthData();  // Trigger OAuth token fetching
  }, [searchParams]);

  // Fetch X user profile data using the access token
  useEffect(() => {
    if (!xAuthTokenData) return;  // Exit if token data is not available

    const fetchUserData = async (tokenData: any) => {
      setIsXApiLoading(true);  // Set loading state during API call
      try {
        // Fetch X user data from the backend API
        const response = await fetch(API_ENDPOINTS.USER(tokenData));
        const userData = await response.json();

        // If user data is received, store it in state and localStorage
        if (userData.user) {
          setXUserData(userData.user);
          localStorage.setItem("xUserData", JSON.stringify(userData.user));
          console.log("X user data fetched successfully");
        } else {
          console.error("Failed to fetch user data.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsXApiLoading(false);  // Reset loading state
      }
    };

    // Fetch user data after receiving the authentication token
    fetchUserData(xAuthTokenData);
  }, [xAuthTokenData]);

  // Validate username input
  const validateUsername = (username: string) => {
    return username.trim().length > 0;  // Ensure username is not empty
  };

  // Validate email input using regex
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;  // Standard email format validation
    return emailRegex.test(email);
  };

  // Validate project URL input (if applicable)
  const validateUrl = (url: string) => {
    try {
      new URL(url);  // Check if the URL is valid
      return true;
    } catch {
      return false;
    }
  };

  // Validate user role (either ProjectOwner or Affiliate)
  const validateRole = (role: UserRole) => {
    return role === "ProjectOwner" || role === "Affiliate";
  };

  // Handle save action: gathers user data and calls the onSave callback
  const handleSave = () => {
    const userInfo: AffiliateInfo = {
      username,
      email,
      role,
    };

    // If the user is a ProjectOwner, include the project URL
    if (role === "ProjectOwner" && projectUrl) {
      userInfo.projectUrl = projectUrl;
    }

    // If the user connected their X account, include token and account info
    if (xAuthTokenData && xUserData) {
      userInfo.xAuthToken = xAuthTokenData;
      userInfo.xAccountInfo = xUserData;
    }

    // Call onSave with the constructed user information
    onSave(userInfo);

    // Clear local storage after saving the data
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("projectUrl");
    localStorage.removeItem("xAuthTokenData");
    localStorage.removeItem("xUserData");
  };

  if (!isOpen) return null;  // Do not render the modal if it's not open

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4">User Information</h2>
        <p className="text-sm text-gray-600 mb-4">
          Please provide your username, email address, and select your role to complete your registration.
          {role === "ProjectOwner" && " As a Project Owner, you also need to provide your project URL."}
        </p>
        <div className="flex flex-col gap-5">
          {/* Username Input Field */}
          <div className="flex flex-col gap-2">
            <label className="block mb-1 font-semibold">Username <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border border-[#D1D5DB] rounded-lg text-sm outline-none"
              placeholder="qube1234"
            />
          </div>

          {/* Email Input Field */}
          <div className="flex flex-col gap-2">
            <label className="block mb-1 font-semibold">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-[#D1D5DB] rounded-lg text-sm outline-none"
              placeholder="official@ceed.cloud"
            />
          </div>

          {/* Role Selection Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="block mb-1 font-semibold">Role <span className="text-red-500">*</span></label>
            {disableRoleSelection && (
              <p className="text-sm text-gray-500">
                You are automatically assigned the role of &quot;Ad publisher&quot; because you are a team member of a project.
              </p>
            )}
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className={`w-full p-2 border border-[#D1D5DB] rounded-lg text-sm outline-none ${disableRoleSelection ? "bg-slate-100" : ""}`}
              disabled={disableRoleSelection}
            >
              <option value="ProjectOwner">Ad publisher</option>
              <option value="Affiliate">Affiliater</option>
            </select>
          </div>

          {/* Project URL Input Field for ProjectOwner */}
          {role === "ProjectOwner" && (
            <div className="flex flex-col gap-2">
              <label className="block mb-1 font-semibold">Project URL <span className="text-red-500">*</span></label>
              <input
                type="url"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                className="w-full p-2 border border-[#D1D5DB] rounded-lg text-sm outline-none"
                placeholder="https://yourproject.com"
              />
            </div>
          )}

          {/* X Account Connect Button */}
          {role === "Affiliate" && (
            <div className="flex flex-col gap-2">
              <label className="block mb-1 font-semibold">
                X Account <span className="text-gray-500 text-xs">(optional)</span>
              </label>

              {isXApiLoading ? (
                <div className="flex justify-center items-center gap-2 text-sm text-gray-600">
                  <Image
                    src="/assets/common/loading.png"
                    alt="loading"
                    width={30}
                    height={30}
                    className="animate-spin"
                  />
                  Loading...
                </div>
              ) : xUserData ? (
                <div className="flex items-center gap-2">
                  <Image
                    src={xUserData.profile_image_url}
                    alt={xUserData.name}
                    width={30}
                    height={30}
                    className="rounded-full"
                  />
                  <a
                    href={`https://x.com/${xUserData.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 text-sm hover:underline"
                  >
                    @{xUserData.username}
                  </a>
                </div>
              ) : (
                <button
                  onClick={async () => {
                    try {
                      const authUrl = await generateXAuthUrl();
                      window.location.href = authUrl;
                    } catch (error) {
                      console.error("Failed to generate X auth URL", error);
                    }
                  }}
                  className="w-full p-2 bg-black text-white rounded-lg text-sm outline-none flex items-center justify-center gap-2 hover:bg-gray-600"
                >
                  <Image
                    src="/brand-assets/x/white.png"
                    alt="X Logo"
                    width={20}
                    height={20}
                  />
                  Connect X Account
                </button>
              )}
            </div>
          )}

          {/* Google Account Connect Button */}
          {role === "Affiliate" && (
            <div className="flex flex-col gap-2">
              <label className="block mb-1 font-semibold">
                Google Account <span className="text-gray-500 text-xs">(optional)</span>
              </label>

              {isGoogleApiLoading ? (
                <div className="flex justify-center items-center gap-2 text-sm text-gray-600">
                  <Image
                    src="/assets/common/loading.png"
                    alt="loading"
                    width={30}
                    height={30}
                    className="animate-spin"
                  />
                  Loading...
                </div>
              ) : googleUserData ? (
                <div className="flex items-center gap-2">
                  <Image
                    src={googleUserData.picture}
                    alt={googleUserData.name}
                    width={30}
                    height={30}
                    className="rounded-full"
                  />
                  <a
                    href={`https://myaccount.google.com/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 text-sm hover:underline"
                  >
                    {googleUserData.name}
                  </a>
                </div>
              ) : (
                <button
                  onClick={async () => {
                    try {
                      const authUrl = await generateGoogleAuthUrl();
                      if (authUrl) {
                        window.location.href = authUrl;
                      } else {
                        console.error("Failed to generate Google auth URL. The URL is undefined.");
                      }
                    } catch (error) {
                      console.error("Failed to generate Google auth URL", error);
                    }
                  }}
                  className="w-full p-2 bg-sky-400 hover:bg-sky-500 text-white rounded-lg text-sm outline-none flex items-center justify-center gap-2"
                >
                  <Image
                    src="/brand-assets/google.png"
                    alt="Google Logo"
                    width={20}
                    height={20}
                  />
                  Connect Google Account
                </button>
              )}
            </div>
          )}
        </div>

        {/* Save and Cancel Buttons */}
        <div className="flex justify-end space-x-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-400 hover:bg-gray-500 hover:shadow-lg text-white rounded-lg">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`px-4 py-2 rounded-lg text-white ${isSaveEnabled ? "bg-blue-400 hover:bg-blue-500 hover:shadow-lg" : "bg-gray-300 cursor-not-allowed"}`}
            disabled={!isSaveEnabled}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};