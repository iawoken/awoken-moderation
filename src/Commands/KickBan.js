class KickBan {
  constructor () {
    (this.name = "ban", this.alias = ["yasakla", "kick", "at"]);
  };
  
  async operate ({ client, message, args, config, member, author }, fetch = require("node-fetch"), Database = require("../Models/Member.js"), Schema = require("../Models/Restriction.js")) {
    if ((!author.roles.cache.some(r => config.Perms.Commander.includes(r.id))) && (!author.permissions.has("ADMINISTRATOR"))) return client.tepki(message, "iptal", client.NoPerm(message));
    let split = message.content.toLowerCase().substring(message.prefix.length).split(" ");
    let target = (message.mentions.users.first()) || await (await fetch(`https://discord.com/api/users/${args[0]}`, {method:'GET', headers: {'Authorization': 'Bot ' + client.token}})).json();
    let reason = args.slice(1).join(" ") || "Bir sebep belirtilmedi.";
    
    if (["kick", "at"].includes(split[0])) {
      if ((!member)) return client.tepki(message, "iptal", client.NoMember(message)); 
      if ((member) && (author.roles.highest.position <= member.roles.highest.position)) return client.tepki(message, "iptal", client.embed(`${client.react("iptal")} | ${target} kullanıcısı senden üst bir rolde veya aynı roldesiniz, bu işlemi gerçekleştiremem.`, message));
      if ((member) && (member.kickable)) await member.kick().catch(() => { });
      await client.cezaPuanı(member, 25);
      var ceza = await client.cezaNumara();
      var cpoint = await client.cezaPuanCheck(member);
      new Schema({CezaID: ceza, Type: "KICK", userID: member.id, Author: author.id, Reason: reason, DateNow: Date.now(), Activity: true}).save()
      client.SayiPlus(message, Database, "kick");
      message.channel.send(client.embed(`${client.react("tik")} | ${member} üyesi sunucudan atıldı. (\`${ceza}\`)`, message))
      client.message(`${message.guild.members.cache.has(member.id) ? member : member.user.tag} : aldığınız **#${ceza}** ID'li ceza ile **${cpoint.Puan}** ceza puanına ulaştınız.`, config.Logs.CezaPuanLog);
      client.message(client.embed(`${member} üyesi sunucudan, ${author} tarafından atıldı. (\`${ceza}\`)`, message), config.Logs.KickBanLog)
    } else if (["ban", "yasakla"].includes(split[0])) {
      let ibidi = message.guild.members.cache.get(target.id);
      if ((!ibidi) || (Object.keys(ibidi).length <= 2)) return client.tepki(message, "iptal", client.NoMember(message));
      if ((author.roles.highest.position <= ibidi.roles.highest.position)) return client.tepki(message, "iptal", client.embed(`${client.react("iptal")} | ${target} kullanıcısı senden üst bir rolde veya aynı roldesiniz, bu işlemi gerçekleştiremem.`, message));
      if (ibidi && ibidi.bannable) ibidi.ban().catch(() => { });
      await client.cezaPuanı(ibidi, 30);
      var ceza = await client.cezaNumara();
      var cpoint = await client.cezaPuanCheck(member);
      new Schema({CezaID: ceza, Type: "BAN", userID: member.id, Author: author.id, Reason: reason, DateNow: Date.now(), Activity: true}).save()
      client.SayiPlus(message, Database, "kick");
      message.channel.send(client.embed(`${client.react("tik")} | ${member} üyesi sunucudan yasaklandı. (\`${ceza}\`)`, message))

    };
  };
};

module.exports = KickBan;