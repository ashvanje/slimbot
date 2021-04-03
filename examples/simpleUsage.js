require('dotenv').config();

const Slimbot = require('slimbot');
const slimbot = new Slimbot(process.env['TELEGRAM_BOT_TOKEN']);
// const slimbot = new Slimbot('1727139641:AAG4heN5BIheBLTU57a3rIX_L-_ndWz_VDI');

// Register listeners
slimbot.on('message', message => {
  // reply when user sends a message
  console.log(JSON.stringify(message,0,1))
  slimbot.sendMessage(message.chat.id, `
  hello
  hello
  hello
  `);
});

slimbot.on('edited_message', edited_message => {
  // reply when user edits a message
  slimbot.sendMessage(edited_message.chat.id, 'Message edited');
});

// Call API
slimbot.startPolling();

console.log('polling...');

setTimeout(() => {
  slimbot.stopPolling();
}, 10000);
