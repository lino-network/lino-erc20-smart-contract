var LinoToken = artifacts.require("LinoToken");

contract('LinoToken', (accounts) => {
  it('account 0 should have 1e10 token', () => {
    return LinoToken.deployed().then(inst => {
      return inst.balanceOf.call(accounts[0]);
    }).then(balance => {
      assert.equal(balance.valueOf(), 1e10, "account 0 doesn't have 1e10 token");
    });
  });

  it('account 0 should be the owner of token', () => {
    return LinoToken.deployed().then(inst => {
      return inst.owner.call();
    }).then(owner => {
      assert.equal(owner, accounts[0], 'account 0 is not the ownder');
    });
  });

  it('should allow ownership transfer', () => {
    var meta;

    return LinoToken.deployed().then(inst => {
      meta = inst;
      return meta.transferOwnership(accounts[1], { from: accounts[0] });
    }).then(() => {
      return meta.owner.call();
    }).then(owner => {
      assert.equal(owner, accounts[1], 'Ownership is not transfered');
      meta.transferOwnership(accounts[0], { from: accounts[1] });
    })
  });

  it('should not allow ownership transfer by non-owner', () => {
    var meta;

    return LinoToken.deployed().then(inst => {
      meta = inst;
      return meta.transferOwnership(accounts[2], { from: accounts[1] });
    })
    .then(assert.fail)
    .catch(error => {
      assert(error.message.indexOf('invalid opcode') >= 0,
      'non-owner accounts calling transferOwnership() should throw an invalid opcode exception');
    });
  });
});
