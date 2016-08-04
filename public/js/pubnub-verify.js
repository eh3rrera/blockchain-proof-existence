var setupPubNub = function(pubnubConfig, hash, callback) {

     var pubnub = new PubNub(pubnubConfig);

     pubnub.addListener({
        message: function(data) {
            console.log(data);

            var params1 = {};

            var params2 = { 
                tx_id: data.message.header.tx_id,
                merkle_root: data.message.header.merkle_root,
                timestamp: data.message.header.timestamp
            };

            var params3 = { 
                tx_id: data.message.header.tx_id,
                recepit_id: data.message.id
            };

            var container = $('.container')
            
            container.css('opacity', '0')

            callback(params1, params2, params3);

            container.animate({
                opacity: 1
            }, 1500);
        }
    });

     pubnub.subscribe({
        channels: [hash],
    });

}