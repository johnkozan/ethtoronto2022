const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("Endaoment", function () {
  let factory;
  let mockDAI;
  let createdVault;
  let strategy;
  let rewardPool;
  let keeper = ethers.constants.AddressZero; // or actual address

  // for debugging:
  async function printBalances(msg) {
    const [owner, user] = await ethers.getSigners();
    console.log(`${msg} Balances:
      rewardPool: ${ethers.utils.formatEther(await mockDAI.balanceOf(rewardPool.address))}
      strategy  : ${ethers.utils.formatEther(await mockDAI.balanceOf(strategy.address))}
      vault     : ${ethers.utils.formatEther(await mockDAI.balanceOf(createdVault.address))}
      factory   : ${ethers.utils.formatEther(await mockDAI.balanceOf(factory.address))}
      user     : ${ethers.utils.formatEther(await mockDAI.balanceOf(user.address))}
      `);
  }

  // quick fix to let gas reporter fetch data from gas station & coinmarketcap
  before((done) => {
    setTimeout(done, 2000);
  });

  // Deploy mock DAI
  before(async () => {
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockDAI = await MockERC20.deploy('Dai', 'DAI', '10000000');
  });

  // Deploy mock reward pool
  before(async () => {
    const MockRewardPool = await ethers.getContractFactory("MockRewardPool");
    rewardPool = await MockRewardPool.deploy(mockDAI.address);
  });

  describe("EndaomentFactory", function () {

    it("should deploy", async function () {
      const EndaomentFactory = await ethers.getContractFactory("EndaomentFactory");

      factory = await EndaomentFactory.deploy();

      const EndaomentStrategy = await ethers.getContractFactory("EndaomentStrategy");
      strategy = await EndaomentStrategy.deploy(
        mockDAI.address,  // currency to deposit
        rewardPool.address,
        factory.address,  //  Set vault to factory contract
        keeper,
      );

      // TODO: predictAddress instead of 2-step deploy
      await factory.setStrategy(strategy.address);

      expect(await factory.strategy()).to.equal(strategy.address);
    });


    it("should create new vaults", async function () {
      const beneficiary = "0x2546BcD3c84621e976D8185a91A922aE77ECEc30"; // random addr
      const deployTx = await factory.deploy(beneficiary);
      const result = await deployTx.wait();

      expect(deployTx).to.emit(factory, "NewEndaoment");
      createdVault = await (await ethers.getContractFactory('EndaomentVault')).attach(
        result.events.find(e => e.event === 'NewEndaoment').args[0]
      );
    });

    it("should determine if an address is a vault", async () => {
      expect(await factory.isVault(createdVault.address)).to.equal(true);
      expect(await factory.isVault('0xcd3B766CCDd6AE721141F452C550Ca635964ce71')).to.equal(false);
    });

  });

  describe("EndaomentVault", function () {

    it("should take deposits", async () => {
      const [owner, user] = await ethers.getSigners();

      // Give user some DAI
      await mockDAI.mintTo(user.address, ethers.utils.parseEther('10000'));

      // User sets allowance
      await mockDAI.connect(user).approve(createdVault.address, ethers.utils.parseEther('1000'));

      // User deposits to vault
      const depositTx = await createdVault.connect(user).deposit(ethers.utils.parseEther('1000'));
      // TODO: expect event emited?

      expect(await mockDAI.balanceOf(user.address)).to.equal(ethers.utils.parseEther('9000'));
      expect(await mockDAI.balanceOf(rewardPool.address)).to.equal(ethers.utils.parseEther('1000'));
    });

    it("should not allow interest to be withdrawn", async () => {
      const [owner, user] = await ethers.getSigners();

      //Mock accrue interest
      await rewardPool.mockInterest(ethers.utils.parseEther('0.123456789'));
      await strategy.harvest();

      expect(await mockDAI.balanceOf(rewardPool.address)).to.equal(ethers.utils.parseEther('1000.123456789'));
      await expect(createdVault.connect(user).withdraw(ethers.utils.parseEther('1000.123456789'))).to.be.reverted;
    });

    it("should allow the principal to be withdrawn", async () => {
      const [owner, user] = await ethers.getSigners();

      await rewardPool.mockInterest(ethers.utils.parseEther('0.123456789'));
      await strategy.harvest();

      expect(await mockDAI.balanceOf(rewardPool.address)).to.equal(ethers.utils.parseEther('1000.246913578'));

      await createdVault.connect(user).withdraw(ethers.utils.parseEther('1000'));  // TODO: expect event emited

      expect(await mockDAI.balanceOf(user.address)).to.equal(ethers.utils.parseEther('10000'));
      expect(await mockDAI.balanceOf(rewardPool.address)).to.equal(ethers.utils.parseEther('0.246913578'));
    });


  });
});
