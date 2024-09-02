import { Tier } from "../types";

type TieredDetailsModalProps = {
  tiers: Tier[];
  closeModal: () => void;
};

export const TieredDetailsModal: React.FC<TieredDetailsModalProps> = ({ tiers, closeModal }) => {
  return (
    <div className="p-4 text-center">
      <h2 className="text-lg font-semibold mb-4">Tiered Reward Details</h2>
      {tiers.map((tier, index) => (
        <div key={index} className="mb-4">
          <p><strong>Tier {index + 1}:</strong></p>
          <p>Conversions Required: {tier.conversionsRequired}</p>
          <p>Reward Amount: {tier.rewardAmount} tokens</p>
        </div>
      ))}
      <button onClick={closeModal} className="mt-4 bg-red-500 text-white p-2 rounded">Close</button>
    </div>
  );
};