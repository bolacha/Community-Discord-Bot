module.exports.run = async (bot, message, args) => {
    await message.reply('pong');
}

module.exports.help = {
    name: 'ping'
}
