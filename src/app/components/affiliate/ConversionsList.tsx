import React from "react";
import Image from "next/image";
import { PaymentTransaction } from "../../types";
import { formatAddress } from "../../utils/formatUtils";

type ConversionsListProps = {
  explorerUrl: string;
  transactions: PaymentTransaction[];
};

export const ConversionsList: React.FC<ConversionsListProps> = ({ explorerUrl, transactions }) => {
  const openExplorer = (transactionHash: string) => {
    const url = `${explorerUrl}/tx/${transactionHash}`;
    window.open(url, "_blank");
  };

  return (
    <div className="bg-white shadow rounded-lg p-10 w-2/3 mx-auto">
      <h2 className="text-lg leading-6 font-medium text-gray-900">
        Conversions
      </h2>
      <p className="text-gray-700 text-sm mb-5">
        A list of all conversions.
      </p>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Transaction Hash</th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.length ? (
            transactions.map((transaction, index) => (
              <tr 
                key={index} 
                className="text-gray-500 hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
                onClick={() => openExplorer(transaction.transactionHashAffiliate)}
              >
                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5 flex flex-row gap-3">
                  <Image src="/assets/common/open-in-new-black.png" alt="open-in-new-black.png" width={20} height={20} /> 
                  <span className="table-cell xl:hidden">{formatAddress(transaction.transactionHashAffiliate)}</span>
                  <span className="hidden xl:table-cell">{transaction.transactionHashAffiliate}</span>
                </td>
                <td className="px-6 py-4 whitespace-no-wrap text-sm leading-5">{transaction.timestamp.toLocaleDateString()}</td>
              </tr>
            ))
          ) : (
            <tr className="text-gray-500">
              <td colSpan={2} className="text-center py-4">No Conversion Data</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};