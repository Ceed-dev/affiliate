import Image from "next/image";
import { ActiveTab } from "../../types"; // Import ActiveTab type from types file

interface CommonProps {
  activeTab: ActiveTab; // The currently active tab, determining which action to perform
  unpaidLogsLoading: boolean; // Boolean indicating if unpaid conversion logs are being loaded
  userApprovalLoading: boolean; // Boolean indicating if user approvals are being loaded
  loadUnpaidConversionLogs: () => void; // Function to load unpaid conversion logs
  loadUnapprovedUsers: () => void; // Function to load unapproved users
}

// ButtonWithLoading component: Displays a button with a loading indicator based on the active tab
const ButtonWithLoading: React.FC<CommonProps> = ({
  activeTab,
  unpaidLogsLoading,
  userApprovalLoading,
  loadUnpaidConversionLogs,
  loadUnapprovedUsers,
}) => {
  
  // Handles button click: Calls the appropriate function based on the active tab
  const handleButtonClick = () => {
    if (activeTab === "unpaidConversionLogs") {
      loadUnpaidConversionLogs(); // Load unpaid conversion logs if active tab is unpaidConversionLogs
    } else if (activeTab === "userApproval") {
      loadUnapprovedUsers(); // Load unapproved users if active tab is userApproval
    }
  };

  // Determines whether to show the loading indicator based on the active tab and loading state
  const isLoading = (activeTab === "unpaidConversionLogs" && unpaidLogsLoading) || 
                    (activeTab === "userApproval" && userApprovalLoading);

  return (
    <button
      className={`${isLoading ? "bg-slate-400" : "bg-sky-500 hover:bg-sky-700"} text-white w-[130px] h-[40px] rounded transition`}
      onClick={handleButtonClick}
      disabled={isLoading} // Disable the button if data is loading
    >
      {isLoading ? (
        // Show loading spinner if data is being loaded
        <Image 
          src="/assets/common/loading.png" 
          height={30} 
          width={30} 
          alt="loading" 
          className="animate-spin mx-auto" 
        />
      ) : (
        // Show "Reload Data" text if not loading
        "Reload Data"
      )}
    </button>
  );
};

// AdminHeaderWithReloadButton component: Displays an admin dashboard header and a reload button based on activeTab
export const AdminHeaderWithReloadButton: React.FC<CommonProps> = ({
  activeTab,
  unpaidLogsLoading,
  userApprovalLoading,
  loadUnpaidConversionLogs,
  loadUnapprovedUsers,
}) => {
  return (
    <div className="w-11/12 flex justify-between items-center my-5">
      {/* Admin dashboard title */}
      <h1 className="text-lg sm:text-2xl lg:text-4xl font-semibold">Admin Dashboard</h1>
      
      {/* Only show the reload button if the active tab is not "manualTweetEngagementUpdate" or "manualYouTubeVideoEngagementUpdate" */}
      {activeTab !== "manualTweetEngagementUpdate" && activeTab !== "manualYouTubeVideoEngagementUpdate" && (
        <ButtonWithLoading
          activeTab={activeTab}
          unpaidLogsLoading={unpaidLogsLoading}
          userApprovalLoading={userApprovalLoading}
          loadUnpaidConversionLogs={loadUnpaidConversionLogs}
          loadUnapprovedUsers={loadUnapprovedUsers}
        />
      )}
    </div>
  );
};