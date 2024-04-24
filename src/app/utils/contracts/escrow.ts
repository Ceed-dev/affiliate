import { ethers } from "ethers";
import { escrowABI } from "../../constants/abi";

export class Escrow {
  private contract: ethers.Contract;

  constructor(signer: ethers.Signer) {
    const contractAddress = `${process.env.ESCROW_CONTRACT_ADDRESS}`;
    if (!ethers.utils.isAddress(contractAddress)) {
      throw new Error("Invalid contract address.");
    }
    this.contract = new ethers.Contract(contractAddress, escrowABI, signer);
  }

  async deposit(tokenAddress: string, amount: number, decimals: number): Promise<string> {
    try {
      const formattedAmount = ethers.utils.parseUnits(amount.toString(), decimals);
      const transactionResponse = await this.contract.deposit(tokenAddress, formattedAmount);
      await transactionResponse.wait();
      return transactionResponse.hash;
    } catch (error) {
      console.error("Failed to deposit:", error);
      throw error;
    }
  }

  async withdraw(tokenAddress: string, amount: number, decimals: number, depositorAddress: string, recipientAddress: string): Promise<string> {
    try {
      const formattedAmount = ethers.utils.parseUnits(amount.toString(), decimals);
      const transactionResponse = await this.contract.withdraw(tokenAddress, formattedAmount, depositorAddress, recipientAddress);
      await transactionResponse.wait();
      return transactionResponse.hash;
    } catch (error) {
      console.error("Failed to withdraw:", error);
      throw error;
    }
  }
}
