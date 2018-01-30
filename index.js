require('dotenv').config(); // Adding this to the first line.

// Checking first if the BOT Key is setted , if not , do not even load the libraries.
if (process.env.BOT_KEY == null) {
  console.log('Error: BOT_KEY is not defined in the .env file. \nCreate a .env file if it doesnt exist and insert BOT_KEY = secret key of your bot');
  return;
}

const Discord   = require('discord.js');
const manager   = require('./helpers/helper');
const client    = new Discord.Client();

manager.setCommands(client);

client.on('ready', () => {
  console.log('I am ready!');
});

client.on('message', message => {
    if (message.author.bot) return;
    if (message.channel.type === 'dm') return;

    const { cmd, args } = manager.splitter(message);

    if (!cmd.startsWith(process.env.PREFIX)) return;

    let command = client.commands.get(cmd.slice(process.env.PREFIX.length));

    if(command) command.run(client, message, args);
});

client.login(process.env.BOT_KEY);
