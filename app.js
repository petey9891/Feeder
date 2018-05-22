const resources = require('./src/resources.js');
const Worker = require('./src/worker.js');
const Discord = require('discord.js');
const client = new Discord.Client();


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  const regex = /^([!])([A-Za-z0-9])\w+\s([FEDSfeds])\w+/gm;
  if ( regex.test(msg.content) ) {
    console.log(`Query -- ${msg.content}`);

    const worker = Worker(msg);
    worker.getFeed( (err, res) => {
      if (err) console.log(err);
      const message = `Yep! He does! Over the last 10 games, he's fed in the last ${res.numGames}. `
          + `In one of those games, he went: ${res.worstGame.kills}/${res.worstGame.deaths}/${res.worstGame.assists}`
          + ` with a ${Math.round(res.worstGame.kda * 100)/100} kda and ${res.worstGame.totalDamage} total damage. Yikes! no flame`
      msg.channel.send(message);
      console.log(message);
    });

  }

  if (msg.author.username === 'Robbie' || msg.author.username === 'Sajirodman11') {
    let ranNum =  Math.floor(Math.random() * (50 - 1 + 1));
    console.log(`Random guess -- ${ranNum}`);
    if ( ranNum === 5 ) {
      msg.channel.send('bice nind');
    }
  }
});

client.login(resources.discord_token);

// detect roles
// if(!message.member.roles.find("name", "Big Boi") && !message.member.roles.find("name", "Supreme Big Boi")){
//     message.reply("");
//     return;
// }\

// message.guild.members.find(val => val.user.username === 'USERNAME')
//   msg.delete().then(msg => console.log(`Deleted message from ${msg.author.username}`))
// .catch(console.error);
// msg.channel.send('+tts Robbie bice nind', {tts:true}).then(message => message.delete(1));

// message.member.voiceChannel.join().then(connection => connection.playArbitraryInput(ytdl(splitMessage[1], {
//             filter: 'audioonly'
//         })).then(dispatcher => {
//         dispatcher.on('error', message.send("There was an error playing your file"))
//     }));


// leagueAPI.getMatch(response['matches'][match]['gameId']).then(response => {
// leagueAPI.getMatchlist(accountId, {
//     query: {
//         endIndex: 20
//     }
// }).then(response => {
