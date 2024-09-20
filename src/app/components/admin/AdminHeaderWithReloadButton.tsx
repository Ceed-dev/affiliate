import Image from "next/image";
import { ActiveTab } from "../../types";

interface CommonProps {
  activeTab: ActiveTab;
  unpaidLogsLoading: boolean;
  userApprovalLoading: boolean;
  loadUnpaidConversionLogs: () => void;
  loadUnapprovedUsers: () => void;
}

const ButtonWithLoading: React.FC<CommonProps> = ({
  activeTab,
  unpaidLogsLoading,
  userApprovalLoading,
  loadUnpaidConversionLogs,
  loadUnapprovedUsers,
}) => {
  const handleButtonClick = () => {
    if (activeTab === "unpaidConversionLogs") {
      loadUnpaidConversionLogs();
    } else if (activeTab === "userApproval") {
      loadUnapprovedUsers();
    }
  };

  const isLoading = (activeTab === "unpaidConversionLogs" && unpaidLogsLoading) || (activeTab === "userApproval" && userApprovalLoading);

  return (
    <button
      className={`${isLoading ? "bg-slate-400" : "bg-sky-500 hover:bg-sky-700"} text-white w-[130px] h-[40px] rounded transition`}
      onClick={handleButtonClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <Image src="/assets/common/loading.png" height={30} width={30} alt="loading" className="animate-spin mx-auto" />
      ) : (
        "Reload Data"
      )}
    </button>
  );
};

export const AdminHeaderWithReloadButton: React.FC<CommonProps> = ({
  activeTab,
  unpaidLogsLoading,
  userApprovalLoading,
  loadUnpaidConversionLogs,
  loadUnapprovedUsers,
}) => {
  return (
    <div className="w-11/12 flex justify-between items-center my-5">
      <h1 className="text-lg sm:text-2xl lg:text-4xl font-semibold">Admin Dashboard</h1>
      {activeTab !== "manualTweetEngagementUpdate" && (
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