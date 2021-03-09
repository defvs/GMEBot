const TwitchBot = require('twitch-bot')

var http = require("https");

let data = {};

console.log("Starting the bot");

const Bot = new TwitchBot({
	username: 'gmestonksbot',
	oauth: '***REMOVED***',
	channels: ['festiveox']
})

Bot.on('join', channel => {
	console.log("Bot joining channel");
	Bot.say(`Hello, my name is StonksBot! Made by Volumetrique. Ask me shorts and fees by typing $GME in the chat! I'm updated every 30 seconds and will inform you on any short changes. 🚀 🚀 🚀 `)
})

Bot.on('error', err => {
	console.log(err)
})

Bot.on('message', chatter => {
	if (chatter.message === '$gme' || chatter.message === '$GME') {
		try {
			Bot.say(`GME info - PRICE: ${data.ticker.NYSE.price} / VOLUME: ${(data.ticker.NYSE.volume / 1000000).toFixed(3)}M / BORROW AVAILABLE: ${data.available_shorts.available / 1000}k @ ${data.available_shorts.fee}%`);
		} catch (error) {
			Bot.say("Sorry, I don't have any data right now!");
		}
	}
})

function loadData() {
	var url = 'https://gme.crazyawesomecompany.com/data.php?s=GME';

	try {
		http.get(url, function (res) {
			var body = '';

			res.on('data', function (chunk) {
				body += chunk;
			});

			res.on('end', function () {
				let newData = JSON.parse(body);
				let newAv = newData.available_shorts.available;
				if (data.available_shorts !== undefined) {
					let oldAv = data.available_shorts.available;
					let diff = oldAv - newAv;
					if (diff !== 0) {
						let sign = Math.sign(diff);
						diff = Math.abs(diff);
						if (diff >= 0)
							Bot.say(`🚨 SHORT ALERT 🚨 ${diff / 1000}k borrowed @${newData.available_shorts.fee}%! (was ${oldAv / 1000}k --> now ${newAv / 1000}k)`)
						else
							Bot.say(`SHORT RESTOCK: +${diff / 1000}k available to borrow (was ${oldAv / 1000}k --> now ${newAv / 1000}k)`)
					}
				}
				data = newData;
			});
		}).on('error', function (e) {
			console.log("Got an error: ", e);
		});
	} catch (e) {
		console.log("Got an error: ", e);
	}
}

setInterval(loadData, 30000);
loadData();
