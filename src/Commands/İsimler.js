class History {
  constructor() {
    (this.name = "history", this.alias = ["isimler", "geçmiş"])
  };
  
 async operate ({ client, message, args, config, member, author }, Database = require("../Models/Member")) {
   if ((!author.roles.cache.some(r => config.Perms.Register.includes(r.id))) && (!author.permissions.has("ADMINISTRATOR"))) return client.tepki(message, "iptal", client.NoPerm(message));
   if (!member) return client.tepki(message, "iptal", client.NoMember(message)); 
   const Veri = await Database.findOne({SunucuID: message.guild.id, userID: member.id}).exec() || {};
   let History = Veri.History && Veri.History.length > 0 ? Veri.History : [];
   let Geçmiş = History && History.length > 0 ? History.map((data, index) => `‧ (**${data.Roles && message.guild.roles.cache.has(data.Roles) ? message.guild.roles.cache.get(data.Roles) : `${data.Roles}`}**) \`${data.Name}\` (\`${message.guild.members.cache.get(data.Author).user.tag} - ${data.Author}\`) `).join("\n") : ""
   client.tepki(message, "tik", client.embed(`${member} üyedinin önceki isimlerini aşağıda sıraladım. Bu üyenin toplam (\`${History.length || "0"}\`) geçmiş isim kaydı bulundu.\n\n${Geçmiş}`, message, 15000));
 }
};

module.exports = History;