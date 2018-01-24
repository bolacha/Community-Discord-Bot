var https = require("https"), ws = require("ws");

module.exports = function(options, success, error) {
    var apiBase = "/api/v6";
    var botAuth = "";
    if (options.hasOwnProperty("auth")) botAuth = options.auth;
    function discordApp(endpoint, body, callback) {
        var request = https.request({
            hostname: "discordapp.com",
            path: apiBase + endpoint.split(";")[0],
            method: endpoint.split(";").length > 1 ? endpoint.split(";")[1] : "GET",
            headers: {
                "Authorization": botAuth,
                "Content-Type": "application/json"
            }
        });
        request.write(body);
        request.on("response",function(res) {
            var response = "";
            res.on("data",function(data) {response = response + data.toString()});
            res.on("end",function() {
                try {
                    response = JSON.parse(response);
                } catch(err) {
                    callback(res.statusCode, response, res, err);
                    return;
                }
                callback(res.statusCode, response, res);
            });
        });
        request.end();
    }
    
    var discordGateway = null, heartbeat = null, session = null, connectionURL = null, junk = null;
    
    var actualObject = null;
    
    function startUp(statusCode,response,res,err) {
        if (statusCode !== 200) {
            error("get-gateway-fail", statusCode, response);
            return;
        }
        discordGateway = new ws(response.url + "/?v=6");
        connectionURL = response.url + "/?v=6";
        junk = 0;
        discordGateway.on("message", function(message) {
            switch (junk) {
                case 0: 
                    heartbeat = setInterval(function() {
                        discordGateway.send(JSON.stringify({op: 1, d: JSON.parse(message).d["heartbeat_interval"]}));
                    },
                    JSON.parse(message).d["heartbeat_interval"] - 20);
                    discordGateway.send(JSON.stringify({
                        op: 2,
                        d: {
                            token: botAuth,
                            properties: {
                                "$os": "linux",
                                "$browser": "node.js",
                                "$device": "node.js",
                            },
                            compress: false,
                            large_threshold: 50,
                            shard: [0,1],
                            presence: {
                                status: "online",
                                afk: false,
                                since: null,
                                game: null
                            }
                        }
                    })); junk = 1; break;
                    
                case 1:
                    session = JSON.parse(message).d["session_id"];
                    actualObject = new buildObject();
                    success(actualObject);
                    junk = 2; break;
                    
                case 2:
                    handleMessage(JSON.parse(message)); break;
            }
        });
        setTimeout(function(){
            if (junk !== 2) {
                error("gateway-timeout",null,null);
                return;
            }
        })
        
        discordGateway.on("close",function() {
            console.log("Hi");
        });
    };

    function handleMessage(message) {
        if (message.t === "MESSAGE_CREATE") {
            var message2 = {
                message: message.d.content,
                sender: message.d.author.id,
                respond: function(response) {
                    discordApp("/channels/"+message.d["channel_id"]+"/messages;POST",JSON.stringify({
                        content: response
                    }),function(statusCode,response,res,err){
                        console.log("Hi");
                    });
                },
                respondEmbed: function(response) {
                    discordApp("/channels/"+message.d["channel_id"]+"/messages;POST",JSON.stringify({
                        //content: response.description,
                        embed: response
                    }),function(statusCode,response,res,err){
                        console.log("Hi");
                    });
                }
            };
            actualObject.messageHandlers.forEach(function(handler) {
                handler(message2);
            })
        }
    }
    
    function buildObject() {
        //Sending of Messages
        this.sendMessage = function(message, channelSnowflake, success, error) {
            discordApp("/channels/"+channelSnowflake+"/messages;POST",{content: message},function(statusCode, response, res, err) {
                if (statusCode === 200) {
                    success(response);
                } else {
                    error("sendMessage-fail",statusCode, response);
                }
            });
        }
        this.sendEmbedMessage = function(message, channelSnowflake, success, error) {
            discordApp("/channels/"+channelSnowflake+"/messages;POST",{embed: message},function(statusCode, response, res, err) {
                if (statusCode === 200) {
                    success(response);
                } else {
                    error("sendEmbedMessage-fail",statusCode, response);
                }
            });
        }

        //Getting messages, channels, and guilds
        this.getMessages = function(channelSnowflake, count, success, error) {
            discordApp("/channels/"+channelSnowflake,"",function(statusCode, response, res, err) {
                if (statusCode !== 200) {
                    error("getMessages-getLastMessage-fail",statusCode,response);
                    return null;
                }
                if (typeof response["last_message_id"] !== "string") {success([]); return null;}
                discordApp("/channels/"+channelSnowflake+"/messages?before="+response["last_message_id"]+"&limit="+count,"",function(statusCode, response, res, err) {
                    if (statusCode !== 200) {
                        error("getMessages-getMessages-fail",statusCode,response); 
                        return null;
                    }
                    success(response);
                });
            });
        }
        this.getChannel = function(channelSnowflake, success, error) {
            discordApp("/channels/"+channelSnowflake,"",function(statusCode, response, res, err) {
                if (statusCode !== 200) {
                    error("getChannel-fail", statusCode, response); return null;
                }
                success(response);
            })
        }
        this.getGuild = function(guildSnowflake, success, error) {
            discordApp("/guilds/"+guildSnowflake,"",function(statusCode,response,res,err){
                if (statusCode !== 200) {
                    error("getGuild-fail",statusCode,response); return null;
                }
            });
        }

        //Authorization
        this.getAuthorizationValue = function() {return botAuth;}
        this.setAuthorizationValue = function(value) {botAuth = value;}

        //Events
        this.messageHandlers = [];

        //Other junk
        this.discordApp = discordApp;
    }

    /*var messageHandlers = [];
    function handleMessage(message) {
        if (message.t === "MESSAGE_CREATE") {
            var message2 = {
                message: message.d.content,
                sender: message.d.author.id,
                respond: function(response) {
                    discordApp("/channels/"+message.d["channel_id"]+"/messages;POST",JSON.stringify({
                        content: response
                    }),function(statusCode,response,res,err){
                        console.log("Hi");
                    });
                },
                respondEmbed: function(response) {
                    discordApp("/channels/"+message.d["channel_id"]+"/messages;POST",JSON.stringify({
                        //content: response.description,
                        embed: response
                    }),function(statusCode,response,res,err){
                        console.log("Hi");
                    });
                }
            };
            messageHandlers.forEach(function(handler) {
                if (handler[0] === 0) {
                    if (message.d.content.slice(0,handler[1].length+2) === "!"+handler[1]+" ") handler[2](message2);
                    if (message.d.content === "!"+handler[1]) handler[2](message2);
                }
                if (handler[0] === 1) {
                    if (message.d.content.split(handler[1]).length > 1) handler[2](message2);
                }
            });
        }
    }
    
    messageHandlers.push([0,"ping",function(message) {
        message.respond("Pong!");
    }]); */
    
    function PMmessage(userID, message) {
        discordApp("/users/@me/channels;POST",JSON.stringify({
            "recipient_id": userID
        }),function(statusCode, response, res, err) {
            if (statusCode === 200) {
                discordApp("/channels/"+response.id+"/messages;POST",JSON.stringify({
                    content: message
                }),function(){});
            }
        });
    }
    function PMmessageEmbed(userID, message) {
        discordApp("/users/@me/channels;POST",JSON.stringify({
            "recipient_id": userID
        }),function(statusCode, response, res, err) {
            if (statusCode === 200) {
                discordApp("/channels/"+response.id+"/messages;POST",JSON.stringify({
                    embed: message
                }),function(){});
            }
        });
    }
    discordApp("/gateway/bot","",startUp);
}