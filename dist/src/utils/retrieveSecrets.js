"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AWS = require("aws-sdk");
var retrieveSecrets = function (secret) {
    if (secret === void 0) { secret = "/cardpayment-service/adyen"; }
    //configure AWS SDK
    var region = "eu-west-1";
    var client = new AWS.SecretsManager({ region: region });
    var SecretId = secret;
    return new Promise(function (resolve, reject) {
        //retrieving secrets from secrets manager
        client.getSecretValue({ SecretId: SecretId }, function (err, data) {
            if (err) {
                reject(err);
            }
            else {
                resolve(JSON.parse(data.SecretString));
            }
        });
    });
};
exports.default = retrieveSecrets;
