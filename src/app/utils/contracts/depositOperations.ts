import { toast } from "react-toastify";
import { initializeSigner, Escrow, ERC20 } from ".";

export const approveToken = async (tokenAddress: string, depositAmount: number): Promise<boolean> => {
  try {
    const signer = initializeSigner();
    const erc20 = new ERC20(tokenAddress, signer);
    const escrowAddress = `${process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS}`;
    const signerAddress = await signer.getAddress();

    const beforeAllowance = await erc20.getAllowance(signerAddress, escrowAddress);
    console.log(`Current allowance before is ${beforeAllowance} tokens.`);

    if (parseFloat(beforeAllowance) < depositAmount) {
      const txhash = await erc20.approve(escrowAddress, depositAmount);
      console.log(`Approval transaction hash: ${txhash}`);

      const afterAllowance = await erc20.getAllowance(signerAddress, escrowAddress);
      console.log(`Current allowance after is ${afterAllowance} tokens.`);

      toast.info("Tokens approved.");
      return true;
    } else {
      console.log("Approval not necessary, sufficient allowance already granted.");
      toast.info("Approval not necessary, sufficient allowance already granted.");
      return true;
    }
  } catch (error: any) {
    console.error("Approval failed:", error);
    return false;
  }
};

export const depositToken = async (projectId: string, tokenAddress: string, depositAmount: number): Promise<boolean> => {
  try {
    const signer = initializeSigner();
    const escrow = new Escrow(signer);

    const txhash = await escrow.deposit(projectId, tokenAddress, depositAmount);
    console.log("Deposit transaction hash:", txhash);
    toast.info("Tokens deposited successfully.");
    return true;
  } catch (error: any) {
    console.error("Deposit failed:", error);
    return false;
  }
};
