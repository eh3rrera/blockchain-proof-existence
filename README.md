# blockchain-proof-existence
This web application shows how to use [Tierion Hash API](https://tierion.com/docs/hashapi), [RethinkDB](http://rethinkdb.com/) with the [rethinkdbdash](https://github.com/neumino/rethinkdbdash) driver, and [PubNub's Storage and Playback](https://www.pubnub.com/products/storage-and-playback/) feature with [SDK v4](https://www.pubnub.com/docs/javascript/pubnub-javascript-sdk-v4) . You can follow the [tutorial](http://tutorials.pluralsight.com/interesting-apis/proof-of-existence-in-the-blockchain-with-tierion-rethinkdb-and-pubnub) to build this application or jump straight to the code.

# Requirements

- [Tierion account](https://tierion.com/signup)
- [Pubnub account](https://admin.pubnub.com/#/register)
- [RethinkDB](http://rethinkdb.com/docs/install/)
- [Ngrok](https://ngrok.com/download)
- [Node.js](https://nodejs.org/en/download/)

# Installation
1. Clone this repository and `cd` into it.
2. Start RethinkDB server and execute the commands of `rethinkdb.txt` in [RethinkDB's web console](http://localhost:8080/#dataexplorer).
3. Start ngrok.
2. Create a configuration file for your application with `cp config.sample.js config.js` and enter your Tierion and PubNub API keys and your ngrok URL.
4. Execute `npm install` to download dependencies.
5. Execute `node server.js` to start the Node.js server.
6. Go to `http://localhost:3000` to play with the app.

# License
MIT