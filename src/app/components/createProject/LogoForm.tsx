import React from "react";
import Image from "next/image";

type LogoFormProps = {
  data: {
    logoPreview: string,
    coverPreview: string,
  };
  handleImageChange: (field: "logo" | "cover") => (event: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (field: "logo" | "cover") => () => void;
};

export const LogoForm: React.FC<LogoFormProps> = ({
  data,
  handleImageChange,
  removeImage
}) => {
  return (
    <div className="bg-white w-2/5 rounded-lg shadow-md p-5 mx-auto mt-10 text-sm">

      <h1 className="text-xl mb-5">Logo & Cover Image</h1>

      <p className="text-gray-400 mb-5">Upload a logo and cover image for your project. It displays with a height of 192px and full screen width.</p>

      <div className="relative mb-[75px]">
        <div className="h-[192px] w-full">
          <label htmlFor="cover-upload" className="cursor-pointer block h-full">
            {data.coverPreview ? (
              <>
                <Image src={data.coverPreview} alt="Cover Preview" layout="fill" objectFit="cover" className="rounded-lg" />
                <button 
                  type="button"
                  onClick={removeImage("cover")}
                  className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center opacity-0 hover:opacity-100 rounded-lg transition-opacity"
                >
                  <Image src="/trash.png" alt="trash.png" height={50} width={50} />
                </button>
              </>
            ) : (
              <p className="bg-blue-50 hover:bg-gray-500 hover:text-white h-full flex justify-center items-center text-xl rounded-lg transition duration-300 ease-in-out">
                Upload Cover
              </p>
            )}
          </label>
          <input
            id="cover-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange("cover")}
            className="hidden"
          />
        </div>
        <div className="absolute left-10 -bottom-[75px]">
          <label htmlFor="logo-upload" className="cursor-pointer">
            {data.logoPreview ? (
              <>
                <Image src={data.logoPreview} alt="Logo Preview" width={150} height={150} className="object-cover rounded-full border-4 border-white" />
                <button 
                  type="button"
                  onClick={removeImage("logo")}
                  className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center opacity-0 hover:opacity-100 rounded-full transition-opacity"
                >
                  <Image src="/trash.png" alt="trash.png" height={50} width={50} />
                </button>
              </>
            ) : (
              <p className="bg-blue-50 hover:bg-gray-500 hover:text-white h-[150px] w-[150px] flex justify-center items-center text-md rounded-full border-4 border-white transition duration-300 ease-in-out">
                Upload Image
              </p>
            )}
          </label>
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
  );
};