require('dotenv').config();
const express = require('express')
const googleAuth = require('google-oauth-jwt')
const axios = require('axios')
const dialogflow = require('./dialogflow')
const apiHandler = require('./apiHandler')
const intentHandler = require('./intentHandler')
const cron = require('node-cron');
const moment = require('moment')

var mongoConnection

var mongoose = require("mongoose");
const Slimbot = require('slimbot');
const slimbot = new Slimbot(process.env['TELEGRAM_BOT_TOKEN']);
// const slimbot = new Slimbot('1727139641:AAG4heN5BIheBLTU57a3rIX_L-_ndWz_VDI');

// Register listeners
slimbot.on('message', async message => {
  console.log(`message: ${JSON.stringify(message)}`)
  await connectMongo()
  const sessionChange = '123'
  // reply when user sends a message
  console.log(JSON.stringify(message, 0, 1))
  try {
    slimbot.sendMessage(message.chat.id, 'wait...');
    // const sendMessageResponse = await sendMessage(message.text.replace('/', ''), message.from.username + sessionChange)
    const sendMessageResponse = await sendMessage(message.text.replace('/', ''), message.chat.id)

    console.log(sendMessageResponse)

    let optionalParams = {
      parse_mode: 'Markdown',
      // reply_markup: JSON.stringify({
      //   inline_keyboard: [[
      //     { text: message.chat.id, callback_data: 'hello' }
      //   ],[
      //     { text: 'Good', callback_data: 'good' },
      //     { text: 'Day', callback_data: 'day' }
      //   ],[
      //     { text: 'How', callback_data: 'how' },
      //     { text: 'Are', callback_data: 'are' },
      //     { text: 'You', callback_data: 'you' }
      //   ]
      //   ]
      // })
    };
    // slimbot.sendMessage(message.chat.id, `reply /hello`);
    slimbot.sendMessage(message.chat.id, sendMessageResponse.substring(0, 4095), optionalParams);
    console.log(`1 @@@@@@@ ${message.chat.id}`)
    console.log(`2 @@@@@@@ ${sendMessageResponse.substring(0, 4095)}`)
    console.log(`3 @@@@@@@ ${JSON.stringify(optionalParams)}`)
    //todo: add slash before the choice buttons
  } catch (e) {
    console.log(JSON.stringify(e))
  }
});

slimbot.on('edited_message', edited_message => {
  // reply when user edits a message
  slimbot.sendMessage(edited_message.chat.id, 'Message edited');
});

// Call API
slimbot.startPolling();

console.log('polling...');

// setTimeout(() => {
//   slimbot.stopPolling();
// }, 10000);



async function sendMessage(userText, sessionId) {
  try {
    console.log(`sendMessage begin`)
    let returnMessage = await intentHandler.handleIntent(userText, sessionId)
    console.log(`returnMessage ${(returnMessage)}`)
    return returnMessage
  } catch (error) {
    console.log(JSON.stringify(error))
  }
}

async function connectMongo() {
  if (mongoConnection == null) {
    mongoConnection = await mongoose.connect("mongodb+srv://admin:dbUserPassword@cluster0-fjcyn.mongodb.net/test?retryWrites=true&w=majority");
    console.log(`first connection to mongo`)
  } else {
    console.log(`connection to mongo already exists`)
  }
}

async function saveViewToDB(req) {
  await connectMongo();
  let body = req
  var data = body
  var callback = function (err, data) {
    // if(err)
    // console.log(err);
    // else
    // console.log(data);
  }
  mongoose.Promise = global.Promise;
  var testPayment = new viewModel(data);
  var saveResult = await testPayment.save(callback);

  return saveResult;
}

function checkRemainingQuotaForNumber(from) {
  console.log(`checking remaining quota for ${from}...`)
  return true
}

const restify = require('restify');

let server = restify.createServer();
// server.use(restify.bodyParser());

// Setup webhook integration
// slimbot.setWebhook({ url: 'https://www.example.com/bot_updates' });

// Get webhook status
// slimbot.getWebhookInfo();

// Handle updates (example)
server.get('/bot_updates', function handle(req, res) {
  let update = req.body;
  // handle type of update here...
  // i.e. if (update.message) { ... }
  res.send('hello ');
  // next();
});

// cron.schedule('* * * * * *', function() {
let etaReminderArr = [
  // {
  //   messageId: '52656153',
  //   startTime: '08:00',
  //   endTime: '18:30',
  //   station: 'Nam Cheong'
  // }
  // ,

  // {
  //   messageId: '52656153',
  //   startTime: '18:00',
  //   endTime: '19:30',
  //   station: 'Tung Chung'
  // },
  {
    messageId: '52656153',
    startTime: '10:30',
    endTime: '11:30',
    station: 'Tung Chung'
  },
  {
    messageId: '52656153',
    startTime: '00:00',
    endTime: '00:50',
    station: 'Nam Cheong'
  }
  
]

cron.schedule('* * * * *', async function () {
  await connectMongo()
  for (etaReminder of etaReminderArr) {
    console.log(`etaReminder.startTime: ${etaReminder.startTime}, etaReminder.endTime: ${etaReminder.endTime}`)
    let start = moment(etaReminder.startTime, 'hh:mm')
    let end = moment(etaReminder.endTime, 'hh:mm')
    let current = new Date()
    console.log(`start: ${start<current}, end: ${end<current}, current: ${current}`)
    if (start < current && current < end) {
      try {
        const sendMessageResponse = await sendMessage(etaReminder.station, '666666')
    
        console.log(`sendMessageResponse: ${sendMessageResponse}`)
    
        let optionalParams = {
          parse_mode: 'Markdown'
        };
        slimbot.sendMessage(etaReminder.messageId, sendMessageResponse.substring(0, 4095), optionalParams);
      } catch (error) {
        console.log(`${JSON.stringify(error)}`)
      }
    }
    
  }
  
})

server.listen(process.env.PORT || 3000);
