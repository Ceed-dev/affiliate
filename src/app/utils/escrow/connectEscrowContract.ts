import { ethers } from "ethers";
import { escrowABI } from "../../constants/escrowAbi";

export function connectEscrowContract(contractAddress: string, signer: ethers.Signer): ethers.Contract {
  return new ethers.Contract(contractAddress, escrowABI, signer);
}