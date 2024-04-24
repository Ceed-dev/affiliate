import { ethers } from "ethers";
import { escrowABI } from "../../constants/abi";

export class Escrow {
  private contract: ethers.Contract;

  constructor(signer: ethers.Signer) {
    this.contract = new ethers.Contract(
      `${process.env.ESCROW_CONTRACT_ADDRESS}`, 
      escrowABI, 
      signer
    );
  }

  async deposit(tokenAddress: string, amount: number, decimals: number): Promise<string> {
    const formattedAmount = ethers.utils.parseUnits(amount.toString(), decimals);
    const transactionResponse = await this.contract.deposit(tokenAddress, formattedAmount);
    await transactionResponse.wait();
    return transactionResponse.hash;
  }

  async withdraw(tokenAddress: string, amount: number, decimals: number, depositorAddress: string, recipientAddress: string): Promise<string> {
    const formattedAmount = ethers.utils.parseUnits(amount.toString(), decimals);
    const transactionResponse = await this.contract.withdraw(tokenAddress, formattedAmount, depositorAddress, recipientAddress);
    await transactionResponse.wait();
    return transactionResponse.hash;
  }
}
