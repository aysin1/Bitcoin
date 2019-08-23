var express = require('express');
const app = require('express')(),
  port = process.env.PORT || 3000,
  bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const Client = require('bitcoin-core');
var clientSocket = require('socket.io-client')('http://localhost:3000');
const Config = require('./config');
const client = new Client(Config.get('Bitcoin.testnet'));

var server = require('http').createServer(app);

var io = require('socket.io')(server);

io.on('connection', function (socket) {

  console.log("Socket connected ===>");

  socket.on('notify', function (data) {
    client.listTransactions(function (err, result) {
      var pqr = result[result.length - 1].txid
      
      var latest = result.filter((result) => result.txid == pqr && result.category === "receive");

      var latestTransactions = [];
      for (var deposit in latest) {
        var subset = (({ txid, amount, confirmations, address, timereceived }) => ({ txid, amount, confirmations, address, timereceived }))(latest[deposit]);
        latestTransactions.push(subset);
      }
      console.log("Recenet transactionsId----------------->>>>", pqr)
    //  if (latestTransactions) {
          console.log("enter in latest transactions")
        io.sockets.emit('notifyLatest', {
          'code': 200,
          'Details ': JSON.stringify(latestTransactions)
        })
        
        clientSocket.on('notifyLatest',(data)=>{
        console.log("&&&&&&&&",data);
        })
        console.log("________________________________New transaction is created in the Wallet____________________________________")
        console.log("____________________________________________________________________________________________________________")
        console.log("TransactionDetails -> " + JSON.stringify(latest))

    });
  }); // listen to the event
});


//Routes Handling
var routes = require('./api/routes/bitCoinRoute'); //importing route
routes(app); //register the route

app.use(function (req, res) {
  res.status(404).send({ resource: req.originalUrl + ' not found' })
});

server.listen(3000, (err, result) => {
  console.log("Server listening to", 3000, err, result)
})
