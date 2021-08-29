const config = {
  // Bot Owner, level 10 by default. A User ID. Should never be anything else than the bot owner's ID.
  "ownerID": "620845493957951498",

  // Bot Admins, level 9 by default. Array of user ID strings.
  "admins": [],

  // Bot Support, level 8 by default. Array of user ID strings
  "support": [],

  // Your Bot's Token. Available on https://discordapp.com/developers/applications/me
  "token": "ODUzNDMwMDIxMjAwMjgxNjMw.YMVQpQ.YjFk_ZCjS1msZv7Lrp4PP3Mkv48",

  "mailpass": "c7bBxs22e7Di",

  "dashboard" : {
    "oauthSecret": "tzkYy4RXqiQ9JDfQWIoUbW7MR93K6wwB",
    "callbackURL": `http://bot.goop.house/callback`,
    "sessionSecret": "Bardiaanvari2006$",
    "domain": "bot.goop.house",
    "port": 5142
  },

  // PERMISSION LEVEL DEFINITIONS.
  permLevels: [
    {
      level: 0,
      name: "User", 
      check: () => true
    },

    { 
      level: 2,
      name: "Moderator",
      check: (message) => {
        try {
          const modRole = message.guild.roles.find(r => r.name.toLowerCase() === message.settings.modRole.toLowerCase());
          if (modRole && message.member.roles.has(modRole.id)) return true;
        } catch (e) {
          return false;
        }
      }
    },

    {
      level: 3,
      name: "Administrator", 
      check: (message) => {
        try {
          const adminRole = message.guild.roles.find(r => r.name.toLowerCase() === message.settings.adminRole.toLowerCase());
          return (adminRole && message.member.roles.has(adminRole.id));
        } catch (e) {
          return false;
        }
      }
    },

    /*{
      level: 4,
      name: "Server Owner", 
      check: (message) => message.channel.type === "text" ? (message.guild.owner.user.id === message.author.id ? true : false) : false
    },*/

    {
      level: 8,
      name: "Bot Support",
      check: (message) => config.support.includes(message.author.id)
    },

    { 
      level: 9,
      name: "Bot Admin",
      check: (message) => config.admins.includes(message.author.id)
    },

    { 
      level: 10,
      name: "Bot Owner", 
      check: (message) => message.client.owners.includes(message.author.id)
    }
  ]
};

module.exports = config;
