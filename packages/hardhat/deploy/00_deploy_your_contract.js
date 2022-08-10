// deploy/00_deploy_your_contract.js

const { ethers } = require("hardhat");

const localChainId = "31337";

const testnetStrategy = '0x9712b6aff7d2db96097565eb8b2183b75e839130';
const name = 'Test Endaoment';
const symbol = 'TEST'

const testnetDAI = '0xEC5dCb5Dbf4B114C9d0F65BcCAb49EC54F6A0867'

const testnetRewardPool = '0x8d81807f19b97fa86eecab32f1376645fbb4d2f9'
const testnetVault = '0xf439b695bb28c9e9865170c1b3e98f5eb4ce9b48'

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const keeper = deployer;

  // Deploy strategy
  await deploy("EndaomentStrategy", {
    from: deployer,
    args: [
      testnetDAI, // Currency
      testnetRewardPool,
      testnetVault,
      keeper,
    ],
    log: true,
    waitConfirmations: 5,
  });

  const EndaomentStrategy = await ethers.getContract("EndaomentStrategy", deployer);

  // Deploy Deployer
  await deploy("EndaomentDeployer", {
    from: deployer,
    args: [
      EndaomentStrategy.address,
    ],
    log: true,
    waitConfirmations: 5,
  });

};
module.exports.tags = ["EndaomentStrategy", "EndaomentDeployer"];
