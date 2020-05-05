//TODO: modules: request
//https://developer.twitter.com/en/docs/tweets/timelines/api-reference/get-statuses-user_timeline
//https://developer.twitter.com/en/docs/basics/authentication/oauth-2-0/bearer-tokens
//https://stackoverflow.com/questions/34947066/get-specific-fields-in-json


const getTweets(handle) => {
    //handle = ...;
    //TODO makes a POST request to Twitter API
    //https://api.twitter.com/1.1/statuses/user_timeline.json
    //TODO Waits for a response
    //TODO processes the data and cleans it
    //sends it back to the server
};

var tweets = getTweets(realdonaldtrump);
console.log(tweets);

curl -u 't0TjdnJxxZSq2ZoJJwPq89Ypl:opxZsL5Y2KcmDvNXw8S43aMpNojJFeI7SeJimacayVxMXoWClm' \
  --data 'grant_type=client_credentials' \
  'https://api.twitter.com/oauth2/token'

{"token_type":"bearer","access_token":"AAAAAAAAAAAAAAAAAAAAAKVcEAEAAAAA2RU2NCZvFWC1DkMZ%2BDW4SUYgeQU%3DJmigDDx1v6IMaJJHjaSqxIeqood88r3YPlrSVwEbxCFKEUy9cc"}(base)

GET /1.1/statuses/user_timeline.json?count=100&screen_name=artem__tkachuk HTTP/1.1
Host: api.twitter.com
Authorization: Bearer AAAAAAAAAAAAAAAAAAAAAKVcEAEAAAAA2RU2NCZvFWC1DkMZ%2BDW4SUYgeQU%3DJmigDDx1v6IMaJJHjaSqxIeqood88r3YPlrSVwEbxCFKEUy9cc

You get the data back

Example:
https://github.com/artem-tkachuk/MomsPersonalBot/blob/master/src/controllers/tj.ts