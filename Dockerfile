FROM node:18-alpine

WORKDIR /backend

COPY backend/package*.json ./
RUN npm install

COPY backend/. . 

EXPOSE 8081

CMD ["npm", "start"]