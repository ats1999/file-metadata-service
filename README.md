# file-metadata-service

File metadata service allows you to upload file, view file details after processing and track file processing progress.

## Structure

This service itself is a monorepo of two micro services, one for handling user's incoming HTTP requests and another for processing uploaded files and updating metadata in database. The name of the service that handles user's incoming request is `api-server` and name of the service that handles file processing is `file-processor`.

User's upload files to `api-server`, `api-server` write file to local disk and push message to `BullMQ`. `file-processor` then receives message from `BullMQ`, it process file and update metadata and processing status into PostgreSQL database.

### Tech Stack

- Backend Framework - ExpressJs
- Database - PostgreSQL
- ORM - Prisma
- Message Queue - BullMQ(Redis Backed)

## Quick Start

1. Clone Repository

   ```sh
   git clone https://github.com/ats1999/file-metadata-service.git
   ```

2. Run shell script to start services
   ```sh
   # this will setup `.env` file and start container using docker compose
   sh deploy.sh
   ```

## Rate Limiter

`api-server` uses a rate limiter to limit the number of uploads a user can make within a specific time window. The rate limiter is implemented using the [Token Bucket algorithm](https://en.wikipedia.org/wiki/Token_bucket), which allows for a steady rate of requests with occasional bursts up to a defined limit.

You can configure the rate limiter settings in the `api-server/.env` service. Typical configuration options include:

- `UPDATE_RATE_LIMIT_WINDOW_MS=100000000`: Time frame for which requests are checked/remembered (in milliseconds).
- `MAX_UPLOAD_RATE_LIMIT=5`: Maximum number of requests allowed within the window.

## File Size Limit

A maximum file size is enforced for uploads to ensure efficient processing and prevent abuse.

You can configure the rate limiter settings in the `api-server/.env` service. Typical configuration options include:

- `UPLOAD_FILE_SIZE_LIMIT=10mb`
- `UPLOAD_FILE_SIZE_LIMIT=1gb`

> For other configuration options, please check `api-server/.env.sample` and `file-processor/.env.sample`
