const Discord = require('discord.js');
const client = new Discord.Client();
require('dotenv').config()

//checking for BOT_KEY in the environment variable
if(process.env.BOT_KEY == null){
  console.log("Error: BOT_KEY is not defined in the .env file. \nCreate a .env file if it doesnt exist and insert BOT_KEY = secret key of your bot");
}


client.on('ready', () => {
  console.log('I am ready!');
});
 
client.on('message', message => {
  if (message.content === 'ping') {
    message.reply('pong');
  }
});

client.login(process.env.BOT_KEY);