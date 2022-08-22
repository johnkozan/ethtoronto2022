// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

import "./EndaomentVault.sol";
import "./EndaomentStrategy.sol";
import "./interfaces/beefy/IStrategy.sol";
import "./interfaces/beefy/IVault.sol";

/**
 * @dev endaoment vault deployer
 */
contract EndaomentFactory {
    string name = 'beefy endaoment vault';
    string symbol = 'BEV';
    IVault public sharedVault;
    mapping (address => bool) vaults;

    event NewEndaoment(address endaoment);

    constructor(
        IVault _sharedVault
    ) public {
        sharedVault = _sharedVault;
    }

    /*function setStrategy(address _strategy)  external {  [> TODO: OnlyOwner <]*/
        /*strategy = _strategy;*/
    /*}*/

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
        require(address(sharedVault) != address(0), "!vault");
        EndaomentVault newEndaoment = new EndaomentVault(
            IVault(sharedVault),
            name,
            symbol,
            _beneficiary
        );
        vaults[address(newEndaoment)] = true;
        emit NewEndaoment(address(newEndaoment));
    }

}
