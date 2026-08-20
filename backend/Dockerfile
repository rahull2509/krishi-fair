# Use an official Node runtime as a parent image
FROM node:22-alpine

# Install openssl which is required for Prisma client on Alpine Linux
RUN apk add --no-cache openssl

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose the port the app runs on (Port 5000 based on .env)
EXPOSE 5000

# Command to run the application
CMD ["npm", "start"]
