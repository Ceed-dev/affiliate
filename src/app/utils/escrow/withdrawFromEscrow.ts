import { ethers } from "ethers";

export async function withdrawFromEscrow(escrowContract: ethers.Contract, tokenAddress: string, recipientAddress: string, amount: ethers.BigNumberish): Promise<void> {
  try {
    const tx = await escrowContract.withdraw(tokenAddress, recipientAddress, amount);
    console.log(`Transaction hash: ${tx.hash}`);

    await tx.wait();
    console.log(`Withdrawal completed in block ${tx.blockNumber}`);
  } catch (error: any) {
    throw new Error(`Error during withdrawal: ${error.message}`);
  }
}