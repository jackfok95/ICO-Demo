var token = artifacts.require('./Token.sol');
var crowdsale = artifacts.require('./Crowdsale.sol');

module.exports = function(deployer, network, accounts){
  
  var token_address;
  const startTime = latestTime() + duration.minutes(2);

  deployer.deploy(token).then(function(){
    return token.deployed();
  }).then(function(instance){
     return instance.address;
  }).then(function(token_address){
    //need return, else cannot deploy
    return deployer.deploy(crowdsale,token_address,startTime ,accounts[0]);
  });

  
  
};






function latestTime() {
  return web3.eth.getBlock('latest').timestamp;
}

const duration = {
  seconds: function(val) { return val},
  minutes: function(val) { return val * this.seconds(60) },
  hours:   function(val) { return val * this.minutes(60) },
  days:    function(val) { return val * this.hours(24) },
  weeks:   function(val) { return val * this.days(7) },
  years:   function(val) { return val * this.days(365)} 
};