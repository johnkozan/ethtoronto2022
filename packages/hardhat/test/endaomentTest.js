const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

const { predictAddresses } = require("../scripts/predictAddresses");

use(solidity);


// Test Case:
//
// 1. Deploy the mock contracts, shared vault, strategy, factory
// 2. Beneficiary user creates a vault from the factory
// 3. Regular user deposits 1,000 tokens
// 4. Interest is accrued
// 5. User withdraws principal of 1,000
// 6. Beneficiary withdraws the accrued interest


describe("Endaoment", function () {
  let factory;
  let mockDAI;
  let createdVault;
  let sharedVault;
  let strategy;
  let rewardPool;
  let keeper = ethers.constants.AddressZero; // or actual address
  let addresses = {};

  // quick fix to let gas reporter fetch data from gas station & coinmarketcap
  before((done) => {
    setTimeout(done, 2000);
  });

  // Set addresses
  before(async () => {
    const accounts = await ethers.getSigners();
    addresses = {
      owner: accounts[0],
      beneficiary: accounts[1], // user that creates a vault
      user: accounts[2],        // user who contributes to a vault
    };
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

  // for debugging:
  async function printBalances(msg) {
    console.log(`${msg} Balances:
      rewardPool: ${ethers.utils.formatEther(await mockDAI.balanceOf(rewardPool.address))}
      strategy  : ${ethers.utils.formatEther(await mockDAI.balanceOf(strategy.address))}
      uservault : ${ethers.utils.formatEther(await mockDAI.balanceOf(createdVault.address))}
      shrdvault : ${ethers.utils.formatEther(await mockDAI.balanceOf(createdVault.address))}
      factory   : ${ethers.utils.formatEther(await mockDAI.balanceOf(factory.address))}
      user     : ${ethers.utils.formatEther(await mockDAI.balanceOf(addresses.user.address))}
      `);
  }

  describe("EndaomentFactory", function () {

    it("should deploy", async function () {
      const predictedAddresses = await predictAddresses({ creator: addresses.owner.address });

      // Deploy shared vault
      const EndaomentSharedVault = await ethers.getContractFactory("EndaomentSharedVault");
      sharedVault = await EndaomentSharedVault.deploy(
        predictedAddresses.strategy,
        "Endaoment Shared Vault",
        "ESV",
        21600       // 6 hour delay
      );
      expect(sharedVault.address).to.equal(predictedAddresses.vault);

      // deploy strategy
      const EndaomentStrategy = await ethers.getContractFactory("EndaomentStrategy");
      strategy = await EndaomentStrategy.deploy(
        mockDAI.address,  // currency to deposit
        rewardPool.address,
        predictedAddresses.vault,
        keeper,
      );
      expect(strategy.address).to.equal(predictedAddresses.strategy);

      // deploy factory
      const EndaomentFactory = await ethers.getContractFactory("EndaomentFactory");
      factory = await EndaomentFactory.deploy(predictedAddresses.vault);

      expect(await factory.sharedVault()).to.equal(predictedAddresses.vault);
    });


    it("should create new vaults", async function () {
      const name = 'Test Vault';
      const deployTx = await factory.connect(addresses.beneficiary)
        .deploy(addresses.beneficiary.address, name);
      const result = await deployTx.wait();

      expect(deployTx).to.emit(factory, "NewEndaoment");

      const newVaultEvent = result.events.find(e => e.event == 'NewEndaoment');
      const newVaultAddress = newVaultEvent.args.endaoment;
      expect(newVaultAddress.substring(0,2)).to.equal('0x');  // Should emit address of new vault
      expect(newVaultAddress.length).to.equal(42);
      createdVault = await (await ethers.getContractFactory('EndaomentVault')).attach(newVaultAddress);
      expect(await createdVault.name()).to.equal(name);
    });

    it("should determine if an address is a vault", async () => {
      expect(await factory.isVault(createdVault.address)).to.equal(true);
      expect(await factory.isVault('0xcd3B766CCDd6AE721141F452C550Ca635964ce71')).to.equal(false);
    });

  });

  describe("EndaomentVault", function () {

    // it should be owned by the beneficiary

    it("should take deposits", async () => {
      // Give user some DAI
      await mockDAI.mintTo(addresses.user.address, ethers.utils.parseEther('10000'));

      // User sets allowance
      await mockDAI.connect(addresses.user).approve(createdVault.address, ethers.utils.parseEther('1000'));

      // User deposits to vault
      const depositTx = await createdVault.connect(addresses.user).deposit(ethers.utils.parseEther('1000'));
      // TODO: expect event emited?

      expect(await mockDAI.balanceOf(addresses.user.address)).to.equal(ethers.utils.parseEther('9000'));
      expect(await mockDAI.balanceOf(rewardPool.address)).to.equal(ethers.utils.parseEther('1000'));
      expect(await sharedVault.totalSupply()).to.equal(ethers.utils.parseEther('1000'));
      expect(await createdVault.totalSupply()).to.equal(ethers.utils.parseEther('1000'));
      expect(await createdVault.balance()).to.equal(ethers.utils.parseEther('1000'));
      expect(await createdVault.balanceOf(addresses.user.address)).to.equal(ethers.utils.parseEther('1000'));
    });

    it("should not allow interest to be withdrawn", async () => {
      //Mock accrue interest
      await rewardPool.mockInterestTo(strategy.address, ethers.utils.parseEther('0.123456789'));
      await strategy.harvest();

      expect(await mockDAI.balanceOf(rewardPool.address)).to.equal(ethers.utils.parseEther('1000.123456789'));
      await expect(createdVault.connect(addresses.user).withdraw(ethers.utils.parseEther('1000.123456789'))).to.be.reverted;
    });

    it("should allow the principal to be withdrawn", async () => {
      await rewardPool.mockInterestTo(strategy.address, ethers.utils.parseEther('0.123456789'));
      await strategy.harvest();

      expect(await mockDAI.balanceOf(rewardPool.address)).to.equal(ethers.utils.parseEther('1000.246913578'));

      await createdVault.connect(addresses.user).withdraw(ethers.utils.parseEther('1000'));  // TODO: expect event emited

      expect(await mockDAI.balanceOf(addresses.user.address)).to.equal(ethers.utils.parseEther('10000'));
      expect(await mockDAI.balanceOf(createdVault.address)).to.equal(ethers.utils.parseEther('0.246913578'));
    });

    it("should calculate interest available to be withdrawn", async () => {
      const interestAvailable = await createdVault.interestAvailable();
      expect(interestAvailable).to.equal(ethers.utils.parseEther('0.246913578'));
    });

    it("should allow the interest to be withdrawn to the beneficiary", async () => {
      await createdVault.connect(addresses.beneficiary).withdrawInterest();
      expect(await mockDAI.balanceOf(addresses.beneficiary.address)).to.equal(ethers.utils.parseEther('0.246913578'));
    });

    it("should allow interest to be withdrawn to beneficiary when contract has deposits", async () => {
      // user deposits another 1000
      await mockDAI.connect(addresses.user).approve(createdVault.address, ethers.utils.parseEther('1000'));
      await createdVault.connect(addresses.user).deposit(ethers.utils.parseEther('1000'));
      // accrue interest
      await rewardPool.mockInterestTo(strategy.address, ethers.utils.parseEther('0.123456789'));

      await createdVault.connect(addresses.beneficiary).withdrawInterest();

      // Due to rounding issue:  Actual amount received from shared vault will differ
      // slightly from amount shown in UI with interestAvailable()
      // should be: 0.370370367
      // actual:    0.370370366999999999
      expect(await mockDAI.balanceOf(addresses.beneficiary.address)).to.equal(ethers.utils.parseEther('0.370370366999999999'));
    });

    // it should not allower a regular user to withraw interest to beneficiary

  });
});
