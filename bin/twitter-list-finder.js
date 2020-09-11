#!/usr/bin/env node
var os = require("os");
var path = require("path");

const yargs = require("yargs");
const puppeteer = require('puppeteer');

const { TwitterPuppet } = require('../lib/twitter');
const { resolve } = require("path");

const argv = yargs
  .command('user [username] [listname]', 'Find lists of specific twitter user.', (yargs) => {
    return yargs.positional('username', {
      describe: 'Twitter username.',
      require: true
    }).positional('listname', {
      describe: 'Name fo list',
      require: true
    })
  })
  .option('limit', {
    alias: 'l',
    description: 'Load limit of tweets. 0 means no limit.',
    type: 'number',
    default: 10
  })
  .option('cookie', {
    description: 'cookie file path to set puppeteer.',
    type: 'string'
  })
  .help()
  .argv;

const arg = argv._[0];
if(!arg || arg===""){
  console.log("Usage:");
  console.log("\ttwitter-list-finder --help");
  process.exit(1);
}


const main = async () => {

  const browser = await puppeteer.launch();
  const [page] = await browser.pages();

  let url;
  switch (argv._[0]) {
    case 'user':
      url = `https://twitter.com/search?q=list%3A%40${argv.username}%2F${argv.listname}&src=typed_query`
      break;
    default:
      break;
  }

  const twitter = new TwitterPuppet({
    browser: browser,
    userName: argv.username,
    command: argv._[0],
    includeRetweet: argv.includeRetweets
  });
  page.on('response', twitter.getTweetsFromResponse());
  
  await page.goto(url, {waitUntil: 'networkidle2'});
  await TwitterPuppet.scrollToLimit(page, async (p)=>{
    return new Promise((resolve)=>{
      if(Object.keys(twitter.tweets).length < argv.limit){
        resolve(true);
      }else{
        resolve(false);
      }
    })
  });
  console.log(twitter.tweets);
  await browser.close();
}

(async () => {
  try {
    await main()
  } catch (err) {
    console.error(err);
  }
})()
