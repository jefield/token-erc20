const Token = artifacts.require('./Token.sol');

module.exports = async (deployer, network, accounts) => {

  await deployer.deploy(Token, '11800000000000000');
  
};
