const assert = require('assert');
const WebSocket = require('ws');
const Twitter = require('twitter');

const PORT = process.env.PORT || 8888;
const ENVIRONMENT = process.env.ENV || 'development';

if (ENVIRONMENT === 'production') console.log = () => {};

const wss = new WebSocket.Server({ port: PORT });

// Broadcast to all.
wss.broadcast = function broadcast(payload) {
  assert.ok(payload.data, 'Payload contains a `data` property.');
  assert.ok(payload.type, 'Payload contains a `type` property.');
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
    }
  });
};

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

let twitterStream;
const defaultTerm = 'twitter';
/**
 * Stream statuses filtered by keyword
 * number of tweets per second depends on topic popularity
 **/
function initTwitterStream(term) {
  if (twitterStream) twitterStream.destroy();

  client.stream('statuses/filter', { track: term },  function(stream) {
    stream.on('data', function(tweet) {
      // console.log(tweet.text);
      wss.broadcast({ type: 'twitter_response', data: tweet });
    });
  
    stream.on('error', function(error) {
      console.log(error);
      wss.broadcast({ type: 'twitter_error', data: error });
    });
  
    twitterStream = stream;
  });
}

initTwitterStream(defaultTerm);

wss.on('connection', function connection(ws) {
  console.log('client connected');
  ws.send(JSON.stringify({ type: 'connection_start', data: { connected: true } }));
  
  ws.on('message', function incoming(payload) {
    const { data, type } = JSON.parse(payload);

    switch(type) {
      case 'tracking_term':
        initTwitterStream(data);
        break;
    }
    console.log(data);
  });
});