import React, { useState } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { initializeSigner, Escrow, ERC20 } from "../utils/contracts";

type DepositButtonProps = {
  tokenAddress: string;
  depositAmount: number;
};

export const DepositButton: React.FC<DepositButtonProps> = ({tokenAddress, depositAmount}) => {
  const signer = initializeSigner(`${process.env.PROVIDER_URL}`);
  const escrow = new Escrow(signer);
  const erc20 = new ERC20(tokenAddress, signer);

  const [depositStatus, setDepositStatus] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const approveToken = async () => {
    try {
      setDepositStatus("(1/3) Checking allowance...");
      const beforeAllowance = await erc20.getAllowance(await signer.getAddress(), escrow.address);
      console.log(`Current allowance before is ${beforeAllowance} tokens.`);

      if (parseFloat(beforeAllowance) < depositAmount) {
        setDepositStatus("(2/3) Approving tokens...");
        const txhash = await erc20.approve(escrow.address, depositAmount);
        console.log(`Approval transaction hash: ${txhash}`);
        const afterAllowance = await erc20.getAllowance(await signer.getAddress(), escrow.address);
        console.log(`Current allowance after is ${afterAllowance} tokens.`);
        toast.info("Tokens approved.");
      } else {
        console.log("Approval not necessary, sufficient allowance already granted.");
        toast.info("Approval not necessary, sufficient allowance already granted.");
      }
    } catch (error: any) {
      console.error("Approval failed:", error);
      toast.error(`Approval failed: ${error.message}`);
    }
  };

  const depositTokens = async () => {
    try {
      setDepositStatus("(3/3) Depositing tokens...");
      const decimals = await erc20.getDecimals();
      const txhash = await escrow.deposit(tokenAddress, depositAmount, decimals);
      console.log("Deposit transaction hash:", txhash);
      toast.info("Tokens deposited successfully.");
    } catch (error: any) {
      console.error("Deposit failed:", error);
      toast.error(`Deposit failed: ${error.message}`);
    }
  };

  const handleDeposit = async () => {
    setIsProcessing(true);
    await approveToken();
    await depositTokens();
    setIsProcessing(false);
  };

  return (
    <button
      onClick={handleDeposit}
      disabled={isProcessing}
      className={`w-2/3 mx-auto h-12 ${isProcessing ? "bg-gray-400" : "bg-sky-500"} text-white rounded-lg p-2 outline-none transition duration-300 ease-in-out transform ${isProcessing ? "" : "hover:scale-105"}`}
      type="button"
    >
      {isProcessing 
        ? 
          <div className="flex flex-row items-center justify-center gap-5">
            <Image src={"/loading.png"} height={30} width={30} alt="loading.png" className="animate-spin" />
            {depositStatus}
          </div>
        : "Deposit to Escrow"
      }
    </button>
  );
}