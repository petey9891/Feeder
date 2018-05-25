const resources = require('./src/resources.js');
const Feeder = require('./src/feeder.js');
const Discord = require('discord.js');

// Initializing bot
const client = new Discord.Client();

// Bot initialized
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Regex for seeing if message is a command.
// To add new commands, add regex under cmd key
const regex = {
  header: /^([!])/gm,
  cmd: {
    feeds: /([FEDSfeds])\w+$/gm
  }
};

// After a message, runs the following scripts
client.on('message', (msg) => {
  /**
    Generates statistics for worst league game within last 10 games
    @example !<name> feeds
  */
  if (regex.header.test(msg.content) && regex.cmd.feeds.test(msg.content)) {
    console.log(`Query -- ${msg.content}`);

    const name = msg.content.replace(regex.header, '').replace(regex.cmd.feeds, '').trim();
    const feeder = Feeder(name);
    feeder.getFeed((err, res) => {
      if (err) {
        console.error(err.error); msg.channel.send(err.message);
      } else {
        const message = `Yep! He does! Over the last 10 games, he's fed in the last ${res.numGames}.`
            + ' In one of those games, he went:'
            + ` ${res.worstGame.kills}/${res.worstGame.deaths}/${res.worstGame.assists}`
            + ` with a ${Math.round(res.worstGame.kda * 100) / 100} kda and`
            + ` ${res.worstGame.totalDamage} total damage. Yikes! no flame`;
        msg.channel.send(message);
        console.log(message);
      }
    });
  }


  // Fun thing for my friends -- can discard
  if (msg.author.username === 'Robbie' || msg.author.username === 'Sajirodman11') {
    const ranNum = Math.floor(Math.random() * (50 - 1)) + 1;
    // console.log(`Random guess -- ${ranNum}`);
    if (ranNum === 5) {
      msg.channel.send('bice nind');
    }
  }
});

// Logging in bot
client.login(resources.discord_token);
