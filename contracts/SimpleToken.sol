pragma solidity >=0.5.0 <0.6.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";

contract SimpleToken is ERC20Mintable {
    string public name = "BuffiDai";
    string public symbol = "DEN";
    uint8 public decimals = 18;
    
    constructor() public{
        _totalSupply = 1000;
        _balances[msg.sender] = _totalSupply;
    }
}