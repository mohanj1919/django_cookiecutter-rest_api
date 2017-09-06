FROM node:8.4.0

WORKDIR /tmp
ADD package.json /tmp/
RUN rm -rf node_modules
RUN npm install --silent

RUN mkdir -p /app
RUN mv node_modules /app/node_modules/

WORKDIR /app
ADD . /app
EXPOSE 3000
