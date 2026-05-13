# Use official Node image
FROM node:20

# Create app directory inside container
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of backend source
COPY . .

# Expose backend port
EXPOSE 3001

# Start server
CMD ["npm", "run", "server"]