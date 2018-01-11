pragma solidity ^0.4.18;

import "./zeppelin-solidity/contracts/token/StandardToken.sol";
import "./zeppelin-solidity/contracts/lifecycle/Pausable.sol";

/**
 * @title Lino Token
 * @dev ERC20 Lino Token (LNO)
 *
 * All initial LNOs are assigned to the creator of
 * this contract.
 *
 */
 contract LinoToken is StandardToken, Pausable {

   string public constant name = 'LinoToken';               // Set the token name for display
   string public constant symbol = 'LNO';                   // Set the token symbol for display
   uint8 public constant decimals = 18;                     // Set the number of decimals for display
   uint256 public constant INITIAL_SUPPLY = 10000000000;    // 10 billion LNO specified

   /**
    * @dev LinoToken Constructor
    * Runs only on initial contract creation.
    */
    function LinoToken() {
      totalSupply = INITIAL_SUPPLY;                         // Set the total supply
      balances[msg.sender] = INITIAL_SUPPLY;                // Tnitial tokens are assigned to creator
      Transfer(0x0, msg.sender, INITIAL_SUPPLY);            // emit Transfer event
    }
 }
