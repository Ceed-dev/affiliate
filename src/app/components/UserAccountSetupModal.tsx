import { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useActiveWallet } from "thirdweb/react";
import { AffiliateInfo, UserRole } from "../types";
import { GoogleAuthToken, YouTubeAccountInfo } from "../types/affiliateInfo";
import { generateXAuthUrl } from "../utils/xApiUtils";
import { generateGoogleAuthUrl, getGoogleTokens, getYouTubeAccountInfo } from "../utils/googleApiUtils";
import { API_ENDPOINTS } from "../constants/xApiConstants";

type RoleSelectButtonProps = {
  label: string;                // Display text for the button (e.g., "Publisher" or "Influencer")
  roleValue: UserRole;            // The value of the role associated with this button (e.g., "ProjectOwner" or "Affiliate")
  selectedRole: string;         // Currently selected role to determine if this button is active
  setRole: Dispatch<SetStateAction<UserRole>>;  // Function to update the selected role
  disableRoleSelection: boolean;   // Option to disable role selection (default is false)
};

/**
 * RoleSelectButton Component
 * 
 * This component displays a selectable button for user roles. When clicked, it sets the selected role.
 * The button includes a checkmark icon when active, and is customizable based on selection state.
 */
const RoleSelectButton: React.FC<RoleSelectButtonProps> = ({
  label,
  roleValue,
  selectedRole,
  setRole,
  disableRoleSelection,
}) => {
  // Determine if this button represents the currently selected role
  const isSelected = selectedRole === roleValue;

  return (
    <button
      onClick={() => setRole(roleValue)}
      className={`w-full h-full py-2 px-3 flex items-center gap-3 rounded-xl text-sm font-medium cursor-pointer focus:outline-none bg-[#F5F5F5] ${
        isSelected && "border-2 border-black"
      } ${disableRoleSelection && "cursor-not-allowed opacity-50"}`}
      disabled={disableRoleSelection}
    >
      {/* Selection Indicator */}
      <div
        className={`flex-none w-5 h-5 rounded-full flex items-center justify-center ${
          isSelected ? "bg-black" : "border-2 border-black"
        } ${disableRoleSelection && "opacity-50"}`}
      >
        {isSelected && (
          <Image
            src="/assets/common/check-white.png"
            width={15}
            height={15}
            alt="check"
          />
        )}
      </div>
      <p>{label}</p>
    </button>
  );
};

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
  const wallet = useActiveWallet();  // Fetch the currently connected wallet
  const walletAddress = wallet?.getAccount()?.address;
  const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === "production";

  // State variables for form fields and data management
  const [username, setUsername] = useState<string>("");      // Stores the user's input for username
  const [email, setEmail] = useState<string>("");            // Stores the user's input for email
  const [role, setRole] = useState<UserRole>("ProjectOwner"); // Manages selected user role
  const [projectUrl, setProjectUrl] = useState<string>("");  // Project URL input for ProjectOwner role
  const [isSaveEnabled, setIsSaveEnabled] = useState<boolean>(false); // Enables save button when inputs are valid

  // State variables for X API authentication and user data
  const [xAuthTokenData, setXAuthTokenData] = useState<any>(null);  // Stores X API authentication token data
  const [xUserData, setXUserData] = useState<any>(null);            // Stores X user profile data
  const [isXApiLoading, setIsXApiLoading] = useState<boolean>(false); // Manages loading state during API calls

  // State variables for Google API authentication and YouTube user data
  const [googleAuthTokenData, setGoogleAuthTokenData] = useState<GoogleAuthToken | null>(null);  // Stores Google API authentication token data
  const [youtubeUserData, setYouTubeUserData] = useState<YouTubeAccountInfo | "no_account" | null>(null);            // Stores YouTube user profile data
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
  }, [username, email, role, projectUrl, xUserData, youtubeUserData, isOpen]);

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

    // Load Google API authentication token data if available
    const storedGoogleAuthTokenData = localStorage.getItem("googleAuthTokenData");
    if (storedGoogleAuthTokenData) {
      try {
        setGoogleAuthTokenData(JSON.parse(storedGoogleAuthTokenData));  // Parse and store token data
      } catch (error) {
        console.error("Failed to parse Google auth token data from localStorage:", error);
      }
    }

    // Load YouTube user data if available
    const storedYouTubeUserData = localStorage.getItem("youtubeUserData");
    if (storedYouTubeUserData) {
      try {
        setYouTubeUserData(JSON.parse(storedYouTubeUserData));  // Parse and store user data
      } catch (error) {
        console.log("Failed to parse YouTube user data from localStorage:", error);
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
      (role !== "ProjectOwner" || validateUrl(projectUrl)) && // Only validate project URL for ProjectOwner
      (!isProduction || role !== "Affiliate" || xUserData !== null || youtubeUserData !== null) // Ensure one account is connected for Affiliate, Skip check if not production
    );
  };

  // OAuth access token fetching from the X or Google API after the user is redirected back
  useEffect(() => {
    const fetchAuthData = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");

      if (!code) {
        console.error("Authorization code is missing.");
        return;
      }

      if (state) {
        // X authentication process
        if (state !== process.env.NEXT_PUBLIC_X_API_OAUTH_STATE) {
          console.error("Invalid state parameter for X API.");
          return;
        }

        setIsXApiLoading(true);
        try {
          // TODO: Fix to use utility function
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
          console.error("Error fetching access token from X:", error);
        } finally {
          setIsXApiLoading(false);
        }
      } else {
        // Google authentication process
        setIsGoogleApiLoading(true);
        try {
          // Use the utility function to exchange the authorization code for tokens
          const tokenData = await getGoogleTokens(code, walletAddress!);

          // If access token is received, store it in state and localStorage
          if (tokenData?.tokens?.access_token) {
            setGoogleAuthTokenData(tokenData.tokens);
            localStorage.setItem("googleAuthTokenData", JSON.stringify(tokenData.tokens));
            console.log("Google Account connected successfully");
          } else {
            console.error("Failed to receive Google token data.");
          }
        } catch (error) {
          console.error("Error fetching access token from Google:", error);
        } finally {
          setIsGoogleApiLoading(false);
        }
      }
    };

    fetchAuthData(); // Trigger OAuth token fetching
  }, [searchParams]);

  // Fetch X user profile data using the access token
  useEffect(() => {
    // Exit if token data is not available or user data is already set
    if (!xAuthTokenData || xUserData) return;

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

  // Fetch YouTube user profile data using the access token
  useEffect(() => {
    // Exit if token data is not available or user data has already been processed
    if (!googleAuthTokenData || youtubeUserData) return;

    const fetchYouTubeUserData = async (tokenData: GoogleAuthToken) => {
      setIsGoogleApiLoading(true);  // Set loading state during API call
      try {
        // Fetch YouTube user data using the utility function
        const userData = await getYouTubeAccountInfo(walletAddress!, tokenData);

        // If user data is received, store it in state and localStorage
        if (userData && userData.length > 0) {
          setYouTubeUserData(userData[0]);  // Store the first item, which represents the user's channel data
          localStorage.setItem("youtubeUserData", JSON.stringify(userData[0]));
          console.log("YouTube user data fetched successfully");
        } else {
          // Handle the case where the user has no YouTube account or no accessible channel information
          console.error("No YouTube account found or user data could not be retrieved.");
          setYouTubeUserData("no_account"); // Indicate that no YouTube data is available
          localStorage.setItem("youtubeUserData", "no_account"); // Store this state in local storage
        }
      } catch (error) {
        console.error("Error fetching user data from Google:", error);
      } finally {
        setIsGoogleApiLoading(false);  // Reset loading state
      }
    };

    // Fetch user data after receiving the authentication token
    fetchYouTubeUserData(googleAuthTokenData);
  }, [googleAuthTokenData]);

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

    // If the user connected their Google account, include token and account info
    if (googleAuthTokenData) {
      userInfo.googleAuthToken = googleAuthTokenData;
      // Only include googleAccountInfo if googleUserData is not "no_account" and not null
      if (youtubeUserData && youtubeUserData !== "no_account") {
        userInfo.youtubeAccountInfo = youtubeUserData;
      }
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
    localStorage.removeItem("googleAuthTokenData");
    localStorage.removeItem("youtubeUserData");
  };

  if (!isOpen) return null;  // Do not render the modal if it's not open

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.24)] flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl shadow-md p-6 w-full max-w-sm mx-5">

        {/* Title And Close Button */}
        <div className="flex flex-row justify-between mb-7">
          <h1 className="text-xl font-semibold">Profile Setup</h1>
          <button onClick={onClose} className="focus:outline-none">
            <Image
              src="/assets/common/close-black.png"
              alt="Close Icon"
              width={20}
              height={20}
            />
          </button>
        </div>

        <div className="space-y-5">

          {/* Username Input Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Username <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 bg-transparent border border-[#D9D9D9] rounded-lg text-sm outline-none"
              placeholder="qube1234"
            />
          </div>

          {/* Email Input Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 bg-transparent border border-[#D9D9D9] rounded-lg text-sm outline-none"
              placeholder="official@ceed.cloud"
            />
          </div>

          {/* Role Selection Buttons */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Role <span className="text-red-500">*</span></label>
            {disableRoleSelection && (
              <p className="text-xs text-red-500 font-semibold">
                You are automatically assigned the role of &quot;Publisher&quot; because you are a team member of a project.
              </p>
            )}
            <div className="flex flex-row gap-3">
              <RoleSelectButton
                label="Publisher"
                roleValue="ProjectOwner"
                selectedRole={role}
                setRole={setRole}
                disableRoleSelection={disableRoleSelection}
              />
              <RoleSelectButton
                label="KOL/Guild"
                roleValue="Affiliate"
                selectedRole={role}
                setRole={setRole}
                disableRoleSelection={disableRoleSelection}
              />
            </div>
          </div>

          {/* Project URL Input Field for ProjectOwner */}
          {role === "ProjectOwner" && (
            <div className="space-y-2">
              <label className="text-sm font-semibold">Project URL <span className="text-red-500">*</span></label>
              <input
                type="url"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                className="w-full p-2 bg-transparent border border-[#D9D9D9] rounded-lg text-sm outline-none"
                placeholder="https://yourproject.com"
              />
            </div>
          )}

          {/* X, YouTube Connect Button */}
          {role === "Affiliate" && (
            <div className="space-y-2">
              <label className="text-sm font-semibold">
                Mainly Used SNS
                {isProduction ? (
                  <span className="text-red-500"> *</span>
                ) : (
                  <p className="text-yellow-500 text-xs">(Not required in staging environment)</p>
                )}
              </label>

              <div className="flex flex-row gap-3">

                {/* X */}
                <div className="flex-1">
                  {isXApiLoading ? (
                    <div className="flex justify-center items-center gap-2 text-sm">
                      <Image
                        src="/assets/common/loading.png"
                        alt="loading"
                        width={30}
                        height={30}
                        className="animate-spin"
                      />
                      <span className="animate-pulse">Loading...</span>
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
                        className="text-black text-sm hover:underline"
                      >
                        @{xUserData.username}
                      </a>
                    </div>
                  ) : (
                    <button
                      onClick={async () => {
                        setIsXApiLoading(true); // Set loading state to true immediately after the button is clicked
                        try {
                          const authUrl = await generateXAuthUrl();
                          window.location.href = authUrl;
                        } catch (error) {
                          console.error("Failed to generate X auth URL", error);
                        } finally {
                          setIsXApiLoading(false); // Reset loading state in case of error
                        }
                      }}
                      className="w-full py-2 px-3 rounded-lg text-sm outline-none flex items-center gap-3 bg-[#F5F5F5]"
                    >
                      <Image
                        src="/brand-assets/x-black.png"
                        alt="X Logo"
                        width={15}
                        height={15}
                      />
                      X
                    </button>
                  )}
                </div>

                {/* YouTube */}
                <div className="flex-1">
                  {isGoogleApiLoading ? (
                    <div className="flex justify-center items-center gap-2 text-sm">
                      <Image
                        src="/assets/common/loading.png"
                        alt="loading"
                        width={30}
                        height={30}
                        className="animate-spin"
                      />
                      <span className="animate-pulse">Loading...</span>
                    </div>
                  ) : youtubeUserData ? (
                    youtubeUserData === "no_account" ? (
                      <div className="flex items-center gap-2">
                        <Image
                          src="/brand-assets/youtube.png"
                          alt="YouTube Logo"
                          width={30}
                          height={30}
                          className="rounded-full"
                        />
                        <span className="text-black text-sm">
                          Connected
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Image
                          src={youtubeUserData.snippet?.thumbnails?.default?.url as string}
                          alt={youtubeUserData.snippet?.customUrl || "YouTube User"}
                          width={30}
                          height={30}
                          className="rounded-full"
                        />
                        <a
                          href={`https://www.youtube.com/${youtubeUserData.snippet?.customUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-black text-sm hover:underline"
                        >
                          {youtubeUserData.snippet?.customUrl || "YouTube User"}
                        </a>
                      </div>
                    )
                  ) : (
                    <button
                      onClick={async () => {
                        setIsGoogleApiLoading(true); // Set loading state to true immediately after the button is clicked
                        try {
                          if (!walletAddress) {
                            console.error("Wallet address is not available. Cannot generate Google auth URL.");
                            return; // Exit early if walletAddress is undefined
                          }

                          const authUrl = await generateGoogleAuthUrl(walletAddress);
                          if (authUrl) {
                            window.location.href = authUrl;
                          } else {
                            console.error("Failed to generate Google auth URL. The URL is undefined.");
                          }
                        } catch (error) {
                          console.error("Failed to generate Google auth URL", error);
                        } finally {
                          setIsGoogleApiLoading(false); // Reset loading state in case of error
                        }
                      }}
                      className="w-full py-2 px-3 rounded-lg text-sm outline-none flex items-center gap-3 bg-[#F5F5F5]"
                    >
                      <Image
                        src="/brand-assets/youtube.png"
                        alt="YouTube Logo"
                        width={20}
                        height={20}
                      />
                      YouTube
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className={`w-full mt-10 px-4 py-2 rounded-3xl text-white font-bold ${
            isSaveEnabled ? "bg-black hover:bg-slate-700 hover:shadow-lg" : "bg-black/50 cursor-not-allowed"
          }`}
          disabled={!isSaveEnabled}
        >
          Save
        </button>

      </div>
    </div>
  );
};