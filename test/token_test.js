
var crowdsale = artifacts.require("./Crowdsale.sol");
var token = artifacts.require("./Token.sol");
contract('Token', function(accounts) {

  it("Sent in ether from ac 0", function() {
    var instance;
    var add = [accounts[0]];
    return crowdsale.deployed().then(function(_instance) {
      instance = _instance;
      return instance.addToWhitelist(add);
    }).then(function(){
      return instance.sendTransaction({from:accounts[0],value: web3.toWei(5, 'ether')});
    }).then(function(add) {
      console.log('Amount of Token: ',add.logs[0].args.value.toNumber());
      // instance.sendTransaction({from:accounts[0],value: web3.toWei(5, 'ether')})
      // console.log(add);

    });
  });

  // it('burnAll',function(){
  //   var instance;
  //   return crowdsale.deployed().then(function(_instance){
  //     instance = _instance;
  //   }).then(function(){
  //     return web3.eth.getBalance(accounts[0])
  //   }).then(function(b){
  //     console.log("Before: ",b.toNumber());
  //   }).then(function(){
  //     return instance.batchRefund();
  //   }).then(function(){
  //     return web3.eth.getBalance(accounts[0])
  //   }).then(function(b){
  //     console.log("Before: ",b.toNumber());
  //   })
  // });

  it('MintAll', function(){
    return crowdsale.deployed().then(function(instance){
       return instance.mintAll({from: accounts[0]});
     })
  });



  it('check TotalSupply', function(){

    var instance;
    return token.deployed().then(function(_instance){
      instance = _instance;
      return instance.totalSupply();
    }).then(function(a){
      console.log("TotalSupply:", a.toNumber());
    }).then(function(){
      return instance.balanceOf(accounts[0]);
    }).then(function(balance){
      console.log('Balance of AC0',balance.toNumber());
    });

  });


  it('Take some by manager', function(){
    var crowdsale_instance;
        
    return crowdsale.deployed().then(function(instance){
      crowdsale_instance = instance;
    }).then(function(){
      return web3.eth.getBalance(crowdsale_instance.address);      
    }).then(function(contract_balance){
      console.log('Contract Balance:',web3.fromWei(contract_balance.toNumber(),'ether'),"ETH");
    }).then(function(){
      return crowdsale_instance.withdrawSome(1,{from: accounts[0]});
    }).then(function(){
      return web3.eth.getBalance(crowdsale_instance.address);
    }).then(function(contract_balance){
      console.log('Withdrawn 1 from Contract Balance:',web3.fromWei(contract_balance.toNumber(),'ether'),"ETH");
    }).then(function(){
      return crowdsale_instance.withdrawEther({from: accounts[0]});
    }).then(function(){
      return web3.eth.getBalance(crowdsale_instance.address);
    }).then(function(contract_balance){
      console.log('Withdrawn All from Contract Balance:',web3.fromWei(contract_balance.toNumber(),'ether'),"ETH");
    }).then(function(){
      return web3.eth.getBalance(accounts[0]);
    }).then(function(contract_balance){
      console.log('Manager Balance:',web3.fromWei(contract_balance.toNumber(),'ether'),"ETH");
    });


  });
})