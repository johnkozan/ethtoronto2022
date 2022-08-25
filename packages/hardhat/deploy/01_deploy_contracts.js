const { ethers } = require("hardhat");
const { predictAddresses } = require("../scripts/predictAddresses");

//const testnetStrategy = '0x9712b6aff7d2db96097565eb8b2183b75e839130';
//const name = 'Test Endaoment';
//const symbol = 'TEST'

//const testnetDAI = '0xEC5dCb5Dbf4B114C9d0F65BcCAb49EC54F6A0867'

//const testnetRewardPool = '0x8d81807f19b97fa86eecab32f1376645fbb4d2f9'
//const testnetVault = '0xf439b695bb28c9e9865170c1b3e98f5eb4ce9b48'

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const keeper = deployer;

  const mockDai = await ethers.getContract("MockERC20", deployer);
  const mockRewardPool = await ethers.getContract("MockRewardPool", deployer);
  const predictedAddresses = await predictAddresses({ creator: deployer });

  // Deploy shared vault
  //const EndaomentSharedVault = await ethers.getContractFactory("EndaomentSharedVault");
  /// TODO: SharedVault and Strategy deploys will repeat everytime this script is run
  // because of the predictedAddresses, which will change everytime.
  const sharedVault = await deploy("EndaomentSharedVault", {
    from: deployer,
    args: [
      predictedAddresses.strategy,
      "Endaoment Shared Vault",
      "ESV",
      21600       // 6 hour delay
    ],
    log: true,
  });

  // Deploy strategy
  await deploy("EndaomentStrategy", {
    from: deployer,
    args: [
      mockDai.address, // Currency
      mockRewardPool.address,
      predictedAddresses.vault,
      keeper,
    ],
    log: true,
    waitConfirmations: 5,
  });

  const EndaomentStrategy = await ethers.getContract("EndaomentStrategy", deployer);

  // Deploy Factory
  await deploy("EndaomentFactory", {
    from: deployer,
    args: [
      predictedAddresses.vault,    // shared vault
    ],
    log: true,
    waitConfirmations: 5,
  });
};
