var jwt = require('jsonwebtoken')
var config = require('../config/config')
var resHandler = require('../api/controllers/bitCoinController')

module.exports = {
    secret:"unknownPassword",
    jwtDecode: (token, callback) => {
        jwt.verify(token, "unknownPassword", (err, decoded) => {
            if (err) {
                callback(null);
                console.log(err);
            } else {
                callback(decoded);
                console.log(decoded);
            }
        });
    },

}