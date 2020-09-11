# twitter-list-finder


## What is this?
Twitterのuser名とlist名が与えられたらその検索結果をjsonで出力するコマンド


## install nodejs, npm and puppeteer
```
sudo apt install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
sudo apt isntall nodejs npm -y
```

## usage
```
git clone https://github.com/yuiseki/twitter-list-finder
cd twitter-list-finder
npm install
node bin/twitter-list-finder.js --no-warngings user yuiseki main
```

## advanced usage
```
sudo apt install jq
node bin/twitter-list-finder.js --no-warngings user yuiseki main | jq 'keys | length'
cat listnames | xargs -t -I{} sh -c "node bin/twitter-list-finder.js --no-warngings user yuiseki {} > yuiseki-{}.json"
```