# Use official Node.js LTS image
FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

# Copy the rest of the application files
COPY . .

RUN npx prisma generate && npm run build

# Start the application
CMD ["npm", "start"]