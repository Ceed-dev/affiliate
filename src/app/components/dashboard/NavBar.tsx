import { toast } from "react-toastify";

export const NavBar = () => {
  return (
    <div className="flex flex-row py-3 px-10 gap-5">
      <button 
        className="bg-blue-200 rounded-md px-3 py-2 text-blue-600"
      >
        Dashboard
      </button>
      <button 
        className="rounded-md px-3 py-2 text-gray-500 hover:text-black"
        onClick={() => toast.info("Work in progress...")}
      >
        Settings
      </button>
    </div>
  );
}