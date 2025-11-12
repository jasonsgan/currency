FROM node:22-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy application source
COPY . .

# Expose the port the app listens on
EXPOSE 8000

# Use production node environment
ENV NODE_ENV=production

STOPSIGNAL SIGINT

# Start the application
CMD ["node", "src/server.js"]
