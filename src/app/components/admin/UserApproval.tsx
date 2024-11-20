import Image from "next/image";
import Link from "next/link";
import { UserData } from "../../types"; // Importing UserData type

// Interface for the props used in the UserApproval component
interface UserApprovalProps {
  userApprovalLoading: boolean; // Indicates whether user approval data is being loaded
  unapprovedUsers: UserData[]; // Array of users who are waiting for approval
  handleApprove: (walletAddress: string) => void; // Function to handle user approval based on wallet address
}

// UserApproval component: Displays a list of unapproved users and allows approving them
export const UserApproval: React.FC<UserApprovalProps> = ({
  userApprovalLoading,
  unapprovedUsers,
  handleApprove,
}) => {
  return (
    <>
      {/* Header for the user approval section */}
      <div className="w-11/12">
        <h2 className="text-md sm:text-xl lg:text-2xl font-semibold">User Approval</h2>
        <p className="text-sm text-gray-600">List of users awaiting approval.</p>
      </div>

      {/* Table displaying unapproved users */}
      <div className="overflow-x-auto w-11/12 shadow-md rounded-md my-5">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Table headers */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Wallet Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Created At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Show loading state if the data is being fetched */}
            {userApprovalLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-lg text-gray-500">
                  <div className="flex flex-row items-center justify-center gap-5">
                    <Image
                      src="/assets/common/loading.png"
                      height={50}
                      width={50}
                      alt="loading.png"
                      className="animate-spin"
                    />
                    Loading..., this may take a while.
                  </div>
                </td>
              </tr>
            ) : unapprovedUsers.length === 0 ? (
              // Show message if no unapproved users are found
              <tr>
                <td colSpan={5} className="px-6 py-4 text-lg text-gray-500 text-center">
                  No users awaiting approval.
                </td>
              </tr>
            ) : (
              // Map over unapprovedUsers and render their information
              unapprovedUsers.map((user) => (
                <tr key={user.walletAddress}>
                  {/* Username */}
                  <td className="px-6 py-4 text-sm text-gray-900">{user.username}</td>
                  {/* Email with mailto link */}
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <Link 
                      href={`mailto:${user.email}`}
                      target="_blank"
                      className="text-blue-500 hover:underline"
                    >
                      {user.email}
                    </Link>
                  </td>
                  {/* Wallet address */}
                  <td className="px-6 py-4 text-sm text-gray-900">{user.walletAddress}</td>
                  {/* Creation date */}
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{user.createdAt.toLocaleString()}</td>
                  {/* Approve button */}
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <button 
                      className="bg-[#25D366] hover:bg-[#25D366]/80 hover:shadow-lg text-white px-3 py-1 rounded"
                      onClick={() => handleApprove(user.walletAddress!)} // Call the handleApprove function with the user's wallet address
                    >
                      Approve
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};