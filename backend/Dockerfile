# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the port (change if your app uses a different port)
EXPOSE 4000

# Set environment variables (override in production as needed)
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]