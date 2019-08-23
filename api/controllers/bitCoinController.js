 'use strict';

const Client = require('bitcoin-core');
var jwt = require('jsonwebtoken')
const Utils = require('../../lib/utils');
const Config = require('config');
var config = require('../../config/config')
let BigNumber = require('bignumber.js');
const async = require('async')

var socket = require('socket.io-client')('http://localhost:1995');
const client = new Client(Config.get('Bitcoin.testnet'));

//Get an Auth Token
exports.get_auth_token = function(req,res){
    if (!req.query.uniqueId) {
        return res.json({'code':400,'message': "Parameters missing."})
    }
    return res.json({"code":200, "message":"Success.", "Data":jwt.sign({ id: req.query.uniqueId }, config.secret, { expiresIn: '1h' })})
};

//Verify Auth Token
exports.verify_auth_token = function(req,res,next){
        if (!req.headers.auth_token) {
            return res.json({"code":400,"message":"No token provided."})
        }
        console.log("token----->",req.headers.auth_token)
        config.jwtDecode(req.headers.auth_token, (decoded) => {
            console.log("decoded=====",decoded)
            if (decoded) {
                next();
            } else {
                return res.json({"code":400,"message":"Invalid token."})
            }
        })
};
// /**
//  * Returns the current bitcoin address for receiving payments to this account.
//  * If <account> does not exist, it will be created along with an associated
//  * new address that will be returned.
//  *
//  * @param  {[type]}
//  * @param  {[type]}
//  * @return {[type]}
//  */
exports.generateAddress = function(req, res) {
    if(!req.params.account){
        return res.json({'code':400,'message':"Parameters is Missing!!!!"})
    }
    var account = req.params.account;

    client.getAccountAddress(account, function(err, address) {
      if (err) {
        return console.error(err);
      }
      res.json({'code': 200, "address": address})
      console.log("hy............................")
    });
};

//////////Generate a new address for an Corresponding Account /////////////////////


exports.generateNewAddress = function(req, res) {
    if(!req.params.account){
        return res.json({'code':400,'message':"Parameters is Missing!!!!"})
    }
    var account = req.params.account;

    client.getNewAddress(account, function(err, address) {
      if (err) {
        return console.error(err);
      res.json({'code': 200, "Error": err})
        
      }
      res.json({'code': 200, "address": address})
    });
};

/////////Get an adresss for an corresponding Account /////////////////////////

exports.listAddresses = function(req, res) {
    if(!req.params.account){
        return res.json({'code':400,'message':"Parameters is Missing!!!!"})
    }
    var account = req.params.account;

    client.getAddressesByAccount(account, function(err, address) {
      if (err) {
        return console.error(err);
      res.json({'code': 200, "Error": err})
        
      }
      res.json({'code': 200, "address": address})
    });
};
 
//////////Get balance of an address //////////////

exports.getBalance_addr = function(req, res) {
    if(!req.params.address){
        return res.json({'code':400,'message':"Parameters is Missing!!!!"})
    }
    var address = req.params.address;

    listUnspent().then(unspent => {
        var unspentBalance = unspent.filter((unspent) => unspent.address == address );
        console.log("hhhhhhhhhhh",unspentBalance)
        var balance = 0 ;
        if (unspentBalance.length) {
            for (var transactions in unspentBalance) {
                balance += unspentBalance[transactions].amount;
            }
        }
        balance = Utils.round(balance, '8');
      console.log("Your balance of address : "+address+" is",balance);        
        res.json({'code': 200, 'message':"Success","balance": balance});
    });
};


// exports.getBalance_addr = (req, res) => {
//     let total = 0;
//     listUnspent().then(unspents => {
//         async.forEachSeries(unspents, (unspent, next) => {
//             console.log("unspent", unspent)
//             client.getTransaction(unspent.txid).then((success) => {
//                 console.log("==>>came inside this block ", success)
//                 next();
//             }).catch((err) => {
//                 // console.log("==>>", JSON.parse(err.text).result.details)
//                 let tx_data = JSON.parse(err.text);
//                 if (err && err.text && tx_data && tx_data.result && tx_data.result.details.length) {
//                     tx_data.result.details.forEach((item) => {
//                         console.log(item.amount, typeof item.amount)
//                         if (item.address === req.params.address && item.category === "receive" && item.amount === unspent.amount) {
//                             console.log("total before", total)
//                             total = bigNumberOpera(total, item.amount, '+', 8);
//                         }
//                     })
//                 }
//                 next();
//             })
//         }, (end_of_iter) => {
//             console.log("final total is ", total);
//             res.json({
//                 "code": 200,
//                 "balance": total
//             });

//         })
//     }).catch((err_balanace) => {
//         console.log(err_balanace);
//     })
// }

// /**
//  * If [account] is not specified, returns the server's total available
//  * balance. If [account] is specified, returns the balance in
//  * the account.
//  *
//  * @param  {[type]}
//  * @param  {[type]}
//  * @return {[type]}
//  */
exports.getBalance = function(req, res) {
    if(!req.params.account){
        return res.json({'code':400,'message':"Parameters is Missing!!!!"})
    }
    var account = req.params.account;

    listUnspent().then(unspent => {
        var unspentBalance = unspent.filter((unspent) => unspent.account == account );
        var balance = 0;
        if (unspentBalance.length) {
            for (var transactions in unspentBalance) {
                balance += unspentBalance[transactions].amount;
            }
        }
        balance = Utils.round(balance, '8');
        res.json({'code': 200, "balance": balance});
    });
};


// /**
//  * Returns up to [count] most recent transactions skipping the
//  * first [from] transactions for account [account].
//  * If [account] not provided it'll return recent transactions
//  * from all accounts.
//  *
//  * @param  {[type]}
//  * @param  {[type]}
//  * @return {[type]}
//  */
exports.getReceivedByAccount = function(req, res) {
    if(!req.params.account){
        return res.json({'code':400,'message':"Parameters is Missing!!!!"})
    }
    var account = req.params.account;

    client.listTransactions(account, function(err, deposits) {
        if (err) {
            return console.log(err);
        }
        if (deposits.length) {
            var depositSubet = [];
            for (var deposit in deposits) {
                var subset = (({ txid, amount, confirmations, address }) => ({ txid, amount, confirmations , address }))(deposits[deposit]);
                depositSubet.push(subset);
            }
            res.json(depositSubet);
        }
        else {
            res.json({"code": "500"})
        }
    });
};


// /**
//  * Returns array of unspent transaction inputs in the wallet
//  *
//  * @return {Array} unspent transactions
//  */
const listUnspent = async () => {
    try {
        let unspent = await client.listUnspent();
        return unspent;
    }
    catch (err) {
        //Failed to fetch unspent transactions.
        console.log(err);
    }

}


// /**
//  * Create a transaction spending given inputs, send to given address(es)
//  *
//  * @param  {Array} Transaction Object
//  * @param  {String} Sending Address
//  * @param  {Float} Spendable Amount
//  * @return {String} Returns the hex-encoded transaction in a string
//  */
const createRawTransaction = async(transactions, sendTo, amount, fee) => {



    if (fee) {
        var txFee = Utils.round(fee, '8');
        amount = amount - txFee;
        amount = Utils.round(amount, '8');
    }

    try {
        if (txFee) {
            let transactionFee = await client.setTxFee(txFee);
        }
        let rawtxid = await client.createRawTransaction(transactions, {[sendTo] : amount });
        return rawtxid;
    }
    catch (err) {
        console.log("error 1 -------",err);
        throw err;
    }
}


// /**
//  * @param  {[type]}
//  * @return {[type]}
//  */
const fundRawTransaction = async(rawTransaction, changeAddress) => {

    try {
        if (changeAddress) {
            let frt = await client.fundRawTransaction(rawTransaction, {"changeAddress" : changeAddress});
            return frt;
        }
        else {
            let frt = await client.fundRawTransaction(rawTransaction);
            return frt;
        }
    }
    catch (err) {
        console.log("error 2 ------",err);
        throw err;
    }
}

// /**
//  * Adds signatures to a raw transaction and returns the resulting
//  * raw transaction.
//  *
//  * @param  {String} Hex encoded transaction
//  * @return {String} Signed raw transaction
//  */
const signRawTransaction = async(rawTransaction) => {

    try {
        let signedTransaction = await client.signRawTransaction(rawTransaction);
        return signedTransaction;
    }
    catch (err) {
        console.log("error 3 ---------",err);
        throw err;
    }
}


// /**
//  * Submits raw transaction (serialized, hex-encoded) to local node and network.
//  *
//  * @param  {String} Signed transaction
//  * @return {String} Transaction Id
//  */
const sendRawTransaction = async(signedTransaction) => {
    try {
        let sendTransactions = await client.sendRawTransaction(signedTransaction);
        return sendTransactions;
    }
    catch (err) {
        console.log(err);
        throw err;
    }
}

// /**
//  * Calculate transaction fees for Regular pay-to addresses
//  * (Legacy Non-segwit - P2PKH/P2SH)
//  *
//  * @param  {Integer} Total inputs of unspent transactions
//  * @param  {Integer} Total outputs
//  * @param  {Integer} # of confirmations for the transaction to calculate the transaction fees
//  * @return {Double}  Transaction Fee
//  */
const calculateTxFee = async(input, output, confirmations) => {
    try {
        const fee = await client.estimateSmartFee(6);
        var txFee = (((input * 148 + output * 34 + 10) + 40) / 1024) * fee['feerate'];
	console.log("txfee-------->",txFee)
        return txFee;
    }
    catch (err) {
        console.log("error 4 ------",err);
        throw err;
    }
}

///Withdraw for multiple addressses craete raw transactions
const createRawTransaction1 = async(transactions, destinations, fee) => {



    if (fee) {
        var txFee = Utils.round(fee, '8');
        amount = amount - txFee;
        amount = Utils.round(amount, '8');
    }

    try {
        if (txFee) {
            let transactionFee = await client.setTxFee(txFee);
        }
        let rawtxid = await client.createRawTransaction(transactions, destinations);
        return rawtxid;
    }
    catch (err) {
        console.log(err);
    }
}


// /**
//  * @param  {[type]}
//  * @param  {[type]}
//  * @return {[type]}
//  */
exports.performTransfer = function(req, res) {
    if(!req.body.SendFrom || !req.body.SendTo){
        return res.json({'code':400,'message':"Parameters is Missing!!!!"})
    }
    // Get all unspent transactions
    listUnspent().then(unspent => {
        var sendTransactions = unspent.filter((unspent) => unspent.address == req.body.SendFrom );
        var listTransactions = [];
        var transactionAmount = 0;

        if (sendTransactions.length) {
            for (var transactions in sendTransactions) {
                listTransactions.push({
                    'txid': sendTransactions[transactions].txid,
                    'vout': sendTransactions[transactions].vout
                });
                transactionAmount += sendTransactions[transactions].amount;
            }

            calculateTxFee(listTransactions.length, 1, 6).then(fee => {
                createRawTransaction(listTransactions, req.body.SendTo, transactionAmount, fee).then(rawtxid => {
                    signRawTransaction(rawtxid).then(signedTransaction => {
                        sendRawTransaction(signedTransaction['hex']).then(sendTransactions => {

                             res.json({
                                'code': 200,
                                'tx-hash' : sendTransactions,
                                'fee': Utils.round(fee, '8'),
                                'sent-amount': transactionAmount
                             });
                        }).catch(err => {  res.json({ code: 500,message: err.message });   });
                    }).catch(err => {  res.json({ code: 500,message: err.message });   });
                }).catch(err => {  res.json({ code: 500,message: err.message });   });
            }).catch(err => {  res.json({ code: 500,message: err.message });   });
        }
        else {
            res.json({'code': 500, "message": "No unspent transaction found for given address."});
        }
    });
};

// /**
//  * @param  {[type]}
//  * @param  {[type]}
//  * @return {[type]}
//  */
exports.performWithdraw = function(req, res) {
    if(!req.body.SendFrom || !req.body.SendTo || !req.body.AmountToTransfer || !req.body.ChangeAddress){
        return res.json({'code':400,'message':"Parameters is Missing!!!!"})
    }
    //SendTo
    //AmountToTransfer
    //ChangeAddress
    var changeaddress = req.body.ChangeAddress ? req.body.ChangeAddress : null;
    // Get all unspent transactions
    listUnspent().then(unspent => {
        var sendTransactions = unspent.filter((unspent) => unspent.address == req.body.SendFrom );

        var listTransactions = [];
        var transactionAmount = 0;
//console.log("2--------->",sendTransactions)
        if (sendTransactions.length) {
            for (var transactions in sendTransactions) {
                listTransactions.push({
                    'txid': sendTransactions[transactions].txid,
                    'vout': sendTransactions[transactions].vout
                });
                transactionAmount += sendTransactions[transactions].amount;
            }

            // Check if sufficient funds available...
            if (req.body.AmountToTransfer < transactionAmount) {
                //Updated to use the fundRawTransaction method
                createRawTransaction(listTransactions, req.body.SendTo, req.body.AmountToTransfer, null).then(rawtxid => {
                    fundRawTransaction(rawtxid, changeaddress).then(frt => {
                        signRawTransaction(frt['hex']).then(signedTransaction => {
                            sendRawTransaction(signedTransaction['hex']).then(sendTransactions => {
                                 res.json({
                                    'code': 200,
                                    'tx-hash' : sendTransactions,
                                    'fee': frt['fee']
                                 });
                            }).catch(err => {  res.json({ code: 500,message: err.message });   });
                        }).catch(err => {  res.json({ code: 500,message: err.message });   });
                    }).catch(err => { return res.json({ code: 500,message: err.message });   });
                }).catch(err => {  res.json({ code: 500,message: err.message });   });
           }
            else {
                res.json({'code': 500, "message": "Insufficient Funds!"});
            }
        }
        else {
            res.json({'code': 500, "message": "No unspent transaction found for given address."});
        }
    });
};



////Multiple withdraw

exports.multipleWithdraw = function(req, res) {
    if(!req.body.SendFrom || !req.body.ChangeAddress || !req.body.destinations){
        return res.json({'code':400,'message':"Parameters is Missing!!!!"})
    }
    //SendTo
    //AmountToTransfer
    //ChangeAddress
    var changeaddress = req.body.ChangeAddress ? req.body.ChangeAddress : null;
    // Get all unspent transactions
    listUnspent().then(unspent => {
        var sendTransactions = unspent.filter((unspent) => unspent.address == req.body.SendFrom );
        var listTransactions = [];
        var transactionAmount = 0;
        console.log("hellooooo",sendTransactions)
        if (sendTransactions.length) {
            for (var transactions in sendTransactions) {
                listTransactions.push({
                    'txid': sendTransactions[transactions].txid,
                    'vout': sendTransactions[transactions].vout
                });
                transactionAmount += sendTransactions[transactions].amount;
            }
            var data = req.body.destinations;
            console.log("destinations---->",data)
            var obj ={};
            var arr={};
            var totalamount = 0 ; 
                for(var i in data){
                     totalamount = totalamount + data[i].amount;
                    arr[data[i].address] = data[i].amount
                    }
                    console.log("result=======>",arr)
                    console.log("total----->",totalamount)
            // Check if sufficient funds available...
            if (totalamount < transactionAmount) {
                //Updated to use the fundRawTransaction method
                createRawTransaction1(listTransactions, arr, null).then(rawtxid => {
                    fundRawTransaction(rawtxid, changeaddress).then(frt => {
                        signRawTransaction(frt['hex']).then(signedTransaction => {
                            sendRawTransaction(signedTransaction['hex']).then(sendTransactions => {
                                 res.json({
                                    'code': 200,
                                    'tx-hash' : sendTransactions,
                                    'fee': frt['fee']
                                 });
                            }).catch(err => {  res.json({ code: 500,message: err.message });   });
                        }).catch(err => {  res.json({ code: 500,message: err.message });   });
                    }).catch(err => {  res.json({ code: 500,message: err.message });   });
                }).catch(err => {  res.json({ code: 500,message: err.message });   });
            }
            else {
                res.json({'code': 500, "message": "Insufficient Funds!"});
            }
        }
        else {
            res.json({'code': 500, "message": "No unspent transaction found for given address."});
        }
    });
};



exports.blocknotify = function(req, res) {
   
    client.listTransactions(function(err,data){
  var transactionId = data.txid;
        
            var pqr = data[data.length-1].txid
    //console.log("transactionId++++++++++",pqr)
        
    client.getTransaction(data[data.length-1].txid,function(err, result) {
       
       if(result.confirmations > 2 && result.confirmations <= 5)
       { 
           console.log("Transaction Confirmations is still pending......"+result.confirmations)
         return   res.json({"code":200,"Message":"Transaction Confirmations is still pending......","confirmations":result.confirmations})
        
        }
      else if(result.confirmations == 6){
          console.log("congratulations!!!!!!!!!!!!!!!!!!!")
          console.log("Your transaction is fully Confirmed of Txid ->"+pqr+".")
       return  res.json({"code":200,"Message":"Your transaction is fully Confirmed of Txid ->"+pqr+".","confirmations":data[data.length-1].confirmations})

      }
      else 
          console.log("No incoming transactions in the Wallet")
          res.json({"code":200,"Message":"No incoming transactions in the Wallet"})
          //console.log("Nothing to say!!!!!!",data[data.length-1].confirmations)

});
      });

    
};

exports.walletnotify = function(req, res) {
            socket.emit('notify', {'code': 200});               
};






