import { ethers } from "ethers";
import { tokens } from "../../constants/tokens";

export async function withdrawFromEscrow(escrowContract: ethers.Contract, token: string, amount: number, depositorAddress: string, recipientAddress: string): Promise<string> {
  try {
    const tokenAddress = tokens[token];
    const amountInWei = ethers.utils.parseUnits(amount.toString(), 6);

    const tx = await escrowContract.withdraw(tokenAddress, amountInWei, depositorAddress, recipientAddress);

    await tx.wait();
    console.log(`Withdrawal completed : ${tx.hash}`);

    return tx.hash;
  } catch (error: any) {
    throw new Error(`Error during withdrawal: ${error.message}`);
  }
}