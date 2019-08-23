

'use strict';

module.exports = function(app) {
  var bitcoin = require('../controllers/bitCoinController');

  app.route('/btc/get_auth_token')
    .get(bitcoin.get_auth_token);
  
    app.route('/btc/address/:account')
    .get(bitcoin.generateAddress);//bitcoin.verify_auth_token

  app.route('/btc/balance/:account')
    .get(bitcoin.verify_auth_token,bitcoin.getBalance);

    app.route('/btc/addr_balance/:address')
    .get(bitcoin.getBalance_addr);

  app.route('/btc/deposits/:account')
    .get(bitcoin.verify_auth_token,bitcoin.getReceivedByAccount);

  app.route('/btc/transfer')
    .post(bitcoin.verify_auth_token,bitcoin.performTransfer);

  app.route('/btc/withdraw')
    .post(bitcoin.verify_auth_token,bitcoin.performWithdraw);

    app.route('/btc/newaddress/:account')
    .get(bitcoin.generateNewAddress);

    app.route('/btc/addresses/:account')
    .get(bitcoin.verify_auth_token,bitcoin.listAddresses);

    app.route('/btc/multipleWithdraw')
    .post(bitcoin.verify_auth_token,bitcoin.multipleWithdraw);
    
    app.route('/btc/walletnotify')
    .get(bitcoin.walletnotify);

    app.route('/btc/blocknotify')
    .get(bitcoin.blocknotify);

  
};