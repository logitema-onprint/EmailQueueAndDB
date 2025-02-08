FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig.json ./
COPY nodemon.json ./

RUN npm install
RUN npm install uuid @types/uuid

COPY . .

EXPOSE 3000

CMD ["npm", "start"]