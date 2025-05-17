# Use official Node.js image
FROM node:20

# Install PostgreSQL and Redis
RUN apt-get update && \
    apt-get install -y postgresql redis-server && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY api-server ./
RUN npm install

EXPOSE 3000

# Environment variables (adjust as needed)
# ENV POSTGRES_HOST=localhost
# ENV POSTGRES_USER=postgres
# ENV POSTGRES_PASSWORD=postgres
# ENV POSTGRES_DB=appdb
# ENV REDIS_HOST=localhost
# ENV REDIS_PORT=6379

# Run SQL schema generation script (assumes schema.sql exists in project root)
# This command will run at container start
CMD service postgresql start && \
    service redis-server start && \
    # psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -f ./schema.sql || true && \
    npm run dev