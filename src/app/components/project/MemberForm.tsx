import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useActiveWallet } from "thirdweb/react";
import { isAddress } from "ethers/lib/utils";
import { toast } from "react-toastify";
import { getUserRoleAndName } from "../../utils/userUtils";

type MemberFormProps = {
  ownerAddresses: string[];
  handleOwnerChange: (newOwnerAddresses: string[]) => void;
};

export const MemberForm: React.FC<MemberFormProps> = ({
  ownerAddresses,
  handleOwnerChange,
}) => {
  const wallet = useActiveWallet();
  const address = wallet?.getAccount()?.address;
  const [newOwnerAddress, setNewOwnerAddress] = useState("");
  const [isCheckingNewOwnerAddress, setIsCheckingNewOwnerAddress] = useState(false);

  // Object to store usernames with wallet addresses as keys
  const [usernames, setUsernames] = useState<{ [address: string]: string }>({});

  // Fetch and initialize owner addresses and their usernames when component mounts or changes
  useEffect(() => {
    const initializeOwners = async () => {
      if (address && ownerAddresses.length === 0) {
        // If no owners yet (new project), set the current user's address as the initial owner
        const initialOwners = [address];
        handleOwnerChange(initialOwners);

        // Fetch and store the username associated with the current user's address
        const userRoleAndName = await getUserRoleAndName(address);
        setUsernames((prevUsernames) => ({
          ...prevUsernames,
          [address]: userRoleAndName?.username || "Unregistered",
        }));
      } else if (ownerAddresses.length > 0) {
        // Fetch and store usernames for each address in an existing project
        const usernamesMap: { [address: string]: string } = {};
        for (const ownerAddress of ownerAddresses) {
          const userRoleAndName = await getUserRoleAndName(ownerAddress);
          usernamesMap[ownerAddress] = userRoleAndName?.username || "Unregistered";
        }
        setUsernames((prevUsernames) => ({
          ...prevUsernames,
          ...usernamesMap,
        }));
      }
    };

    initializeOwners();
  }, [address, ownerAddresses, handleOwnerChange]);

  // Adds a new owner address, with validations and username fetching
  const handleAddOwner = async () => {
    setIsCheckingNewOwnerAddress(true);

    // Validate address format
    if (!isAddress(newOwnerAddress)) {
      setNewOwnerAddress("");
      toast.error("Invalid wallet address.");
      setIsCheckingNewOwnerAddress(false);
      return;
    }

    // Check for duplicate address in the current list
    if (ownerAddresses.includes(newOwnerAddress)) {
      setNewOwnerAddress("");
      toast.error("Address already exists.");
      setIsCheckingNewOwnerAddress(false);
      return;
    }

    // Fetch role and username for the new address
    const userRoleAndName = await getUserRoleAndName(newOwnerAddress);

    // Prevent adding the address if user is registered as an Affiliate
    if (userRoleAndName?.role === "Affiliate") {
      setNewOwnerAddress("");
      toast.error("This user is registered as an Affiliate and cannot be added as a team member.");
      setIsCheckingNewOwnerAddress(false);
      return;
    }

    // Update usernames: use returned username if available, otherwise mark as "Unregistered"
    setUsernames((prevUsernames) => ({
      ...prevUsernames,
      [newOwnerAddress]: userRoleAndName ? userRoleAndName.username : "Unregistered",
    }));

    // Add the new owner to the owner list
    handleOwnerChange([...ownerAddresses, newOwnerAddress]);
    setNewOwnerAddress("");
    toast.success("Owner added successfully.");
    setIsCheckingNewOwnerAddress(false);
  };

  // Removes an owner address and updates usernames
  const handleRemoveOwner = (address: string) => {
    const updatedOwners = ownerAddresses.filter((owner) => owner !== address);
    handleOwnerChange(updatedOwners);

    // Remove the username associated with the removed address
    setUsernames((prevUsernames) => {
      const { [address]: _, ...remainingUsernames } = prevUsernames;
      return remainingUsernames;
    });

    toast.success("Owner removed successfully.");
  };

  return (
    <>
      <h1 className="text-2xl font-bold">Members</h1>
      <div className="space-y-5">

        {/* Add New Member Input */}
        <div className="space-y-2">
          <label>Add New Member</label>
          <div className="flex items-center gap-5">
            <input
              type="text"
              value={newOwnerAddress}
              onChange={(e) => setNewOwnerAddress(e.target.value)}
              placeholder="Wallet address"
              className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddOwner}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                isCheckingNewOwnerAddress ? "bg-gray-200" : "bg-slate-100 hover:bg-slate-200"
              }`}
              disabled={isCheckingNewOwnerAddress}
            >
              {isCheckingNewOwnerAddress ? (
                <Image
                  src="/assets/common/loading.png"
                  height={30}
                  width={30}
                  alt="loading"
                  className="animate-spin"
                />
              ) : (
                "Add"
              )}
            </button>
          </div>
        </div>

        {/* Display List of Current Owners */}
        {ownerAddresses.length > 0 && (
          <div className="border border-gray-300 rounded-lg divide-y divide-gray-300">
            {ownerAddresses.map((ownerAddress, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-4 first:rounded-t-lg last:rounded-b-lg"
              >
                <div>
                  <p className="font-semibold text-gray-900">{usernames[ownerAddress]}</p>
                  <p className="text-xs text-gray-500">{ownerAddress.slice(0, 6)}...{ownerAddress.slice(-4)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveOwner(ownerAddress)}
                  className={`${
                    ownerAddress === address
                      ? "cursor-not-allowed bg-gray-300"
                      : "bg-red-200 hover:bg-red-300"
                  } p-2 rounded-md transition`}
                  disabled={ownerAddress === address}
                >
                  <Image
                    src="/assets/common/trash.png"
                    alt="trash icon"
                    height={20}
                    width={20}
                    className="transition duration-300 ease-in-out transform"
                  />
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </>
  );
};