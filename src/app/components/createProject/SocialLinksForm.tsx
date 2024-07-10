import React, { useState, useEffect } from "react";
import { NextButton } from "./NextButton";

type SocialLinksFormProps = {
  data: {
    websiteUrl: string;
    xUrl: string;
    discordUrl: string;
  };
  handleChange: (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  setSocialLinkFormError?: (hasError: boolean) => void;
  nextStep?: () => void;
};

export const SocialLinksForm: React.FC<SocialLinksFormProps> = ({
  data,
  handleChange,
  setSocialLinkFormError,
  nextStep,
}) => {
  const [websiteError, setWebsiteError] = useState("");
  const [xUrlError, setXUrlError] = useState("");
  const [discordUrlError, setDiscordUrlError] = useState("");

  useEffect(() => {
    if (setSocialLinkFormError) {
      const hasError = !!websiteError || !!xUrlError || !!discordUrlError;
      setSocialLinkFormError(hasError);
    }
  }, [websiteError, xUrlError, discordUrlError, setSocialLinkFormError]);

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const isSpecificUrl = (url: string, domains: string[]): boolean => {
    try {
      const parsedUrl = new URL(url);
      return domains.some(domain => parsedUrl.hostname.includes(domain));
    } catch (e) {
      return false;
    }
  };

  const handleWebsiteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setWebsiteError(isValidUrl(value) ? "" : "Invalid website URL.");
    handleChange("websiteUrl")(event);
  };

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

  const isFormComplete = data.websiteUrl.trim() && data.xUrl.trim() && !websiteError && !xUrlError && !discordUrlError;

  return (
    <div className="bg-white rounded-lg shadow-md p-5 mt-10 text-sm">

      <h1 className="text-xl mb-5">Socials</h1>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h2>Website <span className="text-red-500">*</span></h2>
          <input
            type="url"
            placeholder="https://mysite.com"
            value={data.websiteUrl}
            onChange={handleWebsiteChange}
            className={`w-full p-2 border border-[#D1D5DB] rounded-lg text-sm outline-none ${websiteError ? "border-red-500" : ""}`}
          />
          {websiteError && <p className="text-red-500 text-xs mt-1">{websiteError}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <h2>X <span className="text-red-500">*</span></h2>
          <input
            type="url"
            placeholder="https://x.com/my-x"
            value={data.xUrl}
            onChange={handleXUrlChange}
            className={`w-full p-2 border border-[#D1D5DB] rounded-lg text-sm outline-none ${xUrlError ? "border-red-500" : ""}`}
          />
          {xUrlError && <p className="text-red-500 text-xs mt-1">{xUrlError}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <h2>Discord</h2>
          <input
            type="url"
            placeholder="https://discord.com/my-group"
            value={data.discordUrl}
            onChange={handleDiscordUrlChange}
            className={`w-full p-2 border border-[#D1D5DB] rounded-lg text-sm outline-none ${discordUrlError ? "border-red-500" : ""}`}
          />
          {discordUrlError && <p className="text-red-500 text-xs mt-1">{discordUrlError}</p>}
        </div>

      </div>

      {nextStep && <NextButton onClick={() => isFormComplete && nextStep()} disabled={!isFormComplete} />}

    </div>
  );
};