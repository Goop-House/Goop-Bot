

const fetch = require("node-fetch");

exports.run = async (client, message, args, level) => { // eslint-disable-line no-unused-vars
  const code = args.join(" ");
  try {
    const evaled = eval(code);
    const clean = await client.clean(client, evaled);
    const MAX_CHARS = 3 + 2 + clean.length + 3;
    if (MAX_CHARS > 1900) {
      const { key } = await fetch("https://hasteb.in/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: Buffer.from(clean)
      }).then(res => res.json());
      return message.channel.send(`Output exceeded 2000 characters, uploading to text site, https://hasteb.in/raw/${key}`);
    }
    message.channel.send(`\`\`\`js\n${clean}\n\`\`\``);
  } catch (err) {
    message.channel.send(`\`ERROR\` \`\`\`xl\n${await client.clean(client, err)}\n\`\`\``);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: "Bot Owner"
};

exports.help = {
  name: "eval",
  category: "System",
  description: "Evaluates arbitrary javascript.",
  usage: "eval [...code]"
};
