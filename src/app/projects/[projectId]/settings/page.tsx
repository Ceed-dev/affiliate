"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { ProjectData } from "../../../types";
import { NavBar } from "../../../components/dashboard";
import { ProjectDetailsForm, NextButton } from "../../../components/createProject";
import { fetchProjectData } from "../../../utils/firebase";

export default function Settings({ params }: { params: { projectId: string } }) {
  const [initialProjectData, setInitialProjectData] = useState<ProjectData | null>(null);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);

  useEffect(() => {
    fetchProjectData(params.projectId)
      .then(data => {
        setInitialProjectData(data);
        setProjectData(data);
        setLoadingProject(false);
      })
      .catch(error => {
        const message = (error instanceof Error) ? error.message : "Unknown error";
        console.error("Error loading the project: ", message);
        toast.error(`Error loading the project: ${message}`);
        setLoadingProject(false);
      });
  }, [params.projectId]);

  const handleChange = (field: string, isNumeric?: boolean) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = isNumeric ? parseInt(event.target.value, 10) || 0 : event.target.value;
    setProjectData(prev => {
      if (prev === null) return null;
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const hasChanges = () => {
    if (!initialProjectData || !projectData) return false;
  
    return JSON.stringify(initialProjectData) !== JSON.stringify(projectData);
  };

  const isFormComplete = () => {
    return projectData &&
      projectData.projectName.trim() !== "" &&
      projectData.description.trim() !== ""
  };

  const handleSaveChanges = () => {
    if (isFormComplete()) {
      // Firebaseに保存
      console.log("Saving changes...");
      console.log("Check!!:", JSON.stringify(projectData, null, 2));
      // 実際の保存ロジック
    } else {
      toast.error("Please fill out all required fields.");
    }
  };

  return (
    <>
      <NavBar projectId={params.projectId} />
      <div className="min-h-screen bg-[#F8FAFC] px-4 sm:px-10 md:px-32 lg:px-60 xl:px-96 pt-1 pb-10">
        <ProjectDetailsForm
          data={{
            projectName: `${projectData?.projectName}`,
            description: `${projectData?.description}`
          }}
          handleChange={handleChange}
          isEditing={true}
        />
        <NextButton onClick={handleSaveChanges} disabled={!isFormComplete() || !hasChanges()}>
          Save Changes
        </NextButton>
      </div>
    </>
  );
}