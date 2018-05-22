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
    // const summonerUrl = _build_api_url('summoner/v3/summoners/by-name/', msg.content.replace('!', '').split(' ')[0], null);
    const summonerUrl = _build_api_url('summoner/v3/summoners/by-name/', msg.replace('!', '').split(' ')[0], null);

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
    const games = []
    for (const i in matchList) {
      games.push(matchList[i].gameId);
    }

    games.forEach( gameId => {
      const gameUrl = _build_api_url('match/v3/matches/', gameId, null);
      request({ url: gameUrl, json: true }, (err, res, body) => {
        if (err) { return callback(err, { 'statusCode': res.statusCode }); }

        let participant = body.participantIdentities.filter( p => (p.player.summonerName === name))

        let participantID = undefined;
        body.participantIdentities.forEach(p => { if (p.player.summonerName === name) participantID = p.participantId } );
        console.log(participantID);

        body.stats

        // console.log(body.participantIdentities.forEach( p => console.log(p.player.summonerName)));

      });
    });
    // const games = matchList.filter
  }

  const getFeed = (callback) => {
    // const summoner = msg.content.replace('!', '').split(' ')[0];
    const summoner = msg.replace('!', '').split(' ')[0];
    _getAccId( (acc_err, acc_res) => {
      if (acc_err) { return callback(acc_err, null); }
      _getMatchList(acc_res, (matchList_err, matchList_res) => {
        if (matchList_err) { return callback(matchList_err, null); }
        _getMatches(summoner, matchList_res.matches, (match_err, match_res) => {
          if(match_err) { return callback(matchList_err, null); }

        });
      });
    });
  }

  return {
    getFeed
  }
};

module.exports = worker;
