import { useContractReader } from "eth-hooks";
import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch } from "antd";
import { ethers } from "ethers";
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Address } from "../components";

function Endaoment({ yourLocalBalance, readContracts, address, tx, writeContracts }) {
  const { vaultAddress } = useParams();

  const beneficiary = useContractReader(readContracts, 'Endaoment', 'beneficiary');
  const endaomentBalance = useContractReader(readContracts, 'Endaoment', 'balance');
  const currency = useContractReader(readContracts, 'Endaoment', 'want');
  const myBalance = useContractReader(readContracts, 'Endaoment', 'principalBalances', [ address ])

  const myCurrencyBalance = useContractReader(readContracts, 'DAI', 'balanceOf', [ address ])
  const myApproval = useContractReader(readContracts, 'DAI', 'allowance', [ address, readContracts.Endaoment.address ]);

  const [depositAmount, setDepositAmount] = useState();
  const [withdrawAmount, setWithdrawAmount] = useState();

  return (
    <div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 600, margin: "auto", marginTop: 64 }}>
        <h2>Beneficiary: { beneficiary ? <Address address={beneficiary} /> : '...' }</h2>
        <h2>Currency: <img src="https://assets.coingecko.com/coins/images/9956/thumb/4943.png?1636636734" height="25" width="25" />DAI</h2>
        <h2>Trust Vault Balance: {endaomentBalance ? ethers.utils.formatEther(endaomentBalance) : "..."}</h2>
        <h2>Your balance: {endaomentBalance ? ethers.utils.formatEther(endaomentBalance) : "..."}</h2>

        <Divider />

        <h4>Deposit</h4>
        <h4>Available balance: { myCurrencyBalance ? ethers.utils.formatEther(myCurrencyBalance) : '...' }</h4>
        <div style={{ margin: 8 }}>
          <Input
            onChange={e => {
              setDepositAmount(e.target.value);
            }}
          />
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              if (myApproval.lt(ethers.utils.parseEther(depositAmount))) {
                await tx(writeContracts.DAI.approve(readContracts.Endaoment.address, ethers.utils.parseEther(depositAmount)));
              }
              await tx(writeContracts.Endaoment.deposit(ethers.utils.parseEther(depositAmount)));
            }}
          >
            Deposit
          </Button>
        </div>

        <Divider />

        <h4>Withdrawl Principal</h4>

        <div style={{ margin: 8 }}>
          <Input
            onChange={e => {
              setWithdrawAmount(e.target.value);
            }}
          />
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              await tx(writeContracts.Endaoment.withdraw(ethers.utils.parseEther(withdrawAmount)));
            }}
          >
            Withdraw
          </Button>

          <Divider />

          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              await tx(writeContracts.Endaoment.withdraw(ethers.utils.parseEther(withdrawAmount)));
            }}
          >
            Withdraw interest to Beneficiary
          </Button>

        </div>

      </div>
    </div>
  );
}

export default Endaoment;
