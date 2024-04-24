import React from "react";
import { initializeSigner, Escrow, ERC20 } from "../utils/contracts";

type DepositButtonProps = {
  tokenAddress: string;
  depositAmount: number;
};

export const DepositButton: React.FC<DepositButtonProps> = ({tokenAddress, depositAmount}) => {
  const signer = initializeSigner(`${process.env.PROVIDER_URL}`);
  const escrow = new Escrow(signer);
  const erc20 = new ERC20(tokenAddress, signer);

  const approveToken = async () => {
    try {
      const beforeAllowance = await erc20.getAllowance(await signer.getAddress(), escrow.address);
      console.log(`Current allowance before is ${beforeAllowance} tokens.`);

      if (parseFloat(beforeAllowance) < depositAmount) {
        const txhash = await erc20.approve(escrow.address, depositAmount);
        console.log(`Approval transaction hash: ${txhash}`);
        const afterAllowance = await erc20.getAllowance(await signer.getAddress(), escrow.address);
        console.log(`Current allowance after is ${afterAllowance} tokens.`);
      } else {
        console.log("Approval not necessary, sufficient allowance already granted.");
      }
    } catch (error) {
      console.error("Approval failed:", error);
      throw error;
    }
  };

  const depositTokens = async () => {
    try {
      const decimals = await erc20.getDecimals();
      const txhash = await escrow.deposit(tokenAddress, depositAmount, decimals);
      console.log("Deposit transaction hash:", txhash);
    } catch (error) {
      console.error("Deposit failed:", error);
    }
  };

  const handleDeposit = async () => {
    await approveToken();
    await depositTokens();
  };

  return (
    <button
      onClick={handleDeposit}
      className="w-2/3 mx-auto h-12 bg-sky-500 text-white rounded-lg p-2 outline-none transition duration-300 ease-in-out transform hover:scale-105"
      type="button"
    >
      Deposit to Escrow
    </button>
  );
}