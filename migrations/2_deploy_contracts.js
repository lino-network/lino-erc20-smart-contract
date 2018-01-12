var LinoToken = artifacts.require('./LinoToken.sol');

module.exports = function (deployer) {
  deployer.deploy(LinoToken)
};
