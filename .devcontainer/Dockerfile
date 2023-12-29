FROM node:21-alpine3.18

RUN set -ex \
    && apk update \
    && apk upgrade \
    && apk --no-cache add git bash curl \
    && rm -rf /var/cache/apk/*

WORKDIR /usr/local

RUN curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | bash

WORKDIR /workspace