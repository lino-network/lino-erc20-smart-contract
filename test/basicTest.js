var LinoToken = artifacts.require("LinoToken");

contract('LinoToken', (account) => {
  it('name should be LinoToken', () => {
    return LinoToken.deployed().then(inst => {
      return inst.name.call();
    }).then(name => {
      assert.equal(name, 'LinoToken', "Token name is not LinoToken");
    });
  });

  it('symbol should be LNO', () => {
    return LinoToken.deployed().then(inst => {
      return inst.symbol.call();
    }).then(symbol => {
      assert.equal(symbol, 'LNO', "Token symbol is not LNO");
    });
  });

  it('decimals should be 18', () => {
    return LinoToken.deployed().then(inst => {
      return inst.decimals.call();
    }).then(decimals => {
      assert.equal(decimals, 18, "Token decimals value is not 18");
    });
  });
});
