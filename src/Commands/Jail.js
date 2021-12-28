class Jail {
  constructor() {
    (this.name = "jail", this.alias = ["cezalı", "mapus"])
  };
  
  async operate ({ client, message, args, config, author }, fetch = require("node-fetch"), Database = require("../Models/Member"), Schema = require("../Models/Restriction")) {
    if ((!author.roles.cache.some(r => config.Perms.Mute.includes(r.id))) && (!author.permissions.has("ADMINISTRATOR"))) return client.tepki(message, "iptal", client.NoPerm(message));
    let target = (message.mentions.users.first()) || await (await fetch(`https://discord.com/api/users/${args[0]}`, {method:'GET', headers: {'Authorization': 'Bot ' + client.token}})).json();
    if ((!target) || (Object.keys(target).length <= 2)) return client.tepki(message, "iptal", client.NoMember(message));
    let target2 = message.guild.members.cache.get(target.id);
    let Veri = await Schema.findOne({ userID: target.id, Type: "JAIL", Activity: true,  }).exec();
    if ((target2) && ((Veri) || (target2.roles.cache.some(x => config.CezaRoles.JailRoles.includes(x.id))))) return client.tepki(message, "iptal", client.embed(`${client.react("iptal")} | Bu kullanıcı zaten karantinada bulunmakta, tekrar karantinaya atamam.`, message));
    if ((target2) && (author.roles.highest.position <= target2.roles.highest.position)) return client.tepki(message, "iptal", client.embed(`${client.react("iptal")} | ${target} kullanıcısı senden üst bir rolde veya aynı roldesiniz, bu işlemi gerçekleştiremem.`, message));
    let reason = args.slice(1).join(" ") || "Sebep belirtilmedi.";
    if ((target2) && (config.CezaRoles.JailRoles !== "")) await target2.roles.set(target2.roles.cache.get(config.Roles.Booster) ? [config.Roles.Booster, config.CezaRoles.JailRoles] : [config.CezaRoles.JailRoles]).catch(() => { });
    await client.cezaPuanı(target, 15);
    var ceza = await client.cezaNumara();
    var cpoint = await client.cezaPuanCheck(target);
    new Schema({CezaID: ceza, Type: "JAIL", userID: target.id, Author: author.id, Reason: reason, DateNow: Date.now(), Activity: true}).save()
    client.SayiPlus(message, Database, "jail");
    message.channel.send(client.embed(`${client.react("tik")} | ${message.guild.members.cache.get(target.id) ?  `${message.guild.members.cache.get(target.id)} üyesine <@&${config.CezaRoles.JailRoles}> rolü verildi. (\`#${ceza}\`)` : `${target.username}#${target.discriminator} üyesi sunucuda olmamasına rağmen cezalıya atıldı. (\`#${ceza}\`)`}`, message))
    client.message(`${message.guild.members.cache.get(target.id) ? message.guild.members.cache.get(target.id) : `${target.username}#${target.discriminator}`} : aldığınız **#${ceza}** ID'li ceza ile **${cpoint.Puan}** ceza puanına ulaştınız.`, config.Logs.CezaPuanLog);
    client.message(client.embed(`${message.guild.members.cache.get(target.id) ? message.guild.members.cache.get(target.id) : `${target.username}#${target.discriminator}`} (\`${target.id}\`) üyesine <@&${config.CezaRoles.JailRoles}> rolü ${author} tarafından verildi. Sebep: ${reason} (\`#${ceza}\`)`, message), config.Logs.MapusLog)
  }
};

module.exports = Jail;