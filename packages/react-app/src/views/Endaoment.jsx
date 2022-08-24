import { useContractReader, useContractLoader } from "eth-hooks";
import { Button, Col, Divider, Input, Row } from "antd";
import { ethers } from "ethers";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Account, Address } from "../components";

import VAULTABI from '../contracts/ABI/EndaomentVault.json'

function Endaoment({ readContracts, address, tx, writeContracts, localProvider, localChainId, userSigner, loadWeb3Modal, web3Modal }) {
  const { vaultAddress } = useParams();

  const contractConfig = {
    deployedContracts: {},
    externalContracts: {
      [localChainId]: {
        contracts: {
          EndaomentVault: {
            address: vaultAddress,
            abi: VAULTABI,
          },
        },
      },
    },
  };

  const vaultContract = useContractLoader(localProvider, contractConfig);
  const vaultWriter = useContractLoader(userSigner, contractConfig, localChainId);
  const beneficiary = useContractReader(vaultContract, 'EndaomentVault', 'beneficiary');
  const endaomentPrincipalBalance = useContractReader(vaultContract, 'EndaomentVault', 'totalSupply');
  const endaomentTotalBalance = useContractReader(vaultContract, 'EndaomentVault', 'balance');
  const endaomentName = useContractReader(vaultContract, 'EndaomentVault', 'name');
  const currency = useContractReader(vaultContract, 'EndaomentVault', 'want');
  const myBalance = useContractReader(vaultContract, 'EndaomentVault', 'balanceOf', [ address ])

  const myCurrencyBalance = useContractReader(readContracts, 'MockERC20', 'balanceOf', [ address ])
  const myApproval = useContractReader(readContracts, 'MockERC20', 'allowance', [ address, vaultAddress ]);

  const availableToWithdraw = (!!endaomentTotalBalance && !!endaomentPrincipalBalance) ? endaomentTotalBalance.sub(endaomentPrincipalBalance) : undefined;

  const [depositAmount, setDepositAmount] = useState();
  const [withdrawAmount, setWithdrawAmount] = useState();

  const depositAmountValid = depositAmount && myCurrencyBalance && ethers.utils.parseEther(depositAmount).lte(myCurrencyBalance);
  const withdrawAmountValid = withdrawAmount && myBalance && ethers.utils.parseEther(withdrawAmount).lte(myBalance);

  const ownerDetails = (
    <div>
      <strong>You are the beneficiary of this vault!</strong>
      <br />
      <h4>Balance including interest: { endaomentTotalBalance ? ethers.utils.formatEther(endaomentTotalBalance) : '...' }</h4>
      <h4>Less: principal: { endaomentPrincipalBalance ? ethers.utils.formatEther(endaomentPrincipalBalance) : '...' }</h4>
      <h4>Available to withdraw: { availableToWithdraw ? ethers.utils.formatEther(availableToWithdraw) : '...' }</h4>
      <Button
        style={{ marginTop: 8 }}
        onClick={async () => {
          await tx(vaultWriter.EndaomentVault.withdrawInterest());
        }}
      >
        Withdraw interest to Beneficiary
      </Button>
    </div>
  );

  const depositWithdraw = (
    <div>
    <Row>
      <Col span={12}>
        <h3>Deposit</h3>
      </Col>
      <Col span={12}>
        <h3>Withdraw</h3>
      </Col>
    </Row>

    <Row>
      <Col span={12}>
        <h4>Balance: { myCurrencyBalance ? ethers.utils.formatEther(myCurrencyBalance) : '...' }</h4>
      </Col>
      <Col span={12}>
        <h4>Balance: {myBalance ? ethers.utils.formatEther(myBalance) : "..."}</h4>
      </Col>
    </Row>

    <Row>
      <Col span={12}>
        <div style={{ margin: 8 }}>
          <Input
            onChange={e => {
              setDepositAmount(e.target.value);
            }}
            value={depositAmount}
          />
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              if (myApproval.lt(ethers.utils.parseEther(depositAmount))) {
                await tx(writeContracts.MockERC20.approve(vaultAddress, ethers.utils.parseEther(depositAmount)));
              }
              await tx(vaultWriter.EndaomentVault.deposit(ethers.utils.parseEther(depositAmount)));
              setDepositAmount(undefined);
            }}
            disabled={!depositAmountValid}
          >
            Deposit
          </Button>
        </div>
      </Col>

      <Col span={12}>
        <div style={{ margin: 8 }}>
          <Input
            onChange={e => {
              setWithdrawAmount(e.target.value);
            }}
            value={withdrawAmount}
          />
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              await tx(vaultWriter.EndaomentVault.withdraw(ethers.utils.parseEther(withdrawAmount)));
              setWithdrawAmount(undefined);
            }}
            disabled={!withdrawAmountValid}
          >
            Withdraw
          </Button>
        </div>

      </Col>
    </Row>
    </div>
  );

  if (!beneficiary) {
    return (
      <div>
        <div style={{ border: "1px solid #cccccc", padding: 16, width: 600, margin: "auto", marginTop: 64 }}>
          Vault not found
        </div>
      </div>
    );
  }

  const connectWallet = (
    <Account
      useBurner={false}
      address={address}
      localProvider={localProvider}
      userSigner={userSigner}
      web3Modal={web3Modal}
      loadWeb3Modal={loadWeb3Modal}
    />
  );

  return (
    <div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 600, margin: "auto", marginTop: 64 }}>
        <h1>{ endaomentName ? endaomentName : '...' }</h1>
        <h2>Trust Vault Balance:</h2>
        <h3>{endaomentPrincipalBalance ? ethers.utils.formatEther(endaomentPrincipalBalance) : "..."}
          &nbsp;
          <img src="/dai.webp" height="25" width="25" />DAI
        </h3>
        <h2>Beneficiary:</h2>
        <h3>{ beneficiary ? <Address address={beneficiary} /> : '...' }</h3>

        <Divider />

        { address ? depositWithdraw : connectWallet }

        <Divider />

        { beneficiary == address ? ownerDetails : null }

      </div>

    </div>
  );
}

export default Endaoment;
