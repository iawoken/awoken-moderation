class Mute {
  constructor() {
    (this.name = "mute", this.alias = ["vmute", "cmute", "voicemute", "chatmute"])
  };
  
  async operate ({ client, message, args, config, member, author }, Database = require("../Models/Member"), Schema = require("../Models/Restriction"), ms = require("ms")) {
    if ((!author.roles.cache.some(r => config.Perms.Mute.includes(r.id))) && (!author.permissions.has("ADMINISTRATOR"))) return client.tepki(message, "iptal", client.NoPerm(message));
    if (!member) return client.tepki(message, "iptal", client.NoMember(message)); 
    if (author.roles.highest.position <= member.roles.highest.position) return client.message(client.embed(`${client.react("iptal")} | Bu kişi senden yüksek veya aynı yetkiye sahip olduğu için mute atamazsın.`, message), message.channel.id, 5000);
      let time = args[1] && ms(args[1]) ? args[1] : false;
      let reason = args.slice(2).join(" ") || "Sebep belirtilmedi.";
      var ceza = await client.cezaNumara();
      var emojis = [client.react("cmute").id, client.react("vmute").id], filter = (reaction, user) => emojis.includes(reaction.emoji.id) && user.id == author.id;
    message.channel.send(client.embed(`${client.react("star")} ${member}, üyesinin ${time ? `\`${`${client.format(ms(time))}`.replace(", 0 saniye", "").trimEnd()}\``: ""} boyunca hangi tipte susturulacağını aşağıdan belirtmelisin.`, message)).then(async (mesaj) => {
      emojis.forEach(emoji => mesaj.react(emoji));
      const collector = mesaj.createReactionCollector((filter), { time: 20000 });
      var type;
      let Data;
      collector.on("collect", async reaction => {
        let xd = reaction.emoji.name;
        if (reaction.emoji.id == emojis[0]) {
          await mesaj.reactions.removeAll();
          if (ms(args[1])) {
            type = "MUTE";
            await member.roles.add(config.CezaRoles.MuteRoles).catch(() => {});
            Data = await Schema.findOne({userID: member.id, Activity: true, Type: type}).exec();
            if (!Data) (new Schema({ CezaID: ceza, userID: member.id, Type: type, Author: author.id, Reason: reason, DateNow: Date.now(), Activity: true, Temporary: true, FinishDate: Date.now() + ms(args[1]) }).save())
            else {
              Data.FinishDate = Data.FinishDate + ms(args[1])
              Data.save();
            }
          } else {
            type = "PERMAMUTE";
            await member.roles.add(config.CezaRoles.MuteRoles).catch(() => {});
            new Schema({ CezaID: ceza, userID: member.id, Type: type, Author: author.id, Reason: reason, DateNow: Date.now(), Activity: true, Temporary: false, FinishDate: null }).save();
          }; 
          client.cezaPuanı(member, 10);
          client.SayiPlus(message, Database, "mute");
          return mesaj.edit(client.embed(`${client.react("tik")} ${member} üyesi ${ms(args[1]) ? `\`${`${client.format(ms(time))}`.replace(", 0 saniye", "").trimEnd()}\` boyunca` : ""} metin kanallarında susturulmuştur.` + ` (\`#${ceza}\`)`, message)).then(x => message.react(client.react("tik")));
        } else {
          await mesaj.reactions.removeAll();
          if (ms(args[1])) {
            type = "VMUTE";
            if (member.voice.channel) member.voice.setMute(true).catch(() => { });
            new Schema({ CezaID: ceza, userID: member.id, Type: type, Author: author.id, Reason: reason, DateNow: Date.now(), Activity: true, Temporary: true, FinishDate: Date.now() + ms(args[1]) }).save();
          } else {
            type = "PERMAVMUTE";
            if (member.voice.channel) member.voice.setMute(true).catch(() => { });
            new Schema({ CezaID: ceza, userID: member.id, Type: type, Author: author.id, Reason: reason, DateNow: Date.now(), Activity: true, Temporary: false, FinishDate: null  }).save();
          };
          client.cezaPuanı(member, 10);
          client.SayiPlus(message, Database, "vmute");
          return mesaj.edit(client.embed(`${client.react("tik")} ${member} üyesi ${ms(args[1]) ? `\`${`${client.format(ms(time))}`.replace(", 0 saniye", "").trimEnd()}\` boyunca` : ""} ses kanallarında susturulmuştur.` + ` (\`#${ceza}\`)`, message)).then(x => message.react(client.react("tik")));
        };
      });
      
      collector.on("end", async (collect) => {
        if ((member.roles.cache.some(x => config.CezaRoles.MuteRoles.includes(x))) || (member.voice.channel && member.voice.selfMute) == true) return client.tepki(message, "tik")
        
        if (!type) {
          mesaj.delete();
          await message.reactions.removeAll();
          
          return client.tepki(message, "iptal");
        };
      });
    }); 
  }
};

module.exports = Mute;