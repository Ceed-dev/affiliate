import Image from "next/image";
import Link from "next/link";
import { ethers } from "ethers";
import { Chain } from "@thirdweb-dev/chains";
import { toast } from "react-toastify";
import { popularTokens } from "../../constants/popularTokens";
import { formatChainName } from "../../utils/formatters";

const ZERO_ADDRESS = ethers.constants.AddressZero;

interface TokenSummaryProps {
  tokenSummary: Record<string, { amount: number; chain: Chain }>
  unpaidLogsLoading: boolean;
}

export const TokenSummary: React.FC<TokenSummaryProps> = ({
  tokenSummary,
  unpaidLogsLoading,
}) => {
  return (
    <>
      <div className="w-11/12">
        <h2 className="text-md sm:text-xl lg:text-2xl font-semibold">Token Summary ({Object.keys(tokenSummary).length})</h2>
        <p className="text-sm text-gray-600">Summary of tokens required for payments.</p>
      </div>
      <div className="overflow-x-auto w-11/12 shadow-md rounded-md my-5">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chain</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {unpaidLogsLoading ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-lg text-gray-500">
                  <div className="flex flex-row items-center justify-center gap-5">
                    <Image src={"/assets/common/loading.png"} height={50} width={50} alt="loading.png" className="animate-spin" />
                    Loading..., this may take a while.
                  </div>
                </td>
              </tr>
            ) : Object.keys(tokenSummary).length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-lg text-gray-500 text-center">
                  No unpaid conversion logs found.
                </td>
              </tr>
            ) : (
              Object.keys(tokenSummary).map((tokenKey) => (
                <tr key={tokenKey}>
                  <td className="px-6 py-4">
                    <button 
                      className="flex items-center justify-center p-2 bg-slate-100 hover:bg-slate-200 rounded-md shadow-md transition duration-300 ease-in-out"
                      onClick={() => toast.info(`Selected chain: ${tokenSummary[tokenKey].chain.name}`)}
                    >
                      <Image 
                        src={`/chains/${formatChainName(tokenSummary[tokenKey].chain.name)}.png`} 
                        alt={tokenSummary[tokenKey].chain.name} 
                        width={20} 
                        height={20} 
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {tokenKey.startsWith(`${ZERO_ADDRESS}-`) ? (
                      // If the token key indicates a native token, display "Native Token" with the symbol
                      <span>
                        Native Token ({(popularTokens[tokenSummary[tokenKey].chain.chainId] || []).find(token => token.address === ZERO_ADDRESS)?.symbol})
                      </span>
                    ) : (
                      <Link 
                        href={`${tokenSummary[tokenKey].chain.explorers?.[0]?.url}/address/${tokenKey}`}
                        target="_blank"
                        className="text-blue-500 hover:underline"
                      >
                        {((popularTokens[tokenSummary[tokenKey].chain.chainId] || []).find(token => token.address === tokenKey)?.symbol || "") && (
                          <span className="mr-1">
                            ({popularTokens[tokenSummary[tokenKey].chain.chainId].find(token => token.address === tokenKey)?.symbol})
                          </span>
                        )}
                        {tokenKey}
                      </Link>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{tokenSummary[tokenKey].amount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};