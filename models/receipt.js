var Pubnub = require("pubnub");
var config = require('../config');

var pubnub = new Pubnub({
    ssl           : config.pubnub.ssl,  
    publishKey    : config.pubnub.publish_key,
    subscribeKey : config.pubnub.subscribe_key
});

var r = require('rethinkdbdash')({
    db: config.db
});

var RECEIPT_TABLE = 'receipt';

module.exports.setup = function (hashClient) {
    // Setup changefeed
    r.table(RECEIPT_TABLE).filter( r.and( r.row('sent_to_blockchain').eq(true), r.row('blockchain_receipt').eq(null) ) ).changes().run().then(function(cursor) {
        cursor.each(function(error, row) {
            if(row && row.new_val) {
                hashClient.getReceipt(row.new_val.id, function(err, result){
                    if(err) {
                        console.log(err);
                    } else {
                        var obj = JSON.parse(result.receipt);
                        // Save receipt to the database
                        r.table(RECEIPT_TABLE).get(row.new_val.id).update({'blockchain_receipt': obj}).run().then(function(updateResult) {
                            // Publish the object so the verification page is updated with the blockchain information
                            pubnub.publish({
                                    channel : row.new_val.hash,
                                    message : Object.assign({id: row.new_val.id}, obj),
                                    storeInHistory: false
                                },
                                function(status, response) {
                                    console.log(status, response);
                                }
                            );

                            // Publish the object so the list of last confirmed files on the main page is update
                            var formattedTimestamp = new Date()
                                                        .toISOString()
                                                        .replace(/T/, ' ')
                                                        .replace(/.\d{3}Z/, ' UTC');
                            pubnub.publish({
                                    channel : config.pubnub.confirmed_channel,
                                    message : {
                                        hash: row.new_val.hash,
                                        timestamp:formattedTimestamp
                                    },
                                }, 
                                function(status, response) {
                                    console.log(status, response);
                                }
                            );
                        }).error(function(error) {
                            console.log(error);
                        });
                    }
                });
            }
        });  
    });
}

module.exports.markReceiptsAsSent = function(startTimestamp, endTimestamp) {
    r.table(RECEIPT_TABLE).between(
            r.epochTime(parseInt(startTimestamp)),
            r.epochTime(parseInt(endTimestamp)), {index: 'timestamp'})
        .update({'sent_to_blockchain': true}).run();
}

module.exports.saveReceipt = function (receipt, callback) {
    var formattedTimestamp = new Date(receipt.timestamp * 1000)
                                        .toISOString()
                                        .replace(/T/, ' ')
                                        .replace(/.000Z/, ' UTC')
    var clonedReceipt = Object.assign({}, receipt);
    clonedReceipt.timestamp = r.epochTime(receipt.timestamp);

    r.table(RECEIPT_TABLE).insert(clonedReceipt).run().then(function(results) {

        pubnub.publish({
                channel : config.pubnub.registered_channel,
                message : {
                    hash: receipt.hash,
                    timestamp:formattedTimestamp
                }
            }, 
            function(status, response) {
                console.log(status, response);
                callback(true, clonedReceipt);
            }
        );
        
    }).error(function(error) {
        console.log(error);
        callback(false, error);
    });
}

module.exports.getReceiptByHash = function(hash, callback) {
    r.table(RECEIPT_TABLE).filter(r.row('hash').eq(hash)).run().then(function(result) {
        if(result.length > 0) {
            callback(true, result[0]);
        } else {
            callback(false, result);
        }
    }).error(function(error) {
        console.log(error);
        callback(false, error);
    });
}

module.exports.getReceipt = function(id, callback) {
    r.table(RECEIPT_TABLE).get(id).run().then(function(result) {
        callback(true, result);
    }).error(function(error) {
        console.log(error);
        callback(false, error);
    });
}