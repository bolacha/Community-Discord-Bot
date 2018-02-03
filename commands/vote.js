const agree = "✅";
const disagree = "❎";
const time = require('../config.js').time;


const updateCountdown = (msg, timeLeft) => {

    const content = msg.content.split("\n\n").map((current, index, array) => {
        if(index === (array.length) - 1) {
            if(timeLeft == 0){
                return `Voting time finished.`;
            } else {
                return `This will be running for ${timeLeft} seconds.`;
            }
        } else {
            return current;
        }
     }).join("\n\n");

    msg.edit(content);
}

const timer = async (msg) => {

    let time_left = time / 1000;

    var timerId = setInterval(() => {

        if (time_left == 1) {
            clearTimeout(timerId);

            updateCountdown(msg, 0);
        } else {
            updateCountdown(msg, time_left);

            time_left--;
        }
    }, 1000);
}

module.exports.run = async (bot, message, args) => {

    let msg = await message.channel.send(`Voting for : \n\n ${ args.join(" ") }\n\n by Author : ${message.author} \n\n This will be running for aproximately ${time/1000} seconds.`);

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
