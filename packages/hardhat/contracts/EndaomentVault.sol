// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "./interfaces/beefy/IStrategy.sol";
import "./interfaces/beefy/IVault.sol";

/**
 * @dev Implementation of a vault to deposit funds for yield optimizing.
 * This is the contract that receives funds and that users interface with.
 * The yield optimizing strategy itself is implemented in a separate 'Strategy.sol' contract.
 */
contract EndaomentVault is ERC20, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    address public beneficiary;

    IVault public sharedVault;

    /**
     * @dev Sets the value of {token} to the token that the vault will
     * hold as underlying value. It initializes the vault's own 'moo' token.
     * This token is minted when someone does a deposit. It is burned in order
     * to withdraw the corresponding portion of the underlying assets.
     * @param _sharedVault the address of the shared vault.
     * @param _name the name of the vault token.
     * @param _symbol the symbol of the vault token.
     */
    constructor (
        IVault _sharedVault,
        string memory _name,
        string memory _symbol,
        /*uint256 _approvalDelay,*/
        address _beneficiary
    ) public ERC20(
        _name,
        _symbol
    ) {
        sharedVault = _sharedVault;
        /*approvalDelay = _approvalDelay;*/
        beneficiary = _beneficiary;
    }

    function want() public view returns (IERC20) {
        return IERC20(sharedVault.want());
    }

    function balanceOfWant() public view returns (uint256) {
        return want().balanceOf(address(this));
    }

    /**
     * @dev It calculates the total underlying value of {token} held by the system.
     * It takes into account the vault contract balance, the strategy contract balance
     *  and the balance deployed in other contracts as part of the strategy.
     */
    function balance() public view returns (uint) {
        uint256 ourShares = IVault(sharedVault).balanceOf(address(this));
        uint256 pricePerFullShare = IVault(sharedVault).getPricePerFullShare();

        return ourShares.mul(pricePerFullShare).div(1e18).add(balanceOfWant());
    }

    /**
     * @dev Custom logic in here for how much the vault allows to be borrowed.
     * We return 100% of tokens for now. Under certain conditions we might
     * want to keep some of the system funds at hand in the vault, instead
     * of putting them to work.
     */
    function available() public view returns (uint256) {
        return want().balanceOf(address(this));
    }

    /**
     * @dev Returns amount of interest earned that may be withdrawn by the beneficiary
     */
    function interestAvailable() public view returns (uint256) {
        return balance().sub(totalSupply());
    }

    /**
     * @dev A helper function to call deposit() with all the sender's funds.
     */
    function depositAll() external {
        deposit(want().balanceOf(msg.sender));
    }

    /**
     * @dev The entrypoint of funds into the system. People deposit with this function
     * into the vault. The vault is then in charge of sending funds into the strategy.
     */
    function deposit(uint _amount) public nonReentrant {
        /*strategy.beforeDeposit();*/

        want().safeTransferFrom(msg.sender, address(this), _amount);

        want().approve(address(sharedVault), _amount);
        sharedVault.deposit(_amount);
        /*earn();*/

        _mint(msg.sender, _amount);
    }

    /**
     * @dev A helper function to call withdraw() with all the sender's funds.
     */
    function withdrawAll() external {
        withdraw(balanceOf(msg.sender));
    }

    /**
     * @dev Witdraw accrued interest to beneficiary
     * Amount that can be withdrawn is calculated as the total balance of the vault plus
     * the strategy, less the princiapal amount in the vault represented by the totalSupply
     */
    function withdrawInterest() external {
        uint256 sharesAvailable = sharedVault.balanceOf(address(this));
        if (sharesAvailable > 0) {
            // Get interst amount that can be withdrawn
            uint256 interestAmount = interestAvailable();
            uint256 wantNeeded = interestAmount.sub(want().balanceOf(address(this)));
            // calculated amount of shared vault shares required to get want needed

            uint256 pricePerFullShare = sharedVault.getPricePerFullShare();

            // There is a rounding issue here.  actual amount received from shared vault
            // will be slightly different from amount shown in interestAvailable()
            uint256 sharesRequired = wantNeeded.mul(1e18).div(pricePerFullShare);
            sharedVault.withdraw(sharesRequired);
            want().safeTransfer(beneficiary, want().balanceOf(address(this)));
        }

        want().safeTransfer(beneficiary, want().balanceOf(address(this)));
    }

    /**
     * @dev Function to exit the system. The vault will withdraw the required tokens
     * from the strategy and pay up the token holder. A proportional number of IOU
     * tokens are burned in the process.
     */
    function withdraw(uint256 _principal) public {
        uint256 pc = _principal.div(balanceOf(msg.sender));
        _burn(msg.sender, _principal);

        // shared vault shares to redeem
        uint256 shares = sharedVault.balanceOf(address(this)).mul(pc);
        sharedVault.withdraw(shares);

        want().safeTransfer(msg.sender, _principal);
    }

    /**
     * @dev Rescues random funds stuck that the strat can't handle.
     * @param _token address of the token to rescue.
     */
    function inCaseTokensGetStuck(address _token) external onlyOwner {
        require(_token != address(want()), "!token");

        uint256 amount = IERC20(_token).balanceOf(address(this));
        IERC20(_token).safeTransfer(msg.sender, amount);
    }
}
