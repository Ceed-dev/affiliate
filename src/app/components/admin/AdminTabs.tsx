import { ActiveTab } from "../../types"; // Importing ActiveTab type from types file

interface TabButtonProps {
  isActive: boolean; // Indicates if the tab is currently active
  label: string; // Label text for the tab button
  onClick: () => void; // Function to handle click event on the tab button
}

// TabButton component: Represents an individual tab button with an active state
const TabButton: React.FC<TabButtonProps> = ({ isActive, label, onClick }) => {
  return (
    <li className={`mr-1 ${isActive ? "text-sky-500" : ""}`}>
      <button 
        onClick={onClick} // Calls the passed onClick function when the button is clicked
        className={`inline-block py-2 px-4 font-semibold whitespace-nowrap ${isActive ? "bg-slate-300 rounded-t-md" : ""}`}
        // Applies different styles based on whether the tab is active
      >
        {label} {/* Displays the label text of the tab */}
      </button>
    </li>
  );
};

interface AdminTabsProps {
  activeTab: ActiveTab; // The current active tab, determining which content is shown
  setActiveTab: (tab: ActiveTab) => void; // Function to update the active tab
}

// AdminTabs component: Displays the tabs for switching between different views in the admin dashboard
export const AdminTabs: React.FC<AdminTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-11/12 border-b border-slate-400 my-5 overflow-x-auto">
      {/* Unordered list that holds the tab buttons */}
      <ul className="flex w-max">
        {/* Tab for unpaid conversion logs and token summary */}
        <TabButton 
          isActive={activeTab === "unpaidConversionLogs"} // Check if the current tab is unpaidConversionLogs
          label="Unpaid Conversion Logs & Token Summary" 
          onClick={() => setActiveTab("unpaidConversionLogs")} // Set the active tab to unpaidConversionLogs when clicked
        />
        {/* Tab for user approval */}
        <TabButton 
          isActive={activeTab === "userApproval"} // Check if the current tab is userApproval
          label="User Approval" 
          onClick={() => setActiveTab("userApproval")} // Set the active tab to userApproval when clicked
        />
        {/* Tab for manual tweet engagement update */}
        <TabButton 
          isActive={activeTab === "manualTweetEngagementUpdate"} // Check if the current tab is manualTweetEngagementUpdate
          label="Manual Tweet Engagement Update" 
          onClick={() => setActiveTab("manualTweetEngagementUpdate")} // Set the active tab to manualTweetEngagementUpdate when clicked
        />
        {/* Tab for manual YouTube video engagement update */}
        <TabButton 
          isActive={activeTab === "manualYouTubeVideoEngagementUpdate"} // Check if the current tab is manualYouTubeVideoEngagementUpdate
          label="Manual YouTube Video Engagement Update" 
          onClick={() => setActiveTab("manualYouTubeVideoEngagementUpdate")} // Set the active tab to manualYouTubeVideoEngagementUpdate when clicked
        />
      </ul>
    </div>
  );
};