import React from "react";
import { initializeSigner, Escrow, ERC20 } from "../utils/contracts";

const USDC_ADDRESS = "0x9b5f49000d02479d1300e041fff1d74f49588749";

export const DepositButton: React.FC = () => {
  const signer = initializeSigner(`${process.env.PROVIDER_URL}`);
  const escrow = new Escrow(signer);
  const erc20 = new ERC20(USDC_ADDRESS, signer);

  const approveToken = async (amount: number) => {
    try {
      const beforeAllowance = await erc20.getAllowance(await signer.getAddress(), escrow.address);
      console.log(`Current allowance before is ${beforeAllowance} tokens.`);

      if (parseFloat(beforeAllowance) < amount) {
        const txhash = await erc20.approve(escrow.address, amount);
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

  const depositTokens = async (amount: number) => {
    try {
      const decimals = await erc20.getDecimals();
      const txhash = await escrow.deposit(USDC_ADDRESS, amount, decimals);
      console.log("Deposit transaction hash:", txhash);
    } catch (error) {
      console.error("Deposit failed:", error);
    }
  };

  const handleDeposit = async () => {
    const amount = 100;
    await approveToken(amount);
    await depositTokens(amount);
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