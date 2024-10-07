import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AffiliateInfo, UserRole } from "../types";
import { generateAuthUrl } from "../utils/xApiUtils";
import { API_ENDPOINTS } from "../constants/xApiConstants";

type UserInfoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (info: AffiliateInfo) => void;
  disableRoleSelection?: boolean;
};

export const UserInfoModal: React.FC<UserInfoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  disableRoleSelection = false,
}) => {
  const searchParams = useSearchParams();

  // State to initialize when the modal opens
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [xProfileUrl, setXProfileUrl] = useState<string>("");
  const [role, setRole] = useState<UserRole>("ProjectOwner");
  const [projectUrl, setProjectUrl] = useState<string>("");
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);
  const [xAuthTokenData, setXAuthTokenData] = useState<any>(null);
  const [xUserData, setXUserData] = useState<any>(null);
  const [isXApiLoading, setIsXApiLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      // Get value from local storage only when modal is opened
      setUsername(localStorage.getItem("username") || "");
      setEmail(localStorage.getItem("email") || "");
      setXProfileUrl(localStorage.getItem("xProfileUrl") || "");
      setRole((localStorage.getItem("role") as UserRole) || "ProjectOwner");
      setProjectUrl(localStorage.getItem("projectUrl") || "");

      const storedXAuthTokenData = localStorage.getItem("xAuthTokenData");
      if (storedXAuthTokenData) {
        try {
          setXAuthTokenData(JSON.parse(storedXAuthTokenData));
        } catch (error) {
          console.error("Failed to parse x auth token data from localStorage:", error);
        }
      }

      const storedXUserData = localStorage.getItem("xUserData");
      if (storedXUserData) {
        try {
          setXUserData(JSON.parse(storedXUserData));
        } catch (error) {
          console.log("Failed to parse x user data from localStorage:", error);
        }
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setIsSaveEnabled(validateInputs());
    }
  }, [username, email, xProfileUrl, role, projectUrl, isOpen]);

  // Sync state changes to localStorage when modal is open
  useEffect(() => {
    if (isOpen) localStorage.setItem("username", username);
  }, [username, isOpen]);

  useEffect(() => {
    if (isOpen) localStorage.setItem("email", email);
  }, [email, isOpen]);

  useEffect(() => {
    if (isOpen) localStorage.setItem("xProfileUrl", xProfileUrl);
  }, [xProfileUrl, isOpen]);

  useEffect(() => {
    if (isOpen) localStorage.setItem("role", role);
  }, [role, isOpen]);

  useEffect(() => {
    if (isOpen) localStorage.setItem("projectUrl", projectUrl);
  }, [projectUrl, isOpen]);

  const validateInputs = () => {
    return (
      validateUsername(username) &&
      validateEmail(email) &&
      validateRole(role) &&
      (role !== "ProjectOwner" || validateUrl(projectUrl)) &&
      (!xProfileUrl || validateUrl(xProfileUrl))
    );
  };

  useEffect(() => {
    /**
     * Fetch the OAuth access token using the authorization code and state from URL.
     */
    const fetchAuthData = async () => {
      setIsXApiLoading(true);
      const code = searchParams.get("code");
      const state = searchParams.get("state");

      if (!code || state !== (process.env.NEXT_PUBLIC_X_API_OAUTH_STATE as string)) {
        console.error("Missing necessary parameters or invalid state.");
        setIsXApiLoading(false);
        return;
      }

      try {
        // Obtain an access token from an authorization code
        const response = await fetch(API_ENDPOINTS.AUTH(code, state));
        const data = await response.json();

        if (data.access_token) {
          console.log("Access token received");

          // Save the token information in state and localStorage
          setXAuthTokenData(data);
          localStorage.setItem("xAuthTokenData", JSON.stringify(data));

          console.log("X Account connected successfully");
        }
      } catch (error) {
        console.error("Error fetching access token:", error);
      } finally {
        setIsXApiLoading(false);
      }
    };

    fetchAuthData();
  }, [searchParams]);

  useEffect(() => {
    if (!xAuthTokenData) return;
  
    /**
     * Fetch user data from the backend API using the access token.
     */
    const fetchUserData = async (tokenData: any) => {
      setIsXApiLoading(true);
      try {
        // Call the backend API to get the user data
        const response = await fetch(API_ENDPOINTS.USER(tokenData));
        const userData = await response.json();
  
        if (userData.user) {
          // Save the user information in state and localStorage
          setXUserData(userData.user);
          localStorage.setItem("xUserData", JSON.stringify(userData.user));
  
          console.log("X user data fetched successfully");
        } else {
          console.error("Failed to fetch user data.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsXApiLoading(false);
      }
    };
  
    // Fetch user data after receiving the auth token
    fetchUserData(xAuthTokenData);
  }, [xAuthTokenData]);  

  const validateUsername = (username: string) => {
    return username.trim().length > 0;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateRole = (role: UserRole) => {
    return role === "ProjectOwner" || role === "Affiliate";
  };

  const handleSave = () => {
    if (role === "ProjectOwner") {
      onSave({ username, email, role, projectUrl });
    } else {
      onSave({ username, email, role, xProfileUrl });
    }
    
    // Delete from local storage after saving data
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("xProfileUrl");
    localStorage.removeItem("role");
    localStorage.removeItem("projectUrl");
    localStorage.removeItem("xAuthTokenData");
    localStorage.removeItem("xUserData");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4">User Information</h2>
        <p className="text-sm text-gray-600 mb-4">
          Please provide your username, email address, and select your role to complete your registration.
          {role === "ProjectOwner" && " As a Project Owner, you also need to provide your project URL."}
        </p>
        <div className="flex flex-col gap-5">
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
                      const authUrl = await generateAuthUrl();
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
        </div>
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
