
module.exports = (client, guild) => {
  const Discord = require("discord.js");

  client.logger.log(`Joined guild: ${guild.name} (${guild.id}) with ${guild.memberCount} members`);
  const embed0 = new Discord.MessageEmbed()
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
  guild.systemChannel.send(embed0);

};
