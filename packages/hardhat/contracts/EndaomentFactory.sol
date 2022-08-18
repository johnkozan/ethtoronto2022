// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

import "./EndaomentVault.sol";
import "./EndaomentStrategy.sol";
import "./interfaces/beefy/IStrategy.sol";

/**
 * @dev endaoment vault deployer
 */
contract EndaomentFactory {
    string name = 'beefy endaoment vault';
    string symbol = 'BEV';
    address public strategy;
    mapping (address => bool) vaults;

    event NewEndaoment(address endaoment);

    /*constructor(*/
        /*address _strategy*/
    /*) public {*/
        /*strategy = _strategy;*/
    /*}*/

    function setStrategy(address _strategy)  external {  /* TODO: OnlyOwner */
        strategy = _strategy;
    }

    /*
     * @dev Returns true if the given address is a vault
     *      created by this factory
     * @param _vault the address to check
     */
    function isVault(address _vault) external view returns (bool) {
        return vaults[_vault];
    }

    /*
     * @dev Deploy a new endaoment vault
     * @param _beneficiary the address of the strategy.
     */
    function deploy(address _beneficiary) external {
        require(strategy != address(0), "no strat");
        EndaomentVault newEndaoment = new EndaomentVault(
            IStrategy(strategy),
            name,
            symbol,
            5000,
            _beneficiary
        );
        vaults[address(newEndaoment)] = true;
        emit NewEndaoment(address(newEndaoment));
    }

}
