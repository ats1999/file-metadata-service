# Use official Node.js image
FROM node:20

WORKDIR /app
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

RUN npx prisma generate && npm run build

EXPOSE 3000

# Start the application
CMD ["npm", "start"]