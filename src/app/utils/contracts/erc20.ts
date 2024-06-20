import { ethers } from "ethers";
import { erc20ABI } from "../../constants/abi";

export class ERC20 {
  private contract: ethers.Contract;

  constructor(contractAddress: string, signer: ethers.Signer) {
    if (!ethers.utils.isAddress(contractAddress)) {
      throw new Error("Invalid contract address.");
    }
    this.contract = new ethers.Contract(contractAddress, erc20ABI, signer);
  }

  async getBalance(address: string): Promise<string> {
    try {
      const decimals = await this.getDecimals();
      const balance = await this.contract.balanceOf(address);
      return ethers.utils.formatUnits(balance, decimals);
    } catch (error: any) {
      console.error("Failed to retrieve balance:", error);
      throw new Error(`Failed to retrieve balance: ${error.message}`);
    }
  }

  async getDecimals(): Promise<number> {
    try {
      return await this.contract.decimals();
    } catch (error: any) {
      console.error("Failed to retrieve decimals:", error);
      throw new Error(`Failed to retrieve decimals: ${error.message}`);
    }
  }

  async getSymbol(): Promise<string> {
    try {
      return await this.contract.symbol();
    } catch (error: any) {
      console.error("Failed to retrieve symbol:", error);
      throw new Error(`Failed to retrieve symbol: ${error.message}`);
    }
  }

  async getAllowance(owner: string, spender: string): Promise<string> {
    try {
      const decimals = await this.getDecimals();
      const allowance = await this.contract.allowance(owner, spender);
      return ethers.utils.formatUnits(allowance, decimals);
    } catch (error: any) {
      console.error("Failed to retrieve allowance:", error);
      throw new Error(`Failed to retrieve allowance: ${error.message}`);
    }
  }

  async approve(spender: string, amount: number): Promise<string> {
    try {
      const decimals = await this.getDecimals();
      const formattedAmount = ethers.utils.parseUnits(amount.toString(), decimals);
      const transactionResponse = await this.contract.approve(spender, formattedAmount);
      await transactionResponse.wait();
      return transactionResponse.hash;
    } catch (error: any) {
      console.error("Approval failed:", error);
      throw new Error(`Approval failed: ${error.message}`);
    }
  }

  async transfer(to: string, amount: number): Promise<string> {
    try {
      const decimals = await this.getDecimals();
      const formattedAmount = ethers.utils.parseUnits(amount.toString(), decimals);
      const transactionResponse = await this.contract.transfer(to, formattedAmount);
      await transactionResponse.wait();
      return transactionResponse.hash;
    } catch (error: any) {
      console.error("Transfer failed:", error);
      throw new Error(`Transfer failed: ${error.message}`);
    }
  }
}
