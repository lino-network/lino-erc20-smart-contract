var LinoToken = artifacts.require("LinoToken");
var utils = require('./utils.js');

contract('LinoToken', (accounts) => {
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

  it('initial supply should be 1e28', () => {
    return LinoToken.deployed().then(inst => {
      return inst.INITIAL_SUPPLY.call();
    }).then(supply => {
      assert.equal(supply, 1e28, "Token initial supply is not 1e28");
    });
  });

  it('total supply should be 1e28', () => {
    return LinoToken.deployed().then(inst => {
      return inst.totalSupply.call();
    }).then(supply => {
      assert.equal(supply, 1e28, "Token total supply is not 1e28");
    });
  });

  it('account 0 should have 1e28 token', () => {
    return LinoToken.deployed().then(inst => {
      utils.assertEvent(inst, { event: 'Transfer' });
      return inst.balanceOf.call(accounts[0]);
    }).then(balance => {
      assert.equal(balance.valueOf(), 1e28, "account 0 doesn't have 1e28 token");
    });
  });

  it('account 0 should be the owner of token', () => {
    return LinoToken.deployed().then(inst => {
      return inst.owner.call();
    }).then(owner => {
      assert.equal(owner, accounts[0], 'account 0 is not the owner');
    });
  });

  it('should allow ownership transfer', () => {
    var meta;

    return LinoToken.deployed().then(inst => {
      meta = inst;
      return meta.transferOwnership(accounts[1], { from: accounts[0] });
    }).then(() => {
      utils.assertEvent(meta, { event: 'OwnershipTransferred' })
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
      return inst.owner.call();
    }).then(owner => {
      assert.equal(owner, accounts[0], 'account 0 is not the owner');
      assert.notEqual(owner, accounts[1], 'account 0 is not the owner');
    }).then(() => {
      return meta.transferOwnership(accounts[2], { from: accounts[1] });
    })
    .then(assert.fail)
    .catch(error => {
      assert(
        error.message.indexOf('Exception') >= 0,
        'non-owner accounts calling transferOwnership() should throw an invalid opcode exception');
    });
  });

  it('token should not be paused on contract creation', () => {
    return LinoToken.deployed().then(inst => {
      return inst.paused.call();
    }).then(paused => {
      assert.equal(paused, false, 'Token is paused when created');
    });
  })

  it('owner should be able to be pause and unpause', () => {
    var meta;

    return LinoToken.deployed().then(inst => {
      meta = inst;
      return meta.pause({ from: accounts[0] });
    }).then(() => {
      utils.assertEvent(meta, { event: 'Pause' });
    }).then(() => {
      return meta.paused.call();
    }).then(paused => {
      assert.equal(paused, true, 'Token should be paused after pause()');
    }).then(() => {
      return meta.unpause({ from: accounts[0] });
    }).then(() => {
      utils.assertEvent(meta, { event: 'Unpause' });
    }).then(() => {
      return meta.paused.call();
    }).then(paused => {
      assert.equal(paused, false, 'Token should not be paused after unpause()');
    });
  });

  it('non-owner should not be able to pause', () => {
    var meta;

    return LinoToken.deployed().then(inst => {
      meta = inst;
      return meta.pause({ from: accounts[1] });
    })
    .then(assert.fail)
    .catch(error => {
      assert(
        error.message.indexOf('Exception') >= 0,
        'non-owner accounts calling pause() should throw an invalid opcode exception.'
      );
    });
  });

  it('non-owner should not be able to unpause by if paused', () => {
   var meta;

   return LinoToken.deployed().then(inst => {
     meta = inst;
     return meta.pause({ from: accounts[0] });
   }).then(response => {
     utils.assertEvent(meta, { event: 'Pause' });
   }).then(result => {
     return meta.unpause({ from: accounts[1] });
   })
   .then(assert.fail)
   .catch(error => {
     assert(
       error.message.indexOf('Exception') >= 0,
       'non-owner accounts calling unpause() should throw an invalid opcode exception.'
     );
   }).then(() => {
     // reset
     meta.unpause({ from: accounts[0] });
   });
 });

 it('should allow transfer() of LNO by address owner when unpaused', () => {
   var meta;
   var xferAmt = 1e5;
   var account0StartingBalance;
   var account1StartingBalance;
   var account0EndingBalance;
   var account1EndingBalance;

   return LinoToken.deployed().then(inst => {
     meta = inst;
     return meta.balanceOf(accounts[0]);
   }).then(balance => {
     account0StartingBalance = balance.toNumber();
     return meta.balanceOf(accounts[1]);
   }).then(balance => {
     account1StartingBalance = balance.toNumber();
     return meta.transfer(accounts[1], xferAmt, { from: accounts[0] });
   }).then(() => {
     utils.assertEvent(meta, { event: 'Transfer' });
   }).then(() => {
     return meta.balanceOf(accounts[0]);
   }).then(balance => {
     account0EndingBalance = balance.toNumber();
   }).then(result => {
     return meta.balanceOf(accounts[1]);
   }).then(balance => {
     account1EndingBalance = balance.toNumber();
   }).then(() => {
     assert.equal(account0EndingBalance, account0StartingBalance - xferAmt, 'Balance of account 0 incorrect');
     assert.equal(account1EndingBalance, account1StartingBalance + xferAmt, 'Balance of account 1 incorrect');
   });
 });

 it('should allow transferFrom(), when properly approved, when unpaused', () => {
   var meta;
   var xferAmt = 1e5;
   var account0StartingBalance;
   var account1StartingBalance;
   var account0EndingBalance;
   var account1EndingBalance;

   return LinoToken.deployed().then(inst => {
     meta = inst;
     return meta.balanceOf(accounts[0], { from: accounts[0] });
   }).then(balance => {
     account0StartingBalance = balance.toNumber();
     return meta.balanceOf(accounts[1], { from: accounts[1] });
   }).then(balance => {
     account1StartingBalance = balance.toNumber();
     // account 1 first needs approval to move LNO from account 0
     return meta.approve(accounts[1], xferAmt, { from: accounts[0] });
   }).then(() => {
     utils.assertEvent(meta, { event: 'Approval' });
   }).then(balance => {
     // with prior approval, account 1 can transfer LNO from account 0
     return meta.transferFrom(accounts[0], accounts[1], xferAmt, { from: accounts[1] });
   }).then(result => {
     return meta.balanceOf(accounts[0], { from: accounts[0] });
   }).then(balance => {
     account0EndingBalance = balance.toNumber();
   }).then(result => {
     return meta.balanceOf(accounts[1], { from: accounts[1] });
   }).then(balance => {
     account1EndingBalance = balance.toNumber();
   }).then(() => {
     assert.equal(account0EndingBalance, account0StartingBalance - xferAmt, 'Balance of account 0 incorrect');
     assert.equal(account1EndingBalance, account1StartingBalance + xferAmt, 'Balance of account 1 incorrect');
   });
 });

 it('should allow approve(), and allowance() when unpaused', () => {
   var meta;
   var xferAmt = 1e5;

   return LinoToken.deployed().then(inst => {
     meta = inst;
     return meta.approve(accounts[1], xferAmt, { from: accounts[0] });
   }).then(() => {
     utils.assertEvent(meta, { event: 'Approval' });
   }).then(() => {
     return meta.allowance(accounts[0], accounts[1], { from: accounts[0] });
   }).then(allowance => {
     return allowance.toNumber();
   }).then(allowance => {
     assert.equal(allowance, xferAmt, 'Allowance amount is incorrect');
   }).then(() => {
     // reset
     meta.approve(accounts[1], 0, { from: accounts[0] });
   });
 });

 it('should not allow transfer() when paused', () => {
   var meta;
   var xferAmt = 1e5;

   return LinoToken.deployed().then(inst => {
     meta = inst;
     return meta.pause({ from: accounts[0] });
   }).then(response => {
     utils.assertEvent(meta, { event: 'Pause' });
   }).then(result => {
     return meta.transfer(accounts[1], xferAmt, { from: accounts[0] });
   })
   .then(assert.fail)
   .catch(error => {
     assert(
       error.message.indexOf('Exception') >= 0,
       'accounts trying to transfer() when paused should throw an invalid opcode exception.'
     );
   }).then(() => {
     // reset
     meta.unpause({ from: accounts[0] });
   });
 });

 it('should not allow transferFrom() when paused', () => {
   var meta;
   var xferAmt = 1e5;

   return LinoToken.deployed().then(inst => {
     meta = inst;
     return meta.approve(accounts[1], xferAmt, { from: accounts[0] });
   }).then(response => {
     utils.assertEvent(meta, { event: 'Approval' });
   }).then(() => {
     return meta.pause({ from: accounts[0] });
   }).then(response => {
     utils.assertEvent(meta, { event: 'Pause' });
   }).then(() => {
     return meta.transferFrom(accounts[0], accounts[1], xferAmt, { from: accounts[1] });
   })
   .then(assert.fail)
   .catch(error => {
     assert(
       error.message.indexOf('Exception') >= 0,
       'accounts trying to transferFrom() when paused should throw an invalid opcode exception.'
     );
   }).then(() => {
     // reset
     meta.unpause({ from: accounts[0] });
   }).then(() => {
     // reset
     meta.approve(accounts[1], 0, { from: accounts[0] });
   });
 });

 it('should not allow approve() when paused', () => {
   var meta;
   var xferAmt = 1e5;

   return LinoToken.deployed().then(inst => {
     meta = inst;
     return meta.pause({ from: accounts[0] });
   }).then(response => {
     utils.assertEvent(meta, { event: 'Pause' });
   }).then(result => {
     return meta.approve(accounts[1], xferAmt, { from: accounts[0] });
   })
   .then(assert.fail)
   .catch(error => {
     assert(
       error.message.indexOf('Exception') >= 0,
       'accounts trying to approve() when paused should throw an invalid opcode exception.'
     );
   }).then(() => {
     // reset
     meta.unpause({ from: accounts[0] });
   }).then(() => {
     // reset
     meta.approve(accounts[1], 0, { from: accounts[0] });
   });
 });

 it('should not allow transfer() when _to is null', () => {
   var meta;
   var xferAmt = 1e5;

   return LinoToken.deployed().then(inst => {
     meta = inst;
     return meta.transfer(null, xferAmt, { from: accounts[0] });
   })
   .then(assert.fail)
   .catch(error => {
     assert(
       error.message.indexOf('Exception') >= 0,
       'accounts trying to transfer() when _to is null should throw an invalid opcode exception.'
     );
   });
 });

 it('should not allow transfer() when _to is 0x0000000000000000000000000000000000000000', () => {
   var meta;
   var xferAmt = 1e5;

   return LinoToken.deployed().then(inst => {
     meta = inst;
     return meta.transfer('0x0000000000000000000000000000000000000000', xferAmt, { from: accounts[0] });
   })
   .then(assert.fail)
   .catch(error => {
     assert(
       error.message.indexOf('Exception') >= 0,
       'accounts trying to transfer() when _to is 0x0000000000000000000000000000000000000000 should throw an invalid opcode exception.'
     );
   });
 });

 it('should not allow transferFrom() when _to is null', () => {
   var meta;
   var xferAmt = 1e5;

   return LinoToken.deployed().then(inst => {
     meta = inst;
     return meta.approve(accounts[1], xferAmt, { from: accounts[0] });
   }).then(() => {
     utils.assertEvent(meta, { event: 'Approval' });
   }).then(() => {
     return meta.transferFrom(accounts[0], null, xferAmt, { from: accounts[1] });
   })
   .then(assert.fail)
   .catch((error) => {
     assert(
       error.message.indexOf('Exception') >= 0,
       'accounts trying to transferFrom() when _to is null should throw an invalid opcode exception.'
     );
   }).then(() => {
     // reset
     meta.approve(accounts[1], 0, { from: accounts[0] });
   });
 });

 it('should not allow transferFrom() when _to is 0x0000000000000000000000000000000000000000', () => {
   var meta;
   var xferAmt = 1e5;

   return LinoToken.deployed().then(inst => {
     meta = inst;
     return meta.approve(accounts[1], xferAmt, { from: accounts[0] });
   }).then(() => {
     utils.assertEvent(meta, { event: 'Approval' });
   }).then(() => {
     return meta.transferFrom(accounts[0], '0x0000000000000000000000000000000000000000', xferAmt, { from: accounts[1] });
   })
   .then(assert.fail)
   .catch(error => {
     assert(
       error.message.indexOf('Exception') >= 0,
       'accounts trying to transferFrom() when _to is 0x0000000000000000000000000000000000000000 should throw an invalid opcode exception.'
     );
   }).then(() => {
     // reset
     meta.approve(accounts[1], 0, { from: accounts[0] });
   });
 });
});
