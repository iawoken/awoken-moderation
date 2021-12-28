class Ready {
  constructor (client) {
    this.Client = client;
  };
  
  async start () {
    const { Import } = this.Client.config;
    this.Client.user.setPresence({ activity: { name: Import.Presence.name, type: Import.Presence.type }, status: Import.Presence.status });
  };
};

module.exports.event = {
  name: "ready",
  eventOn: () => new Ready(process.client).start(),
};