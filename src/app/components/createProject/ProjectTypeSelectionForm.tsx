import React, { useState } from "react";
import Image from "next/image";
import { Button } from "./Button";
import { ProjectType } from "../../types";
import { projectTypes } from "../../constants/projectCreationConfig";

type ProjectTypeSelectionFormProps = {
  handleProjectTypeChange: (type: ProjectType) => void;
  nextStep?: () => void;
};

export const ProjectTypeSelectionForm: React.FC<ProjectTypeSelectionFormProps> = ({
  handleProjectTypeChange,
  nextStep,
}) => {
  const [selectedType, setSelectedType] = useState<ProjectType | null>(null);

  const isFormComplete = selectedType !== null;

  const handleSelection = (type: ProjectType) => {
    setSelectedType(type);
    handleProjectTypeChange(type);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-5 mt-10">
      <h1 className="text-xl mb-5">Project Type</h1>
      <div className="flex flex-col lg:flex-row justify-around items-center gap-5">
        {projectTypes.map((type, index) => (
          <div 
            key={index} 
            className={`bg-slate-100 h-[250px] lg:h-[300px] w-full max-w-md rounded-lg flex flex-col justify-center items-center gap-3 lg:gap-7 text-center p-10 cursor-pointer ${
              selectedType === type.type ? "border-2 border-sky-500" : "hover:shadow-md"
            }`}
            onClick={() => handleSelection(type.type)}
          >
            <Image src={type.src} alt={type.alt} width={100} height={100} />
            <h3 className="text-md lg:text-xl font-semibold">{type.title}</h3>
            <p className="text-slate-500 text-sm lg:text-md">{type.description}</p>
          </div>
        ))}
      </div>
      {nextStep && <Button onClick={() => isFormComplete && nextStep()} disabled={!isFormComplete} />}
    </div>
  );
};