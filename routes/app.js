var fs = require('fs');
var url = require('url');
var crypto = require('crypto');
var jsreport = require('jsreport-core')();
var model = require('../models/receipt');
var config = require('../config');

jsreport.use(require('jsreport-wkhtmltopdf')());
jsreport.use(require('jsreport-jsrender')());
jsreport.init();

var receiptTemplate = fs.readFileSync(__dirname + '/../templates/receipt.html', 'utf8');

var validateRequest = function(rawBody, providedSignature) {
    var hmac = crypto.createHmac('sha256', config.tierion.client_secret).update(rawBody, 'utf8');
    var calculatedSignature = hmac.digest('hex');

    return providedSignature == calculatedSignature;
}

module.exports = function (app, hashClient) {
    app.get('/', function (req, res) {
        res.render('index', { config: config });
    });


    app.get('/verify/:hash', function (req, res) {
        model.getReceiptByHash(req.params.hash, function (success, result) {
            if(success) {
                res.render('verify', {
                    data: result,
                    config: config
                });
            } else {
                res.sendStatus(404); // Not found
            }
        });
    });

    app.post('/hash', function (req, res) {
        model.getReceiptByHash(req.body.hash, function (success, result) {
            if(success) { // Exists, redirect to verify
                res.json({
                    status: 'Exists'
                });
            } else { // Doesn't exist, send it to Tierion
                hashClient.submitHashItem(req.body.hash, function(err, result){
                    if(err) {
                        console.log(err);
                        res.json({
                            status: 'Error'
                        });
                    } else {
                        console.log(result);

                        var receipt = {
                            id: result.receiptId,
                            timestamp: result.timestamp,
                            sent_to_blockchain: false,
                            blockchain_receipt: null,
                            created_at: new Date(result.timestamp * 1000)
                                            .toISOString()
                                            .replace(/T/, ' ')
                                            .replace(/.000Z/, ' UTC'),
                            hash: req.body.hash
                        };

                        model.saveReceipt(receipt, function (success, result) {
                            if (success) res.json({
                                status: 'OK'
                            });
                            else res.json({
                                status: 'Error'
                            });
                        });
                    }
                });
            }
        });
    });

    app.post('/tierion', function(req, res) {
        var validRequest = validateRequest(req.rawBody, req.get('x-tierion-sig'));

        if(validateRequest) {
            model.markReceiptsAsSent(req.body.startTimestamp, req.body.endTimestamp);
        } else {
            return res.status(403).send('Request validation failed');
        }

        res.sendStatus(200); // OK
    });

    app.get('/pdf/:id', function (req, res) {
       model.getReceipt(req.params.id, function(success, receipt) {
           if(success) {
               var requestUrl = url.format({
                    protocol: req.protocol,
                    host: req.get('host')
                });
                
                jsreport.render({ 
                    template: { 
                        content: receiptTemplate, 
                        engine: 'jsrender', 
                        recipe: 'wkhtmltopdf'
                        },
                        data: { 
                            r: receipt,
                            url: requestUrl
                        }
                }).then(function(obj) {
                    res.set(obj.headers);
                    res.send(obj.content);
                });
           } else {
               res.sendStatus(500);
           }
        });
    });
};