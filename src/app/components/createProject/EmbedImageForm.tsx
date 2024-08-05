import React from "react";
import Image from "next/image";
import { Button } from "./Button";
import { ImageType } from "../../types";

type EmbedImageFormProps = {
  data: {
    embedPreviews: string[];
  };
  handleImageChange: (field: ImageType, index?: number) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (field: ImageType, index?: number) => () => void;
  nextStep?: () => void;
};

export const EmbedImageForm: React.FC<EmbedImageFormProps> = ({
  data,
  handleImageChange,
  removeImage,
  nextStep,
}) => {
  const isFormComplete = data.embedPreviews.length > 0 && data.embedPreviews.length <= 3;

  return (
    <div className="bg-white rounded-lg shadow-md p-5 my-10 text-sm">
      <h1 className="text-xl mb-5">Embed Images <span className="text-red-500">*</span></h1>
      <p className="text-gray-400 mb-5">Upload up to 3 images that will be displayed when affiliates embed advertisements on their media using an iframe.</p>

      <div className="space-y-4">
        {data.embedPreviews.map((embedPreview, index) => (
          <div key={index} className="relative">
            <div className="w-full max-w-lg mx-auto h-[150px] sm:h-[200px] md:h-[250px] lg:h-[300px]">
              <label htmlFor={`embed-image-upload-${index}`} className="cursor-pointer block h-full">
                {embedPreview ? (
                  <div className="relative h-full w-full">
                    <Image
                      src={embedPreview}
                      alt={`Embed Image Preview ${index + 1}`}
                      layout="fill"
                      objectFit="contain"
                      className="rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage("embeds", index)}
                      className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center opacity-0 hover:opacity-100 rounded-lg transition-opacity"
                    >
                      <Image src="/trash.png" alt="trash.png" height={50} width={50} />
                    </button>
                  </div>
                ) : (
                  <p className="bg-blue-50 hover:bg-gray-500 hover:text-white h-full flex justify-center items-center text-2xl rounded-lg transition duration-300 ease-in-out">
                    <span className="absolute text-gray-300 text-9xl font-bold flex items-center justify-center z-10">
                      {index + 1}
                    </span>
                    <span className="z-20">Upload Embed Image</span>
                  </p>
                )}
              </label>
              <input
                id={`embed-image-upload-${index}`}
                type="file"
                accept="image/*"
                onChange={handleImageChange("embeds", index)}
                className="hidden"
              />
            </div>
          </div>
        ))}
        {data.embedPreviews.length < 3 && (
          <div className="relative">
            <div className="w-full max-w-lg mx-auto h-[150px] sm:h-[200px] md:h-[250px] lg:h-[300px]">
              <label htmlFor={`embed-image-upload-${data.embedPreviews.length}`} className="cursor-pointer block h-full">
                <p className="bg-blue-50 hover:bg-gray-500 hover:text-white h-full flex justify-center items-center text-2xl rounded-lg transition duration-300 ease-in-out">
                  <span className="absolute text-gray-300 text-9xl font-bold flex items-center justify-center z-10">
                    {data.embedPreviews.length + 1}
                  </span>
                  <span className="z-20">Upload Embed Image</span>
                </p>
              </label>
              <input
                id={`embed-image-upload-${data.embedPreviews.length}`}
                type="file"
                accept="image/*"
                onChange={handleImageChange("embeds", data.embedPreviews.length)}
                className="hidden"
              />
            </div>
          </div>
        )}
      </div>

      {nextStep && <Button onClick={() => isFormComplete && nextStep()} disabled={!isFormComplete} />}
    </div>
  );
};
