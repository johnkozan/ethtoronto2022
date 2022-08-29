export { default as Transactor } from "./Transactor";
export { default as Web3ModalSetup } from "./Web3ModalSetup";
export { switchNetworks } from "./switchNetworks";
export * as ipfs from "./ipfs";

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
}

export const blockExplorerLink = (address, blockExplorer) => `${blockExplorer || "https://etherscan.io/"}address/${address}`;

export const shortenAddress = (address) => `${address.substr(0,10)}...${address.substr(-4)}`;
