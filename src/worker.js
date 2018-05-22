const request = require('request');
const resources = require('./resources.js');

const worker = (msg) => {
  const summonerInfo = {
    'api_key': resources.riot_api_key,
    'base_link': 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/'
  };

  const summonerUrl = `${summonerInfo.base_link}`
                    + `${msg.content.replace('!', '').split(' ')[0]}`
                    + `?api_key=${summonerInfo.api_key}`;

  const getAccId = (callback) => {
    request.get(
      { url: summonerUrl, json: true },
      (err, res, body) => {
        if (err) {} // return callback  }
        // return callback(body.accountId);
        resolve(body.accoutnId);
      }
    );
  }

  return {
    getAccId
  }
};

module.exports = worker;
