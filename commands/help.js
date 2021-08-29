

const { DiscordAPIError } = require("discord.js");
const Discord = require("discord.js");

exports.run = (client, message, args, level) => {
  if (!args[0]) {
    const settings = message.settings;

    const myCommands = message.guild ? client.commands.filter(cmd => client.levelCache[cmd.conf.permLevel] <= level) : client.commands.filter(cmd => client.levelCache[cmd.conf.permLevel] <= level &&  cmd.conf.guildOnly !== true);

    const commandNames = myCommands.keyArray();
    const longest = commandNames.reduce((long, str) => Math.max(long, str.length), 0);

    let currentCategory = "";
    let output = `= Command List =\n\n[Use ${settings.prefix}help <command name> for details]\n`;
    /*const sorted = myCommands.array().sort((p, c) => p.help.category > c.help.category ? 1 :  p.help.name > c.help.name && p.help.category === c.help.category ? 1 : -1 );
    sorted.forEach( c => {
      const cat = c.help.category.toProperCase();
      if (currentCategory !== cat) {
        output += `\n== ${cat} ==\n`;
        currentCategory = cat;
      }
      output += `${settings.prefix}${c.help.name}${" ".repeat(longest - c.help.name.length)} :: ${c.help.description}\n`;
    });
    message.channel.send(output, {code:"asciidoc"});
    */
   const outputEmbed = new Discord.MessageEmbed()
   .setAuthor("Goop Bot Commands", "https://cdn.discordapp.com/attachments/834541919568527361/874767069772660736/goop_house_logo_for_disc.png")
   .setDescription("The prefix for `" + message.guild.name +"` is `" + settings.prefix +"`\n\n"+
   "Individual Command Help: `" + settings.prefix +"help <command>`\n\n"+
   "**Useful Resources**\n"+
   "[Command List](https://bot.goop.house/commands)\n"+
   "[Dashboard](https://bot.goop.house/)\n"+
   "[Support Server](https://discord.gg/ebAA7WDxry)\n"+
   "[Github Repo](https://github.com/Goop-House/Goop-Bot)\n")
   .setColor(0x1c990a)
   .setFooter("\nGoop Bot Developed by Bardia\n(TheLickIn13Keys#7977)")
    message.channel.send(outputEmbed);
  } else {
    let command = args[0];
    if (client.commands.has(command)) {
      command = client.commands.get(command);
      if (level < client.levelCache[command.conf.permLevel]) return;
      message.channel.send(`= ${command.help.name} = \n${command.help.description}\nUSAGE: ${command.help.usage}`, {code:"asciidoc"});
    }
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ["h", "halp"],
  permLevel: "User"
};

exports.help = {
  name: "help",
  category: "General",
  description: "Displays all the available commands for your permission level.",
  usage: "help [command]"
};
