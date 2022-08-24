const { ethers } = require("hardhat");

const localChainId = "31337";
const myAddress = '0xDb03c86Aca4a10944Bb601634231b411E036d2ca';

// TODO: Only deploy on testnets
module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // Deploy mock DAI
  await deploy("MockERC20", {
    from: deployer,
    args: [
      'Mock DAI',
      'DAO',
      1000000,
    ],
    log: true,
  });
  const mockERC20 = await ethers.getContract("MockERC20", deployer);

  // Give me some tokens
  await mockERC20.mintTo(myAddress, ethers.utils.parseEther('10000'));

  // Deploy mock reward pool
  await deploy("MockRewardPool", {
    from: deployer,
    args: [
      mockERC20.address,
    ],
    log: true,
  });
};
module.exports.tags = ["MockERC20", "MockRewardPool"];
