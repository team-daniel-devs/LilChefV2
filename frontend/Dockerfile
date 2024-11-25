# Use an official Node.js image as the base
FROM node:18

# Set the working directory
WORKDIR /app

ENV CHOKIDAR_USEPOLLING=true


# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app files
COPY . .

# Expose the port for the app
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
