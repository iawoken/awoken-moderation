class Ses {
  constructor () {
  (this.name = "ses", this.alias = ["voice"]);
};
  
  async operate ({ client, message, args, config, member, author }, {MessageEmbed} = require("discord.js")) {
    const xd = args[0];
     const TaglıSize = message.guild.members.cache.filter(u => u.user.username.includes(config.Tags.OrjTag)).size || 0;
     const VoiceSize = message.guild.channels.cache.filter(c => c.type === "voice").map(c=> c.members.size).reduce((a,b) => a+b) || 0;
     const parent = (name) => {
      const parentID = config.Voice.Parents[name];
      return message.guild.channels.cache.filter(x => x.type == "voice" && x.parentID == parentID);
   };
  if (!xd || (xd && !["detay", "detaylı"].includes(xd))) {
   client.message(client.embed(`${client.react("star")} Sunucumuzda seste toplam **${VoiceSize}** kullanıcı bulunmaktadır.\n\n${client.react("star")} Sunumuzda tag almış **${TaglıSize}** kullanıcı bulunmaktadır.`, message, true), message.channel.id)
  } else if (["detay", "detaylı"].includes(xd)) {
   const parents = { register: { channels: parent("register") }, public: { channels: parent("public") }, secret: { channels: parent("secret") }, alone: { channels: parent("alone") }, other: { channels: parent("other") } };
   const FakeVoice = message.guild.channels.cache.filter(c => c.type === "voice").map(c => c.members && c.members.filter(x => x.user.createdAt <= client.getDate(1, "hafta")).size).reduce((a,b) => a+b) || 0;
   const BotVoice = message.guild.channels.cache.filter(c => c.type === "voice").map(c => c.members && c.members.filter(x => x.user.bot).size).reduce((a,b) => a+b) || 0;
   const nev = {};
    Object.keys(parents).forEach(value => {
     const xd = parents[value];
      if (xd && (xd.channels && xd.channels.size > 0)) {
       const parentTotal = xd.channels.map(x => x.members.size).reduce((x, y) => x + y) || 0;
       const parentFake = xd.channels.map(x => x.members && x.members.filter(v => v.user.createdAt <= client.getDate(1, "hafta")).size).reduce((x, y) => x + y) || 0;
       const parentBot = xd.channels.map(x => x.members && x.members.filter(v => v.user.bot).size).reduce((x, y) => x + y) || 0;
      xd.total = parentTotal;
      xd.fake = parentFake;
      xd.bot = parentBot;
    return nev[value] = xd;
  }; 
});
   const embed = new MessageEmbed()
    .setAuthor(message.author.username, message.author.avatarURL({ dynamic: true }))
    .setFooter(`Sayısal istatistikler (Toplam | Fake | Bot) şeklinde sıralanmıştır.`)
    .setColor(client.Renk[Math.floor((Math.random() * client.Renk.length))])
    .setDescription(`${client.react("star")} Sunucumuzda seste (\`${VoiceSize}\` | \`${FakeVoice}\` | \`${BotVoice}\`) kullanıcı bulunmaktadır.\n────────────\n${Object.keys(nev).map((value, index) => `${client.react("star")} **${value.charAt(0).toUpperCase() + value.slice(1)}** Kategorisinde (\`${nev[value].total}\` | \`${nev[value].fake}\` | \`${nev[value].bot}\`) kullanıcı bulunmaktadır.`).join("\n")}`);
     client.message(embed, message.channel.id);
    };
  };
};

module.exports = Ses;