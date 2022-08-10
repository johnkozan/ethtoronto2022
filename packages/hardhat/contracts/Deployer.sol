// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

import "./Endaoment.sol";
import "./interfaces/beefy/IStrategy.sol";

/**
 * @dev endaoment vault deployer
 */
contract EndaomentDeployer {
    string name = 'beefy endaoment vault';
    string symbol = 'BEV';
    address strategy;

    event NewEndaoment(address endaoment);

    constructor(
        address _strategy
    ) public {
        strategy = _strategy;
    }

    /**
     * @dev Deploy a new endaoment vault
     * @param _beneficiary the address of the strategy.
     */
    function deploy(address _beneficiary) external {
        Endaoment newEndaoment = new Endaoment(
            IStrategy(strategy),
            name,
            symbol,
            5000,
            _beneficiary
        );
        emit NewEndaoment(address(newEndaoment));
    }

}
