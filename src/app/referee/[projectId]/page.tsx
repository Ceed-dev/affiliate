"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ProjectData } from "../../types";
import { fetchProjectData } from "../../utils/firebase";
import { ProjectHeader } from "../../components/affiliate";

export default function Referee({ params }: { params: { projectId: string } }) {
  const router = useRouter();
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjectData(params.projectId)
      .then(data => {
        setProjectData(data);
        setLoading(false);
      })
      .catch(error => {
        const message = (error instanceof Error) ? error.message : "Unknown error";
        console.error("Error loading the project: ", message);
        setError(message);
        setLoading(false);
      });
  }, [params.projectId]);

  useEffect(() => {
    toast.info("Redirecting...", {
      onClose: () => router.push("https://google.com")
    });
  }, [router]);

  return (
    <div className="flex flex-col">
      <ProjectHeader projectData={projectData} loading={loading} />
      <div className="text-center text-2xl font-semibold text-gray-700 animate-pulse">
        <p className="mb-2">You have been referred!</p>
        <p className="mb-4">You will be automatically redirected.</p>
        <p>Please wait...</p>
      </div>
    </div>
  );
}