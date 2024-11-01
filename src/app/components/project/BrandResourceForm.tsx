import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ImageType } from "../../types";

// Props for BrandResourceForm component
type BrandResourceFormProps = {
  websiteUrl: string;
  xUrl: string;
  discordUrl: string;
  logoPreview: string;
  coverPreview: string;
  handleChange: (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleImageChange: (field: ImageType) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (field: ImageType) => () => void;
  setSocialLinkFormError: (hasError: boolean) => void;
};

export const BrandResourceForm: React.FC<BrandResourceFormProps> = ({
  websiteUrl,
  xUrl,
  discordUrl,
  logoPreview,
  coverPreview,
  handleChange,
  handleImageChange,
  removeImage,
  setSocialLinkFormError,
}) => {
  // Validation error states for each field
  const [websiteError, setWebsiteError] = useState("");
  const [xUrlError, setXUrlError] = useState("");
  const [discordUrlError, setDiscordUrlError] = useState("");

  // Update global error state if there are any validation errors
  useEffect(() => {
    const hasError = !!websiteError || !!xUrlError || !!discordUrlError;
    setSocialLinkFormError(hasError);
  }, [websiteError, xUrlError, discordUrlError, setSocialLinkFormError]);

  // URL validation function
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Check if the URL is from specific domains
  const isSpecificUrl = (url: string, domains: string[]): boolean => {
    try {
      const parsedUrl = new URL(url);
      return domains.some(domain => parsedUrl.hostname.includes(domain));
    } catch {
      return false;
    }
  };

  // Event handler for Website URL input change
  const handleWebsiteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setWebsiteError(isValidUrl(value) ? "" : "Invalid website URL.");
    handleChange("websiteUrl")(event);
  };

  // Event handler for X (Twitter) URL input change
  const handleXUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const validDomains = ["twitter.com", "x.com"];
    if (!isValidUrl(value)) {
      setXUrlError("Invalid X (Twitter) URL.");
    } else if (!isSpecificUrl(value, validDomains)) {
      setXUrlError("X (Twitter) URL must be from twitter.com or x.com.");
    } else {
      setXUrlError("");
    }
    handleChange("xUrl")(event);
  };

  // Event handler for Discord URL input change
  const handleDiscordUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const validDomains = ["discord.com"];
    if (value && !isValidUrl(value)) {
      setDiscordUrlError("Invalid Discord URL.");
    } else if (value && !isSpecificUrl(value, validDomains)) {
      setDiscordUrlError("Discord URL must be from discord.com.");
    } else {
      setDiscordUrlError("");
    }
    handleChange("discordUrl")(event);
  };

  return (
    <>
      <h1 className="text-2xl font-bold">Brand Resource</h1>

      <div className="space-y-5">

        {/* Website URL Input */}
        <div className="space-y-2">
          <label htmlFor="websiteUrl">
            Website <span className="text-red-500">*</span>
          </label>
          <input
            id="websiteUrl"
            type="url"
            placeholder="https://mysite.com"
            value={websiteUrl}
            onChange={handleWebsiteChange}
            className={`w-full p-2 border border-gray-300 rounded-lg outline-none ${websiteError ? "border-red-500" : ""}`}
          />
          {websiteError && <p className="text-red-500 text-xs">{websiteError}</p>}
        </div>

        {/* X (Twitter) URL Input */}
        <div className="space-y-2">
          <label htmlFor="xUrl">
            X <span className="text-red-500">*</span>
          </label>
          <input
            id="xUrl"
            type="url"
            placeholder="https://x.com/my-x"
            value={xUrl}
            onChange={handleXUrlChange}
            className={`w-full p-2 border border-gray-300 rounded-lg outline-none ${xUrlError ? "border-red-500" : ""}`}
          />
          {xUrlError && <p className="text-red-500 text-xs">{xUrlError}</p>}
        </div>

        {/* Discord URL Input */}
        <div className="space-y-2">
          <label htmlFor="discordUrl">Discord</label>
          <input
            id="discordUrl"
            type="url"
            placeholder="https://discord.com/my-group"
            value={discordUrl}
            onChange={handleDiscordUrlChange}
            className={`w-full p-2 border border-gray-300 rounded-lg outline-none ${discordUrlError ? "border-red-500" : ""}`}
          />
          {discordUrlError && <p className="text-red-500 text-xs">{discordUrlError}</p>}
        </div>

        {/* Cover Image Input */}
        <div className="space-y-2">
          <label>
            Cover Image <span className="text-red-500">*</span>
          </label>
          <p className="text-sm text-gray-500">Upload a cover image for your project.</p>
          <div className="border-dashed border-2 border-gray-300 rounded-md p-1 flex justify-center items-center h-[400px]">
            {coverPreview ? (
              <div className="relative w-full h-full">
                <Image src={coverPreview} alt="Cover Preview" layout="fill" objectFit="cover" className="rounded-lg" />
                <button
                  type="button"
                  onClick={removeImage("cover")}
                  className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center opacity-0 hover:opacity-100 rounded-lg transition-opacity"
                >
                  <Image src="/assets/common/trash.png" alt="Remove Cover" height={50} width={50} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="px-4 py-2 bg-gray-100 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none"
                onClick={() => document.getElementById("cover-upload")?.click()}
              >
                Upload Cover
              </button>
            )}
            <input 
              id="cover-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange("cover")}
              className="hidden"
            />
          </div>
        </div>

        {/* Logo Image Input */}
        <div className="space-y-2">
          <label>
            Logo Image <span className="text-red-500">*</span>
          </label>
          <p className="text-sm text-gray-500">Upload a logo image for your project avatar.</p>
          <div className="flex items-center">
            {logoPreview ? (
              <div className="relative h-32 w-32">
                <Image
                  src={logoPreview}
                  alt="Logo Preview"
                  width={128}
                  height={128}
                  className="rounded-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage("logo")}
                  className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center opacity-0 hover:opacity-100 rounded-full transition-opacity"
                >
                  <Image src="/assets/common/trash.png" alt="Remove Logo" height={30} width={30} />
                </button>
              </div>
            ) : (
              <>
                {/* Placeholder circle when no logo is selected */}
                <div className="h-32 w-32 rounded-full border-dashed border-2 border-gray-300 flex justify-center items-center" />
                <button
                  type="button"
                  className="ml-4 px-4 py-2 bg-gray-100 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none"
                  onClick={() => document.getElementById("logo-upload")?.click()}
                >
                  Upload Logo
                </button>
              </>
            )}
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange("logo")}
              className="hidden"
            />
          </div>
        </div>

      </div>
    </>
  );
};