import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import React from "react";
import { useParams, Link } from "react-router-dom";
import { Faucet } from "../components";

function Testing({ readContracts, address, tx, writeContracts, localProvider, localChainId, userSigner, loadWeb3Modal, web3Modal }) {

  const myCurrencyBalance = useContractReader(readContracts, "MockERC20", "balanceOf", [ address ])

  const mintMockDai = async () => {
    tx(writeContracts.MockERC20.mintTo(address, ethers.utils.parseEther("10000")));
  }

  const mockInterest = async () => {
    tx(writeContracts.MockRewardPool.mockInterestTo(readContracts.EndaomentStrategy.address, ethers.utils.parseEther('0.123456789')));
  };

  return (


    <div className="md:flex md:items-center md:justify-between">
      <div className="flex-1 min-w-0">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:tracking-tight sm:truncate">
          Functions for Testing
        </h2>

        My DAI Balance: { myCurrencyBalance ? ethers.utils.formatEther(myCurrencyBalance) : "..." }
        <button
          type="button"
          className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={mintMockDai}
        >
          Give me MockDAI
        </button>

        <button
          type="button"
          className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={mockInterest}
        >
          Accrue Interest
        </button>

        <Faucet
          localProvider={localProvider}
          ensProvider={localProvider}
          placeholder={"Send local faucet"}
        />

      </div>
    </div>

  );
}

export default Testing;
