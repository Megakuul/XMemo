# Use the official Node.js 19 alpine base image
FROM node:19-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

RUN npm run build

# Expose the port that the application will listen on
EXPOSE 3000

# Start the application
CMD [ "node", "build" ]