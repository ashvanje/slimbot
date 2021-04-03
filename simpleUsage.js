require('dotenv').config();
const express = require('express')
const googleAuth = require('google-oauth-jwt')
const axios = require('axios')
const dialogflow = require('./dialogflow')
const apiHandler = require('./apiHandler')
const intentHandler = require('./intentHandler')
var mongoConnection

var mongoose = require("mongoose");
const Slimbot = require('slimbot');
const slimbot = new Slimbot(process.env['TELEGRAM_BOT_TOKEN']);
// const slimbot = new Slimbot('1727139641:AAG4heN5BIheBLTU57a3rIX_L-_ndWz_VDI');

// Register listeners
slimbot.on('message', async message => {
  await connectMongo()
  const sessionChange = '123'
  // reply when user sends a message
  console.log(JSON.stringify(message,0,1))
  try{
    slimbot.sendMessage(message.chat.id, 'wait...');
    const sendMessageResponse = await sendMessage(message.text.replace('/',''), message.from.username+sessionChange)

  console.log(sendMessageResponse)

  // slimbot.sendMessage(message.chat.id, `reply /hello`);
  slimbot.sendMessage(message.chat.id, sendMessageResponse.substring(0,4095));
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
