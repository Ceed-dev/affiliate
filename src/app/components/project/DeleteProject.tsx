import { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { deleteProject } from "../../utils/projectUtils";

interface DeleteProjectProps {
  /** The ID of the project to be deleted */
  projectId: string;
  
  /** The name of the project, used for deletion confirmation input */
  projectName: string;
  
  /** User input to confirm the deletion by entering the project name */
  deleteInput: string;
  
  /** Function to update the delete confirmation input state */
  setDeleteInput: Dispatch<SetStateAction<string>>;
  
  /** Indicates if the deletion process is currently active */
  isDeleting: boolean;
  
  /** Function to manage the loading state for the deletion process */
  setIsDeleting: Dispatch<SetStateAction<boolean>>;
}

/**
 * DeleteProject displays a warning message and a confirmation input 
 * for users to confirm project deletion. Once confirmed, it triggers the 
 * deletion process using the provided project ID and displays appropriate feedback.
 */
export const DeleteProject: React.FC<DeleteProjectProps> = ({
  projectId,
  projectName,
  deleteInput,
  setDeleteInput,
  isDeleting,
  setIsDeleting
}) => {
  const router = useRouter();
  
  /** Determines if the delete button should be enabled, based on confirmation input */
  const isDeleteButtonEnabled = deleteInput === projectName && !isDeleting;

  /**
   * Initiates the project deletion by calling the `deleteProject` utility function.
   * Updates the loading state, resets the input field, and navigates to the project list.
   */
  const handleDeleteClick = async () => {
    await deleteProject(projectId, router, setIsDeleting, setDeleteInput);
  };

  return (
    <div className="p-5 border-2 border-red-600 bg-red-100 rounded-lg shadow-md">
      <div className="bg-yellow-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
        <strong className="font-bold">Warning: All of the following data will be permanently deleted:</strong>
        <ul className="mt-2 list-disc list-inside">
          <li>Project data, including all associated images</li>
          <li>API key data linked to the project</li>
          <li>Referral ID data issued by affiliates who participated in the project</li>
          <li>All conversion and click data associated with the referral IDs</li>
        </ul>
        <p className="mt-4">This action cannot be undone. Please proceed with caution.</p>
      </div>
      <p className="text-red-700 mb-4">
        To delete the project, please enter the project name &apos;{projectName}&apos; in the field below.
      </p>
      <input
        type="text"
        className="mb-4 p-2 border border-red-600 bg-white rounded w-full focus:outline-none"
        placeholder="Enter project name"
        value={deleteInput}
        onChange={(e) => setDeleteInput(e.target.value)}
      />
      <button
        className={`w-full bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-700 ${
          !isDeleteButtonEnabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={handleDeleteClick}
        disabled={!isDeleteButtonEnabled}
      >
        {isDeleting ? (
          <span className="flex flex-row items-center justify-center gap-2">
            Deleting...
            <Image src={"/assets/common/loading.png"} height={30} width={30} alt="loading" className="animate-spin" />
          </span>
        ) : (
          "Delete Project"
        )}
      </button>
    </div>
  );
};