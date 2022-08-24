import { useContractReader, useContractLoader } from "eth-hooks";
import { ethers } from "ethers";
import { Button, Card, Col, Divider, Input, Progress, Row, Slider, Spin, Switch } from "antd";
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Account, Address } from "../components";

import VAULTABI from '../contracts/ABI/EndaomentVault.json'

function Testing({ readContracts, address, tx, writeContracts, localProvider, localChainId, userSigner, loadWeb3Modal, web3Modal }) {

  const myCurrencyBalance = useContractReader(readContracts, 'MockERC20', 'balanceOf', [ address ])

  const mintMockDai = async () => {
    tx(writeContracts.MockERC20.mintTo(address, ethers.utils.parseEther('10000')));
  }

  const mockInterest = async () => {
    tx(writeContracts.MockRewardPool.mockInterestTo(readContracts.EndaomentStrategy.address, ethers.utils.parseEther('0.123456789')));
  };

  return (
    <div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 600, margin: "auto", marginTop: 64 }}>
        <h1>Testing</h1>

        My DAI Balance: { myCurrencyBalance ? ethers.utils.formatEther(myCurrencyBalance) : '...' }

        <br />

        <Button onClick={mintMockDai}>
          Give me DAI
        </Button>

        <Divider />

        <Button onClick={mockInterest}>
          Accrue interest
        </Button>

      </div>
    </div>
  );
}

export default Testing;
