FROM node:14.15.4-alpine3.12

WORKDIR /backend

COPY package*.json ./
RUN npm install

COPY . . 

EXPOSE 8080

CMD ["npm", "start"]