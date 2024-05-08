import { ethers } from "ethers";
import { escrowABI, erc20ABI } from "../../constants/abi";

export class Escrow {
  private contract: ethers.Contract;
  public address: string;

  constructor(signer: ethers.Signer) {
    const contractAddress = `${process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS}`;
    if (!ethers.utils.isAddress(contractAddress)) {
      throw new Error("Invalid contract address.");
    }
    this.address = contractAddress;
    this.contract = new ethers.Contract(contractAddress, escrowABI, signer);
  }

  private async handleErrors(operation: string, error: any): Promise<void> {
    const detailedErrorMessage = `Operation: ${operation}, Error Message: ${error.message}`;
    console.error(detailedErrorMessage);
    throw new Error(detailedErrorMessage);
  }

  private async getTokenDecimals(tokenAddress: string): Promise<number | undefined> {
    try {
      const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, this.contract.signer);
      return await tokenContract.decimals();
    } catch (error) {
      await this.handleErrors("get token decimals", error);
      return undefined;
    }
  }

  async getProjectInfo(projectId: string): Promise<{ tokenAddress: string; depositAmount: string } | undefined> {
    try {
      const project = await this.contract.projects(ethers.utils.formatBytes32String(projectId));
      const decimals = await this.getTokenDecimals(project.tokenAddress);
      return {
        tokenAddress: project.tokenAddress,
        depositAmount: ethers.utils.formatUnits(project.depositAmount, decimals)
      };
    } catch (error) {
      await this.handleErrors("get project information", error);
      return undefined;
    }
  }

  async deposit(projectId: string, tokenAddress: string, amount: number): Promise<string | undefined> {
    try {
      const decimals = await this.getTokenDecimals(tokenAddress);
      const formattedAmount = ethers.utils.parseUnits(amount.toString(), decimals);
      const transactionResponse = await this.contract.deposit(ethers.utils.formatBytes32String(projectId), tokenAddress, formattedAmount);
      await transactionResponse.wait();
      return transactionResponse.hash;
    } catch (error) {
      await this.handleErrors("deposit", error);
      return undefined;
    }
  }

  async withdraw(projectId: string, amount: number, recipientAddress: string): Promise<string | undefined> {
    try {
      // プロジェクト情報を取得
      const projectInfo = await this.getProjectInfo(projectId);
      if (!projectInfo) {
          throw new Error("Project information not found.");
      }

      // トークンの小数点以下の桁数を取得
      const decimals = await this.getTokenDecimals(projectInfo.tokenAddress);
      if (decimals === undefined) {
          throw new Error("Failed to retrieve token decimals.");
      }

      // 金額を適切な単位に変換
      const formattedAmount = ethers.utils.parseUnits(amount.toString(), decimals);

      // トークンを引き出す
      const transactionResponse = await this.contract.withdraw(ethers.utils.formatBytes32String(projectId), formattedAmount, recipientAddress);
      await transactionResponse.wait();

      // トランザクションハッシュを返す
      return transactionResponse.hash;
    } catch (error) {
      await this.handleErrors("withdraw", error);
      return undefined;
    }
  }

  async removeProject(projectId: string): Promise<string | undefined> {
    try {
      const transactionResponse = await this.contract.removeProject(ethers.utils.formatBytes32String(projectId));
      await transactionResponse.wait();
      return transactionResponse.hash;
    } catch (error) {
      await this.handleErrors("remove project", error);
      return undefined;
    }
  }
}
