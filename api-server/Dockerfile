FROM node:20-alpine

WORKDIR /api-server
COPY package.json .
RUN npm install
COPY . .
CMD npm start