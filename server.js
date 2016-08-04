var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var config = require('./config');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
    verify: function(req,res,buf) { req.rawBody = buf.toString(); }
}));

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');


var subscription = require('./models/subscription');
var receipt = require('./models/receipt');

subscription.setup(function(hashClient) {
    var routes = require('./routes/app')(app, hashClient);

    app.listen(config.port, function() {
        console.log('Server up and listening on port %d', config.port);
        receipt.setup(hashClient);
    });
});

