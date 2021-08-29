const db = require('quick.db');
var fs = require('fs');
const Discord = require("discord.js");
exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    db.delete("mail_" + args[0])
    message.channel.send("Removed Record")
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: "Bot Owner"
};

exports.help = {
  name: "resetmail",
  category: "Utility",
  description: "allows a user to create another mail account",
  usage: "resetmail <userid>"
};
