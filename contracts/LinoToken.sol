pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/token/PausableToken.sol";

/**
 * @title Lino Token
 * @dev ERC20 Lino Token (LINO)
 *
 * All initial LINOs are assigned to the creator of
 * this contract.
 *
 */
contract LinoToken is PausableToken {

  string public constant name = "LinoToken";                                // Set the token name for display
  string public constant symbol = "LINO";                                   // Set the token symbol for display
  uint8 public constant decimals = 18;                                      // Set the number of decimals for display
  uint256 public constant INITIAL_SUPPLY = 1e10 * 10**uint256(decimals);    // 10 billion LINO specified

  /**
  * @dev LinoToken Constructor
  * Runs only on initial contract creation.
  */
  function LinoToken() public {
    totalSupply = INITIAL_SUPPLY;                         // Set the total supply
    balances[msg.sender] = INITIAL_SUPPLY;                // Tnitial tokens are assigned to creator
    Transfer(0x0, msg.sender, INITIAL_SUPPLY);            // emit Transfer event
  }
}
