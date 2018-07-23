pragma solidity ^0.4.17;

import 'zeppelin-solidity/contracts/token/ERC20/MintableToken.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';

contract Token is MintableToken{
    using SafeMath for uint256;

    string public constant name = "IOUToken";
    string public constant symbol = "IOU";
    uint8  public constant decimals = 2;
     
    
    function Token() public{
        //Total supply is finalized after ICO. Should be less than 1000.
        totalSupply_ = 0;
    
    }

    //Idea case should be only owner can do so. 
    // But contract call contract will have no different senders.
    function mintt(address _to, uint256 _amount) canMint public returns (bool) {
    totalSupply_ = totalSupply_.add(_amount);
    balances[_to] = balances[_to].add(_amount);
    Mint(_to, _amount);
    Transfer(address(0), _to, _amount);
    return true;
    }    

    
    function batchMint(address[] _to, uint256[] _amount) public//external
     {
        require(_to.length == _amount.length);
        for (uint i = 0; i < _to.length; i++) {
            require(_to[i] != address(0));
            mintt(_to[i], _amount[i]);
        }
        
    }

    //not used for minted token because token only be minted after softcap
    // function burn(address _sender, uint256 _value) public {
    // require(_value <= balances[_sender]);

    // address burner = _sender;
    // balances[burner] = balances[burner].sub(_value);
    // totalSupply_ = totalSupply_.sub(_value);
   
//   }

}