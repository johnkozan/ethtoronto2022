// From: https://github.com/beefyfinance/beefy-contracts/blob/master/utils/predictAddresses.ts
const { ethers } = require("hardhat");
const rlp = require("rlp");
const keccak = require("keccak");

const predictAddresses = async ({ creator }) => {
  let currentNonce = await ethers.provider.getTransactionCount(creator);
  let currentNonceHex = `0x${currentNonce.toString(16)}`;
  let currentInputArr = [creator, currentNonceHex];
  let currentRlpEncoded = rlp.encode(currentInputArr);
  let currentContractAddressLong = keccak("keccak256").update(currentRlpEncoded).digest("hex");
  let currentContractAddress = `0x${currentContractAddressLong.substring(24)}`;
  let currentContractAddressChecksum = ethers.utils.getAddress(currentContractAddress);

  let nextNonce = currentNonce + 1;
  let nextNonceHex = `0x${nextNonce.toString(16)}`;
  let nextInputArr = [creator, nextNonceHex];
  let nextRlpEncoded = rlp.encode(nextInputArr);
  let nextContractAddressLong = keccak("keccak256").update(nextRlpEncoded).digest("hex");
  let nextContractAddress = `0x${nextContractAddressLong.substring(24)}`;
  let nextContractAddressChecksum = ethers.utils.getAddress(nextContractAddress);

  return {
    vault: currentContractAddressChecksum,
    strategy: nextContractAddressChecksum,
  };
};

module.exports = {
  predictAddresses,
}
