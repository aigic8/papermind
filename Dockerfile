FROM node:20-alpine

WORKDIR /home/node/app
COPY package*.json /home/node/app/
COPY pnpm-lock.yaml /home/node/app/

RUN npm i -g pnpm

RUN pnpm install
COPY . /home/node/app/

RUN pnpm start