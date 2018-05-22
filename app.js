const resources = require('./src/resources.js');
const Worker = require('./src/worker.js');
const Discord = require('discord.js');
const client = new Discord.Client();


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {

  if (msg.author.username === 'TheMiniPete') {
    msg.delete()
    .then(msg => console.log(`Deleted message from ${msg.author.username}`))
    .catch(console.error);
  }

  const regex = /^([!])([A-Za-z0-9])\w+\s([FEDSfeds])\w+/gm;
  if ( regex.test(msg.content) ) {
    const worker = Worker(msg);
    console.log(`Query -- ${msg.content}`);


  }
});

client.login(resources.discord_token);
