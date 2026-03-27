FROM node:18-slim

# Use non-root user for security
WORKDIR /app

# Install dependencies first (for caching)
COPY package*.json ./
RUN npm install && npm cache clean --force

# Copy code
COPY . .

EXPOSE 80

CMD ["node", "server.js"]
