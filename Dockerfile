FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install yarn
RUN npm install -g typescript ts-node

RUN yarn

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
