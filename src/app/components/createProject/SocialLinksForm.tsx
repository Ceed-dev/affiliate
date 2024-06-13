import React from "react";
import { NextButton } from "./NextButton";

type SocialLinksFormProps = {
  data: {
    websiteUrl: string;
    xUrl: string;
    discordUrl: string;
  };
  handleChange: (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  nextStep?: () => void;
};

export const SocialLinksForm: React.FC<SocialLinksFormProps> = ({
  data,
  handleChange,
  nextStep,
}) => {
  const isFormComplete = data.websiteUrl.trim() && data.xUrl.trim();

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
            onChange={handleChange("websiteUrl")}
            className="w-full p-2 border border-[#D1D5DB] rounded-lg text-sm outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <h2>X <span className="text-red-500">*</span></h2>
          <input
            type="url"
            placeholder="https://twitter.com/my-twitter"
            value={data.xUrl}
            onChange={handleChange("xUrl")}
            className="w-full p-2 border border-[#D1D5DB] rounded-lg text-sm outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <h2>Discord</h2>
          <input
            type="url"
            placeholder="https://discord.gg/my-group"
            value={data.discordUrl}
            onChange={handleChange("discordUrl")}
            className="w-full p-2 border border-[#D1D5DB] rounded-lg text-sm outline-none"
          />
        </div>

      </div>

      {nextStep && <NextButton onClick={() => isFormComplete && nextStep()} disabled={!isFormComplete} />}

    </div>
  );
};