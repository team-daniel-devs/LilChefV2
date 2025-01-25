FROM node:18-alpine

WORKDIR /app  # Changed to /app, more conventional

COPY package*.json ./
RUN npm install --production # Install only production dependencies

COPY . .

EXPOSE 8081

CMD ["npm", "start"]
