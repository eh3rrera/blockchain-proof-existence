module.exports = {
	tierion: {
		client_secret: '<TIERION_CLIENT_SECRET>',
		username: '<TIERION_ACCOUNT_EMAIL>',
		password: '<TIERION_ACCOUNT_PASSWORD>'
	},

    pubnub: {
        ssl           : false,  
        publish_key   : '<PUBNUB_PUBLISH_KEY>',
        subscribe_key : '<PUBNUB_SUBSCRIBE_KEY>',
		registered_channel: 'registered_channel',
		confirmed_channel: 'confirmed_channel'
    },

	url: '<YOUR_PUBLIC_URL_OR_NGROK_URL>',
	
	db: 'existence',
	
	port: process.env.APP_PORT || 3000
};