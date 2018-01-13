require('dotenv').config();
const Web3 = require("web3");
const web3 = new Web3();
var HDWalletProvider = require("truffle-hdwallet-provider");
var mainNetProvider = new HDWalletProvider(process.env["MNEMONIC"], "https://mainnet.infura.io/" + process.env["INFURA_KEY"])

module.exports = {
  networks: {
    mainNet: {
      provider: mainNetProvider,
      // gas: 460000,
      // gasPrice: web3.toWei("20", "gwei"),
      network_id: 1
    },
    development: {
      host: 'localhost',
      port: 7545,
      network_id: 2
    }
  }
}
