FROM ubuntu:20.04
LABEL  maintainer "TAKANO Mitsuhiro <takano32@gmail.com>"

RUN apt-get update

ENV DEBIAN_FRONTEND=noninteractive
ENV DEBCONF_NOWARNINGS yes

RUN apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 \
  libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 \
  libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 \
  libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 \
  libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates \
  fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
RUN apt-get install -y nodejs npm
RUN apt-get install -y libgbm-dev

RUN mkdir -p /opt/twitter-list-finder/bin
COPY package.json /opt/twitter-list-finder
COPY package-lock.json /opt/twitter-list-finder
RUN cd /opt/twitter-list-finder && npm install

COPY bin/twitter-list-finder.js /opt/twitter-list-finder/bin
COPY lib /opt/twitter-list-finder/lib

RUN mkdir /data
COPY listnames /data
COPY usernames /data


COPY bin/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod g=u /etc/passwd && \
    chmod 0775 /usr/local/bin/docker-entrypoint.sh

CMD ["bash", "-c", "/usr/local/bin/docker-entrypoint.sh"]

