# Use Node.js image as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend API code to the working directory
COPY . .

# Expose the port that the backend API will be running on
EXPOSE 8000

# Start the backend API
CMD ["npm", "start"]
