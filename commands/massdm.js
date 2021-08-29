exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
    try{
        message.guild.members.cache.forEach(async (member, index) => {
            if (member.id != client.user.id && !member.user.bot) member.send(args.join(" "));
            var rand = Math.floor(Math.random() * 5) + 1;
            console.log(`User #${index} sent message in ${rand*1000} milliseconds`);
            await sleep(rand*1000);

        });
        message.channel.send("Mass DMd " + args.join(" "));
    }
    catch(err) {
        message.channel.send("An Error Occured");
    }
  };

  function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  } 
  
  exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: [],
    permLevel: "Bot Owner"
  };
  
  exports.help = {
    name: "massdm",
    category: "Utility",
    description: "Mass DM's FOR OWNER USE ONLY",
    usage: "massdm <text>"
  };
  