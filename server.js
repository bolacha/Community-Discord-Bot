//Load your bot token from your file
var botKey = require("fs").readFileSync("./botKey.txt").toString();

//Connect to discord
var discordJunk = require("./discordJunk.js");
discordJunk({"auth":"Bot " + botKey},
discordBot,function(err,statusCode,response) {
    console.log("Error here!");
});
var discordGlobal = null; //Don't actually have a use for this, just thought I'd include it

//Connected to discord! Add message handlers and/or other logic here
function discordBot(discord) {
    discordGlobal = discord;

    discord.getGuilds(function(guilds){
        console.log("Success!!");
    },function(error,statusCode,response) {
        console.log("error");
    });

}