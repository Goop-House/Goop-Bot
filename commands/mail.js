const db = require('quick.db');
var fs = require('fs');
const Discord = require("discord.js");
var generator = require('generate-password');
var exec = require('child_process').exec;


exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars

    if(message.guild.id != 834529611097309224){
        return message.channel.send(`<@${message.author.id}>, you must be in the GOOP House`);
    }

    if(!args[0]){
        return message.channel.send(`<@${message.author.id}>, ` + "USAGE: `goop!mail <username>` [e.g <username>@goop.house]");
    }

    if(db.has("mail_" + message.author.id)){
        return message.channel.send(`<@${message.author.id}>, you have already created an account, please contact TheLickIn13Keys#7977 to reset your password or change your username`);
    }
    else{


        var genPassword = generator.generate({
            length: 10,
            numbers: true
        });
        const command = `curl -X POST -d "email=${args[0]}@goop.house" -d "password=${genPassword}" --user controller@goop.house:${client.config.mailpass} https://box.goop.house/admin/mail/users/add`

        exec(command, function (error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if (error !== null) {
              console.log('exec error: ' + error);
              message.channel.send(`<@${message.author.id}>, something went wrong: ` + error)
            }
            if(stdout.includes("User already exists.") || stderr.includes("User already exists.")){
                return message.channel.send(`<@${message.author.id}>, the specified username is already in use`);
            }
            else if(stdout.includes("mail user added")){
                message.channel.send("Successfully Created Email Account");
                message.channel.send("Check your DM's for login details");
                db.set("mail_" + message.author.id, "true");

                const outputEmbed = new Discord.MessageEmbed()
                .setAuthor("goop.house", "https://cdn.discordapp.com/attachments/834541919568527361/874767069772660736/goop_house_logo_for_disc.png")
                .setTitle("User Successfully Registered")
                .addField("Username:", `${args[0]}@goop.house`)
                .addField("Password:", `||${genPassword}||`)
                .addField("Mail Login", "https://box.goop.house/mail/")
                .addField("Nextcloud Login (DO NOT ABUSE)", "https://box.goop.house/cloud/")
                .setTimestamp(new Date());
                message.author.send(outputEmbed);
                return;
            }
            else{
                message.channel.send(`<@${message.author.id}>, something went wrong: ` + stdout)
                return;
            }

          });





    }


};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: "User"
};

exports.help = {
  name: "mail",
  category: "Utility",
  description: "gives you an @goop.house email account and a personal nextcloud",
  usage: "mail <username> [e.g username@goop.house]"
};
