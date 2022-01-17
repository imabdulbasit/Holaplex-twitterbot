const { TwitterApi }  = require("twitter-api-v2");

const twitterClient = new TwitterApi({
  appKey: "",
  appSecret: "",
  accessToken: "",
  accessSecret: "",
});

async function tweet(message) {
  try {
    twitterClient.v2.tweet(message);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {tweet};
