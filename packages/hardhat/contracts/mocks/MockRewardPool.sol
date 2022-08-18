// SPDX-License-Identifier: WTFPL
pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

interface IMockERC20 {
    function mintTo(address, uint256) external;
}

contract MockRewardPool {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    address public want;

    mapping (address => uint256) balances;

    constructor(address _want) public {
        want = _want;
    }

    function deposit(uint256 amount) external {
        IERC20(want).safeTransfer(address(this), amount);
        balances[msg.sender] += amount;
    }

    function stake(uint256 amount) external {
        IERC20(want).safeTransferFrom(msg.sender, address(this), amount);
    }

    function withdraw(uint256 amount) external {
        IERC20(want).safeTransfer(msg.sender, amount);
        balances[msg.sender] -= amount;
    }

    function earned(address account) external view returns (uint256) {
        return 123456789;
    }

    function getReward() external {

    }

    function balanceOf(address account) external view returns (uint256) {
        return balances[msg.sender];
    }

    // Accrue some interest
    function mockInterest(uint256 _amount) external {
        IMockERC20(want).mintTo(address(this), _amount);
    }
}
