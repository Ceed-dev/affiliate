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
    const decimals = await this.getDecimals();
    const balance = await this.contract.balanceOf(address);
    return ethers.utils.formatUnits(balance, decimals);
  }

  async getDecimals(): Promise<number> {
    return await this.contract.decimals();
  }

  async getSymbol(): Promise<string> {
    return await this.contract.symbol();
  }

  async getAllowance(owner: string, spender: string): Promise<string> {
    const decimals = await this.getDecimals();
    const allowance = await this.contract.allowance(owner, spender);
    return ethers.utils.formatUnits(allowance, decimals);
  }

  async approve(spender: string, amount: number): Promise<string> {
    const decimals = await this.getDecimals();
    const formattedAmount = ethers.utils.parseUnits(amount.toString(), decimals);
    const transactionResponse = await this.contract.approve(spender, formattedAmount);
    await transactionResponse.wait();
    return transactionResponse.hash;
  }
}
