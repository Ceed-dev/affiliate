import { ethers } from "ethers";

export async function withdrawFromEscrow(escrowContract: ethers.Contract, tokenAddress: string, recipientAddress: string, amount: number): Promise<void> {
  try {
    const amountInWei = ethers.utils.parseUnits(amount.toString(), 6);

    const tx = await escrowContract.withdraw(tokenAddress, recipientAddress, amountInWei);
    console.log(`Transaction hash: ${tx.hash}`);

    await tx.wait();
    console.log(`Withdrawal completed in block ${tx.blockNumber}`);
  } catch (error: any) {
    throw new Error(`Error during withdrawal: ${error.message}`);
  }
}