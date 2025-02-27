import { ActiveTab } from "../../types"; // Importing ActiveTab type from types file

interface TabButtonProps {
  isActive: boolean; // Indicates if the tab is currently active
  label: string; // Label text for the tab button
  onClick: () => void; // Function to handle click event on the tab button
}

// TabButton component: Represents an individual tab button with an active state
const TabButton: React.FC<TabButtonProps> = ({ isActive, label, onClick }) => {
  return (
    <li className={`mr-1 ${isActive ? "text-[#25D366]" : ""}`}>
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
  // Define the tab data as an array of objects
  const tabs = [
    // { label: "Unpaid Conversion Logs & Token Summary", value: "unpaidConversionLogs" as ActiveTab },
    { label: "User Approval", value: "userApproval" as ActiveTab },
    // { label: "Manual Tweet Engagement Update", value: "manualTweetEngagementUpdate" as ActiveTab },
    // { label: "Manual YouTube Video Engagement Update", value: "manualYouTubeVideoEngagementUpdate" as ActiveTab },
    // { label: "App Settings", value: "appSettings" as ActiveTab },
  ];

  return (
    <div className="w-11/12 border-b border-slate-400 my-5 overflow-x-auto">
      {/* Unordered list that holds the tab buttons */}
      <ul className="flex w-max">
        {tabs.map((tab) => (
          <TabButton 
            key={tab.value}
            isActive={activeTab === tab.value} // Check if the current tab is active
            label={tab.label} 
            onClick={() => setActiveTab(tab.value)} // Set the active tab when clicked
          />
        ))}
      </ul>
    </div>
  );
};