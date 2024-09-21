import Image from "next/image";
import Link from "next/link";
import { UserData } from "../../types";

interface UserApprovalProps {
  userApprovalLoading: boolean;
  unapprovedUsers: UserData[];
  handleApprove: (walletAddress: string) => void;
}

export const UserApproval: React.FC<UserApprovalProps> = ({
  userApprovalLoading,
  unapprovedUsers,
  handleApprove,
}) => {
  return (
    <>
      <div className="w-11/12">
        <h2 className="text-md sm:text-xl lg:text-2xl font-semibold">User Approval</h2>
        <p className="text-sm text-gray-600">List of users awaiting approval.</p>
      </div>
      {/* Unapproved Users */}
      <div className="overflow-x-auto w-11/12 shadow-md rounded-md my-5">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">X Profile URL</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {userApprovalLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-lg text-gray-500">
                  <div className="flex flex-row items-center justify-center gap-5">
                    <Image src={"/assets/common/loading.png"} height={50} width={50} alt="loading.png" className="animate-spin" />
                    Loading..., this may take a while.
                  </div>
                </td>
              </tr>
            ) : unapprovedUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-lg text-gray-500 text-center">
                  No users awaiting approval.
                </td>
              </tr>
            ) : (
              unapprovedUsers.map((user) => (
                <tr key={user.walletAddress}>
                  <td className="px-6 py-4 text-sm text-gray-900">{user.username}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <Link 
                      href={`mailto:${user.email}`}
                      target="_blank"
                      className="text-blue-500 hover:underline"
                    >
                      {user.email}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <Link 
                      href={user.xProfileUrl}
                      target="_blank"
                      className="text-blue-500 hover:underline"
                    >
                      {user.xProfileUrl}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{user.walletAddress}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{user.createdAt.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <button 
                      className="bg-green-500 hover:bg-green-700 hover:shadow-lg text-white px-3 py-1 rounded"
                      onClick={() => handleApprove(user.walletAddress!)}
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