import React from "react";
import ethers from "ethers";
import { erc20ABI, escrowABI } from "../constants/abi";
import { initializeSigner } from "../utils/contracts";

export const DepositButton: React.FC = () => {
  const tokenAddress = "0x9b5f49000d02479d1300e041fff1d74f49588749";
  const escrowAddress = "0x0CF4afA255F208DF4846b324c3e6b5A1E1e6A534";

  const signer = initializeSigner(`${process.env.PROVIDER_URL}`);

  const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, signer);
  const escrowContract = new ethers.Contract(escrowAddress, escrowABI, signer);

  const approveToken = async (amount: number) => {
    try {
      const beforeAllowance = await tokenContract.allowance(await signer.getAddress(), escrowAddress);
      console.log(`Current allowance before is ${ethers.utils.formatUnits(beforeAllowance, 6)} tokens.`);

      const txResponse = await tokenContract.approve(escrowAddress, ethers.utils.parseUnits(amount.toString(), 6));
      await txResponse.wait();

      const afterAllowance = await tokenContract.allowance(await signer.getAddress(), escrowAddress);
      console.log(`Current allowance after is ${ethers.utils.formatUnits(afterAllowance, 6)} tokens.`);
    } catch (error) {
      console.error('Approval failed:', error);
      alert('Approval failed. See console for more details.');
      throw error; // Stop the execution if approval fails
    }
  };

  const depositTokens = async (amount: number) => {
    try {
      const formattedAmount = ethers.utils.parseUnits(amount.toString(), 6);
      const txResponse = await escrowContract.deposit(tokenAddress, formattedAmount);
      const receipt = await txResponse.wait();
      console.log('Deposit transaction receipt:', receipt);
      alert('Deposit successful!');
    } catch (error) {
      console.error('Deposit failed:', error);
      alert('Deposit failed. See console for more details.');
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