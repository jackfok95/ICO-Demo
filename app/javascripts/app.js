// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import crowdsale_artifacts from '../../build/contracts/Crowdsale.json'
import token_artifacts from '../../build/contracts/Token.json'
// MetaCoin is our usable abstraction, which we'll use through the code below.
var Crowdsale = contract(crowdsale_artifacts);
var Token = contract(token_artifacts);
// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;
var whitelist = [];

window.App = {
  start: function() {
    var self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    Crowdsale.setProvider(web3.currentProvider);
    Token.setProvider(web3.currentProvider);
    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

      self.refreshBalance();
    });
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  refreshBalance: function() {
    var self = this;
    console.log("current AC: "+account);
    
    document.getElementById("ac").innerHTML = account;
    

    return Crowdsale.deployed().then(function(instance) {
      return web3.eth.getBalance(instance.address,function (err,value){//Using metamask, Callback function is needed or failed.
        document.getElementById("crowd").innerHTML = instance.address;
        var balance_element = document.getElementById("fund");
        balance_element.innerHTML = web3.fromWei(value.toNumber(),'ether');
      })
      
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting fund; see log.");
    }).then(function(){
      return Token.deployed().then(function(ins){
        return ins.balanceOf(account);
      }).then(function(bal){
        document.getElementById("iou").innerHTML = bal.toNumber();
        
      })
    }).then(function(){
      return Crowdsale.deployed().then(function(instance){
        return instance.isWhitelisted(account);
      }).then(function(boo){
        if(boo){
          document.getElementById("whitelist").innerHTML = "(Whitelisted)"
        }else{
          document.getElementById("whitelist").innerHTML = "(Non Whitelisted)"
        }
      })
    })


  },

  pre_whiteList: function(){
    var receiver = document.getElementById("user_address").value;
    whitelist.push(receiver);
    alert("Address Proposed");
  },

  whiteList: function(){
    var receiver = document.getElementById("user_address").value;
    Crowdsale.deployed().then(function(instance){
      return instance.addToWhitelist(whitelist,{from: account});//account is  necessary!!!!!!!!!!
    }).then(function(log){
      console.log(log);

    })
  },



  takeSome:function(){
    var amount = parseInt(document.getElementById("amount2").value);

    Crowdsale.deployed().then(function(instance) {
      return instance.withdrawSome(amount,{from: account});
    })
  },

  takeAll:function(){
    Crowdsale.deployed().then(function(instance) {
      return instance.withdrawEther({from: account});
    })
  },

  mint:function(){
    return Crowdsale.deployed().then(function(instance){
      return instance.mintAll({from: account});
    })
  },

  sendCoin: function() {
    var self = this;

    var amount = parseInt(document.getElementById("amount").value);
    var receiver = document.getElementById("receiver").value;

    this.setStatus("Initiating transaction... (please wait)");

    var meta;
    Crowdsale.deployed().then(function(instance) {
      return instance.sendTransaction({from:account,value: web3.toWei(amount, 'ether')});
    }).then(function() {
      self.setStatus("Transaction complete!");
      self.refreshBalance();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
  }
};




window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
    // window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:9545"));
  }

  App.start();
});
