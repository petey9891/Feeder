const request = require('request');
const resources = require('./resources.js');

const feeder = (msg) => {
  /**
    Contains base information for League of Legends API call
    @readonly
    @private
  */
  const _urlInfo = {
    base_link: 'https://na1.api.riotgames.com/lol/',
    api_key: resources.riot_api_key
  };

  /**
    Generates a link that can be used for any league API call
    @param {string} type Type of API call that is going to be made.
    @param {string || number} id Identifier to get player or game
    @param {string} query Filter to be applied
    @returns {string} API URL
    @private
  */
  const _build_api_url = (type, id, query) => `${_urlInfo.base_link}${type}${id}?`
        + `${(query) ? `${query}&` : ''}api_key=${_urlInfo.api_key}`;

  /**
    Returns account ID of user provided
    @return {Promise<number>} Account ID, otherwise err
    @private
  */
  const _getAccId = () => new Promise((resolve, reject) => {
    const summonerUrl = _build_api_url('summoner/v3/summoners/by-name/', encodeURI(msg));
    request({ url: summonerUrl, json: true }, (err, res, body) => {
      if (err) return reject(err);
      if (body.status) {
        if (body.status.status_code === 403) {
          reject({ error: body, message: 'Invalid API key' });
        } else if (body.status.status_code === 404) {
          reject({ error: body, message: 'That summoner name does not exist' });
        }
      }
      resolve(body.accountId);
    });
  });

  /**
    Returns list of most recent matches depending on Query
    @param {number} accountId Players accountId
    @return {Promise<Object[]} List of most recent matches, otherwise err
    @private
  */
  const _getMatchList = accountId => new Promise((resolve, reject) => {
    const matchListUrl = _build_api_url('match/v3/matchlists/by-account/', accountId, 'endIndex=10');
    request({ url: matchListUrl, json: true }, (err, res, body) => {
      if (err) reject(err);
      resolve(body);
    });
  });

  /**
    Calls match API and calculates player data
    @param {string} url API URl
    @param {string} name Player's name from original message
    @return {Promise<object>} A JSON object of game stats, -1 otherwise
    @private
  */
  const _getMatch = (url, name) => new Promise((resolve, reject) => {
    request({ url, json: true }, (err, res, body) => {
      if (err) return reject(err);
      let participantID;
      body.participantIdentities.forEach((p) => {
        if (p.player.summonerName.toLowerCase() === name) participantID = p.participantId;
      });
      const players = body.participants.filter(x => x.participantId === participantID);
      const stats = players[0].stats;
      const kda = (stats.kills + stats.assists) / stats.deaths;
      if (kda < 1) {
        resolve({
          kda,
          kills: stats.kills,
          deaths: stats.deaths,
          assists: stats.assists,
          totalDamage: stats.totalDamageDealtToChampions
        });
      } else {
        resolve(-1);
      }
    });
  });

  /**
    Iterates through match list and grabs data for each match
    @param {object[]} matchList Array of match lists
    @param {string} name Player's name from original message
    @return {Promise<Object[]} Games with lower KDA than 1, otherwise err
    @private
  */
  const _getMatches = (matchList, name) => new Promise((resolve, reject) => {
    const games = [];
    matchList.forEach(x => games.push(x.gameId));
    const promises = [];
    games.forEach(x => promises.push(_getMatch(_build_api_url('match/v3/matches/', x, null), name)));
    Promise.all(promises).then(val => resolve(val)).catch(err => reject(err));
  });

  /**
    Returns worst games
    @param {Object[]} games Array of Games
    @return {Object} JSON object
    @private
  */
  const _feeds = (games) => {
    const feeds = games.filter(x => (x !== -1));
    if (feeds.length === 0) return { poppedOff: true };
    let worstGame;
    feeds.forEach((x) => {
      if (worstGame === undefined || x.kda < worstGame.kda) { worstGame = x; }
    });
    return { numGames: feeds.length, worstGame };
  };

  /**
    Generates worst game statistics
    @callback
    @return {object} Returns worst game, otherwise err
    @public
  */
  const getFeed = (callback) => {
    const name = msg.toLowerCase();
    _getAccId()
    .then(accountId => _getMatchList(accountId))
    .then(matchList => _getMatches(matchList.matches, name))
    .then(badGames => callback(null, _feeds(badGames)))
    .catch(err => callback({ error: err, message: 'That summoner name does not exist' }, null));
  };

  return {
    getFeed
  };
};

module.exports = feeder;
