$(document).ready(function() {
    var DOCS_TO_SHOW = 5;
    var listRegistered = '#latest-registered';
    var listConfirmed = '#latest-confirmed';
    var itemTemplate = $.templates('#item-template');

    var pubnub = new PubNub(pubnubConfig);

    pubnub.addListener({
        message: function(data) {
            console.log(data);

            var el = listRegistered;
            if(data.subscribedChannel === CONFIRMED_CHANNEL) {
                el = listConfirmed;
            }

            $(itemTemplate.render(data.message)).hide().insertAfter($(el + ' tr:first-child')).fadeIn();

            var elements = $(el + ' tr').length - 1;
            if(elements > DOCS_TO_SHOW) {
                $(el + ' tr').last().remove();
            }
        }
    });

    pubnub.subscribe({
        channels: [REGISTERED_CHANNEL, CONFIRMED_CHANNEL] 
    });

    pubnub.history(
        {
            channel: REGISTERED_CHANNEL,
            reverse: false,
            count: DOCS_TO_SHOW, 
        },
        function (status, response) {
            console.log(response);

            response.messages.forEach(function(item) {
                $(listRegistered + ' tr:first-child').after(itemTemplate.render(item.entry));
            });
        }
    );

    pubnub.history(
        {
            channel: CONFIRMED_CHANNEL,
            reverse: false,
            count: DOCS_TO_SHOW, 
        },
        function (status, response) {
            console.log(response);

            response.messages.forEach(function(item) {
                $(listConfirmed + ' tr:first-child').after(itemTemplate.render(item.entry));
            });
        }
    );
});