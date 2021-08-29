
const path = require('path');
const Discord = require("discord.js");
const DBL = require("dblapi.js");
const db = require('quick.db');;
const ytdl = require('ytdl-core');
var gis = require('g-i-s');
var stringSimilarity = require('string-similarity');
const AntiSpam = require('discord-anti-spam');
const yts = require('yt-search');
const queue = new Map();





module.exports = async (client, message) => {

  if (message.author.bot) return;
  var temp = message.content.toString();
  var message1 = temp.toLowerCase();
  //const youtubePlayer = new MusicBotAddon.YoutubePlayer(YOUTUBE_API_KEY, options);
  //console.log(message.content);
  const settings = message.settings = client.getSettings(message.guild);

  if (message.content === 'bruh') {
      if (message.author.bot) return;
      if (settings["replyToBruh"] == "false") {
          return;
      } else {
          message.channel.send("linus says bruh");
          message.channel.send("https://cdn.discordapp.com/attachments/642568249300615198/750383457590313091/D7ShRPYXoAA-XXB.jpg");
      }
  };




    
    function containsAll(first, second) {
        const indexArray = first.map(el => {
            return second.indexOf(el);
        });
        return indexArray.indexOf(-1) === -1;
    }
    const { Permissions } = require("discord.js")
    //new Permissions(message.channel.permissionsFor(message.guild.me)).hasPermissions(["READ_MESSAGES", "VIEW_CHANNEL", "EXTERNAL_EMOJIS", "READ_MESSAGE_HISTORY", "SEND_MESSAGES", "EMBED_LINKS"])
    mypermissions = new Permissions(message.channel.permissionsFor(message.guild.me))
    var arrayPermissions = []
    arrayPermissions = mypermissions.toArray();
    if (containsAll(["MANAGE_MESSAGES"], arrayPermissions)) {
        //message.delete()
    }
    var serverQueue = queue.get(message.guild.id);

    if (message.content.startsWith(`${settings.prefix}play`) || message.content.startsWith(`${settings.prefix} play`)) {
        execute(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${settings.prefix}skip`) || message.content.startsWith(`${settings.prefix} skip`)) {
        skip(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${settings.prefix}stop`) || message.content.startsWith(`${settings.prefix} stop`)) {
        stop(message, serverQueue);
        return;
    } else if (message.content.startsWith(`${settings.prefix}vol`) || message.content.startsWith(`${settings.prefix} vol`)) {
        vol(message, serverQueue)
    } else if (message.content.startsWith(`${settings.prefix}pause`) || message.content.startsWith(`${settings.prefix} pause`)) {
        pause(message, serverQueue)
    } else if (message.content.startsWith(`${settings.prefix}resume`) || message.content.startsWith(`${settings.prefix} resume`)) {
        resume(message, serverQueue)
    } else if (message.content.startsWith(`${settings.prefix}lock`) || message.content.startsWith(`${settings.prefix} lock`)) {
        lock(message, serverQueue)
    } else if (message.content.startsWith(`${settings.prefix}unlock`) || message.content.startsWith(`${settings.prefix} unlock`)) {
        unlock(message, serverQueue)
    } else if (message.content.startsWith(`${settings.prefix}control`) || message.content.startsWith(`${settings.prefix} control`)) {
        control(message, serverQueue)
    } else if (message.content.startsWith(`${settings.prefix}replay`) || message.content.startsWith(`${settings.prefix} replay`)) {
        replay(message, serverQueue)
    } else if (message.content.startsWith(`${settings.prefix}queue`) || message.content.startsWith(`${settings.prefix} queue`)) {
        disQueue(message, serverQueue)
    } else {
        
    }


async function execute(message, serverQueue) {
    if (serverQueue) {

        if (message.author.id != serverQueue.player.id && serverQueue.locked) {
            message.channel.send("The player has locked the commands!").then(m => {
                enableDeleting(m, message.author.id)
            })
            return
        }
    }
    const args = message.content.split(" ");

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
        return message.channel.send(
            "You need to be in a voice channel to play music!"
        ).then(m => {
            enableDeleting(m, message.author.id)
        });
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return message.channel.send(
            "I need the permissions to join and speak in your voice channel!"
        ).then(m => {
            enableDeleting(m, message.author.id)
        });
    }
    //if (args[1].endsWith())
    if (args.length > 1) {
        args.shift()
    }
    var videos = await yts(args.join(" "));
    //console.log(args.join(" "))
    var video = videos.videos[0]
    if (!video.url) {
        message.channel.send("Song was not found!").then(m => {
            enableDeleting(m, message.author.id)
        })
        return;
    }
    const songInfo = await ytdl.getInfo(video.url);
    var song
    if (songInfo.videoDetails.video_url != "https://www.youtube.com/watch?v=Sbdutn8Q1T0") {
        song = {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url,
        };
    } else {
        song = {
            title: "Default by Aaron K.",
            url: songInfo.videoDetails.video_url,
        };
    }
    var ok = false;
    if (!serverQueue) ok = true
    if (serverQueue) if (serverQueue.songs.length == 0) ok = true
    if (ok) {
        const queueContruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true,
            dispatcher: null,
            locked: false,
            player: message.author,
            volume: 0.75
        };

        queue.set(message.guild.id, queueContruct);

        queueContruct.songs.push(song);
        //console.log(serverQueue.songs)
        try {
            var connection = await voiceChannel.join();
            queueContruct.connection = connection;
            //console.log(queueContruct.songs[0])
            play(message.guild, queueContruct.songs[0], message);
        } catch (err) {
            //console.log(err);
            queue.delete(message.guild.id);
            return message.channel.send(err);
        }
    } else {
        serverQueue.songs.push(song);
        const embedToSend1 = new Discord.MessageEmbed()
        .setColor(0x1c990a)
        .setTitle('**Added to Queue**')
        .setDescription(`[${song.title}](${song.url})`)
        .setTimestamp()
        return message.channel.send(embedToSend1).then(m => {
            enableDeleting(m, message.author.id)
        });
    }
}

function skip(message, serverQueue) {
    if (serverQueue) {
        if (message.author.id != serverQueue.player.id && serverQueue.locked) {
            message.channel.send("The player has locked the commands!").then(m => {
                enableDeleting(m, message.author.id)
            })
            return
        }
    }
    if (!serverQueue)
        return message.channel.send("There is no song that I could skip!").then(m => {
            enableDeleting(m, message.author.id)
        });
    serverQueue.connection.dispatcher.end();
}

function disQueue(message, serverQueue) {
    if (serverQueue) {
        if (message.author.id != serverQueue.player.id && serverQueue.locked) {
            message.channel.send("The player has locked the commands!").then(m => {
                enableDeleting(m, message.author.id)
            })
            return;
        }
        else{
            const embedToSend2 = new Discord.MessageEmbed()
            .setColor('0x1c990a')
            .setTitle('**Current Queue**')
            .setDescription("```" + serverQueue + "```")
            .setTimestamp()
            return message.channel.send(embedToSend2).then(m => {
            enableDeleting(m, message.author.id)
        });
        }
    }
    if (!serverQueue){
        return message.channel.send("The queue is empty").then(m => {
            enableDeleting(m, message.author.id)
        });
    }
}

function stop(message, serverQueue) {
    if (serverQueue) {
        if (message.author.id != serverQueue.player.id && serverQueue.locked) {
            message.channel.send("The player has locked the commands!").then(m => {
                enableDeleting(m, message.author.id)
            })
            return
        }
    }
    if (!message.member.voice.channel)
        return message.channel.send(
            "You have to be in a voice channel to stop the music!"
        ).then(m => {
            enableDeleting(m, message.author.id)
        })

    if (!serverQueue)
        return message.channel.send("There is no song that I could stop!").then(m => {
            enableDeleting(m, message.author.id)
        });

    //serverQueue.songs = [];
    serverQueue.connection.dispatcher.setVolume(0)
    serverQueue.connection.dispatcher.resume()
    setTimeout(() => { serverQueue.connection.dispatcher.end() }, 500)
}

function vol(message, serverQueue) {
    if (serverQueue) {
        if (message.author.id != serverQueue.player.id && serverQueue.locked) {
            message.channel.send("The player has locked the commands!").then(m => {
                enableDeleting(m, message.author.id)
            })
            return
        }
    }
    const args = message.content.split(" ");
    if (args.length == 1) {
        message.channel.send("Volume is currently at **"+Math.round(parseFloat(serverQueue.volume) * 100)+"**").then(m=>{
            enableDeletingWithVolControls(m, message.author.id, serverQueue, message)
        })
        return
    }
    var volume;
    if (args[1].endsWith("%")) {
        volume = parseFloat(args[1]) / 100
    } else {
        volume = args[1]
    }
    if (parseFloat(volume) < 0) {
        message.channel.send("Cannot lower volume any further").then(m => {
            enableDeleting(m, message.author.id)
        })
        return;
    }
    if (vol > 1 && args[2] != "--force") {
        message.channel.send("uhh... I don't think you want to set the volume to **" + parseFloat(args[1]) * 100 + "%**, do you? Did you mean ^vol " + args[1] + "% ? If you didnt put a %, that is important. However, if you REALLY want to do that, type ^vol " + args[1] + " --force").then(m => {
            enableDeleting(m, message.author.id)
        })
        return
    }
    if (serverQueue.dispatcher != null) {
        const dispatcher = serverQueue.dispatcher
        dispatcher.setVolume(volume)
        serverQueue.volume = volume
        message.channel.send("Volume was set to **" + Math.round(parseFloat(volume) * 100) + "%**").then(m => {
            enableDeletingWithVolControls(m, message.author.id, serverQueue, message)
        })
    } else {
        message.channel.send("No song is playing!").then(m => {
            enableDeleting(m, message.author.id)
        })
    }
}

function volup(message, serverQueue, messageb) {
    var volume = (Math.round((parseFloat(serverQueue.volume) + 0.10) * 10)) / 10
    serverQueue.dispatcher.setVolume(volume)
    serverQueue.volume = volume
    messageb.edit("Volume was set to **" + Math.round(parseFloat(volume) * 100) + "%**")
}

function voldown(message, serverQueue, messageb) {
    var volume = (Math.round((parseFloat(serverQueue.volume) - 0.10) * 10)) / 10
    if (volume < 0) {
        messageb.edit("Cannot lower volume any further")
        return
    }
    serverQueue.dispatcher.setVolume(volume)
    serverQueue.volume = volume
    messageb.edit("Volume was set to **" + Math.round(parseFloat(volume) * 100) + "%**")
}

function pause(message, serverQueue) {
    if (serverQueue) {
        if (message.author.id != serverQueue.player.id && serverQueue.locked) {
            message.channel.send("The player has locked the commands!").then(m => {
                enableDeleting(m, message.author.id)
            })
            return
        }
    } else {
        return
    }
    const args = message.content.split(" ");
    if (serverQueue.dispatcher != null) {
        serverQueue.dispatcher.pause()
        if (message.content == "^pause") {
            message.channel.send("Playback has been paused").then(m => {
                enableDeleting(m, message.author.id)
            })
        }
    }
}

function resume(message, serverQueue) {
    if (serverQueue) {
        if (message.author.id != serverQueue.player.id && serverQueue.locked) {
            message.channel.send("The player has locked the commands!").then(m => {
                enableDeleting(m, message.author.id)
            })
            return
        }
    } else {
        return
    }
    const args = message.content.split(" ");
    if (serverQueue.dispatcher != null) {
        serverQueue.dispatcher.resume()
        if (message.content == "^resume") {
            message.channel.send("Playback has been resumed").then(m => {
                enableDeleting(m, message.author.id)
            })
        }
    }
}

function lock(message, serverQueue) {

    const args = message.content.split(" ");
    if (serverQueue.dispatcher) {
        if (serverQueue.dispatcher != null) {
            if (serverQueue.player.id == message.author.id) {
                serverQueue.locked = true
                message.channel.send("Commands have been locked").then(m => {
                    enableDeleting(m, message.author.id)
                })
            } else {
                message.channel.send("Only the player can lock commands!").then(m => {
                    enableDeleting(m, message.author.id)
                })
            }
        }
    }
}

function unlock(message, serverQueue) {
    const args = message.content.split(" ");
    if (serverQueue.dispatcher) {
        if (serverQueue.dispatcher != null) {
            if (serverQueue.player.id == message.author.id) {
                serverQueue.locked = false
                message.channel.send("Commands have been unlocked").then(m => {
                    enableDeleting(m, message.author.id)
                })
            } else {
                message.channel.send("Only the player can unlock commands!").then(m => {
                    enableDeleting(m, message.author.id)
                })
            }
        }
    }
}

function control(message, serverQueue) {
    function containsAll(first, second) {
        const indexArray = first.map(el => {
            return second.indexOf(el);
        });
        return indexArray.indexOf(-1) === -1;
    }
    const { Permissions } = require("discord.js")
    //new Permissions(message.channel.permissionsFor(message.guild.me)).hasPermissions(["READ_MESSAGES", "VIEW_CHANNEL", "EXTERNAL_EMOJIS", "READ_MESSAGE_HISTORY", "SEND_MESSAGES", "EMBED_LINKS"])
    mypermissions = new Permissions(message.channel.permissionsFor(message.guild.me))
    var arrayPermissions = []
    arrayPermissions = mypermissions.toArray();
    if (!containsAll(["MANAGE_MESSAGES"], arrayPermissions)) {
        message.channel.send("Manage Messages permission is required to use this feature!")
        return
    }
    //message.delete()
    const embed = new Discord.MessageEmbed()
        .setColor(0x1c990a)
        .setTitle('Music Control')
        .setURL('https://www.bot.ml')
        .setDescription('```Resume: ▶️️``````Pause: ⏸️``````Stop: ⏹️``````Replay: 🔁``````Next: ⏩``````Volume Up: 🔼``````Volume Down: 🔽``````Lock Controls: 🔒``````Unlock Controls: 🔓```')
        .setImage('https://cdn.discordapp.com/attachments/834541919568527361/874767069772660736/goop_house_logo_for_disc.png')
        .setTimestamp()
    //.setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png');
    message.channel.send(embed).then(messageb => {
        // Reacts so the user only have to click the emojis
        setTimeout(r => {
            setTimeout(r => {
                setTimeout(r => {
                    setTimeout(r => {
                        setTimeout(r => {
                            setTimeout(r => {
                                setTimeout(r => {
                                    setTimeout(r => {
                                        setTimeout(r => {
                                            setTimeout(r => {
                                                messageb.react('🗑️');
                                            }, 5);
                                            messageb.react('🔓');
                                        }, 5);
                                        messageb.react('🔒');
                                    }, 5);
                                    messageb.react('🔽');
                                }, 5);
                                messageb.react('🔼');
                            }, 5);
                            messageb.react('⏩');
                        }, 5);
                        messageb.react('🔁');
                    }, 5);
                    messageb.react('⏹️');
                }, 5);
                messageb.react('⏸️');
            }, 5);
            messageb.react('▶️');
        }, 5);

        // First argument is a filter function
        enableControl(messageb, serverQueue, message)
    })
}

function play(guild, song, message) {
    var serverQueue = queue.get(guild.id);
    if (!song) {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }
    //console.log(ytdl(song.url))
    const dispatcher = serverQueue.connection
        .play(ytdl(song.url))
        .on("finish", () => {
            try {
                //console.log(serverQueue)
                const embedToSend = new Discord.MessageEmbed()
                    .setColor(0x1c990a)
                    .setTitle('**Finished Playing**')
                    .setDescription(`[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})`)
                    .setTimestamp()
                message.channel.send(embedToSend).then(m => {
                    finishedSong(m, message.author.id, serverQueue, message, serverQueue.songs[0])
                    console.log(serverQueue.song)
                    serverQueue.songs.shift();
                    play(guild, serverQueue.songs[0], message);
                }).catch(e => {
                    //console.log(e)
                })
            } catch (e) {
                //console.log(e)
            }
        })
        .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    dispatcher.setVolume(serverQueue.volume)
    var id = message.author.id
    const embedToSend = new Discord.MessageEmbed()
        .setColor(0x1c990a)
        .setTitle('**Now Playing**')
        .setDescription(`[${song.title}](${song.url})`)
        .setTimestamp()
    serverQueue.textChannel.send(embedToSend).then(m => {
        enableDeletingWithControls(m, id, serverQueue, message)
    });
    serverQueue.dispatcher = dispatcher
}

function replay(message, serverQueue) {
    function containsAll(first, second) {
        const indexArray = first.map(el => {
            return second.indexOf(el);
        });
        return indexArray.indexOf(-1) === -1;
    }
    const { Permissions } = require("discord.js")
    //new Permissions(message.channel.permissionsFor(message.guild.me)).hasPermissions(["READ_MESSAGES", "VIEW_CHANNEL", "EXTERNAL_EMOJIS", "READ_MESSAGE_HISTORY", "SEND_MESSAGES", "EMBED_LINKS"])
    mypermissions = new Permissions(message.channel.permissionsFor(message.guild.me))
    var arrayPermissions = []
    arrayPermissions = mypermissions.toArray();
    if (containsAll(["MANAGE_MESSAGES"], arrayPermissions)) {
        message.delete()
    }
    if (serverQueue) {
        if (message.author.id != serverQueue.player.id && serverQueue.locked) {
            message.channel.send("The player has locked the commands!").then(m => {
                enableDeleting(m, message.author.id)
            })
            return
        }
    } else {
        return
    }
    if (serverQueue.dispatcher != null) {
        try {
            serverQueue.songs.unshift(serverQueue.songs[0])
            serverQueue.connection.dispatcher.setVolume(0)
            serverQueue.connection.dispatcher.resume()
            setTimeout(() => {
                serverQueue.connection.dispatcher.end();
            }, 500)
        } catch (e) {
            //console.log(e)
        }
    }
}

async function removeReactions(message, userId) {
    var userReactions = message.reactions.cache.filter(reaction => reaction.users.cache.has(userId));
    try {
        for (const reaction of userReactions.values()) {
            await reaction.users.remove(userId);
        }
    } catch (error) {
        //console.error('Failed to remove reactions.');
    }
    userReactions = message.reactions.cache.filter(reaction => reaction.users.cache.has(userId));
    try {
        for (const reaction of userReactions.values()) {
            await reaction.users.remove(userId);
        }
    } catch (error) {
        //console.error('Failed to remove reactions.');
    }
}

function enableControl(messageb, serverQueue, message) {
    messageb.awaitReactions((reaction, user) => { return !user.bot && user.id == message.author.id }, { max: 1, time: 300000 })
        .then(collected => {
            JSON.parse(JSON.stringify(collected.first())).users
            removeReactions(messageb, message.author.id)
            if (collected.first()) {
                enableControl(messageb, serverQueue, message)
            }
            var serverQueue = queue.get(message.guild.id);
            switch (collected.first().emoji.name) {
                case "▶️":
                    resume(message, serverQueue);
                    messageb.edit("Resumed playback")
                    break;
                case "⏸️":
                    pause(message, serverQueue);
                    messageb.edit("Paused playback")
                    break;
                case "⏹️":
                    stop(message, serverQueue);
                    messageb.edit("Stopped playback")
                    messageb.delete()
                    break;
                case "🔁":
                    replay(message, serverQueue);
                    messageb.edit("Replaying")
                    break;
                case "⏩":
                    skip(message, serverQueue);
                    messageb.edit("Skipping song")
                    break;
                case "🔼":
                    volup(message, serverQueue, messageb);
                    break;
                case "🔽":
                    voldown(message, serverQueue, messageb);
                    break;
                case "🔒":
                    lock(message, serverQueue);
                    break;
                case "🔓":
                    unlock(message, serverQueue);
                    break;
                case "🗑️":
                    messageb.delete()
                    break;
            }
        }).catch((e) => {
        try {
            messageb.delete().catch(e => {
                //console.log(e)
            })
        } catch (e) {
            //console.log(e)
        }
    });
}

function enableDeleting(message, id) {
    function containsAll(first, second) {
        const indexArray = first.map(el => {
            return second.indexOf(el);
        });
        return indexArray.indexOf(-1) === -1;
    }
    const { Permissions } = require("discord.js")
    //new Permissions(message.channel.permissionsFor(message.guild.me)).hasPermissions(["READ_MESSAGES", "VIEW_CHANNEL", "EXTERNAL_EMOJIS", "READ_MESSAGE_HISTORY", "SEND_MESSAGES", "EMBED_LINKS"])
    mypermissions = new Permissions(message.channel.permissionsFor(message.guild.me))
    var arrayPermissions = []
    arrayPermissions = mypermissions.toArray();
    if (!containsAll(["MANAGE_MESSAGES"], arrayPermissions)) {
        //message.channel.send("Manage Messages permission is required to use this feature!")
        return
    }

    try {
        message.react('🗑️')
    } catch (e) {
        //console.log(e)
    }

    message.awaitReactions((reaction, user) => { return !user.bot && user.id == id }, { max: 1, time: 50000 })
        .then(collected => {
            //JSON.parse(JSON.stringify(collected.first())).users
            removeReactions(message, message.author.id)
            removeReactions(message, message.author.id)
            switch (collected.first().emoji.name) {
                case "🗑️":
                    message.delete()
                    break;
            }
        }).catch((e) => {
        try {
            message.delete().catch(e => {
                console.log(e)
            })
        } catch (e) {
            console.log(e)
        }
    });
}
function enableDeletingWithControls(message, id, serverQueue, messagewithid) {
    function containsAll(first, second) {
        const indexArray = first.map(el => {
            return second.indexOf(el);
        });
        return indexArray.indexOf(-1) === -1;
    }
    const { Permissions } = require("discord.js")
    //new Permissions(message.channel.permissionsFor(message.guild.me)).hasPermissions(["READ_MESSAGES", "VIEW_CHANNEL", "EXTERNAL_EMOJIS", "READ_MESSAGE_HISTORY", "SEND_MESSAGES", "EMBED_LINKS"])
    mypermissions = new Permissions(message.channel.permissionsFor(message.guild.me))
    var arrayPermissions = []
    arrayPermissions = mypermissions.toArray();
    if (!containsAll(["MANAGE_MESSAGES"], arrayPermissions)) {
        //message.channel.send("Manage Messages permission is required to use this feature!")
        return
    }

    try {
        message.react('🗑️').then(() => {
            message.react('🎛️')
        })
    } catch (e) {
        console.log(e)
    }

    message.awaitReactions((reaction, user) => { return !user.bot && user.id == id }, { max: 1, time: 50000 })
        .then(collected => {
            //JSON.parse(JSON.stringify(collected.first())).users
            if (collected.first()) {
                enableDeletingWithControls(message, id, serverQueue, messagewithid)
            }
            removeReactions(message, messagewithid.author.id)
            switch (collected.first().emoji.name) {
                case "🗑️":
                    message.delete()
                    break;
                case "🎛️":
                    message.delete()
                    control(messagewithid, serverQueue)
                    break;
            }
        }).catch((e) => {
        try {
            message.delete().catch(e => {
                console.log(e)
            })
        } catch (e) {
            console.log(e)
        }
    });
}

function enableDeletingWithVolControls(message, id, serverQueue, messagewithid) {
    function containsAll(first, second) {
        const indexArray = first.map(el => {
            return second.indexOf(el);
        });
        return indexArray.indexOf(-1) === -1;
    }
    const { Permissions } = require("discord.js")
    //new Permissions(message.channel.permissionsFor(message.guild.me)).hasPermissions(["READ_MESSAGES", "VIEW_CHANNEL", "EXTERNAL_EMOJIS", "READ_MESSAGE_HISTORY", "SEND_MESSAGES", "EMBED_LINKS"])
    mypermissions = new Permissions(message.channel.permissionsFor(message.guild.me))
    var arrayPermissions = []
    arrayPermissions = mypermissions.toArray();
    if (!containsAll(["MANAGE_MESSAGES"], arrayPermissions)) {
        //message.channel.send("Manage Messages permission is required to use this feature!")
        return
    }

    try {
        message.react('🔼').then(() => {
            message.react('🔽')
        })
    } catch (e) {
        console.log(e)
    }

    message.awaitReactions((reaction, user) => { return !user.bot && user.id == id }, { max: 1, time: 5000 })
        .then(collected => {
            //JSON.parse(JSON.stringify(collected.first())).users
            if (collected.first()) {
                enableDeletingWithVolControls(message, id, serverQueue, messagewithid)
            }
            removeReactions(message, messagewithid.author.id)
            switch (collected.first().emoji.name) {
                case "🔼":
                    volup(message, serverQueue, message);
                    break;
                case "🔽":
                    voldown(message, serverQueue, message);
                    break;
            }
        }).catch((e) => {
        try {
            message.delete().catch(e => {
                console.log(e)
            })
        } catch (e) {
            console.log(e)
        }
    });
}

function finishedSong(message, id, serverQueue, messagewithid, song) {
    function containsAll(first, second) {
        const indexArray = first.map(el => {
            return second.indexOf(el);
        });
        return indexArray.indexOf(-1) === -1;
    }
    const { Permissions } = require("discord.js")
    //new Permissions(message.channel.permissionsFor(message.guild.me)).hasPermissions(["READ_MESSAGES", "VIEW_CHANNEL", "EXTERNAL_EMOJIS", "READ_MESSAGE_HISTORY", "SEND_MESSAGES", "EMBED_LINKS"])
    mypermissions = new Permissions(message.channel.permissionsFor(message.guild.me))
    var arrayPermissions = []
    arrayPermissions = mypermissions.toArray();
    if (!containsAll(["MANAGE_MESSAGES"], arrayPermissions)) {
        //message.channel.send("Manage Messages permission is required to use this feature!")
        return
    }

    try {
        message.react('🗑️').then(() => {
            message.react('🔁')
        })
    } catch (e) {
        console.log(e)
    }

    message.awaitReactions((reaction, user) => { return !user.bot && user.id == id }, { max: 1, time: 5000 })
        .then(collected => {
            //JSON.parse(JSON.stringify(collected.first())).users
            if (!collected) return
            if (collected.first()) {
                enableDeletingWithControls(message, id, serverQueue, messagewithid)
            }
            removeReactions(message, messagewithid.author.id)
            switch (collected.first().emoji.name) {
                case "🗑️":
                    message.delete()
                    break;
                case "🔁":
                    message.delete()
                    removeReactions(message, client.user.id)
                    var messageobj = {};
                    messageobj.content = "^play " + song.url
                    messageobj.channel = messagewithid.channel
                    messageobj.guild = messagewithid.guild
                    messageobj.delete = () => { }
                    messageobj.delete = () => { }
                    messageobj.author = messagewithid.author
                    messageobj.member = messagewithid.member
                    messageobj.client = messagewithid.client
                    execute(messageobj, serverQueue)
                    break;
            }
        }).catch((e) => {
        try {
            message.delete().catch(e => {
                console.log(e)
            })
        } catch (e) {
            console.log(e)
        }
    });
}

  // Grab the settings for this server from the PersistentCollection
  // If there is no guild, get default conf (DMs)
  // For ease of use in commands and functions, we'll attach the settings
  // to the message object, so `message.settings` is accessible.

  
  // Just in case we don't know what the current prefix is, mention the bot
  // and the following regex will detect it and fire off letting you know
  // what the current prefix is.
  const mentionMatch = new RegExp(`^<@!?${client.user.id}> ?$`);
  if (message.content.match(mentionMatch)) {
    return message.channel.send(`My prefix on this guild is \`${settings.prefix}\``);
  }

  // Also good practice to ignore any message that does not start with our prefix,
  // which is set in the configuration file, but as a fall back we'll also use
  // a mention as a prefix.
  // So the prefixes array lists 2 items, the prefix from the settings and
  // the bots user id (a mention).
  const prefixes = [settings.prefix.toLowerCase(), `<@!${client.user.id}>`];

  const content = message.content.toLowerCase();
  const prefix = prefixes.find(p => content.startsWith(p));
  if(message.channel.type === 'dm' && !prefix){
    message.channel.send("Make sure to use the global prefix: `tech!` for DMs")
  }

  if (!prefix) return;



  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  const level = client.permlevel(message);

  const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));

  if (!cmd) return;


  if (cmd && !message.guild && cmd.conf.guildOnly)
    return message.channel.send("This command is unavailable via private message. Please run this command in a guild.");

  if (level < client.levelCache[cmd.conf.permLevel]) {
    if (settings.systemNotice === "true") {
      return message.channel.send(`You do not have permission to use this command.
  Your permission level is ${level} (${client.config.permLevels.find(l => l.level === level).name})
  This command requires level ${client.levelCache[cmd.conf.permLevel]} (${cmd.conf.permLevel})`);
    } else {
      return;
    }
  }


  message.author.permLevel = level;
  
  message.flags = [];
  while (args[0] && args[0][0] === "-") {
    message.flags.push(args.shift().slice(1));
  }
  client.logger.log(`${client.config.permLevels.find(l => l.level === level).name} ${message.author.username} (${message.author.id}) ran command ${cmd.help.name}`, "cmd");
  cmd.run(client, message, args, level);


};
