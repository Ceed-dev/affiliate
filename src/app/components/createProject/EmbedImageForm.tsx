import React from "react";
import Image from "next/image";
import { NextButton } from "./NextButton";
import { ImageType } from "../../types";

type EmbedImageFormProps = {
  data: {
    embedPreview: string;
  };
  handleImageChange: (field: ImageType) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (field: ImageType) => () => void;
  nextStep?: () => void;
};

export const EmbedImageForm: React.FC<EmbedImageFormProps> = ({
  data,
  handleImageChange,
  removeImage,
  nextStep,
}) => {
  const isFormComplete = data.embedPreview.trim();

  return (
    <div className="bg-white rounded-lg shadow-md p-5 my-10 text-sm">

      <h1 className="text-xl mb-5">Embed Image <span className="text-red-500">*</span></h1>
      
      <p className="text-gray-400 mb-5">Upload an image that will be displayed when affiliates embed advertisements on their media using an iframe.</p>

      <div className="relative">
        <div className="w-full max-w-lg mx-auto h-[150px] sm:h-[200px] md:h-[250px] lg:h-[300px]">
          <label htmlFor="embed-image-upload" className="cursor-pointer block h-full">
            {data.embedPreview ? (
              <div className="relative h-full w-full">
                <Image
                  src={data.embedPreview}
                  alt="Embed Image Preview"
                  layout="fill"
                  objectFit="contain"
                  className="rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage("embed")}
                  className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center opacity-0 hover:opacity-100 rounded-lg transition-opacity"
                >
                  <Image src="/trash.png" alt="trash.png" height={50} width={50} />
                </button>
              </div>
            ) : (
              <p className="bg-blue-50 hover:bg-gray-500 hover:text-white h-full flex justify-center items-center text-xl rounded-lg transition duration-300 ease-in-out">
                Upload Embed Image
              </p>
            )}
          </label>
          <input
            id="embed-image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange("embed")}
            className="hidden"
          />
        </div>
      </div>

      {nextStep && <NextButton onClick={() => isFormComplete && nextStep()} disabled={!isFormComplete} />}

    </div>
  );
};
