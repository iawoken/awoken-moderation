class Kayıt {
  constructor() {
    (this.name = "kayıt", this.alias = ["e", "k", "erkek", "kadın"])
  };
  
  async event (client, Database = require("../Models/Member")) {
    client.on("guildMemberRemove", async member => {
      Database.findOne({ SunucuID: member.guild.id, userID: member.id }, async (err, res) => {
        if (res) {
         const isimler = res.History && res.History.length > 0 ? res.History : []; 
         if (isimler.length < 0) return;
         let isim = res.History[res.History.length - 1];
         //res.History = res.History.filter(x => x != isim);
         res.History.push({ Name: isim.Name, Roles: "Sunucudan Ayrılma", Author: isim.Author });
         res.save(); 
        };
      });
    });
  };
  async operate ({ client, message, args, config, member, author }, Database = require("../Models/Member")) {
   if ((!author.roles.cache.some(r => config.Perms.Register.includes(r.id))) && (!author.permissions.has("ADMINISTRATOR"))) return client.tepki(message, "iptal", client.NoPerm(message));
      if (!member) return client.tepki(message, "iptal", client.NoMember(message)); 
      let name = args.slice(1).filter(arg => isNaN(arg)).map(arg => arg.charAt(0).toUpperCase() + arg.slice(arg.charAt(0).length).toLowerCase()).join(" ");
      let age = args.slice(1).filter(arg => !isNaN(arg))[0];
      let nickname = "";
      const filter = (reaction, user) => ["♂️", "♀️"].includes(reaction.emoji.name || reaction.emoji.id) && user.id == message.author.id;
      
      let tag = member.user.username.includes(config.Tags.OrjTag) ? config.Tags.OrjTag : (config.Tags.FakeTag === "" ? config.Tags.OrjTag : config.Tags.FakeTag)
      if (message.member.roles.highest.position <= member.roles.highest.position) return client.tepki(message, "iptal", client.embed(`${client.react("iptal")} | ${member} kullanıcısı senden üst bir rolde veya aynı roldesiniz, bu işlemi gerçekleştiremem.`, message));
      if (((config.Guild.Settings.TagIntake) === true) && (!member.user.username.includes(config.Tags.OrjTag)) & (!member.roles.cache.get(config.Roles.Booster))) return client.tepki(message, "iptal", client.embed(`Sunucumuz şu anda taglı alımda bulunmaktadır, kayıt yapabilmeniz için kullanıcı tagımıza (\`${config.Tags.OrjTag}\`) sahip olmalı ya da booster olması gerekmektedir.`, message));
      if (config.Roles.Erkek.some(x => member.roles.cache.has(x)) || config.Roles.Kız.some(x => member.roles.cache.has(x))) return client.tepki(message, "iptal", client.embed(`${client.react("iptal")} | Bu kullanıcı zaten kayıtlı durumda, kayıtlı bir kullanıcıyı tekrar kayıt edemezsin.`, message));
      if ((!name) && (!age)) return client.tepki(message, "iptal", client.NoNameAge(message))
      else if ((!name) && (age)) return client.tepki(message, "iptal", client.embed(`${client.react("iptal")} | Kullanıcının herhangi bir ismi olmadan yaşını belirleyemezsin`, message));
      else if ((age > 30) || (age < 10)) return client.tepki(message, "iptal", client.NoNameAge(message));
      let Veri = await Database.findOne({SunucuID: message.guild.id, userID: member.id}).exec() || {};   
      let isimler = Veri.History && Veri.History.length > 0 ? Veri.History : [];
      let History = isimler && isimler.length > 0 ? isimler.map((data, index) => `• (**${data.Roles && message.guild.roles.cache.has(data.Roles) ? message.guild.roles.cache.get(data.Roles) : `${data.Roles}`}**) \`${data.Name}\` (\`${message.guild.members.cache.get(data.Author).user.tag} - ${data.Author}\`) `) : ""
      const mesaj = await message.channel.send(client.embed(`${member} üyesini kaydetmeden önce aşağıda önceki isimlerini sıraladım. Bu üyenin toplam (\`${History.length || "0"}\`) adet isim kaydına ulaştım.\n\n${History.length > 0 ? `${client.react("star")} __**Önceki isimleri**__\n${History.reverse().slice(0, 10).reverse().join("\n")}\n\nÜyenin cinsiyetini belirtmek için \`♂️\` veya \`♀️\` tepkilerinden birisine tıklamalısın.` : "Bu kullanıcı için önceden herhangi bir kayıt işlemi gerçekleştirilmemiştir."}`, message));
      const collector = message.createReactionCollector((filter), { time: 20000 })
      message.react("♂️");
      message.react("♀️");
    let role;
    collector.on("collect", async (reaction) => {
      let xd = reaction.emoji.name;
      if (xd == "♂️") {
      await message.reactions.removeAll(); role = "E";
      await member.roles.add(config.Roles.Erkek).catch(() => { });
      await member.roles.remove(config.Roles.Unregister).catch(() => { }); 
      client.SayiPlus(message, Database, "erkek");
      await mesaj.edit(client.embed(`${member} - (\`${member.id}\`) üyesini \`Erkek\`(<@&${config.Roles.Erkek}>) olarak kaydettim.`, message));
      } else if (xd == "♀️") {
      await message.reactions.removeAll(); role = "K";
      await member.roles.add(config.Roles.Kız).catch(() => { });
      await member.roles.remove(config.Roles.Unregister).catch(() => { }); 
      client.SayiPlus(message, Database, "kız");
      await mesaj.edit(client.embed(`${member} (\`${member.id}\`) üyesini \`Kız\`(<@&${config.Roles.Kız}>) olarak kaydettim.`, message));
      };
      if ((name) && (!age)) {
        nickname = `${tag} ${name}`
        await member.setNickname(nickname).catch(() => { });
      } else if ((name) && (age)) {
        nickname = `${tag} ${name} | ${age}`
        await member.setNickname(nickname).catch(() => { });
      };
      Database.findOne({SunucuID: message.guild.id, userID: member.id}, async (err,res) => {
        if (!res) { new Database({SunucuID: message.guild.id, userID: member.id, History: [{ Name: nickname, Roles: role, Author: author.id }]}).save();
        } else {
          res.History.push({ Name: nickname, Roles: role, Author: author.id })
          res.save();
        }
      });

    });  
    
    collector.on("end", async (reaction) => {
      if (member.roles.cache.some(x => [config.Roles.Erkek[0], config.Roles.Kız[0]].includes(x.id))) return client.tepki(message, "tik")
      else if (message.reactions && message.reactions.size < 1) {
        await message.reactions.removeAll();
        client.tepki(message, "iptal");
        return mesaj.delete();
       };
    });
  }
}

module.exports = Kayıt;