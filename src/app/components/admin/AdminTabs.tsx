import { ActiveTab } from "../../types";

interface TabButtonProps {
  isActive: boolean;
  label: string;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ isActive, label, onClick }) => {
  return (
    <li className={`mr-1 ${isActive ? "text-sky-500" : ""}`}>
      <button 
        onClick={onClick}
        className={`inline-block py-2 px-4 font-semibold whitespace-nowrap ${isActive ? "bg-slate-300 rounded-t-md" : ""}`}
      >
        {label}
      </button>
    </li>
  );
};

interface AdminTabsProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const AdminTabs: React.FC<AdminTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-11/12 border-b border-slate-400 my-5 overflow-x-auto">
      <ul className="flex w-max">
        <TabButton 
          isActive={activeTab === "unpaidConversionLogs"} 
          label="Unpaid Conversion Logs & Token Summary" 
          onClick={() => setActiveTab("unpaidConversionLogs")} 
        />
        <TabButton 
          isActive={activeTab === "userApproval"} 
          label="User Approval" 
          onClick={() => setActiveTab("userApproval")} 
        />
        <TabButton 
          isActive={activeTab === "manualTweetEngagementUpdate"} 
          label="Manual Tweet Engagement Update" 
          onClick={() => setActiveTab("manualTweetEngagementUpdate")} 
        />
      </ul>
    </div>
  );
};