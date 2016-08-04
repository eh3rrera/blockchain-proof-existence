var config = require('../config');
var r = require('rethinkdbdash')({
    db: config.db
});
var hashapi = require('hashapi-lib-node');

var hashClient = new hashapi();

var SUBSCRIPTION_TABLE = 'subscription';

var URL = config.url + '/tierion';

var createSubscription = function(callback) {
    hashClient.createBlockSubscription(URL, function(err, subscription){
        console.log('Create subscription');
        if(err) {
            console.log(err);
        } else {
            r.table(SUBSCRIPTION_TABLE).get(1).update({'subscription-id': subscription.id}).run().then(function(updateResult) {
                callback(hashClient);
            });
        }
    });
}

module.exports.setup = function (callback) {
    console.log("Setting up Block Subscription...");

    hashClient.authenticate(config.tierion.username, config.tierion.password, function(err, authToken){
        if(err) {
            console.log(err);
        } else {
            //console.log(authToken);

            r.table(SUBSCRIPTION_TABLE).get(1).run().then(function(result) {
                var id = result['subscription-id'];

                if(id === '') {
                    createSubscription(callback);
                } else {

                    hashClient.getBlockSubscription(id, function(errGet, result){
                        // The subscription doesn't exists
                        if(errGet) { 
                            console.log('Subscription doesnt exists');
                            createSubscription(callback);
                        }
                        // Let's check the callback URL hasn't change. If it has changed, update the URL
                        else {
                            if(result.callbackUrl === URL) {
                                callback(hashClient);
                            } else {
                                hashClient.updateBlockSubscription(id, URL, function(errUpdate, result){
                                    console.log('Update susbcription');
                                    if(errUpdate) {
                                        console.log(errUpdate);
                                    } else {
                                        callback(hashClient);
                                    }
                                });
                            }
                        } // else subscription exists
                    });

                } // else exists subscription ID
            });
            
        } // else authentication
    });
}