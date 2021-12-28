const Config = require("../config.json");

class Message {
  constructor (message) {
   this.Message = message;
};

  async useCommands () {
    const client = this.Message.client;
    if (!Array.isArray(Config.Guild.Prefixes)) Config.Guild.Prefixes = [Config.Guild.Prefixes];
    if (this.Message.channel.type == "dm" || !Config.Guild.Prefixes.some(x => this.Message.content.startsWith(x.toLowerCase()))) return;
    const prefix = (this.Message.prefix = Config.Guild.Prefixes.find(x => this.Message.content.toLowerCase().startsWith(x)));
    var args = this.Message.content.substring(prefix.length).split(" "), command = args[0];
    args = args.splice(1);  
    let author = this.Message.guild.member(this.Message.author);
    let member = this.Message.guild.member(this.Message.mentions.users.first()) || this.Message.guild.members.cache.get(args[0]);
    command = client.cmd.get(command) || client.aliases.get(command);
    if (command) {
      command({ client: client, message: this.Message, args: args, config: Config, member: member, author: author})
    };
  }
};

module.exports.event = {
    name: "message",
    eventOn: message => new Message(message).useCommands(),
};