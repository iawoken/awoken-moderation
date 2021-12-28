class Message {
  constructor (message) {
    this.Message = message;
  };
  
  async Reply () {
    const client = this.Message.client, config = client.config, content = this.Message.content.toLowerCase();
    if (this.Message.author.bot || this.Message.channel.type == "dm") return;
    var unRoles = Object.keys(config.CezaRoles).map(x => config.CezaRoles[x]);
    if (!unRoles || Array.isArray(unRoles) == false) unRoles = [];
    if (unRoles.some(x => this.Message.member.roles.cache.has(x))) return;
    
    if (["tag", ".tag", "!tag", "-tag"].includes(content)) this.Message.channel.send(config.Tags.OrjTag)
    else if (["link", ".link", "!link", "-link"].includes(content)) this.Message.channel.send(`discord.gg` + config.Guild.guildURL);
  };
};

module.exports.event = {
  name: "message",
  eventOn: (message) => new Message(message).Reply(),
}; 