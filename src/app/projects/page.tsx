import Link from "next/link";

export default function Projects() {
  return (
    <div className="w-2/3 mx-auto mt-10">
      <div className="flex flex-row justify-between items-center mb-10">
        <h1 className="text-2xl font-semibold">Your Projects</h1>
        <Link 
          href="/projects/create-project" 
          className="bg-sky-500 text-white py-2 px-3 text-sm rounded-md transition duration-300 ease-in-out transform hover:scale-105"
        >
          + New Project
        </Link>
      </div>
      <div className="text-center">
        <p className="text-sm">No projects</p>
        <p className="text-sm text-gray-500">Get started by creating a new project.</p>
      </div>
    </div>
  );
}