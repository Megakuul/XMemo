# Use the official Node.js 19 alpine base image
FROM node:19-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy the rest of the application code
COPY . .

# Expose the port that the application will listen on
EXPOSE 80

# Start the application
CMD [ "npm", "run", "prod" ]