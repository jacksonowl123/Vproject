# Use the official Node.js 20 image as the base image
FROM node:20.18.0-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application's code
COPY . .

# Expose port 5173 (default port for Vite dev server)
EXPOSE 5173

# Set environment variable for development
ENV NODE_ENV=development

# Start the Vite development server
CMD ["npm", "run", "dev", "--", "--host"]
