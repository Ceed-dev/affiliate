import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import { ethers } from "ethers";
import { popularTokens } from "../../constants/popularTokens";
import { formatChainName } from "../../utils/formatters";
import { UnpaidConversionLog } from "../../types";

const ZERO_ADDRESS = ethers.constants.AddressZero;
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

interface UnpaidConversionLogsProps {
  unpaidConversionLogs: UnpaidConversionLog[];
  unpaidLogsLoading: boolean;
  processingLogId: string | null;
  handlePay: (log: UnpaidConversionLog) => void;
}

export const UnpaidConversionLogs: React.FC<UnpaidConversionLogsProps> = ({
  unpaidConversionLogs,
  unpaidLogsLoading,
  processingLogId,
  handlePay,
}) => {
  return (
    <>
      <div className="w-11/12">
        <h2 className="text-md sm:text-xl lg:text-2xl font-semibold">Unpaid Conversion Logs ({unpaidConversionLogs.length})</h2>
        <p className="text-sm text-gray-600">List of unpaid conversion logs awaiting payment.</p>
      </div>
      <div className="overflow-x-auto w-11/12 shadow-md rounded-md my-5">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Log ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Affiliate Wallet</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">User Wallet Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chain</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referral ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Conversion ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {unpaidLogsLoading ? (
              <tr>
                <td colSpan={11} className="px-6 py-4 text-lg text-gray-500">
                  <div className="flex flex-row items-center justify-center gap-5">
                    <Image src={"/assets/common/loading.png"} height={50} width={50} alt="loading.png" className="animate-spin" />
                    Loading..., this may take a while.
                  </div>
                </td>
              </tr>
            ) : unpaidConversionLogs.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-6 py-4 text-lg text-gray-500 text-center">
                  No unpaid conversion logs found.
                </td>
              </tr>
            ) : (
              unpaidConversionLogs.map((log) => (
                <tr key={log.logId} className={`${processingLogId === log.logId ? "bg-gray-300 cursor-not-allowed animate-pulse" : ""}`}>
                  <td className="px-6 py-4 text-sm text-gray-900">{log.logId}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{log.timestamp.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <Link 
                      href={`${log.selectedChain.explorers?.[0]?.url}/address/${log.affiliateWallet}`}
                      target="_blank"
                      className="text-blue-500 hover:underline"
                    >
                      {log.affiliateWallet}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {log.userWalletAddress ? (
                      <Link 
                        href={`${log.selectedChain.explorers?.[0]?.url}/address/${log.userWalletAddress}`}
                        target="_blank"
                        className="text-blue-500 hover:underline"
                      >
                        {log.userWalletAddress}
                      </Link>
                    ) : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <Link
                      href={`${baseUrl}/affiliate/${log.projectId}`}
                      target="_blank"
                      className="text-blue-500 hover:underline"
                    >
                      {log.projectId}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      className="flex items-center justify-center p-2 bg-slate-100 hover:bg-slate-200 rounded-md shadow-md transition duration-300 ease-in-out"
                      onClick={() => toast.info(`Selected chain: ${log.selectedChain.name}`)}
                    >
                      <Image 
                        src={`/chains/${formatChainName(log.selectedChain.name)}.png`} 
                        alt={log.selectedChain.name} 
                        width={20} 
                        height={20} 
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {log.selectedTokenAddress === ZERO_ADDRESS ? (
                      // Display "Native Token" with the symbol if the token address is the zero address
                      <span>Native Token ({(popularTokens[log.selectedChain.chainId] || []).find(token => token.address === ethers.constants.AddressZero)?.symbol})</span>
                    ) : (
                      <Link 
                        href={`${log.selectedChain.explorers?.[0]?.url}/address/${log.selectedTokenAddress}`}
                        target="_blank"
                        className="text-blue-500 hover:underline"
                      >
                        {((popularTokens[log.selectedChain.chainId] || []).find(token => token.address === log.selectedTokenAddress)?.symbol || "") && (
                          <span className="mr-1">
                            ({popularTokens[log.selectedChain.chainId].find(token => token.address === log.selectedTokenAddress)?.symbol})
                          </span>
                        )}
                        {log.selectedTokenAddress}
                      </Link>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                    {log.userWalletAddress ? (
                      `${log.amount} (${log.amount / 2} for each)`
                    ) : (
                      log.amount
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{log.referralId}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{log.conversionId}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <button 
                      className={`bg-sky-500 hover:bg-sky-700 hover:shadow-lg text-white px-3 py-1 rounded ${processingLogId === log.logId ? "cursor-not-allowed opacity-50" : ""}`}
                      onClick={() => handlePay(log)}
                      disabled={processingLogId === log.logId}
                    >
                      {processingLogId === log.logId ? (
                        <div className="flex items-center pr-4 gap-2">
                          <Image src={"/assets/common/loading.png"} height={20} width={20} alt="loading" className="animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        "Pay"
                      )}
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