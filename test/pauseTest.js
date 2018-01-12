var LinoToken = artifacts.require("LinoToken");
var utils = require('./utils.js');

contract('LinoToken', (accounts) => {
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
     meta.unpause({ from: accounts[0] })
   })
 })
});
