const agree = "✅";
const disagree = "❎";
const time = require('../config.js').time;

const timer = async (msg) => {

    let time_left = time / 1000;

    let broken_msg = msg.content.split("\n\n");

    var timerId = setInterval(countdown, 1000);

    function countdown() {
        if (time_left == 1) {
            clearTimeout(timerId);

            broken_msg[broken_msg.length - 1] = `Voting time already finished`;

            msg.edit(broken_msg.join("\n\n"));
        } else {
            broken_msg[broken_msg.length - 1] = `This will be running for ${time_left} seconds.`;

            msg.edit(broken_msg.join("\n\n"));

            time_left--;
        }
    }
}

module.exports.run = async (bot, message, args) => {

    let msg = await message.channel.send(`Voting for : \n\n ${ args.join(" ") }\n\n by Author : ${message.author} \n\n This will be running for ${time/1000} seconds.`);

    await msg.react(agree);
    await msg.react(disagree);

    timer(msg);

    const reactions = await msg.awaitReactions((reaction) => {

        return reaction.emoji.name === agree || reaction.emoji.name === disagree;
    }, { time });

    const positive = ( !reactions.get(agree)    ? 0  : reactions.get(agree).count - 1 );
    const negative = ( !reactions.get(disagree) ? 0  : reactions.get(disagree).count - 1 );

    await message.channel.send(`Vote results : \n\n ${agree} : ${ positive } \n\n ${disagree} : ${ negative }`);
}

module.exports.help = {
    name: 'vote'
}
