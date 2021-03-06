var express = require('express');
var app = express();
var request = require('request');
var body_parser = require('body-parser');

app.use(body_parser.json());

// Test
app.get('/hello', function(req, res) {
  res.send('world!');
});

// To verify
app.get('/webhook', function (req, res) {
  if (req.query['hub.verify_token'] === 'hotline-bot-demo-secret-token') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
})

// Actual bot logic
var token = "EAAOpnD4zOnUBAE4ybEpYP4AAwTIfJhBomaLoCpmLvqiRSeGi8Yn8uVOkh67qzdq9iDZBJfZBvhjdbppzqcEAGBeBMO8ZBQhCcVgxZA8TxygN7YjGqbTwZCM9WN3i26te6hMIWi5GTeECp6ZAjynTOxEP23iVwxZBZBICEuqVi3KAfAZDZD";

function sendTextMessage(sender, text) {
  messageData = {
    text:text
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}

var allSenders = {};
app.post('/webhook/', function (req, res) {
  messaging_events = req.body.entry[0].messaging;
  for (i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i];
    var senderId = event.sender.id;
    allSenders[senderId] = true;
    if (event.message && event.message.text) {
      var text = event.message.text;
      // Handle a text message from this sender
      console.log(text);
      Object.keys(allSenders).forEach(function(senderId){
        sendTextMessage(senderId, text);
      })
    }
  }
  res.sendStatus(200);
});

app.listen(process.env.PORT)
