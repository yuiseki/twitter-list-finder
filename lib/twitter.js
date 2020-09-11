
class TwitterPuppet {
  constructor({
    browser = null,
    userName = null,
    command = null,
    includeRetweet = false
  }){
    this.tweets = {};
    this.browser = browser;
    this.userName = userName;
    this.command = command;
    this.includeRetweet = includeRetweet;
  }

  /**
   * 限界までスクロールする処理
   * @param {Page} page PuppeteerのPage
   * @returns {Promise}
   */
  static async scrollToLimit(page, onScroll){
    let scrollHeight = await page.evaluate('document.body.scrollHeight');
    let scrollBottom = await page.evaluate('window.scrollY+window.innerHeight');
    const promise = await new Promise(async (resolve, reject)=>{
      await page.evaluate('window.scrollBy(0, 500)');
      let continueScroll = await onScroll(page);
      if(!continueScroll){
        resolve()
        return
      }
      setTimeout(async ()=>{
        scrollHeight = await page.evaluate('document.body.scrollHeight');
        scrollBottom = await page.evaluate('window.scrollY+window.innerHeight');
        resolve();
      }, 500);
    });
    if(scrollBottom < scrollHeight){
      await TwitterPuppet.scrollToLimit(page, onScroll);
    }else{
      return promise;
    }
  }

  /**
   * responseがtwitterのtimeline apiだったらjsonを横取りしてthis.tweetsに集める処理
   * @param {Response} response puppeteerのResponseオブジェクト
   */
  getTweetsFromResponse(){
    const self = this;
    return async function(response){
      try {
        if (response.url().indexOf("https://api.twitter.com/2/timeline/profile/") >= 0
          || response.url().indexOf("https://api.twitter.com/2/timeline/favorites/") >= 0
          || response.url().indexOf("https://api.twitter.com/2/search/adaptive.json") >= 0){
          const text = await response.text();
          const json = JSON.parse(text);
          if(json && json.globalObjects){
            Object.assign(self.tweets, json.globalObjects.tweets);
          }
        }
      } catch (err) {
        //console.error(err)
      }
    }
  }

  /**
   * tweetオブジェクトから必要な情報を抜き出したり生成したりする処理
   * @param {*} tweet Twitter内部APIのtweetオブジェクト
   * @returns {Promise}
   */
  getTweetData(tweet){
    const self = this
    return new Promise(async (resolve, reject) => {
      let retweeted = false;
      // mediaのURLからツイートURLやScreenNameを得る
      const mediaURL = tweet.entities.media[0].expanded_url;
      const tweetURL = mediaURL.match(/https:\/\/twitter\.com\/.*?\/status\/.*?\//)[0].slice(0, -1);
      const screenName = tweetURL.match(/https:\/\/twitter\.com\/(.*?)\//)[1];
      // リツイートされたツイートかどうかの判定
      if(self.userName!==screenName){
        retweeted = true;
      }
      // gyazoのdescription欄で使う文字列の生成
      let desc = "#twitter_"+screenName;
      switch (self.command) {
        case 'user':
          if(retweeted){
            desc += " #twitter_rt_"+self.userName;
          }
          break;
        case 'like':
          desc += " #twitter_like_"+self.userName;
          break;
        default:
          break;
      }
      // ツイート個別ページを開いてタイトルを得る
      const [page] = await self.browser.pages();
      await page.goto(tweetURL, {waitUntil: ['load', 'networkidle2'], timeout: 0});
      let pageTitle = await page.title();
      if (pageTitle === "ツイートする / Twitter"){
        await page.waitFor(2000)
        pageTitle = await page.title()
      }
      resolve({
        screenName: screenName,
        retweeted: retweeted,
        url: tweetURL,
        title: pageTitle,
        desc: desc
      })
    })
  }



}
exports.TwitterPuppet = TwitterPuppet;