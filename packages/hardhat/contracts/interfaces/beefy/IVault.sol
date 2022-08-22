// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IVault {
    function balance() external view returns (uint);
    function balanceOf() external view returns (uint256);
    function balanceOf(address) external view returns (uint256);
    function deposit(uint _amount) external;
    function getPricePerFullShare() external view returns (uint256);
    function totalSupply() external view returns (uint256);
    function want() external view returns (IERC20);
    function withdraw(uint256 _shares) external;
}
