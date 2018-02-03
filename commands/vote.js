const agree = "✅";
const disagree = "❎";
const time = 5000;

module.exports.run = async (bot, message, args) => {
    
    let msg = await message.channel.send(`Voting for : \n\n ${ args.join(" ") }\n\n by Author : ${message.author}`);

    await msg.react(agree);
    await msg.react(disagree);

    const reactions = await msg.awaitReactions((reaction) => {

        return reaction.emoji.name === agree || reaction.emoji.name === disagree;
    }, { time });

    const positive = ( !reactions.get(agree)    ? 0  : reactions.get(agree).count - 1 );
    const negative = ( !reactions.get(disagree) ? 0  : reactions.get(disagree).count - 1 );

    message.channel.send(`Vote results : \n\n ${agree} : ${ positive } \n\n ${disagree} : ${ negative }`);
}

module.exports.help = {
    name: 'vote'
}
