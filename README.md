# Social Grazing

## ETHToronto 2022 Hackathon submission

### Vision

A simple Beefy vault deployer to fund public goods and more through crowdfunded crypto trusts.

### Description

Direct funds toward causes you care about with Beefy vault interest. Withdraw your full principal at any time. Complete with deployer to enable anyone to create a custom funding stream. A new DeFi primitive built on top of Beefy vaults.

We forked the MoonPot Beefy Vault contracts and modified the logic to redirect interest to the address of a public goods project, social cause, creator, or anything you care about. Depositors retain full control and ability to withdraw funds at any time, while allocating interest generated by the vault. Vaults essentially operate as a decentralized trust to benefit a specific cause.

We also created a deployer to allow anyone to create a new Beefy vault to the beneficiary of their choice with a couple clicks.

Contracts were deployed and tested on the Polygon Mumbai Testnet, but should be deployable on any EVM chain supported by Beefy. Built using Scaffold ETH and Beefy Finance.



## Development

Start hardhat chain:
` yarn chain`

Compile and deploy contracts:
` yarn deploy `

Start development server:
` yarn serve `


## References

* Built on [Beefy Finance](https://github.com/beefyfinance/beefy-contracts)
* Using [Scaffold-eth](https://github.com/scaffold-eth/scaffold-eth)
