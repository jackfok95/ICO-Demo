pragma solidity ^0.4.17;

import 'zeppelin-solidity/contracts/token/ERC20/MintableToken.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './Token.sol';
import './AddressWhitelist.sol';

contract Crowdsale is AddressWhitelist{

    using SafeMath for uint256;

    uint256  public constant soft_cap = 50 ether ; //cap = 1000 ETH (in wei)
    uint256  public constant hard_cap = 100 ether ; //cap = 1000 ETH (in wei)
    uint256  public rate = 10000000000000000; //Ratio = 1 iou :1 eth (1 eth/ 100 because 2 digit use as dicemal) 
    uint256 public weiRaised;

    //Record of contributions
    address[] public batchAddress;
    uint256[] public batchAmount;
    uint256[] public batchEther;
    // The Mintable Token
    Token public token;

    //fund will be sent to manager's address
    address public tokenManager;

    //Phase of CrowdSale
    uint256 public fundingStartTime;                           
    uint256 public p1_duration;
    uint256 public p2_start;
    uint256 public fundingEndTime;    

    modifier onlytokenManager() {
        require(msg.sender == tokenManager);
        _;
    }

    event Buy (address from, uint256 value);
    
    //Override parent contract's variable
    function Crowdsale(address tokenAddress, uint256 _fundingStartTime, address _tokenManager) public{

        //Set crowdsale phases period
        fundingStartTime = _fundingStartTime;
        p1_duration = 5 minutes;
        p2_start = fundingStartTime + p1_duration;
        fundingEndTime = p2_start + 5 minutes;
        weiRaised = 0;
        token = Token(tokenAddress);
        tokenManager = _tokenManager;
    }

    function () payable public{
        
        //Contribution must be during the Funding Period
        // require(now>fundingStartTime);
        // require(now<fundingEndTime);
        
        buytoken(msg.sender,msg.value);
    }

    function buytoken(address sender, uint256 _value) public {
        assert(isWhitelisted(sender));
        // require(_value>0);
        // require(sender!=address(0));

        uint256 realValue = _value;
        if (weiRaised.add(realValue) >= hard_cap){
            realValue = hard_cap - weiRaised;
            
            //refund
            sender.transfer(_value - realValue);
        }

        weiRaised = weiRaised.add(realValue);
        
        //Calculate the actural amount of token you get
        uint256 amount = realValue.div(rate);         
        uint256 bonus = getBonus();
        bonus = realValue.div(bonus);
        amount = amount.add(bonus);

        // //store the record for minting after Sale Period
        batchEther.push(realValue);
        batchAddress.push(sender);
        batchAmount.push(amount);

        //emit event
        Buy(sender,amount);
    }

    function getBonus() public constant returns (uint256 bonus) {
        bonus = rate.mul(2);
        // if ((now>fundingStartTime) && (now<=fundingStartTime + p1_duration)){
        //     bonus = rate.div(2);
        // }
        // else if ((now > p2_start) && (now <= fundingEndTime)){
        //     bonus = rate.div(4);
        // }
        // else{
        //     revert();
        // }

    }

    function mintAll() public onlytokenManager{
        // require(now>=fundingEndTime);
         token.batchMint(batchAddress,batchAmount);
    }



    //Only if can't meet softcap
    function batchRefund() public onlytokenManager{ 

        // require(now>fundingEndTime);
        // require (weiRaised < soft_cap);
        
        for (uint i = 0; i < batchAddress.length; i++) {
            batchAddress[i].transfer(batchEther[i]);
            //token.burn(batchAddress[i],batchAmount[i]);
        }
    }

    function changeTokenManager(address newowner) public onlytokenManager{
        tokenManager = newowner;
    }
    
    function withdrawSome(uint256 _value) public onlytokenManager{
        uint256 value = _value.mul(1 ether);
        require((this.balance>value) && (value>0));
        tokenManager.transfer(value);
    }

    function withdrawEther() public onlytokenManager{
        require(this.balance>0);
        tokenManager.transfer(this.balance);
    }


}