import { ethers } from "ethers";
import { tokens } from "../../constants/tokens";

export async function withdrawFromEscrow(escrowContract: ethers.Contract, token: string, amount: number, recipientAddress: string): Promise<void> {
  try {
    const tokenAddress = tokens[token];
    const amountInWei = ethers.utils.parseUnits(amount.toString(), 6);

    const tx = await escrowContract.withdraw(tokenAddress, recipientAddress, amountInWei);
    console.log(`Transaction hash: ${tx.hash}`);

    await tx.wait();
    console.log(`Withdrawal completed in block ${tx.blockNumber}`);
  } catch (error: any) {
    throw new Error(`Error during withdrawal: ${error.message}`);
  }
}