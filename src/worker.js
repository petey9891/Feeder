const request = require('request');
const resources = require('./resources.js');

const worker = (msg) => {

  /**
    @private
  */
  const _urlInfo = {
    'base_link': 'https://na1.api.riotgames.com/lol/',
    'api_key': resources.riot_api_key
  };

  /**
    @private
  */
  const _build_api_url = (type, id, query) => {
    return `${_urlInfo.base_link}${type}${id}?`
            +`${(query) ? query + '&': ''}api_key=${_urlInfo.api_key}`;
  };

  /**
    Returns account ID of user provided
    @private
  */
  const _getAccId = (callback) => {
    const summonerUrl = _build_api_url('summoner/v3/summoners/by-name/', msg.content.replace('!', '').split(' ')[0], null);
    // const summonerUrl = _build_api_url('summoner/v3/summoners/by-name/', msg.replace('!', '').split(' ')[0], null);
    request({ url: summonerUrl, json: true }, (err, res, body) => {
        if (err) { return callback(err, {'statusCode': res.statusCode} ); }
        return callback(null, body.accountId);
      }
    );
  };

  /**
    @private
  */
  const _getMatchList = (accountId, callback) => {
    const matchListUrl = _build_api_url('match/v3/matchlists/by-account/', accountId, 'endIndex=10');
    // const matchListUrl = _build_api_url('match/v3/matchlists/by-account/', accountId, 'endIndex=1');
    request({ url: matchListUrl, json: true }, (err, res, body) => {
        if (err) { return callback(err, {'statusCode': res.statusCode} ); }
        return callback(null, body);
      }
    );
  };

  /**
    @private
  */
  const _getMatches = (name, matchList, callback) => {
    const games = [];
    matchList.forEach( x => games.push(x.gameId) );
    let count = 1;
    let feeds = [];
    games.forEach( gameId => {
      _getMatch(_build_api_url('match/v3/matches/', gameId, null), name)
      .then( (val) => {
        if (val !== -1)
          feeds.push(val);
        count += 1;
        if (count == games.length-1) { return callback(null, feeds); }
      }).catch( err =>  console.log(err) );
    });
  }

  const _getMatch = (url, name) => {
    return new Promise( (resolve, reject) => {
      request({ url: url, json: true}, (err, res, body) => {
        if (err) return reject(err);
        let participantID = undefined;
        body.participantIdentities.forEach(p => { if (p.player.summonerName.toLowerCase() === name) participantID = p.participantId } );
        const players = body.participants.filter( x => x.participantId === participantID );
        const stats = players[0].stats
        const kda = (stats.kills + stats.assists)/stats.deaths;
        if (kda < 1.25) {
          resolve({'kda': kda, 'kills': stats.kills, 'deaths':stats.deaths,
                   'assists':stats.assists, 'totalDamage': stats.totalDamageDealtToChampions });
        } else {
          resolve(-1);
        }
      });
    });
  };

  const getFeed = (callback) => {
    const summoner = msg.content.toLowerCase().replace('!', '').split(' ')[0];
    // const summoner = msg.toLowerCase().replace('!', '').split(' ')[0];

    let worstGame = undefined;
    let count = 0;
    _getAccId( (acc_err, acc_res) => {
      if (acc_err) { return callback(acc_err, null); }
      _getMatchList(acc_res, (matchList_err, matchList_res) => {
        if (matchList_err) { return callback(matchList_err, null); }
        _getMatches(summoner, matchList_res.matches, (match_err, match_res) => {
          if(match_err) { console.log("error"); return callback(matchList_err, null); }
          const tmp = match_res;
          tmp.forEach( x => {
            count += 1;
            if (worstGame === undefined || x.kda < worstGame.kda) { worstGame = x; }
          });
          return callback(null, { 'numGames': count, 'worstGame': worstGame });
        });
      });
    });
  }

  return {
    getFeed
  }
};

module.exports = worker;
