import Image from "next/image";
import Link from "next/link";
import { ethers } from "ethers";
import { Chain } from "@thirdweb-dev/chains"; // Importing Chain type from thirdweb-dev package
import { toast } from "react-toastify"; // Importing toast for notifications
import { popularTokens } from "../../constants/popularTokens"; // Predefined popular tokens list
import { formatChainName } from "../../utils/formatUtils"; // Utility to format chain names for image sources
import { formatNumberWithUnits } from "../../utils/generalUtils"; // Formats a large number into a more readable string with units

const ZERO_ADDRESS = ethers.constants.AddressZero; // Zero address constant for native tokens

// TokenSummaryProps interface defines the structure of the props
interface TokenSummaryProps {
  tokenSummary: Record<string, { amount: number; chain: Chain }>; // tokenSummary contains a record of token data by address
  unpaidLogsLoading: boolean; // Indicates if unpaid logs are currently loading
}

// TokenSummary component: Displays a summary of tokens needed for payment
export const TokenSummary: React.FC<TokenSummaryProps> = ({
  tokenSummary,
  unpaidLogsLoading,
}) => {
  return (
    <>
      {/* Header displaying the token summary count */}
      <div className="w-11/12">
        <h2 className="text-md sm:text-xl lg:text-2xl font-semibold">Token Summary ({formatNumberWithUnits(Object.keys(tokenSummary).length)})</h2>
        <p className="text-sm text-gray-600">Summary of tokens required for payments.</p>
      </div>

      {/* Token summary table */}
      <div className="overflow-x-auto w-11/12 shadow-md rounded-md my-5">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chain</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Total Amount</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Display loading state if unpaid logs are being loaded */}
            {unpaidLogsLoading ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-lg text-gray-500">
                  <div className="flex flex-row items-center justify-center gap-5">
                    {/* Loading spinner */}
                    <Image src={"/assets/common/loading.png"} height={50} width={50} alt="loading.png" className="animate-spin" />
                    Loading..., this may take a while.
                  </div>
                </td>
              </tr>
            ) : Object.keys(tokenSummary).length === 0 ? (
              // Display message if no unpaid conversion logs are found
              <tr>
                <td colSpan={3} className="px-6 py-4 text-lg text-gray-500 text-center">
                  No unpaid conversion logs found.
                </td>
              </tr>
            ) : (
              // Map over tokenSummary to display token data
              Object.keys(tokenSummary).map((tokenKey) => (
                <tr key={tokenKey}>
                  {/* Chain information with a button that shows a toast notification */}
                  <td className="px-6 py-4">
                    <button 
                      className="flex items-center justify-center p-2 bg-slate-100 hover:bg-slate-200 rounded-md shadow-md transition duration-300 ease-in-out"
                      onClick={() => toast.info(`Selected chain: ${tokenSummary[tokenKey].chain.name}`)}
                    >
                      {/* Chain icon */}
                      <Image 
                        src={`/chains/${formatChainName(tokenSummary[tokenKey].chain.name)}.png`} 
                        alt={tokenSummary[tokenKey].chain.name} 
                        width={20} 
                        height={20} 
                      />
                    </button>
                  </td>

                  {/* Token address or native token display */}
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {tokenKey.startsWith(`${ZERO_ADDRESS}-`) ? (
                      // If tokenKey indicates a native token, show "Native Token" with its symbol
                      <span>
                        Native Token ({(popularTokens[tokenSummary[tokenKey].chain.chainId] || []).find(token => token.address === ZERO_ADDRESS)?.symbol})
                      </span>
                    ) : (
                      // Otherwise, display the token address as a link
                      <Link 
                        href={`${tokenSummary[tokenKey].chain.explorers?.[0]?.url}/address/${tokenKey}`}
                        target="_blank"
                        className="text-blue-500 hover:underline"
                      >
                        {/* Display the token symbol if it's a known token */}
                        {((popularTokens[tokenSummary[tokenKey].chain.chainId] || []).find(token => token.address === tokenKey)?.symbol || "") && (
                          <span className="mr-1">
                            ({popularTokens[tokenSummary[tokenKey].chain.chainId].find(token => token.address === tokenKey)?.symbol})
                          </span>
                        )}
                        {tokenKey} {/* Token address */}
                      </Link>
                    )}
                  </td>

                  {/* Total amount of the token */}
                  <td className="px-6 py-4 text-sm text-gray-900">{formatNumberWithUnits(tokenSummary[tokenKey].amount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};