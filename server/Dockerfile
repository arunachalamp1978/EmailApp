FROM node:lts-alpine

# install simple http server for serving static content

RUN npm install -g http-server

ENV NODE_ENV=$NODE_ENV

# make the 'app' folder the current working directory

WORKDIR /usr/server

# copy both 'package.json' and 'package-lock.json' (if available)
COPY ./source/package*.json ./

# copy project files and folders to the current working directory (i.e. 'app' folder)
COPY ./source .

# install project dependencies
RUN npm install

# build app for production with minification
RUN npm run build

EXPOSE 8345

CMD npm start
