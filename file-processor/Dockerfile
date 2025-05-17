# Use official Node.js LTS image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install && npx prisma generate

# Copy the rest of the application files
COPY . .

RUN npm run build

# Start the application
CMD ["npm", "start"]